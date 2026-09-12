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

import {Component, DestroyRef, effect, inject, OnInit, signal, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PreviewBridgeMessageType, RenderA2uiItem} from 'a2ui-bridge';

import {A2A_TRANSPORT} from '../chat/a2a/a2a-transport.token';
import {A2aMessage, AgentCard, TaskStatusUpdateEvent} from '../chat/a2a/a2a-types';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {
  A2aBackendMode,
  AppConfigProvider,
} from '../settings/app-config-provider/app-config-provider';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {asRecord} from '../utils/json';
import {isValidEndpointUrl, normalizeHttpUrl} from '../utils/url';
import {generateUuid as uuid} from '../utils/uuid';

import {AgentConfigPanel, AgentConfigSaveEvent} from './agent-config-panel/agent-config-panel';
import {A2aAgentHeader} from './agent-header/agent-header';
import {UiAgentInfo} from './agent-header/types';
import {A2aChatHistory} from './chat-history/chat-history';
import {CanvasArtifact, UiMessage} from './chat-message/types';
import {
  a2aCardToUiAgentInfo,
  createErrorEvent,
  createReceivedEvent,
  createSentMessageEvent,
  parseA2aStreamEvent,
} from './converters/a2a-ui-converter';
import {
  A2UI_MIME_TYPE,
  A2UI_PROTOCOL_VERSION,
  mergeA2uiItems,
  partitionA2uiSurfacePayload,
} from './converters/surface-partitioner';
import {A2aInputArea, SendMessageEvent} from './input-area/input-area';
import {A2aMessageInspector} from './message-inspector/message-inspector';
import {MessageInspectorEvent} from './message-inspector/message-inspector-event';

/**
 * Blank line delimiting one reasoning step from the next within a message's thinking text.
 *
 * Agents do not tag step boundaries, so this is the only signal available for distinguishing a
 * rewrite of the current step from the start of a new one.
 */
const THOUGHT_STEP_SEPARATOR = '\n\n';

/** Text shown for a surface action that does not describe itself. */
const DEFAULT_USER_ACTION_TEXT = 'User action triggered.';

/**
 * Key under which a surface may nest the action proper.
 *
 * The caller has already unwrapped the v0.9 `{version, action}` envelope, so
 * only the surface's own `event` wrapper remains to be peeled.
 */
const ACTION_WRAPPER_FIELD = 'event';

/**
 * Returns the chat text for a user action submitted from a surface.
 *
 * Surfaces may supply `context.prompt`, which reads as something the user
 * would have typed. Anything else, including the action's internal `name`, is
 * an implementation detail, so it falls back to a generic phrase rather than
 * exposing the wire format to the user.
 */
function resolveUserActionText(action: unknown): string {
  const outer = asRecord(action);
  if (!outer) {
    return DEFAULT_USER_ACTION_TEXT;
  }

  const inner = asRecord(outer[ACTION_WRAPPER_FIELD]) ?? outer;
  const context = asRecord(inner['context']) ?? asRecord(outer['context']);
  const prompt = context?.['prompt'];
  if (typeof prompt !== 'string') {
    return DEFAULT_USER_ACTION_TEXT;
  }
  return prompt.trim() || DEFAULT_USER_ACTION_TEXT;
}

/**
 * Top-level view container managing end-to-end Agent-to-Agent (A2A) testing,
 * interactive message exchanges, live A2UI surface rendering, resizable inspector, and side drawer diagnostics.
 */
@Component({
  selector: 'a2ui-composer-a2a-chat-view',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    A2aAgentHeader,
    A2aChatHistory,
    A2aInputArea,
    A2aMessageInspector,
    AgentConfigPanel,
    RenderedFrame,
  ],
  templateUrl: './a2a-chat-view.ng.html',
  styleUrl: './a2a-chat-view.scss',
})
export class A2aChatView implements OnInit {
  protected readonly configProvider = inject(AppConfigProvider);
  private readonly a2aTransport = inject(A2A_TRANSPORT);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly destroyRef = inject(DestroyRef);
  private readonly initTimestamp = Date.now();

  /** Discovered A2A AgentCard metadata for the connected agent. */
  protected readonly agentCard = signal<AgentCard | null>(null);
  /** Normalized UI metadata and skills for display. */
  protected readonly agentInfo = signal<UiAgentInfo | null>(null);
  /** Message conversation history list. */
  protected readonly messages = signal<UiMessage[]>([]);
  /** Raw A2A protocol events recorded for inspection. */
  protected readonly inspectorEvents = signal<MessageInspectorEvent[]>([]);
  /** Current active task ID from the agent server. */
  protected readonly activeTaskId = signal<string | null>(null);
  /**
   * Conversation context / session ID assigned by the agent.
   *
   * Undefined until the agent issues one on its first response, which is also the value sent on
   * the wire to request a new context.
   */
  protected readonly activeContextId = signal<string | undefined>(undefined);

  /** Whether a connection handshake is currently in progress. */
  protected readonly isConnecting = signal<boolean>(false);
  /** Connection error string if agent discovery or handshake failed. */
  protected readonly connectionError = signal<string | null>(null);
  /** Whether the message inspector side drawer is open. */
  protected readonly isInspectorOpen = signal<boolean>(false);
  /** Whether the agent configuration modal is open. */
  protected readonly isConfigPanelOpen = signal<boolean>(false);
  /** Whether the A2UI Canvas surface preview panel is open. */
  protected readonly isCanvasOpen = signal<boolean>(false);
  /** Active A2UI component items to render inside Canvas. */
  protected readonly activeCanvasPayload = signal<RenderA2uiItem[] | null>(null);
  /** Whether a response stream turn is currently executing. */
  protected readonly isStreaming = signal<boolean>(false);

  /** Width in pixels for the resizable message inspector panel. */
  readonly inspectorWidth = signal<number>(380);
  /** Whether the inspector panel is currently being resized by mouse drag. */
  protected readonly isResizingInspector = signal<boolean>(false);

  private activeAbortController?: AbortController;

  constructor() {
    this.hostCommunication.messageStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(envelope => {
        if (!envelope) return;
        if (envelope.timestamp && envelope.timestamp < this.initTimestamp) return;
        if (envelope.type === PreviewBridgeMessageType.SEND_TO_SERVER) {
          this.handleSendToServerAction(envelope.payload);
        }
      });

    effect(() => {
      const payload = this.activeCanvasPayload();
      const isOpen = this.isCanvasOpen();
      if (isOpen && payload !== null && Array.isArray(payload) && payload.length > 0) {
        this.hostCommunication.sendRenderA2UI(payload);
      }
    });

    effect(() => {
      const envelope = this.hostCommunication.messageStream();
      if (
        envelope?.type === PreviewBridgeMessageType.RENDERER_READY ||
        envelope?.type === PreviewBridgeMessageType.A2UI_CATALOG
      ) {
        const payload = untracked(() => this.activeCanvasPayload());
        const isOpen = untracked(() => this.isCanvasOpen());
        if (isOpen && payload !== null && Array.isArray(payload) && payload.length > 0) {
          this.hostCommunication.sendRenderA2UI(payload);
        }
      }
    });
  }

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => {
      this.cancelActiveGeneration();
    });

    const storedUrl = this.configProvider.a2aAgentUrl();
    const storedTenant = this.configProvider.a2aTenantId();
    const backendMode = this.configProvider.a2aBackendMode();

    if (storedUrl) {
      this.connectToAgent(storedUrl, storedTenant, backendMode);
    } else {
      this.isConfigPanelOpen.set(true);
    }
  }

  async connectToAgent(
    url: string,
    tenantId?: string,
    backendMode?: A2aBackendMode,
  ): Promise<void> {
    const normalizedUrl = normalizeHttpUrl(url);
    if (!normalizedUrl || !isValidEndpointUrl(normalizedUrl) || this.isConnecting()) return;

    this.isConnecting.set(true);
    this.connectionError.set(null);

    try {
      // Configure backend mode and tenant ID prior to fetching the agent card
      // so that the delegating transport routes the discovery request to the
      // selected transport.
      if (backendMode) {
        this.configProvider.setA2aBackendMode(backendMode);
      }
      if (tenantId !== undefined) {
        this.configProvider.setA2aTenantId((tenantId || '').trim());
      }

      const card = await this.a2aTransport.getAgentCard(normalizedUrl);

      this.configProvider.setA2aAgentUrl(normalizedUrl);
      this.agentCard.set(card);
      const info = a2aCardToUiAgentInfo(card, normalizedUrl);
      this.agentInfo.set(info);
      this.isConfigPanelOpen.set(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to agent endpoint.';
      this.connectionError.set(errorMsg);
      this.recordInspectorEvent(createErrorEvent(err));
    } finally {
      this.isConnecting.set(false);
    }
  }

  protected saveAgentConfiguration(event: AgentConfigSaveEvent): void {
    this.connectToAgent(event.endpoint, event.tenantId, event.backendMode);
  }

  protected clearAgentConfiguration(): void {
    this.cancelActiveGeneration();
    this.configProvider.setA2aAgentUrl('');
    this.configProvider.setA2aTenantId('');
    this.agentCard.set(null);
    this.agentInfo.set(null);
    this.messages.set([]);
    this.inspectorEvents.set([]);
    this.activeTaskId.set(null);
    this.activeContextId.set(undefined);
    this.activeCanvasPayload.set(null);
    this.isCanvasOpen.set(false);
  }

  protected sendUserMessage(event: SendMessageEvent): void {
    const userText = (event.text || '').trim();
    const images = event.images || [];

    if (!userText && images.length === 0) return;

    const userMessageId = uuid();
    const agentMessageId = uuid();
    // Context IDs are owned by the agent, not the client. The first turn is sent
    // without one so the server can mint it; subsequent turns replay the ID
    // adopted from the stream in handleStreamEvent. Minting one here instead
    // would pin the conversation to an ID the agent never issued, so it would
    // treat each turn as an unknown context and drop prior history.
    const contextId = this.activeContextId();

    const userUiMessage: UiMessage = {
      id: userMessageId,
      sender: 'user',
      text: userText,
      images,
      timestamp: Date.now(),
    };
    const agentUiMessage = this.createPendingAgentMessage(agentMessageId);

    const a2aMsg = this.buildOutgoingA2aMessage(userText, images, contextId);
    this.recordInspectorEvent(createSentMessageEvent(a2aMsg));

    this.messages.update(msgs => [...msgs, userUiMessage, agentUiMessage]);
    this.executeStreamingTurn(a2aMsg, agentMessageId, undefined, contextId);
  }

  private buildOutgoingA2aMessage(
    text: string,
    images: SendMessageEvent['images'],
    contextId?: string,
  ): A2aMessage {
    const parts: A2aMessage['parts'] = [];
    if (text) {
      parts.push({text});
    }
    for (const img of images || []) {
      const base64Data = img.data.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        kind: 'file',
        raw: base64Data,
        mediaType: img.mimeType,
        filename: img.name,
        file: {
          ['bytes']: base64Data,
          ['mimeType']: img.mimeType,
          ['name']: img.name,
        },
      });
    }
    return {
      role: 'user',
      parts,
      ...(contextId ? {contextId} : {}),
    };
  }

  private createPendingAgentMessage(agentMessageId: string): UiMessage {
    return {
      id: agentMessageId,
      sender: 'agent',
      text: '',
      thinking: '',
      timestamp: Date.now(),
      isStreaming: true,
      a2uiPayload: [],
    };
  }

  protected handleSendToServerAction(payload: unknown): void {
    const rawPayload = payload as {version?: string; action?: unknown} | undefined;
    let action = rawPayload?.action !== undefined ? rawPayload.action : payload;

    if (typeof action === 'string') {
      try {
        action = JSON.parse(action);
      } catch {
        // Keep string if not JSON
      }
    }

    if (action === null || action === undefined) return;

    if (this.isStreaming()) {
      this.cancelActiveGeneration();
    }

    // The v0.9 client-to-server schema accepts exactly two properties, `version` and `action`.
    // `userAction` is the superseded v0.8 spelling and any extra key makes the payload invalid,
    // so the action is forwarded verbatim under a minimal envelope.
    const actionData: Record<string, unknown> = {
      version: A2UI_PROTOCOL_VERSION,
      action,
    };

    const contextId = this.activeContextId();

    const actionText = resolveUserActionText(action);

    const userUiMessage: UiMessage = {
      id: uuid(),
      sender: 'user',
      text: actionText,
      timestamp: Date.now(),
    };

    const a2aMsg: A2aMessage = {
      role: 'user',
      parts: [
        {text: actionText},
        {
          data: actionData,
          metadata: {
            mimeType: A2UI_MIME_TYPE,
            type: 'a2ui_action',
          },
        },
      ],
      ...(contextId ? {contextId} : {}),
    };

    this.recordInspectorEvent(createSentMessageEvent(a2aMsg));

    const agentMessageId = uuid();
    const agentUiMessage: UiMessage = {
      id: agentMessageId,
      sender: 'agent',
      text: '',
      thinking: '',
      timestamp: Date.now(),
      isStreaming: true,
      a2uiPayload: [],
    };

    this.messages.update(msgs => [...msgs, userUiMessage, agentUiMessage]);
    this.executeStreamingTurn(a2aMsg, agentMessageId, undefined, contextId);
  }

  protected submitSamplePrompt(prompt: string): void {
    this.sendUserMessage({text: prompt, images: []});
  }

  private async executeStreamingTurn(
    a2aMsg: A2aMessage,
    agentMessageId: string,
    taskId?: string,
    contextId?: string,
  ): Promise<void> {
    const controller = this.initTurnAbortController();

    const url = this.configProvider.a2aAgentUrl();
    if (!url) {
      this.handleMissingAgentUrl(agentMessageId, controller);
      return;
    }

    try {
      await this.consumeStreamTurn(url, a2aMsg, agentMessageId, controller, taskId, contextId);
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        this.handleStreamingError(err, agentMessageId);
      }
    } finally {
      this.finalizeStreamingTurn(agentMessageId, controller);
    }
  }

  private initTurnAbortController(): AbortController {
    this.isStreaming.set(true);
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }
    const controller = new AbortController();
    this.activeAbortController = controller;
    return controller;
  }

  private handleMissingAgentUrl(agentMessageId: string, controller: AbortController): void {
    this.messages.update(msgs =>
      msgs.map(m =>
        m.id === agentMessageId
          ? {
              ...m,
              sender: 'error',
              text: 'Error: Agent URL is not configured.',
              isStreaming: false,
            }
          : m,
      ),
    );
    if (this.activeAbortController === controller) {
      this.isStreaming.set(false);
      this.activeAbortController = undefined;
    }
  }

  private async consumeStreamTurn(
    url: string,
    a2aMsg: A2aMessage,
    agentMessageId: string,
    controller: AbortController,
    taskId?: string,
    contextId?: string,
  ): Promise<void> {
    const tenantId = this.configProvider.a2aTenantId() || undefined;
    const stream = this.a2aTransport.sendMessageStream(url, a2aMsg, {
      tenantId,
      taskId,
      contextId,
      abortSignal: controller.signal,
    });

    for await (const chunk of stream) {
      if (controller.signal.aborted) break;
      this.recordInspectorEvent(createReceivedEvent(chunk));
      this.handleStreamEvent(chunk, agentMessageId);
    }
  }

  private handleStreamingError(err: unknown, agentMessageId: string): void {
    const errText = err instanceof Error ? err.message : 'Unknown communication error';
    this.recordInspectorEvent(createErrorEvent(errText));

    this.messages.update(msgs =>
      msgs.map(m =>
        m.id === agentMessageId
          ? {
              ...m,
              sender: 'error',
              text: m.text ? `${m.text}\n\n[Error: ${errText}]` : `Error: ${errText}`,
              isStreaming: false,
            }
          : m,
      ),
    );
  }

  private finalizeStreamingTurn(agentMessageId: string, controller: AbortController): void {
    if (this.activeAbortController === controller) {
      this.isStreaming.set(false);
      this.activeAbortController = undefined;
    }

    this.messages.update(msgs =>
      msgs.map(m => {
        if (m.id !== agentMessageId) return m;
        if (controller.signal.aborted) {
          const currentText = m.text ? `${m.text}\n\n*(Turn cancelled)*` : '*(Turn cancelled)*';
          return {...m, text: currentText, isStreaming: false};
        }
        const hasContent = m.text || m.thinking || (m.a2uiPayload && m.a2uiPayload.length > 0);
        if (!hasContent && m.sender !== 'error') {
          return {
            ...m,
            text: '*(Agent finished without generating content. Check the agent server console logs or Message Inspector for details.)*',
            isStreaming: false,
          };
        }
        return {...m, isStreaming: false};
      }),
    );
  }

  /**
   * Accumulates a streamed text chunk onto the text received so far.
   *
   * Agents differ in what each chunk contains: some send only the delta, others resend the whole
   * response every time. A chunk that repeats or extends what we already have therefore replaces
   * it, and anything else is appended.
   */
  private appendStreamedText(existing: string | undefined, chunk: string): string {
    if (!existing) return chunk;
    if (chunk === existing || chunk.startsWith(existing)) return chunk;
    return existing + chunk;
  }

  /**
   * Accumulates a streamed thought chunk onto the reasoning received so far.
   *
   * Thought streams are noisier than text: agents commonly resend the current reasoning step in
   * full on every event while occasionally emitting a brand new step. Reasoning steps are
   * separated by a blank line, which is the only structure available to tell those two cases
   * apart, so the last blank line marks where the in-progress step begins:
   *
   * - A chunk extending the whole accumulated text supersedes it (cumulative stream).
   * - A chunk extending only the final step rewrites that step, preserving earlier ones.
   * - Otherwise the chunk is a new step and is appended after a blank line, unless it is text we
   *   have already recorded.
   */
  private appendStreamedThought(existing: string | undefined, chunk: string): string {
    if (!existing) return chunk;
    if (chunk === existing || chunk.startsWith(existing)) return chunk;

    const lastStepStart = existing.lastIndexOf(THOUGHT_STEP_SEPARATOR);
    const hasEarlierSteps = lastStepStart >= 0;
    const lastStep = hasEarlierSteps
      ? existing.substring(lastStepStart + THOUGHT_STEP_SEPARATOR.length)
      : existing;

    if (lastStep && chunk.startsWith(lastStep)) {
      const completedSteps = hasEarlierSteps
        ? existing.substring(0, lastStepStart + THOUGHT_STEP_SEPARATOR.length)
        : '';
      return completedSteps + chunk;
    }

    if (existing.includes(chunk.trim())) return existing;

    // Avoid a triple newline when the accumulated text already ends in one.
    const separator = existing.endsWith('\n') ? '\n' : THOUGHT_STEP_SEPARATOR;
    return `${existing}${separator}${chunk}`;
  }

  private handleStreamEvent(event: TaskStatusUpdateEvent, agentMessageId: string): void {
    const parsed = parseA2aStreamEvent(event);

    if (parsed.contextId) {
      this.activeContextId.set(parsed.contextId);
    }
    if (parsed.taskId) {
      this.activeTaskId.set(parsed.taskId);
    }

    this.messages.update(msgs =>
      msgs.map(m => {
        if (m.id !== agentMessageId) return m;

        const updatedText = parsed.textChunk
          ? this.appendStreamedText(m.text, parsed.textChunk)
          : m.text;
        const updatedThinking = parsed.thoughtChunk
          ? this.appendStreamedThought(m.thinking, parsed.thoughtChunk)
          : m.thinking;
        const updatedPayload =
          parsed.a2uiItems.length > 0
            ? mergeA2uiItems(m.a2uiPayload || [], parsed.a2uiItems)
            : m.a2uiPayload;
        const updatedToolCalls =
          parsed.toolCalls && parsed.toolCalls.length > 0
            ? [...(m.toolCalls || []), ...parsed.toolCalls]
            : m.toolCalls;

        const partitioned = partitionA2uiSurfacePayload(updatedPayload || []);

        return {
          ...m,
          text: updatedText,
          thinking: updatedThinking,
          a2uiPayload: updatedPayload,
          toolCalls: updatedToolCalls,
          inlineA2uiPayload: partitioned.inlinePayload || undefined,
          canvasArtifacts: partitioned.canvasArtifacts,
          hasCanvas: partitioned.hasCanvas,
          isStreaming: !parsed.isCompleted,
          rawA2aMessage: event.message || m.rawA2aMessage,
        };
      }),
    );

    if (parsed.a2uiItems.length > 0) {
      const activeMsg = this.messages().find(m => m.id === agentMessageId);
      if (activeMsg?.canvasArtifacts && activeMsg.canvasArtifacts.length > 0) {
        const autoOpenArtifact = activeMsg.canvasArtifacts.find(a => a.autoOpen);
        if (this.isCanvasOpen()) {
          const currentActive = this.activeCanvasPayload();
          const matching = activeMsg.canvasArtifacts.find(a =>
            this.matchesActiveCanvasPayload(a, currentActive),
          );
          if (matching) {
            this.activeCanvasPayload.set(matching.payload);
          } else if (autoOpenArtifact) {
            this.activeCanvasPayload.set(autoOpenArtifact.payload);
          }
        } else if (autoOpenArtifact) {
          this.openCanvasSurface(autoOpenArtifact.payload);
        }
      }
    }
  }

  private matchesActiveCanvasPayload(
    artifact: CanvasArtifact,
    currentActive: RenderA2uiItem[] | null,
  ): boolean {
    if (artifact.payload === currentActive) return true;
    const activeSurfaceId = currentActive?.[0]?.createSurface?.surfaceId;
    const artifactSurfaceId = artifact.payload?.[0]?.createSurface?.surfaceId;
    return Boolean(activeSurfaceId && activeSurfaceId === artifactSurfaceId);
  }

  protected cancelActiveGeneration(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = undefined;
    }
    this.isStreaming.set(false);
    this.messages.update(msgs => msgs.map(m => (m.isStreaming ? {...m, isStreaming: false} : m)));
  }

  protected resetActiveSession(): void {
    this.cancelActiveGeneration();
    this.messages.set([]);
    this.activeTaskId.set(null);
    this.activeContextId.set(undefined);
    this.activeCanvasPayload.set(null);
    this.isCanvasOpen.set(false);
  }

  protected openCanvasSurface(payload: RenderA2uiItem[]): void {
    this.activeCanvasPayload.set(payload);
    this.isCanvasOpen.set(true);
  }

  protected closeCanvasSurface(): void {
    this.isCanvasOpen.set(false);
    this.activeCanvasPayload.set(null);
  }

  protected toggleInspectorDrawer(): void {
    this.isInspectorOpen.update(v => !v);
  }

  protected startInspectorResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizingInspector.set(true);

    const startX = event.clientX;
    const startWidth = this.inspectorWidth();
    const resizeController = new AbortController();
    const {signal} = resizeController;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const minWidth = 280;
      const maxWidth = Math.max(300, Math.floor(window.innerWidth * 0.7));
      const newWidth = Math.min(Math.max(startWidth + delta, minWidth), maxWidth);
      this.inspectorWidth.set(newWidth);
    };

    const cleanup = () => {
      this.isResizingInspector.set(false);
      resizeController.abort();
      removeDestroyHook();
    };

    const removeDestroyHook = this.destroyRef.onDestroy(() => {
      resizeController.abort();
    });

    window.addEventListener('mousemove', onMouseMove, {signal});
    window.addEventListener('mouseup', cleanup, {signal});
  }

  protected handleInspectorResizeKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const maxWidth = Math.max(300, Math.floor(window.innerWidth * 0.7));
      this.inspectorWidth.update(w => Math.min(w + 24, maxWidth));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.inspectorWidth.update(w => Math.max(w - 24, 280));
    }
  }

  protected openConfigPanel(): void {
    this.isConfigPanelOpen.set(true);
  }

  protected clearInspectorEvents(): void {
    this.inspectorEvents.set([]);
  }

  private recordInspectorEvent(event: MessageInspectorEvent): void {
    this.inspectorEvents.update(evts => [event, ...evts].slice(0, 500));
  }
}
