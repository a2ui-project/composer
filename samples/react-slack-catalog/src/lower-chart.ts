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

import {type Renderable} from '@copilotkit/channels-ui';
import {
  ChartType,
  chartAltText,
  renderChartSvg,
  type ChartImageProps,
  type ChartPoint,
} from './chart-image';
import {optionalText, skipWithWarning} from './drawn-component-props';
import {type LowerComponentContext} from './lowering-context';
import {DiagnosticCode} from './preview-snapshot';
import {recordField} from './record-fields';
import {SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} from './slack-limits';

/**
 * Draws the sample's `Chart` component as an image while lowering. Slack's native chart
 * block, `data_visualization`, cannot express every chart the catalog allows (it has no
 * donut or horizontal bar, for one), and Channels' renderBlockKit, which turns Channels UI
 * components into Slack blocks, skips the nodes that Channels UI's `Chart` produces. So
 * every chart is drawn as SVG and shown in the message as an image, in place of the PNG
 * your Channels app renders and uploads.
 */
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
  return context.placeDrawnImage({
    componentType: 'Chart',
    componentId: context.componentId,
    svg: renderChartSvg(image),
    alt:
      label?.slice(0, SLACK_IMAGE_ALT_TEXT_MAX_LENGTH) ??
      chartAltText(image, SLACK_IMAGE_ALT_TEXT_MAX_LENGTH),
  });
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
      return skipWithWarning(
        context,
        DiagnosticCode.SLACK_CHART_INVALID_DATA,
        `Chart "${context.componentId}" has a value for "${label}" that isn't a number. Use a number such as 70.`,
      );
    }
    if ((type === ChartType.PIE || type === ChartType.DONUT) && number < 0) {
      return skipWithWarning(
        context,
        DiagnosticCode.SLACK_CHART_INVALID_DATA,
        `Chart "${context.componentId}" has a negative value for "${label}". Pie and donut slices must be zero or more.`,
      );
    }
    points.push({label, value: number});
  }
  if (points.every(point => point.value === 0)) {
    return skipWithWarning(
      context,
      DiagnosticCode.SLACK_CHART_EMPTY,
      `Chart "${context.componentId}" has only zero values, so there is nothing to draw. Give at least one value that isn't zero.`,
    );
  }
  return points;
}
