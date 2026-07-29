/**
 * @license
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

import {Injectable, Signal, computed, inject, signal} from '@angular/core';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  AuthType,
  EnvMode,
  ThemePreference,
} from '../app-config-provider/app-config-provider';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';

/**
 * Concrete implementation of the AppConfigProvider that integrates with
 * browser local storage for persistence of dynamic user-specified parameters,
 * query overrides, and API credentials. Coordinates baseline host parameters
 * read from the central StartupResolution singleton.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageAppConfigProvider extends AppConfigProvider {
  /** Core dynamic singleton startup state resolution bridge. */
  private readonly startup = inject(StartupResolution);

  /** Central type-safe browser persistent storage service provider. */
  private readonly localStorageInteractions = inject(LocalStorageInteractions);

  /** Highly secure credentials asynchronous storage engine. */
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage);

  private readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);

  /** Tracks local overrides for authentication modes at runtime. */
  private readonly _forcedAuthOverride = signal<AuthType>(this.getInitialForcedAuth());

  /** Coordinates dynamic API key state tracking. */
  private readonly _geminiApiKey = signal<string>('');

  /** Tracks whether the active API key was supplied via config.json. */
  private readonly _isApiKeyProvidedByConfig = signal<boolean>(false);

  /** Coordinates dynamic renderer preview frame URL endpoint. */
  private readonly _rendererUrl = signal<string>(
    this.startup.getResolvedRendererUrl() ||
      this.localStorageInteractions.getItem(LocalStorageKey.RENDERER_URL) ||
      '',
  );

  /** Coordinates dynamic light/dark UI style theme preferences state. */
  private readonly _themePreference = signal<ThemePreference>(
    (this.localStorageInteractions.getItem(
      LocalStorageKey.THEME_PREFERENCE,
    ) as ThemePreference | null) || ThemePreference.LIGHT,
  );

  /** Coordinates dynamic inclusion of screenshots context preferences state. */
  private readonly _includeScreenshot = signal<boolean>(false);

  /**
   * Orchestrates overall subsystem bootstrapping, sequentially resolving
   * active renderer fallback URLs and secure cryptographic API credentials.
   */
  override async initialize(): Promise<void> {
    this.initializeRendererUrl();
    await this.initializeCredentials();
  }

  /** Loads stored API credentials into state. */
  private async initializeCredentials(): Promise<void> {
    if (this._isApiKeyProvidedByConfig()) {
      return;
    }
    try {
      const key = await this.secureCredentialsStorage.getCredential(
        SecureCredentialsKey.GEMINI_API_KEY,
      );
      this._geminiApiKey.set((key || '').trim());
    } catch (err) {
      console.warn(
        'Failed to resolve credentials from SecureCredentialsStorage during bootstrap',
        err,
      );
      this._geminiApiKey.set('');
    }
  }

  /** Initializes the renderer URL from configuration or persistent storage. */
  private initializeRendererUrl(): void {
    const resolved = this.startup.getResolvedRendererUrl();
    if (resolved) {
      this._rendererUrl.set(resolved);
    } else {
      const localUrl = this.localStorageInteractions.getItem(LocalStorageKey.RENDERER_URL);
      if (localUrl) {
        this._rendererUrl.set(localUrl);
      }
    }
  }

  /** Environment operating mode. */
  override readonly envMode: Signal<EnvMode> = computed(() => {
    return this.startup.isExtensionMode() ? EnvMode.EXTENSION : EnvMode.STANDALONE;
  });

  /** Active authentication mode. */
  override readonly authType: Signal<AuthType> = computed(() => {
    const override = this._forcedAuthOverride();
    if (override !== AuthType.DEFAULT) {
      return override;
    }
    return this.startup.isThirdPartyEnvironment() ? AuthType.THIRD_PARTY : AuthType.FIRST_PARTY;
  });

  /** Active renderer endpoint URL. */
  override readonly rendererUrl: Signal<string> = this._rendererUrl.asReadonly();

  /** Active API key for external service calls. */
  override readonly geminiApiKey: Signal<string> = this._geminiApiKey.asReadonly();

  /** Indicates whether the active API key is managed by static configuration. */
  override readonly isApiKeyProvidedByConfig: Signal<boolean> =
    this._isApiKeyProvidedByConfig.asReadonly();

  /** Visual theme preference. */
  override readonly themePreference: Signal<ThemePreference> = this._themePreference.asReadonly();

  /** Preference for including screenshots in user interactions. */
  override readonly includeScreenshot: Signal<boolean> = this._includeScreenshot.asReadonly();

  /**
   * Updates the screenshot attachment preference.
   *
   * @param include Whether screenshots should be included.
   */
  override setIncludeScreenshot(include: boolean): void {
    this._includeScreenshot.set(include);
  }

  /**
   * Updates and persists the active renderer URL endpoint.
   *
   * @param url The target renderer URL.
   */
  override setRendererUrl(url: string): void {
    this._rendererUrl.set(url);
    this.localStorageInteractions.setItem(LocalStorageKey.RENDERER_URL, url);
    if (!this.startup.isContextLocked()) {
      this.startup.setResolvedRendererUrl(url);
    }
  }

  /**
   * Updates and persists the API key for external service calls.
   *
   * @param key The API key credential.
   */
  override async setGeminiApiKey(key: string): Promise<void> {
    if (this._isApiKeyProvidedByConfig()) {
      return;
    }
    const trimmedKey = key.trim();
    this._isApiKeyProvidedByConfig.set(false);
    this._geminiApiKey.set(trimmedKey);
    try {
      await this.secureCredentialsStorage.setCredential(
        SecureCredentialsKey.GEMINI_API_KEY,
        trimmedKey,
      );
    } catch (err) {
      console.warn('Failed to persist Gemini API key to SecureCredentialsStorage:', err);
      throw err;
    }
  }

  /**
   * Sets the API key provided by static configuration.
   *
   * @param key The configuration-provided API key.
   */
  override setApiKeyFromConfig(key: string): void {
    const trimmed = (key || '').trim();
    if (trimmed) {
      this._isApiKeyProvidedByConfig.set(true);
      this._geminiApiKey.set(trimmed);
    } else {
      this._isApiKeyProvidedByConfig.set(false);
      this._geminiApiKey.set('');
    }
  }

  /**
   * Purges stored API key credentials and resets API key state.
   */
  override async purgeGeminiApiKey(): Promise<void> {
    this._isApiKeyProvidedByConfig.set(false);
    this._geminiApiKey.set('');
    await this.secureCredentialsStorage
      .removeCredential(SecureCredentialsKey.GEMINI_API_KEY)
      .catch(err => {
        console.warn('Failed to remove Gemini API key from SecureCredentialsStorage', err);
      });
  }

  /**
   * Updates and persists the visual theme preference.
   *
   * @param theme The theme preference.
   */
  override setThemePreference(theme: ThemePreference): void {
    this._themePreference.set(theme);
    this.localStorageInteractions.setItem(LocalStorageKey.THEME_PREFERENCE, theme);
  }

  /**
   * Sets an explicit override for the authentication mode.
   *
   * @param mode The authentication mode override.
   */
  override setForcedAuthMode(mode: AuthType): void {
    this._forcedAuthOverride.set(mode);

    if (mode === AuthType.FIRST_PARTY) {
      this.localStorageInteractions.setItem(LocalStorageKey.FORCE_1P, 'true');
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_3P);
    } else if (mode === AuthType.THIRD_PARTY) {
      this.localStorageInteractions.setItem(LocalStorageKey.FORCE_3P, 'true');
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_1P);
    } else {
      // Revert to environment auto-detection when no explicit override is active.
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_1P);
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_3P);
    }
  }

  /**
   * Resets all persisted configuration, credentials, and runtime overrides to default state.
   */
  override async flushConfig(): Promise<void> {
    this.localStorageInteractions.removeItem(LocalStorageKey.RENDERER_URL);
    await this.purgeGeminiApiKey();
    this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_1P);
    this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_3P);
    this.localStorageInteractions.removeItem(LocalStorageKey.THEME_PREFERENCE);

    this._forcedAuthOverride.set(AuthType.DEFAULT);
    this._isApiKeyProvidedByConfig.set(false);
    this._geminiApiKey.set('');
    await this.startup.resolveStartupConfiguration();
    this._rendererUrl.set(this.startup.getResolvedRendererUrl() || '');
    this._themePreference.set(ThemePreference.LIGHT);
    this._includeScreenshot.set(false);
  }

  /**
   * Resolves the initial authentication mode override from storage.
   *
   * @returns The initial authentication mode.
   */
  private getInitialForcedAuth(): AuthType {
    if (!this.is1PAuthEnabled) {
      return AuthType.DEFAULT;
    }
    if (this.localStorageInteractions.getItem(LocalStorageKey.FORCE_1P) === 'true') {
      return AuthType.FIRST_PARTY;
    }
    if (this.localStorageInteractions.getItem(LocalStorageKey.FORCE_3P) === 'true') {
      return AuthType.THIRD_PARTY;
    }
    return AuthType.DEFAULT;
  }
}
