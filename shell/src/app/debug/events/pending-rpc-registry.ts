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

import {Injectable, inject, OnDestroy, signal} from '@angular/core';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {stripPrototypePollutionKeys} from '../../shell/cross-frame-validator/wire-version-validator';

/** Lifecycle status for a pending agent function invocation */
export type PendingRpcStatus = 'pending' | 'replied' | 'rejected' | 'timed_out';

/**
 * Structured record tracking a pending callAgentFunction invocation.
 */
export declare interface PendingRpcEntry {
  functionCallId: string;
  surfaceId: string;
  callFunction: unknown;
  sourceWindow: Window;
  startedAtMs: number;
  deadlineMs: number;
  status: PendingRpcStatus;
  timerId?: ReturnType<typeof setTimeout>;
  value?: unknown;
  error?: {code: string; message: string};
}

/** Parameters required to register a new pending RPC call */
export declare interface RegisterRpcParams {
  functionCallId: string;
  surfaceId: string;
  callFunction: unknown;
  sourceWindow: Window;
  startedAtMs?: number;
}

/** Dynamic resolver callback returning currently active workspace preview frame window(s) */
export type WorkspaceFrameResolver = () => (Window | null | undefined)[];

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Service managing pending v1.0 callAgentFunction invocations, 30s timeout deadlines,
 * deterministic timer cancellations, and user-initiated replies from the Debug Events tab.
 */
@Injectable({
  providedIn: 'root',
})
export class PendingRpcRegistry implements OnDestroy {
  private readonly hostCommunication = inject(HostCommunication);

  private readonly registeredFrames = new Set<Window>();
  private readonly pendingCalls = new Map<string, PendingRpcEntry>();
  private workspaceFrameResolver: WorkspaceFrameResolver | null = null;

  private readonly _stateVersion = signal<number>(0);
  /** Reactive signal tracking the latest state change for fine-grained UI updates */
  readonly stateVersion = this._stateVersion.asReadonly();

  /**
   * Configures a dynamic resolver returning the live workspace preview frame contentWindow(s).
   * Ensures order-independent frame resolution across async dockview mounts, stub iframes,
   * and renderer URL switches.
   */
  setWorkspaceFrameResolver(resolver: WorkspaceFrameResolver | null): void {
    this.workspaceFrameResolver = resolver;
  }

  /**
   * Registers a workspace preview iframe window for callAgentFunction interception.
   * Only calls from registered frames are tracked by this service.
   */
  registerFrame(win: Window): void {
    this.registeredFrames.add(win);
  }

  /**
   * Unregisters a workspace preview iframe window, cancelling and rejecting
   * any unresolved pending calls that originated from that window.
   */
  unregisterFrame(win: Window): void {
    this.registeredFrames.delete(win);

    for (const [functionCallId, entry] of this.pendingCalls.entries()) {
      if (entry.sourceWindow === win && entry.status === 'pending') {
        this.cancelTimer(entry);
        entry.status = 'rejected';
        entry.error = {
          code: 'WINDOW_UNREGISTERED',
          message: 'Originating workspace frame was unregistered.',
        };
        this.sendWireResponse(win, functionCallId, undefined, entry.error);
      }
    }
    this.bumpState();
  }

  /**
   * Alias for unregisterFrame for semantic compatibility.
   */
  unregisterWindow(win: Window): void {
    this.unregisterFrame(win);
  }

  /**
   * Determines whether the given window belongs to a registered workspace preview frame.
   * Checks explicitly registered frames first, then queries the workspace frame resolver if set.
   */
  isRegisteredFrame(win: Window | null | undefined): boolean {
    if (!win) {
      return false;
    }
    if (this.registeredFrames.has(win)) {
      return true;
    }
    if (this.workspaceFrameResolver) {
      try {
        const resolved = this.workspaceFrameResolver();
        if (Array.isArray(resolved)) {
          for (const frameWin of resolved) {
            if (frameWin && frameWin === win) {
              return true;
            }
          }
        }
      } catch {
        // Safe fallback if resolver throws
      }
    }
    return false;
  }

  /**
   * Registers a new pending RPC call from a registered guest frame, scheduling
   * an automatic 30s timeout.
   */
  registerRpc(params: RegisterRpcParams): PendingRpcEntry {
    const startedAtMs = params.startedAtMs ?? Date.now();
    const deadlineMs = startedAtMs + DEFAULT_TIMEOUT_MS;

    const existing = this.pendingCalls.get(params.functionCallId);
    if (existing) {
      if (existing.status !== 'pending') {
        return existing;
      }
      this.cancelTimer(existing);
    }

    const entry: PendingRpcEntry = {
      functionCallId: params.functionCallId,
      surfaceId: params.surfaceId,
      callFunction: params.callFunction,
      sourceWindow: params.sourceWindow,
      startedAtMs,
      deadlineMs,
      status: 'pending',
    };

    const remaining = Math.max(0, deadlineMs - Date.now());
    if (remaining === 0) {
      entry.status = 'timed_out';
      entry.error = {
        code: 'AGENT_FUNCTION_TIMEOUT',
        message: 'Agent function call timed out after 30s in Composer workspace.',
      };
      this.sendWireResponse(params.sourceWindow, params.functionCallId, undefined, entry.error);
    } else {
      entry.timerId = setTimeout(() => {
        this.handleTimeout(params.functionCallId);
      }, remaining);
    }

    this.pendingCalls.set(params.functionCallId, entry);
    this.bumpState();
    return entry;
  }

  /**
   * Retrieves a pending RPC entry by functionCallId.
   */
  getRpc(functionCallId: string): PendingRpcEntry | undefined {
    return this.pendingCalls.get(functionCallId);
  }

  /**
   * Computes the accurate remaining countdown milliseconds for a functionCallId.
   */
  getRemainingMs(functionCallId: string, nowMs: number = Date.now()): number {
    const entry = this.pendingCalls.get(functionCallId);
    if (!entry || entry.status !== 'pending') {
      return 0;
    }
    return Math.max(0, entry.deadlineMs - nowMs);
  }

  /**
   * Resolves a pending agent function call with a success value.
   */
  replyValue(functionCallId: string, value: unknown): boolean {
    const entry = this.pendingCalls.get(functionCallId);
    if (!entry || entry.status !== 'pending') {
      return false;
    }

    this.cancelTimer(entry);
    const sanitizedValue = stripPrototypePollutionKeys(value);
    entry.status = 'replied';
    entry.value = sanitizedValue;

    this.sendWireResponse(entry.sourceWindow, functionCallId, sanitizedValue, undefined);
    this.bumpState();
    return true;
  }

  /**
   * Resolves a pending agent function call with an error response.
   */
  replyError(functionCallId: string, code?: string, message?: string): boolean {
    const entry = this.pendingCalls.get(functionCallId);
    if (!entry || entry.status !== 'pending') {
      return false;
    }

    this.cancelTimer(entry);
    const resolvedCode = code?.trim() || 'USER_REJECTED';
    const resolvedMessage = message?.trim() || 'Agent function call rejected by user.';

    entry.status = 'rejected';
    entry.error = {
      code: resolvedCode,
      message: resolvedMessage,
    };

    this.sendWireResponse(entry.sourceWindow, functionCallId, undefined, entry.error);
    this.bumpState();
    return true;
  }

  /**
   * Evicts an entry from the registry (e.g. when the Events log exceeds 100 rows).
   */
  evict(functionCallId: string): void {
    const entry = this.pendingCalls.get(functionCallId);
    if (!entry) {
      return;
    }

    if (entry.status === 'pending') {
      this.cancelTimer(entry);
      entry.status = 'rejected';
      entry.error = {
        code: 'EVICTED',
        message: 'Agent function call was evicted from debug logs.',
      };
      this.sendWireResponse(entry.sourceWindow, functionCallId, undefined, entry.error);
    }
    this.pendingCalls.delete(functionCallId);
    this.bumpState();
  }

  /**
   * Clears all entries and cancels all active timers (e.g. when Events.clearLogs() is called).
   */
  clearAll(): void {
    for (const [functionCallId, entry] of this.pendingCalls.entries()) {
      if (entry.status === 'pending') {
        this.cancelTimer(entry);
        entry.status = 'rejected';
        entry.error = {
          code: 'CANCELLED',
          message: 'Agent function call was cleared from debug logs.',
        };
        this.sendWireResponse(entry.sourceWindow, functionCallId, undefined, entry.error);
      }
    }
    this.pendingCalls.clear();
    this.bumpState();
  }

  ngOnDestroy(): void {
    for (const entry of this.pendingCalls.values()) {
      this.cancelTimer(entry);
    }
    this.pendingCalls.clear();
    this.registeredFrames.clear();
    this.workspaceFrameResolver = null;
  }

  private handleTimeout(functionCallId: string): void {
    const entry = this.pendingCalls.get(functionCallId);
    if (!entry || entry.status !== 'pending') {
      return;
    }

    this.cancelTimer(entry);
    entry.status = 'timed_out';
    entry.error = {
      code: 'AGENT_FUNCTION_TIMEOUT',
      message: 'Agent function call timed out after 30s in Composer workspace.',
    };

    this.sendWireResponse(entry.sourceWindow, functionCallId, undefined, entry.error);
    this.bumpState();
  }

  private cancelTimer(entry: PendingRpcEntry): void {
    if (entry.timerId !== undefined) {
      clearTimeout(entry.timerId);
      entry.timerId = undefined;
    }
  }

  private sendWireResponse(
    sourceWindow: Window,
    functionCallId: string,
    value?: unknown,
    error?: {code: string; message: string},
  ): void {
    const responseBody: Record<string, unknown> = {
      functionCallId,
    };
    if (error) {
      responseBody['error'] = error;
    } else {
      responseBody['value'] = value;
    }

    const payload = [
      {
        version: '1.0',
        agentFunctionResponse: responseBody,
      },
    ];

    this.hostCommunication.sendRenderA2UI(payload, sourceWindow);
  }

  private bumpState(): void {
    this._stateVersion.update(v => v + 1);
  }
}
