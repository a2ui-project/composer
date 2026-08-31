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

import {Injectable} from '@angular/core';
import {generateUuid as uuid} from '../../utils/uuid';
import {
  A2aMessage,
  A2aTransport,
  A2aTransportOptions,
  AgentCard,
  TERMINAL_TASK_STATES,
  TaskStatusUpdateEvent,
} from './a2a-types';

/**
 * Standard open-source 3P implementation of A2aTransport over HTTP REST and SSE streaming.
 */
@Injectable({
  providedIn: 'root',
})
export class Standard3pA2aTransport implements A2aTransport {
  private readonly endpointCache = new Map<string, string>();

  private validateAndNormalizeBaseUrl(baseUrl: string): URL {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error('Invalid A2A base URL: base URL must be a non-empty string.');
    }
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(
          `Invalid A2A base URL protocol: expected http: or https:, got ${url.protocol}`,
        );
      }
      return url;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('Invalid A2A')) {
        throw err;
      }
      throw new Error(`Invalid A2A base URL: ${baseUrl}`);
    }
  }

  private resolveUrl(baseUrl: string, relativePath: string): string {
    const base = this.validateAndNormalizeBaseUrl(baseUrl);
    const cleanPath = relativePath.replace(/^\/+/, '');
    const cleanBasePath = base.pathname.replace(/\/+$/, '');
    if (!cleanPath) {
      return `${base.origin}${cleanBasePath || '/'}`;
    }
    const basePath = cleanBasePath ? `${cleanBasePath}/` : '/';
    return new URL(cleanPath, `${base.origin}${basePath}`).toString();
  }

  /**
   * Discovers and retrieves the AgentCard from the target standard A2A endpoint.
   * Iterates through well-known discovery paths sequentially and unwraps the agent card payload.
   *
   * @param baseUrl Target agent root URL.
   * @param options Execution options (abortSignal, headers).
   * @returns Parsed AgentCard.
   */
  async getAgentCard(baseUrl: string, options?: A2aTransportOptions): Promise<AgentCard> {
    this.validateAndNormalizeBaseUrl(baseUrl);

    const wellKnownEndpoints = [
      this.resolveUrl(baseUrl, '.well-known/agent-card.json'),
      this.resolveUrl(baseUrl, '.well-known/agent.json'),
      this.resolveUrl(baseUrl, 'agent/card'),
      this.resolveUrl(baseUrl, ''),
    ];

    let lastError: Error | null = null;
    const signal = options?.abortSignal || AbortSignal.timeout(10_000);

    for (const endpoint of wellKnownEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(options?.headers || {}),
          },
          signal,
        });
        if (response.ok) {
          const data = (await response.json()) as ({agentCard?: AgentCard} & AgentCard) | null;
          const card = data?.agentCard || data;
          if (card && typeof card === 'object' && typeof card.name === 'string') {
            if (card.url && typeof card.url === 'string') {
              this.endpointCache.set(baseUrl, card.url);
            }
            return card;
          }
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (signal.aborted) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error(`Failed to retrieve AgentCard from A2A service at ${baseUrl}`);
  }

  /**
   * Streams conversational message turns and task updates from the target A2A server.
   *
   * @param baseUrl Target agent root URL.
   * @param message Outgoing A2A message turn.
   * @param options Execution options (tenantId, taskId, abortSignal).
   * @returns Async iterable of TaskStatusUpdateEvents.
   */
  async *sendMessageStream(
    baseUrl: string,
    message: A2aMessage,
    options?: A2aTransportOptions,
  ): AsyncIterable<TaskStatusUpdateEvent> {
    this.validateAndNormalizeBaseUrl(baseUrl);
    const messageId = message.messageId || uuid();
    const taskId = options?.taskId || message.taskId;
    const contextId = options?.contextId || message.contextId;

    const supportedExtensions = [
      'https://a2ui.org/a2a-extension/a2ui/v0.9',
      'https://a2ui.org/a2a-extension/a2ui/v0.8',
    ];

    // Normalize message parts to standard A2A schema (explicitly tagging text and data parts with kind)
    const messageObj: Record<string, unknown> = {
      messageId,
      role: message.role || 'user',
      parts: message.parts?.map(p => {
        if (p.text !== undefined) return {kind: 'text', text: p.text};
        if (p.data !== undefined) return {kind: 'data', data: p.data};
        return p;
      }) || [{kind: 'text', text: ''}],
      extensions: supportedExtensions,
      ...(contextId ? {contextId} : {}),
      ...(taskId ? {taskId} : {}),
    };

    const configuration = {
      capabilities: {
        extensions: supportedExtensions.map(uri => ({uri})),
      },
      extensions: supportedExtensions,
      acceptedOutputModes: ['text/plain', 'application/json', 'application/json+a2ui'],
    };

    // 1. Standard A2A JSON-RPC 2.0 envelope (preferred specification format for `POST /` and `POST /jsonrpc`).
    const jsonRpcPayload = {
      jsonrpc: '2.0',
      id: uuid(),
      method: 'message/stream',
      params: {
        message: messageObj,
        configuration,
        ...(contextId ? {contextId} : {}),
        ...(taskId ? {taskId} : {}),
        ...(options?.tenantId ? {tenant: options.tenantId} : {}),
      },
    };

    // 2. Flat REST payload for backwards compatibility with earlier/custom community sample agents
    // that expose dedicated REST streaming endpoints (e.g. `/sendStreaming`, `/v1/tasks/sendStreaming`).
    const restPayload = {
      ...(options?.tenantId ? {tenant: options.tenantId} : {}),
      ...(taskId ? {taskId} : {}),
      ...(contextId ? {contextId} : {}),
      configuration,
      message: messageObj,
    };

    const cachedEndpoint = this.endpointCache.get(baseUrl);
    const candidates: Array<{url: string; body: unknown}> = cachedEndpoint
      ? [{url: cachedEndpoint, body: jsonRpcPayload}]
      : [
          {url: this.resolveUrl(baseUrl, ''), body: jsonRpcPayload},
          {url: this.resolveUrl(baseUrl, 'jsonrpc'), body: jsonRpcPayload},
          {url: this.resolveUrl(baseUrl, 'sendStreaming'), body: restPayload},
          {url: this.resolveUrl(baseUrl, 'v1/tasks/sendStreaming'), body: restPayload},
          {url: this.resolveUrl(baseUrl, 'tasks/sendStreaming'), body: restPayload},
          {url: this.resolveUrl(baseUrl, 'SendStreamingMessage'), body: restPayload},
          {url: this.resolveUrl(baseUrl, 'message:sendStreaming'), body: restPayload},
        ];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/json',
      ...(options?.tenantId ? {'X-A2A-Tenant': options.tenantId} : {}),
      ...(options?.headers || {}),
    };

    let response: Response | null = null;
    let lastError: Error | null = null;

    // Iterate through candidates until an endpoint successfully accepts the connection (200 OK)
    for (const candidate of candidates) {
      let res: Response;
      try {
        res = await fetch(candidate.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(candidate.body),
          signal: options?.abortSignal,
        });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (options?.abortSignal?.aborted) {
          throw lastError;
        }
        continue;
      }

      if (res.ok) {
        response = res;
        this.endpointCache.set(baseUrl, candidate.url);
        break;
      }

      // If the endpoint failed with a non-routing error (e.g. 500 Server Error, 401 Unauthorized),
      // throw immediately rather than trying other endpoints that would fail identically.
      if (res.status !== 404 && res.status !== 405) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`A2A Service error: ${res.status} ${res.statusText}. ${errorText}`);
      }
    }

    if (!response || !response.ok) {
      throw lastError || new Error(`Failed to connect to A2A streaming endpoint at ${baseUrl}`);
    }

    // Parse and yield incoming Server-Sent Events stream chunks
    if (response.body) {
      yield* this.parseSseStream(response.body);
    }
  }

  /**
   * Dispatches a user interactive action (e.g. button click or form submit from an A2UI surface)
   * back to the active A2A agent task.
   *
   * @param baseUrl Target agent root URL.
   * @param taskId Active task identifier.
   * @param action Action payload from preview bridge.
   * @param options Execution options.
   * @returns Async iterable of TaskStatusUpdateEvents.
   */
  async *sendActionStream(
    baseUrl: string,
    taskId: string,
    action: unknown,
    options?: A2aTransportOptions,
  ): AsyncIterable<TaskStatusUpdateEvent> {
    // Encapsulate the UI action inside a standard A2A data part with `a2ui_action` metadata
    const actionMessage: A2aMessage = {
      role: 'user',
      taskId,
      parts: [
        {
          data: {
            action,
          },
          metadata: {
            type: 'a2ui_action',
          },
        },
      ],
    };

    yield* this.sendMessageStream(baseUrl, actionMessage, {
      ...options,
      taskId,
    });
  }

  /**
   * Parses standard Server-Sent Events (SSE) stream buffer into TaskStatusUpdateEvent objects.
   * Handles chunk buffering across byte boundaries, JSON-RPC unwrapping, error detection,
   * and terminal task state termination.
   *
   * @param body Readable stream from fetch response.
   * @returns Async generator yielding parsed TaskStatusUpdateEvents.
   */
  private async *parseSseStream(
    body: ReadableStream<Uint8Array>,
  ): AsyncIterable<TaskStatusUpdateEvent> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    /**
     * Generator helper that parses raw SSE blocks (`\n\n` delimited), extracts `data:` lines,
     * yields deserialized events, and signals when a terminal state is encountered.
     */
    const processBlocks = function* (
      rawBlocks: string[],
    ): Generator<TaskStatusUpdateEvent, boolean, void> {
      for (const block of rawBlocks) {
        const lines = block.split('\n');
        const dataLines: string[] = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const rawData = trimmed.slice(5).trim();
            if (rawData === '[DONE]') {
              return true;
            }
            if (rawData) {
              dataLines.push(rawData);
            }
          }
        }

        if (dataLines.length === 0) {
          continue;
        }

        const combinedData = dataLines.join('\n');
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(combinedData) as Record<string, unknown>;
        } catch (err: unknown) {
          console.warn(
            'Failed to parse A2A SSE data chunk:',
            combinedData,
            err instanceof Error ? err.message : String(err),
          );
          continue;
        }

        // Check for JSON-RPC error payloads returned inside the SSE stream
        if (parsed['error']) {
          const errObj = parsed['error'] as {message?: string; code?: number};
          throw new Error(
            `A2A Agent error [${errObj.code || 'unknown'}]: ${errObj.message || JSON.stringify(errObj)}`,
          );
        }

        // Unwrap JSON-RPC result or accept root event object directly
        const eventData = (parsed['result'] || parsed) as TaskStatusUpdateEvent;
        yield eventData;

        // Check if the event marks the task as complete/failed/cancelled
        const statusState =
          typeof eventData.status === 'object' && eventData.status !== null
            ? (eventData.status.state || '').toLowerCase()
            : typeof eventData.status === 'string'
              ? eventData.status.toLowerCase()
              : '';

        if ((eventData as {final?: boolean}).final || TERMINAL_TASK_STATES.has(statusState)) {
          return true;
        }
      }
      return false;
    };

    try {
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;

        // Decode incoming chunk and normalize newlines
        const chunkText = decoder
          .decode(value, {stream: true})
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n');
        buffer += chunkText;

        // Split on double-newline boundaries (SSE standard event separator)
        const blocks = buffer.split('\n\n');
        // The last segment might be an incomplete event chunk; keep it in the buffer
        buffer = blocks.pop() || '';

        const shouldStop = yield* processBlocks(blocks);
        if (shouldStop) {
          return;
        }
      }

      // Flush remaining multi-byte sequences
      const trailing = decoder.decode().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      buffer += trailing;

      // Flush any remaining buffered content if the stream closed
      if (buffer.trim()) {
        yield* processBlocks([buffer]);
      }
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }
}
