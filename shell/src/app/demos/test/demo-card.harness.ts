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
import {DEMO_CARD_SELECTORS} from './demo-card-selectors';

/** Harness for one demo card on the demo wall. */
export class DemoCardHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-demo-card';

  private readonly getIframeElement = this.locatorForOptional(DEMO_CARD_SELECTORS.iframe);
  private readonly getSurfaceElement = this.locatorFor(DEMO_CARD_SELECTORS.surface);
  private readonly getPlaceholder = this.locatorForOptional(DEMO_CARD_SELECTORS.placeholder);
  private readonly getError = this.locatorForOptional('.demo-card-error');
  private readonly getOpenButton = this.locatorFor('button.demo-card-open');
  private readonly getSubtitle = this.locatorFor('.demo-card-subtitle');
  private readonly getFocusables = this.locatorForAll('button, iframe');

  /**
   * The renderer iframe, or null while the card is unmounted. For checks that need
   * the element itself (its window, or a stubbed width), resolve it with
   * `TestbedHarnessEnvironment.getNativeElement`.
   */
  async getIframe(): Promise<TestElement | null> {
    return await this.getIframeElement();
  }

  /** The surface the frame sits in; see {@link getIframe} for reaching the element. */
  async getSurface(): Promise<TestElement> {
    return await this.getSurfaceElement();
  }

  async isPlaceholderShown(): Promise<boolean> {
    return (await this.getPlaceholder()) !== null;
  }

  async isErrorShown(): Promise<boolean> {
    return (await this.getError()) !== null;
  }

  /** Whether the card has committed a height, which sizes the frame to the surface. */
  async isMeasured(): Promise<boolean> {
    return await (await this.getSurfaceElement()).hasClass('is-measured');
  }

  /** The surface's applied height in wall pixels, or null while it has none. */
  async getSurfaceHeightPx(): Promise<number | null> {
    const height = await this.inlineStyle(await this.getSurfaceElement(), 'height');
    return height.endsWith('px') ? parseFloat(height) : null;
  }

  /** The `--demo-preview-scale` the card publishes to its stylesheet. */
  async getPreviewScale(): Promise<string> {
    return await this.inlineStyle(await this.host(), '--demo-preview-scale');
  }

  /** The `--demo-card-max-h` the card publishes to its stylesheet. */
  async getMaxHeight(): Promise<string> {
    return await this.inlineStyle(await this.host(), '--demo-card-max-h');
  }

  /** The `--demo-card-measure-h` the card publishes to its stylesheet. */
  async getMeasureHeight(): Promise<string> {
    return await this.inlineStyle(await this.host(), '--demo-card-measure-h');
  }

  async getSubtitleText(): Promise<string> {
    return (await (await this.getSubtitle()).text()).trim();
  }

  async getSubtitleTitle(): Promise<string | null> {
    return await (await this.getSubtitle()).getAttribute('title');
  }

  async getOpenButtonText(): Promise<string> {
    return (await (await this.getOpenButton()).text()).trim();
  }

  async getOpenButtonLabel(): Promise<string | null> {
    return await (await this.getOpenButton()).getAttribute('aria-label');
  }

  async clickOpenButton(): Promise<void> {
    await (await this.getOpenButton()).click();
  }

  /** Whether a keyboard user can reach the open control. */
  async isOpenButtonFocusable(): Promise<boolean> {
    const button = await this.getOpenButton();
    const hidden = await button.getProperty<boolean>('hidden');
    const disabled = await button.getProperty<boolean>('disabled');
    const tabIndex = await button.getProperty<number>('tabIndex');
    return !hidden && !disabled && tabIndex >= 0;
  }

  /** Whether the open control comes before the frame in the tab order. */
  async isOpenButtonBeforeFrame(): Promise<boolean> {
    const focusables = await this.getFocusables();
    const tags = await Promise.all(
      focusables.map(async element =>
        (await element.hasClass('demo-card-open'))
          ? 'open'
          : await element.getProperty<string>('tagName'),
      ),
    );
    const open = tags.indexOf('open');
    const frame = tags.indexOf('IFRAME');
    return open >= 0 && frame > open;
  }

  /** Fires the iframe's `load` event, as the browser does once a document loads. */
  async simulateFrameLoad(): Promise<void> {
    await (await this.getIframeElement())?.dispatchEvent('load');
  }

  private async inlineStyle(element: TestElement, property: string): Promise<string> {
    const style = await element.getProperty<CSSStyleDeclaration>('style');
    return style.getPropertyValue(property);
  }
}
