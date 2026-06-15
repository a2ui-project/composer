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

import {test, expect} from '@playwright/test';

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });
});

test.describe('Startup Resolution & Redirection', () => {
  test('redirects unconfigured boot at root to settings page with card layout', async ({page}) => {
    await page.goto('/');
    await page.waitForURL('**/settings');
    await expect(page.locator('.settings-container')).toBeVisible();
    await expect(page.locator('.settings-card')).toBeVisible();
  });
});

test.describe('Workspace Navigation & Layout Modes', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
      } catch (e) {}
    });
  });

  test('verifies components gallery navigation link is conditionally hidden by default', async ({
    page,
  }) => {
    await page.goto('/');

    const galleryLink = page.getByRole('link', {name: 'Components Gallery'});
    await expect(galleryLink).toBeHidden();
  });

  test('loads components gallery view successfully via direct URL navigation', async ({
    page,
  }, testInfo) => {
    await page.goto('/gallery');

    const galleryPlaceholder = page.locator('.gallery-placeholder');
    await expect(galleryPlaceholder).toBeVisible();
    await expect(galleryPlaceholder).toContainText('Components Gallery Placeholder');
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('gallery-placeholder-direct', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });

  test('loads workspace successfully when valid custom renderer query parameter is provided', async ({
    page,
  }) => {
    await page.goto('/?renderer=http://custom-renderer.com');
    await expect(page).toHaveTitle(/A2UI Composer/);
    await expect(page.locator('.workspace-container')).toBeVisible();
  });

  test('verifies responsive layout collapse in IDE webview mode', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3000&extension=true');
    await expect(page.locator('.workspace-container')).toHaveClass(/extension-mode/);
  });
});
