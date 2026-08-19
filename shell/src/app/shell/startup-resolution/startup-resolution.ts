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

import {EnvironmentContextService} from './state/environment-context.service';
import {
  StartupConfigStateService,
  RendererConfig,
  ApiKeyConfig,
  AppConfig,
} from './state/startup-config-state.service';
import {Injectable, Injector, DestroyRef, inject} from '@angular/core';
import {QueryParser} from '../query-parser/query-parser';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../environment-tokens/environment-tokens';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {MatDialog} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {OriginConfirmationDialog} from './origin-confirmation-dialog/origin-confirmation-dialog';

@Injectable({
  providedIn: 'root',
})
/**
 * Orchestrates application startup configuration and environment resolution.
 */
export class StartupResolution {
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);
  private readonly configUrl = inject(CONFIG_URL);
  readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly environmentContext = inject(EnvironmentContextService);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage, {optional: true});

  readonly resolvedUrl = this.startupConfigState.resolvedUrl;
  readonly renderers = this.startupConfigState.renderers;
  readonly apiKeys = this.startupConfigState.apiKeys;
  readonly sharedA2uiPayload = this.startupConfigState.sharedA2uiPayload;
  readonly sharedA2uiError = this.startupConfigState.sharedA2uiError;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    if (typeof globalThis.window !== 'undefined' && globalThis.window.addEventListener) {
      const onHashChange = () => {
        this.processSharedA2uiUrl();
      };
      globalThis.window.addEventListener('hashchange', onHashChange);
      this.destroyRef.onDestroy(() => {
        globalThis.window.removeEventListener('hashchange', onHashChange);
      });
    }
  }

  async setSelectedRendererId(rendererId: string | null): Promise<boolean> {
    this.startupConfigState.setSelectedRendererId(rendererId);
    const active = rendererId
      ? this.getRendererById(rendererId, this.startupConfigState.renderers())
      : null;
    if (active?.rendererUrl) {
      const isAllowed = await this.isOriginAllowed(active.rendererUrl);
      if (isAllowed) {
        this.startupConfigState.setResolvedUrl(active.rendererUrl);
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
    this.startupConfigState.setResolvedUrl(null);
    this.startupConfigState.setSelectedRendererId(null);
    this.startupConfigState.setSharedA2uiPayload(null);
    this.startupConfigState.setSharedA2uiError(null);
    this.startupConfigState.setRenderers({});
    this.startupConfigState.setApiKeys({});

    const staticConfig = await this.fetchStaticConfig();
    const resolved = await this.resolveRenderer(staticConfig);

    await this.processSharedA2uiUrl();

    await this.evaluateEnvironmentPurge();

    return resolved;
  }

  async processSharedA2uiUrl(): Promise<void> {
    const rawParam = this.getWindowHash() || this.getWindowSearch();
    if (!rawParam) {
      return;
    }
    const queryRendererUrl = QueryParser.parseRendererUrl(rawParam);
    const queryRendererId = QueryParser.parseRendererId(rawParam);
    if (queryRendererUrl || queryRendererId) {
      await this.resolveRenderer();
    }
    const {payload, error} = await QueryParser.parseSharedA2ui(rawParam);
    if (payload) {
      console.log('Using shared A2UI payload from URL.');
      this.startupConfigState.setSharedA2uiPayload(payload);
      this.cleanSharedA2uiUrl();
    } else if (error) {
      console.warn('Shared A2UI payload error:', error);
      this.startupConfigState.setSharedA2uiError(error);
      this.cleanSharedA2uiUrl();
    } else if (queryRendererUrl || queryRendererId) {
      this.cleanSharedA2uiUrl();
    }
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
        await this.syncStoredCredentialsToConfigProvider(staticConfig);
      }
    } catch (err) {
      console.warn('Failed to apply config-provided API key to AppConfigProvider:', err);
    }
  }

  private async syncStoredCredentialsToConfigProvider(staticConfig?: AppConfig): Promise<void> {
    try {
      const selectedId = this.localStorageInteractions.getItem(LocalStorageKey.SELECTED_API_KEY);
      if (selectedId) {
        const staticApiKeys = staticConfig?.apiKeys || this.startupConfigState.apiKeys() || {};
        const entry = staticApiKeys[selectedId];
        const keyVal = entry?.apiKey?.trim() || '';
        if (keyVal) {
          this.configProvider.setApiKeyFromConfig(keyVal);
          return;
        }
        if (this.secureCredentialsStorage) {
          const custom = await this.secureCredentialsStorage.getCustomApiKey(selectedId);
          if (custom?.key) {
            this.configProvider.setRuntimeApiKey(custom.key.trim());
            return;
          }
        }
      }
      if (this.secureCredentialsStorage) {
        const customKeys = await this.secureCredentialsStorage.getCustomApiKeys();
        const defaultCustom = customKeys.find(k => k.id === 'default') || customKeys[0];
        if (defaultCustom?.key) {
          this.configProvider.setRuntimeApiKey(defaultCustom.key.trim());
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to restore stored credentials in StartupResolution:', err);
    }
  }

  getRendererById(
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
      this.startupConfigState.setApiKeys(config.apiKeys);
    } else {
      this.startupConfigState.setApiKeys({});
    }

    let staticRenderers: Record<string, RendererConfig> = {};
    if (config) {
      if (
        config.renderers &&
        typeof config.renderers === 'object' &&
        !Array.isArray(config.renderers)
      ) {
        staticRenderers = config.renderers;
      }
    } else {
      staticRenderers = this.startupConfigState.renderers();
    }

    const mergedRenderers = {...staticRenderers};
    const customRenderers = this.getCustomRenderers();
    for (const cr of customRenderers) {
      if (cr.id) {
        mergedRenderers[cr.id] = cr;
      }
    }
    this.startupConfigState.setRenderers(mergedRenderers);

    // Tier 1 & 2: renderer param from hash or query (subject to origin allowlist check)
    const queryRendererUrl =
      QueryParser.parseRendererUrl(this.getWindowHash()) ||
      QueryParser.parseRendererUrl(this.getWindowSearch());
    if (queryRendererUrl) {
      const isAllowed = await this.isOriginAllowed(queryRendererUrl);
      if (isAllowed) {
        console.log('Using renderer parameter.');
        const requestedId =
          QueryParser.parseRendererId(this.getWindowHash()) ||
          QueryParser.parseRendererId(this.getWindowSearch());
        const existingRenderer = requestedId
          ? this.getRendererById(requestedId, staticRenderers)
          : null;
        let targetId = existingRenderer ? requestedId : null;
        if (!targetId) {
          const staticMatch = Object.entries(staticRenderers).find(
            ([_, r]) =>
              r?.rendererUrl &&
              this.normalizeUrl(r.rendererUrl) === this.normalizeUrl(queryRendererUrl),
          );
          if (staticMatch) {
            targetId = staticMatch[0];
          } else {
            const customMatch = this.getCustomRenderers().find(
              r =>
                r?.rendererUrl &&
                this.normalizeUrl(r.rendererUrl) === this.normalizeUrl(queryRendererUrl),
            );
            if (customMatch) {
              targetId = customMatch.id ?? null;
            } else {
              try {
                const urlObj = new URL(queryRendererUrl, this.environmentContext.getBaseOrigin());
                const hostname = urlObj.hostname || 'custom';
                const port = urlObj.port ? `:${urlObj.port}` : '';
                const newId = `custom-${Date.now()}`;
                const customEntry: RendererConfig = {
                  id: newId,
                  name: `Custom (${hostname}${port})`,
                  rendererUrl: queryRendererUrl,
                };
                const customList = this.getCustomRenderers();
                customList.push(customEntry);
                this.localStorageInteractions.setItem(
                  LocalStorageKey.CUSTOM_RENDERERS,
                  JSON.stringify(customList),
                );
                targetId = newId;
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
        if (targetId) {
          this.startupConfigState.setSelectedRendererId(targetId);
          this.localStorageInteractions.setItem(LocalStorageKey.SELECTED_RENDERER, targetId);
        }
        const effectiveApiKeyId =
          requestedId ?? (targetId && config?.apiKeys?.[targetId] ? targetId : 'default');
        await this.applyApiKeyFromConfig(config || {}, effectiveApiKeyId);
        this.startupConfigState.setResolvedUrl(queryRendererUrl);
        this.configProvider?.setRendererUrl?.(queryRendererUrl);
        return queryRendererUrl;
      } else {
        console.warn('Renderer parameter origin not allowed by user.');
      }
    }

    // Tier 3: rendererId from hash or query
    const requestedId =
      QueryParser.parseRendererId(this.getWindowHash()) ||
      QueryParser.parseRendererId(this.getWindowSearch());
    if (requestedId) {
      const candidate = this.getRendererById(requestedId, staticRenderers);
      if (candidate) {
        console.log(`Using renderer ID '${requestedId}' from query param.`);
        this.startupConfigState.setSelectedRendererId(requestedId);
        this.localStorageInteractions.setItem(LocalStorageKey.SELECTED_RENDERER, requestedId);
        if (config) {
          await this.applyApiKeyFromConfig(config, requestedId);
        }
        if (candidate.rendererUrl) {
          this.startupConfigState.setResolvedUrl(candidate.rendererUrl);
          this.configProvider?.setRendererUrl?.(candidate.rendererUrl);
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
        this.startupConfigState.setSelectedRendererId(storedId);
        if (config) {
          await this.applyApiKeyFromConfig(config, storedId);
        }
        if (candidate.rendererUrl) {
          this.startupConfigState.setResolvedUrl(candidate.rendererUrl);
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
      if (!this.startupConfigState.selectedRendererId()) {
        this.startupConfigState.setSelectedRendererId('default');
        if (config) {
          await this.applyApiKeyFromConfig(config, 'default');
        }
      }
      this.startupConfigState.setResolvedUrl(defaultCandidate.rendererUrl);
      return defaultCandidate.rendererUrl;
    }

    // Tier 6: null renderer -> redirects to /settings
    this.startupConfigState.setResolvedUrl(null);
    this.startupConfigState.setSelectedRendererId(null);
    return null;
  }

  private normalizeUrl(urlStr?: string | null): string {
    if (!urlStr) {
      return '';
    }

    try {
      const baseOrigin = this.environmentContext.getBaseOrigin();
      const u = urlStr.startsWith('/') ? new URL(urlStr, baseOrigin) : new URL(urlStr);
      return u.origin + u.pathname.replace(/\/+$/, '') + u.search;
    } catch {
      return urlStr.replace(/\/+$/, '');
    }
  }

  async isOriginAllowed(url: string): Promise<boolean> {
    let origin: string;
    let hostname: string;
    try {
      const baseOrigin = this.environmentContext.getBaseOrigin();
      const parsedUrl = url.startsWith('/') ? new URL(url, baseOrigin) : new URL(url);
      origin = parsedUrl.origin;
      hostname = parsedUrl.hostname;
    } catch (e) {
      return false;
    }

    if (this.environmentContext.isLocalhost(hostname) || origin === globalThis.location?.origin) {
      return true;
    }

    const isStaticConfigOrigin = Object.values(this.startupConfigState.renderers()).some(r => {
      if (!r?.rendererUrl) return false;
      try {
        const baseOrigin = this.environmentContext.getBaseOrigin();
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
    return this.startupConfigState.resolvedUrl();
  }

  setResolvedRendererUrl(url: string | null): void {
    this.startupConfigState.setResolvedUrl(url);
  }

  isThirdPartyEnvironment(): boolean {
    return this.environmentContext.isThirdPartyEnvironment();
  }

  async isEnvironmentValid(): Promise<boolean> {
    const resolvedUrl = this.getResolvedRendererUrl();
    return !!resolvedUrl;
  }

  isExtensionMode(): boolean {
    return this.environmentContext.isExtensionMode();
  }

  getWindowSearch(): string {
    return this.environmentContext.getWindowSearch();
  }

  getWindowHash(): string {
    return this.environmentContext.getWindowHash();
  }

  getWindowHostname(): string {
    return this.environmentContext.getWindowHostname();
  }

  cleanSharedA2uiUrl(): void {
    return this.environmentContext.cleanSharedA2uiUrl();
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
