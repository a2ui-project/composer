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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ReplaySubject} from 'rxjs';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {GalleryCatalog} from './gallery-catalog';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {DEFAULT_PRESETS} from './default-presets';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

class MockHostCommunication {
  sendMessage = vi.fn();
  readonly messageStream$ = new ReplaySubject<MessageEnvelope>(1);
}

describe('GalleryCatalog', () => {
  let service: GalleryCatalog;
  let catalogManagementMock: MockCatalogManagement;
  let hostCommunicationMock: MockHostCommunication;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GalleryCatalog,
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: HostCommunication, useClass: MockHostCommunication},
      ],
    });

    service = TestBed.inject(GalleryCatalog);
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
    hostCommunicationMock = TestBed.inject(HostCommunication) as unknown as MockHostCommunication;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
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
            usageHint: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Text');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'Text',
          text: 'Headline Large (H1)',
          usageHint: 'h1',
        },
      ],
    });
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
    expect(preset).toEqual({
      usage: [
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
      ],
    });
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
    service.selectComponent('CustomComp');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'CustomComp',
          reqNullableStr: '',
          reqNullableBool: false,
        },
      ],
    });
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
    service.selectComponent('CustomComp');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'CustomComp',
          reqUnionBad: null,
        },
      ],
    });
  });

  it('recursively generates fallbacks for complex required object and array properties, populating high-value fields and safe image URLs', () => {
    const mockCatalog: Catalog = {
      components: {
        ComplexImageContainer: {
          type: 'object',
          properties: {
            imageSource: {
              type: 'object',
              properties: {
                url: {type: 'string'},
                title: {type: 'string'},
                description: {type: 'string'},
              },
              required: ['url'],
            },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: {type: 'string'},
                  value: {type: 'number'},
                  metadata: {
                    type: 'object',
                    properties: {
                      placeholder: {type: 'string'},
                      tooltip: {type: 'string'},
                    },
                  },
                },
                required: ['value', 'metadata'],
              },
            },
          },
          required: ['imageSource', 'options'],
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('ComplexImageContainer');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'ComplexImageContainer',
          imageSource: {
            url: 'https://gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg',
            title: 'Sample Title',
          },
          options: [
            {
              label: 'Sample Label 1',
              value: 0,
              metadata: {
                placeholder: 'Enter text... 1',
                tooltip: 'Sample Tooltip 1',
              },
            },
            {
              label: 'Sample Label 2',
              value: 0,
              metadata: {
                placeholder: 'Enter text... 2',
                tooltip: 'Sample Tooltip 2',
              },
            },
            {
              label: 'Sample Label 3',
              value: 0,
              metadata: {
                placeholder: 'Enter text... 3',
                tooltip: 'Sample Tooltip 3',
              },
            },
          ],
        },
      ],
    });
  });

  it('delivers a deep copy of the visual preset to prevent global mutation', () => {
    const mockCatalog: Catalog = {
      components: {
        Text: {
          type: 'object',
          properties: {
            text: {type: 'string'},
            usageHint: {type: 'string'},
          },
        },
        Column: {type: 'object'},
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('Text');

    const preset1 = service.selectedComponentPreset()!;
    preset1.usage[0]['text'] = 'Mutated Title'; // Mutate the returned object

    // Toggle selection to trigger computed re-evaluation when selecting Text again
    service.selectComponent('Column');
    service.selectedComponentPreset();

    service.selectComponent('Text');
    const preset2 = service.selectedComponentPreset()!;
    expect(preset2.usage[0]['text']).toBe('Headline Large (H1)'); // Original is untouched
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
    DEFAULT_PRESETS['EmptyArrComp'] = {usage: []};
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
            usageHint: {type: 'string'},
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
        usageHint: 'h1',
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
    expect(service.selectedComponentPreset()).toEqual({
      usage: [{id: 'target', component: 'CustomComp'}],
    });
    expect(service.selectedComponentUsage()).not.toBe('');
  });

  it('resolves preset for vendor-prefixed components using normalized names', () => {
    const mockCatalog: Catalog = {
      components: {
        MaterialText: {
          type: 'object',
          properties: {
            text: {type: 'string'},
            usageHint: {type: 'string'},
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('MaterialText');

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'MaterialText',
          text: 'Headline Large (H1)',
          usageHint: 'h1',
        },
      ],
    });
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
    expect(preset).toEqual({
      usage: [
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
      ],
    });
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
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'CustomContainer',
        },
      ],
    });
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
    expect(preset).toEqual({
      usage: [
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
      ],
    });
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
      expect(preset).toEqual({
        usage: [
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
        ],
      });
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
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'Text',
          text: 'Headline Large (H1)',
        },
      ],
    });
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
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'Row',
        },
      ],
    });
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
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'Card',
        },
      ],
    });
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
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'Tabs',
        },
      ],
    });
  });

  it('ignores non-string component names when propagating prefixes in presets', () => {
    DEFAULT_PRESETS['TestBadComponent'] = {
      usage: [
        {id: 'target', component: 'TestBadComponent'},
        {id: 'child-1', component: 123}, // invalid component type
        {id: 'child-2'}, // missing component property
      ],
    };

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

      const preset = service.selectedComponentPreset();
      expect(preset).toBeTruthy();
      expect(preset!.usage[1]['component']).toBe(123);
      expect(preset!.usage[2]['component']).toBeUndefined();
    } finally {
      delete DEFAULT_PRESETS['TestBadComponent'];
    }
  });

  it('ignores non-string child IDs when pruning children', () => {
    DEFAULT_PRESETS['TestBadChildren'] = {
      usage: [
        {id: 'target', component: 'TestBadChildren', children: ['child-1', 123, null]},
        {id: 'child-1', component: 'Text'},
      ],
    };

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

      const preset = service.selectedComponentPreset();
      // child-1 should be pruned since it was a string child ID, target should be stripped of children
      expect(preset!.usage.length).toBe(1);
      expect(preset!.usage[0]['id']).toBe('target');
      expect(preset!.usage[0]['children']).toBeUndefined();
    } finally {
      delete DEFAULT_PRESETS['TestBadChildren'];
    }
  });

  it('ignores invalid tab configs when pruning tab child components', () => {
    DEFAULT_PRESETS['TestBadTabs'] = {
      usage: [
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
      ],
    };

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

      const preset = service.selectedComponentPreset();
      // child-1 should be pruned (referenced by tab 3 child string), target should be stripped of tabs
      expect(preset!.usage.length).toBe(1);
      expect(preset!.usage[0]['id']).toBe('target');
      expect(preset!.usage[0]['tabs']).toBeUndefined();
    } finally {
      delete DEFAULT_PRESETS['TestBadTabs'];
    }
  });

  it('adapts child to children when component schema supports children but not child', () => {
    DEFAULT_PRESETS['TestChildToChildren'] = {
      usage: [
        {
          id: 'target',
          component: 'TestChildToChildren',
          child: 'child-1',
        },
        {
          id: 'child-1',
          component: 'Text',
          text: 'Hello',
        },
      ],
    };

    try {
      const mockCatalog: Catalog = {
        components: {
          TestChildToChildren: {
            type: 'object',
            properties: {
              children: {type: 'array', items: {type: 'string'}},
            },
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
      service.selectComponent('TestChildToChildren');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset();
      expect(preset).toEqual({
        usage: [
          {
            id: 'target',
            component: 'TestChildToChildren',
            children: ['child-1'],
          },
          {
            id: 'child-1',
            component: 'Text',
            text: 'Hello',
          },
        ],
      });
    } finally {
      delete DEFAULT_PRESETS['TestChildToChildren'];
    }
  });

  it('adapts child to label when component schema supports label but not child, and child is Text', () => {
    DEFAULT_PRESETS['TestChildToLabel'] = {
      usage: [
        {
          id: 'target',
          component: 'TestChildToLabel',
          child: 'child-1',
        },
        {
          id: 'child-1',
          component: 'Text',
          text: 'Hello Label',
        },
      ],
    };

    try {
      const mockCatalog: Catalog = {
        components: {
          TestChildToLabel: {
            type: 'object',
            properties: {
              label: {type: 'string'},
            },
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
      service.selectComponent('TestChildToLabel');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset();
      expect(preset).toEqual({
        usage: [
          {
            id: 'target',
            component: 'TestChildToLabel',
            label: 'Hello Label',
          },
        ],
      });
    } finally {
      delete DEFAULT_PRESETS['TestChildToLabel'];
    }
  });

  it('adapts tabs items (title -> label, child -> content) for non-basic Tabs component', () => {
    DEFAULT_PRESETS['MaterialTabs'] = {
      usage: [
        {
          id: 'target',
          component: 'MaterialTabs',
          tabs: [{title: 'Tab 1', child: 'tab-content-1'}],
        },
        {
          id: 'tab-content-1',
          component: 'Text',
          text: 'Content 1',
        },
      ],
    };

    try {
      const mockCatalog: Catalog = {
        components: {
          MaterialTabs: {
            type: 'object',
            properties: {
              tabs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: {type: 'string'},
                    content: {type: 'string'},
                  },
                },
              },
            },
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
      service.selectComponent('MaterialTabs');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset();
      expect(preset).toEqual({
        usage: [
          {
            id: 'target',
            component: 'MaterialTabs',
            tabs: [{label: 'Tab 1', content: 'tab-content-1'}],
          },
          {
            id: 'tab-content-1',
            component: 'Text',
            text: 'Content 1',
          },
        ],
      });
    } finally {
      delete DEFAULT_PRESETS['MaterialTabs'];
    }
  });

  it('does NOT adapt tabs items for basic Tabs component', () => {
    const mockCatalog: Catalog = {
      components: {
        Tabs: {
          type: 'object',
          properties: {
            tabs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: {type: 'string'},
                  child: {type: 'string'},
                },
              },
            },
          },
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
    service.selectComponent('Tabs');
    TestBed.flushEffects();

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'Tabs',
          tabs: [
            {title: 'Tab One', child: 'tab-content-1'},
            {title: 'Tab Two', child: 'tab-content-2'},
          ],
        },
        {
          id: 'tab-content-1',
          component: 'Text',
          text: 'Content of Tab One',
        },
        {
          id: 'tab-content-2',
          component: 'Text',
          text: 'Content of Tab Two',
        },
      ],
    });
  });

  it('resolves union types from anyOf schema for component properties', () => {
    const mockCatalog: Catalog = {
      components: {
        UnionComponent: {
          type: 'object',
          properties: {
            unionField: {
              anyOf: [{type: 'string'}, {type: 'number'}],
            },
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('UnionComponent');
    TestBed.flushEffects();

    const props = service.selectedComponentProperties();
    expect(props).toEqual([
      {
        name: 'unionField',
        description: '',
        type: 'string | number',
        required: false,
      },
    ]);
  });

  it('spawns a child Text component when component has required child property in dynamic fallback generator', () => {
    const mockCatalog: Catalog = {
      components: {
        ParentComponent: {
          type: 'object',
          properties: {
            child: {
              type: 'string',
            },
          },
          required: ['child'],
        },
        Text: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
            },
          },
        },
      },
    };
    catalogManagementMock.activeCatalog.set(mockCatalog);
    service.selectComponent('ParentComponent');
    TestBed.flushEffects();

    const preset = service.selectedComponentPreset();
    expect(preset).toEqual({
      usage: [
        {
          id: 'target',
          component: 'ParentComponent',
          child: 'target-child-0',
        },
        {
          id: 'target-child-0',
          component: 'Text',
          text: 'Child Element',
        },
      ],
    });
  });

  it('passes invalid tab items through without crashing', () => {
    DEFAULT_PRESETS['CustomTabs'] = {
      usage: [
        {
          id: 'target',
          component: 'CustomTabs',
          tabs: [null, 'invalid-tab-string', {title: 'Valid Tab', child: 'tab-content-1'}],
        },
        {
          id: 'tab-content-1',
          component: 'Text',
          text: 'Content 1',
        },
      ],
    };

    try {
      const mockCatalog: Catalog = {
        components: {
          CustomTabs: {
            type: 'object',
            properties: {
              tabs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: {type: 'string'},
                    content: {type: 'string'},
                  },
                },
              },
            },
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
      service.selectComponent('CustomTabs');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset();
      expect(preset).toEqual({
        usage: [
          {
            id: 'target',
            component: 'CustomTabs',
            tabs: [null, 'invalid-tab-string', {label: 'Valid Tab', content: 'tab-content-1'}],
          },
          {
            id: 'tab-content-1',
            component: 'Text',
            text: 'Content 1',
          },
        ],
      });
    } finally {
      delete DEFAULT_PRESETS['CustomTabs'];
    }
  });

  describe('Component Usage Caching & Loading', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('requests component usages via bridge when galleryActive is true and activeCatalog is set', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      expect(hostCommunicationMock.sendMessage).toHaveBeenCalledWith({
        type: PreviewBridgeMessageType.GET_COMPONENT_USAGES,
      });
      expect(service.loadingUsages()).toBe(true);
      expect(service.cachedUsages()).toBeNull();
    });

    it('does not request usages if galleryActive is false', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(false);
      TestBed.flushEffects();

      expect(hostCommunicationMock.sendMessage).not.toHaveBeenCalled();
      expect(service.loadingUsages()).toBe(false);
      expect(service.cachedUsages()).toBeNull();
    });

    it('stores received usages in cachedUsages and resets loadingUsages', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      expect(service.loadingUsages()).toBe(true);

      const mockUsages = {
        Button: {
          usage: [{id: 'target', component: 'Button', text: 'Hello'}],
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.COMPONENT_USAGES,
        payload: mockUsages,
        origin: 'http://localhost',
        timestamp: Date.now(),
      });

      expect(service.cachedUsages()).toEqual(mockUsages);
      expect(service.loadingUsages()).toBe(false);
    });

    it('sets a 2-second timeout when requesting usages, which clears loading state and sets cached usages to empty object if it expires', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      expect(service.loadingUsages()).toBe(true);

      // Advance time by 1999ms
      vi.advanceTimersByTime(1999);
      expect(service.loadingUsages()).toBe(true);
      expect(service.cachedUsages()).toBeNull();

      // Advance past 2000ms
      vi.advanceTimersByTime(1);
      expect(service.loadingUsages()).toBe(false);
      expect(service.cachedUsages()).toEqual({});
    });

    it('clears the timeout when usages are received before it expires', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      expect(service.loadingUsages()).toBe(true);

      // Advance time by 1000ms
      vi.advanceTimersByTime(1000);

      const mockUsages = {
        Button: {
          usage: [{id: 'target', component: 'Button', text: 'Hello'}],
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.COMPONENT_USAGES,
        payload: mockUsages,
        origin: 'http://localhost',
        timestamp: Date.now(),
      });

      expect(service.cachedUsages()).toEqual(mockUsages);
      expect(service.loadingUsages()).toBe(false);

      // Advance past 2000ms from start, should not change state to empty object
      vi.advanceTimersByTime(1500);
      expect(service.cachedUsages()).toEqual(mockUsages);
      expect(service.loadingUsages()).toBe(false);
    });

    it('uses cached usages in selectedComponentPreset', () => {
      const mockCatalog: Catalog = {
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {
          Button: {
            type: 'object',
            properties: {text: {type: 'string'}},
          },
        },
      };
      catalogManagementMock.activeCatalog.set(mockCatalog);
      service.setGalleryActive(true);
      TestBed.flushEffects();

      const mockUsages = {
        Button: {
          usage: [{id: 'target', component: 'Button', text: 'From Cache'}],
        },
      };

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.COMPONENT_USAGES,
        payload: mockUsages,
        origin: 'http://localhost',
        timestamp: Date.now(),
      });

      service.selectComponent('Button');
      TestBed.flushEffects();

      const preset = service.selectedComponentPreset();
      expect(preset).toEqual({
        usage: [
          {
            id: 'target',
            component: 'Button',
            text: 'From Cache',
          },
        ],
      });
    });

    it('returns null for selectedComponentPreset while usages are loading and cache is empty', () => {
      const mockCatalog: Catalog = {
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {
          Button: {
            type: 'object',
            properties: {text: {type: 'string'}},
          },
        },
      };
      catalogManagementMock.activeCatalog.set(mockCatalog);
      service.setGalleryActive(true);
      service.selectComponent('Button');
      TestBed.flushEffects();

      expect(service.loadingUsages()).toBe(true);
      expect(service.cachedUsages()).toBeNull();
      expect(service.selectedComponentPreset()).toBeNull();
    });

    it('clears active timeouts when activeCatalog changes', () => {
      const spy = vi.spyOn(global, 'clearTimeout');
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/catalog1.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      const timeoutId = service['usageTimeoutId'];
      expect(timeoutId).toBeDefined();

      // Change catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/catalog2.json',
        components: {},
      });
      TestBed.flushEffects();

      expect(spy).toHaveBeenCalledWith(timeoutId);
    });

    it('clears active timeouts when galleryActive becomes false', () => {
      const spy = vi.spyOn(global, 'clearTimeout');
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      const timeoutId = service['usageTimeoutId'];
      expect(timeoutId).toBeDefined();

      service.setGalleryActive(false);
      TestBed.flushEffects();

      expect(spy).toHaveBeenCalledWith(timeoutId);
    });

    it('handles timeout callback when loading is already false', () => {
      const spyClear = vi.spyOn(global, 'clearTimeout').mockImplementation(() => {});
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      // Receive usages to set loadingUsages to false
      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.COMPONENT_USAGES,
        payload: {},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      expect(service.loadingUsages()).toBe(false);

      // Now run the timeout (which wasn't cleared because clearTimeout was mocked)
      vi.runAllTimers();

      // The timeout callback ran, but it should not have set cachedUsages to {}
      expect(service.cachedUsages()).toEqual({});

      spyClear.mockRestore();
    });

    it('ignores messages that are not of type COMPONENT_USAGES', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      expect(service.loadingUsages()).toBe(true);

      hostCommunicationMock.messageStream$.next({
        type: 'SOME_OTHER_MESSAGE_TYPE' as unknown as PreviewBridgeMessageType,
        payload: {},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });

      expect(service.loadingUsages()).toBe(true);
      expect(service.cachedUsages()).toBeNull();
    });

    it('handles COMPONENT_USAGES message when usageTimeoutId is undefined', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      // Clear the timeout manually to simulate undefined timeoutId
      service['usageTimeoutId'] = undefined;

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.COMPONENT_USAGES,
        payload: {Button: {usage: []}},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });

      expect(service.loadingUsages()).toBe(false);
      expect(service.cachedUsages()).toEqual({Button: {usage: []}});
    });

    it('sets cachedUsages to empty object when COMPONENT_USAGES payload is null', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/default_catalog.json',
        components: {},
      });
      service.setGalleryActive(true);
      TestBed.flushEffects();

      hostCommunicationMock.messageStream$.next({
        type: PreviewBridgeMessageType.COMPONENT_USAGES,
        payload: null,
        origin: 'http://localhost',
        timestamp: Date.now(),
      });

      expect(service.loadingUsages()).toBe(false);
      expect(service.cachedUsages()).toEqual({});
    });
  });
});
