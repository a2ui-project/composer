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
import {AbstractIndexedDbStorage} from '../abstract-indexed-db';
import {CachedCatalogRecord} from '../models/catalog-storage.model';

/**
 * Core database service providing low-level asynchronous storage access
 * to local IndexedDB instances for schema and catalog caching.
 */
@Injectable({providedIn: 'root'})
export class IndexedDbStorage extends AbstractIndexedDbStorage {
  protected readonly dbName = 'a2ui_composer_db';
  protected readonly dbVersion = 1;
  protected readonly storeName = 'catalogs';

  /**
   * Handles database schema upgrades.
   */
  protected onUpgradeNeeded(db: IDBDatabase, _event: IDBVersionChangeEvent): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      db.createObjectStore(this.storeName, {keyPath: 'rendererUrl'});
    }
  }

  /**
   * Retrieves a cached catalog record by renderer URL.
   */
  async getCatalogRecord(rendererUrl: string): Promise<CachedCatalogRecord | null> {
    const result = await this.executeTransaction<CachedCatalogRecord | undefined>(
      this.storeName,
      'readonly',
      tx => tx.objectStore(this.storeName).get(rendererUrl),
    );
    return result || null;
  }

  /**
   * Saves a catalog record, enforcing quota limits and LRU behavior.
   */
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

  protected async executeAtomicWrite(record: CachedCatalogRecord): Promise<void> {
    await this.executeTransaction<void>(this.storeName, 'readwrite', tx => {
      tx.objectStore(this.storeName).put(record);
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

      await this.executeTransaction<void>(this.storeName, 'readwrite', tx => {
        for (const r of recordsToEvict) {
          tx.objectStore(this.storeName).delete(r.rendererUrl);
          console.log(`Evicted oldest catalog record via LRU policy: ${r.rendererUrl}`);
        }
      });
    }
  }

  /**
   * Retrieves all currently cached catalog records.
   */
  async getAllCatalogRecords(): Promise<CachedCatalogRecord[]> {
    const result = await this.executeTransaction<CachedCatalogRecord[]>(
      this.storeName,
      'readonly',
      tx => tx.objectStore(this.storeName).getAll(),
    );
    return result || [];
  }

  /**
   * Flushes all catalog records from storage.
   */
  async flushAllRecords(): Promise<void> {
    await this.executeTransaction<void>(this.storeName, 'readwrite', tx => {
      tx.objectStore(this.storeName).clear();
    });
    console.warn('Successfully flushed all catalog records from storage.');
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
