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
import {RendererConfig, StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../app-config-provider/app-config-provider';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';

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
 * Facade service for settings configuration profile selection and persistence.
 * Coordinates profile state signals with startup resolution, local storage,
 * and secure credential storage layers.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly startupResolution = inject(StartupResolution);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);

  readonly renderers: Signal<Record<string, RendererConfig>> = computed(() =>
    this.startupResolution.renderers(),
  );

  readonly selectedRendererId: Signal<string | null> = computed(() =>
    this.startupResolution.selectedRendererId(),
  );

  readonly activeRenderer: Signal<RendererConfig | null> = computed(() =>
    this.startupResolution.activeRenderer(),
  );

  readonly allowOverrides: Signal<boolean> = computed(
    () => this.activeRenderer()?.allowOverrides ?? true,
  );

  /**
   * Switches the active configuration renderer selection.
   *
   * @param rendererId The selected renderer ID string, or null to revert to Custom/Default.
   */
  async selectRenderer(rendererId: string | null): Promise<void> {
    if (rendererId) {
      this.localStorageInteractions.setItem(LocalStorageKey.SELECTED_RENDERER, rendererId);
    } else {
      this.localStorageInteractions.removeItem(LocalStorageKey.SELECTED_RENDERER);
    }

    this.startupResolution.setSelectedRendererId(rendererId);

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
      this.configProvider.setApiKeyFromConfig('');
      try {
        await this.syncEffectiveApiKeyToConfigProvider();
      } catch (err) {
        console.warn('Failed to resolve effective API key during renderer selection:', err);
      }
    }
  }

  private readonly _selectedApiKeyId = signal<string | null>(
    this.localStorageInteractions.getItem(LocalStorageKey.SELECTED_API_KEY) || null,
  );

  readonly selectedApiKeyId$: Signal<string | null> = this._selectedApiKeyId.asReadonly();
  readonly selectedApiKeyId: Signal<string | null> = this._selectedApiKeyId.asReadonly();

  private readonly _effectiveApiKey = signal<string>('');

  readonly effectiveApiKey$: Signal<string> = this._effectiveApiKey.asReadonly();
  readonly effectiveApiKey: Signal<string> = this._effectiveApiKey.asReadonly();

  /**
   * Returns a merged list of static API keys from config.json.apiKeys (read-only)
   * and custom API keys stored in SecureCredentialsStorage (IndexedDB).
   */
  async getAvailableApiKeys(): Promise<ApiKeyOption[]> {
    const staticKeysObj = this.startupResolution.apiKeys() || {};
    const staticKeys: ApiKeyOption[] = Object.entries(staticKeysObj).map(([id, key]) => ({
      id,
      name: id,
      key,
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
    const selectedId = this.selectedApiKeyId$();
    const staticKeys = this.startupResolution.apiKeys() || {};

    if (selectedId) {
      if (typeof staticKeys[selectedId] === 'string') {
        const val = staticKeys[selectedId];
        this._effectiveApiKey.set(val);
        return val;
      }
      const custom = await this.secureCredentialsStorage.getCustomApiKey(selectedId);
      if (custom) {
        this._effectiveApiKey.set(custom.key);
        return custom.key;
      }
    }

    if (typeof staticKeys['default'] === 'string') {
      const val = staticKeys['default'];
      this._effectiveApiKey.set(val);
      return val;
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
    const staticKeysObj = this.startupResolution.apiKeys() || {};
    if (Object.prototype.hasOwnProperty.call(staticKeysObj, id)) {
      throw new Error(
        `Cannot save custom API key with ID "${id}": collides with a static configuration key.`,
      );
    }
    await this.secureCredentialsStorage.saveCustomApiKey(id, name, key);
    await this.syncEffectiveApiKeyToConfigProvider();
  }

  /**
   * Deletes a custom API key from SecureCredentialsStorage.
   */
  async deleteCustomApiKey(id: string): Promise<void> {
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
    const staticKeys = this.startupResolution.apiKeys() || {};
    if (apiKeyId && typeof staticKeys[apiKeyId] === 'string') {
      this.configProvider.setApiKeyFromConfig(effectiveKey);
    } else if (!apiKeyId && typeof staticKeys['default'] === 'string') {
      this.configProvider.setApiKeyFromConfig(effectiveKey);
    } else {
      this.configProvider.setRuntimeApiKey(effectiveKey);
    }
    return effectiveKey;
  }
}
