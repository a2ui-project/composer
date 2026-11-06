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
import {describe, it, expect, vi} from 'vitest';
import {
  parseAndHealJsonLines,
  isRenderA2uiItem,
  runCatalogComponentSchemaCheck,
  sanitizeComponentObject,
  getPayloadStrategy,
  A2uiPayloadParser,
} from './a2ui-payload-parser';
import {attemptSyntaxHealing} from './json-stream-healer';
import {A2uiComponentInstance} from 'a2ui-bridge';

describe('a2ui-payload-parser', () => {
  describe('attemptSyntaxHealing', () => {
    it('heals trailing commas', () => {
      const result = attemptSyntaxHealing('{"a":[1,]}') as unknown;
      expect((result as Record<string, unknown>)['a']).toEqual([1]);
    });

    it('heals missing braces', () => {
      const result = attemptSyntaxHealing('{"a": {"b": 1') as unknown;
      expect(((result as Record<string, unknown>)['a'] as Record<string, unknown>)['b']).toBe(1);
    });

    it('returns null if unable to heal', () => {
      expect(attemptSyntaxHealing('unhealable {')).toBeNull();
    });

    it('returns null when input exceeds 256KB', () => {
      const hugeInput = '{"a": ' + 'x'.repeat(256 * 1024 + 1);
      expect(attemptSyntaxHealing(hugeInput)).toBeNull();
    });

    it('heals arrays nested in objects and objects nested in arrays', () => {
      const objInArr = attemptSyntaxHealing('[{"a": 1');
      expect(objInArr).toEqual([{a: 1}]);

      const arrInObj = attemptSyntaxHealing('{"a": [1, 2');
      expect(arrInObj).toEqual({a: [1, 2]});
    });

    it('returns null when input is null or undefined', () => {
      expect(attemptSyntaxHealing(null)).toBeNull();
      expect(attemptSyntaxHealing(undefined)).toBeNull();
    });

    it('returns null for empty line', () => {
      expect(attemptSyntaxHealing('')).toBeNull();
      expect(attemptSyntaxHealing('   ')).toBeNull();
      expect(attemptSyntaxHealing('\t\n ')).toBeNull();
    });
  });

  describe('parseAndHealJsonLines', () => {
    it('returns conversational result when input is null or undefined', () => {
      expect(parseAndHealJsonLines(null)).toEqual({
        success: true,
        isConversational: true,
        blocks: [],
        count: 0,
      });
      expect(parseAndHealJsonLines(undefined)).toEqual({
        success: true,
        isConversational: true,
        blocks: [],
        count: 0,
      });
    });

    it('returns conversational result for empty content', () => {
      expect(parseAndHealJsonLines('')).toEqual({
        success: true,
        isConversational: true,
        blocks: [],
        count: 0,
      });
      expect(parseAndHealJsonLines('   ')).toEqual({
        success: true,
        isConversational: true,
        blocks: [],
        count: 0,
      });
      expect(parseAndHealJsonLines('\n\t\n')).toEqual({
        success: true,
        isConversational: true,
        blocks: [],
        count: 0,
      });
    });

    it('parses single-line JSON arrays', () => {
      const result = parseAndHealJsonLines('[{"a": 1}, {"b": 2}]') as {
        blocks: unknown[];
        success: boolean;
      };
      expect(result.blocks).toEqual([{a: 1}, {b: 2}]);
      expect(result.success).toBe(true);
    });

    it('parses valid multi-line JSON', () => {
      const payload = `
      {
        "a": 1
      }
      `;
      const result = parseAndHealJsonLines(payload) as {blocks: unknown[]; success: boolean};
      expect(result.blocks).toEqual([{a: 1}]);
      expect(result.success).toBe(true);
    });

    it('parses valid json array', () => {
      const result = parseAndHealJsonLines('[{"a": 1}]') as {blocks: unknown[]; success: boolean};
      expect(result.blocks).toEqual([{a: 1}]);
      expect(result.success).toBe(true);
    });

    it('heals truncated or malformed JSON lines', () => {
      const result = parseAndHealJsonLines('{"a": 1\n{"b": 2') as {
        blocks: unknown[];
        success: boolean;
      };
      expect(result.blocks).toEqual([{a: 1}, {b: 2}]);
      expect(result.success).toBe(true);
    });

    it('returns failure securely when unhealable', () => {
      expect(parseAndHealJsonLines('{"version": "v0.9" unhealable').success).toBe(false);
    });

    it('reports 1-indexed line number of failing line in multi-line payload', () => {
      const payload = `some explanatory markdown header

{"broken": [1, 2, invalid]}`;
      const result = parseAndHealJsonLines(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.line).toBe(3);
        expect(result.snippet).toBe('{"broken": [1, 2, invalid]}');
      }
    });

    it('counts components in JSON array of commands', () => {
      const payload = '[{"createSurface": {}}, {"updateComponents": {"components": [{}, {}]}}]';
      const parsed = parseAndHealJsonLines(payload);
      expect(parsed?.success).toBe(true);
      if (parsed.success && !parsed.isConversational) {
        expect(parsed.count).toBe(3);
      }
    });

    it('counts components in multi-line JSONL commands', () => {
      const payload = '{"createSurface": {}}\n{"updateComponents": {"components": [{}]}}';
      const parsed = parseAndHealJsonLines(payload);
      expect(parsed?.success).toBe(true);
      if (parsed.success && !parsed.isConversational) {
        expect(parsed.count).toBe(2);
      }
    });

    it('returns 0 for non-layout text', () => {
      const parsed = parseAndHealJsonLines('invalid text');
      expect(parsed).toMatchObject({success: true, count: 0});
    });

    it('ignores single-line parse failures in multi-line JSONL and counts valid lines', () => {
      const payload =
        '{"createSurface": {}}\n{corrupted\n{"updateComponents": {"components": [{}, {}]}}';
      const parsed = parseAndHealJsonLines(payload);
      expect(parsed?.success).toBe(true);
      if (parsed.success && !parsed.isConversational) {
        expect(parsed.count).toBe(3);
      }
    });

    it('treats conversational text mentioning version or createSurface as conversational', () => {
      const conversationalText =
        'Here is an explanation: the "version" and "createSurface" directives control UI.';
      const result = parseAndHealJsonLines(conversationalText);
      expect(result.success).toBe(true);
      if (result.success && result.isConversational) {
        expect(result.blocks).toEqual([]);
        expect(result.count).toBe(0);
      }
    });

    it('extracts column information when syntax error occurs on single line', () => {
      const originalParse = JSON.parse;
      const parseSpy = vi.spyOn(JSON, 'parse').mockImplementation((text, reviver) => {
        if (typeof text === 'string' && text.includes('invalid_column_test')) {
          throw new SyntaxError('Unexpected token at line 1 column 24');
        }
        return originalParse(text, reviver);
      });

      try {
        const result = parseAndHealJsonLines('{"invalid_column_test": ');
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.column).toBe(24);
          expect(result.line).toBe(1);
        }
      } finally {
        parseSpy.mockRestore();
      }
    });
  });

  describe('isRenderA2uiItem', () => {
    it('validates proper RenderA2uiItem', () => {
      expect(isRenderA2uiItem({updateComponents: {components: []}})).toBe(true);
    });

    it('returns false for invalid objects', () => {
      expect(isRenderA2uiItem({})).toBe(false);
      expect(isRenderA2uiItem({updateComponents: {}})).toBe(false);
      expect(isRenderA2uiItem(null)).toBe(false);
    });
  });

  describe('runCatalogComponentSchemaCheck', () => {
    it('heals misnamed component and maps legacy features', () => {
      const blocks = [
        {
          updateComponents: {
            components: [{name: 'TextBox'} as unknown],
          },
        },
      ];
      const componentCatalog = {TextField: {}};
      const healed = runCatalogComponentSchemaCheck(blocks, componentCatalog);

      expect(healed).toBe(true);
      expect(
        (blocks[0].updateComponents.components[0] as unknown as Record<string, unknown>)[
          'component'
        ],
      ).toBe('TextField');
    });

    it('throws on unregistered component', () => {
      const blocks = [
        {
          updateComponents: {
            components: [{component: 'DoesNotExist'} as A2uiComponentInstance],
          },
        },
      ];

      const componentCatalog = {TextField: {}};
      expect(() => runCatalogComponentSchemaCheck(blocks, componentCatalog)).toThrowError(
        /not registered/,
      );
    });
  });

  describe('sanitizeComponentObject', () => {
    it('strips prototype pollution keys from payload', () => {
      const payloadString =
        '{"component":"TextField","__proto__":{"polluted":"yes"},"constructor":{"name":"Function"},"prototype":{"test":true},"valid":"baz","nested":{"__proto__":{"evil":true},"nestedValid":"qux"}}';
      const obj = JSON.parse(payloadString);
      const sanitized = sanitizeComponentObject(obj as A2uiComponentInstance) as Record<
        string,
        unknown
      >;

      expect(sanitized['valid']).toBe('baz');
      expect(Object.keys(sanitized)).not.toContain('__proto__');
      expect(Object.keys(sanitized)).not.toContain('constructor');
      expect(Object.keys(sanitized)).not.toContain('prototype');
      const nestedObj = sanitized['nested'] as Record<string, unknown>;
      expect(nestedObj['nestedValid']).toBe('qux');
      expect(Object.keys(nestedObj)).not.toContain('__proto__');
    });
  });

  describe('protocol strategy delegation', () => {
    it('parses and counts v1.0 payload with inline createSurface.components', () => {
      const payload = JSON.stringify([
        {
          createSurface: {
            surfaceId: 's1',
            components: [
              {component: 'Text', id: 't1'},
              {component: 'Button', id: 'b1'},
            ],
          },
        },
      ]);

      const result = parseAndHealJsonLines(payload, 'v1.0');
      expect(result.success).toBe(true);
      if (result.success && !result.isConversational) {
        expect(result.count).toBe(2);
        expect((result.blocks[0] as Record<string, unknown>)['version']).toBe('1.0');
      }
    });

    it('heals createSurface components when using v1.0 strategy in runCatalogComponentSchemaCheck', () => {
      const blocks = [
        {
          createSurface: {
            surfaceId: 's1',
            components: [{name: 'TextBox', id: 't1'}],
          },
        },
      ];

      const healed = runCatalogComponentSchemaCheck(blocks, {TextField: {}}, 'v1.0');
      expect(healed).toBe(true);
      const comps = (blocks[0] as {createSurface: {components: Array<Record<string, unknown>>}})
        .createSurface.components;
      expect(comps[0]['component']).toBe('TextField');
    });

    it('resolves strategies via getPayloadStrategy and A2uiPayloadParser', () => {
      const v09 = getPayloadStrategy('v0.9');
      const v10 = getPayloadStrategy('v1.0');
      expect(v09.version).toBe('v0.9');
      expect(v10.version).toBe('v1.0');
      expect(A2uiPayloadParser.getStrategy('v1.0').canonicalWireVersion).toBe('1.0');
    });

    it('auto-detects v1.0 vs v0.9 when strategyOrVersion is omitted', () => {
      const v1Payload = JSON.stringify([
        {
          version: '1.0',
          createSurface: {
            surfaceId: 's1',
            components: [{component: 'Text', id: 't1'}],
          },
        },
      ]);
      const v1Result = parseAndHealJsonLines(v1Payload);
      expect(v1Result.success).toBe(true);
      if (v1Result.success && !v1Result.isConversational) {
        expect(v1Result.count).toBe(1);
        expect((v1Result.blocks[0] as Record<string, unknown>)['version']).toBe('1.0');
      }

      const v09Payload = JSON.stringify([
        {version: 'v0.9', createSurface: {surfaceId: 's1'}},
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [{component: 'Text', id: 't1'}],
          },
        },
      ]);
      const v09Result = parseAndHealJsonLines(v09Payload);
      expect(v09Result.success).toBe(true);
      if (v09Result.success && !v09Result.isConversational) {
        expect(v09Result.count).toBe(2);
        expect((v09Result.blocks[0] as Record<string, unknown>)['version']).toBe('v0.9');
      }
    });
  });
});
