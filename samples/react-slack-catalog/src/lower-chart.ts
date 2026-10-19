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

import {Chart as ChannelChart, type ChannelNode, type Renderable} from '@copilotkit/channels-ui';
import {
  ChartType,
  chartAltText,
  renderChartSvg,
  type ChartImageProps,
  type ChartPoint,
} from './chart-image';
import {placeDrawnImage} from './drawn-image-blocks';
import {type LowerComponentContext, type LoweringState} from './lowering-context';
import {DiagnosticCode, DiagnosticLevel} from './preview-snapshot';
import {recordField} from './record-fields';
import {SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} from './slack-limits';

/** A chart lowered in this render, drawn as an image just before Slack conversion. */
export interface LoweredChart {
  readonly componentId: string;
  readonly image: ChartImageProps;
  readonly alt: string;
}

/**
 * Replaces each lowered chart with a drawing of it. Slack's native chart block,
 * `data_visualization`, cannot express every chart the catalog allows (it has no donut or
 * horizontal bar, for one), and Channels' renderBlockKit, which turns Channels UI
 * components into Slack blocks, skips chart nodes, the elements that Channels UI's `Chart`
 * produces. So every chart is drawn as SVG and shown in the message as an image, in place
 * of the PNG your Channels app renders and uploads.
 */
export function drawCharts(nodes: readonly ChannelNode[], state: LoweringState): ChannelNode[] {
  return nodes.map(node => {
    const chart =
      String(node.type) === 'chart' && node.key !== undefined
        ? state.charts.get(String(node.key))
        : undefined;
    if (!chart) {
      return node;
    }
    return placeDrawnImage(state, {
      componentType: 'Chart',
      componentId: chart.componentId,
      svg: renderChartSvg(chart.image),
      alt: chart.alt,
    });
  });
}

/** Lowers the sample's `Chart` component to a Channels UI `Chart`, drawn by `drawCharts`. */
export function lowerChart(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const type = (props.type as ChartType | undefined) ?? ChartType.VERTICAL_BAR;
  const data = chartData(props.data, type, context);
  if (!data) {
    return [];
  }
  const image: ChartImageProps = {
    type,
    title: optionalText(props.title),
    xAxisTitle: optionalText(props.xAxisTitle),
    yAxisTitle: optionalText(props.yAxisTitle),
    data,
  };
  const label = optionalText(recordField(props.accessibility, 'label'));
  const key = context.registerChart({
    componentId: context.componentId,
    image,
    alt:
      label?.slice(0, SLACK_IMAGE_ALT_TEXT_MAX_LENGTH) ??
      chartAltText(image, SLACK_IMAGE_ALT_TEXT_MAX_LENGTH),
  });
  return {
    ...ChannelChart({
      type,
      title: image.title,
      xAxisTitle: image.xAxisTitle,
      yAxisTitle: image.yAxisTitle,
      data: data.map(point => ({...point})),
    }),
    key,
  };
}

/** Reads the chart's points, or explains in a warning why the chart can't be drawn. */
function chartData(
  value: unknown,
  type: ChartType,
  context: LowerComponentContext,
): ChartPoint[] | undefined {
  const points: ChartPoint[] = [];
  for (const [index, point] of (Array.isArray(value) ? value : []).entries()) {
    const label = optionalText(recordField(point, 'label')) ?? `Point ${index + 1}`;
    const raw = recordField(point, 'value');
    const number =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string' && raw.trim() !== ''
          ? Number(raw)
          : Number.NaN;
    if (!Number.isFinite(number)) {
      return warnChart(
        context,
        DiagnosticCode.SLACK_CHART_INVALID_DATA,
        `Chart "${context.componentId}" has a value for "${label}" that isn't a number. Use a number such as 70.`,
      );
    }
    if ((type === ChartType.PIE || type === ChartType.DONUT) && number < 0) {
      return warnChart(
        context,
        DiagnosticCode.SLACK_CHART_INVALID_DATA,
        `Chart "${context.componentId}" has a negative value for "${label}". Pie and donut slices must be zero or more.`,
      );
    }
    points.push({label, value: number});
  }
  if (points.every(point => point.value === 0)) {
    return warnChart(
      context,
      DiagnosticCode.SLACK_CHART_EMPTY,
      `Chart "${context.componentId}" has only zero values, so there is nothing to draw. Give at least one value that isn't zero.`,
    );
  }
  return points;
}

function warnChart(
  context: LowerComponentContext,
  code: DiagnosticCode,
  message: string,
): undefined {
  context.diagnostics.push({
    level: DiagnosticLevel.WARNING,
    code,
    message,
    componentId: context.componentId,
  });
  return undefined;
}

function optionalText(value: unknown): string | undefined {
  if (typeof value === 'number') {
    return String(value);
  }
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}
