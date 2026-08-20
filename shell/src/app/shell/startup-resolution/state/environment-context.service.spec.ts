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

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {EnvironmentContextService} from './environment-context.service';
import {IS_1P_AUTH_ENABLED} from '../../environment-tokens/environment-tokens';
import {LocalStorageInteractions} from '../../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../../storage/models/local-storage-keys';

describe('EnvironmentContextService', () => {
  let service: EnvironmentContextService;
  let mockLocalStorage: unknown;

  beforeEach(() => {
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        EnvironmentContextService,
        {provide: IS_1P_AUTH_ENABLED, useValue: true},
        {provide: LocalStorageInteractions, useValue: mockLocalStorage},
      ],
    });
    service = TestBed.inject(EnvironmentContextService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('returns localhost fallback from getBaseOrigin when location origin is undefined', () => {
    vi.stubGlobal('location', {origin: undefined});
    expect(service.getBaseOrigin()).toBe('http://localhost');
    vi.unstubAllGlobals();
  });

  it('determines if environment is localhost', () => {
    expect(service.isLocalhost('localhost')).toBe(true);
    expect(service.isLocalhost('127.0.0.1')).toBe(true);
    expect(service.isLocalhost('google.com')).toBe(false);
  });

  it('evaluates third party environment based on 1p flag', () => {
    vi.spyOn(service, 'getWindowHostname').mockReturnValue('google.com');
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(service.isThirdPartyEnvironment()).toBe(false);
  });

  it('reports third party environment as true when 1P auth is disabled', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        EnvironmentContextService,
        {provide: IS_1P_AUTH_ENABLED, useValue: false},
        {provide: LocalStorageInteractions, useValue: mockLocalStorage},
      ],
    });
    const localService = TestBed.inject(EnvironmentContextService);
    expect(localService.isThirdPartyEnvironment()).toBe(true);
  });

  it('identifies 3P environment based on hostname or local overrides when 1P auth is enabled', () => {
    const hostnameSpy = vi.spyOn(service, 'getWindowHostname');

    // Test 1P hostname
    hostnameSpy.mockReturnValue('subdomain.google.com');
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test apex 1P hostname
    hostnameSpy.mockReturnValue('google.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test 3P hostname
    hostnameSpy.mockReturnValue('external-domain.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test forced 3P flag
    mockLocalStorage.getItem.mockImplementation(key =>
      key === LocalStorageKey.FORCE_3P ? 'true' : null,
    );
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test forced 1P flag
    mockLocalStorage.getItem.mockImplementation(key =>
      key === LocalStorageKey.FORCE_1P ? 'true' : null,
    );
    expect(service.isThirdPartyEnvironment()).toBe(false);
  });

  it('correctly evaluates isExtensionMode based on query param and storage', () => {
    const searchSpy = vi.spyOn(service, 'getWindowSearch');

    searchSpy.mockReturnValue('');
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(service.isExtensionMode()).toBe(false);

    searchSpy.mockReturnValue('?extension=true');
    expect(service.isExtensionMode()).toBe(true);

    searchSpy.mockReturnValue('');
    mockLocalStorage.getItem.mockImplementation(key =>
      key === LocalStorageKey.EXTENSION_MODE ? 'true' : null,
    );
    expect(service.isExtensionMode()).toBe(true);
  });

  it('cleans a2ui parameters from shared URL via history.replaceState', () => {
    vi.stubGlobal('location', {
      href: 'http://localhost/?a2ui=123&other=456#a2ui=789&hash=abc',
    });
    const historySpy = vi.spyOn(globalThis.history, 'replaceState');

    service.cleanSharedA2uiUrl();

    expect(historySpy).toHaveBeenCalledWith({}, '', 'http://localhost/?other=456#hash=abc');

    vi.unstubAllGlobals();
    historySpy.mockRestore();
  });
});
