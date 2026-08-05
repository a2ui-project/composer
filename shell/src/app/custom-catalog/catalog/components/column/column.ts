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
import {ColumnApi} from '../../apis';

const ALIGN_MAP: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

/**
 * `Column` renderer — a vertical flex container. Same template-children
 * semantics as `Row`: the binder resolves `children` into `{ id, basePath }`
 * references, one host per child.
 */
@Component({
  selector: 'a2ui-composer-cc-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ComponentHostComponent],
  template: `
    <div class="cc-column" [style.gap.px]="gap()" [style.alignItems]="alignItems()">
      @for (child of children(); track child.basePath + '/' + child.id) {
        <a2ui-v09-component-host [componentKey]="child" [surfaceId]="surfaceId()" />
      }
    </div>
  `,
  styles: [
    `
      .cc-column {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
    `,
  ],
})
export class CcColumn extends CatalogComponent<typeof ColumnApi> {
  protected readonly children = computed(() => this.props()['children']?.value() ?? []);
  protected readonly gap = computed(() => this.props()['gap']?.value() ?? 12);
  protected readonly alignItems = computed(
    () => ALIGN_MAP[this.props()['align']?.value() ?? 'stretch'] ?? 'stretch',
  );
}
