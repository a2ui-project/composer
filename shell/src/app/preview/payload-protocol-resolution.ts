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
import {
  type ProtocolSupport,
  selectCatalogsForVersion,
} from '../storage/catalog-management/catalog-domain';
import {getCatalogId, type Catalog} from '../storage/models/catalog-storage.model';
import {detectRawJsonDraftVersion} from '../chat/chat-service/draft-protocol-strategy';
import {inspectPayloadVersion} from './protocol-version-mismatch';

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

const WIRE_VERSION_BY_PROTOCOL: Record<A2uiProtocolVersion, string> = {
  'v0.9': 'v0.9',
  'v1.0': '1.0',
};

/** Formats the error message when a payload targets a protocol version the renderer does not support. */
export function formatUnsupportedProtocolVersionMessage(
  payloadVersion: A2uiProtocolVersion,
  supportedVersions: readonly A2uiProtocolVersion[],
): string {
  if (supportedVersions.length === 1) {
    const supported = supportedVersions[0];
    const wire = WIRE_VERSION_BY_PROTOCOL[supported];
    return `This renderer does not support A2UI ${payloadVersion}. Use an A2UI ${supported} payload ("version": "${wire}") or select a renderer that supports ${payloadVersion}.`;
  }
  if (supportedVersions.length > 1) {
    const supportedList = supportedVersions
      .map(v => `${v} ("version": "${WIRE_VERSION_BY_PROTOCOL[v]}")`)
      .join(' or ');
    return `This renderer does not support A2UI ${payloadVersion}. Use an A2UI ${supportedList} payload or select a renderer that supports ${payloadVersion}.`;
  }
  return `This renderer does not support A2UI ${payloadVersion}. Select a renderer that supports ${payloadVersion}.`;
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

  const inspection = inspectPayloadVersion(messages);
  if (inspection.status === 'mixed') {
    return {
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message: formatMixedProtocolVersionsMessage(),
      anchor: inspection.anchor,
    };
  }

  const detectedVersion = inspection.status === 'detected' ? inspection.version : null;
  const versionAnchor = inspection.status === 'detected' ? inspection.anchor : null;

  if (detectedVersion !== null && !support.versions.includes(detectedVersion)) {
    return {
      status: 'unsupported',
      code: 'PROTOCOL_VERSION_MISMATCH',
      message: formatUnsupportedProtocolVersionMessage(detectedVersion, support.versions),
      anchor: versionAnchor,
    };
  }

  const requestedCatalogIds = findRequestedCatalogIds(messages);
  const primaryCatalogId = requestedCatalogIds[0] ?? null;
  const versionFromCatalog =
    detectedVersion === null
      ? requestedCatalogIds.reduce<A2uiProtocolVersion | null>(
          (found, id) => found ?? findVersionForCatalogId(support, id),
          null,
        )
      : null;
  const version = detectedVersion ?? versionFromCatalog ?? support.defaultVersion;
  const versionCatalogs = support.catalogsByVersion[version] ?? [];

  if (support.announcedCatalogCount > 1 && requestedCatalogIds.length > 0) {
    const providedIds = versionCatalogs
      .map(c => getCatalogId(c))
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    if (providedIds.length > 0) {
      const unsupportedCatalogId = requestedCatalogIds.find(id => !providedIds.includes(id));
      if (unsupportedCatalogId !== undefined) {
        return {
          status: 'unsupported',
          code: 'UNSUPPORTED_CATALOG',
          message: formatUnsupportedCatalogMessage(unsupportedCatalogId, version, providedIds),
          anchor: unsupportedCatalogId,
        };
      }
    }
  }

  return supportedResult(version, support, primaryCatalogId);
}

/** Sticky editor protocol version and catalog tracked across transient invalid-JSON edits. */
export interface StickyEditorProtocol {
  readonly version: A2uiProtocolVersion;
  readonly catalog: Catalog | null;
}

/** Reactive inputs required to resolve the sticky editor protocol version and catalog. */
export interface StickyEditorProtocolInput {
  readonly hasCatalog: boolean;
  readonly support: ProtocolSupport;
  readonly resolution: PayloadProtocolResolution | null;
  readonly rawText: string;
  readonly activeCatalog: Catalog | null;
  readonly activeCatalogs: readonly Catalog[];
}

/**
 * Resolves the editor schema's protocol version and catalog across draft edits.
 *
 * Empty text parses as `[]`, yielding a non-null `resolution` for `support.defaultVersion` so
 * intentionally clearing the editor resets to the renderer's default version. Unparseable JSON
 * yields `resolution === null` and keeps the detected or previously supported version/catalog so
 * Monaco does not flash another version's schema errors mid-edit, unless `support` drops it.
 */
export function resolveStickyEditorProtocol(
  input: StickyEditorProtocolInput,
  previous: StickyEditorProtocol | null,
): StickyEditorProtocol | null {
  if (!input.hasCatalog) {
    return null;
  }
  if (input.resolution) {
    return input.resolution.status === 'supported'
      ? {version: input.resolution.version, catalog: input.resolution.catalog}
      : null;
  }
  const detected = detectRawJsonDraftVersion(input.rawText);
  const version =
    detected && input.support.versions.includes(detected)
      ? detected
      : previous && input.support.versions.includes(previous.version)
        ? previous.version
        : null;
  if (!version) {
    return null;
  }
  const versionCatalogs = input.support.catalogsByVersion[version] ?? [];
  const prevCatalogId = previous?.catalog ? getCatalogId(previous.catalog) : undefined;
  const matchingPrevCatalog =
    previous?.version === version && previous.catalog
      ? (versionCatalogs.find(
          c => c === previous.catalog || (prevCatalogId && getCatalogId(c) === prevCatalogId),
        ) ?? null)
      : null;
  const catalog =
    matchingPrevCatalog ??
    selectCatalogsForVersion(input.support, version, input.activeCatalog, input.activeCatalogs)
      .primary;
  return {version, catalog};
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

function findVersionForCatalogId(
  support: ProtocolSupport,
  catalogId: string,
): A2uiProtocolVersion | null {
  for (const version of support.versions) {
    if (support.catalogsByVersion[version]?.some(c => getCatalogId(c) === catalogId)) {
      return version;
    }
  }
  return null;
}

function findRequestedCatalogIds(messages: readonly unknown[]): string[] {
  const ids: string[] = [];
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
      ids.push(catalogId);
    }
  }
  return ids;
}
