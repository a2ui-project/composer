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

import {McpRequestPayload, McpResponsePayload} from '../bridge-message.js';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Proxies MCP `callTool` requests from inside the preview iframe to the parent shell
 * via postMessage (`MCP_REQUEST` / `MCP_RESPONSE`).
 */
export class IframeMcpClient {
  private pendingRequests = new Map<string, PendingRequest>();

  constructor(
    private readonly sendMcpRequest: (payload: McpRequestPayload) => void,
    private readonly timeoutMs = 30000,
  ) {}

  async callTool(params: {name: string; arguments?: Record<string, unknown>}): Promise<unknown> {
    const requestId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `mcp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`MCP tool call "${params.name}" timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      this.pendingRequests.set(requestId, {resolve, reject, timer});

      this.sendMcpRequest({
        requestId,
        toolName: params.name,
        args: params.arguments ?? {},
      });
    });
  }

  handleResponse(payload: McpResponsePayload): void {
    const pending = this.pendingRequests.get(payload.requestId);
    if (!pending) {
      return;
    }
    clearTimeout(pending.timer);
    this.pendingRequests.delete(payload.requestId);

    if (payload.error) {
      pending.reject(new Error(payload.error));
    } else {
      pending.resolve(payload.result);
    }
  }
}
