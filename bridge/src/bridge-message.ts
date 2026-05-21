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

/**
 * Enum representing the supported message types transmitted across the Preview Bridge.
 */
export enum PreviewBridgeMessageType {
  A2UI_CATALOG = 'A2UI_CATALOG',
  CONSOLE_LOG = 'CONSOLE_LOG',
  DATA_MODEL_CHANGE = 'DATA_MODEL_CHANGE',
  FORCE_UNBLOCK = 'FORCE_UNBLOCK',
  GET_CATALOG = 'GET_CATALOG',
  RENDER_A2UI = 'RENDER_A2UI',
  RENDERER_READY = 'RENDERER_READY',
  SEND_TO_SERVER = 'SEND_TO_SERVER',
  SET_BLOCKING_STATE = 'SET_BLOCKING_STATE',
}

/**
 * Represents a message structure transmitted across the Preview Bridge iframe boundary.
 */
export interface BridgeMessage {
  /** The unique type identifier representing the event. */
  type: PreviewBridgeMessageType;
  /** Optional payload data associated with the message event. */
  payload?: unknown;
  /** Extensible custom properties. */
  [key: string]: unknown;
}
