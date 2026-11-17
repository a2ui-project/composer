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
import {V09MonacoSchemaStrategy} from './v0-9-monaco-schema-strategy';
import {Catalog} from '../../../storage/models/catalog-storage.model';
import {COMMON_TYPES_SCHEMA} from '../../../gallery/schema/common-types-schema';

describe('V09MonacoSchemaStrategy', () => {
  const mockCatalog: Catalog = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
    title: 'Test Catalog',
    components: {
      Text: {
        type: 'object',
        properties: {
          component: {const: 'Text'},
          text: {type: 'string'},
        },
        required: ['component', 'text'],
      },
    },
  };

  it('reports protocolVersion as v0.9', () => {
    const strategy = new V09MonacoSchemaStrategy();
    expect(strategy.protocolVersion).toBe('v0.9');
  });

  it('generates layout and gallery schemas preserving v0.9 structure', () => {
    const strategy = new V09MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: mockCatalog,
      catalogs: [mockCatalog],
    });

    expect(schemas).toBeDefined();
    const layoutSchemaEntry = schemas.find(s => s.uri === 'a2ui-catalog-schema');
    expect(layoutSchemaEntry).toBeDefined();
    const layout = layoutSchemaEntry?.schema as Record<string, unknown>;

    expect(layout['type']).toBe('array');
    const items = layout['items'] as Record<string, unknown>;
    expect(items['type']).toBe('object');
    const props = items['properties'] as Record<string, Record<string, unknown>>;

    expect(props['createSurface']).toBeDefined();
    expect(props['createSurface']['required']).toEqual(['surfaceId', 'catalogId']);
    expect(props['deleteSurface']).toBeDefined();
    expect(props['deleteSurface']['required']).toEqual(['surfaceId']);
    expect(props['updateComponents']).toBeDefined();
    expect(props['updateComponents']['required']).toEqual(['surfaceId', 'components']);
    expect(props['updateDataModel']).toBeDefined();
    expect(props['updateDataModel']['required']).toEqual(['surfaceId']);

    const galleryEntry = schemas.find(s => s.uri === 'a2ui-gallery-example-schema');
    expect(galleryEntry).toBeDefined();
    const gallery = galleryEntry?.schema as Record<string, unknown>;
    expect(gallery['type']).toBe('object');
    expect(gallery['required']).toEqual(['components']);
  });

  it('registers v0.9 common_types.json and catalog URIs for $ref resolution', () => {
    const strategy = new V09MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: mockCatalog,
      catalogs: [mockCatalog],
    });

    const uris = schemas.map(s => s.uri);
    expect(uris).toContain('file:///common_types.json');
    expect(uris).toContain('file:///catalog.json');
    expect(uris).toContain('https://a2ui.org/specification/v0_9/common_types.json');
    expect(uris).toContain('https://a2ui.org/specification/v0_9/catalog.json');

    const commonTypesEntry = schemas.find(
      s => s.uri === 'https://a2ui.org/specification/v0_9/common_types.json',
    );
    expect(commonTypesEntry?.schema).toEqual(COMMON_TYPES_SCHEMA);
  });
});
