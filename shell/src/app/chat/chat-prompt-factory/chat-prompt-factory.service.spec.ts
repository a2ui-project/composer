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

  it('makes Slack-like catalog prompts forbid invalid icon and SVG fallbacks', () => {
    catalogSpy.activeCatalog.mockReturnValue({
      catalogId: 'https://a2ui-project.github.io/composer/catalogs/slack/v1',
      components: {
        Text: {properties: {component: {const: 'Text'}, text: {type: 'string'}}},
        Image: {
          properties: {
            component: {const: 'Image'},
            url: {
              type: 'string',
              description: 'The HTTP(S) URL of the image to display in Slack.',
            },
          },
        },
        Column: {properties: {component: {const: 'Column'}, children: {type: 'array'}}},
        Button: {properties: {component: {const: 'Button'}, child: {type: 'string'}}},
      },
    });

    const prompt = service.systemPrompt();

    expect(prompt).toContain('Do NOT invent Icon');
    expect(prompt).toContain('data:image/svg+xml fallbacks');
    expect(prompt).toContain('For Image.url, use only HTTP(S) URLs');
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

    const prompt = service.systemPrompt();

    expect(prompt).toContain('Use Icon components only');
    expect(prompt).toContain('leading text/icons');
    expect(prompt).toContain('trailing downward icon');
    expect(prompt).toContain('search icon');
    expect(prompt).toContain('exact icon names/SVGs');
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
});
