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
import {
  SecureCredentialsStorage,
  CredentialRecord,
  MasterKeyRecord,
  StorageRecord,
} from './secure-credentials-storage';
import {SecureCredentialsKey} from '../models/secure-credentials-keys';
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
    private storeMap: Map<string, StorageRecord>,
    private onOperation?: (op: string, arg?: unknown) => void,
  ) {}

  get(key: string) {
    this.onOperation?.('get', key);
    const req = new FakeIDBRequest();
    setTimeout(() => {
      req.result = this.storeMap.get(key);
      req.onsuccess?.();
    }, 0);
    return req;
  }

  put(record: StorageRecord, explicitKey?: string) {
    this.onOperation?.('put', record);
    const req = new FakeIDBRequest();
    setTimeout(() => {
      const targetKey = explicitKey !== undefined ? explicitKey : record && record.key;
      this.storeMap.set(targetKey, record);
      req.onsuccess?.();
    }, 0);
    return req;
  }

  delete(key: string) {
    this.onOperation?.('delete', key);
    const req = new FakeIDBRequest();
    setTimeout(() => {
      this.storeMap.delete(key);
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
    private storeMaps: Map<string, Map<string, StorageRecord>>,
    private txMode: 'success' | 'error' | 'abort' = 'success',
  ) {
    setTimeout(() => {
      if (this.txMode === 'error') {
        this.error = new Error('Simulated Transaction Failure');
        this.onerror?.();
      } else if (this.txMode === 'abort') {
        this.error = new Error('Simulated Transaction Abort');
        this.onabort?.();
      } else {
        this.oncomplete?.();
      }
    }, 10);
  }

  objectStore(name: string) {
    let map = this.storeMaps.get(name);
    if (!map) {
      map = new Map();
      this.storeMaps.set(name, map);
    }
    return new FakeIDBObjectStore(map);
  }
}

class FakeIDBDatabase {
  objectStoreNames = {
    contains: (name: string) => this.storeMaps.has(name),
  };

  constructor(
    private storeMaps: Map<string, Map<string, StorageRecord>>,
    private txMode: 'success' | 'error' | 'abort' = 'success',
  ) {}

  createObjectStore(name: string) {
    if (!this.storeMaps.has(name)) {
      this.storeMaps.set(name, new Map());
    }
    return new FakeIDBObjectStore(this.storeMaps.get(name)!);
  }

  transaction(storeNames: string | string[], mode?: IDBTransactionMode) {
    return new FakeIDBTransaction(this.storeMaps, this.txMode);
  }

  close() {}
}

class FakeIndexedDB {
  constructor(
    private storeMaps: Map<string, Map<string, StorageRecord>>,
    private shouldFailOpen: boolean = false,
    private txMode: 'success' | 'error' | 'abort' = 'success',
  ) {}

  open() {
    const req = new FakeIDBOpenDBRequest();
    setTimeout(() => {
      if (this.shouldFailOpen) {
        req.error = new Error('Simulated Open Failure');
        req.onerror?.({target: req} as unknown as Event);
      } else {
        const db = new FakeIDBDatabase(this.storeMaps, this.txMode);
        req.result = db;
        req.onupgradeneeded?.({
          target: req,
        } as unknown as IDBVersionChangeEvent);
        req.onsuccess?.({target: req} as unknown as Event);
      }
    }, 0);
    return req;
  }
}

describe('SecureCredentialsStorage', () => {
  let service: SecureCredentialsStorage;
  let storeMaps: Map<string, Map<string, StorageRecord>>;
  let credentialsMap: Map<string, StorageRecord>;
  let keysMap: Map<string, StorageRecord>;

  beforeEach(() => {
    storeMaps = new Map();
    credentialsMap = new Map();
    keysMap = new Map();
    storeMaps.set('credentials', credentialsMap);
    storeMaps.set('keys', keysMap);

    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMaps),
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [SecureCredentialsStorage],
    });
    service = TestBed.inject(SecureCredentialsStorage);
  });

  it('creates the service', () => {
    expect(service).toBeTruthy();
  });

  it('sets and retrieves credentials from IndexedDB', async () => {
    await service.setCredential('test-key', 'secure-value');
    const val = await service.getCredential('test-key');
    expect(val).toBe('secure-value');
  });

  it('removes credentials from IndexedDB', async () => {
    await service.setCredential(SecureCredentialsKey.GEMINI_API_KEY, 'secure-value');

    await service.removeCredential(SecureCredentialsKey.GEMINI_API_KEY);

    const val = await service.getCredential(SecureCredentialsKey.GEMINI_API_KEY);
    expect(val).toBeNull();
  });

  it('persists sensitive credentials as Web Crypto ciphertexts and stores non-extractable master keys', async () => {
    await service.setCredential('test_crypto_key', 'SecretTokenXYZ');

    // Assert that the stored record in 'credentials' is encrypted
    const record = credentialsMap.get('test_crypto_key') as CredentialRecord | undefined;
    expect(record).toBeTruthy();
    expect((record as Record<string, unknown>)?.['value']).toBeUndefined(); // Plaintext value should be replaced
    expect(record?.ciphertext?.byteLength).toBeGreaterThan(0);
    expect(record?.iv).toBeInstanceOf(Uint8Array);

    // Assert that a persistent CryptoKey marked extractable: false exists in 'keys'
    const masterKeyRecord = keysMap.get('a2ui_master_key') as MasterKeyRecord | undefined;
    expect(masterKeyRecord).toBeTruthy();
    expect(masterKeyRecord?.value?.type).toBe('secret');
    expect(masterKeyRecord?.value?.algorithm?.name).toBe('AES-GCM');
    expect(masterKeyRecord?.value?.extractable).toBe(false);
  });

  it('returns null when neither IDB nor legacy localStorage has the key', async () => {
    const val = await service.getCredential('non-existent-key');
    expect(val).toBeNull();
  });

  it('rejects storage operations when indexedDB global is missing', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    await expect(service.getCredential('any-key')).rejects.toThrow(
      'IndexedDB is not supported in this runtime environment.',
    );
  });

  it('rejects operations when database fails to open', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMaps, true),
      writable: true,
      configurable: true,
    });

    await expect(service.getCredential('any-key')).rejects.toThrow('Simulated Open Failure');
  });

  it('rejects operations when transactions fail with error', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMaps, false, 'error'),
      writable: true,
      configurable: true,
    });

    await expect(service.removeCredential('any-key')).rejects.toThrow(
      'Simulated Transaction Failure',
    );
  });

  it('rejects operations when transactions are aborted', async () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMaps, false, 'abort'),
      writable: true,
      configurable: true,
    });

    await expect(service.removeCredential('any-key')).rejects.toThrow(
      'Simulated Transaction Abort',
    );
  });

  it('closes database and resets promise when onversionchange is triggered', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    interface MockUpgradableDB {
      close: vi.Mock;
      objectStoreNames: {contains: () => boolean};
      transaction: () => FakeIDBTransaction;
      onversionchange?: () => void;
    }
    let dbInstance: MockUpgradableDB | null = null;

    Object.defineProperty(globalThis, 'indexedDB', {
      value: {
        open: () => {
          const req = new FakeIDBOpenDBRequest();
          setTimeout(() => {
            dbInstance = {
              close: vi.fn(),
              objectStoreNames: {contains: () => true},
              transaction: () => new FakeIDBTransaction(storeMaps),
            };
            req.result = dbInstance as unknown as IDBDatabase;
            req.onsuccess?.({target: req} as unknown as Event);
          }, 0);
          return req;
        },
      },
      writable: true,
      configurable: true,
    });

    await service.openDatabase();
    expect(dbInstance).toBeTruthy();
    expect(dbInstance?.onversionchange).toBeTruthy();

    dbInstance?.onversionchange?.();

    expect(warnSpy).toHaveBeenCalledWith(
      'Database version change detected from another tab. Closing database connection.',
    );
    expect(dbInstance?.close).toHaveBeenCalled();
  });

  it('resets memoized master key promise upon cryptographic key generation failure', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const origGenerateKey = globalThis.crypto.subtle.generateKey;
    globalThis.crypto.subtle.generateKey = vi
      .fn()
      .mockRejectedValue(new Error('Simulated generateKey Failure'));

    await expect(service.setCredential('any-key', 'any-val')).rejects.toThrow(
      'Cryptographic master key generation failed.',
    );
    expect(errSpy).toHaveBeenCalled();

    // Verify memoized promise was cleared by simulating successful subsequent generation
    globalThis.crypto.subtle.generateKey = origGenerateKey;
    await service.setCredential('any-key', 'any-val');
    const record = credentialsMap.get('any-key') as CredentialRecord | undefined;
    expect(record).toBeTruthy();
    expect(record?.ciphertext?.byteLength).toBeGreaterThan(0);

    errSpy.mockRestore();
  });

  it('throws actionable application error when Web Crypto Subtle encryption fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const origEncrypt = globalThis.crypto.subtle.encrypt;
    globalThis.crypto.subtle.encrypt = vi
      .fn()
      .mockRejectedValue(new Error('Simulated Subtle Encrypt Failure'));

    await expect(service.setCredential('any-key', 'any-val')).rejects.toThrow(
      'Failed to encrypt credentials token.',
    );
    expect(errSpy).toHaveBeenCalled();

    globalThis.crypto.subtle.encrypt = origEncrypt;
    errSpy.mockRestore();
  });

  it('retrieves an existing persistent master key from IndexedDB instead of generating a new one', async () => {
    const existingKey = await globalThis.crypto.subtle.generateKey(
      {name: 'AES-GCM', length: 256},
      false,
      ['encrypt', 'decrypt'],
    );
    keysMap.set('a2ui_master_key', {
      key: 'a2ui_master_key',
      value: existingKey,
    });

    const generateKeySpy = vi.spyOn(globalThis.crypto.subtle, 'generateKey');

    const freshService = new SecureCredentialsStorage();
    await freshService.setCredential('fresh-key', 'fresh-val');

    expect(generateKeySpy).not.toHaveBeenCalled();
    const credRecord = credentialsMap.get('fresh-key') as CredentialRecord | undefined;
    expect(credRecord).toBeTruthy();
    expect(credRecord?.ciphertext?.byteLength).toBeGreaterThan(0);

    generateKeySpy.mockRestore();
  });

  it('catches Web Crypto Subtle decryption rejections and returns null', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await service.setCredential('test_corrupted_key', 'ValidToken123');

    const record = credentialsMap.get('test_corrupted_key') as CredentialRecord | undefined;
    if (record) {
      record.ciphertext = new ArrayBuffer(5);
    }

    const val = await service.getCredential('test_corrupted_key');
    expect(val).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Cryptographic decryption failed for key: test_corrupted_key',
      expect.anything(),
    );

    warnSpy.mockRestore();
  });

  it('returns null when IndexedDB record is incomplete or missing ciphertext/value/iv', async () => {
    credentialsMap.set('test_incomplete', {
      key: 'test_incomplete',
    } as unknown as StorageRecord);

    const val = await service.getCredential('test_incomplete');
    expect(val).toBeNull();
  });

  it('resets memoized master key promise when initial IndexedDB read transaction fails', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMaps, false, 'error'),
      writable: true,
      configurable: true,
    });

    const freshService = new SecureCredentialsStorage();
    await expect(freshService.setCredential('any-key', 'any-val')).rejects.toThrow(
      'Cryptographic master key generation failed.',
    );
    expect(errSpy).toHaveBeenCalled();

    Object.defineProperty(globalThis, 'indexedDB', {
      value: new FakeIndexedDB(storeMaps, false, 'success'),
      writable: true,
      configurable: true,
    });

    (freshService as unknown as {dbPromise: null}).dbPromise = null;
    (freshService as unknown as {masterKeyPromise: null}).masterKeyPromise = null;

    await freshService.setCredential('any-key', 'any-val');
    const record = credentialsMap.get('any-key') as CredentialRecord | undefined;
    expect(record).toBeTruthy();
    expect(record?.ciphertext?.byteLength).toBeGreaterThan(0);

    errSpy.mockRestore();
  });
});
