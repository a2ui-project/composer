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
 * Unconditional console.log emitted by @a2ui/angular's A2uiRendererService constructor.
 * Safe to suppress in unit tests; keeps 3P framework noise out of test output.
 */
const A2UI_RENDERER_INIT_LOG = '[A2uiRendererService]';

/**
 * Logged by @a2ui/angular's Surface component when rendering a surfaceId before a
 * surface model arrives. Safe to suppress in unit tests where async model arrival is expected.
 */
const A2UI_SURFACE_WAITING_WARNING = 'Waiting for it...';

export default defineConfig({
  test: {
    silent: 'passed-only',
    onConsoleLog(log) {
      if (log.includes(A2UI_RENDERER_INIT_LOG) || log.includes(A2UI_SURFACE_WAITING_WARNING)) {
        return false;
      }
    },
  },
});
