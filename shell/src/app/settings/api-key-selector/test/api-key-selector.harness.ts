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

import {ComponentHarness} from '@angular/cdk/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {MatOptionHarness} from '@angular/material/core/testing';
import {MatButtonHarness} from '@angular/material/button/testing';

/**
 * Harness for interacting with the ApiKeySelectorComponent in tests.
 */
export class ApiKeySelectorHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-api-key-selector';

  protected getSelect = this.locatorFor(MatSelectHarness);
  getAddButton = this.locatorFor(MatButtonHarness.with({selector: '.add-api-key-button'}));

  async isDisabled(): Promise<boolean> {
    const select = await this.getSelect();
    return select.isDisabled();
  }

  async getValueText(): Promise<string> {
    const select = await this.getSelect();
    return select.getValueText();
  }

  async openSelect(): Promise<void> {
    const select = await this.getSelect();
    await select.open();
  }

  async getOptionsText(): Promise<string[]> {
    await this.openSelect();
    const getOptions = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness);
    const options = await getOptions();
    return Promise.all(
      options.map(async opt => {
        const fullText = (await opt.getText()).trim();
        return fullText.replace(/\s*(edit|delete)+$/g, '').trim();
      }),
    );
  }

  async selectOptionByText(text: string): Promise<void> {
    await this.openSelect();
    const getOptions = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness);
    const options = await getOptions();
    for (const opt of options) {
      const fullText = (await opt.getText()).trim();
      const cleanText = fullText.replace(/\s*(edit|delete)+$/g, '').trim();
      if (cleanText === text || fullText.startsWith(text)) {
        await opt.click();
        return;
      }
    }
    throw new Error(`Option "${text}" not found in ApiKeySelectorComponent dropdown`);
  }

  async getEditButtonsForOptions(): Promise<MatButtonHarness[]> {
    await this.openSelect();
    const getButtons = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatButtonHarness.with({selector: '.edit-api-key-button'}));
    return getButtons();
  }

  async getEditButtonForOption(text: string): Promise<MatButtonHarness | null> {
    await this.openSelect();
    const options = await this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness)();
    for (const opt of options) {
      const fullText = (await opt.getText()).trim();
      const cleanText = fullText.replace(/\s*(edit|delete)+$/g, '').trim();
      if (cleanText === text || cleanText.startsWith(text)) {
        return opt.getHarnessOrNull(MatButtonHarness.with({selector: '.edit-api-key-button'}));
      }
    }
    return null;
  }

  async getDeleteButtonsForOptions(): Promise<MatButtonHarness[]> {
    await this.openSelect();
    const getButtons = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatButtonHarness.with({selector: '.delete-api-key-button'}));
    return getButtons();
  }

  async getDeleteButtonForOption(text: string): Promise<MatButtonHarness | null> {
    await this.openSelect();
    const options = await this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness)();
    for (const opt of options) {
      const fullText = (await opt.getText()).trim();
      const cleanText = fullText.replace(/\s*(edit|delete)+$/g, '').trim();
      if (cleanText === text || cleanText.startsWith(text)) {
        return opt.getHarnessOrNull(MatButtonHarness.with({selector: '.delete-api-key-button'}));
      }
    }
    return null;
  }

  async clickAddButton(): Promise<void> {
    const btn = await this.getAddButton();
    await btn.click();
  }
}

/**
 * Harness for interacting with the AddApiKeyDialogComponent in tests.
 */
export class AddApiKeyDialogHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-add-api-key-dialog';

  protected getErrorMessage = this.locatorForOptional('.error-message');

  async getErrorMessageText(): Promise<string | null> {
    const el = await this.getErrorMessage();
    return el ? el.text() : null;
  }

  async getErrorMessageRole(): Promise<string | null> {
    const el = await this.getErrorMessage();
    return el ? el.getAttribute('role') : null;
  }
}
