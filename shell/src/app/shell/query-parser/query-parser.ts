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

  /**
   * Compresses an A2UI JSON payload using deflate-raw and returns a URL-safe Base64 string prefixed with 'd1.'.
   */
  static async encodeSharedPayload(jsonString: string): Promise<string> {
    const bytes = new TextEncoder().encode(jsonString);
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    const base64Url = btoa(String.fromCharCode(...new Uint8Array(buf)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `d1.${base64Url}`;
  }

  /**
   * Decompresses a 'd1.'-prefixed Base64URL string back into an A2UI JSON string.
   * Returns null if the format is invalid or decompression fails.
   */
  static async decodeSharedPayload(encodedPayload: string): Promise<string | null> {
    if (!encodedPayload.startsWith('d1.')) {
      return null;
    }
    try {
      const rawBase64 = encodedPayload.slice(3).replace(/-/g, '+').replace(/_/g, '/');
      const padded = rawBase64 + '='.repeat((4 - (rawBase64.length % 4)) % 4);
      const binaryString = atob(padded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      const writePromise = writer
        .write(bytes)
        .then(() => writer.close())
        .catch(() => {});
      const responsePromise = new Response(ds.readable).arrayBuffer();
      await Promise.all([writePromise, responsePromise]);
      const buf = await responsePromise;
      return new TextDecoder().decode(buf);
    } catch (err) {
      console.warn('Failed to decompress shared A2UI payload:', err);
      return null;
    }
  }

  /**
   * Parses the shared A2UI JSON payload from a query search string (?a2ui=...).
   * Supports both compressed ('d1.') and fallback uncompressed JSON strings.
   */
  static async parseSharedA2ui(searchString: string): Promise<string | null> {
    const params = new URLSearchParams(searchString);
    const candidate = params.get('a2ui');
    if (!candidate) {
      return null;
    }
    if (candidate.startsWith('d1.')) {
      return await QueryParser.decodeSharedPayload(candidate);
    }
    if (candidate.startsWith('[') || candidate.startsWith('{')) {
      return candidate;
    }
    return null;
  }
}
