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
import {RenderA2uiItem} from 'a2ui-bridge';
import {
  A2aMessage,
  A2aPart,
  TERMINAL_TASK_STATES,
  TaskStatusUpdateEvent,
} from '../../chat/a2a/a2a-types';
import {UiToolCall} from '../chat-message/types';
import {isA2uiItem, normalizeA2uiItems} from './surface-partitioner';

/**
 * Extracts a UiToolCall structure if an object represents a function or tool call invocation.
 */
export function extractToolCall(item: unknown): UiToolCall | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const obj = item as Record<string, unknown>;
  if (typeof obj['name'] === 'string' && obj['name'].length > 0 && !isA2uiItem(obj)) {
    return {
      name: obj['name'],
      args:
        typeof obj['args'] === 'object' && obj['args'] !== null
          ? (obj['args'] as Record<string, unknown>)
          : undefined,
      id: typeof obj['id'] === 'string' ? obj['id'] : undefined,
    };
  }
  return null;
}

/**
 * Result structure returned by A2aStreamEventParser.
 */
export interface ParsedA2aStreamEvent {
  contextId?: string;
  taskId?: string;
  textChunk?: string;
  thoughtChunk?: string;
  a2uiItems: RenderA2uiItem[];
  toolCalls?: UiToolCall[];
  isCompleted: boolean;
}

/**
 * Service responsible for parsing incoming A2A streaming chunks (TaskStatusUpdateEvent),
 * unwrapping JSON-RPC result wrappers, and extracting text chunks, model reasoning/thoughts,
 * and declarative A2UI UI payloads.
 */
@Injectable({
  providedIn: 'root',
})
export class A2aStreamEventParser {
  /**
   * Parses an incoming TaskStatusUpdateEvent into textual chunks, thoughts, and layout items.
   */
  parse(event: TaskStatusUpdateEvent | Record<string, unknown>): ParsedA2aStreamEvent {
    const unwrapped = this.unwrapEventPayload(event);
    const eventObj = unwrapped as Record<string, unknown>;

    const result: ParsedA2aStreamEvent = {
      contextId: this.extractContextId(unwrapped, eventObj),
      taskId: this.extractTaskId(unwrapped, eventObj),
      a2uiItems: [],
      isCompleted: this.isCompletedStatus(unwrapped, eventObj),
    };

    this.processMessageContent(unwrapped, eventObj, result);
    this.processTopLevelArtifacts(unwrapped, result);

    return result;
  }

  private unwrapEventPayload(
    event: TaskStatusUpdateEvent | Record<string, unknown>,
  ): TaskStatusUpdateEvent {
    const record = event as Record<string, unknown>;
    return record?.['result']
      ? (record['result'] as TaskStatusUpdateEvent)
      : (event as TaskStatusUpdateEvent);
  }

  private extractContextId(
    unwrapped: TaskStatusUpdateEvent,
    eventObj: Record<string, unknown>,
  ): string | undefined {
    return (
      unwrapped.contextId ||
      (eventObj['kind'] === 'task' ? undefined : (eventObj['contextId'] as string))
    );
  }

  private extractTaskId(
    unwrapped: TaskStatusUpdateEvent,
    eventObj: Record<string, unknown>,
  ): string | undefined {
    return (
      unwrapped.taskId ||
      (eventObj['kind'] === 'task' ? (eventObj['id'] as string) : (eventObj['taskId'] as string))
    );
  }

  private processMessageContent(
    unwrapped: TaskStatusUpdateEvent,
    eventObj: Record<string, unknown>,
    result: ParsedA2aStreamEvent,
  ): void {
    const msg =
      unwrapped.message ||
      (typeof unwrapped.status === 'object' && unwrapped.status !== null
        ? unwrapped.status.message
        : undefined) ||
      (eventObj['kind'] === 'message' ? (unwrapped as unknown as A2aMessage) : undefined);

    if (typeof msg === 'string') {
      result.textChunk = (result.textChunk || '') + msg;
      return;
    }

    if (typeof msg === 'object' && msg !== null && Array.isArray(msg.parts)) {
      for (const part of msg.parts) {
        this.processMessagePart(part, result);
      }
    }
  }

  private processMessagePart(part: A2aPart, result: ParsedA2aStreamEvent): void {
    const partObj = part as Record<string, unknown>;
    if (this.isThoughtPart(part, partObj)) {
      const thoughtText =
        typeof partObj['thought'] === 'string' ? (partObj['thought'] as string) : part.text;
      if (thoughtText) {
        result.thoughtChunk = (result.thoughtChunk || '') + thoughtText;
      }
    } else if (part.text) {
      result.textChunk = (result.textChunk || '') + part.text;
    }

    if (part.data) {
      this.extractDataPayload(part.data, result);
    }

    if (part.artifact?.parts) {
      for (const artPart of part.artifact.parts) {
        if (artPart.data) {
          this.extractDataPayload(artPart.data, result);
        }
      }
    }
  }

  private isThoughtPart(part: A2aPart, partObj: Record<string, unknown>): boolean {
    return (
      part.metadata?.['adk_thought'] === true ||
      part.metadata?.['adk_thought'] === 'true' ||
      part.metadata?.['thought'] === true ||
      part.metadata?.['thought'] === 'true' ||
      partObj['kind'] === 'thought' ||
      partObj['thought'] !== undefined
    );
  }

  private extractDataPayload(data: unknown, result: ParsedA2aStreamEvent): void {
    let rawData = data;
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

    const items = Array.isArray(rawData)
      ? rawData
      : typeof rawData === 'object' && rawData !== null
        ? [rawData]
        : [];

    result.a2uiItems.push(...normalizeA2uiItems(items));

    for (const item of items) {
      const toolCall = extractToolCall(item);
      if (toolCall) {
        if (!result.toolCalls) {
          result.toolCalls = [];
        }
        result.toolCalls.push(toolCall);
      }
    }
  }

  private processTopLevelArtifacts(
    unwrapped: TaskStatusUpdateEvent,
    result: ParsedA2aStreamEvent,
  ): void {
    if (unwrapped.artifact?.parts) {
      for (const artPart of unwrapped.artifact.parts) {
        if (artPart.data) {
          this.extractDataPayload(artPart.data, result);
        }
      }
    }
  }

  private isCompletedStatus(
    unwrapped: TaskStatusUpdateEvent,
    eventObj: Record<string, unknown>,
  ): boolean {
    const statusState =
      typeof unwrapped.status === 'object' && unwrapped.status !== null
        ? (unwrapped.status.state || '').toLowerCase()
        : typeof unwrapped.status === 'string'
          ? unwrapped.status.toLowerCase()
          : '';

    return (
      TERMINAL_TASK_STATES.has(statusState) ||
      unwrapped.final === true ||
      eventObj['final'] === true ||
      eventObj['isCompleted'] === true
    );
  }
}
