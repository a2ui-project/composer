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
      await page.addInitScript(() => {
        localStorage.clear();
        localStorage.setItem('a2ui_composer_force_3p', 'true');
      });
      await page.goto('/settings');
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

      await expect(page.locator('.workspace-container')).toBeVisible();
    });

    test('persists configuration successfully with default relative renderer URL and loads workspace with pre-populated draft', async ({
      page,
    }) => {
      const apiKeyInput = page.getByLabel('Gemini API Key');
      await apiKeyInput.fill('test-api-key');

      const saveBtn = page.getByRole('button', {name: 'Save Settings'});
      await Promise.all([page.waitForURL(url => url.pathname === '/'), saveBtn.click()]);
      await page.waitForLoadState('load');

      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();
    });
  });

  test.describe('Enterprise & Environment Constraints', () => {
    test('verifies enterprise configuration locking (allowOverrides: false)', async ({page}) => {
      await page.route('**/config.json', async route => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://locked-renderer.com',
                allowOverrides: false,
              },
            },
          }),
        });
      });

      await page.goto('/settings');
      await expect(page.getByLabel('Target Renderer URL')).toBeDisabled();
      const rendererVal = await page.getByLabel('Target Renderer URL').inputValue();
      expect(rendererVal).toBe('http://locked-renderer.com');
    });

    test('fetches configuration when config.json request is intercepted by route handler', async ({
      page,
    }) => {
      await page.route('**/config.json', async route => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://intercepted-custom-config:3000',
                allowOverrides: true,
              },
            },
          }),
        });
      });

      await page.goto('/settings');
      const rendererInput = page.getByLabel('Target Renderer URL');
      await expect(rendererInput).not.toBeDisabled();
      const rendererVal = await rendererInput.inputValue();
      expect(rendererVal).toBe('http://intercepted-custom-config:3000');
    });

    test('verifies server apiKey in config.json decouples context locking, disables API key unmasking, and does not persist key on save', async ({
      page,
    }) => {
      await page.route('**/config.json', async route => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            profiles: {
              default: {
                rendererUrl: 'http://unlocked-renderer.com',
                allowOverrides: true,
                apiKey: 'server-provided-api-key',
              },
            },
          }),
        });
      });

      await page.addInitScript(() => {
        localStorage.setItem('a2ui_composer_force_3p', 'true');
      });
      await page.goto('/settings');

      // Context is unlocked because allowOverrides is true
      await expect(page.getByLabel('Target Renderer URL')).toBeEnabled();

      // Toggle button is disabled because API key was provided by config
      await expect(page.locator('.api-key-toggle-btn')).toBeDisabled();

      // Click 'Save Settings' and wait for navigation
      const saveBtn = page.getByRole('button', {name: 'Save Settings'});
      await Promise.all([page.waitForURL(url => url.pathname === '/'), saveBtn.click()]);
      await page.waitForLoadState('load');

      // Verify localStorage and IndexedDB have no stored credential
      const storedKey = await page.evaluate(async () => {
        const localVal = localStorage.getItem('a2ui_gemini_api_key');
        if (localVal) return localVal;

        return new Promise<string | null>(resolve => {
          if (typeof indexedDB === 'undefined') {
            resolve(null);
            return;
          }
          const req = indexedDB.open('a2ui_secure_credentials_db', 2);
          req.onsuccess = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains('credentials')) {
              resolve(null);
              return;
            }
            const tx = db.transaction('credentials', 'readonly');
            const getReq = tx.objectStore('credentials').get('a2ui_gemini_api_key');
            getReq.onsuccess = () => resolve(getReq.result ? 'found' : null);
            getReq.onerror = () => resolve(null);
          };
          req.onerror = () => resolve(null);
        });
      });
      expect(storedKey).toBeNull();
    });

    test('verifies 1P vs 3P environment detection and disables chat panel on missing API keys', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.setItem('a2ui_composer_force_3p', 'true');
        localStorage.removeItem('a2ui_composer_force_1p');
      });
      await page.goto('/?renderer=http://localhost:3000');
      await expect(page.locator('.disabled-chat-panel')).toBeVisible();
      await expect(page.locator('.disabled-notice-text')).toContainText(
        'This feature is only available with a valid Gemini API key.',
      );
    });

    test('verifies auth section is hidden when IS_1P_AUTH_ENABLED is false and API key provisioning panel visibility', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        localStorage.clear();
      });
      await page.goto('/settings');

      // Verify connection badges (part of the settings view tests)
      await expect(page.locator('.bridge-badge')).toBeVisible();
      await expect(page.locator('.catalog-badge')).toBeVisible();

      // Since IS_1P_AUTH_ENABLED is false, auth section is hidden and 3P API provisioning is visible
      await expect(page.locator('.first-party-auth-section')).toBeHidden();
      await expect(page.getByText('Gemini API Provisioning')).toBeVisible();
    });
  });
});
