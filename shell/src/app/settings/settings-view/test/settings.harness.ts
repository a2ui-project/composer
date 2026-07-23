/**
 * @license
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

import {ComponentHarness} from '@angular/cdk/testing';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatSlideToggleHarness} from '@angular/material/slide-toggle/testing';

/**
 * Harness for interacting with the settings configuration drawer view.
 * Enables selector-free unit testing for api key fields and toggles.
 */
export class SettingsHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-settings';

  protected getInputs = this.locatorForAll(MatInputHarness);
  protected getSlideToggle = this.locatorFor(MatSlideToggleHarness);

  protected getLockedNotice = this.locatorForOptional('.locked-notice');
  protected getAuthLockedNotice = this.locatorForOptional('.auth-locked-notice');
  protected getSaveErrorBanner = this.locatorForOptional('.save-error-banner');
  protected getErrors = this.locatorForAll('mat-error');
  protected getFormSections = this.locatorForAll('.form-section');
  protected getLogsConsole = this.locatorFor('.logs-console');
  protected getApiKeyToggleBtn = this.locatorForOptional('button[matSuffix]');

  protected getBridgeBadge = this.locatorFor('.bridge-badge');
  protected getCatalogBadge = this.locatorFor('.catalog-badge');

  private async getRendererUrlInput(): Promise<MatInputHarness> {
    const inputs = await this.getInputs();
    for (const input of inputs) {
      const host = await input.host();
      const placeholder = await host.getAttribute('placeholder');
      if (placeholder === 'http://localhost:3000') {
        return input;
      }
    }
    throw new Error('Renderer URL input field not found');
  }

  private async getApiKeyInput(): Promise<MatInputHarness | null> {
    const inputs = await this.getInputs();
    for (const input of inputs) {
      const host = await input.host();
      const placeholder = await host.getAttribute('placeholder');
      if (placeholder === 'Enter your Gemini API key') {
        return input;
      }
    }
    return null;
  }

  async getRendererUrlPlaceholder(): Promise<string | null> {
    const input = await this.getRendererUrlInput();
    const host = await input.host();
    return host.getAttribute('placeholder');
  }

  async getRendererUrlValue(): Promise<string> {
    const input = await this.getRendererUrlInput();
    return input.getValue();
  }

  async setRendererUrlValue(val: string): Promise<void> {
    const input = await this.getRendererUrlInput();
    await input.setValue(val);
  }

  async getGeminiApiKeyValue(): Promise<string> {
    const input = await this.getApiKeyInput();
    if (!input) return '';
    return input.getValue();
  }

  async getGeminiApiKeyPlaceholder(): Promise<string | null> {
    const input = await this.getApiKeyInput();
    if (!input) return null;
    const host = await input.host();
    return host.getAttribute('placeholder');
  }

  async setGeminiApiKeyValue(val: string): Promise<void> {
    const input = await this.getApiKeyInput();
    if (!input) throw new Error('API Key input field not found');
    await input.setValue(val);
  }

  async clickApiKeyToggleBtn(): Promise<void> {
    const btn = await this.getApiKeyToggleBtn();
    if (!btn) throw new Error('API Key toggle visibility button not found');
    await btn.click();
  }

  async getApiKeyInputType(): Promise<string | null> {
    const input = await this.getApiKeyInput();
    if (!input) return null;
    const host = await input.host();
    return host.getAttribute('type');
  }

  async toggleForceThirdPartyAuth(): Promise<void> {
    const toggle = await this.getSlideToggle();
    await toggle.toggle();
  }

  async isSlideToggleDisabled(): Promise<boolean> {
    const toggle = await this.getSlideToggle();
    return toggle.isDisabled();
  }

  async isSlideToggleChecked(): Promise<boolean> {
    const toggle = await this.getSlideToggle();
    return toggle.isChecked();
  }

  async hasLockedNotice(): Promise<boolean> {
    return (await this.getLockedNotice()) !== null;
  }

  async getLockedNoticeText(): Promise<string | null> {
    const node = await this.getLockedNotice();
    return node ? node.text() : null;
  }

  async hasAuthLockedNotice(): Promise<boolean> {
    return (await this.getAuthLockedNotice()) !== null;
  }

  async getAuthLockedNoticeText(): Promise<string | null> {
    const node = await this.getAuthLockedNotice();
    return node ? node.text() : null;
  }

  async getErrorsText(): Promise<string[]> {
    const errors = await this.getErrors();
    return Promise.all(errors.map(e => e.text()));
  }

  async getFormSectionsCount(): Promise<number> {
    const sections = await this.getFormSections();
    return sections.length;
  }

  async getLogsConsoleText(): Promise<string> {
    const consoleNode = await this.getLogsConsole();
    return consoleNode.text();
  }

  async getBridgeBadgeText(): Promise<string> {
    const chip = await this.getBridgeBadge();
    return chip.text();
  }

  async getCatalogBadgeText(): Promise<string> {
    const chip = await this.getCatalogBadge();
    return chip.text();
  }

  async getIconsAriaHidden(): Promise<(string | null)[]> {
    const icons = await this.locatorForAll('mat-icon')();
    return Promise.all(icons.map(i => i.getAttribute('aria-hidden')));
  }

  async hasSaveErrorBanner(): Promise<boolean> {
    return (await this.getSaveErrorBanner()) !== null;
  }

  async getSaveErrorBannerText(): Promise<string | null> {
    const node = await this.getSaveErrorBanner();
    return node ? node.text() : null;
  }
}
