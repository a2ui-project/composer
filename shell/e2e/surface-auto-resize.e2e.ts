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
import {RENDERER_URLS, setMonacoContent} from './helpers';

function generateSurfacePayload(rowCount: number): string {
  const children: string[] = [];
  const components: Array<Record<string, unknown>> = [];

  for (let i = 0; i < rowCount; i++) {
    const rowId = `row_${i}`;
    children.push(rowId);
    components.push({
      id: rowId,
      component: 'Text',
      text: `Row item index ${i} with substantial content line to verify natural surface expansion`,
      variant: 'body',
    });
  }

  components.unshift({
    id: 'root',
    component: 'Column',
    children,
  });

  return JSON.stringify([
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'resize_surface',
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'resize_surface',
        components,
      },
    },
  ]);
}

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.addInitScript(() => {
    localStorage.setItem('a2ui_composer_force_1p', 'true');
  });
});

/** Guest samples this file exercises, one per renderer. */
const RENDERERS: ReadonlyArray<{name: string; url: string}> = [
  {name: 'Angular', url: RENDERER_URLS.angular},
  {name: 'Lit', url: RENDERER_URLS.lit},
  {name: 'React', url: RENDERER_URLS.react},
];

/** Row counts for the tall and short surfaces the tests render. */
const TALL_ROW_COUNT = 40;
const SHORT_ROW_COUNT = 3;

/**
 * How much taller than its starting height the frame must get before the tall
 * surface counts as rendered. Measured growth is roughly 7x the 280px floor;
 * 3x leaves room for a narrower panel without depending on where text wraps.
 */
const MIN_GROWTH_FACTOR = 3;

/** Budget for the frame to follow a payload change, in milliseconds. */
const RESIZE_POLL_TIMEOUT_MS = 10_000;

/** Allowance for sub-pixel rounding between guest and host measurements. */
const FRAME_HEIGHT_TOLERANCE_PX = 2;

/**
 * Covers the direction of travel of the frame height. The bound on how much
 * SURFACE_RESIZE traffic an idle preview may emit is asserted per renderer in
 * renderer-integration-and-telemetry.e2e.ts, off the postMessage wire.
 */
test.describe('Surface Auto-Resize & Height Latch Prevention', () => {
  // The latch lives in shared bridge code, but each guest brings its own
  // sizing CSS, so each one has to be shown shrinking back to its content.
  for (const renderer of RENDERERS) {
    test(`shrinks the ${renderer.name} preview frame when the surface content shrinks`, async ({
      page,
    }) => {
      // Two payload round trips against a possibly cold dev server. Under the
      // default 30s a slow start is indistinguishable from a real height latch.
      test.setTimeout(60_000);

      await page.goto(`/?renderer=${renderer.url}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const container = page.locator('.rendered-frame-container');
      await expect(container).toBeVisible();
      const frameHeight = async () => (await container.boundingBox())?.height ?? 0;

      const baselineHeight = await frameHeight();

      // 1. Render a tall surface and let the frame follow it up. The target is
      // a multiple of the frame's own starting height rather than a literal:
      // how tall 40 rows render depends on where the text wraps, which depends
      // on the panel width of the day.
      await setMonacoContent(page, generateSurfacePayload(TALL_ROW_COUNT));
      await expect
        .poll(frameHeight, {timeout: RESIZE_POLL_TIMEOUT_MS})
        .toBeGreaterThan(baselineHeight * MIN_GROWTH_FACTOR);
      const grownHeight = await frameHeight();

      // 2. Replace it with a short surface. The frame has to come back down.
      await setMonacoContent(page, generateSurfacePayload(SHORT_ROW_COUNT));
      await expect
        .poll(frameHeight, {timeout: RESIZE_POLL_TIMEOUT_MS})
        .toBeLessThan(grownHeight / 2);

      // It must land on the content, not merely somewhere lower. Asserting
      // `>= 280` instead would be a tautology: rendered-frame.scss applies that
      // min-height unconditionally.
      const guestContentHeight = await page
        .frameLocator('iframe.preview-iframe')
        .locator('body')
        .evaluate(() => document.body.scrollHeight);
      const expectedHeight = guestContentHeight;
      const finalHeight = await frameHeight();
      expect(
        Math.abs(finalHeight - expectedHeight),
        `frame: ${finalHeight}px, guest content: ${guestContentHeight}px, grown to: ${grownHeight}px`,
      ).toBeLessThanOrEqual(FRAME_HEIGHT_TOLERANCE_PX);
    });
  }

  test('renders tall surface content without clipping', async ({page}) => {
    test.setTimeout(60_000);

    await page.goto(`/?renderer=${RENDERER_URLS.angular}`);
    await expect(page.locator('.workspace-container')).toBeVisible();

    const container = page.locator('.rendered-frame-container');
    await expect(container).toBeVisible();
    const frameHeight = async () => (await container.boundingBox())?.height ?? 0;

    const baselineHeight = await frameHeight();
    await setMonacoContent(page, generateSurfacePayload(TALL_ROW_COUNT));
    await expect
      .poll(frameHeight, {timeout: RESIZE_POLL_TIMEOUT_MS})
      .toBeGreaterThan(baselineHeight * MIN_GROWTH_FACTOR);

    // Verify container height is >= guest body scrollHeight
    const iframe = page.frameLocator('iframe.preview-iframe');
    const guestBody = iframe.locator('body');
    await expect(guestBody).toBeVisible();

    await expect
      .poll(
        async () => {
          const guestScrollHeight = await guestBody.evaluate(el => el.scrollHeight);
          const containerBox = await container.boundingBox();
          const containerHeight = containerBox?.height ?? 0;
          return containerHeight >= guestScrollHeight;
        },
        {timeout: 5000},
      )
      .toBe(true);
  });
});
