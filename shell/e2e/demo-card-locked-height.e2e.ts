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

import {test, expect, type Locator, type Page} from '@playwright/test';
import {DEMO_CARD_SELECTORS} from '../src/app/demos/test/demo-card-selectors';
import {demoCardFrame, demoCardIframe} from '../src/app/preview/testing/preview-frame-locators';
import {RENDERER_URLS} from '../src/app/preview/testing/renderer-urls';
import {
  COMMIT_TOLERANCE_PX,
  DEMO_RENDERERS,
  cardTitled,
  committedHeight,
  guestContentHeight,
  revealCard,
} from './demo-wall-helpers';

/**
 * User journeys for demo cards that commit their height once and then lock it:
 * what the reader does after a card has revealed its demo must not move the
 * wall under them.
 */

/** How long the wall's layout must stay unchanged to count as settled. */
const LAYOUT_QUIET_MS = 1_000;

/** A card's box, relative to the wall, so scrolling the wall doesn't change it. */
interface CardBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** One SURFACE_RESIZE as the top window received it. */
interface SurfaceReport {
  source: MessageEventSource | null;
  height: number;
}

interface WindowWithSurfaceReports extends Window {
  __surfaceReports?: SurfaceReport[];
}

/** Every card's box on the wall, keyed by its track key. */
function wallLayout(page: Page): Promise<Record<string, CardBox>> {
  return page.locator('.demos-wall').evaluate(wall => {
    const origin = wall.getBoundingClientRect();
    const boxes: Record<string, CardBox> = {};
    for (const card of Array.from(wall.querySelectorAll('a2ui-composer-demo-card'))) {
      const rect = card.getBoundingClientRect();
      boxes[card.getAttribute('data-demo-key') ?? ''] = {
        left: Math.round(rect.left - origin.left),
        top: Math.round(rect.top - origin.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    }
    return boxes;
  });
}

/** Waits until the wall's layout has stayed the same for LAYOUT_QUIET_MS, and returns it. */
async function settledLayout(page: Page): Promise<Record<string, CardBox>> {
  let previous = JSON.stringify(await wallLayout(page));
  let unchangedSince = Date.now();
  await expect
    .poll(
      async () => {
        const current = JSON.stringify(await wallLayout(page));
        if (current !== previous) {
          previous = current;
          unchangedSince = Date.now();
        }
        return Date.now() - unchangedSince;
      },
      {timeout: 20_000, intervals: [100]},
    )
    .toBeGreaterThanOrEqual(LAYOUT_QUIET_MS);
  return JSON.parse(previous) as Record<string, CardBox>;
}

/** The tallest SURFACE_RESIZE height the card's current frame has sent. */
function tallestReport(card: Locator): Promise<number> {
  return card.evaluate((host, iframeSelector) => {
    const frame = host.querySelector<HTMLIFrameElement>(iframeSelector);
    const reports = (window as WindowWithSurfaceReports).__surfaceReports ?? [];
    return Math.max(
      0,
      ...reports.filter(report => report.source === frame?.contentWindow).map(r => r.height),
    );
  }, DEMO_CARD_SELECTORS.iframe);
}

/** The guest document's scroll geometry. */
function guestScroll(card: Locator) {
  return demoCardFrame(card)
    .locator('html')
    .evaluate(root => ({
      scrollHeight: root.scrollHeight,
      clientHeight: root.clientHeight,
      scrollTop: (document.scrollingElement ?? root).scrollTop,
    }));
}

test.beforeEach(async ({page}) => {
  await page.emulateMedia({colorScheme: 'light'});
  await page.addInitScript(() => {
    if (window.top !== window) return;
    localStorage.setItem('a2ui_composer_force_1p', 'true');
    const reports: SurfaceReport[] = [];
    (window as WindowWithSurfaceReports).__surfaceReports = reports;
    window.addEventListener('message', event => {
      const data = event.data as {type?: string; payload?: {height?: number}} | null;
      if (data?.type === 'SURFACE_RESIZE' && typeof data.payload?.height === 'number') {
        reports.push({source: event.source, height: data.payload.height});
      }
    });
  });
});

for (const renderer of DEMO_RENDERERS) {
  test.describe(`${renderer.name} demo card locked height`, () => {
    test('keeps the card and the wall in place when a demo grows after its commit', async ({
      page,
    }) => {
      await page.goto(`/demos?renderer=${renderer.url}`);
      const card = cardTitled(page, 'Advanced Form Validator');
      await revealCard(card);
      const before = await settledLayout(page);
      const height = await committedHeight(card);
      const contentBefore = (await guestScroll(card)).scrollHeight;

      // None of the bundled demos grows the same way on interaction in every renderer
      // (their validation messages, tabs and modals keep the document's height), so the
      // demo grows the way a late image or an expanding section would: content is added
      // to its document after the card has committed.
      await demoCardFrame(card)
        .locator('body')
        .evaluate(body => {
          const growth = document.createElement('div');
          growth.className = 'late-content';
          growth.style.height = '320px';
          body.appendChild(growth);
        });
      // Precondition: the demo really grew past the height the card committed, and
      // the card has been told so. Only a frame on screen renders, and so reports.
      await expect
        .poll(async () => (await guestScroll(card)).scrollHeight)
        .toBeGreaterThan(Math.max(contentBefore, height) + 8);
      await expect
        .poll(async () => {
          await card.scrollIntoViewIfNeeded();
          return tallestReport(card);
        })
        .toBeGreaterThan(height + 8);

      expect(await committedHeight(card)).toBe(height);
      expect(await settledLayout(page)).toEqual(before);

      // The demo scrolls inside the card instead.
      const frameElement = demoCardIframe(card);
      await expect(async () => {
        await frameElement.scrollIntoViewIfNeeded();
        const box = await frameElement.boundingBox();
        if (!box) throw new Error('The card has no frame on screen');
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 200);
        await expect
          .poll(async () => (await guestScroll(card)).scrollTop, {timeout: 1000})
          .toBeGreaterThan(0);
      }).toPass({timeout: 10_000});
    });

    test('keeps a card at its height when it is scrolled off screen and back', async ({page}) => {
      await page.goto(`/demos?renderer=${renderer.url}`);
      const card = page.locator('a2ui-composer-demo-card').first();
      const key = (await card.getAttribute('data-demo-key')) ?? '';
      await revealCard(card);
      await settledLayout(page);
      const height = await committedHeight(card);
      const box = (await wallLayout(page))[key];

      // At the bottom of the wall, the cards there take the frame slots, so the first
      // card loses its frame; it keeps its committed height while it has none.
      const scroller = page.locator('.demos-container');
      await expect(async () => {
        await scroller.evaluate(element => element.scrollTo(0, element.scrollHeight));
        await expect(demoCardIframe(card)).toHaveCount(0, {timeout: 1000});
      }).toPass({timeout: 30_000});
      expect((await wallLayout(page))[key]).toEqual(box);

      await scroller.evaluate(element => element.scrollTo(0, 0));
      await revealCard(card);
      await settledLayout(page);
      expect(await committedHeight(card)).toBe(height);
      expect((await wallLayout(page))[key]).toEqual(box);
    });
  });
}

// Switching renderers in Settings leaves the demo wall, so this checks the cards the
// wall creates afterwards; a renderer change under a live card (RendererChanged) is
// covered by the demo-card-sizing and demo-card unit specs.
test.describe('Demo cards after a renderer change', () => {
  test('commit the heights the renderer chosen in Settings lays the demos out at', async ({
    page,
  }) => {
    await page.route('**/config.json', route =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          renderers: {
            default: {rendererUrl: `${RENDERER_URLS.angular}/`, displayName: 'Angular (local)'},
            'lit-local': {rendererUrl: `${RENDERER_URLS.lit}/`, displayName: 'Lit (local)'},
          },
        }),
      }),
    );
    await page.goto('/demos');
    const cards = page.locator('a2ui-composer-demo-card');
    const first = cards.first();
    await revealCard(first);
    await expect(demoCardIframe(first)).toHaveAttribute(
      'src',
      new RegExp(`^${RENDERER_URLS.angular}`),
    );

    await page.getByRole('link', {name: 'Settings'}).click();
    await page.waitForURL('**/settings');
    await page.locator('a2ui-composer-renderer-selector mat-select').click();
    await page.getByRole('option', {name: /Lit \(local\)/}).click();
    await expect(page.locator('a2ui-composer-renderer-selector mat-select')).toContainText(
      'Lit (local)',
    );
    await page.getByRole('link', {name: 'A2UI Demos'}).click();
    await page.waitForURL('**/demos');

    // Each card on screen loads the Lit renderer and commits the height Lit lays the
    // demo out at, not a height kept from Angular.
    for (let index = 0; index < 4; index++) {
      const card = cards.nth(index);
      await revealCard(card);
      await expect(demoCardIframe(card)).toHaveAttribute(
        'src',
        new RegExp(`^${RENDERER_URLS.lit}`),
      );
      const content = await guestContentHeight(card);
      await expect
        .poll(async () => Math.abs((await committedHeight(card)) - content))
        .toBeLessThanOrEqual(COMMIT_TOLERANCE_PX);
    }
  });
});
