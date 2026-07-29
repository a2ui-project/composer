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
import {signal} from '@angular/core';
import {StartupResolution} from './startup-resolution';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../environment-tokens/environment-tokens';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

class MockAppConfigProvider {
  geminiApiKey = signal<string>('');
  isApiKeyProvidedByConfig = signal<boolean>(false);
  purgeGeminiApiKey = vi.fn().mockResolvedValue(undefined);
  setGeminiApiKey = vi.fn().mockResolvedValue(undefined);
  setApiKeyFromConfig = vi.fn().mockImplementation((key: string) => {
    this.isApiKeyProvidedByConfig.set(true);
    this.geminiApiKey.set(key);
  });
}

describe('StartupResolution Task 2.6', () => {
  let service: StartupResolution;
  let mockConfigProvider: MockAppConfigProvider;

  function mockFetchConfig(config: object) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(config)));
  }

  beforeEach(() => {
    mockConfigProvider = new MockAppConfigProvider();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        StartupResolution,
        LocalStorageInteractions,
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: IS_1P_AUTH_ENABLED, useValue: true},
      ],
    });
    service = TestBed.inject(StartupResolution);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates the startup resolution service', () => {
    expect(service).toBeTruthy();
  });

  it('fetches static config and locks when overrides are prohibited', async () => {
    mockFetchConfig({
      profiles: {
        default: {
          rendererUrl: 'http://enterprise:3000',
          allowOverrides: false,
        },
      },
    });

    const logSpy = vi.spyOn(console, 'log');
    const url = await service.resolveStartupConfiguration();

    expect(url).toBe('http://enterprise:3000');
    expect(service.isContextLocked()).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Static configuration loaded with allowOverrides: false'),
    );
  });

  it('strips JSON safety prefix with LF line endings', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        ")]}'\n" +
          JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://lf:3000',
                allowOverrides: true,
              },
            },
          }),
      ),
    );
    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://lf:3000');
  });

  it('strips JSON safety prefix with CRLF line endings', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        ")]}'\r\n" +
          JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://crlf:3000',
                allowOverrides: true,
              },
            },
          }),
      ),
    );
    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://crlf:3000');
  });

  it('evaluates query params prior to storage when overrides exist', async () => {
    mockFetchConfig({
      profiles: {
        default: {
          rendererUrl: 'http://base:3000',
          allowOverrides: true,
        },
      },
    });

    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');

    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://query:3000/');
  });

  it('falls back to storage when config fetch fails or times out', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Timeout'));
    const warnSpy = vi.spyOn(console, 'warn');

    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'http://fallback-storage:3000');

    const url = await service.resolveStartupConfiguration();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Watchdog timeout or failure fetching config.json'),
      expect.any(Error),
    );
    expect(url).toBe('http://fallback-storage:3000');
  });

  it('handles malformed JSON response gracefully and falls back to local storage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('invalid json payload'));
    const warnSpy = vi.spyOn(console, 'warn');

    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'http://fallback-storage:3000');

    const url = await service.resolveStartupConfiguration();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Watchdog timeout or failure fetching config.json'),
      expect.any(SyntaxError),
    );
    expect(url).toBe('http://fallback-storage:3000');
  });

  it('identifies 3P environment based on hostname or local overrides when 1P auth is enabled', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const hostnameSpy = vi.spyOn(service, 'getWindowHostname');

    // Test 1P hostname
    hostnameSpy.mockReturnValue('subdomain.google.com');
    getItemSpy.mockReturnValue(null);
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test apex 1P hostname
    hostnameSpy.mockReturnValue('google.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test 3P hostname
    hostnameSpy.mockReturnValue('external-domain.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test forced 3P flag
    getItemSpy.mockImplementation(key => (key === LocalStorageKey.FORCE_3P ? 'true' : null));
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test forced 1P flag
    getItemSpy.mockImplementation(key => (key === LocalStorageKey.FORCE_1P ? 'true' : null));
    expect(service.isThirdPartyEnvironment()).toBe(false);
  });

  it('evaluates environment validity correctly via isEnvironmentValid', async () => {
    mockFetchConfig({
      profiles: {
        default: {
          rendererUrl: 'http://base:3000',
          allowOverrides: true,
        },
      },
    });

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('localhost');

    // Scenario 1: URL resolved, and 3P missing API key -> valid
    await service.resolveStartupConfiguration();
    expect(await service.isEnvironmentValid()).toBe(true);

    // Scenario 2: URL resolved, and 3P has API key -> valid
    mockConfigProvider.geminiApiKey.set('AIzaSyValidKey');
    expect(await service.isEnvironmentValid()).toBe(true);

    // Scenario 3: URL resolved is null -> invalid
    service.setResolvedRendererUrl(null);
    expect(await service.isEnvironmentValid()).toBe(false);
  });

  it('purges Gemini API key via AppConfigProvider when operating in 1P environments', async () => {
    mockFetchConfig({
      profiles: {
        default: {
          rendererUrl: 'http://base:3000',
          allowOverrides: true,
        },
      },
    });

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('google.com');

    await service.resolveStartupConfiguration();

    expect(mockConfigProvider.purgeGeminiApiKey).toHaveBeenCalled();
  });

  it('logs warning when evaluateEnvironmentPurge fails to purge Gemini API key', async () => {
    mockFetchConfig({
      profiles: {
        default: {
          rendererUrl: 'http://base:3000',
          allowOverrides: true,
        },
      },
    });

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('google.com');
    const warnSpy = vi.spyOn(console, 'warn');
    const purgeErr = new Error('Purge failed');
    mockConfigProvider.purgeGeminiApiKey.mockRejectedValueOnce(purgeErr);

    await service.resolveStartupConfiguration();

    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to purge Gemini API key in 1P environment:',
      purgeErr,
    );
  });

  it('correctly evaluates isExtensionMode based on query param and storage', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const searchSpy = vi.spyOn(service, 'getWindowSearch');

    // Both false
    searchSpy.mockReturnValue('?extension=false');
    getItemSpy.mockReturnValue(null);
    expect(service.isExtensionMode()).toBe(false);

    // Query param true
    searchSpy.mockReturnValue('?extension=true');
    getItemSpy.mockReturnValue(null);
    expect(service.isExtensionMode()).toBe(true);

    // Storage true
    searchSpy.mockReturnValue('');
    getItemSpy.mockImplementation(key => (key === LocalStorageKey.EXTENSION_MODE ? 'true' : null));
    expect(service.isExtensionMode()).toBe(true);
  });

  it('falls back to overrides when config fetch returns non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', {status: 404}));
    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');
    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://query:3000/');
  });

  it('resets state signals on consecutive resolveStartupConfiguration calls', async () => {
    mockFetchConfig({
      profiles: {
        default: {
          rendererUrl: 'http://enterprise:3000',
          allowOverrides: false,
        },
      },
    });
    await service.resolveStartupConfiguration(); // locks context
    expect(service.isContextLocked()).toBe(true);

    // Second run, config fetch fails, signals were reset so context is unlocked and falls back to query/storage
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');
    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'http://storage:3000');
    const url = await service.resolveStartupConfiguration();

    expect(service.isContextLocked()).toBe(false);
    expect(url).toBe('http://query:3000/');
  });

  it('returns window search and hostname safely', () => {
    expect(typeof service.getWindowSearch()).toBe('string');
    expect(typeof service.getWindowHostname()).toBe('string');
  });

  it('returns true immediately for 3P environment when IS_1P_AUTH_ENABLED is false', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        StartupResolution,
        LocalStorageInteractions,
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: IS_1P_AUTH_ENABLED, useValue: false},
      ],
    });
    const customService = TestBed.inject(StartupResolution);
    const hostnameSpy = vi.spyOn(customService, 'getWindowHostname');

    hostnameSpy.mockReturnValue('google.com');

    expect(customService.isThirdPartyEnvironment()).toBe(true);
  });

  it('consults IS_1P_AUTH_ENABLED when determining 3P environment on google.com with FORCE_3P true', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        StartupResolution,
        LocalStorageInteractions,
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: IS_1P_AUTH_ENABLED, useValue: false},
      ],
    });
    const customService = TestBed.inject(StartupResolution);
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const hostnameSpy = vi.spyOn(customService, 'getWindowHostname');

    hostnameSpy.mockReturnValue('google.com');
    getItemSpy.mockImplementation(key => (key === LocalStorageKey.FORCE_3P ? 'true' : null));

    expect(customService.isThirdPartyEnvironment()).toBe(true);
  });

  describe('server api key in config.json', () => {
    it('sets in-memory API key in AppConfigProvider when config.json provides apiKey property', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: 'AIzaSyCamelKey',
          },
        },
      });

      const url = await service.resolveStartupConfiguration();

      expect(url).toBe('http://base:3000');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyCamelKey');
      expect(service.isContextLocked()).toBe(false);
    });

    it('ignores empty or whitespace apiKey property in config.json', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: '   ',
          },
        },
      });

      await service.resolveStartupConfiguration();

      expect(mockConfigProvider.setApiKeyFromConfig).not.toHaveBeenCalled();
    });

    it('locks context strictly when allowOverrides is false regardless of apiKey presence', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: false,
            apiKey: 'AIzaSyCamelKey',
          },
        },
      });

      await service.resolveStartupConfiguration();

      expect(service.isContextLocked()).toBe(true);
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyCamelKey');
    });

    it('trims whitespace immediately when config.json provides apiKey with surrounding spaces', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: '   AIzaSyTrimmedKey   ',
          },
        },
      });

      await service.resolveStartupConfiguration();

      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyTrimmedKey');
    });
  });

  it('updates resolved renderer URL via setResolvedRendererUrl', () => {
    service.setResolvedRendererUrl('http://custom-url:3000');
    expect(service.getResolvedRendererUrl()).toBe('http://custom-url:3000');

    service.setResolvedRendererUrl(null);
    expect(service.getResolvedRendererUrl()).toBeNull();
  });

  describe('profile resolution', () => {
    it('loads default profile when no profile query parameter is provided', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
            allowOverrides: true,
          },
        },
      });

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://default-renderer:3000');
    });

    it('loads named profile directly when valid profile param is supplied', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=ge');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://testing-renderer:3000');
    });

    it('uses named profile directly without merging default profile properties', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
            apiKey: 'default-key',
            allowOverrides: false,
          },
          dev: {
            rendererUrl: 'http://dev-renderer:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=dev');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://dev-renderer:3000');
      expect(mockConfigProvider.setApiKeyFromConfig).not.toHaveBeenCalled();
      expect(service.isContextLocked()).toBe(false);
    });

    it('logs warning and falls back to default profile when invalid profile parameter is provided', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
            allowOverrides: true,
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn');
      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=invalid');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://default-renderer:3000');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Requested profile 'invalid' not found in static configuration."),
      );
    });

    it('handles missing profiles key or missing default profile gracefully', async () => {
      mockFetchConfig({});
      let url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();

      mockFetchConfig({profiles: {}});
      url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();
    });

    it('locks context immediately when active profile sets allowOverrides to false', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
          },
          locked: {
            rendererUrl: 'http://locked-renderer:3000',
            allowOverrides: false,
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue(
        '?profile=locked&renderer=http://override:3000',
      );
      localStorage.setItem(LocalStorageKey.RENDERER_URL, 'http://storage:3000');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://locked-renderer:3000');
      expect(service.isContextLocked()).toBe(true);
    });

    it('allows renderer query override over profile defaults when allowOverrides is true', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue(
        '?profile=ge&renderer=http://custom-renderer:3000',
      );

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://custom-renderer:3000/');
    });

    it('handles prototype property names in profile parameter safely', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn');
      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=constructor');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://base:3000');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Requested profile 'constructor' not found in static configuration.",
        ),
      );
    });

    it('handles null profile entries in config.json gracefully', async () => {
      mockFetchConfig({
        profiles: {
          default: null as unknown as object,
          dev: null as unknown as object,
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=dev');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();
      expect(service.isContextLocked()).toBe(false);
    });

    it('bypasses lock and logs warning when static profile sets allowOverrides: false but specifies no rendererUrl', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            allowOverrides: false,
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn');
      const url = await service.resolveStartupConfiguration();

      expect(url).toBeNull();
      expect(service.isContextLocked()).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        'Static profile sets allowOverrides: false but specifies no rendererUrl. Bypassing lock.',
      );
    });

    it('handles array payloads for profiles or individual profile entries safely', async () => {
      // 1. Array payload for profiles
      mockFetchConfig({
        profiles: [{rendererUrl: 'http://array-profile:3000'}] as unknown as object,
      });

      let url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();

      // 2. Array payload for default profile entry
      mockFetchConfig({
        profiles: {
          default: [{rendererUrl: 'http://array-default:3000'}] as unknown as object,
        },
      });

      url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();

      // 3. Array payload for requested named profile entry
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
            allowOverrides: true,
          },
          dev: [{rendererUrl: 'http://array-dev:3000'}] as unknown as object,
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=dev');

      url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://default-renderer:3000');
    });
  });

  describe('apiKey resolution', () => {
    it('extracts and sets trimmed API key from static config', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: '  test-api-key  ',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('test-api-key');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('uses named profile API key when profile is active', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: 'root-key',
          },
          dev: {
            apiKey: 'profile-key',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=dev');

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('profile-key');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('does not use default profile API key when requested profile does not specify an API key', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: 'root-key',
          },
          dev: {
            rendererUrl: 'http://dev:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?profile=dev');

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).not.toHaveBeenCalled();
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('does not call setApiKeyFromConfig or setGeminiApiKey when API key is empty or whitespace-only', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: '   ',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).not.toHaveBeenCalled();
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('does not call setApiKeyFromConfig or setGeminiApiKey when API key is missing from config', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).not.toHaveBeenCalled();
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('handles non-string apiKey values safely without setting API key', async () => {
      mockFetchConfig({
        profiles: {
          default: {
            rendererUrl: 'http://base:3000',
            allowOverrides: true,
            apiKey: 12345 as unknown as string,
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).not.toHaveBeenCalled();
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });
  });

  describe('with custom CONFIG_URL provider', () => {
    let customService: StartupResolution;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          StartupResolution,
          LocalStorageInteractions,
          {provide: AppConfigProvider, useValue: mockConfigProvider},
          {provide: IS_1P_AUTH_ENABLED, useValue: true},
          {provide: CONFIG_URL, useValue: '/custom/config.json'},
        ],
      });
      customService = TestBed.inject(StartupResolution);
    });

    it('fetches runtime configuration from custom CONFIG_URL when overridden in injector', async () => {
      const logSpy = vi.spyOn(console, 'log');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://custom-url:3000',
                allowOverrides: true,
              },
            },
          }),
        ),
      );

      const url = await customService.resolveStartupConfiguration();

      expect(logSpy).toHaveBeenCalledWith('Fetching /custom/config.json configuration...');
      expect(fetchSpy).toHaveBeenCalledWith(
        '/custom/config.json',
        expect.objectContaining({signal: expect.any(AbortSignal)}),
      );
      expect(url).toBe('http://custom-url:3000');
    });

    it('handles fetch failure gracefully when using custom CONFIG_URL', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      const warnSpy = vi.spyOn(console, 'warn');

      localStorage.setItem(LocalStorageKey.RENDERER_URL, 'http://fallback-storage:3000');

      const url = await customService.resolveStartupConfiguration();

      expect(fetchSpy).toHaveBeenCalledWith(
        '/custom/config.json',
        expect.objectContaining({signal: expect.any(AbortSignal)}),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Watchdog timeout or failure fetching /custom/config.json'),
        expect.any(Error),
      );
      expect(url).toBe('http://fallback-storage:3000');
    });

    it('locks context when custom CONFIG_URL response has allowOverrides set to false', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://custom-locked-renderer:3000',
                allowOverrides: false,
              },
            },
          }),
        ),
      );

      const url = await customService.resolveStartupConfiguration();

      expect(url).toBe('http://custom-locked-renderer:3000');
      expect(customService.isContextLocked()).toBe(true);
    });
  });
});
