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
 * Hands out URLs for the images the preview draws, such as charts, and frees the ones no
 * longer shown.
 *
 * Each time the session publishes a snapshot, it calls `release` with the URLs that
 * snapshot shows. A URL is freed only once two calls in a row leave it out, so an image
 * the previous snapshot shows keeps loading until React has replaced it with the next.
 */
export interface DrawnImageStore {
  /** Returns a URL serving the SVG markup, reusing the URL of identical markup. */
  urlFor(svg: string): string;
  /** Frees URLs that are in neither `keep` nor the previous call's `keep`. */
  release(keep: ReadonlySet<string>): void;
  /** Frees every URL. */
  dispose(): void;
}

/** A `DrawnImageStore` that serves each drawing as an `image/svg+xml` blob URL. */
export function createBlobImageStore(): DrawnImageStore {
  const urlsByMarkup = new Map<string, string>();
  let previousKeep: ReadonlySet<string> = new Set();

  return {
    urlFor(svg) {
      const existing = urlsByMarkup.get(svg);
      if (existing) {
        return existing;
      }
      const url = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
      urlsByMarkup.set(svg, url);
      return url;
    },

    release(keep) {
      for (const [svg, url] of urlsByMarkup) {
        if (!keep.has(url) && !previousKeep.has(url)) {
          URL.revokeObjectURL(url);
          urlsByMarkup.delete(svg);
        }
      }
      previousKeep = new Set(keep);
    },

    dispose() {
      for (const url of urlsByMarkup.values()) {
        URL.revokeObjectURL(url);
      }
      urlsByMarkup.clear();
      previousKeep = new Set();
    },
  };
}
