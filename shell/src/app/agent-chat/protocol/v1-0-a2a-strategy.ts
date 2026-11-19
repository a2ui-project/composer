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
import {hasDefinedObjectKey, isV10RpcEnvelopeItem, type A2uiProtocolVersion} from 'a2ui-bridge';
import type {CatalogJson} from '../../storage/models/catalog-storage.model';
import {normalizeV10RpcEnvelopeItem} from '../../shared/a2ui-rpc-envelope';
import {BaseA2aProtocolStrategy} from './a2a-protocol-strategy';

/** Canonical A2UI v1.0 operation keys. */
const V10_OPERATIONS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
  'callRendererFunction',
  'agentFunctionResponse',
  'callAgentFunctionResponse',
] as const;

/**
 * A2A protocol strategy implementing A2UI v1.0 client capabilities, multi-catalog
 * advertisements, concurrent RPC envelopes, single-message createSurface, and
 * canonical version 1.0 (without leading 'v') wire normalization.
 */
@Injectable({
  providedIn: 'root',
})
export class V10A2aStrategy extends BaseA2aProtocolStrategy {
  override readonly version: A2uiProtocolVersion = 'v1.0';
  override readonly canonicalWireVersion: string = '1.0';
  protected override readonly recognizedOperations = V10_OPERATIONS;

  override getClientConfiguration(_activeCatalogs?: CatalogJson[]): Record<string, unknown> {
    const supportedExtensions = ['https://a2ui.org/a2a-extension/a2ui/v1.0'];

    return {
      ['extensions']: supportedExtensions,
      ['acceptedOutputModes']: ['text/plain', 'application/json', 'application/a2ui+json'],
    };
  }

  override buildActionDataPart(
    action: unknown,
    userMessage?: string,
    metadata?: Record<string, unknown>,
  ): A2aPart {
    const actionObj: Record<string, unknown> =
      typeof action === 'object' && action !== null && !Array.isArray(action)
        ? {...(action as Record<string, unknown>)}
        : {value: action};

    if (userMessage && !actionObj['userMessage']) {
      actionObj['userMessage'] = userMessage;
    }
    if (metadata && !actionObj['metadata']) {
      actionObj['metadata'] = metadata;
    }

    return {
      data: {
        ['version']: this.canonicalWireVersion,
        ['action']: actionObj,
      },
      metadata: {
        ['mimeType']: this.mimeType,
        ['type']: 'a2ui_action',
      },
    };
  }

  protected override normalizeSanitizedItem(
    item: Record<string, unknown>,
  ): Record<string, unknown> {
    return normalizeV10RpcEnvelopeItem(item);
  }

  override isA2uiRpcEnvelope(item: unknown): boolean {
    return (
      isV10RpcEnvelopeItem(item) ||
      hasDefinedObjectKey(item, ['callAgentFunction', 'rendererFunctionResponse'])
    );
  }
}
