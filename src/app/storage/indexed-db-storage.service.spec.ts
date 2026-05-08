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
import {IndexedDbStorageService} from './indexed-db-storage.service';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('IndexedDbStorageService Basic Initialization', () => {
  let service: IndexedDbStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDbStorageService);
  });

  it('creates the indexed db storage service', () => {
    expect(service).toBeTruthy();
  });

  it('rejects database access when indexedDB global is missing', async () => {
    const originalIdb = globalThis.indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    await expect(service.openDatabase()).rejects.toThrow('IndexedDB is not supported');

    if (originalIdb) {
      Object.defineProperty(globalThis, 'indexedDB', {
        value: originalIdb,
        writable: true,
        configurable: true,
      });
    }
  });

  it('abstracts storage boundaries via interface level spies', async () => {
    const spy = vi.spyOn(service, 'getCatalogRecord').mockResolvedValue(null);
    const record = await service.getCatalogRecord('http://local:3000');
    expect(record).toBeNull();
    expect(spy).toHaveBeenCalledWith('http://local:3000');
  });

  it('allows subsequent openDatabase retries if previous open request failed transiently', async () => {
    let openCount = 0;
    const mockRequest = {} as IDBOpenDBRequest;

    Object.defineProperty(globalThis, 'indexedDB', {
      value: {
        open: vi.fn().mockImplementation(() => {
          openCount++;
          if (openCount === 1) {
            // First call fails transiently
            setTimeout(() => {
              if (mockRequest.onerror) {
                mockRequest.onerror({
                  target: {error: new DOMException('Locked database', 'QuotaExceededError')},
                } as unknown as Event);
              }
            }, 0);
          } else {
            // Second call succeeds
            setTimeout(() => {
              if (mockRequest.onsuccess) {
                mockRequest.onsuccess({
                  target: {result: {} as IDBDatabase},
                } as unknown as Event);
              }
            }, 0);
          }
          return mockRequest;
        }),
      },
      writable: true,
      configurable: true,
    });

    // First attempt rejects due to simulated transient lock
    await expect(service.openDatabase()).rejects.toThrow();

    // Second attempt recovers and succeeds, confirming dbPromise cache was cleared!
    const db = await service.openDatabase();
    expect(db).toBeTruthy();
    expect(openCount).toBe(2);
  });
});
