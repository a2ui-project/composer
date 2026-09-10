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
import {tryParseJsonArray, formatJson, extractErrorDetails} from './json';

describe('JSON Array Parser Utilities', () => {
  it('parses valid JSON array strings including whitespace trimming', () => {
    expect(tryParseJsonArray('  [1, 2, 3]  ')).toEqual({success: true, data: [1, 2, 3]});
    expect(tryParseJsonArray('["hello", "world"]')).toEqual({
      success: true,
      data: ['hello', 'world'],
    });
    expect(tryParseJsonArray('[]')).toEqual({success: true, data: []});
  });

  it('returns failure safely when input is null or undefined', () => {
    expect(tryParseJsonArray(null)).toEqual({
      success: false,
      data: null,
      error: {message: 'Content is null or undefined'},
    });
    expect(tryParseJsonArray(undefined)).toEqual({
      success: false,
      data: null,
      error: {message: 'Content is null or undefined'},
    });
  });

  it('returns structured errors securely for invalid JSON Lines or primitive values', () => {
    expect(tryParseJsonArray('')).toEqual({
      success: false,
      data: null,
      error: expect.objectContaining({message: 'Content is empty'}),
    });
    expect(tryParseJsonArray('   ')).toEqual({
      success: false,
      data: null,
      error: expect.objectContaining({message: 'Content is empty'}),
    });

    const arrErr = tryParseJsonArray('  [1, 2, ');
    expect(arrErr.success).toBe(false);

    expect(tryParseJsonArray('invalid json').success).toBe(false);
    expect(tryParseJsonArray('"string primitive"').success).toBe(false);
    expect(tryParseJsonArray('123').success).toBe(false);
    expect(tryParseJsonArray('{"a": 1}\n{"b": 2}\ninvalid\n{"c": 3}').success).toBe(false);
    expect(tryParseJsonArray('{"a": 1\n{"b": 2}').success).toBe(false);
    expect(tryParseJsonArray('{"a": 1}\n{ "syntax_error": }').success).toBe(false);
  });

  it('parses a single JSON object as a single-element array', () => {
    expect(tryParseJsonArray('{"not": "an array"}')).toEqual({
      success: true,
      data: [{not: 'an array'}],
    });
    expect(tryParseJsonArray('  {"foo": "bar"}  ')).toEqual({success: true, data: [{foo: 'bar'}]});
  });

  it('parses multiline JSON Lines (JSONL) string into an array of objects', () => {
    expect(tryParseJsonArray('{"a": 1}\n{"b": 2}\n{"c": 3}')).toEqual({
      success: true,
      data: [{a: 1}, {b: 2}, {c: 3}],
    });
  });

  it('parses JSON Lines with leading, trailing, and intermediate blank lines', () => {
    expect(tryParseJsonArray('\n  \n{"a": 1}\n\n  {"b": 2} \n ')).toEqual({
      success: true,
      data: [{a: 1}, {b: 2}],
    });
  });

  it('extracts line and columns out of JSON lines strictly relative to full output', () => {
    const payload = '{"a": 1}\n{"b": 2}\n{"syntax_error": }\n{"d": 4}';
    const result = tryParseJsonArray(payload);

    // @ts-expect-error Types mismatch in tests
    expect(result.success).toBe(false);
    // @ts-expect-error Types mismatch in tests
    expect(result.error.line).toBe(3);
    // @ts-expect-error Types mismatch in tests
    expect(result.error.snippet).toBe('{"syntax_error": }');
  });
});

describe('JSON Formatter Utilities', () => {
  it('formats objects, arrays, and primitives correctly with 2 spaces', () => {
    expect(formatJson({hello: 'world'})).toBe('{\n  "hello": "world"\n}');
    expect(formatJson([1, 2])).toBe('[\n  1,\n  2\n]');
    expect(formatJson('test')).toBe('"test"');
  });
});

describe('extractErrorDetails', () => {
  it('extracts line and column from standard line/column error message format', () => {
    const error = new SyntaxError('JSON Parse error: Unexpected identifier at line 3 column 12');
    const result = extractErrorDetails(error, 'line1\nline2\nline3');
    expect(result).toEqual({line: 3, column: 12});
  });

  it('extracts line and column from V8 position offset on a single line', () => {
    const rawText = '{"key": "val",}';
    // Position 14 points to '}'
    const error = new SyntaxError("Unexpected token '}' at position 14");
    const result = extractErrorDetails(error, rawText);
    expect(result).toEqual({line: 1, column: 15});
  });

  it('calculates correct multiline line and column from V8 position offset', () => {
    // "{\n  \"a\": 1,\n  \"b\": \n}"
    // index 0: {
    // index 1: \n
    // index 2: ' ', 3: ' ', 4: '"', 5: 'a', 6: '"', 7: ':', 8: ' ', 9: '1', 10: ',', 11: '\n'
    // index 12: ' ', 13: ' ', 14: '"', 15: 'b', 16: '"', 17: ':', 18: ' ', 19: '\n'
    // position 19 is '\n' after "b: " -> line 3, column 8
    const rawText = '{\n  "a": 1,\n  "b": \n}';
    const error = new SyntaxError("Unexpected token '\\n' at position 19");
    const result = extractErrorDetails(error, rawText);
    expect(result).toEqual({line: 3, column: 8});
  });

  it('clamps V8 position offset when position exceeds text length', () => {
    const rawText = '{"a": 1}';
    // Length is 8, position 999 exceeds length
    const error = new SyntaxError('Unexpected end of JSON input at position 999');
    const result = extractErrorDetails(error, rawText);
    expect(result).toEqual({line: 1, column: 9});
  });

  it('clamps V8 position offset at index 0 correctly', () => {
    const rawText = 'invalid';
    const error = new SyntaxError("Unexpected token 'i' at position 0");
    const result = extractErrorDetails(error, rawText);
    expect(result).toEqual({line: 1, column: 1});
  });

  it('returns empty object for unrecognized error formats', () => {
    const error = new SyntaxError('Unexpected token');
    const result = extractErrorDetails(error, 'some text');
    expect(result).toEqual({});
  });
});
