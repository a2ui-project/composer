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
import {CopilotKit, registerFrontendTool} from '@copilotkit/angular';
import {z} from 'zod';
import {LlmToolCall, LlmToolDefinition} from '../llm-client/llm-client';
import {RendererSelection} from './renderer-selection';

const TOOL_NAME = 'switchRenderer';
const PARAMETERS = z.object({rendererId: z.string().min(1)}).strict();

/** Adapts the registered CopilotKit tool to Composer's direct Gemini connection. */
@Injectable({providedIn: 'root'})
export class RendererTool {
  private readonly selection = inject(RendererSelection);
  private readonly copilotKit = inject(CopilotKit);

  constructor() {
    registerFrontendTool({
      name: TOOL_NAME,
      description: 'Switch the canvas renderer before generating for a different output format.',
      parameters: PARAMETERS,
      handler: async ({rendererId}, {signal}) => {
        await this.selection.selectRenderer(rendererId, signal);
        return {rendererId, status: 'ready'};
      },
    });
  }

  definition(): LlmToolDefinition {
    return {
      name: TOOL_NAME,
      description: `Switch the canvas renderer ONLY when the user asks for a different output format.
For Slack messages or Block Kit choose the Slack renderer. For standard A2UI choose Angular Basic.
Do not switch just because the content mentions Slack. Keep the active renderer for ordinary edits.
Prefer the non-dev renderer unless the user requests a local renderer.
Current renderer: ${this.selection.selectedRendererId()}.
Available renderers: ${JSON.stringify(this.selection.renderers().map(({id, name}) => ({id, name})))}.
Call this tool before emitting any canvas JSON; generation resumes with the selected catalog.`,
      parametersJsonSchema: {
        type: 'object',
        properties: {rendererId: {type: 'string', enum: this.selection.renderers().map(r => r.id)}},
        required: ['rendererId'],
        additionalProperties: false,
      },
    };
  }

  targetUrl(call: LlmToolCall): string {
    if (call.name !== TOOL_NAME) throw new Error(`Unknown frontend tool: ${call.name}`);
    const args = PARAMETERS.parse(call.args);
    const renderer = this.selection.renderers().find(r => r.id === args.rendererId);
    if (!renderer) throw new Error(`Unknown renderer: ${args.rendererId}`);
    return renderer.rendererUrl;
  }

  async execute(call: LlmToolCall, signal: AbortSignal): Promise<void> {
    this.targetUrl(call);
    signal.throwIfAborted();
    const tool = this.copilotKit.core.getTool({toolName: TOOL_NAME});
    if (!tool?.handler) throw new Error('The renderer tool is not registered.');
    await tool.handler(PARAMETERS.parse(call.args), {
      signal,
      toolCall: {
        id: crypto.randomUUID(),
        type: 'function',
        function: {name: call.name, arguments: JSON.stringify(call.args)},
      },
    });
  }
}
