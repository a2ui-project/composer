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
import {StartupResolutionService} from './startup-resolution.service';
import {describe, it, expect, beforeEach, vi} from 'vitest';

import {Router} from '@angular/router';

describe('StartupResolutionService', () => {
  let service: StartupResolutionService;
  let mockRouter: {navigate: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockRouter = {navigate: vi.fn()};
    TestBed.configureTestingModule({
      providers: [{provide: Router, useValue: mockRouter}],
    });
    service = TestBed.inject(StartupResolutionService);
  });

  it('creates the startup resolution service', () => {
    expect(service).toBeTruthy();
  });

  it('fetches static config and enforces lock when overrides are prohibited', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({defaultRendererUrl: 'http://locked:3000', allowOverrides: false}),
    } as Response);

    const url = await service.resolveStartupConfiguration();
    expect(url).toBe('http://locked:3000');
    expect(service.isContextLocked()).toBe(true);
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

  it('redirects to settings page when configuration resolution completely fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Timeout'));
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    await service.resolveStartupConfiguration();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings']);
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

    hostnameSpy.mockReturnValue('googleplex.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test 3P hostname
    hostnameSpy.mockReturnValue('localhost');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test force 3P override
    hostnameSpy.mockReturnValue('subdomain.google.com');
    setItemSpy.mockReturnValue('true');
    expect(service.isThirdPartyEnvironment()).toBe(true);
  });
});
