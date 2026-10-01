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
  Chart as ChannelChart,
  Image as ChannelImage,
  type ChannelNode,
  type Renderable,
} from '@copilotkit/channels-ui';
import {type KnownBlock} from '@slack/types';
import {
  ChartType,
  chartAltText,
  renderChartSvg,
  type ChartImageProps,
  type ChartImageStore,
  type ChartPoint,
} from './chart-image';
import {type LowerComponentContext, type LoweringState} from './lowering-context';
import {DiagnosticCode, DiagnosticLevel} from './preview-snapshot';
import {recordField} from './record-fields';
import {SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} from './slack-limits';

/** Stands in for the Slack file id that the Channels app gets back when it uploads a drawn chart. */
const RENDERED_AT_SEND_FILE_ID = 'RENDERED_AT_SEND';

/** A chart lowered in this render, drawn as an image just before Slack conversion. */
export interface LoweredChart {
  readonly componentId: string;
  readonly image: ChartImageProps;
  readonly alt: string;
}

/**
 * Replaces each lowered chart with a drawing of it. Slack has no chart block and
 * renderBlockKit skips chart nodes, so the chart is drawn as SVG and placed in the message
 * as an image, the way a Channels app would upload a rendered PNG.
 */
export function drawCharts(
  nodes: readonly ChannelNode[],
  state: LoweringState,
  store: ChartImageStore,
): {ir: ChannelNode[]; chartUrls: Set<string>} {
  const chartUrls = new Set<string>();
  const ir = nodes.map(node => {
    const chart =
      String(node.type) === 'chart' && node.key !== undefined
        ? state.charts.get(String(node.key))
        : undefined;
    if (!chart) {
      return node;
    }
    const url = store.urlFor(renderChartSvg(chart.image));
    chartUrls.add(url);
    state.diagnostics.push({
      level: DiagnosticLevel.INFO,
      code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
      message: `Chart "${chart.componentId}" is drawn in this preview. In Slack, your Channels app renders it to a PNG and uploads it when sending. The export marks it with a placeholder file.`,
      componentId: chart.componentId,
    });
    return ChannelImage({url, alt: chart.alt});
  });
  return {ir, chartUrls};
}

/** Swaps the preview's local chart images for Slack's uploaded-file form. */
export function exportChartImages(
  blocks: readonly KnownBlock[],
  chartUrls: ReadonlySet<string>,
): KnownBlock[] {
  return blocks.map(block => {
    if (block.type !== 'image' || !('image_url' in block) || !chartUrls.has(block.image_url)) {
      return block;
    }
    return {
      type: 'image',
      slack_file: {id: RENDERED_AT_SEND_FILE_ID},
      alt_text: block.alt_text,
    };
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
