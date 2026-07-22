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
import {WindowWithMonaco} from './types';

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch (e) {}
  });
  await page.goto('/');
});

test.describe('E2E Workspace User Journey', () => {
  test('verifies full workflow across settings connection status, forced 3P mode toggle, and raw editor invalid JSON gate', async ({
    page,
  }) => {
    // 1. Launch Composer Workspace and verify static header and New Session button
    await expect(page.locator('.header-title')).toContainText('A2UI Composer');
    await expect(page.locator('.reset-session-button')).toBeVisible();

    // 2. Switch to Settings Page via Sidenav
    await page.getByRole('link', {name: 'Settings'}).click();
    await page.waitForURL('**/settings');

    // 3. Verify connection status badges
    await expect(page.locator('.bridge-badge')).toBeVisible();
    await expect(page.locator('.catalog-badge')).toBeVisible();

    // 4. Verify auth section is hidden and API key provisioning section appears when IS_1P_AUTH_ENABLED is false
    await expect(page.locator('.first-party-auth-section')).toBeHidden();
    await expect(page.getByText('Gemini API Provisioning')).toBeVisible();

    // 5. Provide API key and save settings to unlock workspace
    await page.getByLabel('Gemini API Key').fill('test-api-key');
    const saveBtn = page.getByRole('button', {name: 'Save Settings'});
    await Promise.all([page.waitForURL(url => url.pathname === '/'), saveBtn.click()]);
    await page.waitForLoadState('load');

    // 7. Wait for Monaco to load and enter malformed JSON
    const editorLocator = page.locator('.monaco-editor');
    await expect(editorLocator).toBeVisible();

    await page.waitForFunction(() => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    });

    await page.waitForTimeout(500); // Give Monaco time to fully attach event listeners

    await page.evaluate(() => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue('invalid json {');
      }
    });

    // 8. Assert that snackbar appears
    const snackbarLocator = page.locator('.mat-mdc-snack-bar-label').first();
    await expect(snackbarLocator).toContainText('Invalid JSON syntax detected.');

    // 9. Correct JSON and verify snackbar disappears
    await page.evaluate(() => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue(
          '{"version": "v0.9", "createSurface": {"surfaceId": "test", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"}}',
        );
      }
    });
    // With dismissal logic, it should disappear immediately
    await expect(page.locator('.mat-mdc-snack-bar-label')).toHaveCount(0, {timeout: 3000});
  });
});
