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

import {QueryParser} from './query-parser';
import {describe, it, expect, vi} from 'vitest';

describe('QueryParser', () => {
  it('extracts the first valid renderer URI string', () => {
    const url = QueryParser.parseRendererUrl('?renderer=http://localhost:3000');
    expect(url).toBe('http://localhost:3000/');
  });

  it('evaluates the first valid instance when multiple renderer parameters exist', () => {
    const url = QueryParser.parseRendererUrl(
      '?renderer=http://first:3000&renderer=http://second:3000',
    );
    expect(url).toBe('http://first:3000/');
  });

  it('strips malformed parameter strings and logs a console warning', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const url = QueryParser.parseRendererUrl('?renderer=not-a-url');
    expect(url).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Malformed renderer parameter string encountered'),
    );
  });

  it('resolves relative renderer paths starting with "/" against window.location.origin', () => {
    // Under Vitest/jsdom, location.origin defaults to http://localhost:3000 or similar.
    const expectedPrefix = globalThis.location?.origin || 'http://localhost';
    const url = QueryParser.parseRendererUrl('?renderer=/samples/ng-basic-catalog/index.html');
    expect(url).toBe(`${expectedPrefix}/samples/ng-basic-catalog/index.html`);
  });

  it('rejects relative renderer paths that do not start with "/"', () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const url = QueryParser.parseRendererUrl('?renderer=samples/ng-basic-catalog/index.html');
    expect(url).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Malformed renderer parameter string encountered'),
    );
  });

  it('returns null when no renderer parameter exists', () => {
    expect(QueryParser.parseRendererUrl('')).toBeNull();
  });

  describe('parseRendererId', () => {
    it('returns null when no rendererId parameter exists', () => {
      expect(QueryParser.parseRendererId('')).toBeNull();
    });

    it('parses renderer ID from ?rendererId query parameter', () => {
      expect(QueryParser.parseRendererId('?rendererId=dev')).toBe('dev');
    });

    it('rejects renderer IDs with invalid characters', () => {
      expect(QueryParser.parseRendererId('?rendererId=testing/invalid')).toBeNull();
      expect(QueryParser.parseRendererId('?rendererId=testing<script>')).toBeNull();
    });
  });

  describe('encodeSharedPayload and decodeSharedPayload', () => {
    it('encodes and decodes an A2UI JSON payload round-trip using deflate-raw', async () => {
      const originalJson = JSON.stringify([
        {version: 'v0.9', createSurface: {surfaceId: 'test-surface'}},
      ]);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      expect(encoded.startsWith('d1.')).toBe(true);
      const decoded = await QueryParser.decodeSharedPayload(encoded);
      expect(decoded).toBe(originalJson);
    });

    it('returns empty string when encoding null, undefined, or empty payload', async () => {
      expect(await QueryParser.encodeSharedPayload(null)).toBe('');
      expect(await QueryParser.encodeSharedPayload(undefined)).toBe('');
      expect(await QueryParser.encodeSharedPayload('')).toBe('');
    });

    it('returns null when decoding invalid, corrupt, or nullish deflate-raw payload', async () => {
      expect(await QueryParser.decodeSharedPayload('not-d1-prefixed')).toBeNull();
      expect(await QueryParser.decodeSharedPayload('d1.invalid_base64_content!!!')).toBeNull();
      expect(await QueryParser.decodeSharedPayload('d1.AAAA')).toBeNull();
      expect(await QueryParser.decodeSharedPayload(null)).toBeNull();
      expect(await QueryParser.decodeSharedPayload(undefined)).toBeNull();
    });

    it('correctly roundtrips a large payload (>100KB) without stack overflow', async () => {
      const largePayload = JSON.stringify([{data: 'x'.repeat(150000)}]);
      const encoded = await QueryParser.encodeSharedPayload(largePayload);
      const decoded = await QueryParser.decodeSharedPayload(encoded);
      expect(decoded).toBe(largePayload);
    });
  });

  describe('parseSharedA2ui', () => {
    it('returns payload with null error for valid compressed d1. payload', async () => {
      const originalJson = JSON.stringify([{version: 'v0.9', test: true}]);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      const searchString = `?a2ui=${encodeURIComponent(encoded)}`;
      const result = await QueryParser.parseSharedA2ui(searchString);
      expect(result.payload).toBe(originalJson);
      expect(result.error).toBeNull();
    });

    it('returns payload with null error for valid uncompressed JSON', async () => {
      const rawJson = '{"version":"v0.9"}';
      const searchString = `?a2ui=${encodeURIComponent(rawJson)}`;
      const result = await QueryParser.parseSharedA2ui(searchString);
      expect(result.payload).toBe(rawJson);
      expect(result.error).toBeNull();
    });

    it('returns truncation error when compressed payload is corrupted or truncated', async () => {
      const rawJson = '{"version":"v0.9"}';
      const encodedJson = encodeURIComponent(rawJson);
      // Intentionally corrupt the string.
      const corruptedJson = encodedJson.slice(0, encodedJson.length - 3);
      const result = await QueryParser.parseSharedA2ui(`?a2ui=d1.${corruptedJson}`);
      expect(result.payload).toBeNull();
      expect(result.error).toContain('truncated or corrupted');
    });

    it('returns invalid JSON syntax error when decompressed payload is malformed JSON', async () => {
      const invalidJsonText = '[{"version":"v0.9", unclosed:';
      const encoded = await QueryParser.encodeSharedPayload(invalidJsonText);
      const result = await QueryParser.parseSharedA2ui(`?a2ui=${encodeURIComponent(encoded)}`);
      expect(result.payload).toBeNull();
      expect(result.error).toContain('invalid or incomplete JSON syntax');
    });

    it('returns invalid JSON syntax error when uncompressed payload is malformed JSON', async () => {
      const result = await QueryParser.parseSharedA2ui('?a2ui=[{"version":"v0.9", bad_syntax');
      expect(result.payload).toBeNull();
      expect(result.error).toContain('invalid or incomplete JSON syntax');
    });

    it('returns unrecognized format error when payload format is unrecognized', async () => {
      const result = await QueryParser.parseSharedA2ui('?a2ui=unknown-non-json-format');
      expect(result.payload).toBeNull();
      expect(result.error).toContain('unrecognized or corrupted');
    });

    it('returns null payload and null error when searchString is missing or empty', async () => {
      expect(await QueryParser.parseSharedA2ui(null)).toEqual({payload: null, error: null});
      expect(await QueryParser.parseSharedA2ui(undefined)).toEqual({
        payload: null,
        error: null,
      });
      expect(await QueryParser.parseSharedA2ui('')).toEqual({payload: null, error: null});
      expect(await QueryParser.parseSharedA2ui('?other=value')).toEqual({
        payload: null,
        error: null,
      });
    });
  });
});
