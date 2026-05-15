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

test.describe('Settings Integration Suite', () => {
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
      (window as any).__BEFORE_RELOAD__ = true;
    });

    const saveBtn = page.getByRole('button', {name: 'Save Settings'});
    await Promise.all([page.waitForURL('**/settings'), saveBtn.click()]);

    const sentinel = await page.evaluate(() => (window as any).__BEFORE_RELOAD__);
    expect(sentinel).toBeUndefined();

    await page.goto('/');
    await expect(page.locator('.workspace-container')).toBeVisible();
  });
});
