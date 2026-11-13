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

import {
  setupInstrumentationOverrides,
  teardownInstrumentationOverrides,
} from './instrumentation-overrides';

import type {A2uiMessage} from '@a2ui/web_core/v0_9';

import {
  resolveProtocolStrategy,
  detectProtocolVersion,
} from './protocol/protocol-strategy-registry.js';

import {DomainOriginVerificationService} from './domain-origin-verification';

import {
  PreviewBridgeMessageType,
  BridgeMessage,
  SetBlockingStatePayload,
  SetThemePayload,
  DataModelChangePayload,
  CreateSurfaceCommand,
  ThemePreference,
  McpResponsePayload,
} from './bridge-message';

import {IframeMcpClient} from './iframe-mcp-client';

import {SurfaceResizeObserver, type SurfaceDimensions} from './surface-resize-observer';
import {waitForContentToSettle, withinSettleCap} from './content-settle';

import type {
  SurfaceInstance,
  SurfaceGroupLike,
  RendererConfig,
  SurfaceStateSubscription,
  ComponentUsages,
  Demo,
} from './render-config';

/**
 * Debounce duration in milliseconds before rendering an error overlay.
 * Suppresses transient syntax error popups during rapid typing.
 */
export const ERROR_OVERLAY_DEBOUNCE_MS = 350;

/**
 * Window, in milliseconds, over which consecutive SURFACE_RESIZE reports are coalesced:
 * one display frame at 60 Hz (1000 / 60 ≈ 16.7). Layout passes inside one frame can't
 * be painted separately, so the host only needs the last of them. A longer window would
 * delay size changes the user can see; a shorter one would let a mount's intermediate
 * layout passes through.
 */
const SURFACE_RESIZE_COALESCE_MS = 16;

/** A SURFACE_RESIZE payload: the measured dimensions, plus readiness once the renderer reports it. */
type SurfaceResizePayload = SurfaceDimensions & {contentReady?: boolean};

/**
 * Determines whether a given value resembles an Error object.
 * Checks for the presence of standard Error properties like 'message' and 'stack'.
 *
 * @param val - The value to inspect.
 * @returns True if the value is shaped like an Error, false otherwise.
 */
export function isErrorLike(val: unknown): val is Error {
  if (val instanceof Error || Object.prototype.toString.call(val) === '[object Error]') {
    return true;
  }
  return (
    typeof val === 'object' &&
    val !== null &&
    'message' in val &&
    typeof (val as Record<string, unknown>)['message'] === 'string' &&
    'stack' in val &&
    typeof (val as Record<string, unknown>)['stack'] === 'string' &&
    !('nodeType' in val) &&
    !('component' in val)
  );
}

/**
 * Safely serializes an unknown value to a JSON string.
 * Handles cyclical structures and complex objects gracefully without throwing.
 *
 * @param val - The value to serialize.
 * @returns A JSON string representation, or a fallback string on failure.
 */
export function safeSerialize(val: unknown): string {
  function sanitize(v: unknown, seen: WeakSet<object>): unknown {
    if (typeof v === 'bigint') return `${v.toString()}n`;

    if (v !== null && typeof v === 'object') {
      // Use WeakSet to detect and skip cyclic structures without creating
      // memory leaks or strict reference loops during serialization.
      if (seen.has(v)) return '[Circular]';

      seen.add(v);
      let result: unknown;

      if (isErrorLike(v)) {
        result = {
          name: v.name || 'Error',
          message: v.message,
          stack: v.stack,
        };
      } else if (
        'nodeType' in v &&
        (v as Record<string, unknown>)['nodeType'] === 1 &&
        typeof (v as Record<string, unknown>)['tagName'] === 'string'
      ) {
        // Assert nodeType === 1 to prevent property access crashes when
        // serializing cross-realm DOM elements.
        result = `[Element: <${((v as Record<string, unknown>)['tagName'] as string).toLowerCase()}>]`;
      } else if (Array.isArray(v)) {
        result = v.map(curr => sanitize(curr, seen));
      } else {
        const objResult: Record<string, unknown> = {};
        for (const k of Object.keys(v)) {
          objResult[k] = sanitize((v as Record<string, unknown>)[k], seen);
        }
        result = objResult;
      }

      seen.delete(v);
      return result;
    }
    return v;
  }

  try {
    const res = JSON.stringify(sanitize(val, new WeakSet()));
    return res === undefined ? 'undefined' : res;
  } catch {
    return '[Unserializable]';
  }
}

/**
 * A framework-agnostic processor interface that handles A2UI protocol payloads.
 * Exposes a single method to process raw incoming action arrays.
 */
export declare interface RendererProcessor {
  /**
   * Optional reference to the underlying surface group or drawing model.
   */
  model?: {
    getSurface?(surfaceId: string): unknown;
    dispose?(): void;
  };

  /**
   * Processes the incoming message payload array.
   * @param payload The array of A2UI protocol commands.
   */
  processMessages(payload: A2uiMessage[]): void;

  /**
   * Dispatches an outbound agent function call through the renderer's RPC handler.
   */
  callAgentFunction?(
    surfaceId: string,
    call: Record<string, unknown>,
    options?: {functionCallId?: string},
  ): Promise<unknown>;
}

/**
 * Represents an active dynamic rendering connection hook mapped inside the bridge.
 */
interface ActiveRenderer {
  /** The framework-specific message processor instance. */
  processor: RendererProcessor;

  /** The configurations and dynamic callbacks. */
  config: RendererConfig;

  /** Active dynamic surface IDs tracked for deletion/reset. */
  activeSurfaceIds: Set<string>;
}

/**
 * Core inter-frame communication transport orchestrating A2UI protocol synchronization
 * between the parent Shell container and the isolated sandbox frame running the renderer stack.
 *
 * Registered as a global runtime singleton (`window.a2uiBridge`), the bridge acts as the
 * bidirectional messaging gateway that translates JSON postMessage signals into reactive framework
 * states and handles cross-origin handshakes, user interactions, overlay states, and SPA redirects.
 *
 * ### 🔄 Bidirectional Interaction Signals
 * 1. **Shell ➡️ Bridge (Incoming Messages)**:
 *    - `RENDER_A2UI`: Raw protocol layout payloads containing component layout blueprints.
 *    - `DATA_MODEL_CHANGE`: Incremental state mutations synchronized across frame contexts.
 *    - `SET_BLOCKING_STATE`: Blocks browser interactions by launching a full-screen dynamic overlay.
 *    - `GET_CATALOG`: Fetches catalog metadata definitions, stripping potential JS security prefixes.
 *    - `GET_COMPONENT_USAGES`: Requests the active renderer's registered component usage samples.
 *    - `GET_DEMOS`: Requests the active renderer's registered named demos.
 *    - `SET_THEME`: Applies a light/dark theme preference and notifies the active renderer.
 *
 * 2. **Bridge ➡️ Shell (Outgoing Messages)**:
 *    - `RENDERER_READY`: Bootstrap handshake signal dispatched when the sandbox window is ready.
 *    - `SEND_TO_SERVER`: Relays user inputs and interactions (clicks, keyups) from components back to the composer.
 *    - `DATA_MODEL_CHANGE`: Transmits state value modifications back upward for cross-surface bindings.
 *    - `FORCE_UNBLOCK`: Emergency override signal allowing users to force-unblock locked frames.
 *    - `A2UI_CATALOG`: Response to `GET_CATALOG`, carrying the resolved catalog JSON or an error.
 *    - `COMPONENT_USAGES`: Response to `GET_COMPONENT_USAGES`, carrying the resolved usage samples.
 *    - `SURFACE_RESIZE`: Broadcasts updated content dimensions whenever the rendered surface resizes.
 *    - `CONSOLE_LOG`: Forwards intercepted `console.*` output and uncaught errors to the host.
 *    - `DEMOS`: Response to `GET_DEMOS`, carrying the resolved list of named demos.
 *
 * ### 🕒 Lifecycle Phases
 *
 * #### Phase 1: Bootstrapping & Handshake
 * Instantiated on module load. Immediately hooks into window postMessage events.
 * The handshake signal `RENDERER_READY` is deferred until a dynamic framework renderer
 * has been successfully bootstrapped and attached, structurally resolving dynamic inter-frame timing races.
 *
 * #### Phase 2: Renderer Registration
 * Framework catalogs (Angular, Lit) wire themselves into the bridge context using {@link attachRenderer}.
 * This sets up core processing hooks, lifecycle state handlers (`onSurfaceReady`, `onSurfaceCleared`),
 * and reactive data binding pipelines.
 *
 * #### Phase 3: The "Two-Step Layout Dispatch"
 * To prevent rendering race-conditions, flickers, and memory leaks on hot-reloads or template swaps,
 * the bridge utilizes a specialized double-tick scheduling model upon receiving `createSurface` commands:
 * - **Step 1 (Sync Reset)**: Synchronously dispatches a `null` payload to immediately trigger unmounting/reset
 *   of any active rendering layout.
 * - **Step 2 (Deferred Mount)**: Defers rendering the actual blueprint layout to the next event loop tick
 *   using `setTimeout(..., 0)` to guarantee clean canvas initialization.
 *
 * #### Phase 4: Reactive State Mapping
 * Upon surface registration, the bridge constructs a dynamic, deep reactive observer map
 * mapping surface events to data model mutations, converting state changes to outbox posts.
 * A central connection registry manages active surface subscriptions, preventing linear memory leak growth.
 *
 * #### Phase 5: Complete Teardown
 * When the parent frame refreshes, hot-reloads, or in test environments, the {@link destroy} method
 * fully cleanses the runtime space: removing window listeners, canceling pending macro-task timers,
 * destroying overlays, and invoking connection unsubscriptions to guarantee a clean slate.
 */
export class PreviewBridge {
  /** The single active framework rendering stack connection hook. */
  private activeRenderer: ActiveRenderer | null = null;

  /** Active negotiated wire protocol version ('1.0' or 'v0.9') for the attached renderer. */
  private activeProtocolVersion: '1.0' | 'v0.9' = 'v0.9';

  /** Indicates whether the bridge is actively listening for incoming messages. */
  private isListening = false;

  /**
   * How many catalog requests have started. A stale result compares its own number
   * with this to tell whether a newer request will answer the host.
   */
  private catalogRequestCount = 0;

  /**
   * Whether the host is waiting for a catalog that no request in flight will send,
   * because the renderer it was loaded for detached first. The next renderer to
   * attach sends its catalog instead; see {@link handleSupersededCatalog}.
   */
  private isCatalogReplyOwed = false;

  /**
   * A reference to the dynamically injected blocking overlay element in the DOM, or null if no overlay is active.
   * Used to prevent user interaction and display status messages during layout processing.
   */
  private overlayElement: HTMLDivElement | null = null;

  /** The scheduled macro-task timer identifier deferred for layout payload processing. */
  private renderTimeoutId?: ReturnType<typeof setTimeout>;

  private surfaceResizeTimeoutId?: ReturnType<typeof setTimeout>;
  private forceNextSurfaceResize = false;
  private contentReady?: boolean;
  private awaitingContentRender = false;
  private settleWhenMeasurable = false;
  private contentRenderGeneration = 0;

  /** The registry of active framework surface connections currently linked and managed by the bridge. */
  private activeConnections = new Set<{unsubscribe(): void}>();

  /** Tracks the currently applied theme in the DOM to avoid redundant DOM mutations. */
  private currentAppliedTheme?: ThemePreference;

  /**
   * The last SURFACE_RESIZE payload sent, serialized. Forced measurements exist so that
   * readiness changes reach the host even when the dimensions do not; comparing the whole
   * payload keeps that guarantee while dropping reports that repeat the last one.
   */
  private lastSurfaceResizePayload: string | null = null;
  private lastSurfaceResizeSentAt = Number.NEGATIVE_INFINITY;
  private pendingSurfaceResize: SurfaceResizePayload | null = null;
  private surfaceResizeFlushId?: ReturnType<typeof setTimeout>;

  /** Handles DOM mutations and window viewport resizing to broadcast dimension updates to the host. */
  private readonly surfaceResizeObserver = new SurfaceResizeObserver(dimensions => {
    if (this.settleWhenMeasurable) {
      this.settleWhenMeasurable = false;
      this.settleMeasurableContent();
    }
    this.queueSurfaceResize(
      this.contentReady === undefined
        ? dimensions
        : {...dimensions, contentReady: this.contentReady},
    );
  });

  /**
   * Step 2 of 3 (see {@link dispatchSurfaceResize}): sends the first report of a burst at
   * once and coalesces the rest into one trailing report per SURFACE_RESIZE_COALESCE_MS. A
   * mount settles through several layout passes within a few milliseconds; reporting each
   * one gives the host a stream of intermediate sizes it would immediately overwrite, and
   * is the cadence a resize feedback loop is detected by.
   */
  private queueSurfaceResize(payload: SurfaceResizePayload): void {
    this.pendingSurfaceResize = payload;
    if (this.surfaceResizeFlushId !== undefined) {
      return;
    }
    const wait = this.lastSurfaceResizeSentAt + SURFACE_RESIZE_COALESCE_MS - Date.now();
    if (wait <= 0) {
      this.sendSurfaceResize();
      return;
    }
    this.surfaceResizeFlushId = setTimeout(() => {
      this.surfaceResizeFlushId = undefined;
      this.sendSurfaceResize();
    }, wait);
  }

  /**
   * Step 3 of 3: posts the pending SURFACE_RESIZE to the host, unless it repeats the last
   * report sent exactly.
   */
  private sendSurfaceResize(): void {
    const payload = this.pendingSurfaceResize;
    this.pendingSurfaceResize = null;
    if (!payload) {
      return;
    }
    const serialized = JSON.stringify(payload);
    if (serialized === this.lastSurfaceResizePayload) {
      return;
    }
    this.lastSurfaceResizePayload = serialized;
    this.lastSurfaceResizeSentAt = Date.now();
    this.sendMessage({type: PreviewBridgeMessageType.SURFACE_RESIZE, payload});
  }

  private readonly cachedParentOrigin: string | null = null;

  /** Cached iframe MCP proxy client. */
  private mcpClient: IframeMcpClient | null = null;

  /**
   * Returns the IframeMcpClient proxy, creating and caching it if needed.
   */
  getMcpClient(): IframeMcpClient {
    if (!this.mcpClient) {
      this.mcpClient = new IframeMcpClient(payload => {
        this.sendMessage({
          type: PreviewBridgeMessageType.MCP_REQUEST,
          payload,
        });
      });
    }
    return this.mcpClient;
  }

  /** Standalone or manually registered processor reference. */
  private manualProcessor: RendererProcessor | null = null;

  /**
   * Sets or updates the active renderer processor reference.
   *
   * @param processor The framework-specific message processor.
   */
  setActiveProcessor(processor: RendererProcessor): void {
    if (this.activeRenderer) {
      this.activeRenderer.processor = processor;
    }
    this.manualProcessor = processor;
  }

  /**
   * Returns the currently attached renderer processor, if any.
   */
  getActiveProcessor(): RendererProcessor | undefined {
    return this.activeRenderer?.processor ?? this.manualProcessor ?? undefined;
  }

  /**
   * Dispatches an outbound callAgentFunction request via the active renderer processor.
   */
  callAgentFunction(
    surfaceId: string,
    call: Record<string, unknown>,
    options?: {functionCallId?: string},
  ): Promise<unknown> {
    const processor = this.getActiveProcessor();
    if (processor && typeof processor.callAgentFunction === 'function') {
      return processor.callAgentFunction(surfaceId, call, options);
    }
    return Promise.reject(
      new Error('PreviewBridge: No active renderer processor with callAgentFunction attached'),
    );
  }

  /**
   * Initializes a new PreviewBridge instance.
   * Sets up the global window message listener, observes layout dimensions, and applies initial theme from URL if present.
   */
  constructor() {
    if (typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      this.cachedParentOrigin = params.get('origin');
    }
    this.initMessageListener();
    setupInstrumentationOverrides(this);
    this.initThemeFromUrl();
  }

  /**
   * Measures the rendered content's maximum scroll/offset dimensions and dispatches a
   * `SURFACE_RESIZE` message to the host window if dimensions have changed.
   *
   * Reports go through three steps:
   * 1. Measure: this method (or {@link scheduleSurfaceResize}, which defers it a tick) asks
   *    the SurfaceResizeObserver to measure. It skips a measurement whose dimensions
   *    match the last one, unless `force` is set.
   * 2. Coalesce: {@link queueSurfaceResize} collapses a burst into one report per
   *    SURFACE_RESIZE_COALESCE_MS.
   * 3. Send: {@link sendSurfaceResize} posts it, skipping a payload identical to the last.
   *
   * `force` matters when content readiness changes but the dimensions don't: the
   * observer would otherwise drop the measurement before step 3 sees the new readiness.
   *
   * This is triggered on:
   * 1. DOM mutations and element resize events via ResizeObserver.
   * 2. Window viewport resize events.
   * 3. Initial renderer attachment (`attachRenderer`).
   * 4. A2UI surface lifecycle events (`RENDER_A2UI` and surface clearing).
   *
   * @param force When true, bypasses the dimension deduplication cache.
   */
  dispatchSurfaceResize(force = false): void {
    this.surfaceResizeObserver.measureAndDispatch(force);
  }

  /** Measures on the next tick, once pending framework rendering has reached the DOM. */
  private scheduleSurfaceResize(force = false): void {
    if (this.surfaceResizeTimeoutId !== undefined) clearTimeout(this.surfaceResizeTimeoutId);
    this.forceNextSurfaceResize ||= force;
    this.surfaceResizeTimeoutId = setTimeout(() => {
      this.surfaceResizeTimeoutId = undefined;
      const shouldForce = this.forceNextSurfaceResize;
      this.forceNextSurfaceResize = false;
      this.dispatchSurfaceResize(shouldForce);
    }, 0);
  }

  private resetContentReadiness(): void {
    this.contentRenderGeneration++;
    this.awaitingContentRender = false;
    this.settleWhenMeasurable = false;
    this.contentReady = this.activeRenderer?.config.onInitialRender ? false : undefined;
    if (this.surfaceResizeTimeoutId !== undefined) {
      clearTimeout(this.surfaceResizeTimeoutId);
      this.surfaceResizeTimeoutId = undefined;
    }
    this.forceNextSurfaceResize = false;
  }

  private settleMeasurableContent(startedAt = Date.now()): void {
    const renderer = this.activeRenderer;
    if (this.contentReady !== false || this.awaitingContentRender || !renderer) return;
    this.awaitingContentRender = true;
    const generation = this.contentRenderGeneration;
    const superseded = () =>
      generation !== this.contentRenderGeneration || renderer !== this.activeRenderer;
    void (async () => {
      const outcome = await waitForContentToSettle({
        measure: () => this.surfaceResizeObserver.measure(),
        isCancelled: superseded,
        startedAt,
      });
      if (outcome === 'cancelled' || superseded()) return;
      this.awaitingContentRender = false;
      if (this.surfaceResizeObserver.measure() === null) {
        this.settleWhenMeasurable = true;
        return;
      }
      this.contentReady = true;
      // A readiness transition must reach the host even if the startup screen
      // and the first rendered content happen to have identical dimensions.
      this.scheduleSurfaceResize(true);
    })();
  }

  private waitForInitialContent(messages: A2uiMessage[]): void {
    const renderer = this.activeRenderer;
    if (this.contentReady !== false || this.awaitingContentRender || !renderer) return;
    const hasRoot = messages.some(message => {
      if (!message || typeof message !== 'object') return false;
      const record = message as Record<string, unknown>;
      const updateComponents = record['updateComponents'] as
        {surfaceId: string; components?: unknown[]} | undefined;
      if (
        updateComponents &&
        renderer.activeSurfaceIds.has(updateComponents.surfaceId) &&
        Array.isArray(updateComponents.components) &&
        updateComponents.components.some(
          component =>
            component &&
            typeof component === 'object' &&
            (component as Record<string, unknown>)['id'] === 'root',
        )
      ) {
        return true;
      }
      const createSurface = record['createSurface'] as
        {surfaceId: string; components?: unknown[]} | undefined;
      if (
        createSurface &&
        renderer.activeSurfaceIds.has(createSurface.surfaceId) &&
        Array.isArray(createSurface.components) &&
        createSurface.components.some(
          component =>
            component &&
            typeof component === 'object' &&
            (component as Record<string, unknown>)['id'] === 'root',
        )
      ) {
        return true;
      }
      return false;
    });
    const onInitialRender = renderer.config.onInitialRender;
    // Only renderers with the hook report readiness. Every RENDER_A2UI is still measured
    // by the caller's regular scheduleSurfaceResize, so skipping here doesn't skip that.
    if (!hasRoot || !onInitialRender) return;

    this.settleWhenMeasurable = false;
    this.awaitingContentRender = true;
    const generation = this.contentRenderGeneration;
    const superseded = () =>
      generation !== this.contentRenderGeneration || renderer !== this.activeRenderer;
    // The cap counts from the render, the moment the host's own fallback starts, so
    // a slow onInitialRender can't push readiness past it.
    const startedAt = Date.now();
    void (async () => {
      try {
        await withinSettleCap(onInitialRender(), startedAt);
        if (superseded()) return;
        this.awaitingContentRender = false;
        // The first content is in the DOM, but not necessarily at its final size: see
        // content-settle.ts. Readiness is what a host sizes its frame by once.
        this.settleMeasurableContent(startedAt);
      } catch (error) {
        if (superseded()) return;
        this.awaitingContentRender = false;
        console.error('PreviewBridge: Error waiting for surface content to render:', error);
      }
    })();
  }

  /**
   * Applies light/dark mode theme styles and attributes to document.documentElement and document.body.
   * Toggles the `.dark-theme` class, sets `color-scheme` CSS style, and `data-theme` attribute.
   *
   * @param theme The target theme ('light' or 'dark').
   */
  applyThemeToDom(theme: ThemePreference): void {
    if (typeof document === 'undefined' || !document.documentElement) return;

    this.currentAppliedTheme = theme;
    const isDark = theme === ThemePreference.DARK;

    document.documentElement.classList.toggle('dark-theme', isDark);
    document.documentElement.style.colorScheme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    if (document.body) {
      document.body.classList.toggle('dark-theme', isDark);
      document.body.style.colorScheme = theme;
      document.body.setAttribute('data-theme', theme);
    }
  }

  private initThemeFromUrl(): void {
    if (typeof window === 'undefined' || !window.location || !window.location.search) return;
    const params = new URLSearchParams(window.location.search);
    const theme = params.get('theme');
    if (theme && Object.values(ThemePreference).includes(theme as ThemePreference)) {
      this.applyThemeToDom(theme as ThemePreference);
    }
  }

  /**
   * Attaches a framework rendering processor to the bridge, centralizing payload processing,
   * dynamic surface ID extraction, and connection management.
   *
   * @param processor The framework-specific message processor.
   * @param config The configuration object containing the surface group and lifecycle callbacks.
   * @return A subscription handle to detach the renderer and clean up surface connections.
   */
  attachRenderer(processor: RendererProcessor, config: RendererConfig): SurfaceStateSubscription {
    if (!config) {
      console.error('PreviewBridge: config parameter is required in RendererConfig.');
      return {unsubscribe: () => {}};
    }
    if (!config.surfaceGroup) {
      console.error('PreviewBridge: surfaceGroup parameter is required in RendererConfig.');
      return {unsubscribe: () => {}};
    }

    if (this.activeRenderer) {
      console.warn(
        'PreviewBridge: A renderer is already attached. Replacing the previous renderer.',
      );
      this.resetActiveRendererState();
    }

    const surfaceConnection = this.connectSurfaceGroup(config.surfaceGroup);
    const activeSurfaceIds = new Set<string>();

    this.initMessageListener();
    this.activeRenderer = {
      processor,
      config,
      activeSurfaceIds,
    };
    this.activeProtocolVersion = this.inferProtocolVersionFromConfig(config);
    this.resetContentReadiness();

    if (this.currentAppliedTheme) {
      this.applyThemeToDom(this.currentAppliedTheme);
      if (config.onThemeChange) {
        try {
          config.onThemeChange(this.currentAppliedTheme);
        } catch (error) {
          console.error(
            'PreviewBridge: Error inside onThemeChange callback during attachment:',
            error,
          );
        }
      }
    }

    // Dispatches the dynamic startup handshake message to the host Shell context
    // ONLY after this modular framework application has completed its asynchronous
    // bootstrapping and attached its active renderer. This guarantees that the
    // parent receives the ready signal when the sandbox is truly capable of mounting
    // surfaces, structurally eliminating the inter-frame timing race conditions.
    this.sendMessage({
      type: PreviewBridgeMessageType.RENDERER_READY,
    });
    // The host ignores RENDERER_READY until it has the catalog it already asked for,
    // so a request the previous renderer left unanswered is answered now.
    if (this.isCatalogReplyOwed) {
      void this.handleGetCatalog();
    }

    this.dispatchSurfaceResize(true);

    const attachConnection = {
      unsubscribe: () => {
        if (this.activeRenderer?.processor === processor) {
          this.resetContentReadiness();
          if (this.renderTimeoutId !== undefined) {
            clearTimeout(this.renderTimeoutId);
            this.renderTimeoutId = undefined;
          }
          this.activeRenderer = null;
          this.activeProtocolVersion = 'v0.9';
        }
        surfaceConnection.unsubscribe();
        this.activeConnections.delete(attachConnection);
      },
    };

    this.activeConnections.add(attachConnection);
    return attachConnection;
  }

  private inferProtocolVersionFromConfig(config: RendererConfig): '1.0' | 'v0.9' {
    const candidates: unknown[] = [];
    if (config.catalogJson !== undefined) {
      candidates.push(
        ...(Array.isArray(config.catalogJson) ? config.catalogJson : [config.catalogJson]),
      );
    }
    if (config.catalog !== undefined) {
      candidates.push(...(Array.isArray(config.catalog) ? config.catalog : [config.catalog]));
    }
    if (config.catalogs !== undefined) {
      candidates.push(...(Array.isArray(config.catalogs) ? config.catalogs : [config.catalogs]));
    }
    for (const entry of candidates) {
      if (entry && typeof entry === 'object') {
        const ver = (entry as {protocolVersion?: unknown}).protocolVersion;
        if (typeof ver === 'string') {
          const v = ver.trim();
          if (v === '1.0' || v === 'v1.0' || v.startsWith('1.') || v.startsWith('v1.')) {
            return '1.0';
          }
        }
      }
    }
    return 'v0.9';
  }

  /**
   * Cleanly tears down the active bridge instance, disposing of resources and removing event listeners.
   * Unsubscribes all active surface group connections, clears pending timers, removes global window
   * listeners, deletes any active blocking overlay DOM elements, and resets internal registries.
   * Highly critical to invoke in hot-reloads or test tear-downs to avoid memory leaks and test pollution.
   */
  destroy(): void {
    this.resetContentReadiness();
    teardownInstrumentationOverrides();
    this.surfaceResizeObserver.destroy();
    if (this.surfaceResizeFlushId !== undefined) {
      clearTimeout(this.surfaceResizeFlushId);
      this.surfaceResizeFlushId = undefined;
    }
    this.pendingSurfaceResize = null;
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
    }
    if (this.renderTimeoutId !== undefined) {
      clearTimeout(this.renderTimeoutId);
      this.renderTimeoutId = undefined;
    }
    this.handleBlockingOverlay(false);
    this.isListening = false;
    this.activeRenderer = null;
    this.isCatalogReplyOwed = false;
    this.activeProtocolVersion = 'v0.9';
    this.currentAppliedTheme = undefined;

    // Clean up active connections
    const connections = Array.from(this.activeConnections);
    for (const connection of connections) {
      try {
        connection.unsubscribe();
      } catch (err) {
        console.error('PreviewBridge: Error during connection unsubscribe:', err);
      }
    }
    this.activeConnections.clear();
    this.mcpClient = null;
    this.manualProcessor = null;
  }

  private resolveExpectedParentOrigin(): string {
    if (typeof window === 'undefined') {
      return '*';
    }
    if (this.cachedParentOrigin && /^https?:\/\/[^/]+$/.test(this.cachedParentOrigin)) {
      return this.cachedParentOrigin;
    }
    return window.location.origin || '*';
  }

  /**
   * Safe cross-origin messenger that transmits a bridge message upward to the parent host window.
   * Incorporates environment checks to prevent errors in non-browser contexts and permits
   * self-transmission in test environments.
   *
   * @param message The structured bridge message package containing type and payload.
   */
  sendMessage(message: BridgeMessage): void {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      const targetOrigin = this.resolveExpectedParentOrigin();
      try {
        window.parent.postMessage(message, targetOrigin);
      } catch (error) {
        if (error instanceof DOMException) {
          console.error('[PreviewBridge] Blocked cross-origin postMessage:', error);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Envelopes and dispatches a user interaction or catalog event payload back to the Composer parent frame.
   * Wraps the event payload into a standard `SEND_TO_SERVER` message.
   *
   * @param action The declarative action payload containing click, input, or navigation events.
   * @param [version=this.activeProtocolVersion] The A2UI protocol specification version.
   */
  sendAction(action: unknown, version: string = this.activeProtocolVersion): void {
    const strategy = resolveProtocolStrategy(version);
    this.sendMessage({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: strategy.buildActionEnvelope(action),
    });
  }

  /**
   * Forwards a v1.0 outbound listener message (action, callAgentFunction, rendererFunctionResponse, error)
   * over SEND_TO_SERVER to the parent host window, stamping canonical version '1.0' if omitted.
   *
   * @param msg Outbound message payload.
   */
  sendOutboundMessage(msg: unknown): void {
    if (!msg || typeof msg !== 'object') return;
    const strategy = resolveProtocolStrategy('1.0');
    const stamped = strategy.stampOutboundMessage(msg as Record<string, unknown>);
    this.sendMessage({
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: stamped,
    });
  }

  /**
   * Event listener callback for the incoming messages from the Shell.
   *
   * Safely filters messages to ensure they originate from the same window or the parent window,
   * and dispatches incoming messaging events to specialized static methods.
   *
   * @param event The raw window message event.
   */
  private readonly messageListener = (event: MessageEvent) => {
    if (
      !DomainOriginVerificationService.verifyStrictOrigin(event.origin, event.source, window.parent)
    )
      return;

    const data = event.data as BridgeMessage;
    if (!data || typeof data !== 'object' || !data.type) return;

    switch (data.type) {
      case PreviewBridgeMessageType.SET_BLOCKING_STATE:
        this.handleSetBlockingState(data.payload);
        break;

      case PreviewBridgeMessageType.DATA_MODEL_CHANGE:
        this.handleIncomingDataModelChange(data.payload);
        break;

      case PreviewBridgeMessageType.RENDER_A2UI:
        this.dispatchRenderA2ui(
          data.payload !== undefined ? data.payload : data,
          Boolean(data.isStreaming),
        );
        break;

      case PreviewBridgeMessageType.GET_CATALOG:
        void this.handleGetCatalog();
        break;

      case PreviewBridgeMessageType.GET_COMPONENT_USAGES:
        void this.handleGetComponentUsages();
        break;

      case PreviewBridgeMessageType.GET_DEMOS:
        void this.handleGetDemos();
        break;

      case PreviewBridgeMessageType.MCP_RESPONSE:
        this.handleMcpResponse(data.payload);
        break;

      case PreviewBridgeMessageType.SET_THEME:
        this.handleSetTheme(data.payload);
        break;

      default:
        console.warn(`PreviewBridge: Unrecognized incoming message type: ${data.type}`);
    }
  };

  /**
   * Routes incoming MCP_RESPONSE messages to the IframeMcpClient pending request.
   */
  private handleMcpResponse(payload: unknown): void {
    const payloadObj = payload as McpResponsePayload | undefined;
    if (!payloadObj || typeof payloadObj.requestId !== 'string') return;
    this.mcpClient?.handleResponse(payloadObj);
  }

  /**
   * Handles incoming theme change requests.
   */
  private handleSetTheme(payload: unknown): void {
    const payloadObj = payload as SetThemePayload | undefined;
    if (payloadObj && Object.values(ThemePreference).includes(payloadObj.theme)) {
      const theme = payloadObj.theme;
      this.applyThemeToDom(theme);
      if (this.activeRenderer?.config.onThemeChange) {
        try {
          this.activeRenderer.config.onThemeChange(theme);
        } catch (error) {
          console.error('PreviewBridge: Error inside onThemeChange callback:', error);
        }
      }
    } else {
      console.warn('PreviewBridge: Malformed SET_THEME payload received:', payload);
    }
  }

  /**
   * Handles incoming blocking overlay requests.
   */
  private handleSetBlockingState(payload: unknown): void {
    const payloadObj = payload as SetBlockingStatePayload | undefined;
    const blocked = !!(payloadObj && payloadObj.blocked);
    const messageStr = payloadObj && payloadObj.message;
    this.handleBlockingOverlay(blocked, messageStr);
  }

  /**
   * Dynamic interceptor mapping incoming state changes back into a standard render lifecycle payload.
   */
  private handleIncomingDataModelChange(payload: unknown): void {
    const payloadObj = payload as DataModelChangePayload | undefined;
    if (payloadObj && payloadObj.updateDataModel) {
      const strategy = resolveProtocolStrategy(this.activeProtocolVersion);
      const renderPayload = [
        strategy.buildSyntheticEnvelope('dataModelChange', payloadObj.updateDataModel),
      ];
      this.dispatchRenderA2ui(renderPayload);
    }
  }

  /**
   * Orchestrates applying rendering payloads using the Two-Step Dispatch pattern.
   * If a createSurface instruction is present, it synchronously triggers a clear/unmount,
   * then defers the rendering actual layout command payload to a clean event cycle task.
   */
  private dispatchRenderA2ui(payload: unknown, isStreaming: boolean = false): void {
    // If a dynamic layout setup message is received before the framework application has
    // bootstrapped and attached its renderer, we print a warning and ignore the payload.
    // This should not ever happen since the host Shell is strictly designed never to dispatch
    // RENDER_A2UI messages until after RENDERER_READY is sent (which we do from attachRenderer()).
    if (!this.activeRenderer) {
      console.warn(
        'PreviewBridge: Received RENDER_A2UI but no active renderer is attached. Ignoring payload.',
      );
      return;
    }

    const version = detectProtocolVersion(Array.isArray(payload) ? payload : []);
    const strategy = resolveProtocolStrategy(version);
    const surfaceIdsToReset = strategy.extractSurfaceIdsToReset(
      Array.isArray(payload) ? payload : [],
    );
    const hasCreateSurface = surfaceIdsToReset.length > 0;

    if (hasCreateSurface) {
      // Step 1: Synchronously dispatch null to trigger unmounting/reset.
      // Omit resize measurement here since Step 2 will immediately mount and measure the new surface.
      try {
        this.handleRenderA2ui(null, isStreaming, false);
      } catch (err) {
        console.error('PreviewBridge: Error during RENDER_A2UI null reset dispatch:', err);
      }

      // Step 2: Defer actual payload dispatch to the next event loop tick to
      // trigger clean remount
      if (this.renderTimeoutId) {
        clearTimeout(this.renderTimeoutId);
      }
      this.renderTimeoutId = setTimeout(() => {
        this.renderTimeoutId = undefined;
        try {
          this.handleRenderA2ui(payload, isStreaming);
        } catch (err) {
          console.error('PreviewBridge: Error during deferred RENDER_A2UI payload dispatch:', err);
        }
      }, 0);
    } else {
      // Incremental state updates bypass the unmounting phase to prevent flicker
      try {
        this.handleRenderA2ui(payload, isStreaming);
      } catch (err) {
        console.error('PreviewBridge: Error during direct RENDER_A2UI payload dispatch:', err);
      }
    }
  }

  /**
   * Renders the specified payload array, mapping surface creation handles,
   * or delegates a resetting null command.
   */
  private handleRenderA2ui(
    payload: unknown,
    isStreaming: boolean = false,
    scheduleResize = true,
  ): void {
    if (!this.activeRenderer) return;

    if (payload === null) {
      this.resetActiveRendererState(scheduleResize);
      return;
    }

    if (Array.isArray(payload)) {
      const version = detectProtocolVersion(payload);
      let nextProtocolVersion = this.activeProtocolVersion;
      if (version === 'v1.0') {
        nextProtocolVersion = '1.0';
      } else if (
        payload.some(
          item =>
            item &&
            typeof item === 'object' &&
            typeof (item as {version?: unknown}).version === 'string',
        )
      ) {
        nextProtocolVersion = 'v0.9';
      }
      const strategy = resolveProtocolStrategy(version === 'v1.0' ? '1.0' : nextProtocolVersion);

      const createSurfaceCommands = payload.filter(
        (item: unknown) => item && typeof item === 'object' && 'createSurface' in item,
      ) as CreateSurfaceCommand[];

      let hasCreateSurface = false;
      let firstSurfaceId: string | undefined;

      for (const cmd of createSurfaceCommands) {
        const createSurface = cmd.createSurface;
        if (createSurface) {
          hasCreateSurface = true;
          const catalogId = createSurface.catalogId;
          if (catalogId) {
            this.notifyCatalogResolved(catalogId);
          }
          const surfaceId = createSurface.surfaceId;
          if (surfaceId) {
            firstSurfaceId ??= surfaceId;
            // Proactively clear any pre-existing instance of this surface in the
            // renderer processor to prevent "Surface <surfaceId> already exists"
            // collisions upon recreate.
            const deleteMessage = strategy.buildDeleteSurfaceItem(surfaceId) as A2uiMessage;
            try {
              this.activeRenderer.processor.processMessages([deleteMessage]);
            } catch (err) {
              // Surface might not exist yet; safe to proceed. Logged so genuine
              // processor failures remain diagnosable.
              console.debug('PreviewBridge: pre-delete of surface failed', surfaceId, err);
            }
            // Track the surface BEFORE processing. If a subsequent command in
            // the payload has a typo and throws an error, we still want to
            // clean this surface up next time.
            this.activeRenderer.activeSurfaceIds.add(surfaceId);
          } else {
            console.warn('PreviewBridge: createSurface command found, but no surfaceId present.');
          }
        }
      }

      let clonedPayload = payload as A2uiMessage[];
      if (typeof structuredClone === 'function') {
        try {
          clonedPayload = structuredClone(payload) as A2uiMessage[];
        } catch {
          clonedPayload = payload as A2uiMessage[];
        }
      }

      clonedPayload = strategy.normalizeIncomingMessages(clonedPayload) as A2uiMessage[];

      let rendered = false;

      try {
        this.activeRenderer.processor.processMessages(clonedPayload);
        rendered = true;
        this.activeProtocolVersion = nextProtocolVersion;

        // Clears any stale error overlay as soon as a frame renders successfully,
        // even during active streaming.
        if (this.activeRenderer.config.onError) {
          this.activeRenderer.config.onError(null);
        }
        this.sendMessage({type: PreviewBridgeMessageType.RENDER_SUCCESS});
      } catch (err: unknown) {
        console.error('PreviewBridge: Error during message processing:', err);
        if (!isStreaming && this.activeRenderer.config.onError) {
          this.activeRenderer.config.onError(err instanceof Error ? err : new Error(String(err)));
        }
        this.sendMessage({
          type: PreviewBridgeMessageType.RENDER_ERROR,
          error: safeSerialize(err),
        });
      }

      if (rendered && hasCreateSurface && firstSurfaceId) {
        this.activeRenderer.config.onSurfaceReady(firstSurfaceId);
      }

      if (rendered) {
        // Report readiness once the renderer's first content reaches the DOM (forced there,
        // because readiness changes even when dimensions don't).
        this.waitForInitialContent(payload as A2uiMessage[]);
      }
      // Measure after every render, on the next tick so asynchronous framework rendering
      // and DOM attachment complete. Not forced: readiness doesn't change here, so a
      // measurement with unchanged dimensions has nothing new to report.
      this.scheduleSurfaceResize();
    } else {
      console.warn('PreviewBridge: Unexpected non-array RENDER_A2UI payload received:', payload);
    }
  }

  /**
   * Resets active renderer properties, clearing tracking handles and posting delete signals.
   */
  private resetActiveRendererState(scheduleResize = true): void {
    this.resetContentReadiness();
    if (this.renderTimeoutId !== undefined) {
      clearTimeout(this.renderTimeoutId);
      this.renderTimeoutId = undefined;
    }
    if (!this.activeRenderer) return;

    const {processor, config, activeSurfaceIds} = this.activeRenderer;
    const strategy = resolveProtocolStrategy(this.activeProtocolVersion);
    for (const surfaceId of activeSurfaceIds) {
      try {
        processor.processMessages([strategy.buildDeleteSurfaceItem(surfaceId) as A2uiMessage]);
      } catch (e: unknown) {
        console.warn(`PreviewBridge: Error clearing surface ${surfaceId} during reset:`, e);
      }
    }
    activeSurfaceIds.clear();

    if (config.onSurfaceCleared) {
      config.onSurfaceCleared();
    }

    // Defer measurement to allow framework component unmounting and DOM cleanup to settle.
    // Forced because resetContentReadiness above set readiness back to false: the host
    // must hear that even if the empty document measures the same as the last report.
    // Skipped when dispatchRenderA2ui mounts a new surface straight after this reset;
    // that render is measured, and reports its readiness, on its own.
    if (scheduleResize) {
      this.scheduleSurfaceResize(true);
    }
  }

  /**
   * Encapsulates the multi-level reactive subscription pipeline between surface lifecycle
   * events and data model mutations, automatically formatting and transmitting synchronization
   * payloads (`DATA_MODEL_CHANGE`) back to the parent Composer window.
   * Incorporates defensive guards for mock structures and a Map Connection Registry to prevent
   * duplicate listeners and memory leaks during tab switching or hot-reloading.
   *
   * @param surfaceGroup The surface group or catalog renderer service model to connect.
   * @return A unified teardown handle exposing a single unsubscribe method to cleanly reclaim all child observers.
   */
  private connectSurfaceGroup(surfaceGroup: SurfaceGroupLike): {unsubscribe(): void} {
    const subscriptions = new Map<string, {unsubscribe(): void}>();

    if (!surfaceGroup || !surfaceGroup.onSurfaceCreated) {
      return {unsubscribe: () => {}};
    }

    const groupSubscription = surfaceGroup.onSurfaceCreated.subscribe(
      (surface: SurfaceInstance) => {
        if (!surface || typeof surface !== 'object' || !surface.id || !surface.dataModel) return;

        // Prevent duplicate observers and memory leaks when the same surface ID is re-registered
        const existing = subscriptions.get(surface.id);
        if (existing) {
          existing.unsubscribe();
          subscriptions.delete(surface.id);
        }

        try {
          const modelSub = surface.dataModel.subscribe('', (newValue: unknown) => {
            this.sendMessage({
              type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
              payload: {
                updateDataModel: {
                  surfaceId: surface.id,
                  value: newValue,
                },
              },
            });
          });
          if (modelSub) {
            subscriptions.set(surface.id, modelSub);
          }
        } catch (err: unknown) {
          console.error(`Error subscribing to data model for surface ${surface.id}:`, err);
        }
      },
    );

    const connection = {
      unsubscribe: () => {
        if (groupSubscription) {
          groupSubscription.unsubscribe();
        }
        subscriptions.forEach(sub => sub.unsubscribe());
        subscriptions.clear();
        this.activeConnections.delete(connection);
      },
    };
    this.activeConnections.add(connection);
    return connection;
  }

  /**
   * Attaches the incoming postMessage listener to the global window object.
   * Prevents redundant registrations by guarding with the `isListening` state flag
   * and checking for the presence of a browser window context.
   */
  private initMessageListener(): void {
    if (this.isListening || typeof window === 'undefined') return;

    window.addEventListener('message', this.messageListener);

    this.isListening = true;
  }

  /**
   * Manages the lifecycle and styling of the full-screen user-blocking overlay.
   * Displays status messages when layout rendering processes are active and injects a
   * manual fallback button to force-unblock interactions by notifying the parent frame.
   *
   * @param blocked Indicates if the user-blocking overlay should be shown (true) or removed (false).
   * @param [customMessage] Optional text message to display on the overlay.
   */
  private handleBlockingOverlay(blocked: boolean, customMessage?: string): void {
    if (typeof document === 'undefined' || !document.body) return;

    if (blocked) {
      if (!this.overlayElement || !this.overlayElement.isConnected) {
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'a2ui-blocking-overlay';
        Object.assign(this.overlayElement.style, {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: '999999',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          backdropFilter: 'blur(4px)',
        });

        const messageNode = document.createElement('p');
        messageNode.id = 'a2ui-blocking-message';
        messageNode.innerText = customMessage || 'Processing framework layouts...';
        this.overlayElement.appendChild(messageNode);

        const button = document.createElement('button');
        button.innerText = 'Force Unblock';
        Object.assign(button.style, {
          marginTop: '16px',
          padding: '10px 20px',
          fontSize: '15px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: '#f44336',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        });

        button.addEventListener('click', () => {
          this.sendMessage({
            type: PreviewBridgeMessageType.FORCE_UNBLOCK,
            payload: {},
          });
          this.handleBlockingOverlay(false);
        });

        this.overlayElement.appendChild(button);
        document.body.appendChild(this.overlayElement);
      } else {
        const msgElement = this.overlayElement.querySelector('#a2ui-blocking-message');
        if (msgElement) {
          (msgElement as HTMLElement).innerText =
            customMessage || 'Processing framework layouts...';
        }
      }
    } else {
      if (this.overlayElement) {
        if (this.overlayElement.parentNode) {
          this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
        this.overlayElement = null;
      }
    }
  }

  /**
   * Handles static requests to retrieve catalog configuration definitions.
   * Attempts to fetch from the catalog endpoint, implements fallback mechanisms to handle SPA
   * router redirects, strips JSON vulnerability safety prefixes, and transmits the resulting
   * JSON payload or error status back to the host container.
   */
  private async fetchWithTimeout(url: string, timeoutMs = 3000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await window.fetch(url, {signal: controller.signal});
    } finally {
      clearTimeout(id);
    }
  }

  /**
   * Normalizes a catalog definition (Catalog instance, raw schema, URL string, or factory)
   * into a standardized schema object, stamping protocolVersion and $id without mutating original objects.
   */
  private async normalizeCatalogEntry(entry: unknown): Promise<Record<string, unknown> | null> {
    let resolved = entry;
    if (typeof resolved === 'function') {
      resolved = await (resolved as () => unknown)();
    }
    if (typeof resolved === 'string') {
      const text = resolved.trim();
      const safetyPrefix = ")]}'\n";
      const withoutPrefix = text.startsWith(safetyPrefix)
        ? text.substring(safetyPrefix.length).trim()
        : text;
      if (withoutPrefix.startsWith('{') || withoutPrefix.startsWith('[')) {
        resolved = this.parseCatalogData(resolved);
      } else {
        const fetchRes = await this.fetchWithTimeout(text);
        if (!fetchRes.ok) {
          throw new Error(`Catalog fetch failed with status: ${fetchRes.status}`);
        }
        resolved = this.parseCatalogData(await fetchRes.text());
      }
    }
    if (!resolved || typeof resolved !== 'object') {
      return null;
    }

    const catObj = resolved as {
      id?: string;
      catalogId?: string;
      protocolVersion?: string;
      catalogSchema?: unknown;
      toJson?: () => unknown;
      title?: string;
      description?: string;
      name?: string;
      [key: string]: unknown;
    };

    let jsonMeta: Record<string, unknown> | null | undefined;
    const getJsonMeta = (): Record<string, unknown> | null | undefined => {
      if (jsonMeta === undefined && typeof catObj['toJson'] === 'function') {
        jsonMeta = (catObj['toJson'] as () => Record<string, unknown> | null | undefined)();
      }
      return jsonMeta;
    };

    let schema: Record<string, unknown>;
    if (catObj.catalogSchema && typeof catObj.catalogSchema === 'object') {
      schema = {...(catObj.catalogSchema as Record<string, unknown>)};
    } else {
      const meta = getJsonMeta();
      if (meta && typeof meta === 'object') {
        schema = {...meta};
      } else {
        schema = {...catObj};
      }
    }

    const id =
      (schema['catalogId'] as string | undefined) ??
      (schema['$id'] as string | undefined) ??
      catObj.id ??
      catObj.catalogId;
    if (id && typeof id === 'string') {
      if (!schema['catalogId']) schema['catalogId'] = id;
      if (!schema['$id']) schema['$id'] = id;
    }

    const version = (schema['protocolVersion'] as string | undefined) ?? catObj.protocolVersion;
    if (version) {
      schema['protocolVersion'] = version;
    }

    const title =
      (schema['title'] as string | undefined) ??
      (catObj['title'] as string | undefined) ??
      (schema['title'] === undefined && catObj['title'] === undefined
        ? (getJsonMeta()?.['title'] as string | undefined)
        : undefined);
    if (title) {
      schema['title'] = title;
    }

    const description =
      (schema['description'] as string | undefined) ??
      (catObj['description'] as string | undefined) ??
      (schema['description'] === undefined && catObj['description'] === undefined
        ? (getJsonMeta()?.['description'] as string | undefined)
        : undefined);
    if (description) {
      schema['description'] = description;
    }

    return schema;
  }

  /**
   * Normalizes a list of catalog sources into primary and composite schemas.
   */
  private async normalizeCatalogList(
    rawList: unknown[],
    isMultiCatalog: boolean,
  ): Promise<{
    primarySchema: Record<string, unknown>;
    allSchemas: Array<Record<string, unknown>>;
    isMultiCatalog: boolean;
    isInMemory: boolean;
  }> {
    const allSchemas: Array<Record<string, unknown>> = [];
    try {
      for (const item of rawList) {
        const normalized = await this.normalizeCatalogEntry(item);
        if (normalized) {
          allSchemas.push(normalized);
        }
      }

      if (allSchemas.length > 0) {
        return {
          primarySchema: allSchemas[0],
          allSchemas,
          isMultiCatalog,
          isInMemory: true,
        };
      }
      const err = new Error('Failed to resolve valid catalog from configuration.');
      (err as {isInMemory?: boolean}).isInMemory = true;
      throw err;
    } catch (err) {
      if (err && typeof err === 'object') {
        (err as {isInMemory?: boolean}).isInMemory = true;
      }
      throw err;
    }
  }

  private async fetchCatalogFromNetwork(renderer: ActiveRenderer | null): Promise<{
    primarySchema: Record<string, unknown>;
    allSchemas: Array<Record<string, unknown>>;
    isMultiCatalog: boolean;
    isInMemory: boolean;
  } | null> {
    if (typeof window === 'undefined' || !window.fetch) return null;

    let res = await this.fetchWithTimeout('catalog');
    if (!res.ok) {
      throw new Error(`Catalog fetch failed with status: ${res.status}`);
    }
    let rawText = await res.text();
    if (!this.isListening || this.activeRenderer !== renderer) {
      return null;
    }

    // Detect if the server fell back to serving HTML (SPA fallback)
    const trimmedLower = rawText.trim().toLowerCase();
    const isHtml = trimmedLower.startsWith('<!doctype') || trimmedLower.startsWith('<html');
    if (isHtml) {
      const fallbackRes = await this.fetchWithTimeout('catalog.json');
      if (!fallbackRes.ok) {
        throw new Error(
          `Catalog fetch returned HTML and fallback to catalog.json failed with status: ${fallbackRes.status}`,
        );
      }
      const fallbackText = await fallbackRes.text();
      const fallbackTrimmedLower = fallbackText.trim().toLowerCase();
      if (
        fallbackTrimmedLower.startsWith('<!doctype') ||
        fallbackTrimmedLower.startsWith('<html')
      ) {
        throw new Error(
          'Catalog fetch returned HTML (SPA fallback) for both catalog and catalog.json. Ensure the catalog JSON is correctly hosted and served.',
        );
      }
      res = fallbackRes;
      rawText = fallbackText;
    }

    const parsed = this.parseCatalogData(rawText);
    const normalized = await this.normalizeCatalogEntry(parsed);
    const allSchemas = normalized ? [normalized] : [];
    return {
      primarySchema: allSchemas[0] ?? (parsed as Record<string, unknown>),
      allSchemas,
      isMultiCatalog: false,
      isInMemory: false,
    };
  }

  /**
   * Handles a catalog result that arrived after its renderer was replaced or detached.
   *
   * The host is still waiting for a reply, and ignores RENDERER_READY until it gets
   * one, so dropping the result would leave it without a catalog until its watchdog
   * gives up. If a newer request is already answering the host, there's nothing to
   * do. Otherwise, if a renderer is attached, this requests that renderer's catalog.
   * With no renderer attached there's no catalog to send yet, so the reply is owed
   * to the host, and the next renderer to attach sends its catalog.
   *
   * @param request The number {@link handleGetCatalog} gave the stale request.
   */
  private handleSupersededCatalog(request: number): void {
    if (request !== this.catalogRequestCount) {
      return;
    }
    if (this.activeRenderer) {
      console.warn(
        "PreviewBridge: The renderer changed while its catalog was loading. Requesting the new renderer's catalog.",
      );
      void this.handleGetCatalog();
      return;
    }
    console.warn(
      'PreviewBridge: The renderer detached while its catalog was loading. The next renderer to attach will send its catalog.',
    );
    this.isCatalogReplyOwed = true;
  }

  /**
   * Coordinates in-memory retrieval (`catalogJson`, `catalog`, `catalogs`) vs. HTTP network fetching
   * (including SPA HTML fallback to `/catalog.json`).
   */
  private async resolveCatalog(renderer: ActiveRenderer | null): Promise<{
    primarySchema: Record<string, unknown>;
    allSchemas: Array<Record<string, unknown>>;
    isMultiCatalog: boolean;
    isInMemory: boolean;
  } | null> {
    const config = renderer?.config;
    const explicitOverride = config?.catalogJson ?? config?.catalog;

    if (explicitOverride !== undefined) {
      const rawList = Array.isArray(explicitOverride) ? explicitOverride : [explicitOverride];
      return this.normalizeCatalogList(rawList, rawList.length > 1);
    }

    if (config?.catalogs !== undefined) {
      const rawList = Array.isArray(config.catalogs) ? config.catalogs : [config.catalogs];
      if (rawList.length > 0) {
        const firstItem = rawList[0] as {
          protocolVersion?: unknown;
          components?: unknown;
          catalogSchema?: unknown;
          toJson?: unknown;
        } | null;
        const isSingleNonV10RuntimeCatalog =
          rawList.length === 1 &&
          Boolean(firstItem && typeof firstItem === 'object') &&
          firstItem?.components instanceof Map &&
          firstItem?.protocolVersion !== '1.0' &&
          firstItem?.protocolVersion !== 'v1.0';

        if (!isSingleNonV10RuntimeCatalog) {
          return this.normalizeCatalogList(rawList, rawList.length > 1);
        }

        const canExtractSchema =
          Boolean(firstItem?.catalogSchema && typeof firstItem.catalogSchema === 'object') ||
          typeof firstItem?.toJson === 'function';
        try {
          const networkResolved = await this.fetchCatalogFromNetwork(renderer);
          if (networkResolved) {
            return networkResolved;
          }
          if (canExtractSchema) {
            return this.normalizeCatalogList(rawList, false);
          }
          return null;
        } catch (err) {
          if (canExtractSchema) {
            return this.normalizeCatalogList(rawList, false);
          }
          throw err;
        }
      }
    }

    return this.fetchCatalogFromNetwork(renderer);
  }

  /**
   * Strips potential XSSI vulnerability prefixes (`)]}'\n`) and executes `JSON.parse()`.
   */
  private parseCatalogData(data: unknown): unknown {
    if (typeof data === 'string') {
      const safetyPrefix = ")]}'\n";
      const jsonText = data.startsWith(safetyPrefix) ? data.substring(safetyPrefix.length) : data;
      return JSON.parse(jsonText);
    }
    return data;
  }

  /**
   * Handles static requests to retrieve catalog configuration definitions.
   * Attempts to fetch from the catalog endpoint, implements fallback mechanisms to handle SPA
   * router redirects, strips JSON vulnerability safety prefixes, and transmits the resulting
   * JSON payload or error status back to the host container.
   */
  private async handleGetCatalog(): Promise<void> {
    const renderer = this.activeRenderer;
    const request = ++this.catalogRequestCount;
    // This request answers the host, whichever renderer it was owed to.
    this.isCatalogReplyOwed = false;
    let resolved: {
      primarySchema: Record<string, unknown>;
      allSchemas: Array<Record<string, unknown>>;
      isMultiCatalog: boolean;
      isInMemory: boolean;
    } | null = null;
    try {
      resolved = await this.resolveCatalog(renderer);
      if (!this.isListening) {
        return;
      }
      // An early HTTP fallback can finish after a renderer attaches its inline catalog.
      // Only the renderer that started this request may publish its result.
      if (this.activeRenderer !== renderer) {
        this.handleSupersededCatalog(request);
        return;
      }
      if (!resolved) {
        return;
      }

      const {primarySchema, allSchemas, isMultiCatalog} = resolved;
      const isV1 = allSchemas.some(schema => {
        const ver = schema['protocolVersion'];
        if (typeof ver === 'string') {
          const v = ver.trim();
          return v === '1.0' || v === 'v1.0' || v.startsWith('1.') || v.startsWith('v1.');
        }
        return false;
      });
      this.activeProtocolVersion = isV1 ? '1.0' : 'v0.9';

      const catalogId =
        (primarySchema['catalogId'] as string | undefined) ??
        (primarySchema['$id'] as string | undefined);
      if (catalogId) {
        this.notifyCatalogResolved(catalogId);
      }

      let payload: unknown;
      if (isMultiCatalog) {
        payload = {
          ...primarySchema,
          catalog: primarySchema,
          catalogs: allSchemas,
        };
      } else {
        payload = primarySchema;
      }

      this.sendMessage({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload,
      });
    } catch (error: unknown) {
      if (!this.isListening) {
        return;
      }
      if (this.activeRenderer !== renderer) {
        this.handleSupersededCatalog(request);
        return;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isInMemory = Boolean((error as {isInMemory?: boolean})?.isInMemory);
      if (isInMemory) {
        console.error('PreviewBridge: Error processing/parsing in-memory catalog:', error);
      }
      this.sendMessage({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {
          error: {
            message: errorMessage,
          },
        },
      });
    }
  }

  /**
   * Invokes the getComponentUsages callback and returns the resolved usages.
   */
  private async handleGetComponentUsages(): Promise<void> {
    let usages: ComponentUsages = {};
    if (this.activeRenderer?.config.getComponentUsages) {
      try {
        usages = await this.activeRenderer.config.getComponentUsages();
      } catch (error) {
        console.error('PreviewBridge: Error invoking getComponentUsages:', error);
      }
    }
    this.sendMessage({
      type: PreviewBridgeMessageType.COMPONENT_USAGES,
      payload: usages,
    });
  }

  /**
   * Invokes the getDemos callback and returns the resolved demos.
   */
  private async handleGetDemos(): Promise<void> {
    let demos: Demo[] = [];
    if (this.activeRenderer?.config.getDemos) {
      try {
        demos = await this.activeRenderer.config.getDemos();
      } catch (error) {
        console.error('PreviewBridge: Error invoking getDemos:', error);
        this.sendMessage({
          type: PreviewBridgeMessageType.DEMOS,
          payload: {error: 'DEMOS_PROVIDER_FAILED'},
        });
        return;
      }
    }
    this.sendMessage({
      type: PreviewBridgeMessageType.DEMOS,
      payload: demos,
    });
  }

  private lastResolvedCatalogId?: string;

  /**
   * Aligns a single catalog's ID with the resolved catalogId when exactly one catalog is configured.
   *
   * @param catalogId The resolved catalog ID.
   * @param rawCatalog The catalog or array of catalogs to alias.
   */
  aliasSingleCatalogId(catalogId: string | undefined, rawCatalog: unknown): void {
    const targetCatalogId = catalogId || this.lastResolvedCatalogId;
    if (!targetCatalogId) {
      return;
    }
    const catalogs = Array.isArray(rawCatalog)
      ? rawCatalog
      : rawCatalog !== null && typeof rawCatalog === 'object'
        ? [rawCatalog]
        : undefined;
    if (
      catalogs &&
      catalogs.length === 1 &&
      !catalogs.some(c => (c as {id?: string})?.id === targetCatalogId)
    ) {
      const firstCatalog = catalogs[0];
      if (firstCatalog && typeof firstCatalog === 'object') {
        // Catalogs come from user-supplied renderer config and may be frozen;
        // aliasing is a convenience, so a read-only object must not break
        // catalog resolution.
        try {
          (firstCatalog as unknown as {id?: string}).id = targetCatalogId;
        } catch (error: unknown) {
          console.warn(
            `PreviewBridge: Unable to alias catalog id to "${targetCatalogId}" (catalog is read-only):`,
            error,
          );
        }
      }
    }
  }

  /**
   * Safely triggers the onCatalogResolved callback if registered in the active renderer config.
   */
  private notifyCatalogResolved(catalogId: string): void {
    this.lastResolvedCatalogId = catalogId;
    if (this.activeRenderer?.config.catalogs) {
      this.aliasSingleCatalogId(catalogId, this.activeRenderer.config.catalogs);
    }
    if (this.activeRenderer?.config.onCatalogResolved) {
      try {
        this.activeRenderer.config.onCatalogResolved(catalogId);
      } catch (error: unknown) {
        console.error('PreviewBridge: Error inside onCatalogResolved callback:', error);
      }
    }
  }
}

declare global {
  interface Window {
    a2uiBridge: PreviewBridge;
  }
}

const bridgeInstance = new PreviewBridge();
if (typeof window !== 'undefined') {
  window.a2uiBridge = bridgeInstance;
}

/**
 * The global singleton Preview Bridge instance.
 */
export const a2uiBridge = bridgeInstance;
