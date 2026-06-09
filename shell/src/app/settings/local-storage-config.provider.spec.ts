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

import {TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {LocalStorageKey} from './local-storage-keys';
import {EnvMode, AuthType, ThemePreference} from './app-config-provider';
import {LocalStorageAppConfigProvider} from './local-storage-config.provider';
import {StartupResolution} from '../shell/startup-resolution';
import {LocalStorageInteractions} from './local-storage-interactions';

describe('LocalStorageAppConfigProvider', () => {
  let mockStartupService: {
    getResolvedRendererUrl: ReturnType<typeof vi.fn>;
    isContextLocked: ReturnType<typeof vi.fn>;
    isThirdPartyEnvironment: ReturnType<typeof vi.fn>;
    isExtensionMode: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    mockStartupService = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('https://default-renderer.com'),
      isContextLocked: vi.fn().mockReturnValue(false),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      isExtensionMode: vi.fn().mockReturnValue(false),
    };
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function setupProvider(): LocalStorageAppConfigProvider {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LocalStorageAppConfigProvider,
        LocalStorageInteractions,
        {provide: StartupResolution, useValue: mockStartupService},
      ],
    });
    return TestBed.inject(LocalStorageAppConfigProvider);
  }

  it('initializes forcedAuth with ONE_PARTY when FORCE_1P is true', () => {
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.ONE_PARTY);
  });

  it('initializes forcedAuth with THREE_PARTY when FORCE_3P is true', () => {
    localStorage.setItem(LocalStorageKey.FORCE_3P, 'true');
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.THREE_PARTY);
  });

  it('initializes forcedAuth with null when no force keys are present', () => {
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.ONE_PARTY); // Fallback is 1P
  });

  it('initializes geminiApiKey with the stored API key', () => {
    localStorage.setItem(LocalStorageKey.GEMINI_API_KEY, 'test-key-xyz');
    const provider = setupProvider();
    expect(provider.geminiApiKey()).toBe('test-key-xyz');
  });

  it('initializes rendererUrl with stored renderer URL if present', () => {
    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'https://stored-renderer.com');
    const provider = setupProvider();
    expect(provider.rendererUrl()).toBe('https://stored-renderer.com');
  });

  it('initializes rendererUrl with fallback resolved URL if no stored URL exists', () => {
    mockStartupService.getResolvedRendererUrl.mockReturnValue('https://resolved-fallback.com');
    const provider = setupProvider();
    expect(provider.rendererUrl()).toBe('https://resolved-fallback.com');
  });

  it('initializes themePreference to light mode by default', () => {
    const provider = setupProvider();
    expect(provider.themePreference()).toBe('light');
  });

  it('initializes themePreference to stored preference', () => {
    localStorage.setItem(LocalStorageKey.THEME_PREFERENCE, 'dark');
    const provider = setupProvider();
    expect(provider.themePreference()).toBe('dark');
  });

  it('defines envMode as EXTENSION when startup is in extension mode', () => {
    mockStartupService.isExtensionMode.mockReturnValue(true);
    const provider = setupProvider();
    expect(provider.envMode()).toBe(EnvMode.EXTENSION);
  });

  it('defines envMode as STANDALONE when startup is in standalone mode', () => {
    mockStartupService.isExtensionMode.mockReturnValue(false);
    const provider = setupProvider();
    expect(provider.envMode()).toBe(EnvMode.STANDALONE);
  });

  it('defines authType based on forcedAuth, overriding storage keys', () => {
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.ONE_PARTY);

    provider.setForcedAuthMode(AuthType.THREE_PARTY);
    expect(provider.authType()).toBe(AuthType.THREE_PARTY);
  });

  it('defines authType based on storage override keys if forcedAuth is DEFAULT', () => {
    mockStartupService.isThirdPartyEnvironment.mockReturnValue(true);
    const provider = setupProvider();
    // No local storage override yet, so uses fallback: 3P
    expect(provider.authType()).toBe(AuthType.THREE_PARTY);

    // Write FORCE_1P directly to storage mimicking pre-existing config
    localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
    const providerWithStorage = setupProvider();
    expect(providerWithStorage.authType()).toBe(AuthType.ONE_PARTY);
  });

  it('defines authType based on fallback environment if no overrides exist', () => {
    mockStartupService.isThirdPartyEnvironment.mockReturnValue(true);
    const provider = setupProvider();
    expect(provider.authType()).toBe(AuthType.THREE_PARTY);

    mockStartupService.isThirdPartyEnvironment.mockReturnValue(false);
    const provider2 = setupProvider();
    expect(provider2.authType()).toBe(AuthType.ONE_PARTY);
  });

  it('persists updated renderer URL to localStorage and updates signal', () => {
    const provider = setupProvider();
    provider.setRendererUrl('https://updated-renderer.com');
    expect(provider.rendererUrl()).toBe('https://updated-renderer.com');
    expect(localStorage.getItem(LocalStorageKey.RENDERER_URL)).toBe('https://updated-renderer.com');
  });

  it('persists updated API key to localStorage and updates signal', () => {
    const provider = setupProvider();
    provider.setGeminiApiKey('fresh-token');
    expect(provider.geminiApiKey()).toBe('fresh-token');
    expect(localStorage.getItem(LocalStorageKey.GEMINI_API_KEY)).toBe('fresh-token');
  });

  it('persists updated theme selection to localStorage and updates signal', () => {
    const provider = setupProvider();
    provider.setThemePreference('dark');
    expect(provider.themePreference()).toBe('dark');
    expect(localStorage.getItem(LocalStorageKey.THEME_PREFERENCE)).toBe('dark');
  });

  it('persists forced authentication mode and manages storage keys correctly', () => {
    const provider = setupProvider();

    // Force 1P
    provider.setForcedAuthMode(AuthType.ONE_PARTY);
    expect(provider.authType()).toBe(AuthType.ONE_PARTY);
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBe('true');
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBeNull();

    // Force 3P
    provider.setForcedAuthMode(AuthType.THREE_PARTY);
    expect(provider.authType()).toBe(AuthType.THREE_PARTY);
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBe('true');
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBeNull();

    // Revert/Clear force override utilizing AuthType.DEFAULT
    provider.setForcedAuthMode(AuthType.DEFAULT);
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBeNull();
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBeNull();
  });

  it('purges all storage keys and resets signals on flushConfig', () => {
    mockStartupService.getResolvedRendererUrl.mockReturnValue('https://base-url.com');
    const provider = setupProvider();

    provider.setRendererUrl('https://dirty-renderer.com');
    provider.setGeminiApiKey('dirty-token');
    provider.setForcedAuthMode(AuthType.THREE_PARTY);
    provider.setThemePreference('dark');

    provider.flushConfig();

    expect(provider.rendererUrl()).toBe('https://base-url.com');
    expect(provider.geminiApiKey()).toBe('');
    expect(provider.authType()).toBe(AuthType.ONE_PARTY); // Fallback 1P
    expect(provider.themePreference()).toBe('light');

    expect(localStorage.getItem(LocalStorageKey.RENDERER_URL)).toBeNull();
    expect(localStorage.getItem(LocalStorageKey.GEMINI_API_KEY)).toBeNull();
    expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBeNull();
    expect(localStorage.getItem(LocalStorageKey.FORCE_3P)).toBeNull();
    expect(localStorage.getItem(LocalStorageKey.THEME_PREFERENCE)).toBeNull();
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
      expect(provider.authType()).toBe(AuthType.ONE_PARTY);
      expect(provider.themePreference()).toBe('light');

      // Verify saving/mutations do not throw ReferenceError
      expect(() => provider.setRendererUrl('https://any-url.com')).not.toThrow();
      expect(() => provider.setGeminiApiKey('any-key')).not.toThrow();
      expect(() => provider.setForcedAuthMode(AuthType.THREE_PARTY)).not.toThrow();
      expect(() => provider.setThemePreference('dark')).not.toThrow();
      expect(() => provider.flushConfig()).not.toThrow();
    });
  });
});
