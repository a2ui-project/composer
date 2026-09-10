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

  it('clamps negative values to zero so slice geometry stays valid', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'PieChart',
        data: [
          {label: 'North', value: 50},
          {label: 'South', value: -25},
          {label: 'East', value: 50},
        ],
      },
    ]);

    const paths = host.querySelectorAll('svg path');
    expect(paths.length).toBe(3);

    // The negative datum must not corrupt the running cursor: every arc path
    // is finite (no NaN coordinates) and the sweep never exceeds the circle.
    paths.forEach(p => {
      const d = p.getAttribute('d') ?? '';
      expect(d.length).toBeGreaterThan(0);
      expect(d).not.toContain('NaN');
    });

    // Total is computed from clamped values (50 + 0 + 50), so the negative
    // datum contributes a zero-width sweep and does not advance the cursor:
    // its arc starts and ends at the same point.
    const southStart = (paths[1].getAttribute('d') ?? '').match(/^M ([\d.-]+) ([\d.-]+)/);
    const southEnd = (paths[1].getAttribute('d') ?? '').match(/A 80 80 0 \d 1 ([\d.-]+) ([\d.-]+)/);
    expect(southStart?.[1]).toBe(southEnd?.[1]);
    expect(southStart?.[2]).toBe(southEnd?.[2]);

    // The legend reports the clamped value, not the raw negative.
    const values = Array.from(host.querySelectorAll('.cc-pie__legend-value')).map(
      el => el.textContent?.trim() ?? '',
    );
    expect(values).toEqual(['50', '0', '50']);
  });

  it('renders no slices when every value is negative', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'PieChart',
        data: [
          {label: 'North', value: -10},
          {label: 'South', value: -5},
        ],
      },
    ]);

    // Clamped total is 0, so there is nothing to draw and no legend.
    expect(host.querySelectorAll('svg path').length).toBe(0);
    expect(host.querySelectorAll('.cc-pie__legend-item').length).toBe(0);
  });
});
