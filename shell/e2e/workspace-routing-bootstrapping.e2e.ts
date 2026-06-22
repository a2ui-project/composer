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
  test('redirects unconfigured boot (missing renderer URL) at root to settings page with card layout', async ({
    page,
  }) => {
    await page.route('**/config.json', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          allowOverrides: true,
          // no defaultRendererUrl
        }),
      });
    });
    await page.goto('/');
    await page.waitForURL('**/settings');
    await expect(page.locator('.settings-container')).toBeVisible();
    await expect(page.locator('.settings-card')).toBeVisible();
  });

  test('does not redirect if default renderer URL is present but API key is missing', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForURL(url => url.pathname === '/');
    await expect(page.locator('.workspace-container')).toBeVisible();
    await expect(page.locator('.disabled-chat-panel')).toBeVisible();
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

  test('verifies components gallery navigation link is visible by default', async ({page}) => {
    await page.goto('/');

    const galleryLink = page.getByRole('link', {name: 'Components Gallery'});
    await expect(galleryLink).toBeVisible();
  });

  test('loads components gallery view successfully via direct URL navigation', async ({
    page,
  }, testInfo) => {
    await page.goto('/gallery');

    const galleryContainer = page.locator('.gallery-container');
    await expect(galleryContainer).toBeVisible();
    await expect(page.getByRole('heading', {name: 'No Component Selected'})).toBeVisible();
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('gallery-container-direct', {
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
