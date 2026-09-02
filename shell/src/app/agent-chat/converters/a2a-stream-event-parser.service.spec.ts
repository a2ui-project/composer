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

import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {A2aStreamEventParser} from './a2a-stream-event-parser.service';
import {TaskStatusUpdateEvent} from '../../chat/a2a/a2a-types';

describe('A2aStreamEventParser', () => {
  let parser: A2aStreamEventParser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    parser = TestBed.inject(A2aStreamEventParser);
  });

  it('is created', () => {
    expect(parser).toBeTruthy();
  });

  it('parses plain text chunk from streaming event', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-1',
      contextId: 'ctx-1',
      message: {
        role: 'agent',
        parts: [{text: 'Hello, world!'}],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.taskId).toBe('task-1');
    expect(parsed.contextId).toBe('ctx-1');
    expect(parsed.textChunk).toBe('Hello, world!');
    expect(parsed.isCompleted).toBe(false);
  });

  it('extracts thought parts correctly', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-2',
      message: {
        role: 'agent',
        parts: [
          {text: 'Thinking deeply...', metadata: {adk_thought: true}},
          {text: 'Final response.'},
        ],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.thoughtChunk).toBe('Thinking deeply...');
    expect(parsed.textChunk).toBe('Final response.');
  });

  it('extracts embedded A2UI items from message data', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-3',
      message: {
        role: 'agent',
        parts: [
          {
            data: {
              createSurface: {surfaceId: 'surf-1', catalogId: 'cat-1'},
            },
          },
        ],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.a2uiItems.length).toBe(1);
    expect(parsed.a2uiItems[0].createSurface?.surfaceId).toBe('surf-1');
  });

  it('filters out non-A2UI data such as tool calls from a2uiItems and records them in toolCalls', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-tool',
      message: {
        role: 'agent',
        parts: [
          {
            data: {
              name: 'show_vacation_booking_form',
              args: {},
              id: 'call_3478204',
            },
          },
          {
            data: {
              createSurface: {surfaceId: 'surf-1', catalogId: 'cat-1'},
            },
          },
        ],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.a2uiItems.length).toBe(1);
    expect(parsed.a2uiItems[0].createSurface?.surfaceId).toBe('surf-1');
    expect(parsed.toolCalls?.length).toBe(1);
    expect(parsed.toolCalls?.[0].name).toBe('show_vacation_booking_form');
    expect(parsed.toolCalls?.[0].id).toBe('call_3478204');
  });

  it('detects terminal completed states', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-4',
      status: {state: 'completed'},
      final: true,
    };

    const parsed = parser.parse(event);
    expect(parsed.isCompleted).toBe(true);
  });

  it('unwraps JSON-RPC result wrappers', () => {
    const event = {
      result: {
        taskId: 'rpc-task-1',
        contextId: 'rpc-ctx-1',
        message: {
          role: 'agent',
          parts: [{text: 'RPC unwrapped text'}],
        },
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.taskId).toBe('rpc-task-1');
    expect(parsed.contextId).toBe('rpc-ctx-1');
    expect(parsed.textChunk).toBe('RPC unwrapped text');
  });

  it('extracts A2UI items from top-level artifact parts', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-5',
      artifact: {
        parts: [
          {
            data: [{createSurface: {surfaceId: 'art-surf-1'}}],
          },
        ],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.a2uiItems.length).toBe(1);
    expect(parsed.a2uiItems[0].createSurface?.surfaceId).toBe('art-surf-1');
  });

  it('unpacks stringified JSON payload envelopes', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-6',
      message: {
        role: 'agent',
        parts: [
          {
            data: {
              mimeType: 'application/json',
              data: JSON.stringify([{createSurface: {surfaceId: 'str-surf-1'}}]),
            },
          },
        ],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.a2uiItems.length).toBe(1);
    expect(parsed.a2uiItems[0].createSurface?.surfaceId).toBe('str-surf-1');
  });

  it('recognizes failed status and string status forms as terminal', () => {
    const failedEvent: TaskStatusUpdateEvent = {
      taskId: 'task-7',
      status: {state: 'failed'},
    };
    expect(parser.parse(failedEvent).isCompleted).toBe(true);

    const stringStatusEvent = {
      taskId: 'task-8',
      status: 'canceled',
    };
    expect(parser.parse(stringStatusEvent).isCompleted).toBe(true);
  });
});
