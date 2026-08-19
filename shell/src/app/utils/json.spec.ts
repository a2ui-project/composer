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

  it('returns null safely when input is null or undefined', () => {
    expect(tryParseJsonArray(null)).toBeNull();
    expect(tryParseJsonArray(undefined)).toBeNull();
  });

  it('returns null safely for invalid JSON Lines or primitive values', () => {
    expect(tryParseJsonArray('')).toBeNull();
    expect(tryParseJsonArray('   ')).toBeNull();
    expect(tryParseJsonArray('  [1, 2, ')).toBeNull();
    expect(tryParseJsonArray('invalid json')).toBeNull();
    expect(tryParseJsonArray('"string primitive"')).toBeNull();
    expect(tryParseJsonArray('123')).toBeNull();
    expect(tryParseJsonArray('{"a": 1}\n{"b": 2}\ninvalid\n{"c": 3}')).toBeNull();
    expect(tryParseJsonArray('{"a": 1\n{"b": 2}')).toBeNull();
    expect(tryParseJsonArray('{"a": 1}\n{ "syntax_error": }')).toBeNull();
  });

  it('parses a single JSON object as a single-element array', () => {
    expect(tryParseJsonArray('{"not": "an array"}')).toEqual([{not: 'an array'}]);
    expect(tryParseJsonArray('  {"foo": "bar"}  ')).toEqual([{foo: 'bar'}]);
  });

  it('parses multiline JSON Lines (JSONL) string into an array of objects', () => {
    expect(tryParseJsonArray('{"a": 1}\n{"b": 2}\n{"c": 3}')).toEqual([{a: 1}, {b: 2}, {c: 3}]);
  });

  it('parses JSON Lines with leading, trailing, and intermediate blank lines', () => {
    expect(tryParseJsonArray('\n  \n{"a": 1}\n\n  {"b": 2} \n ')).toEqual([{a: 1}, {b: 2}]);
  });
});

describe('JSON Formatter Utilities', () => {
  it('formats objects, arrays, and primitives correctly with 2 spaces', () => {
    expect(formatJson({hello: 'world'})).toBe('{\n  "hello": "world"\n}');
    expect(formatJson([1, 2])).toBe('[\n  1,\n  2\n]');
    expect(formatJson('test')).toBe('"test"');
  });
});
