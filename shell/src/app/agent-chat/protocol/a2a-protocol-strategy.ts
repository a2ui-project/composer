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

import type {RenderA2uiItem} from 'a2ui-bridge';
import type {A2aPart} from '../../chat/a2a/a2a-types';
import type {
  V10CallAgentFunctionPayload,
  V10RendererFunctionResponsePayload,
} from '../../shell/cross-frame-validator/v1-0-wire-validator';
import {stripPrototypePollutionKeys} from '../../shell/cross-frame-validator/wire-version-validator';
import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {CatalogJson} from '../../storage/models/catalog-storage.model';

/** Canonical A2UI v1.0 RPC envelope keys. */
export const A2UI_V10_RPC_KEYS = [
  'callRendererFunction',
  'callAgentFunction',
  'callAgentFunctionResponse',
  'agentFunctionResponse',
  'rendererFunctionResponse',
] as const;

/**
 * Strategy interface abstracting protocol-specific A2A behaviors between
 * A2UI v0.9 and v1.0 specifications.
 */
export declare interface A2aProtocolStrategy {
  /** The protocol version identifier. */
  readonly version: A2uiProtocolVersion;

  /** The canonical wire version string stamped onto outgoing envelopes ('v0.9' or '1.0'). */
  readonly canonicalWireVersion: string;

  /** The primary MIME type advertised for A2UI data parts ('application/a2ui+json'). */
  readonly mimeType: string;

  /**
   * Constructs the protocol-specific client configuration options payload
   * (capabilities, extensions, acceptedOutputModes, supportedCatalogIds).
   */
  getClientConfiguration(activeCatalogs?: CatalogJson[]): Record<string, unknown>;

  /**
   * Normalizes incoming wire version string to the canonical protocol version string.
   */
  normalizeWireVersion(rawVersion?: unknown): string;

  /**
   * Formats an outbound user action payload into an A2A DataPart.
   */
  buildActionDataPart(
    action: unknown,
    userMessage?: string,
    metadata?: Record<string, unknown>,
  ): A2aPart;

  /**
   * Formats an outbound callAgentFunction request into an A2A DataPart.
   */
  buildCallAgentFunctionDataPart(payload: V10CallAgentFunctionPayload): A2aPart;

  /**
   * Formats an outbound rendererFunctionResponse into an A2A DataPart.
   */
  buildRendererFunctionResponseDataPart(payload: V10RendererFunctionResponsePayload): A2aPart;

  /**
   * Checks whether a candidate object is a protocol-recognized A2UI item.
   */
  isA2uiItem(item: unknown): boolean;

  /**
   * Normalizes an array of raw items into valid RenderA2uiItem objects,
   * enforcing the canonical wire version, stripping prototype pollution,
   * and partitioning/retaining components as appropriate.
   */
  normalizeItems(items: readonly unknown[]): RenderA2uiItem[];

  /**
   * Checks whether a candidate payload is an A2UI RPC envelope (e.g. callAgentFunction,
   * rendererFunctionResponse, agentFunctionResponse, callRendererFunction).
   */
  isA2uiRpcEnvelope(item: unknown): boolean;
}

/**
 * Recursively strips prototype-pollution keys ('__proto__', 'constructor', 'prototype').
 * Delegates to canonical cross-frame wire-version-validator implementation.
 */
export function sanitizeA2uiPayload<T>(payload: T): T {
  return stripPrototypePollutionKeys(payload);
}
