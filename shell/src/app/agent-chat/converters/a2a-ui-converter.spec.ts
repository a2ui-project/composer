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

import {describe, it, expect} from 'vitest';
import {A2aMessage, AgentCard, TaskStatusUpdateEvent} from '../../chat/a2a/a2a-types';
import {
  a2aCardToUiAgentInfo,
  createErrorEvent,
  createReceivedEvent,
  createSentActionEvent,
  createSentMessageEvent,
  DEFAULT_A2A_ICON_URL,
  parseA2aStreamEvent,
} from './a2a-ui-converter';

describe('A2aUiConverter', () => {
  describe('a2aCardToUiAgentInfo', () => {
    it('converts full AgentCard to UiAgentInfo with derived sample prompts', () => {
      const card: AgentCard = {
        name: 'Weather Agent',
        description: 'Provides weather info',
        version: '1.2.0',
        iconUrl: 'http://example.com/icon.png',
        skills: [
          {id: 'forecast', name: 'Weather Forecast'},
          {id: 'alerts', name: 'Severe Weather Alerts'},
        ],
      };

      const info = a2aCardToUiAgentInfo(card, 'http://localhost:8080');
      expect(info.name).toBe('Weather Agent');
      expect(info.description).toBe('Provides weather info');
      expect(info.version).toBe('1.2.0');
      expect(info.endpoint).toBe('http://localhost:8080');
      expect(info.iconUrl).toBe('http://example.com/icon.png');
      expect(info.samplePrompts).toEqual([
        'Help me with Weather Forecast',
        'Help me with Severe Weather Alerts',
      ]);
    });

    it('uses samplePrompts directly if provided on card', () => {
      const card: AgentCard = {
        name: 'Direct Agent',
        samplePrompts: ['Prompt 1', 'Prompt 2'],
      };
      const info = a2aCardToUiAgentInfo(card, 'http://localhost:8080');
      expect(info.samplePrompts).toEqual(['Prompt 1', 'Prompt 2']);
    });

    it('handles null card and provides defaults', () => {
      const info = a2aCardToUiAgentInfo(null, null);
      expect(info.name).toBe('A2A Agent');
      expect(info.iconUrl).toBe(DEFAULT_A2A_ICON_URL);
      expect(info.endpoint).toBe('');
      expect(info.samplePrompts?.length).toBeGreaterThan(0);
    });
  });

  describe('Inspector event creators', () => {
    it('creates sent message event', () => {
      const msg: A2aMessage = {
        role: 'user',
        parts: [{text: 'Hello world!'}],
      };
      const event = createSentMessageEvent(msg);
      expect(event.direction).toBe('sent');
      expect(event.summary).toContain('Sent [user]: Hello world!');
      expect(event.payload).toBe(msg);
    });

    it('creates sent action event', () => {
      const event = createSentActionEvent('task-123', {click: 'btn'});
      expect(event.direction).toBe('sent');
      expect(event.summary).toContain('Task task-123');
      expect(event.payload).toEqual({taskId: 'task-123', action: {click: 'btn'}});
    });

    it('creates received event for status update and message parts', () => {
      const evt: TaskStatusUpdateEvent = {
        taskId: 't-1',
        status: {state: 'COMPLETED'},
      };
      const event = createReceivedEvent(evt);
      expect(event.direction).toBe('received');
      expect(event.summary).toContain('Received [COMPLETED] (t-1)');

      const textEvt: TaskStatusUpdateEvent = {
        contextId: 'ctx-1',
        message: {role: 'agent', parts: [{text: 'Hello'}]},
      };
      expect(createReceivedEvent(textEvt).summary).toContain('Received Text Chunk');

      const dataEvt: TaskStatusUpdateEvent = {
        taskId: 't-2',
        message: {role: 'agent', parts: [{data: {a: 1}}]},
      };
      expect(createReceivedEvent(dataEvt).summary).toContain('Received A2UI Payload');
    });

    it('creates error event for standard Error and string error', () => {
      const err = new Error('Connection refused');
      const event = createErrorEvent(err);
      expect(event.direction).toBe('error');
      expect(event.summary).toContain('Connection refused');
      expect((event.payload as {message: string}).message).toBe('Connection refused');

      const strEvent = createErrorEvent('String error');
      expect(strEvent.summary).toContain('String error');
      expect(strEvent.payload).toBe('String error');
    });
  });

  describe('parseA2aStreamEvent', () => {
    it('parses text, thought, and a2ui data items', () => {
      const event: TaskStatusUpdateEvent = {
        taskId: 'task-stream-1',
        contextId: 'ctx-1',
        message: {
          role: 'agent',
          parts: [
            {metadata: {adk_thought: 'true'}, text: 'Thinking step...'},
            {thought: 'Direct thought...'},
            {text: 'Final text response'},
            {
              data: {
                data: JSON.stringify([{createSurface: {surfaceId: 's1', catalogId: 'c1'}}]),
              },
            },
          ],
        },
        status: 'COMPLETED',
      };

      const parsed = parseA2aStreamEvent(event);
      expect(parsed.taskId).toBe('task-stream-1');
      expect(parsed.contextId).toBe('ctx-1');
      expect(parsed.thoughtChunk).toContain('Thinking step...');
      expect(parsed.thoughtChunk).toContain('Direct thought...');
      expect(parsed.textChunk).toBe('Final text response');
      expect(parsed.a2uiItems.length).toBe(1);
      expect(parsed.isCompleted).toBe(true);
    });

    it('parses artifact data items in message parts and root event', () => {
      const event: TaskStatusUpdateEvent = {
        taskId: 'task-art',
        message: {
          role: 'agent',
          parts: [
            {
              artifact: {
                parts: [{data: {createSurface: {surfaceId: 's1', catalogId: 'c1'}}}],
              },
            },
          ],
        },
        artifact: {
          parts: [{data: [{createSurface: {surfaceId: 's2', catalogId: 'c2'}}]}],
        },
        status: {state: 'SUCCESS'},
      };

      const parsed = parseA2aStreamEvent(event);
      expect(parsed.a2uiItems.length).toBe(2);
      expect(parsed.isCompleted).toBe(true);
    });

    it('handles string status states and failure/cancellation', () => {
      const eventDone: TaskStatusUpdateEvent = {status: 'DONE'};
      expect(parseA2aStreamEvent(eventDone).isCompleted).toBe(true);

      const eventSuccess: TaskStatusUpdateEvent = {status: 'SUCCESS'};
      expect(parseA2aStreamEvent(eventSuccess).isCompleted).toBe(true);

      const eventFailed: TaskStatusUpdateEvent = {status: 'FAILED'};
      expect(parseA2aStreamEvent(eventFailed).isCompleted).toBe(true);

      const eventCancelled: TaskStatusUpdateEvent = {status: {state: 'CANCELLED'}};
      expect(parseA2aStreamEvent(eventCancelled).isCompleted).toBe(true);

      const eventOther: TaskStatusUpdateEvent = {status: 'IN_PROGRESS'};
      expect(parseA2aStreamEvent(eventOther).isCompleted).toBe(false);

      const eventNullStatus = parseA2aStreamEvent({});
      expect(eventNullStatus.isCompleted).toBe(false);
    });

    it('handles JSON-RPC result wrapping and string messages', () => {
      const wrapped = {
        result: {
          taskId: 't-wrapped',
          message: 'Direct string message',
          final: true,
        },
      };
      const parsed = parseA2aStreamEvent(wrapped);
      expect(parsed.taskId).toBe('t-wrapped');
      expect(parsed.textChunk).toBe('Direct string message');
      expect(parsed.isCompleted).toBe(true);
    });

    it('handles task/message kind payloads and metadata thought flags (string and boolean)', () => {
      const taskEvent = {
        kind: 'task',
        id: 't-kind-1',
        message: {
          role: 'agent',
          parts: [
            {metadata: {thought: 'true'}, text: 'Flagged thought'},
            {metadata: {adk_thought: true}, text: 'Boolean thought'},
            {kind: 'thought', thought: 'Kind thought'},
            {data: {createSurface: {surfaceId: 's3'}}},
          ],
        },
      };
      const parsed = parseA2aStreamEvent(taskEvent);
      expect(parsed.taskId).toBe('t-kind-1');
      expect(parsed.thoughtChunk).toContain('Flagged thought');
      expect(parsed.thoughtChunk).toContain('Boolean thought');
      expect(parsed.thoughtChunk).toContain('Kind thought');
      expect(parsed.a2uiItems.length).toBe(1);

      const msgEvent = {
        kind: 'message',
        role: 'agent',
        parts: [{text: 'Direct message payload'}],
      };
      const parsedMsg = parseA2aStreamEvent(msgEvent);
      expect(parsedMsg.textChunk).toBe('Direct message payload');
    });

    it('marks isCompleted true for terminal states including canceled and rejected', () => {
      for (const state of ['canceled', 'rejected', 'completed', 'failed']) {
        const evt = {
          taskId: 't-term',
          status: {state},
        };
        const parsed = parseA2aStreamEvent(evt);
        expect(parsed.isCompleted).toBe(true);
      }
    });

    it('handles non-array artifact parts', () => {
      const event = {
        artifact: {
          parts: [{data: {createSurface: {surfaceId: 's4'}}}],
        },
      };
      const parsed = parseA2aStreamEvent(event);
      expect(parsed.a2uiItems.length).toBe(1);
    });
  });

  describe('edge branch coverage for event creators and card converter', () => {
    it('handles fallback message summary when parts have no text', () => {
      const msg: A2aMessage = {
        role: 'user',
        parts: [{data: {a: 1}}],
      };
      const event = createSentMessageEvent(msg);
      expect(event.summary).toBe('Sent [user]: Message turn');
    });

    it('handles fallback taskId in action event', () => {
      const event = createSentActionEvent('', {click: true});
      expect(event.summary).toBe('Sent Action (Task active)');
    });

    it('handles card with skills without names', () => {
      const card: AgentCard = {
        name: 'Skill Agent',
        skills: [{id: 's1'}],
      };
      const info = a2aCardToUiAgentInfo(card, 'http://localhost');
      expect(info.samplePrompts?.length).toBeGreaterThan(0);
    });

    it('handles received event with status object missing state or string status', () => {
      const evt1: TaskStatusUpdateEvent = {
        taskId: 't-str',
        status: 'READY' as unknown as {state: string},
      };
      expect(createReceivedEvent(evt1).summary).toBe('Received [READY] (t-str)');

      const evt2: TaskStatusUpdateEvent = {
        taskId: 't-obj',
        status: {} as {state: string},
      };
      expect(createReceivedEvent(evt2).summary).toBe('Received [status] (t-obj)');
    });
  });
});
