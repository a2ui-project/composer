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

import {
  parseAndHealJsonLines,
  attemptSyntaxHealing,
  isRenderA2uiItem,
  runCatalogComponentSchemaCheck,
  sanitizeComponentObject,
} from './a2ui-payload-parser';
import {A2uiComponentInstance} from 'a2ui-bridge';

describe('a2ui-payload-parser', () => {
  describe('attemptSyntaxHealing', () => {
    it('heals trailing commas', () => {
      const result = attemptSyntaxHealing('{"a":[1,]}') as unknown;
      expect(result.a).toEqual([1]);
    });

    it('heals missing braces', () => {
      const result = attemptSyntaxHealing('{"a": {"b": 1') as unknown;
      expect(result.a.b).toBe(1);
    });

    it('returns null if unable to heal', () => {
      expect(attemptSyntaxHealing('unhealable {')).toBeNull();
    });

    it('returns null for nullish or empty line', () => {
      expect(attemptSyntaxHealing(null)).toBeNull();
      expect(attemptSyntaxHealing(undefined)).toBeNull();
      expect(attemptSyntaxHealing('')).toBeNull();
      expect(attemptSyntaxHealing('   ')).toBeNull();
      expect(attemptSyntaxHealing('\t\n ')).toBeNull();
    });
  });

  describe('parseAndHealJsonLines', () => {
    it('returns empty blocks and wasHealed false for nullish or empty content', () => {
      // @ts-expect-error - testing nullish input
      expect(parseAndHealJsonLines(null)).toEqual({blocks: [], wasHealed: false});
      // @ts-expect-error - testing undefined input
      expect(parseAndHealJsonLines(undefined)).toEqual({blocks: [], wasHealed: false});
      expect(parseAndHealJsonLines('')).toEqual({blocks: [], wasHealed: false});
      expect(parseAndHealJsonLines('   ')).toEqual({blocks: [], wasHealed: false});
      expect(parseAndHealJsonLines('\n\t\n')).toEqual({blocks: [], wasHealed: false});
    });

    it('parses single-line JSON arrays', () => {
      const result = parseAndHealJsonLines('[{"a": 1}, {"b": 2}]');
      expect(result.blocks).toEqual([{a: 1}, {b: 2}]);
      expect(result.wasHealed).toBe(false);
    });

    it('parses valid multi-line JSON', () => {
      const payload = `
      {
        "a": 1
      }
      `;
      const result = parseAndHealJsonLines(payload);
      // Depending on implementation, it might parse as single large block or error out if not JSONLines
      expect(result.blocks).toEqual([{a: 1}]);
      expect(result.wasHealed).toBe(false);
    });

    it('parses valid json array', () => {
      const result = parseAndHealJsonLines('[{"a": 1}]');
      expect(result.blocks).toEqual([{a: 1}]);
      expect(result.wasHealed).toBe(false);
    });

    it('heals truncated or malformed JSON lines', () => {
      // Missing braces and such
      const result = parseAndHealJsonLines('{"a": 1\n{"b": 2');
      expect(result.blocks).toEqual([{a: 1}, {b: 2}]);
      expect(result.wasHealed).toBe(true);
    });

    it('throws when unhealable', () => {
      expect(() => parseAndHealJsonLines('{"version": "v0.9" unhealable')).toThrowError(
        /Syntax recovery failed/,
      );
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
      expect((blocks[0].updateComponents.components[0] as unknown).component).toBe('TextField');
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
});
