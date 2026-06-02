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
import {formatTimestamp} from './date.utils';

describe('Date Utils', () => {
  describe('formatTimestamp', () => {
    it('formats epoch time to HH:mm:ss.SSS string cleanly with padded zeros', () => {
      // Use local Date constructor to guarantee consistent time zone formatting
      const testDate = new Date(2026, 5, 2, 9, 5, 7, 8); // June 2, 2026, 09:05:07.008
      const result = formatTimestamp(testDate.getTime());
      expect(result).toBe('09:05:07.008');
    });

    it('formats epoch time with double-digit hours, minutes, seconds, and ms', () => {
      const testDate = new Date(2026, 5, 2, 14, 35, 45, 999); // June 2, 2026, 14:35:45.999
      const result = formatTimestamp(testDate.getTime());
      expect(result).toBe('14:35:45.999');
    });
  });
});
