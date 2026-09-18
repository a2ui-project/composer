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

describe('ChatPromptFactoryService', () => {
  let service: ChatPromptFactoryService;
  let catalogSpy: {
    activeCatalog: ReturnType<typeof vi.fn>;
    activeCatalogSignal: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    catalogSpy = {activeCatalog: vi.fn(), activeCatalogSignal: vi.fn(() => null)};
    TestBed.configureTestingModule({
      providers: [ChatPromptFactoryService, {provide: CatalogManagement, useValue: catalogSpy}],
    });
    service = TestBed.inject(ChatPromptFactoryService);
  });

  it('generate default prompt when no active catalog', () => {
    catalogSpy.activeCatalog.mockReturnValue(null);
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
    expect(service.systemPrompt()).not.toContain('Active Catalog Schema');
  });

  it('generate catalog specific prompt', () => {
    catalogSpy.activeCatalog.mockReturnValue({components: {}});
    expect(service.systemPrompt()).toContain('Active Catalog Schema');
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
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
});
