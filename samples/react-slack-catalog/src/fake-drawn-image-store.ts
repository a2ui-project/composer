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

import {vi, type Mock} from 'vitest';
import {type DrawnImageStore} from './drawn-image-store';

/** A stand-in for the drawn image store in tests, and the drawings it was asked to serve. */
export interface FakeDrawnImageStore {
  /** Serves each drawing at `blob:image-<n>`, numbered in the order they were drawn. */
  readonly store: {
    readonly urlFor: Mock<DrawnImageStore['urlFor']>;
    readonly release: Mock<DrawnImageStore['release']>;
    readonly dispose: Mock<DrawnImageStore['dispose']>;
  };
  /** The SVG markup of each drawing, in the order it was drawn. */
  readonly drawn: readonly string[];
}

/**
 * Creates a drawn image store that records the SVG markup it is given instead of making
 * blob URLs, so tests can check what the preview drew.
 */
export function createFakeDrawnImageStore(): FakeDrawnImageStore {
  const drawn: string[] = [];
  const store = {
    urlFor: vi.fn<DrawnImageStore['urlFor']>(svg => {
      drawn.push(svg);
      return `blob:image-${drawn.length}`;
    }),
    release: vi.fn<DrawnImageStore['release']>(),
    dispose: vi.fn<DrawnImageStore['dispose']>(),
  };
  return {store, drawn};
}
