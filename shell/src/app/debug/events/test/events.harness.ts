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

export class EventsHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-events';

  protected getTable = this.locatorForOptional(MatTableHarness);

  async getRowsCount(): Promise<number> {
    const table = await this.getTable();
    if (table === null) {
      return 0;
    }
    const rows = await table.getRows();
    return rows.length;
  }

  async getRowValuesAt(index: number): Promise<Record<string, string>> {
    const table = await this.getTable();
    if (table === null) {
      throw new Error(`No events log table present to read index ${index}!`);
    }
    const rows = await table.getRows();
    if (index < 0 || index >= rows.length) {
      throw new Error(`Index ${index} out of bounds for events log table!`);
    }
    const cells = await rows[index].getCells();
    const cellText = await Promise.all(cells.map(c => c.getText()));
    return {
      time: cellText[0],
      action: cellText[1],
      surface: cellText[2],
      component: cellText[3],
      context: cellText[4],
    };
  }

  async hasPlaceholder(): Promise<boolean> {
    const placeholder = await this.locatorForOptional('.events-placeholder')();
    return placeholder !== null;
  }
}
