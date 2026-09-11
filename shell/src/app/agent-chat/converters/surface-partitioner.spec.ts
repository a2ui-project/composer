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

import {RenderA2uiItem} from 'a2ui-bridge';
import {describe, it, expect} from 'vitest';
import {
  hasA2uiCanvasComponent,
  isA2uiItem,
  isA2uiMimeType,
  mergeA2uiItems,
  normalizeA2uiItems,
  partitionA2uiSurfacePayload,
  unwrapCanvasForRenderer,
  A2UI_MIME_TYPE,
  LEGACY_A2UI_MIME_TYPE,
} from './surface-partitioner';

describe('SurfacePartitioner', () => {
  describe('isA2uiMimeType and MIME type constants', () => {
    it('validates canonical and legacy A2UI MIME types', () => {
      expect(isA2uiMimeType(A2UI_MIME_TYPE)).toBe(true);
      expect(isA2uiMimeType(LEGACY_A2UI_MIME_TYPE)).toBe(true);
      expect(isA2uiMimeType('application/json')).toBe(false);
      expect(isA2uiMimeType(undefined)).toBe(false);
      expect(isA2uiMimeType(null)).toBe(false);
    });
  });

  describe('normalizeA2uiItems and hasA2uiCanvasComponent', () => {
    it('normalizes items ensuring version v0.9', () => {
      const raw = [{createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
      const normalized = normalizeA2uiItems(raw);
      expect(normalized.length).toBe(1);
      expect(normalized[0].version).toBe('v0.9');
      expect(normalized[0].createSurface).toBeDefined();
    });

    it('returns empty array for invalid inputs', () => {
      expect(normalizeA2uiItems(null as unknown as unknown[])).toEqual([]);
      expect(normalizeA2uiItems([null, 'invalid', 123])).toEqual([]);
    });

    it('identifies server rendering commands and rejects client action echoes', () => {
      expect(isA2uiItem({createSurface: {surfaceId: 's1'}})).toBe(true);
      expect(isA2uiItem({updateComponents: {surfaceId: 's1', components: []}})).toBe(true);
      expect(isA2uiItem({updateDataModel: {surfaceId: 's1', value: {}}})).toBe(true);
      expect(isA2uiItem({deleteSurface: {surfaceId: 's1'}})).toBe(true);
      expect(isA2uiItem({beginRendering: {surfaceId: 's1'}})).toBe(true);

      // Rejects superseded v0.8 update spellings, which Composer does not support
      expect(isA2uiItem({surfaceUpdate: {surfaceId: 's1'}})).toBe(false);
      expect(isA2uiItem({dataModelUpdate: {surfaceId: 's1'}})).toBe(false);

      // Rejects tool calls
      expect(isA2uiItem({name: 'tool_fn', args: {}})).toBe(false);
      // Rejects echoed client action messages without server update keys
      expect(isA2uiItem({userAction: {name: 'submit'}})).toBe(false);
      expect(isA2uiItem({action: {name: 'submit'}})).toBe(false);
      expect(isA2uiItem({clientEvent: {name: 'click'}})).toBe(false);
    });

    it('filters out non-A2UI items such as tool calls and echoed client actions', () => {
      const mixed = [
        {createSurface: {surfaceId: 's1', catalogId: 'c1'}},
        {name: 'show_vacation_booking_form', args: {}, id: 'call_123'},
        {userAction: {name: 'submit_clicked'}},
      ];
      const normalized = normalizeA2uiItems(mixed);
      expect(normalized.length).toBe(1);
      expect(normalized[0].createSurface).toBeDefined();
    });

    it('deduplicates redundant createSurface commands for the same surfaceId', () => {
      const duplicateCreate = [
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c1'}},
        {updateComponents: {surfaceId: 'surf_1', components: [{id: 'r', component: 'Text'}]}},
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c1'}},
        {updateDataModel: {surfaceId: 'surf_1', value: {k: 'v'}}},
      ];
      const normalized = normalizeA2uiItems(duplicateCreate);
      expect(normalized.length).toBe(3);
      expect(normalized[0].createSurface?.surfaceId).toBe('surf_1');
      expect(normalized[1].updateComponents?.surfaceId).toBe('surf_1');
      expect(normalized[2].updateDataModel?.surfaceId).toBe('surf_1');
    });

    it('allows re-creating a surface after deleteSurface', () => {
      const reCreate = [
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c1'}},
        {deleteSurface: {surfaceId: 'surf_1'}},
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c2'}},
      ];
      const normalized = normalizeA2uiItems(reCreate);
      expect(normalized.length).toBe(3);
      expect(normalized[0].createSurface?.catalogId).toBe('c1');
      expect(normalized[1].deleteSurface?.surfaceId).toBe('surf_1');
      expect(normalized[2].createSurface?.catalogId).toBe('c2');
    });

    it('detects canvas components correctly', () => {
      expect(hasA2uiCanvasComponent([])).toBe(false);
      expect(
        hasA2uiCanvasComponent([
          {
            version: 'v0.9',
            updateComponents: {
              surfaceId: 's1',
              components: [{id: 'root', component: 'Canvas'}],
            },
          },
        ]),
      ).toBe(true);
      expect(
        hasA2uiCanvasComponent([
          {
            version: 'v0.9',
            createSurface: {
              surfaceId: 's1',
              catalogId: 'c1',
              component: 'canvas',
            },
          },
        ]),
      ).toBe(true);
      expect(
        hasA2uiCanvasComponent([
          {
            version: 'v0.9',
            updateComponents: {
              surfaceId: 's1',
              components: [
                {id: 'card-1', component: 'Card'},
                {id: 'text-1', component: 'Text'},
              ],
            },
          },
        ]),
      ).toBe(false);
    });

    it('unwraps canvas for renderer', () => {
      const items = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
      expect(unwrapCanvasForRenderer(items)).toEqual(items);
    });

    it('partitions mixed surface containing List with 9 non-Canvas cards and 1 Canvas form', () => {
      const mixedPayload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'surface-main', catalogId: 'catalog-1'},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'surface-main',
            components: [
              {
                id: 'root-list',
                component: {
                  List: {
                    children: [
                      'card-1',
                      'card-2',
                      'card-3',
                      'card-4',
                      'card-5',
                      'card-6',
                      'card-7',
                      'card-8',
                      'card-9',
                      'canvas-node',
                    ],
                  },
                },
              },
              {id: 'card-1', component: {Card: {title: 'Card 1'}}},
              {id: 'card-2', component: {Card: {title: 'Card 2'}}},
              {id: 'card-3', component: {Card: {title: 'Card 3'}}},
              {id: 'card-4', component: {Card: {title: 'Card 4'}}},
              {id: 'card-5', component: {Card: {title: 'Card 5'}}},
              {id: 'card-6', component: {Card: {title: 'Card 6'}}},
              {id: 'card-7', component: {Card: {title: 'Card 7'}}},
              {id: 'card-8', component: {Card: {title: 'Card 8'}}},
              {id: 'card-9', component: {Card: {title: 'Card 9'}}},
              {
                id: 'canvas-node',
                component: {
                  Canvas: {
                    title: 'Flight Reservation Form',
                    child: 'form-root',
                  },
                },
              },
              {
                id: 'form-root',
                component: {
                  Form: {
                    children: ['field-origin', 'field-dest', 'btn-submit'],
                  },
                },
              },
              {id: 'field-origin', component: {TextField: {label: 'Origin'}}},
              {id: 'field-dest', component: {TextField: {label: 'Destination'}}},
              {id: 'btn-submit', component: {Button: {text: 'Book Flight'}}},
            ],
          },
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(mixedPayload);

      expect(partitioned.hasCanvas).toBe(true);
      expect(partitioned.canvasArtifacts[0].cardTitle).toBe('Flight Reservation Form');

      // 1. Validate Inline Payload
      expect(partitioned.inlinePayload).not.toBeNull();
      const inlineComps =
        (partitioned.inlinePayload?.[1]?.updateComponents?.components as Array<
          Record<string, unknown>
        >) || [];
      expect(inlineComps.length).toBe(10); // root-list + 9 cards
      const rootList = inlineComps.find(c => c['id'] === 'root-list');
      const rootListProps = (rootList?.['component'] as Record<string, unknown>)?.[
        'List'
      ] as Record<string, unknown>;
      expect(rootListProps?.['children']).toEqual([
        'card-1',
        'card-2',
        'card-3',
        'card-4',
        'card-5',
        'card-6',
        'card-7',
        'card-8',
        'card-9',
      ]);
      // Canvas node and its form descendants must NOT be in inline payload
      expect(inlineComps.some(c => c['id'] === 'canvas-node')).toBe(false);
      expect(inlineComps.some(c => c['id'] === 'form-root')).toBe(false);

      // 2. Validate Canvas Payload (RHS)
      expect(partitioned.canvasArtifacts.length).toBe(1);
      const canvasPayload = partitioned.canvasArtifacts[0].payload;
      expect(canvasPayload).not.toBeNull();
      const canvasComps =
        (canvasPayload?.[1]?.updateComponents?.components as Array<Record<string, unknown>>) || [];
      expect(canvasComps.length).toBe(4); // form-root + 2 textfields + 1 button
      expect(canvasComps.map(c => c['id'])).toEqual([
        'root',
        'field-origin',
        'field-dest',
        'btn-submit',
      ]);
      // Non-canvas List and 9 cards must NOT be in RHS canvas payload
      expect(canvasComps.some(c => c['id'] === 'root-list')).toBe(false);
      expect(canvasComps.some(c => c['id'] === 'card-1')).toBe(false);
    });

    it('handles standalone pure canvas surface', () => {
      const pureCanvasPayload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'canvas-only',
                component: {
                  Canvas: {
                    title: 'Interactive Dashboard',
                    child: 'dash-root',
                  },
                },
              },
              {id: 'dash-root', component: {Card: {title: 'Dashboard Content'}}},
            ],
          },
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(pureCanvasPayload);

      expect(partitioned.hasCanvas).toBe(true);
      expect(partitioned.canvasArtifacts[0].cardTitle).toBe('Interactive Dashboard');
      expect(partitioned.inlinePayload).toBeNull();
      expect(partitioned.canvasArtifacts[0].payload).not.toBeNull();
      const canvasComps =
        (partitioned.canvasArtifacts[0].payload?.[1]?.updateComponents?.components as Array<
          Record<string, unknown>
        >) || [];
      expect(canvasComps.length).toBe(1);
      expect(canvasComps[0]['id']).toBe('root');
    });

    it('handles pure non-canvas surfaces by keeping inlinePayload untouched', () => {
      const nonCanvasPayload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'text-1', component: {Text: {text: 'Hello'}}}],
          },
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(nonCanvasPayload);

      expect(partitioned.hasCanvas).toBe(false);
      expect(partitioned.inlinePayload).toEqual(nonCanvasPayload);
      expect(partitioned.canvasArtifacts).toEqual([]);
    });

    it('extracts all standard Canvas schema properties: cardTitle, cardDescription, cardIcon, autoOpen, children', () => {
      const standardCanvasPayload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'canvas-root',
                component: {
                  Canvas: {
                    children: ['card-a', 'card-b'],
                    cardTitle: 'Flight Summary',
                    cardDescription: 'Review flight itinerary details',
                    cardIcon: 'flight_takeoff',
                    autoOpen: false,
                  },
                },
              },
              {id: 'card-a', component: {Card: {title: 'Outbound'}}},
              {id: 'card-b', component: {Card: {title: 'Inbound'}}},
            ],
          },
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(standardCanvasPayload);

      expect(partitioned.hasCanvas).toBe(true);
      expect(partitioned.canvasArtifacts.length).toBe(1);
      expect(partitioned.canvasArtifacts[0].cardTitle).toBe('Flight Summary');
      expect(partitioned.canvasArtifacts[0].cardDescription).toBe(
        'Review flight itinerary details',
      );
      expect(partitioned.canvasArtifacts[0].cardIcon).toBe('flight_takeoff');
      expect(partitioned.canvasArtifacts[0].autoOpen).toBe(false);

      const canvasComps =
        (partitioned.canvasArtifacts[0].payload?.[1]?.updateComponents?.components as Array<
          Record<string, unknown>
        >) || [];
      expect(canvasComps.map(c => c['id'])).toEqual(['root', 'card-a', 'card-b']);
    });

    it('applies default cardTitle (Interactive content), cardIcon (apps), and autoOpen (true) when omitted', () => {
      const minimalCanvasPayload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'canvas-root',
                component: {
                  Canvas: {
                    children: ['card-content'],
                  },
                },
              },
              {id: 'card-content', component: {Card: {title: 'Content'}}},
            ],
          },
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(minimalCanvasPayload);

      expect(partitioned.hasCanvas).toBe(true);
      expect(partitioned.canvasArtifacts.length).toBe(1);
      expect(partitioned.canvasArtifacts[0].cardTitle).toBe('Interactive content');
      expect(partitioned.canvasArtifacts[0].cardIcon).toBe('apps');
      expect(partitioned.canvasArtifacts[0].autoOpen).toBe(true);
    });

    it('partitions surface containing multiple distinct Canvas components into separate CanvasArtifacts', () => {
      const multiCanvasPayload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {
                id: 'root-list',
                component: {
                  List: {
                    children: ['hotel-card', 'canvas-flight', 'car-card', 'canvas-cruise'],
                  },
                },
              },
              {id: 'hotel-card', component: {Card: {title: 'Hotel Info'}}},
              {
                id: 'canvas-flight',
                component: {
                  Canvas: {
                    cardTitle: 'Flight Details',
                    cardDescription: 'Select seat and meal',
                    cardIcon: 'flight',
                    autoOpen: false,
                    children: ['flight-form'],
                  },
                },
              },
              {id: 'flight-form', component: {Card: {title: 'Flight Form'}}},
              {id: 'car-card', component: {Card: {title: 'Car Rental'}}},
              {
                id: 'canvas-cruise',
                component: {
                  Canvas: {
                    cardTitle: 'Cruise Reservation',
                    cardDescription: 'Choose cabin type',
                    cardIcon: 'directions_boat',
                    autoOpen: true,
                    children: ['cruise-form'],
                  },
                },
              },
              {id: 'cruise-form', component: {Card: {title: 'Cruise Form'}}},
            ],
          },
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(multiCanvasPayload);

      expect(partitioned.hasCanvas).toBe(true);
      expect(partitioned.canvasArtifacts.length).toBe(2);

      // First Canvas Artifact (Flight)
      expect(partitioned.canvasArtifacts[0].id).toBe('canvas-flight');
      expect(partitioned.canvasArtifacts[0].cardTitle).toBe('Flight Details');
      expect(partitioned.canvasArtifacts[0].cardDescription).toBe('Select seat and meal');
      expect(partitioned.canvasArtifacts[0].cardIcon).toBe('flight');
      expect(partitioned.canvasArtifacts[0].autoOpen).toBe(false);
      const flightComps =
        (partitioned.canvasArtifacts[0].payload?.[1]?.updateComponents?.components as Array<
          Record<string, unknown>
        >) || [];
      expect(flightComps.map(c => c['id'])).toEqual(['root']);

      // Second Canvas Artifact (Cruise)
      expect(partitioned.canvasArtifacts[1].id).toBe('canvas-cruise');
      expect(partitioned.canvasArtifacts[1].cardTitle).toBe('Cruise Reservation');
      expect(partitioned.canvasArtifacts[1].cardDescription).toBe('Choose cabin type');
      expect(partitioned.canvasArtifacts[1].cardIcon).toBe('directions_boat');
      expect(partitioned.canvasArtifacts[1].autoOpen).toBe(true);
      const cruiseComps =
        (partitioned.canvasArtifacts[1].payload?.[1]?.updateComponents?.components as Array<
          Record<string, unknown>
        >) || [];
      expect(cruiseComps.map(c => c['id'])).toEqual(['root']);

      // Inline payload contains root-list with hotel-card and car-card (canvas nodes removed)
      const inlineComps =
        (partitioned.inlinePayload?.[1]?.updateComponents?.components as Array<
          Record<string, unknown>
        >) || [];
      expect(inlineComps.length).toBe(3);
      expect(inlineComps.map(c => c['id'])).toEqual(['root-list', 'hotel-card', 'car-card']);
    });

    it('preserves deleteSurface items in partitioned payload', () => {
      const payloadWithDelete = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'surf-1', catalogId: 'cat-1'},
        },
        {
          version: 'v0.9',
          deleteSurface: {surfaceId: 'surf-old'},
        },
      ];

      const partitioned = partitionA2uiSurfacePayload(payloadWithDelete);
      expect(partitioned.hasCanvas).toBe(false);
      expect(partitioned.inlinePayload).not.toBeNull();
      expect(
        partitioned.inlinePayload?.some(item => item.deleteSurface?.surfaceId === 'surf-old'),
      ).toBe(true);
    });
  });

  describe('mergeA2uiItems', () => {
    it('appends delta updates when new items do not recreate the surface', () => {
      const existing = [
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c1'}},
        {updateComponents: {surfaceId: 'surf_1', components: [{id: 'r', component: 'Card'}]}},
      ];
      const delta = [{updateDataModel: {surfaceId: 'surf_1', value: {count: 1}}}];
      const merged = mergeA2uiItems(
        existing as unknown as RenderA2uiItem[],
        delta as unknown as RenderA2uiItem[],
      );
      expect(merged.length).toBe(3);
      expect(merged[2].updateDataModel?.surfaceId).toBe('surf_1');
    });

    it('replaces prior surface items when new items re-declare the surface via createSurface', () => {
      const existing = [
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c1'}},
        {updateComponents: {surfaceId: 'surf_1', components: [{id: 'old', component: 'Card'}]}},
      ];
      const fullUpdate = [
        {createSurface: {surfaceId: 'surf_1', catalogId: 'c1'}},
        {updateComponents: {surfaceId: 'surf_1', components: [{id: 'new', component: 'Card'}]}},
        {updateDataModel: {surfaceId: 'surf_1', value: {count: 2}}},
      ];
      const merged = mergeA2uiItems(
        existing as unknown as RenderA2uiItem[],
        fullUpdate as unknown as RenderA2uiItem[],
      );
      expect(merged.length).toBe(3);
      expect(merged[0].createSurface?.surfaceId).toBe('surf_1');
      const mergedComponents = merged[1].updateComponents?.components as
        Array<{id: string}> | undefined;
      expect(mergedComponents?.[0].id).toBe('new');
    });
  });
});
