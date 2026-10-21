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

import {test, expect, type Page} from '@playwright/test';
import {DEMO_RENDERERS} from './demo-wall-helpers';

/**
 * The demo wall settles. A card accepts one fresh height commit when the wall
 * changes its frame's width, and a new height can repack the wall, which can
 * change another card's width: this checks that the chain ends. Each card's
 * committed height and frame width are sampled while the wall loads and while
 * the reader scrolls through it.
 */

const VIEWPORTS = [
  {width: 1280, height: 800},
  {width: 1440, height: 900},
] as const;

/** How long no card's frame width may change for the wall to count as settled. */
const QUIET_MS = 2_000;

/** Most height commits a card may make: its first, and one after a width change. */
const MAX_COMMITS = 2;

/** Height changes, in guest pixels, below this are scale rounding, not commits. */
const COMMIT_EPSILON_PX = 2;

/** What the probe records for one card. */
interface CardTrace {
  /** Committed heights in guest pixels, in order. */
  heights: number[];
  /** Frame widths in guest pixels, in order. */
  widths: number[];
}

interface ProbeWindow extends Window {
  __wallTrace?: {cards: Record<string, CardTrace>; lastWidthChangeAt: number};
}

/** Samples every card's committed height and frame width each animation frame. */
async function installProbe(page: Page): Promise<void> {
  await page.addInitScript(
    ({epsilon}) => {
      if (window.top !== window) return;
      localStorage.setItem('a2ui_composer_force_1p', 'true');
      const trace = {cards: {} as Record<string, CardTrace>, lastWidthChangeAt: performance.now()};
      (window as ProbeWindow).__wallTrace = trace;
      const sample = () => {
        for (const card of Array.from(document.querySelectorAll('a2ui-composer-demo-card'))) {
          const surface = card.querySelector<HTMLElement>('.demo-card-surface.is-measured');
          if (!surface) continue;
          const key = card.getAttribute('data-demo-key') ?? '';
          const scale =
            parseFloat(getComputedStyle(card).getPropertyValue('--demo-preview-scale')) || 1;
          const height = surface.getBoundingClientRect().height / scale;
          const width = surface.clientWidth / scale;
          const entry = (trace.cards[key] ??= {heights: [], widths: []});
          const lastHeight = entry.heights[entry.heights.length - 1];
          if (lastHeight === undefined || Math.abs(lastHeight - height) > epsilon) {
            entry.heights.push(Math.round(height));
          }
          const lastWidth = entry.widths[entry.widths.length - 1];
          if (lastWidth === undefined || Math.abs(lastWidth - width) > 0.5) {
            if (lastWidth !== undefined) trace.lastWidthChangeAt = performance.now();
            entry.widths.push(Math.round(width));
          }
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    },
    {epsilon: COMMIT_EPSILON_PX},
  );
}

function readTrace(page: Page) {
  return page.evaluate(() => {
    const trace = (window as ProbeWindow).__wallTrace!;
    return {cards: trace.cards, quietMs: performance.now() - trace.lastWidthChangeAt};
  });
}

async function expectQuiescent(page: Page): Promise<void> {
  await expect
    .poll(async () => (await readTrace(page)).quietMs, {timeout: 20_000, intervals: [250]})
    .toBeGreaterThanOrEqual(QUIET_MS);
}

for (const renderer of DEMO_RENDERERS) {
  for (const viewport of VIEWPORTS) {
    test(`${renderer.name} demo wall settles at ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      test.slow();
      await page.setViewportSize(viewport);
      await page.emulateMedia({colorScheme: 'light'});
      await installProbe(page);
      await page.goto(`/demos?renderer=${renderer.url}`);
      await expect(page.locator('a2ui-composer-demo-card')).not.toHaveCount(0);
      await expectQuiescent(page);

      // Scroll through the wall a screen at a time, so every card commits.
      const scroller = page.locator('.demos-container');
      for (;;) {
        const atEnd = await scroller.evaluate(element => {
          element.scrollBy(0, element.clientHeight * 0.8);
          return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
        });
        await page.waitForTimeout(400);
        if (atEnd) break;
      }
      await expectQuiescent(page);

      const {cards} = await readTrace(page);
      const rows = Object.entries(cards).map(
        ([key, card]) =>
          `${key} | commits ${card.heights.length} | heights ${card.heights.join(',')} | ` +
          `widths ${card.widths.join(',')}`,
      );
      await testInfo.attach('wall-trace', {body: rows.join('\n'), contentType: 'text/plain'});
      console.log(`[${testInfo.title}]\n${rows.join('\n')}`);

      const overCommitted = Object.entries(cards)
        .filter(([, card]) => card.heights.length > MAX_COMMITS)
        .map(([key, card]) => `${key}: ${card.heights.join(' -> ')}`);
      expect(overCommitted, 'Cards that committed more than twice').toEqual([]);
    });
  }
}
