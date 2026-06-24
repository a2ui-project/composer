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

import {describe, it, expect, vi} from 'vitest';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {CatalogSchemaResolver} from './catalog-schema-resolver';

describe('CatalogSchemaResolver', () => {
  it('parses simple properties correctly', () => {
    const mockSchema = {
      components: {
        SimpleComponent: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The simple text property.',
              default: 'hello',
            },
            count: {
              type: 'number',
              description: 'The count property.',
            },
          },
          required: ['text'],
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('SimpleComponent');

    expect(properties).toEqual([
      {
        name: 'text',
        description: 'The simple text property.',
        type: 'string',
        required: true,
        defaultValue: 'hello',
      },
      {
        name: 'count',
        description: 'The count property.',
        type: 'number',
        required: false,
      },
    ]);
  });

  it('resolves nested $defs references correctly', () => {
    const mockSchema = {
      components: {
        RefComponent: {
          type: 'object',
          properties: {
            title: {
              $ref: '#/$defs/DynamicString',
              description: 'Local override description.',
            },
          },
        },
      },
      $defs: {
        DynamicString: {
          type: 'string',
          description: 'Base DynamicString description.',
          default: 'default-string',
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('RefComponent');

    expect(properties).toEqual([
      {
        name: 'title',
        description: 'Local override description.',
        type: 'string',
        required: false,
        defaultValue: 'default-string',
      },
    ]);
  });

  it('merges properties in an allOf array correctly', () => {
    const mockSchema = {
      components: {
        AllOfComponent: {
          type: 'object',
          allOf: [
            {
              $ref: '#/$defs/BaseProps',
            },
            {
              properties: {
                specificProp: {
                  type: 'boolean',
                  description: 'A component specific property.',
                },
              },
              required: ['specificProp'],
            },
          ],
        },
      },
      $defs: {
        BaseProps: {
          properties: {
            id: {
              type: 'string',
              description: 'The component identifier.',
            },
          },
          required: ['id'],
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('AllOfComponent');

    expect(properties).toEqual([
      {
        name: 'id',
        description: 'The component identifier.',
        type: 'string',
        required: true,
      },
      {
        name: 'specificProp',
        description: 'A component specific property.',
        type: 'boolean',
        required: true,
      },
    ]);
  });

  it('handles circular references gracefully without entering infinite loops', () => {
    const mockSchema = {
      components: {
        CircularComponent: {
          type: 'object',
          properties: {
            child: {
              $ref: '#/components/CircularComponent',
              description: 'A recursive reference to itself.',
            },
          },
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('CircularComponent');

    expect(properties).toEqual([
      {
        name: 'child',
        description: 'A recursive reference to itself.',
        type: 'object',
        required: false,
      },
    ]);
  });

  it('handles external file reference formats gracefully by resolving from local $defs', () => {
    const mockSchema = {
      components: {
        Component: {
          type: 'object',
          properties: {
            text: {
              $ref: 'common_types.json#/$defs/DynamicString',
            },
          },
        },
      },
      $defs: {
        DynamicString: {
          type: 'string',
          description: 'Resolved from local $defs.',
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('Component');

    expect(properties).toEqual([
      {
        name: 'text',
        description: 'Resolved from local $defs.',
        type: 'string',
        required: false,
      },
    ]);
  });

  it('merges property-level allOf schemas correctly', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            mergedProp: {
              allOf: [
                {type: 'string', description: 'Base description'},
                {default: 'default-value'},
              ],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toEqual([
      {
        name: 'mergedProp',
        description: 'Base description',
        type: 'string',
        required: false,
        defaultValue: 'default-value',
      },
    ]);
  });

  it('resolves multi-type array schemas as union types', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            nullableString: {
              type: ['string', 'null'],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties[0].type).toBe('string | null');
  });

  it('resolves type for const and enum properties correctly', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            constProp: {
              const: 42,
            },
            enumProp: {
              enum: [true, false],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toContainEqual({
      name: 'constProp',
      description: '',
      type: 'number',
      required: false,
    });
    expect(properties).toContainEqual({
      name: 'enumProp',
      description: '',
      type: 'boolean',
      required: false,
    });
  });

  it('resolves type unions from oneOf and anyOf schemas', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            oneOfProp: {
              oneOf: [{type: 'string'}, {type: 'number'}],
            },
            anyOfProp: {
              anyOf: [{type: 'boolean'}, {type: 'object'}],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toContainEqual({
      name: 'oneOfProp',
      description: '',
      type: 'string | number',
      required: false,
    });
    expect(properties).toContainEqual({
      name: 'anyOfProp',
      description: '',
      type: 'boolean | object',
      required: false,
    });
  });

  it('returns empty array when schema is not an object or component is not found', () => {
    expect(new CatalogSchemaResolver(null).resolveComponentProperties('Component')).toEqual([]);
    expect(new CatalogSchemaResolver('invalid').resolveComponentProperties('Component')).toEqual(
      [],
    );
    expect(new CatalogSchemaResolver({}).resolveComponentProperties('Component')).toEqual([]);
  });

  it('merges local properties over inherited properties instead of overwriting them completely', () => {
    const mockSchema = {
      components: {
        ChildComponent: {
          type: 'object',
          allOf: [{$ref: '#/$defs/ParentProps'}],
          properties: {
            inheritedProp: {
              description: 'Overridden description',
            },
          },
        },
      },
      $defs: {
        ParentProps: {
          properties: {
            inheritedProp: {
              type: 'string',
              description: 'Parent description',
              default: 'parent-default',
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('ChildComponent');
    expect(properties).toEqual([
      {
        name: 'inheritedProp',
        description: 'Overridden description',
        type: 'string',
        required: false,
        defaultValue: 'parent-default',
      },
    ]);
  });

  it('logs warnings when references cannot be resolved', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          allOf: [{$ref: '#/$defs/MissingParent'}],
          properties: {
            missingPropRef: {
              $ref: '#/$defs/MissingProp',
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    resolver.resolveComponentProperties('TestComponent');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to resolve schema reference: "#/$defs/MissingParent"',
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to resolve property schema reference: "#/$defs/MissingProp"',
    );
    consoleWarnSpy.mockRestore();
  });

  it('resolves null const and enum properties correctly', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            nullConst: {
              const: null,
            },
            nullEnum: {
              enum: [null, 'value'],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toContainEqual({
      name: 'nullConst',
      description: '',
      type: 'null',
      required: false,
    });
    expect(properties).toContainEqual({
      name: 'nullEnum',
      description: '',
      type: 'null | string',
      required: false,
    });
  });

  it('returns undefined for references that do not start with #/', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockSchema = {
      components: {
        Component: {
          properties: {
            text: {$ref: 'external_schema.json'},
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('Component');
    expect(properties).toEqual([{name: 'text', description: '', type: 'unknown', required: false}]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to resolve property schema reference: "external_schema.json"',
    );
    consoleWarnSpy.mockRestore();
  });

  it('merges colliding properties in mergeResolvedSchemas when multiple inherited schemas define the same property', () => {
    const mockSchema = {
      components: {
        Child: {
          allOf: [{$ref: '#/$defs/Parent1'}, {$ref: '#/$defs/Parent2'}],
        },
      },
      $defs: {
        Parent1: {
          properties: {prop: {type: 'string', description: 'from Parent1'}},
        },
        Parent2: {
          properties: {prop: {default: 'default-val', description: 'from Parent2'}},
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('Child')).toEqual([
      {
        name: 'prop',
        description: 'from Parent2',
        type: 'string',
        required: false,
        defaultValue: 'default-val',
      },
    ]);
  });

  it('decodes JSON pointer escaped characters ~1 and ~0 correctly', () => {
    const mockSchema = {
      components: {
        Component: {
          properties: {
            text: {$ref: '#/$defs/escaped~1key~0name'},
          },
        },
      },
      $defs: {
        'escaped/key~name': {
          type: 'string',
          description: 'Decoded successfully',
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('Component')).toEqual([
      {
        name: 'text',
        description: 'Decoded successfully',
        type: 'string',
        required: false,
      },
    ]);
  });

  it('falls back to the second schema when merging non-object schemas', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            invalidProp: {
              allOf: ['not-an-object', {type: 'string', description: 'String property'}],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toEqual([
      {
        name: 'invalidProp',
        description: 'String property',
        type: 'string',
        required: false,
      },
    ]);
  });

  it('handles circular references at the component level gracefully', () => {
    const mockSchema = {
      components: {
        CompA: {
          allOf: [{$ref: '#/components/CompB'}],
        },
        CompB: {
          allOf: [{$ref: '#/components/CompA'}],
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('CompA')).toEqual([]);
  });

  it('returns empty array when component schema is not an object', () => {
    const mockSchema = {
      components: {
        InvalidComponent: 'not-an-object',
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('InvalidComponent')).toEqual([]);
  });

  it('falls back to the second schema when merging non-object properties during schema merge', () => {
    const mockSchema = {
      components: {
        Child: {
          allOf: [{$ref: '#/$defs/Parent1'}, {$ref: '#/$defs/Parent2'}],
        },
      },
      $defs: {
        Parent1: {
          properties: {prop: 'not-an-object'},
        },
        Parent2: {
          properties: {prop: {type: 'string', description: 'from Parent2'}},
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('Child')).toEqual([
      {
        name: 'prop',
        description: 'from Parent2',
        type: 'string',
        required: false,
      },
    ]);
  });

  it('returns empty array when components is not an object, is an array, or component is missing', () => {
    // components as string (non-object)
    expect(
      new CatalogSchemaResolver({components: 'invalid'}).resolveComponentProperties('Component'),
    ).toEqual([]);
    // components as array
    expect(
      new CatalogSchemaResolver({components: []}).resolveComponentProperties('Component'),
    ).toEqual([]);
    // componentName not found in components dict
    expect(
      new CatalogSchemaResolver({components: {}}).resolveComponentProperties('Component'),
    ).toEqual([]);
  });

  it('resolves type to object implicitly when properties is defined but type is omitted', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            nestedObj: {
              properties: {
                text: {type: 'string'},
              },
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toEqual([
      {
        name: 'nestedObj',
        description: '',
        type: 'object',
        required: false,
      },
    ]);
  });

  it('handles null values in mergePropertySchemas when merging colliding properties', () => {
    const mockSchema = {
      components: {
        Child: {
          allOf: [{$ref: '#/$defs/Parent1'}, {$ref: '#/$defs/Parent2'}],
        },
      },
      $defs: {
        Parent1: {
          properties: {prop: {type: 'string'}},
        },
        Parent2: {
          properties: {prop: null},
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('Child');
    expect(properties).toEqual([{name: 'prop', description: '', type: 'string', required: false}]);
  });

  it('returns undefined when resolving a pointer that traverses through a primitive value', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          properties: {
            prop: {
              $ref: '#/components/Text/text/nested',
            },
          },
        },
        Text: {
          text: 'a-string-primitive',
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toEqual([{name: 'prop', description: '', type: 'unknown', required: false}]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to resolve property schema reference: "#/components/Text/text/nested"',
    );
    consoleWarnSpy.mockRestore();
  });

  it('returns empty object when resolving property schema that is a primitive or null', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            nullProp: null,
            stringProp: 'not-a-schema-object',
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toContainEqual({
      name: 'nullProp',
      description: '',
      type: 'unknown',
      required: false,
    });
    expect(properties).toContainEqual({
      name: 'stringProp',
      description: '',
      type: 'unknown',
      required: false,
    });
  });

  it('ignores non-object sub-schemas in oneOf and anyOf', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            unionProp: {
              oneOf: ['not-an-object', {type: 'number'}],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties[0].type).toBe('number');
  });

  it('ignores properties block if it is null or an array', () => {
    const mockSchema = {
      components: {
        TestComponent1: {
          properties: null,
        },
        TestComponent2: {
          properties: ['not-a-dict'],
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('TestComponent1')).toEqual([]);
    expect(resolver.resolveComponentProperties('TestComponent2')).toEqual([]);
  });

  it('handles references pointing to primitive values rather than object schemas', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          $ref: '#/$defs/someStringConstant',
        },
      },
      $defs: {
        someStringConstant: 'just-a-string',
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('TestComponent')).toEqual([]);
  });

  it('ignores non-string items in the required array', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            text: {type: 'string'},
          },
          required: [123, 'text', null],
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties[0].required).toBe(true);
  });

  it('handles circular references between property definitions gracefully', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            propA: {$ref: '#/$defs/PropB'},
          },
        },
      },
      $defs: {
        PropA: {$ref: '#/$defs/PropB'},
        PropB: {$ref: '#/$defs/PropA'},
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toEqual([
      {name: 'propA', description: '', type: 'unknown', required: false},
    ]);
  });

  it('resolves type to unknown when oneOf or anyOf contains only unknown/empty schemas', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            invalidOneOf: {
              oneOf: [{}, {$ref: '#/$defs/Missing'}],
            },
            invalidAnyOf: {
              anyOf: [{}, {$ref: '#/$defs/Missing'}],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toContainEqual({
      name: 'invalidOneOf',
      description: '',
      type: 'unknown',
      required: false,
    });
    expect(properties).toContainEqual({
      name: 'invalidAnyOf',
      description: '',
      type: 'unknown',
      required: false,
    });
    consoleWarnSpy.mockRestore();
  });

  it('resolves type unions from oneOf and anyOf schemas containing $ref references', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            unionProp: {
              oneOf: [{$ref: '#/$defs/StringProp'}, {type: 'number'}],
            },
          },
        },
      },
      $defs: {
        StringProp: {
          type: 'string',
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties[0].type).toBe('string | number');
  });

  it('handles null values in mergePropertySchemas when the first schema is null', () => {
    const mockSchema = {
      components: {
        Child: {
          allOf: [{$ref: '#/$defs/Parent1'}, {$ref: '#/$defs/Parent2'}],
        },
      },
      $defs: {
        Parent1: {
          properties: {prop: null},
        },
        Parent2: {
          properties: {prop: {type: 'string'}},
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('Child');
    expect(properties).toEqual([{name: 'prop', description: '', type: 'string', required: false}]);
  });

  it('ignores null sub-schemas in oneOf and anyOf', () => {
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            unionProp: {
              oneOf: [null, {type: 'number'}],
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties[0].type).toBe('number');
  });

  it('prevents prototype pollution when resolving references', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockSchema = {
      components: {
        TestComponent: {
          type: 'object',
          properties: {
            pollutedProp: {
              $ref: '#/constructor/prototype/polluted',
            },
          },
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema as unknown as Catalog);
    const properties = resolver.resolveComponentProperties('TestComponent');
    expect(properties).toEqual([
      {
        name: 'pollutedProp',
        description: '',
        type: 'unknown',
        required: false,
      },
    ]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to resolve property schema reference: "#/constructor/prototype/polluted"',
    );
    consoleWarnSpy.mockRestore();
  });

  it('mergePropertySchemas performs a recursive deep merge on nested objects', () => {
    const resolver = new CatalogSchemaResolver(null);
    const a = {
      type: 'array',
      items: {
        type: 'string',
        description: 'original',
      },
    };
    const b = {
      items: {
        enum: ['foo', 'bar'],
      },
    };
    const merged = resolver['mergePropertySchemas'](a, b);
    expect(merged).toEqual({
      type: 'array',
      items: {
        type: 'string',
        description: 'original',
        enum: ['foo', 'bar'],
      },
    });
  });

  it('decodes URI-encoded JSON pointer keys (e.g. %20) correctly', () => {
    const mockSchema = {
      components: {
        Component: {
          properties: {
            text: {$ref: '#/$defs/spaced%20key%20name'},
          },
        },
      },
      $defs: {
        'spaced key name': {
          type: 'string',
          description: 'Decoded from spaced key name',
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('Component')).toEqual([
      {
        name: 'text',
        description: 'Decoded from spaced key name',
        type: 'string',
        required: false,
      },
    ]);
  });

  it('resolves common_types.json references from embedded schema when missing locally', () => {
    const mockSchema = {
      components: {
        Component: {
          type: 'object',
          properties: {
            childList: {
              $ref: 'common_types.json#/$defs/ChildList',
            },
          },
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const properties = resolver.resolveComponentProperties('Component');

    expect(properties).toEqual([
      {
        name: 'childList',
        description: '',
        type: 'array | object',
        required: false,
      },
    ]);
  });

  it('recursively resolves $ref pointers inside array items', () => {
    const mockSchema = {
      components: {
        ArrayComponent: {
          type: 'object',
          properties: {
            list: {
              type: 'array',
              items: {
                $ref: '#/$defs/ItemType',
              },
            },
          },
        },
      },
      $defs: {
        ItemType: {
          type: 'object',
          properties: {
            id: {
              $ref: '#/$defs/IdType',
            },
          },
        },
        IdType: {
          type: 'string',
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const propertiesSchema = resolver.resolveComponentPropertiesSchema('ArrayComponent');

    expect(propertiesSchema['list']).toEqual({
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    });
  });

  it('recursively resolves $ref pointers inside object properties', () => {
    const mockSchema = {
      components: {
        ObjectComponent: {
          type: 'object',
          properties: {
            nested: {
              type: 'object',
              properties: {
                value: {
                  $ref: '#/$defs/ValueType',
                },
              },
            },
          },
        },
      },
      $defs: {
        ValueType: {
          type: 'number',
        },
      },
    };

    const resolver = new CatalogSchemaResolver(mockSchema);
    const propertiesSchema = resolver.resolveComponentPropertiesSchema('ObjectComponent');

    expect(propertiesSchema['nested']).toEqual({
      type: 'object',
      properties: {
        value: {
          type: 'number',
        },
      },
    });
  });

  it('falls back to undecoded key when URI decoding fails on malformed pointer', () => {
    const mockSchema = {
      components: {
        Component: {
          properties: {
            text: {$ref: '#/$defs/%E0%A4%A'},
          },
        },
      },
      $defs: {
        '%E0%A4%A': {
          type: 'string',
          description: 'Fallback key match',
        },
      },
    };
    const resolver = new CatalogSchemaResolver(mockSchema);
    expect(resolver.resolveComponentProperties('Component')).toEqual([
      {
        name: 'text',
        description: 'Fallback key match',
        type: 'string',
        required: false,
      },
    ]);
  });
});
