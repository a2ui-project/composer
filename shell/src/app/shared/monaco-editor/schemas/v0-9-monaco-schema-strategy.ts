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
import {COMMON_TYPES_SCHEMA} from '../../../gallery/schema/common-types-schema';
import {MonacoSchemaStrategy, MonacoSchemaStrategyOptions} from './monaco-schema-strategy';

/**
 * Monaco JSON diagnostics schema strategy for A2UI v0.9 protocol payloads.
 */
@Injectable({
  providedIn: 'root',
})
export class V09MonacoSchemaStrategy implements MonacoSchemaStrategy {
  readonly protocolVersion: A2uiProtocolVersion = 'v0.9';

  /**
   * Constructs Monaco JSON diagnostic schemas for A2UI v0.9 layouts and gallery drafts.
   *
   * @param options The active catalog options.
   * @returns Array of Monaco diagnostic schema configurations for v0.9.
   */
  buildSchemas(
    options: MonacoSchemaStrategyOptions,
  ): NonNullable<monaco.json.DiagnosticsOptions['schemas']> {
    const catalog = options.catalog ?? (options.catalogs.length > 0 ? options.catalogs[0] : null);
    const componentSchemas = Object.values(catalog?.components || {});

    const layoutSchema: Record<string, unknown> = {
      ...(catalog || {}),
      type: 'array',
      items: {
        type: 'object',
        properties: {
          version: {type: 'string'},
          createSurface: {
            type: 'object',
            properties: {
              surfaceId: {type: 'string'},
              catalogId: {type: 'string'},
              sendDataModel: {type: 'boolean'},
            },
            required: ['surfaceId', 'catalogId'],
          },
          deleteSurface: {
            type: 'object',
            properties: {
              surfaceId: {type: 'string'},
            },
            required: ['surfaceId'],
          },
          updateComponents: {
            type: 'object',
            properties: {
              surfaceId: {type: 'string'},
              components: {
                type: 'array',
                items: {
                  anyOf: componentSchemas,
                },
              },
            },
            required: ['surfaceId', 'components'],
          },
          updateDataModel: {
            type: 'object',
            properties: {
              surfaceId: {type: 'string'},
              path: {type: 'string'},
              value: {},
            },
            required: ['surfaceId'],
          },
        },
        additionalProperties: false,
      },
    };

    const galleryExampleSchema: Record<string, unknown> = {
      ...(catalog || {}),
      type: 'object',
      properties: {
        components: {
          type: 'array',
          items: {
            anyOf: componentSchemas,
          },
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
        uri: 'file:///common_types.json',
        schema: structuredClone(COMMON_TYPES_SCHEMA),
      },
      {
        uri: 'https://a2ui.org/specification/v0_9/common_types.json',
        schema: structuredClone(COMMON_TYPES_SCHEMA),
      },
    ];

    if (catalog) {
      schemas.push(
        {
          uri: 'file:///catalog.json',
          schema: structuredClone(catalog),
        },
        {
          uri: 'https://a2ui.org/specification/v0_9/catalog.json',
          schema: structuredClone(catalog),
        },
      );
      if (catalog.$id && catalog.$id !== 'https://a2ui.org/specification/v0_9/catalog.json') {
        schemas.push({
          uri: catalog.$id,
          schema: structuredClone(catalog),
        });
      }
    }

    return schemas;
  }
}
