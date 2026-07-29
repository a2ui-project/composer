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

import {Injectable, Injector, computed, inject, signal} from '@angular/core';
import {QueryParser} from '../query-parser/query-parser';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../environment-tokens/environment-tokens';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';

/**
 * Represents the configuration options for an application profile,
 * including target renderer endpoints, API keys, and override permissions.
 */
export declare interface ProfileConfig {
  rendererUrl?: string;
  apiKey?: string;
  allowOverrides?: boolean;
  displayName?: string;
}

export declare interface AppConfig {
  initialProfile?: string;
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

  private readonly _profiles = signal<Record<string, ProfileConfig>>({});
  private readonly _selectedProfileId = signal<string | null>(null);
  private readonly _activeProfileKey = signal<string | null>(null);

  readonly resolvedUrl = this._resolvedUrl.asReadonly();
  readonly isLockedContext = this._isLockedContext.asReadonly();
  readonly profiles = this._profiles.asReadonly();
  readonly selectedProfileId = this._selectedProfileId.asReadonly();
  readonly activeProfileKey = this._activeProfileKey.asReadonly();
  readonly activeProfile = computed<ProfileConfig | null>(() => {
    const profiles = this._profiles();
    const selectedId = this._selectedProfileId();
    if (selectedId && Object.prototype.hasOwnProperty.call(profiles, selectedId)) {
      return profiles[selectedId];
    }
    return null;
  });

  setSelectedProfileId(profileId: string | null): void {
    this._selectedProfileId.set(profileId);
    this._activeProfileKey.set(profileId);
    if (!profileId) {
      this._isLockedContext.set(false);
    } else {
      const profiles = this._profiles();
      const profile = profiles[profileId];
      if (profile && profile.allowOverrides === false && profile.rendererUrl) {
        this._isLockedContext.set(true);
      } else {
        this._isLockedContext.set(false);
      }
    }
  }

  getActiveProfileKey(): string | null {
    return this._activeProfileKey();
  }

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
    this._selectedProfileId.set(null);
    this._activeProfileKey.set(null);
    this._profiles.set({});

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
   * Selects the active profile key based on 4-tier resolution priority.
   */
  selectActiveProfileKey(staticConfig: AppConfig): string | null {
    const profiles = staticConfig.profiles;
    if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
      return null;
    }

    const isValidProfile = (key: string): boolean => {
      if (!Object.prototype.hasOwnProperty.call(profiles, key)) {
        return false;
      }
      const p = profiles[key];
      return p !== null && typeof p === 'object' && !Array.isArray(p);
    };

    if (staticConfig.initialProfile) {
      if (isValidProfile(staticConfig.initialProfile)) {
        return staticConfig.initialProfile;
      }
      console.warn(
        `Initial profile '${staticConfig.initialProfile}' not found in static configuration.`,
      );
    }

    const requestedProfile = QueryParser.parseProfileName(this.getWindowSearch());
    if (requestedProfile) {
      if (isValidProfile(requestedProfile)) {
        return requestedProfile;
      }
      console.warn(`Requested profile '${requestedProfile}' not found in static configuration.`);
    }

    const storedProfile = this.localStorageInteractions.getItem(LocalStorageKey.SELECTED_PROFILE);
    if (storedProfile && isValidProfile(storedProfile)) {
      return storedProfile;
    }

    if (isValidProfile('default')) {
      return 'default';
    }

    return null;
  }

  private async applyApiKeyFromProfile(profile: ProfileConfig): Promise<void> {
    const rawApiKey = profile.apiKey;
    const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';

    try {
      const configProvider = this.injector.get(AppConfigProvider);
      if (apiKey) {
        configProvider.setApiKeyFromConfig(apiKey);
      } else {
        configProvider.setApiKeyFromConfig('');
        try {
          const secureStorage = this.injector.get(SecureCredentialsStorage, null);
          if (secureStorage) {
            const storedKey = await secureStorage.getCredential(
              SecureCredentialsKey.GEMINI_API_KEY,
            );
            if (storedKey && storedKey.trim()) {
              await configProvider.setGeminiApiKey(storedKey.trim());
            }
          }
        } catch (err) {
          console.warn(
            'Failed to retrieve credential from SecureCredentialsStorage during startup resolution:',
            err,
          );
        }
      }
    } catch (err) {
      console.warn('Failed to apply config-provided API key to AppConfigProvider:', err);
    }
  }

  private async processStaticConfig(staticConfig: AppConfig): Promise<boolean> {
    console.log('Using static config.');
    if (
      staticConfig.profiles &&
      typeof staticConfig.profiles === 'object' &&
      !Array.isArray(staticConfig.profiles)
    ) {
      this._profiles.set(staticConfig.profiles);
    }

    const resolvedKey = this.selectActiveProfileKey(staticConfig);
    this._selectedProfileId.set(resolvedKey);
    this._activeProfileKey.set(resolvedKey);

    const profiles = staticConfig.profiles;
    let activeProfile: ProfileConfig = {};
    if (resolvedKey && profiles && Object.prototype.hasOwnProperty.call(profiles, resolvedKey)) {
      const p = profiles[resolvedKey];
      if (p && typeof p === 'object' && !Array.isArray(p)) {
        activeProfile = p;
      }
    }

    await this.applyApiKeyFromProfile(activeProfile);

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
