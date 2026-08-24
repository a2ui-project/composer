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
  SET_THEME = 'SET_THEME',
  /**
   * Dispatched from the preview iframe to the host container whenever the rendered content's
   * dimensions change. Enables the host to dynamically resize the iframe container to fit
   * the exact content height, preventing inner scrollbars or clipping.
   */
  SURFACE_RESIZE = 'SURFACE_RESIZE',
}

/** Enum representing the supported theme preference modes. */
export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
}

/** Payload for SET_THEME message type. */
export declare interface SetThemePayload {
  theme: ThemePreference;
}

/**
 * Payload for the SURFACE_RESIZE message type.
 * Contains the measured scroll/offset dimensions of the rendered A2UI surface.
 */
export declare interface SurfaceResizePayload {
  /** The computed content height in pixels. */
  height: number;
  /**
   * The computed content width in pixels. Optional because the host container
   * typically controls horizontal width (100%), but available for fixed/floating surfaces.
   */
  width?: number;
}

/**
 * Represents a message structure transmitted across the Preview Bridge iframe boundary.
 *
 * NOTE: Declared as a `declare interface` so `tsickle` generates compiler externs
 * definitions for JSCompiler (Closure Compiler), preventing property renaming across frame boundaries.
 */
export declare interface BridgeMessage {
  /** The unique type identifier representing the event. */
  type: PreviewBridgeMessageType;
  /** Optional payload data associated with the message event. */
  payload?: unknown;
  /** Extensible custom properties. */
  [key: string]: unknown;
}

/** Payload for CONSOLE_LOG message type. */
export declare interface ConsoleLogPayload {
  level: string;
  message: string;
  stack?: string;
}

/** Base interface for all surface layout commands containing surfaceId. */
export declare interface BaseSurfaceDetails {
  surfaceId: string;
}

/** Inner details for DATA_MODEL_CHANGE payload. */
export declare interface UpdateDataModelDetails extends BaseSurfaceDetails {
  path?: string;
  value: unknown;
}

/** Payload for DATA_MODEL_CHANGE message type. */
export declare interface DataModelChangePayload {
  updateDataModel: UpdateDataModelDetails;
}

/** Payload for SET_BLOCKING_STATE message type. */
export declare interface SetBlockingStatePayload {
  blocked: boolean;
  message?: string;
}

/** Details for error in A2UI_CATALOG handshake. */
export declare interface CatalogErrorDetails {
  message: string;
}

/** Payload for A2UI_CATALOG message type. */
export declare interface CatalogHandshakePayload {
  error?: CatalogErrorDetails;
  [key: string]: unknown;
}

/** Payload for SEND_TO_SERVER message type. */
export declare interface SendToServerPayload {
  version: string;
  action: unknown;
}

/** Inner details for createSurface command in RENDER_A2UI payload. */
export declare interface CreateSurfaceDetails extends BaseSurfaceDetails {
  catalogId: string;
  sendDataModel?: boolean;
}

/** Layout command structure containing createSurface in RENDER_A2UI payload. */
export declare interface CreateSurfaceCommand {
  createSurface?: CreateSurfaceDetails;
  [key: string]: unknown;
}

/** Inner details for updateComponents command in RENDER_A2UI payload. */
export declare interface UpdateComponentsDetails extends BaseSurfaceDetails {
  components: unknown[];
}

/** Inner details for deleteSurface command in RENDER_A2UI payload. */
export type DeleteSurfaceDetails = BaseSurfaceDetails;

/**
 * Represents a single layout command item inside the RENDER_A2UI array.
 *
 * NOTE: Declared with `declare interface` so `tsickle` generates compiler externs for
 * JSCompiler (Closure Compiler), preserving explicitly declared property names without requiring
 * quoted property keys.
 */
export declare interface RenderA2uiItem {
  version: string;
  createSurface?: CreateSurfaceDetails;
  updateComponents?: UpdateComponentsDetails;
  updateDataModel?: UpdateDataModelDetails;
  deleteSurface?: DeleteSurfaceDetails;
  [key: string]: unknown;
}

/** Minimal catalog definition representation used by the Preview Bridge. */
export declare interface CatalogDetails {
  catalogId?: string;
  id?: string;
  $id?: string;
  [key: string]: unknown;
}

/**
 * Represents a component instance definition in the A2UI layout tree.
 *
 * NOTE: Declared with `declare interface` so `tsickle` generates compiler externs.
 * Explicitly declared properties (`component`, `id`) are preserved without quoting, while
 * dynamic/custom component schema properties not declared here must use quoted keys
 * to prevent property renaming during JS optimization.
 */
export declare interface A2uiComponentInstance {
  component: string;
  id?: string;
  [key: string]: unknown;
}
