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
 * CSS selectors for the preview elements inside a DemoCard, relative to its
 * host. DemoCardHarness, DemosHarness and the e2e tests read them from here, so
 * a change to the card's frame markup updates its tests in one place. Kept free
 * of Angular so the Playwright runner can import it.
 */
export const DEMO_CARD_SELECTORS = {
  /** The box the frame sits in; it gains `is-measured` once the card commits a height. */
  surface: '.demo-card-surface',
  /** The sandboxed iframe that loads the demo in the guest renderer. */
  iframe: 'iframe.demo-card-frame',
  /** The skeleton that covers the frame until the card reveals its demo. */
  placeholder: '.demo-card-placeholder',
} as const;
