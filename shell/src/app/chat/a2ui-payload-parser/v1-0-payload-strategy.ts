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
  A2UI_ONE_SHOT_RPC_KEYS,
  A2UI_UPDATE_KEYS,
  A2uiComponentInstance,
  type A2uiProtocolVersion,
} from 'a2ui-bridge';
import {normalizeV10RpcEnvelopeItem} from '../../shared/a2ui-rpc-envelope';
import {
  type Catalog,
  type CatalogJson,
  catalogDeclaresFunction,
  getCatalogId,
} from '../../storage/models/catalog-storage.model';
import {BasePayloadProtocolStrategy} from './payload-protocol-strategy';
import {buildComponentHealMap, healComponentList} from './component-name-healer';

/**
 * Payload parsing, healing, and validation strategy for A2UI v1.0 protocol specifications.
 */
export class V10PayloadStrategy extends BasePayloadProtocolStrategy {
  override readonly version: A2uiProtocolVersion = 'v1.0';
  override readonly canonicalWireVersion = '1.0';
  protected override readonly recognizedCommandKeys = [
    ...A2UI_UPDATE_KEYS,
    ...A2UI_ONE_SHOT_RPC_KEYS,
  ];
  protected override readonly canonicalizableVersions = new Set(['1.0', 'v1.0']);

  override resolveComponentCount(blocks: unknown[]): number {
    return (blocks as Array<Record<string, unknown>>).reduce((acc, obj) => {
      if (!obj || typeof obj !== 'object') return acc;

      let count = 0;
      if (obj['createSurface'] && typeof obj['createSurface'] === 'object') {
        const createSurface = obj['createSurface'] as Record<string, unknown>;
        if (Array.isArray(createSurface['components'])) {
          count += createSurface['components'].length;
        } else {
          count += 1;
        }
      }

      if (obj['updateComponents'] && typeof obj['updateComponents'] === 'object') {
        const updateComponents = obj['updateComponents'] as Record<string, unknown>;
        if (Array.isArray(updateComponents['components'])) {
          count += updateComponents['components'].length;
        }
      }

      return acc + count;
    }, 0);
  }

  protected override normalizeSanitizedBlock(
    block: Record<string, unknown>,
  ): Record<string, unknown> {
    return normalizeV10RpcEnvelopeItem(block);
  }

  override runCatalogComponentSchemaCheck(
    parsedBlocks: unknown[],
    componentsOrCatalog?: Record<string, unknown> | CatalogJson,
    catalogObj?: Record<string, unknown> | CatalogJson,
    activeCatalogs?: readonly (Catalog | CatalogJson)[],
  ): boolean {
    const catalog =
      catalogObj ??
      (componentsOrCatalog &&
      ('components' in componentsOrCatalog ||
        '$id' in componentsOrCatalog ||
        'catalogId' in componentsOrCatalog)
        ? componentsOrCatalog
        : undefined);

    const componentsObj =
      catalog && catalog['components']
        ? (catalog['components'] as Record<string, unknown>)
        : (componentsOrCatalog as Record<string, unknown> | undefined);

    const defaultCatalogId =
      (catalog?.['$id'] as string | undefined) ?? (catalog?.['catalogId'] as string | undefined);

    const candidateCatalogs: Catalog[] = [];
    if (activeCatalogs && activeCatalogs.length > 0) {
      candidateCatalogs.push(...(activeCatalogs as Catalog[]));
    }
    if (
      catalogObj &&
      ('functions' in catalogObj || '$id' in catalogObj || 'catalogId' in catalogObj)
    ) {
      candidateCatalogs.push(catalogObj as Catalog);
    }
    if (catalog && !candidateCatalogs.includes(catalog as Catalog)) {
      candidateCatalogs.push(catalog as Catalog);
    }

    let healed = false;
    const healMap = buildComponentHealMap(componentsObj);

    for (const block of parsedBlocks) {
      if (!block || typeof block !== 'object') continue;
      const b = block as Record<string, unknown>;

      if (b['createSurface'] && typeof b['createSurface'] === 'object') {
        const createSurface = b['createSurface'] as Record<string, unknown>;
        if (defaultCatalogId) {
          const currentCatalogId =
            typeof createSurface['catalogId'] === 'string' ? createSurface['catalogId'].trim() : '';
          if (!currentCatalogId) {
            createSurface['catalogId'] = defaultCatalogId;
            healed = true;
          }
        }
        if (Array.isArray(createSurface['components'])) {
          const result = healComponentList(
            createSurface['components'] as unknown[],
            componentsObj,
            healMap,
          );
          if (result.healed) {
            healed = true;
            createSurface['components'] = result.components as A2uiComponentInstance[];
          }
        }
      }

      if (b['updateComponents'] && typeof b['updateComponents'] === 'object') {
        const updateComponents = b['updateComponents'] as Record<string, unknown>;
        if (Array.isArray(updateComponents['components'])) {
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
      }

      if (b['callRendererFunction'] && typeof b['callRendererFunction'] === 'object') {
        const crf = b['callRendererFunction'] as Record<string, unknown>;
        if (
          crf['callFunction'] &&
          typeof crf['callFunction'] === 'object' &&
          !Array.isArray(crf['callFunction'])
        ) {
          const cf = crf['callFunction'] as Record<string, unknown>;
          if (!cf['catalogId'] || typeof cf['catalogId'] !== 'string' || !cf['catalogId'].trim()) {
            const fnName = typeof cf['@call'] === 'string' ? cf['@call'] : undefined;
            const declaringCatalog = fnName
              ? candidateCatalogs.find(c => catalogDeclaresFunction(c, fnName))
              : undefined;
            const targetCatalogId =
              (declaringCatalog ? getCatalogId(declaringCatalog) : undefined) ?? defaultCatalogId;
            if (targetCatalogId) {
              cf['catalogId'] = targetCatalogId;
              healed = true;
            }
          }
        }
      }
    }

    return healed;
  }
}
