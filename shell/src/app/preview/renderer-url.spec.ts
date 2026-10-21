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

import {afterEach, describe, it, expect, vi} from 'vitest';
import {ThemePreference} from 'a2ui-bridge';
import {TaggedLogger} from '../debug/error-logger.service';
import {PreviewUrlParam} from './preview-url-param';
import {buildRendererUrl} from './renderer-url';

describe('buildRendererUrl', () => {
  const logger: TaggedLogger = {error: vi.fn(), warn: vi.fn(), info: vi.fn(), log: vi.fn()};

  it('returns null when the resolved URL is not a valid http(s) URL', () => {
    expect(buildRendererUrl('javascript:alert(1)', ThemePreference.LIGHT, logger)).toBeNull();
  });

  it('returns null when the renderer URL is null', () => {
    expect(buildRendererUrl(null, ThemePreference.LIGHT, logger)).toBeNull();
  });

  it('appends the origin query param and the requested theme', () => {
    const result = buildRendererUrl('http://localhost:3000/renderer', ThemePreference.DARK, logger);
    expect(result).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=dark',
    );
  });

  it('strips a caller-supplied origin param before appending the trusted origins', () => {
    const result = buildRendererUrl(
      'http://localhost:3000/renderer?origin=https://evil.example.com',
      ThemePreference.LIGHT,
      logger,
    );
    expect(result).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });

  it('adds only the query parameters listed in PreviewUrlParam', () => {
    // RendererSelection removes these before comparing the iframe's URL with a
    // renderer's, so a parameter added without being listed would break that match.
    const src = new URL(buildRendererUrl('/renderer', ThemePreference.LIGHT, logger)!);
    const listed: string[] = Object.values(PreviewUrlParam);
    expect([...new Set(src.searchParams.keys())].filter(key => !listed.includes(key))).toEqual([]);
  });

  it('returns null for a malformed URL', () => {
    expect(buildRendererUrl('http://[invalid]', ThemePreference.LIGHT, logger)).toBeNull();
  });

  it('resolves a relative renderer URL against the current origin', () => {
    expect(buildRendererUrl('/renderer', ThemePreference.LIGHT, logger)).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });

  describe('ancestor origins', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('appends every ancestor origin after the base origin', () => {
      vi.stubGlobal('location', {
        origin: 'http://localhost:3000',
        ancestorOrigins: ['https://proxy.googlers.com', 'https://jetski.corp.google.com'],
      });

      const src = buildRendererUrl('/renderer', ThemePreference.LIGHT, logger);

      expect(src).toContain('origin=http%3A%2F%2Flocalhost%3A3000');
      expect(src).toContain('origin=https%3A%2F%2Fproxy.googlers.com');
      expect(src).toContain('origin=https%3A%2F%2Fjetski.corp.google.com');
    });

    it('deduplicates ancestor origins matching the base origin or each other', () => {
      vi.stubGlobal('location', {
        origin: 'http://localhost:3000',
        ancestorOrigins: [
          'http://localhost:3000',
          'https://proxy.googlers.com',
          'https://proxy.googlers.com',
        ],
      });

      const src = buildRendererUrl('/renderer', ThemePreference.LIGHT, logger);

      expect(src!.match(/origin=http%3A%2F%2Flocalhost%3A3000/g)?.length).toBe(1);
      expect(src!.match(/origin=https%3A%2F%2Fproxy\.googlers\.com/g)?.length).toBe(1);
    });

    it('handles a location without ancestorOrigins (e.g. Firefox)', () => {
      vi.stubGlobal('location', {origin: 'http://localhost:3000'});

      const src = buildRendererUrl('/renderer', ThemePreference.LIGHT, logger);

      expect(src).toContain('origin=http%3A%2F%2Flocalhost%3A3000');
      expect(src!.match(/origin=/g)?.length).toBe(1);
    });

    it('appends no origin to an absolute URL where there is no location (SSR)', () => {
      vi.stubGlobal('location', undefined);

      expect(
        buildRendererUrl('http://localhost:3000/renderer', ThemePreference.LIGHT, logger),
      ).toBe('http://localhost:3000/renderer?theme=light');
    });

    it('returns null for a relative URL where there is no location (SSR)', () => {
      vi.stubGlobal('location', undefined);

      expect(buildRendererUrl('/renderer', ThemePreference.LIGHT, logger)).toBeNull();
    });
  });
});
