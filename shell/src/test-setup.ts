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

import {getTestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {webcrypto} from 'node:crypto';
import {beforeEach} from 'vitest';

if (typeof window !== 'undefined' && (!window.crypto || !window.crypto.subtle)) {
  Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    writable: true,
  });
}

if (!getTestBed().platform) {
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

beforeEach(() => {
  getTestBed().resetTestingModule();
});

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

if (typeof window !== 'undefined') {
  const localStorageMock = new MockStorage();
  const sessionStorageMock = new MockStorage();

  Object.defineProperty(window, 'localStorage', {value: localStorageMock, writable: true});
  Object.defineProperty(window, 'sessionStorage', {value: sessionStorageMock, writable: true});
  Object.defineProperty(global, 'localStorage', {value: localStorageMock, writable: true});
  Object.defineProperty(global, 'sessionStorage', {value: sessionStorageMock, writable: true});

  Object.defineProperty(global, 'Storage', {value: MockStorage, writable: true});
  Object.defineProperty(window, 'Storage', {value: MockStorage, writable: true});
}
