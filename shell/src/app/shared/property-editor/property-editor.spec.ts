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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {manualChangeDetection} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal} from '@angular/core';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PropertyEditor} from './property-editor';
import {
  createDefaultPropertyValue,
  describeUneditableValue,
  matchesSimpleSchema,
  resolvePropertyControl,
} from './property-control';
import {PropertyEditorHarness} from './test/property-editor.harness';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog, CatalogComponentSchema} from '../../storage/models/catalog-storage.model';
import {ErrorLogger} from '../../debug/error-logger.service';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
  readonly mergedActiveCatalog = signal<Catalog | null>(null);
}

const dynamic = (literal: Record<string, unknown>) => ({
  oneOf: [literal, {$ref: '#/$defs/DataBinding'}, {$ref: '#/$defs/FunctionCall'}],
});

const basicCatalog: Catalog = {
  catalogId: 'https://a2ui.org/basic_catalog.json',
  $defs: {
    DataBinding: {type: 'object', properties: {path: {type: 'string'}}, required: ['path']},
    FunctionCall: {type: 'object', properties: {call: {type: 'string'}}, required: ['call']},
    DynamicString: dynamic({type: 'string'}),
    DynamicStringList: dynamic({type: 'array', items: {type: 'string'}}),
    ComponentCommon: {
      type: 'object',
      properties: {id: {type: 'string'}, weight: {type: 'number'}},
      required: ['id'],
    },
  },
  components: {
    ChoicePicker: {
      type: 'object',
      allOf: [
        {$ref: '#/$defs/ComponentCommon'},
        {
          type: 'object',
          properties: {
            component: {const: 'ChoicePicker'},
            label: {$ref: '#/$defs/DynamicString'},
            variant: {type: 'string', enum: ['multipleSelection', 'mutuallyExclusive']},
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {label: {$ref: '#/$defs/DynamicString'}, value: {type: 'string'}},
                required: ['label', 'value'],
              },
            },
            value: {$ref: '#/$defs/DynamicStringList'},
            displayStyle: {type: 'string', enum: ['checkbox', 'chips']},
            filterable: {type: 'boolean'},
          },
          required: ['component', 'options', 'value'],
        },
      ],
    },
    DateTimeInput: {
      type: 'object',
      allOf: [
        {$ref: '#/$defs/ComponentCommon'},
        {
          type: 'object',
          properties: {
            component: {const: 'DateTimeInput'},
            value: {$ref: '#/$defs/DynamicString'},
            enableDate: {type: 'boolean'},
            enableTime: {type: 'boolean'},
            min: {$ref: '#/$defs/DynamicString'},
            label: {$ref: '#/$defs/DynamicString'},
          },
          required: ['component', 'value'],
        },
      ],
    },
  },
};

const jsonCatalog: Catalog = {
  ...basicCatalog,
  components: {
    ...basicCatalog.components,
    StyledBox: {
      type: 'object',
      allOf: [
        {$ref: '#/$defs/ComponentCommon'},
        {
          type: 'object',
          required: ['component'],
          properties: {
            component: {const: 'StyledBox'},
            style: {type: 'object', additionalProperties: true},
          },
        },
      ],
    },
    ActionBox: {
      type: 'object',
      allOf: [
        {$ref: '#/$defs/ComponentCommon'},
        {
          type: 'object',
          required: ['component', 'count', 'config'],
          properties: {
            component: {const: 'ActionBox'},
            count: {type: 'number'},
            config: {type: 'object', additionalProperties: true},
            metadata: {
              type: 'object',
              properties: {
                hint: {type: 'string'},
                tag: {type: 'string'},
              },
            },
          },
        },
      ],
    },
  },
};

describe('PropertyEditor Component', () => {
  let fixture: ComponentFixture<PropertyEditor>;
  let harness: PropertyEditorHarness;
  let catalogManagementMock: MockCatalogManagement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyEditor],
      providers: [{provide: CatalogManagement, useClass: MockCatalogManagement}, ErrorLogger],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyEditor);
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
    catalogManagementMock.activeCatalog.set(basicCatalog);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, PropertyEditorHarness);
  });

  it('resolves properties automatically from the active catalog and component without explicit properties input', async () => {
    fixture.componentRef.setInput('component', {
      id: 'picker-1',
      component: 'ChoicePicker',
      label: 'Size',
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
    });
    fixture.detectChanges();

    expect(await harness.getPropertyNames()).toEqual([
      'options',
      'value',
      'variant',
      'displayStyle',
      'filterable',
      'weight',
      'label',
    ]);
    expect(await harness.getPropertySectionHeadings()).toEqual(['Common properties']);
    expect(await harness.getEmptyStateText()).toBeNull();
  });

  it('renders the selection prompt (or custom emptyMessage) when component is null or undefined', async () => {
    expect(await harness.getEmptyStateText()).toBe('Select a component to inspect its properties.');

    fixture.componentRef.setInput(
      'emptyMessage',
      'Click a component in the preview to edit its properties.',
    );
    fixture.detectChanges();

    expect(await harness.getEmptyStateText()).toBe(
      'Click a component in the preview to edit its properties.',
    );
  });

  it('renders a zero-properties message when a component has no editable catalog properties', async () => {
    fixture.componentRef.setInput('component', {
      id: 'divider-1',
      component: 'Divider',
    });
    fixture.componentRef.setInput('properties', [
      {name: 'id', description: '', type: 'string', required: true},
      {name: 'component', description: '', type: 'string', required: true},
    ]);
    fixture.detectChanges();

    expect(await harness.getPropertyNames()).toEqual([]);
    expect(await harness.getEmptyStateText()).toBe('No editable properties for this component.');
  });

  it('prefers mergedActiveCatalog over activeCatalog so secondary multi-catalog components resolve schemas', async () => {
    catalogManagementMock.activeCatalog.set(basicCatalog);
    catalogManagementMock.mergedActiveCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('component', {
      id: 'box-secondary',
      component: 'StyledBox',
      style: {padding: 8},
    });
    fixture.detectChanges();

    expect(await harness.getPropertyNames()).toEqual(['style', 'weight']);
    expect(await harness.getPropertyControlKind('style')).toBe('json');
  });

  it('blocks property edits when disabled input is true', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('component', {
      id: 'picker-1',
      component: 'ChoicePicker',
      label: 'Size',
      filterable: true,
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
    });
    fixture.detectChanges();

    await harness.removeProperty('filterable');

    expect(componentChanges).toEqual([]);
  });

  it('emits componentChange when a property is edited', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    const initial = {
      id: 'picker-1',
      component: 'ChoicePicker',
      label: 'Size',
      filterable: true,
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
    };
    fixture.componentRef.setInput('component', initial);
    fixture.detectChanges();

    await harness.editProperty('label', 'Updated Size');

    expect(componentChanges.at(-1)).toEqual({
      ...initial,
      label: 'Updated Size',
    });
  });

  it('emits componentChange without the removed key when an optional property is removed', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'picker-1',
      component: 'ChoicePicker',
      label: 'Size',
      filterable: true,
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
    });
    fixture.detectChanges();

    await harness.removeProperty('filterable');

    expect(componentChanges.at(-1)).toEqual({
      id: 'picker-1',
      component: 'ChoicePicker',
      label: 'Size',
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
    });
  });

  it('updates nested object fields while preserving sibling fields', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 3,
      config: {retry: true},
      metadata: {hint: 'Old', tag: 'v1'},
    });
    fixture.detectChanges();

    await harness.editProperty('metadata.hint', 'Updated');

    expect(componentChanges.at(-1)).toEqual({
      id: 'action-1',
      component: 'ActionBox',
      count: 3,
      config: {retry: true},
      metadata: {hint: 'Updated', tag: 'v1'},
    });
  });

  it('prunes an optional parent object when its last nested field is cleared', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 3,
      config: {retry: true},
      metadata: {hint: 'Only field'},
    });
    fixture.detectChanges();

    await harness.editProperty('metadata.hint', '');

    expect(componentChanges.at(-1)).toEqual({
      id: 'action-1',
      component: 'ActionBox',
      count: 3,
      config: {retry: true},
    });
  });

  it('clones the last entry when adding an item to a non-empty array', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    const lastOption = {label: 'Large', value: 'l'};
    fixture.componentRef.setInput('component', {
      id: 'picker-1',
      component: 'ChoicePicker',
      options: [{label: 'Small', value: 's'}, lastOption],
      value: ['s'],
    });
    fixture.detectChanges();

    await harness.addArrayItem('options');

    const updatedOptions = componentChanges.at(-1)?.['options'] as Array<Record<string, unknown>>;
    expect(updatedOptions).toEqual([
      {label: 'Small', value: 's'},
      {label: 'Large', value: 'l'},
      {label: 'Large', value: 'l'},
    ]);
    expect(updatedOptions[2]).not.toBe(lastOption);
  });

  it('creates a default entry from the item control when adding to an empty array', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'picker-1',
      component: 'ChoicePicker',
      options: [],
      value: [],
    });
    fixture.detectChanges();

    await harness.addArrayItem('options');

    expect(componentChanges.at(-1)?.['options']).toEqual([{label: '', value: ''}]);
  });

  it('removes the targeted entry when deleting an array item', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'picker-1',
      component: 'ChoicePicker',
      options: [{label: 'Small', value: 's'}],
      value: ['s', 'm', 'l'],
    });
    fixture.detectChanges();

    await harness.deleteArrayItem('value', 1);

    expect(componentChanges.at(-1)?.['value']).toEqual(['s', 'l']);
  });

  it('removes optional text properties when cleared', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'dt-1',
      component: 'DateTimeInput',
      value: '2026-01-01',
      label: 'Start date',
    });
    fixture.detectChanges();

    await harness.editProperty('label', '');

    expect(componentChanges.at(-1)).toEqual({
      id: 'dt-1',
      component: 'DateTimeInput',
      value: '2026-01-01',
    });
  });

  it('keeps required text properties as empty string when cleared', async () => {
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'dt-1',
      component: 'DateTimeInput',
      value: '2026-01-01',
    });
    fixture.detectChanges();

    await harness.editProperty('value', '');

    expect(componentChanges.at(-1)).toEqual({
      id: 'dt-1',
      component: 'DateTimeInput',
      value: '',
    });
  });

  it('removes optional numbers when cleared', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      weight: 2,
      config: {},
    });
    fixture.detectChanges();

    await harness.editProperty('weight', '');

    expect(componentChanges).toEqual([
      {
        id: 'action-1',
        component: 'ActionBox',
        count: 5,
        config: {},
      },
    ]);
  });

  it('emits statusMessage without componentChange when a required number is cleared', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const changeSpy = vi.fn();
    const statuses: string[] = [];
    fixture.componentInstance.componentChange.subscribe(changeSpy);
    fixture.componentInstance.statusMessage.subscribe(msg => statuses.push(msg));
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();

    await harness.editProperty('count', '');

    expect(changeSpy).not.toHaveBeenCalled();
    expect(statuses).toEqual(['Enter a number for count. Preview keeps its previous value.']);
  });

  it('surfaces inline syntax error and preserves raw text across same-component updates for invalid JSON edits', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const changeSpy = vi.fn();
    fixture.componentInstance.componentChange.subscribe(changeSpy);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 1,
      config: {retry: true},
    });
    fixture.detectChanges();

    await harness.editJsonProperty('config', '{invalid');
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 1,
      config: {retry: false},
    });
    fixture.detectChanges();

    expect(await harness.getPropertyError('config')).toBe(
      'Invalid JSON. The example keeps its previous value.',
    );
    expect(await harness.getJsonPropertyText('config')).toBe('{invalid');
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('surfaces required-field error when a required JSON field is blank', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const changeSpy = vi.fn();
    fixture.componentInstance.componentChange.subscribe(changeSpy);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 1,
      config: {retry: true},
    });
    fixture.detectChanges();

    await harness.editJsonProperty('config', '   ');

    expect(await harness.getPropertyError('config')).toBe('config is required.');
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('removes an optional JSON property when cleared with whitespace', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'box-1',
      component: 'StyledBox',
      style: {padding: 8},
    });
    fixture.detectChanges();

    await harness.editJsonProperty('style', '   ');

    expect(await harness.getPropertyError('style')).toBeNull();
    expect(componentChanges).toEqual([
      {
        id: 'box-1',
        component: 'StyledBox',
      },
    ]);
  });

  it('clears inline JSON error and emits componentChange when valid JSON is entered after an error', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.componentChange.subscribe(comp => componentChanges.push(comp));
    fixture.componentRef.setInput('component', {
      id: 'box-1',
      component: 'StyledBox',
      style: {padding: 8},
    });
    fixture.detectChanges();
    await harness.editJsonProperty('style', '{invalid');

    await harness.editJsonProperty('style', '{"padding": 16}');

    expect(await harness.getPropertyError('style')).toBeNull();
    expect(componentChanges).toEqual([
      {
        id: 'box-1',
        component: 'StyledBox',
        style: {padding: 16},
      },
    ]);
  });

  it('surfaces inline error and suppresses componentChange when a JSON field violates the catalog schema', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('component', {
      id: 'box-1',
      component: 'StyledBox',
      style: {padding: 8},
    });
    fixture.detectChanges();
    const statusSpy = vi.fn();
    const changeSpy = vi.fn();
    fixture.componentInstance.statusMessage.subscribe(statusSpy);
    fixture.componentInstance.componentChange.subscribe(changeSpy);

    await harness.editJsonProperty('style', '123');

    expect(await harness.getPropertyError('style')).toBe(
      '"style" on "box-1" does not match its catalog property type or choices. The example keeps its previous value.',
    );
    expect(statusSpy.mock.calls).toEqual([['']]);
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('clears inline JSON field errors when clearErrors() is called', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('component', {
      id: 'box-1',
      component: 'StyledBox',
      style: {padding: 8},
    });
    fixture.detectChanges();
    await harness.editJsonProperty('style', '123');

    fixture.componentInstance.clearErrors();
    fixture.detectChanges();

    expect(await harness.getPropertyError('style')).toBeNull();
  });

  it('clears inline JSON field errors automatically when the target component identity changes', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('component', {
      id: 'box-1',
      component: 'StyledBox',
      style: {padding: 8},
    });
    fixture.detectChanges();
    await harness.editJsonProperty('style', '123');

    fixture.componentRef.setInput('component', {
      id: 'box-2',
      component: 'StyledBox',
      style: {padding: 16},
    });
    fixture.detectChanges();

    expect(await harness.getPropertyError('style')).toBeNull();
  });

  it('assigns distinct DOM id prefixes per instance so label[for] and aria-describedby do not collide', async () => {
    const secondFixture = TestBed.createComponent(PropertyEditor);
    try {
      const secondHarness = await TestbedHarnessEnvironment.harnessForFixture(
        secondFixture,
        PropertyEditorHarness,
      );
      const sample = {
        id: 'box-1',
        component: 'StyledBox',
        style: {padding: 8},
      };
      catalogManagementMock.activeCatalog.set(jsonCatalog);
      fixture.componentRef.setInput('component', sample);
      secondFixture.componentRef.setInput('component', sample);
      fixture.detectChanges();
      secondFixture.detectChanges();

      await harness.editJsonProperty('style', '123');

      const firstLabelFor = await harness.getPropertyLabelFor('style');
      const secondLabelFor = await secondHarness.getPropertyLabelFor('style');
      const firstControlId = await harness.getPropertyControlId('style');
      const secondControlId = await secondHarness.getPropertyControlId('style');
      const firstErrorId = await harness.getPropertyErrorId('style');
      const firstDescribedBy = await harness.getPropertyAriaDescribedBy('style');

      expect(firstLabelFor).toMatch(/^property-editor-\d+-style$/);
      expect(secondLabelFor).toMatch(/^property-editor-\d+-style$/);
      expect(firstLabelFor).not.toBe(secondLabelFor);
      expect(firstControlId).toBe(firstLabelFor);
      expect(secondControlId).toBe(secondLabelFor);
      expect(firstErrorId).toMatch(/^property-editor-\d+-error-style$/);
      expect(firstDescribedBy).toBe(firstErrorId);
      expect(await secondHarness.getPropertyError('style')).toBeNull();
    } finally {
      secondFixture.destroy();
    }
  });

  it('hides the component header by default', async () => {
    fixture.componentRef.setInput('component', {
      id: 'date-1',
      component: 'DateTimeInput',
      value: '2026-01-01',
    });
    fixture.detectChanges();

    expect(await harness.getHeaderText()).toBeNull();
  });

  it('renders Type #id when showHeader is true and trims id whitespace', async () => {
    fixture.componentRef.setInput('showHeader', true);
    fixture.componentRef.setInput('component', {
      id: ' date-1 ',
      component: 'DateTimeInput',
      value: '2026-01-01',
    });
    fixture.detectChanges();

    expect(await harness.getHeaderText()).toBe('DateTimeInput #date-1');
  });

  it('renders only Type when showHeader is true and the component has no id', async () => {
    fixture.componentRef.setInput('showHeader', true);
    fixture.componentRef.setInput('component', {
      component: 'DateTimeInput',
      value: '2026-01-01',
    });
    fixture.detectChanges();

    expect(await harness.getHeaderText()).toBe('DateTimeInput');
  });

  it('hides the component header when no component is selected', async () => {
    fixture.componentRef.setInput('showHeader', true);
    fixture.componentRef.setInput('component', null);
    fixture.detectChanges();

    expect(await harness.getHeaderText()).toBeNull();
  });

  it('keeps inline status and its live region hidden by default when showStatus is false', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const statuses: string[] = [];
    fixture.componentInstance.statusMessage.subscribe(message => statuses.push(message));
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();

    await harness.editProperty('count', '');

    expect(await harness.hasStatusLiveRegion()).toBe(false);
    expect(await harness.getStatusText()).toBeNull();
    expect(statuses).toEqual(['Enter a number for count. Preview keeps its previous value.']);
  });

  it('keeps the status live region mounted and updates inline status on invalid and valid edits', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();

    expect(await harness.hasStatusLiveRegion()).toBe(true);
    expect(await harness.getStatusText()).toBeNull();

    await harness.editProperty('count', '');
    expect(await harness.getStatusText()).toBe(
      'Enter a number for count. Preview keeps its previous value.',
    );

    await harness.editProperty('count', '7');
    expect(await harness.hasStatusLiveRegion()).toBe(true);
    expect(await harness.getStatusText()).toBeNull();
  });

  it('clears inline status feedback and emits an empty statusMessage when clearErrors() is called', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const statuses: string[] = [];
    fixture.componentInstance.statusMessage.subscribe(message => statuses.push(message));
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();
    await harness.editProperty('count', '');
    expect(await harness.getStatusText()).toBe(
      'Enter a number for count. Preview keeps its previous value.',
    );

    fixture.componentInstance.clearErrors();
    fixture.detectChanges();

    expect(await harness.getStatusText()).toBeNull();
    expect(statuses.at(-1)).toBe('');
  });

  it('clears inline status feedback when the target component identity changes', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();
    await harness.editProperty('count', '');
    expect(await harness.getStatusText()).toBe(
      'Enter a number for count. Preview keeps its previous value.',
    );

    fixture.componentRef.setInput('component', {
      id: 'action-2',
      component: 'ActionBox',
      count: 1,
      config: {},
    });
    fixture.detectChanges();

    expect(await harness.getStatusText()).toBeNull();
  });

  it('clears prior inline status feedback when a JSON property edit fails to parse', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();
    await harness.editProperty('count', '');
    expect(await harness.getStatusText()).toBe(
      'Enter a number for count. Preview keeps its previous value.',
    );

    await harness.editJsonProperty('config', '{invalid');

    expect(await harness.getStatusText()).toBeNull();
    expect(await harness.getPropertyError('config')).toBe(
      'Invalid JSON. The example keeps its previous value.',
    );
  });

  it('ignores clearing a required number when disabled', async () => {
    catalogManagementMock.activeCatalog.set(jsonCatalog);
    const statusSpy = vi.fn();
    fixture.componentInstance.statusMessage.subscribe(statusSpy);
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentRef.setInput('component', {
      id: 'action-1',
      component: 'ActionBox',
      count: 5,
      config: {},
    });
    fixture.detectChanges();

    await harness.editProperty('count', '');

    expect(await harness.getStatusText()).toBeNull();
    expect(statusSpy).not.toHaveBeenCalled();
  });

  describe('debounced text and number edits', () => {
    const debounceMs = 300;

    const createChoicePicker = (
      overrides: Record<string, unknown> = {},
    ): Record<string, unknown> => ({
      id: 'picker-1',
      component: 'ChoicePicker',
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
      ...overrides,
    });

    const stepperCatalog: Catalog = {
      ...basicCatalog,
      components: {
        ...basicCatalog.components,
        Stepper: {
          type: 'object',
          allOf: [
            {$ref: '#/$defs/ComponentCommon'},
            {
              type: 'object',
              required: ['component', 'steps'],
              properties: {
                component: {const: 'Stepper'},
                steps: {type: 'integer'},
                enabled: {type: 'boolean'},
              },
            },
          ],
        },
      },
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('coalesces rapid text keystrokes and emits componentChange once after 300ms', async () => {
      const initial = createChoicePicker({label: 'Size'});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'S');
      await vi.advanceTimersByTimeAsync(100);
      await harness.typeProperty('label', 'Sm');
      await vi.advanceTimersByTimeAsync(100);
      await harness.typeProperty('label', 'Small');
      await vi.advanceTimersByTimeAsync(debounceMs - 1);
      const changesBeforeDebounce = [...componentChanges];
      await vi.advanceTimersByTimeAsync(1);

      expect(changesBeforeDebounce).toEqual([]);
      expect(componentChanges).toEqual([{...initial, label: 'Small'}]);
    });

    it('coalesces rapid number edits and emits componentChange once after 300ms', async () => {
      catalogManagementMock.activeCatalog.set(jsonCatalog);
      const initial = {id: 'action-1', component: 'ActionBox', count: 5, config: {}};
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('count', '1');
      await vi.advanceTimersByTimeAsync(150);
      await harness.typeProperty('count', '12');
      await vi.advanceTimersByTimeAsync(debounceMs - 1);
      const changesBeforeDebounce = [...componentChanges];
      await vi.advanceTimersByTimeAsync(1);

      expect(changesBeforeDebounce).toEqual([]);
      expect(componentChanges).toEqual([{...initial, count: 12}]);
    });

    it('skips emitting componentChange when a debounced edit reverts to the current value', async () => {
      const initial = createChoicePicker({label: 'Size'});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Temp');
      await harness.typeProperty('label', 'Size');
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(componentChanges).toEqual([]);
    });

    it('flushes a pending debounced text edit immediately on blur without re-emitting after 300ms', async () => {
      const initial = createChoicePicker({label: 'Size'});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Updated');
      const changesBeforeBlur = [...componentChanges];
      await harness.blurProperty('label');
      const changesOnBlur = [...componentChanges];
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(changesBeforeBlur).toEqual([]);
      expect(changesOnBlur).toEqual([{...initial, label: 'Updated'}]);
      expect(componentChanges).toHaveLength(1);
    });

    it('flushes a pending debounced number edit immediately on blur without re-emitting after 300ms', async () => {
      catalogManagementMock.activeCatalog.set(jsonCatalog);
      const initial = {id: 'action-1', component: 'ActionBox', count: 5, config: {}};
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('count', '12');
      const changesBeforeBlur = [...componentChanges];
      await harness.blurProperty('count');
      const changesOnBlur = [...componentChanges];
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(changesBeforeBlur).toEqual([]);
      expect(changesOnBlur).toEqual([{...initial, count: 12}]);
      expect(componentChanges).toHaveLength(1);
    });

    it('preserves a pending debounced text edit when an immediate control is triggered before 300ms', async () => {
      const initial = createChoicePicker({label: 'Size', filterable: true});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Updated');
      await harness.toggleProperty('filterable');
      const changesOnToggle = [...componentChanges];
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(changesOnToggle).toEqual([{...initial, label: 'Updated', filterable: false}]);
      expect(componentChanges).toHaveLength(1);
    });

    it('preserves a blur-flushed edit when a sibling control fires in the same frame before component updates', async () => {
      const initial = createChoicePicker({label: 'Size', filterable: true});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Updated');
      await manualChangeDetection(async () => {
        await harness.blurProperty('label');
        await harness.toggleProperty('filterable');
      });

      expect(componentChanges).toEqual([
        {...initial, label: 'Updated'},
        {...initial, label: 'Updated', filterable: false},
      ]);
    });

    it('clears the committed edit after the next render when the host keeps the previous component', async () => {
      const initial = createChoicePicker({label: 'Size', filterable: true});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.editProperty('label', 'Rejected');
      fixture.detectChanges();
      await harness.toggleProperty('filterable');

      expect(componentChanges).toEqual([
        {...initial, label: 'Rejected'},
        {...initial, filterable: false},
      ]);
    });

    it('layers consecutive debounced edits to sibling nested object fields within 300ms', async () => {
      catalogManagementMock.activeCatalog.set(jsonCatalog);
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', {
        id: 'action-1',
        component: 'ActionBox',
        count: 3,
        config: {},
        metadata: {hint: 'Old', tag: 'v1'},
      });
      fixture.detectChanges();

      await harness.typeProperty('metadata.hint', 'New');
      await harness.typeProperty('metadata.tag', 'v2');
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(componentChanges).toEqual([
        {
          id: 'action-1',
          component: 'ActionBox',
          count: 3,
          config: {},
          metadata: {hint: 'New', tag: 'v2'},
        },
      ]);
    });

    it('preserves a pending debounced array item edit when adding an array item before 300ms', async () => {
      const initial = createChoicePicker({value: ['s']});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('value.0', 'm');
      await harness.addArrayItem('value');
      const changesOnAdd = [...componentChanges];
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(changesOnAdd).toEqual([{...initial, value: ['m', 'm']}]);
      expect(componentChanges).toHaveLength(1);
    });

    it('drops a pending debounced edit and updates the input when the component updates externally before 300ms', async () => {
      const initial = createChoicePicker({id: 'picker-1', label: 'Size'});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Stale');
      fixture.componentRef.setInput(
        'component',
        createChoicePicker({id: 'picker-1', label: 'External'}),
      );
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(componentChanges).toEqual([]);
      expect(await harness.getPropertyValue('label')).toBe('External');
    });

    it('drops a pending debounced edit when disabled toggles before 300ms', async () => {
      const initial = createChoicePicker({label: 'Size', filterable: true});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Stale');
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(debounceMs);
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
      await harness.toggleProperty('filterable');

      expect(componentChanges).toEqual([{...initial, filterable: false}]);
    });

    it('drops a pending debounced edit when clearErrors() is called before 300ms', async () => {
      const initial = createChoicePicker({label: 'Size'});
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', initial);
      fixture.detectChanges();

      await harness.typeProperty('label', 'Reset me');
      fixture.componentInstance.clearErrors();
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(componentChanges).toEqual([]);
    });

    it('cancels a pending number edit without overwriting the input when a required number is cleared before 300ms', async () => {
      catalogManagementMock.activeCatalog.set(jsonCatalog);
      const componentChanges: Array<Record<string, unknown>> = [];
      const statuses: string[] = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentInstance.statusMessage.subscribe(message => statuses.push(message));
      fixture.componentRef.setInput('component', {
        id: 'action-1',
        component: 'ActionBox',
        count: 5,
        config: {},
      });
      fixture.detectChanges();

      await harness.typeProperty('count', '55');
      await harness.typeProperty('count', '');
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(componentChanges).toEqual([]);
      expect(await harness.getPropertyValue('count')).toBe('');
      expect(statuses.at(-1)).toBe('Enter a number for count. Preview keeps its previous value.');
    });

    it('cancels a pending debounced edit without overwriting the input or flushing on blur when a schema-invalid value is entered', async () => {
      catalogManagementMock.activeCatalog.set(stepperCatalog);
      const componentChanges: Array<Record<string, unknown>> = [];
      const statuses: string[] = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentInstance.statusMessage.subscribe(message => statuses.push(message));
      fixture.componentRef.setInput('component', {id: 'step-1', component: 'Stepper', steps: 2});
      fixture.detectChanges();

      await harness.typeProperty('steps', '4');
      await harness.typeProperty('steps', '4.5');
      await harness.blurProperty('steps');
      await vi.advanceTimersByTimeAsync(debounceMs);

      expect(componentChanges).toEqual([]);
      expect(await harness.getPropertyValue('steps')).toBe('4.5');
      expect(statuses.at(-1)).toBe(
        '"steps" on "step-1" does not match its catalog property type or choices. Preview keeps its previous value.',
      );
    });

    it('does not leak a cancelled pending debounced edit into a subsequent discrete control edit', async () => {
      catalogManagementMock.activeCatalog.set(stepperCatalog);
      const componentChanges: Array<Record<string, unknown>> = [];
      fixture.componentInstance.componentChange.subscribe(updatedComponent =>
        componentChanges.push(updatedComponent),
      );
      fixture.componentRef.setInput('component', {
        id: 'step-1',
        component: 'Stepper',
        steps: 2,
        enabled: false,
      });
      fixture.detectChanges();

      await harness.typeProperty('steps', '4');
      await harness.typeProperty('steps', '4.5');
      await harness.toggleProperty('enabled');

      expect(componentChanges).toEqual([
        {id: 'step-1', component: 'Stepper', steps: 2, enabled: true},
      ]);
    });
  });
});

// Shapes as CatalogSchemaResolver returns them for the basic catalog's common types.
const binding: CatalogComponentSchema = {type: 'object', properties: {path: {type: 'string'}}};
const call: CatalogComponentSchema = {type: 'object', properties: {call: {type: 'string'}}};
const dynamicSchema = (literal: CatalogComponentSchema): CatalogComponentSchema => ({
  oneOf: [literal, binding, call],
});
const v1Binding: CatalogComponentSchema = {type: 'object', properties: {'@path': {type: 'string'}}};
const v1Call: CatalogComponentSchema = {type: 'object', properties: {'@call': {type: 'string'}}};
const dynamicSchemaV1 = (literal: CatalogComponentSchema): CatalogComponentSchema => ({
  anyOf: [literal, v1Binding, v1Call],
});

describe('resolvePropertyControl', () => {
  it.each([
    ['a string enum', {type: 'string', enum: ['checkbox', 'chips']}, 'enum'],
    ['a boolean', {type: 'boolean'}, 'boolean'],
    ['an integer', {type: 'integer'}, 'number'],
    ['a string', {type: 'string'}, 'string'],
    ['a DynamicString', dynamicSchema({type: 'string'}), 'string'],
    ['a v1.0 DynamicString', dynamicSchemaV1({type: 'string'}), 'string'],
    ['a DynamicBoolean', dynamicSchema({type: 'boolean'}), 'boolean'],
    ['a v1.0 DynamicBoolean', dynamicSchemaV1({type: 'boolean'}), 'boolean'],
    ['a DynamicNumber', dynamicSchema({type: 'number'}), 'number'],
    ['a v1.0 DynamicNumber', dynamicSchemaV1({type: 'number'}), 'number'],
    ['an enum inside a union', {anyOf: [{type: 'string', enum: ['a', 'b']}, binding]}, 'enum'],
    ['an array of options', {type: 'array', items: {type: 'object'}}, 'array'],
    ['a DynamicStringList', dynamicSchema({type: 'array', items: {type: 'string'}}), 'array'],
    ['a ChildList', {oneOf: [{type: 'array'}, {type: 'object'}]}, 'array'],
    [
      'an object with properties',
      {type: 'object', properties: {label: {type: 'string'}, count: {type: 'number'}}},
      'object',
    ],
    [
      'an object inside a dynamic union',
      dynamicSchema({type: 'object', properties: {label: {type: 'string'}}}),
      'object',
    ],
    ['an object without properties (e.g. style)', {type: 'object'}, 'json'],
    [
      'an object with only additionalProperties',
      {type: 'object', additionalProperties: {type: 'string'}},
      'json',
    ],
    ['a DynamicValue', {oneOf: [{type: 'string'}, {type: 'number'}, binding]}, 'json'],
    ['an untyped schema', {}, 'json'],
    ['a missing schema', undefined, 'json'],
  ])('edits $0 with a $2 control', (_name, schema, kind) => {
    expect(resolvePropertyControl(schema as CatalogComponentSchema | undefined).kind).toBe(kind);
  });

  it('recursively resolves array item controls and nested object properties while skipping const fields', () => {
    const control = resolvePropertyControl({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {const: 'item'},
          label: dynamicSchema({type: 'string'}),
          context: {type: 'object'},
        },
        required: ['label'],
      },
    });
    expect(control.kind).toBe('array');
    expect(control.itemControl).toEqual({
      kind: 'object',
      options: [],
      properties: [
        {name: 'label', required: true, control: {kind: 'string', options: []}},
        {name: 'context', required: false, control: {kind: 'json', options: []}},
      ],
    });
  });

  it('falls back to a json control when encountering a cyclic schema', () => {
    const cyclic: CatalogComponentSchema = {type: 'object', properties: {}};
    (cyclic['properties'] as Record<string, unknown>)['self'] = cyclic;
    expect(resolvePropertyControl(cyclic)).toEqual({
      kind: 'object',
      options: [],
      properties: [{name: 'self', required: false, control: {kind: 'json', options: []}}],
    });
  });

  it('falls back to the current value type when the catalog declares no schema', () => {
    expect(resolvePropertyControl(undefined, 'Initial').kind).toBe('string');
    expect(resolvePropertyControl(undefined, 3).kind).toBe('number');
    expect(resolvePropertyControl(undefined, true).kind).toBe('boolean');
    expect(resolvePropertyControl(undefined, ['a', 'b']).kind).toBe('array');
    expect(resolvePropertyControl(undefined, {label: 'Hi'}).kind).toBe('object');
    expect(resolvePropertyControl(undefined, {path: '/x'}).kind).toBe('json');
    expect(resolvePropertyControl(undefined, {'@path': '/x'}).kind).toBe('json');
    expect(resolvePropertyControl(undefined, {'@call': 'fn'}).kind).toBe('json');
  });

  it('keeps enum options in catalog order', () => {
    expect(resolvePropertyControl({type: 'string', enum: ['checkbox', 'chips']}).options).toEqual([
      'checkbox',
      'chips',
    ]);
  });
});

describe('createDefaultPropertyValue', () => {
  it('builds brand-new default items based on the control type', () => {
    expect(createDefaultPropertyValue(undefined)).toBe('');
    expect(createDefaultPropertyValue({kind: 'string', options: []})).toBe('');
    expect(createDefaultPropertyValue({kind: 'number', options: []})).toBe(0);
    expect(createDefaultPropertyValue({kind: 'boolean', options: []})).toBe(false);
    expect(createDefaultPropertyValue({kind: 'enum', options: ['a', 'b']})).toBe('a');
    expect(createDefaultPropertyValue({kind: 'enum', options: []})).toBe('');
    expect(createDefaultPropertyValue({kind: 'array', options: []})).toEqual([]);
    expect(createDefaultPropertyValue({kind: 'json', options: []})).toEqual({});
    expect(
      createDefaultPropertyValue({
        kind: 'object',
        options: [],
        properties: [
          {name: 'label', required: true, control: {kind: 'string', options: []}},
          {name: 'context', required: false, control: {kind: 'json', options: []}},
        ],
      }),
    ).toEqual({label: '', context: {}});
  });
});

describe('describeUneditableValue', () => {
  const text = resolvePropertyControl(dynamicSchema({type: 'string'}));
  const list = resolvePropertyControl(dynamicSchema({type: 'array', items: {type: 'string'}}));
  const group = resolvePropertyControl({
    type: 'object',
    properties: {label: {type: 'string'}},
  });

  it('allows literals, arrays, objects and unset values that the control can edit', () => {
    expect(describeUneditableValue('Hello', text)).toBeNull();
    expect(describeUneditableValue(undefined, text)).toBeNull();
    expect(describeUneditableValue(['a', 'b'], list)).toBeNull();
    expect(describeUneditableValue({label: 'Hello'}, group)).toBeNull();
    expect(describeUneditableValue({any: 'shape'}, {kind: 'json', options: []})).toBeNull();
    expect(describeUneditableValue('a', {kind: 'enum', options: ['a']})).toBeNull();
  });

  it('protects bindings, function calls and values outside the control', () => {
    expect(describeUneditableValue({path: '/user/name'}, text)).toContain('Bound to /user/name');
    expect(describeUneditableValue({'@path': '/user/name'}, text)).toContain('Bound to /user/name');
    expect(describeUneditableValue({path: '/items'}, list)).toContain('Bound to /items');
    expect(describeUneditableValue({'@path': '/items'}, list)).toContain('Bound to /items');
    expect(describeUneditableValue({path: '/group'}, group)).toContain('Bound to /group');
    expect(describeUneditableValue({'@path': '/group'}, group)).toContain('Bound to /group');
    expect(describeUneditableValue({call: 'formatDate'}, text)).toContain('formatDate()');
    expect(describeUneditableValue({'@call': 'formatDate'}, text)).toContain('formatDate()');
    expect(describeUneditableValue(3, text)).toContain('JSON editor');
    expect(describeUneditableValue('other', {kind: 'enum', options: ['a']})).toContain(
      'JSON editor',
    );
  });

  it('does not misclassify domain objects with path or call fields alongside other properties as bindings', () => {
    const routeSchema = {
      type: 'object',
      properties: {
        path: {type: 'string'},
        label: {type: 'string'},
      },
    };
    const routeControl = resolvePropertyControl(routeSchema);
    expect(routeControl.kind).toBe('object');
    expect(routeControl.properties?.map(prop => prop.name)).toEqual(['path', 'label']);
    expect(describeUneditableValue({path: '/home', label: 'Home'}, routeControl)).toBeNull();

    const inferredControl = resolvePropertyControl(undefined, {path: '/home', label: 'Home'});
    expect(inferredControl.kind).toBe('object');
    expect(describeUneditableValue({path: '/home', label: 'Home'}, inferredControl)).toBeNull();

    const webhookSchema = {
      type: 'object',
      properties: {
        call: {type: 'string'},
        timeoutMs: {type: 'number'},
      },
    };
    const webhookControl = resolvePropertyControl(webhookSchema);
    expect(webhookControl.kind).toBe('object');
    expect(describeUneditableValue({call: 'ping', timeoutMs: 500}, webhookControl)).toBeNull();
  });
});

describe('matchesSimpleSchema', () => {
  it('evaluates boolean JSON schemas directly', () => {
    const allowAll = true as unknown as CatalogComponentSchema;
    const denyAll = false as unknown as CatalogComponentSchema;
    expect(matchesSimpleSchema('anything', allowAll)).toBe(true);
    expect(matchesSimpleSchema(null, allowAll)).toBe(true);
    expect(matchesSimpleSchema('anything', denyAll)).toBe(false);
    expect(matchesSimpleSchema(123, denyAll)).toBe(false);
  });

  it('distinguishes integer and finite number types', () => {
    expect(matchesSimpleSchema(4, {type: 'integer'})).toBe(true);
    expect(matchesSimpleSchema(4.5, {type: 'integer'})).toBe(false);
    expect(matchesSimpleSchema(Number.NaN, {type: 'integer'})).toBe(false);
    expect(matchesSimpleSchema(4.5, {type: 'number'})).toBe(true);
    expect(matchesSimpleSchema(Number.POSITIVE_INFINITY, {type: 'number'})).toBe(false);
    expect(matchesSimpleSchema('4', {type: 'number'})).toBe(false);
  });

  it('validates null, primitive, array, object, and untyped schemas', () => {
    expect(matchesSimpleSchema(null, {type: 'null'})).toBe(true);
    expect(matchesSimpleSchema(undefined, {type: 'null'})).toBe(false);
    expect(matchesSimpleSchema('ok', {type: 'string'})).toBe(true);
    expect(matchesSimpleSchema(123, {type: 'string'})).toBe(false);
    expect(matchesSimpleSchema(true, {type: 'boolean'})).toBe(true);
    expect(matchesSimpleSchema('true', {type: 'boolean'})).toBe(false);
    expect(matchesSimpleSchema([1, 2], {type: 'array'})).toBe(true);
    expect(matchesSimpleSchema({}, {type: 'array'})).toBe(false);
    expect(matchesSimpleSchema({a: 1}, {type: 'object'})).toBe(true);
    expect(matchesSimpleSchema([1, 2], {type: 'object'})).toBe(false);
    expect(matchesSimpleSchema(null, {type: 'object'})).toBe(false);
    expect(matchesSimpleSchema('anything', {})).toBe(true);
  });

  it('validates array-valued type unions', () => {
    const nullableString: CatalogComponentSchema = {type: ['string', 'null']};
    expect(matchesSimpleSchema('hello', nullableString)).toBe(true);
    expect(matchesSimpleSchema(null, nullableString)).toBe(true);
    expect(matchesSimpleSchema(42, nullableString)).toBe(false);
  });

  it('validates const and enum constraints', () => {
    expect(matchesSimpleSchema('info', {const: 'info'})).toBe(true);
    expect(matchesSimpleSchema('warn', {const: 'info'})).toBe(false);

    const enumSchema: CatalogComponentSchema = {type: 'string', enum: ['a', 'b']};
    expect(matchesSimpleSchema('a', enumSchema)).toBe(true);
    expect(matchesSimpleSchema('c', enumSchema)).toBe(false);
  });

  it('validates anyOf and oneOf union schemas', () => {
    const anyOfSchema: CatalogComponentSchema = {
      anyOf: [{type: 'integer'}, {type: 'object'}],
    };
    expect(matchesSimpleSchema(7, anyOfSchema)).toBe(true);
    expect(matchesSimpleSchema({path: '/count'}, anyOfSchema)).toBe(true);
    expect(matchesSimpleSchema(7.5, anyOfSchema)).toBe(false);

    const oneOfSchema: CatalogComponentSchema = {
      oneOf: [{type: 'string'}, {type: 'boolean'}],
    };
    expect(matchesSimpleSchema('ok', oneOfSchema)).toBe(true);
    expect(matchesSimpleSchema(false, oneOfSchema)).toBe(true);
    expect(matchesSimpleSchema(123, oneOfSchema)).toBe(false);
  });
});
