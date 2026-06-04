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
import {IndexedDbStorageService} from './indexed-db-storage';
import {CachedCatalogRecord} from './catalog-storage.model';
import {describe, it, expect, beforeEach, vi} from 'vitest';

class FakeIDBRequest {
  result: unknown;
  error: unknown;
  onsuccess: ((event?: unknown) => void) | null = null;
  onerror: ((event?: unknown) => void) | null = null;
}

class FakeIDBOpenDBRequest extends FakeIDBRequest {
  onupgradeneeded: ((event: unknown) => void) | null = null;
}

class FakeIDBObjectStore {
  constructor(
    private storeMap: Map<string, CachedCatalogRecord>,
    private onPut?: (
      record: CachedCatalogRecord,
      req: FakeIDBRequest,
      tx: FakeIDBTransaction,
    ) => boolean,
  ) {}

  get(key: string) {
    const req = new FakeIDBRequest();
    setTimeout(() => {
      req.result = this.storeMap.get(key);
      req.onsuccess?.();
    }, 0);
    return req;
  }

  getAll() {
    const req = new FakeIDBRequest();
    setTimeout(() => {
      req.result = Array.from(this.storeMap.values());
      req.onsuccess?.();
    }, 0);
    return req;
  }

  put(record: CachedCatalogRecord) {
    const req = new FakeIDBRequest();
    setTimeout(() => {
      if (
        this.onPut &&
        !this.onPut(record, req, (this as unknown as {tx: FakeIDBTransaction}).tx)
      ) {
        return;
      }
      this.storeMap.set(record.rendererUrl, record);
      req.onsuccess?.();
    }, 0);
    return req;
  }

  delete(key: string) {
    const req = new FakeIDBRequest();
    setTimeout(() => {
      this.storeMap.delete(key);
      req.onsuccess?.();
    }, 0);
    return req;
  }

  clear() {
    const req = new FakeIDBRequest();
    setTimeout(() => {
      this.storeMap.clear();
      req.onsuccess?.();
    }, 0);
    return req;
  }
}

class FakeIDBTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  error: unknown;

  constructor(
    private storeInstance: FakeIDBObjectStore,
    private onTxCreated?: (tx: FakeIDBTransaction) => void,
  ) {
    (storeInstance as unknown as {tx: FakeIDBTransaction}).tx = this;
    if (onTxCreated) {
      onTxCreated(this);
    } else {
      setTimeout(() => {
        if (!this.error) {
          this.oncomplete?.();
        }
      }, 10);
    }
  }

  objectStore() {
    return this.storeInstance;
  }
}

class FakeIDBDatabase {
  objectStoreNames = {
    contains: () => false,
  };

  constructor(
    private storeMap: Map<string, CachedCatalogRecord>,
    private onPut?: (
      record: CachedCatalogRecord,
      req: FakeIDBRequest,
      tx: FakeIDBTransaction,
    ) => boolean,
    private onTxCreated?: (tx: FakeIDBTransaction) => void,
  ) {}

  createObjectStore() {}

  transaction() {
    return new FakeIDBTransaction(
      new FakeIDBObjectStore(this.storeMap, this.onPut),
      this.onTxCreated,
    );
  }
}

class FakeIndexedDB {
  constructor(
    private storeMap: Map<string, CachedCatalogRecord>,
    private onPut?: (
      record: CachedCatalogRecord,
      req: FakeIDBRequest,
      tx: FakeIDBTransaction,
    ) => boolean,
    private onTxCreated?: (tx: FakeIDBTransaction) => void,
  ) {}

  open() {
    const req = new FakeIDBOpenDBRequest();
    setTimeout(() => {
      const db = new FakeIDBDatabase(this.storeMap, this.onPut, this.onTxCreated);
      req.result = db;
      req.onupgradeneeded?.({target: req} as unknown as IDBVersionChangeEvent);
      req.onsuccess?.({target: req} as unknown as Event);
    }, 0);
    return req;
  }
}

describe('IndexedDbStorageService Storage Resilience', () => {
  let service: IndexedDbStorageService;
  let storeMap: Map<string, CachedCatalogRecord>;

  beforeEach(() => {
    storeMap = new Map();
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap),
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDbStorageService);
  });

  it('creates the resilient storage service', () => {
    expect(service).toBeTruthy();
  });

  it('evicts oldest records exceeding ten distinct origins via LRU tracking', async () => {
    for (let i = 0; i < 10; i++) {
      storeMap.set(`http://origin-${i}:3000`, {
        rendererUrl: `http://origin-${i}:3000`,
        catalogString: '{}',
        checksumHash: 'hash',
        lastAccessed: 1000 + i,
      });
    }

    const newRecord: CachedCatalogRecord = {
      rendererUrl: 'http://origin-new:3000',
      catalogString: '{}',
      checksumHash: 'hash',
      lastAccessed: 2000,
    };

    await service.saveCatalogRecord(newRecord);

    expect(storeMap.has('http://origin-0:3000')).toBe(false);
    expect(storeMap.has('http://origin-new:3000')).toBe(true);
  });

  it('evicts multiple records within a single write transaction', async () => {
    for (let i = 0; i < 12; i++) {
      storeMap.set(`http://origin-${i}:3000`, {
        rendererUrl: `http://origin-${i}:3000`,
        catalogString: '{}',
        checksumHash: 'hash',
        lastAccessed: 1000 + i,
      });
    }

    let transactionCount = 0;
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap, undefined, tx => {
        transactionCount++;
        setTimeout(() => tx.oncomplete?.(), 10);
      }),
      writable: true,
      configurable: true,
    });

    const newRecord: CachedCatalogRecord = {
      rendererUrl: 'http://origin-new:3000',
      catalogString: '{}',
      checksumHash: 'hash',
      lastAccessed: 2000,
    };

    await service.saveCatalogRecord(newRecord);

    expect(transactionCount).toBe(3);
    expect(storeMap.has('http://origin-0:3000')).toBe(false);
    expect(storeMap.has('http://origin-1:3000')).toBe(false);
    expect(storeMap.has('http://origin-2:3000')).toBe(false);
    expect(storeMap.has('http://origin-3:3000')).toBe(true);
    expect(storeMap.has('http://origin-new:3000')).toBe(true);
  });

  it('rolls back transaction and evicts down to three most recent upon initial quota error', async () => {
    for (let i = 0; i < 5; i++) {
      storeMap.set(`http://quota-${i}:3000`, {
        rendererUrl: `http://quota-${i}:3000`,
        catalogString: '{}',
        checksumHash: 'hash',
        lastAccessed: 1000 + i,
      });
    }

    let putCalls = 0;
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap, (record, req, tx) => {
        putCalls++;
        if (putCalls === 1) {
          const err = new Error('QuotaExceededError');
          err.name = 'QuotaExceededError';
          tx.error = err;
          setTimeout(() => tx.onerror?.(), 0);
          return false;
        }
        setTimeout(() => tx.oncomplete?.(), 0);
        return true;
      }),
      writable: true,
      configurable: true,
    });

    const warnSpy = vi.spyOn(console, 'warn');

    const newRecord: CachedCatalogRecord = {
      rendererUrl: 'http://target:3000',
      catalogString: '{}',
      checksumHash: 'hash',
      lastAccessed: 2000,
    };

    await service.saveCatalogRecord(newRecord);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('QuotaExceededError encountered during write transaction'),
    );
    expect(storeMap.size).toBe(3);
    expect(storeMap.has('http://target:3000')).toBe(true);
  });

  it('flushes all records upon double quota failure', async () => {
    let putCalls = 0;
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap, (record, req, tx) => {
        putCalls++;
        if (putCalls <= 2) {
          const err = new Error('QuotaExceededError');
          err.name = 'QuotaExceededError';
          tx.error = err;
          setTimeout(() => tx.onerror?.(), 0);
          return false;
        }
        setTimeout(() => tx.oncomplete?.(), 0);
        return true;
      }),
      writable: true,
      configurable: true,
    });

    const errorSpy = vi.spyOn(console, 'error');

    const newRecord: CachedCatalogRecord = {
      rendererUrl: 'http://double:3000',
      catalogString: '{}',
      checksumHash: 'hash',
      lastAccessed: 2000,
    };

    await service.saveCatalogRecord(newRecord);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Extreme second QuotaExceededError encountered'),
    );
    expect(storeMap.size).toBe(1);
    expect(storeMap.has('http://double:3000')).toBe(true);
  });

  it('rejects database access when indexedDB global is missing', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    await expect(service.openDatabase()).rejects.toThrow('IndexedDB is not supported');
  });

  it('abstracts storage boundaries via interface level spies', async () => {
    storeMap.set('http://local:3000', {
      rendererUrl: 'http://local:3000',
      catalogString: '{"items":[]}',
      checksumHash: 'hash',
      lastAccessed: 12345,
    });

    const record = await service.getCatalogRecord('http://local:3000');
    expect(record).not.toBeNull();
    expect(record?.rendererUrl).toBe('http://local:3000');
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

  it('rejects the returned promise when a flush all transaction is aborted to prevent promise hanging', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap, undefined, tx => {
        const err = new DOMException(
          'Clear transaction aborted due to storage locks',
          'AbortError',
        );
        tx.error = err;
        setTimeout(() => tx.onabort?.(), 0);
      }),
      writable: true,
      configurable: true,
    });

    await expect(service.flushAllRecords()).rejects.toThrow(
      'Clear transaction aborted due to storage locks',
    );
  });

  it('rejects the returned promise when a get single transaction is aborted to prevent promise hanging', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap, undefined, tx => {
        const err = new DOMException('Get single transaction aborted transiently', 'AbortError');
        tx.error = err;
        setTimeout(() => tx.onabort?.(), 0);
      }),
      writable: true,
      configurable: true,
    });

    await expect(service.getCatalogRecord('http://target:3000')).rejects.toThrow(
      'Get single transaction aborted transiently',
    );
  });

  it('rejects the returned promise when a get all transaction is aborted to prevent promise hanging', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMap, undefined, tx => {
        const err = new DOMException('Get all transaction aborted transiently', 'AbortError');
        tx.error = err;
        setTimeout(() => tx.onabort?.(), 0);
      }),
      writable: true,
      configurable: true,
    });

    await expect(service.getAllCatalogRecords()).rejects.toThrow(
      'Get all transaction aborted transiently',
    );
  });
});
