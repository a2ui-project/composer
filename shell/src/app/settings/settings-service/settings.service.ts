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

import {Injectable, Signal, computed, inject, signal} from '@angular/core';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {
  StartupConfigStateService,
  ApiKeyConfig,
  RendererConfig,
} from '../../shell/startup-resolution/state/startup-config-state.service';
import {AppConfigProvider} from '../app-config-provider/app-config-provider';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {ApiKeyAction, UsageTrackingService} from '../../usage-tracking/usage-tracking.service';

/**
 * Represents an available API key option from static config or custom storage.
 */
export declare interface ApiKeyOption {
  id: string;
  name: string;
  key: string;
  readOnly: boolean;
}

/**
 * Represents a custom renderer entry stored in LocalStorage.
 */
export declare interface CustomRendererEntry {
  id: string;
  name: string;
  rendererUrl: string;
}

/**
 * Represents a combined renderer option from static config or custom storage.
 */
export declare interface RendererOption extends CustomRendererEntry {
  readOnly: boolean;
}

/**
 * Facade service for settings configuration profile selection and persistence.
 * Coordinates profile state signals with startup resolution, local storage,
 * and secure credential storage layers.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly startupResolution = inject(StartupResolution);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);
  private readonly usageTrackingService = inject(UsageTrackingService);

  readonly renderers: Signal<Record<string, RendererConfig>> = computed(() =>
    this.startupResolution.renderers(),
  );

  readonly selectedRendererId: Signal<string | null> = computed(() =>
    this.startupConfigState.selectedRendererId(),
  );

  readonly activeRenderer: Signal<RendererConfig | null> = computed(() =>
    this.startupConfigState.activeRenderer(),
  );

  /**
   * Switches the active configuration renderer selection.
   *
   * @param rendererId The selected renderer ID string, or null to revert to Custom/Default.
   */
  async selectRenderer(rendererId: string | null): Promise<boolean> {
    const fromRendererId = this.selectedRendererId();
    const isAllowed = await this.startupResolution.setSelectedRendererId(rendererId);
    if (!isAllowed) {
      return false;
    }

    this.usageTrackingService.trackRendererSwitch({
      fromRendererId,
      toRendererId: rendererId || '',
    });

    if (rendererId) {
      this.localStorageInteractions.setItem(LocalStorageKey.SELECTED_RENDERER, rendererId);
    } else {
      this.localStorageInteractions.removeItem(LocalStorageKey.SELECTED_RENDERER);
    }

    const active = this.activeRenderer();

    if (active?.rendererUrl) {
      this.configProvider.setRendererUrl(active.rendererUrl);
    } else {
      this.configProvider.setRendererUrl('');
    }

    const apiKey = typeof active?.apiKey === 'string' ? active.apiKey.trim() : '';

    if (apiKey) {
      this.configProvider.setApiKeyFromConfig(apiKey);
    } else {
      try {
        await this.syncEffectiveApiKeyToConfigProvider();
      } catch (err) {
        console.warn('Failed to resolve effective API key during renderer selection:', err);
      }
    }

    return true;
  }

  private readonly _selectedApiKeyId = signal<string | null>(
    this.localStorageInteractions.getItem(LocalStorageKey.SELECTED_API_KEY) || null,
  );

  readonly selectedApiKeyId: Signal<string | null> = computed(() => {
    const id = this._selectedApiKeyId();
    if (id) return id;
    const staticKeys = this.startupConfigState.apiKeys() || {};
    return staticKeys['default'] !== undefined ? 'default' : null;
  });

  private readonly _effectiveApiKey = signal<string>('');

  readonly effectiveApiKey: Signal<string> = this._effectiveApiKey.asReadonly();

  private getStaticApiKeys(): Record<string, ApiKeyConfig> {
    return this.startupConfigState.apiKeys() || {};
  }

  /**
   * Returns a merged list of static API keys from config.json.apiKeys (read-only)
   * and custom API keys stored in SecureCredentialsStorage (IndexedDB).
   */
  async getAvailableApiKeys(): Promise<ApiKeyOption[]> {
    const staticKeysObj = this.getStaticApiKeys();
    const staticKeys: ApiKeyOption[] = Object.entries(staticKeysObj).map(([id, config]) => ({
      id,
      name: config.displayName || id,
      key: config.apiKey || '',
      readOnly: true,
    }));
    const customKeysRaw = await this.secureCredentialsStorage.getCustomApiKeys();
    const customKeys: ApiKeyOption[] = customKeysRaw
      .filter(item => !Object.prototype.hasOwnProperty.call(staticKeysObj, item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        key: item.key,
        readOnly: false,
      }));
    return [...staticKeys, ...customKeys];
  }

  /**
   * Selects an API key by ID and updates persistence.
   */
  async selectApiKey(apiKeyId: string | null): Promise<void> {
    this.usageTrackingService.trackApiKeyUpdate({
      action: ApiKeyAction.SELECT,
    });

    if (apiKeyId) {
      this.localStorageInteractions.setItem(LocalStorageKey.SELECTED_API_KEY, apiKeyId);
    } else {
      this.localStorageInteractions.removeItem(LocalStorageKey.SELECTED_API_KEY);
    }
    this._selectedApiKeyId.set(apiKeyId);
    await this.syncEffectiveApiKeyToConfigProvider();
  }

  /**
   * Resolves the effective API key based on selected ID or fallback rules.
   */
  async getEffectiveApiKey(): Promise<string> {
    const selectedId = this.selectedApiKeyId();
    const staticKeys = this.getStaticApiKeys();

    if (selectedId && staticKeys[selectedId]) {
      const val = staticKeys[selectedId].apiKey || '';
      this._effectiveApiKey.set(val);
      return val;
    }
    if (selectedId) {
      const custom = await this.secureCredentialsStorage.getCustomApiKey(selectedId);
      if (custom) {
        this._effectiveApiKey.set(custom.key);
        return custom.key;
      }
      this._effectiveApiKey.set('');
      return '';
    }

    const customKeys = await this.secureCredentialsStorage.getCustomApiKeys();
    const defaultCustom = customKeys.find(k => k.id === 'default') || customKeys[0];
    if (defaultCustom) {
      const val = defaultCustom.key;
      this._effectiveApiKey.set(val);
      return val;
    }

    this._effectiveApiKey.set('');
    return '';
  }

  /**
   * Persists a custom API key to SecureCredentialsStorage.
   */
  async saveCustomApiKey(id: string, name: string, key: string): Promise<void> {
    const staticKeysObj = this.getStaticApiKeys();
    if (Object.prototype.hasOwnProperty.call(staticKeysObj, id)) {
      throw new Error(
        `Cannot save custom API key with ID "${id}": collides with a static configuration key.`,
      );
    }
    this.usageTrackingService.trackApiKeyUpdate({
      action: ApiKeyAction.ADD,
    });
    await this.secureCredentialsStorage.saveCustomApiKey(id, name, key);
    await this.syncEffectiveApiKeyToConfigProvider();
  }

  /**
   * Deletes a custom API key from SecureCredentialsStorage.
   */
  async deleteCustomApiKey(id: string): Promise<void> {
    this.usageTrackingService.trackApiKeyUpdate({
      action: ApiKeyAction.DELETE,
    });
    await this.secureCredentialsStorage.deleteCustomApiKey(id);
    if (this._selectedApiKeyId() === id) {
      await this.selectApiKey(null);
    } else {
      await this.syncEffectiveApiKeyToConfigProvider();
    }
  }

  /**
   * Synchronizes the effective API key Signal with the AppConfigProvider.
   */
  private async syncEffectiveApiKeyToConfigProvider(): Promise<string> {
    const effectiveKey = await this.getEffectiveApiKey();
    const apiKeyId = this._selectedApiKeyId();
    const staticKeys = this.getStaticApiKeys();
    if (apiKeyId && staticKeys[apiKeyId]) {
      this.configProvider.setApiKeyFromConfig(effectiveKey);
    } else if (!apiKeyId && staticKeys['default']) {
      this.configProvider.setApiKeyFromConfig(effectiveKey);
    } else {
      this.configProvider.setRuntimeApiKey(effectiveKey);
    }
    return effectiveKey;
  }

  private getStaticRenderersMap(): Record<string, RendererConfig> {
    return this.startupConfigState.renderers() || {};
  }

  /**
   * Returns a list of custom renderers stored in LocalStorage.
   * Filters out null/non-object items or items with an empty/whitespace ID,
   * and handles malformed JSON gracefully by returning an empty array.
   */
  private getCustomRenderers(): CustomRendererEntry[] {
    const raw = this.localStorageInteractions.getItem(LocalStorageKey.CUSTOM_RENDERERS);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(item => item && typeof item === 'object' && Boolean(String(item.id || '').trim()))
          .map(item => ({
            id: String(item?.id || '').trim(),
            name: String(item?.name || ''),
            rendererUrl: String(item?.rendererUrl || ''),
          }));
      }
      return [];
    } catch (e) {
      console.warn('Failed to parse custom renderers from LocalStorage:', e);
      return [];
    }
  }

  /**
   * Returns a combined list of static renderers from config.json.renderers (readOnly: true)
   * and custom renderers from LocalStorage (readOnly: false).
   * Automatically namespaces display labels as "[name] (local)" when a custom renderer
   * shares a name with a static configuration renderer.
   */
  getRenderers(): RendererOption[] {
    const staticMap = this.getStaticRenderersMap();
    const staticRenderers: RendererOption[] = Object.entries(staticMap).map(([id, config]) => ({
      id,
      name: config?.displayName || config?.name || id,
      rendererUrl: config?.rendererUrl || '',
      readOnly: true,
    }));

    const staticNames = new Set(staticRenderers.map(r => r.name));
    const customRenderers: RendererOption[] = this.getCustomRenderers()
      .filter(item => !Object.prototype.hasOwnProperty.call(staticMap, item.id))
      .map(item => ({
        id: item.id,
        name: staticNames.has(item.name) ? `${item.name} (local)` : item.name,
        rendererUrl: item.rendererUrl,
        readOnly: false,
      }));

    return [...staticRenderers, ...customRenderers];
  }

  /**
   * Persists a custom renderer to LocalStorage under CUSTOM_RENDERERS key.
   * Trims id, name, and rendererUrl. Throws an error if any field is empty,
   * if rendererUrl does not start with http:// or https://, or if the ID
   * collides with a static configuration renderer ID.
   */
  saveCustomRenderer(renderer: CustomRendererEntry): void {
    const id = (renderer.id || '').trim();
    const name = (renderer.name || '').trim();
    const rendererUrl = (renderer.rendererUrl || '').trim();

    if (!id || !name || !rendererUrl) {
      throw new Error('Custom renderer id, name, and rendererUrl must not be empty.');
    }
    if (!/^https?:\/\//i.test(rendererUrl)) {
      throw new Error('Custom renderer URL must start with http:// or https://');
    }

    const staticMap = this.getStaticRenderersMap();
    if (Object.prototype.hasOwnProperty.call(staticMap, id)) {
      throw new Error(
        `Cannot save custom renderer with ID "${id}": collides with a static configuration renderer.`,
      );
    }
    const list = this.getCustomRenderers();
    const existingIdx = list.findIndex(item => item.id === id);
    if (existingIdx >= 0) {
      list[existingIdx] = {
        id,
        name,
        rendererUrl,
      };
      this.usageTrackingService.trackRendererEdit({rendererId: id});
    } else {
      list.push({
        id,
        name,
        rendererUrl,
      });
      this.usageTrackingService.trackRendererAdd({rendererId: id});
    }
    this.localStorageInteractions.setItem(LocalStorageKey.CUSTOM_RENDERERS, JSON.stringify(list));

    // Keep StartupConfigStateService in sync so activeRenderer can resolve it
    const updatedRenderers = {...this.startupConfigState.renderers()};
    updatedRenderers[id] = {id, name, rendererUrl};
    this.startupConfigState.setRenderers(updatedRenderers);
  }

  /**
   * Deletes a custom renderer by ID from LocalStorage without reloading the window.
   * Resets active renderer selection to null if deleting the currently selected custom renderer.
   */
  deleteCustomRenderer(id: string): void {
    this.usageTrackingService.trackRendererDelete({rendererId: id});
    const list = this.getCustomRenderers().filter(item => item.id !== id);
    this.localStorageInteractions.setItem(LocalStorageKey.CUSTOM_RENDERERS, JSON.stringify(list));

    const updatedRenderers = {...this.startupConfigState.renderers()};
    delete updatedRenderers[id];
    this.startupConfigState.setRenderers(updatedRenderers);

    if (this.selectedRendererId() === id) {
      this.localStorageInteractions.removeItem(LocalStorageKey.SELECTED_RENDERER);
      void this.selectRenderer(null);
    }
  }
}
