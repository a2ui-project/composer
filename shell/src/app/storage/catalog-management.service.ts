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
import {HostCommunicationService, MessageEnvelope} from '../shell/host-communication.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Catalog} from './catalog-storage.model';
import {concatMap, from, of} from 'rxjs';
import DOMPurify from 'dompurify';
import stringify from 'fast-json-stable-stringify';

@Injectable({
  providedIn: 'root',
})
/**
 * Coordinates client sidepanel integration, managing live visual schemas,
 * remote catalog assets, and establishing active rendering contexts.
 */
export class CatalogManagementService {
  private readonly hostCommunicationService = inject(HostCommunicationService);

  private readonly _isHandshakeInProgress = signal<boolean>(false);
  public readonly isHandshakeInProgress = this._isHandshakeInProgress.asReadonly();

  private readonly _watchdogFired = signal<boolean>(false);
  public readonly watchdogFired = this._watchdogFired.asReadonly();

  private readonly _catalogError = signal<string | null>(null);
  public readonly catalogError = this._catalogError.asReadonly();

  private readonly _lastCatalogString = signal<string>('');
  public readonly lastCatalogString = this._lastCatalogString.asReadonly();

  private readonly _lastChecksumHash = signal<string>('');
  public readonly lastChecksumHash = this._lastChecksumHash.asReadonly();

  private watchdogTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      if (this.watchdogTimerId !== null) {
        clearTimeout(this.watchdogTimerId);
        this.watchdogTimerId = null;
      }
    });

    this.hostCommunicationService.messageStream$
      .pipe(
        takeUntilDestroyed(destroyRef),
        concatMap((envelope: MessageEnvelope) => {
          if (envelope.type === 'RENDERER_READY') {
            if (this._isHandshakeInProgress()) {
              console.warn('Handshake already in progress. Ignoring RENDERER_READY.');
              return of(null);
            }

            this._isHandshakeInProgress.set(true);
            this._watchdogFired.set(false);
            this._catalogError.set(null);
            this.hostCommunicationService.sendMessage({type: 'GET_CATALOG'});

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
          } else if (envelope.type === 'A2UI_CATALOG') {
            if (this.watchdogTimerId !== null) {
              clearTimeout(this.watchdogTimerId);
              this.watchdogTimerId = null;
            }
            this._watchdogFired.set(false);

            const payload = envelope.payload;
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
              const errorMsg = 'Invalid or malformed A2UI_CATALOG payload received.';
              this._catalogError.set(errorMsg);
              console.error(errorMsg, payload);
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

            return from(
              crypto.subtle
                .digest('SHA-256', new TextEncoder().encode(catalogString))
                .then(hashBuffer => {
                  const hashArray = Array.from(new Uint8Array(hashBuffer));
                  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                  this._lastCatalogString.set(catalogString);
                  this._lastChecksumHash.set(hashHex);
                  this._catalogError.set(null);
                  this._isHandshakeInProgress.set(false);
                  return null;
                })
                .catch(err => {
                  const errorMsg = 'Failed to compute catalog hash.';
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
