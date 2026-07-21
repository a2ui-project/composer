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
import {CatalogComponent, ComponentHostComponent} from '@a2ui/angular/v0_9';
import {DashboardCardApi} from '../../apis';

/**
 * `DashboardCard` renderer — a titled card wrapping a single `child`
 * component (resolved from a component-id reference into `{ id, basePath }`).
 * Declares its own flex behaviour so multiple cards distribute evenly in a
 * `Row`.
 */
@Component({
  selector: 'a2ui-composer-cc-dashboard-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ComponentHostComponent],
  template: `
    <div class="cc-card">
      <div class="cc-card__header">
        <div class="cc-card__title">{{ title() }}</div>
        @if (subtitle() != null) {
          <div class="cc-card__subtitle">{{ subtitle() }}</div>
        }
      </div>
      @if (child()) {
        <a2ui-v09-component-host [componentKey]="child()!" [surfaceId]="surfaceId()" />
      }
    </div>
  `,
  styles: [
    `
      .cc-card {
        background: var(--cpk-surface-elevated);
        border-radius: var(--cpk-radius-card);
        border: 1px solid var(--cpk-border);
        padding: 20px;
        box-shadow: var(--cpk-shadow-card);
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1 1 0;
        min-width: 0;
        font-family: var(--cpk-font-body);
      }
      .cc-card__title {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--cpk-text-primary);
      }
      .cc-card__subtitle {
        font-size: 0.75rem;
        color: var(--cpk-text-secondary);
        margin-top: 2px;
      }
    `,
  ],
})
export class CcDashboardCard extends CatalogComponent<typeof DashboardCardApi> {
  protected readonly title = computed(() => String(this.props()['title']?.value() ?? ''));
  protected readonly subtitle = computed(() => {
    const v = this.props()['subtitle']?.value();
    return v != null ? String(v) : null;
  });
  protected readonly child = computed(() => this.props()['child']?.value());
}
