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

  it('recognizes v1.0 proto enum strings and integers as terminal states', () => {
    expect(
      parser.parse({
        taskId: 'task-v1-1',
        status: {state: 'TASK_STATE_COMPLETED'},
      }).isCompleted,
    ).toBe(true);

    expect(
      parser.parse({
        taskId: 'task-v1-2',
        status: {state: 3}, // 3 is completed
      }).isCompleted,
    ).toBe(true);

    expect(
      parser.parse({
        taskId: 'task-v1-3',
        status: {state: 'TASK_STATE_FAILED'},
      }).isCompleted,
    ).toBe(true);

    expect(
      parser.parse({
        taskId: 'task-v1-4',
        status: {state: 1}, // 1 is working -> not terminal
      }).isCompleted,
    ).toBe(false);
  });

  it('unwraps protobuf StreamResponse oneofs (task, statusUpdate, artifactUpdate, message)', () => {
    const taskEvent = {
      taskId: 'env-task-1',
      contextId: 'env-ctx-1',
      task: {
        id: 'nested-task-1',
        status: {state: 'working'},
      },
    };
    const parsedTask = parser.parse(taskEvent as unknown as TaskStatusUpdateEvent);
    expect(parsedTask.taskId).toBe('nested-task-1');
    expect(parsedTask.contextId).toBe('env-ctx-1');
    expect(parsedTask.isCompleted).toBe(false);

    const statusUpdateEvent = {
      taskId: 'env-task-2',
      statusUpdate: {
        status: {state: 'completed'},
      },
    };
    const parsedStatus = parser.parse(statusUpdateEvent as unknown as TaskStatusUpdateEvent);
    expect(parsedStatus.taskId).toBe('env-task-2');
    expect(parsedStatus.isCompleted).toBe(true);

    const artifactUpdateEvent = {
      taskId: 'env-task-3',
      artifactUpdate: {
        artifact: {
          parts: [{data: [{createSurface: {surfaceId: 'surf-art-oneof'}}]}],
        },
      },
    };
    const parsedArt = parser.parse(artifactUpdateEvent as unknown as TaskStatusUpdateEvent);
    expect(parsedArt.taskId).toBe('env-task-3');
    expect(parsedArt.a2uiItems.length).toBe(1);
    expect(parsedArt.a2uiItems[0].createSurface?.surfaceId).toBe('surf-art-oneof');

    const messageEvent = {
      taskId: 'env-task-4',
      message: {
        role: 'agent',
        parts: [{text: 'Oneof message'}],
      },
    };
    const parsedMsg = parser.parse(messageEvent as unknown as TaskStatusUpdateEvent);
    expect(parsedMsg.textChunk).toBe('Oneof message');
  });

  it('handles flat v1.0 and nested v0.3 multimedia parts', () => {
    // Flat v1.0 url
    const v1UrlEvent: TaskStatusUpdateEvent = {
      taskId: 'media-1',
      message: {
        role: 'agent',
        parts: [
          {
            url: 'https://example.com/photo.png',
            mediaType: 'image/png',
          },
        ],
      },
    };
    const parsedUrl = parser.parse(v1UrlEvent);
    expect(parsedUrl.textChunk).toContain('<img src="https://example.com/photo.png"');
    expect(parsedUrl.textChunk).toContain('class="media-image"');

    // Flat v1.0 raw base64
    const v1RawEvent: TaskStatusUpdateEvent = {
      taskId: 'media-2',
      message: {
        role: 'agent',
        parts: [
          {
            raw: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            media_type: 'image/png',
            filename: 'pixel.png',
          },
        ],
      },
    };
    const parsedRaw = parser.parse(v1RawEvent);
    expect(parsedRaw.textChunk).toContain('data:image/png;base64,');
    expect(parsedRaw.textChunk).toContain('alt="pixel.png"');

    // v0.3 file part with bytes
    const v03FileBytesEvent: TaskStatusUpdateEvent = {
      taskId: 'media-3',
      message: {
        role: 'agent',
        parts: [
          {
            file: {
              bytes: 'AQID',
              mimeType: 'audio/wav',
              name: 'sound.wav',
            },
          },
        ],
      },
    };
    const parsedAudio = parser.parse(v03FileBytesEvent);
    expect(parsedAudio.textChunk).toContain('<audio controls');
    expect(parsedAudio.textChunk).toContain('data:audio/wav;base64,AQID');

    // v0.3 file part with uri
    const v03FileUriEvent: TaskStatusUpdateEvent = {
      taskId: 'media-4',
      message: {
        role: 'agent',
        parts: [
          {
            file: {
              uri: 'https://example.com/video.mp4',
              mimeType: 'video/mp4',
            },
          },
        ],
      },
    };
    const parsedVideo = parser.parse(v03FileUriEvent);
    expect(parsedVideo.textChunk).toContain('<video controls');
    expect(parsedVideo.textChunk).toContain('src="https://example.com/video.mp4"');
  });

  it('processes plural artifacts array', () => {
    const event = {
      taskId: 'task-arts',
      artifacts: [
        {
          parts: [{data: [{createSurface: {surfaceId: 'art-1'}}]}],
        },
        {
          parts: [{data: [{createSurface: {surfaceId: 'art-2'}}]}],
        },
      ],
    };

    const parsed = parser.parse(event as unknown as TaskStatusUpdateEvent);
    expect(parsed.a2uiItems.length).toBe(2);
    expect(parsed.a2uiItems[0].createSurface?.surfaceId).toBe('art-1');
    expect(parsed.a2uiItems[1].createSurface?.surfaceId).toBe('art-2');
  });

  it('routes in-progress status text to thinking and leaves empty status silent', () => {
    const statusEvent: TaskStatusUpdateEvent = {
      taskId: 'task-status-fallback',
      status: {
        state: 'working',
        message: {parts: [{text: 'Working on your request...'}]},
      },
    };

    // Non-terminal status text belongs in the thinking panel, not the main
    // transcript, so it is surfaced as a thought chunk.
    const parsed = parser.parse(statusEvent);
    expect(parsed.textChunk).toBeUndefined();
    expect(parsed.thoughtChunk).toBe('Working on your request...');

    // When status has no message but has a state, textChunk remains undefined so status transitions are not rendered in chat
    const emptyStatusEvent: TaskStatusUpdateEvent = {
      taskId: 'task-status-empty',
      status: {
        state: 'TASK_STATE_WORKING',
      },
    };
    const parsedEmpty = parser.parse(emptyStatusEvent);
    expect(parsedEmpty.textChunk).toBeUndefined();
    expect(parsedEmpty.statusState).toBe('working');
  });

  it('safely handles null, undefined, or primitive events', () => {
    const parsedNull = parser.parse(null as unknown as TaskStatusUpdateEvent);
    expect(parsedNull.isCompleted).toBe(false);
    expect(parsedNull.a2uiItems).toEqual([]);

    const parsedString = parser.parse('invalid' as unknown as TaskStatusUpdateEvent);
    expect(parsedString.isCompleted).toBe(false);
    expect(parsedString.a2uiItems).toEqual([]);
  });

  it('detects completion from final or isCompleted flags', () => {
    const finalEvent = parser.parse({final: true});
    expect(finalEvent.isCompleted).toBe(true);

    const isCompletedEvent = parser.parse({isCompleted: true});
    expect(isCompletedEvent.isCompleted).toBe(true);

    const terminalStatusEvent = parser.parse({
      status: {state: 'TASK_STATE_COMPLETED'},
    });
    expect(terminalStatusEvent.isCompleted).toBe(true);
  });

  it('handles raw bytes file part', () => {
    const rawEvent = parser.parse({
      message: {
        parts: [
          {
            raw: 'SGVsbG8gV29ybGQ=',
            mediaType: 'text/plain',
            filename: 'hello.txt',
          },
        ],
      },
    });
    expect(rawEvent.textChunk).toContain('data:text/plain;base64,SGVsbG8gV29ybGQ=');
  });

  it('routes non-completed TASK_STATE_WORKING text to thoughtChunk without duplication', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-dup',
      contextId: 'ctx-dup',
      message: {
        role: 'ROLE_AGENT',
        parts: [{text: 'Hello, how can I help?'}],
      },
      status: {
        state: 'TASK_STATE_WORKING',
        message: {
          role: 'ROLE_AGENT',
          parts: [{text: 'Hello, how can I help?'}],
        },
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.thoughtChunk).toBe('Hello, how can I help?');
    expect(parsed.textChunk).toBeUndefined();
  });

  it('routes completed TASK_STATE_COMPLETED text to textChunk without duplication', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-comp-dup',
      contextId: 'ctx-comp-dup',
      message: {
        role: 'ROLE_AGENT',
        parts: [{text: 'Here is the final redlined contract.'}],
      },
      status: {
        state: 'TASK_STATE_COMPLETED',
        message: {
          role: 'ROLE_AGENT',
          parts: [{text: 'Here is the final redlined contract.'}],
        },
      },
      final: true,
    };

    const parsed = parser.parse(event);
    expect(parsed.textChunk).toBe('Here is the final redlined contract.');
    expect(parsed.thoughtChunk).toBeUndefined();
    expect(parsed.isCompleted).toBe(true);
  });

  it('routes echoed user prompt in TASK_STATE_SUBMITTED to thoughtChunk so agent does not duplicate user text on main canvas', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-user-echo',
      contextId: 'ctx-user-echo',
      message: {
        role: 'ROLE_USER',
        content: [{text: 'hi'}],
      },
      status: {
        state: 'TASK_STATE_SUBMITTED',
        message: {
          role: 'ROLE_USER',
          content: [{text: 'hi'}],
        },
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.textChunk).toBeUndefined();
    expect(parsed.thoughtChunk).toBe('hi');
  });

  it('filters out user messages with role user outside of task submission', () => {
    const event: TaskStatusUpdateEvent = {
      taskId: 'task-user-case',
      message: {
        role: 'user',
        parts: [{text: 'show me contracts'}],
      },
    };

    const parsed = parser.parse(event);
    expect(parsed.textChunk).toBeUndefined();
    expect(parsed.thoughtChunk).toBeUndefined();
  });
});
