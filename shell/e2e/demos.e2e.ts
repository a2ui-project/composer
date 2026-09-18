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
      await page.setViewportSize({width: 1440, height: 1120});
      await page.goto(`/?renderer=http://localhost:${renderer.port}`);
      await expect(page.locator('.workspace-container')).toBeVisible();
      await expect(page.locator('.header-title')).not.toHaveText('A2UI Composer');
      await page.getByRole('link', {name: 'A2UI Demos'}).click();
      await page.waitForURL('**/demos');

      const cards = page.locator('a2ui-composer-demo-card');
      await expect(cards).toHaveCount(47);
      await expect(cards.nth(0).locator('.demo-card-title')).toHaveText('Flight status');
      await expect(cards.nth(1).locator('.demo-card-title')).toHaveText('System dashboard');
      await expect(cards.nth(2).locator('.demo-card-title')).toHaveText('Product checkout');
      await expect(cards.nth(3).locator('.demo-card-title')).toHaveText('Optimization plan');
      const flight = cards.nth(0).frameLocator('iframe');
      const system = cards.nth(1).frameLocator('iframe');
      const checkout = cards.nth(2).frameLocator('iframe');
      const workflow = cards.nth(3).frameLocator('iframe');
      await expect(flight.getByText('VIE', {exact: true})).toBeVisible();
      await expect(flight.getByText('JFK', {exact: true})).toBeVisible();
      await expect(flight.locator('body')).toHaveCSS('font-family', 'Arial, Helvetica, sans-serif');
      await expect(flight.locator('svg')).toBeVisible();
      await expect(checkout.locator('svg')).toBeVisible();
      await expect(flight.getByText('VIE', {exact: true})).toHaveCSS('font-size', '32px');
      await expect(checkout.getByRole('button', {name: 'Place order · $199.99'})).toHaveCSS(
        'border-radius',
        '24px',
      );
      await expect(system.getByRole('img', {name: 'CPU load: 65 percent'})).toBeVisible();
      await expect(system.getByRole('img', {name: 'Memory usage: 82 percent'})).toBeVisible();
      // The placeholder covers controls until the initial height measurement settles.
      for (let index = 0; index < 4; index++) {
        await expect(cards.nth(index).locator('.demo-card-placeholder')).toBeHidden();
      }
      const input = checkout.locator('input[type="text"]');
      await input.fill('123 Market Street');
      await workflow.getByRole('checkbox', {name: 'Generate campaign assets'}).check();
      await expect(workflow.getByRole('button', {name: 'Start plan'})).toBeVisible();

      // All four showcase surfaces fit without clipping controls or fractional overflow.
      for (let index = 0; index < 4; index++) {
        await expect(cards.nth(index).locator('.demo-card-surface')).toHaveClass(/is-measured/);
        await expect
          .poll(() =>
            cards
              .nth(index)
              .frameLocator('iframe')
              .locator('html')
              .evaluate(
                el =>
                  Math.ceil(el.querySelector('body')!.getBoundingClientRect().height) -
                  el.clientHeight,
              ),
          )
          .toBeLessThanOrEqual(1);
      }
      const positions = await cards.evaluateAll(elements =>
        elements.slice(0, 4).map(el => {
          const rect = el.getBoundingClientRect();
          return {x: rect.x, y: rect.y};
        }),
      );
      expect(positions[0].y).toBe(positions[1].y);
      expect(positions[2].y).toBe(positions[3].y);
      expect(positions[0].x).toBeLessThan(positions[1].x);
      const open = cards.first().getByRole('button', {name: 'Open in Composer: Flight status'});
      await expect(open).toHaveCSS('opacity', '1');
      await open.focus();
      await expect(open).toBeFocused();
      await page.locator('.demos-container').evaluate(el => el.scrollTo(0, 0));
      await testInfo.attach('demos-desktop-light', {
        body: await page.screenshot({
          path: testInfo.outputPath('demos-desktop-light.png'),
          animations: 'disabled',
        }),
        contentType: 'image/png',
      });

      await page.getByRole('button', {name: 'Switch to dark theme'}).click();
      await expect(input).toHaveValue('123 Market Street');
      await expect(
        workflow.getByRole('checkbox', {name: 'Generate campaign assets'}),
      ).toBeChecked();
      await expect(flight.locator('html')).toHaveAttribute('data-theme', 'dark');
      await testInfo.attach('demos-desktop-dark', {
        body: await page.screenshot({
          path: testInfo.outputPath('demos-desktop-dark.png'),
          animations: 'disabled',
        }),
        contentType: 'image/png',
      });

      await page.setViewportSize({width: 560, height: 900});
      await expect(open).toBeInViewport();
      await expect(page.getByRole('button', {name: 'Switch to light theme'})).toBeInViewport();
      await expect
        .poll(() =>
          page.locator('.demos-container').evaluate(el => el.scrollWidth - el.clientWidth),
        )
        .toBeLessThanOrEqual(1);
      await testInfo.attach('demos-narrow', {
        body: await page.screenshot({
          path: testInfo.outputPath('demos-narrow.png'),
          animations: 'disabled',
        }),
        contentType: 'image/png',
      });
      await cards.nth(2).scrollIntoViewIfNeeded();
      await expect(input).toHaveValue('123 Market Street');
      await expect(checkout.getByRole('button', {name: 'Place order · $199.99'})).toBeVisible();
    });

    test('fits the invitation builder and renders its heading without Markdown syntax', async ({
      page,
    }) => {
      await page.setViewportSize({width: 1280, height: 1000});
      await page.goto(`/demos?renderer=http://localhost:${renderer.port}`);
      const card = page.locator('a2ui-composer-demo-card').filter({
        has: page.getByRole('heading', {name: 'Live Invitation Builder', exact: true}),
      });
      await card.getByRole('button', {name: 'Open in Composer: Live Invitation Builder'}).focus();
      // Follow the target while newly mounted neighbours establish their height.
      await expect(async () => {
        await card.scrollIntoViewIfNeeded();
        await expect(card.locator('.demo-card-placeholder')).toBeHidden({timeout: 1000});
      }).toPass();
      const frame = card.frameLocator('iframe');
      await expect(frame.getByText('Invitation Builder', {exact: true})).toBeVisible();
      await frame.locator('input[type="text"]').first().fill('Bento launch');
      await expect(frame.getByText('Bento launch', {exact: true})).toBeVisible();

      for (const width of [560, 390, 1440]) {
        await page.setViewportSize({width, height: 1000});
        await card.scrollIntoViewIfNeeded();
        await expect(frame.locator('input[type="text"]').first()).toHaveValue('Bento launch');
        await expect
          .poll(() => frame.locator('html').evaluate(el => el.scrollWidth - el.clientWidth))
          .toBeLessThanOrEqual(2);
        await expect
          .poll(() =>
            page.locator('.demos-container').evaluate(el => el.scrollWidth - el.clientWidth),
          )
          .toBeLessThanOrEqual(1);
      }
    });

    test('opens the checkout and sends edited values in its demo action', async ({page}) => {
      await page.goto(`/?renderer=http://localhost:${renderer.port}`);
      await expect(page.locator('.header-title')).not.toHaveText('A2UI Composer');
      await page.getByRole('link', {name: 'A2UI Demos'}).click();
      await page.getByRole('button', {name: 'Open in Composer: Product checkout'}).click();
      await page.waitForURL(url => url.hash.includes('a2ui=d1.'));
      const frame = page.frameLocator('iframe.preview-iframe');
      await frame.locator('input[type="text"]').fill('456 Mission Street');
      await frame.getByRole('checkbox', {name: 'Billing address same as shipping'}).uncheck();
      await frame.getByRole('button', {name: 'Place order · $199.99'}).click();
      const eventsTab = page.locator('.dv-tab', {hasText: /^Events/});
      await expect(eventsTab).toContainText('(1)');
      await eventsTab.click();
      const event = page.locator('.events-container table tr.element-row').first();
      await expect(event.locator('td.mat-column-component')).toHaveText('order');
      await expect(event.locator('td.mat-column-context pre')).toContainText(
        '"address": "456 Mission Street"',
      );
      await expect(event.locator('td.mat-column-context pre')).toContainText(
        '"sameAddress": false',
      );
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
