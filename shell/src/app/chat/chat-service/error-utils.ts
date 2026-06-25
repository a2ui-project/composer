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
 * Clean error message by stripping error prefixes.
 */
export function cleanErrorMessage(msg: string): string {
  const regex = /^([a-zA-Z0-9_]*Error|[a-zA-Z0-9_]*Exception|API_KEY_INVALID)\s*(\[[^\]]+\])?:\s*/i;
  const clean = msg.replace(regex, '');

  if (clean.startsWith('{')) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed.error && parsed.error.message) {
        return parsed.error.message;
      }
    } catch (e) {
      // Ignore
    }
  }
  return clean;
}

/**
 * Redact Gemini API keys from text.
 */
export function redactApiKey(text: string): string {
  if (!text) return text;

  // First redact explicit AIzaSy keys
  let redacted = text.replace(/AIzaSy[A-Za-z0-9_-]+/g, 'redacted for your protection');

  // Then redact "Invalid API key: <key>" pattern
  redacted = redacted.replace(
    /(Invalid API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,
    (match, p1, p2) =>
      p2.toLowerCase() === 'redacted for your protection'
        ? match
        : p1 + 'redacted for your protection',
  );

  // Then redact "API key: <key>" pattern
  redacted = redacted.replace(
    /(API key:\s*)(redacted for your protection|[A-Za-z0-9_-]+)/gi,
    (match, p1, p2) =>
      p2.toLowerCase() === 'redacted for your protection'
        ? match
        : p1 + 'redacted for your protection',
  );

  return redacted;
}
