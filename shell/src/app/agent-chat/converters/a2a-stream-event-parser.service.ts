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

import {renderBase64Data, renderMultimediaContent} from '../../chat/a2a/a2a-media';
import {
  A2aArtifact,
  A2aMessageRole,
  A2aPart,
  A2aV03TaskState,
  isTerminalTaskState,
  normalizeMessageRole,
  normalizeTaskState,
  TaskStatusUpdateEvent,
} from '../../chat/a2a/a2a-types';
import {UiToolCall} from '../chat-message/types';
import {asRecord} from '../../utils/json';

import {isA2uiItem, normalizeA2uiItems} from './surface-partitioner';

/**
 * Values of the `kind` discriminator on A2A stream events.
 */
enum A2aEventKind {
  /** The event is a bare message rather than a task status update. */
  MESSAGE = 'message',
}

/**
 * Values of the `kind` discriminator on A2A parts.
 */
enum A2aPartKind {
  /** The part holds model reasoning that belongs in the thinking panel. */
  THOUGHT = 'thought',
}

/** Field names read off raw A2A events that are absent from {@link TaskStatusUpdateEvent}. */
enum A2aEventField {
  KIND = 'kind',
}

/**
 * Field names read off raw A2A parts.
 *
 * These are accessed through an index signature because they are absent from {@link A2aPart};
 * they only appear on payloads from agents that predate or extend the typed shape.
 */
enum A2aPartField {
  KIND = 'kind',
  THOUGHT = 'thought',
}

/**
 * Metadata keys that mark a part as model reasoning.
 *
 * `adk_thought` is emitted by ADK-based agents; `thought` is the generic spelling. Either may
 * appear at the top level of `metadata` or nested inside its protobuf `fields` map.
 */
const THOUGHT_METADATA_KEYS = ['adk_thought', 'thought'] as const;

/**
 * Interprets the many encodings agents use for a boolean metadata flag.
 *
 * Accepts a native boolean, the string `'true'`, and the protobuf Struct wrapper
 * (`{boolValue: true}`) produced by proto3 JSON mapping.
 */
function isThoughtFlagSet(value: unknown): boolean {
  if (value === true || value === 'true') return true;
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>)['boolValue'] === true
  );
}

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
 * Fields that only an A2UI action carries.
 *
 * An action is identified by its `name` plus at least one of these, which
 * distinguishes it from the many other payloads that happen to have a `name`.
 */
const A2UI_ACTION_MARKER_FIELDS: readonly string[] = ['context', 'sourceComponentId', 'surfaceId'];

/** Key under which an A2UI action may be nested in a data part. */
const A2UI_ACTION_WRAPPER_FIELD = 'action';

/**
 * Whether a data part is an A2UI client action echoed back by the agent.
 *
 * Actions describe what the user did on a surface. They are part of the
 * protocol rather than something the agent said, so they must not be rendered
 * into the transcript.
 */
function isA2uiActionEcho(data: unknown): boolean {
  const record = asRecord(data);
  if (!record) {
    return false;
  }
  const nestedAction = asRecord(record[A2UI_ACTION_WRAPPER_FIELD]);
  if (nestedAction) {
    return isA2uiActionEcho(nestedAction);
  }
  return (
    typeof record['name'] === 'string' &&
    A2UI_ACTION_MARKER_FIELDS.some(field => record[field] !== undefined)
  );
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
    const primaryMessage = this.extractPrimaryMessage(unwrapped);
    if (!primaryMessage) return;

    const isNonCompleted = this.isNonCompletedTaskEvent(unwrapped);

    if (typeof primaryMessage === 'string') {
      if (isNonCompleted) {
        result.thoughtChunk = (result.thoughtChunk || '') + primaryMessage;
      } else {
        result.textChunk = (result.textChunk || '') + primaryMessage;
      }
      return;
    }

    if (Array.isArray(primaryMessage)) {
      for (const part of primaryMessage) {
        if (part && typeof part === 'object') {
          this.processMessagePart(part as A2aPart, result, isNonCompleted);
        }
      }
      return;
    }

    if (typeof primaryMessage !== 'object' || primaryMessage === null) {
      return;
    }

    const msgRecord = primaryMessage as Record<string, unknown>;
    // Agents echo the prompt back while a task is in flight. The chat view
    // already shows the user's turn, so never repeat it in the agent's.
    if (this.isUserMessage(msgRecord, unwrapped)) {
      return;
    }

    const parts = msgRecord['parts'] ?? msgRecord['content'];
    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (part && typeof part === 'object') {
          this.processMessagePart(part as A2aPart, result, isNonCompleted);
        }
      }
    } else if (typeof msgRecord['text'] === 'string' || msgRecord['data'] !== undefined) {
      this.processMessagePart(msgRecord as A2aPart, result, isNonCompleted);
    }
  }

  /**
   * Whether the event reports a task that is still in flight.
   *
   * Text emitted while a task is `submitted` or `working` is progress narration rather than the
   * final answer, so callers route it to the thinking panel instead of the main transcript.
   */
  private isNonCompletedTaskEvent(unwrapped: TaskStatusUpdateEvent): boolean {
    const statusState = this.extractStatusState(unwrapped);
    return statusState === A2aV03TaskState.SUBMITTED || statusState === A2aV03TaskState.WORKING;
  }

  /**
   * Locates the message payload within an event, checking the known shapes in priority order.
   *
   * Depending on the agent and transport the content may sit on `message`, on `status.message`,
   * on the legacy `status.update`, or directly on the event itself when it is a bare message.
   *
   * @returns The message, its parts array, or undefined when the event carries no content.
   */
  private extractPrimaryMessage(unwrapped: TaskStatusUpdateEvent): unknown {
    if (unwrapped.message) {
      return unwrapped.message;
    }
    if (
      typeof unwrapped.status === 'object' &&
      unwrapped.status !== null &&
      unwrapped.status.message
    ) {
      return unwrapped.status.message;
    }
    const {status} = unwrapped;
    if (typeof status === 'object' && status !== null && status['update']) {
      return status['update'];
    }
    if (unwrapped[A2aEventField.KIND] === A2aEventKind.MESSAGE) {
      return unwrapped;
    }
    if (Array.isArray(unwrapped.parts)) {
      return unwrapped;
    }
    if (unwrapped['content']) {
      return unwrapped['content'];
    }
    return undefined;
  }

  /**
   * Determines whether a message was authored by the user rather than the agent.
   *
   * Agents echo the submitted prompt back on the `submitted` status event, so those messages must
   * be recognized and skipped to avoid duplicating the user's text in the transcript. When the
   * payload carries no usable role, authorship is inferred from the task state.
   */
  private isUserMessage(
    msgRecord: Record<string, unknown>,
    unwrapped: TaskStatusUpdateEvent,
  ): boolean {
    const role = normalizeMessageRole(msgRecord['role'] ?? unwrapped['role']);
    if (role) {
      return role === A2aMessageRole.USER;
    }
    return this.extractStatusState(unwrapped) === A2aV03TaskState.SUBMITTED;
  }

  private processMessagePart(
    part: A2aPart,
    result: ParsedA2aStreamEvent,
    isNonCompletedStatus = false,
  ): void {
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
      if (isNonCompletedStatus) {
        result.thoughtChunk = (result.thoughtChunk || '') + part.text;
      } else {
        result.textChunk = (result.textChunk || '') + part.text;
      }
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
        if (artPart) {
          this.processMessagePart(artPart, result, isNonCompletedStatus);
        }
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

  /**
   * Whether a part carries model reasoning rather than user-visible output.
   *
   * Agents signal this inconsistently, so every known spelling is accepted: a `thought` payload
   * field, a `kind` discriminator, or a metadata flag either at the top level or nested under the
   * protobuf `fields` map.
   */
  private isThoughtPart(part: A2aPart, partObj: Record<string, unknown>): boolean {
    if (partObj[A2aPartField.THOUGHT] !== undefined) return true;
    if (partObj[A2aPartField.KIND] === A2aPartKind.THOUGHT) return true;

    const meta = (part.metadata || partObj['metadata']) as Record<string, unknown> | undefined;
    if (!meta) return false;
    const metaFields =
      typeof meta['fields'] === 'object' && meta['fields'] !== null
        ? (meta['fields'] as Record<string, unknown>)
        : undefined;

    return THOUGHT_METADATA_KEYS.some(
      key => isThoughtFlagSet(meta[key]) || isThoughtFlagSet(metaFields?.[key]),
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

    // An action echo reports what the user did on a surface. It is protocol
    // traffic rather than agent output, so it is neither a tool call nor
    // something to print, however closely it resembles one.
    if (isA2uiActionEcho(unwrappedData)) {
      return;
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

    // Case 1: Stringified JSON (e.g. a serialized A2UI component list or action)
    if (typeof envelope.data === 'string') {
      const trimmed = envelope.data.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          return {unwrappedData: JSON.parse(trimmed), isMedia: false};
        } catch {
          // Not JSON after all; fall through to the remaining cases. The
          // stream must keep flowing whatever a payload turns out to be.
        }
      }
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

    const seenArtifacts = new Set<unknown>();
    for (const art of artifacts) {
      if (!art || typeof art !== 'object' || seenArtifacts.has(art)) continue;
      seenArtifacts.add(art);

      if (Array.isArray(art.parts)) {
        for (const artPart of art.parts) {
          if (artPart) {
            this.processMessagePart(artPart, result);
          }
        }
      }
    }
  }

  private isCompletedStatus(unwrapped: TaskStatusUpdateEvent): boolean {
    return isTerminalTaskState(unwrapped);
  }
}
