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

import {Component, computed, input, signal} from '@angular/core';
import {AngularToolCall, ToolRenderer} from '@copilotkit/angular';

/** A single component-type substitution applied by the repair pass. */
export interface RepairFix {
  from: string;
  to: string;
}

/** Arguments delivered to the `a2ui_repair` tool render. */
export interface RepairArgs extends Record<string, unknown> {
  fixes?: RepairFix[];
}

/**
 * Presentational render for the `a2ui_repair` tool call. When no fixes are
 * present it renders nothing; otherwise it shows a compact, expandable card
 * listing each `from → to` substitution. Pure display over args + status.
 */
@Component({
  selector: 'a2ui-composer-repair-tool-render',
  standalone: true,
  template: `
    @if (hasFixes()) {
      <div class="repair-card">
        <button
          type="button"
          class="repair-card__header"
          [attr.aria-expanded]="expanded()"
          (click)="toggleExpanded()"
        >
          <span class="repair-card__chevron" aria-hidden="true">{{ expanded() ? '▾' : '▸' }}</span>
          <span>{{ headerText() }}</span>
        </button>
        @if (expanded()) {
          <ul class="repair-card__list">
            @for (fix of fixes(); track $index) {
              <li class="repair-card__row">{{ fix.from }} → {{ fix.to }}</li>
            }
          </ul>
        }
      </div>
    }
  `,
  styleUrl: './repair-tool-render.scss',
})
export class RepairToolRender implements ToolRenderer<RepairArgs> {
  readonly toolCall = input.required<AngularToolCall<RepairArgs>>();

  protected readonly expanded = signal(false);

  protected readonly fixes = computed<RepairFix[]>(() => this.toolCall().args.fixes ?? []);

  protected readonly hasFixes = computed(() => this.fixes().length > 0);

  protected readonly headerText = computed(() => `Fixed ${this.fixes().length} issue(s)`);

  protected toggleExpanded(): void {
    this.expanded.update(value => !value);
  }
}
