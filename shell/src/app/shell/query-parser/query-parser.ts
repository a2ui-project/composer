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

export interface SharedA2uiParseResult {
  payload: string | null;
  error: string | null;
}

/**
 * Utility parser to securely extract and sanitize configuration parameters
 * from the window location query string, enforcing runtime constraints.
 */
export class QueryParser {
  private static readonly PAYLOAD_PREFIX = 'd1.';

  /** @nocollapse */
  static parseRendererUrl(searchOrHashString: string): string | null {
    const clean = searchOrHashString ? searchOrHashString.replace(/^[?#]/, '') : '';
    const params = new URLSearchParams(clean);
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
  static parseRendererId(searchOrHashString: string): string | null {
    const clean = searchOrHashString ? searchOrHashString.replace(/^[?#]/, '') : '';
    const params = new URLSearchParams(clean);
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
   * Minifies and compresses an A2UI JSON payload using deflate-raw and returns a URL-safe Base64 string prefixed with 'd1.'.
   * Throws an error if jsonString is not valid JSON syntax.
   */
  static async encodeSharedPayload(jsonString: string | null | undefined): Promise<string> {
    if (!jsonString || !jsonString.trim()) {
      return '';
    }
    const minified = JSON.stringify(JSON.parse(jsonString));
    const bytes = new TextEncoder().encode(minified);
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    const writePromise = writer.write(bytes).then(() => writer.close());
    const responsePromise = new Response(cs.readable).arrayBuffer();
    const [, buf] = await Promise.all([writePromise, responsePromise]);
    const uint8 = new Uint8Array(buf);
    const chunkSize = 8192;
    let binaryString = '';
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binaryString += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
    }
    const base64Url = btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${QueryParser.PAYLOAD_PREFIX}${base64Url}`;
  }

  /**
   * Decompresses a 'd1.'-prefixed Base64URL string back into an A2UI JSON string.
   * Returns null if the format is invalid or decompression fails.
   */
  static async decodeSharedPayload(
    encodedPayload: string | null | undefined,
  ): Promise<string | null> {
    if (!encodedPayload || !encodedPayload.startsWith(QueryParser.PAYLOAD_PREFIX)) {
      return null;
    }
    try {
      const rawBase64 = encodedPayload
        .slice(QueryParser.PAYLOAD_PREFIX.length)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padded = rawBase64 + '='.repeat((4 - (rawBase64.length % 4)) % 4);
      const binaryString = atob(padded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      const writePromise = writer.write(bytes).then(() => writer.close());
      const responsePromise = new Response(ds.readable).arrayBuffer();
      const [, buf] = await Promise.all([writePromise, responsePromise]);
      return new TextDecoder().decode(buf);
    } catch (err) {
      console.warn('Failed to decompress shared A2UI payload:', err);
      return null;
    }
  }

  /**
   * Parses the shared A2UI JSON payload from a URL hash fragment (#a2ui=...)
   * returning the decompressed JSON string or a diagnostic error message.
   */
  static async parseSharedA2ui(
    hashString: string | null | undefined,
  ): Promise<SharedA2uiParseResult> {
    if (!hashString) {
      return {payload: null, error: null};
    }
    const params = new URLSearchParams(hashString.replace(/^#/, ''));
    const candidate = params.get('a2ui');
    if (!candidate) {
      return {payload: null, error: null};
    }
    if (candidate.startsWith(QueryParser.PAYLOAD_PREFIX)) {
      const decompressed = await QueryParser.decodeSharedPayload(candidate);
      if (decompressed === null) {
        return {
          payload: null,
          error:
            'The shared design link appears truncated or corrupted (it may have exceeded URL length limits).',
        };
      }
      try {
        const parsed = JSON.parse(decompressed);
        const formatted = JSON.stringify(parsed, null, 2);
        return {payload: formatted, error: null};
      } catch {
        return {
          payload: null,
          error: 'The shared design contains invalid or incomplete JSON syntax.',
        };
      }
    }
    return {
      payload: null,
      error: 'The shared design format is unrecognized or corrupted.',
    };
  }
}
