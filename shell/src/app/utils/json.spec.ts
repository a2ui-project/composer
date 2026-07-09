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
import {tryParseJsonArray, formatJson} from './json';

describe('JSON Array Parser Utilities', () => {
  it('parses valid JSON array strings including whitespace trimming', () => {
    expect(tryParseJsonArray('  [1, 2, 3]  ')).toEqual([1, 2, 3]);
    expect(tryParseJsonArray('["hello", "world"]')).toEqual(['hello', 'world']);
    expect(tryParseJsonArray('[]')).toEqual([]);
  });

  it('returns null safely without throwing on malformed JSON or non-array primitives', () => {
    expect(tryParseJsonArray('  [1, 2, ')).toBeNull();
    expect(tryParseJsonArray('invalid json')).toBeNull();
    expect(tryParseJsonArray('{"not": "an array"}')).toBeNull();
    expect(tryParseJsonArray('"string primitive"')).toBeNull();
    expect(tryParseJsonArray('123')).toBeNull();
  });
});

describe('JSON Formatter Utilities', () => {
  it('formats objects, arrays, and primitives correctly with 2 spaces', () => {
    expect(formatJson({hello: 'world'})).toBe('{\n  "hello": "world"\n}');
    expect(formatJson([1, 2])).toBe('[\n  1,\n  2\n]');
    expect(formatJson('test')).toBe('"test"');
  });
});
