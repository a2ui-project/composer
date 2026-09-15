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
});

for (const renderer of [
  {name: 'Angular', port: 3456},
  {name: 'Lit', port: 3457},
  {name: 'React', port: 3458},
]) {
  test.describe(`${renderer.name} Demos User Journey`, () => {
    test.beforeEach(async ({page}) => {
      await page.emulateMedia({colorScheme: 'light'});
      await page.addInitScript(() => {
        try {
          localStorage.setItem('a2ui_composer_force_1p', 'true');
        } catch (e) {}
      });
    });

    test('populates the demos wall with live renderer content', async ({page}, testInfo) => {
      await page.setViewportSize({width: 1440, height: 1000});
      // 1. Navigate to home with a valid renderer to trigger the catalog handshake.
      await page.goto(`/?renderer=http://localhost:${renderer.port}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      // Wait for the catalog handshake to complete (indicated by header title updating).
      await expect(page.locator('.header-title')).not.toHaveText('A2UI Composer');

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
      await expect(firstCardFrame.getByText('User Profile Form', {exact: true})).toBeVisible();
      await expect(cards.first().locator('.demo-card-surface')).toHaveClass(/is-measured/);

      // Launch controls are discoverable before hover and preview controls remain live.
      const open = cards.first().getByRole('button', {name: 'Open in Composer: Complex Layout'});
      await expect(open).toHaveCSS('opacity', '1');
      await open.focus();
      await expect(open).toBeFocused();
      const input = firstCardFrame.locator('input').first();
      await input.fill('Alex');

      // All previews currently on screen should finish mounting before capture.
      await expect
        .poll(
          () =>
            cards.evaluateAll(elements => {
              const scroller = document.querySelector('.demos-container')!.getBoundingClientRect();
              return elements
                .filter(element => {
                  const rect = element.getBoundingClientRect();
                  return rect.top < scroller.bottom && rect.bottom > scroller.top;
                })
                .every(element => !element.querySelector('.demo-card-placeholder'));
            }),
          {timeout: 15000},
        )
        .toBe(true);
      await testInfo.attach('demos-desktop-light', {
        body: await page.screenshot({
          path: testInfo.outputPath('demos-desktop-light.png'),
          animations: 'disabled',
        }),
        contentType: 'image/png',
      });

      // Theme changes should preserve the user's interaction with a live card.
      await page.getByRole('button', {name: 'Switch to dark theme'}).click();
      await expect(input).toHaveValue('Alex');
      await expect(page.locator('body')).toHaveClass(/dark-theme/);
      await expect(firstCardFrame.locator('html')).toHaveAttribute('data-theme', 'dark');
      await testInfo.attach('demos-desktop-dark', {
        body: await page.screenshot({
          path: testInfo.outputPath('demos-desktop-dark.png'),
          animations: 'disabled',
        }),
        contentType: 'image/png',
      });

      // A narrow wall must keep the full launch action reachable without page overflow.
      await page.setViewportSize({width: 560, height: 900});
      await expect(open).toBeInViewport();
      await expect(page.getByRole('button', {name: 'Switch to light theme'})).toBeInViewport();
      await expect
        .poll(() =>
          page.locator('.demos-container').evaluate(el => el.scrollWidth - el.clientWidth),
        )
        .toBeLessThanOrEqual(1);
      await expect(input).toHaveValue('Alex');

      // Take screenshot for verification.
      const screenshotBuffer = await page.screenshot({
        path: testInfo.outputPath('demos-narrow.png'),
        animations: 'disabled',
      });
      await testInfo.attach('demos-user-journey-success', {
        body: screenshotBuffer,
        contentType: 'image/png',
      });
    });

    test('opens a demo from its card into the composer workspace', async ({page}) => {
      await page.goto(`/?renderer=http://localhost:${renderer.port}`);
      await expect(page.locator('.workspace-container')).toBeVisible();
      await expect(page.locator('.header-title')).not.toHaveText('A2UI Composer');

      await page.getByRole('link', {name: 'A2UI Demos'}).click();
      await page.waitForURL('**/demos');

      // A named demo, so the assertions below can tell whether the *right* payload
      // travelled rather than merely that some payload did.
      const card = page
        .locator('a2ui-composer-demo-card')
        .filter({has: page.locator('.demo-card-title', {hasText: 'Simple Login Form'})})
        .first();
      await card.scrollIntoViewIfNeeded();

      // The card's own live demo stays interactive: the "Open" control is an explicit
      // affordance beside the demo, not a click target laid over it.
      const demoInput = card.frameLocator('iframe').locator('input').first();
      await demoInput.fill('composer@example.com');
      await expect(demoInput).toHaveValue('composer@example.com');

      const openButton = card.locator('.demo-card-open');
      await expect(openButton).toHaveAttribute('aria-label', 'Open in Composer: Simple Login Form');
      await openButton.click();

      // The demo arrives as a shared-design link, which is the same route the Share
      // button's links take into the workspace.
      await page.waitForURL(url => url.hash.includes('a2ui=d1.'));
      await expect(page.locator('.workspace-container')).toBeVisible();

      // Asserted on what rendered, not on the URL: the payload reached the editor and
      // the preview drew this demo rather than an empty or default surface.
      await expect
        .poll(
          async () =>
            page.evaluate(() => {
              const model = (
                window as unknown as WindowWithMonaco
              ).monaco?.editor?.getModels()?.[0];
              return model?.getValue() ?? '';
            }),
          {timeout: 20000},
        )
        .toContain('gallery-simple-login-form');
      await expect(page.frameLocator('iframe').first().locator('body')).toContainText('Sign In');
    });
  });
}
