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

import type {A2uiProtocolVersion} from 'a2ui-bridge';
import type {ProtocolSupport} from '../storage/catalog-management/catalog-domain';
import {getCatalogId, type Catalog} from '../storage/models/catalog-storage.model';
import {detectMessageVersion} from './protocol-version-mismatch';

/** Error codes emitted when a payload cannot be dispatched to the active renderer. */
export type PayloadResolutionErrorCode = 'PROTOCOL_VERSION_MISMATCH' | 'UNSUPPORTED_CATALOG';

/** Result of resolving a payload's target protocol version and catalog against renderer support. */
export type PayloadProtocolResolution =
  | {
      readonly status: 'supported';
      readonly version: A2uiProtocolVersion;
      readonly catalogs: readonly Catalog[];
      readonly catalog: Catalog | null;
    }
  | {
      readonly status: 'unsupported';
      readonly code: PayloadResolutionErrorCode;
      readonly message: string;
      readonly anchor: string | null;
    };

/** Supported variant of `PayloadProtocolResolution`. */
export type SupportedPayloadResolution = Extract<PayloadProtocolResolution, {status: 'supported'}>;

/** Minimal error-logger contract used by `gatePayloadDispatch`. */
export interface PayloadErrorSink {
  error(entry: {sourceTag: string; code: PayloadResolutionErrorCode; message: string}): void;
}

/** Formats the error message when a payload targets a protocol version the renderer does not support. */
export function formatUnsupportedProtocolVersionMessage(
  payloadVersion: A2uiProtocolVersion,
  supportedVersions: readonly A2uiProtocolVersion[],
): string {
  return `This renderer does not support A2UI ${payloadVersion}. It supports ${supportedVersions.join(', ')}. Change the payload's "version" or select a renderer that supports ${payloadVersion}.`;
}

/** Formats the error message when one payload mixes v0.9 and v1.0 messages. */
export function formatMixedProtocolVersionsMessage(): string {
  return 'This payload mixes A2UI v0.9 and v1.0 messages. Use one version for all messages.';
}

/** Formats the error message when a multi-catalog renderer does not provide `catalogId` for `version`. */
export function formatUnsupportedCatalogMessage(
  catalogId: string,
  version: A2uiProtocolVersion,
  providedIds: readonly string[],
): string {
  return `This renderer does not provide the catalog "${catalogId}" for A2UI ${version}. Catalogs it provides for ${version}: ${providedIds.join(', ')}.`;
}

/**
 * Resolves the protocol version and catalog for an A2UI payload against the active
 * renderer's `ProtocolSupport`.
 */
export function resolvePayloadProtocol(
  messages: unknown[] | null | undefined,
  support: ProtocolSupport,
): PayloadProtocolResolution {
  if (!Array.isArray(messages) || messages.length === 0) {
    return supportedResult(support.defaultVersion, support, null);
  }

  let detectedVersion: A2uiProtocolVersion | null = null;
  let versionAnchor: string | null = null;

  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const obj = item as Record<string, unknown>;
    const itemVersion = detectMessageVersion(obj);
    if (!itemVersion) {
      continue;
    }
    const explicitAnchor = extractExplicitVersionString(obj);
    if (detectedVersion === null) {
      detectedVersion = itemVersion;
      versionAnchor = explicitAnchor;
    } else if (itemVersion !== detectedVersion) {
      return {
        status: 'unsupported',
        code: 'PROTOCOL_VERSION_MISMATCH',
        message: formatMixedProtocolVersionsMessage(),
        anchor: explicitAnchor ?? versionAnchor,
      };
    }
  }

  if (detectedVersion !== null && !support.versions.includes(detectedVersion)) {
    return {
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message: formatUnsupportedProtocolVersionMessage(detectedVersion, support.versions),
      anchor: versionAnchor,
    };
  }

  const version = detectedVersion ?? support.defaultVersion;
  const requestedCatalogId = findRequestedCatalogId(messages);
  const versionCatalogs = support.catalogsByVersion[version] ?? [];

  if (support.announcedCatalogCount > 1 && requestedCatalogId !== null) {
    const providedIds = versionCatalogs
      .map(c => getCatalogId(c))
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    if (providedIds.length > 0 && !providedIds.includes(requestedCatalogId)) {
      return {
        status: 'unsupported',
        code: 'UNSUPPORTED_CATALOG',
        message: formatUnsupportedCatalogMessage(requestedCatalogId, version, providedIds),
        anchor: requestedCatalogId,
      };
    }
  }

  return supportedResult(version, support, requestedCatalogId);
}

/**
 * Checks handshake completion and gates preview dispatch on `resolvePayloadProtocol`
 * (or a pre-computed `PayloadProtocolResolution`), logging any rejection error via
 * `errorLogger`. Returns the supported resolution, or `null` when deferred or blocked.
 */
export function gatePayloadDispatch(
  target: {payload: unknown[]} | {resolution: PayloadProtocolResolution | null},
  hasReceivedCatalog: boolean,
  support: ProtocolSupport,
  errorLogger: PayloadErrorSink,
  sourceTag: string,
): SupportedPayloadResolution | null {
  if (!hasReceivedCatalog) {
    return null;
  }
  const resolution =
    'resolution' in target ? target.resolution : resolvePayloadProtocol(target.payload, support);
  if (!resolution) {
    return null;
  }
  if (resolution.status === 'unsupported') {
    errorLogger.error({
      sourceTag,
      code: resolution.code,
      message: resolution.message,
    });
    return null;
  }
  return resolution;
}

function supportedResult(
  version: A2uiProtocolVersion,
  support: ProtocolSupport,
  requestedCatalogId: string | null,
): PayloadProtocolResolution {
  const catalogs = support.catalogsByVersion[version] ?? [];
  const catalog =
    requestedCatalogId !== null
      ? (catalogs.find(c => getCatalogId(c) === requestedCatalogId) ?? catalogs[0] ?? null)
      : (catalogs[0] ?? null);
  return {
    status: 'supported',
    version,
    catalogs,
    catalog,
  };
}

function extractExplicitVersionString(obj: Record<string, unknown>): string | null {
  if (typeof obj['version'] !== 'string') {
    return null;
  }
  const trimmed = obj['version'].trim();
  return trimmed.length > 0 ? trimmed : null;
}

function findRequestedCatalogId(messages: readonly unknown[]): string | null {
  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const cs = (item as Record<string, unknown>)['createSurface'];
    if (!cs || typeof cs !== 'object' || Array.isArray(cs)) {
      continue;
    }
    const catalogId = (cs as Record<string, unknown>)['catalogId'];
    if (typeof catalogId === 'string' && catalogId.length > 0) {
      return catalogId;
    }
  }
  return null;
}
