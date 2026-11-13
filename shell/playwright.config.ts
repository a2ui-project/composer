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

/**
 * Headless and CI runs must own their dev servers so they never adopt a stale
 * or foreign `ng serve`/Vite instance and fail fast if a port is already taken.
 * Interactive `yarn e2e` keeps reusing a developer's running `yarn start`.
 */
const reuseExistingServer = !process.env['CI'] && !process.env['E2E_HEADLESS'];

/**
 * Configuration for Playwright automated testing.
 * Setting CI=true cleanly enforces deterministic environments by forbidding .only tests,
 * adding retry policies, preventing trace viewers from automatically springing open,
 * and avoiding stale dev server reuse which can corrupt headless testing outputs.
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : 4,
  outputDir: './e2e/test-results',
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
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
    launchOptions: {args: ['--no-sandbox', '--disable-dev-shm-usage']},
  },
  projects: [
    {
      // Behavioural E2E user journeys (`*.e2e.ts`). These assert on DOM state
      // and interactions rather than pixel output, so they can run against any
      // standard Chrome installation on a developer machine or CI runner.
      name: 'e2e',
      testMatch: 'e2e/**/*.e2e.ts',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env['CI'] ? 'chrome' : undefined,
      },
    },
    {
      // Visual regression tests (`*.visual.ts`). These compare component
      // screenshots against committed baseline PNGs. To prevent false positives
      // from environmental differences, all rendering variables are pinned:
      // bundled Chromium, light color scheme, US English locale, and UTC timezone.
      // In CI, these run inside a pinned Playwright Docker container to lock down
      // the Linux OS and font rendering stack.
      name: 'visual',
      testMatch: 'src/**/*.visual.ts',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
        locale: 'en-US',
        timezoneId: 'UTC',
      },
    },
  ],
  webServer: [
    {
      command: 'node ../scripts/ensure-e2e-samples.mjs && npx ng serve',
      url: 'http://localhost:4200',
      reuseExistingServer,
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace ng-basic-catalog start',
      url: 'http://localhost:3456',
      reuseExistingServer,
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace lit-basic-catalog start',
      url: 'http://localhost:3457',
      reuseExistingServer,
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace react-basic-catalog start',
      url: 'http://localhost:3458',
      reuseExistingServer,
      timeout: 120 * 1000,
    },
    {
      command: 'corepack yarn workspace react-slack-catalog start',
      url: 'http://localhost:3460',
      reuseExistingServer,
      timeout: 120 * 1000,
    },
  ],
});
