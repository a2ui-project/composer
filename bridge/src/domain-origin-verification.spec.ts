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

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import {DomainOriginVerificationService} from './domain-origin-verification';

describe('DomainOriginVerificationService', () => {
  let originalWindow: unknown;

  beforeEach(() => {
    originalWindow = (globalThis as {window?: unknown}).window;
  });

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as {window?: unknown}).window;
    } else {
      (globalThis as {window?: unknown}).window = originalWindow;
    }
  });

  it('allows matching window.location.origin', () => {
    const parentWin = {} as Window;
    const currentOrigin = 'http://localhost:3000';
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {origin: currentOrigin, search: ''},
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(currentOrigin, parentWin, parentWin),
    ).toBe(true);
  });

  it('rejects if source is not parent', () => {
    const parentWin = {} as Window;
    const otherWin = {} as Window;
    const currentOrigin = 'http://localhost:3000';
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {origin: currentOrigin, search: ''},
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(currentOrigin, otherWin, parentWin),
    ).toBe(false);
  });

  it('rejects dynamic localhost ports if it does not match origin', () => {
    const parentWin = {} as Window;
    const currentOrigin = 'http://localhost:3000';
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {origin: currentOrigin, search: ''},
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(
        'http://localhost:5000',
        parentWin,
        parentWin,
      ),
    ).toBe(false);
  });

  it('rejects sandboxed null origin', () => {
    const parentWin = {} as Window;
    const currentOrigin = 'http://localhost:3000';
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {origin: currentOrigin, search: ''},
    };

    expect(DomainOriginVerificationService.verifyStrictOrigin('null', parentWin, parentWin)).toBe(
      false,
    );
  });

  it('rejects unknown random origins', () => {
    const parentWin = {} as Window;
    const currentOrigin = 'http://localhost:3000';
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {origin: currentOrigin, search: ''},
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin('https://evil.com', parentWin, parentWin),
    ).toBe(false);
  });

  it('allows matching ?origin= value when cross-origin', () => {
    const parentWin = {} as Window;
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {
        origin: 'http://localhost:3000',
        search: '?origin=https://trusted-shell.com',
      },
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(
        'https://trusted-shell.com',
        parentWin,
        parentWin,
      ),
    ).toBe(true);
  });

  it('rejects mismatched ?origin= value', () => {
    const parentWin = {} as Window;
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {
        origin: 'http://localhost:3000',
        search: '?origin=https://trusted-shell.com',
      },
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin('https://evil.com', parentWin, parentWin),
    ).toBe(false);
  });

  it('rejects cross-origin message if ?origin= is missing', () => {
    const parentWin = {} as Window;
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {
        origin: 'http://localhost:3000',
        search: '?theme=dark',
      },
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(
        'https://trusted-shell.com',
        parentWin,
        parentWin,
      ),
    ).toBe(false);
  });

  it('handles malformed query strings gracefully', () => {
    const parentWin = {} as Window;
    (globalThis as unknown as {window: {location: {origin: string; search: string}}}).window = {
      location: {
        origin: 'http://localhost:3000',
        search: '??invalid-query-string%', // URLSearchParams throws on invalid % characters in some environments or handles it silently. We ensure it doesn't crash us.
      },
    };

    expect(
      DomainOriginVerificationService.verifyStrictOrigin('https://evil.com', parentWin, parentWin),
    ).toBe(false);
  });
});
