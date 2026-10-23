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
 * When the bridge may call the rendered content settled, so that a host which sizes
 * its frame once (the demo wall) sizes it for the content the reader will see.
 *
 * A renderer's `onInitialRender` hook resolves once its first content reaches the
 * DOM, but the content often keeps changing for a while: nested components render
 * on later ticks, images decode, and webfonts swap in. Measured on the demo wall,
 * the first report after the hook differed from the final height in most Angular
 * and React demos (Interactive Button 72 -> 116px, Email Compose 288 -> 471px).
 *
 * The timing heuristics for that live only in this module.
 */

import type {SurfaceDimensions} from './surface-resize-observer';

/**
 * How long the rendered content's dimensions must stay unchanged, in
 * milliseconds, before the bridge reports the content as ready.
 */
export const CONTENT_QUIET_MS = 150;

/**
 * Longest the bridge waits for the content to settle, in milliseconds after the
 * render that produced it, including the renderer's own `onInitialRender`. A demo
 * that never stops changing (an animation, a ticking clock) is reported ready at
 * this point. Hosts time their own fallback from RENDER_SUCCESS, which the bridge
 * sends at the render, so they can rely on readiness arriving within this.
 */
export const CONTENT_SETTLE_MAX_MS = 2000;

/**
 * How often the content is checked while waiting. A third of the quiet period,
 * so a settled document is reported at most a third of that period late.
 */
const CONTENT_SAMPLE_MS = CONTENT_QUIET_MS / 3;

/** How a wait for the content to settle ended. */
export type SettleOutcome = 'settled' | 'capped' | 'cancelled';

/** What {@link waitForContentToSettle} needs from its caller. */
export declare interface ContentSettleOptions {
  /** Measures the content: the dimensions the host is sent, or null for none. */
  measure(): SurfaceDimensions | null;
  /** Whether the caller no longer needs the answer. Checked before each sample. */
  isCancelled(): boolean;
  /**
   * When the cap started counting, as a `Date.now()` time: the render. Defaults
   * to when the wait starts.
   */
  startedAt?: number;
}

/**
 * Resolves `'settled'` once no webfont is loading, every image has finished
 * loading (or failed to), and `measure` has returned the same dimensions for
 * {@link CONTENT_QUIET_MS}; `'capped'` once {@link CONTENT_SETTLE_MAX_MS} has
 * passed since `startedAt`; or `'cancelled'` once `isCancelled` returns true.
 *
 * Fonts are checked on every sample rather than through `document.fonts.ready`
 * once: the browser replaces that promise when a new font starts loading, and the
 * new content often asks for a font only once it is laid out.
 *
 * Elapsed time is read from the clock rather than counted in samples, so the cap
 * holds even where the browser throttles timers, as it does in hidden frames.
 */
export function waitForContentToSettle({
  measure,
  isCancelled,
  startedAt = Date.now(),
}: ContentSettleOptions): Promise<SettleOutcome> {
  return new Promise(resolve => {
    const initial = measure();
    let last =
      initial !== null && fontsLoaded() && imagesComplete() ? JSON.stringify(initial) : null;
    let unchangedSince = Date.now();

    const sample = () => {
      if (isCancelled()) {
        resolve('cancelled');
        return;
      }
      const now = Date.now();
      const measured = measure();
      if (measured === null || !fontsLoaded()) {
        last = null;
        unchangedSince = now;
      } else {
        const current = JSON.stringify(measured);
        if (last !== null && current !== last) {
          last = imagesComplete() ? current : null;
          unchangedSince = now;
        } else if (!imagesComplete()) {
          last = null;
          unchangedSince = now;
        } else if (last === null) {
          last = current;
          unchangedSince = now;
        } else if (now - unchangedSince >= CONTENT_QUIET_MS) {
          resolve('settled');
          return;
        }
      }
      if (now - startedAt >= CONTENT_SETTLE_MAX_MS) {
        resolve('capped');
        return;
      }
      setTimeout(sample, Math.min(CONTENT_SAMPLE_MS, remainingCap(startedAt)));
    };
    setTimeout(sample, Math.min(CONTENT_SAMPLE_MS, remainingCap(startedAt)));
  });
}

/**
 * Resolves when `work` does, or once {@link CONTENT_SETTLE_MAX_MS} has passed since
 * `startedAt`, whichever is first. Rejects if `work` rejects first; a rejection
 * after the cap is ignored. Bounds a renderer's `onInitialRender` by the same cap
 * as the wait that follows it.
 */
export function withinSettleCap(work: Promise<void>, startedAt: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, remainingCap(startedAt));
    work.then(
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      (error: unknown) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function remainingCap(startedAt: number): number {
  return Math.max(0, startedAt + CONTENT_SETTLE_MAX_MS - Date.now());
}

/** Whether no webfont is loading now. */
function fontsLoaded(): boolean {
  return typeof document === 'undefined' || !document.fonts || document.fonts.status !== 'loading';
}

function isLazyImage(img: HTMLImageElement): boolean {
  const loading = img.loading || img.getAttribute('loading');
  return typeof loading === 'string' && loading.toLowerCase() === 'lazy';
}

/**
 * Whether every eager image in the document, including those inside open shadow
 * roots (Lit renders into them, and `document.images` doesn't reach them), has
 * loaded or failed to. Lazy-loaded images (`loading="lazy"`) are ignored so
 * offscreen images deferred by the browser do not hold up readiness until the cap.
 */
function imagesComplete(): boolean {
  if (typeof document === 'undefined') return true;
  const pending: Node[] = [document];
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (current instanceof HTMLImageElement && !isLazyImage(current) && !current.complete) {
      return false;
    }
    if (current instanceof Element && current.shadowRoot) {
      pending.push(current.shadowRoot);
    }
    let child = current.firstChild;
    while (child) {
      if (child.nodeType === 1) {
        pending.push(child);
      }
      child = child.nextSibling;
    }
  }
  return true;
}
