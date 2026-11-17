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
import {V09GalleryStrategy} from './v0-9-gallery-strategy';
import type {ComponentUsage} from 'a2ui-bridge';
import type {Catalog} from '../../storage/models/catalog-storage.model';

describe('V09GalleryStrategy', () => {
  const strategy = new V09GalleryStrategy();

  describe('version', () => {
    it('reports v0.9 protocol version', () => {
      expect(strategy.version).toBe('v0.9');
    });
  });

  describe('buildPreviewPayload', () => {
    it('emits two messages when no dataModel is present', () => {
      const preset: ComponentUsage = {
        usage: [
          {
            id: 'target',
            component: 'Button',
            text: 'Click me',
          },
        ],
      };
      const payload = strategy.buildPreviewPayload(preset, 'custom-catalog-id');
      expect(payload).toEqual([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'gallery-preview',
            catalogId: 'custom-catalog-id',
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'gallery-preview',
            components: [
              {
                id: 'root',
                component: 'Button',
                text: 'Click me',
              },
            ],
          },
        },
      ]);
    });

    it('emits three messages when dataModel is provided', () => {
      const preset: ComponentUsage = {
        usage: [
          {
            id: 'root',
            component: 'Text',
            text: 'Hello',
          },
        ],
        data: {user: 'Alice'},
      };
      const payload = strategy.buildPreviewPayload(preset, 'custom-catalog-id', 'custom-surface');
      expect(payload).toEqual([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'custom-surface',
            catalogId: 'custom-catalog-id',
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'custom-surface',
            components: [
              {
                id: 'root',
                component: 'Text',
                text: 'Hello',
              },
            ],
          },
        },
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 'custom-surface',
            value: {user: 'Alice'},
          },
        },
      ]);
    });
  });

  describe('extractComponents', () => {
    it('extracts components from a single catalog', () => {
      const catalog: Catalog = {
        catalogId: 'cat-1',
        title: 'Catalog One',
        components: {
          Button: {type: 'object'},
          Card: {type: 'object'},
        },
      };
      const map = strategy.extractComponents(catalog);
      expect(map.size).toBe(2);
      expect(map.get('Button')).toEqual({
        componentKey: 'Button',
        componentSchema: {type: 'object'},
        catalogId: 'cat-1',
        catalogTitle: 'Catalog One',
        catalog,
      });
      expect(map.get('Card')?.catalogId).toBe('cat-1');
    });

    it('uses primary catalog only when given an array of catalogs', () => {
      const cat1: Catalog = {
        catalogId: 'cat-1',
        title: 'Catalog One',
        components: {Button: {type: 'object'}},
      };
      const cat2: Catalog = {
        catalogId: 'cat-2',
        title: 'Catalog Two',
        components: {Extra: {type: 'object'}},
      };
      const map = strategy.extractComponents([cat1, cat2]);
      expect(map.size).toBe(1);
      expect(map.has('Button')).toBe(true);
      expect(map.has('Extra')).toBe(false);
    });

    it('returns empty map for null or empty catalog', () => {
      expect(strategy.extractComponents(null).size).toBe(0);
      expect(strategy.extractComponents([]).size).toBe(0);
    });
  });

  describe('dynamic bindings and calls', () => {
    it('detects v0.9 dynamic bindings and calls', () => {
      expect(strategy.isDynamicBinding({path: '/user/name'})).toBe(true);
      expect(strategy.isDynamicBinding({'@path': '/user/name'})).toBe(false);
      expect(strategy.isDynamicBinding('plain string')).toBe(false);

      expect(strategy.isDynamicCall({call: 'calculate', returnType: 'number'})).toBe(true);
      expect(strategy.isDynamicCall({'@call': 'calculate'})).toBe(false);
      expect(strategy.isDynamicCall({call: 123})).toBe(false);
    });

    it('describes dynamic values with edit notes', () => {
      expect(strategy.describeDynamicValue({path: '/user/name'})).toBe(
        'Bound to /user/name — edit in the JSON editor.',
      );
      expect(strategy.describeDynamicValue({call: 'formatDate'})).toBe(
        'Computed by formatDate() — edit in the JSON editor.',
      );
      expect(strategy.describeDynamicValue('literal')).toBeNull();
      expect(strategy.describeDynamicValue(null)).toBeNull();
    });
  });
});
