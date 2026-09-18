/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {A2uiMessageListSchema} from '@a2ui/web_core/v0_9';
import {readFileSync} from 'node:fs';
import {expect, test} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  collectUnexpectedErrors,
  getBlockKitJson,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  slackPreviewFrame,
  slackPreviewSurface,
  waitForMonaco,
} from './slack-renderer.helpers';

const bookingJson = readFileSync(
  new URL('../../samples/react-slack-catalog/public/examples/car-booking.json', import.meta.url),
  'utf-8',
);

interface FormActionWindow extends Window {
  __slackFormActions?: unknown[];
  __slackFormModels?: unknown[];
}

test.describe('Slack native booking form', () => {
  test('starts with the same booking task, preserves typing focus and submits bound values', async ({
    page,
  }, testInfo) => {
    const errors = collectUnexpectedErrors(page);
    await openComposerWithSlackRenderer(page, {rendererId: 'slack'});
    const frame = slackPreviewFrame(page);
    const preview = slackPreviewSurface(page);
    await expect(preview.getByText('Book a Car', {exact: true})).toBeVisible();
    await page.evaluate(messageType => {
      const capture = window as FormActionWindow;
      capture.__slackFormModels = [];
      window.addEventListener('message', event => {
        if (event.data?.type === messageType)
          capture.__slackFormModels?.push(event.data.payload.updateDataModel);
      });
    }, PreviewBridgeMessageType.DATA_MODEL_CHANGE);
    const location = preview.getByRole('textbox', {name: 'Pick-up Location'});
    await expect(location).toBeVisible();
    const locationBox = await location.boundingBox();
    expect(locationBox!.height).toBeLessThan(50);
    await location.click();
    await location.pressSequentially('San Francisco airport', {delay: 30});
    await expect(location).toBeFocused();
    await expect(location).toHaveValue('San Francisco airport');
    await preview.getByLabel('Pick-up Date', {exact: true}).fill('2026-10-01');
    await preview.getByLabel('Drop-off Date', {exact: true}).fill('2026-10-03');
    await expect
      .poll(() => page.evaluate(() => (window as FormActionWindow).__slackFormModels?.at(-1)))
      .toMatchObject({
        surfaceId: 'sample-surface',
        value: {
          booking: {
            location: 'San Francisco airport',
            pickupDate: '2026-10-01',
            dropoffDate: '2026-10-03',
          },
        },
      });
    const exported = await getBlockKitJson(page);
    expect(exported).toMatchObject({
      blocks: expect.arrayContaining([
        expect.objectContaining({
          type: 'input',
          element: expect.objectContaining({
            type: 'plain_text_input',
            initial_value: 'San Francisco airport',
          }),
        }),
        expect.objectContaining({
          type: 'input',
          element: expect.objectContaining({type: 'datepicker', initial_date: '2026-10-01'}),
        }),
        expect.objectContaining({
          type: 'input',
          element: expect.objectContaining({type: 'datepicker', initial_date: '2026-10-03'}),
        }),
      ]),
    });
    await expect(preview.getByText('✓ Valid Block Kit payload', {exact: true})).toBeVisible();
    await expect(frame.getByRole('list', {name: 'Preview diagnostics'})).toHaveCount(0);
    await preview.screenshot({path: testInfo.outputPath('slack-booking-light.png')});
    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(frame.locator('main')).toHaveAttribute('data-theme', 'dark');
    await expect(preview.getByRole('textbox', {name: 'Pick-up Location'})).toHaveValue(
      'San Francisco airport',
    );
    await preview.screenshot({path: testInfo.outputPath('slack-booking-dark.png')});
    await page.screenshot({path: testInfo.outputPath('slack-booking-workspace.png')});
    await page.evaluate(messageType => {
      const capture = window as FormActionWindow;
      capture.__slackFormActions = [];
      window.addEventListener('message', event => {
        if (event.data?.type === messageType && event.data.payload?.action) {
          capture.__slackFormActions?.push(event.data.payload.action);
        }
      });
    }, PreviewBridgeMessageType.SEND_TO_SERVER);
    await preview.getByRole('button', {name: 'Search Cars', exact: true}).click();
    await expect
      .poll(() => page.evaluate(() => (window as FormActionWindow).__slackFormActions))
      .toEqual([
        expect.objectContaining({
          name: 'searchCars',
          context: {
            location: 'San Francisco airport',
            pickupDate: '2026-10-01',
            dropoffDate: '2026-10-03',
          },
        }),
      ]);
    expect(errors).toEqual([]);
  });

  test('refreshes native fields after a canvas update and still supports subsequent edits', async ({
    page,
  }) => {
    const errors = collectUnexpectedErrors(page);
    await openComposerWithSlackRenderer(page, {rendererId: 'slack'});
    await waitForMonaco(page);
    const preview = slackPreviewSurface(page);
    await preview.getByRole('textbox', {name: 'Pick-up Location'}).fill('Original location');
    const updated = bookingJson
      .replace('"location": ""', '"location": "Seattle"')
      .replace('"pickupDate": ""', '"pickupDate": "2026-11-05"');
    await replaceMonacoJson(page, updated);
    await expect(preview.getByRole('textbox', {name: 'Pick-up Location'})).toHaveValue('Seattle');
    await expect(preview.getByLabel('Pick-up Date', {exact: true})).toHaveValue('2026-11-05');
    await preview.getByRole('textbox', {name: 'Pick-up Location'}).fill('Seattle airport');
    await expect(preview.getByRole('textbox', {name: 'Pick-up Location'})).toHaveValue(
      'Seattle airport',
    );
    expect(errors).toEqual([]);
  });
  test('keeps shared field bindings in sync without losing the typing cursor', async ({page}) => {
    await openComposerWithSlackRenderer(page, {rendererId: 'slack'});
    await waitForMonaco(page);
    const messages = A2uiMessageListSchema.parse(JSON.parse(bookingJson));
    const update = messages.find(message => 'updateComponents' in message);
    if (!update || !('updateComponents' in update)) throw new Error('Booking components missing');
    const root = update.updateComponents.components.find(component => component.id === 'root');
    if (!root || !Array.isArray(root['children'])) throw new Error('Booking root missing');
    root['children'].splice(2, 0, 'location_duplicate');
    update.updateComponents.components.push({
      id: 'location_duplicate',
      component: 'TextField',
      label: 'Location confirmation',
      value: {path: '/booking/location'},
      variant: 'shortText',
    });
    await replaceMonacoJson(page, JSON.stringify(messages));
    const preview = slackPreviewSurface(page);
    const location = preview.getByRole('textbox', {name: 'Pick-up Location'});
    const confirmation = preview.getByRole('textbox', {name: 'Location confirmation'});
    await expect(confirmation).toBeVisible();
    await location.click();
    await location.pressSequentially('Boston airport', {delay: 30});
    await expect(location).toBeFocused();
    await expect(location).toHaveValue('Boston airport');
    await expect(confirmation).toHaveValue('Boston airport');
    await location.press('Home');
    await location.pressSequentially('East ');
    await expect(location).toHaveValue('East Boston airport');
    await expect(confirmation).toHaveValue('East Boston airport');
  });
});
