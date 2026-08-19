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

import {ChangeDetectionStrategy, Component, computed} from '@angular/core';
import {CatalogComponent} from '@a2ui/angular/v0_9';
import {DataTableApi} from '../../apis';

interface TableColumn {
  key: string;
  label: string;
}

/**
 * `DataTable` renderer — renders `columns` (`{ key, label }[]`) as headers and
 * `rows` (`Record<string, unknown>[]`) as cells, keyed by column key. Scrolls
 * horizontally inside its own container so wide tables never overflow the page.
 */
@Component({
  selector: 'a2ui-composer-cc-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cc-table-wrap">
      <table class="cc-table">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th>{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track $index) {
            <tr>
              @for (col of columns(); track col.key) {
                <td>{{ cell(row, col.key) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .cc-table-wrap {
        overflow-x: auto;
        width: 100%;
      }
      .cc-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8rem;
        font-family: var(--cpk-font-body);
      }
      .cc-table th {
        text-align: left;
        padding: 8px 12px;
        border-bottom: 2px solid var(--cpk-border);
        color: var(--cpk-text-secondary);
        font-weight: 600;
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .cc-table td {
        padding: 8px 12px;
        color: var(--cpk-text-primary);
        border-bottom: 1px solid var(--cpk-divider);
      }
    `,
  ],
})
export class CcDataTable extends CatalogComponent<typeof DataTableApi> {
  protected readonly columns = computed(
    () => (this.props()['columns']?.value() ?? []) as TableColumn[],
  );
  protected readonly rows = computed(
    () => (this.props()['rows']?.value() ?? []) as Record<string, unknown>[],
  );

  protected cell(row: Record<string, unknown>, key: string): string {
    return String(row[key] ?? '');
  }
}
