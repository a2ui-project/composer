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
import {isValidEndpointUrl, isValidHttpUrl, normalizeHttpUrl} from './url';

describe('isValidHttpUrl', () => {
  it('returns true for valid http and https URLs', () => {
    expect(isValidHttpUrl('http://localhost:8088')).toBe(true);
    expect(isValidHttpUrl('https://example.com')).toBe(true);
    expect(isValidHttpUrl('https://example.com/path?query=1#hash')).toBe(true);
    expect(isValidHttpUrl('http://127.0.0.1:3000')).toBe(true);
  });

  it('returns false for non-http(s) protocols', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('data:text/html,hello')).toBe(false);
    expect(isValidHttpUrl('file:///path/to/file')).toBe(false);
    expect(isValidHttpUrl('ws://example.com')).toBe(false);
  });

  it('returns false for invalid or empty inputs', () => {
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl('   ')).toBe(false);
    expect(isValidHttpUrl(null)).toBe(false);
    expect(isValidHttpUrl(undefined)).toBe(false);
    expect(isValidHttpUrl('not a url')).toBe(false);
    expect(isValidHttpUrl('//example.com')).toBe(false);
  });
});

describe('normalizeHttpUrl', () => {
  it('preserves existing http and https URLs', () => {
    expect(normalizeHttpUrl('http://localhost:12345')).toBe('http://localhost:12345');
    expect(normalizeHttpUrl('https://suyangw.c.googlers.com:12345')).toBe(
      'https://suyangw.c.googlers.com:12345',
    );
  });

  it('prepends http:// to raw host and host:port strings', () => {
    expect(normalizeHttpUrl('suyangw.c.googlers.com:12345')).toBe(
      'http://suyangw.c.googlers.com:12345',
    );
    expect(normalizeHttpUrl('localhost:8080')).toBe('http://localhost:8080');
    expect(normalizeHttpUrl('127.0.0.1:9876')).toBe('http://127.0.0.1:9876');
  });

  it('rejects non-http(s) protocols by returning an empty string', () => {
    expect(normalizeHttpUrl('ftp://example.com')).toBe('');
    expect(normalizeHttpUrl('file:///path/to/file')).toBe('');
    expect(normalizeHttpUrl('javascript:alert(1)')).toBe('');
    expect(normalizeHttpUrl('data:text/html,hello')).toBe('');
    expect(normalizeHttpUrl('mailto:test@example.com')).toBe('');
    expect(normalizeHttpUrl('ws://example.com')).toBe('');
    expect(normalizeHttpUrl('about:blank')).toBe('');
    expect(normalizeHttpUrl('blob:http://example.com/uuid')).toBe('');
  });

  it('handles empty or null inputs', () => {
    expect(normalizeHttpUrl('')).toBe('');
    expect(normalizeHttpUrl(null)).toBe('');
    expect(normalizeHttpUrl(undefined)).toBe('');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeHttpUrl('  http://localhost:12345  ')).toBe('http://localhost:12345');
    expect(normalizeHttpUrl('  localhost:8080  ')).toBe('http://localhost:8080');
    expect(normalizeHttpUrl('   ')).toBe('');
  });
});

describe('isValidEndpointUrl', () => {
  it('accepts valid http, https, and raw host:port addresses', () => {
    expect(isValidEndpointUrl('suyangw.c.googlers.com:12345')).toBe(true);
    expect(isValidEndpointUrl('http://suyangw.c.googlers.com:12345')).toBe(true);
    expect(isValidEndpointUrl('localhost:12345')).toBe(true);
    expect(isValidEndpointUrl('http://localhost:12345')).toBe(true);
    expect(isValidEndpointUrl('https://example.com')).toBe(true);
  });

  it('rejects invalid or unsafe protocols and malformed strings', () => {
    expect(isValidEndpointUrl('')).toBe(false);
    expect(isValidEndpointUrl('   ')).toBe(false);
    expect(isValidEndpointUrl('not a valid url')).toBe(false);
    expect(isValidEndpointUrl('javascript:alert(1)')).toBe(false);
    expect(isValidEndpointUrl('data:text/html,hello')).toBe(false);
    expect(isValidEndpointUrl('ftp://example.com')).toBe(false);
  });
});
