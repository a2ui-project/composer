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

import {Injectable, inject, signal, DestroyRef} from '@angular/core';
import {HostCommunicationService, MessageEnvelope} from '../shell/host-communication';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {Catalog} from './catalog-storage.model';
import {concatMap, filter, from, of} from 'rxjs';
import DOMPurify from 'dompurify';
import stringify from 'safe-stable-stringify';
import {IndexedDbStorageService} from './indexed-db-storage';
import {StartupResolutionService} from '../shell/startup-resolution';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

@Injectable({
  providedIn: 'root',
})
/**
 * Coordinates client sidepanel integration, managing live visual schemas,
 * remote catalog assets, and establishing active rendering contexts.
 */
export class CatalogManagementService {
  private readonly hostCommunicationService = inject(HostCommunicationService);
  private readonly indexedDbStorageService = inject(IndexedDbStorageService);
  private readonly startupResolutionService = inject(StartupResolutionService);

  private readonly _isHandshakeInProgress = signal<boolean>(false);
  /**
   * Conceptual state indicator tracking whether the remote visualization
   * bridge is actively negotiating and establishing its catalog metadata
   * synchronizations. Resolves to true when catalog discovery handshakes
   * are currently in progress.
   */
  public readonly isHandshakeInProgress = this._isHandshakeInProgress.asReadonly();

  private readonly _watchdogFired = signal<boolean>(false);
  /**
   * Conceptual status marking whether the catalog discovery handshake
   * timed out. Resolves to true if the handshaking sequence exceeded
   * baseline limits without receiving active confirmation.
   */
  public readonly watchdogFired = this._watchdogFired.asReadonly();

  private readonly _catalogError = signal<string | null>(null);
  /**
   * Conceptual state containing the latest diagnostic issue or syntax failure
   * encountered while resolving catalog representations. Resolves to the
   * textual description of the failure, or null if context is fully healthy.
   */
  public readonly catalogError = this._catalogError.asReadonly();

  private readonly _lastCatalogString = signal<string>('');
  /**
   * Conceptual representation of the raw structured catalog source content
   * successfully received under active synchronization.
   */
  public readonly lastCatalogString = this._lastCatalogString.asReadonly();

  private readonly _lastChecksumHash = signal<string>('');
  /**
   * Conceptual secure verification fingerprint matching the last successfully
   * integrated catalog structure. Utilized to ensure structural consistency
   * and tracking remote delta changes.
   */
  public readonly lastChecksumHash = this._lastChecksumHash.asReadonly();

  private readonly _activeCatalog = signal<Catalog | null>(null);
  /**
   * Conceptual structured schema of the actively loaded preview catalog.
   * Resolves to the active parsed model representation containing valid
   * schemas, components, and configurations, or null if no catalog is
   * established.
   */
  public readonly activeCatalog = this._activeCatalog.asReadonly();

  private readonly _catalogHashDelta = signal<boolean>(false);
  /**
   * Conceptual delta status indicating whether the incoming catalog's
   * structure differs from the previously registered local copy.
   * Resolves to true if the fresh payload has a different fingerprint.
   */
  public readonly catalogHashDelta = this._catalogHashDelta.asReadonly();

  private readonly _activeCatalogTitle = signal<string>('');
  /**
   * Conceptual descriptive name resolved for the actively established catalog
   * model.
   */
  public readonly activeCatalogTitle = this._activeCatalogTitle.asReadonly();

  private readonly _activeCatalogDescription = signal<string>('');
  /**
   * Conceptual narrative description details clarifying the purpose, bounds,
   * and scope of the actively established catalog model.
   */
  public readonly activeCatalogDescription = this._activeCatalogDescription.asReadonly();

  private watchdogTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      if (this.watchdogTimerId !== null) {
        clearTimeout(this.watchdogTimerId);
        this.watchdogTimerId = null;
      }
    });

    toObservable(this.hostCommunicationService.messageStream)
      .pipe(
        filter((envelope): envelope is MessageEnvelope => envelope !== null),
        takeUntilDestroyed(),
        concatMap((envelope: MessageEnvelope) => {
          if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
            if (this._isHandshakeInProgress()) {
              console.warn('Handshake already in progress. Ignoring RENDERER_READY.');
              return of(null);
            }

            this._isHandshakeInProgress.set(true);
            this._watchdogFired.set(false);
            this._catalogError.set(null);
            this.hostCommunicationService.sendMessage({
              type: PreviewBridgeMessageType.GET_CATALOG,
            });

            this.watchdogTimerId = setTimeout(() => {
              if (this.watchdogTimerId === null) {
                return;
              }
              this._watchdogFired.set(true);
              this._catalogError.set(
                'Watchdog timeout: A2UI_CATALOG not received within 5 seconds.',
              );
              console.error('Watchdog timeout: A2UI_CATALOG not received within 5 seconds.');
              this._isHandshakeInProgress.set(false);
              this.watchdogTimerId = null;
            }, 5000);

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
              console.error(errorMsg, rawPayload);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            const payload = rawPayload as {
              error?: {message?: string};
            } & Catalog;

            if (payload.error) {
              const errorMsg =
                payload.error.message ||
                'Unknown error occurred in preview bridge during handshake.';
              this._catalogError.set(errorMsg);
              console.error('Handshake failed with bridge error:', errorMsg);
              this._isHandshakeInProgress.set(false);
              return of(null);
            }

            const catalogObj = structuredClone(payload as Catalog);
            if (typeof catalogObj.title === 'string') {
              catalogObj.title = DOMPurify.sanitize(catalogObj.title);
            }
            if (typeof catalogObj.description === 'string') {
              catalogObj.description = DOMPurify.sanitize(catalogObj.description);
            }

            const catalogString = stringify(catalogObj);

            let hashHexPromise: Promise<string>;
            if (!globalThis.crypto?.subtle) {
              console.warn(
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

                  const rendererUrl = this.startupResolutionService.getResolvedRendererUrl();
                  if (rendererUrl) {
                    const existingRecord =
                      await this.indexedDbStorageService.getCatalogRecord(rendererUrl);
                    if (!existingRecord || existingRecord.checksumHash !== hashHex) {
                      this._catalogHashDelta.set(true);
                      await this.indexedDbStorageService.saveCatalogRecord({
                        rendererUrl,
                        catalogString,
                        checksumHash: hashHex,
                        lastAccessed: Date.now(),
                      });
                    } else {
                      this._catalogHashDelta.set(false);
                      existingRecord.lastAccessed = Date.now();
                      await this.indexedDbStorageService.saveCatalogRecord(existingRecord);
                    }
                  }

                  this._activeCatalog.set(catalogObj);
                  this._activeCatalogTitle.set(catalogObj.title || '');
                  this._activeCatalogDescription.set(catalogObj.description || '');

                  this._catalogError.set(null);
                  this._isHandshakeInProgress.set(false);
                  return null;
                })
                .catch((err: unknown) => {
                  const errorMsg = 'Failed to compute catalog hash or access storage.';
                  this._catalogError.set(errorMsg);
                  console.error(errorMsg, err);
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

function simpleHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
