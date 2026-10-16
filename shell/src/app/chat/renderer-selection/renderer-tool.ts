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
import {RendererOption} from '../../settings/settings-service/settings.service';
import {EnvironmentContextService} from '../../shell/startup-resolution/state/environment-context.service';
import {LlmToolCall, LlmToolDefinition} from '../llm-client/llm-client';
import {RendererSelection} from './renderer-selection';

/** The name the model calls the renderer tool by. */
const TOOL_NAME = 'switchRenderer';

/**
 * A tool, in the sense of `LlmToolDefinition`, that lets the model switch the
 * canvas to another configured renderer before it generates. The renderers it
 * can choose come from configuration, so no renderer is named here.
 */
@Injectable({providedIn: 'root'})
export class RendererTool {
  private readonly selection = inject(RendererSelection);
  private readonly environmentContext = inject(EnvironmentContextService);

  definition(): LlmToolDefinition {
    const renderers = this.selection.renderers();
    const available = renderers.map(({id, name, rendererUrl}) => ({
      id,
      name,
      origin: this.originOf(rendererUrl),
    }));
    const current = this.selection.selectedRendererId();
    const currentOrigin = available.find(renderer => renderer.id === current)?.origin;
    return {
      name: TOOL_NAME,
      description: `Switch the canvas renderer ONLY when the user asks for an output format that another renderer produces, choosing by the renderers' names.
Do not switch just because the content mentions a platform or format. Keep the active renderer for ordinary edits.
If more than one renderer produces that format, choose the one whose origin is the current renderer's origin, unless the user asks for another.
Current renderer: ${current}${currentOrigin ? `, origin ${currentOrigin}` : ''}.
Available renderers: ${JSON.stringify(available)}.
Call this tool before emitting any canvas JSON; generation resumes with the selected catalog.`,
      parametersJsonSchema: {
        type: 'object',
        properties: {rendererId: {type: 'string', enum: renderers.map(r => r.id)}},
        required: ['rendererId'],
        additionalProperties: false,
      },
    };
  }

  /**
   * The configured renderer a tool call asks for. The model is given the
   * argument schema in `definition()`, but nothing enforces it, so the call is
   * checked here.
   *
   * @throws If the call isn't to this tool, has arguments other than a
   *     `rendererId` string, or names a renderer that isn't configured.
   */
  rendererFor(call: LlmToolCall): RendererOption {
    if (call.name !== TOOL_NAME) {
      throw new Error(`Unknown tool: ${call.name}`);
    }
    const {rendererId, ...otherArgs} = call.args;
    if (typeof rendererId !== 'string' || Object.keys(otherArgs).length > 0) {
      throw new Error(`${TOOL_NAME} takes exactly one argument, a rendererId string.`);
    }
    const renderer = this.selection.renderers().find(r => r.id === rendererId);
    if (!renderer) {
      throw new Error(`Unknown renderer: ${rendererId}`);
    }
    return renderer;
  }

  /** The origin a renderer is served from, or undefined if its URL can't be parsed. */
  private originOf(rendererUrl: string): string | undefined {
    try {
      return this.environmentContext.resolveRendererUrl(rendererUrl).origin;
    } catch {
      return undefined;
    }
  }
}
