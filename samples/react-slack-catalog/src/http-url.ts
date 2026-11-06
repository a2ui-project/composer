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
 * The JSON Schema `pattern` the published catalog gives a literal URL that must
 * be HTTP(S), such as an Image `url` or a MarketSnapshot `sourceUrl`. It checks
 * only the scheme; the preview checks the whole URL with `parseHttpUrl` when it
 * draws the component.
 */
export const HTTP_URL_PATTERN = '^https?://';

/**
 * Parses `value` as an absolute HTTP(S) URL with a host, the URLs the Slack
 * catalog takes for images and links.
 *
 * @return The parsed URL, or undefined if `value` isn't such a URL.
 */
export function parseHttpUrl(value: unknown): URL | undefined {
  if (typeof value !== 'string' || !URL.canParse(value)) {
    return undefined;
  }
  const url = new URL(value);
  return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== ''
    ? url
    : undefined;
}
