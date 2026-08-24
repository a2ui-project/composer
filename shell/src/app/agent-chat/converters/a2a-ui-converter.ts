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

import {RenderA2uiItem} from 'a2ui-bridge';
import {
  A2aMessage,
  AgentCard,
  TERMINAL_TASK_STATES,
  TaskStatusUpdateEvent,
} from '../../chat/a2a/a2a-types';
import {generateUuid as uuid} from '../../utils/uuid';
import {InspectorEvent, UiAgentInfo} from '../types';

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
export function createSentMessageEvent(msg: A2aMessage): InspectorEvent {
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
export function createSentActionEvent(taskId: string, action: unknown): InspectorEvent {
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
export function createReceivedEvent(event: TaskStatusUpdateEvent): InspectorEvent {
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
export function createErrorEvent(err: unknown): InspectorEvent {
  const msg = err instanceof Error ? err.message : String(err);
  return {
    id: uuid(),
    timestamp: Date.now(),
    direction: 'error',
    summary: `Transport Error: ${msg}`,
    payload: err instanceof Error ? {message: err.message, stack: err.stack, name: err.name} : err,
  };
}

/**
 * Checks if a list of A2UI layout items contains any component nodes or canvas.
 */
export function hasA2uiCanvasComponent(items: RenderA2uiItem[]): boolean {
  if (!items || !Array.isArray(items) || items.length === 0) return false;
  return items.some(
    item =>
      item.createSurface !== undefined ||
      item.updateComponents !== undefined ||
      item.updateDataModel !== undefined,
  );
}

/**
 * Normalizes an array of raw layout updates into valid `RenderA2uiItem` specifications.
 */
export function normalizeA2uiItems(items: unknown[]): RenderA2uiItem[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .map(item => {
      if (typeof item === 'object' && item !== null) {
        const itemObj = item as Record<string, unknown>;
        return {
          version: 'v0.9',
          ...itemObj,
        } as RenderA2uiItem;
      }
      return null;
    })
    .filter((item): item is RenderA2uiItem => item !== null);
}

/**
 * Unwraps or prepares layout items for the live canvas renderer iframe.
 */
export function unwrapCanvasForRenderer(items: RenderA2uiItem[]): RenderA2uiItem[] {
  return normalizeA2uiItems(items);
}

/**
 * Result structure returned by parseA2aStreamEvent.
 */
export interface ParsedA2aStreamEvent {
  contextId?: string;
  taskId?: string;
  textChunk?: string;
  thoughtChunk?: string;
  a2uiItems: RenderA2uiItem[];
  isCompleted: boolean;
}

/**
 * Parses an incoming TaskStatusUpdateEvent into textual chunks, thoughts, and layout items.
 */
export function parseA2aStreamEvent(
  event: TaskStatusUpdateEvent | Record<string, unknown>,
): ParsedA2aStreamEvent {
  const unwrapped = (event as Record<string, unknown>)?.['result']
    ? ((event as Record<string, unknown>)['result'] as TaskStatusUpdateEvent)
    : (event as TaskStatusUpdateEvent);

  const eventObj = unwrapped as Record<string, unknown>;
  const result: ParsedA2aStreamEvent = {
    contextId:
      unwrapped.contextId ||
      (eventObj['kind'] === 'task' ? undefined : (eventObj['contextId'] as string)),
    taskId:
      unwrapped.taskId ||
      (eventObj['kind'] === 'task' ? (eventObj['id'] as string) : (eventObj['taskId'] as string)),
    a2uiItems: [],
    isCompleted: !!unwrapped.final,
  };

  const msg =
    unwrapped.message ||
    (typeof unwrapped.status === 'object' && unwrapped.status !== null
      ? unwrapped.status.message
      : undefined) ||
    (eventObj['kind'] === 'message' ? (unwrapped as unknown as A2aMessage) : undefined);

  if (typeof msg === 'string') {
    result.textChunk = (result.textChunk || '') + msg;
  } else if (typeof msg === 'object' && msg !== null && Array.isArray(msg.parts)) {
    for (const part of msg.parts) {
      const partObj = part as Record<string, unknown>;
      const isThought =
        part.metadata?.['adk_thought'] === true ||
        part.metadata?.['adk_thought'] === 'true' ||
        part.metadata?.['thought'] === true ||
        part.metadata?.['thought'] === 'true' ||
        partObj['kind'] === 'thought' ||
        partObj['thought'] !== undefined;

      if (isThought) {
        const thoughtText =
          typeof partObj['thought'] === 'string' ? (partObj['thought'] as string) : part.text;
        if (thoughtText) {
          result.thoughtChunk = (result.thoughtChunk || '') + thoughtText;
        }
      } else if (part.text) {
        result.textChunk = (result.textChunk || '') + part.text;
      }

      if (part.data) {
        let rawData: unknown = part.data;
        if (typeof rawData === 'object' && rawData !== null && 'data' in rawData) {
          const envelope = rawData as {mimeType?: string; data?: unknown};
          if (typeof envelope.data === 'string' && envelope.data.trim().startsWith('[')) {
            try {
              rawData = JSON.parse(envelope.data);
            } catch {}
          } else if (envelope.data) {
            rawData = envelope.data;
          }
        }

        if (Array.isArray(rawData)) {
          result.a2uiItems.push(...normalizeA2uiItems(rawData));
        } else if (typeof rawData === 'object' && rawData !== null) {
          result.a2uiItems.push(...normalizeA2uiItems([rawData]));
        }
      }

      if (part.artifact?.parts) {
        for (const artPart of part.artifact.parts) {
          if (artPart.data) {
            if (Array.isArray(artPart.data)) {
              result.a2uiItems.push(...normalizeA2uiItems(artPart.data));
            } else {
              result.a2uiItems.push(...normalizeA2uiItems([artPart.data]));
            }
          }
        }
      }
    }
  }

  if (unwrapped.artifact?.parts) {
    for (const artPart of unwrapped.artifact.parts) {
      if (artPart.data) {
        if (Array.isArray(artPart.data)) {
          result.a2uiItems.push(...normalizeA2uiItems(artPart.data));
        } else {
          result.a2uiItems.push(...normalizeA2uiItems([artPart.data]));
        }
      }
    }
  }

  const statusState =
    typeof unwrapped.status === 'object' && unwrapped.status !== null
      ? (unwrapped.status.state || '').toLowerCase()
      : typeof unwrapped.status === 'string'
        ? unwrapped.status.toLowerCase()
        : '';

  if (
    TERMINAL_TASK_STATES.has(statusState) ||
    unwrapped.final === true ||
    eventObj['final'] === true ||
    eventObj['isCompleted'] === true
  ) {
    result.isCompleted = true;
  }

  return result;
}
