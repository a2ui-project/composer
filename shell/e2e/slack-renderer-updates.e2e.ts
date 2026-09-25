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
import {type A2uiMessage} from '@a2ui/web_core/v0_9';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  blockKitDetails,
  collectUnexpectedErrors,
  DATA_BOUND_ACTION_JSON,
  expectBlockKitJsonToContain,
  getBlockKitTextMatches,
  getSevereMonacoMarkers,
  MARKET_SNAPSHOT_JSON,
  MONACO_MARKER_DEBOUNCE_MS,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  waitForPreviewToSettle,
  SLACK_RENDERER_URL,
  slackPreviewFrame,
  slackPreviewSurface,
  waitForMonaco,
} from './slack-renderer.helpers';

export type KnownBlock = Record<string, unknown>;

export interface PreviewDiagnostic {
  level: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  componentId?: string;
}

export interface PreviewSnapshot {
  revision: number;
  surfaceId?: string;
  status: 'empty' | 'waiting' | 'ready' | 'error';
  blocks: KnownBlock[];
  diagnostics: PreviewDiagnostic[];
}

export interface PreviewSession {
  processMessages(messages: A2uiMessage[]): void;
  getSnapshot(): PreviewSnapshot;
  subscribe(listener: () => void): () => void;
  dispatch(actionId: string): Promise<void>;
  clear(): void;
  dispose(): void;
}

const SLACK_CATALOG_ID = 'https://a2ui-project.github.io/composer/catalogs/slack/v1';
const MANUAL_SURFACE_ID = 'slack-updates-e2e';

test.describe('Slack renderer update flows in Composer', () => {
  test('updates literal Monaco edits in the preview and exported Block Kit JSON', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);

    await openComposerWithSlackRenderer(page);
    await waitForMonaco(page);

    const updatedMarketJson = MARKET_SNAPSHOT_JSON.replace(
      '"Illustrative historical energy market snapshot"',
      '"Closing energy market snapshot"',
    ).replace('"$79.42/bbl"', '"$83.57/bbl"');

    await replaceMonacoJson(page, updatedMarketJson);

    const preview = slackPreviewSurface(page);
    await expect(preview.getByText('Closing energy market snapshot')).toBeVisible();
    await expect(preview.getByText('$83.57/bbl')).toBeVisible();
    await expect(preview.getByText('Illustrative historical energy market snapshot')).toHaveCount(
      0,
    );
    await expectBlockKitJsonToContain(page, 'Closing energy market snapshot');
    await expectBlockKitJsonToContain(page, '$83.57/bbl');
    expect(
      await getBlockKitTextMatches(page, ['Closing energy market snapshot', '$83.57/bbl']),
    ).toEqual(['Closing energy market snapshot', '$83.57/bbl']);

    await page.waitForTimeout(MONACO_MARKER_DEBOUNCE_MS + 600);
    expect(await getSevereMonacoMarkers(page)).toEqual([]);
    expect(unexpectedErrors).toEqual([]);
  });

  test('updates bound data Monaco edits in the preview and exported Block Kit JSON', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);

    await openComposerWithSlackRenderer(page);
    await waitForMonaco(page);

    const updatedDataJson = DATA_BOUND_ACTION_JSON.replace(
      '"Ready for review"',
      '"Ready for release review"',
    );

    await replaceMonacoJson(page, updatedDataJson);

    const preview = slackPreviewSurface(page);
    await expect(preview.getByText('Ready for release review', {exact: true})).toBeVisible();
    await expect(preview.getByText('Ready for review', {exact: true})).toHaveCount(0);
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge'})).toBeVisible();
    await expectBlockKitJsonToContain(page, 'Ready for release review');
    expect(await getBlockKitTextMatches(page, ['Ready for release review'])).toEqual([
      'Ready for release review',
    ]);

    await page.waitForTimeout(MONACO_MARKER_DEBOUNCE_MS + 600);
    expect(await getSevereMonacoMarkers(page)).toEqual([]);
    expect(unexpectedErrors).toEqual([]);
  });

  test('processes parent-to-iframe create, component, data, delete, and recreate messages', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);

    await openComposerWithSlackRenderer(page);
    await waitForMonaco(page);
    await expect(slackPreviewFrame(page).getByText('Your Slack preview starts here')).toBeVisible();
    await waitForPreviewToSettle(page);

    await postRenderA2uiToSlackFrame(page, [
      createSurfaceMessage(),
      updateDataModelMessage({status: 'Parent message ready'}),
      updateStatusComponentsMessage(),
    ]);

    const preview = slackPreviewSurface(page);
    await expect(preview.getByText('Parent message ready', {exact: true})).toBeVisible();
    await expectBlockKitJsonToContain(page, 'Parent message ready');
    expect(await getBlockKitTextMatches(page, ['Parent message ready'])).toEqual([
      'Parent message ready',
    ]);

    await postRenderA2uiToSlackFrame(page, [
      updateDataModelMessage({status: 'Parent data updated'}),
    ]);
    await expect(preview.getByText('Parent data updated', {exact: true})).toBeVisible();
    await expect(preview.getByText('Parent message ready', {exact: true})).toHaveCount(0);
    await expectBlockKitJsonToContain(page, 'Parent data updated');
    expect(await getBlockKitTextMatches(page, ['Parent data updated'])).toEqual([
      'Parent data updated',
    ]);

    await postRenderA2uiToSlackFrame(page, [
      updateLiteralComponentsMessage('Parent component updated'),
    ]);
    await expect(preview.getByText('Parent component updated', {exact: true})).toBeVisible();
    await expect(preview.getByText('Parent data updated', {exact: true})).toHaveCount(0);
    await expectBlockKitJsonToContain(page, 'Parent component updated');
    expect(await getBlockKitTextMatches(page, ['Parent component updated'])).toEqual([
      'Parent component updated',
    ]);

    await postRenderA2uiToSlackFrame(page, [deleteSurfaceMessage()]);
    await expect(slackPreviewFrame(page).getByText('Your Slack preview starts here')).toBeVisible();
    await expect(preview.getByText('Parent component updated', {exact: true})).toHaveCount(0);
    await expect(blockKitDetails(page)).toHaveCount(0);
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Copy Block Kit'})).toHaveCount(
      0,
    );
    await expect(slackPreviewFrame(page).getByTestId('block-kit-json')).toHaveCount(0);

    await postRenderA2uiToSlackFrame(page, [
      createSurfaceMessage(),
      updateLiteralComponentsMessage('Parent recreated after delete'),
    ]);
    await expect(preview.getByText('Parent recreated after delete', {exact: true})).toBeVisible();
    await expectBlockKitJsonToContain(page, 'Parent recreated after delete');
    expect(await getBlockKitTextMatches(page, ['Parent recreated after delete'])).toEqual([
      'Parent recreated after delete',
    ]);

    expect(unexpectedErrors).toEqual([]);
  });
});

function createSurfaceMessage(): A2uiMessage {
  return {
    version: 'v0.9',
    createSurface: {
      surfaceId: MANUAL_SURFACE_ID,
      catalogId: SLACK_CATALOG_ID,
    },
  };
}

function updateDataModelMessage(value: Record<string, string>): A2uiMessage {
  return {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: MANUAL_SURFACE_ID,
      path: '/',
      value,
    },
  };
}

function updateStatusComponentsMessage(): A2uiMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: MANUAL_SURFACE_ID,
      components: [
        {
          id: 'root',
          component: 'Text',
          text: {
            path: '/status',
          },
        },
      ],
    },
  };
}

function updateLiteralComponentsMessage(text: string): A2uiMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: MANUAL_SURFACE_ID,
      components: [
        {
          id: 'root',
          component: 'Text',
          text,
        },
      ],
    },
  };
}

function deleteSurfaceMessage(): A2uiMessage {
  return {
    version: 'v0.9',
    deleteSurface: {
      surfaceId: MANUAL_SURFACE_ID,
    },
  };
}

async function postRenderA2uiToSlackFrame(page: Page, payload: A2uiMessage[]): Promise<void> {
  await page
    .locator('iframe.preview-iframe')
    .first()
    .evaluate(
      (iframe, message) => {
        const target = (iframe as HTMLIFrameElement).contentWindow;
        if (!target) {
          throw new Error('Slack preview iframe contentWindow was not available.');
        }

        target.postMessage(message, new URL(message.rendererUrl).origin);
      },
      {
        type: PreviewBridgeMessageType.RENDER_A2UI,
        payload,
        rendererUrl: SLACK_RENDERER_URL,
      },
    );
}
