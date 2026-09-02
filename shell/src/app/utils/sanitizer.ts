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

import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

let isBypassProhibited: boolean | null = null;

/**
 * Resets the cached bypass policy state for unit testing purposes.
 */
export function resetBypassProhibitedForTesting(): void {
  isBypassProhibited = null;
}

/**
 * Safely bypasses Angular HTML security if allowed in the runtime environment.
 * Falls back to returning the raw string if bypass is prohibited (e.g. strict Trusted Types policies).
 *
 * @param sanitizer The Angular DomSanitizer instance.
 * @param html The raw HTML string to sanitize or bypass.
 * @return SafeHtml if bypass succeeded, or the original HTML string if bypass is prohibited.
 */
export function safeBypassHtml(sanitizer: DomSanitizer, html: string): SafeHtml | string {
  if (isBypassProhibited) {
    return html;
  }
  try {
    const result = sanitizer.bypassSecurityTrustHtml(html);
    isBypassProhibited = false;
    return result;
  } catch {
    isBypassProhibited = true;
    return html;
  }
}
