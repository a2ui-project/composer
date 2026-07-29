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
import {MatTooltipHarness} from '@angular/material/tooltip/testing';

/**
 * Harness for interacting with the ProfileSelector component in tests.
 */
export class ProfileSelectorHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-profile-selector';

  protected getSelect = this.locatorFor(MatSelectHarness);
  protected getTooltip = this.locatorForOptional(MatTooltipHarness);
  protected getDocumentOptions: () => Promise<MatOptionHarness[]> = this.locatorFactory
    .documentRootLocatorFactory()
    .locatorForAll(MatOptionHarness);

  async openSelect(): Promise<void> {
    const select = await this.getSelect();
    const selectHost = await select.host();
    await selectHost.click();
  }

  async getOptionsText(): Promise<string[]> {
    await this.openSelect();
    const getOptions = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness);
    const options = await getOptions();
    return Promise.all(options.map(async opt => (await opt.getText()).trim()));
  }

  async selectOptionByText(text: string): Promise<void> {
    await this.openSelect();
    const getOptions = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness);
    const options = await getOptions();
    for (const opt of options) {
      if ((await opt.getText()).trim() === text) {
        await opt.click();
        return;
      }
    }
    throw new Error(`Option "${text}" not found in ProfileSelector dropdown`);
  }

  async getSelectedValueText(): Promise<string> {
    const select = await this.getSelect();
    return select.getValueText();
  }

  async isDisabled(): Promise<boolean> {
    const select = await this.getSelect();
    return select.isDisabled();
  }

  async getTooltipText(): Promise<string | null> {
    const tooltip = await this.getTooltip();
    if (!tooltip) return null;
    return tooltip.getTooltipText();
  }
}
