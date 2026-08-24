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
import {A2aMessage, TaskStatusUpdateEvent} from './a2a-types';
import {Standard3pA2aTransport} from './standard-3p-a2a-transport';

describe('Standard3pA2aTransport', () => {
  let transport: Standard3pA2aTransport;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Standard3pA2aTransport],
    });
    transport = TestBed.inject(Standard3pA2aTransport);
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('discovers AgentCard via well-known paths and handles trailing slashes', async () => {
    const mockCard = {
      name: 'Standard 3P Agent',
      version: '1.0',
      capabilities: {streaming: true},
    };

    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === 'http://localhost:8000/.well-known/agent.json') {
        return new Response(JSON.stringify(mockCard), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        });
      }
      return new Response(null, {status: 404});
    });

    const card = await transport.getAgentCard('http://localhost:8000///');
    expect(card.name).toBe('Standard 3P Agent');
  });

  it('discovers AgentCard nested under agentCard property', async () => {
    const mockCard = {
      name: 'Nested Agent',
      version: '2.0',
    };

    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url === 'http://localhost:8000/.well-known/agent.json') {
        return new Response(JSON.stringify({agentCard: mockCard}), {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        });
      }
      return new Response(null, {status: 404});
    });

    const card = await transport.getAgentCard('http://localhost:8000');
    expect(card.name).toBe('Nested Agent');
  });

  it('throws error when AgentCard cannot be retrieved across all paths', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(null, {status: 404}));

    await expect(transport.getAgentCard('http://localhost:8000')).rejects.toThrow(
      'Failed to retrieve AgentCard',
    );
  });

  it('handles fetch exception when getting agent card', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(transport.getAgentCard('http://localhost:8000')).rejects.toThrow('Network error');
  });

  it('streams TaskStatusUpdateEvents over SSE with X-A2A-Tenant header and skips invalid json', async () => {
    let capturedHeaders: Record<string, string> = {};
    let capturedBody: unknown = null;

    const sseChunks = [
      'data:\n\n', // Empty line
      'data: invalid-json-block\n\n',
      'data: {"taskId": "task-1", "message": {"role": "agent", "parts": [{"text": "Hello standard"}]}}\n\n',
      'data: [DONE]\n\n',
    ].join('');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseChunks));
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === 'http://localhost:8000/') {
        capturedHeaders = init?.headers as Record<string, string>;
        capturedBody = JSON.parse(init?.body as string);
        return new Response(stream, {
          status: 200,
          headers: {'Content-Type': 'text/event-stream'},
        });
      }
      return new Response(null, {status: 404});
    });

    const message: A2aMessage = {
      role: 'user',
      parts: [{text: 'Hello'}],
    };

    const events: TaskStatusUpdateEvent[] = [];
    for await (const event of transport.sendMessageStream('http://localhost:8000', message, {
      tenantId: 'team_alpha',
      taskId: 'task-123',
    })) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(events[0].taskId).toBe('task-1');
    expect(capturedHeaders['X-A2A-Tenant']).toBe('team_alpha');
    expect(capturedBody).toMatchObject({
      jsonrpc: '2.0',
      method: 'message/stream',
      params: {
        tenant: 'team_alpha',
        taskId: 'task-123',
        message: {
          role: 'user',
          taskId: 'task-123',
        },
      },
    });
  });

  it('falls back to REST endpoint /sendStreaming when root endpoint is 404', async () => {
    let capturedBody: unknown = null;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"taskId": "task-rest", "final": true}\n\n'));
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url === 'http://localhost:8000/sendStreaming') {
        capturedBody = JSON.parse(init?.body as string);
        return new Response(stream, {
          status: 200,
          headers: {'Content-Type': 'text/event-stream'},
        });
      }
      return new Response(null, {status: 404});
    });

    const message: A2aMessage = {role: 'user', parts: [{text: 'Hello REST'}]};
    const events: TaskStatusUpdateEvent[] = [];
    for await (const event of transport.sendMessageStream('http://localhost:8000', message, {
      taskId: 'task-rest',
    })) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(capturedBody).toMatchObject({
      taskId: 'task-rest',
      message: {
        role: 'user',
        taskId: 'task-rest',
      },
    });
  });

  it('handles 500 server error response during streaming', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('Internal server error', {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    );

    const message: A2aMessage = {role: 'user', parts: [{text: 'Hi'}]};
    const stream = transport.sendMessageStream('http://localhost:8000', message);

    await expect(async () => {
      for await (const _ of stream) {
        // iterate
      }
    }).rejects.toThrow('A2A Service error: 500');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles abort signal when sending message stream', async () => {
    const controller = new AbortController();
    controller.abort();

    globalThis.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const message: A2aMessage = {role: 'user', parts: [{text: 'Hi'}]};
    const stream = transport.sendMessageStream('http://localhost:8000', message, {
      abortSignal: controller.signal,
    });

    await expect(async () => {
      for await (const _ of stream) {
        // iterate
      }
    }).rejects.toThrow();
  });

  it('dispatches interactive user actions via sendActionStream and terminates on final event', async () => {
    let capturedBody: unknown = null;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"jsonrpc": "2.0", "result": {"taskId": "task-action-1", "final": true, "message": {"role": "agent", "parts": [{"text": "Action handled"}]}}}\n\n',
          ),
        );
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return new Response(stream, {
        status: 200,
        headers: {'Content-Type': 'text/event-stream'},
      });
    });

    const action = {event: {name: 'clickButton', context: {item: 'buy'}}};
    const events: TaskStatusUpdateEvent[] = [];

    for await (const event of transport.sendActionStream(
      'http://localhost:8000',
      'task-action-1',
      action,
      {tenantId: 'beta'},
    )) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(capturedBody).toMatchObject({
      jsonrpc: '2.0',
      method: 'message/stream',
      params: {
        tenant: 'beta',
        taskId: 'task-action-1',
        message: {
          role: 'user',
          taskId: 'task-action-1',
        },
      },
    });
  });

  it('handles JSON-RPC error response in SSE stream', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"jsonrpc": "2.0", "error": {"code": -32603, "message": "Agent execution failure"}}\n\n',
          ),
        );
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {'Content-Type': 'text/event-stream'},
      }),
    );

    const message: A2aMessage = {role: 'user', parts: [{text: 'Hi'}]};
    const streamIter = transport.sendMessageStream('http://localhost:8000', message);

    await expect(async () => {
      for await (const _ of streamIter) {
        // iterate
      }
    }).rejects.toThrow('A2A Agent error [-32603]: Agent execution failure');
  });

  it('terminates stream when task status enters terminal state', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"taskId": "task-terminal", "status": {"state": "completed"}}\n\n' +
              'data: {"taskId": "task-terminal", "status": {"state": "working"}}\n\n',
          ),
        );
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {'Content-Type': 'text/event-stream'},
      }),
    );

    const message: A2aMessage = {role: 'user', parts: []};
    const events: TaskStatusUpdateEvent[] = [];

    for await (const event of transport.sendMessageStream('http://localhost:8000', message, {
      contextId: 'ctx-99',
    })) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(events[0].taskId).toBe('task-terminal');
  });

  it('terminates stream when task status is canceled', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"taskId": "task-canceled", "status": {"state": "canceled"}}\n\n' +
              'data: {"taskId": "task-canceled", "status": {"state": "working"}}\n\n',
          ),
        );
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {'Content-Type': 'text/event-stream'},
      }),
    );

    const message: A2aMessage = {role: 'user', parts: []};
    const events: TaskStatusUpdateEvent[] = [];

    for await (const event of transport.sendMessageStream('http://localhost:8000', message)) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(events[0].taskId).toBe('task-canceled');
  });

  it('concatenates multiline data lines in single SSE block', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"taskId":\n' + 'data: "multiline-1",\n' + 'data: "status": "completed"}\n\n',
          ),
        );
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {'Content-Type': 'text/event-stream'},
      }),
    );

    const message: A2aMessage = {role: 'user', parts: []};
    const events: TaskStatusUpdateEvent[] = [];

    for await (const event of transport.sendMessageStream('http://localhost:8000', message)) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(events[0].taskId).toBe('multiline-1');
  });

  it('rejects invalid or non-HTTP URLs in getAgentCard and sendMessageStream', async () => {
    await expect(transport.getAgentCard('javascript:alert(1)')).rejects.toThrow(
      'Invalid A2A base URL protocol',
    );
    await expect(transport.getAgentCard('')).rejects.toThrow('Invalid A2A base URL');

    const message: A2aMessage = {role: 'user', parts: []};
    await expect(async () => {
      for await (const _ of transport.sendMessageStream('javascript:alert(1)', message)) {
        // iterate
      }
    }).rejects.toThrow('Invalid A2A base URL protocol');
  });

  it('caches discovered endpoint and reuses it on subsequent calls', async () => {
    const encoder = new TextEncoder();
    const makeStream = () =>
      new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode('data: {"taskId": "cached-task", "status": "completed"}\n\n'),
          );
          controller.close();
        },
      });

    globalThis.fetch = vi
      .fn()
      // First attempt: root / fails with 404
      .mockResolvedValueOnce(new Response(null, {status: 404}))
      // Second attempt: /jsonrpc succeeds with 200
      .mockResolvedValueOnce(
        new Response(makeStream(), {
          status: 200,
          headers: {'Content-Type': 'text/event-stream'},
        }),
      )
      // Second turn: directly calls cached /jsonrpc endpoint
      .mockResolvedValueOnce(
        new Response(makeStream(), {
          status: 200,
          headers: {'Content-Type': 'text/event-stream'},
        }),
      );

    const message: A2aMessage = {role: 'user', parts: []};

    // First call: resolves endpoint
    for await (const _ of transport.sendMessageStream('http://localhost:8000', message)) {
      // iterate
    }
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    // Second call: directly hits cached endpoint
    for await (const _ of transport.sendMessageStream('http://localhost:8000', message)) {
      // iterate
    }
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    expect(globalThis.fetch).toHaveBeenLastCalledWith(
      'http://localhost:8000/jsonrpc',
      expect.anything(),
    );
  });

  it('flushes trailing SSE event if stream closes without trailing newlines', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode('data: {"taskId": "task-trailing", "message": {"parts": []}}'),
        );
        controller.close();
      },
    });

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: {'Content-Type': 'text/event-stream'},
      }),
    );

    const message: A2aMessage = {
      role: 'user',
      parts: [{custom: true} as unknown as {text: string}],
    };
    const events: TaskStatusUpdateEvent[] = [];

    for await (const event of transport.sendMessageStream('http://localhost:8000', message)) {
      events.push(event);
    }

    expect(events.length).toBe(1);
    expect(events[0].taskId).toBe('task-trailing');
  });
});
