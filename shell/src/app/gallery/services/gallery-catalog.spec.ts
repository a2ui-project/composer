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
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {GalleryCatalog} from './gallery-catalog';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {DEFAULT_PRESETS} from './default-presets';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

describe('GalleryCatalog', () => {
  let service: GalleryCatalog;
  let catalogManagementMock: MockCatalogManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GalleryCatalog, {provide: CatalogManagement, useClass: MockCatalogManagement}],
    });

    service = TestBed.inject(GalleryCatalog);
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
  });

  it('starts with selected component key set to null', () => {
    expect(service.selectedComponentKey()).toBeNull();
  });

  it('updates selected component key when selectComponent is called', () => {
    service.selectComponent('Text');
    expect(service.selectedComponentKey()).toBe('Text');

    service.selectComponent(null);
    expect(service.selectedComponentKey()).toBeNull();
  });

  it('categorizes and alphabetizes components from the active catalog correctly', () => {
    const mockCatalog: Catalog = {
      components: {
        Column: {type: 'object'},
        Row: {type: 'object'},
        Text: {type: 'object'},
        Button: {type: 'object'},
        ChoicePicker: {type: 'object'},
        Alert: {type: 'object'},
        CustomComp: {type: 'object'},
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    const list = service.componentsList();
    expect(list).toEqual([
      {
        category: 'Layout',
        components: ['Column', 'Row'],
      },
      {
        category: 'Content',
        components: ['Text'],
      },
      {
        category: 'Input',
        components: ['Button', 'ChoicePicker'],
      },
      {
        category: 'Feedback',
        components: ['Alert'],
      },
      {
        category: 'Other',
        components: ['CustomComp'],
      },
    ]);
  });

  it('returns empty array for componentsList when catalog or components are null', () => {
    catalogManagementMock.activeCatalog.set(null);
    expect(service.componentsList()).toEqual([]);

    catalogManagementMock.activeCatalog.set({});
    expect(service.componentsList()).toEqual([]);
  });

  it('returns empty properties and null preset when no component is selected', () => {
    expect(service.selectedComponentProperties()).toEqual([]);
    expect(service.selectedComponentPreset()).toBeNull();
  });

  it('retrieves visual preset from static mock presets list if it exists', () => {
    const mockCatalog: Catalog = {
      components: {
        Text: {
          type: 'object',
          properties: {
            text: {type: 'string'},
            variant: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Text');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'Text',
        text: 'Headline Large (H1)',
        variant: 'h1',
      },
    ]);
  });

  it('generates dynamic fallback presets for components lacking static presets using required properties of all types', () => {
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
    service.selectComponent('CustomComp');

    const preset = service.selectedComponentPreset();
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

  it('delivers a deep copy of the visual preset to prevent global mutation', () => {
    const mockCatalog: Catalog = {
      components: {
        Text: {
          type: 'object',
          properties: {
            text: {type: 'string'},
            variant: {type: 'string'},
          },
        },
        Column: {type: 'object'},
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Text');

    const preset1 = service.selectedComponentPreset() as Record<string, unknown>[];
    preset1[0]['text'] = 'Mutated Title'; // Mutate the returned object

    // Toggle selection to trigger computed re-evaluation when selecting Text again
    service.selectComponent('Column');
    service.selectedComponentPreset();

    service.selectComponent('Text');
    const preset2 = service.selectedComponentPreset() as Record<string, unknown>[];
    expect(preset2[0]['text']).toBe('Headline Large (H1)'); // Original is untouched
  });

  it('categorizes components with Material prefix correctly using keyword matching', () => {
    const mockCatalog: Catalog = {
      components: {
        MaterialText: {type: 'object'},
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    expect(service.componentsList()).toEqual([
      {
        category: 'Content',
        components: ['MaterialText'],
      },
    ]);
  });

  it('categorizes other prefixes and handles case insensitivity', () => {
    const mockCatalog: Catalog = {
      components: {
        AntTabs: {type: 'object'},
        NzDateTimePicker: {type: 'object'},
        nztimepicker: {type: 'object'},
        tabs: {type: 'object'},
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    const list = service.componentsList();
    expect(list).toEqual([
      {
        category: 'Layout',
        components: ['AntTabs', 'tabs'],
      },
      {
        category: 'Input',
        components: ['NzDateTimePicker', 'nztimepicker'],
      },
    ]);
  });

  it('respects priority order when component contains multiple keywords', () => {
    const mockCatalog: Catalog = {
      components: {
        ButtonRow: {type: 'object'}, // matches "button" (Input) and "row" (Layout)
        TextAlert: {type: 'object'}, // matches "text" (Content) and "alert" (Feedback)
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);

    const list = service.componentsList();
    expect(list).toEqual([
      {
        category: 'Input',
        components: ['ButtonRow'], // Input > Layout
      },
      {
        category: 'Feedback',
        components: ['TextAlert'], // Feedback > Content
      },
    ]);
  });

  it('serializes an empty array preset directly as JSON inside selectedComponentUsage', () => {
    DEFAULT_PRESETS['EmptyArrComp'] = [];
    try {
      const mockCatalog: Catalog = {
        components: {
          EmptyArrComp: {type: 'object'},
        },
      };
      catalogManagementMock.activeCatalog.set(mockCatalog);
      service.selectComponent('EmptyArrComp');

      const usage = service.selectedComponentUsage();
      expect(JSON.parse(usage)).toEqual([]);
    } finally {
      delete DEFAULT_PRESETS['EmptyArrComp'];
    }
  });

  it('serializes a single-component preset directly inside selectedComponentUsage', () => {
    const mockCatalog: Catalog = {
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Text: {
          type: 'object',
          properties: {
            text: {type: 'string'},
            variant: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Text');

    const usage = service.selectedComponentUsage();
    const parsed = JSON.parse(usage);

    expect(parsed).toEqual([
      {
        id: 'target',
        component: 'Text',
        text: 'Headline Large (H1)',
        variant: 'h1',
      },
    ]);
  });

  it('serializes an array preset directly inside selectedComponentUsage', () => {
    const mockCatalog: Catalog = {
      catalogId: 'https://a2ui.org/custom_catalog.json',
      components: {
        Row: {
          type: 'object',
          properties: {
            children: {type: 'array'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Row');

    const usage = service.selectedComponentUsage();
    const parsed = JSON.parse(usage);

    expect(parsed).toEqual([
      {
        id: 'target',
        component: 'Row',
        children: ['RowItem1', 'RowItem2'],
      },
      {
        id: 'RowItem1',
        component: 'Text',
        text: 'Horizontal Item 1',
      },
      {
        id: 'RowItem2',
        component: 'Text',
        text: 'Horizontal Item 2',
      },
    ]);
  });

  it('returns empty string inside selectedComponentUsage when no component is selected', () => {
    expect(service.selectedComponentUsage()).toBe('');
  });

  it('handles scenario when a component is selected but active catalog is null', () => {
    service.selectComponent('CustomComp');
    catalogManagementMock.activeCatalog.set(null);

    expect(service.selectedComponentProperties()).toEqual([]);
    expect(service.selectedComponentPreset()).toEqual([{id: 'target', component: 'CustomComp'}]);
    expect(service.selectedComponentUsage()).not.toBe('');
  });

  it('resolves preset for vendor-prefixed components using normalized names', () => {
    const mockCatalog: Catalog = {
      components: {
        MaterialText: {
          type: 'object',
          properties: {
            text: {type: 'string'},
            variant: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('MaterialText');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'MaterialText',
        text: 'Headline Large (H1)',
        variant: 'h1',
      },
    ]);
  });

  it('generates fallback preset with child elements when children property is an array and Text component exists', () => {
    const mockCatalog: Catalog = {
      components: {
        CustomContainer: {
          type: 'object',
          properties: {
            children: {
              type: 'array',
              items: {type: 'string'},
            },
            requiredProp: {type: 'string'},
          },
          required: ['requiredProp'],
        },
        Text: {
          type: 'object',
          properties: {
            text: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('CustomContainer');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'CustomContainer',
        requiredProp: '',
        children: ['target-child-0'],
      },
      {
        id: 'target-child-0',
        component: 'Text',
        text: 'Child Element',
      },
    ]);
  });

  it('omits child fallback elements if Text component does not exist in the catalog', () => {
    const mockCatalog: Catalog = {
      components: {
        CustomContainer: {
          type: 'object',
          properties: {
            children: {
              type: 'array',
              items: {type: 'string'},
            },
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('CustomContainer');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'CustomContainer',
      },
    ]);
  });

  it('propagates parent library prefix to nested child components in static presets', () => {
    const mockCatalog: Catalog = {
      components: {
        MaterialRow: {
          type: 'object',
          properties: {
            children: {type: 'array'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('MaterialRow');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'MaterialRow',
        children: ['RowItem1', 'RowItem2'],
      },
      {
        id: 'RowItem1',
        component: 'MaterialText',
        text: 'Horizontal Item 1',
      },
      {
        id: 'RowItem2',
        component: 'MaterialText',
        text: 'Horizontal Item 2',
      },
    ]);
  });

  it('generates dynamic fallback child components with prefix when selecting MaterialList (forcing fallback)', () => {
    const originalListPreset = DEFAULT_PRESETS['List'];
    delete DEFAULT_PRESETS['List'];
    try {
      const mockCatalog: Catalog = {
        components: {
          MaterialList: {
            type: 'object',
            properties: {
              children: {
                type: 'array',
                items: {type: 'string'},
              },
            },
          },
          MaterialText: {
            type: 'object',
            properties: {
              text: {type: 'string'},
            },
          },
        },
      };
      catalogManagementMock.activeCatalog.set(mockCatalog);
      service.selectComponent('MaterialList');

      const preset = service.selectedComponentPreset();
      expect(preset).toEqual([
        {
          id: 'target',
          component: 'MaterialList',
          children: ['target-child-0'],
        },
        {
          id: 'target-child-0',
          component: 'MaterialText',
          text: 'Child Element',
        },
      ]);
    } finally {
      DEFAULT_PRESETS['List'] = originalListPreset;
    }
  });

  it('strips properties not defined in the component schema from visual presets', () => {
    const mockCatalog: Catalog = {
      components: {
        Text: {
          type: 'object',
          properties: {
            text: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Text');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'Text',
        text: 'Headline Large (H1)',
      },
    ]);
  });

  it('prunes child components from preset if children property is stripped', () => {
    const mockCatalog: Catalog = {
      components: {
        Row: {
          type: 'object',
          properties: {},
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Row');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'Row',
      },
    ]);
  });

  it('prunes child component from preset if child property is stripped', () => {
    const mockCatalog: Catalog = {
      components: {
        Card: {
          type: 'object',
          properties: {},
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Card');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'Card',
      },
    ]);
  });

  it('prunes child components from preset if tabs property is stripped', () => {
    const mockCatalog: Catalog = {
      components: {
        Tabs: {
          type: 'object',
          properties: {},
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Tabs');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual([
      {
        id: 'target',
        component: 'Tabs',
      },
    ]);
  });

  it('ignores non-string component names when propagating prefixes in presets', () => {
    DEFAULT_PRESETS['TestBadComponent'] = [
      {id: 'target', component: 'TestBadComponent'},
      {id: 'child-1', component: 123}, // invalid component type
      {id: 'child-2'}, // missing component property
    ];

    try {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'mock-id',
        components: {
          MaterialTestBadComponent: {
            type: 'object',
            properties: {},
          },
        },
      });

      service.selectComponent('MaterialTestBadComponent');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset() as Record<string, unknown>[];
      expect(preset).toBeTruthy();
      expect(preset[1]['component']).toBe(123);
      expect(preset[2]['component']).toBeUndefined();
    } finally {
      delete DEFAULT_PRESETS['TestBadComponent'];
    }
  });

  it('ignores non-string child IDs when pruning children', () => {
    DEFAULT_PRESETS['TestBadChildren'] = [
      {id: 'target', component: 'TestBadChildren', children: ['child-1', 123, null]},
      {id: 'child-1', component: 'Text'},
    ];

    try {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'mock-id',
        components: {
          TestBadChildren: {
            type: 'object',
            properties: {}, // empty properties strips children
          },
        },
      });

      service.selectComponent('TestBadChildren');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset() as Record<string, unknown>[];
      // child-1 should be pruned since it was a string child ID, target should be stripped of children
      expect(preset.length).toBe(1);
      expect(preset[0]['id']).toBe('target');
      expect(preset[0]['children']).toBeUndefined();
    } finally {
      delete DEFAULT_PRESETS['TestBadChildren'];
    }
  });

  it('ignores invalid tab configs when pruning tab child components', () => {
    DEFAULT_PRESETS['TestBadTabs'] = [
      {
        id: 'target',
        component: 'TestBadTabs',
        tabs: [
          null,
          123,
          {label: 'Tab 1'},
          {label: 'Tab 2', child: 123},
          {label: 'Tab 3', child: 'child-1'},
        ],
      },
      {id: 'child-1', component: 'Text'},
    ];

    try {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'mock-id',
        components: {
          TestBadTabs: {
            type: 'object',
            properties: {}, // empty properties strips tabs
          },
        },
      });

      service.selectComponent('TestBadTabs');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset() as Record<string, unknown>[];
      // child-1 should be pruned (referenced by tab 3 child string), target should be stripped of tabs
      expect(preset.length).toBe(1);
      expect(preset[0]['id']).toBe('target');
      expect(preset[0]['tabs']).toBeUndefined();
    } finally {
      delete DEFAULT_PRESETS['TestBadTabs'];
    }
  });
});
