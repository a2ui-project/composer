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
import {MAX_CONTENT_HEIGHT_PX, clampContentHeight} from './content-height';

describe('clampContentHeight', () => {
  it('passes a whole height below the cap through', () => {
    expect(clampContentHeight(320)).toBe(320);
  });

  it('keeps a height exactly at the cap', () => {
    expect(clampContentHeight(MAX_CONTENT_HEIGHT_PX)).toBe(MAX_CONTENT_HEIGHT_PX);
  });

  it('clamps a height above the cap to the cap', () => {
    expect(clampContentHeight(MAX_CONTENT_HEIGHT_PX + 1)).toBe(MAX_CONTENT_HEIGHT_PX);
    expect(clampContentHeight(20_000)).toBe(MAX_CONTENT_HEIGHT_PX);
  });

  it('rounds a fractional height up, so content is never cut by a fraction of a pixel', () => {
    expect(clampContentHeight(320.2)).toBe(321);
    expect(clampContentHeight(0.4)).toBe(1);
  });

  it('returns null, meaning no height, for zero and negative heights', () => {
    expect(clampContentHeight(0)).toBeNull();
    expect(clampContentHeight(-1)).toBeNull();
  });

  it('returns null for heights that are not finite', () => {
    expect(clampContentHeight(Number.NaN)).toBeNull();
    expect(clampContentHeight(Number.POSITIVE_INFINITY)).toBeNull();
    expect(clampContentHeight(Number.NEGATIVE_INFINITY)).toBeNull();
  });
});
