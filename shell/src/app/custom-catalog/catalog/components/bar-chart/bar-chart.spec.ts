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

describe('CcBarChart', () => {
  it('renders one bar per data item with formatted values', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'BarChart',
        color: '#3b82f6',
        valuePrefix: '$',
        valueSuffix: 'K',
        data: [
          {label: 'Jan', value: 240},
          {label: 'Feb', value: 305},
          {label: 'Mar', value: 280},
        ],
      },
    ]);

    const bars = host.querySelectorAll('rect.cc-bar__rect');
    expect(bars.length).toBe(3);

    // Tallest bar (Feb=305) is the full plot height; others scale below it.
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')));
    expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));

    // valuePrefix / valueSuffix decorate the value labels.
    expect(host.textContent).toContain('$305K');
    expect(host.textContent).toContain('Feb');
  });

  it('clamps negative values to zero so no bar gets a negative SVG height', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'BarChart',
        data: [
          {label: 'Jan', value: -50},
          {label: 'Feb', value: 100},
          {label: 'Mar', value: 25},
        ],
      },
    ]);

    const bars = host.querySelectorAll('rect.cc-bar__rect');
    expect(bars.length).toBe(3);

    // A negative height is invalid SVG geometry; every bar must be >= 0.
    const heights = Array.from(bars).map(b => Number(b.getAttribute('height')));
    heights.forEach(h => {
      expect(Number.isFinite(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
    });

    // The negative datum collapses to a zero-height bar, and the max used for
    // scaling is the largest clamped value (Feb=100), which fills the plot.
    expect(heights[0]).toBe(0);
    expect(heights[1]).toBeGreaterThan(heights[2]);

    // The clamped value is what gets labelled, not the raw negative.
    const labels = Array.from(host.querySelectorAll('.cc-bar__value')).map(
      el => el.textContent?.trim() ?? '',
    );
    expect(labels).toEqual(['0', '100', '25']);
  });

  it('renders a flat baseline when every value is negative', async () => {
    const {host} = await renderSurface([
      {
        id: 'root',
        component: 'BarChart',
        data: [
          {label: 'Jan', value: -10},
          {label: 'Feb', value: -20},
        ],
      },
    ]);

    const heights = Array.from(host.querySelectorAll('rect.cc-bar__rect')).map(b =>
      Number(b.getAttribute('height')),
    );
    expect(heights).toEqual([0, 0]);
  });
});
