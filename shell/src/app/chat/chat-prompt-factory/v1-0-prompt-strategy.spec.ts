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

import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {V10PromptStrategy, DEFAULT_V10_MCP_FUNCTIONS_CATALOG_ID} from './v1-0-prompt-strategy';
import {stripReturnTypeDeep} from './prompt-protocol-strategy';

describe('V10PromptStrategy', () => {
  let strategy: V10PromptStrategy;

  const basicUiCatalog = {
    ['$id']: 'https://a2ui.org/specification/v1_0/basic_catalog.json',
    title: 'Basic Catalog',
    components: {
      Column: {type: 'object'},
      Text: {type: 'object'},
      Button: {type: 'object'},
    },
  };

  const mcpFunctionsCatalog = {
    ['$id']: DEFAULT_V10_MCP_FUNCTIONS_CATALOG_ID,
    title: 'MCP Functions Catalog',
    functions: {
      callMcpTool: {type: 'object', returnType: 'any'},
      updateDataModel: {type: 'object', returnType: 'any'},
      jmespath: {type: 'object', returnType: 'any'},
      regexCapture: {type: 'object', returnType: 'any'},
      regexReplace: {type: 'object', returnType: 'any'},
      split: {type: 'object', returnType: 'any'},
    },
  };

  const sampleActiveServers = [
    {
      id: 'srv-1',
      url: 'http://localhost:3001/mcp',
      enabled: true,
      status: 'connected' as const,
      tools: [
        {
          name: 'query_db',
          description: 'Queries database',
          inputSchema: {type: 'object', properties: {sql: {type: 'string'}}},
          outputSchema: {type: 'object', properties: {rows: {type: 'array'}}},
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [V10PromptStrategy],
    });
    strategy = TestBed.inject(V10PromptStrategy);
  });

  it('has protocolVersion set to v1.0', () => {
    expect(strategy.protocolVersion).toBe('v1.0');
  });

  it('generates fallback prompt when no active catalog is provided without v0.9 or returnType bleed', () => {
    const prompt = strategy.buildSystemPrompt({});
    expect(prompt).toContain('A2UI Generation Expert');
    expect(prompt).not.toContain('v0.9');
    expect(prompt).not.toContain('"v0.9"');
    expect(prompt).not.toContain('returnType');
  });

  it('instructs canonical wire "version": "1.0" without leading v', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: basicUiCatalog,
    });
    expect(prompt).toContain('"version": "1.0"');
    expect(prompt).not.toContain('"version": "v1.0"');
    expect(prompt).not.toContain('"version": "v0.9"');
  });

  it('instructs single-message createSurface for new surfaces with inline components, dataModel, and sendDataModel: true', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: basicUiCatalog,
    });
    expect(prompt).toContain('createSurface');
    expect(prompt).toContain('"sendDataModel": true');
    expect(prompt).toContain('"components": [');
    expect(prompt).toContain('"dataModel": {');
    expect(prompt).toContain(basicUiCatalog['$id']);
  });

  it('instructs incremental editing with updateComponents, updateDataModel, deleteSurface, and callRendererFunction', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: basicUiCatalog,
    });
    expect(prompt).toContain('updateComponents');
    expect(prompt).toContain('updateDataModel');
    expect(prompt).toContain('deleteSurface');
    expect(prompt).toContain('callRendererFunction');
    expect(prompt).toContain('functionCallId');
    expect(prompt).toContain('callFunction');
  });

  it('explicitly instructs Markdown # through ##### headings inside Text.text instead of h1-h5 variants', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: basicUiCatalog,
      includeMultimodalGuidelines: true,
    });
    expect(prompt).toContain('Markdown `#` through `#####`');
    expect(prompt).toContain('Text.text');
    expect(prompt).not.toContain('"h1" | "h2" | "h3"');
  });

  it('uses @path for data bindings and @call for function calls', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: basicUiCatalog,
    });
    expect(prompt).toContain('{"@path":');
    expect(prompt).toContain('{"@call":');
    expect(prompt).not.toContain('{"path":"/name"}');
    expect(prompt).not.toContain('"call":');
  });

  it('serializes single activeCatalog into JSON format without returnType', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: basicUiCatalog,
    });
    expect(prompt).toContain(basicUiCatalog['$id']);
    expect(prompt).toContain('"Column"');
    expect(prompt).not.toContain('returnType');
  });

  it('formats multi-catalog schemas and instructs cross-catalog catalogId stamping', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalogs: [basicUiCatalog, mcpFunctionsCatalog],
    });
    expect(prompt).toContain(basicUiCatalog['$id']);
    expect(prompt).toContain(mcpFunctionsCatalog['$id']);
    expect(prompt).toContain('The primary UI catalog is');
    expect(prompt).toContain('catalogId');
  });

  it('generates MCP instructions with FunctionCall-wrapped action, @call, @path, and explicit catalogId stamping on cross-catalog MCP calls', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalogs: [basicUiCatalog, mcpFunctionsCatalog],
      activeServers: sampleActiveServers,
    });
    expect(prompt).toContain('Available MCP Tools & Catalog Instructions');
    expect(prompt).toContain('query_db');
    expect(prompt).toContain('"functionCall": {');
    expect(prompt).toContain('"@call": "updateDataModel"');
    expect(prompt).toContain('"@call": "jmespath"');
    expect(prompt).toContain('"@call": "callMcpTool"');
    expect(prompt).toContain('"@path": "/mcp_arguments"');
    expect(prompt).toContain(`"catalogId": "${DEFAULT_V10_MCP_FUNCTIONS_CATALOG_ID}"`);
  });

  it('embeds canonical v1.0 common_types.json schema and valid v1.0 Basic catalog few-shot JSONL examples', () => {
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: {components: {Column: {}, Text: {}, TextField: {}, Button: {}}},
    });
    expect(prompt).toContain('https://a2ui.org/specification/v1_0/common_types.json');
    expect(prompt).not.toContain('v0_9');
    expect(prompt).toContain('https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json');

    const examplesMatch = prompt.match(/## Examples([\s\S]*?)## Data Binding/);
    expect(examplesMatch).not.toBeNull();
    const jsonlBlocks = Array.from(examplesMatch![1].matchAll(/```jsonl\n([\s\S]*?)```/g)).map(m =>
      m[1].trim(),
    );
    expect(jsonlBlocks.length).toBeGreaterThanOrEqual(2);
    const parsed = jsonlBlocks.flatMap(b => b.split('\n').map(line => JSON.parse(line.trim())));
    const newSurface = parsed.find(m => m.createSurface?.surfaceId === 'main');
    expect(newSurface).toBeDefined();
    const comps = newSurface.createSurface.components as Array<Record<string, unknown>>;
    expect(comps.some(c => c['component'] === 'Input')).toBe(false);
    expect(comps.some(c => c['component'] === 'TextField')).toBe(true);
    const btn = comps.find(c => c['component'] === 'Button');
    expect(btn).toBeDefined();
    expect(btn?.['child']).toBe('btn_text');
    expect((btn?.['action'] as Record<string, unknown>)?.['event']).toEqual({
      name: 'submitForm',
      context: {name: {'@path': '/name'}},
    });
  });

  describe('strict zero-bleed guarantees', () => {
    it('guarantees zero returnType and zero v0.9 bleed without MCP tools', () => {
      const prompt = strategy.buildSystemPrompt({
        activeCatalogs: [basicUiCatalog, mcpFunctionsCatalog],
        includeMultimodalGuidelines: true,
        customInstructions: 'Custom rule.',
      });
      expect(prompt).not.toContain('returnType');
      expect(prompt).not.toContain('v0.9');
      expect(prompt).not.toContain('"v0.9"');
    });

    it('guarantees zero returnType and zero v0.9 bleed with active MCP tools', () => {
      const prompt = strategy.buildSystemPrompt({
        activeCatalogs: [basicUiCatalog, mcpFunctionsCatalog],
        activeServers: sampleActiveServers,
        includeMultimodalGuidelines: true,
        customInstructions: 'Custom rule with MCP.',
      });
      expect(prompt).not.toContain('returnType');
      expect(prompt).not.toContain('v0.9');
      expect(prompt).not.toContain('"v0.9"');
    });

    it('strips prototype-pollution keys (__proto__, constructor, prototype) from schemas and objects', () => {
      const maliciousPayload = JSON.parse(
        '{"title":"Safe","returnType":"void","__proto__":{"polluted":"yes"},"constructor":{"evil":true},"nested":{"prototype":{"bad":123},"valid":1}}',
      );
      const sanitized = stripReturnTypeDeep(maliciousPayload) as Record<string, unknown>;
      expect(sanitized['title']).toBe('Safe');
      expect(Object.prototype.hasOwnProperty.call(sanitized, 'returnType')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sanitized, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(sanitized, 'constructor')).toBe(false);
      expect(sanitized['constructor']).not.toEqual({evil: true});
      expect((sanitized['nested'] as Record<string, unknown>)['valid']).toBe(1);
      expect(
        Object.prototype.hasOwnProperty.call(
          sanitized['nested'] as Record<string, unknown>,
          'prototype',
        ),
      ).toBe(false);
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });

    it('strips prototype pollution keys when serializing catalog for prompt', () => {
      const maliciousCatalog = JSON.parse(
        '{"$id":"https://a2ui.org/catalogs/test.json","components":{"Text":{"type":"object"}},"__proto__":{"polluted":true},"returnType":"void"}',
      );
      const serialized = strategy.serializeCatalogForPrompt(maliciousCatalog);
      expect(serialized).not.toContain('polluted');
      expect(serialized).not.toContain('returnType');
    });
  });

  describe('catalog-gated guidance and quoting', () => {
    it('quotes catalog IDs safely preventing injection or escape', () => {
      const injectionCatalog = {
        ['$id']: 'https://a2ui.org/`malicious`_catalog.json',
        components: {Column: {type: 'object'}},
      };
      const prompt = strategy.buildSystemPrompt({
        activeCatalog: injectionCatalog,
      });
      expect(prompt).toContain('"https://a2ui.org/\\u0060malicious\\u0060_catalog.json"');
      expect(prompt).not.toContain('`https://a2ui.org/`');
    });

    it('emits IconSupport.NONE guidance when catalog has no Icon component', () => {
      const prompt = strategy.buildSystemPrompt({
        activeCatalog: basicUiCatalog, // only Column, Text, Button
        includeMultimodalGuidelines: true,
      });
      expect(prompt).toContain('The active catalog does not support custom icon drawing');
      expect(prompt).toContain('Do NOT invent Icon');
    });

    it('emits IconSupport.NAMED guidance when catalog has Icon with enum but no svgPath', () => {
      const namedIconCatalog = {
        ['$id']: 'https://a2ui.org/named_icon.json',
        components: {
          Icon: {
            type: 'object',
            properties: {
              name: {type: 'string', enum: ['star', 'favorite']},
            },
          },
        },
      };
      const prompt = strategy.buildSystemPrompt({
        activeCatalog: namedIconCatalog,
        includeMultimodalGuidelines: true,
      });
      expect(prompt).toContain(
        "Use Icon components only with icon names the active catalog's Icon",
      );
      expect(prompt).toContain('NOT emit svgPath fields');
    });

    it('emits IconSupport.NAMED_AND_CUSTOM_SVG guidance when catalog has svgPath on Icon', () => {
      const svgIconCatalog = {
        ['$id']: 'https://a2ui.org/svg_icon.json',
        components: {
          Icon: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              svgPath: {type: 'string'},
            },
          },
        },
      };
      const prompt = strategy.buildSystemPrompt({
        activeCatalog: svgIconCatalog,
        includeMultimodalGuidelines: true,
      });
      expect(prompt).toContain('Custom SVG fields are allowed only');
      expect(prompt).toContain('when the Icon schema explicitly defines them');
    });

    it('emits imageUrlGuidance when Image component has url pattern rejecting data URLs', () => {
      const imagePatternCatalog = {
        ['$id']: 'https://a2ui.org/image_catalog.json',
        components: {
          Image: {
            type: 'object',
            properties: {
              url: {type: 'string', pattern: '^https://images\\.example\\.com/.*$'},
            },
          },
        },
      };
      const prompt = strategy.buildSystemPrompt({
        activeCatalog: imagePatternCatalog,
      });
      expect(prompt).toContain('4. **Image URLs**: For Image.url, use only URLs matching');
      expect(prompt).toContain('^https://images\\\\.example\\\\.com/.*$');
    });
  });
});
