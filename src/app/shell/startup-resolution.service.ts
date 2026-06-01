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

import {Injectable, Injector, inject} from '@angular/core';
import {Router} from '@angular/router';
import {QueryParser} from './query-parser';

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
export class StartupResolutionService {
  private resolvedUrl: string | null = null;
  private isLockedContext = false;
  private injector = inject(Injector);

  public async resolveStartupConfiguration(): Promise<string | null> {
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
        'Watchdog timeout or failure fetching config.json. Allowing overrides fallbacks.',
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (staticConfig) {
      this.resolvedUrl = staticConfig.defaultRendererUrl;
      if (!staticConfig.allowOverrides) {
        console.log('Static configuration loaded with allowOverrides: false. Locking context.');
        this.isLockedContext = true;

        this.evaluateEnvironmentPurge();
        return this.resolvedUrl;
      }
    }

    if (!this.isLockedContext) {
      const queryCandidate = QueryParser.parseRendererUrl(this.getWindowSearch());
      if (queryCandidate) {
        this.resolvedUrl = queryCandidate;
        this.evaluateEnvironmentPurge();
        return this.resolvedUrl;
      }
    }

    const localPrefs = this.getStorageItem('a2ui_composer_renderer_url');
    if (localPrefs && !this.isLockedContext) {
      this.resolvedUrl = localPrefs;
    }

    this.evaluateEnvironmentPurge();

    if (!this.resolvedUrl) {
      if (globalThis.location?.pathname !== '/settings') {
        this.injector.get(Router).navigate(['/settings']);
      }
    }

    return this.resolvedUrl;
  }

  public getResolvedRendererUrl(): string | null {
    return this.resolvedUrl;
  }

  public isContextLocked(): boolean {
    return this.isLockedContext;
  }

  public isThirdPartyEnvironment(): boolean {
    const hostname = this.getWindowHostname();
    const force3P = this.getStorageItem('a2ui_composer_force_3p') === 'true';
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

  public isEnvironmentValid(): boolean {
    const resolvedUrl = this.getResolvedRendererUrl();
    const is3P = this.isThirdPartyEnvironment();
    const hasApiKey = !!this.getStorageItem('a2ui_composer_api_key');

    return !!resolvedUrl && (!is3P || hasApiKey);
  }

  public getWindowSearch(): string {
    return globalThis.location?.search || '';
  }

  public getWindowHostname(): string {
    return globalThis.location?.hostname || '';
  }

  private evaluateEnvironmentPurge(): void {
    if (!this.isThirdPartyEnvironment()) {
      this.removeStorageItem('a2ui_composer_api_key');
    }
  }

  private getStorageItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  private removeStorageItem(key: string): void {
    localStorage.removeItem(key);
  }
}
