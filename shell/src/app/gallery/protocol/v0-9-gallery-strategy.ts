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

import type {A2uiProtocolVersion, ComponentUsage, RenderA2uiItem} from 'a2ui-bridge';
import type {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import {
  type ComponentProvenance,
  type GalleryProtocolStrategy,
  getComponentsPayload,
} from './gallery-protocol-strategy';

const V09_FUNCTION_CALL_KEYS = new Set(['call', 'args', 'returnType']);

/**
 * Gallery protocol strategy implementing A2UI v0.9 preview payloads,
 * single-catalog schema extraction, and legacy {path} / {call} dynamic bindings.
 */
export class V09GalleryStrategy implements GalleryProtocolStrategy {
  readonly version: A2uiProtocolVersion = 'v0.9';

  buildPreviewPayload(
    preset: ComponentUsage,
    catalogId: string,
    surfaceId = 'gallery-preview',
  ): RenderA2uiItem[] {
    const payload: RenderA2uiItem[] = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId,
          catalogId,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: getComponentsPayload(preset.usage),
        },
      },
    ];

    if (preset.data !== undefined) {
      payload.push({
        version: 'v0.9',
        updateDataModel: {
          surfaceId,
          value: preset.data,
        },
      });
    }

    return payload;
  }

  extractComponents(
    catalogs: CatalogJson[] | CatalogJson | null | undefined,
  ): Map<string, ComponentProvenance> {
    const map = new Map<string, ComponentProvenance>();
    if (!catalogs) {
      return map;
    }

    const primaryCatalog: Catalog | undefined = Array.isArray(catalogs) ? catalogs[0] : catalogs;

    if (!primaryCatalog || !primaryCatalog.components) {
      return map;
    }

    const catalogId = primaryCatalog.catalogId || primaryCatalog.$id || '';
    const catalogTitle = primaryCatalog.title || '';

    for (const [key, schema] of Object.entries(primaryCatalog.components)) {
      map.set(key, {
        componentKey: key,
        componentSchema: schema,
        catalogId,
        catalogTitle,
        catalog: primaryCatalog,
      });
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
    const keys = Object.keys(record);
    return keys.length === 1 && keys[0] === 'path' && typeof record['path'] === 'string';
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
    const keys = Object.keys(record);
    return (
      typeof record['call'] === 'string' &&
      keys.every(key => V09_FUNCTION_CALL_KEYS.has(key)) &&
      (record['args'] === undefined ||
        (typeof record['args'] === 'object' &&
          record['args'] !== null &&
          !Array.isArray(record['args']))) &&
      (record['returnType'] === undefined || typeof record['returnType'] === 'string')
    );
  }

  describeDynamicValue(value: unknown): string | null {
    if (this.isDynamicBinding(value)) {
      const path = (value as Record<string, unknown>)['path'];
      return `Bound to ${String(path)} — edit in the JSON editor.`;
    }
    if (this.isDynamicCall(value)) {
      const call = (value as Record<string, unknown>)['call'];
      return `Computed by ${String(call)}() — edit in the JSON editor.`;
    }
    return null;
  }
}
