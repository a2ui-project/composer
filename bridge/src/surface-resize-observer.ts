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
 * Dimensions payload transmitted across the Preview Bridge boundary on surface resize events.
 *
 * NOTE: Declared as a `declare interface` so `tsickle` generates compiler externs
 * definitions for JSCompiler (Closure Compiler), preventing property renaming across frame boundaries.
 */
export declare interface SurfaceDimensions {
  height: number;
  width: number;
}

export type SurfaceResizeCallback = (dimensions: SurfaceDimensions) => void;

/**
 * Observes DOM element reflows and window viewport changes within the preview iframe,
 * caching dimensions to deduplicate redundant resize notifications sent to the host.
 */
export class SurfaceResizeObserver {
  private domResizeObserver?: ResizeObserver;
  private windowViewportResizeListener?: () => void;
  private domContentLoadedListener?: () => void;

  private lastKnownHeight: number | null = null;
  private lastKnownWidth: number | null = null;

  constructor(private readonly onResize: SurfaceResizeCallback) {
    this.init();
  }

  /**
   * Initializes window resize listeners and DOM element observers.
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    if (!this.windowViewportResizeListener) {
      this.windowViewportResizeListener = () => this.measureAndDispatch();
      window.addEventListener('resize', this.windowViewportResizeListener);
    }

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
      if (!this.domContentLoadedListener) {
        this.domContentLoadedListener = () => {
          this.setupDomElementObservers();
          this.measureAndDispatch();
          this.domContentLoadedListener = undefined;
        };
        document.addEventListener('DOMContentLoaded', this.domContentLoadedListener, {once: true});
      }
      return;
    }

    this.setupDomElementObservers();
  }

  private setupDomElementObservers(): void {
    if (typeof ResizeObserver === 'undefined') return;

    if (!this.domResizeObserver) {
      this.domResizeObserver = new ResizeObserver(() => {
        this.measureAndDispatch();
      });
    }

    if (typeof document !== 'undefined') {
      if (document.body) {
        this.domResizeObserver.observe(document.body);
      }
      if (document.documentElement && document.documentElement !== document.body) {
        this.domResizeObserver.observe(document.documentElement);
      }
    }
  }

  /**
   * Measures current scroll and offset dimensions of document body/documentElement,
   * dispatching a callback only if dimensions have changed since last measurement (or if forced).
   */
  measureAndDispatch(force = false): void {
    if (typeof document === 'undefined') return;

    const body = document.body;
    const docEl = document.documentElement;

    const height = Math.max(
      body?.scrollHeight || 0,
      docEl?.scrollHeight || 0,
      body?.offsetHeight || 0,
      docEl?.offsetHeight || 0,
    );
    const width = Math.max(
      body?.scrollWidth || 0,
      docEl?.scrollWidth || 0,
      body?.offsetWidth || 0,
      docEl?.offsetWidth || 0,
    );

    if (height <= 0) return;

    if (force || height !== this.lastKnownHeight || width !== this.lastKnownWidth) {
      this.lastKnownHeight = height;
      this.lastKnownWidth = width;
      this.onResize({height, width});
    }
  }

  /**
   * Cleans up observers, window listeners, and resets cached dimensions.
   */
  destroy(): void {
    if (this.domResizeObserver) {
      this.domResizeObserver.disconnect();
      this.domResizeObserver = undefined;
    }
    if (this.windowViewportResizeListener) {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.windowViewportResizeListener);
      }
      this.windowViewportResizeListener = undefined;
    }
    if (this.domContentLoadedListener) {
      if (typeof document !== 'undefined') {
        document.removeEventListener('DOMContentLoaded', this.domContentLoadedListener);
      }
      this.domContentLoadedListener = undefined;
    }
    this.lastKnownHeight = null;
    this.lastKnownWidth = null;
  }
}
