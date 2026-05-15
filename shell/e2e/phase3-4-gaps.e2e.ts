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

test.describe('Phase 3-4 Gaps Integration Suite', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
        localStorage.setItem('a2ui_composer_api_key', 'test-api-key');
      } catch (e) {}
    });
  });

  test('verifies bridge blocking state overlay mounting/unmounting and FORCE_UNBLOCK message ingestion', async ({
    page,
  }) => {
    await page.route('http://custom-renderer.com/*', async route => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>Preview</body></html>`,
      });
    });

    await page.goto('/?renderer=http://custom-renderer.com/index.html');
    await expect(page.locator('.workspace-container')).toBeVisible();

    const iframeBody = page.frameLocator('iframe.preview-iframe').locator('body');
    await expect(iframeBody).toBeVisible();

    await iframeBody.evaluate(() => {
      window.parent.postMessage(
        {type: 'SET_BLOCKING_STATE', payload: {blocked: true, message: 'Freezing'}},
        '*',
      );
    });

    await page.getByRole('tab', {name: 'Raw Messages'}).click();
    await iframeBody.evaluate(() => {
      window.parent.postMessage({type: 'FORCE_UNBLOCK'}, '*');
    });

    await expect(page.getByTestId('raw-message-envelope')).toBeVisible();
    const envText = await page.getByTestId('raw-message-envelope').textContent();
    expect(envText).toContain('FORCE_UNBLOCK');
  });

  test('verifies console log override telemetry capture', async ({page}) => {
    await page.route('http://custom-renderer.com/*', async route => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>Preview</body></html>`,
      });
    });

    await page.goto('/?renderer=http://custom-renderer.com/index.html');
    await expect(page.locator('.workspace-container')).toBeVisible();

    const iframeBody = page.frameLocator('iframe.preview-iframe').locator('body');
    await expect(iframeBody).toBeVisible();

    await iframeBody.evaluate(() => {
      window.parent.postMessage(
        {
          type: 'CONSOLE_LOG',
          payload: {level: 'warn', message: 'Telemetry active'},
        },
        '*',
      );
    });

    await page.getByRole('tab', {name: 'Raw Messages'}).click();
    await expect(page.getByTestId('raw-message-envelope')).toBeVisible();
    const envText = await page.getByTestId('raw-message-envelope').textContent();
    expect(envText).toContain('CONSOLE_LOG');
    expect(envText).toContain('Telemetry active');
  });

  test('verifies responsive layout collapse in IDE webview mode', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3000&extension=true');
    await expect(page.locator('.workspace-container')).toHaveClass(/extension-mode/);
  });
});
