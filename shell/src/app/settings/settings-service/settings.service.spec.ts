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
import {
  ApiKeyConfig,
  RendererConfig,
  StartupResolution,
} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../app-config-provider/app-config-provider';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockStartupResolution: {
    renderers: WritableSignal<Record<string, RendererConfig>>;
    selectedRendererId: WritableSignal<string | null>;
    activeRenderer: WritableSignal<RendererConfig | null>;
    apiKeys: WritableSignal<Record<string, ApiKeyConfig>>;
    setSelectedRendererId: ReturnType<typeof vi.fn>;
    isThirdPartyEnvironment: ReturnType<typeof vi.fn>;
  };
  let mockConfigProvider: {
    setRendererUrl: ReturnType<typeof vi.fn>;
    setApiKeyFromConfig: ReturnType<typeof vi.fn>;
    setRuntimeApiKey: ReturnType<typeof vi.fn>;
    setGeminiApiKey: ReturnType<typeof vi.fn>;
    isApiKeyProvidedByConfig: ReturnType<typeof vi.fn>;
    purgeGeminiApiKey: ReturnType<typeof vi.fn>;
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
    },
    locked: {
      displayName: 'Locked Profile',
      rendererUrl: 'http://locked-server.com',
    },
  };

  beforeEach(() => {
    localStorage.clear();

    mockStartupResolution = {
      renderers: signal(sampleRenderers),
      selectedRendererId: signal(null),
      activeRenderer: signal(null),
      apiKeys: signal({}),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(true),
      setSelectedRendererId: vi.fn((id: string | null) => {
        mockStartupResolution.selectedRendererId.set(id);
        mockStartupResolution.activeRenderer.set(id ? sampleRenderers[id] || null : null);
        return Promise.resolve(true);
      }),
    };

    mockConfigProvider = {
      setRendererUrl: vi.fn(),
      setApiKeyFromConfig: vi.fn(),
      setRuntimeApiKey: vi.fn(),
      setGeminiApiKey: vi.fn().mockResolvedValue(undefined),
      isApiKeyProvidedByConfig: vi.fn().mockReturnValue(false),
      purgeGeminiApiKey: vi.fn().mockResolvedValue(undefined),
    };

    mockSecureStorage = {
      getCredential: vi.fn().mockResolvedValue('personal-indexeddb-key'),
      getCustomApiKeys: vi.fn().mockResolvedValue([]),
      getCustomApiKey: vi.fn().mockImplementation(async (id: string) => {
        const list = await mockSecureStorage.getCustomApiKeys();
        return list.find((item: {id: string}) => item.id === id) || null;
      }),
      saveCustomApiKey: vi.fn().mockResolvedValue(undefined),
      deleteCustomApiKey: vi.fn().mockResolvedValue(undefined),
      deleteCredential: vi.fn().mockResolvedValue(undefined),
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
      return Promise.resolve(true);
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
        default: {apiKey: 'static-default'},
        prod: {apiKey: 'static-prod'},
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

    it('extracts key and displayName for object schema apiKeys in getAvailableApiKeys', async () => {
      mockStartupResolution.apiKeys.set({
        default: {apiKey: 'AIzaSyDefault', displayName: 'Gemini Enterprise'},
        prod: {apiKey: 'AIzaSyProd', displayName: 'Production Key'},
      });
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([]);

      const available = await service.getAvailableApiKeys();

      expect(available).toEqual([
        {id: 'default', name: 'Gemini Enterprise', key: 'AIzaSyDefault', readOnly: true},
        {id: 'prod', name: 'Production Key', key: 'AIzaSyProd', readOnly: true},
      ]);
    });

    it('computes "default" API key on startup when no API key is saved in LocalStorage and default exists in static config, without writing to LocalStorage', async () => {
      mockStartupResolution.apiKeys.set({});
      await service.selectApiKey(null);

      mockStartupResolution.apiKeys.set({
        default: {apiKey: 'AIzaSyDefault', displayName: 'Gemini Enterprise'},
      });

      const effective = await service.getEffectiveApiKey();

      expect(effective).toBe('AIzaSyDefault');
      expect(service.selectedApiKeyId()).toBe('default');
      expect(mockLocalStorage.getItem(LocalStorageKey.SELECTED_API_KEY)).toBeNull();
    });

    it('resolves string value from object schema static key when selectedApiKeyId is set', async () => {
      mockStartupResolution.apiKeys.set({
        custom_static: {apiKey: 'AIzaSyObjVal', displayName: 'Object Static'},
      });

      await service.selectApiKey('custom_static');
      expect(await service.getEffectiveApiKey()).toBe('AIzaSyObjVal');
    });

    it('when an API key ID is selected (selectApiKey(id)), getEffectiveApiKey resolves the value from config.json.apiKeys[id] or from SecureCredentialsStorage', async () => {
      mockStartupResolution.apiKeys.set({
        prod: {apiKey: 'static-prod-key'},
      });
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-1', name: 'Custom One', key: 'custom-key-value'},
      ]);

      await service.selectApiKey('prod');
      expect(await service.getEffectiveApiKey()).toBe('static-prod-key');
      expect(service.selectedApiKeyId()).toBe('prod');

      await service.selectApiKey('custom-1');
      expect(await service.getEffectiveApiKey()).toBe('custom-key-value');
      expect(service.selectedApiKeyId()).toBe('custom-1');
    });

    it('returns empty string and sets effectiveApiKey to empty string when explicit selectedId cannot be resolved', async () => {
      mockStartupResolution.apiKeys.set({
        default: {apiKey: 'static-default-key'},
      });
      mockSecureStorage.getCustomApiKey.mockResolvedValue(null);

      await service.selectApiKey('non-existent-key-id');

      expect(await service.getEffectiveApiKey()).toBe('');
      expect(service.effectiveApiKey()).toBe('');
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
        default: {apiKey: 'static-default-key'},
      });

      await service.saveCustomApiKey('my-custom', 'My Custom', 'secret-val');

      expect(mockSecureStorage.saveCustomApiKey).toHaveBeenCalledWith(
        'my-custom',
        'My Custom',
        'secret-val',
      );
      expect(mockStartupResolution.apiKeys()).toEqual({
        default: {apiKey: 'static-default-key'},
      });
    });

    it('deleting a custom API key (deleteCustomApiKey(id)) removes it from SecureCredentialsStorage; if it was the selected key, selectedApiKeyId resets to null', async () => {
      mockStartupResolution.apiKeys.set({});
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-to-delete', name: 'To Delete', key: 'to-delete-key'},
      ]);
      await service.selectApiKey('custom-to-delete');
      expect(service.selectedApiKeyId()).toBe('custom-to-delete');

      await service.deleteCustomApiKey('custom-to-delete');

      expect(mockSecureStorage.deleteCustomApiKey).toHaveBeenCalledWith('custom-to-delete');
      expect(service.selectedApiKeyId()).toBeNull();
    });

    it('deduplicates custom API keys whose IDs collide with static configuration key IDs in getAvailableApiKeys()', async () => {
      mockStartupResolution.apiKeys.set({
        default: {apiKey: 'static-default'},
        prod: {apiKey: 'static-prod'},
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

    it('synchronizes configProvider when saving a custom API key while selectedApiKeyId is null (fallback)', async () => {
      await service.selectApiKey(null);
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-1', name: 'My Custom', key: 'new-fallback-key'},
      ]);

      await service.saveCustomApiKey('custom-1', 'My Custom', 'new-fallback-key');

      expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('new-fallback-key');
    });

    it('synchronizes configProvider when deleting a custom API key while selectedApiKeyId is null (fallback)', async () => {
      await service.selectApiKey(null);
      mockSecureStorage.getCustomApiKeys.mockResolvedValue([
        {id: 'custom-2', name: 'Remaining Custom', key: 'remaining-key'},
      ]);

      await service.deleteCustomApiKey('custom-1');

      expect(mockConfigProvider.setRuntimeApiKey).toHaveBeenCalledWith('remaining-key');
    });
  });

  describe('Custom Renderers Management', () => {
    it('LocalStorageKey.CUSTOM_RENDERERS equals "a2ui_composer_custom_renderers" and SELECTED_RENDERER equals "a2ui_composer_selected_renderer"', () => {
      expect(LocalStorageKey.CUSTOM_RENDERERS).toBe('a2ui_composer_custom_renderers');
      expect(LocalStorageKey.SELECTED_RENDERER).toBe('a2ui_composer_selected_renderer');
    });

    it('getRenderers() deserializes custom renderer objects ({ id, name, rendererUrl }) from LocalStorage and handles malformed JSON gracefully', () => {
      mockStartupResolution.renderers.set({});
      expect(service.getRenderers()).toEqual([]);

      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'c-1', name: 'Custom One', rendererUrl: 'http://custom-1.com'},
          {id: 'c-2', name: 'Custom Two', rendererUrl: 'http://custom-2.com'},
        ]),
      );
      expect(service.getRenderers()).toEqual([
        {
          id: 'c-1',
          name: 'Custom One',
          rendererUrl: 'http://custom-1.com',
          readOnly: false,
        },
        {
          id: 'c-2',
          name: 'Custom Two',
          rendererUrl: 'http://custom-2.com',
          readOnly: false,
        },
      ]);

      mockLocalStorage.setItem(LocalStorageKey.CUSTOM_RENDERERS, '{malformed-json');
      expect(service.getRenderers()).toEqual([]);

      mockLocalStorage.setItem(LocalStorageKey.CUSTOM_RENDERERS, '"not-an-array"');
      expect(service.getRenderers()).toEqual([]);
    });

    it('defensively handles undefined static renderer config entries using optional chaining', () => {
      mockStartupResolution.renderers.set({
        invalid: undefined as unknown as RendererConfig,
      });
      expect(service.getRenderers()).toEqual([
        {
          id: 'invalid',
          name: 'invalid',
          rendererUrl: '',
          readOnly: true,
        },
      ]);
    });

    it('getRenderers() merges static renderers from config.json.renderers with LocalStorage custom renderers', () => {
      mockStartupResolution.renderers.set({
        dev: {
          displayName: 'Development',
          rendererUrl: 'http://dev.com',
        },
        prod: {
          displayName: 'Production',
          rendererUrl: 'http://prod.com',
        },
      });
      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'custom-1', name: 'My Custom Renderer', rendererUrl: 'http://my-custom.com'},
        ]),
      );

      const combined = service.getRenderers();
      expect(combined).toEqual([
        {
          id: 'dev',
          name: 'Development',
          rendererUrl: 'http://dev.com',
          readOnly: true,
        },
        {
          id: 'prod',
          name: 'Production',
          rendererUrl: 'http://prod.com',
          readOnly: true,
        },
        {
          id: 'custom-1',
          name: 'My Custom Renderer',
          rendererUrl: 'http://my-custom.com',
          readOnly: false,
        },
      ]);
    });

    it('when a custom renderer has the same name as a static config.json renderer, its display label is namespaced as "[name] (local)" while preserving its unique ID', () => {
      mockStartupResolution.renderers.set({
        dev: {
          displayName: 'Dev Renderer',
          rendererUrl: 'http://dev.com',
        },
      });
      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'custom-dev', name: 'Dev Renderer', rendererUrl: 'http://custom-dev.com'},
          {id: 'custom-other', name: 'Unique Name', rendererUrl: 'http://unique.com'},
        ]),
      );

      const combined = service.getRenderers();
      expect(combined).toEqual([
        {
          id: 'dev',
          name: 'Dev Renderer',
          rendererUrl: 'http://dev.com',
          readOnly: true,
        },
        {
          id: 'custom-dev',
          name: 'Dev Renderer (local)',
          rendererUrl: 'http://custom-dev.com',
          readOnly: false,
        },
        {
          id: 'custom-other',
          name: 'Unique Name',
          rendererUrl: 'http://unique.com',
          readOnly: false,
        },
      ]);
    });

    it('saveCustomRenderer(renderer) adds or updates the entry in LocalStorage under "a2ui_composer_custom_renderers", and throws an error if renderer.id collides with a static read-only renderer ID from config.json.renderers', () => {
      mockStartupResolution.renderers.set({
        dev: {
          displayName: 'Development',
          rendererUrl: 'http://dev.com',
        },
      });

      expect(() =>
        service.saveCustomRenderer({
          id: 'dev',
          name: 'Colliding Name',
          rendererUrl: 'http://dev.com',
        }),
      ).toThrow(
        'Cannot save custom renderer with ID "dev": collides with a static configuration renderer.',
      );

      service.saveCustomRenderer({
        id: 'custom-1',
        name: 'Custom One',
        rendererUrl: 'http://c1.com',
      });

      expect(
        JSON.parse(mockLocalStorage.getItem(LocalStorageKey.CUSTOM_RENDERERS) || '[]'),
      ).toEqual([{id: 'custom-1', name: 'Custom One', rendererUrl: 'http://c1.com'}]);

      service.saveCustomRenderer({
        id: 'custom-1',
        name: 'Custom One Updated',
        rendererUrl: 'http://c1-updated.com',
      });

      expect(
        JSON.parse(mockLocalStorage.getItem(LocalStorageKey.CUSTOM_RENDERERS) || '[]'),
      ).toEqual([
        {id: 'custom-1', name: 'Custom One Updated', rendererUrl: 'http://c1-updated.com'},
      ]);
    });

    it('deleteCustomRenderer(id) removes the target renderer from "a2ui_composer_custom_renderers" without reloading the window', () => {
      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'custom-1', name: 'Custom One', rendererUrl: 'http://c1.com'},
          {id: 'custom-2', name: 'Custom Two', rendererUrl: 'http://c2.com'},
        ]),
      );

      service.deleteCustomRenderer('custom-1');

      expect(
        JSON.parse(mockLocalStorage.getItem(LocalStorageKey.CUSTOM_RENDERERS) || '[]'),
      ).toEqual([{id: 'custom-2', name: 'Custom Two', rendererUrl: 'http://c2.com'}]);
    });

    it('deduplicates custom renderers whose IDs collide with static configuration renderer IDs in getRenderers()', () => {
      mockStartupResolution.renderers.set({
        dev: {
          displayName: 'Development',
          rendererUrl: 'http://dev.com',
        },
      });
      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'dev', name: 'Colliding Dev', rendererUrl: 'http://colliding-dev.com'},
          {id: 'custom-1', name: 'Valid Custom', rendererUrl: 'http://valid.com'},
        ]),
      );

      const combined = service.getRenderers();
      expect(combined).toEqual([
        {
          id: 'dev',
          name: 'Development',
          rendererUrl: 'http://dev.com',
          readOnly: true,
        },
        {
          id: 'custom-1',
          name: 'Valid Custom',
          rendererUrl: 'http://valid.com',
          readOnly: false,
        },
      ]);
    });

    it('getRenderers() ignores null or empty-id items in a LocalStorage array', () => {
      mockStartupResolution.renderers.set({});
      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          null,
          {id: '', name: 'Empty ID', rendererUrl: 'http://empty.com'},
          {id: '   ', name: 'Whitespace ID', rendererUrl: 'http://whitespace.com'},
          {id: 'valid-1', name: 'Valid One', rendererUrl: 'http://valid.com'},
        ]),
      );

      const renderers = service.getRenderers();
      expect(renderers).toEqual([
        {
          id: 'valid-1',
          name: 'Valid One',
          rendererUrl: 'http://valid.com',
          readOnly: false,
        },
      ]);
    });

    it('deleteCustomRenderer(id) resets selected renderer when deleting the currently active custom renderer', () => {
      mockLocalStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'custom-1', name: 'Custom One', rendererUrl: 'http://c1.com'},
          {id: 'custom-2', name: 'Custom Two', rendererUrl: 'http://c2.com'},
        ]),
      );
      mockStartupResolution.selectedRendererId.set('custom-1');
      mockLocalStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'custom-1');

      service.deleteCustomRenderer('custom-1');

      expect(mockLocalStorage.getItem(LocalStorageKey.SELECTED_RENDERER)).toBeNull();
      expect(mockStartupResolution.selectedRendererId()).toBeNull();
    });

    it('saveCustomRenderer() throws an error when saving an empty ID or a non-HTTP/HTTPS URL', () => {
      expect(() =>
        service.saveCustomRenderer({
          id: '',
          name: 'Empty Id',
          rendererUrl: 'http://example.com',
        }),
      ).toThrow('Custom renderer id, name, and rendererUrl must not be empty.');

      expect(() =>
        service.saveCustomRenderer({
          id: '   ',
          name: 'Whitespace Id',
          rendererUrl: 'http://example.com',
        }),
      ).toThrow('Custom renderer id, name, and rendererUrl must not be empty.');

      expect(() =>
        service.saveCustomRenderer({
          id: 'custom-1',
          name: '',
          rendererUrl: 'http://example.com',
        }),
      ).toThrow('Custom renderer id, name, and rendererUrl must not be empty.');

      expect(() =>
        service.saveCustomRenderer({
          id: 'custom-1',
          name: 'Custom One',
          rendererUrl: 'ftp://example.com',
        }),
      ).toThrow('Custom renderer URL must start with http:// or https://');

      expect(() =>
        service.saveCustomRenderer({
          id: 'custom-1',
          name: 'Custom One',
          rendererUrl: 'example.com',
        }),
      ).toThrow('Custom renderer URL must start with http:// or https://');
    });
  });
});
