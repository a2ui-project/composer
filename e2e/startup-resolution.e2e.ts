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

test.describe('Phase 1 Scaffolding Shell Integration', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      localStorage.setItem('a2ui_composer_api_key', 'test-api-key');
    });
  });

  test('navigates seamlessly between primary workspace and components gallery via sidebar routing links', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    const galleryLink = page.locator('a', {hasText: 'Components Gallery'});
    await galleryLink.click();
    await page.waitForURL('**/gallery');

    const galleryPlaceholder = page.locator('.gallery-placeholder');
    await expect(galleryPlaceholder).toBeVisible();
    await expect(galleryPlaceholder).toContainText('Components Gallery Placeholder');
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('gallery-placeholder-navigation', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });

    const workspaceLink = page.locator('a', {hasText: 'Composer Workspace'});
    await workspaceLink.click();
    await page.waitForURL('**/');

    const workspaceContainer = page.locator('.workspace-container');
    await expect(workspaceContainer).toBeVisible();
  });

  test('loads workspace successfully when valid custom renderer query parameter is provided', async ({
    page,
  }) => {
    await page.goto('/?renderer=http://custom-renderer.com');
    await expect(page).toHaveTitle(/A2UI Composer/);
    await expect(page.locator('.workspace-container')).toBeVisible();
  });
});
