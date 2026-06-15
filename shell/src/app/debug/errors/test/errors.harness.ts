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
import {MatTableHarness} from '@angular/material/table/testing';

export class ErrorsHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-errors';

  protected getTable = this.locatorForOptional(MatTableHarness);

  private async getPrimaryRows() {
    const table = await this.getTable();
    if (table === null) {
      return [];
    }
    const allRows = await table.getRows();
    const primaryRows = [];
    for (const row of allRows) {
      const host = await row.host();
      if (await host.hasClass('element-row')) {
        primaryRows.push(row);
      }
    }
    return primaryRows;
  }

  async getRowsCount(): Promise<number> {
    const rows = await this.getPrimaryRows();
    return rows.length;
  }

  async getRowValuesAt(index: number): Promise<Record<string, string>> {
    const rows = await this.getPrimaryRows();
    if (index < 0 || index >= rows.length) {
      throw new Error(`Index ${index} out of bounds for errors log table!`);
    }
    const cells = await rows[index].getCells();
    const cellText = await Promise.all(cells.map(c => c.getText()));
    const textWrapper = await this.locatorForOptional(
      `[data-row-index="${index}"] .mat-column-message .error-message-text`,
    )();
    const message = textWrapper ? await textWrapper.text() : cellText[3];

    return {
      time: cellText[0],
      level: cellText[1],
      source: cellText[2],
      message,
    };
  }

  async hasPlaceholder(): Promise<boolean> {
    const placeholder = await this.locatorForOptional('.errors-placeholder')();
    return placeholder !== null;
  }

  async toggleStackAt(index: number): Promise<void> {
    const button = await this.locatorForOptional(`[data-row-index="${index}"] button`)();
    if (button === null) {
      throw new Error(`No stack toggle button found at index ${index}!`);
    }
    return button.click();
  }

  async getStackTextAt(index: number): Promise<string> {
    const list = await this.locatorForAll('.stack-preview')();
    if (index < 0 || index >= list.length) {
      throw new Error(`Index ${index} out of bounds for stack trace list!`);
    }
    return list[index].text();
  }

  async getIconsAriaHidden(): Promise<(string | null)[]> {
    const icons = await this.locatorForAll('mat-icon')();
    return Promise.all(icons.map(i => i.getAttribute('aria-hidden')));
  }
}
