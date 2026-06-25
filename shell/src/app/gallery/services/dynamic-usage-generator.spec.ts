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

import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach} from 'vitest';
import {DynamicUsageGenerator} from './dynamic-usage-generator';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {CatalogSchemaResolver} from '../schema/catalog-schema-resolver';
import {Catalog} from '../../storage/models/catalog-storage.model';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

describe('DynamicUsageGenerator', () => {
  let generator: DynamicUsageGenerator;
  let catalogManagementMock: MockCatalogManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DynamicUsageGenerator,
        {provide: CatalogManagement, useClass: MockCatalogManagement},
      ],
    });

    generator = TestBed.inject(DynamicUsageGenerator);
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
  });

  it('generates fallback preset with required properties of all types', () => {
    const mockCatalog: Catalog = {
      components: {
        CustomComp: {
          type: 'object',
          properties: {
            id: {type: 'string'},
            reqStr: {type: 'string'},
            reqNum: {type: 'number'},
            reqInt: {type: 'integer'},
            reqUnion: {type: 'boolean | string'},
            reqBool: {type: 'boolean'},
            reqArr: {type: 'array'},
            reqObj: {type: 'object'},
            reqUnknown: {type: 'anything-else'},
            optBool: {type: 'boolean'},
          },
          required: [
            'id',
            'reqStr',
            'reqNum',
            'reqInt',
            'reqUnion',
            'reqBool',
            'reqArr',
            'reqObj',
            'reqUnknown',
          ],
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    const resolver = new CatalogSchemaResolver(mockCatalog);

    const preset = generator.generateFallbackPreset('CustomComp', '', resolver);
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'CustomComp',
        reqStr: '',
        reqNum: 0,
        reqInt: 0,
        reqUnion: false,
        reqBool: false,
        reqArr: [],
        reqObj: {},
        reqUnknown: null,
      },
    ]);
  });

  it('populates high-value fields with sample values even if optional', () => {
    const mockCatalog: Catalog = {
      components: {
        CustomComp: {
          type: 'object',
          properties: {
            label: {type: 'string'},
            text: {type: 'string'},
            title: {type: 'string'},
            header: {type: 'string'},
            tooltip: {type: 'string'},
            placeholder: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    const resolver = new CatalogSchemaResolver(mockCatalog);

    const preset = generator.generateFallbackPreset('CustomComp', '', resolver);
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'CustomComp',
        label: 'Sample Label',
        text: 'Sample Text',
        title: 'Sample Title',
        header: 'Sample Header',
        tooltip: 'Sample Tooltip',
        placeholder: 'Enter text...',
      },
    ]);
  });

  it('generates fallback placeholder image for Image component url/src fields', () => {
    const mockCatalog: Catalog = {
      components: {
        MyImage: {
          type: 'object',
          properties: {
            url: {type: 'string'},
            src: {type: 'string'},
          },
          required: ['url', 'src'],
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    const resolver = new CatalogSchemaResolver(mockCatalog);

    const preset = generator.generateFallbackPreset('MyImage', '', resolver);
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'MyImage',
        url: 'https://gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg',
        src: 'https://gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg',
      },
    ]);
  });

  it('handles schemas with array type and extracts the first valid string type', () => {
    const mockCatalog: Catalog = {
      components: {
        CustomComp: {
          type: 'object',
          properties: {
            reqNullableStr: {type: ['string', 'null'] as unknown as string},
            reqNullableBool: {type: ['boolean', 'null'] as unknown as string},
          },
          required: ['reqNullableStr', 'reqNullableBool'],
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    const resolver = new CatalogSchemaResolver(mockCatalog);

    const preset = generator.generateFallbackPreset('CustomComp', '', resolver);
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'CustomComp',
        reqNullableStr: '',
        reqNullableBool: false,
      },
    ]);
  });

  it('safely handles invalid or non-object schemas in union types', () => {
    const mockCatalog: Catalog = {
      components: {
        CustomComp: {
          type: 'object',
          properties: {
            reqUnionBad: {
              oneOf: [null, {type: 'string'}] as unknown as CatalogComponentSchema[],
            } as unknown as CatalogComponentSchema,
          },
          required: ['reqUnionBad'],
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    const resolver = new CatalogSchemaResolver(mockCatalog);

    const preset = generator.generateFallbackPreset('CustomComp', '', resolver);
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'CustomComp',
        reqUnionBad: null,
      },
    ]);
  });

  it('generates child Text component when children property is present and Text exists', () => {
    const mockCatalog: Catalog = {
      components: {
        Container: {
          type: 'object',
          properties: {
            children: {type: 'array', items: {type: 'string'}},
          },
          required: ['children'],
        },
        Text: {
          type: 'object',
          properties: {text: {type: 'string'}},
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    const resolver = new CatalogSchemaResolver(mockCatalog);

    const preset = generator.generateFallbackPreset('Container', '', resolver);
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'Container',
        children: ['target-child-0'],
      },
      {
        id: 'target-child-0',
        component: 'Text',
        text: 'Child Element',
      },
    ]);
  });
});
