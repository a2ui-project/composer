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
 * Sets which document `iframe` shows, as a browser exposes it: the initial
 * about:blank document is same-origin and readable, while the renderer's
 * cross-origin document leaves `contentDocument` null. jsdom loads no
 * document and leaves every iframe on a readable about:blank, so a spec that
 * fires `load` for the renderer's document has to set it first; GuestFrame
 * ignores the load of the initial about:blank document.
 */
export function showGuestDocument(
  iframe: HTMLIFrameElement,
  shown: 'initial-blank' | 'renderer',
): void {
  const document = shown === 'renderer' ? null : ({URL: 'about:blank'} as Document);
  Object.defineProperty(iframe, 'contentDocument', {configurable: true, get: () => document});
}
