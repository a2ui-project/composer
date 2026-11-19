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
import type {A2aPart} from '../../chat/a2a/a2a-types';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {CatalogJson} from '../../storage/models/catalog-storage.model';
import {BaseA2aProtocolStrategy} from './a2a-protocol-strategy';

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
export class V09A2aStrategy extends BaseA2aProtocolStrategy {
  override readonly version: A2uiProtocolVersion = 'v0.9';
  override readonly canonicalWireVersion: string = 'v0.9';
  protected override readonly recognizedOperations = V09_UPDATE_KEYS;

  override getClientConfiguration(_activeCatalogs?: CatalogJson[]): Record<string, unknown> {
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

  override buildActionDataPart(
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
}
