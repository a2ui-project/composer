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

import {Injectable, inject, signal} from '@angular/core';
import {QueryParser} from './query-parser';
import {LocalStorageKey} from '../settings/local-storage-keys';
import {LocalStorageInteractions} from '../settings/local-storage-interactions';

/**
 * Represents the resolved runtime configuration for the application,
 * including target endpoints, mode flags, and active catalog IDs.
 */
export interface AppConfig {
  defaultRendererUrl: string;
  allowOverrides: boolean;
}

@Injectable({
  providedIn: 'root',
})
/**
 * Orchestrates the initial application startup pipeline, resolving query
 * parameters, validating environments, and initializing core state.
 */
export class StartupResolution {
  private readonly _resolvedUrl = signal<string | null>(null);
  private readonly _isLockedContext = signal(false);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);

  readonly resolvedUrl = this._resolvedUrl.asReadonly();
  readonly isLockedContext = this._isLockedContext.asReadonly();

  async resolveStartupConfiguration(): Promise<string | null> {
    let staticConfig: AppConfig | null = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('config.json', {signal: controller.signal});
      if (response.ok) {
        staticConfig = await response.json();
      }
    } catch (err) {
      console.warn(
        'Watchdog timeout or failure fetching config.json. ' + 'Allowing overrides fallbacks.',
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (staticConfig) {
      this._resolvedUrl.set(staticConfig.defaultRendererUrl);
      if (!staticConfig.allowOverrides) {
        console.log(
          'Static configuration loaded with allowOverrides: false. ' + 'Locking context.',
        );
        this._isLockedContext.set(true);

        this.evaluateEnvironmentPurge();
        return this._resolvedUrl();
      }
    }

    if (!this._isLockedContext()) {
      const queryCandidate = QueryParser.parseRendererUrl(this.getWindowSearch());
      if (queryCandidate) {
        this._resolvedUrl.set(queryCandidate);
        this.evaluateEnvironmentPurge();
        return this._resolvedUrl();
      }
    }

    const localPrefs = this.localStorageInteractions.getItem(LocalStorageKey.RENDERER_URL);
    if (localPrefs && !this._isLockedContext()) {
      this._resolvedUrl.set(localPrefs);
    }

    this.evaluateEnvironmentPurge();

    return this._resolvedUrl();
  }

  getResolvedRendererUrl(): string | null {
    return this._resolvedUrl();
  }

  isContextLocked(): boolean {
    return this._isLockedContext();
  }

  isThirdPartyEnvironment(): boolean {
    const force1P = this.localStorageInteractions.getItem(LocalStorageKey.FORCE_1P) === 'true';
    if (force1P) {
      return false;
    }

    const hostname = this.getWindowHostname();
    const force3P = this.localStorageInteractions.getItem(LocalStorageKey.FORCE_3P) === 'true';
    if (force3P) {
      return true;
    }

    const is1P =
      hostname === 'google.com' ||
      hostname.endsWith('.google.com') ||
      hostname === 'googleplex.com' ||
      hostname.endsWith('.googleplex.com');

    return !is1P;
  }

  isEnvironmentValid(): boolean {
    const resolvedUrl = this.getResolvedRendererUrl();
    const is3P = this.isThirdPartyEnvironment();
    const hasApiKey = !!this.localStorageInteractions.getItem(LocalStorageKey.GEMINI_API_KEY);

    return !!resolvedUrl && (!is3P || hasApiKey);
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

  getWindowHostname(): string {
    return globalThis.location?.hostname || '';
  }

  private evaluateEnvironmentPurge(): void {
    if (!this.isThirdPartyEnvironment()) {
      this.localStorageInteractions.removeItem(LocalStorageKey.GEMINI_API_KEY);
    }
  }
}
