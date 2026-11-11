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
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {PropertyEditor, PropertyChangeEvent} from './property-editor';
import {
  createDefaultPropertyValue,
  describeUneditableValue,
  resolvePropertyControl,
} from './property-editor-utils';
import {PropertyEditorHarness} from './test/property-editor.harness';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog, CatalogComponentSchema} from '../../storage/models/catalog-storage.model';
import {ErrorLogger} from '../../debug/error-logger.service';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
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
  },
};

describe('PropertyEditor Component', () => {
  let fixture: ComponentFixture<PropertyEditor>;
  let harness: PropertyEditorHarness;
  let catalogManagementMock: MockCatalogManagement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyEditor],
      providers: [
        provideNoopAnimations(),
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        ErrorLogger,
      ],
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
  });

  it('resolves properties using explicit catalog and componentKey inputs when provided', async () => {
    catalogManagementMock.activeCatalog.set(null);
    fixture.componentRef.setInput('catalog', jsonCatalog);
    fixture.componentRef.setInput('componentKey', 'StyledBox');
    fixture.componentRef.setInput('component', {
      id: 'box-override',
      style: {padding: 8},
    });
    fixture.detectChanges();

    expect(await harness.getPropertyNames()).toEqual(['style', 'weight']);
  });

  it('blocks property edits when disabled input is true', async () => {
    const propertyChanges: PropertyChangeEvent[] = [];
    fixture.componentInstance.propertyChange.subscribe(event => propertyChanges.push(event));
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

    expect(propertyChanges).toEqual([]);
  });

  it('emits propertyChange and componentChange when a property is edited', async () => {
    const propertyChanges: PropertyChangeEvent[] = [];
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.propertyChange.subscribe(event => propertyChanges.push(event));
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

    expect(propertyChanges.at(-1)).toEqual({name: 'label', value: 'Updated Size'});
    expect(componentChanges.at(-1)).toEqual({
      ...initial,
      label: 'Updated Size',
    });
  });

  it('emits propertyChange and componentChange without the removed key when an optional property is removed', async () => {
    const propertyChanges: PropertyChangeEvent[] = [];
    const componentChanges: Array<Record<string, unknown>> = [];
    fixture.componentInstance.propertyChange.subscribe(event => propertyChanges.push(event));
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

    expect(propertyChanges.at(-1)).toEqual({name: 'filterable', value: undefined});
    expect(componentChanges.at(-1)).toEqual({
      id: 'picker-1',
      component: 'ChoicePicker',
      label: 'Size',
      options: [{label: 'Small', value: 's'}],
      value: ['s'],
    });
  });

  it('surfaces inline error and suppresses propertyChange when a JSON field violates the catalog schema', async () => {
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
    fixture.componentInstance.propertyChange.subscribe(changeSpy);

    await harness.editJsonProperty('style', '123');

    expect(await harness.getPropertyError('style')).toBe(
      '"style" on "box-1" does not match its catalog property type or choices. The example keeps its previous value.',
    );
    expect(statusSpy).toHaveBeenLastCalledWith('');
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
});

// Shapes as CatalogSchemaResolver returns them for the basic catalog's common types.
const binding: CatalogComponentSchema = {type: 'object', properties: {path: {type: 'string'}}};
const call: CatalogComponentSchema = {type: 'object', properties: {call: {type: 'string'}}};
const dynamicSchema = (literal: CatalogComponentSchema): CatalogComponentSchema => ({
  oneOf: [literal, binding, call],
});

describe('resolvePropertyControl', () => {
  it.each([
    ['a string enum', {type: 'string', enum: ['checkbox', 'chips']}, 'enum'],
    ['a boolean', {type: 'boolean'}, 'boolean'],
    ['an integer', {type: 'integer'}, 'number'],
    ['a string', {type: 'string'}, 'string'],
    ['a DynamicString', dynamicSchema({type: 'string'}), 'string'],
    ['a DynamicBoolean', dynamicSchema({type: 'boolean'}), 'boolean'],
    ['a DynamicNumber', dynamicSchema({type: 'number'}), 'number'],
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
    expect(describeUneditableValue({path: '/items'}, list)).toContain('Bound to /items');
    expect(describeUneditableValue({path: '/group'}, group)).toContain('Bound to /group');
    expect(describeUneditableValue({call: 'formatDate'}, text)).toContain('formatDate()');
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
