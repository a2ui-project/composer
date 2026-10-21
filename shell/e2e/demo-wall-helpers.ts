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

import {expect, type Locator, type Page} from '@playwright/test';
import {RENDERER_URLS} from './helpers';

/** Helpers shared by the demo wall's e2e tests. */

/** The bundled renderers the demo wall is tested against. */
export const DEMO_RENDERERS = [
  {name: 'Angular', url: RENDERER_URLS.angular},
  {name: 'Lit', url: RENDERER_URLS.lit},
  {name: 'React', url: RENDERER_URLS.react},
] as const;

/** One of {@link DEMO_RENDERERS}. */
export type DemoRenderer = (typeof DEMO_RENDERERS)[number];

/** Number of demos every bundled renderer provides. */
export const DEMO_CARD_COUNT = 46;

/**
 * Largest difference allowed between a card's committed height and a height it
 * should match, in guest pixels. A scaled card's surface height is floored in wall
 * pixels, so its frame can be up to 1/previewScale guest pixels short of the
 * commit.
 */
export const COMMIT_TOLERANCE_PX = 2;

/** How long one card may take to mount and reveal its demo. */
export const REVEAL_TIMEOUT_MS = 30_000;

/** The demo card with exactly this title. */
export function cardTitled(page: Page, title: string): Locator {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('a2ui-composer-demo-card', {
    has: page.locator('.demo-card-title', {hasText: new RegExp(`^${escaped}$`)}),
  });
}

/**
 * Scrolls a card into view until it has committed its height and revealed its
 * demo. A card commits only while its frame is on screen, and neighbours that
 * commit can push it back off, so this keeps scrolling until it has.
 */
export async function revealCard(card: Locator, timeout = REVEAL_TIMEOUT_MS): Promise<void> {
  await expect(async () => {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('.demo-card-placeholder')).toBeHidden({timeout: 1000});
  }).toPass({timeout});
}

/** A guest's content height, before and after its webfonts load, and its layout width. */
export interface GuestContent {
  beforeFonts: number;
  afterFonts: number;
  width: number;
}

/**
 * Measures a card's guest the way the bridge does, in SurfaceResizeObserver.measure()
 * (bridge/src/surface-resize-observer.ts): its content height before and after
 * document.fonts.ready, and the width it is laid out at.
 */
export function measureGuestContent(card: Locator, timeout = 5_000): Promise<GuestContent> {
  return card
    .locator('iframe.demo-card-frame')
    .contentFrame()
    .locator('body')
    .evaluate(
      async () => {
        const measure = () =>
          Math.max(
            Math.ceil(document.body.getBoundingClientRect().height),
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
          );
        const beforeFonts = measure();
        await document.fonts.ready;
        return {
          beforeFonts,
          afterFonts: measure(),
          width: document.documentElement.clientWidth,
        };
      },
      undefined,
      {timeout},
    );
}

/** A card's guest content height once its webfonts have loaded; see {@link measureGuestContent}. */
export async function guestContentHeight(card: Locator): Promise<number> {
  return (await measureGuestContent(card)).afterFonts;
}

/** The card frame's height in guest pixels: the height the card committed. */
export function committedHeight(card: Locator): Promise<number> {
  return card
    .locator('iframe.demo-card-frame')
    .evaluate(frame => (frame as HTMLIFrameElement).offsetHeight);
}
