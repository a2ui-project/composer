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
import {type A2uiMessage, type UpdateComponentsMessage} from '@a2ui/web_core/v0_9';
import {
  blockKitDetails,
  collectUnexpectedErrors,
  expectBlockKitJsonToContain,
  getBlockKitActionIds,
  getJsonValidationProblems,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  SLACK_CATALOG_ID,
  slackPreviewFrame,
  slackPreviewSurface,
} from './slack-renderer.helpers';
import {RENDERER_URLS, waitForMonacoEditor} from './helpers';

test.describe('Slack renderer recovery in Composer', () => {
  test('clears old output while waiting for a missing child', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);

    await replaceMonacoJson(page, textPayload('waiting-recovery', 'Stable baseline'));
    await expect(slackPreviewSurface(page).getByText('Stable baseline')).toBeVisible();

    await replaceMonacoJson(page, missingChildPayload());

    await expect(slackPreviewFrame(page).getByRole('status')).toContainText(
      'Waiting for Slack preview data.',
    );
    await expect(slackPreviewSurface(page).getByText('Stable baseline')).toHaveCount(0);
    await expect(blockKitDetails(page)).toHaveCount(0);
    await expect(previewDiagnostics(page)).toContainText('A2UI_WAITING_FOR_COMPONENT');
    await expect(previewDiagnostics(page)).toContainText('late-copy');
    expect(unexpectedErrors).toEqual([]);
  });

  test('renders the waiting component once its missing child arrives', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);
    await replaceMonacoJson(page, missingChildPayload());
    await expect(slackPreviewFrame(page).getByRole('status')).toContainText(
      'Waiting for Slack preview data.',
    );

    await replaceMonacoJson(page, recoveredChildPayload());

    await expect(
      slackPreviewFrame(page).getByRole('button', {name: 'Late child arrived'}),
    ).toBeVisible();
    await expect(previewDiagnostics(page)).toHaveCount(0);
    expect(await getBlockKitActionIds(page)).toHaveLength(1);
    await expectMonacoClean(page);
    expect(unexpectedErrors).toEqual([]);
  });

  test('clears old output when a component is unsupported', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);

    await replaceMonacoJson(page, buttonPayload('unsupported-recovery', 'Old action', 'old_event'));
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Old action'})).toBeVisible();

    await replaceMonacoJson(page, unsupportedComponentPayload());

    await expect(slackPreviewFrame(page).getByRole('alert')).toContainText(
      'Slack preview could not render.',
    );
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Old action'})).toHaveCount(0);
    await expect(blockKitDetails(page)).toHaveCount(0);
    await expect(previewDiagnostics(page)).toContainText('A2UI_UNSUPPORTED_COMPONENT');
    await expect(previewDiagnostics(page)).toContainText('root');
    expect(unexpectedErrors).toEqual([]);
  });

  test('recovers from an unsupported component when it is replaced', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);
    await replaceMonacoJson(page, unsupportedComponentPayload());
    await expect(slackPreviewFrame(page).getByRole('alert')).toContainText(
      'Slack preview could not render.',
    );

    await replaceMonacoJson(page, textPayload('unsupported-recovery', 'Recovered replacement'));

    await expect(slackPreviewSurface(page).getByText('Recovered replacement')).toBeVisible();
    await expect(previewDiagnostics(page)).toHaveCount(0);
    await expectBlockKitJsonToContain(page, 'Recovered replacement');
    await expectMonacoClean(page);
    expect(unexpectedErrors).toEqual([]);
  });

  test('shows the empty preview when the surface is deleted', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);

    await replaceMonacoJson(page, textPayload('delete-recreate', 'Delete me'));
    await expect(slackPreviewSurface(page).getByText('Delete me')).toBeVisible();

    await replaceMonacoJson(page, deleteSurfacePayload('delete-recreate'));

    await expect(slackPreviewFrame(page).getByRole('status')).toContainText(
      'Your Slack preview starts here',
    );
    await expect(slackPreviewSurface(page).getByText('Delete me')).toHaveCount(0);
    await expect(blockKitDetails(page)).toHaveCount(0);
    expect(unexpectedErrors).toEqual([]);
  });

  test('renders a surface recreated after it was deleted', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);
    await replaceMonacoJson(page, textPayload('delete-recreate', 'Delete me'));
    await expect(slackPreviewSurface(page).getByText('Delete me')).toBeVisible();
    await replaceMonacoJson(page, deleteSurfacePayload('delete-recreate'));
    await expect(slackPreviewFrame(page).getByRole('status')).toContainText(
      'Your Slack preview starts here',
    );

    await replaceMonacoJson(page, textPayload('delete-recreate', 'Recreated surface'));

    await expect(slackPreviewSurface(page).getByText('Recreated surface')).toBeVisible();
    expect(unexpectedErrors).toEqual([]);
  });

  test('renders Slack content after switching to another renderer and back', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);
    await replaceMonacoJson(page, textPayload('switch-away', 'Before switching away'));
    await expect(slackPreviewSurface(page).getByText('Before switching away')).toBeVisible();

    await allowRendererOrigin(page, RENDERER_URLS.react);
    await page.goto(`/?renderer=${RENDERER_URLS.react}`);
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Search Cars'})).toBeVisible();

    await page.goto(`/?renderer=${RENDERER_URLS.slack}`);
    await waitForMonacoEditor(page);
    await replaceMonacoJson(page, textPayload('switch-back', 'Back on Slack'));

    await expect(slackPreviewSurface(page).getByText('Back on Slack')).toBeVisible();
    await expect(previewDiagnostics(page)).toHaveCount(0);
    await expectMonacoClean(page);
    expect(unexpectedErrors).toEqual([]);
  });

  test('keeps stale action IDs inert after a replacement revision', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackEditor(page);

    await replaceMonacoJson(
      page,
      buttonPayload('stale-actions', 'Acknowledge initial', 'acknowledge_initial', 'example-42'),
    );
    await expect(
      slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge initial'}),
    ).toBeVisible();
    const staleActionId = (await getBlockKitActionIds(page))[0];

    await replaceMonacoJson(
      page,
      buttonPayload('stale-actions', 'Acknowledge updated', 'acknowledge_updated', 'example-99'),
    );
    await expect(
      slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge updated'}),
    ).toBeVisible();
    await expect(
      slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge initial'}),
    ).toHaveCount(0);
    const currentActionId = (await getBlockKitActionIds(page))[0];

    expect(staleActionId).toBeTruthy();
    expect(currentActionId).toBeTruthy();
    expect(currentActionId).not.toBe(staleActionId);

    const eventsTab = page.locator('.dv-tab', {hasText: /^Events/});
    await expect(eventsTab).toBeVisible();
    await expect(eventsTab).not.toContainText('(1)');

    const updatedButton = slackPreviewFrame(page).getByRole('button', {
      name: 'Acknowledge updated',
    });
    await clickSlackButtonAsAction(updatedButton, staleActionId);
    await expect(eventsTab).not.toContainText('(1)');

    await clickSlackButtonAsAction(updatedButton, currentActionId);
    await expect(eventsTab).toContainText('(1)');

    await eventsTab.click();
    const eventRow = page.locator('.events-container table tr.element-row').first();
    await expect(eventRow.locator('td.mat-column-component')).toHaveText('acknowledge-button');
    await expect(eventRow.locator('td.mat-column-context pre')).toContainText(
      '"recordId": "example-99"',
    );

    await expectMonacoClean(page);
    expect(unexpectedErrors).toEqual([]);
  });
});

/** Opens Composer on the Slack renderer with the JSON editor ready. */
async function openSlackEditor(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page);
  await waitForMonacoEditor(page);
}

function textPayload(surfaceId: string, text: string): string {
  return formatMessages([
    createSurface(surfaceId),
    updateComponents(surfaceId, [
      {
        id: 'root',
        component: 'Text',
        text,
      },
    ]),
  ]);
}

function deleteSurfacePayload(surfaceId: string): string {
  return formatMessages([
    {
      version: 'v0.9',
      deleteSurface: {
        surfaceId,
      },
    },
  ]);
}

function missingChildPayload(): string {
  return formatMessages([
    createSurface('waiting-recovery'),
    updateComponents('waiting-recovery', [
      {
        id: 'root',
        component: 'Button',
        child: 'late-copy',
        action: {
          event: {
            name: 'late_child_acknowledged',
          },
        },
      },
    ]),
  ]);
}

function recoveredChildPayload(): string {
  return formatMessages([
    createSurface('waiting-recovery'),
    updateComponents('waiting-recovery', [
      {
        id: 'root',
        component: 'Button',
        child: 'late-copy',
        action: {
          event: {
            name: 'late_child_acknowledged',
          },
        },
      },
      {
        id: 'late-copy',
        component: 'Text',
        text: 'Late child arrived',
      },
    ]),
  ]);
}

function unsupportedComponentPayload(): string {
  return formatMessages([
    createSurface('unsupported-recovery'),
    updateComponents('unsupported-recovery', [
      {
        id: 'root',
        component: 'UnsupportedThing',
      },
    ]),
  ]);
}

function buttonPayload(
  surfaceId: string,
  label: string,
  eventName: string,
  recordId = 'example-42',
): string {
  return formatMessages([
    createSurface(surfaceId),
    {
      version: 'v0.9',
      updateDataModel: {
        surfaceId,
        path: '/',
        value: {
          record: {
            id: recordId,
          },
        },
      },
    },
    updateComponents(surfaceId, [
      {
        id: 'root',
        component: 'Column',
        children: ['acknowledge-button'],
      },
      {
        id: 'acknowledge-button',
        component: 'Button',
        child: 'button-label',
        action: {
          event: {
            name: eventName,
            context: {
              recordId: {
                path: '/record/id',
              },
            },
          },
        },
      },
      {
        id: 'button-label',
        component: 'Text',
        text: label,
      },
    ]),
  ]);
}

function createSurface(surfaceId: string): A2uiMessage {
  return {
    version: 'v0.9',
    createSurface: {
      surfaceId,
      catalogId: SLACK_CATALOG_ID,
    },
  };
}

function updateComponents(
  surfaceId: string,
  components: UpdateComponentsMessage['updateComponents']['components'],
): A2uiMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId,
      components,
    },
  };
}

function formatMessages(messages: A2uiMessage[]): string {
  return JSON.stringify(messages, null, 2);
}

function previewDiagnostics(page: Page) {
  return slackPreviewFrame(page).getByRole('list', {name: 'Preview diagnostics'});
}

/**
 * Clicks a preview button as if it carried `actionId`. A stale action ID can't be
 * reached through the UI, because the button that carried it was replaced along with
 * its render. Relabeling the current button stands in for a click on an old button
 * that arrives after the preview re-rendered, which is the case the preview must
 * ignore.
 */
async function clickSlackButtonAsAction(
  button: ReturnType<ReturnType<typeof slackPreviewFrame>['getByRole']>,
  actionId: string,
): Promise<void> {
  await button.evaluate((element, nextActionId) => {
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error('Expected Slack action target to be an HTML button.');
    }
    element.id = nextActionId;
    element.click();
  }, actionId);
}

async function allowRendererOrigin(page: Page, rendererUrl: string): Promise<void> {
  await page.evaluate(
    ({slackRendererUrl, nextRendererUrl}) => {
      localStorage.setItem(
        'a2ui_composer_allowed_origins',
        JSON.stringify([new URL(slackRendererUrl).origin, new URL(nextRendererUrl).origin]),
      );
    },
    {
      slackRendererUrl: RENDERER_URLS.slack,
      nextRendererUrl: rendererUrl,
    },
  );
}

async function expectMonacoClean(page: Page): Promise<void> {
  expect(await getJsonValidationProblems(page)).toEqual([]);
}
