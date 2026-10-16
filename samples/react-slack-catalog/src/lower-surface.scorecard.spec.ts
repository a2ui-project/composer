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

import {type A2uiMessage, type UpdateComponentsMessage} from '@a2ui/web_core/v0_9';
import {describe, expect, it} from 'vitest';
import {SLACK_CATALOG_ID} from './catalog';
import {createFakeDrawnImageStore} from './fake-drawn-image-store';
import {createSlackPreviewSession} from './preview-session';
import {DiagnosticCode, DiagnosticLevel, PreviewStatus, blocksForExport} from './preview-snapshot';

const SURFACE = 'match-report';
const SCORECARD_ALT = 'Scorecard: Argentina 2, Mexico 0. Full time. World Cup, Group C.';
const CHART_ALT = 'Pie chart, Possession: Argentina 70, Mexico 30';

const createSurface: A2uiMessage = {
  version: 'v0.9',
  createSurface: {surfaceId: SURFACE, catalogId: SLACK_CATALOG_ID},
};

const updateComponents = (
  components: UpdateComponentsMessage['updateComponents']['components'],
): A2uiMessage => ({version: 'v0.9', updateComponents: {surfaceId: SURFACE, components}});

const updateData = (value: unknown, path = '/'): A2uiMessage => ({
  version: 'v0.9',
  updateDataModel: {surfaceId: SURFACE, path, value},
});

const FINAL_SCORE = {
  home: {name: 'Argentina', score: 2},
  away: {name: 'Mexico', score: 0},
  status: 'Full time',
  competition: 'World Cup, Group C',
};

/**
 * A match report that mixes native Slack blocks with drawn images: a header, the
 * scorecard, a table of scorers, a possession chart, and a button.
 */
const matchReport = (scorecard: Record<string, unknown> = FINAL_SCORE): A2uiMessage =>
  updateComponents([
    {
      id: 'root',
      component: 'Column',
      children: ['title', 'final-score', 'scorers', 'possession', 'share'],
    },
    {id: 'title', component: 'Text', variant: 'h1', text: 'Match report'},
    {id: 'final-score', component: 'Scorecard', ...scorecard},
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
  ]);

describe('Slack scorecards', () => {
  it('draws a scorecard as an image between native blocks in a message with a chart', () => {
    const {store, drawn} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

    session.processMessages([createSurface, matchReport()]);
    const snapshot = session.getSnapshot();

    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.blocks).toEqual([
      expect.objectContaining({type: 'header'}),
      {type: 'image', image_url: 'blob:image-1', alt_text: SCORECARD_ALT},
      expect.objectContaining({type: 'table'}),
      {type: 'image', image_url: 'blob:image-2', alt_text: CHART_ALT},
      expect.objectContaining({type: 'actions'}),
    ]);
    expect(drawn[0]).toContain('>Argentina</tspan>');
    expect(drawn[0]).toContain('>Full time</text>');
    expect(drawn[1]).toContain('Argentina · 70 (70%)');
  });

  it('exports both drawn images as uploaded files and keeps the native blocks', () => {
    const {store} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

    session.processMessages([createSurface, matchReport()]);
    const snapshot = session.getSnapshot();

    expect(blocksForExport(snapshot)).toEqual([
      snapshot.blocks[0],
      {type: 'image', slack_file: {id: 'RENDERED_AT_SEND'}, alt_text: SCORECARD_ALT},
      snapshot.blocks[2],
      {type: 'image', slack_file: {id: 'RENDERED_AT_SEND'}, alt_text: CHART_ALT},
      snapshot.blocks[4],
    ]);
  });

  it('says once for each drawn component that your Channels app uploads it at send', () => {
    const {store} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

    session.processMessages([createSurface, matchReport()]);

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
          'Scorecard "final-score" is drawn in this preview. In Slack, your Channels app renders it to a PNG and uploads it when sending. The export marks it with a placeholder file.',
      },
      {
        level: DiagnosticLevel.INFO,
        code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
        componentId: 'possession',
        message:
          'Chart "possession" is drawn in this preview. In Slack, your Channels app renders it to a PNG and uploads it when sending. The export marks it with a placeholder file.',
      },
    ]);
  });

  it('uses the accessibility label as alt text when the scorecard has one', () => {
    const {store} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

    session.processMessages([
      createSurface,
      matchReport({...FINAL_SCORE, accessibility: {label: 'Argentina beat Mexico 2-0'}}),
    ]);

    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: 'Argentina beat Mexico 2-0',
    });
  });

  it('redraws a scorecard whose names and scores are bound to the data model', () => {
    const {store, drawn} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

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

    expect(drawn.filter(svg => svg.includes('class="team-name"')).at(-1)).toContain('>2</text>');
    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: 'Scorecard: Argentina 2, Mexico 0. Full time.',
    });
  });

  it('skips a scorecard with an empty team name and says why, while the rest renders', () => {
    const {store, drawn} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

    session.processMessages([
      createSurface,
      matchReport({...FINAL_SCORE, home: {name: ' ', score: 2}}),
    ]);
    const snapshot = session.getSnapshot();

    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.blocks.map(({type}) => type)).toEqual(['header', 'table', 'image', 'actions']);
    expect(drawn).toHaveLength(1);
    expect(snapshot.diagnostics).toContainEqual({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_SCORECARD_INVALID,
      componentId: 'final-score',
      message:
        'Scorecard "final-score" has no name for the home team. Give both teams a name and a score, such as "Argentina" and 2.',
    });
  });

  it('skips a scorecard whose bound score is missing', () => {
    const {store} = createFakeDrawnImageStore();
    const session = createSlackPreviewSession(undefined, {drawnImages: store});

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
