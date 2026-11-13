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

import {Injectable} from '@angular/core';
import type * as monaco from 'monaco-editor';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import {
  CatalogJson,
  getCatalogFunctionEntries,
} from '../../../storage/models/catalog-storage.model';
import {V1_0_COMMON_TYPES_SCHEMA} from '../../../gallery/schema/v1-0/common-types-schema';
import {MonacoSchemaStrategy, MonacoSchemaStrategyOptions} from './monaco-schema-strategy';

const V1_0_COMMON_TYPES_URI = 'https://a2ui.org/specification/v1_0/common_types.json';

/**
 * Monaco JSON diagnostics schema strategy for A2UI v1.0 protocol payloads.
 */
@Injectable({
  providedIn: 'root',
})
export class V10MonacoSchemaStrategy implements MonacoSchemaStrategy {
  readonly protocolVersion: A2uiProtocolVersion = 'v1.0';

  /**
   * Recursively normalizes $ref targets, redirecting relative common types references
   * and undeclared bare #/$defs/* references to canonical v1.0 common_types.json URIs.
   * Strips prototype pollution keys ('__proto__', 'constructor', 'prototype') as defense-in-depth.
   *
   * @param schemaNode The schema node to inspect and normalize.
   * @param catalogDefs Optional definitions map from the host catalog schema.
   * @returns Normalized schema node copy.
   */
  normalizeRefs(schemaNode: unknown, catalogDefs?: Record<string, unknown>): unknown {
    if (schemaNode === null || typeof schemaNode !== 'object') {
      return schemaNode;
    }

    if (Array.isArray(schemaNode)) {
      return schemaNode.map(item => this.normalizeRefs(item, catalogDefs));
    }

    const input = schemaNode as Record<string, unknown>;
    const obj: Record<string, unknown> = {};

    for (const key of Object.getOwnPropertyNames(input)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      const value = input[key];
      if (key === '$ref' && typeof value === 'string') {
        let ref = value;
        if (ref.startsWith('../../common_types.json#')) {
          ref = `${V1_0_COMMON_TYPES_URI}#${ref.slice('../../common_types.json#'.length)}`;
        } else if (ref.startsWith('common_types.json#')) {
          ref = `${V1_0_COMMON_TYPES_URI}#${ref.slice('common_types.json#'.length)}`;
        } else if (ref.startsWith('./common_types.json#')) {
          ref = `${V1_0_COMMON_TYPES_URI}#${ref.slice('./common_types.json#'.length)}`;
        } else if (
          ref === 'common_types.json' ||
          ref === '../../common_types.json' ||
          ref === './common_types.json'
        ) {
          ref = V1_0_COMMON_TYPES_URI;
        } else if (ref.startsWith('#/$defs/')) {
          const defName = ref.slice('#/$defs/'.length);
          const commonDefs = V1_0_COMMON_TYPES_SCHEMA['$defs'] as
            Record<string, unknown> | undefined;
          if ((!catalogDefs || !(defName in catalogDefs)) && commonDefs && defName in commonDefs) {
            ref = `${V1_0_COMMON_TYPES_URI}#/$defs/${defName}`;
          }
        }
        obj['$ref'] = ref;
      } else {
        obj[key] = this.normalizeRefs(value, catalogDefs);
      }
    }

    return obj;
  }

  /**
   * Constructs Monaco JSON diagnostic schemas for A2UI v1.0 layouts, multi-catalogs, and RPC messages.
   *
   * @param options The catalog options containing primary and secondary catalogs.
   * @returns Array of Monaco diagnostic schema configurations for v1.0.
   */
  buildSchemas(
    options: MonacoSchemaStrategyOptions,
  ): NonNullable<monaco.json.DiagnosticsOptions['schemas']> {
    const getId = (c: CatalogJson | null | undefined): string | undefined => c?.catalogId ?? c?.$id;
    const rawCatalogs: CatalogJson[] = [...options.catalogs];
    const primaryId = getId(options.catalog);
    if (options.catalog && !rawCatalogs.some(c => getId(c) && getId(c) === primaryId)) {
      rawCatalogs.unshift(options.catalog);
    }

    const normalizedCatalogs = rawCatalogs.map(
      cat => this.normalizeRefs(cat, cat.$defs) as CatalogJson,
    );

    const mergedComponents: unknown[] = [];
    const mergedComponentMap: Record<string, unknown> = {};
    const mergedDefs: Record<string, unknown> = {};
    const mergedFunctions: Record<string, unknown> = {};
    for (const cat of normalizedCatalogs) {
      if (cat.components && typeof cat.components === 'object') {
        mergedComponents.push(...Object.values(cat.components));
        for (const [key, val] of Object.entries(cat.components)) {
          if (!Object.hasOwn(mergedComponentMap, key)) {
            mergedComponentMap[key] = val;
          }
        }
      }
      if (cat.$defs && typeof cat.$defs === 'object') {
        for (const [key, val] of Object.entries(cat.$defs)) {
          if (!Object.hasOwn(mergedDefs, key)) {
            mergedDefs[key] = val;
          }
        }
      }
      for (const [key, val] of getCatalogFunctionEntries(cat)) {
        if (!Object.hasOwn(mergedFunctions, key)) {
          mergedFunctions[key] = val;
        }
      }
    }

    if (Object.keys(mergedFunctions).length > 0) {
      mergedDefs['anyFunction'] = {
        oneOf: Object.keys(mergedFunctions).map(name => ({$ref: '#/functions/' + name})),
      };
    } else {
      mergedDefs['anyFunction'] = {not: {}};
    }

    if (Object.keys(mergedComponentMap).length > 0) {
      mergedDefs['anyComponent'] = {
        oneOf: Object.keys(mergedComponentMap).map(name => ({$ref: '#/components/' + name})),
      };
    }

    const componentUnion =
      mergedComponents.length > 0
        ? {
            type: 'object',
            allOf: [
              {
                $ref: `${V1_0_COMMON_TYPES_URI}#/$defs/ComponentCommon`,
              },
              {
                anyOf: mergedComponents,
              },
            ],
          }
        : {
            type: 'object',
          };

    const versionSchema = {
      type: 'string',
      const: '1.0',
      default: '1.0',
    };

    const createSurfaceEnvelope = {
      type: 'object',
      properties: {
        version: versionSchema,
        createSurface: {
          type: 'object',
          properties: {
            surfaceId: {type: 'string'},
            catalogId: {type: 'string'},
            sendDataModel: {type: 'boolean'},
            components: {
              type: 'array',
              minItems: 1,
              items: componentUnion,
            },
            dataModel: {
              type: 'object',
              additionalProperties: true,
            },
            metadata: {
              type: 'object',
              properties: {
                extensions: {
                  $ref: `${V1_0_COMMON_TYPES_URI}#/$defs/Extensions`,
                },
              },
              additionalProperties: false,
            },
          },
          required: ['surfaceId'],
          additionalProperties: false,
        },
      },
      required: ['createSurface', 'version'],
      additionalProperties: false,
    };

    const updateComponentsEnvelope = {
      type: 'object',
      properties: {
        version: versionSchema,
        updateComponents: {
          type: 'object',
          properties: {
            surfaceId: {type: 'string'},
            components: {
              type: 'array',
              minItems: 1,
              items: componentUnion,
            },
          },
          required: ['surfaceId', 'components'],
          additionalProperties: false,
        },
      },
      required: ['updateComponents', 'version'],
      additionalProperties: false,
    };

    const updateDataModelEnvelope = {
      type: 'object',
      properties: {
        version: versionSchema,
        updateDataModel: {
          type: 'object',
          properties: {
            surfaceId: {type: 'string'},
            path: {type: 'string'},
            value: {},
          },
          required: ['surfaceId', 'value'],
          additionalProperties: false,
        },
      },
      required: ['updateDataModel', 'version'],
      additionalProperties: false,
    };

    const deleteSurfaceEnvelope = {
      type: 'object',
      properties: {
        version: versionSchema,
        deleteSurface: {
          type: 'object',
          properties: {
            surfaceId: {type: 'string'},
          },
          required: ['surfaceId'],
          additionalProperties: false,
        },
      },
      required: ['deleteSurface', 'version'],
      additionalProperties: false,
    };

    const callRendererFunctionEnvelope = {
      type: 'object',
      properties: {
        version: versionSchema,
        callRendererFunction: {
          type: 'object',
          properties: {
            surfaceId: {type: 'string'},
            functionCallId: {
              $ref: `${V1_0_COMMON_TYPES_URI}#/$defs/CallId`,
            },
            callFunction: {
              allOf: [
                {
                  $ref: `${V1_0_COMMON_TYPES_URI}#/$defs/FunctionCall`,
                },
                {
                  required: ['catalogId'],
                },
              ],
            },
          },
          required: ['functionCallId', 'callFunction'],
          additionalProperties: false,
        },
      },
      required: ['callRendererFunction', 'version'],
      additionalProperties: false,
    };

    const agentFunctionResponseEnvelope = {
      type: 'object',
      properties: {
        version: versionSchema,
        agentFunctionResponse: {
          $ref: `${V1_0_COMMON_TYPES_URI}#/$defs/FunctionResponse`,
        },
      },
      required: ['agentFunctionResponse', 'version'],
      additionalProperties: false,
    };

    const layoutSchema: Record<string, unknown> = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'array',
      ...(Object.keys(mergedDefs).length > 0 ? {$defs: mergedDefs} : {}),
      ...(Object.keys(mergedComponentMap).length > 0 ? {components: mergedComponentMap} : {}),
      ...(Object.keys(mergedFunctions).length > 0 ? {functions: mergedFunctions} : {}),
      items: {
        type: 'object',
        oneOf: [
          createSurfaceEnvelope,
          updateComponentsEnvelope,
          updateDataModelEnvelope,
          deleteSurfaceEnvelope,
          callRendererFunctionEnvelope,
          agentFunctionResponseEnvelope,
        ],
      },
    };

    const galleryExampleSchema: Record<string, unknown> = {
      type: 'object',
      ...(Object.keys(mergedDefs).length > 0 ? {$defs: mergedDefs} : {}),
      ...(Object.keys(mergedComponentMap).length > 0 ? {components: mergedComponentMap} : {}),
      ...(Object.keys(mergedFunctions).length > 0 ? {functions: mergedFunctions} : {}),
      properties: {
        components: {
          type: 'array',
          items: componentUnion,
        },
        data: {
          type: 'object',
        },
      },
      required: ['components'],
      additionalProperties: false,
    };

    const schemas: NonNullable<monaco.json.DiagnosticsOptions['schemas']> = [
      {
        uri: 'a2ui-catalog-schema',
        fileMatch: ['inmemory://model/layout-*.json'],
        schema: structuredClone(layoutSchema),
      },
      {
        uri: 'a2ui-gallery-example-schema',
        fileMatch: ['inmemory://model/gallery-draft-*.json'],
        schema: structuredClone(galleryExampleSchema),
      },
      {
        uri: V1_0_COMMON_TYPES_URI,
        schema: structuredClone(V1_0_COMMON_TYPES_SCHEMA),
      },
      {
        uri: 'file:///common_types.json',
        schema: structuredClone(V1_0_COMMON_TYPES_SCHEMA),
      },
      {
        uri: 'common_types.json',
        schema: structuredClone(V1_0_COMMON_TYPES_SCHEMA),
      },
      {
        uri: '../../common_types.json',
        schema: structuredClone(V1_0_COMMON_TYPES_SCHEMA),
      },
    ];

    const basePrimaryCatalog =
      normalizedCatalogs[0] ?? (options.catalog ? this.normalizeRefs(options.catalog) : null);

    const primaryCatalog = basePrimaryCatalog
      ? {
          ...(basePrimaryCatalog as Record<string, unknown>),
          ...(Object.keys(mergedDefs).length > 0 ? {$defs: mergedDefs} : {}),
          ...(Object.keys(mergedComponentMap).length > 0 ? {components: mergedComponentMap} : {}),
          ...(Object.keys(mergedFunctions).length > 0 ? {functions: mergedFunctions} : {}),
        }
      : null;

    if (primaryCatalog) {
      schemas.push(
        {
          uri: 'file:///catalog.json',
          schema: structuredClone(primaryCatalog),
        },
        {
          uri: 'catalog.json',
          schema: structuredClone(primaryCatalog),
        },
        {
          uri: 'https://a2ui.org/specification/v1_0/catalog.json',
          schema: structuredClone(primaryCatalog),
        },
      );
    }

    for (const cat of normalizedCatalogs) {
      if (cat.$id) {
        schemas.push({
          uri: cat.$id,
          schema: structuredClone(cat),
        });
      }
      if (cat.catalogId && cat.catalogId !== cat.$id) {
        schemas.push({
          uri: cat.catalogId,
          schema: structuredClone(cat),
        });
      }
    }

    return schemas;
  }
}
