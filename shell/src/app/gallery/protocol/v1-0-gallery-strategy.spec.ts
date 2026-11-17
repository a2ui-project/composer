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
import {V10GalleryStrategy} from './v1-0-gallery-strategy';
import type {ComponentUsage} from 'a2ui-bridge';
import type {Catalog} from '../../storage/models/catalog-storage.model';

describe('V10GalleryStrategy', () => {
  const strategy = new V10GalleryStrategy();

  describe('version', () => {
    it('reports v1.0 protocol version', () => {
      expect(strategy.version).toBe('v1.0');
    });
  });

  describe('buildPreviewPayload', () => {
    it('emits a single createSurface message with canonical wire version: 1.0', () => {
      const preset: ComponentUsage = {
        usage: [
          {
            id: 'target',
            component: 'Button',
            label: 'Submit',
          },
        ],
      };
      const payload = strategy.buildPreviewPayload(
        preset,
        'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      );
      expect(payload).toEqual([
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'gallery-preview',
            catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
            components: [
              {
                id: 'root',
                component: 'Button',
                label: 'Submit',
              },
            ],
            sendDataModel: true,
          },
        },
      ]);
    });

    it('includes inline dataModel when data is present', () => {
      const preset: ComponentUsage = {
        usage: [
          {
            id: 'root',
            component: 'Card',
          },
        ],
        data: {count: 42},
      };
      const payload = strategy.buildPreviewPayload(
        preset,
        'https://example.com/custom-catalog.json',
        'custom-surface',
      );
      expect(payload).toEqual([
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'custom-surface',
            catalogId: 'https://example.com/custom-catalog.json',
            components: [
              {
                id: 'root',
                component: 'Card',
              },
            ],
            dataModel: {count: 42},
            sendDataModel: true,
          },
        },
      ]);
    });

    it('defaults catalogId to standard basic catalog url when empty', () => {
      const preset: ComponentUsage = {
        usage: [{id: 'root', component: 'Box'}],
      };
      const payload = strategy.buildPreviewPayload(preset, '');
      expect(payload[0]).toMatchObject({
        version: '1.0',
        createSurface: {
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        },
      });
    });
  });

  describe('extractComponents with multi-catalog provenance', () => {
    it('merges components across multiple catalogs preserving source provenance', () => {
      const basicCatalog: Catalog = {
        $id: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        title: 'Basic Catalog',
        components: {
          Button: {type: 'object', title: 'Button'},
          Card: {type: 'object', title: 'Card'},
        },
      };
      const extendedCatalog: Catalog = {
        $id: 'https://example.com/extended-catalog.json',
        title: 'Extended Catalog',
        components: {
          Chart: {type: 'object', title: 'Chart'},
        },
      };

      const map = strategy.extractComponents([basicCatalog, extendedCatalog]);
      expect(map.size).toBe(3);

      const button = map.get('Button');
      expect(button).toEqual({
        componentKey: 'Button',
        componentSchema: {type: 'object', title: 'Button'},
        catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
        catalogTitle: 'Basic Catalog',
        catalog: basicCatalog,
      });

      const chart = map.get('Chart');
      expect(chart).toEqual({
        componentKey: 'Chart',
        componentSchema: {type: 'object', title: 'Chart'},
        catalogId: 'https://example.com/extended-catalog.json',
        catalogTitle: 'Extended Catalog',
        catalog: extendedCatalog,
      });
    });

    it('handles single catalog object or empty inputs cleanly', () => {
      expect(strategy.extractComponents(null).size).toBe(0);
      expect(strategy.extractComponents([]).size).toBe(0);

      const single: Catalog = {
        $id: 'cat-single',
        title: 'Single Catalog',
        components: {Item: {type: 'object'}},
      };
      const map = strategy.extractComponents(single);
      expect(map.size).toBe(1);
      expect(map.get('Item')?.catalogId).toBe('cat-single');
    });
  });

  describe('dynamic bindings and calls', () => {
    it('detects v1.0 @path dynamic bindings and @call expressions', () => {
      expect(strategy.isDynamicBinding({'@path': 'profile.displayName'})).toBe(true);
      expect(strategy.isDynamicBinding({path: 'profile.displayName'})).toBe(false);
      expect(strategy.isDynamicBinding('plain string')).toBe(false);

      expect(strategy.isDynamicCall({'@call': 'calculateDiscount'})).toBe(true);
      expect(
        strategy.isDynamicCall({
          '@call': 'callMcpTool',
          '@args': {name: 'search'},
          catalogId: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
        }),
      ).toBe(true);
      expect(strategy.isDynamicCall({'@call': 'badArgs', args: [1, 2]})).toBe(false);
      expect(strategy.isDynamicCall({'@call': 'badAtArgs', '@args': [1, 2]})).toBe(false);
      expect(strategy.isDynamicCall({call: 'calculateDiscount'})).toBe(false);
      expect(strategy.isDynamicCall({'@call': 123})).toBe(false);
    });

    it('describes dynamic values with edit notes', () => {
      expect(strategy.describeDynamicValue({'@path': 'user.email'})).toBe(
        'Bound to user.email — edit in the JSON editor.',
      );
      expect(strategy.describeDynamicValue({'@call': 'formatCurrency'})).toBe(
        'Computed by formatCurrency() — edit in the JSON editor.',
      );
      expect(strategy.describeDynamicValue('literal')).toBeNull();
      expect(strategy.describeDynamicValue(null)).toBeNull();
    });
  });
});
