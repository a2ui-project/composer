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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {ComponentHarness} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {StartupResolution} from './startup-resolution';
import {StartupConfigStateService} from './state/startup-config-state.service';
import {QueryParser} from '../query-parser/query-parser';
import {OriginConfirmationDialog} from './origin-confirmation-dialog/origin-confirmation-dialog';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../environment-tokens/environment-tokens';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

class OriginConfirmationDialogHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-origin-confirmation-dialog';

  private readonly getTitle = this.locatorFor('h2');
  private readonly getContent = this.locatorFor('mat-dialog-content');
  private readonly getAllowButton = this.locatorFor(
    MatButtonHarness.with({selector: '#allow-origin-btn'}),
  );
  private readonly getDenyButton = this.locatorFor(
    MatButtonHarness.with({selector: '#deny-origin-btn'}),
  );

  async getTitleText(): Promise<string> {
    const el = await this.getTitle();
    return await el.text();
  }

  async getContentText(): Promise<string> {
    const el = await this.getContent();
    return await el.text();
  }

  async clickAllow(): Promise<void> {
    const btn = await this.getAllowButton();
    await btn.click();
  }

  async clickDeny(): Promise<void> {
    const btn = await this.getDenyButton();
    await btn.click();
  }
}

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

describe('StartupResolution', () => {
  let service: StartupResolution;
  let stateService: StartupConfigStateService;
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
    stateService = TestBed.inject(StartupConfigStateService);
  });

  afterEach(() => {
    localStorage.clear();
    globalThis.location.hash = '';
    globalThis.location.search = '';
    vi.restoreAllMocks();
  });

  it('creates the startup resolution service', () => {
    expect(service).toBeTruthy();
  });

  it('fetches static config and resolves default renderer', async () => {
    mockFetchConfig({
      renderers: {
        default: {
          rendererUrl: 'http://enterprise:3000',
        },
      },
    });

    const url = await service.resolveStartupConfiguration();

    expect(url).toBe('http://enterprise:3000');
  });

  it('strips JSON safety prefix with LF line endings', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        ")]}'\n" +
          JSON.stringify({
            renderers: {
              default: {
                rendererUrl: 'http://lf:3000',
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
            renderers: {
              default: {
                rendererUrl: 'http://crlf:3000',
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
      renderers: {
        default: {
          rendererUrl: 'http://base:3000',
        },
      },
    });

    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');
    vi.spyOn(service, 'isOriginAllowed').mockResolvedValue(true);

    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://query:3000/');
  });

  describe('sharedA2uiPayload signal', () => {
    it('parses compressed d1. payload from window hash fragment and assigns decompressed JSON string to sharedA2uiPayload', async () => {
      mockFetchConfig({});
      const rawJson = '[{"version":"v0.9","createSurface":{"surfaceId":"test-compressed"}}]';
      const expectedFormattedJson = JSON.stringify(JSON.parse(rawJson), null, 2);
      const compressed = await QueryParser.encodeSharedPayload(rawJson);
      vi.spyOn(service, 'getWindowHash').mockReturnValue(`#a2ui=${compressed}`);
      const cleanSpy = vi.spyOn(service, 'cleanSharedA2uiUrl');

      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiPayload()).toBe(expectedFormattedJson);
      expect(cleanSpy).toHaveBeenCalled();
    });

    it('leaves sharedA2uiPayload as null when a2ui hash parameter is missing or empty', async () => {
      mockFetchConfig({});
      vi.spyOn(service, 'getWindowHash').mockReturnValue('');

      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiPayload()).toBeNull();
      expect(service.sharedA2uiError()).toBeNull();
    });

    it('sets sharedA2uiError when a2ui hash parameter contains corrupted or truncated compressed payload', async () => {
      mockFetchConfig({});
      vi.spyOn(service, 'getWindowHash').mockReturnValue('#a2ui=d1.corrupted_truncated_base64!!!');
      const cleanSpy = vi.spyOn(service, 'cleanSharedA2uiUrl');

      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiPayload()).toBeNull();
      expect(service.sharedA2uiError()).toContain('truncated or corrupted');
      expect(cleanSpy).toHaveBeenCalled();
    });

    it('sets sharedA2uiError when a2ui hash parameter contains unrecognized non-d1 format', async () => {
      mockFetchConfig({});
      vi.spyOn(service, 'getWindowHash').mockReturnValue('#a2ui=unrecognized-format');

      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiPayload()).toBeNull();
      expect(service.sharedA2uiError()).toContain('unrecognized or corrupted');
    });

    it('resets sharedA2uiError to null on consecutive resolveStartupConfiguration calls', async () => {
      mockFetchConfig({});
      const getWindowHashSpy = vi.spyOn(service, 'getWindowHash');
      getWindowHashSpy.mockReturnValue('#a2ui=d1.corrupted');
      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiError()).not.toBeNull();

      getWindowHashSpy.mockReturnValue('');
      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiError()).toBeNull();
    });

    it('parses compressed d1. payload from query search parameters when hash is empty', async () => {
      mockFetchConfig({});
      const rawJson = '[{"version":"v0.9","createSurface":{"surfaceId":"test-search"}}]';
      const expectedFormattedJson = JSON.stringify(JSON.parse(rawJson), null, 2);
      const compressed = await QueryParser.encodeSharedPayload(rawJson);
      vi.spyOn(service, 'getWindowHash').mockReturnValue('');
      vi.spyOn(service, 'getWindowSearch').mockReturnValue(`?a2ui=${compressed}`);
      const cleanSpy = vi.spyOn(service, 'cleanSharedA2uiUrl');

      await service.resolveStartupConfiguration();
      expect(service.sharedA2uiPayload()).toBe(expectedFormattedJson);
      expect(cleanSpy).toHaveBeenCalled();
    });

    it('cleans a2ui parameter from window hash via history.replaceState', () => {
      const replaceStateSpy = vi.spyOn(globalThis.history, 'replaceState');
      globalThis.location.hash = '#renderer=http%3A%2F%2Frenderer.com&a2ui=d1.abc';
      try {
        service.cleanSharedA2uiUrl();
        expect(replaceStateSpy).toHaveBeenCalledWith(
          {},
          '',
          expect.stringContaining('#renderer=http%3A%2F%2Frenderer.com'),
        );
        expect(replaceStateSpy).toHaveBeenCalledWith({}, '', expect.not.stringContaining('a2ui='));
      } finally {
        globalThis.location.hash = '';
      }
    });

    it('processes hashchange events dynamically at runtime', async () => {
      const rawJson = '[{"version":"v0.9","createSurface":{"surfaceId":"test-dynamic"}}]';
      const expectedFormattedJson = JSON.stringify(JSON.parse(rawJson), null, 2);
      const compressed = await QueryParser.encodeSharedPayload(rawJson);
      vi.spyOn(service, 'getWindowHash').mockReturnValue(`#a2ui=${compressed}`);

      await service.processSharedA2uiUrl();
      expect(service.sharedA2uiPayload()).toBe(expectedFormattedJson);
    });
  });

  it('falls back to storage when config fetch fails or times out', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Timeout'));
    const warnSpy = vi.spyOn(console, 'warn');

    localStorage.setItem(
      LocalStorageKey.CUSTOM_RENDERERS,
      JSON.stringify([
        {id: 'fallback', name: 'Fallback', rendererUrl: 'http://fallback-storage:3000'},
      ]),
    );
    localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'fallback');

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

    localStorage.setItem(
      LocalStorageKey.CUSTOM_RENDERERS,
      JSON.stringify([
        {id: 'fallback', name: 'Fallback', rendererUrl: 'http://fallback-storage:3000'},
      ]),
    );
    localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'fallback');

    const url = await service.resolveStartupConfiguration();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Watchdog timeout or failure fetching config.json'),
      expect.any(SyntaxError),
    );
    expect(url).toBe('http://fallback-storage:3000');
  });

  it('filters out null, non-object, missing ID, or whitespace-only ID items from getCustomRenderers()', () => {
    localStorage.setItem(
      LocalStorageKey.CUSTOM_RENDERERS,
      JSON.stringify([
        null,
        123,
        {name: 'No ID', rendererUrl: 'http://noid.com'},
        {id: '   ', name: 'Whitespace ID', rendererUrl: 'http://whitespace.com'},
        {id: 'valid-1', name: 'Valid One', rendererUrl: 'http://valid.com'},
      ]),
    );

    const custom = service.getCustomRenderers();
    expect(custom).toEqual([{id: 'valid-1', name: 'Valid One', rendererUrl: 'http://valid.com'}]);
  });

  it('evaluates environment validity correctly via isEnvironmentValid', async () => {
    mockFetchConfig({
      renderers: {
        default: {
          rendererUrl: 'http://base:3000',
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

  it('falls back to overrides when config fetch returns non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', {status: 404}));
    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');
    vi.spyOn(service, 'isOriginAllowed').mockResolvedValue(true);
    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://query:3000/');
  });

  it('resets state signals on consecutive resolveStartupConfiguration calls', async () => {
    mockFetchConfig({
      renderers: {
        default: {
          rendererUrl: 'http://enterprise:3000',
        },
      },
    });
    await service.resolveStartupConfiguration();

    // Second run, config fetch fails, signals were reset so falls back to query/storage
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');
    vi.spyOn(service, 'isOriginAllowed').mockResolvedValue(true);
    localStorage.setItem(
      LocalStorageKey.CUSTOM_RENDERERS,
      JSON.stringify([{id: 'storage', name: 'Storage', rendererUrl: 'http://storage:3000'}]),
    );
    localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'storage');
    const url = await service.resolveStartupConfiguration();

    expect(url).toBe('http://query:3000/');
  });

  it('resets profiles signal state on resolveStartupConfiguration call', async () => {
    mockFetchConfig({
      renderers: {
        dev: {rendererUrl: 'http://dev:3000'},
      },
    });
    await service.resolveStartupConfiguration();
    expect(service.renderers()).toEqual({
      dev: {rendererUrl: 'http://dev:3000'},
    });

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    await service.resolveStartupConfiguration();
    expect(service.renderers()).toEqual({});
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
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: 'AIzaSyCamelKey',
          },
        },
      });

      const url = await service.resolveStartupConfiguration();

      expect(url).toBe('http://base:3000');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyCamelKey');
    });

    it('ignores empty or whitespace apiKey property in config.json', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: '   ',
          },
        },
      });

      await service.resolveStartupConfiguration();

      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    });

    it('trims whitespace immediately when config.json provides apiKey with surrounding spaces', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: '   AIzaSyTrimmedKey   ',
          },
        },
      });

      await service.resolveStartupConfiguration();

      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyTrimmedKey');
    });

    it('supports object schema apiKeys ({ apiKey, displayName }) in config.json', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: 'AIzaSyObjectKey',
            displayName: 'Gemini Enterprise',
          },
        },
      });

      const url = await service.resolveStartupConfiguration();

      expect(url).toBe('http://base:3000');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyObjectKey');
      expect(service.apiKeys()).toEqual({
        default: {
          apiKey: 'AIzaSyObjectKey',
          displayName: 'Gemini Enterprise',
        },
      });
    });

    it('trims whitespace when object schema apiKey contains surrounding spaces', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: '   AIzaSyObjectTrimmed   ',
            displayName: 'Trimmed Key',
          },
        },
      });

      await service.resolveStartupConfiguration();

      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('AIzaSyObjectTrimmed');
    });
  });

  it('updates resolved renderer URL via setResolvedRendererUrl', () => {
    service.setResolvedRendererUrl('http://custom-url:3000');
    expect(service.getResolvedRendererUrl()).toBe('http://custom-url:3000');

    service.setResolvedRendererUrl(null);
    expect(service.getResolvedRendererUrl()).toBeNull();
  });

  it('updates activeProfileKey signal alongside selectedProfileId signal when setSelectedProfileId is called', () => {
    service.setSelectedRendererId('custom-profile');
    expect(stateService.selectedRendererId()).toBe('custom-profile');
    expect(stateService.selectedRendererId()).toBe('custom-profile');

    service.setSelectedRendererId(null);
    expect(stateService.selectedRendererId()).toBeNull();
    expect(stateService.selectedRendererId()).toBeNull();
  });

  describe('renderer resolution', () => {
    it('loads default profile when no profile query parameter is provided', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
          },
        },
      });

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://default-renderer:3000');
    });

    it('returns null when selectedProfileId is null or not found in profiles without falling back to default', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
          },
          dev: {
            rendererUrl: 'http://dev-renderer:3000',
          },
        },
      });

      await service.resolveStartupConfiguration();
      service.setSelectedRendererId(null);
      expect(stateService.activeRenderer()).toBeNull();

      service.setSelectedRendererId('nonexistent');
      expect(stateService.activeRenderer()).toBeNull();
    });

    it('stores and retrieves profile configs containing optional displayName', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
            displayName: 'Default Profile',
          },
          dev: {
            rendererUrl: 'http://dev:3000',
            displayName: 'Development Environment',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(service.renderers()).toEqual({
        default: {
          rendererUrl: 'http://base:3000',
          displayName: 'Default Profile',
        },
        dev: {
          rendererUrl: 'http://dev:3000',
          displayName: 'Development Environment',
        },
      });
      expect(stateService.activeRenderer()).toEqual({
        rendererUrl: 'http://base:3000',
        displayName: 'Default Profile',
      });
    });

    it('loads named profile directly when valid profile param is supplied', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=ge');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://testing-renderer:3000');
    });

    it('uses named profile directly without merging default profile properties', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
            apiKey: 'default-key',
          },
          dev: {
            rendererUrl: 'http://dev-renderer:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=dev');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://dev-renderer:3000');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    });

    it('logs warning and falls back to default profile when invalid profile parameter is provided', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn');
      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=invalid');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://default-renderer:3000');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Requested renderer 'invalid' not found in static configuration."),
      );
    });

    it('handles missing profiles key or missing default profile gracefully', async () => {
      mockFetchConfig({});
      let url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();

      mockFetchConfig({renderers: {}});
      url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();
    });

    it('allows renderer query override over profile defaults', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue(
        '?rendererId=ge&renderer=http://custom-renderer:3000',
      );
      vi.spyOn(service, 'isOriginAllowed').mockResolvedValue(true);

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://custom-renderer:3000/');
    });

    it('handles prototype property names in profile parameter safely', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
          ge: {
            rendererUrl: 'http://testing-renderer:3000',
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn');
      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=constructor');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://base:3000');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Requested renderer 'constructor' not found in static configuration.",
        ),
      );
    });

    it('handles null profile entries in config.json gracefully', async () => {
      mockFetchConfig({
        renderers: {
          default: null as unknown as object,
          dev: null as unknown as object,
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=dev');

      const url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();
    });

    it('handles array payloads for profiles or individual profile entries safely', async () => {
      // 1. Array payload for profiles
      mockFetchConfig({
        renderers: [{rendererUrl: 'http://array-profile:3000'}] as unknown as object,
      });

      let url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();

      // 2. Array payload for default profile entry
      mockFetchConfig({
        renderers: {
          default: [{rendererUrl: 'http://array-default:3000'}] as unknown as object,
        },
      });

      url = await service.resolveStartupConfiguration();
      expect(url).toBeNull();

      // 3. Array payload for requested named profile entry
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://default-renderer:3000',
          },
          dev: [{rendererUrl: 'http://array-dev:3000'}] as unknown as object,
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=dev');

      url = await service.resolveStartupConfiguration();
      expect(url).toBe('http://default-renderer:3000');
    });

    describe('4-tier renderer resolution priority chain', () => {
      it('ignores initialProfile in static config and resolves query param', async () => {
        mockFetchConfig({
          initialProfile: 'initProfile',
          renderers: {
            initProfile: {
              rendererUrl: 'http://init-renderer:3000',
            },
            queryProfile: {
              rendererUrl: 'http://query-renderer:3000',
            },
            default: {
              rendererUrl: 'http://default-renderer:3000',
            },
          },
        });

        vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=queryProfile');
        localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'queryProfile');

        const url = await service.resolveStartupConfiguration();
        expect(url).toBe('http://query-renderer:3000');
        expect(stateService.selectedRendererId()).toBe('queryProfile');
      });

      it('resolves query profile as tier 2 priority when initialProfile is absent or invalid', async () => {
        mockFetchConfig({
          initialProfile: 'nonExistentProfile',
          renderers: {
            queryProfile: {
              rendererUrl: 'http://query-renderer:3000',
            },
            storageProfile: {
              rendererUrl: 'http://storage-renderer:3000',
            },
            default: {
              rendererUrl: 'http://default-renderer:3000',
            },
          },
        });

        vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=queryProfile');
        localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'storageProfile');

        const url = await service.resolveStartupConfiguration();
        expect(url).toBe('http://query-renderer:3000');
        expect(stateService.selectedRendererId()).toBe('queryProfile');
        expect(stateService.selectedRendererId()).toBe('queryProfile');
      });

      it('resolves local storage selected profile as tier 3 priority when initialProfile and query profile are absent or invalid', async () => {
        mockFetchConfig({
          renderers: {
            storageProfile: {
              rendererUrl: 'http://storage-renderer:3000',
            },
            default: {
              rendererUrl: 'http://default-renderer:3000',
            },
          },
        });

        vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=nonExistentProfile');
        localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'storageProfile');

        const url = await service.resolveStartupConfiguration();
        expect(url).toBe('http://storage-renderer:3000');
        expect(stateService.selectedRendererId()).toBe('storageProfile');
        expect(stateService.selectedRendererId()).toBe('storageProfile');
      });

      it('resolves default profile as tier 4 priority when higher priority candidates are absent or invalid', async () => {
        mockFetchConfig({
          renderers: {
            default: {
              rendererUrl: 'http://default-renderer:3000',
            },
          },
        });

        vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=nonExistentProfile');
        localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'nonExistentStorage');

        const url = await service.resolveStartupConfiguration();
        expect(url).toBe('http://default-renderer:3000');
        expect(stateService.selectedRendererId()).toBe('default');
        expect(stateService.selectedRendererId()).toBe('default');
      });

      it('returns null when no candidate profile key exists in static config profiles', async () => {
        mockFetchConfig({
          renderers: {
            customProfile: {
              rendererUrl: 'http://custom-renderer:3000',
            },
          },
        });

        vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=nonExistentProfile');
        localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'nonExistentStorage');

        const url = await service.resolveStartupConfiguration();
        expect(url).toBeNull();
        expect(stateService.selectedRendererId()).toBeNull();
        expect(stateService.selectedRendererId()).toBeNull();
      });
    });
  });

  describe('apiKey resolution', () => {
    it('extracts and sets trimmed API key from static config', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: '  test-api-key  ',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('test-api-key');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('uses renderer API key from apiKeys config when renderer is selected', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: 'renderer-key',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('renderer-key');
    });

    it('uses API key from apiKeys map when present in static config', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {apiKey: 'map-api-key'},
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('map-api-key');
    });

    it('uses named profile API key when profile is active', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
          dev: {
            rendererUrl: 'http://dev:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: 'root-key',
          },
          dev: {
            apiKey: 'profile-key',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=dev');

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('profile-key');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('does not use default profile API key when requested profile does not specify an API key', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
          dev: {
            rendererUrl: 'http://dev:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: 'root-key',
          },
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=dev');

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('does not call setApiKeyFromConfig or setGeminiApiKey when API key is empty or whitespace-only', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: '   ',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('does not call setApiKeyFromConfig or setGeminiApiKey when API key is missing from config', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
    });

    it('handles non-string apiKey values safely without setting API key', async () => {
      mockFetchConfig({
        renderers: {
          default: {
            rendererUrl: 'http://base:3000',
          },
        },
        apiKeys: {
          default: {
            apiKey: 12345 as unknown as string,
          },
        },
      });

      await service.resolveStartupConfiguration();
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
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
            renderers: {
              default: {
                rendererUrl: 'http://custom-url:3000',
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

      localStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'fallback', name: 'Fallback', rendererUrl: 'http://fallback-storage:3000'},
        ]),
      );
      localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'fallback');

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
  });

  describe('Renderer Resolution & Security Allowlist', () => {
    it('1. ?renderer= query param wins over all other configs when origin is allowed and applies API key from apiKeys', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
          dev: {rendererUrl: 'http://dev-renderer:3000'},
        },
        apiKeys: {
          dev: {apiKey: 'dev-api-key-from-map'},
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue(
        '?rendererId=dev&renderer=http://custom-dev:4200/preview',
      );
      vi.spyOn(service, 'isOriginAllowed').mockResolvedValue(true);
      localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'default');

      const url = await service.resolveRenderer();
      expect(url).toBe('http://custom-dev:4200/preview');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('dev-api-key-from-map');
    });

    it('1b. ?renderer= query param without ?rendererId= applies default API key from apiKeys or fallback key', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
        },
        apiKeys: {
          default: {apiKey: 'default-api-key-from-map'},
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue(
        '?renderer=http://custom-dev:4200/preview',
      );
      vi.spyOn(service, 'isOriginAllowed').mockResolvedValue(true);

      const url = await service.resolveRenderer();
      expect(url).toBe('http://custom-dev:4200/preview');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith(
        'default-api-key-from-map',
      );
    });

    it('2a. auto-allows localhost, 127.0.0.1, and [::1] origins in ?renderer= without prompting confirmation', async () => {
      const confirmSpy = vi.spyOn(service, 'confirmOrigin');
      const allowedLocalhost = await service.isOriginAllowed('http://localhost:3000/test');
      const allowed127 = await service.isOriginAllowed('http://127.0.0.1:8080/test');
      const allowedIpv6 = await service.isOriginAllowed('http://[::1]:8080/test');

      expect(allowedLocalhost).toBe(true);
      expect(allowed127).toBe(true);
      expect(allowedIpv6).toBe(true);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('2a1. auto-allows external origin defined in config.json.renderers without prompting confirmation', async () => {
      const confirmSpy = vi.spyOn(service, 'confirmOrigin');
      mockFetchConfig({
        renderers: {
          external: {
            rendererUrl: 'https://configured-external.example.com/app',
          },
        },
      });
      await service.resolveStartupConfiguration();

      const isAllowed = await service.isOriginAllowed(
        'https://configured-external.example.com/other-path',
      );

      expect(isAllowed).toBe(true);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('2a2. prompts confirmation for external custom-renderer.com domain', async () => {
      const confirmSpy = vi.spyOn(service, 'confirmOrigin').mockResolvedValue(true);
      const isAllowed = await service.isOriginAllowed('http://custom-renderer.com:3000/test');

      expect(isAllowed).toBe(true);
      expect(confirmSpy).toHaveBeenCalledWith('http://custom-renderer.com:3000');
    });

    it('2a3. does not auto-allow custom-renderer.com without confirmation', async () => {
      const confirmSpy = vi.spyOn(service, 'confirmOrigin').mockResolvedValue(false);
      const isAllowed = await service.isOriginAllowed('http://custom-renderer.com:3000/test');

      expect(isAllowed).toBe(false);
      expect(confirmSpy).toHaveBeenCalledWith('http://custom-renderer.com:3000');
    });

    it('2b. auto-allows origin present in LocalStorage a2ui_composer_allowed_origins', async () => {
      const confirmSpy = vi.spyOn(service, 'confirmOrigin');
      localStorage.setItem(
        LocalStorageKey.ALLOWED_ORIGINS,
        JSON.stringify(['https://trusted.example.com']),
      );

      const isAllowed = await service.isOriginAllowed('https://trusted.example.com/app');
      expect(isAllowed).toBe(true);
      expect(confirmSpy).not.toHaveBeenCalled();
    });

    it('2c. prompts confirmation for untrusted external origin and saves origin to LocalStorage when confirmed', async () => {
      const confirmSpy = vi.spyOn(service, 'confirmOrigin').mockResolvedValue(true);

      const isAllowed = await service.isOriginAllowed('https://untrusted.example.com/app');
      expect(isAllowed).toBe(true);
      expect(confirmSpy).toHaveBeenCalledWith('https://untrusted.example.com');

      const storedOrigins = JSON.parse(
        localStorage.getItem(LocalStorageKey.ALLOWED_ORIGINS) || '[]',
      );
      expect(storedOrigins).toContain('https://untrusted.example.com');
    });

    it('2d. prompts confirmation for untrusted external origin and falls back to next tier when denied', async () => {
      vi.spyOn(service, 'confirmOrigin').mockResolvedValue(false);
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue(
        '?renderer=https://denied.example.com/app',
      );

      const url = await service.resolveRenderer();
      expect(url).toBe('http://default-renderer:3000');
    });

    it('3a. ?rendererId=dev matches static renderers in config.json.renderers when no ?renderer= is present and applies API key from apiKeys', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
          dev: {rendererUrl: 'http://dev-renderer:3000'},
        },
        apiKeys: {
          dev: {apiKey: 'dev-api-key'},
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=dev');
      const url = await service.resolveRenderer();

      expect(url).toBe('http://dev-renderer:3000');
      expect(stateService.selectedRendererId()).toBe('dev');
      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('dev-api-key');
    });

    it('3c. ?rendererId=custom matches custom renderers in LocalStorage when no ?renderer= is present', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
        },
      });

      localStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          {id: 'custom', name: 'Custom Renderer', rendererUrl: 'http://custom-renderer:4000'},
        ]),
      );

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=custom');
      const url = await service.resolveRenderer();

      expect(url).toBe('http://custom-renderer:4000');
      expect(stateService.selectedRendererId()).toBe('custom');
    });

    it('3d. ignores malformed entries in CUSTOM_RENDERERS LocalStorage when resolving custom renderer by ID', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
        },
      });

      localStorage.setItem(
        LocalStorageKey.CUSTOM_RENDERERS,
        JSON.stringify([
          null,
          123,
          'invalid',
          ['array'],
          {id: 'custom', name: 'Custom Renderer', rendererUrl: 'http://custom-renderer:4000'},
        ]),
      );

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('?rendererId=custom');
      const url = await service.resolveRenderer();

      expect(url).toBe('http://custom-renderer:4000');
      expect(stateService.selectedRendererId()).toBe('custom');
    });

    it('4. resolves last selected renderer from LocalStorage when no query parameters are present', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
          staging: {rendererUrl: 'http://staging-renderer:3000'},
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('');
      localStorage.setItem(LocalStorageKey.SELECTED_RENDERER, 'staging');

      const url = await service.resolveRenderer();
      expect(url).toBe('http://staging-renderer:3000');
      expect(stateService.selectedRendererId()).toBe('staging');
    });

    it('5. resolves default renderer from config.json.renderers when LocalStorage is empty', async () => {
      mockFetchConfig({
        renderers: {
          default: {rendererUrl: 'http://default-renderer:3000'},
        },
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('');
      const url = await service.resolveRenderer();

      expect(url).toBe('http://default-renderer:3000');
      expect(stateService.selectedRendererId()).toBe('default');
    });

    it('6. null renderer -> returns null and causes isEnvironmentValid to return false for redirect to /settings', async () => {
      mockFetchConfig({
        renderers: {},
      });

      vi.spyOn(service, 'getWindowSearch').mockReturnValue('');
      const url = await service.resolveRenderer();

      expect(url).toBeNull();
      expect(await service.isEnvironmentValid()).toBe(false);
    });

    it('returns false from isOriginAllowed when URL is malformed', async () => {
      const allowed = await service.isOriginAllowed('http://%invalid%');
      expect(allowed).toBe(false);
    });

    it('handles malformed JSON in ALLOWED_ORIGINS local storage gracefully', async () => {
      const warnSpy = vi.spyOn(console, 'warn');
      vi.spyOn(service, 'confirmOrigin').mockResolvedValue(false);
      localStorage.setItem(LocalStorageKey.ALLOWED_ORIGINS, 'invalid-json');

      const allowed = await service.isOriginAllowed('https://test.example.com');
      expect(allowed).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to parse ALLOWED_ORIGINS from local storage:',
        expect.any(Error),
      );
    });

    it('handles malformed JSON in CUSTOM_RENDERERS local storage gracefully', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      localStorage.setItem(LocalStorageKey.CUSTOM_RENDERERS, 'invalid-json');

      const result = service.getCustomRenderers();
      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to parse custom renderers from local storage:',
        expect.any(Error),
      );
    });
  });
});

describe('OriginConfirmationDialog', () => {
  let fixture: ComponentFixture<OriginConfirmationDialog>;
  let dialogRef: {close: ReturnType<typeof vi.fn>};
  let harness: OriginConfirmationDialogHarness;

  beforeEach(async () => {
    dialogRef = {close: vi.fn()};
    await TestBed.configureTestingModule({
      imports: [OriginConfirmationDialog],
      providers: [
        provideNoopAnimations(),
        {provide: MAT_DIALOG_DATA, useValue: {origin: 'https://external.example.com'}},
        {provide: MatDialogRef, useValue: dialogRef},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OriginConfirmationDialog);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      OriginConfirmationDialogHarness,
    );
  });

  it('displays dialog title and external origin content', async () => {
    const titleText = await harness.getTitleText();
    const contentText = await harness.getContentText();
    expect(titleText).toBe('Confirm External Renderer Origin');
    expect(contentText).toContain('https://external.example.com');
  });

  it('resolves dialog with true when clicking Allow button', async () => {
    await harness.clickAllow();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('resolves dialog with false when clicking Deny button', async () => {
    await harness.clickDeny();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
