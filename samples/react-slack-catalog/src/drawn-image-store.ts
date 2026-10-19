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

/** Creates and frees object URLs; the global `URL` in the browser. */
export interface ObjectUrlApi {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
}

/**
 * Hands out URLs for the images the preview draws, such as charts, and frees the ones no
 * longer shown.
 *
 * A URL survives until it has been missing from two releases in a row, so an image the
 * preview still shows while React commits the next render never breaks.
 */
export interface DrawnImageStore {
  /** Returns a URL serving the SVG markup, reusing the URL of identical markup. */
  urlFor(svg: string): string;
  /** Frees URLs that are in neither `keep` nor the previous call's `keep`. */
  release(keep: ReadonlySet<string>): void;
  /** Frees every URL. */
  dispose(): void;
}

/**
 * A `DrawnImageStore` that serves each drawing as an `image/svg+xml` blob URL.
 *
 * @param urls Creates and frees the blob URLs.
 */
export function createBlobImageStore(urls: ObjectUrlApi = URL): DrawnImageStore {
  const urlsByMarkup = new Map<string, string>();
  let previousKeep: ReadonlySet<string> = new Set();

  return {
    urlFor(svg) {
      const existing = urlsByMarkup.get(svg);
      if (existing) {
        return existing;
      }
      const url = urls.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
      urlsByMarkup.set(svg, url);
      return url;
    },

    release(keep) {
      for (const [svg, url] of urlsByMarkup) {
        if (!keep.has(url) && !previousKeep.has(url)) {
          urls.revokeObjectURL(url);
          urlsByMarkup.delete(svg);
        }
      }
      previousKeep = new Set(keep);
    },

    dispose() {
      for (const url of urlsByMarkup.values()) {
        urls.revokeObjectURL(url);
      }
      urlsByMarkup.clear();
      previousKeep = new Set();
    },
  };
}
