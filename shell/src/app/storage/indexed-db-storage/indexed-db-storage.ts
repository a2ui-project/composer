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
import {CachedCatalogRecord} from '../models/catalog-storage.model';

@Injectable({
  providedIn: 'root',
})
/**
 * Core database service providing low-level asynchronous storage access
 * to local IndexedDB instances for schema and catalog caching.
 */
export class IndexedDbStorage {
  private dbName = 'a2ui_composer_db';
  private dbVersion = 1;
  private storeName = 'catalogs';

  private dbPromise: Promise<IDBDatabase> | null = null;

  openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof globalThis.indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = globalThis.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {keyPath: 'rendererUrl'});
          console.log(`Initialized object store: ${this.storeName}`);
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        this.dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  private async executeTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore, tx: IDBTransaction) => IDBRequest<T> | void,
    onComplete?: () => void,
  ): Promise<T | void> {
    const db = await this.openDatabase();
    return new Promise<T | void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const store = tx.objectStore(this.storeName);

      let requestResult: T | void = undefined;
      let operationRequest: IDBRequest<T> | null = null;

      try {
        const res = operation(store, tx);
        if (res && 'onsuccess' in res) {
          operationRequest = res as IDBRequest<T>;
        }
      } catch (err) {
        reject(err);
        return;
      }

      tx.oncomplete = () => {
        if (onComplete) {
          onComplete();
        }
        resolve(requestResult);
      };

      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);

      if (operationRequest) {
        operationRequest.onsuccess = () => {
          requestResult = operationRequest!.result;
        };
        operationRequest.onerror = () => {
          reject(operationRequest!.error);
        };
      }
    });
  }

  async getCatalogRecord(rendererUrl: string): Promise<CachedCatalogRecord | null> {
    const result = await this.executeTransaction<CachedCatalogRecord | undefined>(
      'readonly',
      store => store.get(rendererUrl),
    );
    return result || null;
  }

  async saveCatalogRecord(record: CachedCatalogRecord): Promise<void> {
    record.lastAccessed = Date.now();

    await this.enforceLruCeiling(10, record.rendererUrl);

    try {
      await this.executeAtomicWrite(record);
    } catch (err: unknown) {
      if (this.isQuotaError(err)) {
        console.warn(
          'QuotaExceededError encountered during write transaction. Triggering aggressive evict-down-to-3 fallback.',
        );
        await this.enforceLruCeiling(3, record.rendererUrl);

        try {
          await this.executeAtomicWrite(record);
        } catch (retryErr: unknown) {
          if (this.isQuotaError(retryErr)) {
            console.error(
              'Extreme second QuotaExceededError encountered during retry. Flushing ALL remaining records.',
            );
            await this.flushAllRecords();
            await this.executeAtomicWrite(record);
          } else {
            throw retryErr;
          }
        }
      } else {
        throw err;
      }
    }
  }

  private async executeAtomicWrite(record: CachedCatalogRecord): Promise<void> {
    await this.executeTransaction<void>('readwrite', store => {
      store.put(record);
    });
  }

  private async enforceLruCeiling(maxCapacity: number, keyBeingSaved?: string): Promise<void> {
    const allRecords = await this.getAllCatalogRecords();
    const exists = keyBeingSaved ? allRecords.some(r => r.rendererUrl === keyBeingSaved) : false;
    const targetLimit = exists ? maxCapacity + 1 : maxCapacity;

    if (allRecords.length >= targetLimit) {
      allRecords.sort((a, b) => a.lastAccessed - b.lastAccessed);
      const excessCount = allRecords.length - maxCapacity + 1;
      const recordsToEvict = allRecords.slice(0, excessCount);

      await this.executeTransaction<void>('readwrite', store => {
        for (const r of recordsToEvict) {
          store.delete(r.rendererUrl);
          console.log(`Evicted oldest catalog record via LRU policy: ${r.rendererUrl}`);
        }
      });
    }
  }

  async getAllCatalogRecords(): Promise<CachedCatalogRecord[]> {
    const result = await this.executeTransaction<CachedCatalogRecord[]>('readonly', store =>
      store.getAll(),
    );
    return result || [];
  }

  async flushAllRecords(): Promise<void> {
    await this.executeTransaction<void>(
      'readwrite',
      store => {
        store.clear();
      },
      () => {
        console.warn('Successfully flushed all catalog records from storage.');
      },
    );
  }

  private isQuotaError(err: unknown): boolean {
    return (
      err !== null &&
      typeof err === 'object' &&
      (('name' in err && err.name === 'QuotaExceededError') ||
        ('message' in err &&
          typeof (err as {message?: unknown}).message === 'string' &&
          (err as {message: string}).message.includes('QuotaExceededError')))
    );
  }
}
