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
  Injectable,
  inject,
  signal,
  DestroyRef,
  Signal,
  computed,
  linkedSignal,
  resource,
} from '@angular/core';
import {ErrorLogger} from '../../debug/error-logger.service';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {
  Catalog,
  CatalogComponentSchema,
  CatalogJson,
  getCatalogFunctionEntries,
  getCatalogId,
} from '../models/catalog-storage.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {from, of} from 'rxjs';
import {concatMap} from 'rxjs/operators';
import {sanitizeHtml} from 'safevalues';
import {IndexedDbStorage} from '../indexed-db-storage/indexed-db-storage';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {PreviewBridgeMessageType, type A2uiProtocolVersion} from 'a2ui-bridge';
import {stableStringify} from '../stable-stringify/stable-stringify';
import {CATALOG_WATCHDOG_MESSAGE, CATALOG_WATCHDOG_TIMEOUT_MS} from './catalog-watchdog';

interface HydratedCatalog {
  catalog: Catalog;
  catalogs?: Catalog[];
  catalogString: string;
  checksumHash: string;
}

/**
 * Coordinates client sidepanel integration, managing live visual schemas,
 * remote catalog assets, and establishing active rendering contexts.
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogManagement {
  private readonly logger = inject(ErrorLogger).withTag('[Storage]');
  private readonly hostCommunication = inject(HostCommunication);
  private readonly indexedDbStorage = inject(IndexedDbStorage);
  private readonly startupResolution = inject(StartupResolution);

  private watchdogTimerId: ReturnType<typeof setTimeout> | null = null;
  private previousUrl: string | null | undefined = this.startupResolution.resolvedUrl();

  /**
   * Declarative Angular `resource` that asynchronously loads and sanitizes a cached catalog
   * from IndexedDB whenever `startupResolution.resolvedUrl()` changes to a new non-null URL.
   */
  private readonly cachedCatalogResource = resource<HydratedCatalog | null, string | undefined>({
    defaultValue: null,
    params: () => {
      const rendererUrl = this.startupResolution.resolvedUrl();
      if (rendererUrl === this.previousUrl) {
        return undefined;
      }
      this.previousUrl = rendererUrl;
      if (this.watchdogTimerId !== null) {
        clearTimeout(this.watchdogTimerId);
        this.watchdogTimerId = null;
      }
      return rendererUrl ?? undefined;
    },
    loader: async ({params: targetUrl}): Promise<HydratedCatalog | null> => {
      try {
        const record = await this.indexedDbStorage.getCatalogRecord(targetUrl);
        if (!record) {
          return null;
        }
        let catalogObj: Catalog | null = null;
        if (record.catalogJson) {
          catalogObj = record.catalogJson;
        } else if (record.catalogString) {
          try {
            catalogObj = JSON.parse(record.catalogString) as Catalog | null;
          } catch {
            catalogObj = null;
          }
        }
        if (!catalogObj) {
          return null;
        }
        let catalogsArr: Catalog[] | undefined;
        if (Array.isArray(record.catalogsJson)) {
          catalogsArr = record.catalogsJson.map(c => sanitizeCatalog(c));
        } else {
          catalogsArr = [sanitizeCatalog(catalogObj)];
        }
        return {
          catalog: sanitizeCatalog(catalogObj),
          catalogs: catalogsArr,
          catalogString: record.catalogString,
          checksumHash: record.checksumHash,
        };
      } catch (err: unknown) {
        this.logger.warn(
          'Failed to fetch catalog record from IndexedDB for rendererUrl:',
          targetUrl,
          err,
        );
        return null;
      }
    },
  });

  /**
   * Combined reactive source tracking both the active renderer URL and any cached catalog
   * resolved asynchronously by `cachedCatalogResource`.
   */
  private readonly catalogSource = computed(() => ({
    url: this.startupResolution.resolvedUrl(),
    cached: this.cachedCatalogResource.value(),
  }));

  /**
   * Conceptual state indicator tracking whether the remote visualization
   * bridge is actively negotiating and establishing its catalog metadata
   * synchronizations.
   *
   * Managed via `linkedSignal` tied to `startupResolution.resolvedUrl`:
   * automatically resets to `false` whenever the renderer URL changes, while
   * remaining imperatively writable during live handshake negotiations.
   */
  private readonly _isHandshakeInProgress = linkedSignal<string | null, boolean>({
    source: this.startupResolution.resolvedUrl,
    computation: () => false,
  });
  readonly isHandshakeInProgress = this._isHandshakeInProgress.asReadonly();

  /**
   * Internal lifecycle state of the catalog indexing handshake.
   * Exposed as a DOM attribute by ComposerWorkspace for E2E synchronization.
   *
   * Managed via `linkedSignal` tied to `catalogSource`:
   * - Resets to `'idle'` whenever the renderer URL changes (`source.url !== previous.source?.url`).
   * - Transitions to `'settled'` when a cached catalog is hydrated from IndexedDB while still `'idle'`.
   * - Preserves imperative updates (`'in-progress'` / `'settled'`) during live bridge handshakes.
   */
  private readonly _handshakeState = linkedSignal<
    {url: string | null; cached: HydratedCatalog | null | undefined},
    'idle' | 'in-progress' | 'settled'
  >({
    source: this.catalogSource,
    computation: (source, previous) => {
      if (previous && source.url !== previous.source.url) {
        return 'idle';
      }
      if (source.cached && (previous?.value === 'idle' || !previous)) {
        return 'settled';
      }
      return previous?.value ?? 'idle';
    },
  });
  readonly handshakeState: Signal<'idle' | 'in-progress' | 'settled'> =
    this._handshakeState.asReadonly();

  private readonly _watchdogFired = signal<boolean>(false);
  /**
   * Conceptual status marking whether the catalog discovery handshake
   * timed out. Resolves to true if the handshaking sequence exceeded
   * baseline limits without receiving active confirmation.
   */
  readonly watchdogFired = this._watchdogFired.asReadonly();

  /**
   * Conceptual state containing the latest diagnostic issue or syntax failure
   * encountered while resolving catalog representations. Resolves to the
   * textual description of the failure, or null if context is fully healthy.
   *
   * Managed via `linkedSignal` tied to `startupResolution.resolvedUrl`:
   * automatically resets to `null` whenever the renderer URL changes, while
   * remaining imperatively writable when handshake or validation errors occur.
   */
  private readonly _catalogError = linkedSignal<string | null, string | null>({
    source: this.startupResolution.resolvedUrl,
    computation: () => null,
  });
  readonly catalogError = this._catalogError.asReadonly();

  /**
   * Conceptual representation of the raw structured catalog source content
   * successfully received under active synchronization.
   *
   * Managed via `linkedSignal` tied to `catalogSource`:
   * - Resets to `''` whenever the renderer URL changes (`source.url !== previous.source?.url`).
   * - Hydrates from `source.cached.catalogString` when IndexedDB resolves if not already set.
   * - Remains imperatively writable on live `A2UI_CATALOG` bridge responses.
   */
  private readonly _lastCatalogString = linkedSignal<
    {url: string | null; cached: HydratedCatalog | null | undefined},
    string
  >({
    source: this.catalogSource,
    computation: (source, previous) => {
      if (previous && source.url !== previous.source.url) {
        return '';
      }
      if (source.cached && (!previous || previous.value === '')) {
        return source.cached.catalogString;
      }
      return previous?.value ?? '';
    },
  });
  readonly lastCatalogString = this._lastCatalogString.asReadonly();

  /**
   * Conceptual secure verification fingerprint matching the last successfully
   * integrated catalog structure. Utilized to ensure structural consistency
   * and tracking remote delta changes.
   *
   * Managed via `linkedSignal` tied to `catalogSource`:
   * - Resets to `''` whenever the renderer URL changes (`source.url !== previous.source?.url`).
   * - Hydrates from `source.cached.checksumHash` when IndexedDB resolves if not already set.
   * - Remains imperatively writable on live `A2UI_CATALOG` bridge responses.
   */
  private readonly _lastChecksumHash = linkedSignal<
    {url: string | null; cached: HydratedCatalog | null | undefined},
    string
  >({
    source: this.catalogSource,
    computation: (source, previous) => {
      if (previous && source.url !== previous.source.url) {
        return '';
      }
      if (source.cached && (!previous || previous.value === '')) {
        return source.cached.checksumHash;
      }
      return previous?.value ?? '';
    },
  });
  readonly lastChecksumHash = this._lastChecksumHash.asReadonly();

  /**
   * Conceptual structured schema of the actively loaded preview catalog.
   * Resolves to the active parsed model representation containing valid
   * schemas, components, and configurations, or null if no catalog is
   * established.
   *
   * Managed via `linkedSignal` tied to `catalogSource`:
   * - Resets to `null` whenever the renderer URL changes (`source.url !== previous.source?.url`).
   * - Hydrates from `source.cached.catalog` when IndexedDB resolves if `previous.value` is still `null`.
   * - Remains imperatively writable on live `A2UI_CATALOG` bridge responses.
   */
  private readonly _activeCatalog = linkedSignal<
    {url: string | null; cached: HydratedCatalog | null | undefined},
    Catalog | null
  >({
    source: this.catalogSource,
    computation: (source, previous) => {
      if (previous && source.url !== previous.source.url) {
        return null;
      }
      if (source.cached && (!previous || previous.value === null)) {
        return source.cached.catalog;
      }
      return previous?.value ?? null;
    },
  });
  readonly activeCatalog = this._activeCatalog.asReadonly();

  private readonly _catalogHashDelta = signal<boolean>(false);
  /**
   * Conceptual delta status indicating whether the incoming catalog's
   * structure differs from the previously registered local copy.
   * Resolves to true if the fresh payload has a different fingerprint.
   */
  readonly catalogHashDelta = this._catalogHashDelta.asReadonly();

  /**
   * Conceptual descriptive name resolved for the actively established catalog
   * model.
   */
  readonly activeCatalogTitle = computed(() => this._activeCatalog()?.title || '');

  /**
   * Conceptual narrative description details clarifying the purpose, bounds,
   * and scope of the actively established catalog model.
   */
  readonly activeCatalogDescription = computed(() => this._activeCatalog()?.description || '');

  /**
   * Conceptual state indicating whether the catalog response from the preview
   * bridge has settled (either non-empty or empty).
   *
   * Managed via `linkedSignal` tied to `catalogSource`:
   * - Resets to `false` whenever the renderer URL changes (`source.url !== previous.source?.url`).
   * - Transitions to `true` when a cached catalog is hydrated from IndexedDB.
   * - Transitions to `true` when an A2UI_CATALOG response arrives from the bridge.
   */
  private readonly _hasReceivedCatalogResponse = linkedSignal<
    {url: string | null; cached: HydratedCatalog | null | undefined},
    boolean
  >({
    source: this.catalogSource,
    computation: (source, previous) => {
      if (previous && source.url !== previous.source.url) {
        return false;
      }
      if (source.cached && (previous?.value === false || !previous)) {
        return true;
      }
      return previous?.value ?? false;
    },
  });
  readonly hasReceivedCatalogResponse: Signal<boolean> =
    this._hasReceivedCatalogResponse.asReadonly();

  /**
   * Conceptual structured schemas of all actively loaded preview catalogs.
   * Resolves to the array of negotiated catalog models, or an empty array if none.
   *
   * Managed via `linkedSignal` tied to `catalogSource`:
   * - Resets to `[]` whenever the renderer URL changes (`source.url !== previous.source?.url`).
   * - Hydrates from `source.cached.catalogs` when IndexedDB resolves if empty.
   * - Remains imperatively writable on live `A2UI_CATALOG` bridge responses.
   */
  private readonly _activeCatalogs = linkedSignal<
    {url: string | null; cached: HydratedCatalog | null | undefined},
    Catalog[]
  >({
    source: this.catalogSource,
    computation: (source, previous) => {
      if (previous && source.url !== previous.source.url) {
        return [];
      }
      if (source.cached && (!previous || previous.value.length === 0)) {
        return source.cached.catalogs ?? (source.cached.catalog ? [source.cached.catalog] : []);
      }
      return previous?.value ?? [];
    },
  });
  readonly activeCatalogs: Signal<CatalogJson[]> = this._activeCatalogs.asReadonly();

  /**
   * Merged catalog combining components and functions across all negotiated
   * catalogs in `activeCatalogs()`, giving precedence to the primary `activeCatalog()`.
   */
  readonly mergedActiveCatalog: Signal<Catalog | null> = computed<Catalog | null>(() => {
    const primary = this._activeCatalog();
    const catalogs = this._activeCatalogs();
    if (!primary && catalogs.length === 0) {
      return null;
    }

    const primaryId = primary?.catalogId || primary?.$id;
    const ordered: Catalog[] = primary
      ? [
          primary,
          ...catalogs.filter(
            c => c !== primary && (primaryId === undefined || (c.catalogId || c.$id) !== primaryId),
          ),
        ]
      : catalogs;
    const mergedComponents: Record<string, CatalogComponentSchema> = {};
    const mergedFunctions: Record<string, Record<string, unknown>> = {};
    let firstCatalogId: string | undefined;

    for (const cat of ordered) {
      if (!cat) continue;
      if (!firstCatalogId && cat.catalogId) {
        firstCatalogId = cat.catalogId;
      }
      if (cat.components) {
        for (const [key, schema] of Object.entries(cat.components)) {
          if (!Object.hasOwn(mergedComponents, key)) {
            mergedComponents[key] = schema;
          }
        }
      }
      for (const [key, schema] of getCatalogFunctionEntries(cat)) {
        if (!Object.hasOwn(mergedFunctions, key)) {
          mergedFunctions[key] = schema;
        }
      }
    }

    const base = primary ?? ordered[0] ?? {};
    return sanitizeCatalog({
      ...base,
      catalogId: primary?.catalogId ?? firstCatalogId,
      components: mergedComponents,
      functions: mergedFunctions,
    });
  });

  /**
   * Active protocol version mapped from the active catalog's `protocolVersion`
   * attribute or handshake settlement state.
   */
  readonly activeProtocolVersion: Signal<A2uiProtocolVersion> = computed<A2uiProtocolVersion>(() =>
    resolveProtocolVersion(this._hasReceivedCatalogResponse(), this._activeCatalog()),
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      if (this.watchdogTimerId !== null) {
        clearTimeout(this.watchdogTimerId);
        this.watchdogTimerId = null;
      }
    });

    this.hostCommunication.messageStream$
      .pipe(
        takeUntilDestroyed(),
        concatMap((envelope: MessageEnvelope) => {
          if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
            if (this._isHandshakeInProgress()) {
              this.logger.warn('Handshake already in progress. Ignoring RENDERER_READY.');
              return of(null);
            }

            this._isHandshakeInProgress.set(true);
            this._handshakeState.set('in-progress');
            this._watchdogFired.set(false);
            this._catalogError.set(null);
            this.hostCommunication.sendMessage({
              type: PreviewBridgeMessageType.GET_CATALOG,
            });

            this.watchdogTimerId = setTimeout(() => {
              if (this.watchdogTimerId === null) {
                return;
              }
              this._watchdogFired.set(true);
              this._catalogError.set(CATALOG_WATCHDOG_MESSAGE);
              this.logger.error(CATALOG_WATCHDOG_MESSAGE);
              this._isHandshakeInProgress.set(false);
              this.watchdogTimerId = null;
            }, CATALOG_WATCHDOG_TIMEOUT_MS);

            return of(null);
          } else if (envelope.type === PreviewBridgeMessageType.A2UI_CATALOG) {
            if (this.watchdogTimerId !== null) {
              clearTimeout(this.watchdogTimerId);
              this.watchdogTimerId = null;
            }
            this._watchdogFired.set(false);

            const rawPayload = envelope.payload;
            if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
              const errorMsg = 'Invalid or malformed A2UI_CATALOG payload received.';
              this._catalogError.set(errorMsg);
              this.logger.error(errorMsg, rawPayload);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            if ('error' in rawPayload && (rawPayload as {error?: unknown}).error) {
              const errorObj = (rawPayload as {error: {message?: string}}).error;
              const errorMsg =
                errorObj?.message || 'Unknown error occurred in preview bridge during handshake.';
              this._catalogError.set(errorMsg);
              this.logger.error('Handshake failed with bridge error:', errorMsg);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            if (isEmptyCatalogPayload(rawPayload)) {
              this._hasReceivedCatalogResponse.set(true);
              this._handshakeState.set('settled');
              this._isHandshakeInProgress.set(false);
              this._activeCatalog.set(null);
              this._activeCatalogs.set([]);
              this._lastCatalogString.set('');
              this._lastChecksumHash.set('');
              this._catalogError.set(null);
              return of(null);
            }

            let primary: unknown;
            let rawCatalogs: unknown;

            const obj = rawPayload as Record<string, unknown>;
            if ('catalog' in obj) {
              primary =
                obj['catalog'] ?? (Array.isArray(obj['catalogs']) ? obj['catalogs'][0] : undefined);
              rawCatalogs = obj['catalogs'];
            } else if (
              'catalogs' in obj &&
              Array.isArray(obj['catalogs']) &&
              obj['catalogs'].length > 0
            ) {
              primary = obj['catalogs'][0];
              rawCatalogs = obj['catalogs'];
            } else {
              primary = obj;
              rawCatalogs = undefined;
            }

            if (!primary || typeof primary !== 'object' || Array.isArray(primary)) {
              const errorMsg = 'Invalid or malformed A2UI_CATALOG payload received.';
              this._catalogError.set(errorMsg);
              this.logger.error(errorMsg, rawPayload);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            let catalogObj: Catalog;
            let catalogString: string;
            try {
              catalogObj = sanitizeCatalog(primary as Catalog);
              catalogString = stableStringify(catalogObj);
            } catch (err: unknown) {
              const errorMsg = 'Failed to clone or serialize catalog payload.';
              this._catalogError.set(errorMsg);
              this.logger.error(errorMsg, err);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            const catalogId = getCatalogId(catalogObj);
            if (!catalogId) {
              const errorMsg = 'Catalog is missing a valid identifier (catalogId or $id).';
              this._catalogError.set(errorMsg);
              this.logger.error(errorMsg, catalogObj);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            let catalogsArr: Catalog[];
            if (Array.isArray(rawCatalogs)) {
              catalogsArr = (rawCatalogs as Catalog[]).map(c =>
                c === primary ? catalogObj : sanitizeCatalog(c),
              );
            } else {
              catalogsArr = [catalogObj];
            }

            const orderedCatalogs: Catalog[] = [
              catalogObj,
              ...catalogsArr.filter(c => c !== catalogObj && (c.catalogId || c.$id) !== catalogId),
            ];
            const seenComponents = new Set<string>();
            const seenFunctions = new Set<string>();
            const collidingComponents: string[] = [];
            const collidingFunctions: string[] = [];

            for (const cat of orderedCatalogs) {
              if (!cat) continue;
              if (cat.components) {
                for (const key of Object.keys(cat.components)) {
                  if (seenComponents.has(key)) {
                    collidingComponents.push(key);
                  } else {
                    seenComponents.add(key);
                  }
                }
              }
              for (const [key] of getCatalogFunctionEntries(cat)) {
                if (seenFunctions.has(key)) {
                  collidingFunctions.push(key);
                } else {
                  seenFunctions.add(key);
                }
              }
            }

            if (collidingComponents.length > 0 || collidingFunctions.length > 0) {
              this.logger.warn(
                `Duplicate keys ignored during multi-catalog merge (primary catalog wins): components=[${collidingComponents.join(', ')}], functions=[${collidingFunctions.join(', ')}]`,
              );
            }

            let hashHexPromise: Promise<string>;
            if (!globalThis.crypto?.subtle) {
              this.logger.warn(
                'Web Crypto is not available in this insecure context. Falling back to synchronous checksum hash.',
              );
              const hashHex = simpleHash(catalogString);
              hashHexPromise = Promise.resolve(hashHex);
            } else {
              hashHexPromise = crypto.subtle
                .digest('SHA-256', new TextEncoder().encode(catalogString))
                .then(hashBuffer => {
                  const hashArray = Array.from(new Uint8Array(hashBuffer));
                  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                });
            }

            return from(
              hashHexPromise
                .then(async hashHex => {
                  this._lastCatalogString.set(catalogString);
                  this._lastChecksumHash.set(hashHex);

                  const rendererUrl = this.startupResolution.getResolvedRendererUrl();
                  if (rendererUrl) {
                    const existingRecord =
                      await this.indexedDbStorage.getCatalogRecord(rendererUrl);
                    if (!existingRecord || existingRecord.checksumHash !== hashHex) {
                      this._catalogHashDelta.set(true);
                      await this.indexedDbStorage.saveCatalogRecord({
                        rendererUrl,
                        catalogString,
                        checksumHash: hashHex,
                        lastAccessed: Date.now(),
                        catalogJson: catalogObj,
                        catalogsJson: catalogsArr,
                      });
                    } else {
                      this._catalogHashDelta.set(false);
                      existingRecord.lastAccessed = Date.now();
                      existingRecord.catalogJson = catalogObj;
                      existingRecord.catalogsJson = catalogsArr;
                      await this.indexedDbStorage.saveCatalogRecord(existingRecord);
                    }
                  }

                  this._activeCatalog.set(catalogObj);
                  this._activeCatalogs.set(catalogsArr);
                  this._hasReceivedCatalogResponse.set(true);

                  this._catalogError.set(null);
                  this._isHandshakeInProgress.set(false);
                  this._handshakeState.set('settled');
                  return null;
                })
                .catch((err: unknown) => {
                  const errorMsg = 'Failed to compute catalog hash or access storage.';
                  this._catalogError.set(errorMsg);
                  this.logger.error(errorMsg, err);
                  this._isHandshakeInProgress.set(false);
                  return null;
                }),
            );
          }

          return of(null);
        }),
      )
      .subscribe();
  }
}

/**
 * Returns a copy of a catalog with its title and description sanitized, the
 * form in which Composer stores and displays a catalog a renderer sent.
 */
export function sanitizeCatalog(catalog: Catalog): Catalog {
  const sanitized = structuredClone(catalog);
  if (typeof sanitized.title === 'string') {
    sanitized.title = sanitizeHtml(sanitized.title).toString();
  }
  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitizeHtml(sanitized.description).toString();
  }
  return sanitized;
}

/**
 * Resolves the active protocol version based on handshake state and catalog version.
 *
 * @param hasReceived Whether a catalog handshake response has been received.
 * @param catalog The currently active catalog or null.
 * @returns The resolved protocol version ('v0.9' or 'v1.0').
 */
function resolveProtocolVersion(
  hasReceived: boolean,
  catalog: Catalog | null,
): A2uiProtocolVersion {
  if (!hasReceived) {
    return 'v0.9';
  }
  if (!catalog || isCatalogEmpty(catalog)) {
    return 'v1.0';
  }
  const version = catalog.protocolVersion;
  if (version === '1.0' || version === 'v1.0') {
    return 'v1.0';
  }
  return 'v0.9';
}

function isCatalogEmpty(catalog: Catalog): boolean {
  if (!catalog) return true;
  const hasComponents = catalog.components && Object.keys(catalog.components).length > 0;
  const hasFunctions = catalog.functions && Object.keys(catalog.functions).length > 0;
  const hasProtocol = !!catalog.protocolVersion;
  const hasId = !!(catalog.catalogId || catalog.$id);
  return !hasComponents && !hasFunctions && !hasProtocol && !hasId;
}

function isEmptyCatalogPayload(rawPayload: unknown): boolean {
  if (rawPayload === null || rawPayload === undefined) {
    return false;
  }
  if (typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    return false;
  }
  const obj = rawPayload as Record<string, unknown>;
  if (Object.keys(obj).length === 0) {
    return true;
  }
  if ('catalog' in obj) {
    const primary = obj['catalog'];
    const catalogs = obj['catalogs'];
    const hasCatalogs = Array.isArray(catalogs) && catalogs.length > 0;
    if (hasCatalogs) {
      return false;
    }
    if (primary === null || primary === undefined) {
      return true;
    }
    if (typeof primary === 'object' && !Array.isArray(primary)) {
      const pObj = primary as Record<string, unknown>;
      return Object.keys(pObj).length === 0;
    }
    return false;
  }
  if ('catalogs' in obj && Array.isArray(obj['catalogs']) && obj['catalogs'].length === 0) {
    return true;
  }
  return false;
}

function simpleHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
