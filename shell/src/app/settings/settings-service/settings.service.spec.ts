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

import {TestBed} from '@angular/core/testing';
import {signal, WritableSignal} from '@angular/core';
import {SettingsService} from './settings.service';
import {StartupResolution, RendererConfig} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../app-config-provider/app-config-provider';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockStartupResolution: {
    renderers: WritableSignal<Record<string, RendererConfig>>;
    selectedRendererId: WritableSignal<string | null>;
    activeRenderer: WritableSignal<RendererConfig | null>;
    apiKeys: WritableSignal<Record<string, string>>;
    setSelectedRendererId: ReturnType<typeof vi.fn>;
  };
  let mockConfigProvider: {
    setRendererUrl: ReturnType<typeof vi.fn>;
    setApiKeyFromConfig: ReturnType<typeof vi.fn>;
    setRuntimeApiKey: ReturnType<typeof vi.fn>;
    setGeminiApiKey: ReturnType<typeof vi.fn>;
  };
  let mockSecureStorage: {
    getCredential: ReturnType<typeof vi.fn>;
    getCustomApiKeys: ReturnType<typeof vi.fn>;
    getCustomApiKey: ReturnType<typeof vi.fn>;
    saveCustomApiKey: ReturnType<typeof vi.fn>;
    deleteCustomApiKey: ReturnType<typeof vi.fn>;
    deleteCredential: ReturnType<typeof vi.fn>;
  };
  let mockLocalStorage: LocalStorageInteractions;

  const sampleRenderers: Record<string, RendererConfig> = {
    dev: {
      displayName: 'Development',
      rendererUrl: 'http://localhost:3000',
      apiKey: '  dev-api-key  ',
      allowOverrides: true,
    },
    locked: {
      displayName: 'Locked Profile',
      rendererUrl: 'http://locked-server.com',
      allowOverrides: false,
    },
  };

  beforeEach(() => {
    localStorage.clear();

    mockStartupResolution = {
      renderers: signal(sampleRenderers),
      selectedRendererId: signal(null),
      activeRenderer: signal(null),
      apiKeys: signal({}),
      setSelectedRendererId: vi.fn((id: string | null) => {
        mockStartupResolution.selectedRendererId.set(id);
        mockStartupResolution.activeRenderer.set(id ? sampleRenderers[id] || null : null);
      }),
    };

    mockConfigProvider = {
      setRendererUrl: vi.fn(),
      setApiKeyFromConfig: vi.fn(),
      setRuntimeApiKey: vi.fn(),
      setGeminiApiKey: vi.fn().mockResolvedValue(undefined),
    };

    mockSecureStorage = {
      getCredential: vi.fn().mockResolvedValue('personal-indexeddb-key'),
      getCustomApiKeys: vi.fn().mockResolvedValue([]),
      getCustomApiKey: vi.fn().mockResolvedValue(null),
      saveCustomApiKey: vi.fn().mockResolvedValue(undefined),
      deleteCustomApiKey: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        LocalStorageInteractions,
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: SecureCredentialsStorage, useValue: mockSecureStorage},
      ],
    });

    service = TestBed.inject(SettingsService);
    mockLocalStorage = TestBed.inject(LocalStorageInteractions);
  });

  it('creates the settings service instance', () => {
    expect(service).toBeTruthy();
  });

  it('exposes signals delegating to startup resolution', () => {
    expect(service.renderers()).toEqual(sampleRenderers);
    expect(service.selectedRendererId()).toBeNull();
    expect(service.activeRenderer()).toBeNull();
  });

  it('computes allowOverrides as true when active renderer is null or allowOverrides is omitted', () => {
    expect(service.allowOverrides()).toBe(true);

    mockStartupResolution.activeRenderer.set({
      rendererUrl: 'http://example.com',
    });
    expect(service.allowOverrides()).toBe(true);
  });

  it('computes allowOverrides as false when active renderer disallows overrides', () => {
    mockStartupResolution.activeRenderer.set({
      allowOverrides: false,
    });
    expect(service.allowOverrides()).toBe(false);
  });

  it('persists selected renderer ID to local storage and updates startup resolution when selecting profile', async () => {
    await service.selectRenderer('dev');

    expect(mockLocalStorage.getItem(LocalStorageKey.SELECTED_RENDERER)).toBe('dev');
    expect(mockStartupResolution.setSelectedRendererId).toHaveBeenCalledWith('dev');
  });

  it('removes selected renderer ID from local storage when selected renderer ID is null', async () => {
    mockLocalStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'dev');

    await service.selectRenderer(null);

    expect(mockLocalStorage.getItem(LocalStorageKey.SELECTED_RENDERER)).toBeNull();
    expect(mockStartupResolution.setSelectedRendererId).toHaveBeenCalledWith(null);
  });

  it('applies rendererUrl and trimmed config apiKey when selected renderer contains both', async () => {
    await service.selectRenderer('dev');

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://localhost:3000');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('dev-api-key');
  });

  it('resets config key state and sets runtime key when selected renderer lacks apiKey', async () => {
    await service.selectRenderer('locked');

    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('');
  });

  it('clears rendererUrl and runtime API key when profile is null', async () => {
    await service.selectRenderer(null);

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('');
  });

  it('clears rendererUrl to "" when selecting null renderer', async () => {
    await service.selectRenderer('dev');
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://localhost:3000');

    await service.selectRenderer(null);
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('');
  });

  it('resets allowOverrides to true when selecting null after a locked renderer', async () => {
    mockStartupResolution.activeRenderer.set(sampleRenderers['locked']);
    expect(service.allowOverrides()).toBe(false);

    await service.selectRenderer(null);

    expect(service.allowOverrides()).toBe(true);
  });

  it('trims apiKey and handles whitespace-only or non-string apiKey when selecting profile', async () => {
    const customRenderers: Record<string, RendererConfig> = {
      whitespaceKey: {
        displayName: 'Whitespace Key',
        rendererUrl: 'http://whitespace.com',
        apiKey: '  padded-key  ',
      },
      blankKey: {
        displayName: 'Blank Key',
        rendererUrl: 'http://blank.com',
        apiKey: '   ',
      },
      nonStringKey: {
        displayName: 'Non String Key',
        rendererUrl: 'http://nonstring.com',
        apiKey: 12345 as unknown as string,
      },
    };
    mockStartupResolution.renderers.set(customRenderers);
    mockStartupResolution.setSelectedRendererId.mockImplementation((id: string | null) => {
      mockStartupResolution.selectedRendererId.set(id);
      mockStartupResolution.activeRenderer.set(id ? customRenderers[id] || null : null);
    });

    await service.selectRenderer('whitespaceKey');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('padded-key');

    await service.selectRenderer('blankKey');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');

    mockConfigProvider.setApiKeyFromConfig.mockClear();

    await service.selectRenderer('nonStringKey');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
  });

  it('handles error gracefully when secureCredentialsStorage throws in selectProfile', async () => {
    mockSecureStorage.getCustomApiKeys.mockRejectedValue(new Error('Secure storage error'));
    const warnSpy = vi.spyOn(console, 'warn');

    await service.selectRenderer('locked');

    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to resolve effective API key during renderer selection:',
      expect.any(Error),
    );
  });

  it('restores selectedProfileId signal from saved local storage renderer key upon startup resolution', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        StartupResolution,
        LocalStorageInteractions,
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: SecureCredentialsStorage, useValue: mockSecureStorage},
        {provide: IS_1P_AUTH_ENABLED, useValue: true},
      ],
    });

    const localService = TestBed.inject(SettingsService);
    const startupRes = TestBed.inject(StartupResolution);
    const localStorageInteractions = TestBed.inject(LocalStorageInteractions);

    localStorageInteractions.setItem(LocalStorageKey.SELECTED_RENDERER, 'dev');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          renderers: {
            dev: {
              rendererUrl: 'http://dev-server:3000',
            },
          },
        }),
      ),
    );

    await startupRes.resolveStartupConfiguration();

    expect(localService.selectedRendererId()).toBe('dev');
  });

  describe('API Key Management and Fallback', () => {
    it('getAvailableApiKeys returns a merged list of static API keys from config.json.apiKeys (read-only) and custom API keys from SecureCredentialsStorage', async () => {
      mockStartupResolution.apiKeys.set({
        default: 'static-default',
        prod: 'static-prod',
      });
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-1', name: 'My Custom Key', key: 'custom-secret-1'},
      ]);

      const available = await service.getAvailableApiKeys();

      expect(available).toEqual([
        {id: 'default', name: 'default', key: 'static-default', readOnly: true},
        {id: 'prod', name: 'prod', key: 'static-prod', readOnly: true},
        {id: 'custom-1', name: 'My Custom Key', key: 'custom-secret-1', readOnly: false},
      ]);
    });

    it('when an API key ID is selected (selectApiKey(id)), getEffectiveApiKey resolves the value from config.json.apiKeys[id] or from SecureCredentialsStorage', async () => {
      mockStartupResolution.apiKeys.set({
        prod: 'static-prod-key',
      });
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-1', name: 'Custom One', key: 'custom-key-value'},
      ]);

      await service.selectApiKey('prod');
      expect(await service.getEffectiveApiKey()).toBe('static-prod-key');
      expect(service.selectedApiKeyId$()).toBe('prod');

      await service.selectApiKey('custom-1');
      expect(await service.getEffectiveApiKey()).toBe('custom-key-value');
      expect(service.selectedApiKeyId$()).toBe('custom-1');
    });

    it('if no specific API key ID is selected, getEffectiveApiKey falls back to any default custom API key stored in SecureCredentialsStorage', async () => {
      mockStartupResolution.apiKeys.set({});
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([]);

      await service.selectApiKey(null);
      expect(await service.getEffectiveApiKey()).toBe('');

      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'default', name: 'Default Custom', key: 'default-custom-key'},
      ]);
      expect(await service.getEffectiveApiKey()).toBe('default-custom-key');
    });

    it('saving a custom API key via saveCustomApiKey(id, name, key) persists it in SecureCredentialsStorage without modifying config.json static entries', async () => {
      mockStartupResolution.apiKeys.set({
        default: 'static-default-key',
      });

      await service.saveCustomApiKey('my-custom', 'My Custom', 'secret-val');

      expect(mockSecureStorage.saveCustomApiKey).toHaveBeenCalledWith(
        'my-custom',
        'My Custom',
        'secret-val',
      );
      expect(mockStartupResolution.apiKeys()).toEqual({
        default: 'static-default-key',
      });
    });

    it('deleting a custom API key (deleteCustomApiKey(id)) removes it from SecureCredentialsStorage; if it was the selected key, selectedApiKeyId$ resets to null', async () => {
      mockStartupResolution.apiKeys.set({});
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-to-delete', name: 'To Delete', key: 'to-delete-key'},
      ]);
      await service.selectApiKey('custom-to-delete');
      expect(service.selectedApiKeyId$()).toBe('custom-to-delete');

      await service.deleteCustomApiKey('custom-to-delete');

      expect(mockSecureStorage.deleteCustomApiKey).toHaveBeenCalledWith('custom-to-delete');
      expect(service.selectedApiKeyId$()).toBeNull();
    });

    it('deduplicates custom API keys whose IDs collide with static configuration key IDs in getAvailableApiKeys()', async () => {
      mockStartupResolution.apiKeys.set({
        default: 'static-default',
        prod: 'static-prod',
      });
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'default', name: 'Colliding Default', key: 'custom-default-key'},
        {id: 'custom-1', name: 'My Custom Key', key: 'custom-secret-1'},
      ]);

      const available = await service.getAvailableApiKeys();

      expect(available).toEqual([
        {id: 'default', name: 'default', key: 'static-default', readOnly: true},
        {id: 'prod', name: 'prod', key: 'static-prod', readOnly: true},
        {id: 'custom-1', name: 'My Custom Key', key: 'custom-secret-1', readOnly: false},
      ]);
    });

    it('synchronizes configProvider when saving the currently selected custom API key', async () => {
      await service.selectApiKey('custom-1');
      mockSecureStorage.getCustomApiKey.mockResolvedValue({
        id: 'custom-1',
        name: 'Updated Custom',
        key: 'updated-key',
      });

      await service.saveCustomApiKey('custom-1', 'Updated Custom', 'updated-key');

      expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('updated-key');
    });

    it('synchronizes configProvider when saving a custom API key while selectedApiKeyId$ is null (fallback)', async () => {
      await service.selectApiKey(null);
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-1', name: 'My Custom', key: 'new-fallback-key'},
      ]);

      await service.saveCustomApiKey('custom-1', 'My Custom', 'new-fallback-key');

      expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('new-fallback-key');
    });

    it('synchronizes configProvider when deleting a custom API key while selectedApiKeyId$ is null (fallback)', async () => {
      await service.selectApiKey(null);
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-2', name: 'Remaining Custom', key: 'remaining-key'},
      ]);

      await service.deleteCustomApiKey('custom-1');

      expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('remaining-key');
    });
  });
});
