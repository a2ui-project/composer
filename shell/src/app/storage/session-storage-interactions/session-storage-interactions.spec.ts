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
import {SessionStorageInteractions} from './session-storage-interactions';
import {describe, it, expect, beforeEach, afterEach, vi, SpyInstance} from 'vitest';

describe('SessionStorageInteractions Specification Context', () => {
  let service: SessionStorageInteractions;
  let getItemSpy: SpyInstance;
  let setItemSpy: SpyInstance;
  let removeItemSpy: SpyInstance;
  let clearSpy: SpyInstance;

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    clearSpy = vi.spyOn(Storage.prototype, 'clear');

    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageInteractions);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('instantiates the session storage service successfully', () => {
    expect(service).toBeTruthy();
  });

  it('delegates getItem to underlying storage correctly', () => {
    getItemSpy.mockReturnValue('stored-val');
    expect(service.getItem('test-key')).toBe('stored-val');
    expect(getItemSpy).toHaveBeenCalledWith('test-key');
  });

  it('returns null and catches exception when getItem throws', () => {
    getItemSpy.mockImplementation(() => {
      throw new Error('Storage Exception');
    });
    expect(service.getItem('test-key')).toBeNull();
  });

  it('delegates setItem to underlying storage correctly', () => {
    setItemSpy.mockImplementation(() => {});
    service.setItem('test-key', 'payload');
    expect(setItemSpy).toHaveBeenCalledWith('test-key', 'payload');
  });

  it('catches exception gracefully when setItem throws', () => {
    setItemSpy.mockImplementation(() => {
      throw new Error('Storage Quota Exceeded Exception');
    });
    expect(() => service.setItem('test-key', 'payload')).not.toThrow();
  });

  it('delegates removeItem to underlying storage correctly', () => {
    removeItemSpy.mockImplementation(() => {});
    service.removeItem('test-key');
    expect(removeItemSpy).toHaveBeenCalledWith('test-key');
  });

  it('catches exception gracefully when removeItem throws', () => {
    removeItemSpy.mockImplementation(() => {
      throw new Error('Storage Exception');
    });
    expect(() => service.removeItem('test-key')).not.toThrow();
  });

  it('delegates clear to underlying storage correctly', () => {
    clearSpy.mockImplementation(() => {});
    service.clear();
    expect(clearSpy).toHaveBeenCalled();
  });

  it('catches exception gracefully when clear throws', () => {
    clearSpy.mockImplementation(() => {
      throw new Error('Storage Exception');
    });
    expect(() => service.clear()).not.toThrow();
  });

  describe('SSR Resilience Context', () => {
    beforeEach(() => {
      // Mock window.sessionStorage getter to throw an error, simulating
      // security lockout or SSR undefined contexts.
      vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
        throw new Error('sessionStorage is not defined in this environment');
      });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [SessionStorageInteractions],
      });
      service = TestBed.inject(SessionStorageInteractions);
    });
    it('handles missing storage reference gracefully', () => {
      expect(service.getItem('key')).toBeNull();
      expect(() => service.setItem('key', 'val')).not.toThrow();
      expect(() => service.removeItem('key')).not.toThrow();
      expect(() => service.clear()).not.toThrow();
    });
  });
});
