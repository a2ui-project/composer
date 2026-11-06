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
import {RE2JS} from 're2js';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog, getCatalogId} from '../../storage/models/catalog-storage.model';
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
        this.generateSystemPrompt(catalog, includeMultimodalGuidelines) + mcpInstructions
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

  private generateSystemPrompt(catalog: Catalog, includeMultimodalGuidelines = false): string {
    const catalogText = this.serializeCatalogForPrompt(catalog);
    // The examples' createSurface names the active catalog because models copy it, and
    // a renderer rejects other catalog IDs. 'active-catalog' stands in when the catalog
    // has no ID. The renderer supplies the ID, so it is quoted rather than pasted in.
    const catalogIdLiteral = quoteCatalogValue(getCatalogId(catalog) || 'active-catalog');
    const iconSupport = this.iconSupport(catalog);
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

  ### 3. Icon, Image & Styling Intent
  ${this.iconGuidance(iconSupport)}
  * **Visual Hierarchy**: Preserve typography scale, text weight, button
    prominence, and color intent using supported catalog properties.

  ### 4. Visual Affordance Recognition
  ${this.visualAffordanceGuidance(iconSupport)}

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
     catalog component types with
     ${this.componentTreeMappingGuidance(iconSupport)}, full-width
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
     schema below, emitting any prefixed, library-specific, or DOM component
     name that is absent from the active catalog is strictly INVALID.
  3. **No Hallucinated Properties**: Include ONLY properties explicitly
     defined in the JSON Schema for that specific component type in the
     active catalog. Do NOT emit unauthorized keys (e.g., "rules", "mock*",
     or unsupported CSS/styling parameters).${this.imageUrlGuidance(catalog)}

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

  /**
   * The multimodal guidelines' rule for icons. A catalog whose Icon takes only
   * listed names may use those names, as the visual affordance and component
   * tree guidance also say, but must not fall back to drawing an icon.
   */
  private iconGuidance(iconSupport: IconSupport): string {
    switch (iconSupport) {
      case IconSupport.NONE:
        return `* The active catalog does not support custom icon drawing. Do NOT invent Icon
    components, icon names, svgPath fields, inline SVG fields, or
    data:image/svg+xml fallbacks unless those exact component names and
    properties appear in the active catalog schema. Omit the icon or represent
    the meaning with supported Text, Button, Image, or layout components.`;
      case IconSupport.NAMED:
        return `* Use Icon components only with icon names the active catalog's Icon
    schema lists. The active catalog does not support custom icon drawing: do
    NOT emit svgPath fields, inline SVG fields, or data:image/svg+xml
    fallbacks. When no listed icon matches, omit the icon or represent its
    meaning with supported Text, Button, Image, or layout components.`;
      case IconSupport.NAMED_AND_CUSTOM_SVG:
        return `* Use Icon components only when the active catalog schema includes the exact
    icon values and properties you need. Custom SVG fields are allowed only
    when the Icon schema explicitly defines them.`;
    }
  }

  /**
   * The fourth allowlist rule, for a catalog whose Image `url` property declares
   * a JSON Schema `pattern` for literal URLs, when that pattern rejects data
   * URLs; empty otherwise. Asked for an image it can't see, a model tends to
   * invent an inline SVG data URL, which such a catalog doesn't accept. That
   * happens with text-only prompts too, so the rule is in every prompt, not in
   * the multimodal guidelines. It quotes the catalog's pattern instead of
   * describing it, so it holds for any catalog that declares one.
   */
  private imageUrlGuidance(catalog: Catalog): string {
    const pattern = findLiteralStringPattern(
      findPropertySchema(catalog.components?.['Image'], 'url', catalog.$defs),
      catalog.$defs,
    );
    if (!pattern || !isCheckablePattern(pattern) || !patternRejectsDataUrl(pattern)) {
      return '';
    }
    return `
  4. **Image URLs**: For Image.url, use only URLs matching ${quoteCatalogValue(pattern)}
     (a regular expression, quoted as a JSON string). If no suitable URL is
     provided or visible, omit the Image component instead of inventing a URL.`;
  }

  /** How much of an Icon component the catalog offers; see {@link IconSupport}. */
  private iconSupport(catalog: Catalog): IconSupport {
    const icon = catalog.components?.['Icon'];
    if (!icon) {
      return IconSupport.NONE;
    }
    return findPropertySchema(icon, SVG_PATH_PROPERTY, catalog.$defs)
      ? IconSupport.NAMED_AND_CUSTOM_SVG
      : IconSupport.NAMED;
  }

  private visualAffordanceGuidance(iconSupport: IconSupport): string {
    const hasIcon = iconSupport !== IconSupport.NONE;
    const disclosureFallback = hasIcon
      ? `layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding leading text/icons and a trailing downward icon.`
      : `layout primitives in the catalog: e.g., a horizontal layout container
      (Row) holding the visible label and any supported text marker only when
      that marker is literally present.`;
    const searchFallback = hasIcon
      ? `use a text input component paired with a search icon.`
      : `use the active catalog's text input component if one exists, or
      represent the visible search label/placeholder with supported Text and
      layout components.`;

    return `Recognize common UI visual affordance symbols and map them strictly using
  components defined in the active catalog schema provided above:
  * **Downward Chevrons / Disclosure Carets (Collapsible Rows)**:
    - **Visual Indicator**: Downward-facing arrows (∨, expand_more) at row
      edges denote expandable/collapsible sections.
    - **Catalog Mapping**: If the active catalog schema includes an expansion
      or accordion component, use it. Otherwise, compose the row using
      ${disclosureFallback}
  * **Search Cues (Search Inputs)**:
    - **Visual Indicator**: Magnifying glass symbols (🔍) inside or adjacent
      to text entry boxes.
    - **Catalog Mapping**: If a search component exists in the active catalog
      schema, use it; otherwise, ${searchFallback}
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
      inside a container or card.`;
  }

  private componentTreeMappingGuidance(iconSupport: IconSupport): string {
    switch (iconSupport) {
      case IconSupport.NONE:
        return 'supported layout and text properties';
      case IconSupport.NAMED:
        return 'exact supported icon values';
      case IconSupport.NAMED_AND_CUSTOM_SVG:
        return 'exact icon names/SVGs';
    }
  }
}

/** How much of an Icon component the active catalog offers. */
enum IconSupport {
  /** The catalog has no Icon component. */
  NONE = 'none',
  /** The catalog's Icon takes only the icon names its schema lists. */
  NAMED = 'named',
  /** The catalog's Icon also takes custom SVG path data, in `svgPath`. */
  NAMED_AND_CUSTOM_SVG = 'namedAndCustomSvg',
}

/** The Icon property the basic catalog uses for custom SVG path data. */
const SVG_PATH_PROPERTY = 'svgPath';

/**
 * A data URL of the kind a model invents for an image it can't see: an empty
 * SVG (`<svg/>`), base64-encoded. Checking a catalog's URL pattern against it
 * tells Composer whether invented data URLs would be accepted.
 */
const DATA_URL_PROBE = 'data:image/svg+xml;base64,PHN2Zy8+';

/**
 * The longest catalog `pattern`, in UTF-16 code units, that Composer compiles
 * with RE2 to test against {@link DATA_URL_PROBE} and repeats in the Image URL
 * rule. It bounds the work of compiling the pattern and the length of that
 * rule. It doesn't keep the pattern out of the prompt: the catalog schema in
 * the prompt already contains it.
 */
const MAX_CHECKED_PATTERN_LENGTH = 256;

/** The start of a `$ref` that names an entry of the catalog's own `$defs`. */
const LOCAL_DEF_REF_PREFIX = '#/$defs/';

/**
 * The keywords whose subschemas {@link findPropertySchema} searches for a
 * property, besides `properties` itself. Other keywords, such as `not`, don't
 * declare properties a component accepts.
 */
const SUBSCHEMA_KEYWORDS = ['allOf', 'anyOf', 'oneOf', 'items'] as const;

/** A JSON Schema written as an object, as opposed to `true` or `false`. */
type SchemaObject = Record<string, unknown>;

/** Whether a value is a {@link SchemaObject}: an object that isn't an array. */
function isSchemaObject(value: unknown): value is SchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The `$defs` entry a schema's local `$ref` names, such as
 * `#/$defs/DynamicString`, or undefined when it has no such `$ref`.
 */
function localRefTarget(schema: SchemaObject, defs: Catalog['$defs']): SchemaObject | undefined {
  const ref = schema['$ref'];
  if (typeof ref !== 'string' || !ref.startsWith(LOCAL_DEF_REF_PREFIX) || !defs) {
    return undefined;
  }
  const name = ref.slice(LOCAL_DEF_REF_PREFIX.length);
  return Object.hasOwn(defs, name) && isSchemaObject(defs[name]) ? defs[name] : undefined;
}

/** A schema, followed by the `$defs` entry its local `$ref` names, if any. */
function withLocalRefTarget(schema: unknown, defs: Catalog['$defs']): SchemaObject[] {
  if (!isSchemaObject(schema)) {
    return [];
  }
  const target = localRefTarget(schema, defs);
  return target ? [schema, target] : [schema];
}

/**
 * The JSON Schema `pattern` a property declares for literal strings: either on
 * the property's schema or on the `type: "string"` member of its `anyOf` or
 * `oneOf`, following local `$ref`s to the catalog's `$defs`. A2UI properties
 * are often a union of a literal string, a data binding and a function call,
 * so the pattern sits on the string member.
 */
function findLiteralStringPattern(
  schema: SchemaObject | undefined,
  defs: Catalog['$defs'],
): string | undefined {
  const schemas = withLocalRefTarget(schema, defs);
  for (const candidate of schemas) {
    if (typeof candidate['pattern'] === 'string') {
      return candidate['pattern'];
    }
  }
  const members = schemas
    .flatMap(candidate => [candidate['anyOf'], candidate['oneOf']])
    .flatMap(union => (Array.isArray(union) ? (union as unknown[]) : []))
    .flatMap(member => withLocalRefTarget(member, defs));
  for (const {type, pattern} of members) {
    if (type === 'string' && typeof pattern === 'string') {
      return pattern;
    }
  }
  return undefined;
}

/**
 * Whether Composer checks a catalog `pattern` and repeats it in the Image URL
 * rule: one no longer than {@link MAX_CHECKED_PATTERN_LENGTH}, without a
 * literal line break, which a URL pattern has no use for. Any other pattern
 * gets no rule.
 */
function isCheckablePattern(pattern: string): boolean {
  return pattern.length <= MAX_CHECKED_PATTERN_LENGTH && !/[\r\n]/.test(pattern);
}

/**
 * Whether a JSON Schema `pattern` rejects {@link DATA_URL_PROBE}. The pattern
 * comes from the renderer, so it runs on RE2, which matches in time linear in
 * the input, rather than on JavaScript's backtracking engine, where a crafted
 * pattern can take exponential time and freeze the page. A pattern RE2 can't
 * compile, such as an invalid one or one with a lookahead, counts as not
 * rejecting the probe: Composer can't tell what such a pattern accepts, so it
 * gives no guidance rather than guessing.
 */
function patternRejectsDataUrl(pattern: string): boolean {
  try {
    return !RE2JS.compile(pattern).test(DATA_URL_PROBE);
  } catch {
    return false;
  }
}

/**
 * Writes a string the renderer's catalog supplied, such as its ID or a
 * `pattern`, into the system prompt as a JSON string literal, so a quote, line
 * break or backtick in it can't end the string, the line, or a Markdown code
 * span or fence, and be read as instructions. JSON doesn't escape backticks, so
 * they're written as `\u0060`, which a JSON parser reads back as a backtick.
 */
function quoteCatalogValue(value: string): string {
  return JSON.stringify(value).replaceAll('`', '\\u0060');
}

/**
 * Finds the schema a component's schema gives a property. It searches the
 * component's `properties`, the subschemas of {@link SUBSCHEMA_KEYWORDS}, the
 * schemas of its properties (custom SVG path data sits inside the Icon's `name`
 * property), and the `$defs` entries that local `$ref`s name. The search is
 * breadth first, so a property the component declares wins over a property of
 * the same name nested inside another property.
 */
function findPropertySchema(
  schema: unknown,
  name: string,
  defs: Catalog['$defs'],
): SchemaObject | undefined {
  const queue: unknown[] = [schema];
  const visited = new Set<SchemaObject>();
  for (let index = 0; index < queue.length; index++) {
    const node = queue[index];
    if (!isSchemaObject(node) || visited.has(node)) {
      continue;
    }
    visited.add(node);
    const properties = node['properties'];
    if (isSchemaObject(properties)) {
      const property = Object.hasOwn(properties, name) ? properties[name] : undefined;
      if (isSchemaObject(property)) {
        return property;
      }
      queue.push(...Object.values(properties));
    }
    for (const keyword of SUBSCHEMA_KEYWORDS) {
      const subschemas = node[keyword];
      queue.push(...(Array.isArray(subschemas) ? subschemas : [subschemas]));
    }
    queue.push(localRefTarget(node, defs));
  }
  return undefined;
}
