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

import {Injectable} from '@angular/core';
import {isValidHttpUrl} from '../../utils/url';

export {isValidHttpUrl};

/**
 * Service wrapper for URL validation.
 * @deprecated Prefer using pure function `isValidHttpUrl` from `../../utils/url`.
 */
@Injectable({
  providedIn: 'root',
})
export class SafeUrlValidatorService {
  /**
   * Static validation helper delegating to `isValidHttpUrl`.
   */
  static isValidHttpUrl(url: string | null | undefined): boolean {
    return isValidHttpUrl(url);
  }

  /**
   * Instance validation method delegating to `isValidHttpUrl`.
   */
  isValidHttpUrl(url: string | null | undefined): boolean {
    return isValidHttpUrl(url);
  }
}
