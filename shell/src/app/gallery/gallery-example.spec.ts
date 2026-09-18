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
import {parseGalleryExample} from './gallery-example';
import {Catalog} from '../storage/models/catalog-storage.model';

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

describe('parseGalleryExample', () => {
  it('preserves custom components, path bindings and data without changing catalog identity', () => {
    const components = [{...component, text: {path: '/name'}}];
    const data = {name: 'Edited'};
    expect(parseGalleryExample(JSON.stringify({components, data}), catalog)).toEqual({
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
        expect(parseGalleryExample(JSON.stringify({components}), nullableCatalog)).toEqual({
          usage: components,
        });
      }
    }
    for (const text of [2, false, {}, []]) {
      expect(() =>
        parseGalleryExample(JSON.stringify({components: [{...component, text}]}), nullableCatalog),
      ).toThrow('"text"');
    }
    expect(() =>
      parseGalleryExample(
        JSON.stringify({components: [{...component, count: 1.5}]}),
        nullableCatalog,
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
      parseGalleryExample(JSON.stringify({components}), booleanSchemaCatalog),
    ).not.toThrow();
    expect(parseGalleryExample(JSON.stringify({components}), booleanSchemaCatalog)).toEqual({
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
    ['invalid binding union', JSON.stringify({components: [{...component, text: 3}]}), 'text'],
  ])('rejects %s', (_name, text, reason) => {
    expect(() => parseGalleryExample(text, catalog)).toThrow(reason);
  });
});
