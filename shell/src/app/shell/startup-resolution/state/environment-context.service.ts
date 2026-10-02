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

import {Injectable, inject} from '@angular/core';
import {LocalStorageInteractions} from '../../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../../storage/models/local-storage-keys';
import {ErrorLogger} from '../../../debug/error-logger.service';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentContextService {
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly logger = inject(ErrorLogger).withTag('[EnvironmentContextService]');

  getBaseOrigin(): string {
    return globalThis.location?.origin || 'http://localhost';
  }

  isLocalhost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  isThirdPartyEnvironment(): boolean {
    const hostname = this.getWindowHostname();
    const is1P =
      hostname.endsWith('.google.com') ||
      hostname.endsWith('.googleplex.com') ||
      hostname.endsWith('.googlers.com');

    return !is1P;
  }

  isExtensionMode(): boolean {
    const urlParams = new URLSearchParams(this.getWindowSearch());
    const urlExtension = urlParams.get('extension') === 'true';
    const hasExtensionStorage =
      this.localStorageInteractions.getItem(LocalStorageKey.EXTENSION_MODE) === 'true';
    return urlExtension || hasExtensionStorage;
  }

  getWindowSearch(): string {
    return globalThis.location?.search || '';
  }

  getWindowHash(): string {
    return globalThis.location?.hash || '';
  }

  getWindowHostname(): string {
    return globalThis.location?.hostname || '';
  }

  cleanSharedA2uiUrl(): void {
    if (typeof globalThis.location !== 'undefined' && globalThis.history?.replaceState) {
      try {
        const cleanUrl = new URL(globalThis.location.href);
        let modified = false;
        if (cleanUrl.hash) {
          const hashParams = new URLSearchParams(cleanUrl.hash.replace(/^#/, ''));
          if (
            hashParams.has('a2ui') ||
            hashParams.has('renderer') ||
            hashParams.has('rendererId')
          ) {
            hashParams.delete('a2ui');
            hashParams.delete('renderer');
            hashParams.delete('rendererId');
            const remaining = hashParams.toString();
            cleanUrl.hash = remaining ? `#${remaining}` : '';
            modified = true;
          }
        }
        if (
          cleanUrl.searchParams.has('a2ui') ||
          cleanUrl.searchParams.has('renderer') ||
          cleanUrl.searchParams.has('rendererId')
        ) {
          cleanUrl.searchParams.delete('a2ui');
          cleanUrl.searchParams.delete('renderer');
          cleanUrl.searchParams.delete('rendererId');
          modified = true;
        }
        if (modified) {
          globalThis.history.replaceState({}, '', cleanUrl.toString());
        }
      } catch (err) {
        this.logger.warn('Failed to clean shared A2UI URL:', err);
      }
    }
  }
}
