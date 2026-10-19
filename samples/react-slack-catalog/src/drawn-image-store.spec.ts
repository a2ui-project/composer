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

import {describe, expect, it, vi} from 'vitest';
import {createBlobImageStore, type ObjectUrlApi} from './drawn-image-store';

describe('createBlobImageStore', () => {
  const fakeUrls = () => {
    let created = 0;
    return {
      createObjectURL: vi.fn<ObjectUrlApi['createObjectURL']>(() => `blob:image-${++created}`),
      revokeObjectURL: vi.fn<ObjectUrlApi['revokeObjectURL']>(),
    };
  };

  it('serves SVG markup as an image and reuses the URL for identical markup', () => {
    const urls = fakeUrls();
    const store = createBlobImageStore(urls);

    const first = store.urlFor('<svg>a</svg>');

    expect(store.urlFor('<svg>a</svg>')).toBe(first);
    expect(urls.createObjectURL).toHaveBeenCalledTimes(1);
    expect(urls.createObjectURL.mock.calls[0][0].type).toBe('image/svg+xml');
  });

  it('keeps URLs from the current and previous release and frees older ones', () => {
    const urls = fakeUrls();
    const store = createBlobImageStore(urls);
    const first = store.urlFor('<svg>a</svg>');
    store.release(new Set([first]));
    const second = store.urlFor('<svg>b</svg>');

    store.release(new Set([second]));
    expect(urls.revokeObjectURL).not.toHaveBeenCalled();

    store.release(new Set([second]));
    expect(urls.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(first);
    expect(store.urlFor('<svg>a</svg>')).not.toBe(first);
  });

  it('frees every URL on dispose', () => {
    const urls = fakeUrls();
    const store = createBlobImageStore(urls);
    const first = store.urlFor('<svg>a</svg>');
    const second = store.urlFor('<svg>b</svg>');

    store.dispose();

    expect(urls.revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual(
      [first, second].sort(),
    );
  });
});
