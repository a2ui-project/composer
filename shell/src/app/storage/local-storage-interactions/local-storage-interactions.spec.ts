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
import {LocalStorageInteractions} from './local-storage-interactions';
import {LocalStorageKey} from '../models/local-storage-keys';

describe('LocalStorageInteractions Safety Boundaries', () => {
  let service: LocalStorageInteractions;

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'getItem');
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Standard Browser Environment (Storage Available)', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [LocalStorageInteractions],
      });
      service = TestBed.inject(LocalStorageInteractions);
    });

    it('creates the service successfully and maps availability as true', () => {
      expect(service).toBeTruthy();
      expect(service.isStorageAvailable).toBe(true);
    });

    it('safely performs setItem and calls underlying native API', () => {
      service.setItem(LocalStorageKey.THEME_PREFERENCE, 'dark');
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        LocalStorageKey.THEME_PREFERENCE,
        'dark',
      );
      expect(localStorage.getItem(LocalStorageKey.THEME_PREFERENCE)).toBe('dark');
    });

    it('safely performs getItem and retrieves content via native API', () => {
      localStorage.setItem(LocalStorageKey.RENDERER_URL, 'https://renderer.target.com');
      const val = service.getItem(LocalStorageKey.RENDERER_URL);
      expect(Storage.prototype.getItem).toHaveBeenCalledWith(LocalStorageKey.RENDERER_URL);
      expect(val).toBe('https://renderer.target.com');
    });

    it('safely performs removeItem and clears content via native API', () => {
      localStorage.setItem(LocalStorageKey.FORCE_1P, 'true');
      service.removeItem(LocalStorageKey.FORCE_1P);
      expect(Storage.prototype.removeItem).toHaveBeenCalledWith(LocalStorageKey.FORCE_1P);
      expect(localStorage.getItem(LocalStorageKey.FORCE_1P)).toBeNull();
    });
  });

  describe('SSR Server Bootstrap Environment (Storage Unavailable)', () => {
    beforeEach(() => {
      // Mock window.localStorage getter to throw an error, simulating
      // security lockout or SSR undefined contexts.
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new Error('localStorage is not defined in this environment');
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LocalStorageInteractions],
      });
      service = TestBed.inject(LocalStorageInteractions);
    });

    it('creates successfully without throwing and maps availability as false', () => {
      expect(service).toBeTruthy();
      expect(service.isStorageAvailable).toBe(false);
    });

    it('returns null on getItem under storage unavailable contexts safely', () => {
      let value: string | null = 'not-null';
      expect(() => {
        value = service.getItem(LocalStorageKey.THEME_PREFERENCE);
      }).not.toThrow();
      expect(value).toBeNull();
    });

    it('ignores setItem under storage unavailable contexts safely', () => {
      expect(() => {
        service.setItem(LocalStorageKey.THEME_PREFERENCE, 'dark');
      }).not.toThrow();
    });

    it('ignores removeItem under storage unavailable contexts safely', () => {
      expect(() => {
        service.removeItem(LocalStorageKey.THEME_PREFERENCE);
      }).not.toThrow();
    });
  });
});
