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

import {useState, useEffect, useRef} from 'react';
import {
  MessageProcessor,
  SurfaceModel,
  Catalog,
  ComponentApi,
  A2uiClientAction,
} from '@a2ui/web_core/v0_9';
import {a2uiBridge, ThemePreference, CatalogDetails, ComponentUsages, Demo} from '../index.js';

export interface UseA2uiSandboxResult<C extends ComponentApi = ComponentApi> {
  /** The reactive dynamic surface drawing model representing the active canvas. */
  surface: SurfaceModel<C> | undefined;
}

export interface ReactSandboxOptions {
  /** Optional preloaded catalog JSON data, provided directly in memory. */
  catalogJson?: unknown;
  /** Optional callback to retrieve component usage samples. */
  getComponentUsages?: () => Promise<ComponentUsages>;
  /** Optional callback when theme changes. */
  onThemeChange?: (theme: ThemePreference) => void;
  /** Optional callback to retrieve the renderer's demos. */
  getDemos?: () => Promise<Demo[]>;
}

/**
 * A dynamic React hook that orchestrates the inter-frame PreviewBridge connection.
 * Automatically registers state observers, binds catalog processors, maps surface lifecycle
 * events reactively, and dispatches dynamic unmount cleanups during hook unmount to prevent memory leaks.
 *
 * @param catalogs The array of component catalogs matching A2UI specifications.
 * @param options Optional configuration payloads.
 * @return A reactive state object containing the active surface drawing model.
 */
export function useA2uiSandbox<C extends ComponentApi = ComponentApi>(
  catalogs: Catalog<C>[],
  options?: ReactSandboxOptions,
): UseA2uiSandboxResult<C> {
  const [surface, setSurface] = useState<SurfaceModel<C> | undefined>(undefined);

  // The attach effect below deliberately runs exactly once (see the comment at its end), so the
  // callbacks it hands to the bridge must not close over `catalogs`/`options` directly. These refs
  // are reassigned on every render and are what those callbacks read, so a host that re-renders
  // with fresher closures is honoured without tearing the renderer down.
  const catalogsRef = useRef(catalogs);
  catalogsRef.current = catalogs;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    // Instantiates a new dynamic MessageProcessor mapping outbound event actions
    const processor = new MessageProcessor(catalogs, (action: A2uiClientAction) => {
      a2uiBridge.sendAction(action);
    });

    // Connects the renderer stack and establishes inter-frame callbacks
    const connection = a2uiBridge.attachRenderer(processor, {
      surfaceGroup: processor.model,
      catalogJson: options?.catalogJson,
      // Each optional callback is installed only when the host supplied one at mount, because
      // `PreviewBridge` reads an absent config property as "this renderer does not implement it"
      // (`if (this.activeRenderer?.config.getDemos)`). An unconditional wrapper would make the
      // property always defined and silently turn that signal into "implemented, answers with
      // nothing". When one is installed it delegates through `optionsRef`, so a re-render with a
      // fresh closure is picked up; the `?? …` guards the case where the host later drops the
      // callback it mounted with, answering with the same empty result the bridge would have
      // produced for an unimplemented renderer.
      getComponentUsages: options?.getComponentUsages
        ? async () => (await optionsRef.current?.getComponentUsages?.()) ?? {}
        : undefined,
      getDemos: options?.getDemos
        ? async () => (await optionsRef.current?.getDemos?.()) ?? []
        : undefined,
      onThemeChange: options?.onThemeChange
        ? theme => optionsRef.current?.onThemeChange?.(theme)
        : undefined,
      onCatalogResolved: catalogId => {
        for (const catalog of catalogsRef.current) {
          if (catalog) {
            (catalog as unknown as CatalogDetails).id = catalogId;
          }
        }
      },
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
    // Intentionally empty: `catalogs` and `options` are expected to be fresh array/object
    // literals (and fresh arrow function callbacks) on every render from typical call sites.
    // Listing them as dependencies would tear down and re-attach the renderer on every render,
    // producing an infinite attach/detach loop and a stream of duplicate `RENDERER_READY`
    // handshakes. Staleness is handled without dependencies instead: the callbacks installed
    // above read `catalogsRef`/`optionsRef`, which every render reassigns, so this effect can
    // attach once while the bridge still invokes the host's current closures over its current
    // state. What does stay pinned to the first attach is the mount-time shape of the config —
    // the `MessageProcessor` is constructed from the catalogs present at mount, and whether each
    // optional callback property exists at all is decided once, from the options present at
    // mount (see the note above it) — so adding or removing a callback still requires a remount.
    //
    // TODO(jerelvelarde): `eslint-plugin-react-hooks` is not configured in this repo. If it ever is, do not
    // let its `exhaustive-deps` autofix rewrite this array — that would reintroduce the loop
    // described above. Add the suppression explicitly instead, verbatim as its own comment line:
    // "eslint-disable-next-line react-hooks/exhaustive-deps" (omitted as a live directive today
    // because ESLint's flat config fails the build on a disable comment for an unregistered rule).
  }, []);

  return {surface};
}
