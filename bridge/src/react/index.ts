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

import {useState, useEffect} from 'react';
import {MessageProcessor, Catalog, ComponentApi, SurfaceModel} from '@a2ui/web_core/v0_9';
import {a2uiBridge} from '../preview-bridge.js';

export interface UseA2uiSandboxResult<C extends ComponentApi = ComponentApi> {
  /** The reactive dynamic surface drawing model representing the active canvas. */
  surface: SurfaceModel<C> | undefined;
}

export interface ReactSandboxOptions {
  /** Optional preloaded catalog JSON data, provided directly in memory. */
  catalogJson?: unknown;
}

/**
 * A dynamic React hook that orchestrates the inter-frame PreviewBridge connection.
 * Automatically registers state observers, binds catalog processors, maps surface lifecycle
 * events reactively, and dispatches dynamic unmount cleanups during hook unmount to prevent memory leaks.
 *
 * @param catalogs The array of component catalogs matching A2UI specifications.
 * @param options Optional configuration payloads.
 * @returns A reactive state object containing the active surface drawing model.
 */
export function useA2uiSandbox<C extends ComponentApi = ComponentApi>(
  catalogs: Catalog<C>[],
  options?: ReactSandboxOptions,
): UseA2uiSandboxResult<C> {
  const [surface, setSurface] = useState<SurfaceModel<C> | undefined>(undefined);

  useEffect(() => {
    // Instantiates a new dynamic MessageProcessor mapping outbound event actions
    const processor = new MessageProcessor(catalogs, action => {
      a2uiBridge.sendAction(action);
    });

    // Connects the renderer stack and establishes inter-frame callbacks
    const connection = a2uiBridge.attachRenderer(processor, {
      surfaceGroup: processor.model,
      catalog: options?.catalogJson,
      onSurfaceReady: surfaceId => {
        setSurface(processor.model.getSurface(surfaceId));
      },
      onSurfaceCleared: () => {
        setSurface(undefined);
      },
    });

    // Standard React Hook cleanup: disposes connections and releases event listener subscriptions
    return () => {
      connection.unsubscribe();
    };
  }, []);

  return {surface};
}
