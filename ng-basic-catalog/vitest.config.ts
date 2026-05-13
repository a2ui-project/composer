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
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({jit: true, tsconfig: './tsconfig.spec.json'})],
  resolve: {
    dedupe: ['@angular/core', '@a2ui/angular', 'a2ui-bridge'],
    alias: {
      'a2ui-bridge': new URL('../bridge/src/preview-bridge.ts', import.meta.url).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['@a2ui/angular'],
        },
      },
    },
    server: {
      deps: {
        inline: true,
      },
    },
  },
});
