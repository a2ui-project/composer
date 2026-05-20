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

declare const process: {env?: {NODE_ENV?: string}} | undefined;
import './instrumentation-overrides';

import type {A2uiMessage} from '@a2ui/web_core/v0_9';

/**
 * Represents a message structure transmitted across the Preview Bridge iframe boundary.
 */
export interface BridgeMessage {
  /** The unique type identifier representing the event. */
  type: string;
  /** Optional payload data associated with the message event. */
  payload?: unknown;
  /** Extensible custom properties. */
  [key: string]: unknown;
}

/**
 * A callback function signature for handling dispatched Bridge Messages.
 *
 * @param payload The un-enveloped event payload data.
 */
export type MessageHandler = (payload: unknown) => void;

/**
 * A lightweight, framework-agnostic representation of an observable data model stream.
 * Enables subscribing to reactive updates on component value states.
 */
export interface DataModelObservable {
  /**
   * Subscribes a callback function to be notified of data model updates.
   *
   * @param path The nested object path to observe (empty string for the root model).
   * @param cb The callback executed with the updated data model value payload.
   * @returns A subscription handle exposing an unsubscribe cleanup method.
   */
  subscribe(path: string, cb: (val: unknown) => void): {unsubscribe(): void};
}

/**
 * Represents an active component surface instance rendered within a sandbox container.
 */
export interface SurfaceInstance {
  /** The unique identifier of the surface, corresponding to a Composer surface layout. */
  id: string;
  /** The reactive data model observable facilitating component value synchronization. */
  dataModel: DataModelObservable;
}

/**
 * A framework-agnostic structural interface representing a collection or group of rendering surfaces.
 */
export interface SurfaceGroupLike {
  /** An observable stream emitting notifications when a new surface instance is created. */
  onSurfaceCreated: {
    /**
     * Subscribes a callback to listen to new surface creation events.
     *
     * @param cb The callback executed with the newly created surface instance.
     * @returns A subscription handle exposing an unsubscribe cleanup method.
     */
    subscribe(cb: (surface: SurfaceInstance) => void): {unsubscribe(): void};
  };
}

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

/** Configuration and lifecycle callbacks for attaching a renderer. */
export interface RendererConfig {
  /** The reactive surface group model to connect for data synchronization. */
  surfaceGroup: SurfaceGroupLike;
  /** Invoked with the dynamic surfaceId when a new surface layout is built. */
  onSurfaceReady: (surfaceId: string) => void;
  /** Invoked when the surface needs to unmount or reset. */
  onSurfaceCleared?: () => void;
}

/** A subscription handle to detach a renderer and clean up connections. */
export interface SurfaceStateSubscription {
  /** Unsubscribes the renderer and cleans up all active bridge bindings. */
  unsubscribe(): void;
}

/**
 * Inter-frame communication bridge establishing connection pathways
 * between the catalog container and the rendering shell host.
 */
export class PreviewBridge {
  /**
   * A registry mapping message type string keys to a set of registered callback functions.
   * Used to dispatch incoming messages from the parent frame to their respective processors.
   */
  private processors = new Map<string, Set<MessageHandler>>();

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

  /** The scheduled macro-task timer identifier deferred for DOM readiness handshake. */
  private handshakeTimeoutId?: ReturnType<typeof setTimeout>;

  /** The scheduled macro-task timer identifier deferred for layout payload processing. */
  private renderTimeoutId?: ReturnType<typeof setTimeout>;

  /** The registry of active framework surface connections currently linked and managed by the bridge. */
  private activeConnections = new Set<{unsubscribe(): void}>();

  /**
   * Event listener callback for the global window 'message' event.
   * Safely filters messages to ensure they originate from the same window or the parent window,
   * handles blocking state transitions (`SET_BLOCKING_STATE`), and dispatches the payload
   * to any registered message processor callbacks.
   *
   * @param event The raw window message event.
   */
  private readonly messageListener = (event: MessageEvent) => {
    if (event.source !== window.parent && event.source !== window) return;

    const data = event.data as BridgeMessage;
    if (!data || typeof data !== 'object' || !data.type) return;

    if (data.type === 'SET_BLOCKING_STATE') {
      const payloadObj = data.payload as {blocked?: boolean; message?: string} | undefined;
      const blocked = !!(payloadObj && payloadObj.blocked);
      const messageStr = payloadObj && payloadObj.message;
      this.handleBlockingOverlay(blocked, messageStr);
    }

    // Central Interceptor: Route Composer Data Model debugger edits directly to RENDER_A2UI
    if (data.type === 'DATA_MODEL_CHANGE') {
      const payloadObj = data.payload as {updateDataModel?: unknown} | undefined;
      if (payloadObj && payloadObj.updateDataModel) {
        const renderPayload = [
          {
            version: 'v0.9',
            updateDataModel: payloadObj.updateDataModel,
          },
        ];
        const RENDERER_HANDLERS = this.processors.get('RENDER_A2UI');
        if (RENDERER_HANDLERS) {
          Array.from(RENDERER_HANDLERS).forEach(handler => {
            try {
              handler(renderPayload);
            } catch (err) {
              console.error('PreviewBridge: Error dispatching RENDER_A2UI payload:', err);
            }
          });
        }
        return;
      }
    }

    // Central Interceptor: Enforce robust Two-Step Dispatch on layout re-creation
    if (data.type === 'RENDER_A2UI') {
      const payload = data.payload !== undefined ? data.payload : data;
      const renderHandlers = this.processors.get('RENDER_A2UI');
      if (renderHandlers) {
        const hasCreateSurface =
          Array.isArray(payload) &&
          payload.some(item => item && typeof item === 'object' && 'createSurface' in item);

        if (hasCreateSurface) {
          // Step 1: Synchronously dispatch null to trigger unmounting/reset
          Array.from(renderHandlers).forEach(handler => {
            try {
              handler(null);
            } catch (err) {
              console.error(
                'PreviewBridge: Error dispatching RENDER_A2UI null reset payload:',
                err,
              );
            }
          });

          // Step 2: Defer actual payload dispatch to the next event loop tick to trigger clean remount
          if (this.renderTimeoutId) {
            clearTimeout(this.renderTimeoutId);
          }
          this.renderTimeoutId = setTimeout(() => {
            Array.from(renderHandlers).forEach(handler => {
              try {
                handler(payload);
              } catch (err) {
                console.error('PreviewBridge: Error dispatching RENDER_A2UI actual payload:', err);
              }
            });
          }, 0);
          return;
        }
      }
    }

    const handlers = this.processors.get(data.type);
    if (handlers) {
      const payload = data.payload !== undefined ? data.payload : data;
      Array.from(handlers).forEach(handler => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`Error executing message processor for type ${data.type}:`, err);
        }
      });
    }
  };

  /**
   * Event listener callback executed when the DOM content is fully loaded.
   * Dispatches the initial handshake notification message (`RENDERER_READY`) to the parent host frame.
   */
  private readonly domContentLoadedListener = () => {
    this.sendMessage({type: 'RENDERER_READY'});
  };

  /**
   * Initializes a new PreviewBridge instance.
   * Sets up the message listener, starts the lifecycle handshake timer, and registers
   * the catalog query handlers to establish frame communication.
   */
  constructor() {
    this.initMessageListener();
    this.initLifecycleHandshake();
    this.initCatalogHandler();
  }

  /**
   * Registers a callback function to handle incoming bridge messages of a specific type.
   * Multiple handlers can be registered for a single message type.
   *
   * @param type The unique message event type identifier.
   * @param handler The callback function executed with the message payload.
   */
  private registerMessageProcessor(type: string, handler: MessageHandler): void {
    if (!this.processors.has(type)) {
      this.processors.set(type, new Set<MessageHandler>());
    }
    this.processors.get(type)!.add(handler);
  }

  /**
   * Unregisters a previously registered message handler from a specific message type.
   * If no handlers remain for the type, the type is removed from the registry to reclaim memory.
   *
   * @param type The unique message event type identifier.
   * @param handler The callback function to remove.
   */
  private unregisterMessageProcessor(type: string, handler: MessageHandler): void {
    const handlers = this.processors.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.processors.delete(type);
      }
    }
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
        (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'))
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
    this.sendMessage({
      type: 'SEND_TO_SERVER',
      payload: {version, action},
    });
  }

  /**
   * Encapsulates the multi-level reactive subscription pipeline between surface lifecycle
   * events and data model mutations, automatically formatting and transmitting synchronization
   * payloads (`DATA_MODEL_CHANGE`) back to the parent Composer window.
   * Incorporates defensive guards for mock structures and a Map Connection Registry to prevent
   * duplicate listeners and linear memory leaks during tab switching or hot-reloading.
   *
   * @param surfaceGroup The surface group or catalog renderer service model to connect.
   * @returns A unified teardown handle exposing a single unsubscribe method to cleanly reclaim all child observers.
   */
  private connectSurfaceGroup(surfaceGroup: SurfaceGroupLike): {unsubscribe(): void} {
    const subscriptions = new Map<string, {unsubscribe(): void}>();

    const groupSubscription = surfaceGroup.onSurfaceCreated.subscribe(
      (surface: SurfaceInstance) => {
        if (!surface || typeof surface !== 'object' || !surface.id || !surface.dataModel) return;

        // Risk 2 Guard: Prevent linear growth and duplicate observers for the same surface ID
        const existing = subscriptions.get(surface.id);
        if (existing) {
          existing.unsubscribe();
          subscriptions.delete(surface.id);
        }

        try {
          const modelSub = surface.dataModel.subscribe('', (newValue: unknown) => {
            this.sendMessage({
              type: 'DATA_MODEL_CHANGE',
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
        } catch (err) {
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
        // Remove itself from Set upon unsubscription
        this.activeConnections.delete(connection);
      },
    };
    this.activeConnections.add(connection);
    return connection;
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
    if (!config.surfaceGroup) {
      console.error('PreviewBridge: surfaceGroup parameter is required in RendererConfig.');
      return {unsubscribe: () => {}};
    }

    const surfaceConnection = this.connectSurfaceGroup(config.surfaceGroup);
    const activeSurfaceIds = new Set<string>();

    const renderHandler = (payload: unknown) => {
      if (payload === null) {
        for (const surfaceId of activeSurfaceIds) {
          try {
            processor.processMessages([
              {version: 'v0.9', deleteSurface: {surfaceId}} as A2uiMessage,
            ]);
          } catch (e: unknown) {
            console.warn(`PreviewBridge: Error clearing surface ${surfaceId} during reset:`, e);
          }
        }
        activeSurfaceIds.clear();

        if (config.onSurfaceCleared) {
          config.onSurfaceCleared();
        }

        return;
      }

      if (Array.isArray(payload)) {
        const createSurfaceCommand = payload.find(
          (item: unknown) => item && typeof item === 'object' && 'createSurface' in item,
        ) as {createSurface?: {surfaceId?: string}} | undefined;

        if (createSurfaceCommand && createSurfaceCommand.createSurface) {
          const surfaceId = createSurfaceCommand.createSurface.surfaceId;
          if (surfaceId) {
            // Track the surface BEFORE processing. If a subsequent command in
            // the payload has a typo and throws an error, we still want to
            // clean this surface up next time.
            activeSurfaceIds.add(surfaceId);
          } else {
            console.warn('PreviewBridge: createSurface command found, but no surfaceId present.');
          }
        }

        processor.processMessages(payload as A2uiMessage[]);

        if (createSurfaceCommand && createSurfaceCommand.createSurface?.surfaceId) {
          config.onSurfaceReady(createSurfaceCommand.createSurface.surfaceId);
        }
      } else {
        console.warn('PreviewBridge: Unexpected non-array RENDER_A2UI payload received:', payload);
      }
    };

    this.registerMessageProcessor('RENDER_A2UI', renderHandler);

    const attachConnection = {
      unsubscribe: () => {
        this.unregisterMessageProcessor('RENDER_A2UI', renderHandler);
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
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
      window.removeEventListener('DOMContentLoaded', this.domContentLoadedListener);
    }
    if (this.handshakeTimeoutId !== undefined) {
      clearTimeout(this.handshakeTimeoutId);
      this.handshakeTimeoutId = undefined;
    }
    this.processors.clear();
    this.handleBlockingOverlay(false);
    this.isListening = false;

    // Clean up active connections
    for (const connection of this.activeConnections) {
      connection.unsubscribe();
    }
    this.activeConnections.clear();
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
          this.sendMessage({type: 'FORCE_UNBLOCK', payload: {}});
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
   * Initiates the synchronization handshake with the host application.
   * Checks if the document is already parsed and interactive to immediately schedule
   * the ready notification, or attaches a listener to the DOMContentLoaded event otherwise.
   */
  private initLifecycleHandshake(): void {
    if (typeof document !== 'undefined') {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        this.handshakeTimeoutId = setTimeout(this.domContentLoadedListener, 0);
      } else {
        window.addEventListener('DOMContentLoaded', this.domContentLoadedListener);
      }
    }
  }

  /**
   * Registers a message handler for retrieving the catalog definition configurations.
   * Attempts to fetch from the catalog endpoint, implements fallback mechanisms to handle SPA
   * router redirects, strips JSON vulnerability safety prefixes, and transmits the resulting
   * JSON payload or error status back to the host container.
   */
  private initCatalogHandler(): void {
    this.registerMessageProcessor('GET_CATALOG', async () => {
      if (typeof window === 'undefined' || !window.fetch) return;
      try {
        let res = await window.fetch('/catalog');
        if (!res.ok) {
          throw new Error(`Catalog fetch failed with status: ${res.status}`);
        }
        let rawText = await res.text();

        // Detect if the server fell back to serving HTML (SPA fallback)
        const isHtml =
          rawText.trim().startsWith('<!doctype html') ||
          rawText.trim().toLowerCase().startsWith('<html');
        if (isHtml) {
          const fallbackRes = await window.fetch('/catalog.json');
          if (!fallbackRes.ok) {
            throw new Error(
              `Catalog fetch returned HTML and fallback to /catalog.json failed with status: ${fallbackRes.status}`,
            );
          }
          res = fallbackRes;
          rawText = await res.text();
        }

        const safetyPrefix = ")]}'\n";
        const jsonText = rawText.startsWith(safetyPrefix)
          ? rawText.substring(safetyPrefix.length)
          : rawText;
        const catalog = JSON.parse(jsonText);
        this.sendMessage({
          type: 'A2UI_CATALOG',
          payload: {catalog},
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.sendMessage({
          type: 'A2UI_CATALOG',
          payload: {catalog: {}, error: {message: errorMessage}},
        });
      }
    });
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
