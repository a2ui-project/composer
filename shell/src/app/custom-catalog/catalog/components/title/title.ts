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
import {TitleApi} from '../../apis';

/**
 * `Title` renderer — a plain heading. `text` is a `DynString`, so the binder
 * resolves any `{ path }` binding to a string before we see it; `level`
 * selects the semantic heading tag (h1/h2/h3).
 */
@Component({
  selector: 'a2ui-composer-cc-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (level()) {
      @case ('h1') {
        <h1 class="cc-title cc-h1">{{ text() }}</h1>
      }
      @case ('h3') {
        <h3 class="cc-title cc-h3">{{ text() }}</h3>
      }
      @default {
        <h2 class="cc-title cc-h2">{{ text() }}</h2>
      }
    }
  `,
  styles: [
    `
      .cc-title {
        margin: 0;
        font-weight: 600;
        color: var(--cpk-text-primary);
        letter-spacing: -0.01em;
        font-family: var(--cpk-font-body);
      }
      .cc-h1 {
        font-size: 1.75rem;
      }
      .cc-h2 {
        font-size: 1.25rem;
      }
      .cc-h3 {
        font-size: 1rem;
      }
    `,
  ],
})
export class CcTitle extends CatalogComponent<typeof TitleApi> {
  protected readonly text = computed(() => String(this.props()['text']?.value() ?? ''));
  protected readonly level = computed(() => this.props()['level']?.value() ?? 'h2');
}
