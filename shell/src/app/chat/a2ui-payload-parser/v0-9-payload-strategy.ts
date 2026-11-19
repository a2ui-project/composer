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

import {
  A2UI_UPDATE_KEYS,
  A2uiComponentInstance,
  RenderA2uiItem,
  type A2uiProtocolVersion,
} from 'a2ui-bridge';
import type {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import {BasePayloadProtocolStrategy} from './payload-protocol-strategy';
import {buildComponentHealMap, healComponentList} from './component-name-healer';

/**
 * Payload parsing, healing, and validation strategy for A2UI v0.9 protocol specifications.
 */
export class V09PayloadStrategy extends BasePayloadProtocolStrategy {
  override readonly version: A2uiProtocolVersion = 'v0.9';
  override readonly canonicalWireVersion = 'v0.9';
  protected override readonly recognizedCommandKeys = A2UI_UPDATE_KEYS;
  protected override readonly canonicalizableVersions = new Set(['0.9', 'v0.9']);

  override resolveComponentCount(blocks: unknown[]): number {
    return (blocks as RenderA2uiItem[]).reduce((acc, obj) => {
      if (!obj || typeof obj !== 'object') return acc;
      if (obj.updateComponents && Array.isArray(obj.updateComponents.components)) {
        return acc + obj.updateComponents.components.length;
      }
      if (obj.createSurface) return acc + 1;
      return acc;
    }, 0);
  }

  override runCatalogComponentSchemaCheck(
    parsedBlocks: unknown[],
    componentsOrCatalog?: Record<string, unknown> | CatalogJson,
    catalogObj?: Record<string, unknown> | CatalogJson,
    _activeCatalogs?: readonly (Catalog | CatalogJson)[],
  ): boolean {
    const catalog =
      catalogObj ??
      (componentsOrCatalog && 'components' in componentsOrCatalog
        ? componentsOrCatalog
        : undefined);
    const componentsObj =
      catalog && catalog['components']
        ? (catalog['components'] as Record<string, unknown>)
        : (componentsOrCatalog as Record<string, unknown> | undefined);

    let healed = false;
    const healMap = buildComponentHealMap(componentsObj);

    for (const block of parsedBlocks) {
      if (!block || typeof block !== 'object') continue;
      const b = block as Record<string, unknown>;
      if (!b['updateComponents'] || typeof b['updateComponents'] !== 'object') continue;
      const updateComponents = b['updateComponents'] as Record<string, unknown>;
      if (!Array.isArray(updateComponents['components'])) continue;

      const result = healComponentList(
        updateComponents['components'] as unknown[],
        componentsObj,
        healMap,
      );
      if (result.healed) {
        healed = true;
        updateComponents['components'] = result.components as A2uiComponentInstance[];
      }
    }
    return healed;
  }
}
