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

import {inject, Injectable} from '@angular/core';
import {z} from 'zod';
import {LlmToolCall, LlmToolDefinition} from '../llm-client/llm-client';
import {RendererSelection} from './renderer-selection';

const TOOL_NAME = 'switchRenderer';
const PARAMETERS = z.object({rendererId: z.string().min(1)}).strict();

/**
 * Lets the model switch the canvas to another configured renderer before it
 * generates. The renderers it can choose come from configuration, so no
 * renderer is named here.
 */
@Injectable({providedIn: 'root'})
export class RendererTool {
  private readonly selection = inject(RendererSelection);

  definition(): LlmToolDefinition {
    const renderers = this.selection.renderers();
    return {
      name: TOOL_NAME,
      description: `Switch the canvas renderer ONLY when the user asks for an output format that another renderer produces, choosing by the renderers' names.
Do not switch just because the content mentions a platform or format. Keep the active renderer for ordinary edits.
Prefer the non-local renderer unless the user requests a local one.
Current renderer: ${this.selection.selectedRendererId()}.
Available renderers: ${JSON.stringify(renderers.map(({id, name}) => ({id, name})))}.
Call this tool before emitting any canvas JSON; generation resumes with the selected catalog.`,
      parametersJsonSchema: {
        type: 'object',
        properties: {rendererId: {type: 'string', enum: renderers.map(r => r.id)}},
        required: ['rendererId'],
        additionalProperties: false,
      },
    };
  }

  targetUrl(call: LlmToolCall): string {
    if (call.name !== TOOL_NAME) {
      throw new Error(`Unknown frontend tool: ${call.name}`);
    }
    const args = PARAMETERS.parse(call.args);
    const renderer = this.selection.renderers().find(r => r.id === args.rendererId);
    if (!renderer) {
      throw new Error(`Unknown renderer: ${args.rendererId}`);
    }
    return renderer.rendererUrl;
  }

  async execute(call: LlmToolCall, signal: AbortSignal): Promise<void> {
    this.targetUrl(call);
    signal.throwIfAborted();
    const {rendererId} = PARAMETERS.parse(call.args);
    await this.selection.selectRenderer(rendererId, signal);
  }
}
