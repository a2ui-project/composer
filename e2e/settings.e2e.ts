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
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('renders static configuration default URL placeholder correctly', async ({page}) => {
    const rendererInput = page.locator('input[formControlName="rendererUrl"]');
    await expect(rendererInput).toHaveAttribute('placeholder', 'http://localhost:3000');
  });

  test('toggles API key input visibility between password and text', async ({page}) => {
    const apiKeyInput = page.locator('input[formControlName="apiKey"]');
    await expect(apiKeyInput).toHaveAttribute('type', 'password');

    const toggleBtn = page.locator('button[aria-label*="API key"]');
    await toggleBtn.click();
    await expect(apiKeyInput).toHaveAttribute('type', 'text');

    await toggleBtn.click();
    await expect(apiKeyInput).toHaveAttribute('type', 'password');
  });

  test('displays client-side validation errors for missing or malformed fields upon submission', async ({
    page,
  }) => {
    const rendererInput = page.locator('input[formControlName="rendererUrl"]');
    await rendererInput.fill('');

    const apiKeyInput = page.locator('input[formControlName="apiKey"]');
    await apiKeyInput.fill('');

    const saveBtn = page.locator('button', {hasText: 'Save Settings'});
    await saveBtn.click();

    await expect(page.locator('mat-error', {hasText: /required/i}).first()).toBeVisible();

    await rendererInput.fill('malformed-url');
    await saveBtn.click();
    await expect(page.locator('mat-error', {hasText: /valid HTTP/i})).toBeVisible();
  });

  test('persists configuration successfully, triggers explicit window reload, and unlocks guarded routes', async ({
    page,
  }) => {
    const rendererInput = page.locator('input[formControlName="rendererUrl"]');
    await rendererInput.fill('http://localhost:3000');

    const apiKeyInput = page.locator('input[formControlName="apiKey"]');
    await apiKeyInput.fill('test-api-key');

    await page.evaluate(() => {
      (window as any).__BEFORE_RELOAD__ = true;
    });

    const saveBtn = page.locator('button', {hasText: 'Save Settings'});
    await Promise.all([page.waitForURL('**/settings'), saveBtn.click()]);

    const sentinel = await page.evaluate(() => (window as any).__BEFORE_RELOAD__);
    expect(sentinel).toBeUndefined();

    await page.goto('/');
    await expect(page.locator('.workspace-container')).toBeVisible();
  });

  test('forces third-party context rendering via local storage override key', async ({page}) => {
    await page.evaluate(() => {
      localStorage.setItem('a2ui_composer_force_3p', 'true');
    });
    await page.reload();

    await expect(page.locator('input[formControlName="apiKey"]')).toBeVisible();
  });
});
