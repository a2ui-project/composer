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
import {MatButtonHarness} from '@angular/material/button/testing';

/**
 * Harness for interacting with the SystemInstructionsDialog in unit tests.
 */
export class SystemInstructionsDialogHarness extends ComponentHarness {
  /** The CSS selector used to locate the host element. */
  static hostSelector = 'a2ui-composer-system-instructions-dialog';

  private readonly getInstructionsText = this.locatorFor('.instructions-textarea');
  private readonly getCloseButton = this.locatorFor(
    MatButtonHarness.with({selector: 'button[mat-dialog-close]'}),
  );
  private readonly getCopyButton = this.locatorForOptional(
    MatButtonHarness.with({selector: '.copy-button'}),
  );

  /**
   * Retrieves the plain text of the instructions inside the dialog.
   */
  async getInstructions(): Promise<string> {
    const textEl = await this.getInstructionsText();
    return (await textEl.getProperty('value')) as string;
  }

  /**
   * Clicks the Close button to dismiss the dialog.
   */
  async clickClose(): Promise<void> {
    const button = await this.getCloseButton();
    await button.click();
  }

  /**
   * Clicks the Copy to Clipboard button.
   */
  async clickCopy(): Promise<void> {
    const button = await this.getCopyButton();
    if (!button) {
      throw new Error('Clipboard copy button is not present');
    }
    await button.click();
  }

  /**
   * Returns true if the copy button is present in the dialog.
   */
  async hasCopyButton(): Promise<boolean> {
    const button = await this.getCopyButton();
    return button !== null;
  }
}
