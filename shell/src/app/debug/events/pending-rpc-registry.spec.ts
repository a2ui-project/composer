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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {PendingRpcRegistry} from './pending-rpc-registry';
import {HostCommunication} from '../../shell/host-communication/host-communication';

describe('PendingRpcRegistry', () => {
  let service: PendingRpcRegistry;
  let mockHostComm: {
    sendRenderA2UI: ReturnType<typeof vi.fn>;
  };
  let dummyWindow: Window;
  let anotherWindow: Window;

  beforeEach(() => {
    vi.useFakeTimers();

    dummyWindow = {} as Window;
    anotherWindow = {} as Window;

    mockHostComm = {
      sendRenderA2UI: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [PendingRpcRegistry, {provide: HostCommunication, useValue: mockHostComm}],
    });

    service = TestBed.inject(PendingRpcRegistry);
  });

  afterEach(() => {
    service.ngOnDestroy();
    vi.useRealTimers();
  });

  describe('Frame Registration', () => {
    it('returns false for unregistered, null, or undefined windows', () => {
      expect(service.isRegisteredFrame(undefined)).toBe(false);
      expect(service.isRegisteredFrame(null)).toBe(false);
      expect(service.isRegisteredFrame(dummyWindow)).toBe(false);
    });

    it('registers and unregisters window instances correctly (including unregisterWindow alias)', () => {
      service.registerFrame(dummyWindow);
      expect(service.isRegisteredFrame(dummyWindow)).toBe(true);
      expect(service.isRegisteredFrame(anotherWindow)).toBe(false);

      service.unregisterWindow(dummyWindow);
      expect(service.isRegisteredFrame(dummyWindow)).toBe(false);
    });

    it('cancels pending RPCs when their originating window is unregistered', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-1',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'testFunc'},
        sourceWindow: dummyWindow,
      });

      expect(service.getRpc('call-1')?.status).toBe('pending');
      service.unregisterFrame(dummyWindow);

      expect(service.getRpc('call-1')?.status).toBe('rejected');
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-1',
              error: {
                code: 'WINDOW_UNREGISTERED',
                message: 'Originating workspace frame was unregistered.',
              },
            },
          },
        ],
        dummyWindow,
      );
    });

    it('resolves windows dynamically via setWorkspaceFrameResolver without explicit registerFrame', () => {
      let activePreviewWindow: Window | null = dummyWindow;
      service.setWorkspaceFrameResolver(() => [activePreviewWindow]);

      expect(service.isRegisteredFrame(dummyWindow)).toBe(true);
      expect(service.isRegisteredFrame(anotherWindow)).toBe(false);

      // Switching preview window in resolver
      activePreviewWindow = anotherWindow;
      expect(service.isRegisteredFrame(dummyWindow)).toBe(false);
      expect(service.isRegisteredFrame(anotherWindow)).toBe(true);

      // Clearing resolver
      service.setWorkspaceFrameResolver(null);
      expect(service.isRegisteredFrame(anotherWindow)).toBe(false);
    });

    it('safely handles resolver that throws or returns null/undefined entries', () => {
      service.setWorkspaceFrameResolver(() => {
        throw new Error('Resolver explosion');
      });
      expect(service.isRegisteredFrame(dummyWindow)).toBe(false);

      service.setWorkspaceFrameResolver(() => [null, undefined]);
      expect(service.isRegisteredFrame(dummyWindow)).toBe(false);
    });
  });

  describe('Pending RPC Lifecycle & 30s Timeout', () => {
    it('registers an RPC and tracks remaining countdown time', () => {
      service.registerFrame(dummyWindow);
      const entry = service.registerRpc({
        functionCallId: 'call-timeout-1',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'searchAction', ['@args']: {query: 'apple'}},
        sourceWindow: dummyWindow,
      });

      expect(entry.status).toBe('pending');
      expect(entry.functionCallId).toBe('call-timeout-1');
      expect(service.getRemainingMs('call-timeout-1')).toBe(30000);

      vi.advanceTimersByTime(10000);
      expect(service.getRemainingMs('call-timeout-1')).toBe(20000);

      vi.advanceTimersByTime(15000);
      expect(service.getRemainingMs('call-timeout-1')).toBe(5000);
    });

    it('times out after 30 seconds and dispatches AGENT_FUNCTION_TIMEOUT', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-timeout-2',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'fetchData'},
        sourceWindow: dummyWindow,
      });

      vi.advanceTimersByTime(29999);
      expect(service.getRpc('call-timeout-2')?.status).toBe('pending');
      expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(service.getRpc('call-timeout-2')?.status).toBe('timed_out');
      expect(service.getRemainingMs('call-timeout-2')).toBe(0);

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(1);
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-timeout-2',
              error: {
                code: 'AGENT_FUNCTION_TIMEOUT',
                message: 'Agent function call timed out after 30s in Composer workspace.',
              },
            },
          },
        ],
        dummyWindow,
      );
    });

    it('populates entry.error immediately when remaining timeout is 0', () => {
      service.registerFrame(dummyWindow);
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const entry = service.registerRpc({
        functionCallId: 'call-immediate-timeout',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'fetchData'},
        sourceWindow: dummyWindow,
        startedAtMs: now - 35000,
      });

      expect(entry.status).toBe('timed_out');
      expect(entry.error).toEqual({
        code: 'AGENT_FUNCTION_TIMEOUT',
        message: 'Agent function call timed out after 30s in Composer workspace.',
      });
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-immediate-timeout',
              error: {
                code: 'AGENT_FUNCTION_TIMEOUT',
                message: 'Agent function call timed out after 30s in Composer workspace.',
              },
            },
          },
        ],
        dummyWindow,
      );
    });
  });

  describe('Replying with Value', () => {
    it('replies with sanitized value, cancels timeout timer, and marks replied', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-val-1',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'calculate'},
        sourceWindow: dummyWindow,
      });

      const success = service.replyValue('call-val-1', {
        result: 42,
        name: 'test',
      });

      expect(success).toBe(true);
      expect(service.getRpc('call-val-1')?.status).toBe('replied');
      expect(service.getRemainingMs('call-val-1')).toBe(0);

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-val-1',
              value: {
                result: 42,
                name: 'test',
              },
            },
          },
        ],
        dummyWindow,
      );

      // Verify timer is cancelled; advancing past 30s should not fire timeout
      vi.advanceTimersByTime(35000);
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(1);
      expect(service.getRpc('call-val-1')?.status).toBe('replied');
    });

    it('strips prototype-pollution keys from reply value objects recursively', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-pollution',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'sanitizeCheck'},
        sourceWindow: dummyWindow,
      });

      const pollutedObj = JSON.parse(
        '{"safe": 123, "__proto__": {"evil": true}, "nested": {"valid": true, "constructor": "bad"}}',
      );

      service.replyValue('call-pollution', pollutedObj);

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-pollution',
              value: {
                safe: 123,
                nested: {
                  valid: true,
                },
              },
            },
          },
        ],
        dummyWindow,
      );
    });

    it('rejects duplicate reply attempts once settled', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-dup',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'once'},
        sourceWindow: dummyWindow,
      });

      expect(service.replyValue('call-dup', 'first')).toBe(true);
      expect(service.replyValue('call-dup', 'second')).toBe(false);
      expect(service.replyError('call-dup', 'CODE', 'msg')).toBe(false);
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(1);
    });

    it('preserves already-settled RPC entries when registerRpc is re-invoked during history hydration', () => {
      service.registerFrame(dummyWindow);
      const startedAt = Date.now();
      service.registerRpc({
        functionCallId: 'call-settled',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'once'},
        sourceWindow: dummyWindow,
        startedAtMs: startedAt,
      });

      expect(service.replyValue('call-settled', {ok: true})).toBe(true);
      expect(service.getRpc('call-settled')?.status).toBe('replied');

      // Simulate Events component re-hydrating getEnvelopeHistory() 40s later
      vi.advanceTimersByTime(40000);
      const rehydrated = service.registerRpc({
        functionCallId: 'call-settled',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'once'},
        sourceWindow: dummyWindow,
        startedAtMs: startedAt,
      });

      expect(rehydrated.status).toBe('replied');
      expect(service.getRpc('call-settled')?.status).toBe('replied');
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(1);
    });

    it('preserves pending RPC on matching startedAtMs and sourceWindow re-hydration', () => {
      service.registerFrame(dummyWindow);
      const startedAt = Date.now();
      const first = service.registerRpc({
        functionCallId: 'call-same',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'once'},
        sourceWindow: dummyWindow,
        startedAtMs: startedAt,
      });

      const rehydrated = service.registerRpc({
        functionCallId: 'call-same',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'once'},
        sourceWindow: dummyWindow,
        startedAtMs: startedAt,
      });

      expect(rehydrated).toBe(first);
      expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();
    });

    it('cancels existing pending RPC and notifies its sourceWindow when replaced by non-matching registration', () => {
      const windowA = {name: 'A'} as unknown as Window;
      const windowB = {name: 'B'} as unknown as Window;
      const now = Date.now();
      service.registerFrame(windowA);
      service.registerFrame(windowB);

      service.registerRpc({
        functionCallId: 'call-dup',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'first'},
        sourceWindow: windowA,
        startedAtMs: now,
      });

      const replacement = service.registerRpc({
        functionCallId: 'call-dup',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'second'},
        sourceWindow: windowB,
        startedAtMs: now + 1000,
      });

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-dup',
              error: {
                code: 'CANCELLED',
                message: 'Agent function call was superseded by a duplicate functionCallId.',
              },
            },
          },
        ],
        windowA,
      );
      expect(replacement.sourceWindow).toBe(windowB);
      expect(replacement.status).toBe('pending');
    });

    it('replaces an already-settled RPC when re-invoked with a new timestamp or window', () => {
      const now = Date.now();
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-reuse',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'once'},
        sourceWindow: dummyWindow,
        startedAtMs: now,
      });
      expect(service.replyValue('call-reuse', {ok: true})).toBe(true);

      const fresh = service.registerRpc({
        functionCallId: 'call-reuse',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'twice'},
        sourceWindow: dummyWindow,
        startedAtMs: now + 4000,
      });

      expect(fresh.status).toBe('pending');
      expect(fresh.startedAtMs).toBe(now + 4000);
      expect(service.getRpc('call-reuse')?.status).toBe('pending');
    });

    it('cancels pending calls silently via cancelPendingCalls without posting to navigated window', () => {
      vi.advanceTimersByTime(0);
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-nav',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'waitReply'},
        sourceWindow: dummyWindow,
      });

      service.cancelPendingCalls(dummyWindow);
      expect(service.getRpc('call-nav')?.status).toBe('rejected');
      expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();

      vi.advanceTimersByTime(35000);
      expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();
    });
  });

  describe('Replying with Error', () => {
    it('replies with specified error code and message', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-err-1',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'authCheck'},
        sourceWindow: dummyWindow,
      });

      const success = service.replyError('call-err-1', 'PERMISSION_DENIED', 'Forbidden resource');
      expect(success).toBe(true);
      expect(service.getRpc('call-err-1')?.status).toBe('rejected');

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-err-1',
              error: {
                code: 'PERMISSION_DENIED',
                message: 'Forbidden resource',
              },
            },
          },
        ],
        dummyWindow,
      );
    });

    it('defaults code and message when blank or omitted', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-err-default',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'cancelCheck'},
        sourceWindow: dummyWindow,
      });

      service.replyError('call-err-default');

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-err-default',
              error: {
                code: 'USER_REJECTED',
                message: 'Agent function call rejected by user.',
              },
            },
          },
        ],
        dummyWindow,
      );
    });
  });

  describe('Evict & ClearAll & ngOnDestroy', () => {
    it('evicts pending calls past cap, cancelling timer and sending eviction error', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-evict',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'oldCall'},
        sourceWindow: dummyWindow,
      });

      service.evict('call-evict');
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledWith(
        [
          {
            version: '1.0',
            agentFunctionResponse: {
              functionCallId: 'call-evict',
              error: {
                code: 'EVICTED',
                message: 'Agent function call was evicted from debug logs.',
              },
            },
          },
        ],
        dummyWindow,
      );

      vi.advanceTimersByTime(35000);
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(1);
    });

    it('clears all pending RPCs on clearAll()', () => {
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-clear-1',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'op1'},
        sourceWindow: dummyWindow,
      });
      service.registerRpc({
        functionCallId: 'call-clear-2',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'op2'},
        sourceWindow: dummyWindow,
      });

      service.clearAll();

      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(2);
      expect(service.getRpc('call-clear-1')).toBeUndefined();
      expect(service.getRpc('call-clear-2')).toBeUndefined();

      vi.advanceTimersByTime(35000);
      expect(mockHostComm.sendRenderA2UI).toHaveBeenCalledTimes(2);
    });

    it('ignores replayed registerRpc calls whose startedAtMs < clearedAtMs while keeping same-ms calls', () => {
      vi.setSystemTime(10_000);
      service.registerFrame(dummyWindow);
      service.registerRpc({
        functionCallId: 'call-before-clear',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'op1'},
        sourceWindow: dummyWindow,
        startedAtMs: 9_500,
      });

      service.clearAll(10_000);
      mockHostComm.sendRenderA2UI.mockClear();

      // Replaying history strictly before clearedAtMs (10_000) must be ignored
      const replayedBefore = service.registerRpc({
        functionCallId: 'call-before-clear',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'op1'},
        sourceWindow: dummyWindow,
        startedAtMs: 9_999,
      });

      expect(replayedBefore.status).toBe('rejected');
      expect(service.getRpc('call-before-clear')).toBeUndefined();
      expect(mockHostComm.sendRenderA2UI).not.toHaveBeenCalled();

      // Calls stamped in the exact same millisecond as clearedAtMs (10_000) or later register normally
      const sameMs = service.registerRpc({
        functionCallId: 'call-at-clear',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'op2'},
        sourceWindow: dummyWindow,
        startedAtMs: 10_000,
      });
      const fresh = service.registerRpc({
        functionCallId: 'call-after-clear',
        surfaceId: 'surf-1',
        callFunction: {['@call']: 'op3'},
        sourceWindow: dummyWindow,
        startedAtMs: 10_001,
      });
      expect(sameMs.status).toBe('pending');
      expect(fresh.status).toBe('pending');
      expect(service.getRpc('call-at-clear')?.status).toBe('pending');
      expect(service.getRpc('call-after-clear')?.status).toBe('pending');
    });
  });
});
