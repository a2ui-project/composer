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
import {V09PayloadStrategy} from './v0-9-payload-strategy';

describe('V09PayloadStrategy', () => {
  const strategy = new V09PayloadStrategy();

  it('exposes v0.9 version identifiers', () => {
    expect(strategy.version).toBe('v0.9');
    expect(strategy.canonicalWireVersion).toBe('v0.9');
  });

  describe('resolveComponentCount', () => {
    it('counts components from updateComponents and adds 1 for createSurface', () => {
      const blocks = [
        {createSurface: {surfaceId: 's1', catalogId: 'cat1'}},
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{component: 'Text'}, {component: 'Button'}],
          },
        },
      ];
      expect(strategy.resolveComponentCount(blocks)).toBe(3);
    });

    it('returns 0 for empty or non-command blocks', () => {
      expect(strategy.resolveComponentCount([])).toBe(0);
      expect(strategy.resolveComponentCount([{someKey: 'value'}])).toBe(0);
    });
  });

  describe('normalizeBlocks', () => {
    it('normalizes missing or 0.9 version to v0.9 for A2UI envelopes', () => {
      const blocks = [
        {createSurface: {surfaceId: 's1', catalogId: 'c1'}},
        {version: '0.9', updateComponents: {surfaceId: 's1', components: []}},
      ];
      const normalized = strategy.normalizeBlocks(blocks) as Array<Record<string, unknown>>;
      expect(normalized[0]['version']).toBe('v0.9');
      expect(normalized[1]['version']).toBe('v0.9');
    });

    it('preserves invalid version strings so schema validation fails', () => {
      const blocks = [{version: 'v0.8', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
      const normalized = strategy.normalizeBlocks(blocks) as Array<Record<string, unknown>>;
      expect(normalized[0]['version']).toBe('v0.8');
    });

    it('strips prototype pollution recursively from blocks', () => {
      const polluted = JSON.parse(
        '{"createSurface":{"surfaceId":"s1","catalogId":"c1"},"__proto__":{"admin":true},"constructor":{"x":1}}',
      );
      const cleaned = strategy.normalizeBlocks([polluted]) as Array<Record<string, unknown>>;
      expect(Object.keys(cleaned[0])).not.toContain('__proto__');
      expect(Object.keys(cleaned[0])).not.toContain('constructor');
    });

    it('leaves non-A2UI objects untouched', () => {
      const nonA2ui = [{foo: 'bar'}];
      const result = strategy.normalizeBlocks(nonA2ui) as Array<Record<string, unknown>>;
      expect(result[0]['foo']).toBe('bar');
      expect(result[0]['version']).toBeUndefined();
    });
  });

  describe('runCatalogComponentSchemaCheck', () => {
    it('heals casing and synonym in updateComponents.components', () => {
      const blocks = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{name: 'TextBox'}],
          },
        },
      ];
      const catalog = {TextField: {}};
      const healed = strategy.runCatalogComponentSchemaCheck(blocks, catalog);

      expect(healed).toBe(true);
      const comp = (blocks[0] as {updateComponents: {components: Array<Record<string, unknown>>}})
        .updateComponents.components[0];
      expect(comp['component']).toBe('TextField');
      expect(comp['name']).toBeUndefined();
    });

    it('throws error when component is unregistered in catalog', () => {
      const blocks = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{component: 'UnknownWidget'}],
          },
        },
      ];
      expect(() => strategy.runCatalogComponentSchemaCheck(blocks, {TextField: {}})).toThrow(
        /not registered in the active custom catalog/,
      );
    });
  });

  describe('validateOutgoingBlocks', () => {
    it('validates correct v0.9 envelope messages', () => {
      const blocks = [
        {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'basic'}},
        {version: 'v0.9', updateComponents: {surfaceId: 's1', components: [{component: 'Text'}]}},
      ];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('rejects createSurface missing catalogId in v0.9', () => {
      const blocks = [{version: 'v0.9', createSurface: {surfaceId: 's1'}}];
      const errors: string[] = [];
      expect(strategy.validateOutgoingBlocks(blocks, errors)).toBe(false);
      expect(errors.some(e => e.includes('catalogId'))).toBe(true);
    });
  });
});
