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

import {Injectable, computed, inject, signal} from '@angular/core';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {COMMON_TYPES_SCHEMA} from '../../gallery/schema/common-types-schema';
import {
  McpClientManagerService,
  McpServerConfig,
  McpToolInfo,
} from '../../mcp/mcp-client-manager.service';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';

/**
 * Representation of a named custom instruction preset.
 */
export declare interface CustomInstructionPreset {
  id: string;
  name: string;
  content: string;
}

/**
 * Persisted state of custom instruction presets and active selection.
 */
export declare interface CustomInstructionsState {
  presets: CustomInstructionPreset[];
  activePresetId: string | null;
}

const MINIFIED_COMMON_TYPES_SCHEMA = JSON.stringify(COMMON_TYPES_SCHEMA);

/**
 * Constructs dynamic system prompts based on the provided LLM intent and active catalog states.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatPromptFactoryService {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly mcpManager = inject(McpClientManagerService);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);

  readonly customInstructionsState = signal<CustomInstructionsState>(this.loadInitialState());
  readonly presets = computed(() => this.customInstructionsState().presets);
  readonly activePresetId = computed(() => this.customInstructionsState().activePresetId);
  readonly activePreset = computed(() => {
    const state = this.customInstructionsState();
    return state.presets.find(p => p.id === state.activePresetId) ?? null;
  });
  readonly customInstructions = computed(() => this.activePreset()?.content ?? '');
  readonly hasCustomInstructions = computed(() => this.customInstructions().trim().length > 0);

  private readonly textOnlySystemPrompt = computed<string>(() => this.composeSystemPrompt(false));
  private readonly multimodalSystemPrompt = computed<string>(() => this.composeSystemPrompt(true));

  readonly systemPrompt = this.textOnlySystemPrompt;

  /**
   * Builds the system prompt with optional multimodal image-to-UI guidelines.
   */
  buildSystemPrompt(options?: {includeMultimodalGuidelines?: boolean}): string {
    return options?.includeMultimodalGuidelines
      ? this.multimodalSystemPrompt()
      : this.textOnlySystemPrompt();
  }

  private composeSystemPrompt(includeMultimodalGuidelines: boolean): string {
    const catalog = this.catalogManagement.activeCatalog();
    const mcpSupported = this.mcpManager.doesCatalogSupportMcp(catalog);
    const activeServers = mcpSupported ? this.mcpManager.getActiveServersWithTools() : [];
    const mcpInstructions = this.buildMcpInstructions(activeServers);
    const customInstructionsText = this.customInstructions().trim();
    const customPromptSuffix = customInstructionsText
      ? `\n\n## Custom User Instructions\n\n${customInstructionsText}`
      : '';

    if (!catalog) {
      return (
        `
  # A2UI Generation Expert

  ## Role
  You are an expert A2UI generation assistant. Your role is to translate user
  requests—whether provided as text instructions, UI wireframes, screenshots,
  or mockup images—into valid A2UI v0.9 interactive user interfaces.
  ${mcpInstructions}
      `.trimEnd() + customPromptSuffix
      );
    }

    return (
      (
        this.generateSystemPrompt(
          this.serializeCatalogForPrompt(catalog),
          includeMultimodalGuidelines,
        ) + mcpInstructions
      ).trimEnd() + customPromptSuffix
    );
  }

  /**
   * Updates the custom instruction state and persists it to local storage.
   */
  setCustomInstructionsState(state: CustomInstructionsState): void {
    const validPreset = state.presets.some(p => p.id === state.activePresetId);
    const normalizedState: CustomInstructionsState = {
      presets: state.presets,
      activePresetId: validPreset ? state.activePresetId : null,
    };
    this.customInstructionsState.set(normalizedState);
    this.localStorageInteractions.setItem(
      LocalStorageKey.CUSTOM_INSTRUCTIONS,
      JSON.stringify(normalizedState),
    );
  }

  private loadInitialState(): CustomInstructionsState {
    const raw = this.localStorageInteractions.getItem(LocalStorageKey.CUSTOM_INSTRUCTIONS);
    if (!raw) {
      return {presets: [], activePresetId: null};
    }
    try {
      const parsed = JSON.parse(raw) as Partial<CustomInstructionsState>;
      if (!parsed || !Array.isArray(parsed.presets)) {
        return {presets: [], activePresetId: null};
      }
      const presets: CustomInstructionPreset[] = parsed.presets.filter(
        (p: unknown): p is CustomInstructionPreset =>
          typeof p === 'object' &&
          p !== null &&
          typeof (p as CustomInstructionPreset).id === 'string' &&
          typeof (p as CustomInstructionPreset).name === 'string' &&
          typeof (p as CustomInstructionPreset).content === 'string',
      );
      const activePresetId =
        typeof parsed.activePresetId === 'string' &&
        presets.some(p => p.id === parsed.activePresetId)
          ? parsed.activePresetId
          : null;
      return {presets, activePresetId};
    } catch {
      return {presets: [], activePresetId: null};
    }
  }

  private buildMcpInstructions(activeServers: McpServerConfig[]): string {
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
        const inputSchemaStr = JSON.stringify(tool.inputSchema || {type: 'object', properties: {}});
        const outputSchemaStr = JSON.stringify(tool.outputSchema || defaultOutputSchema);
        return `- **\`${tool.name}\`**${desc}\n  - **Input Schema**: \`${inputSchemaStr}\`\n  - **Output Schema**: \`${outputSchemaStr}\``;
      })
      .join('\n');

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
   * transitively referenced by `components` or `functions` (such as bundled
   * duplicate `catalog_*` definitions).
   */
  private serializeCatalogForPrompt(catalog: Catalog): string {
    if (!catalog.$defs || typeof catalog.$defs !== 'object' || Array.isArray(catalog.$defs)) {
      return JSON.stringify(catalog);
    }
    const defs = catalog.$defs;
    const referenced = new Set<string>();
    this.collectLocalDefRefs(
      {components: catalog.components, functions: catalog.functions},
      referenced,
    );
    for (const currentKey of referenced) {
      const defNode = defs[currentKey];
      if (defNode !== undefined) {
        this.collectLocalDefRefs(defNode, referenced);
      }
    }
    const filteredDefs = Object.fromEntries(
      Object.entries(defs).filter(([key]) => referenced.has(key)),
    );
    const prunedCatalog: Catalog = {...catalog};
    if (Object.keys(filteredDefs).length > 0) {
      prunedCatalog.$defs = filteredDefs;
    } else {
      delete prunedCatalog.$defs;
    }
    return JSON.stringify(prunedCatalog);
  }

  private collectLocalDefRefs(node: unknown, out: Set<string>): void {
    if (Array.isArray(node)) {
      for (const item of node) {
        this.collectLocalDefRefs(item, out);
      }
      return;
    }
    if (node !== null && typeof node === 'object') {
      for (const [key, val] of Object.entries(node)) {
        if (key === '$ref' && typeof val === 'string' && val.startsWith('#/$defs/')) {
          out.add(val.slice('#/$defs/'.length));
        } else {
          this.collectLocalDefRefs(val, out);
        }
      }
    }
  }

  private generateSystemPrompt(catalog: string, includeMultimodalGuidelines = false): string {
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
  * **Headings & Titles** -> Text component with heading typography styles
    (usageHint: "h1" | "h2" | "h3" or equivalent variant property in the
    active catalog schema).
  * **Body Text & Captions** -> Text component with body or caption
    typography styles (usageHint: "body" | "caption").
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
    into the updateDataModel payload.
  * **JSON Pointer References**: Components in updateComponents MUST bind to
    values in updateDataModel using valid JSON Pointers
    (e.g., {"path": "/header/title"}). Do NOT hardcode visible text strings
    inline when data binding is supported.
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
     items into updateDataModel.
  3. **Build Component Tree**: Map visual elements strictly to active
     catalog component types with exact icon names/SVGs, full-width
     properties, and JSON Pointer paths.
  4. **Emit JSONL Messages**: Output the single-line JSONL messages in
     strict sequence (createSurface -> updateComponents -> updateDataModel).`
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
     schema below, emitting "MaterialColumn", "MaterialText", or "Div" is
     strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
     defined in the JSON Schema for that specific component type in the
     active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
     or unsupported CSS/styling parameters).

  ### Active Catalog Schema (Mandatory Allowlist)
  \`\`\`json
  ${catalog}
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

  **IMPORTANT**: Catalog IDs, component names, and component properties (e.g.,
  child vs label) below are illustrative; strictly follow the active catalog
  schema above and omit \`\`\`jsonl fences in output.

    * **Form & Action Example**:
      \`\`\`jsonl
      {"version":"v0.9","createSurface":{"surfaceId":"main","catalogId":"https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version":"v0.9","updateComponents":{"surfaceId":"main","components":[{"id":"root","component":"MaterialColumn","children":["name_in","btn"]},{"id":"name_in","component":"MaterialInput","label":{"path":"/label"},"value":{"path":"/name"}},{"id":"btn","component":"MaterialButton","label":{"path":"/submitLabel"},"action":{"event":{"name":"submitForm","context":{"name":{"path":"/name"}}}}}]}}
      {"version":"v0.9","updateDataModel":{"surfaceId":"main","value":{"label":"Name","name":"Alice","submitLabel":"Submit"}}}
      \`\`\`

    * **Dynamic List Example**:
      \`\`\`jsonl
      {"version":"v0.9","createSurface":{"surfaceId":"list","catalogId":"https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version":"v0.9","updateComponents":{"surfaceId":"list","components":[{"id":"root","component":"MaterialColumn","children":{"componentId":"item_template","path":"/items"}},{"id":"item_template","component":"MaterialText","text":{"path":"text"}}]}}
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
