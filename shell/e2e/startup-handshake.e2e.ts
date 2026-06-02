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

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('a2ui_composer_force_1p', 'true');
      localStorage.setItem('a2ui_composer_api_key', 'test-api-key');
    } catch (e) {}
  });
});

test.describe('Startup Telemetry Handshake', () => {
  test('captures and displays all startup handshake messages in correct chronological order', async ({
    page,
  }) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    await page.getByRole('tab', {name: 'Raw Messages'}).click();

    // Wait for elements to render and animate
    await page.locator('.raw-messages-container .message-envelope').first().hover({trial: true});

    const envelopes = page.locator(
      '.raw-messages-container [data-testid="raw-message-envelope"], .raw-messages-container [data-testid="llm-log-panel"]',
    );
    expect(await envelopes.count()).toBeGreaterThanOrEqual(3);

    // Validate descending chronological sequence (newest first)
    await expect(envelopes.nth(0).locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.DATA_MODEL_CHANGE,
    );
    await expect(envelopes.nth(1).locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.A2UI_CATALOG,
    );
    await expect(envelopes.nth(2).locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.RENDERER_READY,
    );

    // Focus and press Enter on header of A2UI_CATALOG expansion card to expand it
    const catalogHeader = envelopes.nth(1).locator('mat-expansion-panel-header');
    await catalogHeader.focus();
    await catalogHeader.press('Enter');

    // Assert the pre block contains key catalog properties
    const catalogPre = envelopes.nth(1).locator('pre');
    await expect(catalogPre).toBeVisible();
    await expect(catalogPre).toContainText('components');
    await expect(catalogPre).toContainText('Column');
  });
});
