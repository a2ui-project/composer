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

import {Component, computed, input} from '@angular/core';
import {AngularToolCall, ToolRenderer} from '@copilotkit/angular';

/** Arguments delivered to the `render_a2ui` tool render. */
export interface RenderA2uiArgs extends Record<string, unknown> {
  surfaceTitle?: string;
  blocks: unknown[];
}

/**
 * Presentational render for the `render_a2ui` tool call. Displays a compact
 * card summarizing the surface being generated; it never invokes the LLM or a
 * generation service and derives everything from the tool-call args + status.
 */
@Component({
  selector: 'a2ui-composer-render-a2ui-tool-render',
  standalone: true,
  template: `
    <div class="a2ui-card">
      <div class="a2ui-card__title">{{ title() }}</div>
      <div class="a2ui-card__status">{{ statusText() }}</div>
      <div class="a2ui-card__caption">{{ blockCaption() }}</div>
    </div>
  `,
  styleUrl: './render-a2ui-tool-render.scss',
})
export class RenderA2uiToolRender implements ToolRenderer<RenderA2uiArgs> {
  readonly toolCall = input.required<AngularToolCall<RenderA2uiArgs>>();

  protected readonly title = computed(
    () => `Generated ${this.toolCall().args.surfaceTitle ?? 'UI'}`,
  );

  protected readonly statusText = computed(() =>
    this.toolCall().status === 'complete'
      ? 'Rendered · shown in canvas'
      : 'Building your UI…',
  );

  protected readonly blockCaption = computed(() => {
    const count = this.toolCall().args.blocks?.length ?? 0;
    return `${count} block${count === 1 ? '' : 's'}`;
  });
}
