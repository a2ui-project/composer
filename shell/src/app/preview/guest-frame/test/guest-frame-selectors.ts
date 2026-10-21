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
 * CSS selectors for the elements inside a GuestFrame, relative to its host.
 * GuestFrameHarness, the parent frames' selector modules and the e2e tests
 * read them from here, so a change to GuestFrame's markup updates its tests in
 * one place. Kept free of Angular so the Playwright runner can import it.
 */
export const GUEST_FRAME_SELECTORS = {
  /** The GuestFrame host element. */
  host: 'a2ui-composer-guest-frame',
  /** The sandboxed iframe that loads the guest renderer; it fills the host. */
  iframe: 'iframe',
} as const;
