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
import {PreviewBridgeMessageType} from 'a2ui-bridge';

test.describe('Cross-Frame Security & Sandboxing', () => {
  test.beforeEach(async ({page}) => {
    await page.route('**/config.json', async route => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          renderers: {
            default: {},
          },
        }),
      });
    });
    await page.addInitScript(() => {
      try {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
        localStorage.setItem(
          'a2ui_composer_allowed_origins',
          JSON.stringify(['http://custom-renderer.com']),
        );
      } catch (e) {}
    });
  });

  test('blocks top navigation attempts from embedded preview iframe via sandbox attributes', async ({
    page,
  }) => {
    await page.route('http://custom-renderer.com/*', async route => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body><script>
          try {
            window.top.location.href = "https://example.com";
          } catch (e) {}
        </script></body></html>`,
      });
    });

    await page.goto('/?renderer=http://custom-renderer.com/index.html');
    await expect(page.locator('.workspace-container')).toBeVisible();

    expect(page.url()).not.toContain('example.com');
  });

  test('rejects messages originating from unauthorized origins or sources', async ({page}) => {
    await page.route('http://custom-renderer.com/*', async route => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>Preview</body></html>`,
      });
    });

    await page.goto('/?renderer=http://custom-renderer.com/index.html');
    await expect(page.locator('.workspace-container')).toBeVisible();

    await page.evaluate(type => {
      window.postMessage({type}, '*');
    }, PreviewBridgeMessageType.RENDERER_READY);

    await page.getByRole('tab', {name: 'Raw Messages'}).click();
    await expect(page.locator('.raw-messages-placeholder')).toContainText(
      /No messages captured yet|Raw Messages Placeholder/,
    );
  });

  test('processes valid standard messages from embedded iframe correctly', async ({page}) => {
    await page.route('http://custom-renderer.com/*', async route => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body><script>
          window.parent.postMessage({type: "RENDERER_READY", payload: {status: "ok"}}, "*");
        </script></body></html>`,
      });
    });

    await page.goto('/?renderer=http://custom-renderer.com/index.html');
    await expect(page.locator('.workspace-container')).toBeVisible();

    await page.getByRole('tab', {name: 'Raw Messages'}).click();
    const envelope = page.getByTestId('raw-message-envelope');
    await expect(envelope).toBeVisible();
    await expect(envelope).toContainText(PreviewBridgeMessageType.RENDERER_READY);
    await expect(envelope).toContainText('http://custom-renderer.com');
  });
});
