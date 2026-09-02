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

/**
 * Normalizes an endpoint string to ensure it has an http:// or https:// scheme.
 * If the string does not specify a protocol (e.g. "suyangw.c.googlers.com:12345" or "localhost:8080"),
 * prepends "http://". If the string already contains an http:// or https:// scheme, it is
 * preserved. If the string specifies any other scheme (e.g. "ftp://...", "file:...", "javascript:..."),
 * returns an empty string as only HTTP(S) endpoints are supported.
 */
export function normalizeHttpUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d)/i.test(trimmed)) {
    return '';
  }
  return `http://${trimmed}`;
}

/**
 * Validates that a string is a well-formed HTTP or HTTPS URL.
 *
 * Returns `false` for `null`, `undefined`, empty strings, non-URL strings,
 * or non-http(s) protocols such as `javascript:`, `data:`, `file:`, or `ftp:`.
 */
export function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates that a string is a well-formed endpoint address, supporting both full
 * URLs (e.g. "http://suyangw.c.googlers.com:12345") and raw host(:port) addresses
 * (e.g. "suyangw.c.googlers.com:12345" or "localhost:8080").
 */
export function isValidEndpointUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes(' ') || trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return false;
  }
  return isValidHttpUrl(normalizeHttpUrl(trimmed));
}
