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
import {V09DraftStrategy} from './v0-9-draft-strategy';
import {CAR_BOOKING, BASIC_CATALOG_ID_V0_9} from './initial-draft';

describe('V09DraftStrategy', () => {
  let strategy: V09DraftStrategy;

  beforeEach(() => {
    strategy = new V09DraftStrategy();
  });

  it('exposes v0.9 protocol version', () => {
    expect(strategy.version).toBe('v0.9');
  });

  it('returns CAR_BOOKING as starter draft', () => {
    expect(strategy.getStarterDraft()).toBe(CAR_BOOKING);
  });

  it('generates a blank surface draft with createSurface and sendDataModel: true', () => {
    const blank = strategy.getBlankDraft(BASIC_CATALOG_ID_V0_9);
    const parsed = JSON.parse(blank);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].version).toBe('v0.9');
    expect(parsed[0].createSurface.catalogId).toBe(BASIC_CATALOG_ID_V0_9);
    expect(parsed[0].createSurface.surfaceId).toBe('sample-surface');
    expect(parsed[0].createSurface.sendDataModel).toBe(true);
  });

  it('correctly identifies starter draft', () => {
    expect(strategy.isStarterDraft(CAR_BOOKING)).toBe(true);
    expect(strategy.isStarterDraft('  ' + CAR_BOOKING + '\n  ')).toBe(true);
    expect(strategy.isStarterDraft('[]')).toBe(false);
    expect(strategy.isStarterDraft('{"foo": "bar"}')).toBe(false);
    expect(strategy.isStarterDraft('')).toBe(false);
  });

  it('correctly identifies blank draft', () => {
    const blank = strategy.getBlankDraft('https://example.com/catalog.json');
    expect(strategy.isBlankDraft(blank)).toBe(true);
    expect(strategy.isBlankDraft(CAR_BOOKING)).toBe(false);
    expect(strategy.isBlankDraft('[]')).toBe(false);
    expect(strategy.isBlankDraft('invalid json')).toBe(false);
  });

  describe('sanitizeLayout', () => {
    it('strips blocks with registerMockRules or mockRulesConfig', () => {
      const payload = JSON.stringify([
        {version: 'v0.9', registerMockRules: {rules: []}},
        {version: 'v0.9', mockRulesConfig: {active: true}},
        {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}},
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      const parsed = JSON.parse(sanitized);
      expect(parsed.length).toBe(1);
      expect(parsed[0].createSurface.surfaceId).toBe('s1');
    });

    it('filters out mock_rules_container and strips mock/rules properties from components', () => {
      const payload = JSON.stringify([
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'root',
                component: 'Column',
                children: ['comp1', 'mock_rules_container'],
                rules: [{rule: 'test'}],
                mockProperty: 'stripMe',
              },
              {
                id: 'mock_rules_container',
                component: 'Column',
                children: [],
              },
              {
                id: 'comp1',
                component: 'Text',
                text: 'Hello',
              },
            ],
          },
        },
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      const parsed = JSON.parse(sanitized);
      const components = parsed[0].updateComponents.components;
      expect(components.length).toBe(2);
      expect(components.find((c: {id: string}) => c.id === 'mock_rules_container')).toBeUndefined();
      const root = components.find((c: {id: string}) => c.id === 'root');
      expect(root.children).toEqual(['comp1']);
      expect(root.rules).toBeUndefined();
      expect(root.mockProperty).toBeUndefined();
    });

    it('strips __proto__, constructor, and prototype from components and data models', () => {
      const payload = JSON.stringify([
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'c1',
                component: 'Text',
                text: 'Safe',
                __proto__: {polluted: true},
                constructor: {polluted: true},
                prototype: {polluted: true},
              },
            ],
          },
        },
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 's1',
            path: '/',
            value: {
              safeKey: 'ok',
              __proto__: {admin: true},
              constructor: {admin: true},
            },
          },
        },
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      expect(sanitized).not.toContain('__proto__');
      expect(sanitized).not.toContain('"constructor"');
      expect(sanitized).not.toContain('"prototype"');
      const parsed = JSON.parse(sanitized);
      expect(parsed[0].updateComponents.components[0].id).toBe('c1');
      expect(parsed[1].updateDataModel.value.safeKey).toBe('ok');
    });

    it('returns empty string for invalid json', () => {
      expect(strategy.sanitizeLayout('not valid json')).toBe('');
      expect(strategy.sanitizeLayout('{}')).toBe('');
      expect(strategy.sanitizeLayout('   ')).toBe('');
    });
  });
});
