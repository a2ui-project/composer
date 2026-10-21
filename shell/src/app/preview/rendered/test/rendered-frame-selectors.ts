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
 * CSS selectors for the elements inside a RenderedFrame, relative to its host.
 * RenderedFrameHarness and the e2e and visual tests read them from here, so a
 * change to the frame's markup updates its tests in one place. Kept free of
 * Angular so the Playwright runner can import it.
 */
export const RENDERED_FRAME_SELECTORS = {
  /** The sized box around the guest iframe; it carries `data-sizing` and `is-locked`. */
  container: '.rendered-frame-container',
  /** The sandboxed iframe that loads the guest renderer. */
  iframe: 'iframe.preview-iframe',
} as const;
