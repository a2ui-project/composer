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
import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vitest';
import {SLACK_CATALOG_ID} from './catalog';
import {createSlackPreviewSession} from './preview-session';
import {DiagnosticCode, DiagnosticLevel, PreviewStatus} from './preview-snapshot';

const SURFACE = 'charts';

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

const chartMessage = (chart: Record<string, unknown>): A2uiMessage =>
  updateComponents([
    {id: 'root', component: 'Column', children: ['title', 'possession']},
    {id: 'title', component: 'Text', variant: 'h1', text: 'Match stats'},
    {id: 'possession', component: 'Chart', ...chart},
  ]);

const PIE = {
  type: 'pie',
  title: 'Possession',
  data: [
    {label: 'Argentina', value: 70},
    {label: 'Mexico', value: 30},
  ],
};

describe('Slack charts', () => {
  let createObjectURL: MockInstance<typeof URL.createObjectURL>;
  let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

  beforeEach(() => {
    let created = 0;
    createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:image-${++created}`);
    revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** The SVG markup of each image drawn so far, in the order it was drawn. */
  const drawnSvgs = (): Promise<string[]> =>
    Promise.all(createObjectURL.mock.calls.map(([blob]) => (blob as Blob).text()));

  it('draws a chart as an image next to native blocks and exports it as an uploaded file', async () => {
    const session = createSlackPreviewSession();

    session.processMessages([createSurface, chartMessage(PIE)]);
    const snapshot = session.getSnapshot();

    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.blocks).toEqual([
      expect.objectContaining({type: 'header'}),
      {
        type: 'image',
        image_url: 'blob:image-1',
        alt_text: 'Pie chart, Possession: Argentina 70, Mexico 30',
      },
    ]);
    expect((await drawnSvgs())[0]).toContain('Argentina · 70 (70%)');
    expect(snapshot.exportBlocks).toEqual([
      snapshot.blocks[0],
      {
        type: 'image',
        slack_file: {id: 'RENDERED_AT_SEND'},
        alt_text: 'Pie chart, Possession: Argentina 70, Mexico 30',
      },
    ]);
    expect(snapshot.diagnostics).toContainEqual({
      level: DiagnosticLevel.INFO,
      code: DiagnosticCode.SLACK_IMAGE_RENDERED_AT_SEND,
      componentId: 'possession',
      message:
        'Chart "possession" is drawn in this preview. In Slack, your Channels app renders it to a PNG and uploads it when sending. The export marks it with a placeholder file.',
    });
  });

  it('reports a chart in document order, before the components after it', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      updateComponents([
        {id: 'root', component: 'Column', children: ['possession', 'note']},
        {id: 'possession', component: 'Chart', ...PIE},
        {id: 'note', component: 'Card', child: 'note-text'},
        {id: 'note-text', component: 'Text', text: 'Illustrative numbers'},
      ]),
    ]);

    expect(session.getSnapshot().diagnostics.map(({componentId}) => componentId)).toEqual([
      'possession',
      'note',
    ]);
  });

  it('uses the accessibility label as alt text when the chart has one', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      chartMessage({...PIE, accessibility: {label: 'Argentina had most of the ball'}}),
    ]);

    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: 'Argentina had most of the ball',
    });
  });

  it('redraws a chart whose values are bound to the data model', async () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      updateData({argentina: 70, mexico: 30}),
      chartMessage({
        ...PIE,
        data: [
          {label: 'Argentina', value: {path: '/argentina'}},
          {label: 'Mexico', value: {path: '/mexico'}},
        ],
      }),
    ]);
    session.processMessages([updateData(60, '/argentina')]);

    expect((await drawnSvgs()).at(-1)).toContain('Argentina · 60 (67%)');
    expect(session.getSnapshot().blocks[1]).toMatchObject({
      alt_text: 'Pie chart, Possession: Argentina 60, Mexico 30',
    });
  });

  it('skips a pie chart with a negative slice and says why, while the rest renders', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      chartMessage({
        ...PIE,
        data: [
          {label: 'Argentina', value: 70},
          {label: 'Mexico', value: -30},
        ],
      }),
    ]);
    const snapshot = session.getSnapshot();

    expect(snapshot.status).toBe(PreviewStatus.READY);
    expect(snapshot.blocks).toEqual([expect.objectContaining({type: 'header'})]);
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(snapshot.diagnostics).toContainEqual({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_CHART_INVALID_DATA,
      componentId: 'possession',
      message:
        'Chart "possession" has a negative value for "Mexico". Pie and donut slices must be zero or more.',
    });
  });

  it('skips a chart whose bound value is not a number', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      chartMessage({...PIE, data: [{label: 'Argentina', value: {path: '/missing'}}]}),
    ]);

    expect(session.getSnapshot().diagnostics).toContainEqual({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_CHART_INVALID_DATA,
      componentId: 'possession',
      message: `Chart "possession" has a value for "Argentina" that isn't a number. Use a number such as 70.`,
    });
  });

  it('skips a chart that has only zero values', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      chartMessage({type: 'verticalBar', data: [{label: 'Q1', value: 0}]}),
    ]);

    expect(session.getSnapshot().diagnostics).toContainEqual({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_CHART_EMPTY,
      componentId: 'possession',
      message: `Chart "possession" has only zero values, so there is nothing to draw. Give at least one value that isn't zero.`,
    });
  });

  it('rejects more than 20 points through the catalog schema', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface,
      chartMessage({
        data: Array.from({length: 21}, (_, index) => ({label: `P${index}`, value: index})),
      }),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: PreviewStatus.ERROR,
      diagnostics: [expect.objectContaining({code: DiagnosticCode.A2UI_INVALID_PROPS})],
    });
  });

  it('revokes the URL of a chart image after two renders in a row leave it out', () => {
    const session = createSlackPreviewSession();
    session.processMessages([createSurface, chartMessage(PIE)]);

    session.processMessages([
      updateComponents([{id: 'root', component: 'Text', text: 'No chart now'}]),
    ]);
    // The render before still showed the chart, which React may not have replaced yet.
    expect(revokeObjectURL).not.toHaveBeenCalled();
    session.processMessages([
      updateComponents([{id: 'root', component: 'Text', text: 'Still no chart'}]),
    ]);

    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:image-1');
  });

  it('revokes the URL of every chart image it still shows when disposed', () => {
    const session = createSlackPreviewSession();
    session.processMessages([createSurface, chartMessage(PIE)]);

    session.dispose();

    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:image-1');
  });

  it('freezes the export blocks it publishes', () => {
    const session = createSlackPreviewSession();

    session.processMessages([createSurface, chartMessage(PIE)]);
    const exportBlocks = session.getSnapshot().exportBlocks;

    expect(Object.isFrozen(exportBlocks)).toBe(true);
    expect(Object.isFrozen(exportBlocks[1])).toBe(true);
  });
});
