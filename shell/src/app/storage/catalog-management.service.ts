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

import {Injectable, inject, signal, untracked, DestroyRef} from '@angular/core';
import {HostCommunicationService, MessageEnvelope} from '../shell/host-communication.service';
import {IndexedDbStorageService} from './indexed-db-storage.service';
import {StartupResolutionService} from '../shell/startup-resolution.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  public readonly isHandshakeInProgress = this._isHandshakeInProgress.asReadonly();

  private readonly _watchdogFired = signal<boolean>(false);
  public readonly watchdogFired = this._watchdogFired.asReadonly();

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
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((envelope: MessageEnvelope) => {
        if (envelope.type === 'RENDERER_READY') {
          if (untracked(() => this._isHandshakeInProgress())) {
            console.warn('Handshake already in progress. Ignoring RENDERER_READY.');
            return;
          }

          this._isHandshakeInProgress.set(true);
          this._watchdogFired.set(false);
          this.hostCommunicationService.sendMessage({type: 'GET_CATALOG'});

          this.watchdogTimerId = setTimeout(() => {
            if (this.watchdogTimerId === null) {
              return;
            }
            this._watchdogFired.set(true);
            console.error('Watchdog timeout: A2UI_CATALOG not received within 5 seconds.');
            this._isHandshakeInProgress.set(false);
            this.watchdogTimerId = null;
          }, 5000);
        } else if (envelope.type === 'A2UI_CATALOG') {
          if (this.watchdogTimerId !== null) {
            clearTimeout(this.watchdogTimerId);
            this.watchdogTimerId = null;
          }
          this._isHandshakeInProgress.set(false);
          this._watchdogFired.set(false);
        }
      });
  }
}
