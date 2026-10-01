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

import {renderToStaticMarkup} from 'react-dom/server';

/** Chart kinds the Slack catalog accepts. The values match Channels UI's `ChartProps.type`. */
export enum ChartType {
  VERTICAL_BAR = 'verticalBar',
  HORIZONTAL_BAR = 'horizontalBar',
  LINE = 'line',
  PIE = 'pie',
  DONUT = 'donut',
}

export interface ChartPoint {
  readonly label: string;
  readonly value: number;
}

/** Everything needed to draw one chart. */
export interface ChartImageProps {
  readonly type: ChartType;
  readonly title?: string;
  readonly xAxisTitle?: string;
  readonly yAxisTitle?: string;
  readonly data: readonly ChartPoint[];
}

/** Creates and frees object URLs; the global `URL` in the browser. */
export interface ObjectUrlApi {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
}

/**
 * Hands out image URLs for drawn charts and frees the ones no longer shown.
 *
 * A URL survives until it has been missing from two releases in a row, so an image the
 * preview still shows while React commits the next render never breaks.
 */
export interface ChartImageStore {
  /** Returns a URL serving the SVG markup, reusing the URL of identical markup. */
  urlFor(svg: string): string;
  /** Frees URLs that are in neither `keep` nor the previous call's `keep`. */
  release(keep: ReadonlySet<string>): void;
  /** Frees every URL. */
  dispose(): void;
}

interface Plot {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Domain {
  readonly min: number;
  readonly max: number;
  readonly ticks: readonly number[];
}

interface ChartAreaProps {
  readonly chart: ChartImageProps;
  /** Where the drawing area starts, below the title. */
  readonly top: number;
}

const WIDTH = 600;
const HEIGHT = 360;
const FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const INK = '#1f2328';
const MUTED = '#57606a';
const GRID = '#d0d7de';
const BACKGROUND = '#ffffff';
/** Every color has at least 3:1 contrast against the white background. */
const PALETTE = [
  '#2563eb',
  '#d97706',
  '#059669',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
];

const TYPE_NAMES: Record<ChartType, string> = {
  [ChartType.VERTICAL_BAR]: 'Bar chart',
  [ChartType.HORIZONTAL_BAR]: 'Horizontal bar chart',
  [ChartType.LINE]: 'Line chart',
  [ChartType.PIE]: 'Pie chart',
  [ChartType.DONUT]: 'Donut chart',
};

const VALUE_FORMAT = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});

export function formatChartValue(value: number): string {
  return VALUE_FORMAT.format(value);
}

/** Describes the chart in words, e.g. "Pie chart, Possession: Argentina 70, Mexico 30". */
export function chartAltText(chart: ChartImageProps, maxLength: number): string {
  const points = chart.data
    .map(point => `${point.label} ${formatChartValue(point.value)}`)
    .join(', ');
  const text = `${TYPE_NAMES[chart.type]}${chart.title ? `, ${chart.title}` : ''}: ${points}`;
  return truncate(text, maxLength);
}

/** Draws the chart as standalone SVG markup that can be served as an image. */
export function renderChartSvg(chart: ChartImageProps): string {
  return renderToStaticMarkup(<ChartSvg chart={chart} />);
}

export function createBlobChartImageStore(urls: ObjectUrlApi = URL): ChartImageStore {
  const urlsByMarkup = new Map<string, string>();
  let previousKeep: ReadonlySet<string> = new Set();

  return {
    urlFor(svg) {
      const existing = urlsByMarkup.get(svg);
      if (existing) {
        return existing;
      }
      const url = urls.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
      urlsByMarkup.set(svg, url);
      return url;
    },

    release(keep) {
      for (const [svg, url] of urlsByMarkup) {
        if (!keep.has(url) && !previousKeep.has(url)) {
          urls.revokeObjectURL(url);
          urlsByMarkup.delete(svg);
        }
      }
      previousKeep = new Set(keep);
    },

    dispose() {
      for (const url of urlsByMarkup.values()) {
        urls.revokeObjectURL(url);
      }
      urlsByMarkup.clear();
      previousKeep = new Set();
    },
  };
}

function ChartSvg({chart}: {readonly chart: ChartImageProps}) {
  const top = chart.title ? 52 : 20;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      fontFamily={FONT_FAMILY}
    >
      <rect width={WIDTH} height={HEIGHT} fill={BACKGROUND} />
      {chart.title ? (
        <text x={WIDTH / 2} y={32} textAnchor="middle" fontSize={18} fontWeight={600} fill={INK}>
          {truncate(chart.title, 60)}
        </text>
      ) : null}
      {chart.type === ChartType.PIE || chart.type === ChartType.DONUT ? (
        <PieChart chart={chart} top={top} />
      ) : chart.type === ChartType.HORIZONTAL_BAR ? (
        <HorizontalBarChart chart={chart} top={top} />
      ) : (
        <VerticalChart chart={chart} top={top} />
      )}
    </svg>
  );
}

function PieChart({chart, top}: ChartAreaProps) {
  const available = HEIGHT - top - 16;
  const radius = Math.min(130, available / 2);
  const cx = 32 + radius;
  const cy = top + available / 2;
  const total = chart.data.reduce((sum, point) => sum + point.value, 0);
  const slices = sliceAngles(chart.data.map(point => point.value));
  const rowHeight = Math.min(22, available / chart.data.length);
  const legendX = cx + radius + 36;

  return (
    <g>
      {slices.map(({start, end}, index) => {
        if (end === start) {
          return null;
        }
        if (end - start >= 2 * Math.PI - 1e-9) {
          return (
            <circle
              key={index}
              className="slice"
              cx={round(cx)}
              cy={round(cy)}
              r={round(radius)}
              fill={paletteColor(index)}
            />
          );
        }
        return (
          <path
            key={index}
            className="slice"
            d={slicePath(cx, cy, radius, start, end)}
            fill={paletteColor(index)}
            stroke={BACKGROUND}
            strokeWidth={2}
          />
        );
      })}
      {chart.type === ChartType.DONUT ? (
        <circle
          className="donut-hole"
          cx={round(cx)}
          cy={round(cy)}
          r={round(radius * 0.56)}
          fill={BACKGROUND}
        />
      ) : null}
      {chart.data.map((point, index) => {
        const y = round(top + 8 + rowHeight * index);
        const share = total > 0 ? Math.round((point.value / total) * 100) : 0;
        return (
          <g key={index}>
            <rect
              x={round(legendX)}
              y={y}
              width={12}
              height={12}
              rx={2}
              fill={paletteColor(index)}
            />
            <text x={round(legendX + 20)} y={y + 11} fontSize={13} fill={INK}>
              {`${truncate(point.label, 28)} · ${formatChartValue(point.value)} (${share}%)`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Vertical bars or a line, both with categories along the bottom. */
function VerticalChart({chart, top}: ChartAreaProps) {
  const left = chart.yAxisTitle ? 72 : 56;
  const bottom = chart.xAxisTitle ? 64 : 44;
  const plot: Plot = {x: left, y: top, width: WIDTH - left - 24, height: HEIGHT - top - bottom};
  const domain = niceDomain(chart.data.map(point => point.value));
  const valueY = (value: number) =>
    plot.y + plot.height - ((value - domain.min) / (domain.max - domain.min)) * plot.height;
  const band = plot.width / chart.data.length;
  const centerX = (index: number) => plot.x + band * index + band / 2;
  const labelLength = Math.max(4, Math.floor(band / 7));
  const zeroY = valueY(0);

  return (
    <g>
      {domain.ticks.map(tick => (
        <g key={tick}>
          <line
            x1={plot.x}
            x2={plot.x + plot.width}
            y1={round(valueY(tick))}
            y2={round(valueY(tick))}
            stroke={GRID}
            strokeWidth={1}
          />
          <text
            x={plot.x - 8}
            y={round(valueY(tick) + 4)}
            textAnchor="end"
            fontSize={11}
            fill={MUTED}
          >
            {formatChartValue(tick)}
          </text>
        </g>
      ))}
      {chart.type === ChartType.LINE ? (
        <g>
          <polyline
            className="line"
            fill="none"
            stroke={PALETTE[0]}
            strokeWidth={3}
            strokeLinejoin="round"
            points={chart.data
              .map((point, index) => `${round(centerX(index))},${round(valueY(point.value))}`)
              .join(' ')}
          />
          {chart.data.map((point, index) => (
            <g key={index}>
              <circle
                className="point"
                cx={round(centerX(index))}
                cy={round(valueY(point.value))}
                r={4}
                fill={PALETTE[0]}
              />
              <text
                x={round(centerX(index))}
                y={round(valueY(point.value) - 10)}
                textAnchor="middle"
                fontSize={12}
                fill={INK}
              >
                {formatChartValue(point.value)}
              </text>
            </g>
          ))}
        </g>
      ) : (
        chart.data.map((point, index) => {
          const barWidth = Math.min(64, band * 0.6);
          const end = valueY(point.value);
          return (
            <g key={index}>
              <rect
                className="bar"
                x={round(centerX(index) - barWidth / 2)}
                y={round(Math.min(zeroY, end))}
                width={round(barWidth)}
                height={round(Math.abs(zeroY - end))}
                rx={2}
                fill={PALETTE[0]}
              />
              <text
                x={round(centerX(index))}
                y={round(point.value >= 0 ? end - 6 : end + 14)}
                textAnchor="middle"
                fontSize={12}
                fill={INK}
              >
                {formatChartValue(point.value)}
              </text>
            </g>
          );
        })
      )}
      {chart.data.map((point, index) => (
        <text
          key={index}
          x={round(centerX(index))}
          y={round(plot.y + plot.height + 18)}
          textAnchor="middle"
          fontSize={12}
          fill={MUTED}
        >
          {truncate(point.label, labelLength)}
        </text>
      ))}
      <AxisTitles chart={chart} plot={plot} />
    </g>
  );
}

function HorizontalBarChart({chart, top}: ChartAreaProps) {
  const left = chart.yAxisTitle ? 140 : 124;
  const bottom = chart.xAxisTitle ? 56 : 36;
  const plot: Plot = {x: left, y: top, width: WIDTH - left - 48, height: HEIGHT - top - bottom};
  const domain = niceDomain(chart.data.map(point => point.value));
  const valueX = (value: number) =>
    plot.x + ((value - domain.min) / (domain.max - domain.min)) * plot.width;
  const band = plot.height / chart.data.length;
  const barHeight = Math.min(28, band * 0.6);
  const zeroX = valueX(0);

  return (
    <g>
      {domain.ticks.map(tick => (
        <g key={tick}>
          <line
            x1={round(valueX(tick))}
            x2={round(valueX(tick))}
            y1={plot.y}
            y2={plot.y + plot.height}
            stroke={GRID}
            strokeWidth={1}
          />
          <text
            x={round(valueX(tick))}
            y={round(plot.y + plot.height + 16)}
            textAnchor="middle"
            fontSize={11}
            fill={MUTED}
          >
            {formatChartValue(tick)}
          </text>
        </g>
      ))}
      {chart.data.map((point, index) => {
        const centerY = plot.y + band * index + band / 2;
        const end = valueX(point.value);
        return (
          <g key={index}>
            <text x={plot.x - 8} y={round(centerY + 4)} textAnchor="end" fontSize={12} fill={MUTED}>
              {truncate(point.label, 18)}
            </text>
            <rect
              className="bar"
              x={round(Math.min(zeroX, end))}
              y={round(centerY - barHeight / 2)}
              width={round(Math.abs(end - zeroX))}
              height={round(barHeight)}
              rx={2}
              fill={PALETTE[0]}
            />
            <text
              x={round(point.value >= 0 ? end + 6 : end - 6)}
              y={round(centerY + 4)}
              textAnchor={point.value >= 0 ? 'start' : 'end'}
              fontSize={12}
              fill={INK}
            >
              {formatChartValue(point.value)}
            </text>
          </g>
        );
      })}
      <AxisTitles chart={chart} plot={plot} />
    </g>
  );
}

function AxisTitles({chart, plot}: {readonly chart: ChartImageProps; readonly plot: Plot}) {
  const middleY = round(plot.y + plot.height / 2);
  return (
    <g>
      {chart.xAxisTitle ? (
        <text
          x={round(plot.x + plot.width / 2)}
          y={HEIGHT - 12}
          textAnchor="middle"
          fontSize={12}
          fill={MUTED}
        >
          {truncate(chart.xAxisTitle, 60)}
        </text>
      ) : null}
      {chart.yAxisTitle ? (
        <text
          x={16}
          y={middleY}
          transform={`rotate(-90 16 ${middleY})`}
          textAnchor="middle"
          fontSize={12}
          fill={MUTED}
        >
          {truncate(chart.yAxisTitle, 40)}
        </text>
      ) : null}
    </g>
  );
}

/** Splits a full turn among the values, starting at twelve o'clock. */
function sliceAngles(values: readonly number[]): Array<{start: number; end: number}> {
  const total = values.reduce((sum, value) => sum + value, 0);
  let start = -Math.PI / 2;
  return values.map(value => {
    const end = start + (total > 0 ? (value / total) * 2 * Math.PI : 0);
    const slice = {start, end};
    start = end;
    return slice;
  });
}

function slicePath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const largeArc = end - start > Math.PI ? 1 : 0;
  return [
    `M ${round(cx)} ${round(cy)}`,
    `L ${round(cx + radius * Math.cos(start))} ${round(cy + radius * Math.sin(start))}`,
    `A ${round(radius)} ${round(radius)} 0 ${largeArc} 1`,
    `${round(cx + radius * Math.cos(end))} ${round(cy + radius * Math.sin(end))}`,
    'Z',
  ].join(' ');
}

/** A value range that includes zero and ends on round numbers, with about four steps. */
function niceDomain(values: readonly number[]): Domain {
  const lowest = Math.min(0, ...values);
  let min = lowest;
  let max = Math.max(0, ...values);
  if (min === max) {
    max = min + 1;
  }
  const step = niceStep((max - min) / 4);
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  // A negative bar's value label sits past the end of the bar; leave room for it so it
  // doesn't land on the category labels at the edge of the plot.
  if (lowest < 0 && lowest - min < step / 2) {
    min -= step;
  }
  const steps = Math.round((max - min) / step);
  const ticks = Array.from({length: steps + 1}, (_, index) =>
    Number((min + index * step).toFixed(10)),
  );
  return {min, max, ticks};
}

function niceStep(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return nice * magnitude;
}

function paletteColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}
