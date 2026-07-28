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

import {Injectable, Injector, inject, signal} from '@angular/core';
import {QueryParser} from '../query-parser/query-parser';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../environment-tokens/environment-tokens';

/**
 * Represents the configuration options for an application profile,
 * including target renderer endpoints, API keys, and override permissions.
 */
export declare interface ProfileConfig {
  rendererUrl?: string;
  apiKey?: string;
  allowOverrides?: boolean;
}

export declare interface AppConfig {
  profiles?: Record<string, ProfileConfig>;
}

@Injectable({
  providedIn: 'root',
})
/**
 * Orchestrates application startup configuration and environment resolution.
 */
export class StartupResolution {
  private readonly _resolvedUrl = signal<string | null>(null);
  private readonly _isLockedContext = signal(false);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly injector = inject(Injector);
  private readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);
  private readonly configUrl = inject(CONFIG_URL);

  readonly resolvedUrl = this._resolvedUrl.asReadonly();
  readonly isLockedContext = this._isLockedContext.asReadonly();

  /**
   * Resolves the startup configuration for the application.
   *
   * Use for application initial bootstrapping or resetting settings to factory
   * defaults (e.g. in `flushConfig()`). Asynchronously evaluates the fallback
   * chain: query parameters -> local storage -> static `config.json` defaults.
   *
   * @return A Promise resolving to the resolved renderer URL, or null if unresolvable.
   */
  async resolveStartupConfiguration(): Promise<string | null> {
    this._isLockedContext.set(false);
    this._resolvedUrl.set(null);

    const staticConfig = await this.fetchStaticConfig();
    if (staticConfig) {
      const isLocked = await this.processStaticConfig(staticConfig);
      if (isLocked) {
        return this._resolvedUrl();
      }
    }

    this.applyOverrides();
    await this.evaluateEnvironmentPurge();

    return this._resolvedUrl();
  }

  private async fetchStaticConfig(): Promise<AppConfig | null> {
    let staticConfig: AppConfig | null = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      console.log(`Fetching ${this.configUrl} configuration...`);
      const response = await fetch(this.configUrl, {signal: controller.signal});
      if (response.ok) {
        // Although we *expect* JSON, it's possible that the response includes
        // a JSON Vulnerability Protection prefixes (often referred to as an
        // XSSI - Cross-Site Script Inclusion prefix).
        // To prevent attacks, Google APIs and frameworks (like Angular) prefix
        // JSON payloads with a non-executable, syntactically invalid JavaScript
        // prefix—most commonly )]}' followed by a newline.
        const text = await response.text();
        const cleanText = text.replace(/^\)]}'\s*/, '');
        staticConfig = JSON.parse(cleanText);
      }
    } catch (err) {
      console.warn(`Watchdog timeout or failure fetching ${this.configUrl}`, err);
    } finally {
      clearTimeout(timeoutId);
    }

    return staticConfig;
  }

  /**
   * Selects the active profile configuration based on static config and query parameters.
   */
  private selectActiveProfile(staticConfig: AppConfig): ProfileConfig {
    const profiles = staticConfig.profiles;
    if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
      return {};
    }

    let defaultProfile: ProfileConfig = {};
    if (Object.prototype.hasOwnProperty.call(profiles, 'default')) {
      const dp = profiles['default'];
      if (dp && typeof dp === 'object' && !Array.isArray(dp)) {
        defaultProfile = dp;
      }
    }

    const requestedProfile = QueryParser.parseProfileName(this.getWindowSearch());
    let activeProfile: ProfileConfig = defaultProfile;

    if (requestedProfile) {
      let foundProfile: ProfileConfig | null = null;
      if (Object.prototype.hasOwnProperty.call(profiles, requestedProfile)) {
        const profileConfig = profiles[requestedProfile];
        if (profileConfig && typeof profileConfig === 'object' && !Array.isArray(profileConfig)) {
          foundProfile = profileConfig;
        }
      }

      if (foundProfile) {
        activeProfile = foundProfile;
      } else {
        console.warn(`Requested profile '${requestedProfile}' not found in static configuration.`);
      }
    }

    return activeProfile;
  }

  private applyApiKeyFromProfile(profile: ProfileConfig): void {
    const rawApiKey = profile.apiKey;
    const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';
    if (apiKey) {
      try {
        const configProvider = this.injector.get(AppConfigProvider);
        configProvider.setApiKeyFromConfig(apiKey);
      } catch (err) {
        console.warn('Failed to apply config-provided API key to AppConfigProvider:', err);
      }
    }
  }

  private async processStaticConfig(staticConfig: AppConfig): Promise<boolean> {
    console.log('Using static config.');
    const activeProfile = this.selectActiveProfile(staticConfig);
    this.applyApiKeyFromProfile(activeProfile);

    if (activeProfile.rendererUrl) {
      this._resolvedUrl.set(activeProfile.rendererUrl);
    }

    const allowOverrides = activeProfile.allowOverrides ?? true;
    if (!allowOverrides) {
      if (!activeProfile.rendererUrl) {
        console.warn(
          'Static profile sets allowOverrides: false but specifies no rendererUrl. Bypassing lock.',
        );
      } else {
        console.log('Static configuration loaded with allowOverrides: false. Locking context.');
        this._isLockedContext.set(true);

        await this.evaluateEnvironmentPurge();
        return true;
      }
    }

    return false;
  }

  private applyOverrides(): void {
    if (this._isLockedContext()) {
      return;
    }

    console.log('Checking for renderer query param...');
    const queryCandidate = QueryParser.parseRendererUrl(this.getWindowSearch());
    if (queryCandidate) {
      this._resolvedUrl.set(queryCandidate);
      console.log('Using renderer query param.');
      return;
    }

    const localPrefs = this.localStorageInteractions.getItem(LocalStorageKey.RENDERER_URL);
    if (localPrefs) {
      console.log('Using renderer from local storage.');
      this._resolvedUrl.set(localPrefs);
    }
  }

  getResolvedRendererUrl(): string | null {
    return this._resolvedUrl();
  }

  /**
   * Updates the resolved renderer URL directly in state.
   *
   * Use for direct, synchronous runtime state updates (e.g. when a user
   * explicitly changes the renderer URL in Settings via
   * `AppConfigProvider.setRendererUrl`). Bypasses the asynchronous resolution
   * pipeline to prevent query parameter overrides and network overhead.
   *
   * @param url The target renderer URL string or null.
   */
  setResolvedRendererUrl(url: string | null): void {
    this._resolvedUrl.set(url);
  }

  isContextLocked(): boolean {
    return this._isLockedContext();
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

  async isEnvironmentValid(): Promise<boolean> {
    const resolvedUrl = this.getResolvedRendererUrl();
    return !!resolvedUrl;
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

  private async evaluateEnvironmentPurge(): Promise<void> {
    if (!this.isThirdPartyEnvironment()) {
      try {
        const configProvider = this.injector.get(AppConfigProvider);
        await configProvider.purgeGeminiApiKey();
      } catch (err) {
        console.warn('Failed to purge Gemini API key in 1P environment:', err);
      }
    }
  }
}
