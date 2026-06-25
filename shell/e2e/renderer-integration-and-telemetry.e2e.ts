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
      await locator.fill(value);
    },
  },
  {
    name: 'React',
    rendererUrl: 'http://localhost:3458',
    pickupDateLocator: iframe => iframe.locator('label:has-text("Pick-up Date") + input'),
    pickupLocationLocator: iframe => iframe.locator('label:has-text("Pick-up Location") + input'),
    fillDate: async (locator, value) => {
      await locator.evaluate((el: HTMLInputElement, val) => {
        const prototype = Object.getPrototypeOf(el);
        const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
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

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('a2ui_composer_force_1p', 'true');
    } catch (e) {}
  });
});

for (const config of CONFIGS) {
  test.describe(`${config.name} Preview Handshake & Sync`, () => {
    test('validates startup telemetry handshake messages and catalog properties', async ({
      page,
    }) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      await page.getByRole('tab', {name: 'Raw Messages'}).click();
      await page.locator('.raw-messages-container .message-envelope').first().hover({trial: true});
      const envelopes = page.locator(
        '.raw-messages-container [data-testid="raw-message-envelope"], .raw-messages-container [data-testid="llm-log-panel"]',
      );
      expect(await envelopes.count()).toBeGreaterThanOrEqual(3);

      // Validate descending chronological sequence (newest first)
      await expect(envelopes.nth(0).locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.DATA_MODEL_CHANGE,
      );
      await expect(envelopes.nth(1).locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.A2UI_CATALOG,
      );
      await expect(envelopes.nth(2).locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.RENDERER_READY,
      );

      // Expand A2UI_CATALOG card
      const catalogHeader = envelopes.nth(1).locator('mat-expansion-panel-header');
      await catalogHeader.focus();
      await catalogHeader.press('Enter');

      // Assert the pre block contains key catalog properties
      const catalogPre = envelopes.nth(1).locator('pre');
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

      await config.fillDate(pickupInput, '2026-05-30');
      await pickupInput.blur();

      await page.getByRole('tab', {name: 'Data Model'}).click();
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

      await page.getByRole('tab', {name: 'Data Model'}).click();
      await expect(page.locator('.data-model-container textarea')).toBeVisible();
      const dataModelTextarea = page.locator('.data-model-field textarea');

      await expect(dataModelTextarea).not.toHaveValue(/^$/);

      const currentValue = await dataModelTextarea.inputValue();
      const parsedModel = JSON.parse(currentValue);
      parsedModel.booking.location = 'LAX';

      await dataModelTextarea.fill(JSON.stringify(parsedModel, null, 2));
      await page.waitForTimeout(1000);

      const locationInput = config.pickupLocationLocator(iframe);
      await expect(locationInput).toHaveValue('LAX');
    });

    test('propagates Raw A2UI JSON updates to the rendered preview', async ({page}) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const rawJsonTextarea = page.locator('.raw-json-field textarea');
      await expect(rawJsonTextarea).not.toHaveValue(/^$/);

      const rawJson = await rawJsonTextarea.inputValue();
      const updatedRawJson = rawJson.replace(
        '"text": "Search Cars"',
        '"text": "Search Rental Cars"',
      );
      await rawJsonTextarea.fill(updatedRawJson);
      await page.waitForTimeout(1000);

      const iframe = page.frameLocator('iframe.preview-iframe');
      const searchButton = iframe.getByRole('button', {name: 'Search Rental Cars'});
      await expect(searchButton).toBeVisible();
    });

    test('captures telemetry actions and events updates upon search form click', async ({page}) => {
      await page.goto(`/?renderer=${config.rendererUrl}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const iframe = page.frameLocator('iframe.preview-iframe');
      await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();

      const pickupInput = config.pickupDateLocator(iframe);
      await expect(pickupInput).toBeVisible();
      await config.fillDate(pickupInput, '2026-05-05');
      await pickupInput.blur();

      const searchButton = iframe.getByRole('button', {name: 'Search Cars'});
      await expect(searchButton).toBeVisible();
      await searchButton.click();

      // Verify Event tab notification badge
      const eventsTab = page.locator('.events-badge-host');
      const eventsBadge = eventsTab.locator('.mat-badge-content');
      await expect(eventsBadge).toBeVisible();
      await expect(eventsBadge).toHaveText('1');

      // Verify event table details in Events tab
      await page.getByRole('tab', {name: 'Events'}).click();
      await expect(page.locator('.events-container table tr.element-row')).toBeVisible();
      const eventRow = page.locator('.events-container table tr.element-row').first();
      await expect(eventRow).toBeVisible();
      await expect(eventRow.locator('td.mat-column-component')).toHaveText('book_button');
      await expect(eventRow.locator('td.mat-column-context pre')).toContainText('"location": ""');
      await expect(eventRow.locator('td.mat-column-context pre')).toContainText(
        '"pickupDate": "2026-05-05"',
      );

      // Verify SEND_TO_SERVER in Raw Messages tab
      await page.getByRole('tab', {name: 'Raw Messages'}).click();
      await expect(page.locator('.raw-messages-container')).toBeVisible();
      await page.locator('.raw-messages-container .message-envelope').first().hover({trial: true});
      const latestEnvelope = page
        .locator(
          '.raw-messages-container [data-testid="raw-message-envelope"], .raw-messages-container [data-testid="llm-log-panel"]',
        )
        .first();
      await expect(latestEnvelope.locator('.message-type')).toHaveText(
        PreviewBridgeMessageType.SEND_TO_SERVER,
      );
      await expect(latestEnvelope.locator('pre')).toContainText('"name": "searchCars"');
      await expect(latestEnvelope.locator('pre')).toContainText(
        '"sourceComponentId": "book_button"',
      );
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

    await page.getByRole('tab', {name: 'Raw Messages'}).click();
    const unblockMsg = {type: PreviewBridgeMessageType.FORCE_UNBLOCK};
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, unblockMsg);

    await expect(page.getByTestId('raw-message-envelope').first()).toBeVisible();
    const envText = await page.getByTestId('raw-message-envelope').first().textContent();
    expect(envText).toContain(PreviewBridgeMessageType.FORCE_UNBLOCK);
  });
});
