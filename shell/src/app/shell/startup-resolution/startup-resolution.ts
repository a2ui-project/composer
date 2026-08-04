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
import {MatDialog} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {OriginConfirmationDialog} from './origin-confirmation-dialog/origin-confirmation-dialog';

/**
 * Represents the configuration options for an application renderer.
 */
export declare interface RendererConfig {
  rendererUrl?: string;
  displayName?: string;
  id?: string;
  name?: string;
  apiKey?: string;
  samplePayload?: string;
}

export declare interface ApiKeyConfig {
  apiKey: string;
  displayName?: string;
}

export declare interface AppConfig {
  renderers?: Record<string, RendererConfig>;
  apiKeys?: Record<string, ApiKeyConfig>;
}

@Injectable({
  providedIn: 'root',
})
/**
 * Orchestrates application startup configuration and environment resolution.
 */
export class StartupResolution {
  private readonly _resolvedUrl = signal<string | null>(null);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);
  private readonly configUrl = inject(CONFIG_URL);
  readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private get configProvider(): AppConfigProvider {
    return this.injector.get(AppConfigProvider);
  }
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage, {optional: true});

  private readonly _renderers = signal<Record<string, RendererConfig>>({});
  private readonly _selectedRendererId = signal<string | null>(null);
  private readonly _apiKeys = signal<Record<string, ApiKeyConfig>>({});

  readonly resolvedUrl = this._resolvedUrl.asReadonly();
  readonly renderers = this._renderers.asReadonly();
  readonly apiKeys = this._apiKeys.asReadonly();
  readonly selectedRendererId = this._selectedRendererId.asReadonly();
  readonly selectedRendererId$ = this._selectedRendererId.asReadonly();
  readonly activeRenderer = computed<RendererConfig | null>(() => {
    const renderers = this._renderers();
    const selectedId = this._selectedRendererId();
    if (!selectedId) return null;
    return this.getRendererById(selectedId, renderers);
  });

  async setSelectedRendererId(rendererId: string | null): Promise<boolean> {
    this._selectedRendererId.set(rendererId);
    const active = this.activeRenderer();
    if (active?.rendererUrl) {
      const isAllowed = await this.isOriginAllowed(active.rendererUrl);
      if (isAllowed) {
        this._resolvedUrl.set(active.rendererUrl);
        return true;
      }
      return false;
    }
    return true;
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
    this._resolvedUrl.set(null);
    this._selectedRendererId.set(null);
    this._renderers.set({});
    this._apiKeys.set({});

    const staticConfig = await this.fetchStaticConfig();
    const resolved = await this.resolveRenderer(staticConfig);

    await this.evaluateEnvironmentPurge();

    return resolved;
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

  private async applyApiKeyFromConfig(
    staticConfig: AppConfig,
    selectedId: string | null,
  ): Promise<void> {
    let keyConfig: ApiKeyConfig | undefined;
    if (selectedId && staticConfig.apiKeys?.[selectedId]) {
      keyConfig = staticConfig.apiKeys[selectedId];
    }
    const apiKey = typeof keyConfig?.apiKey === 'string' ? keyConfig.apiKey.trim() : '';

    try {
      if (apiKey) {
        this.configProvider.setApiKeyFromConfig(apiKey);
      } else {
        this.configProvider.setApiKeyFromConfig('');
      }
    } catch (err) {
      console.warn('Failed to apply config-provided API key to AppConfigProvider:', err);
    }
  }

  private getRendererById(
    id: string,
    staticRenderers: Record<string, RendererConfig>,
  ): RendererConfig | null {
    if (Object.prototype.hasOwnProperty.call(staticRenderers, id)) {
      const r = staticRenderers[id];
      if (r && typeof r === 'object' && !Array.isArray(r)) {
        return r;
      }
    }
    const customRenderers = this.getCustomRenderers();
    const foundCustom = customRenderers.find(
      r => r && typeof r === 'object' && !Array.isArray(r) && r.id === id,
    );
    if (foundCustom) {
      return foundCustom;
    }
    return null;
  }

  getCustomRenderers(): RendererConfig[] {
    try {
      const raw = this.localStorageInteractions.getItem(LocalStorageKey.CUSTOM_RENDERERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is RendererConfig =>
              !!item && typeof item === 'object' && typeof item.id === 'string' && !!item.id.trim(),
          );
        }
      }
    } catch (e) {
      console.warn('Failed to parse custom renderers from local storage:', e);
    }
    return [];
  }

  async resolveRenderer(staticConfig?: AppConfig | null): Promise<string | null> {
    let config = staticConfig;
    if (config === undefined) {
      config = await this.fetchStaticConfig();
    }

    if (config?.apiKeys && typeof config.apiKeys === 'object' && !Array.isArray(config.apiKeys)) {
      this._apiKeys.set(config.apiKeys);
    } else {
      this._apiKeys.set({});
    }

    let staticRenderers: Record<string, RendererConfig> = {};
    if (config) {
      if (
        config.renderers &&
        typeof config.renderers === 'object' &&
        !Array.isArray(config.renderers)
      ) {
        staticRenderers = config.renderers;
        this._renderers.set(staticRenderers);
      }
    } else {
      staticRenderers = this._renderers();
    }

    // Tier 1 & 2: ?renderer= query param (subject to origin allowlist check)
    const queryRendererUrl = QueryParser.parseRendererUrl(this.getWindowSearch());
    if (queryRendererUrl) {
      const isAllowed = await this.isOriginAllowed(queryRendererUrl);
      if (isAllowed) {
        console.log('Using renderer query param.');
        const requestedId = QueryParser.parseRendererId(this.getWindowSearch());
        if (requestedId) {
          this._selectedRendererId.set(requestedId);
        }
        await this.applyApiKeyFromConfig(config || {}, requestedId || 'default');
        this._resolvedUrl.set(queryRendererUrl);
        return queryRendererUrl;
      } else {
        console.warn('Renderer query param origin not allowed by user.');
      }
    }

    // Tier 3: ?rendererId=
    const requestedId = QueryParser.parseRendererId(this.getWindowSearch());
    if (requestedId) {
      const candidate = this.getRendererById(requestedId, staticRenderers);
      if (candidate) {
        console.log(`Using renderer ID '${requestedId}' from query param.`);
        this._selectedRendererId.set(requestedId);
        if (config) {
          await this.applyApiKeyFromConfig(config, requestedId);
        }
        if (candidate.rendererUrl) {
          this._resolvedUrl.set(candidate.rendererUrl);
          return candidate.rendererUrl;
        }
      } else {
        console.warn(`Requested renderer '${requestedId}' not found in static configuration.`);
      }
    }

    // Tier 4: Last Selected Renderer (LocalStorage)
    const storedId = this.localStorageInteractions.getItem(LocalStorageKey.SELECTED_RENDERER);
    if (storedId) {
      const candidate = this.getRendererById(storedId, staticRenderers);
      if (candidate) {
        console.log(`Using stored selected renderer ID '${storedId}'.`);
        this._selectedRendererId.set(storedId);
        if (config) {
          await this.applyApiKeyFromConfig(config, storedId);
        }
        if (candidate.rendererUrl) {
          this._resolvedUrl.set(candidate.rendererUrl);
          return candidate.rendererUrl;
        }
      } else {
        console.warn(`Stored selected renderer ID '${storedId}' not found.`);
      }
    }

    // Tier 5: 'default' renderer from config.json.renderers
    const defaultCandidate = this.getRendererById('default', staticRenderers);
    if (defaultCandidate?.rendererUrl) {
      console.log("Using 'default' renderer from static config.");
      if (!this._selectedRendererId()) {
        this._selectedRendererId.set('default');
        if (config) {
          await this.applyApiKeyFromConfig(config, 'default');
        }
      }
      this._resolvedUrl.set(defaultCandidate.rendererUrl);
      return defaultCandidate.rendererUrl;
    }

    // Tier 6: null renderer -> redirects to /settings
    this._resolvedUrl.set(null);
    this._selectedRendererId.set(null);
    return null;
  }

  private getBaseOrigin(): string {
    return globalThis.location?.origin || 'http://localhost';
  }

  private isLocalhost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }

  async isOriginAllowed(url: string): Promise<boolean> {
    let origin: string;
    let hostname: string;
    try {
      const baseOrigin = this.getBaseOrigin();
      const parsedUrl = url.startsWith('/') ? new URL(url, baseOrigin) : new URL(url);
      origin = parsedUrl.origin;
      hostname = parsedUrl.hostname;
    } catch (e) {
      return false;
    }

    if (this.isLocalhost(hostname) || origin === globalThis.location?.origin) {
      return true;
    }

    const isStaticConfigOrigin = Object.values(this._renderers()).some(r => {
      if (!r?.rendererUrl) return false;
      try {
        const baseOrigin = this.getBaseOrigin();
        const parsed = r.rendererUrl.startsWith('/')
          ? new URL(r.rendererUrl, baseOrigin)
          : new URL(r.rendererUrl);
        return parsed.origin === origin;
      } catch {
        return false;
      }
    });

    if (isStaticConfigOrigin) {
      return true;
    }

    let allowedOrigins: string[] = [];
    try {
      const stored = this.localStorageInteractions.getItem(LocalStorageKey.ALLOWED_ORIGINS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          allowedOrigins = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse ALLOWED_ORIGINS from local storage:', e);
    }

    if (allowedOrigins.includes(origin)) {
      return true;
    }

    const confirmed = await this.confirmOrigin(origin);
    if (confirmed) {
      allowedOrigins.push(origin);
      this.localStorageInteractions.setItem(
        LocalStorageKey.ALLOWED_ORIGINS,
        JSON.stringify(allowedOrigins),
      );
      return true;
    }

    return false;
  }

  async confirmOrigin(origin: string): Promise<boolean> {
    const dialogRef = this.dialog.open(OriginConfirmationDialog, {
      data: {origin},
      width: '450px',
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    return !!result;
  }

  getResolvedRendererUrl(): string | null {
    return this._resolvedUrl();
  }

  setResolvedRendererUrl(url: string | null): void {
    this._resolvedUrl.set(url);
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
        await this.configProvider.purgeGeminiApiKey();
      } catch (err) {
        console.warn('Failed to purge Gemini API key in 1P environment:', err);
      }
    }
  }
}
