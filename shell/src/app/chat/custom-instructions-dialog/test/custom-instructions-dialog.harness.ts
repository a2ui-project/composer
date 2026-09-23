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
import {MatInputHarness} from '@angular/material/input/testing';
import {MatButtonHarness} from '@angular/material/button/testing';

/**
 * Harness for interacting with the CustomInstructionsDialog in unit tests.
 */
export class CustomInstructionsDialogHarness extends ComponentHarness {
  /** The CSS selector used to locate the host element. */
  static hostSelector = 'a2ui-composer-custom-instructions-dialog';

  private readonly getSelect = this.locatorFor(MatSelectHarness.with({selector: '.preset-select'}));
  private readonly getNameInput = this.locatorForOptional(MatInputHarness);
  private readonly getTextarea = this.locatorForOptional('.instructions-textarea');
  private readonly getSaveButton = this.locatorFor(
    MatButtonHarness.with({selector: '.save-button'}),
  );
  private readonly getCancelButton = this.locatorFor(
    MatButtonHarness.with({selector: '.cancel-button'}),
  );
  private readonly getDeleteButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.delete-button'}),
  );

  /**
   * Retrieves the displayed text of the currently selected preset option.
   */
  async getSelectedPresetOptionText(): Promise<string> {
    const select = await this.getSelect();
    return select.getValueText();
  }

  /**
   * Selects an option from the preset dropdown by option text.
   */
  async selectOption(optionText: string): Promise<void> {
    const select = await this.getSelect();
    await select.open();
    const getOptions = this.locatorFactory
      .documentRootLocatorFactory()
      .locatorForAll(MatOptionHarness);
    const options = await getOptions();
    for (const opt of options) {
      const text = (await opt.getText()).trim();
      if (text === optionText || text.startsWith(optionText)) {
        await opt.click();
        return;
      }
    }
    throw new Error(`Option "${optionText}" not found in preset select dropdown.`);
  }

  /**
   * Retrieves the current preset name input value.
   */
  async getPresetName(): Promise<string> {
    const input = await this.getNameInput();
    return input ? input.getValue() : '';
  }

  /**
   * Sets the preset name input value.
   */
  async setPresetName(value: string): Promise<void> {
    const input = await this.getNameInput();
    if (!input) {
      throw new Error('Preset name input not found');
    }
    await input.setValue(value);
  }

  /**
   * Retrieves the instructions textarea value.
   */
  async getInstructions(): Promise<string> {
    const textarea = await this.getTextarea();
    if (!textarea) return '';
    return (await textarea.getProperty('value')) as string;
  }

  /**
   * Sets the instructions textarea value.
   */
  async setInstructions(value: string): Promise<void> {
    const textarea = await this.getTextarea();
    if (!textarea) {
      throw new Error('Instructions textarea not found');
    }
    await textarea.setInputValue(value);
    await textarea.dispatchEvent('input');
  }

  /**
   * Returns true if the save button is currently disabled.
   */
  async isSaveDisabled(): Promise<boolean> {
    const button = await this.getSaveButton();
    return button.isDisabled();
  }

  /**
   * Clicks the save button.
   */
  async clickSave(): Promise<void> {
    const button = await this.getSaveButton();
    await button.click();
  }

  /**
   * Clicks the cancel button.
   */
  async clickCancel(): Promise<void> {
    const button = await this.getCancelButton();
    await button.click();
  }

  /**
   * Returns true if the delete button is visible in the dialog.
   */
  async hasDeleteButton(): Promise<boolean> {
    const button = await this.getDeleteButton();
    return button !== null;
  }

  /**
   * Clicks the delete button.
   */
  async clickDelete(): Promise<void> {
    const button = await this.getDeleteButton();
    if (!button) {
      throw new Error('Delete button not found');
    }
    await button.click();
  }
}
