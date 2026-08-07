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

import {afterEach, describe, expect, it, vi} from 'vitest';
import {generateUuid} from './uuid';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('generateUuid', () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  });

  it('generates valid RFC4122 v4 UUID using crypto.randomUUID when available', () => {
    const uuid = generateUuid();
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it('produces unique UUIDs across consecutive invocations', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateUuid());
    }
    expect(ids.size).toBe(100);
  });

  it('falls back to crypto.getRandomValues when crypto.randomUUID is undefined', () => {
    const mockGetRandomValues = vi.fn((buffer: Uint8Array) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = (i * 17 + 5) & 0xff;
      }
      return buffer;
    });

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: mockGetRandomValues,
        randomUUID: undefined,
      },
      configurable: true,
      writable: true,
    });

    const uuid = generateUuid();
    expect(mockGetRandomValues).toHaveBeenCalled();
    expect(uuid).toMatch(UUID_V4_REGEX);
  });

  it('falls back to Math.random when crypto is undefined', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const uuid = generateUuid();
    expect(uuid).toMatch(UUID_V4_REGEX);
  });
});
