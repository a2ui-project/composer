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

import {test, expect, type FrameLocator, type Page} from '@playwright/test';
import {
  RENDERER_URLS,
  dockedPreview,
  dockedPreviewGeometry,
  dragPreviewSplitter,
  guestContentHeight,
  guestScrollRange,
  inlineSurfaceContainer,
  setMonacoContent,
  showInlineSurface,
  waitForPreviewTab,
} from './helpers';
import {MAX_CONTENT_HEIGHT_PX} from '../src/app/preview/content-height';

/** Guest samples this file exercises, one per renderer. */
const RENDERERS: ReadonlyArray<{name: string; url: string}> = [
  {name: 'Angular', url: RENDERER_URLS.angular},
  {name: 'Lit', url: RENDERER_URLS.lit},
  {name: 'React', url: RENDERER_URLS.react},
];

/**
 * Height a content-sized frame starts from until the guest reports its own
 * (the floor in rendered-frame.scss).
 */
const CONTENT_FLOOR_PX = 280;

/**
 * Rows in the growable surface. Filled, they add about 190px (24px each) to a
 * surface of about 225px, so the grown surface stays below
 * MAX_CONTENT_HEIGHT_PX.
 */
const GROWABLE_LINE_COUNT = 8;

/**
 * Rows in the growable surface when it has to outgrow the cap: filled, about
 * 225px + 20 × 24px, well above MAX_CONTENT_HEIGHT_PX.
 */
const OVER_CAP_LINE_COUNT = 20;

/** Rows in a surface taller than the cap: about 27px each, so about 800px. */
const OVER_CAP_ROW_COUNT = 30;

/** Fractional device scale factors at which a frame could creep by a pixel. */
const FRACTIONAL_SCALE_FACTORS = [1.25, 1.5] as const;

/** How long a settled inline frame must keep its height. */
const QUIET_PERIOD_MS = 1000;

/** Interval between height samples during the quiet period. */
const QUIET_SAMPLE_INTERVAL_MS = 100;

/** Allowance for sub-pixel rounding between the capped frame and the cap. */
const CAP_TOLERANCE_PX = 1;

/**
 * Rows in the tall surface: about 350px, taller than CONTENT_FLOOR_PX and
 * below MAX_CONTENT_HEIGHT_PX.
 */
const TALL_ROW_COUNT = 13;

/** Rows in the short surface rendered into the docked preview. */
const SHORT_ROW_COUNT = 1;

/** How much the growable surface must grow or shrink to count as having moved. */
const MIN_HEIGHT_CHANGE_PX = 100;

/** Budget for the frame to follow a content change, in milliseconds. */
const RESIZE_POLL_TIMEOUT_MS = 10_000;

/** Budget for a guest frame to finish its handshake and draw a surface. */
const SURFACE_RENDER_TIMEOUT_MS = 15_000;

/** Timeout for tests measuring multi-step surface growth and shrink cycles. */
const AUTO_RESIZE_TEST_TIMEOUT_MS = 60_000;

/** Allowance for sub-pixel rounding between guest and host measurements. */
const FRAME_HEIGHT_TOLERANCE_PX = 2;

/** Allowance for sub-pixel rounding between the docked frame and its panel. */
const PANEL_FILL_TOLERANCE_PX = 1;

/** The iframe's intrinsic height, which a frame falls back to without a definite host. */
const IFRAME_INTRINSIC_HEIGHT_PX = 150;

/** How far the splitter is dragged, up and then down, in pixels. */
const SPLITTER_DRAG_PX = 120;

/**
 * Allowed difference between the splitter drag and the resulting change in
 * the panel's height, which need not match to the pixel.
 */
const SPLITTER_DRAG_TOLERANCE_PX = 5;

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

/**
 * A surface whose height the guest changes by itself: a text field plus
 * `lineCount` Text rows bound to the same data path. Typing into the
 * field fills every row; clearing it empties them again. The renderer, not the
 * host, makes the content grow and shrink, inside one guest document, which is
 * what a guest latched to its own viewport height would fail to follow.
 */
function growableSurfacePayload(lineCount = GROWABLE_LINE_COUNT): unknown[] {
  const lineIds = Array.from({length: lineCount}, (_, i) => `line_${i}`);
  return [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'growable_surface',
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'growable_surface',
        components: [
          {id: 'root', component: 'Column', children: ['fill_input', ...lineIds]},
          {
            id: 'fill_input',
            component: 'TextField',
            label: 'Fill lines',
            value: {path: '/fill'},
            variant: 'shortText',
          },
          ...lineIds.map(id => ({id, component: 'Text', text: {path: '/fill'}, variant: 'body'})),
        ],
      },
    },
    {version: 'v0.9', updateDataModel: {surfaceId: 'growable_surface', path: '/fill', value: ''}},
  ];
}

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.addInitScript(() => {
    try {
      if (window === window.top) {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
      }
    } catch (e: unknown) {
      // In sandboxed frames (e.g. preview iframe or about:blank with opaque origin),
      // accessing localStorage throws DOMException: SecurityError. Ignore only
      // this expected sandbox restriction and rethrow any unexpected errors.
      if (!(e instanceof DOMException && e.name === 'SecurityError')) {
        throw e;
      }
    }
  });
});

/**
 * How far a content-sized frame is from the height it should have: the guest's
 * content height, clamped to the cap. Returns the frame and content heights too
 * so failures can report them.
 */
async function inlineFrameOffset(
  page: Page,
  frame: FrameLocator,
): Promise<{offset: number; frameHeight: number; contentHeight: number}> {
  const contentHeight = await guestContentHeight(frame);
  const frameHeight = await inlineSurfaceContainer(page).evaluate(
    el => el.getBoundingClientRect().height,
  );
  return {
    offset: Math.abs(frameHeight - Math.min(contentHeight, MAX_CONTENT_HEIGHT_PX)),
    frameHeight,
    contentHeight,
  };
}

/** Waits until the inline frame sits on its content and returns its height. */
async function expectInlineFrameOnContent(page: Page, frame: FrameLocator): Promise<number> {
  await expect
    .poll(async () => (await inlineFrameOffset(page, frame)).offset, {
      timeout: RESIZE_POLL_TIMEOUT_MS,
    })
    .toBeLessThanOrEqual(FRAME_HEIGHT_TOLERANCE_PX);
  const {frameHeight, contentHeight} = await inlineFrameOffset(page, frame);
  // Fixture guard: above the cap the frame stops following the content.
  expect(contentHeight, 'fixture must stay below the content height cap').toBeLessThan(
    MAX_CONTENT_HEIGHT_PX,
  );
  return frameHeight;
}

/** Rendered height of the inline frame's container. */
function inlineFrameHeight(page: Page): Promise<number> {
  return inlineSurfaceContainer(page).evaluate(el => el.getBoundingClientRect().height);
}

/** Waits until the inline frame sits at the cap, for content taller than it. */
async function expectInlineFrameAtCap(page: Page, frame: FrameLocator): Promise<void> {
  await expect
    .poll(async () => Math.abs((await inlineFrameHeight(page)) - MAX_CONTENT_HEIGHT_PX), {
      timeout: RESIZE_POLL_TIMEOUT_MS,
    })
    .toBeLessThanOrEqual(CAP_TOLERANCE_PX);
  // Fixture guard: the content really is taller than the cap.
  expect(await guestContentHeight(frame)).toBeGreaterThan(MAX_CONTENT_HEIGHT_PX);
}

/** Asserts that the inline frame keeps exactly one height for QUIET_PERIOD_MS. */
async function expectInlineFrameQuiet(page: Page): Promise<void> {
  const heights: number[] = [];
  for (let elapsed = 0; elapsed <= QUIET_PERIOD_MS; elapsed += QUIET_SAMPLE_INTERVAL_MS) {
    heights.push(await inlineFrameHeight(page));
    await page.waitForTimeout(QUIET_SAMPLE_INTERVAL_MS);
  }
  expect(new Set(heights).size, `heights: ${heights}`).toBe(1);
}

/**
 * A content-sized frame (an inline chat surface) follows the guest's content
 * height in both directions. The bound on how much SURFACE_RESIZE traffic an
 * idle preview may emit is asserted per renderer in
 * renderer-integration-and-telemetry.e2e.ts, off the postMessage wire.
 */
test.describe('Surface Auto-Resize & Height Latch Prevention', () => {
  // The latch lives in shared bridge code, but each guest brings its own
  // sizing CSS, so each one has to be shown shrinking back to its content.
  for (const renderer of RENDERERS) {
    test(`grows and shrinks the ${renderer.name} inline surface frame with its content`, async ({
      page,
    }) => {
      // A mock agent round trip plus two content changes against a possibly
      // cold dev server. Under the default 30s a slow start is
      // indistinguishable from a real height latch.
      test.setTimeout(AUTO_RESIZE_TEST_TIMEOUT_MS);

      const frame = await showInlineSurface(page, renderer.url, growableSurfacePayload());
      const input = frame.locator('input[type="text"]').first();
      await expect(input).toBeVisible({timeout: SURFACE_RENDER_TIMEOUT_MS});

      // The empty surface is shorter than CONTENT_FLOOR_PX, the height the
      // frame starts from, so landing on it also shows the reported height
      // overriding the floor.
      const shortHeight = await expectInlineFrameOnContent(page, frame);

      // 1. Fill every row; the frame has to follow the content up.
      await input.fill('Grown line');
      await expect(frame.getByText('Grown line').nth(GROWABLE_LINE_COUNT - 1)).toBeVisible();
      const grownHeight = await expectInlineFrameOnContent(page, frame);
      expect(grownHeight).toBeGreaterThan(shortHeight + MIN_HEIGHT_CHANGE_PX);

      // 2. Empty them again. The frame has to come back down, and land on the
      // content rather than merely somewhere lower.
      await input.fill('');
      await expect(frame.getByText('Grown line')).toHaveCount(0);
      const shrunkHeight = await expectInlineFrameOnContent(page, frame);
      expect(shrunkHeight).toBeLessThan(grownHeight - MIN_HEIGHT_CHANGE_PX);
    });
  }

  test('renders a tall inline surface without clipping', async ({page}) => {
    test.setTimeout(AUTO_RESIZE_TEST_TIMEOUT_MS);

    const frame = await showInlineSurface(
      page,
      RENDERER_URLS.angular,
      generateSurfacePayload(TALL_ROW_COUNT),
    );
    const lastRow = frame.getByText(`Row item index ${TALL_ROW_COUNT - 1} `);
    await expect(lastRow).toBeVisible({timeout: SURFACE_RENDER_TIMEOUT_MS});

    const frameHeight = await expectInlineFrameOnContent(page, frame);
    // Above the floor, so a frame stuck at its starting height would fail.
    expect(frameHeight).toBeGreaterThan(CONTENT_FLOOR_PX + FRAME_HEIGHT_TOLERANCE_PX);

    // Nothing is cut off: below the cap the guest has nothing to scroll, and
    // the last row ends inside the guest's own viewport. (toBeInViewport would
    // measure against the page, where the chat history may have scrolled the
    // card partly out of view.)
    expect(await guestScrollRange(frame)).toBeLessThanOrEqual(1);
    const lastRowOverflow = await lastRow.evaluate(
      el => el.getBoundingClientRect().bottom - document.documentElement.clientHeight,
    );
    expect(lastRowOverflow).toBeLessThanOrEqual(0);
  });

  // The cap is what ends a feedback loop: content taller than it must leave
  // the frame resting at the cap, with the rest reachable inside the guest.
  for (const renderer of RENDERERS) {
    test(`rests the ${renderer.name} inline frame at the cap for taller content`, async ({
      page,
    }) => {
      test.setTimeout(AUTO_RESIZE_TEST_TIMEOUT_MS);

      const frame = await showInlineSurface(
        page,
        renderer.url,
        generateSurfacePayload(OVER_CAP_ROW_COUNT),
      );
      await expect(frame.getByText('Row item index 0 ')).toBeVisible({
        timeout: SURFACE_RENDER_TIMEOUT_MS,
      });

      await expectInlineFrameAtCap(page, frame);
      await expectInlineFrameQuiet(page);

      // The guest scrolls, and its last row can be brought fully into its own
      // viewport.
      expect(await guestScrollRange(frame)).toBeGreaterThan(0);
      const lastRow = frame.getByText(`Row item index ${OVER_CAP_ROW_COUNT - 1} `);
      await lastRow.scrollIntoViewIfNeeded();
      const lastRowBox = await lastRow.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top,
          overflow: rect.bottom - document.documentElement.clientHeight,
        };
      });
      expect(lastRowBox.top).toBeGreaterThanOrEqual(0);
      expect(lastRowBox.overflow).toBeLessThanOrEqual(0);
    });
  }

  // No expandable component (such as an accordion) exists in the bundled
  // catalogs, so content that the guest grows by itself past the cap stands
  // in for one: the frame must follow it all the way to the cap, not stall.
  test('follows a growing inline surface all the way up to the cap', async ({page}) => {
    test.setTimeout(AUTO_RESIZE_TEST_TIMEOUT_MS);

    const frame = await showInlineSurface(
      page,
      RENDERER_URLS.angular,
      growableSurfacePayload(OVER_CAP_LINE_COUNT),
    );
    const input = frame.locator('input[type="text"]').first();
    await expect(input).toBeVisible({timeout: SURFACE_RENDER_TIMEOUT_MS});
    await expectInlineFrameOnContent(page, frame);

    await input.fill('Grown line');
    await expect(frame.getByText('Grown line').nth(OVER_CAP_LINE_COUNT - 1)).toBeAttached();

    await expectInlineFrameAtCap(page, frame);
    await expectInlineFrameQuiet(page);
  });
});

/**
 * At a fractional device scale factor a guest's measured height can round to
 * a value one pixel above the frame it lays out in. A frame that kept
 * following such reports would creep up a pixel at a time; it must come to
 * rest instead.
 */
for (const scaleFactor of FRACTIONAL_SCALE_FACTORS) {
  test.describe(`Inline frame at device scale factor ${scaleFactor}`, () => {
    test.use({deviceScaleFactor: scaleFactor});

    for (const renderer of RENDERERS) {
      test(`keeps the ${renderer.name} inline frame still once settled`, async ({page}) => {
        test.setTimeout(AUTO_RESIZE_TEST_TIMEOUT_MS);

        const frame = await showInlineSurface(
          page,
          renderer.url,
          generateSurfacePayload(TALL_ROW_COUNT),
        );
        await expect(frame.getByText(`Row item index ${TALL_ROW_COUNT - 1} `)).toBeVisible({
          timeout: SURFACE_RENDER_TIMEOUT_MS,
        });

        await expectInlineFrameOnContent(page, frame);
        await expectInlineFrameQuiet(page);
      });
    }
  });
}

/**
 * A docked preview fills its Dockview panel whatever the guest reports: its
 * height comes from the panel, never from the content, and a guest taller than
 * the panel scrolls inside the frame.
 */
test.describe('Docked Preview Fills Its Panel', () => {
  test('fills the panel for a short payload and tracks the splitter', async ({page}) => {
    test.setTimeout(AUTO_RESIZE_TEST_TIMEOUT_MS);

    await page.goto(`/?renderer=${RENDERER_URLS.angular}`, {waitUntil: 'commit'});
    await page.waitForLoadState('load');
    await expect(page.locator('.workspace-container')).toBeVisible();
    await waitForPreviewTab(page);

    await setMonacoContent(page, generateSurfacePayload(SHORT_ROW_COUNT));
    await waitForPreviewTab(page);
    const guest = dockedPreview(page).locator('iframe.preview-iframe').contentFrame();
    await expect(guest.getByText('Row item index 0 ')).toBeVisible({
      timeout: SURFACE_RENDER_TIMEOUT_MS,
    });

    const fillOffset = async () => {
      const geometry = await dockedPreviewGeometry(page);
      return Math.abs(geometry.frameHeight - geometry.panelContentHeight);
    };
    await expect
      .poll(fillOffset, {timeout: RESIZE_POLL_TIMEOUT_MS})
      .toBeLessThanOrEqual(PANEL_FILL_TOLERANCE_PX);

    // Filling the panel is distinguishable from the two ways it can go wrong:
    // following the short content, or falling back to the iframe's intrinsic
    // size because some ancestor has no definite height.
    const initial = await dockedPreviewGeometry(page);
    const contentHeight = await guestContentHeight(guest);
    expect(initial.frameHeight, `content: ${contentHeight}px`).toBeGreaterThan(
      contentHeight + MIN_HEIGHT_CHANGE_PX,
    );
    expect(Math.abs(initial.frameHeight - IFRAME_INTRINSIC_HEIGHT_PX)).toBeGreaterThan(
      PANEL_FILL_TOLERANCE_PX,
    );

    // Dragging the splitter resizes the panel; the frame follows it in both
    // directions without any report from the guest.
    for (const delta of [-SPLITTER_DRAG_PX, SPLITTER_DRAG_PX]) {
      const before = await dockedPreviewGeometry(page);
      await dragPreviewSplitter(page, delta);
      await expect
        .poll(
          async () =>
            Math.abs(
              (await dockedPreviewGeometry(page)).panelContentHeight -
                before.panelContentHeight -
                delta,
            ),
          {
            timeout: RESIZE_POLL_TIMEOUT_MS,
          },
        )
        .toBeLessThanOrEqual(SPLITTER_DRAG_TOLERANCE_PX);
      await expect
        .poll(fillOffset, {timeout: RESIZE_POLL_TIMEOUT_MS})
        .toBeLessThanOrEqual(PANEL_FILL_TOLERANCE_PX);
    }
  });
});
