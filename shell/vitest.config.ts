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
 * Deprecation warning emitted by Vite/AnalogJS regarding optimizeDeps.esbuildOptions.
 * Safe to suppress in unit tests as the build configuration is managed upstream by AnalogJS.
 */
const OPTIMIZE_DEPS_ESBUILD_OPTIONS_WARNING = 'optimizeDeps.esbuildOptions';

/**
 * Emitted by Vite when a sourcemap references a source file outside its package root.
 * Safe to suppress in unit tests as sourcemap resolution outside the package does not affect test execution.
 */
const SOURCEMAP_OUTSIDE_PACKAGE_WARNING = 'points to a source file outside its package';

const SUPPRESSED_VITE_WARNINGS = [
  OPTIMIZE_DEPS_ESBUILD_OPTIONS_WARNING,
  SOURCEMAP_OUTSIDE_PACKAGE_WARNING,
];

function isSuppressedViteWarning(msg: string): boolean {
  return SUPPRESSED_VITE_WARNINGS.some(warning => msg.includes(warning));
}

const VITEST_ANGULAR_ESM_PLUGIN_NAME = '@analogjs/vitest-angular-esm-plugin';
const NODE_MODULES_DIR = 'node_modules';

const customLogger = createLogger();
const originalWarn = customLogger.warn;
const originalWarnOnce = customLogger.warnOnce;
customLogger.warn = (msg, options) => {
  // Suppress third-party build and sourcemap warnings originating from dependencies.
  if (isSuppressedViteWarning(msg)) {
    return;
  }
  originalWarn(msg, options);
};
customLogger.warnOnce = (msg, options) => {
  // Suppress third-party build and sourcemap warnings originating from dependencies.
  if (isSuppressedViteWarning(msg)) {
    return;
  }
  originalWarnOnce(msg, options);
};

export default defineConfig({
  esbuild: false,
  customLogger,
  plugins: [
    angular({jit: true, tsconfig: './tsconfig.spec.json', oxc: false}),
    {
      name: 'suppress-sourcemap-warnings',
      configResolved(config) {
        const originalWarn = config.logger.warn;
        const originalWarnOnce = config.logger.warnOnce;
        config.logger.warn = (msg, options) => {
          // Suppress third-party build and sourcemap warnings originating from dependencies.
          if (isSuppressedViteWarning(msg)) {
            return;
          }
          originalWarn(msg, options);
        };
        config.logger.warnOnce = (msg, options) => {
          // Suppress third-party build and sourcemap warnings originating from dependencies.
          if (isSuppressedViteWarning(msg)) {
            return;
          }
          originalWarnOnce(msg, options);
        };

        // @analogjs/vitest-angular-esm-plugin transforms files by wrapping module code inside
        // a CommonJS-style factory function (function(exports, require, module, __filename, __dirname) { ... })
        // to work around Node ESM module caching.
        // When this transform runs on first-party .spec.ts files before Vitest's vi.mock / vi.hoisted
        // hoisting pass, Vitest sees top-level vi.hoisted() and vi.mock() calls as nested inside
        // that wrapper function and emits warnings that they are not at the top level of the module.
        // Restricting the plugin's transform hook to node_modules (where Angular ESM packages actually
        // need it) prevents wrapping first-party .spec.ts files so top-level vi.hoisted() and vi.mock()
        // work cleanly without warnings.
        const esmPlugin = config.plugins.find(p => p.name === VITEST_ANGULAR_ESM_PLUGIN_NAME);
        if (esmPlugin?.transform) {
          const originalTransform = esmPlugin.transform;
          esmPlugin.transform = function (_code: string, id: string) {
            if (!id.includes(NODE_MODULES_DIR)) {
              return undefined;
            }
            return (originalTransform as Function).apply(this, arguments);
          };
        }
      },
    },
  ],
  test: {
    silent: 'passed-only',
    pool: 'threads',
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000/',
      },
    },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      enabled: true,
      clean: true,
      reportsDirectory: './coverage',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 75,
        statements: 85,
      },
    },
  },
});
