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
  /** Transmits the runtime catalog definition or error from preview iframe to host. */
  A2UI_CATALOG = 'A2UI_CATALOG',
  /** Transmits component usage examples from preview iframe to host. */
  COMPONENT_USAGES = 'COMPONENT_USAGES',
  /** Relays console logs from preview iframe to host. */
  CONSOLE_LOG = 'CONSOLE_LOG',
  /** Dispatches data model change delta to the preview iframe. */
  DATA_MODEL_CHANGE = 'DATA_MODEL_CHANGE',
  /** Transmits list of interactive demo scenarios from preview iframe to host. */
  DEMOS = 'DEMOS',
  /** Forces dismissal of the modal blocking overlay in the preview iframe. */
  FORCE_UNBLOCK = 'FORCE_UNBLOCK',
  /** Host requests the active catalog definition from the preview iframe. */
  GET_CATALOG = 'GET_CATALOG',
  /** Host requests component usage examples from the preview iframe. */
  GET_COMPONENT_USAGES = 'GET_COMPONENT_USAGES',
  /** Host requests interactive demo scenarios from the preview iframe. */
  GET_DEMOS = 'GET_DEMOS',
  /** Dispatches an MCP tool request across the preview boundary. */
  MCP_REQUEST = 'MCP_REQUEST',
  /** Delivers an MCP tool response across the preview boundary. */
  MCP_RESPONSE = 'MCP_RESPONSE',
  /** Delivers A2UI layout command messages to be rendered in the preview iframe. */
  RENDER_A2UI = 'RENDER_A2UI',
  /** Notifies the host that an error occurred while processing or rendering A2UI messages. */
  RENDER_ERROR = 'RENDER_ERROR',
  /** Notifies the host that A2UI messages rendered successfully. */
  RENDER_SUCCESS = 'RENDER_SUCCESS',
  /** Preview iframe signals to the host that the renderer framework is initialized and ready. */
  RENDERER_READY = 'RENDERER_READY',
  /** Forwards user interaction actions or RPC responses from preview iframe to host. */
  SEND_TO_SERVER = 'SEND_TO_SERVER',
  /** Controls display of the modal loading/blocking overlay in the preview iframe. */
  SET_BLOCKING_STATE = 'SET_BLOCKING_STATE',
  /** Applies light or dark theme preference to the preview iframe. */
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
  /** Light theme color scheme. */
  LIGHT = 'light',
  /** Dark theme color scheme. */
  DARK = 'dark',
}

/** Payload for SET_THEME message type. */
export declare interface SetThemePayload {
  /** Target theme preference mode. */
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
  /** Log severity level (e.g. log, warn, error). */
  level: string;
  /** Log message body text. */
  message: string;
  /** Optional stack trace string. */
  stack?: string;
}

/** Base interface for all surface layout commands containing surfaceId. */
export declare interface BaseSurfaceDetails {
  /** Unique surface identifier string. */
  surfaceId: string;
}

/** Inner details for DATA_MODEL_CHANGE payload. */
export declare interface UpdateDataModelDetails extends BaseSurfaceDetails {
  /** Optional JSON pointer path into data model. */
  path?: string;
  /** New value to assign at path. */
  value: unknown;
}

/** Payload for DATA_MODEL_CHANGE message type. */
export declare interface DataModelChangePayload {
  /** Data model update command details. */
  updateDataModel: UpdateDataModelDetails;
}

/** Payload for SET_BLOCKING_STATE message type. */
export declare interface SetBlockingStatePayload {
  /** Whether the surface interaction is blocked by overlay. */
  blocked: boolean;
  /** Optional message displayed on the blocking overlay. */
  message?: string;
}

/** Supported A2UI protocol wire specification versions. */
export type A2uiProtocolVersion = 'v0.9' | 'v1.0';

/** Details for error in A2UI_CATALOG handshake. */
export declare interface CatalogErrorDetails {
  /** Human-readable error message explaining catalog failure. */
  message: string;
}

/** Payload for A2UI_CATALOG message type. */
export declare interface CatalogHandshakePayload {
  /** Primary catalog schema definition. */
  catalog?: unknown;
  /** Complete list of available catalog schemas for multi-catalog configurations. */
  catalogs?: unknown[];
  /** Error details if catalog retrieval failed. */
  error?: CatalogErrorDetails;
  /** Extensible catalog metadata properties. */
  [key: string]: unknown;
}

/** Function call payload invoking a remote renderer function (server to client). */
export declare interface CallRendererFunctionPayload {
  /** Target surface identifier. */
  surfaceId?: string;
  /** Unique invocation correlation ID. */
  functionCallId: string;
  /** Function name and argument structure. */
  callFunction: {
    /** Target catalog ID defining the function. */
    catalogId?: string;
    /** Function name (v0.9 notation). */
    call?: string;
    /** Function name (v1.0 bracket notation). */
    '@call'?: string;
    /** Evaluated arguments map passed to function. */
    args?: Record<string, unknown>;
    /** Extensible callFunction properties. */
    [key: string]: unknown;
  };
  /** Extensible payload properties. */
  [key: string]: unknown;
}

/** Response payload from an agent function call (server to client). */
export declare interface AgentFunctionResponsePayload {
  /** Unique invocation correlation ID. */
  functionCallId: string;
  /** Return value from function evaluation. */
  value?: unknown;
  /** Alternative result field name. */
  result?: unknown;
  /** Error descriptor if function execution failed. */
  error?: {
    /** Error classification code. */
    code: string;
    /** Error message string. */
    message: string;
    /** Extensible error properties. */
    [key: string]: unknown;
  };
  /** Extensible payload properties. */
  [key: string]: unknown;
}

/** Function call payload invoking an agent function (client to server). */
export declare interface CallAgentFunctionPayload {
  /** Source surface identifier. */
  surfaceId: string;
  /** Unique invocation correlation ID. */
  functionCallId: string;
  /** Function name and argument structure. */
  callFunction: {
    /** Function name (v1.0 bracket notation). */
    '@call'?: string;
    /** Function name (v0.9 notation). */
    call?: string;
    /** Target catalog ID defining the function. */
    catalogId?: string;
    /** Arguments passed to agent function. */
    args?: Record<string, unknown>;
    /** Extensible callFunction properties. */
    [key: string]: unknown;
  };
  /** Extensible payload properties. */
  [key: string]: unknown;
}

/** Response payload from a renderer function call (client to server). */
export declare interface RendererFunctionResponsePayload {
  /** Unique invocation correlation ID. */
  functionCallId: string;
  /** Return value from function evaluation. */
  value?: unknown;
  /** Alternative result field name. */
  result?: unknown;
  /** Error descriptor if function execution failed. */
  error?: {
    /** Error classification code. */
    code: string;
    /** Error message string. */
    message: string;
    /** Extensible error properties. */
    [key: string]: unknown;
  };
  /** Extensible payload properties. */
  [key: string]: unknown;
}

/** Error payload dispatched across the bridge. */
export declare interface ErrorPayload {
  /** Associated invocation correlation ID. */
  functionCallId?: string;
  /** Error message string. */
  message?: string;
  /** Error classification code. */
  code?: string;
  /** Extensible error properties. */
  [key: string]: unknown;
}

/** Payload for SEND_TO_SERVER message type. */
export declare interface SendToServerPayload {
  /** Protocol wire version string. */
  version: string;
  /** Declarative action payload for user interaction events. */
  action?: unknown;
  /** Remote agent function invocation payload. */
  callAgentFunction?: CallAgentFunctionPayload;
  /** Renderer function execution result payload. */
  rendererFunctionResponse?: RendererFunctionResponsePayload;
  /** Bridge or function evaluation error payload. */
  error?: ErrorPayload;
  /** Extensible sendToServer payload properties. */
  [key: string]: unknown;
}

/** Inner details for createSurface command in RENDER_A2UI payload. */
export declare interface CreateSurfaceDetails extends BaseSurfaceDetails {
  /** Catalog ID associated with this surface. */
  catalogId?: string;
  /** Whether the host expects the client to mirror back data model state. */
  sendDataModel?: boolean;
  /** Initial component list to populate surface. */
  components?: unknown[];
  /** Initial data model values. */
  dataModel?: Record<string, unknown>;
  /** Extensible surface creation properties. */
  [key: string]: unknown;
}

/** Layout command structure containing createSurface in RENDER_A2UI payload. */
export declare interface CreateSurfaceCommand {
  /** Surface creation command details. */
  createSurface?: CreateSurfaceDetails;
  /** Extensible command properties. */
  [key: string]: unknown;
}

/** Inner details for updateComponents command in RENDER_A2UI payload. */
export declare interface UpdateComponentsDetails extends BaseSurfaceDetails {
  /** List of updated or newly added component items. */
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
  /** Protocol version string ('v0.9' or '1.0'). */
  version: string;
  /** Surface initialization details. */
  createSurface?: CreateSurfaceDetails;
  /** Component hierarchy updates. */
  updateComponents?: UpdateComponentsDetails;
  /** Data model state updates. */
  updateDataModel?: UpdateDataModelDetails;
  /** Surface destruction command. */
  deleteSurface?: DeleteSurfaceDetails;
  /** Renderer function invocation command. */
  callRendererFunction?: CallRendererFunctionPayload;
  /** Response to prior agent function invocation. */
  agentFunctionResponse?: AgentFunctionResponsePayload;
  /** Extensible item properties. */
  [key: string]: unknown;
}

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

/**
 * Represents a component instance definition in the A2UI layout tree.
 *
 * NOTE: Declared with `declare interface` so `tsickle` generates compiler externs.
 * Explicitly declared properties (`component`, `id`) are preserved without quoting, while
 * dynamic/custom component schema properties not declared here must use quoted keys
 * to prevent property renaming during JS optimization.
 */
export declare interface A2uiComponentInstance {
  /** Component type name matching catalog definition. */
  component: string;
  /** Unique component ID within surface. */
  id?: string;
  /** Extensible component properties. */
  [key: string]: unknown;
}

/** Payload for MCP_REQUEST message type. */
export declare interface McpRequestPayload {
  /** Unique request correlation identifier. */
  requestId: string;
  /** Name of the MCP tool to execute. */
  toolName: string;
  /** Arguments record supplied to the tool. */
  args: Record<string, unknown>;
}

/** Payload for MCP_RESPONSE message type. */
export declare interface McpResponsePayload {
  /** Matching request correlation identifier. */
  requestId: string;
  /** Result value returned by tool execution. */
  result?: unknown;
  /** Error message if tool execution failed. */
  error?: string;
}
