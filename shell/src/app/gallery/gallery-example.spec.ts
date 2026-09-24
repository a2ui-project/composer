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
        text: {anyOf: [{type: 'string'}, {type: 'object'}]},
        count: {type: 'integer'},
        enabled: {type: 'boolean'},
        emphasis: {type: 'string', enum: ['normal', 'strong']},
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
    ['an array of options', {type: 'array', items: {type: 'object'}}, 'json'],
    ['a DynamicStringList', dynamic({type: 'array', items: {type: 'string'}}), 'json'],
    ['a ChildList', {oneOf: [{type: 'array'}, {type: 'object'}]}, 'json'],
    ['a DynamicValue', {oneOf: [{type: 'string'}, {type: 'number'}, binding]}, 'json'],
    ['an untyped schema', {}, 'json'],
    ['a missing schema', undefined, 'json'],
  ])('edits %s with a %s control', (_name, schema, kind) => {
    expect(galleryPropertyControl(schema as CatalogComponentSchema | undefined).kind).toBe(kind);
  });

  it('keeps enum options in catalog order', () => {
    expect(galleryPropertyControl({type: 'string', enum: ['checkbox', 'chips']}).options).toEqual([
      'checkbox',
      'chips',
    ]);
  });
});

describe('describeUneditableValue', () => {
  const text = galleryPropertyControl(dynamic({type: 'string'}));

  it('allows literals and unset values that the control can edit', () => {
    expect(describeUneditableValue('Hello', text)).toBeNull();
    expect(describeUneditableValue(undefined, text)).toBeNull();
    expect(describeUneditableValue({any: 'shape'}, {kind: 'json', options: []})).toBeNull();
  });

  it('protects bindings, function calls and values outside the control', () => {
    expect(describeUneditableValue({path: '/user/name'}, text)).toContain('Bound to /user/name');
    expect(describeUneditableValue({call: 'formatDate'}, text)).toContain('formatDate()');
    expect(describeUneditableValue(3, text)).toContain('JSON tab');
    expect(describeUneditableValue('other', {kind: 'enum', options: ['a']})).toContain('JSON tab');
  });
});
