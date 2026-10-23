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

// Framework-free: the e2e tests import it, and so can any preview host.

/**
 * Tallest a preview may grow to follow its content, in pixels. Content taller
 * than this scrolls inside the guest's own document.
 */
export const MAX_CONTENT_HEIGHT_PX = 560;

/**
 * The height a content-sized preview applies for a guest's reported content
 * height, in pixels, or null for "no height" (the host then keeps its default
 * size).
 *
 * - Not finite, zero or negative: null. A frame must never be pinned to
 *   `0px` or `NaNpx`.
 * - Otherwise the height is rounded up, so content is never cut off by a
 *   fraction of a pixel, and then limited to {@link MAX_CONTENT_HEIGHT_PX}.
 *
 * The cap is what ends a resize feedback loop, without any timer or state: a
 * guest laid out against its own viewport (`100%`, `100vh`) reports a little
 * more than every height the host applies, and once the applied height
 * reaches the cap it stops changing, so the guest stops reporting. That only
 * holds for monotone growth. A guest whose height oscillates below the cap,
 * or creeps by a pixel at fractional device scale factors, is not bounded by
 * it; the "settles without a SURFACE_RESIZE feedback loop" e2e test is the
 * detector for those.
 */
export function clampContentHeight(px: number): number | null {
  if (!Number.isFinite(px) || px <= 0) {
    return null;
  }
  return Math.min(Math.ceil(px), MAX_CONTENT_HEIGHT_PX);
}
