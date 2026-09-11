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

import {ThemePreference} from 'a2ui-bridge';
import {isValidHttpUrl} from '../utils/url';

/**
 * Builds the sandboxed renderer iframe URL, appending the parent/ancestor
 * origins and the active theme, and validating the result as a safe
 * http(s) URL before it is handed to the caller for sanitization.
 */
export function buildRendererUrl(
  currentUrl: string | null | undefined,
  theme: ThemePreference,
): string | null {
  if (!currentUrl) return null;

  try {
    // Fallback to undefined if globalThis.location is undefined
    // (e.g., in Server-Side Rendering).
    const baseOrigin = globalThis.location?.origin || undefined;

    // Construct a URL object. Passing baseOrigin as the second argument ensures that
    // relative URLs (e.g., "/renderer") are parsed correctly relative to the current
    // domain. Absolute URLs will ignore this base parameter.
    const url = new URL(currentUrl, baseOrigin);

    // Prevent unauthorized cross-site framing by appending parent and
    // ancestor origins.
    url.searchParams.delete('origin');

    const origins = new Set<string>();
    if (baseOrigin) {
      origins.add(baseOrigin);
    }

    const ancestorOrigins = (
      globalThis.location as Location & {['ancestorOrigins']?: DOMStringList}
    )?.['ancestorOrigins'];
    if (ancestorOrigins) {
      for (let i = 0; i < ancestorOrigins.length; i++) {
        if (ancestorOrigins[i]) {
          origins.add(ancestorOrigins[i]);
        }
      }
    }

    for (const origin of origins) {
      url.searchParams.append('origin', origin);
    }

    url.searchParams.set('theme', theme);

    const urlString = url.toString();
    if (!isValidHttpUrl(urlString)) {
      console.error('Renderer URL failed safe validation:', urlString);
      return null;
    }

    return urlString;
  } catch (e) {
    console.error('Failed to parse renderer URL:', e);
    return null;
  }
}
