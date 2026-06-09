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
import {LocalStorageKey} from './local-storage-keys';

/**
 * Governs browser local storage interactions.
 * Safely abstracts the low-level API under SSR contexts without crashing.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageInteractions {
  private readonly _isStorageAvailable: boolean;

  constructor() {
    let available = false;
    try {
      available = typeof window !== 'undefined' && !!window.localStorage;
    } catch (e) {
      // Storage access might be denied in some iframe or sandbox contexts.
      console.warn('Local storage access failed to initialize:', e);
    }
    this._isStorageAvailable = available;
  }

  /**
   * Evaluates baseline availability of browser persistent layers.
   */
  get isStorageAvailable(): boolean {
    return this._isStorageAvailable;
  }

  /**
   * Retrieves an item from browser local storage securely.
   *
   * @param key The strongly-typed local storage key enum.
   * @returns The associated string value, or null if storage is unavailable.
   */
  getItem(key: LocalStorageKey): string | null {
    if (!this._isStorageAvailable) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Failed to read key "${key}" from local storage safely:`, e);
      return null;
    }
  }

  /**
   * Commits and writes an item to local storage.
   *
   * @param key The strongly-typed local storage key enum.
   * @param value The target string value context.
   */
  setItem(key: LocalStorageKey, value: string): void {
    if (!this._isStorageAvailable) {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to write key "${key}" to local storage safely:`, e);
    }
  }

  /**
   * Removes an item from browser local storage safely.
   *
   * @param key The strongly-typed local storage key enum.
   */
  removeItem(key: LocalStorageKey): void {
    if (!this._isStorageAvailable) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Failed to remove key "${key}" from local storage safely:`, e);
    }
  }
}
