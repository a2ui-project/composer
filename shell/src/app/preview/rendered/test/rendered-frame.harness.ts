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
import {GuestFrameHarness} from '../../guest-frame/test/guest-frame.harness';
import type {RenderedFrameSizing} from '../rendered-frame';
import {RENDERED_FRAME_SELECTORS} from './rendered-frame-selectors';

export class RenderedFrameHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-rendered-frame';

  private readonly getGuestFrame = this.locatorForOptional(GuestFrameHarness);
  private readonly getContainer = this.locatorFor(RENDERED_FRAME_SELECTORS.container);
  private readonly getPlaceholder = this.locatorForOptional(RENDERED_FRAME_SELECTORS.placeholder);

  async hasIframe(): Promise<boolean> {
    return (await (await this.getGuestFrame())?.hasIframe()) ?? false;
  }

  async getIframeSrc(): Promise<string | null> {
    return (await (await this.getGuestFrame())?.getIframeSrc()) ?? null;
  }

  /**
   * The guest iframe, or null before it is created. For checks that need the
   * element itself (for example which frame a message was posted to), resolve
   * it with `TestbedHarnessEnvironment.getNativeElement`.
   */
  async getIframe(): Promise<TestElement | null> {
    return (await (await this.getGuestFrame())?.getIframe()) ?? null;
  }

  /** Whether the placeholder shown while there is no renderer URL is up. */
  async isPlaceholderShown(): Promise<boolean> {
    return (await this.getPlaceholder()) !== null;
  }

  async isLocked(): Promise<boolean> {
    const container = await this.getContainer();
    return await container.hasClass('is-locked');
  }

  /**
   * How the frame is sized: `fill` when it takes its host's height, `content`
   * when it follows the guest's reported surface height.
   */
  async getSizing(): Promise<RenderedFrameSizing> {
    const container = await this.getContainer();
    const sizing = await container.getAttribute('data-sizing');
    if (sizing !== 'fill' && sizing !== 'content') {
      throw new Error(`Unexpected data-sizing on the frame container: ${sizing}.`);
    }
    return sizing;
  }

  /**
   * Guest height applied to the frame, in pixels, or null when none is and
   * the frame takes its host's full height.
   *
   * A guest height is applied as the container's `height` and `min-height`,
   * so that it wins over the stylesheet's floor; this throws if those
   * disagree, which would mean the frame is only partly sized to the guest.
   * The iframe fills the container, and the guest measures itself inside it,
   * so this is the observable that matters, not the signal behind it.
   */
  async getAppliedHeightPx(): Promise<number | null> {
    const container = await this.getContainer();
    const height = await container.getCssValue('height');
    const containerMinHeight = await container.getCssValue('min-height');

    if (height === '100%') {
      return null;
    }
    if (!height.endsWith('px') || containerMinHeight !== height) {
      throw new Error(
        `Inconsistent applied height: container height ${height}, container min-height ` +
          `${containerMinHeight}.`,
      );
    }
    return parseFloat(height);
  }
}
