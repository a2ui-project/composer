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

import {
  A2aMessage,
  AgentCard,
  TaskStatusUpdateEvent,
  normalizeTaskState,
} from '../../chat/a2a/a2a-types';
import {generateUuid as uuid} from '../../utils/uuid';
import {UiAgentInfo} from '../agent-header/types';
import {MessageInspectorEvent} from '../message-inspector/message-inspector-event';
import {inferMessageKind, validateMessage} from '../../chat/a2a/a2a-validators';
import {A2aStreamEventParser, type ParsedA2aStreamEvent} from './a2a-stream-event-parser.service';

/**
 * Brand asset icon URL for A2A Protocol representations.
 */
export const A2A_PROTOCOL_ICON_URL =
  'https://raw.githubusercontent.com/google-a2a/A2A/refs/heads/main/docs/assets/a2a-logo-black.svg';

/**
 * Converts a raw A2A AgentCard and endpoint URL into a UI Agent Info model.
 * Supports both v0.3 (top-level 'url') and v1.0 ('supportedInterfaces') schemas.
 */
export function a2aCardToUiAgentInfo(card: AgentCard | null, url: string | null): UiAgentInfo {
  const samplePrompts: string[] = [];
  const rawPrompts = card?.samplePrompts || card?.sample_prompts;

  if (rawPrompts && Array.isArray(rawPrompts) && rawPrompts.length > 0) {
    samplePrompts.push(...rawPrompts);
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

  const resolvedEndpoint =
    url ||
    card?.url ||
    card?.supportedInterfaces?.[0]?.url ||
    card?.supported_interfaces?.[0]?.url ||
    '';

  return {
    name: card?.name || 'A2A Agent',
    description: card?.description || 'Connected autonomous Agent-to-Agent service endpoint.',
    version: card?.version || '',
    endpoint: resolvedEndpoint,
    iconUrl: card?.iconUrl || card?.icon_url || A2A_PROTOCOL_ICON_URL,
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
    kind: 'message',
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
    kind: 'message',
    summary: `Sent Action (Task ${taskId || 'active'})`,
    payload: {taskId, action},
  };
}

/**
 * Creates an InspectorEvent recording an incoming streaming event chunk with validation.
 */
export function createReceivedEvent(event: TaskStatusUpdateEvent): MessageInspectorEvent {
  const eventRecord = event as Record<string, unknown>;
  const taskId =
    event.taskId || event.task_id || event.contextId || event.context_id || event.id || 'event';

  const kind = event.kind || inferMessageKind(eventRecord) || 'status-update';
  const validationErrors = validateMessage(event);

  let summary: string;
  if (event.status) {
    const rawStatus =
      typeof event.status === 'object' && event.status !== null
        ? (event.status as Record<string, unknown>)['state']
        : event.status;
    const st = normalizeTaskState(rawStatus);
    summary = `Received [${kind}: ${st}] (${taskId})`;
  } else if (event.message?.parts?.some(p => p.data || p.artifact)) {
    summary = `Received [${kind}: A2UI Payload] (${taskId})`;
  } else if (event.message?.parts?.some(p => p.text)) {
    summary = `Received [${kind}: Text] (${taskId})`;
  } else {
    summary = `Received [${kind}] (${taskId})`;
  }

  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'received',
    kind,
    summary,
    payload: event,
    validationErrors,
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
    kind: 'error',
    summary: `Transport Error: ${msg}`,
    payload: err instanceof Error ? {message: err.message, stack: err.stack, name: err.name} : err,
    validationErrors: [msg],
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
