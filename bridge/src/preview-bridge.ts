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
  PreviewBridgeMessageType,
  BridgeMessage,
  SetBlockingStatePayload,
  DataModelChangePayload,
  CreateSurfaceCommand,
} from './bridge-message';
export * from './bridge-message';

import type {
  DataModelObservable,
  SurfaceInstance,
  SurfaceGroupLike,
  RendererConfig,
  SurfaceStateSubscription,
  ComponentUsages,
  ComponentUsage,
} from './render-config';

export type {
  DataModelObservable,
  SurfaceInstance,
  SurfaceGroupLike,
  RendererConfig,
  SurfaceStateSubscription,
  ComponentUsages,
  ComponentUsage,
};

/**
 * A framework-agnostic processor interface that handles A2UI protocol payloads.
 * Exposes a single method to process raw incoming action arrays.
 */
export interface RendererProcessor {
  /**
   * Processes the incoming message payload array.
   * @param payload The array of A2UI protocol commands.
   */
  processMessages(payload: A2uiMessage[]): void;
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
 *
 * 2. **Bridge ➡️ Shell (Outgoing Messages)**:
 *    - `RENDERER_READY`: Bootstrap handshake signal dispatched when the sandbox window is ready.
 *    - `SEND_TO_SERVER`: Relays user inputs and interactions (clicks, keyups) from components back to the composer.
 *    - `DATA_MODEL_CHANGE`: Transmits state value modifications back upward for cross-surface bindings.
 *    - `FORCE_UNBLOCK`: Emergency override signal allowing users to force-unblock locked frames.
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

  /**
   * A state flag indicating whether the bridge is actively listening to global window message events.
   * Prevents duplicate event listener registration on the window object.
   */
  private isListening = false;

  /**
   * A reference to the dynamically injected blocking overlay element in the DOM, or null if no overlay is active.
   * Used to prevent user interaction and display status messages during layout processing.
   */
  private overlayElement: HTMLDivElement | null = null;

  /** The scheduled macro-task timer identifier deferred for layout payload processing. */
  private renderTimeoutId?: ReturnType<typeof setTimeout>;

  /** The registry of active framework surface connections currently linked and managed by the bridge. */
  private activeConnections = new Set<{unsubscribe(): void}>();

  /**
   * Initializes a new PreviewBridge instance.
   * Sets up the global window message listener.
   */
  constructor() {
    this.initMessageListener();
    setupInstrumentationOverrides(this);
  }

  /**
   * Attaches a framework rendering processor to the bridge, centralizing payload processing,
   * dynamic surface ID extraction, and connection management.
   *
   * @param processor The framework-specific message processor.
   * @param config The configuration object containing the surface group and lifecycle callbacks.
   * @returns A subscription handle to detach the renderer and clean up surface connections.
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

    this.activeRenderer = {
      processor,
      config,
      activeSurfaceIds,
    };

    // Dispatches the dynamic startup handshake message to the host Shell context
    // ONLY after this modular framework application has completed its asynchronous
    // bootstrapping and attached its active renderer. This guarantees that the
    // parent receives the ready signal when the sandbox is truly capable of mounting
    // surfaces, structurally eliminating the inter-frame timing race conditions.
    // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
    // prettier-ignore
    this.sendMessage({
      'type': PreviewBridgeMessageType.RENDERER_READY,
    });

    const attachConnection = {
      unsubscribe: () => {
        if (this.activeRenderer?.processor === processor) {
          this.activeRenderer = null;
        }
        surfaceConnection.unsubscribe();
        this.activeConnections.delete(attachConnection);
      },
    };

    this.activeConnections.add(attachConnection);
    return attachConnection;
  }

  /**
   * Cleanly tears down the active bridge instance, disposing of resources and removing event listeners.
   * Unsubscribes all active surface group connections, clears pending timers, removes global window
   * listeners, deletes any active blocking overlay DOM elements, and resets internal registries.
   * Highly critical to invoke in hot-reloads or test tear-downs to avoid memory leaks and test pollution.
   */
  destroy(): void {
    teardownInstrumentationOverrides();
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
  }

  /**
   * Safe cross-origin messenger that transmits a bridge message upward to the parent host window.
   * Incorporates environment checks to prevent errors in non-browser contexts and permits
   * self-transmission in test environments.
   *
   * @param message The structured bridge message package containing type and payload.
   */
  sendMessage(message: BridgeMessage): void {
    if (
      typeof window !== 'undefined' &&
      window.parent &&
      (window.parent !== window ||
        (globalThis as unknown as {process?: {env?: {NODE_ENV?: string}}}).process?.env
          ?.NODE_ENV === 'test')
    ) {
      window.parent.postMessage(message, '*');
    }
  }

  /**
   * Envelopes and dispatches a user interaction or catalog event payload back to the Composer parent frame.
   * Wraps the event payload into a standard `SEND_TO_SERVER` message.
   *
   * @param action The declarative action payload containing click, input, or navigation events.
   * @param [version='v0.9'] The A2UI protocol specification version.
   */
  sendAction(action: unknown, version = 'v0.9'): void {
    // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
    // prettier-ignore
    this.sendMessage({
      'type': PreviewBridgeMessageType.SEND_TO_SERVER,
      'payload': {
        'version': version,
        'action': action,
      },
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
    if (event.source !== window.parent && event.source !== window) return;

    const data = event.data as BridgeMessage;
    // NOTE: Bracket notation is used to access properties on the parsed postMessage event
    // to prevent compilers from renaming these property accesses during minification.
    if (!data || typeof data !== 'object' || !data['type']) return;

    switch (data['type']) {
      case PreviewBridgeMessageType.SET_BLOCKING_STATE:
        this.handleSetBlockingState(data['payload']);
        break;

      case PreviewBridgeMessageType.DATA_MODEL_CHANGE:
        this.handleIncomingDataModelChange(data['payload']);
        break;

      case PreviewBridgeMessageType.RENDER_A2UI:
        this.dispatchRenderA2ui(data['payload'] !== undefined ? data['payload'] : data);
        break;

      case PreviewBridgeMessageType.GET_CATALOG:
        void this.handleGetCatalog();
        break;

      case PreviewBridgeMessageType.GET_COMPONENT_USAGES:
        void this.handleGetComponentUsages();
        break;

      default:
        console.warn(`PreviewBridge: Unrecognized incoming message type: ${data['type']}`);
    }
  };

  /**
   * Handles incoming blocking overlay requests.
   */
  private handleSetBlockingState(payload: unknown): void {
    // NOTE: Bracket notation is used to access properties on cross-frame message payloads
    // to prevent compilers from renaming these properties during production minification.
    const payloadObj = payload as SetBlockingStatePayload | undefined;
    const blocked = !!(payloadObj && payloadObj['blocked']);
    const messageStr = payloadObj && payloadObj['message'];
    this.handleBlockingOverlay(blocked, messageStr);
  }

  /**
   * Dynamic interceptor mapping incoming state changes back into a standard render lifecycle payload.
   */
  private handleIncomingDataModelChange(payload: unknown): void {
    // NOTE: Bracket notation is used to access properties on cross-frame message payloads
    // to prevent compilers from renaming these properties during production minification.
    const payloadObj = payload as DataModelChangePayload | undefined;
    if (payloadObj && payloadObj['updateDataModel']) {
      // prettier-ignore
      const renderPayload = [
        {
          'version': 'v0.9',
          'updateDataModel': payloadObj['updateDataModel'],
        },
      ];
      this.dispatchRenderA2ui(renderPayload);
    }
  }

  /**
   * Orchestrates applying rendering payloads using the Two-Step Dispatch pattern.
   * If a createSurface instruction is present, it synchronously triggers a clear/unmount,
   * then defers the rendering actual layout command payload to a clean event cycle task.
   */
  private dispatchRenderA2ui(payload: unknown): void {
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

    const hasCreateSurface =
      Array.isArray(payload) &&
      payload.some(item => item && typeof item === 'object' && 'createSurface' in item);

    if (hasCreateSurface) {
      // Step 1: Synchronously dispatch null to trigger unmounting/reset
      try {
        this.handleRenderA2ui(null);
      } catch (err) {
        console.error('PreviewBridge: Error during RENDER_A2UI null reset dispatch:', err);
      }

      // Step 2: Defer actual payload dispatch to the next event loop tick to trigger clean remount
      if (this.renderTimeoutId) {
        clearTimeout(this.renderTimeoutId);
      }
      this.renderTimeoutId = setTimeout(() => {
        try {
          this.handleRenderA2ui(payload);
        } catch (err) {
          console.error('PreviewBridge: Error during deferred RENDER_A2UI payload dispatch:', err);
        }
      }, 0);
    } else {
      // Incremental state updates bypass the unmounting phase to prevent flicker
      try {
        this.handleRenderA2ui(payload);
      } catch (err) {
        console.error('PreviewBridge: Error during direct RENDER_A2UI payload dispatch:', err);
      }
    }
  }

  /**
   * Renders the specified payload array, mapping surface creation handles,
   * or delegates a resetting null command.
   */
  private handleRenderA2ui(payload: unknown): void {
    if (!this.activeRenderer) return;

    if (payload === null) {
      this.resetActiveRendererState();
      return;
    }

    if (Array.isArray(payload)) {
      const createSurfaceCommand = payload.find(
        (item: unknown) => item && typeof item === 'object' && 'createSurface' in item,
      ) as CreateSurfaceCommand | undefined;

      let hasCreateSurface = false;
      let surfaceId: string | undefined;
      const createSurface = createSurfaceCommand && createSurfaceCommand['createSurface'];
      if (createSurface) {
        hasCreateSurface = true;
        const catalogId = createSurface['catalogId'];
        if (catalogId) {
          this.notifyCatalogResolved(catalogId);
        }
        surfaceId = createSurface['surfaceId'];
        if (surfaceId) {
          // Track the surface BEFORE processing. If a subsequent command in
          // the payload has a typo and throws an error, we still want to
          // clean this surface up next time.
          this.activeRenderer.activeSurfaceIds.add(surfaceId);
        } else {
          console.warn('PreviewBridge: createSurface command found, but no surfaceId present.');
        }
      }

      this.activeRenderer.processor.processMessages(payload as A2uiMessage[]);

      if (hasCreateSurface && surfaceId) {
        this.activeRenderer.config.onSurfaceReady(surfaceId);
      }
    } else {
      console.warn('PreviewBridge: Unexpected non-array RENDER_A2UI payload received:', payload);
    }
  }

  /**
   * Resets active renderer properties, clearing tracking handles and posting delete signals.
   */
  private resetActiveRendererState(): void {
    if (!this.activeRenderer) return;

    const {processor, config, activeSurfaceIds} = this.activeRenderer;
    for (const surfaceId of activeSurfaceIds) {
      try {
        processor.processMessages([
          {
            version: 'v0.9',
            deleteSurface: {surfaceId},
          } as A2uiMessage,
        ]);
      } catch (e: unknown) {
        console.warn(`PreviewBridge: Error clearing surface ${surfaceId} during reset:`, e);
      }
    }
    activeSurfaceIds.clear();

    if (config.onSurfaceCleared) {
      config.onSurfaceCleared();
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
   * @returns A unified teardown handle exposing a single unsubscribe method to cleanly reclaim all child observers.
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
            // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
            // prettier-ignore
            this.sendMessage({
              'type': PreviewBridgeMessageType.DATA_MODEL_CHANGE,
              'payload': {
                'updateDataModel': {
                  'surfaceId': surface.id,
                  'value': newValue,
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
          // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
          // prettier-ignore
          this.sendMessage({
            'type': PreviewBridgeMessageType.FORCE_UNBLOCK,
            'payload': {},
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
   * Coordinates in-memory retrieval (`catalogJson`) vs. HTTP network fetching
   * (including SPA HTML fallback to `/catalog.json`).
   */
  private async resolveCatalog(): Promise<{
    rawData: unknown;
    isInMemory: boolean;
  } | null> {
    const config = this.activeRenderer?.config;
    const inMemoryCatalog = config?.catalogJson ?? config?.catalog;
    if (inMemoryCatalog !== undefined) {
      return {rawData: inMemoryCatalog, isInMemory: true};
    }

    if (typeof window === 'undefined' || !window.fetch) return null;

    let res = await this.fetchWithTimeout('catalog');
    if (!res.ok) {
      throw new Error(`Catalog fetch failed with status: ${res.status}`);
    }
    let rawText = await res.text();

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

    return {rawData: rawText, isInMemory: false};
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
    let resolved: {rawData: unknown; isInMemory: boolean} | null = null;
    try {
      resolved = await this.resolveCatalog();
      if (!resolved) return;

      const catalog = this.parseCatalogData(resolved.rawData);

      const catalogId = (catalog as Record<string, unknown> | undefined)?.['catalogId'] as
        | string
        | undefined;
      if (catalogId) {
        this.notifyCatalogResolved(catalogId);
      }

      // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
      // prettier-ignore
      this.sendMessage({
        'type': PreviewBridgeMessageType.A2UI_CATALOG,
        'payload': catalog,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (resolved?.isInMemory) {
        console.error('PreviewBridge: Error processing/parsing in-memory catalog:', error);
      }
      // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
      // prettier-ignore
      this.sendMessage({
        'type': PreviewBridgeMessageType.A2UI_CATALOG,
        'payload': {
          'error': {
            'message': errorMessage,
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
    // NOTE: Quoted keys prevent compiler minification renaming across frame boundaries.
    // prettier-ignore
    this.sendMessage({
      'type': PreviewBridgeMessageType.COMPONENT_USAGES,
      'payload': usages,
    });
  }

  /**
   * Safely triggers the onCatalogResolved callback if registered in the active renderer config.
   */

  private notifyCatalogResolved(catalogId: string): void {
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
