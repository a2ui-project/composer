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
import {V10MonacoSchemaStrategy} from './v1-0-monaco-schema-strategy';
import {Catalog} from '../../../storage/models/catalog-storage.model';
import {V1_0_COMMON_TYPES_SCHEMA} from '../../../gallery/schema/v1-0/common-types-schema';

describe('V10MonacoSchemaStrategy', () => {
  const basicCatalog: Catalog = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
    title: 'Basic Catalog',
    protocolVersion: '1.0',
    components: {
      Text: {
        type: 'object',
        properties: {
          component: {const: 'Text'},
          text: {$ref: '../../common_types.json#/$defs/DynamicString'},
          variant: {type: 'string', enum: ['caption', 'body']},
        },
        required: ['component', 'text'],
      },
      Button: {
        type: 'object',
        properties: {
          component: {const: 'Button'},
          title: {$ref: 'common_types.json#/$defs/DynamicString'},
          action: {$ref: 'common_types.json#/$defs/Action'},
        },
        required: ['component', 'title'],
      },
    },
    functions: {
      openUrl: {
        type: 'object',
        properties: {
          url: {$ref: 'common_types.json#/$defs/DynamicString'},
        },
        required: ['url'],
      },
    },
    $defs: {
      CustomType: {type: 'string'},
    },
  };

  const mcpCatalog: Catalog = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
    title: 'MCP Functions Catalog',
    protocolVersion: '1.0',
    functions: {
      callMcpTool: {
        type: 'object',
        properties: {
          serverName: {$ref: '#/$defs/DynamicString'},
          toolName: {$ref: '#/$defs/DynamicString'},
        },
        required: ['serverName', 'toolName'],
      },
    },
    components: {
      McpWidget: {
        type: 'object',
        properties: {
          component: {const: 'McpWidget'},
          status: {$ref: '#/$defs/DynamicString'},
        },
        required: ['component'],
      },
    },
  };

  it('reports protocolVersion as v1.0', () => {
    const strategy = new V10MonacoSchemaStrategy();
    expect(strategy.protocolVersion).toBe('v1.0');
  });

  it('normalizes $ref to canonical v1.0 common_types.json URI', () => {
    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: basicCatalog,
      catalogs: [basicCatalog, mcpCatalog],
    });

    const basicEntry = schemas.find(s => s.uri === basicCatalog.$id);
    expect(basicEntry).toBeDefined();
    const basicSchema = basicEntry?.schema as Record<string, unknown>;
    const components = basicSchema['components'] as Record<string, Record<string, unknown>>;

    const textComp = components['Text']['properties'] as Record<string, Record<string, unknown>>;
    expect(textComp['text']['$ref']).toBe(
      'https://a2ui.org/specification/v1_0/common_types.json#/$defs/DynamicString',
    );

    const buttonComp = components['Button']['properties'] as Record<
      string,
      Record<string, unknown>
    >;
    expect(buttonComp['title']['$ref']).toBe(
      'https://a2ui.org/specification/v1_0/common_types.json#/$defs/DynamicString',
    );
    expect(buttonComp['action']['$ref']).toBe(
      'https://a2ui.org/specification/v1_0/common_types.json#/$defs/Action',
    );

    const mcpEntry = schemas.find(s => s.uri === mcpCatalog.$id);
    expect(mcpEntry).toBeDefined();
    const mcpSchema = mcpEntry?.schema as Record<string, unknown>;
    const mcpComps = mcpSchema['components'] as Record<string, Record<string, unknown>>;
    const widgetComp = mcpComps['McpWidget']['properties'] as Record<
      string,
      Record<string, unknown>
    >;
    expect(widgetComp['status']['$ref']).toBe(
      'https://a2ui.org/specification/v1_0/common_types.json#/$defs/DynamicString',
    );
  });

  it('registers multi-catalog entries and merges components across activeCatalogs', () => {
    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: basicCatalog,
      catalogs: [basicCatalog, mcpCatalog],
    });

    const uris = schemas.map(s => s.uri);
    expect(uris).toContain('https://a2ui.org/specification/v1_0/common_types.json');
    expect(uris).toContain('file:///common_types.json');
    expect(uris).toContain(basicCatalog.$id);
    expect(uris).toContain(mcpCatalog.$id);

    const layoutEntry = schemas.find(s => s.uri === 'a2ui-catalog-schema');
    expect(layoutEntry).toBeDefined();
    const layout = layoutEntry?.schema as Record<string, unknown>;
    const items = layout['items'] as Record<string, unknown>;
    const envelopes = items['oneOf'] as Array<Record<string, unknown>>;

    const createSurfaceEnv = envelopes.find(
      e => (e['properties'] as Record<string, unknown>)['createSurface'],
    );
    expect(createSurfaceEnv).toBeDefined();
    const createSurface = (createSurfaceEnv?.['properties'] as Record<string, unknown>)[
      'createSurface'
    ] as Record<string, unknown>;
    const createSurfaceProps = createSurface['properties'] as Record<string, unknown>;
    expect(createSurfaceProps['components']).toBeDefined();

    const updateComponentsEnv = envelopes.find(
      e => (e['properties'] as Record<string, unknown>)['updateComponents'],
    );
    expect(updateComponentsEnv).toBeDefined();

    const defs = layout['$defs'] as Record<string, Record<string, unknown>>;
    expect(defs).toBeDefined();
    const anyFunc = defs['anyFunction'];
    expect(anyFunc).toBeDefined();
    expect(anyFunc['oneOf']).toEqual([
      {$ref: '#/functions/openUrl'},
      {$ref: '#/functions/callMcpTool'},
    ]);

    const anyComp = defs['anyComponent'];
    expect(anyComp).toBeDefined();
    expect(anyComp['oneOf']).toEqual([
      {$ref: '#/components/Text'},
      {$ref: '#/components/Button'},
      {$ref: '#/components/McpWidget'},
    ]);

    // Check alias schemas carry merged functions and $defs
    for (const aliasUri of [
      'file:///catalog.json',
      'catalog.json',
      'https://a2ui.org/specification/v1_0/catalog.json',
    ]) {
      const aliasEntry = schemas.find(s => s.uri === aliasUri);
      expect(aliasEntry).toBeDefined();
      const aliasSchema = aliasEntry?.schema as Record<string, unknown>;
      const aliasFunctions = aliasSchema['functions'] as Record<string, unknown>;
      expect(aliasFunctions).toBeDefined();
      expect(aliasFunctions['openUrl']).toBeDefined();
      expect(aliasFunctions['callMcpTool']).toBeDefined();

      const aliasDefs = aliasSchema['$defs'] as Record<string, unknown>;
      expect(aliasDefs).toBeDefined();
      expect(aliasDefs['anyFunction']).toEqual({
        oneOf: [{$ref: '#/functions/openUrl'}, {$ref: '#/functions/callMcpTool'}],
      });
    }
  });

  it('correctly maps array-functions catalogs to anyFunction schema without numeric index refs', () => {
    const arrayFnCatalog: Catalog = {
      $id: 'https://example.com/array-fn-catalog.json',
      title: 'Array Functions',
      protocolVersion: '1.0',
      components: {
        Box: {
          type: 'object',
          properties: {component: {const: 'Box'}},
          required: ['component'],
        },
      },
      functions: [
        {name: 'openModal', parameters: {type: 'object'}, returnType: 'void'},
        {name: 'logEvent', parameters: {type: 'object'}, returnType: 'void'},
      ],
    };

    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: arrayFnCatalog,
      catalogs: [arrayFnCatalog],
    });

    const layoutEntry = schemas.find(s => s.uri === 'a2ui-catalog-schema');
    const layout = layoutEntry?.schema as Record<string, unknown>;
    const defs = layout['$defs'] as Record<string, Record<string, unknown>>;
    expect(defs['anyFunction']).toEqual({
      oneOf: [{$ref: '#/functions/openModal'}, {$ref: '#/functions/logEvent'}],
    });
  });

  it('sets anyFunction to {not: {}} when catalogs define no functions', () => {
    const catalogWithoutFunctions: Catalog = {
      $id: 'https://example.com/no-fn-catalog.json',
      title: 'No Functions',
      protocolVersion: '1.0',
      components: {
        Box: {
          type: 'object',
          properties: {component: {const: 'Box'}},
          required: ['component'],
        },
      },
    };

    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: catalogWithoutFunctions,
      catalogs: [catalogWithoutFunctions],
    });

    const layoutEntry = schemas.find(s => s.uri === 'a2ui-catalog-schema');
    const layout = layoutEntry?.schema as Record<string, unknown>;
    const defs = layout['$defs'] as Record<string, Record<string, unknown>>;
    expect(defs['anyFunction']).toEqual({not: {}});
  });

  it('supports all v1.0 message envelopes: createSurface, updateComponents, updateDataModel, deleteSurface, callRendererFunction, agentFunctionResponse', () => {
    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: basicCatalog,
      catalogs: [basicCatalog],
    });

    const layoutEntry = schemas.find(s => s.uri === 'a2ui-catalog-schema');
    const layout = layoutEntry?.schema as Record<string, unknown>;
    const items = layout['items'] as Record<string, unknown>;
    const envelopes = items['oneOf'] as Array<Record<string, unknown>>;

    const envelopeKeys = envelopes.map(e => {
      const p = e['properties'] as Record<string, unknown>;
      return Object.keys(p).find(k => k !== 'version');
    });

    expect(envelopeKeys).toContain('createSurface');
    expect(envelopeKeys).toContain('updateComponents');
    expect(envelopeKeys).toContain('updateDataModel');
    expect(envelopeKeys).toContain('deleteSurface');
    expect(envelopeKeys).toContain('callRendererFunction');
    expect(envelopeKeys).toContain('agentFunctionResponse');

    for (const env of envelopes) {
      const versionProp = (env['properties'] as Record<string, unknown>)['version'] as Record<
        string,
        unknown
      >;
      expect(versionProp['const']).toBe('1.0');
      expect(versionProp['default']).toBe('1.0');
    }

    const createSurfaceEnv = envelopes.find(
      e => (e['properties'] as Record<string, unknown>)['createSurface'],
    )!;
    const csProps = (
      (createSurfaceEnv['properties'] as Record<string, unknown>)['createSurface'] as Record<
        string,
        unknown
      >
    )['properties'] as Record<string, unknown>;
    expect(csProps['surfaceId']).toBeDefined();
    expect(csProps['catalogId']).toBeDefined();
    expect(csProps['sendDataModel']).toBeDefined();
    expect(csProps['theme']).toBeUndefined();
    expect(csProps['components']).toBeDefined();
    expect(csProps['dataModel']).toBeDefined();
    const csRequired = (
      (createSurfaceEnv['properties'] as Record<string, unknown>)['createSurface'] as Record<
        string,
        unknown
      >
    )['required'];
    expect(csRequired).toEqual(['surfaceId']);
  });

  it('gives primary catalog precedence on key collisions and matches catalogs by catalogId', () => {
    const primaryCatalogWithId: Catalog = {
      catalogId: 'https://example.com/custom-primary.json',
      title: 'Primary With catalogId',
      protocolVersion: '1.0',
      components: {
        SharedWidget: {
          type: 'object',
          description: 'Primary version',
          properties: {component: {const: 'SharedWidget'}, primary: {type: 'boolean'}},
        },
      },
      functions: {
        sharedFunc: {
          type: 'object',
          description: 'Primary sharedFunc',
        },
      },
      $defs: {
        SharedDef: {type: 'string', description: 'Primary SharedDef'},
      },
    };

    const secondaryCatalog: Catalog = {
      $id: 'https://example.com/secondary.json',
      title: 'Secondary Catalog',
      protocolVersion: '1.0',
      components: {
        SharedWidget: {
          type: 'object',
          description: 'Secondary version',
          properties: {component: {const: 'SharedWidget'}, secondary: {type: 'boolean'}},
        },
      },
      functions: {
        sharedFunc: {
          type: 'object',
          description: 'Secondary sharedFunc',
        },
      },
      $defs: {
        SharedDef: {type: 'number', description: 'Secondary SharedDef'},
      },
    };

    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: primaryCatalogWithId,
      catalogs: [primaryCatalogWithId, secondaryCatalog],
    });

    // Primary catalog should not be duplicated when matched by catalogId
    const primarySchemas = schemas.filter(s => s.uri === 'https://example.com/custom-primary.json');
    expect(primarySchemas.length).toBe(1);

    const layoutEntry = schemas.find(s => s.uri === 'a2ui-catalog-schema');
    const layout = layoutEntry?.schema as Record<string, unknown>;
    const components = layout['components'] as Record<string, Record<string, unknown>>;
    const functions = layout['functions'] as Record<string, Record<string, unknown>>;
    const defs = layout['$defs'] as Record<string, Record<string, unknown>>;

    // Collision should resolve in favor of primary catalog
    expect(components['SharedWidget']['description']).toBe('Primary version');
    expect(functions['sharedFunc']['description']).toBe('Primary sharedFunc');
    expect(defs['SharedDef']['description']).toBe('Primary SharedDef');
  });

  it('provides canonical V1_0_COMMON_TYPES_SCHEMA schema definition', () => {
    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: basicCatalog,
      catalogs: [basicCatalog],
    });

    const commonTypesEntry = schemas.find(
      s => s.uri === 'https://a2ui.org/specification/v1_0/common_types.json',
    );
    expect(commonTypesEntry?.schema).toEqual(V1_0_COMMON_TYPES_SCHEMA);
  });

  it('strips prototype pollution keys (__proto__, constructor, prototype) during normalization and buildSchemas', () => {
    const strategy = new V10MonacoSchemaStrategy();
    const maliciousPayload = JSON.parse(`{
      "__proto__": {"polluted": true},
      "constructor": {"polluted": true},
      "prototype": {"polluted": true},
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "constructor": "evil"
        }
      }
    }`);

    const normalized = strategy.normalizeRefs(maliciousPayload) as Record<string, unknown>;
    expect(Object.prototype.hasOwnProperty.call(normalized, '__proto__')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(normalized, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(normalized, 'prototype')).toBe(false);
    expect(normalized['type']).toBe('object');

    const props = normalized['properties'] as Record<string, unknown>;
    const title = props['title'] as Record<string, unknown>;
    expect(title['type']).toBe('string');
    expect(Object.prototype.hasOwnProperty.call(title, 'constructor')).toBe(false);

    // Also verify when passed as a catalog through buildSchemas
    const maliciousCatalog = {
      ...basicCatalog,
      $id: 'https://a2ui.org/specification/v1_0/catalogs/malicious/catalog.json',
      constructor: 'should-be-stripped',
      prototype: 'should-be-stripped',
    } as unknown as Catalog;

    const schemas = strategy.buildSchemas({
      catalog: maliciousCatalog,
      catalogs: [maliciousCatalog],
    });
    const entry = schemas.find(s => s.uri === maliciousCatalog.$id);
    expect(entry).toBeDefined();
    expect(Object.prototype.hasOwnProperty.call(entry?.schema, 'constructor')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(entry?.schema, 'prototype')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(entry?.schema, '__proto__')).toBe(false);
  });

  it('preserves merged definitions including secondary-catalog functions in catalog.json alias schemas when primary catalog defines anyFunction and anyComponent', () => {
    const primaryCatalogWithDefs: Catalog = {
      $id: 'https://example.com/primary-catalog.json',
      title: 'Primary Catalog',
      protocolVersion: '1.0',
      components: {
        Button: {
          type: 'object',
          properties: {component: {const: 'Button'}},
          required: ['component'],
        },
      },
      functions: {
        primaryFunc: {type: 'object', description: 'Primary function'},
      },
      $defs: {
        anyFunction: {
          oneOf: [{$ref: '#/functions/primaryFunc'}],
        },
        anyComponent: {
          oneOf: [{$ref: '#/components/Button'}],
        },
      },
    };

    const secondaryCatalog: Catalog = {
      $id: 'https://example.com/secondary-catalog.json',
      title: 'Secondary Catalog',
      protocolVersion: '1.0',
      components: {
        Card: {
          type: 'object',
          properties: {component: {const: 'Card'}},
          required: ['component'],
        },
      },
      functions: {
        secondaryFunc: {type: 'object', description: 'Secondary function'},
      },
    };

    const strategy = new V10MonacoSchemaStrategy();
    const schemas = strategy.buildSchemas({
      catalog: primaryCatalogWithDefs,
      catalogs: [primaryCatalogWithDefs, secondaryCatalog],
    });

    const aliasUris = [
      'file:///catalog.json',
      'catalog.json',
      'https://a2ui.org/specification/v1_0/catalog.json',
    ];
    for (const uri of aliasUris) {
      const aliasEntry = schemas.find(s => s.uri === uri);
      expect(aliasEntry, `Alias schema ${uri} should exist`).toBeDefined();
      const schema = aliasEntry?.schema as Record<string, unknown>;
      const defs = schema['$defs'] as Record<string, Record<string, unknown>>;
      expect(defs).toBeDefined();
      expect(defs['anyFunction']).toEqual({
        oneOf: [{$ref: '#/functions/primaryFunc'}, {$ref: '#/functions/secondaryFunc'}],
      });
      expect(defs['anyComponent']).toEqual({
        oneOf: [{$ref: '#/components/Button'}, {$ref: '#/components/Card'}],
      });
      const fns = schema['functions'] as Record<string, unknown>;
      expect(fns['primaryFunc']).toBeDefined();
      expect(fns['secondaryFunc']).toBeDefined();
    }
  });
});
