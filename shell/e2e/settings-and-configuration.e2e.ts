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

test.describe('Settings and Client Configuration', () => {
  test.describe('Custom Config Modification & Persistence', () => {
    test.beforeEach(async ({page}) => {
      await page.goto('/settings');
      await page.evaluate(() => {
        try {
          localStorage.clear();
          localStorage.setItem('a2ui_composer_force_3p', 'true');
        } catch (e) {}
      });
      await page.reload();
    });

    test('persists configuration successfully, triggers explicit window reload, and unlocks guarded routes', async ({
      page,
    }) => {
      const rendererInput = page.getByLabel('Target Renderer URL');
      await rendererInput.fill('http://localhost:3000');

      const apiKeyInput = page.getByLabel('Gemini API Key');
      await apiKeyInput.fill('test-api-key');

      await page.evaluate(() => {
        (window as unknown as {__BEFORE_RELOAD__?: boolean}).__BEFORE_RELOAD__ = true;
      });

      const saveBtn = page.getByRole('button', {name: 'Save Settings'});
      await Promise.all([page.waitForURL(url => url.pathname === '/'), saveBtn.click()]);
      await page.waitForLoadState('load');

      const sentinel = await page.evaluate(
        () => (window as unknown as {__BEFORE_RELOAD__?: boolean}).__BEFORE_RELOAD__,
      );
      expect(sentinel).toBeUndefined();

      await page.goto('/');
      await expect(page.locator('.workspace-container')).toBeVisible();
    });
  });

  test.describe('Enterprise & Environment Constraints', () => {
    test('verifies enterprise configuration locking (allowOverrides: false)', async ({page}) => {
      await page.route('**/config.json', async route => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            defaultRendererUrl: 'http://locked-renderer.com',
            allowOverrides: false,
          }),
        });
      });

      await page.goto('/settings');
      await expect(page.getByLabel('Target Renderer URL')).toBeDisabled();
      const rendererVal = await page.getByLabel('Target Renderer URL').inputValue();
      expect(rendererVal).toBe('http://locked-renderer.com');
    });

    test('verifies 1P vs 3P environment detection and automatic redirection on missing API keys', async ({
      page,
    }) => {
      await page.goto('/?renderer=http://localhost:3000');
      await page.evaluate(() => {
        try {
          localStorage.setItem('a2ui_composer_force_3p', 'true');
          localStorage.removeItem('a2ui_composer_force_1p');
        } catch (e) {}
      });
      await page.reload();
      await page.waitForURL('**/settings');
      await expect(page.getByLabel('Gemini API Key')).toBeVisible();
    });

    test('verifies forced 3P authentication mode toggle and API key provisioning panel visibility', async ({
      page,
    }) => {
      await page.goto('/');
      await page.evaluate(() => {
        try {
          localStorage.clear();
          localStorage.setItem('a2ui_composer_force_1p', 'true');
        } catch (e) {}
      });
      await page.goto('/settings');

      // Verify connection badges (part of the settings view tests)
      await expect(page.locator('.bridge-badge')).toBeVisible();
      await expect(page.locator('.catalog-badge')).toBeVisible();

      const force3pSwitch = page.getByRole('switch', {
        name: 'Force External Third-Party Authentication Mode',
      });
      await force3pSwitch.click();
      await page.waitForURL('**/settings');

      const isForce3p = await page.evaluate(() => localStorage.getItem('a2ui_composer_force_3p'));
      expect(isForce3p).toBe('true');
      await expect(page.getByText('Gemini API Provisioning')).toBeVisible();

      // Toggle back and verify it goes to workspace (as reload happens when changing to 1P)
      await force3pSwitch.click();
      await page.waitForURL('**/');

      const isForce3pAfter = await page.evaluate(() =>
        localStorage.getItem('a2ui_composer_force_3p'),
      );
      expect(isForce3pAfter).toBeNull();
      await expect(page.getByText('Gemini API Provisioning')).not.toBeVisible();
    });
  });
});
