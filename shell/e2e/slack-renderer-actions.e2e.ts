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

import {expect, test, type Page} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  collectUnexpectedErrors,
  DATA_BOUND_ACTION_JSON,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  slackPreviewFrame,
  slackPreviewSurface,
  waitForMonaco,
} from './slack-renderer.helpers';

const EXPECTED_ACTION = {
  name: 'acknowledge',
  surfaceId: 'data-bound-action',
  sourceComponentId: 'acknowledge-button',
  context: {
    recordId: 'example-42',
  },
} as const;

const SIMULATOR_VIEWPORT = {width: 1280, height: 1000} as const;

interface CapturedActionPayload {
  version?: string;
  action?: {
    name?: string;
    surfaceId?: string;
    sourceComponentId?: string;
    context?: Record<string, unknown>;
    timestamp?: string;
  };
}

interface WindowWithCapturedSlackActions extends Window {
  __capturedSlackActions?: CapturedActionPayload[];
}

test.describe('Slack renderer actions in Composer', () => {
  test('sends one shell event for a native Slack button click', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await loadDataBoundActionExample(page);
    await installSendToServerCapture(page);

    await slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge'}).click();

    await expectSingleActionMessage(page);
    expect(unexpectedErrors).toEqual([]);
  });

  test('sends one shell event for a Tightknit simulator action', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await page.setViewportSize(SIMULATOR_VIEWPORT);
    await loadDataBoundActionExample(page);
    await installSendToServerCapture(page);

    const simulateButton = slackPreviewFrame(page).getByRole('button', {name: 'Simulate'});
    await expect(simulateButton).toBeVisible();
    await simulateButton.click();

    await expectSingleActionMessage(page);
    expect(unexpectedErrors).toEqual([]);
  });
});

async function loadDataBoundActionExample(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page);
  await waitForMonaco(page);
  await replaceMonacoJson(page, DATA_BOUND_ACTION_JSON);
  await expect(
    slackPreviewSurface(page).getByText('Ready for review', {exact: true}),
  ).toBeVisible();
  await expect(slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge'})).toBeVisible();
}

async function installSendToServerCapture(page: Page): Promise<void> {
  await page.evaluate(messageType => {
    const captureWindow = window as WindowWithCapturedSlackActions;
    captureWindow.__capturedSlackActions = [];
    window.addEventListener('message', event => {
      const data = event.data as {type?: unknown; payload?: CapturedActionPayload} | undefined;
      if (data?.type === messageType && data.payload?.action) {
        captureWindow.__capturedSlackActions?.push(data.payload);
      }
    });
  }, PreviewBridgeMessageType.SEND_TO_SERVER);
}

async function expectSingleActionMessage(page: Page): Promise<void> {
  await expect.poll(async () => (await getCapturedActionMessages(page)).length).toBe(1);

  const [payload] = await getCapturedActionMessages(page);
  expect(payload.version).toBe('v0.9');
  expect(payload.action).toMatchObject(EXPECTED_ACTION);
  expect(payload.action?.timestamp).toEqual(expect.any(String));

  await page.waitForTimeout(250);
  expect(await getCapturedActionMessages(page)).toHaveLength(1);
}

async function getCapturedActionMessages(page: Page): Promise<CapturedActionPayload[]> {
  return page.evaluate(() => {
    const captureWindow = window as WindowWithCapturedSlackActions;
    return captureWindow.__capturedSlackActions ?? [];
  });
}
