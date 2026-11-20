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
import {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import {COMMON_TYPES_SCHEMA} from '../../gallery/schema/v1-0/common-types-schema';
import {catalogSupportsMcp, McpServerConfig} from '../../mcp/mcp-client-manager.service';
import {
  PromptProtocolStrategy,
  PromptStrategyOptions,
  stripReturnTypeDeep,
} from './prompt-protocol-strategy';
import {
  quoteCatalogValue,
  iconSupport,
  imageUrlGuidance,
  IconSupport,
  pruneCatalogForPrompt,
  serializeCatalogForPrompt,
  formatMcpToolsMarkdown,
  buildMultimodalGuidelinesSection,
} from './prompt-strategy-helpers';

/** Canonical default schema ID for secondary MCP tools catalog in v1.0. */
export const DEFAULT_V10_MCP_FUNCTIONS_CATALOG_ID =
  'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json';

/** Canonical default schema ID for primary Basic catalog in v1.0. */
export const DEFAULT_V10_BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

const MINIFIED_COMMON_TYPES_SCHEMA = JSON.stringify(stripReturnTypeDeep(COMMON_TYPES_SCHEMA));

/**
 * Protocol strategy implementing prompt generation for A2UI v1.0 payloads and schemas.
 */
@Injectable({
  providedIn: 'root',
})
export class V10PromptStrategy implements PromptProtocolStrategy {
  readonly protocolVersion = 'v1.0' as const;

  /**
   * Constructs a system prompt enforcing A2UI v1.0 JSONL message formatting,
   * single-message createSurface, multi-catalog schema instructions, and dynamic binding rules.
   *
   * @param options Strategy options containing catalogs, active MCP servers, and custom rules.
   * @returns Canonical v1.0 system prompt.
   */
  buildSystemPrompt(options: PromptStrategyOptions): string {
    const catalogs: (Catalog | CatalogJson)[] = [];
    if (options.activeCatalogs && options.activeCatalogs.length > 0) {
      catalogs.push(...options.activeCatalogs);
    } else if (options.activeCatalog) {
      catalogs.push(options.activeCatalog);
    }

    const primaryCatalog =
      catalogs.find(c => Boolean(c.components && Object.keys(c.components).length > 0)) ??
      catalogs[0] ??
      null;
    const primaryCatalogId =
      primaryCatalog?.['$id'] ?? primaryCatalog?.catalogId ?? DEFAULT_V10_BASIC_CATALOG_ID;

    const mcpCatalog = catalogs.find(c => catalogSupportsMcp(c));
    const mcpCatalogId =
      mcpCatalog?.['$id'] ?? mcpCatalog?.catalogId ?? DEFAULT_V10_MCP_FUNCTIONS_CATALOG_ID;

    const activeServers = options.activeServers ?? [];
    const mcpInstructions = this.buildMcpInstructions(activeServers, mcpCatalogId);
    const customInstructionsText = options.customInstructions?.trim() ?? '';
    const customPromptSuffix = customInstructionsText
      ? `\n\n## Custom User Instructions\n\n${customInstructionsText}`
      : '';

    if (catalogs.length === 0) {
      return (
        `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests—whether provided as text instructions, UI wireframes, screenshots,
  or mockup images—into valid A2UI 1.0 interactive user interfaces.
  ${mcpInstructions}
      `.trimEnd() + customPromptSuffix
      );
    }

    const serializedCatalogs =
      catalogs.length === 1
        ? this.serializeCatalogForPrompt(catalogs[0])
        : JSON.stringify(catalogs.map(c => pruneCatalogForPrompt(stripReturnTypeDeep(c))));

    return (
      (
        this.generateSystemPrompt(
          serializedCatalogs,
          primaryCatalogId,
          mcpCatalogId,
          options.includeMultimodalGuidelines ?? false,
          primaryCatalog,
        ) + mcpInstructions
      ).trimEnd() + customPromptSuffix
    );
  }

  /**
   * Generates formatted markdown instructions for all active MCP tools and cross-catalog calls.
   *
   * @param activeServers List of active MCP servers.
   * @param mcpCatalogId Catalog ID associated with MCP functions.
   * @returns Formatted MCP instructions block.
   */
  buildMcpInstructions(
    activeServers: readonly McpServerConfig[],
    mcpCatalogId = DEFAULT_V10_MCP_FUNCTIONS_CATALOG_ID,
  ): string {
    const toolsMarkdown = formatMcpToolsMarkdown(activeServers, stripReturnTypeDeep);
    if (!toolsMarkdown) {
      return '';
    }

    const quotedMcpId = quoteCatalogValue(mcpCatalogId);

    return `

  ## Available MCP Tools & Catalog Instructions

  When building surfaces that interact with MCP tools:

  1. Trigger MCP tools via button action function calls that chain \`updateDataModel\`, \`jmespath\`, and \`callMcpTool\`, explicitly specifying the function's \`catalogId\` (${quotedMcpId}):
     \`\`\`json
     "action": {
       "functionCall": {
         "@call": "updateDataModel",
         "catalogId": ${quotedMcpId},
         "args": {
           "updates": {
             "@call": "jmespath",
             "catalogId": ${quotedMcpId},
             "args": {
               "expression": "{\\"/result\\": content[0].text}",
               "data": {
                 "@call": "callMcpTool",
                 "catalogId": ${quotedMcpId},
                 "args": {
                   "name": "<tool_name>",
                   "arguments": {
                     "@path": "/mcp_arguments"
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
   * Serializes the catalog as compact JSON, pruning unreferenced `$defs` and
   * stripping any legacy or schema `returnType` fields to guarantee zero bleed.
   *
   * @param catalog Catalog to serialize.
   * @returns Pruned and sanitized JSON string.
   */
  serializeCatalogForPrompt(catalog: Catalog | CatalogJson): string {
    const cleanedCatalog = stripReturnTypeDeep(catalog);
    return serializeCatalogForPrompt(cleanedCatalog);
  }

  private generateSystemPrompt(
    catalogsJsonStr: string,
    primaryCatalogId: string,
    mcpCatalogId: string,
    includeMultimodalGuidelines = false,
    primaryCatalog: Catalog | null = null,
  ): string {
    const support = primaryCatalog ? iconSupport(primaryCatalog) : IconSupport.NONE;
    const quotedPrimaryId = quoteCatalogValue(primaryCatalogId);
    const quotedMcpId = quoteCatalogValue(mcpCatalogId);

    const multimodalGuidelinesSection = includeMultimodalGuidelines
      ? buildMultimodalGuidelinesSection(support, 'v1.0')
      : '';

    return `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests—whether provided as text instructions, UI wireframes, screenshots,
  or mockup images—into valid A2UI 1.0 interactive user interfaces.

  ## Catalog Allowlist & Component Rules

  You MUST strictly enforce the following rules regarding component selection
  and schema compliance:
  1. **Strict Component Allowlist**: You MUST use ONLY the component types
    defined as keys in the "components" map of the active catalog schema
    provided below.
  2. **No Hallucinated Component Names**: Never invent, guess, or mix
    component names from other libraries or catalogs. For example, if only
    "Column", "Row", "Text", and "Button" are present in the active catalog
    schema below, emitting "MaterialColumn", "MaterialText", or "Div" is
    strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
    defined in the JSON Schema for that specific component type in the
    active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
    or unsupported CSS/styling parameters).${primaryCatalog ? imageUrlGuidance(primaryCatalog) : ''}

  ### Active Catalog Schema (Mandatory Allowlist)
  The following active catalog schemas are available. Note each catalog's \`$id\`.
  The primary UI catalog is ${quotedPrimaryId}. When calling functions
  defined in another catalog (such as MCP functions in ${quotedMcpId}),
  you MUST explicitly set \`"catalogId"\` on the \`@call\` invocation.
  \`\`\`json
  ${catalogsJsonStr}
  \`\`\`

  ### Common Schema Types
  Common structural types referenced by $ref in the catalog schema (e.g.,
  DataBinding, FunctionCall, DynamicString, DynamicValue, etc.) are defined here:
  \`\`\`json
  ${MINIFIED_COMMON_TYPES_SCHEMA}
  \`\`\`

  ## Editing the Current UI

  When a current editor A2UI snapshot is provided, it is the authoritative UI
  being edited. Use its actual surface IDs, component IDs, and data bindings;
  never borrow IDs or paths from illustrative examples.
  - For edits to existing surfaces, emit \`updateComponents\` or \`updateDataModel\`.
  - For a replacement UI or new surface, emit a single complete \`createSurface\`
    message containing inline \`components\` and \`dataModel\`.
  - To delete a surface, emit \`deleteSurface\`.
  - Do NOT emit \`callRendererFunction\` during routine UI creation or edits; emit \`callRendererFunction\` only when the user explicitly asks to invoke or test a renderer-registered function.

  ## Output Format: Strict A2UI JSON Lines (JSONL)

  Your output MUST be valid **A2UI JSON Lines (JSONL)**:
  1. **One JSON Object Per Line**: Each A2UI message MUST be formatted as a
    single, valid JSON object on its own line, terminated by a newline
    character (\\n). Do NOT pretty-print or split a single JSON object across
    multiple lines.
  2. **Canonical Version & Command**: Every message object MUST include
    \`"version": "1.0"\` (WITHOUT a leading 'v') at the top level and specify
    exactly one A2UI command: \`"createSurface"\`, \`"updateComponents"\`,
    \`"updateDataModel"\`, \`"deleteSurface"\`, or \`"callRendererFunction"\`
    (only when explicitly asked to invoke a renderer function).
  3. **No Markdown or Preamble**: Output ONLY raw JSON Lines. Do NOT wrap
    your response in markdown code fences (such as \`\`\`jsonl or \`\`\`). Do
    NOT include any conversational text, greetings, explanations,
    scratchpad analysis, or summary before or after the JSON Lines.
  4. **Direct Parseability**: Every line in your response MUST be
    independently parseable by JSON.parse().${multimodalGuidelinesSection}

  ## Validation & Lifecycle Ordering

  A complete A2UI payload consists of one or more message objects sent as
  continuous JSON Lines. Every message object MUST include a top-level
  \`"version": "1.0"\` field.

  The message types you use to manage UI surfaces are:
  1. **createSurface (Single-Message Initial UI)**: Sent **FIRST** when creating a
    new surface. It defines:
    - \`"surfaceId"\`: unique ID for the surface (e.g., \`"main"\`).
    - \`"catalogId"\`: default catalog ID for the surface (${quotedPrimaryId}).
    - \`"sendDataModel"\`: \`true\` (informs renderer to sync data changes back).
    - \`"components"\`: inline flat array of UI components (with one root component having \`"id": "root"\`).
    - \`"dataModel"\`: initial inline data model object.
  2. **updateComponents**: Used to update or add components in an existing surface
    (e.g., \`{"version":"1.0","updateComponents":{"surfaceId":"main","components":[...]}}\`).
  3. **updateDataModel**: Used to update data values in an existing surface
    (e.g., \`{"version":"1.0","updateDataModel":{"surfaceId":"main","path":"/title","value":"New Title"}}\`).
  4. **deleteSurface**: Signals the client to destroy the surface
    (e.g., \`{"version":"1.0","deleteSurface":{"surfaceId":"main"}}\`).
  5. **callRendererFunction**: Signals the client to execute a function locally on behalf of the agent
    (e.g., \`{"version":"1.0","callRendererFunction":{"surfaceId":"main","functionCallId":"call-1","callFunction":{"@call":"...","args":{...},"catalogId":"..."}}}\`).

  ## Examples

  **IMPORTANT**: The examples below demonstrate canonical v1.0 syntax.
  Omit \`\`\`jsonl fences in output.

    * **Single-Message New Surface Example**:
      \`\`\`jsonl
      {"version": "1.0", "createSurface": {"surfaceId": "main", "catalogId": ${quotedPrimaryId}, "sendDataModel": true, "components": [{"id": "root", "component": "Column", "children": ["heading", "name_in", "btn"]}, {"id": "heading", "component": "Text", "text": "# Registration"}, {"id": "name_in", "component": "TextField", "label": {"@path": "/label"}, "value": {"@path": "/name"}}, {"id": "btn_text", "component": "Text", "text": "Submit"}, {"id": "btn", "component": "Button", "child": "btn_text", "action": {"event": {"name": "submitForm", "context": {"name": {"@path": "/name"}}}}}], "dataModel": {"label": "Name", "name": "Alice"}}}
      \`\`\`

    * **Dynamic List Example**:
      \`\`\`jsonl
      {"version":"1.0","createSurface":{"surfaceId":"list","catalogId":${quotedPrimaryId},"sendDataModel":true,"components":[{"id":"root","component":"Column","children":{"componentId":"item_template","path":"/items"}},{"id":"item_template","component":"Text","text":{"@path":"text"}}],"dataModel":{"items":[{"text":"One"},{"text":"Two"}]}}}
      \`\`\`

    * **Incremental Updates Example**:
      \`\`\`jsonl
      {"version":"1.0","updateDataModel":{"surfaceId":"main","path":"/name","value":"Bob"}}
      \`\`\`

  ## Data Binding & Function Invocations
  - **Data Binding**: Every dynamic property value bound to the data model MUST use \`{"@path": "/..."}\` (with leading slash for root paths, or relative \`{"@path": "prop"}\` within dynamic item templates). Never use \`"path"\` without the \`@\` prefix for data bindings.
  - **Function Invocations**: Function expressions MUST use \`{"@call": "<functionName>", "args": {...}}\`, and \`Button.action\` MUST wrap function calls in \`{"functionCall": {"@call": "<functionName>", "args": {...}}}\` (or events in \`{"event": {"name": "..."}}\`).
  - **Cross-Catalog Calls**: When invoking a function defined in a secondary catalog (such as MCP functions in ${quotedMcpId}), you MUST explicitly specify \`"catalogId": ${quotedMcpId}\`.
  `;
  }
}
