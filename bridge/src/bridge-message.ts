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
  /** Demo[] on success, or {error: 'DEMOS_PROVIDER_FAILED'} when the provider fails. */
  DEMOS = 'DEMOS',
  FORCE_UNBLOCK = 'FORCE_UNBLOCK',
  GET_CATALOG = 'GET_CATALOG',
  GET_COMPONENT_USAGES = 'GET_COMPONENT_USAGES',
  GET_DEMOS = 'GET_DEMOS',
  MCP_REQUEST = 'MCP_REQUEST',
  MCP_RESPONSE = 'MCP_RESPONSE',
  RENDER_A2UI = 'RENDER_A2UI',
  RENDER_ERROR = 'RENDER_ERROR',
  RENDER_SUCCESS = 'RENDER_SUCCESS',
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
  /**
   * Iframe viewport width measured at the same time as the content dimensions.
   * Compare width against this value to detect overflow across asynchronous resizes.
   * Omitted when the viewport can't be measured.
   */
  viewportWidth?: number;
  /**
   * Whether the renderer has committed the first surface content to the DOM and
   * that content has settled (see content-settle.ts), so the dimensions describe
   * what the reader will see. False identifies startup/reset measurements and
   * content still settling. Omitted by renderers that don't implement
   * `RendererConfig.onInitialRender`, which report dimensions only.
   */
  contentReady?: boolean;
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

/** Supported A2UI protocol wire specification versions. */
export type A2uiProtocolVersion = 'v0.9' | 'v1.0';

/** Details for error in A2UI_CATALOG handshake. */
export declare interface CatalogErrorDetails {
  message: string;
}

/** Payload for A2UI_CATALOG message type. */
export declare interface CatalogHandshakePayload {
  catalog?: unknown;
  catalogs?: unknown[];
  error?: CatalogErrorDetails;
  [key: string]: unknown;
}

/** Handshake response payload containing primary catalog and multi-catalog array. */
export type A2uiCatalogHandshakePayload = CatalogHandshakePayload;

/** Function call payload invoking a remote renderer function (server to client). */
export declare interface CallRendererFunctionPayload {
  surfaceId?: string;
  functionCallId: string;
  callFunction: {
    catalogId?: string;
    call?: string;
    '@call'?: string;
    args?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Response payload from an agent function call (server to client). */
export declare interface AgentFunctionResponsePayload {
  functionCallId: string;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Function call payload invoking an agent function (client to server). */
export declare interface CallAgentFunctionPayload {
  surfaceId: string;
  functionCallId: string;
  callFunction: {
    '@call'?: string;
    call?: string;
    catalogId?: string;
    args?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Response payload from a renderer function call (client to server). */
export declare interface RendererFunctionResponsePayload {
  functionCallId: string;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Action payload for user interactions and events. */
export declare interface ActionPayload {
  userMessage?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Error payload dispatched across the bridge. */
export declare interface ErrorPayload {
  functionCallId?: string;
  message?: string;
  code?: string;
  [key: string]: unknown;
}

/** Payload for SEND_TO_SERVER message type. */
export declare interface SendToServerPayload {
  version: string;
  action?: unknown;
  callAgentFunction?: CallAgentFunctionPayload | unknown;
  rendererFunctionResponse?: RendererFunctionResponsePayload | unknown;
  error?: ErrorPayload | unknown;
  [key: string]: unknown;
}

/** Inner details for createSurface command in RENDER_A2UI payload. */
export declare interface CreateSurfaceDetails extends BaseSurfaceDetails {
  catalogId?: string;
  sendDataModel?: boolean;
  components?: unknown[];
  dataModel?: Record<string, unknown>;
  [key: string]: unknown;
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
  callRendererFunction?: CallRendererFunctionPayload;
  agentFunctionResponse?: AgentFunctionResponsePayload;
  [key: string]: unknown;
}

/** Alias for RenderA2uiItem representing an individual layout command item. */
export type A2uiMessageItem = RenderA2uiItem;

/**
 * Canonical update operation keys defined in the A2UI v0.9 layout specification.
 * Each valid `RenderA2uiItem` contains exactly one of these update operations:
 * - `createSurface`: Initializes a new surface with a catalog and root component.
 * - `updateComponents`: Inserts, modifies, or reorders components in an existing surface.
 * - `updateDataModel`: Updates data model properties bound to UI components.
 * - `deleteSurface`: Destroys an existing surface and releases its resources.
 */
export const A2UI_UPDATE_KEYS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
] as const;

/** Type representing any one of the canonical A2UI update operation keys. */
export type A2uiUpdateKey = (typeof A2UI_UPDATE_KEYS)[number];

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

/** Payload for MCP_REQUEST message type. */
export declare interface McpRequestPayload {
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
}

/** Payload for MCP_RESPONSE message type. */
export declare interface McpResponsePayload {
  requestId: string;
  result?: unknown;
  error?: string;
}
