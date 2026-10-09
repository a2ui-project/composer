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

import {Injectable, inject} from '@angular/core';
import {ErrorLogger} from '../../debug/error-logger.service';
import {LocalStorageKey} from '../models/local-storage-keys';

/** Result of `LocalStorageInteractions.readItem()`. */
export type StorageReadResult = {ok: true; value: string | null} | {ok: false};

/**
 * Governs browser local storage interactions.
 * Safely abstracts the low-level API under SSR contexts without crashing.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageInteractions {
  private readonly logger = inject(ErrorLogger).withTag('[Storage]');
  private readonly _isStorageAvailable: boolean;

  constructor() {
    let available = false;
    try {
      available = typeof window !== 'undefined' && !!window.localStorage;
    } catch (e) {
      // Storage access might be denied in some iframe or sandbox contexts.
      this.logger.warn('Local storage access failed to initialize:', e);
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
   * @return The associated string value, or null if the key is absent, storage is unavailable, or
   *     the read failed. Use `readItem()` to distinguish a failed read from a missing key.
   */
  getItem(key: LocalStorageKey): string | null {
    const result = this.readItem(key);
    return result.ok ? result.value : null;
  }

  /**
   * Reads an item from browser local storage, distinguishing a failed read from a missing key.
   *
   * Use this instead of `getItem()` when the caller must avoid follow-up storage operations
   * (e.g. a `setItem()` that would also fail and log a second warning) after a read failure.
   *
   * @param key The strongly-typed local storage key enum.
   * @return `{ok: true, value}` (value is null if the key is absent), or `{ok: false}` if storage
   *     is unavailable or the read threw.
   */
  readItem(key: LocalStorageKey): StorageReadResult {
    if (!this._isStorageAvailable) {
      return {ok: false};
    }
    try {
      return {ok: true, value: window.localStorage.getItem(key)};
    } catch (e) {
      this.logger.warn(`Failed to read key "${key}" from local storage safely:`, e);
      return {ok: false};
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
      window.localStorage.setItem(key, value);
    } catch (e) {
      this.logger.warn(`Failed to write key "${key}" to local storage safely:`, e);
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
      window.localStorage.removeItem(key);
    } catch (e) {
      this.logger.warn(`Failed to remove key "${key}" from local storage safely:`, e);
    }
  }
}
