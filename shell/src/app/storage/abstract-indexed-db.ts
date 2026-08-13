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

/**
 * Abstract base class providing common IndexedDB connectivity routines, initialization semantics, and transaction scaffolding mechanisms.
 */
export abstract class AbstractIndexedDbStorage {
  protected abstract readonly dbName: string;
  protected abstract readonly dbVersion: number;
  protected dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initializes and opens the IndexedDB database instance.
   */
  protected async openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof globalThis.indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported'));
        return;
      }
      const request = globalThis.indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.onUpgradeNeeded(db, event);
      };
      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.onversionchange = () => {
          db.close();
          this.dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = (event: Event) => {
        this.dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
    return this.dbPromise;
  }

  protected abstract onUpgradeNeeded(db: IDBDatabase, event: IDBVersionChangeEvent): void;

  /**
   * Executes an IndexedDB transaction, handling lifecycle promises automatically.
   */
  protected async executeTransaction<T>(
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
      tx.oncomplete = () => resolve(requestResult);
      tx.onabort = () => reject(tx.error || new Error('Storage transaction aborted'));
      tx.onerror = () => reject(tx.error || new Error('Storage transaction failed'));
      if (operationRequest) {
        operationRequest.onsuccess = () => (requestResult = operationRequest!.result);
        operationRequest.onerror = () =>
          reject(operationRequest!.error || new Error('Storage operation failed'));
      }
    });
  }
}
