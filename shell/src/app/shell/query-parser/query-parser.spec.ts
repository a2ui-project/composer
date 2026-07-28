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

  it('prohibits API keys, secrets, and tokens embedded in query strings', () => {
    const warnSpy = vi.spyOn(console, 'warn');

    // Assert camelCase apiKey is stripped
    expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&apiKey=secret')).toBeNull();

    // Assert snake_case api_key is stripped
    expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&api_key=secret')).toBeNull();

    // Assert kebab-case api-key is stripped
    expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&api-key=secret')).toBeNull();

    // Assert security token is stripped
    expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&token=12345')).toBeNull();

    // Assert private secret is stripped
    expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&api-secret=val')).toBeNull();

    // Assert embedded target inner URL keys are stripped
    expect(QueryParser.parseRendererUrl('?renderer=http://host:3000?api_key=secret')).toBeNull();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Security Violation: Prohibited credentials'),
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

  describe('parseProfileName', () => {
    it('parses profile name from ?profile query parameter', () => {
      expect(QueryParser.parseProfileName('?profile=ge')).toBe('ge');
    });

    it('parses profile name from ?config query parameter as fallback', () => {
      expect(QueryParser.parseProfileName('?config=dev')).toBe('dev');
    });

    it('prefers ?profile parameter over ?config parameter when both exist', () => {
      expect(QueryParser.parseProfileName('?profile=ge&config=dev')).toBe('ge');
    });

    it('rejects profile names with invalid characters', () => {
      expect(QueryParser.parseProfileName('?profile=testing/invalid')).toBeNull();
      expect(QueryParser.parseProfileName('?profile=testing<script>')).toBeNull();
    });

    it('rejects profile name parsing when prohibited credential keys are present in query string', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      expect(QueryParser.parseProfileName('?profile=testing&apiKey=secret')).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Security Violation: Prohibited credentials'),
      );
    });

    it('rejects unseparated prohibited credential keys like apikey or authtoken', () => {
      const warnSpy = vi.spyOn(console, 'warn');
      expect(QueryParser.parseProfileName('?profile=testing&apikey=secret')).toBeNull();
      expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&authtoken=123')).toBeNull();
      expect(QueryParser.parseRendererUrl('?renderer=http://host:3000&appsecret=abc')).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Security Violation: Prohibited credentials'),
      );
    });
  });

  describe('isProhibitedKey', () => {
    it('detects prohibited credential keys including uppercase, ALL-CAPS, standard, and trailing digit keys', () => {
      const prohibitedKeys = [
        'APIKEY',
        'API_KEY',
        'AUTH_TOKEN',
        'APPSECRET',
        'KEY',
        'SECRET',
        'key1',
        'token2',
        'apiKey',
        'api_key',
        'apikey',
      ];
      for (const key of prohibitedKeys) {
        expect(QueryParser['isProhibitedKey'](key)).toBe(true);
      }
    });

    it('allows benign keys ending with false-positive suffixes', () => {
      const benignKeys = [
        'hockey',
        'turkey',
        'monkey',
        'donkey',
        'whiskey',
        'lackey',
        'jockey',
        'hockey1',
        'turkey2',
        'HOCKEY',
      ];
      for (const key of benignKeys) {
        expect(QueryParser['isProhibitedKey'](key)).toBe(false);
      }
    });

    it('detects prohibited keys like hockeyKey', () => {
      expect(QueryParser['isProhibitedKey']('hockeyKey')).toBe(true);
    });

    it('allows URL parsing when benign query parameters are present', () => {
      const url = QueryParser.parseRendererUrl('?renderer=http://localhost:3000&hockey=puck');
      expect(url).toBe('http://localhost:3000/');
    });
  });
});
