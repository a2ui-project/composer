/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {A2uiMessageListSchema} from '@a2ui/web_core/v0_9';
import {readFileSync} from 'node:fs';
import {expect, test, type Page} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  collectUnexpectedErrors,
  getBlockKitJson,
  openComposerWithSlackRenderer,
  openGeneratedBlockKit,
  replaceMonacoJson,
  slackPreviewFrame,
  slackPreviewSurface,
  waitForPreviewToSettle,
} from './slack-renderer.helpers';
import {waitForMonacoEditor} from './helpers';

const bookingJson = readFileSync(
  new URL('../../samples/react-slack-catalog/public/examples/car-booking.json', import.meta.url),
  'utf-8',
);

interface FormActionWindow extends Window {
  __slackFormActions?: unknown[];
  __slackFormModels?: unknown[];
}

/** What the booking tests enter into the Book a Car form. */
const BOOKING = {
  location: 'San Francisco airport',
  pickupDate: '2026-10-01',
  dropoffDate: '2026-10-03',
} as const;

test.describe('Slack native booking form', () => {
  test('starts the built-in Slack profile with the Book a Car form', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await openBookingForm(page);
    await expect(slackPreviewSurface(page).getByText('Book a Car', {exact: true})).toBeVisible();
    const location = slackPreviewSurface(page).getByRole('textbox', {name: 'Pick-up Location'});
    await expect(location).toBeVisible();
    const locationBox = await location.boundingBox();
    expect(locationBox!.height).toBeLessThan(50);
    expect(errors).toEqual([]);
  });

  test('keeps focus in a field while the user types into it', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await openBookingForm(page);
    const location = slackPreviewSurface(page).getByRole('textbox', {name: 'Pick-up Location'});
    await location.click();
    await location.pressSequentially(BOOKING.location, {delay: 30});
    await expect(location).toBeFocused();
    await expect(location).toHaveValue(BOOKING.location);
    expect(errors).toEqual([]);
  });

  test('reports field edits to Composer as data model changes', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await openBookingForm(page);
    await page.evaluate(messageType => {
      const capture = window as FormActionWindow;
      capture.__slackFormModels = [];
      window.addEventListener('message', event => {
        if (event.data?.type === messageType) {
          capture.__slackFormModels?.push(event.data.payload.updateDataModel);
        }
      });
    }, PreviewBridgeMessageType.DATA_MODEL_CHANGE);
    await fillBooking(page);
    await expect
      .poll(() => page.evaluate(() => (window as FormActionWindow).__slackFormModels?.at(-1)))
      .toMatchObject({
        surfaceId: 'sample-surface',
        value: {
          booking: {
            location: BOOKING.location,
            pickupDate: BOOKING.pickupDate,
            dropoffDate: BOOKING.dropoffDate,
          },
        },
      });
    expect(errors).toEqual([]);
  });

  test('exports field edits in the generated Block Kit', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await openBookingForm(page);
    await fillBooking(page);
    await openGeneratedBlockKit(page);
    await expect
      .poll(() => getBlockKitJson(page))
      .toMatchObject({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            type: 'input',
            element: expect.objectContaining({
              type: 'plain_text_input',
              initial_value: BOOKING.location,
            }),
          }),
          expect.objectContaining({
            type: 'input',
            element: expect.objectContaining({
              type: 'datepicker',
              initial_date: BOOKING.pickupDate,
            }),
          }),
          expect.objectContaining({
            type: 'input',
            element: expect.objectContaining({
              type: 'datepicker',
              initial_date: BOOKING.dropoffDate,
            }),
          }),
        ]),
      });
    await expect(
      slackPreviewSurface(page).getByText('✓ Valid Block Kit payload', {exact: true}),
    ).toBeVisible();
    await expect(
      slackPreviewFrame(page).getByRole('list', {name: 'Preview diagnostics'}),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('keeps typed values when the theme changes', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await openBookingForm(page);
    const location = slackPreviewSurface(page).getByRole('textbox', {name: 'Pick-up Location'});
    await location.fill(BOOKING.location);
    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(slackPreviewFrame(page).locator('main')).toHaveAttribute('data-theme', 'dark');
    await expect(location).toHaveValue(BOOKING.location);
    expect(errors).toEqual([]);
  });

  test('submits searchCars with the bound field values', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await openBookingForm(page);
    await fillBooking(page);
    // The edits re-render the form; let that finish before clicking its button.
    await waitForPreviewToSettle(page);
    await page.evaluate(messageType => {
      const capture = window as FormActionWindow;
      capture.__slackFormActions = [];
      window.addEventListener('message', event => {
        if (event.data?.type === messageType && event.data.payload?.action) {
          capture.__slackFormActions?.push(event.data.payload.action);
        }
      });
    }, PreviewBridgeMessageType.SEND_TO_SERVER);
    await slackPreviewSurface(page).getByRole('button', {name: 'Search Cars', exact: true}).click();
    await expect
      .poll(() => page.evaluate(() => (window as FormActionWindow).__slackFormActions))
      .toEqual([
        expect.objectContaining({
          name: 'searchCars',
          context: {
            location: BOOKING.location,
            pickupDate: BOOKING.pickupDate,
            dropoffDate: BOOKING.dropoffDate,
          },
        }),
      ]);
    expect(errors).toEqual([]);
  });

  test('refreshes typed fields when the canvas updates them', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await updateBookingCanvasAfterTyping(page);
    const preview = slackPreviewSurface(page);
    await expect(preview.getByRole('textbox', {name: 'Pick-up Location'})).toHaveValue('Seattle');
    await expect(preview.getByLabel('Pick-up Date', {exact: true})).toHaveValue('2026-11-05');
    expect(errors).toEqual([]);
  });

  test('accepts edits to fields a canvas update refreshed', async ({page}) => {
    const errors = collectUnexpectedErrors(page);
    await updateBookingCanvasAfterTyping(page);
    const location = slackPreviewSurface(page).getByRole('textbox', {name: 'Pick-up Location'});
    // Wait for the updated canvas, so the edit goes into the refreshed field.
    await expect(location).toHaveValue('Seattle');
    await location.fill('Seattle airport');
    await expect(location).toHaveValue('Seattle airport');
    expect(errors).toEqual([]);
  });

  test('keeps shared field bindings in sync without losing the typing cursor', async ({page}) => {
    await openComposerWithSlackRenderer(page, {rendererId: 'slack'});
    await waitForMonacoEditor(page);
    const messages = A2uiMessageListSchema.parse(JSON.parse(bookingJson));
    const update = messages.find(message => 'updateComponents' in message);
    if (!update || !('updateComponents' in update)) {
      throw new Error('Booking components missing');
    }
    const root = update.updateComponents.components.find(component => component.id === 'root');
    if (!root || !Array.isArray(root['children'])) {
      throw new Error('Booking root missing');
    }
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

/**
 * Opens Composer on the built-in Slack profile, which starts on the Book a Car form,
 * and waits for the preview to settle, so the form a test types into is the one that
 * stays on the page.
 */
async function openBookingForm(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page, {rendererId: 'slack'});
  await expect(
    slackPreviewSurface(page).getByRole('textbox', {name: 'Pick-up Location'}),
  ).toBeVisible();
  await waitForPreviewToSettle(page);
}

/** Enters BOOKING into the Book a Car form. */
async function fillBooking(page: Page): Promise<void> {
  const preview = slackPreviewSurface(page);
  await preview.getByRole('textbox', {name: 'Pick-up Location'}).fill(BOOKING.location);
  await preview.getByLabel('Pick-up Date', {exact: true}).fill(BOOKING.pickupDate);
  await preview.getByLabel('Drop-off Date', {exact: true}).fill(BOOKING.dropoffDate);
}

/**
 * Types into the Book a Car form's location, then replaces the canvas in the JSON
 * editor with one that sets the location and pick-up date.
 */
async function updateBookingCanvasAfterTyping(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page, {rendererId: 'slack'});
  await waitForMonacoEditor(page);
  await slackPreviewSurface(page)
    .getByRole('textbox', {name: 'Pick-up Location'})
    .fill('Original location');
  const updated = bookingJson
    .replace('"location": ""', '"location": "Seattle"')
    .replace('"pickupDate": ""', '"pickupDate": "2026-11-05"');
  await replaceMonacoJson(page, updated);
}
