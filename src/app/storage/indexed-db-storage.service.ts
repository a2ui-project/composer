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
import {CachedCatalogRecord} from './catalog-storage.model';

@Injectable({
  providedIn: 'root',
})
/**
 * Core database service providing low-level asynchronous storage access
 * to local IndexedDB instances for schema and catalog caching.
 */
export class IndexedDbStorageService {
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

  async getCatalogRecord(rendererUrl: string): Promise<CachedCatalogRecord | null> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(rendererUrl);

      request.onsuccess = () => {
        const record = request.result as CachedCatalogRecord | undefined;
        resolve(record || null);
      };

      request.onerror = () => reject(request.error);
    });
  }
}
