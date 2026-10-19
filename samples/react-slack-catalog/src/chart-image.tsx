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

import {type ChartProps, type ChartType as ChannelChartType} from '@copilotkit/channels-ui';
import {renderToStaticMarkup} from 'react-dom/server';
import {
  DRAWN_IMAGE_FONT_FAMILY,
  DrawnImageColor,
  FontWeight,
  baselineBelow,
  baselineCenteredOn,
  charactersThatFit,
  clipText,
  round,
} from './drawn-image-style';

/**
 * Chart kinds the Slack catalog accepts: Channels UI's `ChartType`, as an enum. The checks
 * below fail the build if the two lists drift apart.
 */
export enum ChartType {
  VERTICAL_BAR = 'verticalBar',
  HORIZONTAL_BAR = 'horizontalBar',
  LINE = 'line',
  PIE = 'pie',
  DONUT = 'donut',
}

/** Compiles only when `A` is assignable to `B`, so a check written with it fails the build. */
type AssignableTo<A extends B, B> = A;

// Fail the build if `ChartType` and Channels UI's `ChartType` stop listing the same chart
// kinds. `${ChartType}` is the union of the enum's string values. Checking both directions
// catches a kind added to either list.
type _EnumChartTypesInChannelsUi = AssignableTo<`${ChartType}`, ChannelChartType>;
type _ChannelsUiChartTypesInEnum = AssignableTo<ChannelChartType, `${ChartType}`>;

/**
 * Everything needed to draw one chart: Channels UI's `ChartProps`, with the chart type
 * required. `data` holds the values in the order they are drawn.
 */
export interface ChartImageProps extends Readonly<ChartProps> {
  readonly type: ChartType;
}

/** The area inside the axes, where the bars or the line and the gridlines are drawn. */
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
  /** Where the chart starts, below the title. */
  readonly top: number;
}

/** The size of the drawing, in SVG units. Slack scales the image to fit the message. */
const WIDTH = 600;
const HEIGHT = 360;
const INK = DrawnImageColor.INK;
const MUTED = DrawnImageColor.MUTED;
const GRID = DrawnImageColor.RULE;
const BACKGROUND = DrawnImageColor.BACKGROUND;
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

/** The chart title's font size. */
const TITLE_FONT_SIZE = 18;
/** The font size of a pie or donut chart's legend. */
const LEGEND_FONT_SIZE = 13;
/** The font size of category labels, value labels, and axis titles. */
const LABEL_FONT_SIZE = 12;
/** The font size of the numbers along the value axis. */
const TICK_FONT_SIZE = 11;

/** The height of the band at the top that holds the title, when the chart has one. */
const TITLE_HEIGHT = 52;
/** The title's baseline, measured down from the top of the image. */
const TITLE_BASELINE = 32;
/** The space above the chart when it has no title. */
const UNTITLED_TOP_MARGIN = 20;
/** The most characters of the title, or of the x-axis title, the chart shows. */
const TITLE_MAX_CHARACTERS = 60;
/** The most characters of the y-axis title the chart shows. */
const Y_AXIS_TITLE_MAX_CHARACTERS = 40;
/** The extra room left of the plot that a y-axis title takes. */
const Y_AXIS_TITLE_WIDTH = 16;
/** The extra room below the plot that an x-axis title takes. */
const X_AXIS_TITLE_HEIGHT = 20;
/** The x-axis title's baseline, measured up from the bottom of the image. */
const X_AXIS_TITLE_BOTTOM = 12;
/** The y-axis title's baseline, measured from the left of the image. It reads upward. */
const Y_AXIS_TITLE_LEFT = 16;

/** The room left of a vertical bar or line chart's plot, for the value axis's numbers. */
const VERTICAL_PLOT_LEFT = 56;
/** The room right of a vertical bar or line chart's plot. */
const VERTICAL_PLOT_RIGHT = 24;
/** The room below a vertical bar or line chart's plot, for the category labels. */
const VERTICAL_PLOT_BOTTOM = 44;
/** The room left of a horizontal bar chart's plot, for the category labels. */
const HORIZONTAL_PLOT_LEFT = 124;
/** The room right of a horizontal bar chart's plot, for the longest bar's value label. */
const HORIZONTAL_PLOT_RIGHT = 48;
/** The room below a horizontal bar chart's plot, for the value axis's numbers. */
const HORIZONTAL_PLOT_BOTTOM = 36;
/** The space between the plot's edge and the labels and numbers beside it. */
const AXIS_LABEL_GAP = 8;
/** The fewest characters a vertical chart's category label keeps, however narrow its band. */
const MIN_CATEGORY_LABEL_CHARACTERS = 4;
/** The most characters of a horizontal bar chart's category label, which sits left of the plot. */
const HORIZONTAL_CATEGORY_LABEL_MAX_CHARACTERS = 18;
/** The width of the gridline at each number on the value axis. */
const GRID_LINE_WIDTH = 1;
/** About how many steps the value axis is split into; see `niceDomain`. */
const TARGET_TICK_STEPS = 4;

/** How much of its category's band a bar fills; the rest is the space between bars. */
const BAR_BAND_FRACTION = 0.6;
/** The widest a vertical bar can be. */
const VERTICAL_BAR_MAX_WIDTH = 64;
/** The thickest a horizontal bar can be. */
const HORIZONTAL_BAR_MAX_HEIGHT = 28;
/** The radius of the rounded corners of bars and legend swatches. */
const CORNER_RADIUS = 2;
/** The space between the end of a bar, or a line chart's point, and its value label. */
const VALUE_LABEL_GAP = 6;
/** The width of a line chart's line. */
const LINE_WIDTH = 3;
/** The radius of the dot at each point of a line chart. */
const POINT_RADIUS = 4;

/** The largest radius of a pie or donut, which leaves the right of the image for the legend. */
const PIE_MAX_RADIUS = 130;
/** The space between the image's left edge and the pie. */
const PIE_LEFT_MARGIN = 32;
/** The space between the pie and the image's bottom edge. */
const PIE_BOTTOM_MARGIN = 16;
/** The radius of a donut's hole, as a fraction of the donut's radius. */
const DONUT_HOLE_RATIO = 0.56;
/** The width of the background-colored line drawn between slices, which keeps them apart. */
const SLICE_SEPARATOR_WIDTH = 2;
/**
 * How close to a full turn a slice must be to be drawn as a circle. An SVG arc can't draw
 * a full circle, and floating-point error can leave a slice that holds the whole pie a
 * hair short of one.
 */
const FULL_TURN_TOLERANCE = 1e-9;
/** The space between the pie and its legend. */
const LEGEND_GAP = 36;
/** The space between the top of the chart, below the title, and the first legend row. */
const LEGEND_TOP_PADDING = 8;
/** The tallest a legend row can be. Rows get shorter when there are many slices. */
const LEGEND_MAX_ROW_HEIGHT = 22;
/** The size of the colored square in front of each legend entry. */
const SWATCH_SIZE = 12;
/** The space between a legend swatch and its text. */
const SWATCH_GAP = 8;
/** The most characters of a slice's label the legend shows, leaving room for its value. */
const LEGEND_LABEL_MAX_CHARACTERS = 28;

const TYPE_NAMES: Record<ChartType, string> = {
  [ChartType.VERTICAL_BAR]: 'Bar chart',
  [ChartType.HORIZONTAL_BAR]: 'Horizontal bar chart',
  [ChartType.LINE]: 'Line chart',
  [ChartType.PIE]: 'Pie chart',
  [ChartType.DONUT]: 'Donut chart',
};

const VALUE_FORMAT = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});

/** Formats a value for the chart's labels and alt text, with at most two decimal places. */
function formatChartValue(value: number): string {
  return VALUE_FORMAT.format(value);
}

/**
 * Describes the chart in words for its alt text, e.g. "Pie chart, Possession: Argentina 70,
 * Mexico 30".
 */
export function describeChart(chart: ChartImageProps): string {
  const points = chart.data
    .map(point => `${point.label} ${formatChartValue(point.value)}`)
    .join(', ');
  return `${TYPE_NAMES[chart.type]}${chart.title ? `, ${chart.title}` : ''}: ${points}`;
}

/** Draws the chart as standalone SVG markup that can be served as an image. */
export function renderChartSvg(chart: ChartImageProps): string {
  return renderToStaticMarkup(<ChartSvg chart={chart} />);
}

function ChartSvg({chart}: {readonly chart: ChartImageProps}) {
  const top = chart.title ? TITLE_HEIGHT : UNTITLED_TOP_MARGIN;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      fontFamily={DRAWN_IMAGE_FONT_FAMILY}
    >
      <rect width={WIDTH} height={HEIGHT} fill={BACKGROUND} />
      {chart.title ? (
        <text
          x={WIDTH / 2}
          y={TITLE_BASELINE}
          textAnchor="middle"
          fontSize={TITLE_FONT_SIZE}
          fontWeight={FontWeight.SEMIBOLD}
          fill={INK}
        >
          {clipText(chart.title, TITLE_MAX_CHARACTERS)}
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
  const available = HEIGHT - top - PIE_BOTTOM_MARGIN;
  const radius = Math.min(PIE_MAX_RADIUS, available / 2);
  const cx = PIE_LEFT_MARGIN + radius;
  const cy = top + available / 2;
  const total = chart.data.reduce((sum, point) => sum + point.value, 0);
  const slices = sliceAngles(chart.data.map(point => point.value));
  const rowHeight = Math.min(LEGEND_MAX_ROW_HEIGHT, available / chart.data.length);
  const legendX = cx + radius + LEGEND_GAP;

  return (
    <g>
      {slices.map(({start, end}, index) => {
        if (end === start) {
          return null;
        }
        if (end - start >= 2 * Math.PI - FULL_TURN_TOLERANCE) {
          return (
            <circle
              key={index}
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
            d={slicePath(cx, cy, radius, start, end)}
            fill={paletteColor(index)}
            stroke={BACKGROUND}
            strokeWidth={SLICE_SEPARATOR_WIDTH}
          />
        );
      })}
      {chart.type === ChartType.DONUT ? (
        <circle
          cx={round(cx)}
          cy={round(cy)}
          r={round(radius * DONUT_HOLE_RATIO)}
          fill={BACKGROUND}
        />
      ) : null}
      {chart.data.map((point, index) => {
        const y = top + LEGEND_TOP_PADDING + rowHeight * index;
        const share = total > 0 ? Math.round((point.value / total) * 100) : 0;
        return (
          <g key={index}>
            <rect
              x={round(legendX)}
              y={round(y)}
              width={SWATCH_SIZE}
              height={SWATCH_SIZE}
              rx={CORNER_RADIUS}
              fill={paletteColor(index)}
            />
            <text
              x={round(legendX + SWATCH_SIZE + SWATCH_GAP)}
              y={round(baselineCenteredOn(y + SWATCH_SIZE / 2, LEGEND_FONT_SIZE))}
              fontSize={LEGEND_FONT_SIZE}
              fill={INK}
            >
              {`${clipText(point.label, LEGEND_LABEL_MAX_CHARACTERS)} · ${formatChartValue(point.value)} (${share}%)`}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Vertical bars or a line, both with categories along the bottom. */
function VerticalChart({chart, top}: ChartAreaProps) {
  const left = VERTICAL_PLOT_LEFT + (chart.yAxisTitle ? Y_AXIS_TITLE_WIDTH : 0);
  const bottom = VERTICAL_PLOT_BOTTOM + (chart.xAxisTitle ? X_AXIS_TITLE_HEIGHT : 0);
  const plot: Plot = {
    x: left,
    y: top,
    width: WIDTH - left - VERTICAL_PLOT_RIGHT,
    height: HEIGHT - top - bottom,
  };
  const domain = niceDomain(chart.data.map(point => point.value));
  const valueY = (value: number) =>
    plot.y + plot.height - ((value - domain.min) / (domain.max - domain.min)) * plot.height;
  // Each category gets an equal band of the plot's width, with its bar or point centered.
  const band = plot.width / chart.data.length;
  const centerX = (index: number) => plot.x + band * index + band / 2;
  const labelLength = Math.max(
    MIN_CATEGORY_LABEL_CHARACTERS,
    charactersThatFit(band, LABEL_FONT_SIZE),
  );
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
            strokeWidth={GRID_LINE_WIDTH}
          />
          <text
            x={plot.x - AXIS_LABEL_GAP}
            y={round(baselineCenteredOn(valueY(tick), TICK_FONT_SIZE))}
            textAnchor="end"
            fontSize={TICK_FONT_SIZE}
            fill={MUTED}
          >
            {formatChartValue(tick)}
          </text>
        </g>
      ))}
      {chart.type === ChartType.LINE ? (
        <g>
          <polyline
            fill="none"
            stroke={PALETTE[0]}
            strokeWidth={LINE_WIDTH}
            strokeLinejoin="round"
            points={chart.data
              .map((point, index) => `${round(centerX(index))},${round(valueY(point.value))}`)
              .join(' ')}
          />
          {chart.data.map((point, index) => (
            <g key={index}>
              <circle
                cx={round(centerX(index))}
                cy={round(valueY(point.value))}
                r={POINT_RADIUS}
                fill={PALETTE[0]}
              />
              <text
                x={round(centerX(index))}
                y={round(valueY(point.value) - POINT_RADIUS - VALUE_LABEL_GAP)}
                textAnchor="middle"
                fontSize={LABEL_FONT_SIZE}
                fill={INK}
              >
                {formatChartValue(point.value)}
              </text>
            </g>
          ))}
        </g>
      ) : (
        chart.data.map((point, index) => {
          const barWidth = Math.min(VERTICAL_BAR_MAX_WIDTH, band * BAR_BAND_FRACTION);
          const end = valueY(point.value);
          return (
            <g key={index}>
              <rect
                x={round(centerX(index) - barWidth / 2)}
                y={round(Math.min(zeroY, end))}
                width={round(barWidth)}
                height={round(Math.abs(zeroY - end))}
                rx={CORNER_RADIUS}
                fill={PALETTE[0]}
              />
              <text
                x={round(centerX(index))}
                y={round(
                  point.value >= 0
                    ? end - VALUE_LABEL_GAP
                    : baselineBelow(end + VALUE_LABEL_GAP, LABEL_FONT_SIZE),
                )}
                textAnchor="middle"
                fontSize={LABEL_FONT_SIZE}
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
          y={round(baselineBelow(plot.y + plot.height + AXIS_LABEL_GAP, LABEL_FONT_SIZE))}
          textAnchor="middle"
          fontSize={LABEL_FONT_SIZE}
          fill={MUTED}
        >
          {clipText(point.label, labelLength)}
        </text>
      ))}
      <AxisTitles chart={chart} plot={plot} />
    </g>
  );
}

function HorizontalBarChart({chart, top}: ChartAreaProps) {
  const left = HORIZONTAL_PLOT_LEFT + (chart.yAxisTitle ? Y_AXIS_TITLE_WIDTH : 0);
  const bottom = HORIZONTAL_PLOT_BOTTOM + (chart.xAxisTitle ? X_AXIS_TITLE_HEIGHT : 0);
  const plot: Plot = {
    x: left,
    y: top,
    width: WIDTH - left - HORIZONTAL_PLOT_RIGHT,
    height: HEIGHT - top - bottom,
  };
  const domain = niceDomain(chart.data.map(point => point.value));
  const valueX = (value: number) =>
    plot.x + ((value - domain.min) / (domain.max - domain.min)) * plot.width;
  // Each category gets an equal band of the plot's height, with its bar centered.
  const band = plot.height / chart.data.length;
  const barHeight = Math.min(HORIZONTAL_BAR_MAX_HEIGHT, band * BAR_BAND_FRACTION);
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
            strokeWidth={GRID_LINE_WIDTH}
          />
          <text
            x={round(valueX(tick))}
            y={round(baselineBelow(plot.y + plot.height + AXIS_LABEL_GAP, TICK_FONT_SIZE))}
            textAnchor="middle"
            fontSize={TICK_FONT_SIZE}
            fill={MUTED}
          >
            {formatChartValue(tick)}
          </text>
        </g>
      ))}
      {chart.data.map((point, index) => {
        const centerY = plot.y + band * index + band / 2;
        const baseline = round(baselineCenteredOn(centerY, LABEL_FONT_SIZE));
        const end = valueX(point.value);
        return (
          <g key={index}>
            <text
              x={plot.x - AXIS_LABEL_GAP}
              y={baseline}
              textAnchor="end"
              fontSize={LABEL_FONT_SIZE}
              fill={MUTED}
            >
              {clipText(point.label, HORIZONTAL_CATEGORY_LABEL_MAX_CHARACTERS)}
            </text>
            <rect
              x={round(Math.min(zeroX, end))}
              y={round(centerY - barHeight / 2)}
              width={round(Math.abs(end - zeroX))}
              height={round(barHeight)}
              rx={CORNER_RADIUS}
              fill={PALETTE[0]}
            />
            <text
              x={round(point.value >= 0 ? end + VALUE_LABEL_GAP : end - VALUE_LABEL_GAP)}
              y={baseline}
              textAnchor={point.value >= 0 ? 'start' : 'end'}
              fontSize={LABEL_FONT_SIZE}
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
          y={HEIGHT - X_AXIS_TITLE_BOTTOM}
          textAnchor="middle"
          fontSize={LABEL_FONT_SIZE}
          fill={MUTED}
        >
          {clipText(chart.xAxisTitle, TITLE_MAX_CHARACTERS)}
        </text>
      ) : null}
      {chart.yAxisTitle ? (
        <text
          x={Y_AXIS_TITLE_LEFT}
          y={middleY}
          transform={`rotate(-90 ${Y_AXIS_TITLE_LEFT} ${middleY})`}
          textAnchor="middle"
          fontSize={LABEL_FONT_SIZE}
          fill={MUTED}
        >
          {clipText(chart.yAxisTitle, Y_AXIS_TITLE_MAX_CHARACTERS)}
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

/**
 * The SVG path of one pie slice: from the center out to the start angle, along the edge
 * clockwise to the end angle, and back. The arc command takes the radii, an x-axis
 * rotation of 0, the large-arc flag, set when the slice is more than half the pie, and the
 * sweep flag, 1 for clockwise.
 */
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

/**
 * A value range that includes zero and ends on round numbers, split into about
 * `TARGET_TICK_STEPS` steps.
 */
function niceDomain(values: readonly number[]): Domain {
  const lowest = Math.min(0, ...values);
  let min = lowest;
  let max = Math.max(0, ...values);
  if (min === max) {
    max = min + 1;
  }
  const step = niceStep((max - min) / TARGET_TICK_STEPS);
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  // A negative bar's value label sits past the end of the bar; leave room for it so it
  // doesn't land on the category labels at the edge of the plot.
  if (lowest < 0 && lowest - min < step / 2) {
    min -= step;
  }
  const steps = Math.round((max - min) / step);
  // `toFixed` drops floating-point error from the sums, such as 0.30000000000000004 for
  // three steps of 0.1, which would otherwise show up in the axis labels.
  const ticks = Array.from({length: steps + 1}, (_, index) =>
    Number((min + index * step).toFixed(10)),
  );
  return {min, max, ticks};
}

/**
 * The smallest round step that is at least `rough`. Round steps are 1, 2 or 5 times a
 * power of ten, the steps people expect on an axis.
 */
function niceStep(rough: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return nice * magnitude;
}

function paletteColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}
