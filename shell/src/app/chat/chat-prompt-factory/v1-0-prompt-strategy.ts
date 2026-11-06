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
import {
  Catalog,
  CatalogJson,
  catalogDeclaresFunction,
} from '../../storage/models/catalog-storage.model';
import {COMMON_TYPES_SCHEMA} from '../../gallery/schema/v1-0/common-types-schema';
import {McpServerConfig, McpToolInfo} from '../../mcp/mcp-client-manager.service';
import {
  PromptProtocolStrategy,
  PromptStrategyOptions,
  stripReturnTypeDeep,
} from './prompt-protocol-strategy';
import {serializeCatalogForPrompt} from './v0-9-prompt-strategy';

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

    const mcpCatalog = catalogs.find(c => {
      if (catalogDeclaresFunction(c, 'callMcpTool')) return true;
      if (c['$defs'] && ('callMcpTool' in c['$defs'] || 'catalog_callMcpTool' in c['$defs'])) {
        return true;
      }
      return false;
    });
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
        : JSON.stringify(catalogs.map(c => JSON.parse(this.serializeCatalogForPrompt(c))));

    return (
      (
        this.generateSystemPrompt(
          serializedCatalogs,
          primaryCatalogId,
          mcpCatalogId,
          options.includeMultimodalGuidelines ?? false,
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
    const toolsMap = new Map<string, McpToolInfo>();
    for (const server of activeServers) {
      for (const tool of server.tools || []) {
        if (!toolsMap.has(tool.name)) {
          toolsMap.set(tool.name, tool);
        }
      }
    }

    if (toolsMap.size === 0) {
      return '';
    }

    const defaultOutputSchema = {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {type: 'string'},
              text: {type: 'string'},
            },
          },
        },
      },
    };

    const toolsMarkdown = Array.from(toolsMap.values())
      .map(tool => {
        const desc = tool.description ? ` - ${tool.description}` : '';
        const inputSchemaStr = JSON.stringify(
          stripReturnTypeDeep(tool.inputSchema || {type: 'object', properties: {}}),
        );
        const outputSchemaStr = JSON.stringify(
          stripReturnTypeDeep(tool.outputSchema || defaultOutputSchema),
        );
        return `- **\`${tool.name}\`**${desc}\n  - **Input Schema**: \`${inputSchemaStr}\`\n  - **Output Schema**: \`${outputSchemaStr}\``;
      })
      .join('\n');

    return `

  ## Available MCP Tools & Catalog Instructions

  When building surfaces that interact with MCP tools:

  1. Trigger MCP tools via button action function calls that chain \`updateDataModel\`, \`jmespath\`, and \`callMcpTool\`, explicitly specifying the function's \`catalogId\` (\`"${mcpCatalogId}"\`):
     \`\`\`json
     "action": {
       "functionCall": {
         "@call": "updateDataModel",
         "catalogId": "${mcpCatalogId}",
         "args": {
           "updates": {
             "@call": "jmespath",
             "catalogId": "${mcpCatalogId}",
             "args": {
               "expression": "{\\"/result\\": content[0].text}",
               "data": {
                 "@call": "callMcpTool",
                 "catalogId": "${mcpCatalogId}",
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
  ): string {
    const multimodalGuidelinesSection = includeMultimodalGuidelines
      ? `

  ## Multimodal & Image-to-UI Guidelines

  When an image, wireframe, mockup, or UI screenshot is provided by the
  user, adhere strictly to these visual translation principles (on follow-up
  turns, explicit user text instructions to add, modify, or remove elements
  take precedence over earlier screenshots and follow ## Editing the Current UI):

  ### 1. Visual Layout, Scope & Sizing Fidelity
  * **Root Container Bounding**: The root component ("id": "root") MUST match
    the visual boundary of the primary UI card, form, or dialog shown. Do
    NOT extract ambient background titles, file names, or browser canvas
    headers outside the visual card boundary unless explicitly requested.
  * **Flex Orientation Mapping**:
    - Elements arranged top-to-bottom MUST map to vertical layout containers
      defined in the active catalog (e.g., Column).
    - Elements arranged left-to-right MUST map to horizontal layout
      containers defined in the active catalog (e.g., Row).
  * **Full-Width Stretch Mandate**: When an element (such as a primary CTA
    button, input field, or card) visually spans the full width of its
    parent container in the screenshot, configure its layout/alignment
    properties to stretch full-width (e.g., setting "align": "stretch" on
    the parent container or applying full-width properties supported by
    the active catalog) rather than rendering as a compact inline element.
  * **Container Spacing & Clipping Prevention**: Ensure root layout
    containers (Column) and nested sections maintain proper vertical
    padding, spacing, and scrollability so that bottom elements (such as
    footer actions or trailing list items) are never cut off or clipped.
  * **No Unseen Separators Rule**: Do NOT insert "Divider" lines or border
    components unless a distinct horizontal or vertical line separator is
    literally visible in the screenshot.
  * **Visual Reading Order**: List child IDs in children arrays in strict
    visual reading order (top-to-bottom, left-to-right).

  ### 2. Catalog-Aware Component Mapping
  Map visual elements to the most specific matching component type from the
  "components" allowlist of the active catalog schema provided above:
  * **Headings & Titles** -> Text component formatted with Markdown \`#\` through \`#####\`
    inside \`Text.text\` (do NOT use heading variant properties or \`h1\`–\`h5\`, which were
    removed in A2UI v1.0).
  * **Body Text & Captions** -> Text component with standard body text or markdown formatting.
  * **Interactive Buttons** -> Button/IconButton component in the active
    catalog schema. Reflect visual prominence (e.g., primary filled vs.
    secondary borderless/outlined) and preserve full-width intent.
  * **Form Controls & Inputs** -> Text entry, date picker, selection/picker,
    or toggle components defined in the active catalog schema.
  * **Content Panels & Containers** -> Card, panel, or layout container
    components defined in the active catalog schema wrapping child elements.
  * **Repeated Lists & Collections** -> Layout container components with
    dynamic item template declarations
    (children: { "componentId": "...", "path": "/..." }).
  * **CRITICAL**: Every generated "component" value MUST be an exact key
    from the "components" map in the active catalog schema provided above.
    Never invent or guess component names not present in the active catalog.

  ### 3. Icon Fidelity, Custom SVG & Styling Intent
  * **Composite Icon & Feature Matching**: Closely examine visual icon
    shapes for composite features (e.g., a document with an edit badge, a
    search icon with a filter indicator, or a custom symbol). First check if
    the active catalog's Icon component includes an exact visual match in
    its enum.
  * **Custom SVG Fallback (No Close Icon Match)**: If an icon in the
    screenshot has distinct visual features that do NOT have a close match
    in the active catalog's predefined icon list:
    - **Do NOT** substitute a visually mismatched, generic, or oversimplified
      placeholder icon.
    - **Fallback to SVG**: Generate an inline vector graphic instead using
      one of the mechanisms supported by the active catalog schema:
      1. If the Icon component in the active catalog accepts custom path
         data, specify the svgPath property with a valid SVG path d string.
      2. If an Image component is available in the active catalog, supply an
         inline SVG Data URL in its url/image source property
         ("data:image/svg+xml;utf8,<svg ...>...</svg>").
  * **Visual Hierarchy**: Preserve typography scale, text weight, button
    prominence, and color intent using supported catalog properties.

  ### 4. Visual Affordance Recognition
  Recognize common UI visual affordance symbols and map them strictly using
  components defined in the active catalog schema provided above:
  * **Downward Chevrons / Disclosure Carets (Collapsible Rows)**:
    - **Visual Indicator**: Downward-facing arrows (∨, expand_more) at row
      edges denote expandable/collapsible sections.
    - **Catalog Mapping**: If the active catalog schema includes an expansion
      or accordion component, use it. Otherwise, compose the row using
      layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding leading text/icons and a trailing downward icon.
  * **Search Cues (Search Inputs)**:
    - **Visual Indicator**: Magnifying glass symbols (🔍) inside or adjacent
      to text entry boxes.
    - **Catalog Mapping**: If a search component exists in the active catalog
      schema, use it; otherwise, use a text input component paired with a
      search icon.
  * **Toggle Track & Thumb (Switches & Toggles)**:
    - **Visual Indicator**: Pill-shaped track with a circular thumb (⚪━━).
    - **Catalog Mapping**: Use a toggle, switch, or selection control
      component defined in the active catalog schema.
  * **Selection Controls (Option Pickers)**:
    - **Visual Indicator**: Radio circles (◯ / 🔘), checkboxes (☐ / ☑), or
      dropdown carets.
    - **Catalog Mapping**: Look up selection, picker, or option components
      in the active catalog schema; if none exist, compose using interactive
      button components.
  * **Pill Badges & Chips (Status & Tags)**:
    - **Visual Indicator**: Small rounded rectangle or oval containing short
      text/status labels.
    - **Catalog Mapping**: Use a chip, badge, or tag component if defined in
      the active catalog schema; otherwise, compose using a text component
      inside a container or card.

  ### 5. Grounding, Data Binding & Sequence
  * **Complete Data Model Extraction**: ALL text strings, label names, image
    URLs, options, and default values visible in the image MUST be extracted
    into the dataModel payload of createSurface.
  * **JSON Pointer References**: Components MUST bind to data model values
    using valid JSON Pointers with the \`@path\` key (e.g., {"@path": "/header/title"}).
    Never use \`"path"\` for data bindings.
  * **Strict Grounding**: Include ONLY visual elements present in the
    screenshot. Do NOT hallucinate extra buttons, fields, or unrepresented
    data streams.

  ### 6. Image-to-UI Processing Sequence
  When translating an image to A2UI, follow this internal mental sequence
  (do NOT output any analysis or scratchpad text; output ONLY the final
  JSONL messages):
  1. **Analyze (Internal)**: Identify primary card boundaries, flex layout
     directions, full-width element stretching, absence of unseen dividers,
     container spacing, and composite icon details.
  2. **Extract Data**: Extract all visible text strings, values, and list
     items into dataModel.
  3. **Build Component Tree**: Map visual elements strictly to active
     catalog component types with exact icon names/SVGs, full-width
     properties, Markdown \`#\`–\`#####\` headings, and \`@path\` bindings.
  4. **Emit JSONL Message**: Output the complete initial UI as a single
     \`createSurface\` message with inline \`components\` and \`dataModel\`.`
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
    or unsupported CSS/styling parameters).

  ### Active Catalog Schema (Mandatory Allowlist)
  The following active catalog schemas are available. Note each catalog's \`$id\`.
  The primary UI catalog is \`"${primaryCatalogId}"\`. When calling functions
  defined in another catalog (such as MCP functions in \`"${mcpCatalogId}"\`),
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
  - To trigger an agent function call directly on the renderer, emit \`callRendererFunction\`.

  ## Output Format: Strict A2UI JSON Lines (JSONL)

  Your output MUST be valid **A2UI JSON Lines (JSONL)**:
  1. **One JSON Object Per Line**: Each A2UI message MUST be formatted as a
    single, valid JSON object on its own line, terminated by a newline
    character (\\n). Do NOT pretty-print or split a single JSON object across
    multiple lines.
  2. **Canonical Version & Command**: Every message object MUST include
    \`"version": "1.0"\` (WITHOUT a leading 'v') at the top level and specify
    exactly one A2UI command: \`"createSurface"\`, \`"updateComponents"\`,
    \`"updateDataModel"\`, \`"deleteSurface"\`, or \`"callRendererFunction"\`.
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
    - \`"catalogId"\`: default catalog ID for the surface (\`"${primaryCatalogId}"\`).
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
      {"version": "1.0", "createSurface": {"surfaceId": "main", "catalogId": "${primaryCatalogId}", "sendDataModel": true, "components": [{"id": "root", "component": "Column", "children": ["heading", "name_in", "btn"]}, {"id": "heading", "component": "Text", "text": "# Registration"}, {"id": "name_in", "component": "TextField", "label": {"@path": "/label"}, "value": {"@path": "/name"}}, {"id": "btn_text", "component": "Text", "text": "Submit"}, {"id": "btn", "component": "Button", "child": "btn_text", "action": {"functionCall": {"@call": "submitForm", "args": {"name": {"@path": "/name"}}}}}], "dataModel": {"label": "Name", "name": "Alice"}}}
      \`\`\`

    * **Dynamic List Example**:
      \`\`\`jsonl
      {"version":"1.0","createSurface":{"surfaceId":"list","catalogId":"${primaryCatalogId}","sendDataModel":true,"components":[{"id":"root","component":"Column","children":{"componentId":"item_template","path":"/items"}},{"id":"item_template","component":"Text","text":{"@path":"text"}}],"dataModel":{"items":[{"text":"One"},{"text":"Two"}]}}}
      \`\`\`

    * **Incremental Updates Example**:
      \`\`\`jsonl
      {"version":"1.0","updateDataModel":{"surfaceId":"main","path":"/name","value":"Bob"}}
      \`\`\`

  ## Data Binding & Function Invocations
  - **Data Binding**: Every dynamic property value bound to the data model MUST use \`{"@path": "/..."}\` (with leading slash for root paths, or relative \`{"@path": "prop"}\` within dynamic item templates). Never use \`"path"\` without the \`@\` prefix for data bindings.
  - **Function Invocations**: Function expressions MUST use \`{"@call": "<functionName>", "args": {...}}\`, and \`Button.action\` MUST wrap function calls in \`{"functionCall": {"@call": "<functionName>", "args": {...}}}\` (or events in \`{"event": {"name": "..."}}\`).
  - **Cross-Catalog Calls**: When invoking a function defined in a secondary catalog (such as MCP functions in \`"${mcpCatalogId}"\`), you MUST explicitly specify \`"catalogId": "${mcpCatalogId}"\`.
  `;
  }
}
