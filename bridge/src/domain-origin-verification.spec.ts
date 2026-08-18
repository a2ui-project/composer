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

import {describe, it, expect} from 'vitest';
import {DomainOriginVerificationService} from './domain-origin-verification';

describe('DomainOriginVerificationService', () => {
  it('allows matching window.location.origin', () => {
    const parentWin = {} as Window;
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    if (typeof window === 'undefined') {
      (globalThis as unknown as {window: {location: {origin: string}}}).window = {
        location: {origin: currentOrigin},
      };
    }

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(currentOrigin, parentWin, parentWin),
    ).toBe(true);
  });

  it('rejects if source is not parent', () => {
    const parentWin = {} as Window;
    const otherWin = {} as Window;
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    expect(
      DomainOriginVerificationService.verifyStrictOrigin(currentOrigin, otherWin, parentWin),
    ).toBe(false);
  });

  it('rejects dynamic localhost ports if it does not match origin', () => {
    const parentWin = {} as Window;
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
    expect(DomainOriginVerificationService.verifyStrictOrigin('null', parentWin, parentWin)).toBe(
      false,
    );
  });

  it('rejects unknown random origins', () => {
    const parentWin = {} as Window;
    expect(
      DomainOriginVerificationService.verifyStrictOrigin('https://evil.com', parentWin, parentWin),
    ).toBe(false);
  });
});
