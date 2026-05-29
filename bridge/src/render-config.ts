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

/** Configuration and lifecycle callbacks for attaching a renderer. */
export interface RendererConfig {
  /** The reactive surface group model to connect for data synchronization. */
  surfaceGroup: SurfaceGroupLike;
  /** Invoked with the dynamic surfaceId when a new surface layout is built. */
  onSurfaceReady: (surfaceId: string) => void;
  /** Invoked when the surface needs to unmount or reset. */
  onSurfaceCleared?: () => void;
  /** A pre-loaded in-memory component/layout catalog payload definition. */
  catalog?: unknown;
  /** Preloaded registered catalog component lists shared natively. */
  catalogs?: unknown[];
}

/** A subscription handle to detach a renderer and clean up connections. */
export interface SurfaceStateSubscription {
  /** Unsubscribes the renderer and cleans up all active bridge bindings. */
  unsubscribe(): void;
}
