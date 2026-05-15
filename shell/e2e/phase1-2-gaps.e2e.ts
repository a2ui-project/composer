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

test.describe('Phase 1-2 Gaps Integration Suite', () => {
  test('verifies New Session reset button functionality', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3000');
    await page.evaluate(() => {
      try {
        localStorage.setItem('a2ui_composer_session_state', 'test_value');
      } catch (e) {}
    });
    await page.getByRole('button', {name: 'New Session'}).click();
    await page.waitForFunction(
      () => {
        try {
          return localStorage.getItem('a2ui_composer_session_state') === null;
        } catch (e) {
          return true;
        }
      },
      {timeout: 5000},
    );
    const testVal = await page.evaluate(() => {
      try {
        return localStorage.getItem('a2ui_composer_session_state');
      } catch (e) {
        return null;
      }
    });
    expect(testVal).toBeNull();
  });

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
        localStorage.removeItem('a2ui_composer_api_key');
      } catch (e) {}
    });
    await page.reload();
    await page.waitForURL('**/settings');
    await expect(page.getByLabel('Gemini API Key')).toBeVisible();
  });
});
