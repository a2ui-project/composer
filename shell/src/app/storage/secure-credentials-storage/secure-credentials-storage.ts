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

import {Injectable} from '@angular/core';

/**
 * Represents a key-value record stored within the highly secure IndexedDB instance.
 */
export interface CredentialRecord {
  /** The unique credential identifier key. */
  key: string;
  /** Binary Web Crypto AES-GCM encrypted ciphertext. */
  ciphertext: ArrayBuffer;
  /** Random Initialization Vector utilized during encryption. */
  iv: Uint8Array;
}

/** Represents a persistent unextractable Web Crypto master key record. */
export interface MasterKeyRecord {
  /** The unique master key identifier. */
  key: string;
  /** The unextractable Web Crypto CryptoKey instance. */
  value: CryptoKey;
}

/** Unified union type encompassing all cryptographic vault Object Store records. */
export type StorageRecord = CredentialRecord | MasterKeyRecord;

/**
 * Enterprise credential storage service providing secure, asynchronous
 * IndexedDB persistence specifically tailored for sensitive application tokens
 * utilizing Web Crypto AES-GCM binary encryption.
 */
@Injectable({
  providedIn: 'root',
})
export class SecureCredentialsStorage {
  private readonly dbName = 'a2ui_secure_credentials_db';
  private readonly dbVersion = 2;
  private readonly storeName = 'credentials';
  private readonly keysStoreName = 'keys';
  private readonly masterKeyId = 'a2ui_master_key';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private masterKeyPromise: Promise<CryptoKey> | null = null;

  /**
   * Initializes and opens the IndexedDB database instance.
   */
  openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof globalThis.indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this runtime environment.'));
        return;
      }

      const request = globalThis.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {keyPath: 'key'});
          console.log(`Initialized secure credentials object store: ${this.storeName}`);
        }
        if (!db.objectStoreNames.contains(this.keysStoreName)) {
          db.createObjectStore(this.keysStoreName, {keyPath: 'key'});
          console.log(`Initialized master keys object store: ${this.keysStoreName}`);
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onversionchange = () => {
          console.warn(
            'Database version change detected from another tab. Closing database connection.',
          );
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = (event: Event) => {
        this.dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  private async executeTransaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (tx: IDBTransaction) => IDBRequest<T> | void,
  ): Promise<T | void> {
    const db = await this.openDatabase();
    return new Promise<T | void>((resolve, reject) => {
      const tx = db.transaction(storeNames, mode);

      let requestResult: T | void = undefined;
      let operationRequest: IDBRequest<T> | null = null;

      try {
        const res = operation(tx);
        if (res && 'onsuccess' in res) {
          operationRequest = res as IDBRequest<T>;
        }
      } catch (err) {
        reject(err);
        return;
      }

      tx.oncomplete = () => {
        resolve(requestResult);
      };

      tx.onabort = () => reject(tx.error || new Error('Storage transaction aborted'));
      tx.onerror = () => reject(tx.error || new Error('Storage transaction failed'));

      if (operationRequest) {
        operationRequest.onsuccess = () => {
          requestResult = operationRequest!.result;
        };
        operationRequest.onerror = () => {
          reject(operationRequest!.error || new Error('Storage operation failed'));
        };
      }
    });
  }

  /**
   * Retrieves or generates the persistent unextractable AES-GCM master CryptoKey.
   * Memoizes in-flight resolutions to defeat concurrent access race conditions
   * and wraps Web Crypto Subtle primitive invocations inside strict exception boundaries.
   */
  private getOrCreateMasterKey(): Promise<CryptoKey> {
    if (this.masterKeyPromise) {
      return this.masterKeyPromise;
    }

    this.masterKeyPromise = (async () => {
      if (!globalThis.crypto?.subtle) {
        throw new Error(
          'Web Crypto API (crypto.subtle) is not available. Ensure the application is running in a secure context (HTTPS or localhost).',
        );
      }
      try {
        const keyRecord = await this.executeTransaction<MasterKeyRecord | undefined>(
          this.keysStoreName,
          'readonly',
          tx => tx.objectStore(this.keysStoreName).get(this.masterKeyId),
        );

        if (keyRecord && keyRecord.value) {
          return keyRecord.value;
        }

        const newKey = await globalThis.crypto.subtle.generateKey(
          {name: 'AES-GCM', length: 256},
          false, // Strictly enforce extractable: false
          ['encrypt', 'decrypt'],
        );

        await this.executeTransaction<void>(this.keysStoreName, 'readwrite', tx => {
          tx.objectStore(this.keysStoreName).put({
            key: this.masterKeyId,
            value: newKey,
          });
        });

        return newKey;
      } catch (err) {
        this.masterKeyPromise = null;
        this.dbPromise = null;
        console.error('Failed to synthesize or persist unextractable Web Crypto master key', err);
        throw new Error('Cryptographic master key generation failed.');
      }
    })();

    return this.masterKeyPromise;
  }

  /**
   * Retrieves and decrypts a credential by key from IndexedDB.
   * Strictly enforces AES-GCM binary ciphertext decryption or returns null.
   */
  async getCredential(key: string): Promise<string | null> {
    const record = await this.executeTransaction<CredentialRecord | undefined>(
      this.storeName,
      'readonly',
      tx => tx.objectStore(this.storeName).get(key),
    );

    if (!record || !record.ciphertext || !record.iv) {
      return null;
    }

    try {
      const masterKey = await this.getOrCreateMasterKey();
      const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
        {name: 'AES-GCM', iv: record.iv as BufferSource},
        masterKey,
        record.ciphertext as BufferSource,
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch (err) {
      console.warn(`Cryptographic decryption failed for key: ${key}`, err);
      return null;
    }
  }

  /**
   * Encrypts and persists a credential key/value pair in IndexedDB utilizing AES-GCM.
   * Wraps Subtle encryption primitive inside explicit exception handling blocks.
   */
  async setCredential(key: string, value: string): Promise<void> {
    const masterKey = await this.getOrCreateMasterKey();
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const encodedValue = new TextEncoder().encode(value);

    let ciphertext: ArrayBuffer;
    try {
      ciphertext = await globalThis.crypto.subtle.encrypt(
        {name: 'AES-GCM', iv: iv as BufferSource},
        masterKey,
        encodedValue as BufferSource,
      );
    } catch (err) {
      console.error(
        `Cryptographic encryption failed during token persistence for key: ${key}`,
        err,
      );
      throw new Error('Failed to encrypt credentials token.');
    }

    await this.executeTransaction<void>(this.storeName, 'readwrite', tx => {
      tx.objectStore(this.storeName).put({key, ciphertext, iv});
    });
  }

  /**
   * Deletes a credential from IndexedDB.
   */
  async removeCredential(key: string): Promise<void> {
    await this.executeTransaction<void>(this.storeName, 'readwrite', tx => {
      tx.objectStore(this.storeName).delete(key);
    });
  }
}
