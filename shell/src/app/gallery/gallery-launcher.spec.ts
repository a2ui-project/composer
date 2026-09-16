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

import {DOCUMENT, Location} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {describe, it, expect, vi, afterEach} from 'vitest';
import {GalleryLauncher} from './gallery-launcher';
import {QueryParser} from '../shell/query-parser/query-parser';

describe('GalleryLauncher', () => {
  afterEach(() => vi.restoreAllMocks());

  it('opens the exact selected draft with renderer identity under a published preview base path', async () => {
    const assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: {
              location: {href: 'https://example.com/composer/pr/129/gallery?renderer=old', assign},
            },
          },
        },
        {provide: Location, useValue: {prepareExternalUrl: () => '/composer/pr/129/'}},
      ],
    });
    const payload = JSON.stringify([
      {
        version: 'v0.9',
        createSurface: {surfaceId: 'gallery-preview', catalogId: 'custom://notice'},
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'gallery-preview',
          components: [{id: 'root', component: 'Notice', text: 'Edited'}],
        },
      },
    ]);
    await TestBed.inject(GalleryLauncher).open(
      payload,
      'https://example.com/custom-renderer',
      'custom',
    );
    const url = new URL(assign.mock.lastCall?.[0]);
    expect(url.pathname).toBe('/composer/pr/129/');
    expect(url.search).toBe('');
    expect(QueryParser.parseRendererUrl(url.hash)).toBe('https://example.com/custom-renderer');
    expect(QueryParser.parseRendererId(url.hash)).toBe('custom');
    expect(JSON.parse((await QueryParser.parseSharedA2ui(url.hash)).payload!)).toEqual(
      JSON.parse(payload),
    );
  });

  it('propagates compression failures without navigating away', async () => {
    const assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {defaultView: {location: {href: 'https://example.com/gallery', assign}}},
        },
        {provide: Location, useValue: {prepareExternalUrl: () => '/'}},
      ],
    });
    vi.spyOn(QueryParser, 'encodeSharedPayload').mockRejectedValue(new Error('Encoding failed'));
    await expect(
      TestBed.inject(GalleryLauncher).open('[]', 'https://renderer.test', null),
    ).rejects.toThrow('Encoding failed');
    expect(assign).not.toHaveBeenCalled();
  });
});
