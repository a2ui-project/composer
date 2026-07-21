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
import {RowApi} from '../../apis';

const JUSTIFY_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  spaceBetween: 'space-between',
  spaceAround: 'space-around',
  spaceEvenly: 'space-evenly',
  stretch: 'stretch',
};

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

/**
 * `Row` renderer — a horizontal flex container. `children` is a
 * `ChildListSchema`; the binder resolves it (static array or template
 * repeater) into a list of `{ id, basePath }` child references which we
 * render one-per-child through `<a2ui-v09-component-host>`.
 */
@Component({
  selector: 'a2ui-composer-cc-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ComponentHostComponent],
  template: `
    <div
      class="cc-row"
      [style.gap.px]="gap()"
      [style.alignItems]="alignItems()"
      [style.justifyContent]="justifyContent()"
    >
      @for (child of children(); track child.basePath + '/' + child.id) {
        <a2ui-v09-component-host [componentKey]="child" [surfaceId]="surfaceId()" />
      }
    </div>
  `,
  styles: [
    `
      .cc-row {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
      }
    `,
  ],
})
export class CcRow extends CatalogComponent<typeof RowApi> {
  protected readonly children = computed(() => this.props()['children']?.value() ?? []);
  protected readonly gap = computed(() => this.props()['gap']?.value() ?? 16);
  protected readonly alignItems = computed(
    () => ALIGN_MAP[this.props()['align']?.value() ?? 'stretch'] ?? 'stretch',
  );
  protected readonly justifyContent = computed(
    () => JUSTIFY_MAP[this.props()['justify']?.value() ?? 'start'] ?? 'flex-start',
  );
}
