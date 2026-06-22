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

  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.clear();
      localStorage.setItem('a2ui_composer_force_1p', 'true');
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

    // 4. Toggle Forced 3P Authentication Mode, verify localStorage, and assert API key provisioning section appears
    const force3pSwitch = page.getByRole('switch', {
      name: 'Force External Third-Party Authentication Mode',
    });
    await force3pSwitch.click();
    await page.waitForURL(url => url.pathname === '/');
    await page.goto('/settings');

    const isForce3p = await page.evaluate(() => localStorage.getItem('a2ui_composer_force_3p'));
    expect(isForce3p).toBe('true');

    await expect(page.getByText('Gemini API Provisioning')).toBeVisible();

    // 5. Toggle back to 1P mode and verify API key section disappears
    await force3pSwitch.click();
    await page.waitForURL('**/');

    const isForce3pAfter = await page.evaluate(() =>
      localStorage.getItem('a2ui_composer_force_3p'),
    );
    expect(isForce3pAfter).toBeNull();

    await page.goto('/settings');
    await expect(page.getByText('Gemini API Provisioning')).not.toBeVisible();

    // 6. Switch back to Workspace
    await page.getByRole('link', {name: 'Composer Workspace'}).click();

    // 7. Enter malformed JSON in Raw Editor textarea
    const rawEditor = page.getByPlaceholder('Enter raw JSON here...');
    await rawEditor.fill('invalid json {');

    // 8. Assert that warning badge (.invalid-json-badge) appears above textarea
    await expect(page.locator('.invalid-json-badge')).toBeVisible();

    // 9. Correct JSON and verify warning badge disappears
    await rawEditor.fill(
      '{"version": "v0.9", "createSurface": {"surfaceId": "test", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"}}',
    );
    await expect(page.locator('.invalid-json-badge')).not.toBeVisible();
  });
});
