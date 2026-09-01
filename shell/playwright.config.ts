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

import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['e2e/**/*.e2e.ts', 'src/**/*.visual.ts'],
  testIgnore: process.env['VISUAL_TESTS'] ? [] : ['**/*.visual.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  outputDir: './e2e/test-results',
  reporter: [
    ['list'],
    [
      'html',
      {
        open: process.env['CI'] || process.env['E2E_HEADLESS'] ? 'never' : 'always',
        outputFolder: './e2e/playwright-report',
      },
    ],
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      scale: 'css',
    },
  },
  snapshotPathTemplate: '{testFileDir}/__snapshots__/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4200',
    viewport: {width: 1280, height: 800},
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: [
    {
      command: 'corepack yarn start',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace ng-basic-catalog start',
      url: 'http://localhost:3456',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace lit-basic-catalog start',
      url: 'http://localhost:3457',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace react-basic-catalog start',
      url: 'http://localhost:3458',
      reuseExistingServer: !process.env['CI'],
      timeout: 120 * 1000,
    },
  ],
});
