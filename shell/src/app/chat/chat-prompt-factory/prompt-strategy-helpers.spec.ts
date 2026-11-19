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

import {describe, it, expect} from 'vitest';
import type {McpServerConfig} from '../../mcp/mcp-client-manager.service';
import type {Catalog} from '../../storage/models/catalog-storage.model';
import {stripReturnTypeDeep} from './prompt-protocol-strategy';
import {
  buildMultimodalGuidelinesSection,
  formatMcpToolsMarkdown,
  IconSupport,
  pruneCatalogForPrompt,
} from './prompt-strategy-helpers';

describe('prompt-strategy-helpers', () => {
  describe('pruneCatalogForPrompt', () => {
    it('strips unreferenced $defs while keeping transitively referenced $defs', () => {
      const catalog: Catalog = {
        catalogId: 'cat-1',
        components: {
          Text: {
            type: 'object',
            properties: {
              text: {$ref: '#/$defs/DynamicString'},
            },
          },
        },
        functions: {
          greet: {
            returnType: 'string',
            parameters: {$ref: '#/$defs/GreetArgs'},
          },
        },
        $defs: {
          DynamicString: {type: 'string'},
          GreetArgs: {
            type: 'object',
            properties: {nested: {$ref: '#/$defs/NestedArg'}},
          },
          NestedArg: {type: 'number'},
          UnusedDef: {type: 'boolean'},
        },
      } as unknown as Catalog;

      const pruned = pruneCatalogForPrompt(catalog);
      expect(Object.keys(pruned.$defs ?? {})).toEqual(['DynamicString', 'GreetArgs', 'NestedArg']);
    });
  });

  describe('formatMcpToolsMarkdown (byte-exact vs pre-extraction baseline)', () => {
    const servers: McpServerConfig[] = [
      {
        id: 'srv-1',
        name: 'Server 1',
        url: 'http://localhost:8080/mcp',
        enabled: true,
        status: 'connected',
        tools: [
          {
            name: 'getWeather',
            description: 'Fetch weather forecast',
            inputSchema: {
              type: 'object',
              properties: {city: {type: 'string', returnType: 'ignored'}},
            },
          },
          {
            name: 'noOutputTool',
          },
        ],
      },
      {
        id: 'srv-2',
        name: 'Server 2',
        url: 'http://localhost:8081/mcp',
        enabled: true,
        status: 'connected',
        tools: [{name: 'getWeather', description: 'Duplicate should be ignored'}],
      },
    ];

    it('matches pre-extraction v0.9 MCP tools markdown byte-for-byte', () => {
      const expectedV09 =
        '- **`getWeather`** - Fetch weather forecast\n' +
        '  - **Input Schema**: `{"type":"object","properties":{"city":{"type":"string","returnType":"ignored"}}}`\n' +
        '  - **Output Schema**: `{"type":"object","properties":{"content":{"type":"array","items":{"type":"object","properties":{"type":{"type":"string"},"text":{"type":"string"}}}}}}`\n' +
        '- **`noOutputTool`**\n' +
        '  - **Input Schema**: `{"type":"object","properties":{}}`\n' +
        '  - **Output Schema**: `{"type":"object","properties":{"content":{"type":"array","items":{"type":"object","properties":{"type":{"type":"string"},"text":{"type":"string"}}}}}}`';

      expect(formatMcpToolsMarkdown(servers)).toBe(expectedV09);
    });

    it('matches pre-extraction v1.0 MCP tools markdown (with stripReturnTypeDeep) byte-for-byte', () => {
      const expectedV10 =
        '- **`getWeather`** - Fetch weather forecast\n' +
        '  - **Input Schema**: `{"type":"object","properties":{"city":{"type":"string"}}}`\n' +
        '  - **Output Schema**: `{"type":"object","properties":{"content":{"type":"array","items":{"type":"object","properties":{"type":{"type":"string"},"text":{"type":"string"}}}}}}`\n' +
        '- **`noOutputTool`**\n' +
        '  - **Input Schema**: `{"type":"object","properties":{}}`\n' +
        '  - **Output Schema**: `{"type":"object","properties":{"content":{"type":"array","items":{"type":"object","properties":{"type":{"type":"string"},"text":{"type":"string"}}}}}}`';

      expect(formatMcpToolsMarkdown(servers, stripReturnTypeDeep)).toBe(expectedV10);
    });

    it('returns null when no tools exist', () => {
      expect(formatMcpToolsMarkdown([])).toBeNull();
    });
  });

  describe('buildMultimodalGuidelinesSection (byte-exact vs a8fe50c1 baseline)', () => {
    it('matches pre-extraction a8fe50c1 v0.9 multimodal guidelines byte-for-byte', () => {
      const support = IconSupport.NAMED;
      const expectedFromA8feV09 = `

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
  * Use Icon components only with icon names the active catalog's Icon
    schema lists. The active catalog does not support custom icon drawing: do
    NOT emit svgPath fields, inline SVG fields, or data:image/svg+xml
    fallbacks. When no listed icon matches, omit the icon or represent its
    meaning with supported Text, Button, Image, or layout components.
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
      schema, use it; otherwise, use a text input component paired with a search icon.
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
     catalog component types with
     exact supported icon values, full-width
     properties, and JSON Pointer paths.
  4. **Emit JSONL Messages**: Output the single-line JSONL messages in
     strict sequence (createSurface -> updateComponents -> updateDataModel).`;

      expect(buildMultimodalGuidelinesSection(support, 'v0.9')).toBe(expectedFromA8feV09);
    });

    it('matches pre-extraction a8fe50c1 v1.0 multimodal guidelines byte-for-byte', () => {
      const support = IconSupport.NAMED;
      const expectedFromA8feV10 = `

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

  ### 3. Icon, Image & Styling Intent
  * Use Icon components only with icon names the active catalog's Icon
    schema lists. The active catalog does not support custom icon drawing: do
    NOT emit svgPath fields, inline SVG fields, or data:image/svg+xml
    fallbacks. When no listed icon matches, omit the icon or represent its
    meaning with supported Text, Button, Image, or layout components.
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
      schema, use it; otherwise, use a text input component paired with a search icon.
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
     catalog component types with
     exact supported icon values, full-width
     properties, Markdown \`#\`–\`#####\` headings, and \`@path\` bindings.
  4. **Emit JSONL Message**: Output the complete initial UI as a single
     \`createSurface\` message with inline \`components\` and \`dataModel\`.`;

      expect(buildMultimodalGuidelinesSection(support, 'v1.0')).toBe(expectedFromA8feV10);
    });
  });
});
