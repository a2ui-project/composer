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

import {registerRenderToolCall} from '@copilotkit/angular';
import {z} from 'zod';
import {RenderA2uiArgs, RenderA2uiToolRender} from './tool-renders/render-a2ui/render-a2ui-tool-render';
import {RepairArgs, RepairToolRender} from './tool-renders/repair/repair-tool-render';

/**
 * Registers the presentational tool-call renders that display A2UI generation
 * and repair activity inside the `<copilot-chat>` thread.
 *
 * Must be invoked from an Angular injection context (e.g. a component
 * constructor), since {@link registerRenderToolCall} wires into CopilotKit DI.
 */
export function registerA2uiToolRenders(): void {
  registerRenderToolCall<RenderA2uiArgs>({
    name: 'render_a2ui',
    args: z.object({
      surfaceTitle: z.string().optional(),
      blocks: z.array(z.unknown()),
    }),
    component: RenderA2uiToolRender,
  });

  registerRenderToolCall<RepairArgs>({
    name: 'a2ui_repair',
    args: z.object({
      fixes: z
        .array(
          z.object({
            from: z.string(),
            to: z.string(),
          }),
        )
        .optional(),
    }),
    component: RepairToolRender,
  });
}
