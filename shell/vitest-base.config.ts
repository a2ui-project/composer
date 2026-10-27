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

// Loaded by @angular/build:unit-test as `runnerConfig`.
// Must stay plugin-free: plugins here run on the compiled in-memory bundles.
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    silent: 'passed-only',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000/',
      },
    },
  },
});
