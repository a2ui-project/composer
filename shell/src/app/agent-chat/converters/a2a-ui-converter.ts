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

import {A2aMessage, AgentCard, TaskStatusUpdateEvent} from '../../chat/a2a/a2a-types';
import {generateUuid as uuid} from '../../utils/uuid';
import {UiAgentInfo} from '../agent-header/types';
import {MessageInspectorEvent} from '../message-inspector/message-inspector-event';
import {A2aStreamEventParser, type ParsedA2aStreamEvent} from './a2a-stream-event-parser.service';

/**
 * Default fallback icon URL for A2A Agents.
 */
export const DEFAULT_A2A_ICON_URL =
  'https://fonts.gstatic.com/s/i/short-term/release/googlegsymbol/smart_toy/default/24px.svg';

/**
 * Brand asset icon URL for A2A Protocol representations.
 */
export const A2A_PROTOCOL_ICON_URL =
  'https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Untitled_design.original.png';

/**
 * Converts a raw A2A AgentCard and endpoint URL into a UI Agent Info model.
 */
export function a2aCardToUiAgentInfo(card: AgentCard | null, url: string | null): UiAgentInfo {
  const samplePrompts: string[] = [];

  if (card?.samplePrompts && Array.isArray(card.samplePrompts) && card.samplePrompts.length > 0) {
    samplePrompts.push(...card.samplePrompts);
  } else if (card?.skills) {
    for (const skill of card.skills) {
      if (skill.name) {
        samplePrompts.push(`Help me with ${skill.name}`);
      }
    }
  }

  if (samplePrompts.length === 0) {
    samplePrompts.push(
      'What capabilities do you offer?',
      'Show me a sample A2UI interactive dashboard.',
    );
  }

  return {
    name: card?.name || 'A2A Agent',
    description: card?.description || 'Connected autonomous Agent-to-Agent service endpoint.',
    version: card?.version || '',
    endpoint: url || '',
    iconUrl: card?.iconUrl || DEFAULT_A2A_ICON_URL,
    skills: card?.skills,
    capabilities: card?.capabilities,
    samplePrompts: samplePrompts.slice(0, 4),
  };
}

/**
 * Creates an InspectorEvent recording an outgoing message turn.
 */
export function createSentMessageEvent(msg: A2aMessage): MessageInspectorEvent {
  const textSummary = msg.parts?.find(p => p.text)?.text?.slice(0, 40) || 'Message turn';
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'sent',
    summary: `Sent [${msg.role}]: ${textSummary}`,
    payload: msg,
  };
}

/**
 * Creates an InspectorEvent recording an outgoing user UI action.
 */
export function createSentActionEvent(taskId: string, action: unknown): MessageInspectorEvent {
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'sent',
    summary: `Sent Action (Task ${taskId || 'active'})`,
    payload: {taskId, action},
  };
}

/**
 * Creates an InspectorEvent recording an incoming streaming event chunk.
 */
export function createReceivedEvent(event: TaskStatusUpdateEvent): MessageInspectorEvent {
  const taskId = event.taskId || event.contextId || 'event';
  let summary = `Received Event (${taskId})`;
  if (event.status) {
    const st = typeof event.status === 'string' ? event.status : event.status.state || 'status';
    summary = `Received [${st}] (${taskId})`;
  } else if (event.message?.parts) {
    const hasText = event.message.parts.some(p => p.text);
    const hasData = event.message.parts.some(p => p.data || p.artifact);
    if (hasData) {
      summary = `Received A2UI Payload (${taskId})`;
    } else if (hasText) {
      summary = `Received Text Chunk (${taskId})`;
    }
  }

  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'received',
    summary,
    payload: event,
  };
}

/**
 * Creates an InspectorEvent recording an error event.
 */
export function createErrorEvent(err: unknown): MessageInspectorEvent {
  const msg = err instanceof Error ? err.message : String(err);
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'error',
    summary: `Transport Error: ${msg}`,
    payload: err instanceof Error ? {message: err.message, stack: err.stack, name: err.name} : err,
  };
}

const defaultStreamEventParser = new A2aStreamEventParser();

/**
 * Parses an incoming TaskStatusUpdateEvent into textual chunks, thoughts, and layout items.
 */
export function parseA2aStreamEvent(
  event: TaskStatusUpdateEvent | Record<string, unknown>,
): ParsedA2aStreamEvent {
  return defaultStreamEventParser.parse(event);
}
