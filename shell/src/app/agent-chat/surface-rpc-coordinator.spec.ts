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

import {TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import type {RenderA2uiItem} from 'a2ui-bridge';
import type {A2aMessage, TaskStatusUpdateEvent} from '../chat/a2a/a2a-types';
import {A2aStreamEventParser} from './converters/a2a-stream-event-parser.service';
import type {UiMessage} from './chat-message/types';
import {V10A2aStrategy} from './protocol/v1-0-a2a-strategy';
import {SurfaceRpcCoordinator} from './surface-rpc-coordinator';

function makeCanvasMsg(
  id: string,
  surfaceId: string,
  text: string,
  autoOpen = false,
): {msg: UiMessage; payload: RenderA2uiItem[]} {
  const payload = [
    {
      version: '1.0',
      createSurface: {
        surfaceId,
        catalogId: 'cat-1',
        components: [
          {
            id: 'root',
            component: 'Canvas',
            cardTitle: text,
            autoOpen,
            children: ['t1'],
          },
          {id: 't1', component: 'Text', text},
        ],
      },
    },
  ] as unknown as RenderA2uiItem[];

  return {
    payload,
    msg: {
      id,
      sender: 'agent',
      text: '',
      timestamp: Date.now(),
      a2uiPayload: payload,
      hasCanvas: true,
      canvasArtifacts: [
        {
          id: `${id}-art`,
          cardTitle: text,
          cardIcon: 'apps',
          autoOpen,
          payload,
        },
      ],
    },
  };
}

function makeInlineMsg(
  id: string,
  surfaceId: string,
  text: string,
): {
  msg: UiMessage;
  payload: RenderA2uiItem[];
} {
  const payload = [
    {
      version: '1.0',
      createSurface: {
        surfaceId,
        catalogId: 'cat-1',
        components: [{id: 'root', component: 'Text', text}],
      },
    },
  ] as unknown as RenderA2uiItem[];

  return {
    payload,
    msg: {
      id,
      sender: 'agent',
      text: '',
      timestamp: Date.now(),
      a2uiPayload: payload,
      inlineA2uiPayload: payload,
    },
  };
}

describe('SurfaceRpcCoordinator', () => {
  let messages: UiMessage[];
  let canvasOpen: boolean;
  let activeCanvasPayload: RenderA2uiItem[] | null;
  let liveWindows: Set<Window>;
  let sendRenderA2UIMock: ReturnType<typeof vi.fn>;
  let sendMessageStreamMock: ReturnType<typeof vi.fn>;
  let coordinator: SurfaceRpcCoordinator;

  beforeEach(() => {
    messages = [];
    canvasOpen = false;
    activeCanvasPayload = null;
    liveWindows = new Set<Window>();
    sendRenderA2UIMock = vi.fn().mockReturnValue(true);
    sendMessageStreamMock = vi.fn();

    TestBed.configureTestingModule({});
    const parser = TestBed.inject(A2aStreamEventParser);
    const v10Strategy = new V10A2aStrategy();

    coordinator = new SurfaceRpcCoordinator({
      getMessages: () => messages,
      isCanvasOpen: () => canvasOpen,
      getActiveCanvasPayload: () => activeCanvasPayload,
      getAgentUrl: () => 'http://localhost:8000',
      getTenantId: () => undefined,
      getActiveContextId: () => 'ctx-1',
      setActiveContextId: vi.fn(),
      setActiveTaskId: vi.fn(),
      recordInspectorEvent: vi.fn(),
      isLiveOwnedWindow: (win): win is Window => Boolean(win && liveWindows.has(win)),
      registerOwnedWindow: win => {
        liveWindows.add(win);
      },
      sendRenderA2UI: sendRenderA2UIMock as unknown as (
        payload: unknown[],
        target?: HTMLIFrameElement | Window | null,
      ) => boolean,
      sendMessageStream: sendMessageStreamMock as unknown as (
        url: string,
        message: A2aMessage,
        options: {
          tenantId?: string;
          contextId?: string;
          abortSignal?: AbortSignal;
          protocolVersion?: '1.0';
        },
      ) => AsyncIterable<TaskStatusUpdateEvent>,
      parseStreamEvent: event => parser.parse(event),
      buildCallAgentFunctionDataPart: payload =>
        v10Strategy.buildCallAgentFunctionDataPart(payload),
      buildRendererFunctionResponseDataPart: payload =>
        v10Strategy.buildRendererFunctionResponseDataPart(payload),
      logError: vi.fn(),
    });
  });

  it('queues scoped Canvas RPCs for turn 2 instead of executing against turn 1 open Canvas snapshot', () => {
    const turn1 = makeCanvasMsg('msg-1', 'surf-1', 'Canvas v1', true);
    const turn2 = makeCanvasMsg('msg-2', 'surf-1', 'Canvas v2', false);
    messages = [turn1.msg, turn2.msg];

    const canvasWin = {id: 'canvas-win'} as unknown as Window;
    liveWindows.add(canvasWin);

    // Turn 1 Canvas is open and rendered
    canvasOpen = true;
    activeCanvasPayload = turn1.payload;
    coordinator.handleSurfacePayloadRendered(turn1.payload, canvasWin, {kind: 'canvas'});

    // Turn 2 updates surf-1 in a non-auto-opened Canvas artifact and streams a scoped RPC
    const rpcCall = {
      version: '1.0',
      callRendererFunction: {
        surfaceId: 'surf-1',
        functionCallId: 'fn-scoped-canvas',
        callFunction: {['@call']: 'refresh'},
      },
    } as unknown as RenderA2uiItem;

    coordinator.enqueueStreamedRpcs([rpcCall], 'msg-2', null);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    // User opens Turn 2 Canvas card and it finishes rendering -> now RPC flushes
    activeCanvasPayload = turn2.payload;
    coordinator.handleSurfacePayloadRendered(turn2.payload, canvasWin, {kind: 'canvas'});

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith([rpcCall], canvasWin);
  });

  it('queues unscoped Canvas RPCs for turn 2 while turn 1 Canvas is open until turn 2 Canvas renders', () => {
    const turn1 = makeCanvasMsg('msg-1', 'surf-a', 'Canvas 1', true);
    const turn2 = makeCanvasMsg('msg-2', 'surf-b', 'Canvas 2', false);
    messages = [turn1.msg, turn2.msg];

    const canvasWin = {id: 'canvas-win'} as unknown as Window;
    liveWindows.add(canvasWin);

    canvasOpen = true;
    activeCanvasPayload = turn1.payload;
    coordinator.handleSurfacePayloadRendered(turn1.payload, canvasWin, {kind: 'canvas'});

    const unscopedCall = {
      version: '1.0',
      callRendererFunction: {
        functionCallId: 'fn-unscoped-canvas',
        callFunction: {['@call']: 'ping'},
      },
    } as unknown as RenderA2uiItem;

    coordinator.enqueueStreamedRpcs([unscopedCall], 'msg-2', null);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    activeCanvasPayload = turn2.payload;
    coordinator.handleSurfacePayloadRendered(turn2.payload, canvasWin, {kind: 'canvas'});

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith([unscopedCall], canvasWin);
  });

  it('does not steal a message inline unscoped RPC when an unrelated Canvas renders', () => {
    const canvasTurn = makeCanvasMsg('msg-canvas', 'surf-c', 'Canvas', true);
    const inlineTurn = makeInlineMsg('msg-inline', 'surf-i', 'Inline');
    messages = [canvasTurn.msg, inlineTurn.msg];

    const canvasWin = {id: 'canvas-win'} as unknown as Window;
    const inlineWin = {id: 'inline-win'} as unknown as Window;
    liveWindows.add(canvasWin);
    liveWindows.add(inlineWin);

    const unscopedCall = {
      version: '1.0',
      callRendererFunction: {
        functionCallId: 'fn-inline-unscoped',
        callFunction: {['@call']: 'focus'},
      },
    } as unknown as RenderA2uiItem;

    // Queued while msg-inline has not rendered yet
    coordinator.enqueueStreamedRpcs([unscopedCall], 'msg-inline', null);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    // Unrelated Canvas renders -> must NOT receive msg-inline's unscoped RPC
    canvasOpen = true;
    activeCanvasPayload = canvasTurn.payload;
    coordinator.handleSurfacePayloadRendered(canvasTurn.payload, canvasWin, {kind: 'canvas'});
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    // Now msg-inline renders -> receives its RPC
    coordinator.handleSurfacePayloadRendered(inlineTurn.payload, inlineWin, {
      kind: 'inline',
      messageId: 'msg-inline',
    });
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith([unscopedCall], inlineWin);
  });

  it('flushes turn 2 unscoped RPC with no surface once reloading turn 1 inline frame renders', () => {
    const turn1 = makeInlineMsg('msg-1', 'surf-1', 'Inline 1');
    const turn2: UiMessage = {
      id: 'msg-2',
      sender: 'agent',
      text: 'Checking...',
      timestamp: Date.now(),
    };
    messages = [turn1.msg, turn2];

    const inlineWin1 = {id: 'inline-win-1'} as unknown as Window;
    liveWindows.add(inlineWin1);

    const unscopedCall = {
      version: '1.0',
      callRendererFunction: {
        functionCallId: 'fn-turn2-fallback',
        callFunction: {['@call']: 'readState'},
      },
    } as unknown as RenderA2uiItem;

    // Turn 1 frame is currently reloading (not tracked yet) when turn 2 queues unscoped RPC
    coordinator.enqueueStreamedRpcs([unscopedCall], 'msg-2', null);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    // Turn 1 frame finishes rendering -> flush uses resolveReadyRpcTargetWindow and sends to inlineWin1
    coordinator.handleSurfacePayloadRendered(turn1.payload, inlineWin1, {
      kind: 'inline',
      messageId: 'msg-1',
    });
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith([unscopedCall], inlineWin1);
  });

  it('aborts pending callAgentFunction and rendererFunctionResponse streams on window reset and avoids duplicate error when settled via enqueueStreamedRpcs', async () => {
    const win = {id: 'rpc-win'} as unknown as Window;
    liveWindows.add(win);

    let capturedSignal: AbortSignal | undefined;
    let releaseStream!: () => void;
    const streamGate = new Promise<void>(resolve => {
      releaseStream = resolve;
    });

    sendMessageStreamMock.mockImplementation(async function* (
      _url: string,
      _msg: A2aMessage,
      opts?: {abortSignal?: AbortSignal},
    ) {
      capturedSignal = opts?.abortSignal;
      await streamGate;
    });

    const callPromise = coordinator.handleCallAgentFunction({
      sourceWindow: win,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's1',
          functionCallId: 'fn-settle-1',
          callFunction: {['@call']: 'lookup'},
        },
      },
    });

    expect(coordinator.activeRpcCount()).toBe(1);

    // Response arrives via main A2A stream (enqueueStreamedRpcs) before HTTP stream closes
    coordinator.enqueueStreamedRpcs(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'fn-settle-1',
            value: {ok: true},
          },
        } as unknown as RenderA2uiItem,
      ],
      'msg-stream',
      null,
    );

    releaseStream();
    await callPromise;

    // Only the value response was sent; no duplicate AGENT_FUNCTION_ERROR from finally
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'fn-settle-1',
            value: {ok: true},
          },
        },
      ],
      win,
    );
    expect(coordinator.activeRpcCount()).toBe(0);

    // Now test abortPendingCallsForWindow on rendererFunctionResponse + callAgentFunction
    sendMessageStreamMock.mockImplementation(async function* (
      _url: string,
      _msg: A2aMessage,
      opts?: {abortSignal?: AbortSignal},
    ) {
      capturedSignal = opts?.abortSignal;
      await new Promise<void>(resolve => {
        opts?.abortSignal?.addEventListener('abort', () => resolve(), {once: true});
      });
    });

    const respPromise = coordinator.handleRendererFunctionResponse({
      sourceWindow: win,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        rendererFunctionResponse: {
          functionCallId: 'fn-resp-abort',
          value: {done: true},
        },
      },
    });

    expect(coordinator.activeRpcCount()).toBe(1);
    coordinator.abortPendingCallsForWindow(win);
    expect(capturedSignal?.aborted).toBe(true);
    expect(coordinator.activeRpcCount()).toBe(0);
    await respPromise;
  });

  it('aborts pending callAgentFunction via handleSurfaceDocumentReset without posting after abort, and keeps calls alive on handleSurfaceRenderStateReset', async () => {
    const turn = makeInlineMsg('msg-1', 'surf-1', 'Inline');
    messages = [turn.msg];
    const win = {id: 'doc-reset-win'} as unknown as Window;
    liveWindows.add(win);
    coordinator.handleSurfacePayloadRendered(turn.payload, win, {
      kind: 'inline',
      messageId: 'msg-1',
    });

    let callSignal: AbortSignal | undefined;
    let releaseCallStream!: () => void;
    const callGate = new Promise<void>(resolve => {
      releaseCallStream = resolve;
    });

    sendMessageStreamMock.mockImplementation(async function* (
      _url: string,
      _msg: A2aMessage,
      opts?: {abortSignal?: AbortSignal},
    ) {
      callSignal = opts?.abortSignal;
      await callGate;
      yield {
        final: true,
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'fn-doc-reset', value: {ok: true}},
              },
            },
          ],
        },
      };
    });

    const callPromise = coordinator.handleCallAgentFunction({
      sourceWindow: win,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'fn-doc-reset',
          callFunction: {['@call']: 'check'},
        },
      },
    });

    expect(coordinator.activeRpcCount()).toBe(1);
    expect(callSignal?.aborted).toBe(false);

    // Same-document render-state reset clears frame readiness (queued RPC waits) without aborting live call
    coordinator.handleSurfaceRenderStateReset(win);
    expect(callSignal?.aborted).toBe(false);
    expect(coordinator.activeRpcCount()).toBe(1);

    const queuedCall = {
      version: '1.0',
      callRendererFunction: {
        surfaceId: 'surf-1',
        functionCallId: 'fn-after-render-reset',
        callFunction: {['@call']: 'ping'},
      },
    } as unknown as RenderA2uiItem;
    coordinator.enqueueStreamedRpcs([queuedCall], 'msg-1', null);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    // Real document reset aborts in-flight callAgentFunction and emits nothing after abort
    coordinator.handleSurfaceDocumentReset(win);
    expect(callSignal?.aborted).toBe(true);
    expect(coordinator.activeRpcCount()).toBe(0);

    releaseCallStream();
    await callPromise;
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();
  });

  it('closeCanvasFrames aborts Canvas pending calls without aborting inline pending calls', async () => {
    const canvasTurn = makeCanvasMsg('msg-c', 'surf-c', 'Canvas', true);
    const inlineTurn = makeInlineMsg('msg-i', 'surf-i', 'Inline');
    messages = [canvasTurn.msg, inlineTurn.msg];

    const canvasWin = {id: 'canvas-win'} as unknown as Window;
    const inlineWin = {id: 'inline-win'} as unknown as Window;
    liveWindows.add(canvasWin);
    liveWindows.add(inlineWin);

    canvasOpen = true;
    activeCanvasPayload = canvasTurn.payload;
    coordinator.handleSurfacePayloadRendered(canvasTurn.payload, canvasWin, {kind: 'canvas'});
    coordinator.handleSurfacePayloadRendered(inlineTurn.payload, inlineWin, {
      kind: 'inline',
      messageId: 'msg-i',
    });

    const signals = new Map<string, AbortSignal | undefined>();
    let releaseInline!: () => void;
    const inlineGate = new Promise<void>(resolve => {
      releaseInline = resolve;
    });

    sendMessageStreamMock.mockImplementation(async function* (
      _url: string,
      msg: A2aMessage,
      opts?: {abortSignal?: AbortSignal},
    ) {
      const dataPart = msg.parts[0]?.data as
        {callAgentFunction?: {functionCallId?: string}} | undefined;
      const callId = dataPart?.callAgentFunction?.functionCallId ?? 'unknown';
      signals.set(callId, opts?.abortSignal);
      if (callId === 'fn-canvas') {
        await new Promise<void>(resolve => {
          opts?.abortSignal?.addEventListener('abort', () => resolve(), {once: true});
        });
        yield {
          final: true,
          message: {
            role: 'agent',
            parts: [
              {
                data: {
                  version: '1.0',
                  agentFunctionResponse: {functionCallId: 'fn-canvas', value: {stale: true}},
                },
              },
            ],
          },
        };
        return;
      }
      await inlineGate;
      yield {
        final: true,
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'fn-inline', value: {ok: true}},
              },
            },
          ],
        },
      };
    });

    const canvasCall = coordinator.handleCallAgentFunction({
      sourceWindow: canvasWin,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-c',
          functionCallId: 'fn-canvas',
          callFunction: {['@call']: 'canvasOp'},
        },
      },
    });
    const inlineCall = coordinator.handleCallAgentFunction({
      sourceWindow: inlineWin,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-i',
          functionCallId: 'fn-inline',
          callFunction: {['@call']: 'inlineOp'},
        },
      },
    });

    expect(coordinator.activeRpcCount()).toBe(2);

    coordinator.closeCanvasFrames();
    expect(signals.get('fn-canvas')?.aborted).toBe(true);
    expect(signals.get('fn-inline')?.aborted).toBe(false);
    expect(coordinator.activeRpcCount()).toBe(1);

    await canvasCall;
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    releaseInline();
    await inlineCall;
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith(
      [{version: '1.0', agentFunctionResponse: {functionCallId: 'fn-inline', value: {ok: true}}}],
      inlineWin,
    );
    expect(coordinator.activeRpcCount()).toBe(0);
  });

  it('closeCanvasFrames still aborts pending Canvas calls even after a same-document handleSurfaceRenderStateReset', async () => {
    const canvasTurn = makeCanvasMsg('msg-c-err', 'surf-c-err', 'Canvas', true);
    messages = [canvasTurn.msg];

    const canvasWin = {id: 'canvas-win-err'} as unknown as Window;
    liveWindows.add(canvasWin);
    canvasOpen = true;
    activeCanvasPayload = canvasTurn.payload;
    coordinator.handleSurfacePayloadRendered(canvasTurn.payload, canvasWin, {kind: 'canvas'});

    let callSignal: AbortSignal | undefined;
    sendMessageStreamMock.mockImplementation(async function* (
      _url: string,
      _msg: A2aMessage,
      opts?: {abortSignal?: AbortSignal},
    ) {
      callSignal = opts?.abortSignal;
      await new Promise<void>(resolve => {
        opts?.abortSignal?.addEventListener('abort', () => resolve(), {once: true});
      });
    });

    const pendingCall = coordinator.handleCallAgentFunction({
      sourceWindow: canvasWin,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-c-err',
          functionCallId: 'fn-canvas-after-err',
          callFunction: {['@call']: 'longOp'},
        },
      },
    });

    expect(coordinator.activeRpcCount()).toBe(1);

    // Same-document render error clears frame readiness (queued RPC stays un-flushed) without aborting live call
    coordinator.handleSurfaceRenderStateReset(canvasWin);
    expect(callSignal?.aborted).toBe(false);

    const queuedAfterErr = {
      version: '1.0',
      callRendererFunction: {
        surfaceId: 'surf-c-err',
        functionCallId: 'fn-queued-after-err',
        callFunction: {['@call']: 'ping'},
      },
    } as unknown as RenderA2uiItem;
    coordinator.enqueueStreamedRpcs([queuedAfterErr], 'msg-c-err', null);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    // Closing Canvas must still recognize canvasWin as a Canvas window and abort its pending call
    coordinator.closeCanvasFrames();
    expect(callSignal?.aborted).toBe(true);
    expect(coordinator.activeRpcCount()).toBe(0);
    await pendingCall;
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();
  });

  it('routes cross-call and unknown agentFunctionResponse by functionCallId without posting to wrong window', async () => {
    const winA = {id: 'win-a'} as unknown as Window;
    const winB = {id: 'win-b'} as unknown as Window;
    liveWindows.add(winA);
    liveWindows.add(winB);

    let releaseB!: () => void;
    const gateB = new Promise<void>(resolve => {
      releaseB = resolve;
    });

    sendMessageStreamMock.mockImplementation(async function* (_url: string, msg: A2aMessage) {
      const dataPart = msg.parts[0]?.data as
        {callAgentFunction?: {functionCallId?: string}} | undefined;
      const callId = dataPart?.callAgentFunction?.functionCallId;
      if (callId === 'call-b') {
        await gateB;
        return;
      }
      // Call A's stream carries Call B's response, an unknown response, and finally Call A's response
      yield {
        final: true,
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'call-b', value: {fromA: true}},
              },
            },
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'call-unknown', value: {orphan: true}},
              },
            },
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'call-a', value: {ok: true}},
              },
            },
          ],
        },
      };
    });

    const promiseB = coordinator.handleCallAgentFunction({
      sourceWindow: winB,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's-b',
          functionCallId: 'call-b',
          callFunction: {['@call']: 'opB'},
        },
      },
    });
    const promiseA = coordinator.handleCallAgentFunction({
      sourceWindow: winA,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's-a',
          functionCallId: 'call-a',
          callFunction: {['@call']: 'opA'},
        },
      },
    });

    await promiseA;
    releaseB();
    await promiseB;

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(2);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith(
      [{version: '1.0', agentFunctionResponse: {functionCallId: 'call-b', value: {fromA: true}}}],
      winB,
    );
    expect(sendRenderA2UIMock).toHaveBeenCalledWith(
      [{version: '1.0', agentFunctionResponse: {functionCallId: 'call-a', value: {ok: true}}}],
      winA,
    );
  });

  it('does not mark agentFunctionResponse as sent when sendRenderA2UI returns false', async () => {
    const win = {id: 'reject-win'} as unknown as Window;
    liveWindows.add(win);

    sendRenderA2UIMock.mockReturnValueOnce(false).mockReturnValueOnce(true);
    sendMessageStreamMock.mockImplementation(async function* () {
      yield {
        final: true,
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'fn-rejected', value: {ok: true}},
              },
            },
          ],
        },
      };
    });

    await coordinator.handleCallAgentFunction({
      sourceWindow: win,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's1',
          functionCallId: 'fn-rejected',
          callFunction: {['@call']: 'lookup'},
        },
      },
    });

    // First send returned false -> not marked responded -> finally emits AGENT_FUNCTION_ERROR
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(2);
    expect(sendRenderA2UIMock).toHaveBeenNthCalledWith(
      2,
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'fn-rejected',
            error: {
              code: 'AGENT_FUNCTION_ERROR',
              message: 'Stream completed without returning agentFunctionResponse',
            },
          },
        },
      ],
      win,
    );
  });

  it('posts non-RPC surface items from RPC streams directly to the calling window', async () => {
    const win = {id: 'surf-win'} as unknown as Window;
    liveWindows.add(win);

    sendMessageStreamMock.mockImplementation(async function* () {
      yield {
        final: true,
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                version: '1.0',
                updateDataModel: {surfaceId: 's1', path: '/status', value: 'updated'},
              },
            },
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'fn-surf', value: {ok: true}},
              },
            },
          ],
        },
      };
    });

    await coordinator.handleCallAgentFunction({
      sourceWindow: win,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's1',
          functionCallId: 'fn-surf',
          callFunction: {['@call']: 'mutate'},
        },
      },
    });

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(2);
    expect(sendRenderA2UIMock).toHaveBeenNthCalledWith(
      1,
      [{version: '1.0', updateDataModel: {surfaceId: 's1', path: '/status', value: 'updated'}}],
      win,
    );
    expect(sendRenderA2UIMock).toHaveBeenNthCalledWith(
      2,
      [{version: '1.0', agentFunctionResponse: {functionCallId: 'fn-surf', value: {ok: true}}}],
      win,
    );
  });

  it('does not send a second stream-completion error from finally when stream throws and catch send returns false', async () => {
    const win = {id: 'err-win'} as unknown as Window;
    liveWindows.add(win);

    sendRenderA2UIMock.mockReturnValue(false);
    sendMessageStreamMock.mockImplementation(async function* () {
      yield {
        final: false,
        message: {role: 'agent', parts: []},
      };
      throw new Error('Transport dropped');
    });

    await coordinator.handleCallAgentFunction({
      sourceWindow: win,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's1',
          functionCallId: 'fn-throw',
          callFunction: {['@call']: 'failOp'},
        },
      },
    });

    // Only catch attempted to send the transport error; finally must NOT emit a misleading completion error
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {
            functionCallId: 'fn-throw',
            error: {
              code: 'AGENT_FUNCTION_ERROR',
              message: 'Transport dropped',
            },
          },
        },
      ],
      win,
    );
  });

  it('skips CANCELLED notification on duplicate functionCallId when existing sourceWindow is no longer live', async () => {
    const deadWin = {id: 'dead-win'} as unknown as Window;
    const liveWin = {id: 'live-win'} as unknown as Window;
    liveWindows.add(deadWin);
    liveWindows.add(liveWin);

    let callCount = 0;
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>(resolve => {
      releaseFirst = resolve;
    });

    sendMessageStreamMock.mockImplementation(async function* () {
      callCount++;
      if (callCount === 1) {
        await firstGate;
        return;
      }
      yield {
        final: true,
        message: {
          role: 'agent',
          parts: [
            {
              data: {
                version: '1.0',
                agentFunctionResponse: {functionCallId: 'fn-dup', value: {replaced: true}},
              },
            },
          ],
        },
      };
    });

    const firstCall = coordinator.handleCallAgentFunction({
      sourceWindow: deadWin,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's1',
          functionCallId: 'fn-dup',
          callFunction: {['@call']: 'op'},
        },
      },
    });

    // Simulate deadWin detaching before duplicate functionCallId arrives from liveWin
    liveWindows.delete(deadWin);

    const secondCall = coordinator.handleCallAgentFunction({
      sourceWindow: liveWin,
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      payload: {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 's1',
          functionCallId: 'fn-dup',
          callFunction: {['@call']: 'op'},
        },
      },
    });

    releaseFirst();
    await Promise.all([firstCall, secondCall]);

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith(
      [
        {
          version: '1.0',
          agentFunctionResponse: {functionCallId: 'fn-dup', value: {replaced: true}},
        },
      ],
      liveWin,
    );
  });
});
