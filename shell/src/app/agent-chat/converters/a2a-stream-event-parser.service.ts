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
  A2aArtifact,
  A2aMessage,
  A2aPart,
  TaskStatusUpdateEvent,
  isTerminalTaskState,
  normalizeTaskState,
} from '../../chat/a2a/a2a-types';
import {UiToolCall} from '../chat-message/types';
import {renderBase64Data, renderMultimediaContent} from '../../chat/a2a/a2a-media';
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
  statusState?: string;
}

/**
 * Service responsible for parsing incoming A2A streaming chunks (TaskStatusUpdateEvent),
 * unwrapping JSON-RPC result and protobuf StreamResponse envelopes, extracting text chunks,
 * model reasoning/thoughts, multimedia files, tool invocations, and declarative A2UI UI payloads.
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
    const statusState = this.extractStatusState(unwrapped);

    const result: ParsedA2aStreamEvent = {
      contextId: this.extractContextId(unwrapped),
      taskId: this.extractTaskId(unwrapped),
      a2uiItems: [],
      isCompleted: this.isCompletedStatus(unwrapped),
      statusState,
    };

    this.processMessageContent(unwrapped, result);
    this.processTopLevelArtifacts(unwrapped, result);

    return result;
  }

  /**
   * Unwraps nested result objects and protobuf StreamResponse payload envelopes.
   *
   * A2A events arriving via HTTP SSE or JSON-RPC may be encapsulated in:
   * - JSON-RPC: `{ jsonrpc: "2.0", result: { ... } }`
   * - Protobuf StreamResponse oneofs serialized via proto3 JSON mapping:
   *   `{ task: ... }`, `{ statusUpdate: ... }` / `{ status_update: ... }`,
   *   `{ artifactUpdate: ... }` / `{ artifact_update: ... }`, or `{ message: ... }`
   *
   * This method normalizes all representations into a standard TaskStatusUpdateEvent.
   */
  private unwrapEventPayload(
    event: TaskStatusUpdateEvent | Record<string, unknown>,
  ): TaskStatusUpdateEvent {
    if (!event || typeof event !== 'object') {
      return {};
    }
    const record = event as Record<string, unknown>;

    // 1. JSON-RPC result wrapper unwrapping
    if (record['result'] && typeof record['result'] === 'object') {
      return this.unwrapEventPayload(record['result'] as TaskStatusUpdateEvent);
    }

    const envelopeTaskId = (record['taskId'] || record['task_id'] || record['id']) as
      string | undefined;
    const envelopeContextId = (record['contextId'] || record['context_id']) as string | undefined;

    // 2. Proto3 JSON mapping of StreamResponse oneof payloads (emitted by A2A Python SDK / gRPC bridges in camelCase or snake_case)
    const oneofConfigs = [
      {keys: ['task'], kind: 'task'},
      {keys: ['statusUpdate', 'status_update'], kind: 'status-update'},
      {keys: ['artifactUpdate', 'artifact_update'], kind: 'artifact-update'},
    ];

    for (const {keys, kind} of oneofConfigs) {
      for (const key of keys) {
        if (record[key] && typeof record[key] === 'object') {
          return this.unwrapOneofPayload(
            record[key] as Record<string, unknown>,
            kind,
            envelopeTaskId,
            envelopeContextId,
          );
        }
      }
    }

    // Only unwrap message if the event is solely a StreamResponse wrapper (no status or parts)
    if (
      record['message'] &&
      typeof record['message'] === 'object' &&
      !('status' in record) &&
      !('parts' in record)
    ) {
      return this.unwrapOneofPayload(
        record['message'] as Record<string, unknown>,
        'message',
        envelopeTaskId,
        envelopeContextId,
      );
    }

    return event as TaskStatusUpdateEvent;
  }

  /**
   * Unwraps a Protobuf StreamResponse oneof payload (e.g. task, status_update, artifact_update).
   *
   * In A2A Protobuf streaming, events are wrapped in a oneof union field (e.g. `StreamResponse.status_update`).
   * When unwrapping the inner payload, outer envelope IDs (`taskId`, `contextId`) may need to be inherited
   * if the inner object does not specify them.
   *
   * @param inner The raw inner oneof payload object.
   * @param kind The detected A2A protocol event kind ('task' | 'status-update' | 'artifact-update' | 'message').
   * @param envelopeTaskId Fallback task ID from the outer envelope.
   * @param envelopeContextId Fallback context ID from the outer envelope.
   */
  private unwrapOneofPayload(
    inner: Record<string, unknown>,
    kind: string,
    envelopeTaskId?: string,
    envelopeContextId?: string,
  ): TaskStatusUpdateEvent {
    return {
      ...inner,
      kind,
      taskId:
        (inner['taskId'] as string) ||
        (inner['task_id'] as string) ||
        (inner['id'] as string) ||
        envelopeTaskId,
      contextId:
        (inner['contextId'] as string) || (inner['context_id'] as string) || envelopeContextId,
    } as TaskStatusUpdateEvent;
  }

  private extractStatusState(unwrapped: TaskStatusUpdateEvent): string | undefined {
    const rawStatus = unwrapped.status;
    if (typeof rawStatus === 'object' && rawStatus !== null) {
      const stateVal = (rawStatus as Record<string, unknown>)['state'];
      return stateVal !== undefined ? normalizeTaskState(stateVal) : undefined;
    }
    if (typeof rawStatus === 'string' || typeof rawStatus === 'number') {
      return normalizeTaskState(rawStatus);
    }
    return undefined;
  }

  private extractContextId(unwrapped: TaskStatusUpdateEvent): string | undefined {
    return unwrapped.contextId || (unwrapped['context_id'] as string | undefined);
  }

  private extractTaskId(unwrapped: TaskStatusUpdateEvent): string | undefined {
    return (
      unwrapped.taskId ||
      (unwrapped['task_id'] as string | undefined) ||
      (unwrapped['id'] as string | undefined)
    );
  }

  private processMessageContent(
    unwrapped: TaskStatusUpdateEvent,
    result: ParsedA2aStreamEvent,
  ): void {
    const msg =
      unwrapped.message ||
      (typeof unwrapped.status === 'object' && unwrapped.status !== null
        ? unwrapped.status.message
        : undefined) ||
      (Array.isArray(unwrapped.parts) ? unwrapped : undefined) ||
      (unwrapped['kind'] === 'message' ? (unwrapped as unknown as A2aMessage) : undefined);

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

    // 1. Model thoughts / reasoning
    if (this.isThoughtPart(part, partObj)) {
      const thoughtText =
        typeof partObj['thought'] === 'string'
          ? (partObj['thought'] as string)
          : typeof part.text === 'string'
            ? part.text
            : '';
      if (thoughtText) {
        result.thoughtChunk = (result.thoughtChunk || '') + thoughtText;
      }
      return;
    }

    // 2. Text (v0.3 / v1.0)
    if (part.text) {
      result.textChunk = (result.textChunk || '') + part.text;
    }

    // 3. File attachments & media (v0.3 nested file, v1.0 url, v1.0 raw bytes)
    this.processFilePart(part, result);

    // 4. Data part (both versions)
    if (part.data) {
      this.extractDataPayload(part.data, result);
    }

    // 5. Embedded artifact parts
    if (part.artifact?.parts) {
      for (const artPart of part.artifact.parts) {
        this.processMessagePart(artPart, result);
      }
    }
  }

  /**
   * Processes file attachments and multimedia parts across both v0.3 and v1.0 schemas.
   *
   * Handles three distinct A2A part representations:
   * 1. v0.3 nested file payload: `{ file: { bytes?, uri?, mimeType?, name? } }`
   * 2. v1.0 flat URI oneof: `{ url: string, mediaType?: string, filename?: string }`
   * 3. v1.0 flat raw bytes base64 oneof: `{ raw: string, mediaType?: string, filename?: string }`
   *
   * Formats media (images, audio, video, PDFs) into sanitized HTML/markdown tokens using
   * `renderMultimediaContent` or `renderBase64Data`.
   */
  private processFilePart(part: A2aPart, result: ParsedA2aStreamEvent): void {
    // 1. v0.3 File part: { file: { bytes?, uri?, mimeType?, name? } }
    if (part.file) {
      const {uri, bytes, data, mimeType, name} = part.file;
      const rawBytes = bytes || (typeof data === 'string' && !uri ? data : undefined);
      if (rawBytes && mimeType) {
        result.textChunk = (result.textChunk || '') + renderBase64Data(rawBytes, mimeType, name);
      } else if (uri && mimeType) {
        result.textChunk = (result.textChunk || '') + renderMultimediaContent(uri, mimeType, name);
      } else if (uri) {
        result.textChunk =
          (result.textChunk || '') + renderMultimediaContent(uri, 'application/octet-stream', name);
      }
      return;
    }

    // 2. v1.0 File part (URI oneof): { url: string, mediaType?: string, filename?: string }
    if (part.url) {
      const mimeType =
        part.mediaType || part.media_type || part.mimeType || 'application/octet-stream';
      result.textChunk =
        (result.textChunk || '') + renderMultimediaContent(part.url, mimeType, part.filename);
      return;
    }

    // 3. v1.0 File part (raw bytes base64 oneof): { raw: string, mediaType?: string, filename?: string }
    if (part.raw) {
      const mimeType =
        part.mediaType || part.media_type || part.mimeType || 'application/octet-stream';
      result.textChunk =
        (result.textChunk || '') + renderBase64Data(part.raw, mimeType, part.filename);
      return;
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

  /**
   * Extracts A2UI layout items, tool call invocations, or raw JSON blocks from data parts.
   */
  private extractDataPayload(data: unknown, result: ParsedA2aStreamEvent): void {
    const {unwrappedData, isMedia} = this.unwrapDataEnvelope(data, result);
    if (isMedia) {
      return;
    }

    const items = Array.isArray(unwrappedData)
      ? unwrappedData
      : typeof unwrappedData === 'object' && unwrappedData !== null
        ? [unwrappedData]
        : [];

    // Extract declarative A2UI items
    const a2uiNormalized = normalizeA2uiItems(items);
    if (a2uiNormalized.length > 0) {
      result.a2uiItems.push(...a2uiNormalized);
    }

    // Extract tool calls
    const toolCalls = this.extractToolCallsFromItems(items);
    if (toolCalls.length > 0) {
      result.toolCalls = (result.toolCalls || []).concat(toolCalls);
    }

    // If data is generic structured data (not A2UI and no tool calls), format as JSON code block
    if (
      a2uiNormalized.length === 0 &&
      (!result.toolCalls || result.toolCalls.length === 0) &&
      typeof unwrappedData === 'object' &&
      unwrappedData !== null &&
      !Array.isArray(unwrappedData) &&
      Object.keys(unwrappedData).length > 0
    ) {
      result.textChunk =
        (result.textChunk || '') +
        `\n\n\`\`\`json\n${JSON.stringify(unwrappedData, null, 2)}\n\`\`\`\n`;
    }
  }

  /**
   * Unpacks data envelopes containing embedded JSON strings, raw payloads, or multimedia buffers.
   *
   * Agents frequently wrap UI components, media, or data tables in `{ data: ..., mimeType?: ... }`.
   * This helper unpacks stringified JSON arrays and intercepts base64 media (images, audio, video, PDF)
   * to render them directly into the message text stream.
   *
   * @returns An object with `unwrappedData` and an `isMedia` flag indicating whether media was rendered.
   */
  private unwrapDataEnvelope(
    data: unknown,
    result: ParsedA2aStreamEvent,
  ): {unwrappedData: unknown; isMedia: boolean} {
    if (typeof data !== 'object' || data === null || !('data' in data)) {
      return {unwrappedData: data, isMedia: false};
    }

    const envelope = data as {mimeType?: string; data?: unknown; name?: string};

    // Case 1: Stringified JSON array (e.g. serialized A2UI component list)
    if (typeof envelope.data === 'string' && envelope.data.trim().startsWith('[')) {
      try {
        return {unwrappedData: JSON.parse(envelope.data), isMedia: false};
      } catch {}
    }

    // Case 2: Base64 media data payload (image, audio, video, PDF)
    if (envelope.mimeType && typeof envelope.data === 'string') {
      const mime = envelope.mimeType.toLowerCase();
      if (
        mime.startsWith('image/') ||
        mime.startsWith('audio/') ||
        mime.startsWith('video/') ||
        mime === 'application/pdf'
      ) {
        result.textChunk =
          (result.textChunk || '') +
          renderBase64Data(envelope.data, envelope.mimeType, envelope.name);
        return {unwrappedData: envelope.data, isMedia: true};
      }
    }

    // Case 3: Inner data payload
    if (envelope.data !== undefined) {
      return {unwrappedData: envelope.data, isMedia: false};
    }

    return {unwrappedData: data, isMedia: false};
  }

  /**
   * Scans a list of data items for function or tool invocation structures.
   *
   * Inspects each item using `extractToolCall` to identify tool calls (e.g. name, args, callId)
   * while filtering out A2UI catalog component definitions.
   */
  private extractToolCallsFromItems(items: unknown[]): UiToolCall[] {
    const toolCalls: UiToolCall[] = [];
    for (const item of items) {
      const call = extractToolCall(item);
      if (call) {
        toolCalls.push(call);
      }
    }
    return toolCalls;
  }

  private processTopLevelArtifacts(
    unwrapped: TaskStatusUpdateEvent,
    result: ParsedA2aStreamEvent,
  ): void {
    const artifacts: A2aArtifact[] = [];
    if (unwrapped.artifact) {
      artifacts.push(unwrapped.artifact);
    }
    if (Array.isArray(unwrapped.artifacts)) {
      artifacts.push(...unwrapped.artifacts);
    }

    for (const art of artifacts) {
      if (Array.isArray(art.parts)) {
        for (const artPart of art.parts) {
          this.processMessagePart(artPart, result);
        }
      }
    }
  }

  private isCompletedStatus(unwrapped: TaskStatusUpdateEvent): boolean {
    return isTerminalTaskState(unwrapped);
  }
}
