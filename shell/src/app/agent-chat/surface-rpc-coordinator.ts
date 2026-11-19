/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {signal} from '@angular/core';
import {isV10RpcEnvelopeItem, type RenderA2uiItem} from 'a2ui-bridge';
import type {A2aMessage, A2aPart, TaskStatusUpdateEvent} from '../chat/a2a/a2a-types';
import type {ParsedA2aStreamEvent} from './converters/a2a-stream-event-parser.service';
import type {
  V10CallAgentFunctionPayload,
  V10RendererFunctionResponsePayload,
} from '../shell/cross-frame-validator/v1-0-wire-validator';
import type {SendToServerEnvelope} from '../shell/host-communication/host-communication';
import {
  buildAgentFunctionResponseItem,
  normalizeV10RpcEnvelopeItem,
} from '../shared/a2ui-rpc-envelope';
import {stableStringify} from '../storage/stable-stringify/stable-stringify';
import {resolveInlinePayload, type UiMessage} from './chat-message/types';
import {resolveActiveSurfaceIds} from './converters/surface-partitioner';
import {
  createErrorEvent,
  createReceivedEvent,
  createSentMessageEvent,
} from './converters/a2a-ui-converter';
import type {MessageInspectorEvent} from './message-inspector/message-inspector-event';

/** Frame kind and owning message (for inline surfaces) tracked per rendered iframe `Window`. */
export type SurfaceFrameBinding = {kind: 'inline'; messageId: string} | {kind: 'canvas'};

/** Expected target binding, pinning Canvas targets to the owning message's Canvas payloads. */
type ExpectedSurfaceFrameBinding =
  {kind: 'inline'; messageId: string} | {kind: 'canvas'; expectedPayloadsJson: ReadonlySet<string>};

/** Per-window render state retained to route streamed RPCs only to up-to-date frames. */
export interface TrackedSurfaceFrame {
  binding: SurfaceFrameBinding;
  surfaceIds: Set<string>;
  lastRenderedPayloadJson: string;
}

interface PendingSurfaceRpc {
  agentMessageId: string;
  item: RenderA2uiItem;
  surfaceId?: string;
  turnSignal: AbortSignal | null;
}

interface PendingFunctionCallEntry {
  sourceWindow: Window;
  abortController: AbortController;
  markResponded: () => void;
}

interface PendingRendererResponseEntry {
  sourceWindow: Window;
  abortController: AbortController;
}

/** Dependencies injected into {@link SurfaceRpcCoordinator} by its host chat view. */
export interface SurfaceRpcCoordinatorDeps {
  getMessages: () => readonly UiMessage[];
  isCanvasOpen: () => boolean;
  getActiveCanvasPayload: () => RenderA2uiItem[] | null;
  getAgentUrl: () => string | null | undefined;
  getTenantId: () => string | undefined;
  getActiveContextId: () => string | undefined;
  setActiveContextId: (contextId: string) => void;
  setActiveTaskId: (taskId: string) => void;
  recordInspectorEvent: (event: MessageInspectorEvent) => void;
  isLiveOwnedWindow: (win: Window | null | undefined) => win is Window;
  registerOwnedWindow: (win: Window) => void;
  sendRenderA2UI: (
    payload: unknown[],
    target?: HTMLIFrameElement | Window | null,
  ) => boolean | void;
  sendMessageStream: (
    url: string,
    message: A2aMessage,
    options: {
      tenantId?: string;
      contextId?: string;
      abortSignal?: AbortSignal;
      protocolVersion?: '1.0';
    },
  ) => AsyncIterable<TaskStatusUpdateEvent>;
  parseStreamEvent: (event: TaskStatusUpdateEvent) => ParsedA2aStreamEvent;
  buildCallAgentFunctionDataPart: (payload: V10CallAgentFunctionPayload) => A2aPart;
  buildRendererFunctionResponseDataPart: (payload: V10RendererFunctionResponsePayload) => A2aPart;
  logError: (message: string, err: unknown) => void;
}

/**
 * Coordinates frame tracking, queued surface RPC flushing, Canvas payload pinning,
 * and bidirectional v1.0 RPC streaming (`callAgentFunction` / `rendererFunctionResponse`)
 * for {@link A2aChatView}.
 */
export class SurfaceRpcCoordinator {
  private readonly _activeRpcCount = signal<number>(0);
  /** Number of currently active bidirectional RPC streams. */
  readonly activeRpcCount = this._activeRpcCount.asReadonly();

  private readonly pendingFunctionCalls = new Map<string, PendingFunctionCallEntry>();
  private readonly pendingRendererFunctionResponses = new Set<PendingRendererResponseEntry>();
  /** Frame bindings retained across same-document resets until document replacement or Canvas close. */
  private readonly frameBindings = new Map<Window, SurfaceFrameBinding>();
  /** Currently render-ready frames cleared on same-document render-state resets. */
  private readonly trackedFrames = new Map<Window, TrackedSurfaceFrame>();
  private readonly pendingSurfaceRpcs: PendingSurfaceRpc[] = [];
  private readonly seenStreamedRpcKeysByMessage = new Map<string, Set<string>>();

  constructor(private readonly deps: SurfaceRpcCoordinatorDeps) {}

  hasSeenStreamedRpc(messageId: string): boolean {
    return this.seenStreamedRpcKeysByMessage.has(messageId);
  }

  clearStreamedRpcState(): void {
    this.pendingSurfaceRpcs.length = 0;
    this.seenStreamedRpcKeysByMessage.clear();
    this.trackedFrames.clear();
    this.frameBindings.clear();
  }

  pruneAbortedPendingSurfaceRpcs(): void {
    for (let i = this.pendingSurfaceRpcs.length - 1; i >= 0; i--) {
      if (this.pendingSurfaceRpcs[i].turnSignal?.aborted) {
        this.pendingSurfaceRpcs.splice(i, 1);
      }
    }
  }

  pruneDetachedSurfaceWindows(): void {
    for (const win of this.trackedFrames.keys()) {
      if (!this.deps.isLiveOwnedWindow(win)) {
        this.trackedFrames.delete(win);
      }
    }
    for (const win of this.frameBindings.keys()) {
      if (!this.deps.isLiveOwnedWindow(win)) {
        this.frameBindings.delete(win);
      }
    }
  }

  abortAllPendingCalls(notifyWindows = true): void {
    for (const entry of this.pendingRendererFunctionResponses) {
      entry.abortController.abort();
    }
    this.pendingRendererFunctionResponses.clear();
    this.pendingSurfaceRpcs.length = 0;

    for (const [functionCallId, entry] of this.pendingFunctionCalls.entries()) {
      entry.abortController.abort();
      if (notifyWindows) {
        const cancelMsg = buildAgentFunctionResponseItem(functionCallId, {
          error: {code: 'CANCELLED', message: 'Agent function call cancelled'},
        });
        this.deps.sendRenderA2UI([cancelMsg], entry.sourceWindow);
      }
    }
    this.pendingFunctionCalls.clear();
    this._activeRpcCount.set(0);
  }

  abortPendingCallsForWindow(win: Window): void {
    for (const [functionCallId, entry] of this.pendingFunctionCalls.entries()) {
      if (entry.sourceWindow === win) {
        entry.abortController.abort();
        this.pendingFunctionCalls.delete(functionCallId);
        this._activeRpcCount.update(c => Math.max(0, c - 1));
      }
    }
    for (const entry of this.pendingRendererFunctionResponses) {
      if (entry.sourceWindow === win) {
        entry.abortController.abort();
        this.pendingRendererFunctionResponses.delete(entry);
        this._activeRpcCount.update(c => Math.max(0, c - 1));
      }
    }
  }

  handleSurfaceRenderStateReset(sourceWindow: Window): void {
    this.trackedFrames.delete(sourceWindow);
  }

  handleSurfaceDocumentReset(sourceWindow: Window): void {
    this.abortPendingCallsForWindow(sourceWindow);
    this.trackedFrames.delete(sourceWindow);
    this.frameBindings.delete(sourceWindow);
  }

  closeCanvasFrames(): void {
    for (const [win, binding] of this.frameBindings.entries()) {
      if (binding.kind === 'canvas') {
        this.abortPendingCallsForWindow(win);
        this.trackedFrames.delete(win);
        this.frameBindings.delete(win);
      }
    }
    this.pruneDetachedSurfaceWindows();
  }

  enqueueStreamedRpcs(
    rpcItems: readonly RenderA2uiItem[],
    agentMessageId: string,
    turnSignal: AbortSignal | null,
  ): void {
    let seenKeys = this.seenStreamedRpcKeysByMessage.get(agentMessageId);
    if (!seenKeys) {
      seenKeys = new Set<string>();
      this.seenStreamedRpcKeysByMessage.set(agentMessageId, seenKeys);
    }

    for (const rawItem of rpcItems) {
      const item = normalizeV10RpcEnvelopeItem(rawItem);
      const kind = item.callRendererFunction ? 'call' : 'resp';
      const functionCallId =
        item.callRendererFunction?.functionCallId ?? item.agentFunctionResponse?.functionCallId;
      const dedupKey = `${kind}:${functionCallId ?? JSON.stringify(item)}`;
      if (seenKeys.has(dedupKey)) {
        continue;
      }
      seenKeys.add(dedupKey);

      if (kind === 'resp') {
        this.routeAgentFunctionResponse(item);
        continue;
      }

      const surfaceId = item.callRendererFunction?.surfaceId;
      const targetWin = this.resolveReadyRpcTargetWindow(surfaceId, agentMessageId);
      if (targetWin) {
        this.deps.sendRenderA2UI([item], targetWin);
      } else {
        this.pendingSurfaceRpcs.push({agentMessageId, item, surfaceId, turnSignal});
      }
    }
  }

  handleSurfacePayloadRendered(
    payload: unknown[],
    sourceWindow: Window,
    source: SurfaceFrameBinding,
  ): void {
    this.deps.registerOwnedWindow(sourceWindow);
    this.frameBindings.set(sourceWindow, source);
    const dispatchedSurfaceIds = resolveActiveSurfaceIds(payload);
    const renderedPayloadJson = stableStringify(payload);
    // Re-insert so Map iteration order reflects the most recently rendered frame.
    this.trackedFrames.delete(sourceWindow);
    this.trackedFrames.set(sourceWindow, {
      binding: source,
      surfaceIds: dispatchedSurfaceIds,
      lastRenderedPayloadJson: renderedPayloadJson,
    });

    if (this.pendingSurfaceRpcs.length === 0) {
      return;
    }

    const targetPayload = this.getTargetPayloadForBinding(source);
    if (!Array.isArray(targetPayload) || stableStringify(targetPayload) !== renderedPayloadJson) {
      return;
    }

    const remaining: PendingSurfaceRpc[] = [];
    for (const entry of this.pendingSurfaceRpcs) {
      if (entry.turnSignal?.aborted) {
        continue;
      }
      if (
        this.resolveReadyRpcTargetWindow(entry.surfaceId, entry.agentMessageId) === sourceWindow
      ) {
        this.deps.sendRenderA2UI([entry.item], sourceWindow);
      } else {
        remaining.push(entry);
      }
    }
    this.pendingSurfaceRpcs.length = 0;
    this.pendingSurfaceRpcs.push(...remaining);
  }

  async handleCallAgentFunction(
    env: SendToServerEnvelope & {
      payload: {callAgentFunction: V10CallAgentFunctionPayload};
    },
  ): Promise<void> {
    const callPayload = env.payload.callAgentFunction;
    const functionCallId = callPayload?.functionCallId;
    const sourceWindow = env.sourceWindow;
    if (!sourceWindow || !functionCallId) return;

    const url = this.deps.getAgentUrl();
    if (!url) {
      const errorMsg = buildAgentFunctionResponseItem(functionCallId, {
        error: {
          code: 'NO_AGENT_CONNECTED',
          message: 'No agent endpoint configured',
        },
      });
      this.deps.sendRenderA2UI([errorMsg], sourceWindow);
      return;
    }

    const existing = this.pendingFunctionCalls.get(functionCallId);
    if (existing) {
      existing.abortController.abort();
      if (this.deps.isLiveOwnedWindow(existing.sourceWindow)) {
        const cancelMsg = buildAgentFunctionResponseItem(functionCallId, {
          error: {
            code: 'CANCELLED',
            message: 'Duplicate functionCallId replaced',
          },
        });
        this.deps.sendRenderA2UI([cancelMsg], existing.sourceWindow);
      }
      this._activeRpcCount.update(c => Math.max(0, c - 1));
    }

    const abortController = new AbortController();
    let hasReceivedResponse = false;
    let streamFailed = false;
    const entry: PendingFunctionCallEntry = {
      sourceWindow,
      abortController,
      markResponded: () => {
        hasReceivedResponse = true;
      },
    };
    this.pendingFunctionCalls.set(functionCallId, entry);
    this._activeRpcCount.update(c => c + 1);

    const callPart = this.deps.buildCallAgentFunctionDataPart(callPayload);

    try {
      await this.executeRpcStream(url, callPart, abortController, sourceWindow);
    } catch (err: unknown) {
      streamFailed = true;
      if (!abortController.signal.aborted) {
        const errMessage = err instanceof Error ? err.message : 'Agent function call failed';
        this.deps.recordInspectorEvent(createErrorEvent(err));
        if (!hasReceivedResponse && this.deps.isLiveOwnedWindow(sourceWindow)) {
          const errorMsg = buildAgentFunctionResponseItem(functionCallId, {
            error: {
              code: 'AGENT_FUNCTION_ERROR',
              message: errMessage,
            },
          });
          const sent = this.deps.sendRenderA2UI([errorMsg], sourceWindow);
          if (sent !== false) {
            hasReceivedResponse = true;
          }
        }
      }
    } finally {
      if (
        !streamFailed &&
        !hasReceivedResponse &&
        !abortController.signal.aborted &&
        this.deps.isLiveOwnedWindow(sourceWindow)
      ) {
        const errorMsg = buildAgentFunctionResponseItem(functionCallId, {
          error: {
            code: 'AGENT_FUNCTION_ERROR',
            message: 'Stream completed without returning agentFunctionResponse',
          },
        });
        this.deps.sendRenderA2UI([errorMsg], sourceWindow);
      }
      const current = this.pendingFunctionCalls.get(functionCallId);
      if (current === entry) {
        this.pendingFunctionCalls.delete(functionCallId);
        this._activeRpcCount.update(c => Math.max(0, c - 1));
      }
    }
  }

  async handleRendererFunctionResponse(
    env: SendToServerEnvelope & {
      payload: {rendererFunctionResponse: V10RendererFunctionResponsePayload};
    },
  ): Promise<void> {
    const payload = env.payload.rendererFunctionResponse;
    const url = this.deps.getAgentUrl();
    const sourceWindow = env.sourceWindow;
    if (!url || !sourceWindow) return;

    const abortController = new AbortController();
    const entry: PendingRendererResponseEntry = {sourceWindow, abortController};
    this.pendingRendererFunctionResponses.add(entry);
    this._activeRpcCount.update(c => c + 1);

    const responsePart = this.deps.buildRendererFunctionResponseDataPart(payload);

    try {
      await this.executeRpcStream(url, responsePart, abortController, sourceWindow);
    } catch (err: unknown) {
      if (!abortController.signal.aborted) {
        this.deps.logError('Renderer function response stream error', err);
        this.deps.recordInspectorEvent(createErrorEvent(err));
      }
    } finally {
      if (this.pendingRendererFunctionResponses.delete(entry)) {
        this._activeRpcCount.update(c => Math.max(0, c - 1));
      }
    }
  }

  private routeAgentFunctionResponse(item: RenderA2uiItem): boolean {
    const functionCallId = item.agentFunctionResponse?.functionCallId;
    if (!functionCallId) {
      return false;
    }
    const pendingCall = this.pendingFunctionCalls.get(functionCallId);
    if (!pendingCall || !this.deps.isLiveOwnedWindow(pendingCall.sourceWindow)) {
      return false;
    }
    const sent = this.deps.sendRenderA2UI([item], pendingCall.sourceWindow);
    if (sent !== false) {
      pendingCall.markResponded();
      return true;
    }
    return false;
  }

  private async executeRpcStream(
    url: string,
    part: A2aPart,
    abortController: AbortController,
    sourceWindow: Window,
  ): Promise<void> {
    const contextId = this.deps.getActiveContextId();
    const message: A2aMessage = {
      role: 'user',
      parts: [part],
      ...(contextId ? {contextId} : {}),
    };

    this.deps.recordInspectorEvent(createSentMessageEvent(message));

    const stream = this.deps.sendMessageStream(url, message, {
      tenantId: this.deps.getTenantId(),
      contextId,
      abortSignal: abortController.signal,
      protocolVersion: '1.0',
    });

    for await (const chunk of stream) {
      if (abortController.signal.aborted || !this.deps.isLiveOwnedWindow(sourceWindow)) {
        break;
      }
      this.deps.recordInspectorEvent(createReceivedEvent(chunk));
      const parsed = this.deps.parseStreamEvent(chunk);
      if (parsed.contextId) {
        this.deps.setActiveContextId(parsed.contextId);
      }
      if (parsed.taskId) {
        this.deps.setActiveTaskId(parsed.taskId);
      }
      for (const rawItem of parsed.a2uiItems ?? []) {
        if (abortController.signal.aborted || !this.deps.isLiveOwnedWindow(sourceWindow)) {
          return;
        }
        const item = normalizeV10RpcEnvelopeItem(rawItem);
        if (item.agentFunctionResponse) {
          this.routeAgentFunctionResponse(item);
          continue;
        }
        if (
          item.createSurface ||
          item.updateComponents ||
          item.updateDataModel ||
          item.deleteSurface ||
          isV10RpcEnvelopeItem(item)
        ) {
          this.deps.sendRenderA2UI([item], sourceWindow);
        }
      }
    }
  }

  private getTargetPayloadForBinding(binding: SurfaceFrameBinding): unknown[] | null | undefined {
    if (binding.kind === 'canvas') {
      return this.deps.isCanvasOpen() ? this.deps.getActiveCanvasPayload() : null;
    }
    const ownerMsg = this.deps.getMessages().find(m => m.id === binding.messageId);
    return resolveInlinePayload(ownerMsg);
  }

  private getMessageCanvasPayloads(msg: UiMessage | undefined): RenderA2uiItem[][] {
    if (!msg) return [];
    if (msg.canvasArtifacts?.length) {
      return msg.canvasArtifacts.map(artifact => artifact.payload);
    }
    return msg.hasCanvas && msg.a2uiPayload?.length ? [msg.a2uiPayload] : [];
  }

  private findLatestTrackedFrame(
    predicate: (frame: TrackedSurfaceFrame) => boolean,
  ): {window: Window; frame: TrackedSurfaceFrame} | null {
    let latest: {window: Window; frame: TrackedSurfaceFrame} | null = null;
    for (const [win, frame] of this.trackedFrames.entries()) {
      if (predicate(frame) && this.deps.isLiveOwnedWindow(win)) {
        latest = {window: win, frame};
      }
    }
    return latest;
  }

  /**
   * Walks chat history backward from `agentMessageId` to determine which frame(s)
   * own `surfaceId` at that point in the conversation, pinning Canvas bindings to
   * the owning message's Canvas payloads.
   */
  private resolveExpectedBindingsForSurface(
    surfaceId: string,
    agentMessageId: string,
  ): ExpectedSurfaceFrameBinding[] {
    const msgs = this.deps.getMessages();
    const targetIdx = msgs.findIndex(m => m.id === agentMessageId);
    const startIdx = targetIdx >= 0 ? targetIdx : msgs.length - 1;

    for (let i = startIdx; i >= 0; i--) {
      const msg = msgs[i];
      const inlinePayload = resolveInlinePayload(msg);
      const inInline = Boolean(
        inlinePayload && resolveActiveSurfaceIds(inlinePayload).has(surfaceId),
      );

      const matchingCanvasPayloads = this.getMessageCanvasPayloads(msg).filter(payload =>
        resolveActiveSurfaceIds(payload).has(surfaceId),
      );
      const inCanvas = matchingCanvasPayloads.length > 0;

      if (inInline || inCanvas) {
        const bindings: ExpectedSurfaceFrameBinding[] = [];
        if (inInline) {
          bindings.push({kind: 'inline', messageId: msg.id});
        }
        if (inCanvas) {
          bindings.push({
            kind: 'canvas',
            expectedPayloadsJson: new Set(matchingCanvasPayloads.map(p => stableStringify(p))),
          });
        }
        return bindings;
      }
    }

    return [];
  }

  private resolveCandidateTrackedFrame(
    surfaceId: string | undefined,
    agentMessageId: string,
  ): {
    window: Window;
    frame: TrackedSurfaceFrame;
    expectedCanvasPayloadsJson?: ReadonlySet<string>;
  } | null {
    if (surfaceId) {
      const expectedBindings = this.resolveExpectedBindingsForSurface(surfaceId, agentMessageId);
      if (expectedBindings.length > 0) {
        for (const binding of expectedBindings) {
          if (binding.kind === 'inline') {
            const match = this.findLatestTrackedFrame(
              f => f.binding.kind === 'inline' && f.binding.messageId === binding.messageId,
            );
            if (match) {
              return match;
            }
          } else {
            const match = this.findLatestTrackedFrame(
              f =>
                f.binding.kind === 'canvas' &&
                f.surfaceIds.has(surfaceId) &&
                binding.expectedPayloadsJson.has(f.lastRenderedPayloadJson),
            );
            if (match) {
              return {
                ...match,
                expectedCanvasPayloadsJson: binding.expectedPayloadsJson,
              };
            }
          }
        }
        return null;
      }
      return this.findLatestTrackedFrame(f => f.surfaceIds.has(surfaceId));
    }

    const agentMsg = this.deps.getMessages().find(m => m.id === agentMessageId);
    const inlinePayload = resolveInlinePayload(agentMsg);

    if (inlinePayload) {
      return this.findLatestTrackedFrame(
        f => f.binding.kind === 'inline' && f.binding.messageId === agentMessageId,
      );
    }

    const canvasPayloads = this.getMessageCanvasPayloads(agentMsg);
    if (canvasPayloads.length > 0) {
      const expectedPayloadsJson = new Set(canvasPayloads.map(p => stableStringify(p)));
      const match = this.findLatestTrackedFrame(
        f => f.binding.kind === 'canvas' && expectedPayloadsJson.has(f.lastRenderedPayloadJson),
      );
      return match ? {...match, expectedCanvasPayloadsJson: expectedPayloadsJson} : null;
    }

    return (
      this.findLatestTrackedFrame(
        f => f.binding.kind === 'inline' && f.binding.messageId === agentMessageId,
      ) ?? this.findLatestTrackedFrame(() => true)
    );
  }

  private resolveReadyRpcTargetWindow(
    surfaceId: string | undefined,
    agentMessageId: string,
  ): Window | null {
    const candidate = this.resolveCandidateTrackedFrame(surfaceId, agentMessageId);
    if (!candidate) {
      return null;
    }

    const targetPayload = this.getTargetPayloadForBinding(candidate.frame.binding);
    if (!Array.isArray(targetPayload) || targetPayload.length === 0) {
      return null;
    }

    if (surfaceId && !resolveActiveSurfaceIds(targetPayload).has(surfaceId)) {
      return null;
    }

    const targetPayloadJson = stableStringify(targetPayload);
    if (
      candidate.expectedCanvasPayloadsJson &&
      !candidate.expectedCanvasPayloadsJson.has(targetPayloadJson)
    ) {
      return null;
    }

    return candidate.frame.lastRenderedPayloadJson === targetPayloadJson ? candidate.window : null;
  }
}
