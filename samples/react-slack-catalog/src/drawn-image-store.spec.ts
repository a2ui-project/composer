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

import {describe, expect, it} from 'vitest';
import {createBlobImageStore} from './drawn-image-store';
import {stubBlobUrls} from './drawn-images.helpers';

describe('createBlobImageStore', () => {
  const blobUrls = stubBlobUrls();

  it('serves SVG markup from a blob URL as an SVG image', async () => {
    const store = createBlobImageStore();

    expect(store.urlFor('<svg>a</svg>')).toBe('blob:image-1');
    const blob = blobUrls.createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('image/svg+xml');
    expect(await blob.text()).toBe('<svg>a</svg>');
  });

  it('reuses the URL of identical markup', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');

    expect(store.urlFor('<svg>a</svg>')).toBe(first);
    expect(blobUrls.createObjectURL).toHaveBeenCalledOnce();
  });

  it('has the URL it serves markup from', () => {
    const store = createBlobImageStore();

    expect(store.has(store.urlFor('<svg>a</svg>'))).toBe(true);
  });

  it('does not have a URL it did not hand out', () => {
    const store = createBlobImageStore();
    store.urlFor('<svg>a</svg>');

    expect(store.has('https://example.com/chart.png')).toBe(false);
  });

  it('no longer has a URL it freed', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');
    store.release(new Set());
    store.release(new Set());

    expect(store.has(first)).toBe(false);
  });

  it('frees a URL once two calls to release in a row leave it out', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');
    store.release(new Set([first]));
    const second = store.urlFor('<svg>b</svg>');

    store.release(new Set([second]));
    expect(blobUrls.revokeObjectURL).not.toHaveBeenCalled();

    store.release(new Set([second]));
    expect(blobUrls.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(first);
  });

  it('serves freed markup again at a new URL', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');
    store.release(new Set());
    store.release(new Set());

    expect(store.urlFor('<svg>a</svg>')).not.toBe(first);
  });

  it('frees every URL on dispose', () => {
    const store = createBlobImageStore();
    const first = store.urlFor('<svg>a</svg>');
    const second = store.urlFor('<svg>b</svg>');

    store.dispose();

    expect(blobUrls.revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual(
      [first, second].sort(),
    );
  });
});
