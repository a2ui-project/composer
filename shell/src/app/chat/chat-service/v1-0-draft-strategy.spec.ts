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
import {V10DraftStrategy} from './v1-0-draft-strategy';
import {V09DraftStrategy} from './v0-9-draft-strategy';
import {CAR_BOOKING, CAR_BOOKING_V1_0, BASIC_CATALOG_ID_V1_0} from './initial-draft';
import {isUntouchedStarterDraft, isUntouchedBlankDraft} from './draft-protocol-strategy';

describe('V10DraftStrategy', () => {
  let strategy: V10DraftStrategy;
  let v09Strategy: V09DraftStrategy;

  beforeEach(() => {
    strategy = new V10DraftStrategy();
    v09Strategy = new V09DraftStrategy();
  });

  it('exposes v1.0 protocol version', () => {
    expect(strategy.version).toBe('v1.0');
  });

  it('returns CAR_BOOKING_V1_0 as starter draft', () => {
    expect(strategy.getStarterDraft()).toBe(CAR_BOOKING_V1_0);
  });

  it('generates a single-message v1.0 createSurface blank draft', () => {
    const blank = strategy.getBlankDraft(BASIC_CATALOG_ID_V1_0);
    const parsed = JSON.parse(blank);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].version).toBe('1.0');
    expect(parsed[0].createSurface.catalogId).toBe(BASIC_CATALOG_ID_V1_0);
    expect(parsed[0].createSurface.surfaceId).toBe('sample-surface');
    expect(parsed[0].createSurface.sendDataModel).toBeUndefined();
  });

  it('correctly identifies starter draft with version 1.0 and v1.0', () => {
    expect(strategy.isStarterDraft(CAR_BOOKING_V1_0)).toBe(true);
    expect(strategy.isStarterDraft('  ' + CAR_BOOKING_V1_0 + '\n  ')).toBe(true);
    const v10LegacyStarter = CAR_BOOKING_V1_0.replace('"version": "1.0"', '"version": "v1.0"');
    expect(strategy.isStarterDraft(v10LegacyStarter)).toBe(true);
    expect(strategy.isStarterDraft(CAR_BOOKING)).toBe(false);
    expect(strategy.isStarterDraft('[]')).toBe(false);
    expect(strategy.isStarterDraft('')).toBe(false);
  });

  it('correctly identifies blank draft with version 1.0 and v1.0', () => {
    const blank = strategy.getBlankDraft('https://example.com/v1_0/catalog.json');
    expect(strategy.isBlankDraft(blank)).toBe(true);
    const blankLegacy = blank.replace('"version": "1.0"', '"version": "v1.0"');
    expect(strategy.isBlankDraft(blankLegacy)).toBe(true);
    expect(strategy.isBlankDraft(CAR_BOOKING_V1_0)).toBe(false);
    expect(strategy.isBlankDraft(v09Strategy.getBlankDraft())).toBe(false);
    expect(strategy.isBlankDraft('[]')).toBe(false);
    expect(strategy.isBlankDraft('not json')).toBe(false);
  });

  describe('cross-version draft detection helpers', () => {
    it('isUntouchedStarterDraft recognizes both v0.9 and v1.0 starters', () => {
      expect(isUntouchedStarterDraft(CAR_BOOKING)).toBe(true);
      expect(isUntouchedStarterDraft(CAR_BOOKING_V1_0)).toBe(true);
      expect(isUntouchedStarterDraft('[]')).toBe(false);
      expect(isUntouchedStarterDraft('{"custom": true}')).toBe(false);
    });

    it('isUntouchedBlankDraft recognizes both v0.9 and v1.0 blank drafts', () => {
      const v09Blank = v09Strategy.getBlankDraft('cat09');
      const v10Blank = strategy.getBlankDraft('cat10');
      expect(isUntouchedBlankDraft(v09Blank)).toBe(true);
      expect(isUntouchedBlankDraft(v10Blank)).toBe(true);
      expect(isUntouchedBlankDraft(CAR_BOOKING)).toBe(false);
      expect(isUntouchedBlankDraft(CAR_BOOKING_V1_0)).toBe(false);
      expect(isUntouchedBlankDraft('[]')).toBe(false);
    });
  });

  describe('sanitizeLayout', () => {
    it('strips blocks with registerMockRules or mockRulesConfig in v1.0', () => {
      const payload = JSON.stringify([
        {version: 'v1.0', registerMockRules: {rules: []}},
        {version: 'v1.0', mockRulesConfig: {active: true}},
        {version: 'v1.0', createSurface: {surfaceId: 's1', catalogId: 'c1'}},
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      const parsed = JSON.parse(sanitized);
      expect(parsed.length).toBe(1);
      expect(parsed[0].createSurface.surfaceId).toBe('s1');
    });

    it('sanitizes inline createSurface.components: strips mock_rules_container and mock/rules props', () => {
      const payload = JSON.stringify([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 's1',
            catalogId: 'c1',
            components: [
              {
                id: 'root',
                component: 'Column',
                children: ['title', 'mock_rules_container'],
                rules: [{rule: 'stripThis'}],
                mockProp: 'stripThisToo',
              },
              {
                id: 'mock_rules_container',
                component: 'Column',
                children: [],
              },
              {
                id: 'title',
                component: 'Text',
                text: '# Hello',
              },
            ],
            dataModel: {
              foo: 'bar',
            },
          },
        },
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      const parsed = JSON.parse(sanitized);
      const comps = parsed[0].createSurface.components;
      expect(comps.length).toBe(2);
      expect(comps.find((c: {id: string}) => c.id === 'mock_rules_container')).toBeUndefined();
      const root = comps.find((c: {id: string}) => c.id === 'root');
      expect(root.children).toEqual(['title']);
      expect(root.rules).toBeUndefined();
      expect(root.mockProp).toBeUndefined();
    });

    it('strips __proto__, constructor, and prototype from v1.0 createSurface.components and dataModel', () => {
      const payload = JSON.stringify([
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: 's1',
            catalogId: 'c1',
            components: [
              {
                id: 'c1',
                component: 'Text',
                text: 'Safe',
                __proto__: {polluted: true},
                constructor: {polluted: true},
              },
            ],
            dataModel: {
              user: {name: 'Alice'},
              __proto__: {admin: true},
              constructor: {admin: true},
              prototype: {admin: true},
            },
          },
        },
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      expect(sanitized).not.toContain('__proto__');
      expect(sanitized).not.toContain('"constructor"');
      expect(sanitized).not.toContain('"prototype"');
      const parsed = JSON.parse(sanitized);
      expect(parsed[0].createSurface.components[0].id).toBe('c1');
      expect(parsed[0].createSurface.dataModel.user.name).toBe('Alice');
    });

    it('sanitizes updateComponents and updateDataModel in v1.0', () => {
      const payload = JSON.stringify([
        {
          version: 'v1.0',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'root',
                component: 'Column',
                children: ['c1', 'mock_rules_container'],
              },
              {
                id: 'mock_rules_container',
                component: 'Column',
              },
              {
                id: 'c1',
                component: 'Text',
                text: 'ok',
                __proto__: {x: 1},
              },
            ],
          },
        },
        {
          version: 'v1.0',
          updateDataModel: {
            surfaceId: 's1',
            path: '/',
            value: {
              data: 123,
              __proto__: {polluted: true},
            },
          },
        },
      ]);
      const sanitized = strategy.sanitizeLayout(payload);
      expect(sanitized).not.toContain('mock_rules_container');
      expect(sanitized).not.toContain('__proto__');
      const parsed = JSON.parse(sanitized);
      expect(parsed[0].updateComponents.components.length).toBe(2);
      expect(parsed[1].updateDataModel.value.data).toBe(123);
    });

    it('returns empty string for invalid json or empty blocks', () => {
      expect(strategy.sanitizeLayout('invalid')).toBe('');
      expect(strategy.sanitizeLayout('{}')).toBe('');
      expect(strategy.sanitizeLayout('   ')).toBe('');
    });
  });
});
