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

import {signal} from '@angular/core';
import {describe, expect, it} from 'vitest';
import {getCatalogId, type Catalog} from '../../models/catalog-storage.model';
import {createFakeCatalogManagement} from './catalog-management-fake';

describe('createFakeCatalogManagement', () => {
  it('provides default signal values when no overrides are specified', () => {
    const mock = createFakeCatalogManagement();

    expect(mock.activeCatalog()).toBeNull();
    expect(mock.activeCatalogs()).toEqual([]);
    expect(mock.activeCatalogTitle()).toBe('');
    expect(mock.activeCatalogDescription()).toBe('');
    expect(mock.mergedActiveCatalog()).toBeNull();
    expect(mock.activeProtocolVersion()).toBe('v1.0');
    expect(mock.hasReceivedCatalogResponse()).toBe(true);
    expect(mock.handshakeState()).toBe('settled');
    expect(mock.catalogError()).toBeNull();
  });

  it('reactively derives activeCatalogTitle, activeCatalogDescription, activeProtocolVersion, and mergedActiveCatalog from activeCatalog', () => {
    const activeCatalog = signal<Catalog | null>(null);
    const mock = createFakeCatalogManagement({activeCatalog});

    expect(mock.activeCatalogTitle()).toBe('');
    expect(mock.activeCatalogDescription()).toBe('');
    expect(mock.mergedActiveCatalog()).toBeNull();
    expect(mock.activeProtocolVersion()).toBe('v1.0');

    const testCatalog: Catalog = {
      $id: 'https://test/catalog.json',
      title: 'Dynamic Test Catalog',
      description: 'A dynamically updated test catalog',
      components: {},
    };

    activeCatalog.set(testCatalog);

    expect(mock.activeCatalogTitle()).toBe('Dynamic Test Catalog');
    expect(mock.activeCatalogDescription()).toBe('A dynamically updated test catalog');
    expect(mock.mergedActiveCatalog()).toEqual(expect.objectContaining(testCatalog));
    expect(mock.activeProtocolVersion()).toBe('v0.9');

    activeCatalog.set({
      ...testCatalog,
      protocolVersion: '1.0',
    });
    expect(mock.activeProtocolVersion()).toBe('v1.0');
  });

  it('merges components, functions, and $defs across multiple activeCatalogs while giving precedence to activeCatalog', () => {
    const primaryCatalog: Catalog = {
      catalogId: 'https://test/primary.json',
      title: 'Primary Catalog',
      protocolVersion: '1.0',
      components: {
        Text: {type: 'object', description: 'Primary Text'},
      },
      functions: {
        openUrl: {description: 'Primary openUrl'},
      },
      $defs: {
        sharedDef: {type: 'string', description: 'Primary def'},
      },
    };
    const secondaryCatalog: Catalog = {
      catalogId: 'https://test/secondary.json',
      title: 'Secondary Catalog',
      protocolVersion: '1.0',
      components: {
        Text: {type: 'object', description: 'Secondary Text (overridden)'},
        Chart: {type: 'object', description: 'Secondary Chart'},
      },
      functions: {
        openUrl: {description: 'Secondary openUrl (overridden)'},
        regexCapture: {description: 'Secondary regexCapture'},
      },
      $defs: {
        sharedDef: {type: 'number', description: 'Secondary def (overridden)'},
        extraDef: {type: 'boolean'},
      },
    };
    const activeCatalog = signal<Catalog | null>(primaryCatalog);
    const activeCatalogs = signal<Catalog[]>([primaryCatalog, secondaryCatalog]);
    const mock = createFakeCatalogManagement({activeCatalog, activeCatalogs});

    expect(mock.mergedActiveCatalog()).toEqual(
      expect.objectContaining({
        catalogId: 'https://test/primary.json',
        components: {
          Text: {type: 'object', description: 'Primary Text'},
          Chart: {type: 'object', description: 'Secondary Chart'},
        },
        functions: {
          openUrl: {description: 'Primary openUrl'},
          regexCapture: {description: 'Secondary regexCapture'},
        },
        $defs: {
          sharedDef: {type: 'string', description: 'Primary def'},
          extraDef: {type: 'boolean'},
        },
      }),
    );
  });

  it('preserves primary $id precedence when primary uses $id without catalogId and secondary has catalogId', () => {
    const primaryCatalog: Catalog = {
      $id: 'https://test/primary.json',
      components: {
        Text: {type: 'object'},
      },
    };
    const secondaryCatalog: Catalog = {
      catalogId: 'https://test/secondary.json',
      components: {
        Chart: {type: 'object'},
      },
    };
    const mock = createFakeCatalogManagement({
      activeCatalog: signal<Catalog | null>(primaryCatalog),
      activeCatalogs: signal<Catalog[]>([primaryCatalog, secondaryCatalog]),
    });

    const merged = mock.mergedActiveCatalog();
    expect(merged).not.toBeNull();
    expect(getCatalogId(merged!)).toBe('https://test/primary.json');
  });

  it('preserves explicit signal overrides for derived properties including activeProtocolVersion', () => {
    const customTitle = signal('Custom Overridden Title');
    const customVersion = signal<'v0.9' | 'v1.0'>('v0.9');
    const mock = createFakeCatalogManagement({
      activeCatalogTitle: customTitle,
      activeProtocolVersion: customVersion,
    });

    expect(mock.activeCatalogTitle()).toBe('Custom Overridden Title');
    expect(mock.activeProtocolVersion()).toBe('v0.9');
  });
});
