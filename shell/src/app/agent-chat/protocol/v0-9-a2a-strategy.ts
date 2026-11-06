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
import type {RenderA2uiItem} from 'a2ui-bridge';
import type {A2aPart} from '../../chat/a2a/a2a-types';
import type {
  V10CallAgentFunctionPayload,
  V10RendererFunctionResponsePayload,
} from '../../shell/cross-frame-validator/v1-0-wire-validator';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {CatalogJson} from '../../storage/models/catalog-storage.model';
import {type A2aProtocolStrategy, sanitizeA2uiPayload} from './a2a-protocol-strategy';

/** Canonical A2UI v0.9 update keys. */
const V09_UPDATE_KEYS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
] as const;

/**
 * A2A protocol strategy implementing A2UI v0.9 client capabilities,
 * action formatting, 3-message surface partitioning, and wire version enforcement.
 */
@Injectable({
  providedIn: 'root',
})
export class V09A2aStrategy implements A2aProtocolStrategy {
  readonly version: A2uiProtocolVersion = 'v0.9';
  readonly canonicalWireVersion: string = 'v0.9';
  readonly mimeType: string = 'application/a2ui+json';

  getClientConfiguration(_activeCatalogs?: CatalogJson[]): Record<string, unknown> {
    const supportedExtensions = [
      'https://a2ui.org/a2a-extension/a2ui/v0.9',
      'https://a2ui.org/a2a-extension/a2ui/v0.8',
    ];
    return {
      ['capabilities']: {
        ['extensions']: supportedExtensions.map(uri => ({['uri']: uri})),
      },
      ['extensions']: supportedExtensions,
      ['acceptedOutputModes']: [
        'text/plain',
        'application/json',
        'application/json+a2ui',
        'application/a2ui+json',
      ],
    };
  }

  normalizeWireVersion(_rawVersion?: unknown): string {
    return this.canonicalWireVersion;
  }

  buildActionDataPart(
    action: unknown,
    _userMessage?: string,
    _metadata?: Record<string, unknown>,
  ): A2aPart {
    return {
      data: {
        ['version']: this.canonicalWireVersion,
        ['action']: action,
      },
      metadata: {
        ['mimeType']: this.mimeType,
        ['type']: 'a2ui_action',
      },
    };
  }

  buildCallAgentFunctionDataPart(payload: V10CallAgentFunctionPayload): A2aPart {
    return {
      data: {
        ['version']: this.canonicalWireVersion,
        ['callAgentFunction']: payload,
      },
      metadata: {
        ['mimeType']: this.mimeType,
        ['type']: 'a2ui_call_agent_function',
      },
    };
  }

  buildRendererFunctionResponseDataPart(payload: V10RendererFunctionResponsePayload): A2aPart {
    return {
      data: {
        ['version']: this.canonicalWireVersion,
        ['rendererFunctionResponse']: payload,
      },
      metadata: {
        ['mimeType']: this.mimeType,
        ['type']: 'a2ui_renderer_function_response',
      },
    };
  }

  isA2uiItem(item: unknown): boolean {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const obj = item as Record<string, unknown>;
    return V09_UPDATE_KEYS.some(key => key in obj && obj[key] !== undefined && obj[key] !== null);
  }

  normalizeItems(items: readonly unknown[]): RenderA2uiItem[] {
    if (!items || !Array.isArray(items)) return [];

    const seenSurfaces = new Set<string>();
    const normalized: RenderA2uiItem[] = [];

    for (const raw of items) {
      if (!this.isA2uiItem(raw)) {
        continue;
      }
      const sanitized = sanitizeA2uiPayload(raw) as Record<string, unknown>;
      const item: RenderA2uiItem = {
        ...sanitized,
        version: this.canonicalWireVersion,
      } as RenderA2uiItem;

      if (item.createSurface?.surfaceId) {
        const surfaceId = item.createSurface.surfaceId;
        if (seenSurfaces.has(surfaceId)) {
          continue;
        }
        seenSurfaces.add(surfaceId);
      } else if (item.deleteSurface?.surfaceId) {
        seenSurfaces.delete(item.deleteSurface.surfaceId);
      }

      normalized.push(item);
    }

    return normalized;
  }

  isA2uiRpcEnvelope(_item: unknown): boolean {
    return false;
  }
}
