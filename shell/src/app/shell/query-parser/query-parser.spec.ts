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

    it('returns null when decoding invalid base64url or corrupt deflate-raw payload', async () => {
      expect(await QueryParser.decodeSharedPayload('not-d1-prefixed')).toBeNull();
      expect(await QueryParser.decodeSharedPayload('d1.invalid_base64_content!!!')).toBeNull();
      expect(await QueryParser.decodeSharedPayload('d1.AAAA')).toBeNull();
    });
  });

  describe('parseSharedA2ui', () => {
    it('parses compressed d1. payload from query string', async () => {
      const originalJson = JSON.stringify([{version: 'v0.9'}]);
      const encoded = await QueryParser.encodeSharedPayload(originalJson);
      const searchString = `?a2ui=${encodeURIComponent(encoded)}`;
      const parsed = await QueryParser.parseSharedA2ui(searchString);
      expect(parsed).toBe(originalJson);
    });

    it('parses fallback uncompressed JSON ([...]) from query string', async () => {
      const rawJson = '[{"version":"v0.9"}]';
      const searchString = `?a2ui=${encodeURIComponent(rawJson)}`;
      const parsed = await QueryParser.parseSharedA2ui(searchString);
      expect(parsed).toBe(rawJson);
    });

    it('returns null when a2ui param is missing or invalid', async () => {
      expect(await QueryParser.parseSharedA2ui('')).toBeNull();
      expect(await QueryParser.parseSharedA2ui('?other=value')).toBeNull();
      expect(await QueryParser.parseSharedA2ui('?a2ui=invalid-format')).toBeNull();
    });
  });
});
