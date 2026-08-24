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
import {A2aMessage, AgentCapability, AgentSkill} from '../chat/a2a/a2a-types';

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
  /** Whether the message contains an interactive A2UI surface card. */
  hasCanvas?: boolean;
  /** User-uploaded image attachments accompanying this message. */
  images?: UiAttachedImage[];
  /** Recorded tool or function calls executed during this message turn. */
  toolCalls?: UiToolCall[];
  /** Workspace file artifacts generated or referenced in this turn. */
  artifacts?: Array<{id?: string; name?: string; type?: string}>;
}

/**
 * Agent display details shown in the header and showcase card.
 */
export interface UiAgentInfo {
  /** Display name of the connected agent. */
  name: string;
  /** High-level description of the agent's capabilities. */
  description?: string;
  /** Semantic version identifier of the agent. */
  version?: string;
  /** Base URL or endpoint where the A2A agent server is hosted. */
  endpoint: string;
  /** URL of the agent avatar or icon image. */
  iconUrl?: string;
  /** List of registered skills and actions the agent supports. */
  skills?: AgentSkill[];
  /** Protocol feature flags and capabilities supported by the agent. */
  capabilities?: AgentCapability;
  /** Suggested starter prompts or queries for the agent. */
  samplePrompts?: string[];
}

/**
 * A recorded A2A event item for the Message Inspector debugger.
 */
export interface InspectorEvent {
  /** Unique identifier for the recorded protocol trace event. */
  id: string;
  /** Timestamp when the event was transmitted or received. */
  timestamp: Date | number;
  /** Transport direction indicating whether the event was sent, received, or errored. */
  direction: 'sent' | 'received' | 'error';
  /** Human-readable headline summarizing the event type and method. */
  summary: string;
  /** Full raw JSON payload or error object associated with the event. */
  payload: unknown;
}
