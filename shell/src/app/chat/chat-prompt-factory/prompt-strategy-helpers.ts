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

import {RE2JS} from 're2js';
import type {McpServerConfig, McpToolInfo} from '../../mcp/mcp-client-manager.service';
import type {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';

export const SVG_PATH_PROPERTY = 'svgPath';

/**
 * A data URL of the kind a model invents for an image it can't see: an empty
 * SVG (`<svg/>`), base64-encoded. Checking a catalog's URL pattern against it
 * tells Composer whether invented data URLs would be accepted.
 */
export const DATA_URL_PROBE = 'data:image/svg+xml;base64,PHN2Zy8+';

/**
 * The longest catalog `pattern`, in UTF-16 code units, that Composer compiles
 * with RE2 to test against {@link DATA_URL_PROBE} and repeats in the Image URL
 * rule. It bounds the work of compiling the pattern and the length of that
 * rule. It doesn't keep the pattern out of the prompt: the catalog schema in
 * the prompt already contains it.
 */
export const MAX_CHECKED_PATTERN_LENGTH = 256;

/** The start of a `$ref` that names an entry of the catalog's own `$defs`. */
export const LOCAL_DEF_REF_PREFIX = '#/$defs/';

/**
 * The keywords whose subschemas {@link findPropertySchema} searches for a
 * property, besides `properties` itself. Other keywords, such as `not`, don't
 * declare properties a component accepts.
 */
export const SUBSCHEMA_KEYWORDS = ['allOf', 'anyOf', 'oneOf', 'items'] as const;

/** A JSON Schema written as an object, as opposed to `true` or `false`. */
export type SchemaObject = Record<string, unknown>;

/** How much of an Icon component the active catalog offers. */
export enum IconSupport {
  /** The catalog has no Icon component. */
  NONE = 'none',
  /** The catalog's Icon takes only the icon names its schema lists. */
  NAMED = 'named',
  /** The catalog's Icon also takes custom SVG path data, in `svgPath`. */
  NAMED_AND_CUSTOM_SVG = 'namedAndCustomSvg',
}

/** Whether a value is a {@link SchemaObject}: an object that isn't an array. */
export function isSchemaObject(value: unknown): value is SchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Writes a string the renderer's catalog supplied, such as its ID or a
 * `pattern`, into the system prompt as a JSON string literal, so a quote, line
 * break or backtick in it can't end the string, the line, or a Markdown code
 * span or fence, and be read as instructions. JSON doesn't escape backticks, so
 * they're written as `\u0060`, which a JSON parser reads back as a backtick.
 */
export function quoteCatalogValue(value: string): string {
  return JSON.stringify(value).replaceAll('`', '\\u0060');
}

/**
 * The `$defs` entry a schema's local `$ref` names, such as
 * `#/$defs/DynamicString`, or undefined when it has no such `$ref`.
 */
export function localRefTarget(
  schema: SchemaObject,
  defs: Catalog['$defs'],
): SchemaObject | undefined {
  const ref = schema['$ref'];
  if (typeof ref !== 'string' || !ref.startsWith(LOCAL_DEF_REF_PREFIX) || !defs) {
    return undefined;
  }
  const name = ref.slice(LOCAL_DEF_REF_PREFIX.length);
  return Object.hasOwn(defs, name) && isSchemaObject(defs[name]) ? defs[name] : undefined;
}

/** A schema, followed by the `$defs` entry its local `$ref` names, if any. */
export function withLocalRefTarget(schema: unknown, defs: Catalog['$defs']): SchemaObject[] {
  if (!isSchemaObject(schema)) {
    return [];
  }
  const target = localRefTarget(schema, defs);
  return target ? [schema, target] : [schema];
}

/**
 * Finds the schema a component's schema gives a property. It searches the
 * component's `properties`, the subschemas of {@link SUBSCHEMA_KEYWORDS}, the
 * schemas of its properties (custom SVG path data sits inside the Icon's `name`
 * property), and the `$defs` entries that local `$ref`s name. The search is
 * breadth first, so a property the component declares wins over a property of
 * the same name nested inside another property.
 */
export function findPropertySchema(
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

/**
 * The JSON Schema `pattern` a property declares for literal strings: either on
 * the property's schema or on the `type: "string"` member of its `anyOf` or
 * `oneOf`, following local `$ref`s to the catalog's `$defs`. A2UI properties
 * are often a union of a literal string, a data binding and a function call,
 * so the pattern sits on the string member.
 */
export function findLiteralStringPattern(
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
export function isCheckablePattern(pattern: string): boolean {
  return pattern.length <= MAX_CHECKED_PATTERN_LENGTH && !/[\r\n]/.test(pattern);
}

/**
 * Whether a JSON Schema `pattern` rejects {@link DATA_URL_PROBE}.
 */
export function patternRejectsDataUrl(pattern: string): boolean {
  try {
    return !RE2JS.compile(pattern).test(DATA_URL_PROBE);
  } catch {
    return false;
  }
}

/** How much of an Icon component the catalog offers; see {@link IconSupport}. */
export function iconSupport(catalog: Catalog): IconSupport {
  const icon = catalog.components?.['Icon'];
  if (!icon) {
    return IconSupport.NONE;
  }
  return findPropertySchema(icon, SVG_PATH_PROPERTY, catalog.$defs)
    ? IconSupport.NAMED_AND_CUSTOM_SVG
    : IconSupport.NAMED;
}

/**
 * The fourth allowlist rule, for a catalog whose Image `url` property declares
 * a JSON Schema `pattern` for literal URLs, when that pattern rejects data
 * URLs; empty otherwise.
 */
export function imageUrlGuidance(catalog: Catalog): string {
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

export function iconGuidance(support: IconSupport): string {
  switch (support) {
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

export function visualAffordanceGuidance(support: IconSupport): string {
  const hasIcon = support !== IconSupport.NONE;
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

export function componentTreeMappingGuidance(support: IconSupport): string {
  switch (support) {
    case IconSupport.NONE:
      return 'supported layout and text properties';
    case IconSupport.NAMED:
      return 'exact supported icon values';
    case IconSupport.NAMED_AND_CUSTOM_SVG:
      return 'exact icon names/SVGs';
  }
}

/**
 * Recursively collects local definitions references ($ref matching #/$defs/...)
 * starting from an arbitrary AST node.
 */
export function collectLocalDefRefs(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      collectLocalDefRefs(item, out);
    }
    return;
  }
  if (node !== null && typeof node === 'object') {
    for (const [key, val] of Object.entries(node)) {
      if (key === '$ref' && typeof val === 'string' && val.startsWith(LOCAL_DEF_REF_PREFIX)) {
        out.add(val.slice(LOCAL_DEF_REF_PREFIX.length));
      } else {
        collectLocalDefRefs(val, out);
      }
    }
  }
}

/**
 * Strips unused `$defs` entries from the catalog so the model prompt only includes definitions
 * transitively referenced by `components` or `functions`.
 */
export function pruneCatalogForPrompt<T extends Catalog | CatalogJson>(catalog: T): T {
  if (
    !catalog['$defs'] ||
    typeof catalog['$defs'] !== 'object' ||
    Array.isArray(catalog['$defs'])
  ) {
    return catalog;
  }
  const defs = catalog['$defs'];
  const referenced = new Set<string>();
  collectLocalDefRefs({components: catalog.components, functions: catalog.functions}, referenced);
  for (const currentKey of referenced) {
    const defNode = defs[currentKey];
    if (defNode !== undefined) {
      collectLocalDefRefs(defNode, referenced);
    }
  }
  const filteredDefs = Object.fromEntries(
    Object.entries(defs).filter(([key]) => referenced.has(key)),
  );
  const prunedCatalog: Catalog = {...catalog};
  if (Object.keys(filteredDefs).length > 0) {
    prunedCatalog['$defs'] = filteredDefs;
  } else {
    delete prunedCatalog['$defs'];
  }
  return prunedCatalog as T;
}

/**
 * Serializes a catalog with unused `$defs` entries pruned.
 */
export function serializeCatalogForPrompt(catalog: Catalog | CatalogJson): string {
  return JSON.stringify(pruneCatalogForPrompt(catalog));
}

const DEFAULT_MCP_OUTPUT_SCHEMA = {
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

/**
 * Formats deduplicated MCP tools across active servers into prompt markdown bullets,
 * returning `null` when no tools are configured.
 */
export function formatMcpToolsMarkdown(
  activeServers: readonly McpServerConfig[],
  transformSchema: (schema: Record<string, unknown>) => unknown = s => s,
): string | null {
  const toolsMap = new Map<string, McpToolInfo>();
  for (const server of activeServers) {
    for (const tool of server.tools || []) {
      if (!toolsMap.has(tool.name)) {
        toolsMap.set(tool.name, tool);
      }
    }
  }

  if (toolsMap.size === 0) {
    return null;
  }

  return Array.from(toolsMap.values())
    .map(tool => {
      const desc = tool.description ? ` - ${tool.description}` : '';
      const inputSchemaStr = JSON.stringify(
        transformSchema(tool.inputSchema || {type: 'object', properties: {}}),
      );
      const outputSchemaStr = JSON.stringify(
        transformSchema(tool.outputSchema || DEFAULT_MCP_OUTPUT_SCHEMA),
      );
      return `- **\`${tool.name}\`**${desc}\n  - **Input Schema**: \`${inputSchemaStr}\`\n  - **Output Schema**: \`${outputSchemaStr}\``;
    })
    .join('\n');
}

/** Protocol version controlling syntax guidance in {@link buildMultimodalGuidelinesSection}. */
export type PromptGuidelinesVariant = 'v0.9' | 'v1.0';

/**
 * Builds the shared Multimodal & Image-to-UI Guidelines prompt section.
 */
export function buildMultimodalGuidelinesSection(
  support: IconSupport,
  variant: PromptGuidelinesVariant,
): string {
  const isV10 = variant === 'v1.0';
  const headingsRule = isV10
    ? `* **Headings & Titles** -> Text component formatted with Markdown \`#\` through \`#####\`
    inside \`Text.text\` (do NOT use heading variant properties or \`h1\`–\`h5\`, which were
    removed in A2UI v1.0).`
    : `* **Headings & Titles** -> Text component with heading typography styles
    (usageHint: "h1" | "h2" | "h3" or equivalent variant property in the
    active catalog schema).`;
  const bodyTextRule = isV10
    ? `* **Body Text & Captions** -> Text component with standard body text or markdown formatting.`
    : `* **Body Text & Captions** -> Text component with body or caption
    typography styles (usageHint: "body" | "caption").`;
  const dataExtractionTarget = isV10
    ? 'into the dataModel payload of createSurface.'
    : 'into the updateDataModel payload.';
  const jsonPointerRule = isV10
    ? `MUST bind to data model values
    using valid JSON Pointers with the \`@path\` key (e.g., {"@path": "/header/title"}).
    Never use \`"path"\` for data bindings.`
    : `in updateComponents MUST bind to
    values in updateDataModel using valid JSON Pointers
    (e.g., {"path": "/header/title"}). Do NOT hardcode visible text strings
    inline when data binding is supported.`;
  const dataExtractionStep = isV10 ? 'items into dataModel.' : 'items into updateDataModel.';
  const buildTreeSuffix = isV10
    ? `full-width
     properties, Markdown \`#\`–\`#####\` headings, and \`@path\` bindings.`
    : `full-width
     properties, and JSON Pointer paths.`;
  const emitStep = isV10
    ? `4. **Emit JSONL Message**: Output the complete initial UI as a single
     \`createSurface\` message with inline \`components\` and \`dataModel\`.`
    : `4. **Emit JSONL Messages**: Output the single-line JSONL messages in
     strict sequence (createSurface -> updateComponents -> updateDataModel).`;

  return `

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
  ${headingsRule}
  ${bodyTextRule}
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
  ${iconGuidance(support)}
  * **Visual Hierarchy**: Preserve typography scale, text weight, button
    prominence, and color intent using supported catalog properties.

  ### 4. Visual Affordance Recognition
  ${visualAffordanceGuidance(support)}

  ### 5. Grounding, Data Binding & Sequence
  * **Complete Data Model Extraction**: ALL text strings, label names, image
    URLs, options, and default values visible in the image MUST be extracted
    ${dataExtractionTarget}
  * **JSON Pointer References**: Components ${jsonPointerRule}
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
     ${dataExtractionStep}
  3. **Build Component Tree**: Map visual elements strictly to active
     catalog component types with
     ${componentTreeMappingGuidance(support)}, ${buildTreeSuffix}
  ${emitStep}`;
}
