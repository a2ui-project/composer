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
import {A2aMessage} from '../../chat/a2a/a2a-types';

/**
 * Image attachment payload attached to a chat message.
 */
export interface UiAttachedImage {
  /** Name of the attached image file. */
  name: string;
  /** MIME content type of the image (e.g. 'image/png'). */
  mimeType: string;
  /** Base64-encoded raw binary data of the image. */
  data: string;
  /** Optional object URL or data URI used for local image preview. */
  previewUrl?: string;
}

/**
 * Tool call invocation representation displayed in the chat stream.
 */
export interface UiToolCall {
  /** Function or tool name invoked by the agent. */
  name: string;
  /** Input arguments supplied to the tool invocation. */
  args?: Record<string, unknown>;
  /** Output or return value received from executing the tool. */
  result?: unknown;
  /** Unique identifier associated with the tool call. */
  id?: string;
}

/**
 * Metadata and isolated payload for an individual Canvas component extracted from an A2UI surface.
 */
export interface CanvasArtifact {
  /** Unique component identifier for the Canvas. */
  id: string;
  /** Opener card title for the Canvas component. Defaults to 'Interactive content'. */
  cardTitle: string;
  /** Opener card description for the Canvas component. */
  cardDescription?: string;
  /** Material Symbols icon token for the Canvas component. Defaults to 'apps'. */
  cardIcon: string;
  /** Whether the Canvas side panel should automatically open when this content arrives. Defaults to true. */
  autoOpen: boolean;
  /** Isolated A2UI payload subtree for this Canvas component. */
  payload: RenderA2uiItem[];
}

/**
 * UI View Model for an individual chat message.
 */
export interface UiMessage {
  /** Unique identifier for the chat message. */
  id: string;
  /** Sender role categorizing the author of the message. */
  sender: 'user' | 'agent' | 'system' | 'error';
  /** Markdown or plain text message content. */
  text: string;
  /** Timestamp indicating when the message was created. */
  timestamp: Date | number | string;
  /** Underlying raw A2A protocol message object, if available. */
  rawA2aMessage?: A2aMessage;
  /** Whether the message is actively receiving streaming chunks. */
  isStreaming?: boolean;
  /** Internal reasoning or thinking process text from the model. */
  thinking?: string;
  /** Whether the reasoning/thinking accordion panel is currently expanded. */
  isThinkingExpanded?: boolean;
  /** A2UI declarative UI specification payloads emitted with the message. */
  a2uiPayload?: RenderA2uiItem[];
  /** Sanitized A2UI payload containing non-canvas items for inline chat rendering. */
  inlineA2uiPayload?: RenderA2uiItem[];
  /** Array of Canvas artifacts extracted from this message's surface payload. */
  canvasArtifacts?: CanvasArtifact[];
  /** Whether the message contains interactive Canvas surface cards. */
  hasCanvas?: boolean;
  /** User-uploaded image attachments accompanying this message. */
  images?: UiAttachedImage[];
  /** Recorded tool or function calls executed during this message turn. */
  toolCalls?: UiToolCall[];
  /** Workspace file artifacts generated or referenced in this turn. */
  artifacts?: Array<{id?: string; name?: string; type?: string}>;
}
