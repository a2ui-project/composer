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

import {test, expect, Locator, FrameLocator, Page} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {SurfaceResizeLogEntry, WindowWithResizeLog} from './types';
import {RENDERER_URLS, getMonacoContent, setMonacoContent} from './helpers';

async function waitForPreviewSettled(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const handshakeIndex = window.a2uiCatalogManagement?.handshakeHistoryIndex?.();
    if (handshakeIndex === null || handshakeIndex === undefined) return false;
    const history = window.a2uiHostCommunication?.getHistoryBuffer() || [];
    const catalogIdx = history.findIndex(env => env.type === 'A2UI_CATALOG');
    if (catalogIdx === -1) return false;
    const successesAfterCatalog = history
      .slice(Math.min(catalogIdx, handshakeIndex))
      .filter(env => env.type === 'RENDER_SUCCESS');
    return successesAfterCatalog.length >= 2;
  });
  await page.waitForTimeout(300);
}

interface IntegrationConfig {
  name: string;
  rendererUrl: string;
  pickupDateLocator: (iframe: FrameLocator) => Locator;
  pickupLocationLocator: (iframe: FrameLocator) => Locator;
  fillDate: (locator: Locator, value: string) => Promise<void>;
}

const CONFIGS: IntegrationConfig[] = [
  {
    name: 'Angular',
    rendererUrl: RENDERER_URLS.angular,
    pickupDateLocator: iframe =>
      iframe.locator('.a2ui-date-time-container:has-text("Pick-up Date") input'),
    pickupLocationLocator: iframe =>
      iframe.locator('.a2ui-text-field-container:has-text("Pick-up Location") input'),
    fillDate: async (locator, value) => {
      await locator.evaluate((el: HTMLInputElement, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
      }, value);
    },
  },
  {
    name: 'React',
    rendererUrl: RENDERER_URLS.react,
    pickupDateLocator: iframe => iframe.locator('label:has-text("Pick-up Date") + input'),
    pickupLocationLocator: iframe => iframe.locator('label:has-text("Pick-up Location") + input'),
    fillDate: async (locator, value) => {
      await locator.evaluate((el: HTMLInputElement, val) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        )?.set;
        if (setter) {
          setter.call(el, val);
        } else {
          el.value = val;
        }
        el.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
        el.dispatchEvent(new Event('change', {bubbles: true, composed: true}));
      }, value);
    },
  },
  {
    name: 'Lit',
    rendererUrl: RENDERER_URLS.lit,
    pickupDateLocator: iframe =>
      iframe.locator('a2ui-datetimeinput:has-text("Pick-up Date") input'),
    pickupLocationLocator: iframe =>
      iframe.locator('a2ui-basic-textfield:has-text("Pick-up Location") input'),
    fillDate: async (locator, value) => {
      await locator.evaluate((el: HTMLInputElement, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
        el.dispatchEvent(new Event('change', {bubbles: true, composed: true}));
      }, value);
    },
  },
];

/**
 * Number of frame height samples taken after the preview has been given a
 * chance to settle. The samples describe the resting frame; the SURFACE_RESIZE
 * log asserted alongside them covers the whole session from navigation on,
 * including the startup burst, because the wire tap is installed before the
 * page loads.
 */
const HEIGHT_SAMPLE_COUNT = 12;

/** Delay between consecutive frame height samples, in milliseconds. */
const HEIGHT_SAMPLE_INTERVAL_MS = 250;

/** Bound on how long to wait for the frame to stop moving before sampling. */
const HEIGHT_STABILITY_TIMEOUT_MS = 5_000;

/** Delay between height readings while waiting for the frame to stop moving. */
const HEIGHT_STABILITY_POLL_MS = 100;

/**
 * Upper bound for a settled preview frame. The sample content is roughly 280px
 * tall and the test viewport is 800px, so anything beyond this means the frame
 * is still growing under its own resize traffic.
 */
const MAX_SETTLED_FRAME_HEIGHT_PX = 1500;

/**
 * Upper bound on SURFACE_RESIZE messages recorded for one preview session.
 *
 * Measured at 1280x800, from the postMessage wire:
 *   healthy   Angular 4, React 5, Lit 7  (Lit re-renders twice: 32,148,288,312,148,288,312)
 *   reverted guest CSS, host breaker active   13 and 15
 *   reverted guest CSS, no host breaker       212 and 239
 * The bound has to clear the healthy maximum with margin, so it cannot sit
 * below the breaker's 8-report latch; 10 still separates healthy from broken
 * by three messages on either side.
 */
const MAX_IDLE_RESIZE_MESSAGES = 10;

/**
 * Upper bound on consecutive growing heights, which characterise a ratchet.
 *
 * Measured longest strictly increasing run: healthy Angular 4, React 3, Lit 4;
 * guest CSS reverted, Angular 9, Lit 9, React 4 to 6 depending on the run.
 *
 * So this bound detects a broken Angular or Lit guest decisively (9 against a
 * healthy 4) and does NOT reliably detect a broken React guest at all, whose
 * run length straddles the bound from one run to the next. React detection
 * rests on the hard frame-versus-content assertion at the end of the test.
 *
 * NOTE: there is NO MARGIN here - healthy Angular and Lit sit exactly on the
 * bound. It is kept because it is the only bound the host growth breaker
 * cannot mask for those two renderers. If it ever flakes, DELETE it rather
 * than raising it: raising it to 5 would give up Angular and Lit as well, and
 * would buy nothing for React, which it does not catch either way.
 */
const MAX_INCREASING_RESIZE_RUN = 4;

/**
 * Gap below which two reports are treated as one burst, in milliseconds.
 * The observed feedback loop runs at 6-35ms; ordinary re-render steps are
 * hundreds of milliseconds apart, though a re-render does emit fast pairs.
 */
const LOOP_CADENCE_GAP_MS = 50;

/**
 * Upper bound on how many reports may arrive back to back at loop cadence.
 *
 * Measured longest burst: healthy Angular 2, React 2, Lit 3; guest CSS
 * reverted, 8, 8 and 3. Cadence does not give the order of magnitude one might
 * expect, because healthy renderers also emit sub-20ms pairs during their
 * initial render; the useful signal is burst LENGTH, not gap size. A broken
 * React guest is caught by neither this bound nor the run-length bound above,
 * only by the frame-versus-content assertion.
 */
const MAX_LOOP_CADENCE_RUN = 5;

/**
 * Floor the host applies to the frame, mirroring the `min-height` on
 * `.preview-iframe` in rendered-frame.scss. Guest content shorter than this
 * still renders at this height.
 */
const MIN_FRAME_HEIGHT_PX = 280;

/** Allowance for sub-pixel rounding between guest and host measurements. */
const FRAME_HEIGHT_TOLERANCE_PX = 2;

/** Returns the length of the longest strictly increasing run in `values`. */
function longestIncreasingRun(values: number[]): number {
  let longest = 0;
  let current = 0;
  for (let i = 0; i < values.length; i++) {
    current = i > 0 && values[i] > values[i - 1] ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

/**
 * Returns the largest number of entries in `times` that arrive back to back
 * with no more than `maxGapMs` between consecutive entries.
 */
function longestBurstRun(times: number[], maxGapMs: number): number {
  let longest = 0;
  let current = 0;
  for (let i = 0; i < times.length; i++) {
    current = i > 0 && times[i] - times[i - 1] <= maxGapMs ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

/**
 * Waits until `locator` reports the same height on two consecutive readings,
 * bounded by HEIGHT_STABILITY_TIMEOUT_MS.
 *
 * Returns quietly when the deadline passes instead of throwing: a frame that
 * never stops moving is the condition under test, and it has to be judged by
 * the samples and bounds in the test body, not hidden behind a timeout here.
 */
async function waitForStableHeight(page: Page, locator: Locator): Promise<void> {
  const deadline = Date.now() + HEIGHT_STABILITY_TIMEOUT_MS;
  let previous = -1;
  while (Date.now() < deadline) {
    const height = await locator.evaluate(el => (el as HTMLElement).offsetHeight);
    if (height === previous) return;
    previous = height;
    await page.waitForTimeout(HEIGHT_STABILITY_POLL_MS);
  }
}

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

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

  // Record SURFACE_RESIZE traffic directly off the postMessage wire. The Raw
  // Messages drawer folds consecutive rows together and caps its history, so
  // counts sourced from its DOM cannot observe a resize feedback loop.
  await page.addInitScript((resizeType: string) => {
    const win = window as unknown as WindowWithResizeLog;
    const log: SurfaceResizeLogEntry[] = [];
    win.__a2uiResizeLog = log;
    window.addEventListener(
      'message',
      event => {
        const data = event.data as {type?: string; payload?: {height?: number}} | null;
        if (data?.type === resizeType) {
          log.push({height: data.payload?.height, timeMs: performance.now()});
        }
      },
      true,
    );
  }, PreviewBridgeMessageType.SURFACE_RESIZE);
});

for (const config of CONFIGS) {
  test.describe(`${config.name} Preview Handshake & Sync`, () => {
    test('validates startup telemetry handshake messages and catalog properties', async ({
      page,
    }) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      await page.locator('.dv-tab', {hasText: /^Raw Messages/}).click();
      await expect(page.locator('.raw-messages-container')).toBeVisible();
      const envelopes = page.locator(
        '.raw-messages-container [data-testid="raw-message-envelope"], .raw-messages-container [data-testid="llm-log-panel"]',
      );
      await expect.poll(async () => envelopes.count()).toBeGreaterThanOrEqual(3);

      // Validate presence of startup handshake envelopes
      const dataModelEnvelope = envelopes
        .filter({hasText: PreviewBridgeMessageType.DATA_MODEL_CHANGE})
        .first();
      await expect(dataModelEnvelope.locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      );
      const catalogEnvelope = envelopes
        .filter({hasText: PreviewBridgeMessageType.A2UI_CATALOG})
        .first();
      await expect(catalogEnvelope.locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.A2UI_CATALOG,
      );
      const readyEnvelope = envelopes
        .filter({hasText: PreviewBridgeMessageType.RENDERER_READY})
        .first();
      await expect(readyEnvelope.locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.RENDERER_READY,
      );

      // Expand A2UI_CATALOG card
      const catalogHeader = catalogEnvelope.locator('mat-expansion-panel-header');
      await catalogHeader.focus();
      await catalogHeader.press('Enter');

      // Assert the pre block contains key catalog properties
      const catalogPre = catalogEnvelope.locator('pre');
      await expect(catalogPre).toBeVisible();
      await expect(catalogPre).toContainText('components');
      await expect(catalogPre).toContainText('Column');
    });

    test('synchronizes "pick-up date" from preview iframe to data model tab', async ({page}) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();
      await waitForPreviewSettled(page);
      const pickupInput = config.pickupDateLocator(iframe);
      await expect(pickupInput).toBeVisible();
      await expect(pickupInput).toBeEnabled();

      await config.fillDate(pickupInput, '2026-05-30');
      await pickupInput.dispatchEvent('change');
      await pickupInput.blur();
      await expect(pickupInput).toHaveValue('2026-05-30');

      // Ensure the DATA_MODEL_CHANGE has arrived at host communication
      await page.waitForFunction(() => {
        const history = window.a2uiHostCommunication?.getHistoryBuffer() || [];
        return history.some(
          env =>
            env.type === 'DATA_MODEL_CHANGE' && JSON.stringify(env.payload).includes('2026-05-30'),
        );
      });

      await page.locator('.dv-tab', {hasText: /^Data Model/}).click();
      await expect(page.locator('.data-model-container textarea')).toBeVisible();
      const dataModelTextarea = page.locator('.data-model-field textarea');
      await expect(dataModelTextarea).toHaveValue(/"pickupDate":\s*"2026-05-30"/);
    });

    test('propagates data model changes from shell "Data Model" tab to rendered preview', async ({
      page,
    }) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();
      await waitForPreviewSettled(page);

      await page.locator('.dv-tab', {hasText: /^Data Model/}).click();
      await expect(page.locator('.data-model-container textarea')).toBeVisible();
      const dataModelTextarea = page.locator('.data-model-field textarea');

      await expect(dataModelTextarea).not.toHaveValue(/^$/);
      await expect(dataModelTextarea).toHaveValue(/"location"/);

      const currentValue = await dataModelTextarea.inputValue();
      const parsedModel = JSON.parse(currentValue);
      parsedModel.booking.location = 'LAX';

      await dataModelTextarea.fill(JSON.stringify(parsedModel, null, 2));
      await dataModelTextarea.blur();

      const locationInput = config.pickupLocationLocator(iframe);
      await expect(locationInput).toBeVisible();
      await expect(locationInput).toBeEnabled();
      await expect(locationInput).toHaveValue('LAX', {timeout: 10000});
    });

    test('propagates Raw A2UI JSON updates to the rendered preview', async ({page}) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const rawJson = await getMonacoContent(page);

      const updatedRawJson = rawJson.replace(
        '"text": "Search Cars"',
        '"text": "Search Rental Cars"',
      );
      await setMonacoContent(page, updatedRawJson);

      const iframe = page.frameLocator('iframe.preview-iframe');
      const searchButton = iframe.getByRole('button', {name: 'Search Rental Cars'});
      await expect(searchButton).toBeVisible();
      await expect(searchButton).toBeEnabled();
    });

    test('captures telemetry actions and events updates upon search form click', async ({page}) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();
      await waitForPreviewSettled(page);

      const pickupInput = config.pickupDateLocator(iframe);
      await expect(pickupInput).toBeVisible();
      await expect(pickupInput).toBeEnabled();

      await config.fillDate(pickupInput, '2026-05-05');
      await pickupInput.dispatchEvent('change');
      await pickupInput.blur();
      await expect(pickupInput).toHaveValue('2026-05-05');

      // Ensure the DATA_MODEL_CHANGE has arrived at host communication
      await page.waitForFunction(() => {
        const history = window.a2uiHostCommunication?.getHistoryBuffer() || [];
        return history.some(
          env =>
            env.type === 'DATA_MODEL_CHANGE' && JSON.stringify(env.payload).includes('2026-05-05'),
        );
      });

      const searchButton = iframe.getByRole('button', {name: 'Search Cars'});
      await expect(searchButton).toBeVisible();
      await expect(searchButton).toBeEnabled();
      await searchButton.scrollIntoViewIfNeeded();
      await searchButton.click();

      // Verify Event tab notification badge
      const eventsTab = page.locator('.dv-tab', {hasText: /^Events/});
      await expect(eventsTab).toBeVisible();
      await expect(eventsTab).toContainText('(1)');

      // Verify event table details in Events tab
      await eventsTab.click();
      await expect(page.locator('.events-container')).toBeVisible();
      await expect(page.locator('.events-container table tr.element-row')).toBeVisible();
      const eventRow = page.locator('.events-container table tr.element-row').first();
      await expect(eventRow).toBeVisible();
      await expect(eventRow.locator('td.mat-column-component')).toHaveText('book_button');
      await expect(eventRow.locator('td.mat-column-context pre')).toContainText('"location": ""');
      await expect(eventRow.locator('td.mat-column-context pre')).toContainText(
        '"pickupDate": "2026-05-05"',
      );

      // Verify SEND_TO_SERVER in Raw Messages tab
      await page.locator('.dv-tab', {hasText: /^Raw Messages/}).click();
      await expect(page.locator('.raw-messages-container')).toBeVisible();
      const envelopes = page.locator(
        '.raw-messages-container [data-testid="raw-message-envelope"], .raw-messages-container [data-testid="llm-log-panel"]',
      );
      await expect.poll(async () => envelopes.count()).toBeGreaterThanOrEqual(1);
      const latestEnvelope = envelopes
        .filter({hasText: PreviewBridgeMessageType.SEND_TO_SERVER})
        .first();
      await expect(latestEnvelope.locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.SEND_TO_SERVER,
      );
      await expect(latestEnvelope.locator('pre')).toContainText('"name": "searchCars"');
      await expect(latestEnvelope.locator('pre')).toContainText(
        '"sourceComponentId": "book_button"',
      );
    });

    test('settles preview frame height without a SURFACE_RESIZE feedback loop', async ({page}) => {
      test.setTimeout(60_000);

      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();

      const frameContainer = page.locator('.rendered-frame-container');

      // The bounds below were measured at the configured 1280x800 viewport,
      // where the preview panel starts SHORTER than the ~312px of sample
      // content, so a frame tracking the guest is distinguishable from one
      // merely filling its panel. That geometry is not a constant: the dockview
      // layout is restored from persisted JSON for real users, while each
      // Playwright context starts with empty storage and therefore the default
      // layout. Changing the viewport invalidates the measured bounds rather
      // than just shifting the numbers.
      //
      // Icon and text webfonts swap in after first paint and can move the
      // content by more than the 1px settle tolerance, so wait for the swap and
      // for one repeated reading before sampling.
      await iframe.locator('body').evaluate(() => document.fonts.ready.then(() => true));
      await waitForStableHeight(page, frameContainer);

      const heights: number[] = [];
      for (let i = 0; i < HEIGHT_SAMPLE_COUNT; i++) {
        heights.push(await frameContainer.evaluate(el => (el as HTMLElement).offsetHeight));
        await page.waitForTimeout(HEIGHT_SAMPLE_INTERVAL_MS);
      }

      // The frame must come to rest. Its resting value is deliberately not
      // pinned, only bounded, because it depends on how the guest measures.
      // Soft assertions keep every violated property visible in one run.
      const settled = heights.slice(-6);
      expect
        .soft(Math.max(...settled) - Math.min(...settled), `heights: ${heights}`)
        .toBeLessThanOrEqual(1);
      expect
        .soft(heights[heights.length - 1], `heights: ${heights}`)
        .toBeLessThan(MAX_SETTLED_FRAME_HEIGHT_PX);

      const resizeLog = await page.evaluate(
        () => (window as unknown as WindowWithResizeLog).__a2uiResizeLog ?? [],
      );
      const reportedHeights = resizeLog.map((entry: SurfaceResizeLogEntry) => entry.height ?? 0);

      // Tripwire. Every bound below is satisfied by an empty log, so without
      // this the whole wire tap can die silently: a renamed message type, an
      // added envelope, a clobbered __a2uiResizeLog, or a failed init script.
      expect(resizeLog.length, 'SURFACE_RESIZE wire tap recorded nothing').toBeGreaterThan(0);

      expect
        .soft(resizeLog.length, `resize heights: ${reportedHeights}`)
        .toBeLessThan(MAX_IDLE_RESIZE_MESSAGES);
      expect
        .soft(longestIncreasingRun(reportedHeights), `resize heights: ${reportedHeights}`)
        .toBeLessThanOrEqual(MAX_INCREASING_RESIZE_RUN);

      const arrivalTimes = resizeLog.map((entry: SurfaceResizeLogEntry) => entry.timeMs);
      expect
        .soft(
          longestBurstRun(arrivalTimes, LOOP_CADENCE_GAP_MS),
          `resize gaps: ${arrivalTimes.slice(1).map((t, i) => Math.round(t - arrivalTimes[i]))}`,
        )
        .toBeLessThanOrEqual(MAX_LOOP_CADENCE_RUN);

      // The guest document must fit its own viewport, so growing the frame can
      // never grow the reported height again.
      //
      // `contentHeight` mirrors measureAndDispatch() in
      // bridge/src/surface-resize-observer.ts. Deriving it from
      // body.scrollHeight alone diverges whenever the root element is the
      // taller box: body margins escape through it, which the bridge unit test
      // pins at body 290 against documentElement.offsetHeight 390.
      const guest = await iframe.locator('body').evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        contentHeight: Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
        ),
      }));
      expect.soft(guest.scrollHeight).toBeLessThanOrEqual(guest.clientHeight + 1);

      // Settling is not enough: the frame must settle ON THE CONTENT. Comparing
      // against the guest's own content box rather than a literal keeps this
      // valid when the sample payload changes. Hard, not soft: this is the
      // assertion with real margin (off by 16-32px when the fix is reverted)
      // and it cannot be satisfied by the 280px floor, by MAX_SURFACE_DIMENSION,
      // by the host growth breaker, or by the panel geometry of the day.
      //
      // It is also the only thing standing between React and no coverage at
      // all: on a reverted React guest, the message count, run-length and
      // cadence bounds above ALL PASSED, and this assertion alone failed.
      // Making it soft, or comparing against a literal, gives up React.
      const settledHeight = heights[heights.length - 1];
      const expectedHeight = Math.max(MIN_FRAME_HEIGHT_PX, guest.contentHeight);
      expect(
        Math.abs(settledHeight - expectedHeight),
        `frame: ${settledHeight}px, guest content: ${guest.contentHeight}px`,
      ).toBeLessThanOrEqual(FRAME_HEIGHT_TOLERANCE_PX);
    });
  });
}

test.describe('Bridge Telemetry Layout Constraints', () => {
  test('verifies bridge blocking state overlay mounting/unmounting and FORCE_UNBLOCK message ingestion', async ({
    page,
  }) => {
    await page.route('http://custom-renderer.com/*', async route => {
      await route.fulfill({
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>Preview</body></html>`,
      });
    });

    await page.goto('/?renderer=http://custom-renderer.com/index.html');
    await expect(page.locator('.workspace-container')).toBeVisible();

    const iframeBody = page.frameLocator('iframe.preview-iframe').locator('body');
    await expect(iframeBody).toBeVisible();

    const blockingMsg = {
      type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
      payload: {blocked: true, message: 'Freezing'},
    };
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, blockingMsg);

    await page.locator('.dv-tab', {hasText: /^Raw Messages/}).click();
    const unblockMsg = {type: PreviewBridgeMessageType.FORCE_UNBLOCK};
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, unblockMsg);

    const envelope = page.getByTestId('raw-message-envelope').first();
    await expect(envelope).toBeVisible();
    await expect(envelope).toContainText(PreviewBridgeMessageType.FORCE_UNBLOCK);
  });
});
