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

import {A2uiMessageListSchema, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {describe, expect, it} from 'vitest';
import matchReportJson from '../public/examples/match-report.json';
import {stubBlobUrls, surfaceMessages} from './drawn-images.helpers';
import {createSlackPreviewSession} from './preview-session';
import {DiagnosticCode, DiagnosticLevel, PreviewStatus} from './preview-snapshot';

const SCORECARD_ALT = 'Scorecard: Argentina 2, Mexico 0. Full time. World Cup, Group C.';
const CHART_ALT = 'Pie chart, Possession: Argentina 70, Mexico 30';

/**
 * A match report that mixes native Slack blocks with drawn images: a header, the
 * scorecard `final-score`, a table of scorers, a possession chart, and a button.
 */
const MATCH_REPORT = A2uiMessageListSchema.parse(matchReportJson);
const REPORT_COMPONENTS = MATCH_REPORT.flatMap(message =>
  'updateComponents' in message ? message.updateComponents.components : [],
);
const {createSurface, updateComponents, updateData} = surfaceMessages('match-report');
const [{id: _id, component: _component, ...FINAL_SCORE}] = REPORT_COMPONENTS.filter(
  ({id}) => id === 'final-score',
);

/** The match report's components, with `scorecard` as the props of its scorecard. */
const matchReport = (scorecard: Record<string, unknown>): A2uiMessage =>
  updateComponents(
    REPORT_COMPONENTS.map(component =>
      component.id === 'final-score'
        ? {id: 'final-score', component: 'Scorecard', ...scorecard}
        : component,
    ),
  );

describe('Slack scorecards', () => {
  const blobUrls = stubBlobUrls();

  it('draws a scorecard as an image between native blocks in a message with a chart', async () => {
    const session = createSlackPreviewSession();

    session.processMessages(MATCH_REPORT);
    const snapshot = session.getSnapshot();

    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.blocks).toEqual([
      expect.objectContaining({type: 'header'}),
      {type: 'image', image_url: 'blob:image-1', alt_text: SCORECARD_ALT},
      expect.objectContaining({type: 'table'}),
      {type: 'image', image_url: 'blob:image-2', alt_text: CHART_ALT},
      expect.objectContaining({type: 'actions'}),
    ]);
    const [scorecard, chart] = await blobUrls.drawnSvgs();
    expect(scorecard).toContain('>Argentina</tspan>');
    expect(scorecard).toContain('>Full time</text>');
    expect(chart).toContain('Argentina · 70 (70%)');
  });

  it('exports both drawn images as uploaded files and keeps the native blocks', () => {
    const session = createSlackPreviewSession();

    session.processMessages(MATCH_REPORT);
    const snapshot = session.getSnapshot();

    expect(snapshot.exportBlocks).toEqual([
      snapshot.blocks[0],
      {type: 'image', slack_file: {id: 'RENDERED_AT_SEND'}, alt_text: SCORECARD_ALT},
      snapshot.blocks[2],
      {type: 'image', slack_file: {id: 'RENDERED_AT_SEND'}, alt_text: CHART_ALT},
      snapshot.blocks[4],
    ]);
  });

  it('says once for each drawn component that the app sending the message must upload it', () => {
    const session = createSlackPreviewSession();

    session.processMessages(MATCH_REPORT);

    expect(
      session
        .getSnapshot()
        .diagnostics.filter(({code}) => code === DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND),
    ).toEqual([
      {
        level: DiagnosticLevel.INFO,
        code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
        componentId: 'final-score',
        message:
          'Scorecard "final-score" is drawn as an image in this preview. The app that sends the message to Slack must render it to a PNG and upload it. The Generated Block Kit export marks it with the placeholder file ID RENDERED_AT_SEND, which that app replaces with the ID of the uploaded file.',
      },
      {
        level: DiagnosticLevel.INFO,
        code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
        componentId: 'possession',
        message:
          'Chart "possession" is drawn as an image in this preview. The app that sends the message to Slack must render it to a PNG and upload it. The Generated Block Kit export marks it with the placeholder file ID RENDERED_AT_SEND, which that app replaces with the ID of the uploaded file.',
      },
    ]);
  });

  it('uses the accessibility label as alt text when the scorecard has one', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      matchReport({...FINAL_SCORE, accessibility: {label: 'Argentina beat Mexico 2-0'}}),
    ]);

    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: 'Argentina beat Mexico 2-0',
    });
  });

  it('redraws a scorecard whose names and scores are bound to the data model', async () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      updateData({
        match: {
          home: {name: 'Argentina', score: 1},
          away: {name: 'Mexico', score: 0},
          status: "72'",
        },
      }),
      matchReport({
        home: {name: {path: '/match/home/name'}, score: {path: '/match/home/score'}},
        away: {name: {path: '/match/away/name'}, score: {path: '/match/away/score'}},
        status: {path: '/match/status'},
      }),
    ]);
    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: "Scorecard: Argentina 1, Mexico 0. 72'.",
    });

    session.processMessages([
      updateData(2, '/match/home/score'),
      updateData('Full time', '/match/status'),
    ]);

    // The chart didn't change, so it kept its image and only the scorecard was drawn again.
    expect((await blobUrls.drawnSvgs()).at(-1)).toContain('>2</text>');
    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: 'Scorecard: Argentina 2, Mexico 0. Full time.',
    });
  });

  it('leaves out a scorecard with an empty team name and renders the rest', async () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      matchReport({...FINAL_SCORE, home: {name: ' ', score: 2}}),
    ]);
    const snapshot = session.getSnapshot();

    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.blocks.map(({type}) => type)).toEqual(['header', 'table', 'image', 'actions']);
    // Only the chart was drawn.
    expect(await blobUrls.drawnSvgs()).toHaveLength(1);
  });

  it('says why it left out a scorecard with an empty team name', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      matchReport({...FINAL_SCORE, home: {name: ' ', score: 2}}),
    ]);

    expect(session.getSnapshot().diagnostics).toContainEqual({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_SCORECARD_INVALID,
      componentId: 'final-score',
      message:
        'Scorecard "final-score" has no name for the home team. Give both teams a name and a score, such as "Argentina" and 2.',
    });
  });

  it('skips a scorecard whose bound score is missing', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      matchReport({...FINAL_SCORE, away: {name: 'Mexico', score: {path: '/missing'}}}),
    ]);

    expect(session.getSnapshot().diagnostics).toContainEqual({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_SCORECARD_INVALID,
      componentId: 'final-score',
      message:
        'Scorecard "final-score" has no score for the away team. Give both teams a name and a score, such as "Argentina" and 2.',
    });
  });
});
