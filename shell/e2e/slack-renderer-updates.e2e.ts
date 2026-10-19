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
import {
  collectUnexpectedErrors,
  DATA_BOUND_ACTION_JSON,
  expectBlockKitJsonToContain,
  getBlockKitTextMatches,
  getJsonValidationProblems,
  MARKET_SNAPSHOT_JSON,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  slackPreviewFrame,
  slackPreviewSurface,
} from './slack-renderer.helpers';
import {waitForMonacoEditor} from './helpers';

test.describe('Slack renderer update flows in Composer', () => {
  test('updates literal Monaco edits in the preview and exported Block Kit JSON', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);

    await openComposerWithSlackRenderer(page);
    await waitForMonacoEditor(page);

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

    expect(await getJsonValidationProblems(page)).toEqual([]);
    expect(unexpectedErrors).toEqual([]);
  });

  test('updates bound data Monaco edits in the preview and exported Block Kit JSON', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);

    await openComposerWithSlackRenderer(page);
    await waitForMonacoEditor(page);

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

    expect(await getJsonValidationProblems(page)).toEqual([]);
    expect(unexpectedErrors).toEqual([]);
  });
});
