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

import type {A2uiProtocolVersion, ComponentUsage} from 'a2ui-bridge';
import type {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import {
  type ComponentProvenance,
  type GalleryProtocolStrategy,
  getComponentsPayload,
} from './gallery-protocol-strategy';

const DEFAULT_V10_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

/**
 * Gallery protocol strategy implementing A2UI v1.0 single-message createSurface
 * preview payloads, multi-catalog provenance across activeCatalogs(), and
 * {'@path'} / {'@call'} dynamic bindings.
 */
export class V10GalleryStrategy implements GalleryProtocolStrategy {
  readonly version: A2uiProtocolVersion = 'v1.0';

  buildPreviewPayload(
    preset: ComponentUsage,
    catalogId: string,
    surfaceId = 'gallery-preview',
  ): unknown[] {
    const resolvedCatalogId = catalogId || DEFAULT_V10_CATALOG_ID;

    const createSurfaceDetails: Record<string, unknown> = {
      surfaceId,
      catalogId: resolvedCatalogId,
      components: getComponentsPayload(preset.usage),
      sendDataModel: true,
    };

    if (preset.data !== undefined) {
      createSurfaceDetails['dataModel'] = preset.data;
    }

    return [
      {
        version: '1.0',
        createSurface: createSurfaceDetails,
      },
    ];
  }

  extractComponents(
    catalogs: CatalogJson[] | CatalogJson | null | undefined,
  ): Map<string, ComponentProvenance> {
    const map = new Map<string, ComponentProvenance>();
    if (!catalogs) {
      return map;
    }

    const catalogsList: Catalog[] = Array.isArray(catalogs) ? catalogs : [catalogs];

    for (const catalog of catalogsList) {
      if (!catalog || !catalog.components) {
        continue;
      }

      const catalogId = catalog.catalogId || catalog.$id || DEFAULT_V10_CATALOG_ID;
      const catalogTitle = catalog.title || '';

      for (const [key, schema] of Object.entries(catalog.components)) {
        if (!map.has(key)) {
          map.set(key, {
            componentKey: key,
            componentSchema: schema,
            catalogId,
            catalogTitle,
            catalog,
          });
        }
      }
    }

    return map;
  }

  isDynamicBinding(value: unknown): boolean {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;
    if (
      Object.hasOwn(record, '__proto__') ||
      Object.hasOwn(record, 'constructor') ||
      Object.hasOwn(record, 'prototype')
    ) {
      return false;
    }
    return typeof record['@path'] === 'string';
  }

  isDynamicCall(value: unknown): boolean {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;
    if (
      Object.hasOwn(record, '__proto__') ||
      Object.hasOwn(record, 'constructor') ||
      Object.hasOwn(record, 'prototype')
    ) {
      return false;
    }
    return (
      typeof record['@call'] === 'string' &&
      (record['args'] === undefined ||
        (typeof record['args'] === 'object' &&
          record['args'] !== null &&
          !Array.isArray(record['args']))) &&
      (record['@args'] === undefined ||
        (typeof record['@args'] === 'object' &&
          record['@args'] !== null &&
          !Array.isArray(record['@args'])))
    );
  }

  describeDynamicValue(value: unknown): string | null {
    if (this.isDynamicBinding(value)) {
      const path = (value as Record<string, unknown>)['@path'];
      return `Bound to ${String(path)} — edit in the JSON editor.`;
    }
    if (this.isDynamicCall(value)) {
      const call = (value as Record<string, unknown>)['@call'];
      return `Computed by ${String(call)}() — edit in the JSON editor.`;
    }
    return null;
  }
}
