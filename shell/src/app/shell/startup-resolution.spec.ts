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
import {StartupResolution} from './startup-resolution';
import {LocalStorageInteractions} from '../settings/local-storage-interactions';
import {LocalStorageKey} from '../settings/local-storage-keys';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

describe('StartupResolution Task 2.6', () => {
  let service: StartupResolution;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [StartupResolution, LocalStorageInteractions],
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
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        defaultRendererUrl: 'http://enterprise:3000',
        allowOverrides: false,
      }),
    } as Response);

    const logSpy = vi.spyOn(console, 'log');
    const url = await service.resolveStartupConfiguration();

    expect(url).toBe('http://enterprise:3000');
    expect(service.isContextLocked()).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Static configuration loaded with allowOverrides: false'),
    );
  });

  it('evaluates query params prior to storage when overrides exist', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        defaultRendererUrl: 'http://base:3000',
        allowOverrides: true,
      }),
    } as Response);

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
  });

  it('evaluates environment validity correctly via isEnvironmentValid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        defaultRendererUrl: 'http://base:3000',
        allowOverrides: true,
      }),
    } as Response);

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('localhost');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    // Scenario 1: URL resolved, but 3P missing API key -> invalid
    getItemSpy.mockImplementation(key => {
      if (key === LocalStorageKey.GEMINI_API_KEY) return null;
      return null;
    });
    await service.resolveStartupConfiguration();
    expect(service.isEnvironmentValid()).toBe(false);

    // Scenario 2: URL resolved, and 3P has API key -> valid
    getItemSpy.mockImplementation(key => {
      if (key === LocalStorageKey.GEMINI_API_KEY) return 'AIzaSyValidKey';
      return null;
    });
    expect(service.isEnvironmentValid()).toBe(true);
  });
});
