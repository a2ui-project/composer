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

import {
  Cell,
  Row as ChannelRow,
  Table,
  type Renderable,
  type TableColumn,
} from '@copilotkit/channels-ui';
import {type LowerComponentContext} from './lowering-context';
import {LoweringError} from './lowering-error';
import {DiagnosticCode} from './preview-snapshot';
import {arrayField, recordField} from './record-fields';

/** Lowers the sample's `Table` component to a Slack table block. */
export function lowerTable(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const columns = arrayField(props, 'columns').map((column): TableColumn => {
    const header = recordField(column, 'header');
    const align = recordField(column, 'align');
    if (
      typeof header !== 'string' ||
      (align !== undefined && align !== 'left' && align !== 'center' && align !== 'right')
    ) {
      throw new LoweringError(
        DiagnosticCode.A2UI_INVALID_TABLE_HEADER,
        'Table headers must resolve to text with a supported alignment.',
        context.componentId,
      );
    }
    return {header, align};
  });
  const rows = arrayField(props, 'rows').map((row, index) => {
    if (!Array.isArray(row) || row.length !== columns.length) {
      throw new LoweringError(
        DiagnosticCode.A2UI_INVALID_TABLE_ROW,
        `Table row ${index + 1} must have exactly ${columns.length} cells, one per column.`,
        context.componentId,
      );
    }
    return ChannelRow({
      children: row.map(value => {
        if (typeof value !== 'string') {
          throw new LoweringError(
            DiagnosticCode.A2UI_INVALID_TABLE_CELL,
            `Table row ${index + 1} contains a cell that did not resolve to text.`,
            context.componentId,
          );
        }
        return Cell({children: value});
      }),
    });
  });
  return Table({columns, children: rows});
}
