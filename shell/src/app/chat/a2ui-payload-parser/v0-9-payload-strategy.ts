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
  A2uiComponentInstance,
  PreviewBridgeMessageType,
  RenderA2uiItem,
  type A2uiProtocolVersion,
} from 'a2ui-bridge';
import type {TaggedLogger} from '../../debug/error-logger.service';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {stripPrototypePollutionKeys} from '../../shell/cross-frame-validator/wire-version-validator';
import type {Catalog, CatalogJson} from '../../storage/models/catalog-storage.model';
import type {PayloadProtocolStrategy} from './payload-protocol-strategy';
import {buildComponentHealMap, healComponentList} from './component-name-healer';

const V09_COMMAND_KEYS = ['createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface'];

/**
 * Payload parsing, healing, and validation strategy for A2UI v0.9 protocol specifications.
 */
export class V09PayloadStrategy implements PayloadProtocolStrategy {
  readonly version: A2uiProtocolVersion = 'v0.9';
  readonly canonicalWireVersion = 'v0.9';

  resolveComponentCount(blocks: unknown[]): number {
    return (blocks as RenderA2uiItem[]).reduce((acc, obj) => {
      if (!obj || typeof obj !== 'object') return acc;
      if (obj.updateComponents && Array.isArray(obj.updateComponents.components)) {
        return acc + obj.updateComponents.components.length;
      }
      if (obj.createSurface) return acc + 1;
      return acc;
    }, 0);
  }

  normalizeBlocks(blocks: unknown[]): unknown[] {
    return blocks.map(block => {
      if (!block || typeof block !== 'object' || Array.isArray(block)) {
        return this.sanitizePayload(block);
      }

      const sanitized = this.sanitizePayload(block) as Record<string, unknown>;
      const hasCommand = V09_COMMAND_KEYS.some(k => k in sanitized);
      if (hasCommand) {
        const ver = sanitized['version'];
        if (ver === undefined || ver === '0.9' || ver === 'v0.9') {
          sanitized['version'] = this.canonicalWireVersion;
        }
      }
      return sanitized;
    });
  }

  runCatalogComponentSchemaCheck(
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

  sanitizePayload<T>(payload: T): T {
    return stripPrototypePollutionKeys(payload);
  }

  validateOutgoingBlocks(
    blocks: unknown[],
    errors?: string[],
    logger?: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    const mockEnvMsg = {
      type: PreviewBridgeMessageType.RENDER_A2UI,
      payload: blocks,
    };
    return CrossFrameValidator.validateOutgoingMessage(
      mockEnvMsg,
      errors,
      logger ?? {error: () => {}, warn: () => {}},
    );
  }
}
