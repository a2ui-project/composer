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
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {ChatPromptFactoryService} from './chat-prompt-factory.service';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {McpClientManagerService} from '../../mcp/mcp-client-manager.service';
import {COMMON_TYPES_SCHEMA} from '../../gallery/schema/common-types-schema';

import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';

describe('ChatPromptFactoryService', () => {
  let service: ChatPromptFactoryService;
  let catalogSpy: {
    activeCatalog: ReturnType<typeof vi.fn>;
    activeCatalogSignal: ReturnType<typeof vi.fn>;
  };
  let mcpSpy: {
    getActiveServersWithTools: ReturnType<typeof vi.fn>;
    doesCatalogSupportMcp: ReturnType<typeof vi.fn>;
  };
  let localStorageSpy: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    catalogSpy = {activeCatalog: vi.fn(), activeCatalogSignal: vi.fn(() => null)};
    mcpSpy = {
      getActiveServersWithTools: vi.fn(() => []),
      doesCatalogSupportMcp: vi.fn(catalog =>
        McpClientManagerService.prototype.doesCatalogSupportMcp(catalog),
      ),
    };
    localStorageSpy = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ChatPromptFactoryService,
        {provide: CatalogManagement, useValue: catalogSpy},
        {provide: McpClientManagerService, useValue: mcpSpy},
        {provide: LocalStorageInteractions, useValue: localStorageSpy},
      ],
    });
    service = TestBed.inject(ChatPromptFactoryService);
  });

  it('generate default prompt when no active catalog', () => {
    catalogSpy.activeCatalog.mockReturnValue(null);
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
    expect(service.systemPrompt()).not.toContain('Active Catalog Schema');
  });

  it('generate catalog specific prompt without MCP instructions when callMcpTool is absent', () => {
    mcpSpy.getActiveServersWithTools.mockReturnValue([
      {
        id: 'srv-1',
        name: 'fs-server',
        url: 'http://localhost:3001/mcp',
        enabled: true,
        status: 'connected',
        tools: [{name: 'read_file', description: 'Reads a file'}],
      },
    ]);
    catalogSpy.activeCatalog.mockReturnValue({components: {}});
    expect(service.systemPrompt()).toContain('Active Catalog Schema');
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
    expect(service.systemPrompt()).not.toContain('Available MCP Tools & Catalog Instructions');
  });

  it('appends active MCP tools with input and output schema without server name or URL when callMcpTool is present in catalog functions', () => {
    mcpSpy.getActiveServersWithTools.mockReturnValue([
      {
        id: 'srv-1',
        name: 'fs-server',
        url: 'http://localhost:3001/mcp',
        enabled: true,
        status: 'connected',
        tools: [
          {
            name: 'read_file',
            description: 'Reads a file',
            inputSchema: {type: 'object', properties: {path: {type: 'string'}}},
            outputSchema: {type: 'object', properties: {content: {type: 'string'}}},
          },
        ],
      },
    ]);
    catalogSpy.activeCatalog.mockReturnValue({
      components: {},
      functions: {callMcpTool: {type: 'object'}},
    });
    expect(service.systemPrompt()).toContain('Available MCP Tools & Catalog Instructions');
    expect(service.systemPrompt()).toContain('read_file');
    expect(service.systemPrompt()).toContain('Input Schema');
    expect(service.systemPrompt()).toContain('Output Schema');
    expect(service.systemPrompt()).toContain('"path":{"type":"string"}');
    expect(service.systemPrompt()).toContain('"content":{"type":"string"}');
    expect(service.systemPrompt()).not.toContain('fs-server');
    expect(service.systemPrompt()).not.toContain('http://localhost:3001/mcp');
  });

  it('includes current UI editing guidance in catalog prompts', () => {
    catalogSpy.activeCatalog.mockReturnValue({components: {Text: {}}});

    const prompt = service.systemPrompt();

    expect(prompt).toContain('Editing the Current UI');
    expect(prompt).toContain('actual surface IDs, component IDs, and data bindings');
  });

  it('forbids icon and SVG fallbacks for a catalog without an Icon component', () => {
    catalogSpy.activeCatalog.mockReturnValue({
      catalogId: 'https://a2ui-project.github.io/composer/catalogs/slack/v1',
      components: {
        Text: {properties: {component: {const: 'Text'}, text: {type: 'string'}}},
        Image: {
          properties: {
            component: {const: 'Image'},
            url: {
              anyOf: [
                {type: 'string', pattern: '^https?://'},
                {type: 'object', properties: {path: {type: 'string'}}},
              ],
              description: 'The HTTP(S) URL of the image to display in Slack.',
            },
          },
        },
        Column: {properties: {component: {const: 'Column'}, children: {type: 'array'}}},
        Button: {properties: {component: {const: 'Button'}, child: {type: 'string'}}},
      },
    });

    // Icon guidance is part of the multimodal guidelines.
    const prompt = service.buildSystemPrompt({includeMultimodalGuidelines: true});

    expect(prompt).toContain('Do NOT invent Icon');
    expect(prompt).toContain('data:image/svg+xml fallbacks');
    expect(prompt).toContain('For Image.url, use only URLs matching `^https?://`');
    expect(prompt).not.toContain('Fallback to SVG');
    expect(prompt).not.toContain('leading text/icons');
    expect(prompt).not.toContain('trailing downward icon');
    expect(prompt).not.toContain('search icon');
    expect(prompt).not.toContain('exact icon names/SVGs');
    expect(prompt).not.toContain('MaterialColumn');
    expect(prompt).not.toContain('MaterialText');
    expect(prompt).not.toContain('MaterialDatepicker');
    expect(prompt).not.toContain('https://a2ui.org/specification/v0_9/material_catalog.json');
  });

  it('preserves icon and SVG guidance when the active catalog supports both', () => {
    catalogSpy.activeCatalog.mockReturnValue({
      catalogId: 'supported-icon-catalog',
      components: {
        Text: {properties: {component: {const: 'Text'}, text: {type: 'string'}}},
        Row: {properties: {component: {const: 'Row'}, children: {type: 'array'}}},
        Column: {properties: {component: {const: 'Column'}, children: {type: 'array'}}},
        Icon: {
          properties: {
            component: {const: 'Icon'},
            name: {enum: ['search', 'expand_more']},
            svgPath: {type: 'string', description: 'Custom SVG path data.'},
          },
        },
      },
    });

    const prompt = service.buildSystemPrompt({includeMultimodalGuidelines: true});

    expect(prompt).toContain('Use Icon components only');
    expect(prompt).toContain('leading text/icons');
    expect(prompt).toContain('trailing downward icon');
    expect(prompt).toContain('search icon');
    expect(prompt).toContain('exact icon names/SVGs');
  });

  it('reads svgPath from the schema, not from its references', () => {
    const ref = {
      $ref: 'https://a2ui.org/specification/v0_9/common_types.json#/$defs/DynamicString',
    };
    catalogSpy.activeCatalog.mockReturnValue({
      catalogId: 'basic-shaped-catalog',
      components: {
        Text: {properties: {component: {const: 'Text'}}},
        Column: {properties: {component: {const: 'Column'}}},
        Icon: {
          allOf: [
            ref,
            {
              properties: {
                component: {const: 'Icon'},
                name: {
                  oneOf: [
                    {type: 'string', enum: ['search']},
                    {type: 'object', properties: {svgPath: {type: 'string'}}},
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(service.buildSystemPrompt({includeMultimodalGuidelines: true})).toContain(
      'exact icon names/SVGs',
    );
  });

  it('does not treat an Icon that only mentions SVG as accepting custom SVG paths', () => {
    catalogSpy.activeCatalog.mockReturnValue({
      components: {
        Icon: {
          properties: {
            component: {const: 'Icon'},
            name: {type: 'string', description: 'An icon name; SVG files are not accepted.'},
          },
        },
      },
    });

    const prompt = service.buildSystemPrompt({includeMultimodalGuidelines: true});

    expect(prompt).toContain('exact supported icon values');
    expect(prompt).not.toContain('exact icon names/SVGs');
  });

  describe('Image url guidance', () => {
    /** Makes the active catalog one whose Image `url` property has the given schema. */
    function useImageUrlSchema(url: Record<string, unknown>): void {
      catalogSpy.activeCatalog.mockReturnValue({
        components: {Image: {properties: {component: {const: 'Image'}, url}}},
      });
    }

    it('names a pattern declared on the url property itself', () => {
      useImageUrlSchema({type: 'string', pattern: '^https://'});

      expect(service.systemPrompt()).toContain('For Image.url, use only URLs matching `^https://`');
    });

    it('names a pattern declared on the string member of a oneOf', () => {
      useImageUrlSchema({
        oneOf: [
          {type: 'object', properties: {path: {type: 'string'}}},
          {type: 'string', pattern: '^https?://'},
        ],
      });

      expect(service.systemPrompt()).toContain(
        'For Image.url, use only URLs matching `^https?://`',
      );
    });

    it('gives no guidance when the url only describes its URLs in prose', () => {
      useImageUrlSchema({type: 'string', description: 'The HTTP(S) URL of the image.'});

      expect(service.systemPrompt()).not.toContain('For Image.url');
    });

    it('gives no guidance when the pattern accepts data URLs', () => {
      useImageUrlSchema({type: 'string', pattern: '^(https?|data):'});

      expect(service.systemPrompt()).not.toContain('For Image.url');
    });

    it('gives no guidance when the pattern is not a valid regular expression', () => {
      useImageUrlSchema({type: 'string', pattern: '^https?://('});

      expect(service.systemPrompt()).not.toContain('For Image.url');
    });
  });

  describe('Custom Instructions', () => {
    it('initializes with empty state when storage is empty or invalid JSON', () => {
      expect(service.customInstructionsState()).toEqual({
        presets: [],
        activePresetId: null,
      });
      expect(service.presets()).toEqual([]);
      expect(service.activePresetId()).toBeNull();
      expect(service.activePreset()).toBeNull();
      expect(service.customInstructions()).toBe('');
      expect(service.hasCustomInstructions()).toBe(false);
    });

    it('hydrates saved state from LocalStorageInteractions on initialization', () => {
      const savedState = {
        presets: [{id: 'p-1', name: 'Concise', content: 'Be concise.'}],
        activePresetId: 'p-1',
      };
      localStorageSpy.getItem.mockImplementation(key =>
        key === LocalStorageKey.CUSTOM_INSTRUCTIONS ? JSON.stringify(savedState) : null,
      );

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ChatPromptFactoryService,
          {provide: CatalogManagement, useValue: catalogSpy},
          {provide: McpClientManagerService, useValue: mcpSpy},
          {provide: LocalStorageInteractions, useValue: localStorageSpy},
        ],
      });
      const newService = TestBed.inject(ChatPromptFactoryService);

      expect(newService.customInstructionsState()).toEqual(savedState);
      expect(newService.presets()).toEqual(savedState.presets);
      expect(newService.activePresetId()).toBe('p-1');
      expect(newService.activePreset()).toEqual(savedState.presets[0]);
      expect(newService.customInstructions()).toBe('Be concise.');
      expect(newService.hasCustomInstructions()).toBe(true);
    });

    it('appends ## Custom User Instructions to systemPrompt when active preset has non-empty content (no catalog)', () => {
      catalogSpy.activeCatalog.mockReturnValue(null);
      service.setCustomInstructionsState({
        presets: [{id: 'p-1', name: 'Dark Theme', content: 'Always use dark colors.'}],
        activePresetId: 'p-1',
      });

      const prompt = service.systemPrompt();
      expect(prompt).toContain('## Custom User Instructions\n\nAlways use dark colors.');
      expect(prompt.endsWith('## Custom User Instructions\n\nAlways use dark colors.')).toBe(true);
    });

    it('appends ## Custom User Instructions to systemPrompt when active preset has non-empty content (with catalog)', () => {
      catalogSpy.activeCatalog.mockReturnValue({components: {}});
      service.setCustomInstructionsState({
        presets: [{id: 'p-1', name: 'Dense', content: 'Dense layout only.'}],
        activePresetId: 'p-1',
      });

      const prompt = service.systemPrompt();
      expect(prompt).toContain('## Custom User Instructions\n\nDense layout only.');
      expect(prompt.endsWith('## Custom User Instructions\n\nDense layout only.')).toBe(true);
    });

    it('omits ## Custom User Instructions when activePresetId is null or content is whitespace only', () => {
      catalogSpy.activeCatalog.mockReturnValue(null);

      // Active preset null
      service.setCustomInstructionsState({
        presets: [{id: 'p-1', name: 'Dark Theme', content: 'Always use dark colors.'}],
        activePresetId: null,
      });
      expect(service.systemPrompt()).not.toContain('## Custom User Instructions');
      expect(service.hasCustomInstructions()).toBe(false);

      // Active preset with whitespace content
      service.setCustomInstructionsState({
        presets: [{id: 'p-2', name: 'Empty', content: '   \n  '}],
        activePresetId: 'p-2',
      });
      expect(service.systemPrompt()).not.toContain('## Custom User Instructions');
      expect(service.hasCustomInstructions()).toBe(false);
    });

    it('normalizes unknown activePresetId to null and persists to storage in setCustomInstructionsState', () => {
      service.setCustomInstructionsState({
        presets: [{id: 'p-1', name: 'Preset 1', content: 'Some instructions'}],
        activePresetId: 'non-existent-id',
      });

      expect(service.activePresetId()).toBeNull();
      expect(service.activePreset()).toBeNull();
      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        LocalStorageKey.CUSTOM_INSTRUCTIONS,
        JSON.stringify({
          presets: [{id: 'p-1', name: 'Preset 1', content: 'Some instructions'}],
          activePresetId: null,
        }),
      );
    });
  });

  describe('Multimodal Guidelines', () => {
    beforeEach(() => {
      catalogSpy.activeCatalog.mockReturnValue({components: {}});
    });

    it('omits ## Multimodal & Image-to-UI Guidelines by default in systemPrompt() and buildSystemPrompt() with clean section boundary formatting', () => {
      const prompt = service.systemPrompt();
      expect(prompt).not.toContain('## Multimodal & Image-to-UI Guidelines');
      expect(service.buildSystemPrompt()).not.toContain('## Multimodal & Image-to-UI Guidelines');
      expect(service.buildSystemPrompt({includeMultimodalGuidelines: false})).not.toContain(
        '## Multimodal & Image-to-UI Guidelines',
      );
      expect(prompt).toContain(
        'independently parseable by JSON.parse().\n\n  ## Validation & Lifecycle Ordering',
      );
      expect(prompt).not.toContain('\n\n\n');
    });

    it('includes ## Multimodal & Image-to-UI Guidelines when includeMultimodalGuidelines is true with follow-up precedence note and clean boundaries', () => {
      const prompt = service.buildSystemPrompt({includeMultimodalGuidelines: true});
      expect(prompt).toContain('## Multimodal & Image-to-UI Guidelines');
      expect(prompt).toContain(
        'explicit user text instructions to add, modify, or remove elements\n  take precedence over earlier screenshots and follow ## Editing the Current UI',
      );
      expect(prompt).toContain('### 1. Visual Layout, Scope & Sizing Fidelity');
      expect(prompt).toContain('### 6. Image-to-UI Processing Sequence');
      expect(prompt).toContain(
        'independently parseable by JSON.parse().\n\n  ## Multimodal & Image-to-UI Guidelines',
      );
      expect(prompt).toContain(
        '(createSurface -> updateComponents -> updateDataModel).\n\n  ## Validation & Lifecycle Ordering',
      );
      expect(prompt).not.toContain('\n\n\n');
    });
  });

  describe('Schema Minification', () => {
    it('serializes catalog and COMMON_TYPES_SCHEMA as compact single-line JSON while preserving COMMON_TYPES_SCHEMA descriptions', () => {
      const catalog = {
        catalogId: 'compact-cat',
        components: {
          Text: {
            type: 'object',
            properties: {text: {type: 'string'}},
          },
        },
      };
      catalogSpy.activeCatalog.mockReturnValue(catalog);

      const prompt = service.systemPrompt();
      expect(prompt).toContain(
        '{"catalogId":"compact-cat","components":{"Text":{"type":"object","properties":{"text":{"type":"string"}}}}}',
      );
      expect(prompt).toContain(JSON.stringify(COMMON_TYPES_SCHEMA));
      expect(prompt).toContain(
        'Attributes to enhance accessibility when using assistive technologies',
      );
    });

    it('preserves transitively referenced $defs (including common_types_* and custom $defs) while pruning unreferenced $defs without mutating input catalog', () => {
      const catalog = {
        catalogId: 'defs-cat',
        components: {
          Button: {
            type: 'object',
            properties: {
              label: {$ref: '#/$defs/common_types_DynamicString'},
              variant: {$ref: '#/$defs/CustomVariant'},
            },
          },
        },
        $defs: {
          common_types_DynamicString: {
            anyOf: [{type: 'string'}, {$ref: '#/$defs/common_types_DataBinding'}],
          },
          common_types_DataBinding: {type: 'object'},
          CustomVariant: {type: 'string', enum: ['primary', 'secondary']},
          catalog_Button: {type: 'object', description: 'Unreferenced duplicate component copy'},
          UnusedDef: {type: 'number'},
        },
      };
      catalogSpy.activeCatalog.mockReturnValue(catalog);

      const prompt = service.systemPrompt();
      expect(prompt).toContain('"common_types_DynamicString"');
      expect(prompt).toContain('"common_types_DataBinding"');
      expect(prompt).toContain('"CustomVariant":{"type":"string","enum":["primary","secondary"]}');
      expect(prompt).not.toContain('catalog_Button');
      expect(prompt).not.toContain('UnusedDef');
      // Input catalog object must not be mutated
      expect(catalog.$defs.catalog_Button).toBeDefined();
      expect(catalog.$defs.UnusedDef).toEqual({type: 'number'});
    });

    it('omits $defs when catalog.$defs contains only unreferenced entries', () => {
      const unreferencedDefsCatalog = {
        catalogId: 'only-unreferenced-defs',
        components: {Text: {type: 'object'}},
        $defs: {
          catalog_Text: {type: 'object'},
        },
      };
      catalogSpy.activeCatalog.mockReturnValue(unreferencedDefsCatalog);
      expect(service.systemPrompt()).toContain(
        '{"catalogId":"only-unreferenced-defs","components":{"Text":{"type":"object"}}}',
      );
      expect(unreferencedDefsCatalog.$defs.catalog_Text).toEqual({type: 'object'});
    });
  });

  describe('Condensed Few-Shot Examples', () => {
    beforeEach(() => {
      catalogSpy.activeCatalog.mockReturnValue({components: {}});
    });

    it('replaces the verbose vacation_booking example with compact valid JSONL examples covering core A2UI features', () => {
      const prompt = service.systemPrompt();
      expect(prompt).not.toContain('vacation_booking');
      expect(prompt).not.toContain('Book Your Dream Vacation');

      const examplesMatch = prompt.match(/## Examples([\s\S]*?)## Data Binding/);
      expect(examplesMatch).not.toBeNull();
      const examplesSection = examplesMatch![1];
      expect(examplesSection.length).toBeLessThanOrEqual(1500);

      const jsonlBlocks = Array.from(examplesSection.matchAll(/```jsonl\n([\s\S]*?)```/g)).map(m =>
        m[1].trim(),
      );
      expect(jsonlBlocks.length).toBeGreaterThanOrEqual(2);

      for (const block of jsonlBlocks) {
        const rawLines = block.split('\n').map(line => line.trim());
        for (const rawLine of rawLines) {
          expect(rawLine).toBe(JSON.stringify(JSON.parse(rawLine)));
        }

        const blockMessages = rawLines.map(line => JSON.parse(line));
        const createMsg = blockMessages.find(m => m.createSurface);
        const updateCompMsg = blockMessages.find(m => m.updateComponents);
        const updateDataMsg = blockMessages.find(m => m.updateDataModel);
        expect(createMsg).toBeDefined();
        expect(updateCompMsg).toBeDefined();
        expect(updateDataMsg).toBeDefined();

        const surfaceId = createMsg.createSurface.surfaceId;
        expect(updateCompMsg.updateComponents.surfaceId).toBe(surfaceId);
        expect(updateDataMsg.updateDataModel.surfaceId).toBe(surfaceId);

        const components: Array<{
          id: string;
          child?: string;
          children?: string[] | {componentId?: string};
        }> = updateCompMsg.updateComponents.components;
        const componentIds = new Set(components.map(c => c.id));
        expect(componentIds.has('root')).toBe(true);

        for (const comp of components) {
          if (typeof comp.child === 'string') {
            expect(componentIds.has(comp.child)).toBe(true);
          }
          if (Array.isArray(comp.children)) {
            for (const childId of comp.children) {
              expect(componentIds.has(childId)).toBe(true);
            }
          } else if (comp.children && typeof comp.children.componentId === 'string') {
            expect(componentIds.has(comp.children.componentId)).toBe(true);
          }
        }
      }

      const parsedLines = jsonlBlocks
        .flatMap(block => block.split('\n'))
        .map(line => JSON.parse(line.trim()));

      expect(parsedLines.some(msg => msg.version === 'v0.9' && msg.createSurface)).toBe(true);
      expect(parsedLines.some(msg => msg.version === 'v0.9' && msg.updateComponents)).toBe(true);
      expect(parsedLines.some(msg => msg.version === 'v0.9' && msg.updateDataModel)).toBe(true);

      const serializedExamples = JSON.stringify(parsedLines);
      // JSON Pointer data binding
      expect(serializedExamples).toContain('"path":"/');
      // Button event action with context binding
      expect(serializedExamples).toContain(
        '"action":{"event":{"name":"submitForm","context":{"name":{"path":"/name"}}}}',
      );
      // Dynamic list template
      expect(serializedExamples).toContain(
        '"children":{"componentId":"item_template","path":"/items"}',
      );
    });

    it("writes the active catalog's ID into every example", () => {
      // A renderer rejects a createSurface for any catalog but its own, and models
      // copy the examples' catalogId.
      const slackCatalogId = 'https://a2ui-project.github.io/composer/catalogs/slack/v1';
      catalogSpy.activeCatalog.mockReturnValue({catalogId: slackCatalogId, components: {}});

      const examples = service.systemPrompt().match(/## Examples([\s\S]*?)## Data Binding/)![1];

      expect(Array.from(examples.matchAll(/"catalogId":"([^"]*)"/g), match => match[1])).toEqual([
        slackCatalogId,
        slackCatalogId,
      ]);
    });
  });
});
