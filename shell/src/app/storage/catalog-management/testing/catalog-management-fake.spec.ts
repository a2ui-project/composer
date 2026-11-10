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
import type {Catalog} from '../../models/catalog-storage.model';
import {createMockCatalogManagement} from './catalog-management-fake';

describe('createMockCatalogManagement', () => {
  it('provides default signal values when no overrides are specified', () => {
    const mock = createMockCatalogManagement();

    expect(mock.activeCatalog()).toBeNull();
    expect(mock.activeCatalogs()).toEqual([]);
    expect(mock.activeCatalogTitle()).toBe('');
    expect(mock.activeCatalogDescription()).toBe('');
    expect(mock.mergedActiveCatalog()).toBeNull();
    expect(mock.activeProtocolVersion()).toBe('v0.9');
    expect(mock.hasReceivedCatalogResponse()).toBe(true);
    expect(mock.handshakeState()).toBe('settled');
    expect(mock.catalogError()).toBeNull();
  });

  it('reactively derives activeCatalogTitle, activeCatalogDescription, and mergedActiveCatalog from activeCatalog', () => {
    const activeCatalog = signal<Catalog | null>(null);
    const mock = createMockCatalogManagement({activeCatalog});

    expect(mock.activeCatalogTitle()).toBe('');
    expect(mock.activeCatalogDescription()).toBe('');
    expect(mock.mergedActiveCatalog()).toBeNull();

    const testCatalog: Catalog = {
      $id: 'https://test/catalog.json',
      title: 'Dynamic Test Catalog',
      description: 'A dynamically updated test catalog',
      components: {},
    };

    activeCatalog.set(testCatalog);

    expect(mock.activeCatalogTitle()).toBe('Dynamic Test Catalog');
    expect(mock.activeCatalogDescription()).toBe('A dynamically updated test catalog');
    expect(mock.mergedActiveCatalog()).toEqual(testCatalog);
  });

  it('falls back to the first entry in activeCatalogs for mergedActiveCatalog when activeCatalog is null', () => {
    const fallbackCatalog: Catalog = {
      $id: 'https://test/fallback.json',
      title: 'Fallback Catalog',
      components: {},
    };
    const activeCatalogs = signal<Catalog[]>([fallbackCatalog]);
    const mock = createMockCatalogManagement({activeCatalogs});

    expect(mock.activeCatalog()).toBeNull();
    expect(mock.mergedActiveCatalog()).toEqual(fallbackCatalog);
  });

  it('preserves explicit signal overrides for derived properties', () => {
    const customTitle = signal('Custom Overridden Title');
    const mock = createMockCatalogManagement({activeCatalogTitle: customTitle});

    expect(mock.activeCatalogTitle()).toBe('Custom Overridden Title');
  });
});
