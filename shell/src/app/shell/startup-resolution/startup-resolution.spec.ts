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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

class MockAppConfigProvider {
  geminiApiKey = signal<string>('');
  purgeGeminiApiKey = vi.fn().mockResolvedValue(undefined);
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
      defaultRendererUrl: 'http://enterprise:3000',
      allowOverrides: false,
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
            defaultRendererUrl: 'http://lf:3000',
            allowOverrides: true,
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
            defaultRendererUrl: 'http://crlf:3000',
            allowOverrides: true,
          }),
      ),
    );
    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://crlf:3000');
  });

  it('evaluates query params prior to storage when overrides exist', async () => {
    mockFetchConfig({
      defaultRendererUrl: 'http://base:3000',
      allowOverrides: true,
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

  it('identifies 3P environment based on hostname or local overrides', () => {
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
      defaultRendererUrl: 'http://base:3000',
      allowOverrides: true,
    });

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('localhost');

    // Scenario 1: URL resolved, and 3P missing API key -> valid
    await service.resolveStartupConfiguration();
    expect(await service.isEnvironmentValid()).toBe(true);

    // Scenario 2: URL resolved, and 3P has API key -> valid
    mockConfigProvider.geminiApiKey.set('AIzaSyValidKey');
    expect(await service.isEnvironmentValid()).toBe(true);
  });

  it('purges Gemini API key via AppConfigProvider when operating in 1P environments', async () => {
    mockFetchConfig({
      defaultRendererUrl: 'http://base:3000',
      allowOverrides: true,
    });

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('google.com');

    await service.resolveStartupConfiguration();

    expect(mockConfigProvider.purgeGeminiApiKey).toHaveBeenCalled();
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

  it('skips query and storage evaluations when context is already locked from prior run', async () => {
    mockFetchConfig({
      defaultRendererUrl: 'http://enterprise:3000',
      allowOverrides: false,
    });
    await service.resolveStartupConfiguration(); // locks context

    // Second run, config fetch fails, but context is locked
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');
    localStorage.setItem(LocalStorageKey.RENDERER_URL, 'http://storage:3000');
    const url = await service.resolveStartupConfiguration();

    // Stays with enterprise URL
    expect(url).toBe('http://enterprise:3000');
  });

  it('returns window search and hostname safely', () => {
    expect(typeof service.getWindowSearch()).toBe('string');
    expect(typeof service.getWindowHostname()).toBe('string');
  });
});
