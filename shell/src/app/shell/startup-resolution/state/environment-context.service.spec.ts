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

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {EnvironmentContextService} from './environment-context.service';
import {LocalStorageInteractions} from '../../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../../storage/models/local-storage-keys';

describe('EnvironmentContextService', () => {
  let service: EnvironmentContextService;
  let mockLocalStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

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
        {provide: LocalStorageInteractions, useValue: mockLocalStorage},
      ],
    });
    service = TestBed.inject(EnvironmentContextService);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  describe('resolveRendererUrl', () => {
    let base: HTMLBaseElement | undefined;

    afterEach(() => {
      base?.remove();
      base = undefined;
    });

    function serveComposerFrom(href: string): void {
      base = document.createElement('base');
      base.href = href;
      document.head.appendChild(base);
    }

    it('keeps an absolute URL', () => {
      serveComposerFrom('https://example.com/composer/');
      expect(service.resolveRendererUrl('https://renderer.example/app/').href).toBe(
        'https://renderer.example/app/',
      );
    });

    it('resolves a root-relative URL against the origin', () => {
      serveComposerFrom('https://example.com/composer/pr/7/');
      expect(service.resolveRendererUrl('/renderer/').href).toBe('https://example.com/renderer/');
    });

    it('resolves a page-relative URL under the path Composer is served from', () => {
      serveComposerFrom('https://example.com/composer/pr/7/');
      expect(service.resolveRendererUrl('samples/bundled-renderer/').href).toBe(
        'https://example.com/composer/pr/7/samples/bundled-renderer/',
      );
    });

    it('throws for a URL that cannot be parsed', () => {
      expect(() => service.resolveRendererUrl('http://')).toThrow(TypeError);
    });
  });

  it('determines if environment is localhost', () => {
    expect(service.isLocalhost('localhost')).toBe(true);
    expect(service.isLocalhost('127.0.0.1')).toBe(true);
    expect(service.isLocalhost('google.com')).toBe(false);
  });

  it('identifies 3P environment strictly based on hostname regardless of auth overrides', () => {
    const hostnameSpy = vi.spyOn(service, 'getWindowHostname');
    mockLocalStorage.getItem.mockReturnValue(null);

    // Test 1P .google.com subdomain
    hostnameSpy.mockReturnValue('subdomain.google.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test 1P .googleplex.com subdomain
    hostnameSpy.mockReturnValue('subdomain.googleplex.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test 1P .googlers.com subdomain
    hostnameSpy.mockReturnValue('subdomain.googlers.com');
    expect(service.isThirdPartyEnvironment()).toBe(false);

    // Test bare apex domains (treated as 3P since 1P hosts always have a subdomain)
    hostnameSpy.mockReturnValue('google.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    hostnameSpy.mockReturnValue('googleplex.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    hostnameSpy.mockReturnValue('googlers.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Test 3P hostname
    hostnameSpy.mockReturnValue('external-domain.com');
    expect(service.isThirdPartyEnvironment()).toBe(true);

    // Auth override flags in localStorage do not change host environment classification
    hostnameSpy.mockReturnValue('subdomain.google.com');
    mockLocalStorage.getItem.mockImplementation((key: string) =>
      key === LocalStorageKey.FORCE_3P ? 'true' : null,
    );
    expect(service.isThirdPartyEnvironment()).toBe(false);

    hostnameSpy.mockReturnValue('external-domain.com');
    mockLocalStorage.getItem.mockImplementation((key: string) =>
      key === LocalStorageKey.FORCE_1P ? 'true' : null,
    );
    expect(service.isThirdPartyEnvironment()).toBe(true);
  });

  it('correctly evaluates isExtensionMode based on query param and storage', () => {
    const searchSpy = vi.spyOn(service, 'getWindowSearch');

    searchSpy.mockReturnValue('');
    mockLocalStorage.getItem.mockReturnValue(null);
    expect(service.isExtensionMode()).toBe(false);

    searchSpy.mockReturnValue('?extension=true');
    expect(service.isExtensionMode()).toBe(true);

    searchSpy.mockReturnValue('');
    mockLocalStorage.getItem.mockImplementation((key: string) =>
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
