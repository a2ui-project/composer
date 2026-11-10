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
import {
  collectUnexpectedErrors,
  getBlockKitJson,
  getJsonValidationProblems,
  MATCH_REPORT_JSON,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  slackPreviewFrame,
  slackPreviewSurface,
} from './slack-renderer.helpers';
import {waitForMonacoEditor} from './helpers';

const SCORECARD_ALT = 'Scorecard: Argentina 2, Mexico 0. Full time. World Cup, Group C.';
const CHART_ALT = 'Pie chart, Possession: Argentina 70, Mexico 30';

test.describe('Slack renderer drawn images in Composer', () => {
  test('shows a scorecard and a chart as images among native blocks, in message order', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openMatchReport(page);

    const preview = slackPreviewSurface(page);
    const scorecard = preview.getByRole('img', {name: SCORECARD_ALT});
    const chart = preview.getByRole('img', {name: CHART_ALT});
    const inMessageOrder = [
      preview.getByText('Match report', {exact: true}),
      scorecard,
      preview.getByRole('table'),
      chart,
      slackPreviewFrame(page).getByRole('button', {name: 'Share result'}),
    ];
    for (const element of inMessageOrder) {
      await expect(element).toBeVisible();
    }
    await expect(scorecard).toHaveAttribute('src', /^blob:/);
    await expect(chart).toHaveAttribute('src', /^blob:/);
    const boxes = await Promise.all(inMessageOrder.map(element => element.boundingBox()));
    expect(boxes.every(box => box !== null)).toBe(true);
    for (let index = 1; index < boxes.length; index++) {
      expect(boxes[index]!.y, `element ${index} starts below element ${index - 1}`).toBeGreaterThan(
        boxes[index - 1]!.y,
      );
    }

    expect(await getJsonValidationProblems(page)).toEqual([]);
    expect(unexpectedErrors).toEqual([]);
  });

  test('notes once that the drawn images are uploaded when the message is sent', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openMatchReport(page);

    const notes = slackPreviewFrame(page)
      .getByRole('list', {name: 'Preview diagnostics'})
      .getByRole('listitem')
      .filter({hasText: 'SLACK_IMAGE_RENDERED_AT_SEND'});
    await expect(notes).toHaveCount(1);
    await expect(notes).toContainText(
      'Scorecard "final-score" and Chart "possession" are drawn as images',
    );
    expect(unexpectedErrors).toEqual([]);
  });

  test('exports the scorecard and the chart as uploaded files between native blocks', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openMatchReport(page);

    const blockKit = await getBlockKitJson(page);
    expect(blockKit).toMatchObject({
      blocks: [
        {type: 'header'},
        {type: 'image', slack_file: {id: 'RENDERED_AT_SEND'}, alt_text: SCORECARD_ALT},
        {type: 'table'},
        {type: 'image', slack_file: {id: 'RENDERED_AT_SEND'}, alt_text: CHART_ALT},
        {type: 'actions'},
      ],
    });
    expect(JSON.stringify(blockKit)).not.toContain('blob:');
    expect(unexpectedErrors).toEqual([]);
  });
});

/** Opens Composer on the Slack renderer and pastes the match report into the editor. */
async function openMatchReport(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page);
  await waitForMonacoEditor(page);
  await replaceMonacoJson(page, MATCH_REPORT_JSON);
  await expect(slackPreviewSurface(page).getByRole('img', {name: SCORECARD_ALT})).toBeVisible();
}
