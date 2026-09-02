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

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {resetBypassProhibitedForTesting, safeBypassHtml} from './sanitizer';

describe('safeBypassHtml', () => {
  let mockSanitizer: DomSanitizer;

  beforeEach(() => {
    resetBypassProhibitedForTesting();
    mockSanitizer = {
      bypassSecurityTrustHtml: vi.fn((html: string) => `safe:${html}` as unknown as SafeHtml),
    } as unknown as DomSanitizer;
  });

  it('returns SafeHtml when sanitizer bypass succeeds', () => {
    const html = '<p>Hello world</p>';
    const result = safeBypassHtml(mockSanitizer, html);

    expect(result).toBe('safe:<p>Hello world</p>');
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(html);
  });

  it('falls back to raw HTML string when sanitizer bypass throws', () => {
    mockSanitizer.bypassSecurityTrustHtml = vi.fn().mockImplementation(() => {
      throw new Error('Trusted Types violation: bypass prohibited');
    });

    const html = '<b>Bold text</b>';
    const result = safeBypassHtml(mockSanitizer, html);

    expect(result).toBe(html);
  });

  it('caches the prohibited state and skips calling sanitizer on subsequent calls', () => {
    mockSanitizer.bypassSecurityTrustHtml = vi.fn().mockImplementation(() => {
      throw new Error('Trusted Types violation');
    });

    const html1 = '<span>First</span>';
    const result1 = safeBypassHtml(mockSanitizer, html1);
    expect(result1).toBe(html1);
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(1);

    const html2 = '<span>Second</span>';
    const result2 = safeBypassHtml(mockSanitizer, html2);
    expect(result2).toBe(html2);
    // Should NOT call bypassSecurityTrustHtml again
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledTimes(1);
  });
});
