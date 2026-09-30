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

import {defineConfig} from 'vitest/config';

/**
 * Emitted by Lit in development mode to advise developers not to deploy dev builds to production.
 * Safe to suppress in unit tests where running development builds is standard; keeps 3P
 * framework noise out of failing test output while silent: 'passed-only' handles passing tests.
 */
const LIT_DEV_MODE_LOG = 'Lit is in dev mode';

export default defineConfig({
  test: {
    silent: 'passed-only',
    onConsoleLog(log) {
      // Filter out third-party Lit dev mode notices from failing test console logs.
      if (log.includes(LIT_DEV_MODE_LOG)) {
        return false;
      }
    },
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
