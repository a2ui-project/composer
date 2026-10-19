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
import {
  collectUnexpectedErrors,
  getBlockKitJson,
  getJsonValidationProblems,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  SLACK_CATALOG_ID,
  slackPreviewFrame,
  slackPreviewSurface,
} from './slack-renderer.helpers';
import {waitForMonacoEditor} from './helpers';

const SURFACE_ID = 'match-report';
const SCORECARD_ALT = 'Scorecard: Argentina 2, Mexico 0. Full time. World Cup, Group C.';
const CHART_ALT = 'Pie chart, Possession: Argentina 70, Mexico 30';

/**
 * A match report that mixes native Slack blocks (a header, a table, and a button) with two
 * React components the renderer draws as images: a Scorecard and a Chart.
 */
const MATCH_REPORT: A2uiMessage[] = [
  {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: SLACK_CATALOG_ID}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['title', 'final-score', 'scorers', 'possession', 'share'],
        },
        {id: 'title', component: 'Text', variant: 'h1', text: 'Match report'},
        {
          id: 'final-score',
          component: 'Scorecard',
          home: {name: 'Argentina', score: 2},
          away: {name: 'Mexico', score: 0},
          status: 'Full time',
          competition: 'World Cup, Group C',
        },
        {
          id: 'scorers',
          component: 'Table',
          columns: [{header: 'Scorer'}, {header: 'Minute', align: 'right'}],
          rows: [
            ['Lionel Messi', "64'"],
            ['Enzo Fernández', "87'"],
          ],
        },
        {
          id: 'possession',
          component: 'Chart',
          type: 'pie',
          title: 'Possession',
          data: [
            {label: 'Argentina', value: 70},
            {label: 'Mexico', value: 30},
          ],
        },
        {
          id: 'share',
          component: 'Button',
          child: 'share-label',
          action: {event: {name: 'share_result'}},
        },
        {id: 'share-label', component: 'Text', text: 'Share result'},
      ],
    },
  },
];

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

  test('notes for each drawn image that it is uploaded when the message is sent', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openMatchReport(page);

    await expect(
      slackPreviewFrame(page)
        .getByRole('list', {name: 'Preview diagnostics'})
        .getByRole('listitem')
        .filter({hasText: 'SLACK_IMAGE_RENDERED_AT_SEND'}),
    ).toHaveCount(2);
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
  await replaceMonacoJson(page, JSON.stringify(MATCH_REPORT, null, 2));
  await expect(slackPreviewSurface(page).getByRole('img', {name: SCORECARD_ALT})).toBeVisible();
}
