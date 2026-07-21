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
import {MetricApi} from '../../apis';

const TREND_COLORS: Record<string, string> = {
  up: 'var(--cpk-success)',
  down: 'var(--cpk-critical)',
  neutral: 'var(--cpk-text-secondary)',
};

const TREND_ICONS: Record<string, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

/**
 * `Metric` renderer — a KPI stat block: uppercase label, large value, and an
 * optional coloured trend indicator. `label`, `value`, `trendValue` are
 * `DynString`, resolved to strings by the binder.
 */
@Component({
  selector: 'a2ui-composer-cc-metric',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cc-metric">
      <span class="cc-metric__label">{{ label() }}</span>
      <div class="cc-metric__row">
        <span class="cc-metric__value">{{ value() }}</span>
        @if (trend() && trendValue()) {
          <span class="cc-metric__trend" [style.color]="trendColor()">
            {{ trendIcon() }} {{ trendValue() }}
          </span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .cc-metric {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-family: var(--cpk-font-body);
      }
      .cc-metric__label {
        font-size: 0.75rem;
        color: var(--cpk-text-secondary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .cc-metric__row {
        display: flex;
        align-items: baseline;
        gap: 8px;
      }
      .cc-metric__value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--cpk-text-primary);
        letter-spacing: -0.02em;
      }
      .cc-metric__trend {
        font-size: 0.8rem;
        font-weight: 500;
      }
    `,
  ],
})
export class CcMetric extends CatalogComponent<typeof MetricApi> {
  protected readonly label = computed(() => String(this.props()['label']?.value() ?? ''));
  protected readonly value = computed(() => String(this.props()['value']?.value() ?? ''));
  protected readonly trend = computed(() => this.props()['trend']?.value());
  protected readonly trendValue = computed(() => {
    const v = this.props()['trendValue']?.value();
    return v != null ? String(v) : '';
  });
  protected readonly trendColor = computed(
    () => TREND_COLORS[this.trend() ?? 'neutral'] ?? 'var(--cpk-text-secondary)',
  );
  protected readonly trendIcon = computed(() => TREND_ICONS[this.trend() ?? 'neutral'] ?? '→');
}
