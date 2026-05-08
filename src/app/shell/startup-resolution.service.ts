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

import {Injectable} from '@angular/core';
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

        return this.resolvedUrl;
      }
    }

    if (!this.isLockedContext) {
      const queryCandidate = QueryParser.parseRendererUrl(globalThis.location?.search || '');
      if (queryCandidate) {
        this.resolvedUrl = queryCandidate;
        return this.resolvedUrl;
      }
    }

    const localPrefs = localStorage.getItem('a2ui_composer_renderer_url');
    if (localPrefs && !this.isLockedContext) {
      this.resolvedUrl = localPrefs;
    }

    return this.resolvedUrl;
  }

  getResolvedRendererUrl(): string | null {
    return this.resolvedUrl;
  }

  isContextLocked(): boolean {
    return this.isLockedContext;
  }
}
