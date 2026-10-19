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

import {TestBed} from '@angular/core/testing';
import {QueryParser} from './query-parser';
import {EnvironmentContextService} from '../startup-resolution/state/environment-context.service';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

describe('QueryParser', () => {
  let mockLogger: {
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
  };
  let environmentContext: EnvironmentContextService;
  /** A `<base>` element a test adds to serve Composer from a sub-path. */
  let base: HTMLBaseElement | undefined;

  beforeEach(() => {
    environmentContext = TestBed.inject(EnvironmentContextService);
    mockLogger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    };
  });

  afterEach(() => {
    base?.remove();
    base = undefined;
    vi.restoreAllMocks();
  });

  it('extracts the first valid renderer URI string', () => {
    const url = QueryParser.parseRendererUrl(
      '?renderer=http://localhost:3000',
      environmentContext,
      mockLogger,
    );
    expect(url).toBe('http://localhost:3000/');
  });

  it('extracts renderer URI string from URL hash fragment', () => {
    const url = QueryParser.parseRendererUrl(
      '#renderer=http://localhost:3000',
      environmentContext,
      mockLogger,
    );
    expect(url).toBe('http://localhost:3000/');
  });

  it('evaluates the first valid instance when multiple renderer parameters exist', () => {
    const url = QueryParser.parseRendererUrl(
      '?renderer=http://first:3000&renderer=http://second:3000',
      environmentContext,
      mockLogger,
    );
    expect(url).toBe('http://first:3000/');
  });

  it('strips malformed parameter strings and logs a warning', () => {
    const url = QueryParser.parseRendererUrl('?renderer=http://', environmentContext, mockLogger);
    expect(url).toBeNull();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Malformed renderer parameter string encountered: 'http://'. Stripping invalid URI.",
    );
  });

  it('ignores a renderer parameter that is not an HTTP(S) URL', () => {
    expect(
      QueryParser.parseRendererUrl('?renderer=javascript:alert(1)', environmentContext, mockLogger),
    ).toBeNull();
  });

  it('resolves relative renderer paths starting with "/" against window.location.origin', () => {
    // Under Vitest/jsdom, location.origin defaults to http://localhost:3000 or similar.
    const expectedPrefix = globalThis.location?.origin || 'http://localhost';
    const url = QueryParser.parseRendererUrl(
      '?renderer=/samples/ng-basic-catalog/index.html',
      environmentContext,
      mockLogger,
    );
    expect(url).toBe(`${expectedPrefix}/samples/ng-basic-catalog/index.html`);
  });

  it('resolves a page-relative renderer path under the path Composer is served from', () => {
    base = document.createElement('base');
    base.href = `${globalThis.location.origin}/composer/pr/7/`;
    document.head.appendChild(base);

    const url = QueryParser.parseRendererUrl(
      '?renderer=samples/ng-basic-catalog/',
      environmentContext,
      mockLogger,
    );

    expect(url).toBe(`${globalThis.location.origin}/composer/pr/7/samples/ng-basic-catalog/`);
  });

  it('returns null when no renderer parameter exists', () => {
    expect(QueryParser.parseRendererUrl('', environmentContext, mockLogger)).toBeNull();
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
      const decoded = await QueryParser.decodeSharedPayload(encoded, mockLogger);
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
      expect(await QueryParser.decodeSharedPayload('not-d1-prefixed', mockLogger)).toBeNull();
      expect(
        await QueryParser.decodeSharedPayload('d1.invalid_base64_content!!!', mockLogger),
      ).toBeNull();
      expect(await QueryParser.decodeSharedPayload('d1.AAAA', mockLogger)).toBeNull();
      expect(await QueryParser.decodeSharedPayload(null, mockLogger)).toBeNull();
      expect(await QueryParser.decodeSharedPayload(undefined, mockLogger)).toBeNull();
    });

    it('correctly roundtrips a large payload (>100KB) without stack overflow', async () => {
      const largePayload = JSON.stringify([{data: 'x'.repeat(150000)}]);
      const encoded = await QueryParser.encodeSharedPayload(largePayload);
      const decoded = await QueryParser.decodeSharedPayload(encoded, mockLogger);
      expect(decoded).toBe(largePayload);
    });
  });

  describe('parseSharedA2ui', () => {
    it('returns payload with null error for valid compressed d1. payload from hash fragment', async () => {
      const originalJson = JSON.stringify([{version: 'v0.9', test: true}]);
      const expectedFormattedJson = JSON.stringify([{version: 'v0.9', test: true}], null, 2);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      const hashString = `#a2ui=${encodeURIComponent(encoded)}`;
      const result = await QueryParser.parseSharedA2ui(hashString, mockLogger);
      expect(result.payload).toBe(expectedFormattedJson);
      expect(result.error).toBeNull();
    });

    it('parses hash fragment without leading # symbol', async () => {
      const originalJson = JSON.stringify([{version: 'v0.9', test: true}]);
      const expectedFormattedJson = JSON.stringify([{version: 'v0.9', test: true}], null, 2);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      const hashString = `a2ui=${encodeURIComponent(encoded)}`;
      const result = await QueryParser.parseSharedA2ui(hashString, mockLogger);
      expect(result.payload).toBe(expectedFormattedJson);
      expect(result.error).toBeNull();
    });

    it('returns truncation error when compressed payload is corrupted or truncated', async () => {
      const rawJson = '{"version":"v0.9"}';
      const encodedJson = encodeURIComponent(rawJson);
      // Intentionally corrupt the string.
      const corruptedJson = encodedJson.slice(0, encodedJson.length - 3);
      const result = await QueryParser.parseSharedA2ui(`#a2ui=d1.${corruptedJson}`, mockLogger);
      expect(result.payload).toBeNull();
      expect(result.error).toContain('truncated or corrupted');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to decompress shared A2UI payload:',
        expect.anything(),
      );
    });

    it('returns invalid JSON syntax error when decompressed payload is malformed JSON', async () => {
      vi.spyOn(QueryParser, 'decodeSharedPayload').mockResolvedValue(
        '[{"version":"v0.9", unclosed:',
      );
      const result = await QueryParser.parseSharedA2ui(
        '#a2ui=d1.mocked_corrupted_json',
        mockLogger,
      );
      expect(result.payload).toBeNull();
      expect(result.error).toContain('invalid or incomplete JSON syntax');
    });

    it('returns unrecognized format error when payload format is unrecognized in hash fragment', async () => {
      const result = await QueryParser.parseSharedA2ui('#a2ui=unknown-non-json-format', mockLogger);
      expect(result.payload).toBeNull();
      expect(result.error).toContain('unrecognized or corrupted');
    });

    it('returns null payload and null error when hash fragment is missing, empty, or without a2ui param', async () => {
      expect(await QueryParser.parseSharedA2ui(null, mockLogger)).toEqual({
        payload: null,
        error: null,
      });
      expect(await QueryParser.parseSharedA2ui(undefined, mockLogger)).toEqual({
        payload: null,
        error: null,
      });
      expect(await QueryParser.parseSharedA2ui('', mockLogger)).toEqual({
        payload: null,
        error: null,
      });
      expect(await QueryParser.parseSharedA2ui('#other=value', mockLogger)).toEqual({
        payload: null,
        error: null,
      });
    });
  });
});
