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

import {describe, expect, it} from 'vitest';
import {ChartType, describeChart, renderChartSvg, type ChartImageProps} from './chart-image';
import {DrawnImageColor} from './drawn-image-style';

const possession: ChartImageProps = {
  type: ChartType.PIE,
  title: 'Possession',
  data: [
    {label: 'Argentina', value: 70},
    {label: 'Mexico', value: 30},
  ],
};

/** How many elements of the drawing match `selector`. */
const countOf = (markup: string, selector: string): number =>
  new DOMParser().parseFromString(markup, 'image/svg+xml').querySelectorAll(selector).length;

/** A pie slice is a path, or a circle when one value holds the whole pie. */
const SLICE = 'path';
/** Bars are the only rounded rectangles in a bar chart. */
const BAR = 'rect[rx]';
const DONUT_HOLE = `circle[fill="${DrawnImageColor.BACKGROUND}"]`;

const QUARTERS = [
  {label: 'Q1', value: 12},
  {label: 'Q2', value: 18.5},
  {label: 'Q3', value: 9},
];

describe('renderChartSvg', () => {
  it('draws standalone SVG markup that can be served as an image', () => {
    const svg = renderChartSvg(possession);

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 600 360"');
  });

  it('draws the title', () => {
    expect(renderChartSvg(possession)).toContain('>Possession</text>');
  });

  it('draws one slice per value of a pie chart', () => {
    expect(countOf(renderChartSvg(possession), SLICE)).toBe(2);
  });

  it('lists each slice in the legend with its value and share', () => {
    const svg = renderChartSvg(possession);

    expect(svg).toContain('Argentina · 70 (70%)');
    expect(svg).toContain('Mexico · 30 (30%)');
  });

  it('draws a pie chart without a hole', () => {
    expect(countOf(renderChartSvg(possession), DONUT_HOLE)).toBe(0);
  });

  it('cuts a hole in the middle of a donut chart', () => {
    expect(countOf(renderChartSvg({...possession, type: ChartType.DONUT}), DONUT_HOLE)).toBe(1);
  });

  it('draws a full circle when one value holds the whole pie', () => {
    const svg = renderChartSvg({type: ChartType.PIE, data: [{label: 'All', value: 5}]});

    expect(countOf(svg, SLICE)).toBe(0);
    expect(countOf(svg, 'circle')).toBe(1);
  });

  it.each([ChartType.VERTICAL_BAR, ChartType.HORIZONTAL_BAR])(
    'draws one bar per value on a %s chart',
    type => {
      expect(countOf(renderChartSvg({type, data: QUARTERS}), BAR)).toBe(3);
    },
  );

  it.each([ChartType.VERTICAL_BAR, ChartType.HORIZONTAL_BAR])(
    'labels each bar of a %s chart with its value and category',
    type => {
      const svg = renderChartSvg({type, data: QUARTERS});

      expect(svg).toContain('>18.5</text>');
      expect(svg).toContain('>Q2</text>');
    },
  );

  it.each([ChartType.VERTICAL_BAR, ChartType.HORIZONTAL_BAR])(
    'draws the axis titles of a %s chart',
    type => {
      const svg = renderChartSvg({
        type,
        data: QUARTERS,
        xAxisTitle: 'Quarter',
        yAxisTitle: 'Revenue',
      });

      expect(svg).toContain('>Quarter</text>');
      expect(svg).toContain('>Revenue</text>');
    },
  );

  const gainAndLoss: ChartImageProps = {
    type: ChartType.VERTICAL_BAR,
    data: [
      {label: 'Gain', value: 4},
      {label: 'Loss', value: -2},
    ],
  };

  it('draws a negative value as a labeled bar below the zero line', () => {
    const svg = renderChartSvg(gainAndLoss);

    expect(countOf(svg, BAR)).toBe(2);
    expect(svg).toContain('>-2</text>');
  });

  it('extends the axis a step below the lowest value, to leave room for its label', () => {
    // The axis reaches one step below -2, so the -2 label never sits on the "Loss" label.
    expect(renderChartSvg(gainAndLoss)).toContain('>-4</text>');
  });

  it('draws a line through every point', () => {
    const svg = renderChartSvg({
      type: ChartType.LINE,
      data: [
        {label: 'Mon', value: 3},
        {label: 'Tue', value: 5},
        {label: 'Wed', value: 4},
      ],
    });

    expect(countOf(svg, 'polyline')).toBe(1);
    expect(countOf(svg, 'circle')).toBe(3);
  });
});

describe('describeChart', () => {
  it('describes the chart in words for its alt text', () => {
    expect(describeChart(possession)).toBe('Pie chart, Possession: Argentina 70, Mexico 30');
  });
});
