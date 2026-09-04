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

import {describe, it, expect} from 'vitest';
import {renderSurface} from '../test-harness';

const COLUMNS = [
  {key: 'route', label: 'Route'},
  {key: 'seats', label: 'Seats'},
];

describe('CcDataTable', () => {
  it('renders a header per column and a cell per column for every row', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'DataTable',
        columns: COLUMNS,
        rows: [
          {route: 'SFO-JFK', seats: 12},
          {route: 'LAX-ORD', seats: 4},
        ],
      },
    ]);

    const headers = Array.from(host.querySelectorAll('.cc-table th')).map(th =>
      th.textContent?.trim(),
    );
    expect(headers).toEqual(['Route', 'Seats']);

    expect(host.querySelectorAll('.cc-table tbody tr').length).toBe(2);
    const cells = Array.from(host.querySelectorAll('.cc-table tbody td')).map(td =>
      td.textContent?.trim(),
    );
    expect(cells).toEqual(['SFO-JFK', '12', 'LAX-ORD', '4']);
  });

  it('drops null and undefined rows instead of throwing on a malformed data model', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'DataTable',
        columns: COLUMNS,
        rows: [{route: 'SFO-JFK', seats: 12}, null, undefined, {route: 'LAX-ORD', seats: 4}],
      },
    ]);

    // A null row must not reach cell(), and must not take the table down with it.
    expect(host.querySelectorAll('.cc-table tbody tr').length).toBe(2);
    const cells = Array.from(host.querySelectorAll('.cc-table tbody td')).map(td =>
      td.textContent?.trim(),
    );
    expect(cells).toEqual(['SFO-JFK', '12', 'LAX-ORD', '4']);
  });

  it('renders an empty cell for a column key the row does not carry', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'DataTable',
        columns: COLUMNS,
        rows: [{route: 'SFO-JFK'}],
      },
    ]);

    const cells = Array.from(host.querySelectorAll('.cc-table tbody td')).map(td =>
      td.textContent?.trim(),
    );
    expect(cells).toEqual(['SFO-JFK', '']);
  });
});
