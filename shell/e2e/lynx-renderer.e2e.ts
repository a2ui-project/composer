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

import {expect, test} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

test('renders A2UI through Lynx Web and exposes the mobile bundle', async ({page}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/?rendererId=lynx-dev');
  await expect(page.locator('.workspace-container')).toBeVisible();

  const preview = page.frameLocator('iframe.preview-iframe');
  await expect(preview.getByText('Lynx preview is ready')).toBeVisible();
  await expect(preview.getByText('Try Lynx action')).toBeVisible();

  const bundleLink = page.getByRole('link', {name: 'Download mobile bundle'});
  await expect(bundleLink).toHaveAttribute('href', 'http://localhost:3459/a2ui.lynx.js');
  const artifactResponse = await page.request.get('http://localhost:3459/a2ui.lynx.js');
  expect(artifactResponse.ok()).toBe(true);
  expect((await artifactResponse.body()).byteLength).toBeGreaterThan(1_000_000);

  await preview.getByText('Try Lynx action').click();
  await page.locator('.dv-tab', {hasText: /^Raw Messages/}).click();
  const actionEnvelope = page
    .getByTestId('llm-log-panel')
    .filter({hasText: PreviewBridgeMessageType.SEND_TO_SERVER})
    .first();
  await expect(actionEnvelope.locator('.message-type')).toHaveText(
    PreviewBridgeMessageType.SEND_TO_SERVER,
  );
  await expect(actionEnvelope.locator('pre')).toContainText('lynxPreviewAction');

  expect(pageErrors).toEqual([]);
});
