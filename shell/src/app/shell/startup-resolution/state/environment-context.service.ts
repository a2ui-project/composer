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
import {IS_1P_AUTH_ENABLED} from '../../environment-tokens/environment-tokens';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentContextService {
  private readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);

  getBaseOrigin(): string {
    return globalThis.location?.origin || 'http://localhost';
  }

  isLocalhost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  isThirdPartyEnvironment(): boolean {
    if (!this.is1PAuthEnabled) {
      return true;
    }

    const force1P = this.localStorageInteractions.getItem(LocalStorageKey.FORCE_1P) === 'true';
    if (force1P) {
      return false;
    }

    const force3P = this.localStorageInteractions.getItem(LocalStorageKey.FORCE_3P) === 'true';
    if (force3P) {
      return true;
    }

    const hostname = this.getWindowHostname();
    const is1P =
      hostname === 'google.com' ||
      hostname.endsWith('.google.com') ||
      hostname === 'googleplex.com' ||
      hostname.endsWith('.googleplex.com');

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
          if (hashParams.has('a2ui')) {
            hashParams.delete('a2ui');
            const remaining = hashParams.toString();
            cleanUrl.hash = remaining ? `#${remaining}` : '';
            modified = true;
          }
        }
        if (cleanUrl.searchParams.has('a2ui')) {
          cleanUrl.searchParams.delete('a2ui');
          modified = true;
        }
        if (modified) {
          globalThis.history.replaceState({}, '', cleanUrl.toString());
        }
      } catch (err) {
        console.warn('Failed to clean shared A2UI URL:', err);
      }
    }
  }
}
