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
import {PieChartApi} from '../../apis';

interface PieDatum {
  label: string;
  value: number;
  color?: string;
}

interface PieSlice {
  path: string;
  color: string;
  label: string;
  value: number;
}

/** Categorical palette; the brand indigo leads, then a balanced spread. */
const PALETTE = ['#4355b9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

const CENTER = 100;
const OUTER_R = 80;

/**
 * `PieChart` renderer — a dependency-free inline `<svg>` pie / donut. Slice
 * arc paths are computed from the resolved `data` array; `innerRadius`
 * (default 40) turns it into a donut. `data` is a `DynamicValue`, so the
 * binder yields either an inline literal array or a `{ path }`-bound array.
 */
@Component({
  selector: 'a2ui-composer-cc-pie-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cc-pie">
      <svg
        class="cc-pie__svg"
        viewBox="0 0 200 200"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        @for (slice of slices(); track slice.label) {
          <path [attr.d]="slice.path" [attr.fill]="slice.color" />
        }
      </svg>
      @if (slices().length) {
        <ul class="cc-pie__legend">
          @for (slice of slices(); track slice.label) {
            <li class="cc-pie__legend-item">
              <span class="cc-pie__swatch" [style.background]="slice.color"></span>
              <span class="cc-pie__legend-label">{{ slice.label }}</span>
              <span class="cc-pie__legend-value">{{ slice.value }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [
    `
      .cc-pie {
        display: flex;
        align-items: center;
        gap: var(--cpk-space-4);
        flex-wrap: wrap;
        font-family: var(--cpk-font-body);
      }
      .cc-pie__svg {
        width: 160px;
        height: 160px;
        flex: 0 0 auto;
      }
      .cc-pie__legend {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cc-pie__legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: var(--cpk-text-secondary);
      }
      .cc-pie__swatch {
        width: 10px;
        height: 10px;
        border-radius: 2px;
        flex: 0 0 auto;
      }
      .cc-pie__legend-label {
        color: var(--cpk-text-primary);
      }
      .cc-pie__legend-value {
        margin-left: auto;
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
export class CcPieChart extends CatalogComponent<typeof PieChartApi> {
  protected readonly innerRadius = computed(() => this.props()['innerRadius']?.value() ?? 40);

  private readonly data = computed<PieDatum[]>(() => {
    const raw = this.props()['data']?.value();
    return Array.isArray(raw) ? (raw as PieDatum[]) : [];
  });

  protected readonly slices = computed<PieSlice[]>(() => {
    const data = this.data();
    const innerR = this.innerRadius();
    const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    if (total <= 0) return [];

    const slices: PieSlice[] = [];
    let cursor = 0;
    data.forEach((d, i) => {
      const value = Number(d.value) || 0;
      const start = (cursor / total) * 360;
      cursor += value;
      let end = (cursor / total) * 360;
      // Keep a lone full-circle slice visible (an exact 360° arc is a no-op).
      if (end - start >= 360) end = start + 359.999;
      slices.push({
        path: this.arc(start, end, innerR),
        color: d.color ?? PALETTE[i % PALETTE.length],
        label: String(d.label ?? ''),
        value,
      });
    });
    return slices;
  });

  private point(r: number, angleDeg: number): {x: number; y: number} {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad)};
  }

  private arc(start: number, end: number, innerR: number): string {
    const largeArc = end - start > 180 ? 1 : 0;
    const oStart = this.point(OUTER_R, start);
    const oEnd = this.point(OUTER_R, end);
    const iEnd = this.point(innerR, end);
    const iStart = this.point(innerR, start);
    const f = (n: number) => n.toFixed(2);
    return (
      `M ${f(oStart.x)} ${f(oStart.y)} ` +
      `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${f(oEnd.x)} ${f(oEnd.y)} ` +
      `L ${f(iEnd.x)} ${f(iEnd.y)} ` +
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${f(iStart.x)} ${f(iStart.y)} Z`
    );
  }
}
