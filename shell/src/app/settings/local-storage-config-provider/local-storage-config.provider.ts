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

  /** Tracks local overrides for authentication modes at runtime. */
  private readonly _forcedAuthOverride = signal<AuthType>(this.getInitialForcedAuth());

  /** Coordinates dynamic API key state tracking. */
  private readonly _geminiApiKey = signal<string>(
    this.localStorageInteractions.getItem(LocalStorageKey.GEMINI_API_KEY) || '',
  );

  /** Coordinates dynamic renderer preview frame URL endpoint. */
  private readonly _rendererUrl = signal<string>(
    this.localStorageInteractions.getItem(LocalStorageKey.RENDERER_URL) ||
      this.startup.getResolvedRendererUrl() ||
      '',
  );

  /** Coordinates dynamic light/dark UI style theme preferences state. */
  private readonly _themePreference = signal<ThemePreference>(
    (this.localStorageInteractions.getItem(
      LocalStorageKey.THEME_PREFERENCE,
    ) as ThemePreference | null) || 'light',
  );

  /**
   * Exposes whether the host environment operates in standalone or integrated
   * extension mode.
   */
  override readonly envMode: Signal<EnvMode> = computed(() => {
    return this.startup.isExtensionMode() ? EnvMode.EXTENSION : EnvMode.STANDALONE;
  });

  /** Exposes the active authentication protocol context. */
  override readonly authType: Signal<AuthType> = computed(() => {
    const override = this._forcedAuthOverride();
    if (override !== AuthType.DEFAULT) {
      return override;
    }
    return this.startup.isThirdPartyEnvironment() ? AuthType.THREE_PARTY : AuthType.ONE_PARTY;
  });

  /** Exposes the active preview frame target URL wrapper signal. */
  override readonly rendererUrl: Signal<string> = this._rendererUrl.asReadonly();

  /** Exposes the user-provided Gemini developer API key wrapper signal. */
  override readonly geminiApiKey: Signal<string> = this._geminiApiKey.asReadonly();

  /** Exposes active light/dark UI style theme preference signal wrapper. */
  override readonly themePreference: Signal<ThemePreference> = this._themePreference.asReadonly();

  /**
   * Mutates and saves the active renderer URL endpoint.
   *
   * @param url The target destination URL endpoint.
   */
  override setRendererUrl(url: string): void {
    this._rendererUrl.set(url);
    this.localStorageInteractions.setItem(LocalStorageKey.RENDERER_URL, url);
  }

  /**
   * Mutates and saves the personal third-party API key.
   *
   * @param key The fresh Gemini developer API key credential.
   */
  override setGeminiApiKey(key: string): void {
    this._geminiApiKey.set(key);
    this.localStorageInteractions.setItem(LocalStorageKey.GEMINI_API_KEY, key);
  }

  /**
   * Mutates and saves active light/dark style theme preferences context.
   *
   * @param theme Preferred visual style theme mode selector.
   */
  override setThemePreference(theme: ThemePreference): void {
    this._themePreference.set(theme);
    this.localStorageInteractions.setItem(LocalStorageKey.THEME_PREFERENCE, theme);
  }

  /**
   * Overrides target authentication environments.
   *
   * @param mode The forced authentication protocol mode.
   */
  override setForcedAuthMode(mode: AuthType): void {
    this._forcedAuthOverride.set(mode);

    if (mode === AuthType.ONE_PARTY) {
      this.localStorageInteractions.setItem(LocalStorageKey.FORCE_1P, 'true');
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_3P);
    } else if (mode === AuthType.THREE_PARTY) {
      this.localStorageInteractions.setItem(LocalStorageKey.FORCE_3P, 'true');
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_1P);
    } else {
      // AuthType.DEFAULT -> Clear all override flags in browser storage
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_1P);
      this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_3P);
    }
  }

  /**
   * Purges runtime overrides and dynamic key markers from persistent layers.
   */
  override flushConfig(): void {
    this.localStorageInteractions.removeItem(LocalStorageKey.RENDERER_URL);
    this.localStorageInteractions.removeItem(LocalStorageKey.GEMINI_API_KEY);
    this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_1P);
    this.localStorageInteractions.removeItem(LocalStorageKey.FORCE_3P);
    this.localStorageInteractions.removeItem(LocalStorageKey.THEME_PREFERENCE);

    this._forcedAuthOverride.set(AuthType.DEFAULT);
    this._geminiApiKey.set('');
    this._rendererUrl.set(this.startup.getResolvedRendererUrl() || '');
    this._themePreference.set('light');
  }

  /**
   * Evaluates baseline local storage and retrieves starting authentication
   * modes.
   *
   * @returns Active AuthType mapping.
   */
  private getInitialForcedAuth(): AuthType {
    if (this.localStorageInteractions.getItem(LocalStorageKey.FORCE_1P) === 'true') {
      return AuthType.ONE_PARTY;
    }
    if (this.localStorageInteractions.getItem(LocalStorageKey.FORCE_3P) === 'true') {
      return AuthType.THREE_PARTY;
    }
    return AuthType.DEFAULT;
  }
}
