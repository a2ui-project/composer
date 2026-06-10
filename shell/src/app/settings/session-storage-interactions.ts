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
 * A resilient Angular service encapsulating browser sessionStorage operations.
 * Enforces strict SSR (Server-Side Rendering) safety and encloses all storage calls
 * inside robust try-catch boundaries to prevent unhandled security errors or quota exceptions.
 */
@Injectable({providedIn: 'root'})
export class SessionStorageInteractions {
  private readonly storage: Storage | null = null;

  constructor() {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        this.storage = window.sessionStorage;
      }
    } catch (err) {
      console.warn('Failed to access window.sessionStorage safely in environment:', err);
      this.storage = null;
    }
  }

  /**
   * Retrieves an item from the underlying sessionStorage.
   * @param key Stored item identifier
   * @returns Stored string value or null if non-existent or inaccessible
   */
  public getItem(key: string): string | null {
    if (!this.storage) return null;
    try {
      return this.storage.getItem(key);
    } catch (err) {
      console.warn(`Failed to read key "${key}" from sessionStorage safely:`, err);
      return null;
    }
  }

  /**
   * Persists a key-value string pair in the underlying sessionStorage.
   * @param key Storage key identifier
   * @param value Stored string payload
   */
  public setItem(key: string, value: string): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(key, value);
    } catch (err) {
      console.warn(`Failed to write key "${key}" to sessionStorage safely:`, err);
    }
  }

  /**
   * Removes a specific item from the underlying sessionStorage.
   * @param key Storage key identifier to purge
   */
  public removeItem(key: string): void {
    if (!this.storage) return;
    try {
      this.storage.removeItem(key);
    } catch (err) {
      console.warn(`Failed to remove key "${key}" from sessionStorage safely:`, err);
    }
  }

  /**
   * Clears all stored key-value pairs from the underlying sessionStorage.
   */
  public clear(): void {
    if (!this.storage) return;
    try {
      this.storage.clear();
    } catch (err) {
      console.warn('Failed to clear sessionStorage safely:', err);
    }
  }
}
