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

import {test, expect, Locator, FrameLocator} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {SurfaceResizeLogEntry, WindowWithMonaco, WindowWithResizeLog} from './types';

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
    rendererUrl: 'http://localhost:3456',
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
    rendererUrl: 'http://localhost:3458',
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
          el.dispatchEvent(new Event('input', {bubbles: true}));
          el.dispatchEvent(new Event('change', {bubbles: true}));
        }
      }, value);
    },
  },
  {
    name: 'Lit',
    rendererUrl: 'http://localhost:3457',
    pickupDateLocator: iframe =>
      iframe.locator('a2ui-datetimeinput:has-text("Pick-up Date") input'),
    pickupLocationLocator: iframe =>
      iframe.locator('a2ui-basic-textfield:has-text("Pick-up Location") input'),
    fillDate: async (locator, value) => {
      await locator.fill(value);
    },
  },
];

/** Number of frame height samples taken while observing an idle preview. */
const HEIGHT_SAMPLE_COUNT = 12;

/** Delay between consecutive frame height samples, in milliseconds. */
const HEIGHT_SAMPLE_INTERVAL_MS = 250;

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

/** Upper bound on consecutive growing heights, which characterise a ratchet. */
const MAX_INCREASING_RESIZE_RUN = 4;

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
      const pickupInput = config.pickupDateLocator(iframe);
      await expect(pickupInput).toBeVisible();
      await expect(pickupInput).toBeEnabled();

      await config.fillDate(pickupInput, '2026-05-30');
      await pickupInput.dispatchEvent('change');
      await pickupInput.blur();

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

      await page.locator('.dv-tab', {hasText: /^Data Model/}).click();
      await expect(page.locator('.data-model-container textarea')).toBeVisible();
      const dataModelTextarea = page.locator('.data-model-field textarea');

      await expect(dataModelTextarea).not.toHaveValue(/^$/);
      await expect(dataModelTextarea).toHaveValue(/"location"/);

      const currentValue = await dataModelTextarea.inputValue();
      const parsedModel = JSON.parse(currentValue);
      parsedModel.booking.location = 'LAX';

      await dataModelTextarea.fill(JSON.stringify(parsedModel, null, 2));

      const locationInput = config.pickupLocationLocator(iframe);
      await expect(locationInput).toBeVisible();
      await expect(locationInput).toBeEnabled();
      await expect(locationInput).toHaveValue('LAX');
    });

    test('propagates Raw A2UI JSON updates to the rendered preview', async ({page}) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
      await expect(editorLocator).toBeVisible();

      await page.waitForFunction(() => {
        const monaco = (window as unknown as WindowWithMonaco).monaco;
        return (monaco?.editor?.getModels()?.length ?? 0) > 0;
      });

      let rawJson = '';
      await expect
        .poll(async () => {
          rawJson = await page.evaluate(() => {
            const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
            return model ? model.getValue() : '';
          });
          return rawJson;
        })
        .not.toBe('');

      const updatedRawJson = rawJson.replace(
        '"text": "Search Cars"',
        '"text": "Search Rental Cars"',
      );
      await page.evaluate(val => {
        const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
        if (model) {
          model.setValue(val);
        }
      }, updatedRawJson);

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

      const pickupInput = config.pickupDateLocator(iframe);
      await expect(pickupInput).toBeVisible();
      await expect(pickupInput).toBeEnabled();

      await config.fillDate(pickupInput, '2026-05-05');
      await pickupInput.dispatchEvent('change');
      await pickupInput.blur();
      await expect(pickupInput).toHaveValue('2026-05-05');

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

      expect
        .soft(resizeLog.length, `resize heights: ${reportedHeights}`)
        .toBeLessThan(MAX_IDLE_RESIZE_MESSAGES);
      expect
        .soft(longestIncreasingRun(reportedHeights), `resize heights: ${reportedHeights}`)
        .toBeLessThanOrEqual(MAX_INCREASING_RESIZE_RUN);

      // The guest document must fit its own viewport, so growing the frame can
      // never grow the reported height again.
      const guest = await iframe.locator('body').evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        contentHeight: document.body.scrollHeight,
      }));
      expect.soft(guest.scrollHeight).toBeLessThanOrEqual(guest.clientHeight + 1);

      // Settling is not enough: the frame must settle ON THE CONTENT. Comparing
      // against the guest's own content box rather than a literal keeps this
      // valid when the sample payload changes.
      const settledHeight = heights[heights.length - 1];
      const expectedHeight = Math.max(MIN_FRAME_HEIGHT_PX, guest.contentHeight);
      expect
        .soft(
          Math.abs(settledHeight - expectedHeight),
          `frame: ${settledHeight}px, guest content: ${guest.contentHeight}px`,
        )
        .toBeLessThanOrEqual(FRAME_HEIGHT_TOLERANCE_PX);
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
