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
import {Router} from '@angular/router';
import {StartupResolutionService} from './startup-resolution.service';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('StartupResolutionService Task 2.6', () => {
  let service: StartupResolutionService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{provide: Router, useValue: {navigate: vi.fn()}}],
    });
    service = TestBed.inject(StartupResolutionService);
  });

  it('creates the startup resolution service', () => {
    expect(service).toBeTruthy();
  });

  it('fetches static config and enforces lock when overrides are prohibited', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({defaultRendererUrl: 'http://enterprise:3000', allowOverrides: false}),
    } as Response);

    const logSpy = vi.spyOn(console, 'log');
    const url = await service.resolveStartupConfiguration();

    expect(url).toBe('http://enterprise:3000');
    expect(service.isContextLocked()).toBe(true);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Static configuration loaded with allowOverrides: false'),
    );
  });

  it('evaluates query parameters prior to local storage when overrides are allowed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({defaultRendererUrl: 'http://base:3000', allowOverrides: true}),
    } as Response);

    vi.spyOn(service, 'getWindowSearch').mockReturnValue('?renderer=http://query:3000');

    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://query:3000/');
  });

  it('falls back to checking storage when config fetch fails or times out', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Timeout'));
    const warnSpy = vi.spyOn(console, 'warn');

    await service.resolveStartupConfiguration();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Watchdog timeout or failure fetching config.json'),
    );
  });

  it('identifies 3P environment based on hostname or local override flag', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const hostnameSpy = vi.spyOn(service, 'getWindowHostname');

    // Test 1P hostname
    hostnameSpy.mockReturnValue('subdomain.google.com');
    setItemSpy.mockReturnValue(null);
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test apex 1P hostname
    hostnameSpy.mockReturnValue('google.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test 3P hostname
    hostnameSpy.mockReturnValue('external-domain.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test forced 3P flag
    setItemSpy.mockImplementation(key => (key === 'a2ui_composer_force_3p' ? 'true' : null));
    expect(service.isThirdPartyEnvironment()).toBe(true);
  });

  it('evaluates environment validity correctly via isEnvironmentValid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({defaultRendererUrl: 'http://base:3000', allowOverrides: true}),
    } as Response);

    vi.spyOn(service, 'getWindowHostname').mockReturnValue('localhost');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    // Scenario 1: URL resolved, but 3P missing API key -> invalid
    getItemSpy.mockImplementation(key => {
      if (key === 'a2ui_composer_api_key') return null;
      return null;
    });
    await service.resolveStartupConfiguration();
    expect(service.isEnvironmentValid()).toBe(false);

    // Scenario 2: URL resolved, and 3P has API key -> valid
    getItemSpy.mockImplementation(key => {
      if (key === 'a2ui_composer_api_key') return 'AIzaSyValidKey';
      return null;
    });
    expect(service.isEnvironmentValid()).toBe(true);
  });
});
