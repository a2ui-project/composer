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
});
