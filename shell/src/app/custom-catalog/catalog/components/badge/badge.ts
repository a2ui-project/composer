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
import {BadgeApi} from '../../apis';

/**
 * Variant → `{ background, color }` pairs, mapped onto the composer's
 * semantic status tokens. `info` reuses the brand accent; `neutral` falls
 * back to a muted divider fill.
 */
const VARIANTS: Record<string, {bg: string; color: string}> = {
  success: {bg: 'var(--cpk-success-bg)', color: 'var(--cpk-success)'},
  warning: {bg: 'var(--cpk-warning-bg)', color: 'var(--cpk-warning)'},
  error: {bg: 'var(--cpk-critical-bg)', color: 'var(--cpk-critical)'},
  info: {bg: 'var(--cpk-accent-bg)', color: 'var(--cpk-accent)'},
  neutral: {bg: 'var(--cpk-divider)', color: 'var(--cpk-text-secondary)'},
};

/** `Badge` renderer — a small pill label with a semantic status variant. */
@Component({
  selector: 'a2ui-composer-cc-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cc-badge" [style.background]="variant().bg" [style.color]="variant().color">
      {{ text() }}
    </span>
  `,
  styles: [
    `
      .cc-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: var(--cpk-radius-pill);
        font-size: 0.7rem;
        font-weight: 500;
        font-family: var(--cpk-font-body);
      }
    `,
  ],
})
export class CcBadge extends CatalogComponent<typeof BadgeApi> {
  protected readonly text = computed(() => this.props()['text']?.value() ?? '');
  protected readonly variant = computed(
    () => VARIANTS[this.props()['variant']?.value() ?? 'neutral'] ?? VARIANTS['neutral'],
  );
}
