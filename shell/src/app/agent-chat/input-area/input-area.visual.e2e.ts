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
import {connectMockAgent} from '../test/mock-a2a-agent';

test.describe('A2aInputArea Visual Regression & Layout', () => {
  test('renders prompt input card with textarea, add button, and send action', async ({page}) => {
    await connectMockAgent(page);

    const inputArea = page.locator('a2ui-composer-input-area');
    await expect(inputArea).toBeVisible();
    await expect(inputArea.locator('.input-card')).toBeVisible();
    await expect(inputArea.locator('.prompt-textarea')).toBeVisible();
    await expect(inputArea.locator('.prompt-textarea')).toHaveAttribute(
      'placeholder',
      'Ask your agent anything...',
    );
    await expect(inputArea.locator('.add-btn')).toBeVisible();

    const sendBtn = inputArea.locator('.send-circle-btn');
    await expect(sendBtn).toBeVisible();
    await expect(sendBtn).toBeDisabled();

    await expect(inputArea).toHaveScreenshot('input-area.png');
  });

  test('renders active prompt input card with text and enabled send button', async ({page}) => {
    await connectMockAgent(page);

    const inputArea = page.locator('a2ui-composer-input-area');
    await expect(inputArea).toBeVisible();

    const textarea = inputArea.locator('.prompt-textarea');
    await textarea.fill('Book flights from SFO to NRT');

    const sendBtn = inputArea.locator('.send-circle-btn');
    await expect(sendBtn).toBeEnabled();

    await expect(inputArea).toHaveScreenshot('input-area-active.png');
  });

  test('renders prompt input card with attached image tray and image chip', async ({page}) => {
    await connectMockAgent(page);

    const inputArea = page.locator('a2ui-composer-input-area');
    await expect(inputArea).toBeVisible();

    const textarea = inputArea.locator('.prompt-textarea');
    await textarea.fill('Analyze this flight receipt image');

    // Attach an image with a long filename
    const fileInput = inputArea.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'very-long-flight-itinerary-confirmation-receipt-2026-july.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzE1LNYAAAAABJRU5ErkJggg==',
        'base64',
      ),
    });

    const tray = inputArea.locator('.attached-images-tray');
    await expect(tray).toBeVisible();
    await expect(tray.locator('.image-chip')).toBeVisible();
    await expect(tray.locator('.chip-name')).toContainText('very-long-flight-itinerary');

    const sendBtn = inputArea.locator('.send-circle-btn');
    await expect(sendBtn).toBeEnabled();

    await expect(inputArea).toHaveScreenshot('input-area-with-attachment.png');
  });
});
