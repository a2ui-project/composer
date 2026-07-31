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
 * Utility parser to securely extract and sanitize configuration parameters
 * from the window location query string, enforcing runtime constraints.
 */
export class QueryParser {
  /** @nocollapse */
  static parseRendererUrl(searchString: string): string | null {
    const params = new URLSearchParams(searchString);
    const renderers = params.getAll('renderer');
    if (renderers.length === 0) {
      return null;
    }

    const baseOrigin = globalThis.location?.origin || '';
    for (const uriCandidate of renderers) {
      try {
        const validUrl = uriCandidate.startsWith('/')
          ? new URL(uriCandidate, baseOrigin)
          : new URL(uriCandidate);
        if (validUrl.protocol === 'http:' || validUrl.protocol === 'https:') {
          return validUrl.toString();
        }
      } catch (err) {
        console.warn(
          `Malformed renderer parameter string encountered: '${uriCandidate}'. Stripping invalid URI.`,
        );
      }
    }

    return null;
  }

  /** @nocollapse */
  static parseRendererId(searchString: string): string | null {
    const params = new URLSearchParams(searchString);
    const candidate = params.get('rendererId');
    if (!candidate) {
      return null;
    }

    if (/^[a-zA-Z0-9_-]+$/.test(candidate)) {
      return candidate;
    }

    return null;
  }
}
