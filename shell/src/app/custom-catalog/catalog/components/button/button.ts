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

import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CatalogComponent, ComponentHostComponent, A2uiRendererService} from '@a2ui/angular/v0_9';
import {DataContext, type Action} from '@a2ui/web_core/v0_9';
import {ButtonApi} from '../../apis';

/**
 * `Button` renderer — an action button that renders its `child` component as
 * the label. `action` is an `ActionSchema`; the binder hands us the raw action
 * object which we resolve + dispatch through the surface. After activation the
 * button latches into a "Done" state (mirrors the React `ActionButton`).
 */
@Component({
  selector: 'a2ui-composer-cc-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ComponentHostComponent],
  template: `
    <button
      type="button"
      class="cc-button"
      [class.cc-button--done]="done()"
      [disabled]="done()"
      (click)="handleAction()"
    >
      @if (done()) {
        <svg
          class="cc-button__check"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Done</span>
      } @else if (child()) {
        <a2ui-v09-component-host [componentKey]="child()!" [surfaceId]="surfaceId()" />
      } @else {
        <span>Click</span>
      }
    </button>
  `,
  styles: [
    `
      .cc-button {
        width: 100%;
        padding: 10px 16px;
        border-radius: var(--cpk-radius-card);
        border: 1px solid var(--cpk-border);
        background: var(--cpk-surface-elevated);
        color: var(--cpk-text-primary);
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-family: var(--cpk-font-body);
      }
      .cc-button--done {
        border-color: var(--cpk-success);
        background: var(--cpk-success-bg);
        color: var(--cpk-success);
        cursor: default;
      }
    `,
  ],
})
export class CcButton extends CatalogComponent<typeof ButtonApi> {
  private readonly rendererService = inject(A2uiRendererService);
  private readonly surface = computed(() =>
    this.rendererService.surfaceGroup.getSurface(this.surfaceId()),
  );

  protected readonly child = computed(() => this.props()['child']?.value());
  protected readonly action = computed(() => this.props()['action']?.value());
  protected readonly done = signal(false);

  handleAction(): void {
    if (this.done()) return;
    const action = this.action();
    const surface = this.surface();
    if (action && surface) {
      const dc = new DataContext(surface, this.dataContextPath());
      surface.dispatchAction(dc.resolveAction(action as Action), this.componentId());
    }
    this.done.set(true);
  }
}
