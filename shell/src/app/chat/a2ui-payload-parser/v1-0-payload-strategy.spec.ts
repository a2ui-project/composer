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
import {V10PayloadStrategy} from './v1-0-payload-strategy';

describe('V10PayloadStrategy', () => {
  const strategy = new V10PayloadStrategy();

  it('exposes v1.0 version and canonical wire version "1.0"', () => {
    expect(strategy.version).toBe('v1.0');
    expect(strategy.canonicalWireVersion).toBe('1.0');
  });

  describe('resolveComponentCount', () => {
    it('counts components inline in createSurface.components', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            components: [{component: 'Text'}, {component: 'Button'}, {component: 'Card'}],
          },
        },
      ];
      expect(strategy.resolveComponentCount(blocks)).toBe(3);
    });

    it('counts components across both createSurface.components and updateComponents.components', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            components: [{component: 'Text'}],
          },
        },
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{component: 'Button'}, {component: 'Card'}],
          },
        },
      ];
      expect(strategy.resolveComponentCount(blocks)).toBe(3);
    });

    it('counts createSurface without inline components as 1', () => {
      const blocks = [
        {createSurface: {surfaceId: 's1'}},
        {updateComponents: {surfaceId: 's1', components: [{component: 'Text'}]}},
      ];
      expect(strategy.resolveComponentCount(blocks)).toBe(2);
    });
  });

  describe('normalizeBlocks', () => {
    it('normalizes omitted version to canonical wire version "1.0" while preserving raw explicit "v1.0"', () => {
      const blocks = [
        {version: 'v1.0', createSurface: {surfaceId: 's1', catalogId: 'c1', components: []}},
        {createSurface: {surfaceId: 's2'}},
        {version: '1.0', updateComponents: {surfaceId: 's1', components: []}},
        {callRendererFunction: {functionCallId: 'call-1', callFunction: {call: 'func'}}},
        {agentFunctionResponse: {callId: 'call-2', response: {ok: true}}},
      ];
      const normalized = strategy.normalizeBlocks(blocks) as Array<Record<string, unknown>>;
      expect(normalized[0]['version']).toBe('v1.0');
      expect(normalized[1]['version']).toBe('1.0');
      expect(normalized[2]['version']).toBe('1.0');
      expect(normalized[3]['version']).toBe('1.0');
      expect(normalized[4]['version']).toBe('1.0');
    });

    it('normalizes shorthand callRendererFunction { call, args } into canonical callFunction { "@call", args }', () => {
      const blocks = [
        {
          version: '1.0',
          callRendererFunction: {
            functionCallId: 'f1',
            surfaceId: 's1',
            call: 'submitForm',
            args: {userId: 'u123', count: 42},
            catalogId: 'corp.tools',
          },
        },
      ];

      const normalized = strategy.normalizeBlocks(blocks) as Array<Record<string, unknown>>;
      const crf = normalized[0]['callRendererFunction'] as Record<string, unknown>;

      expect(crf['call']).toBeUndefined();
      expect(crf['args']).toBeUndefined();
      expect(crf['callFunction']).toEqual({
        ['@call']: 'submitForm',
        args: {userId: 'u123', count: 42},
        catalogId: 'corp.tools',
      });
    });

    it('normalizes callRendererFunction.callFunction with { call } to { "@call" }', () => {
      const blocks = [
        {
          version: '1.0',
          callRendererFunction: {
            functionCallId: 'f2',
            callFunction: {
              call: 'doSomething',
              args: {flag: true},
            },
          },
        },
      ];

      const normalized = strategy.normalizeBlocks(blocks) as Array<Record<string, unknown>>;
      const crf = normalized[0]['callRendererFunction'] as Record<string, unknown>;
      const cf = crf['callFunction'] as Record<string, unknown>;

      expect(cf['call']).toBeUndefined();
      expect(cf['@call']).toBe('doSomething');
      expect(cf['args']).toEqual({flag: true});
    });

    it('recursively strips prototype pollution keys across all v1.0 message envelopes', () => {
      const payloadString = JSON.stringify({
        version: '1.0',
        createSurface: {
          surfaceId: 's1',
          catalogId: 'c1',
          __proto__: {polluted: true},
          components: [
            {
              component: 'Text',
              __proto__: {evil: true},
              constructor: {polluted: true},
              prototype: {polluted: true},
              id: 't1',
            },
          ],
          dataModel: {
            user: {name: 'Alice', __proto__: {bad: true}},
          },
        },
        callRendererFunction: {
          surfaceId: 's1',
          functionCallId: 'f1',
          callFunction: {
            call: 'test',
            __proto__: {polluted: true},
          },
        },
      });

      const parsed = [JSON.parse(payloadString)];
      const normalized = strategy.normalizeBlocks(parsed) as Array<Record<string, unknown>>;
      const createMsg = normalized[0]['createSurface'] as Record<string, unknown>;

      expect(Object.keys(createMsg)).not.toContain('__proto__');
      const comp = (createMsg['components'] as Array<Record<string, unknown>>)[0];
      expect(comp['id']).toBe('t1');
      expect(Object.keys(comp)).not.toContain('__proto__');
      expect(Object.keys(comp)).not.toContain('constructor');
      expect(Object.keys(comp)).not.toContain('prototype');

      const dataModel = createMsg['dataModel'] as Record<string, Record<string, unknown>>;
      expect(Object.keys(dataModel['user'])).not.toContain('__proto__');
    });
  });

  describe('runCatalogComponentSchemaCheck', () => {
    it('heals missing createSurface.catalogId from catalog.$id', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            components: [{component: 'Text', id: 't1'}],
          },
        },
      ];

      const catalog = {
        $id: 'https://a2ui.org/catalogs/standard',
        components: {Text: {}},
      };

      const healed = strategy.runCatalogComponentSchemaCheck(blocks, catalog);
      expect(healed).toBe(true);

      const cs = (blocks[0] as {createSurface: Record<string, unknown>}).createSurface;
      expect(cs['catalogId']).toBe('https://a2ui.org/catalogs/standard');
    });

    it('heals missing createSurface.catalogId from catalog.catalogId', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            components: [{component: 'Text', id: 't1'}],
          },
        },
      ];

      const catalog = {
        catalogId: 'my.custom.catalog',
        components: {Text: {}},
      };

      const healed = strategy.runCatalogComponentSchemaCheck(blocks, catalog);
      expect(healed).toBe(true);

      const cs = (blocks[0] as {createSurface: Record<string, unknown>}).createSurface;
      expect(cs['catalogId']).toBe('my.custom.catalog');
    });

    it('heals missing callRendererFunction.callFunction.catalogId from catalog.$id', () => {
      const blocks = [
        {
          callRendererFunction: {
            functionCallId: 'f1',
            callFunction: {
              ['@call']: 'fetchData',
            },
          },
        },
      ];

      const catalog = {
        $id: 'corp.services',
      };

      const healed = strategy.runCatalogComponentSchemaCheck(blocks, catalog);
      expect(healed).toBe(true);

      const crf = (blocks[0] as {callRendererFunction: {callFunction: Record<string, unknown>}})
        .callRendererFunction;
      expect(crf.callFunction['catalogId']).toBe('corp.services');
    });

    it('heals component names and synonyms in createSurface.components', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            catalogId: 'cat-1',
            components: [
              {name: 'TextBox', id: 't1'},
              {component: 'rowlayout', id: 'r1'},
            ],
          },
        },
      ];

      const catalog = {
        TextField: {},
        Row: {},
      };

      const healed = strategy.runCatalogComponentSchemaCheck(blocks, catalog);
      expect(healed).toBe(true);

      const comps = (blocks[0] as {createSurface: {components: Array<Record<string, unknown>>}})
        .createSurface.components;
      expect(comps[0]['component']).toBe('TextField');
      expect(comps[0]['name']).toBeUndefined();
      expect(comps[1]['component']).toBe('Row');
    });

    it('heals component names and synonyms in updateComponents.components', () => {
      const blocks = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{name: 'datepicker', id: 'd1'}],
          },
        },
      ];

      const catalog = {
        DateTimeInput: {},
      };

      const healed = strategy.runCatalogComponentSchemaCheck(blocks, catalog);
      expect(healed).toBe(true);

      const comps = (blocks[0] as {updateComponents: {components: Array<Record<string, unknown>>}})
        .updateComponents.components;
      expect(comps[0]['component']).toBe('DateTimeInput');
    });

    it('throws when component in createSurface.components is unregistered in catalog', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            catalogId: 'cat-1',
            components: [{component: 'UnregisteredComp', id: 'u1'}],
          },
        },
      ];

      expect(() => strategy.runCatalogComponentSchemaCheck(blocks, {TextField: {}})).toThrow(
        /not registered in the active custom catalog/,
      );
    });
  });

  describe('validateOutgoingBlocks', () => {
    it('accepts single-message createSurface with inline components and catalogId without updateComponents', () => {
      const blocks = [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'main-surface',
            catalogId: 'corp.a2ui.catalog',
            components: [{component: 'Text', id: 't1'}],
          },
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('rejects createSurface without catalogId in v1.0', () => {
      const blocks = [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'main-surface',
          },
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(errors.some(e => e.includes('catalogId'))).toBe(true);
    });

    it('accepts callRendererFunction with surfaceId and valid callFunction', () => {
      const blocks = [
        {
          version: '1.0',
          callRendererFunction: {
            surfaceId: 's1',
            functionCallId: 'call-100',
            callFunction: {
              catalogId: 'corp.tools',
              ['@call']: 'fetchData',
              args: {id: '123'},
            },
          },
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(true);
    });

    it('rejects callRendererFunction with missing function details', () => {
      const blocks = [
        {
          version: '1.0',
          callRendererFunction: {
            surfaceId: 's1',
            functionCallId: 'call-100',
          },
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(
        errors.some(e => e.includes('must specify function details via call or callFunction')),
      ).toBe(true);
    });

    it('rejects callRendererFunction with missing surfaceId', () => {
      const blocks = [
        {
          version: '1.0',
          callRendererFunction: {
            functionCallId: 'call-100',
            call: 'fetchData',
          },
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(errors.some(e => e.includes('must contain a non-empty string surfaceId'))).toBe(true);
    });

    it('rejects blocks with invalid version not equal to "1.0"', () => {
      const blocks = [
        {
          version: '0.8',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(errors.some(e => e.includes('1.0') || e.includes('v0.9'))).toBe(true);
    });

    it('rejects explicit raw version "v1.0"', () => {
      const blocks = [
        {
          version: 'v1.0',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(errors.some(e => e.includes('v1.0'))).toBe(true);
    });

    it('rejects callRendererFunction missing required fields', () => {
      const blocks = [
        {
          version: '1.0',
          callRendererFunction: {
            surfaceId: 's1',
          },
        },
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(errors.some(e => e.includes('functionCallId') || e.includes('callFunction'))).toBe(
        true,
      );
    });
  });
});
