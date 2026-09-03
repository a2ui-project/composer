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

import {describe, it, expect} from 'vitest';
import {ThemePreference} from 'a2ui-bridge';
import {buildRendererUrl} from './renderer-url';

describe('buildRendererUrl', () => {
  it('returns null when the resolved URL is not a valid http(s) URL', () => {
    expect(buildRendererUrl('javascript:alert(1)', ThemePreference.LIGHT)).toBeNull();
  });

  it('returns null when the renderer URL is null', () => {
    expect(buildRendererUrl(null, ThemePreference.LIGHT)).toBeNull();
  });

  it('appends the origin query param and the requested theme', () => {
    const result = buildRendererUrl('http://localhost:3000/renderer', ThemePreference.DARK);
    expect(result).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=dark',
    );
  });

  it('strips a caller-supplied origin param before appending the trusted origins', () => {
    const result = buildRendererUrl(
      'http://localhost:3000/renderer?origin=https://evil.example.com',
      ThemePreference.LIGHT,
    );
    expect(result).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });
});
