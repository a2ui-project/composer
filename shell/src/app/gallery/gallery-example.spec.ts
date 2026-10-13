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
import {
  createDefaultGalleryValue,
  describeUneditableValue,
  galleryPropertyControl,
  parseGalleryExample,
} from './gallery-example';
import {ErrorLogger} from '../debug/error-logger.service';
import {Catalog, CatalogComponentSchema} from '../storage/models/catalog-storage.model';

const catalog: Catalog = {
  catalogId: 'custom://notice',
  components: {
    Notice: {
      type: 'object',
      properties: {
        component: {const: 'Notice'},
        text: {anyOf: [{type: 'string'}, {type: 'object'}]},
        count: {type: 'integer'},
        enabled: {type: 'boolean'},
        emphasis: {type: 'string', enum: ['normal', 'strong']},
        variant: {const: 'info'},
      },
    },
  },
};
const component = {
  id: 'target',
  component: 'Notice',
  text: 'Hello',
  count: 2,
  enabled: true,
  emphasis: 'normal',
};

const errorLogger = new ErrorLogger();

describe('parseGalleryExample', () => {
  it('preserves custom components, path bindings and data without changing catalog identity', () => {
    const components = [{...component, text: {path: '/name'}}];
    const data = {name: 'Edited'};
    expect(parseGalleryExample(JSON.stringify({components, data}), catalog, errorLogger)).toEqual({
      usage: components,
      data,
    });
  });

  it('validates every allowed type in an array-valued catalog property schema', () => {
    const nullableCatalog: Catalog = {
      components: {
        Notice: {
          properties: {
            text: {type: ['string', 'null']},
            count: {type: ['integer', 'boolean']},
          },
        },
      },
    };
    for (const text of ['Hello', null]) {
      for (const count of [2, false]) {
        const components = [{...component, text, count}];
        expect(
          parseGalleryExample(JSON.stringify({components}), nullableCatalog, errorLogger),
        ).toEqual({
          usage: components,
        });
      }
    }
    for (const text of [2, false, {}, []]) {
      expect(() =>
        parseGalleryExample(
          JSON.stringify({components: [{...component, text}]}),
          nullableCatalog,
          errorLogger,
        ),
      ).toThrow('"text"');
    }
    expect(() =>
      parseGalleryExample(
        JSON.stringify({components: [{...component, count: 1.5}]}),
        nullableCatalog,
        errorLogger,
      ),
    ).toThrow('"count"');
  });

  it('accepts boolean JSON Schema sub-schemas without throwing on the `in` operator', () => {
    const booleanSchemaCatalog: Catalog = {
      components: {
        Notice: {
          properties: {
            // `true` and `false` are valid JSON Schemas. The catalog resolver normalizes
            // them to `{}` before validation, so neither reaches the `'const' in schema`
            // check as a primitive.
            text: true,
            count: {anyOf: [true, {type: 'integer'}]},
            enabled: false,
          },
        },
      },
    };
    const components = [{...component, text: 'Hello', count: 2, enabled: true}];
    expect(() =>
      parseGalleryExample(JSON.stringify({components}), booleanSchemaCatalog, errorLogger),
    ).not.toThrow();
    expect(
      parseGalleryExample(JSON.stringify({components}), booleanSchemaCatalog, errorLogger),
    ).toEqual({
      usage: components,
    });
  });

  it.each([
    ['invalid JSON', '{', 'JSON'],
    ['message envelope', JSON.stringify([{createSurface: {catalogId: 'other'}}]), 'components'],
    [
      'foreign catalog key',
      JSON.stringify({components: [component], catalogId: 'other'}),
      'components',
    ],
    ['empty components', JSON.stringify({components: []}), 'non-empty'],
    ['invalid component', JSON.stringify({components: [null]}), 'id'],
    ['empty id', JSON.stringify({components: [{...component, id: ''}]}), 'id'],
    ['duplicate ids', JSON.stringify({components: [component, component]}), 'Duplicate'],
    ['no root', JSON.stringify({components: [{...component, id: 'other'}]}), 'root'],
    [
      'unknown catalog component',
      JSON.stringify({components: [{...component, component: 'Other'}]}),
      'selected catalog',
    ],
    ['invalid data', JSON.stringify({components: [component], data: []}), 'data'],
    ['invalid integer', JSON.stringify({components: [{...component, count: 1.5}]}), 'count'],
    ['invalid boolean', JSON.stringify({components: [{...component, enabled: 'true'}]}), 'enabled'],
    ['invalid enum', JSON.stringify({components: [{...component, emphasis: 'other'}]}), 'emphasis'],
    [
      'invalid const',
      JSON.stringify({components: [{...component, variant: 'warning'}]}),
      'variant',
    ],
    ['invalid binding union', JSON.stringify({components: [{...component, text: 3}]}), 'text'],
  ])('rejects %s', (_name, text, reason) => {
    expect(() => parseGalleryExample(text, catalog, errorLogger)).toThrow(reason);
  });
});

// Shapes as CatalogSchemaResolver returns them for the basic catalog's common types.
const binding: CatalogComponentSchema = {type: 'object', properties: {path: {type: 'string'}}};
const call: CatalogComponentSchema = {type: 'object', properties: {call: {type: 'string'}}};
const dynamic = (literal: CatalogComponentSchema): CatalogComponentSchema => ({
  oneOf: [literal, binding, call],
});

describe('galleryPropertyControl', () => {
  it.each([
    ['a string enum', {type: 'string', enum: ['checkbox', 'chips']}, 'enum'],
    ['a boolean', {type: 'boolean'}, 'boolean'],
    ['an integer', {type: 'integer'}, 'number'],
    ['a string', {type: 'string'}, 'string'],
    ['a DynamicString', dynamic({type: 'string'}), 'string'],
    ['a DynamicBoolean', dynamic({type: 'boolean'}), 'boolean'],
    ['a DynamicNumber', dynamic({type: 'number'}), 'number'],
    ['an enum inside a union', {anyOf: [{type: 'string', enum: ['a', 'b']}, binding]}, 'enum'],
    ['an array of options', {type: 'array', items: {type: 'object'}}, 'array'],
    ['a DynamicStringList', dynamic({type: 'array', items: {type: 'string'}}), 'array'],
    ['a ChildList', {oneOf: [{type: 'array'}, {type: 'object'}]}, 'array'],
    [
      'an object with properties',
      {type: 'object', properties: {label: {type: 'string'}, count: {type: 'number'}}},
      'object',
    ],
    [
      'an object inside a dynamic union',
      dynamic({type: 'object', properties: {label: {type: 'string'}}}),
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
    expect(galleryPropertyControl(schema as CatalogComponentSchema | undefined).kind).toBe(kind);
  });

  it('recursively resolves array item controls and nested object properties while skipping const fields', () => {
    const control = galleryPropertyControl({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind: {const: 'item'},
          label: dynamic({type: 'string'}),
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
    expect(galleryPropertyControl(cyclic)).toEqual({
      kind: 'object',
      options: [],
      properties: [{name: 'self', required: false, control: {kind: 'json', options: []}}],
    });
  });

  it('falls back to the current value type when the catalog declares no schema', () => {
    expect(galleryPropertyControl(undefined, 'Initial').kind).toBe('string');
    expect(galleryPropertyControl(undefined, 3).kind).toBe('number');
    expect(galleryPropertyControl(undefined, true).kind).toBe('boolean');
    expect(galleryPropertyControl(undefined, ['a', 'b']).kind).toBe('array');
    expect(galleryPropertyControl(undefined, {label: 'Hi'}).kind).toBe('object');
    expect(galleryPropertyControl(undefined, {path: '/x'}).kind).toBe('json');
  });

  it('keeps enum options in catalog order', () => {
    expect(galleryPropertyControl({type: 'string', enum: ['checkbox', 'chips']}).options).toEqual([
      'checkbox',
      'chips',
    ]);
  });
});

describe('createDefaultGalleryValue', () => {
  it('builds brand-new default items based on the control type', () => {
    expect(createDefaultGalleryValue(undefined)).toBe('');
    expect(createDefaultGalleryValue({kind: 'string', options: []})).toBe('');
    expect(createDefaultGalleryValue({kind: 'number', options: []})).toBe(0);
    expect(createDefaultGalleryValue({kind: 'boolean', options: []})).toBe(false);
    expect(createDefaultGalleryValue({kind: 'enum', options: ['a', 'b']})).toBe('a');
    expect(createDefaultGalleryValue({kind: 'enum', options: []})).toBe('');
    expect(createDefaultGalleryValue({kind: 'array', options: []})).toEqual([]);
    expect(createDefaultGalleryValue({kind: 'json', options: []})).toEqual({});
    expect(
      createDefaultGalleryValue({
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
  const text = galleryPropertyControl(dynamic({type: 'string'}));
  const list = galleryPropertyControl(dynamic({type: 'array', items: {type: 'string'}}));
  const group = galleryPropertyControl({
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
    const routeControl = galleryPropertyControl(routeSchema);
    expect(routeControl.kind).toBe('object');
    expect(routeControl.properties?.map(prop => prop.name)).toEqual(['path', 'label']);
    expect(describeUneditableValue({path: '/home', label: 'Home'}, routeControl)).toBeNull();

    const inferredControl = galleryPropertyControl(undefined, {path: '/home', label: 'Home'});
    expect(inferredControl.kind).toBe('object');
    expect(describeUneditableValue({path: '/home', label: 'Home'}, inferredControl)).toBeNull();

    const webhookSchema = {
      type: 'object',
      properties: {
        call: {type: 'string'},
        timeoutMs: {type: 'number'},
      },
    };
    const webhookControl = galleryPropertyControl(webhookSchema);
    expect(webhookControl.kind).toBe('object');
    expect(describeUneditableValue({call: 'ping', timeoutMs: 500}, webhookControl)).toBeNull();
  });
});
