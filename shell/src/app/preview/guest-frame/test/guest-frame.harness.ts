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

import {ComponentHarness, TestElement} from '@angular/cdk/testing';
import {GUEST_FRAME_SELECTORS} from './guest-frame-selectors';

export class GuestFrameHarness extends ComponentHarness {
  static hostSelector = GUEST_FRAME_SELECTORS.host;

  private readonly getIframeElement = this.locatorForOptional(GUEST_FRAME_SELECTORS.iframe);

  /**
   * The guest iframe, or null while there is no renderer URL. For checks that
   * need the element itself (its window, or which frame a message was posted
   * to), resolve it with `TestbedHarnessEnvironment.getNativeElement`.
   */
  async getIframe(): Promise<TestElement | null> {
    return await this.getIframeElement();
  }

  async hasIframe(): Promise<boolean> {
    return (await this.getIframeElement()) !== null;
  }

  async getIframeSrc(): Promise<string | null> {
    return (await (await this.getIframeElement())?.getAttribute('src')) ?? null;
  }

  async getIframeTitle(): Promise<string | null> {
    return (await (await this.getIframeElement())?.getAttribute('title')) ?? null;
  }

  async getIframeSandbox(): Promise<string | null> {
    return (await (await this.getIframeElement())?.getAttribute('sandbox')) ?? null;
  }

  /** Text shown in place of the iframe, which the host projects into the frame. */
  async getText(): Promise<string> {
    return (await (await this.host()).text()).trim();
  }

  /**
   * Fires the iframe's `load` event, as the browser does once a document loads.
   * GuestFrame ignores the load of the iframe's initial about:blank document,
   * which jsdom leaves in place; see `showGuestDocument` in
   * preview/testing/guest-document.ts.
   */
  async simulateFrameLoad(): Promise<void> {
    const iframe = await this.locatorFor(GUEST_FRAME_SELECTORS.iframe)();
    await iframe.dispatchEvent('load');
  }
}
