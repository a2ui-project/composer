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

import {Injectable} from '@angular/core';
import {Catalog, CatalogJson, getCatalogId} from '../../storage/models/catalog-storage.model';
import {COMMON_TYPES_SCHEMA} from '../../gallery/schema/common-types-schema';
import {McpServerConfig} from '../../mcp/mcp-client-manager.service';
import {
  buildPromptTrailingSuffix,
  PromptProtocolStrategy,
  PromptStrategyOptions,
} from './prompt-protocol-strategy';
import {
  quoteCatalogValue,
  iconSupport,
  imageUrlGuidance,
  IconSupport,
  serializeCatalogForPrompt,
  collectLocalDefRefs,
  formatMcpToolsMarkdown,
  buildMultimodalGuidelinesSection,
} from './prompt-strategy-helpers';

export {serializeCatalogForPrompt, collectLocalDefRefs, IconSupport};

const MINIFIED_COMMON_TYPES_SCHEMA = JSON.stringify(COMMON_TYPES_SCHEMA);

/**
 * Protocol strategy implementing prompt generation for A2UI v0.9 payloads and schemas.
 */
@Injectable({
  providedIn: 'root',
})
export class V09PromptStrategy implements PromptProtocolStrategy {
  readonly protocolVersion = 'v0.9' as const;
  readonly rendererSelectedInstruction =
    'The renderer has been selected. Use only this catalog. Rebuild any prior layout using its supported components and emit a complete createSurface/updateComponents/updateDataModel sequence.';

  buildSystemPrompt(options: PromptStrategyOptions): string {
    const catalog = options.activeCatalog ?? options.activeCatalogs?.[0] ?? null;
    const activeServers = options.activeServers ?? [];
    const mcpInstructions = this.buildMcpInstructions(activeServers);
    const customInstructionsText = options.customInstructions?.trim() ?? '';
    const customPromptSuffix = customInstructionsText
      ? `\n\n## Custom User Instructions\n\n${customInstructionsText}`
      : '';

    const trailingSuffix = buildPromptTrailingSuffix(this, options);

    const promptBody = !catalog
      ? `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests—whether provided as text instructions, UI wireframes, screenshots,
  or mockup images—into valid A2UI v0.9 interactive user interfaces.
  ${mcpInstructions}
      `
      : this.generateSystemPrompt(
          catalog as Catalog,
          options.includeMultimodalGuidelines ?? false,
        ) + mcpInstructions;

    return `${promptBody.trimEnd()}${customPromptSuffix}${trailingSuffix}`;
  }

  buildMcpInstructions(activeServers: readonly McpServerConfig[]): string {
    const toolsMarkdown = formatMcpToolsMarkdown(activeServers);
    if (!toolsMarkdown) {
      return '';
    }

    return `

  ## Available MCP Tools & Catalog Instructions

  When building surfaces that interact with MCP tools:

  1. Trigger MCP tools via button \`functionCall\` actions that chain \`updateDataModel\`, \`jmespath\`, and \`callMcpTool\`:
     \`\`\`json
     "action": {
       "functionCall": {
         "call": "updateDataModel",
         "args": {
           "updates": {
             "call": "jmespath",
             "args": {
               "expression": "{\\"/result\\": content[0].text}",
               "data": {
                 "call": "callMcpTool",
                 "args": {
                   "name": "<tool_name>",
                   "arguments": {
                     "path": "/mcp_arguments"
                   }
                 }
               }
             }
           }
         }
       }
     }
     \`\`\`

  ### Available MCP Tools
  ${toolsMarkdown}
`;
  }

  /**
   * Serializes the catalog as compact JSON, pruning `$defs` entries that are not
   * transitively referenced by `components` or `functions`.
   */
  serializeCatalogForPrompt(catalog: Catalog | CatalogJson): string {
    return serializeCatalogForPrompt(catalog);
  }

  private generateSystemPrompt(catalog: Catalog, includeMultimodalGuidelines = false): string {
    const catalogText = this.serializeCatalogForPrompt(catalog);
    // The examples' createSurface names the active catalog because models copy it, and
    // a renderer rejects other catalog IDs. 'active-catalog' stands in when the catalog
    // has no ID. The renderer supplies the ID, so it is quoted rather than pasted in.
    const catalogIdLiteral = quoteCatalogValue(getCatalogId(catalog) || 'active-catalog');
    const support = iconSupport(catalog);
    const multimodalGuidelinesSection = includeMultimodalGuidelines
      ? buildMultimodalGuidelinesSection(support, 'v0.9')
      : '';

    return `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests—whether provided as text instructions, UI wireframes, screenshots,
  or mockup images—into valid A2UI v0.9 interactive user interfaces.

  ## Catalog Allowlist & Component Rules

  You MUST strictly enforce the following rules regarding component selection
  and schema compliance:
  1. **Strict Component Allowlist**: You MUST use ONLY the component types
     defined as keys in the "components" map of the active catalog schema
     provided below.
  2. **No Hallucinated Component Names**: Never invent, guess, or mix
     component names from other libraries or catalogs. For example, if only
     "Column", "Row", "Text", and "Button" are present in the active catalog
     schema below, emitting any prefixed, library-specific, or DOM component
     name that is absent from the active catalog is strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
     defined in the JSON Schema for that specific component type in the
     active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
     or unsupported CSS/styling parameters).${imageUrlGuidance(catalog)}

  ### Active Catalog Schema (Mandatory Allowlist)
  \`\`\`json
  ${catalogText}
  \`\`\`

  ### Common Schema Types
  Common structural types referenced by $ref in the catalog schema (e.g.,
  DataBinding, Action, Event, DynamicString, etc.) are defined here:
  \`\`\`json
  ${MINIFIED_COMMON_TYPES_SCHEMA}
  \`\`\`

  ## Editing the Current UI

  When a current editor A2UI snapshot is provided, it is the authoritative UI
  being edited. Use its actual surface IDs, component IDs, and data bindings;
  never borrow IDs or paths from the illustrative examples below. For literal
  Text values, emit updateComponents with the edited component and its existing
  properties. Use updateDataModel only for values bound to that surface's model.
  Preserve unrelated components and update all labels affected by the request
  (for example, a destination's airport code, city label, and route heading).
  For edits, emit updates to existing surfaces. For a replacement UI, emit a
  complete document beginning with createSurface before its updates.

  ## Output Format: Strict A2UI JSON Lines (JSONL)

  Your output MUST be valid **A2UI JSON Lines (JSONL)**:
  1. **One JSON Object Per Line**: Each A2UI message MUST be formatted as a
     single, valid JSON object on its own line, terminated by a newline
     character (\\n). Do NOT pretty-print or split a single JSON object across
     multiple lines.
  2. **Required Version & Command**: Every message object MUST include
     "version": "v0.9" at the top level and specify exactly one A2UI
     command: "createSurface", "updateComponents", "updateDataModel", or
     "deleteSurface".
  3. **No Markdown or Preamble**: Output ONLY raw JSON Lines. Do NOT wrap
     your response in markdown code fences (such as \`\`\`jsonl or \`\`\`). Do
     NOT include any conversational text, greetings, explanations,
     scratchpad analysis, or summary before or after the JSON Lines.
  4. **Direct Parseability**: Every line in your response MUST be
     independently parseable by JSON.parse().${multimodalGuidelinesSection}

  ## Validation & Lifecycle Ordering

  A complete A2UI payload consists of one or more message objects sent as
  continuous JSON Lines. Every message object MUST include a top-level
  "version": "v0.9" field.

  The four primary messages you must use to manage a UI surface are:
  1. **createSurface**: Sent **FIRST** to signal the client to create a new
     surface. It defines the catalogId and optional theme parameters.
  2. **updateComponents**: Used to define or update the UI component tree.
     You must provide a flat list of components. One component MUST have an
     id of "root".
  3. **updateDataModel**: Used to define or update data values that the
     components bind to (optionally specifying a JSON Pointer "path", e.g.,
     {"version":"v0.9","updateDataModel":{"surfaceId":"main","path":"/name","value":"Bob"}},
     for targeted partial updates).
  4. **deleteSurface**: Signals the client to destroy the surface.

  Typical sequence: createSurface -> updateComponents -> updateDataModel
  (or combined/interleaved after creation).
  When updating an existing UI in a multi-turn conversation, keep the
  surfaceId consistent across turns.

  ## Examples

  **IMPORTANT**: The examples use the active catalog's ID. Component names and
  component properties (e.g., child vs label) below are illustrative; strictly
  follow the active catalog schema above and omit \`\`\`jsonl fences in output.

    * **Form & Action Example**:
      \`\`\`jsonl
      {"version":"v0.9","createSurface":{"surfaceId":"main","catalogId":${catalogIdLiteral}}}
      {"version":"v0.9","updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"Column","children":["name_in","btn"]},{"id":"name_in","component":"TextField","label":{"path":"/label"},"value":{"path":"/name"}},{"id":"btn","component":"Button","child":"btn_label","action":{"event":{"name":"submitForm","context":{"name":{"path":"/name"}}}}},{"id":"btn_label","component":"Text","text":{"path":"/submitLabel"}}]}}
      {"version":"v0.9","updateDataModel":{"surfaceId":"main","value":{"label":"Name","name":"Alice","submitLabel":"Submit"}}}
      \`\`\`

    * **Dynamic List Example**:
      \`\`\`jsonl
      {"version":"v0.9","createSurface":{"surfaceId":"list","catalogId":${catalogIdLiteral}}}
      {"version":"v0.9","updateComponents":{"surfaceId":"list","components":[{"id":"root","component":"Column","children":{"componentId":"item_template","path":"/items"}},{"id":"item_template","component":"Text","text":{"path":"text"}}]}}
      {"version":"v0.9","updateDataModel":{"surfaceId":"list","value":{"items":[{"text":"One"},{"text":"Two"}]}}}
      \`\`\`

  ## Data Binding
  Every component property value MUST come from the data model (with minor
  exceptions for static primitives).
  When referencing root data in the data model, use valid JSON Pointer syntax
  starting with / (e.g., {"path":"/name"}). Inside item templates bound via
  children: {"componentId": "...", "path": "/items"}, use relative property
  paths without a leading slash (e.g., {"path":"text"}).

  ## Actions and Context

  When defining actions (e.g., on buttons), the \`context\` payload is a standard
  JSON object, rather than an array of key-value pairs.

  Example action definition:
  \`\`\`json
  "action": {
    "event": {
      "name": "selectItem",
      "context": {
        "itemId": "12345",
        "itemName": {"path": "/selected/name"}
      }
    }
  }
  \`\`\`
  `;
  }
}
