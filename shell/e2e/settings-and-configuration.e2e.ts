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
        if (!sessionStorage.getItem('init_cleared')) {
          sessionStorage.setItem('init_cleared', 'true');
          localStorage.clear();
          localStorage.setItem('a2ui_composer_force_3p', 'true');
        }
      });
      await page.goto('/settings');
    });

    test('persists configuration immediately upon selection', async ({page}) => {
      await page.locator('.add-api-key-button').click();
      await page.locator('#api-key-name-input').fill('Test Key');
      await page.locator('#api-key-value-input').fill('test-api-key');
      await page.getByRole('dialog').getByRole('button', {name: 'Add', exact: true}).click();

      await page.locator('.add-renderer-button').click();
      await page.locator('#renderer-name-input').fill('Test Renderer');
      await page.locator('#renderer-url-input').fill('http://localhost:9090');
      await page.getByRole('dialog').getByRole('button', {name: 'Add', exact: true}).click();

      await page.waitForFunction(() => !!localStorage.getItem('a2ui_composer_selected_renderer'));
      await page.waitForFunction(() => !!localStorage.getItem('a2ui_composer_selected_api_key'));

      const storedRendererId = await page.evaluate(() =>
        localStorage.getItem('a2ui_composer_selected_renderer'),
      );
      expect(storedRendererId).toMatch(/^custom-\d+$/);

      const storedApiKeyId = await page.evaluate(() =>
        localStorage.getItem('a2ui_composer_selected_api_key'),
      );
      expect(storedApiKeyId).toMatch(/^custom-\d+$/);

      await page.getByRole('link', {name: 'Composer Workspace'}).click();
      await page.waitForURL(url => url.pathname === '/');
      await page.waitForLoadState('load');

      await expect(page.locator('.workspace-container')).toBeVisible();
    });

    test('persists configuration immediately with default relative renderer URL and loads workspace with pre-populated draft', async ({
      page,
    }) => {
      await page.locator('.add-api-key-button').click();
      await page.locator('#api-key-name-input').fill('Unique Key');
      await page.locator('#api-key-value-input').fill('new-unique-api-key');
      await page.getByRole('dialog').getByRole('button', {name: 'Add', exact: true}).click();

      await page.waitForFunction(() => !!localStorage.getItem('a2ui_composer_selected_api_key'));

      const storedApiKeyId = await page.evaluate(() =>
        localStorage.getItem('a2ui_composer_selected_api_key'),
      );
      expect(storedApiKeyId).toMatch(/^custom-\d+$/);

      await page.getByRole('link', {name: 'Composer Workspace'}).click();
      await page.waitForURL(url => url.pathname === '/');
      await page.waitForLoadState('load');

      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();
    });
  });

  test.describe('Enterprise & Environment Constraints', () => {
    test('fetches configuration when config.json request is intercepted by route handler', async ({
      page,
    }) => {
      await page.route('**/config.json', async route => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            renderers: {
              default: {
                rendererUrl: 'http://intercepted-custom-config:3000',
              },
            },
          }),
        });
      });

      await page.goto('/settings');
      const rendererSelect = page.locator('a2ui-composer-renderer-selector mat-select');
      await expect(rendererSelect).not.toHaveAttribute('aria-disabled', 'true');
      await expect(rendererSelect).toContainText('default');
    });

    test('verifies server apiKey in config.json disables API key unmasking', async ({page}) => {
      await page.route('**/config.json', async route => {
        await route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            renderers: {
              default: {
                rendererUrl: 'http://unlocked-renderer.com',
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

      const rendererSelect = page.locator('a2ui-composer-renderer-selector mat-select');
      await expect(rendererSelect).not.toHaveAttribute('aria-disabled', 'true');

      // API key selector is visible when API key was provided by config
      await expect(page.locator('a2ui-composer-api-key-selector')).toBeVisible();

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
