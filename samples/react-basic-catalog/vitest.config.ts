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
import react from '@vitejs/plugin-react';
import path from 'path';

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
 * Emitted by @a2ui/react's useMarkdown hook when rendering text without a custom markdown
 * renderer provider configured in unit tests. Safe to suppress in unit tests; keeps 3P
 * framework noise out of failing test output while silent: 'passed-only' handles passing tests.
 */
const A2UI_USE_MARKDOWN_WARNING = '[useMarkdown]';

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
  plugins: [
    react(),
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
    alias: {
      'react/jsx-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-dev-runtime'),
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom/client': path.resolve(__dirname, '../../node_modules/react-dom/client'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
  },
  test: {
    silent: 'passed-only',
    onConsoleLog(log) {
      // Filter out third-party useMarkdown warnings from failing test console logs.
      if (log.includes(A2UI_USE_MARKDOWN_WARNING)) {
        return false;
      }
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    server: {
      deps: {
        inline: ['@a2ui/react', '@a2ui/web_core'],
      },
    },
  },
});
