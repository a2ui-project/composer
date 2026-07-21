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

describe('CcPieChart', () => {
  it('renders one svg slice path per data item', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'PieChart',
        innerRadius: 40,
        data: [
          {label: 'North', value: 45},
          {label: 'South', value: 25},
          {label: 'East', value: 20},
          {label: 'West', value: 10},
        ],
      },
    ]);

    const paths = host.querySelectorAll('svg path');
    expect(paths.length).toBe(4);

    // Every slice emits a non-empty arc path.
    paths.forEach(p => expect(p.getAttribute('d')?.length ?? 0).toBeGreaterThan(0));

    // Legend echoes each labelled datum.
    const legend = host.querySelectorAll('.cc-pie__legend-item');
    expect(legend.length).toBe(4);
    expect(host.textContent).toContain('North');
  });
});
