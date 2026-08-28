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
import {isValidHttpUrl} from './url';

describe('isValidHttpUrl', () => {
  it('returns true for valid http and https URLs', () => {
    expect(isValidHttpUrl('http://localhost:8088')).toBe(true);
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com/path?query=1#hash')).toBe(true);
    expect(isValidHttpUrl('http://127.0.0.1:3000')).toBe(true);
  });

  it('returns false for non-http(s) protocols', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('data:text/html,hello')).toBe(false);
    expect(isValidHttpUrl('file:///path/to/file')).toBe(false);
    expect(isValidHttpUrl('ws://example.com')).toBe(false);
  });

  it('returns false for invalid or empty inputs', () => {
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl('   ')).toBe(false);
    expect(isValidHttpUrl(null)).toBe(false);
    expect(isValidHttpUrl(undefined)).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
    expect(isValidHttpUrl('//example.com')).toBe(false);
  });
});
