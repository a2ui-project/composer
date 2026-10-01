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

import {describe, expect, it, vi} from 'vitest';
import {
  chartAltText,
  createBlobChartImageStore,
  renderChartSvg,
  type ChartImageProps,
  type ObjectUrlApi,
} from './chart-image';

const possession: ChartImageProps = {
  type: 'pie',
  title: 'Possession',
  data: [
    {label: 'Argentina', value: 70},
    {label: 'Mexico', value: 30},
  ],
};

const countOf = (markup: string, fragment: string): number => markup.split(fragment).length - 1;

describe('renderChartSvg', () => {
  it('draws a standalone SVG with the title, one slice per value, and a legend', () => {
    const svg = renderChartSvg(possession);

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 600 360"');
    expect(svg).toContain('>Possession</text>');
    expect(countOf(svg, 'class="slice"')).toBe(2);
    expect(svg).toContain('Argentina · 70 (70%)');
    expect(svg).toContain('Mexico · 30 (30%)');
    expect(svg).not.toContain('donut-hole');
  });

  it('cuts a hole in the middle of a donut chart', () => {
    expect(renderChartSvg({...possession, type: 'donut'})).toContain('class="donut-hole"');
  });

  it('draws a full circle when one value holds the whole pie', () => {
    const svg = renderChartSvg({type: 'pie', data: [{label: 'All', value: 5}]});

    expect(countOf(svg, 'class="slice"')).toBe(1);
    expect(svg).toContain('<circle class="slice"');
  });

  it('draws one labeled bar per value on vertical and horizontal bar charts', () => {
    const data = [
      {label: 'Q1', value: 12},
      {label: 'Q2', value: 18.5},
      {label: 'Q3', value: 9},
    ];

    for (const type of ['verticalBar', 'horizontalBar'] as const) {
      const svg = renderChartSvg({type, data, xAxisTitle: 'Quarter', yAxisTitle: 'Revenue'});
      expect(countOf(svg, 'class="bar"')).toBe(3);
      expect(svg).toContain('>18.5</text>');
      expect(svg).toContain('>Q2</text>');
      expect(svg).toContain('>Quarter</text>');
      expect(svg).toContain('>Revenue</text>');
    }
  });

  it('draws bars below the zero line, leaving room under the lowest one for its label', () => {
    const svg = renderChartSvg({
      type: 'verticalBar',
      data: [
        {label: 'Gain', value: 4},
        {label: 'Loss', value: -2},
      ],
    });

    expect(countOf(svg, 'class="bar"')).toBe(2);
    expect(svg).toContain('>-2</text>');
    // The axis reaches one step below -2, so the -2 label never sits on the "Loss" label.
    expect(svg).toContain('>-4</text>');
  });

  it('draws a line through every point', () => {
    const svg = renderChartSvg({
      type: 'line',
      data: [
        {label: 'Mon', value: 3},
        {label: 'Tue', value: 5},
        {label: 'Wed', value: 4},
      ],
    });

    expect(countOf(svg, 'class="line"')).toBe(1);
    expect(countOf(svg, 'class="point"')).toBe(3);
  });

  it('escapes labels instead of emitting markup', () => {
    const svg = renderChartSvg({
      type: 'verticalBar',
      data: [{label: '<script>alert(1)</script>', value: 1}],
    });

    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });
});

describe('chartAltText', () => {
  it('describes the chart for Slack alt text', () => {
    expect(chartAltText(possession, 2000)).toBe('Pie chart, Possession: Argentina 70, Mexico 30');
  });

  it('cuts long descriptions to the limit with an ellipsis', () => {
    const alt = chartAltText(
      {
        type: 'line',
        data: Array.from({length: 20}, (_, index) => ({label: 'x'.repeat(200), value: index})),
      },
      100,
    );

    expect(alt).toHaveLength(100);
    expect(alt.endsWith('…')).toBe(true);
  });
});

describe('createBlobChartImageStore', () => {
  const fakeUrls = () => {
    let created = 0;
    return {
      createObjectURL: vi.fn<ObjectUrlApi['createObjectURL']>(() => `blob:chart-${++created}`),
      revokeObjectURL: vi.fn<ObjectUrlApi['revokeObjectURL']>(),
    };
  };

  it('serves SVG markup as an image and reuses the URL for identical markup', () => {
    const urls = fakeUrls();
    const store = createBlobChartImageStore(urls);

    const first = store.urlFor('<svg>a</svg>');

    expect(store.urlFor('<svg>a</svg>')).toBe(first);
    expect(urls.createObjectURL).toHaveBeenCalledTimes(1);
    expect(urls.createObjectURL.mock.calls[0][0].type).toBe('image/svg+xml');
  });

  it('keeps URLs from the current and previous release and frees older ones', () => {
    const urls = fakeUrls();
    const store = createBlobChartImageStore(urls);
    const first = store.urlFor('<svg>a</svg>');
    store.release(new Set([first]));
    const second = store.urlFor('<svg>b</svg>');

    store.release(new Set([second]));
    expect(urls.revokeObjectURL).not.toHaveBeenCalled();

    store.release(new Set([second]));
    expect(urls.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(first);
    expect(store.urlFor('<svg>a</svg>')).not.toBe(first);
  });

  it('frees every URL on dispose', () => {
    const urls = fakeUrls();
    const store = createBlobChartImageStore(urls);
    const first = store.urlFor('<svg>a</svg>');
    const second = store.urlFor('<svg>b</svg>');

    store.dispose();

    expect(urls.revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual(
      [first, second].sort(),
    );
  });
});
