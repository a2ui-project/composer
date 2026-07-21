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

import {ChangeDetectionStrategy, Component, computed} from '@angular/core';
import {CatalogComponent} from '@a2ui/angular/v0_9';
import {BarChartApi} from '../../apis';

interface BarDatum {
  label: string;
  value: number;
}

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  labelX: number;
  valueLabel: string;
  valueY: number;
}

const SLOT_W = 60;
const BAR_W = 32;
const TOP_PAD = 24;
const PLOT_H = 140;
const BOTTOM_PAD = 28;
const CHART_H = TOP_PAD + PLOT_H + BOTTOM_PAD;

/**
 * `BarChart` renderer — a dependency-free inline `<svg>` vertical bar chart.
 * Bars scale to the max value; `valuePrefix` / `valueSuffix` decorate the
 * per-bar value label (e.g. `305` → `$305K`) without touching the underlying
 * scale. `data` is a `DynamicValue` (inline literal or `{ path }` binding).
 */
@Component({
  selector: 'a2ui-composer-cc-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cc-bar">
      <svg
        class="cc-bar__svg"
        [attr.viewBox]="'0 0 ' + chartWidth() + ' ' + chartHeight"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          class="cc-bar__axis"
          [attr.x1]="0"
          [attr.y1]="baselineY"
          [attr.x2]="chartWidth()"
          [attr.y2]="baselineY"
        />
        @for (bar of bars(); track bar.label) {
          <rect
            class="cc-bar__rect"
            [attr.x]="bar.x"
            [attr.y]="bar.y"
            [attr.width]="bar.width"
            [attr.height]="bar.height"
            [attr.rx]="4"
            [attr.fill]="color()"
          />
          <text
            class="cc-bar__value"
            [attr.x]="bar.labelX"
            [attr.y]="bar.valueY"
            text-anchor="middle"
          >
            {{ bar.valueLabel }}
          </text>
          <text
            class="cc-bar__label"
            [attr.x]="bar.labelX"
            [attr.y]="baselineY + 18"
            text-anchor="middle"
          >
            {{ bar.label }}
          </text>
        }
      </svg>
    </div>
  `,
  styles: [
    `
      .cc-bar {
        width: 100%;
        font-family: var(--cpk-font-body);
      }
      .cc-bar__svg {
        width: 100%;
        height: auto;
      }
      .cc-bar__axis {
        stroke: var(--cpk-divider);
        stroke-width: 1;
      }
      .cc-bar__value {
        fill: var(--cpk-text-primary);
        font-size: 11px;
        font-weight: 600;
      }
      .cc-bar__label {
        fill: var(--cpk-text-secondary);
        font-size: 11px;
      }
    `,
  ],
})
export class CcBarChart extends CatalogComponent<typeof BarChartApi> {
  protected readonly chartHeight = CHART_H;
  protected readonly baselineY = TOP_PAD + PLOT_H;

  protected readonly color = computed(() => this.props()['color']?.value() ?? 'var(--cpk-accent)');

  private readonly prefix = computed(() => this.props()['valuePrefix']?.value() ?? '');
  private readonly suffix = computed(() => this.props()['valueSuffix']?.value() ?? '');

  private readonly data = computed<BarDatum[]>(() => {
    const raw = this.props()['data']?.value();
    return Array.isArray(raw) ? (raw as BarDatum[]) : [];
  });

  protected readonly chartWidth = computed(() => Math.max(1, this.data().length) * SLOT_W);

  protected readonly bars = computed<Bar[]>(() => {
    const data = this.data();
    const max = data.reduce((m, d) => Math.max(m, Number(d.value) || 0), 0);
    return data.map((d, i) => {
      const value = Number(d.value) || 0;
      const height = max > 0 ? (value / max) * PLOT_H : 0;
      const x = i * SLOT_W + (SLOT_W - BAR_W) / 2;
      const y = TOP_PAD + (PLOT_H - height);
      return {
        x,
        y,
        width: BAR_W,
        height,
        label: String(d.label ?? ''),
        labelX: x + BAR_W / 2,
        valueLabel: `${this.prefix()}${value}${this.suffix()}`,
        valueY: y - 6,
      };
    });
  });
}
