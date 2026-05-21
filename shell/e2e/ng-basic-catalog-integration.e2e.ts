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
import {PreviewBridgeMessageType} from 'a2ui-bridge';

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('a2ui_composer_force_1p', 'true');
      localStorage.setItem('a2ui_composer_api_key', 'test-api-key');
    } catch (e) {}
  });
});

test.describe('ng-basic-catalog Integration Suite', () => {
  test('validates startup telemetry handshake messages', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    await page.getByRole('tab', {name: 'Raw Messages'}).click();
    // Using `hover` causes Playwright to perform "actionability" tests.
    // Without this, the animation could still be running.
    await page.locator('.raw-messages-container .message-envelope').first().hover({trial: true});
    const envelopes = page.getByTestId('raw-message-envelope');
    await expect(envelopes).toHaveCount(3);
    await expect(envelopes.nth(0).locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.DATA_MODEL_CHANGE,
    );
    await expect(envelopes.nth(1).locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.A2UI_CATALOG,
    );
    await expect(envelopes.nth(2).locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.RENDERER_READY,
    );
  });

  test('synchronizes "pick-up date" from preview iframe to data model tab', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    const iframe = page.frameLocator('iframe.preview-iframe');
    const pickupInput = iframe.locator('.a2ui-date-time-container:has-text("Pick-up Date") input');
    await expect(pickupInput).toBeVisible();

    await pickupInput.fill('2026-05-30');
    await pickupInput.blur();

    await page.getByRole('tab', {name: 'Data Model'}).click();
    await expect(page.locator('.data-model-container textarea')).toBeVisible();
    const dataModelTextarea = page.locator('.data-model-field textarea');
    await expect(dataModelTextarea).toHaveValue(/"pickupDate":\s*"2026-05-30"/);
  });

  test('propagates data model changes from shell "Data Model" tab to rendered preview', async ({
    page,
  }) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    // Wait for preview iframe to finish handshake and render before checking data model
    const iframe = page.frameLocator('iframe.preview-iframe');
    await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();

    await page.getByRole('tab', {name: 'Data Model'}).click();
    await expect(page.locator('.data-model-container textarea')).toBeVisible();
    const dataModelTextarea = page.locator('.data-model-field textarea');

    // Wait for initial model load
    await expect(dataModelTextarea).not.toHaveValue(/^$/);

    const currentValue = await dataModelTextarea.inputValue();
    const parsedModel = JSON.parse(currentValue);
    parsedModel.booking.location = 'LAX';

    await dataModelTextarea.fill(JSON.stringify(parsedModel, null, 2));
    await page.waitForTimeout(1000);

    const locationInput = iframe.locator(
      '.a2ui-text-field-container:has-text("Pick-up Location") input',
    );
    await expect(locationInput).toHaveValue('LAX');
  });

  test('propagates Raw A2UI JSON updates to the rendered preview', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    const rawJsonTextarea = page.locator('.raw-json-field textarea');
    // Wait for initial JSON to be loaded
    await expect(rawJsonTextarea).not.toHaveValue(/^$/);

    const rawJson = await rawJsonTextarea.inputValue();
    const updatedRawJson = rawJson.replace('"text": "Search Cars"', '"text": "Search Rental Cars"');
    await rawJsonTextarea.fill(updatedRawJson);
    await page.waitForTimeout(1000);

    const iframe = page.frameLocator('iframe.preview-iframe');
    const searchButton = iframe.getByRole('button', {name: 'Search Rental Cars'});
    await expect(searchButton).toBeVisible();
  });

  test('captures telemetry actions and events updates upon search form click', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    const iframe = page.frameLocator('iframe.preview-iframe');

    // Fill out form entries (Pick-up Date)
    const pickupInput = iframe.locator('.a2ui-date-time-container:has-text("Pick-up Date") input');
    await pickupInput.fill('2026-05-05');
    await pickupInput.blur();

    // Search button click
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
    // Using `hover` causes Playwright to perform "actionability" tests.
    // Without this, the animation could still be running.
    await page.locator('.raw-messages-container .message-envelope').first().hover({trial: true});
    const latestEnvelope = page.getByTestId('raw-message-envelope').first();
    await expect(latestEnvelope.locator('.message-type')).toHaveText(
      PreviewBridgeMessageType.SEND_TO_SERVER,
    );
    await expect(latestEnvelope.locator('pre')).toContainText('"name": "searchCars"');
    await expect(latestEnvelope.locator('pre')).toContainText('"sourceComponentId": "book_button"');
    await expect(latestEnvelope.locator('pre')).toContainText('"location": ""');
    await expect(latestEnvelope.locator('pre')).toContainText('"pickupDate": "2026-05-05"');
  });
});
