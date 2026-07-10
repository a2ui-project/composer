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
  CAPTURE_SCREENSHOT = 'CAPTURE_SCREENSHOT',
  A2UI_SCREENSHOT = 'A2UI_SCREENSHOT',
  COMPONENT_USAGES = 'COMPONENT_USAGES',
  CONSOLE_LOG = 'CONSOLE_LOG',
  DATA_MODEL_CHANGE = 'DATA_MODEL_CHANGE',
  FORCE_UNBLOCK = 'FORCE_UNBLOCK',
  GET_CATALOG = 'GET_CATALOG',
  GET_COMPONENT_USAGES = 'GET_COMPONENT_USAGES',
  RENDER_A2UI = 'RENDER_A2UI',
  RENDERER_READY = 'RENDERER_READY',
  SEND_TO_SERVER = 'SEND_TO_SERVER',
  SET_BLOCKING_STATE = 'SET_BLOCKING_STATE',
}

/**
 * Represents a message structure transmitted across the Preview Bridge iframe boundary.
 *
 * NOTE: To prevent compilers from renaming properties during minification in
 * production builds, all properties of this message must be constructed using
 * quoted keys (e.g. {'type': ...}) and accessed using bracket notation (e.g.
 * message['type']) when communicating across compilation boundaries.
 */
export interface BridgeMessage {
  /** The unique type identifier representing the event. */
  type: PreviewBridgeMessageType;
  /** Optional payload data associated with the message event. */
  payload?: unknown;
  /** Extensible custom properties. */
  [key: string]: unknown;
}

/** Payload for CONSOLE_LOG message type. */
export interface ConsoleLogPayload {
  level: string;
  message: string;
  stack?: string;
}

/** Base interface for all surface layout commands containing surfaceId. */
export interface BaseSurfaceDetails {
  surfaceId: string;
}

/** Inner details for DATA_MODEL_CHANGE payload. */
export interface UpdateDataModelDetails extends BaseSurfaceDetails {
  path?: string;
  value: unknown;
}

/** Payload for DATA_MODEL_CHANGE message type. */
export interface DataModelChangePayload {
  updateDataModel: UpdateDataModelDetails;
}

/** Payload for SET_BLOCKING_STATE message type. */
export interface SetBlockingStatePayload {
  blocked: boolean;
  message?: string;
}

/** Details for error in A2UI_CATALOG handshake. */
export interface CatalogErrorDetails {
  message: string;
}

/** Payload for A2UI_CATALOG message type. */
export interface CatalogHandshakePayload {
  error?: CatalogErrorDetails;
  [key: string]: unknown;
}

/** Payload for SEND_TO_SERVER message type. */
export interface SendToServerPayload {
  version: string;
  action: unknown;
}

/** Inner details for createSurface command in RENDER_A2UI payload. */
export interface CreateSurfaceDetails extends BaseSurfaceDetails {
  catalogId: string;
  sendDataModel?: boolean;
}

/** Layout command structure containing createSurface in RENDER_A2UI payload. */
export interface CreateSurfaceCommand {
  createSurface?: CreateSurfaceDetails;
  [key: string]: unknown;
}

/** Inner details for updateComponents command in RENDER_A2UI payload. */
export interface UpdateComponentsDetails extends BaseSurfaceDetails {
  components: unknown[];
}

/** Inner details for deleteSurface command in RENDER_A2UI payload. */
export type DeleteSurfaceDetails = BaseSurfaceDetails;

/** Represents a single layout command item inside the RENDER_A2UI array. */
export interface RenderA2uiItem {
  version: string;
  createSurface?: CreateSurfaceDetails;
  updateComponents?: UpdateComponentsDetails;
  updateDataModel?: UpdateDataModelDetails;
  deleteSurface?: DeleteSurfaceDetails;
  [key: string]: unknown;
}

/** Minimal catalog definition representation used by the Preview Bridge. */
export interface CatalogDetails {
  catalogId?: string;
  $id?: string;
  [key: string]: unknown;
}

/** Represents a component instance definition in the A2UI layout tree. */
export interface A2uiComponentInstance {
  component: string;
  id?: string;
  [key: string]: unknown;
}
