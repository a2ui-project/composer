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
import {createLogger} from 'vite';
import angular from '@analogjs/vite-plugin-angular';

/**
 * Emitted by Vite when a sourcemap references a source file outside its package root.
 * Safe to suppress in unit tests as sourcemap resolution outside the package does not affect test execution.
 */
const SOURCEMAP_OUTSIDE_PACKAGE_WARNING = 'points to a source file outside its package';

const SUPPRESSED_VITE_WARNINGS = [SOURCEMAP_OUTSIDE_PACKAGE_WARNING];

function isSuppressedViteWarning(msg: string): boolean {
  return SUPPRESSED_VITE_WARNINGS.some(warning => msg.includes(warning));
}

/**
 * Unconditional console.log emitted by @a2ui/angular's A2uiRendererService constructor.
 * Safe to suppress in unit tests; keeps 3P framework noise out of failing test output
 * while silent: 'passed-only' handles passing tests.
 */
const A2UI_RENDERER_INIT_LOG = '[A2uiRendererService]';

/**
 * Logged by @a2ui/angular's Surface component when rendering a surfaceId before a
 * surface model arrives. Safe to suppress in unit tests where async model arrival is expected;
 * keeps 3P framework noise out of failing test output while silent: 'passed-only' handles
 * passing tests.
 */
const A2UI_SURFACE_WAITING_WARNING = 'Waiting for it...';

const customLogger = createLogger();
const originalWarn = customLogger.warn;
const originalWarnOnce = customLogger.warnOnce;
customLogger.warn = (msg, options) => {
  // Suppress external sourcemap warnings originating from upstream packages.
  if (isSuppressedViteWarning(msg)) {
    return;
  }
  originalWarn(msg, options);
};
customLogger.warnOnce = (msg, options) => {
  // Suppress external sourcemap warnings originating from upstream packages.
  if (isSuppressedViteWarning(msg)) {
    return;
  }
  originalWarnOnce(msg, options);
};

export default defineConfig({
  customLogger,
  esbuild: false,
  plugins: [
    angular({jit: false, tsconfig: './tsconfig.spec.json', oxc: false}),
    {
      name: 'suppress-sourcemap-warnings',
      configResolved(config) {
        const originalWarn = config.logger.warn;
        const originalWarnOnce = config.logger.warnOnce;
        config.logger.warn = (msg, options) => {
          // Suppress external sourcemap warnings originating from upstream packages.
          if (isSuppressedViteWarning(msg)) {
            return;
          }
          originalWarn(msg, options);
        };
        config.logger.warnOnce = (msg, options) => {
          // Suppress external sourcemap warnings originating from upstream packages.
          if (isSuppressedViteWarning(msg)) {
            return;
          }
          originalWarnOnce(msg, options);
        };
      },
    },
  ],
  resolve: {
    dedupe: ['@angular/core', '@a2ui/angular', 'a2ui-bridge'],
  },
  test: {
    silent: 'passed-only',
    onConsoleLog(log) {
      // Filter out third-party Angular renderer initialization and waiting logs from failing test output.
      if (log.includes(A2UI_RENDERER_INIT_LOG) || log.includes(A2UI_SURFACE_WAITING_WARNING)) {
        return false;
      }
    },
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['@angular/core', '@angular/common', '@a2ui/angular', 'a2ui-bridge'],
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
