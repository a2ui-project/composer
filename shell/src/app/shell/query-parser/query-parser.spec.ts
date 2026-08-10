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

  it('extracts renderer URI string from URL hash fragment', () => {
    const url = QueryParser.parseRendererUrl('#renderer=http://localhost:3000');
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

    it('parses renderer ID from #rendererId hash fragment', () => {
      expect(QueryParser.parseRendererId('#rendererId=dev')).toBe('dev');
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

    it('minifies formatted JSON prior to compression yielding identical output to pre-minified JSON', async () => {
      const formattedJson = '[\n  {\n    "version": "v0.9"\n  }\n]';
      const minifiedJson = '[{"version":"v0.9"}]';
      const encodedFormatted = await QueryParser.encodeSharedPayload(formattedJson);
      const encodedMinified = await QueryParser.encodeSharedPayload(minifiedJson);
      expect(encodedFormatted).toBe(encodedMinified);
    });

    it('throws an error when encoding invalid JSON syntax', async () => {
      await expect(QueryParser.encodeSharedPayload('invalid json {')).rejects.toThrow();
    });

    it('returns empty string when encoding null, undefined, or empty payload', async () => {
      expect(await QueryParser.encodeSharedPayload(null)).toBe('');
      expect(await QueryParser.encodeSharedPayload(undefined)).toBe('');
      expect(await QueryParser.encodeSharedPayload('')).toBe('');
      expect(await QueryParser.encodeSharedPayload('   ')).toBe('');
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
    it('returns payload with null error for valid compressed d1. payload from hash fragment', async () => {
      const originalJson = JSON.stringify([{version: 'v0.9', test: true}]);
      const expectedFormattedJson = JSON.stringify([{version: 'v0.9', test: true}], null, 2);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      const hashString = `#a2ui=${encodeURIComponent(encoded)}`;
      const result = await QueryParser.parseSharedA2ui(hashString);
      expect(result.payload).toBe(expectedFormattedJson);
      expect(result.error).toBeNull();
    });

    it('parses hash fragment without leading # symbol', async () => {
      const originalJson = JSON.stringify([{version: 'v0.9', test: true}]);
      const expectedFormattedJson = JSON.stringify([{version: 'v0.9', test: true}], null, 2);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      const hashString = `a2ui=${encodeURIComponent(encoded)}`;
      const result = await QueryParser.parseSharedA2ui(hashString);
      expect(result.payload).toBe(expectedFormattedJson);
      expect(result.error).toBeNull();
    });

    it('returns truncation error when compressed payload is corrupted or truncated', async () => {
      const rawJson = '{"version":"v0.9"}';
      const encodedJson = encodeURIComponent(rawJson);
      // Intentionally corrupt the string.
      const corruptedJson = encodedJson.slice(0, encodedJson.length - 3);
      const result = await QueryParser.parseSharedA2ui(`#a2ui=d1.${corruptedJson}`);
      expect(result.payload).toBeNull();
      expect(result.error).toContain('truncated or corrupted');
    });

    it('returns invalid JSON syntax error when decompressed payload is malformed JSON', async () => {
      vi.spyOn(QueryParser, 'decodeSharedPayload').mockResolvedValue(
        '[{"version":"v0.9", unclosed:',
      );
      const result = await QueryParser.parseSharedA2ui('#a2ui=d1.mocked_corrupted_json');
      expect(result.payload).toBeNull();
      expect(result.error).toContain('invalid or incomplete JSON syntax');
    });

    it('returns unrecognized format error when payload format is unrecognized in hash fragment', async () => {
      const result = await QueryParser.parseSharedA2ui('#a2ui=unknown-non-json-format');
      expect(result.payload).toBeNull();
      expect(result.error).toContain('unrecognized or corrupted');
    });

    it('returns null payload and null error when hash fragment is missing, empty, or without a2ui param', async () => {
      expect(await QueryParser.parseSharedA2ui(null)).toEqual({payload: null, error: null});
      expect(await QueryParser.parseSharedA2ui(undefined)).toEqual({
        payload: null,
        error: null,
      });
      expect(await QueryParser.parseSharedA2ui('')).toEqual({payload: null, error: null});
      expect(await QueryParser.parseSharedA2ui('#other=value')).toEqual({
        payload: null,
        error: null,
      });
    });
  });
});
