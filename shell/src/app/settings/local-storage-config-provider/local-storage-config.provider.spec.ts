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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';

import {EnvMode, AuthType, ThemePreference} from '../app-config-provider/app-config-provider';
import {LocalStorageAppConfigProvider} from './local-storage-config.provider';
import {EnvironmentContextService} from '../../shell/startup-resolution/state/environment-context.service';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {signal} from '@angular/core';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';

class MockSecureCredentialsStorage {
  private storage = new Map<string, string>();
  private customKeys: Array<{id: string; name: string; key: string}> = [];

  async getCredential(key: string): Promise<string | null> {
    const val = this.storage.get(key);
    return Promise.resolve(val !== undefined ? val : null);
  }

  async setCredential(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  async removeCredential(key: string): Promise<void> {
    this.storage.delete(key);
    return Promise.resolve();
  }

  async getCustomApiKeys(): Promise<Array<{id: string; name: string; key: string}>> {
    return Promise.resolve(this.customKeys);
  }

  async getCustomApiKey(id: string): Promise<{id: string; name: string; key: string} | null> {
    const found = this.customKeys.find(k => k.id === id);
    return Promise.resolve(found || null);
  }

  async saveCustomApiKey(id: string, name: string, key: string): Promise<void> {
    const existing = this.customKeys.findIndex(k => k.id === id);
    if (existing >= 0) {
      this.customKeys[existing] = {id, name, key};
    } else {
      this.customKeys.push({id, name, key});
    }
    return Promise.resolve();
  }

  async deleteCustomApiKey(id: string): Promise<void> {
    this.customKeys = this.customKeys.filter(k => k.id !== id);
    return Promise.resolve();
  }
}

describe('LocalStorageAppConfigProvider', () => {
  let mockEnvironmentContext: unknown;
  let mockStartupConfigState: unknown;
  let mockSecureStorage: MockSecureCredentialsStorage;

  beforeEach(() => {
    localStorage.clear();
    mockSecureStorage = new MockSecureCredentialsStorage();
    mockEnvironmentContext = {
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      getWindowHostname: vi.fn().mockReturnValue('localhost'),
      isExtensionMode: vi.fn().mockReturnValue(false),
    };
    mockStartupConfigState = {
      apiKeys: signal({}),
      renderers: signal({}),
      resolvedUrl: signal('https://default-renderer.com'),
      setResolvedUrl: vi.fn(),
    };
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function setupProvider(enable1PAuth = false): LocalStorageAppConfigProvider {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LocalStorageAppConfigProvider,
        LocalStorageInteractions,
        {provide: SecureCredentialsStorage, useValue: mockSecureStorage},
        {provide: EnvironmentContextService, useValue: mockEnvironmentContext},
        {provide: StartupConfigStateService, useValue: mockStartupConfigState},
        {provide: IS_1P_AUTH_ENABLED, useValue: enable1PAuth},
      ],
    });
    return TestBed.inject(LocalStorageAppConfigProvider);
  }

  it('ignores FORCE_1P when IS_1P_AUTH_ENABLED is false', () => {
    mockEnvironmentContext.isThirdPartyEnvironment.mockReturnValue(true);
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);
  });

  it('initializes forcedAuth with ONE_PARTY when FORCE_1P is true and IS_1P_AUTH_ENABLED is true', () => {
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const provider = setupProvider(true);
    expect(provider.authType()).toBe(AuthType.FIRST_PARTY);
  });

  it('initializes forcedAuth with THREE_PARTY when FORCE_3P is true and IS_1P_AUTH_ENABLED is true', () => {
    localStorage.setItem(LocalStorageKey.FORCE_3P, 'true');
    const provider = setupProvider(true);
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);
  });

  it('initializes forcedAuth with null when no force keys are present', () => {
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.FIRST_PARTY); // Fallback is 1P
  });

  it('initializes geminiApiKey with an empty string when stored API key is not present', async () => {
    const provider = setupProvider();
    await provider.initialize();
    expect(provider.geminiApiKey()).toBe('');
  });

  it('prioritizes resolved renderer URL from startup over stored renderer URL', () => {
    mockStartupConfigState.resolvedUrl.set('https://resolved-profile.com');
    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'https://stored-renderer.com');
    const provider = setupProvider();
    expect(provider.rendererUrl()).toBe('https://resolved-profile.com');
  });

  it('falls back to stored renderer URL if no resolved renderer URL exists', () => {
    mockStartupConfigState.resolvedUrl.set('');
    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'https://stored-renderer.com');
    const provider = setupProvider();
    expect(provider.rendererUrl()).toBe('https://stored-renderer.com');
  });

  it('synchronizes rendererUrl with resolved fallback when initialize is invoked', async () => {
    mockStartupConfigState.resolvedUrl.set('https://fallback-init.com');
    const provider = setupProvider();
    await provider.initialize();
    expect(provider.rendererUrl()).toBe('https://fallback-init.com');
  });

  it('initializes themePreference to light mode by default', () => {
    const provider = setupProvider();
    expect(provider.themePreference()).toBe(ThemePreference.LIGHT);
  });

  it('initializes themePreference to stored preference', () => {
    localStorage.setItem(LocalStorageKey.THEME_PREFERENCE, ThemePreference.DARK);
    const provider = setupProvider();
    expect(provider.themePreference()).toBe(ThemePreference.DARK);
  });

  it('defines envMode as EXTENSION when startup is in extension mode', () => {
    mockEnvironmentContext.isExtensionMode.mockReturnValue(true);
    const provider = setupProvider();
    expect(provider.envMode()).toBe(EnvMode.EXTENSION);
  });

  it('defines envMode as STANDALONE when startup is in standalone mode', () => {
    mockEnvironmentContext.isExtensionMode.mockReturnValue(false);
    const provider = setupProvider();
    expect(provider.envMode()).toBe(EnvMode.STANDALONE);
  });

  it('ensures 3p even when 1p in local storage when 1p not enabled', () => {
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.FIRST_PARTY);

    provider.setForcedAuthMode(AuthType.THIRD_PARTY);
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);
  });

  it('defines authType based on storage override keys if forcedAuth is DEFAULT', () => {
    mockEnvironmentContext.isThirdPartyEnvironment.mockReturnValue(true);
    const provider = setupProvider();
    // No local storage override yet, so uses fallback: 3P
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);

    // Write FORCE_1P directly to storage mimicking pre-existing config
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const providerWithStorage = setupProvider(true);
    expect(providerWithStorage.authType()).toBe(AuthType.FIRST_PARTY);
  });

  it('defines authType based on fallback environment if no overrides exist', () => {
    mockEnvironmentContext.isThirdPartyEnvironment.mockReturnValue(true);
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);

    mockEnvironmentContext.isThirdPartyEnvironment.mockReturnValue(false);
    const provider2 = setupProvider();
    expect(provider2.authType()).toBe(AuthType.FIRST_PARTY);
  });

  it('persists updated renderer URL to localStorage and updates signal', () => {
    const provider = setupProvider();
    provider.setRendererUrl('https://updated-renderer.com');
    expect(provider.rendererUrl()).toBe('https://updated-renderer.com');
    expect(localStorage.getItem(LocalStorageKey.RENDERER_URL)).toBe('https://updated-renderer.com');
    expect(mockStartupConfigState.setResolvedUrl).toHaveBeenCalledWith(
      'https://updated-renderer.com',
    );
  });

  it('persists updated API key to SecureCredentialsStorage and updates signal', async () => {
    await mockSecureStorage.saveCustomApiKey('my-key', 'My Key', 'old-token');
    localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-key');
    const provider = setupProvider();
    await provider.setGeminiApiKey('fresh-token');
    expect(provider.geminiApiKey()).toBe('fresh-token');
    const custom = await mockSecureStorage.getCustomApiKey('my-key');
    expect(custom?.key).toBe('fresh-token');
  });

  it('trims the API key before persisting and updating signal', async () => {
    await mockSecureStorage.saveCustomApiKey('my-key', 'My Key', 'old-token');
    localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-key');
    const provider = setupProvider();
    await provider.setGeminiApiKey('  fresh-token  ');
    expect(provider.geminiApiKey()).toBe('fresh-token');
    const custom = await mockSecureStorage.getCustomApiKey('my-key');
    expect(custom?.key).toBe('fresh-token');
  });

  it('handles empty string in setGeminiApiKey', async () => {
    const provider = setupProvider();
    await provider.setGeminiApiKey('');
    expect(provider.geminiApiKey()).toBe('');
  });

  it('handles whitespace-only string in setGeminiApiKey by trimming to empty string', async () => {
    const provider = setupProvider();
    await provider.setGeminiApiKey('   ');
    expect(provider.geminiApiKey()).toBe('');
  });

  it('persists updated theme selection to localStorage and updates signal', () => {
    const provider = setupProvider();
    provider.setThemePreference(ThemePreference.DARK);
    expect(provider.themePreference()).toBe(ThemePreference.DARK);
    expect(localStorage.getItem(LocalStorageKey.THEME_PREFERENCE)).toBe(ThemePreference.DARK);
  });

  it('persists forced authentication mode and manages storage keys correctly', () => {
    const provider = setupProvider();

    // Force 1P
    provider.setForcedAuthMode(AuthType.FIRST_PARTY);
    expect(provider.authType()).toBe(AuthType.FIRST_PARTY);
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBe('true');
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBeNull();

    // Force 3P
    provider.setForcedAuthMode(AuthType.THIRD_PARTY);
    expect(provider.authType()).toBe(AuthType.THIRD_PARTY);
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBe('true');
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBeNull();

    // Revert/Clear force override utilizing AuthType.DEFAULT
    provider.setForcedAuthMode(AuthType.DEFAULT);
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBeNull();
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBeNull();
  });

  it('handles simulated storage rejections gracefully during initialize bootstrap', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'err-key');
    vi.spyOn(mockSecureStorage, 'getCustomApiKey').mockRejectedValue(
      new Error('Simulated Read Failure'),
    );

    const provider = setupProvider();
    await provider.initialize();

    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to resolve credentials from SecureCredentialsStorage during bootstrap',
      expect.any(Error),
    );
    expect(provider.geminiApiKey()).toBe('');
  });

  it('attaches catch handler, logs warning, and re-throws when setGeminiApiKey write fails, after updating signal', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    await mockSecureStorage.saveCustomApiKey('my-key', 'My Key', 'initial-key');
    localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-key');
    vi.spyOn(mockSecureStorage, 'saveCustomApiKey').mockRejectedValue(
      new Error('Simulated Write Failure'),
    );

    const provider = setupProvider();
    await expect(provider.setGeminiApiKey('failed-key')).rejects.toThrow('Simulated Write Failure');
    expect(provider.geminiApiKey()).toBe('failed-key');

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to persist Gemini API key to SecureCredentialsStorage'),
      expect.any(Error),
    );
  });

  it('updates geminiApiKey signal even when saveCustomApiKey persistence fails and re-throws', async () => {
    await mockSecureStorage.saveCustomApiKey('my-key', 'My Key', 'initial-key');
    localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-key');
    const provider = setupProvider();
    await provider.initialize();
    expect(provider.geminiApiKey()).toBe('initial-key');

    vi.spyOn(mockSecureStorage, 'saveCustomApiKey').mockRejectedValue(
      new Error('Simulated Write Failure'),
    );

    await expect(provider.setGeminiApiKey('new-failed-key')).rejects.toThrow(
      'Simulated Write Failure',
    );

    expect(provider.geminiApiKey()).toBe('new-failed-key');
  });

  it('logs warning and re-throws error when saveCustomApiKey encounters SecurityError or QuotaExceededError', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    await mockSecureStorage.saveCustomApiKey('my-key', 'My Key', 'initial-key');
    localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-key');
    vi.spyOn(mockSecureStorage, 'saveCustomApiKey').mockRejectedValue(
      new DOMException('SecurityError in sandboxed iframe', 'SecurityError'),
    );

    const provider = setupProvider();
    await expect(provider.setGeminiApiKey('sandboxed-key')).rejects.toThrow(
      'SecurityError in sandboxed iframe',
    );
    expect(provider.geminiApiKey()).toBe('sandboxed-key');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to persist Gemini API key'),
      expect.anything(),
    );
  });

  describe('server-provided api key from config', () => {
    it('defaults isApiKeyProvidedByConfig to false', () => {
      const provider = setupProvider();
      expect(provider.isApiKeyProvidedByConfig()).toBe(false);
    });

    it('sets in-memory geminiApiKey signal and isApiKeyProvidedByConfig flag without persisting to storage', async () => {
      const setCredentialSpy = vi.spyOn(mockSecureStorage, 'setCredential');
      const provider = setupProvider();

      provider.setApiKeyFromConfig('  server-config-key  ');

      expect(provider.isApiKeyProvidedByConfig()).toBe(true);
      expect(provider.geminiApiKey()).toBe('server-config-key');
      expect(setCredentialSpy).not.toHaveBeenCalled();
      expect(await mockSecureStorage.getCredential(SecureCredentialsKey.GEMINI_API_KEY)).toBeNull();
    });

    it('returns early and does not write to storage or reset isApiKeyProvidedByConfig flag when setGeminiApiKey is called while config-provided', async () => {
      const setCredentialSpy = vi.spyOn(mockSecureStorage, 'setCredential');
      const provider = setupProvider();

      provider.setApiKeyFromConfig('server-config-key');
      expect(provider.isApiKeyProvidedByConfig()).toBe(true);

      await provider.setGeminiApiKey('user-attempted-key');

      expect(provider.isApiKeyProvidedByConfig()).toBe(true);
      expect(provider.geminiApiKey()).toBe('server-config-key');
      expect(setCredentialSpy).not.toHaveBeenCalled();
      expect(await mockSecureStorage.getCredential(SecureCredentialsKey.GEMINI_API_KEY)).toBeNull();
    });

    it('preserves config-provided API key during initializeCredentials bootstrap', async () => {
      await mockSecureStorage.setCredential(SecureCredentialsKey.GEMINI_API_KEY, 'stored-key');
      const provider = setupProvider();

      provider.setApiKeyFromConfig('server-config-key');
      await provider.initialize();

      expect(provider.isApiKeyProvidedByConfig()).toBe(true);
      expect(provider.geminiApiKey()).toBe('server-config-key');
    });

    it('resets isApiKeyProvidedByConfig flag to false when purgeGeminiApiKey is invoked', async () => {
      const provider = setupProvider();
      provider.setApiKeyFromConfig('server-config-key');

      await provider.purgeGeminiApiKey();

      expect(provider.isApiKeyProvidedByConfig()).toBe(false);
      expect(provider.geminiApiKey()).toBe('');
    });

    it('resets isApiKeyProvidedByConfig flag to false when flushConfig is invoked', async () => {
      const provider = setupProvider();
      provider.setApiKeyFromConfig('server-config-key');

      await provider.flushConfig();

      expect(provider.isApiKeyProvidedByConfig()).toBe(false);
      expect(provider.geminiApiKey()).toBe('');
    });

    it('resets geminiApiKey to empty string when setApiKeyFromConfig receives empty or whitespace string', () => {
      const provider = setupProvider();
      provider.setApiKeyFromConfig('server-config-key');
      expect(provider.geminiApiKey()).toBe('server-config-key');
      expect(provider.isApiKeyProvidedByConfig()).toBe(true);

      provider.setApiKeyFromConfig('   ');

      expect(provider.isApiKeyProvidedByConfig()).toBe(false);
      expect(provider.geminiApiKey()).toBe('');
    });
  });

  describe('under potential Server-Side Rendering (SSR) environments', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('manages gracefully when window and localStorage are undefined', () => {
      // Stub global localStorage to be undefined
      vi.stubGlobal('localStorage', undefined);

      const provider = setupProvider();
      expect(provider.rendererUrl()).toBe('https://default-renderer.com');
      expect(provider.geminiApiKey()).toBe('');
      expect(provider.authType()).toBe(AuthType.FIRST_PARTY);
      expect(provider.themePreference()).toBe(ThemePreference.LIGHT);

      // Verify saving/mutations do not throw ReferenceError
      expect(() => provider.setRendererUrl('https://any-url.com')).not.toThrow();
      expect(() => provider.setGeminiApiKey('any-key')).not.toThrow();
      expect(() => provider.purgeGeminiApiKey()).not.toThrow();
      expect(() => provider.setForcedAuthMode(AuthType.THIRD_PARTY)).not.toThrow();
      expect(() => provider.setThemePreference(ThemePreference.DARK)).not.toThrow();
      expect(() => provider.flushConfig()).not.toThrow();
    });
  });

  it('synchronizes renderer URL with StartupResolution when setRendererUrl is called', () => {
    const provider = setupProvider();
    provider.setRendererUrl('https://sync-renderer.com');
    expect(mockStartupConfigState.setResolvedUrl).toHaveBeenCalledWith('https://sync-renderer.com');
  });

  describe('Selected Custom API Key and Fallback Resolution', () => {
    it('initializes geminiApiKey from selected custom API key in SecureCredentialsStorage when SELECTED_API_KEY is present', async () => {
      await mockSecureStorage.saveCustomApiKey('my-custom', 'Custom Name', 'custom-key-xyz');
      localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-custom');

      const provider = setupProvider();
      await provider.initialize();

      expect(provider.geminiApiKey()).toBe('custom-key-xyz');
    });

    it('updates selected custom API key in SecureCredentialsStorage when setGeminiApiKey is called with SELECTED_API_KEY present', async () => {
      await mockSecureStorage.saveCustomApiKey('my-custom', 'Custom Name', 'initial-key');
      localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-custom');

      const provider = setupProvider();
      await provider.setGeminiApiKey('updated-custom-key');

      expect(provider.geminiApiKey()).toBe('updated-custom-key');
      const custom = await mockSecureStorage.getCustomApiKey('my-custom');
      expect(custom?.key).toBe('updated-custom-key');
    });

    it('purges active API key state and SELECTED_API_KEY from local storage without deleting custom API keys from SecureCredentialsStorage', async () => {
      await mockSecureStorage.saveCustomApiKey('my-custom', 'Custom Name', 'token-to-purge');
      localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'my-custom');

      const provider = setupProvider();
      await provider.initialize();
      expect(provider.geminiApiKey()).toBe('token-to-purge');

      await provider.purgeGeminiApiKey();

      expect(provider.geminiApiKey()).toBe('');
      expect(localStorage.getItem(LocalStorageKey.SELECTED_API_KEY)).toBeNull();
      const custom = await mockSecureStorage.getCustomApiKey('my-custom');
      expect(custom).not.toBeNull();
      expect(custom?.key).toBe('token-to-purge');
    });

    it('initializes geminiApiKey with static configuration API key when SELECTED_API_KEY matches static key ID', async () => {
      mockStartupConfigState.apiKeys.set({'static-id': {apiKey: 'static-secret-value'}});
      localStorage.setItem(LocalStorageKey.SELECTED_API_KEY, 'static-id');

      const provider = setupProvider();
      await provider.initialize();

      expect(provider.isApiKeyProvidedByConfig()).toBe(true);
      expect(provider.geminiApiKey()).toBe('static-secret-value');
    });

    it('sets geminiApiKey signal in memory without persisting to SecureCredentialsStorage on setRuntimeApiKey', async () => {
      const setCredentialSpy = vi.spyOn(mockSecureStorage, 'setCredential');
      const provider = setupProvider();

      provider.setRuntimeApiKey('  runtime-token-xyz  ');

      expect(provider.geminiApiKey()).toBe('runtime-token-xyz');
      expect(provider.isApiKeyProvidedByConfig()).toBe(false);
      expect(setCredentialSpy).not.toHaveBeenCalled();
    });
  });
});
