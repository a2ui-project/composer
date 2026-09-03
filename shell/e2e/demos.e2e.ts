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

test.describe('Demos User Journey', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
      } catch (e) {}
    });
  });

  test('populates the demos wall with live renderer content', async ({page}, testInfo) => {
    // 1. Navigate to home with a valid renderer to trigger the catalog handshake.
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    // Wait for the catalog handshake to complete (indicated by header title updating).
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');

    // 2. Navigate to the demos wall via the sidebar link.
    const demosLink = page.getByRole('link', {name: 'A2UI Demos'});
    await expect(demosLink).toBeVisible();
    await demosLink.click();

    // 3. Redirected to /demos.
    await page.waitForURL('**/demos');

    // 4. The wall mounts one card per demo returned by the renderer over the
    // bridge (GET_DEMOS -> DEMOS), proving the request/reply round-trip worked
    // against the real renderer rather than a mock.
    const cards = page.locator('a2ui-composer-demo-card');
    await expect(cards.first()).toBeVisible();
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(10);

    // 5. The first card's own sandboxed iframe rendered real content, proving the
    // per-card RENDER_A2UI reached the right frame (not just the primary one).
    const firstCardFrame = cards.first().frameLocator('iframe');
    await expect(firstCardFrame.locator('body')).not.toBeEmpty();

    // Take screenshot for verification.
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('demos-user-journey-success', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });
});
