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

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CONTENT_QUIET_MS, waitForContentToSettle} from './content-settle.js';

const CONTENT_SAMPLE_MS = CONTENT_QUIET_MS / 3;

describe('waitForContentToSettle', () => {
  const originalFontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (originalFontsDescriptor) {
      Object.defineProperty(document, 'fonts', originalFontsDescriptor);
    } else {
      delete (document as {fonts?: unknown}).fonts;
    }
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('requires a full CONTENT_QUIET_MS window after fonts finish loading even if dimensions never change', async () => {
    let fontStatus: FontFaceSetLoadStatus = 'loading';
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      get: () => ({status: fontStatus}),
    });

    let settled = false;
    const promise = waitForContentToSettle({
      measure: () => ({height: 240, width: 400}),
      isCancelled: () => false,
    }).then(outcome => {
      settled = true;
      return outcome;
    });

    // Dimensions stay at 240x400 for 200ms (> CONTENT_QUIET_MS) while fonts are still loading.
    await vi.advanceTimersByTimeAsync(200);
    expect(settled).toBe(false);

    // Fonts finish loading at 200ms without changing dimensions.
    fontStatus = 'loaded';
    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS);
    expect(settled).toBe(false);

    // Must wait the full CONTENT_QUIET_MS after the first loaded sample at 250ms.
    await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - CONTENT_SAMPLE_MS);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS);
    expect(settled).toBe(true);
    await expect(promise).resolves.toBe('settled');
  });

  it('requires a full CONTENT_QUIET_MS window after eager images complete even if dimensions never change', async () => {
    const img = document.createElement('img');
    let imageComplete = false;
    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: () => imageComplete,
    });
    document.body.appendChild(img);

    let settled = false;
    const promise = waitForContentToSettle({
      measure: () => ({height: 240, width: 400}),
      isCancelled: () => false,
    }).then(outcome => {
      settled = true;
      return outcome;
    });

    // Dimensions stay at 240x400 for 200ms (> CONTENT_QUIET_MS) while the image is still loading.
    await vi.advanceTimersByTimeAsync(200);
    expect(settled).toBe(false);

    // Image completes at 200ms without changing dimensions.
    imageComplete = true;
    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS);
    expect(settled).toBe(false);

    // Must wait the full CONTENT_QUIET_MS after the first complete sample at 250ms.
    await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - CONTENT_SAMPLE_MS);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS);
    expect(settled).toBe(true);
    await expect(promise).resolves.toBe('settled');
  });

  it('ignores incomplete lazy-loaded images when settling', async () => {
    const lazyImg = document.createElement('img');
    lazyImg.setAttribute('loading', 'lazy');
    lazyImg.loading = 'lazy';
    Object.defineProperty(lazyImg, 'complete', {
      configurable: true,
      get: () => false,
    });
    document.body.appendChild(lazyImg);

    const promise = waitForContentToSettle({
      measure: () => ({height: 240, width: 400}),
      isCancelled: () => false,
    });

    await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
    await expect(promise).resolves.toBe('settled');
  });

  it('requires a full CONTENT_QUIET_MS window after an eager image completes when inserted during a dimension change', async () => {
    let height = 100;
    let settled = false;
    const promise = waitForContentToSettle({
      measure: () => ({height, width: 400}),
      isCancelled: () => false,
    }).then(outcome => {
      settled = true;
      return outcome;
    });

    // At t = 20ms, a mutation simultaneously grows dimensions and adds an incomplete eager <img>.
    await vi.advanceTimersByTimeAsync(20);
    height = 200;
    const img = document.createElement('img');
    let imageComplete = false;
    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: () => imageComplete,
    });
    document.body.appendChild(img);

    // At t = 50ms (first sample), dimensions changed from 100 -> 200 while img.complete is false.
    await vi.advanceTimersByTimeAsync(30);
    expect(settled).toBe(false);

    // At t = 90ms (< 150ms), the image completes without changing dimensions.
    await vi.advanceTimersByTimeAsync(40);
    imageComplete = true;

    // At t = 100ms (second sample), the first complete sample is recorded.
    await vi.advanceTimersByTimeAsync(10);
    expect(settled).toBe(false);

    // At t = 200ms (100ms after first complete sample, < CONTENT_QUIET_MS), must NOT settle yet.
    await vi.advanceTimersByTimeAsync(100);
    expect(settled).toBe(false);

    // At t = 250ms (full CONTENT_QUIET_MS = 150ms after first complete sample at t = 100ms), settles.
    await vi.advanceTimersByTimeAsync(50);
    expect(settled).toBe(true);
    await expect(promise).resolves.toBe('settled');
  });

  it('skips walking the DOM for images while fonts are loading or measure returns null', async () => {
    let fontStatus: FontFaceSetLoadStatus = 'loading';
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      get: () => ({status: fontStatus}),
    });

    const img = document.createElement('img');
    const completeGetter = vi.fn(() => true);
    Object.defineProperty(img, 'complete', {
      configurable: true,
      get: completeGetter,
    });
    document.body.appendChild(img);

    let measured: {height: number; width: number} | null = {height: 100, width: 400};
    const promise = waitForContentToSettle({
      measure: () => measured,
      isCancelled: () => false,
    });

    // While fonts are loading, imagesComplete() should not walk the DOM.
    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS);
    expect(completeGetter).not.toHaveBeenCalled();

    // While measure() returns null, imagesComplete() should not walk the DOM.
    fontStatus = 'loaded';
    measured = null;
    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS);
    expect(completeGetter).not.toHaveBeenCalled();

    // Once measured is non-null and fonts are loaded, imagesComplete() walks the DOM and settles.
    measured = {height: 180, width: 400};
    await vi.advanceTimersByTimeAsync(CONTENT_SAMPLE_MS + CONTENT_QUIET_MS);
    await expect(promise).resolves.toBe('settled');
    expect(completeGetter).toHaveBeenCalled();
  });
});
