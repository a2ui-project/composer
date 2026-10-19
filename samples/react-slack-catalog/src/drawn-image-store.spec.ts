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

import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vitest';
import {createBlobImageStore} from './drawn-image-store';

describe('createBlobImageStore', () => {
  let createObjectURL: MockInstance<typeof URL.createObjectURL>;
  let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

  beforeEach(() => {
    let created = 0;
    createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:image-${++created}`);
    revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serves SVG markup as an image and reuses the URL for identical markup', () => {
    const store = createBlobImageStore();

    const first = store.urlFor('<svg>a</svg>');

    expect(store.urlFor('<svg>a</svg>')).toBe(first);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe('image/svg+xml');
  });

  it('frees a URL once two calls to release in a row leave it out', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');
    store.release(new Set([first]));
    const second = store.urlFor('<svg>b</svg>');

    store.release(new Set([second]));
    expect(revokeObjectURL).not.toHaveBeenCalled();

    store.release(new Set([second]));
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(first);
    expect(store.urlFor('<svg>a</svg>')).not.toBe(first);
  });

  it('frees every URL on dispose', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');
    const second = store.urlFor('<svg>b</svg>');

    store.dispose();

    expect(revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual([first, second].sort());
  });
});
