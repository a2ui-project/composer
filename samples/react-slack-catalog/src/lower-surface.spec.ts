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

import {
  type A2uiClientAction,
  type A2uiMessage,
  type UpdateComponentsMessage,
} from '@a2ui/web_core/v0_9';
import {SLACK_LIMITS, markdownToMrkdwn} from '@copilotkit/channels-slack/render';
import Ajv2020, {type ValidateFunction} from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Message, type Block} from 'slack-blocks-to-jsx';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {SLACK_CATALOG_ID} from './catalog';
import {
  DATA_BOUND_ACTION_MESSAGES,
  EXAMPLE_INITIAL_DATA,
  MARKET_SNAPSHOT_MESSAGES,
  SLACK_COMPONENT_USAGES,
} from './examples';
import {createSlackPreviewSession, type PreviewSession} from './lower-surface';

const createSurface = (surfaceId = 'test-surface'): A2uiMessage => ({
  version: 'v0.9',
  createSurface: {
    surfaceId,
    catalogId: SLACK_CATALOG_ID,
  },
});

const updateData = (surfaceId: string, value: unknown, path = '/'): A2uiMessage => ({
  version: 'v0.9',
  updateDataModel: {
    surfaceId,
    path,
    value,
  },
});

const updateComponents = (
  surfaceId: string,
  components: UpdateComponentsMessage['updateComponents']['components'],
): A2uiMessage => ({
  version: 'v0.9',
  updateComponents: {
    surfaceId,
    components,
  },
});

const sectionText = (block: unknown): string | undefined =>
  typeof block === 'object' &&
  block !== null &&
  'type' in block &&
  block.type === 'section' &&
  'text' in block &&
  typeof block.text === 'object' &&
  block.text !== null &&
  'text' in block.text &&
  typeof block.text.text === 'string'
    ? block.text.text
    : undefined;

const actionIds = (session: PreviewSession): string[] =>
  session
    .getSnapshot()
    .blocks.flatMap(block =>
      'elements' in block && Array.isArray(block.elements)
        ? block.elements.map(element =>
            typeof element === 'object' &&
            element !== null &&
            'action_id' in element &&
            typeof element.action_id === 'string'
              ? element.action_id
              : undefined,
          )
        : [],
    )
    .filter((id): id is string => typeof id === 'string');

const blockRecord = (block: unknown): Record<string, unknown> =>
  typeof block === 'object' && block !== null ? (block as Record<string, unknown>) : {};

const blockText = (block: unknown): string | undefined => {
  const text = blockRecord(block).text;
  return typeof text === 'object' &&
    text !== null &&
    'text' in text &&
    typeof text.text === 'string'
    ? text.text
    : undefined;
};

const buttonText = (session: PreviewSession, index = 0): string | undefined => {
  const button = session
    .getSnapshot()
    .blocks.flatMap(block => {
      const elements = blockRecord(block).elements;
      return Array.isArray(elements) ? elements : [];
    })
    .filter(element => blockRecord(element).type === 'button')
    .at(index);
  return blockText(button);
};

const contextText = (session: PreviewSession): string | undefined => {
  const contextBlock = session
    .getSnapshot()
    .blocks.find(block => blockRecord(block).type === 'context');
  const elements = blockRecord(contextBlock).elements;
  if (!Array.isArray(elements)) {
    return undefined;
  }
  const text = blockRecord(elements[0]).text;
  return typeof text === 'string' ? text : blockText(elements[0]);
};

const imageBlockField = (session: PreviewSession, field: 'alt_text' | 'image_url'): string => {
  const imageBlock = session
    .getSnapshot()
    .blocks.find(block => blockRecord(block).type === 'image');
  const value = blockRecord(imageBlock)[field];
  return typeof value === 'string' ? value : '';
};

const slackImageUrlUriValidator = (): ValidateFunction<string> => {
  const ajv = new Ajv2020({strict: false});
  addFormats(ajv);
  return ajv.compile({
    type: 'string',
    format: 'uri',
    maxLength: SLACK_LIMITS.sectionText,
  });
};

const validateSlackImageUri = slackImageUrlUriValidator();

const expectValidGeneratedSlackImageUrl = (session: PreviewSession): void => {
  const imageUrl = imageBlockField(session, 'image_url');
  expect(validateSlackImageUri(imageUrl), JSON.stringify(validateSlackImageUri.errors)).toBe(true);
};

const tableCellText = (session: PreviewSession): string | undefined => {
  const table = session.getSnapshot().blocks.find(block => blockRecord(block).type === 'table');
  const rows = blockRecord(table).rows;
  if (!Array.isArray(rows)) {
    return undefined;
  }
  const firstDataRow = rows.at(1);
  if (!Array.isArray(firstDataRow)) {
    return undefined;
  }
  return blockRecord(firstDataRow[0]).text as string | undefined;
};

const textContent = (html: string): string => {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent ?? '';
};

const diagnosticCodes = (session: PreviewSession): string[] =>
  session.getSnapshot().diagnostics.map(({code}) => code);

const fixedLengthImageUrl = (length: number): string => {
  const prefix = 'https://example.com/';
  return `${prefix}${'a'.repeat(length - prefix.length)}`;
};

const buttonComponents = (
  count: number,
): UpdateComponentsMessage['updateComponents']['components'] => [
  {
    id: 'root',
    component: 'Column',
    children: Array.from({length: count}, (_, index) => `button-${index}`),
  },
  ...Array.from({length: count}, (_, index) => [
    {
      id: `button-${index}`,
      component: 'Button',
      child: `label-${index}`,
      action: {
        event: {
          name: `button_${index}`,
        },
      },
    },
    {
      id: `label-${index}`,
      component: 'Text',
      text: `Button ${index}`,
    },
  ]).flat(),
];

describe('createSlackPreviewSession', () => {
  let actions: A2uiClientAction[];
  let session: PreviewSession;

  beforeEach(() => {
    actions = [];
    session = createSlackPreviewSession(action => {
      actions.push(action);
    });
  });

  describe('native tables', () => {
    const columns = [{header: 'Team A'}, {header: 'Score', align: 'center'}, {header: 'Team B'}];
    const rows = [
      ['Argentina', '3–3 (4–2 pens)', 'France'],
      ['Croatia', '2–1', 'Morocco'],
    ];

    it('keeps score cells in three aligned columns in preview and export', () => {
      session.processMessages([
        createSurface(),
        updateComponents('test-surface', [{id: 'root', component: 'Table', columns, rows}]),
      ]);
      expect(session.getSnapshot().status).toBe('ready');
      expect(session.getSnapshot().blocks).toEqual([
        {
          type: 'table',
          column_settings: [{align: 'left'}, {align: 'center'}, {align: 'left'}],
          rows: [
            columns.map(({header}) => ({type: 'raw_text', text: header})),
            ...rows.map(row => row.map(text => ({type: 'raw_text', text}))),
          ],
        },
      ]);
      expect(diagnosticCodes(session)).not.toContain('SLACK_LAYOUT_FLATTENED');
      const html = renderToStaticMarkup(
        createElement(Message, {
          blocks: session.getSnapshot().blocks as Block[],
          logo: '',
          name: 'A2UI Preview',
          theme: 'light',
        }),
      );
      const preview = document.createElement('div');
      preview.innerHTML = html;
      expect(preview.querySelectorAll('table')).toHaveLength(1);
      expect(preview.querySelectorAll('tr')).toHaveLength(3);
      expect(preview.querySelectorAll('tr')[1].textContent).toContain('Argentina');
      expect(preview.querySelectorAll('tr')[1].querySelectorAll('td')).toHaveLength(3);
    });

    it('resolves bound cells and headers again after data changes', () => {
      session.processMessages([
        createSurface(),
        updateData('test-surface', {heading: 'Team', team: 'Argentina'}),
        updateComponents('test-surface', [
          {
            id: 'root',
            component: 'Table',
            columns: [{header: {path: '/heading'}}],
            rows: [[{path: '/team'}]],
          },
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('ready');
      expect(tableCellText(session)).toBe('Argentina');
      session.processMessages([updateData('test-surface', {heading: 'Winner', team: 'France'})]);
      expect(tableCellText(session)).toBe('France');
      expect(JSON.stringify(session.getSnapshot().blocks)).toContain('Winner');
      expect(JSON.stringify(session.getSnapshot().blocks)).not.toContain('Argentina');
    });

    it('rejects unequal row widths and recovers on a corrected update', () => {
      session.processMessages([
        createSurface(),
        updateComponents('test-surface', [
          {id: 'root', component: 'Table', columns, rows: [['Argentina', '3–3']]},
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('error');
      expect(session.getSnapshot().blocks).toEqual([]);
      expect(diagnosticCodes(session)).toContain('A2UI_INVALID_TABLE_ROW');
      session.processMessages([
        updateComponents('test-surface', [{id: 'root', component: 'Table', columns, rows}]),
      ]);
      expect(session.getSnapshot().status).toBe('ready');
    });

    it('does not stringify an object-valued data binding into a table cell', () => {
      session.processMessages([
        createSurface(),
        updateData('test-surface', {team: {name: 'Argentina'}}),
        updateComponents('test-surface', [
          {id: 'root', component: 'Table', columns: [{header: 'Team'}], rows: [[{path: '/team'}]]},
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('error');
      expect(session.getSnapshot().blocks).toEqual([]);
    });

    it('reserves room for the header in the 100-row Slack limit', () => {
      const makeRows = (count: number) => Array.from({length: count}, (_, i) => [`Team ${i}`]);
      session.processMessages([
        createSurface(),
        updateComponents('test-surface', [
          {id: 'root', component: 'Table', columns: [{header: 'Team'}], rows: makeRows(99)},
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('ready');
      expect(blockRecord(session.getSnapshot().blocks[0]).rows).toHaveLength(100);
      session.processMessages([
        updateComponents('test-surface', [
          {id: 'root', component: 'Table', columns: [{header: 'Team'}], rows: makeRows(100)},
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('error');
      expect(diagnosticCodes(session)).toContain('A2UI_INVALID_PROPS');
    });

    it('enforces the aggregate text limit across multiple tables', () => {
      const largeRows = Array.from({length: 3}, () => ['x'.repeat(1800)]);
      session.processMessages([
        createSurface(),
        updateComponents('test-surface', [
          {id: 'root', component: 'Column', children: ['one', 'two']},
          {id: 'one', component: 'Table', columns: [{header: 'Team'}], rows: largeRows},
          {id: 'two', component: 'Table', columns: [{header: 'Team'}], rows: largeRows},
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('error');
      expect(session.getSnapshot().blocks).toEqual([]);
      expect(diagnosticCodes(session)).toContain('SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT_EXCEEDED');
    });
  });

  it('lowers bound text and refreshes it after data changes', () => {
    session.processMessages([
      createSurface(),
      updateData('test-surface', {message: 'Ready for review'}),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: {path: '/message'},
          variant: 'body',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      surfaceId: 'test-surface',
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Ready for review');

    session.processMessages([updateData('test-surface', {message: 'Approved'})]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 2,
      surfaceId: 'test-surface',
      status: 'ready',
    });
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Approved');
  });

  it('allocates revision-local button actions and dispatches resolved event context', async () => {
    session.processMessages(DATA_BOUND_ACTION_MESSAGES);

    const firstActionId = actionIds(session)[0];

    expect(firstActionId).toBe('a2ui-1-1');
    expect(session.getSnapshot().blocks).toContainEqual(
      expect.objectContaining({
        type: 'actions',
        elements: [
          expect.objectContaining({
            type: 'button',
            action_id: 'a2ui-1-1',
            text: {type: 'plain_text', text: 'Acknowledge'},
            style: 'primary',
          }),
        ],
      }),
    );

    await session.dispatch(firstActionId);

    expect(actions).toEqual([
      expect.objectContaining({
        name: 'acknowledge',
        sourceComponentId: 'acknowledge-button',
        surfaceId: 'data-bound-action',
        context: {
          recordId: EXAMPLE_INITIAL_DATA.record.id,
        },
      }),
    ]);

    session.processMessages([
      updateData('data-bound-action', {
        greeting: 'Updated',
        record: {
          id: 'example-99',
        },
      }),
    ]);

    expect(actionIds(session)[0]).toBe('a2ui-2-1');
    await session.dispatch(firstActionId);
    expect(actions).toHaveLength(1);
  });

  it('evaluates function actions locally without emitting client actions', async () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            functionCall: {
              call: 'add',
              args: {
                a: 1,
                b: 2,
              },
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Compute',
        },
      ]),
    ]);

    await expect(session.dispatch('a2ui-1-1')).resolves.toBeUndefined();
    expect(actions).toEqual([]);
  });

  it('lowers MarketSnapshot into sourced Slack table output and an acknowledge action', async () => {
    session.processMessages(MARKET_SNAPSHOT_MESSAGES);
    const searchedAtText = 'Searched 2026-08-28T12:00:00Z';

    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      surfaceId: 'market-snapshot',
      status: 'ready',
      diagnostics: [],
    });
    expect(session.getSnapshot().blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'header',
          text: {type: 'plain_text', text: 'Illustrative historical energy market snapshot'},
        }),
        expect.objectContaining({
          type: 'table',
        }),
        expect.objectContaining({
          type: 'actions',
          elements: [
            expect.objectContaining({
              type: 'button',
              action_id: 'a2ui-1-1',
              text: {type: 'plain_text', text: 'Acknowledge'},
              style: 'primary',
            }),
          ],
        }),
      ]),
    );
    expect(session.getSnapshot().blocks).toContainEqual(
      expect.objectContaining({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: searchedAtText,
            verbatim: true,
          },
        ],
      }),
    );
    expect(
      textContent(
        renderToStaticMarkup(
          createElement(Message, {
            blocks: session.getSnapshot().blocks as Block[],
            logo: '',
            name: 'Storybook App',
            theme: 'light',
          }),
        ),
      ),
    ).toContain(searchedAtText);

    await session.dispatch('a2ui-1-1');
    expect(actions).toEqual([
      expect.objectContaining({
        name: 'acknowledge_search_result',
        sourceComponentId: 'root',
        surfaceId: 'market-snapshot',
      }),
    ]);
  });

  it('diagnoses Gallery-wrapped MarketSnapshot layout flattening on the wrapper only', () => {
    const [marketSnapshot] = SLACK_COMPONENT_USAGES.MarketSnapshot.usage;

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          align: 'center',
          justify: 'center',
          children: ['target'],
        },
        {
          ...marketSnapshot,
          id: 'target',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [
        expect.objectContaining({
          level: 'warning',
          code: 'SLACK_LAYOUT_FLATTENED',
          componentId: 'root',
        }),
      ],
    });
    expect(diagnosticCodes(session)).toHaveLength(1);
  });

  it('bounds Slack text budgets using published limits and diagnoses truncation', () => {
    const longHeader = 'H'.repeat(SLACK_LIMITS.headerText + 1);
    const longSection = 'S'.repeat(SLACK_LIMITS.sectionText + 1);
    const longButton = 'B'.repeat(SLACK_LIMITS.buttonText + 1);
    const longCell = 'C'.repeat(SLACK_LIMITS.cellText + 1);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: ['header', 'section', 'button', 'snapshot'],
        },
        {
          id: 'header',
          component: 'Text',
          text: longHeader,
          variant: 'h1',
        },
        {
          id: 'section',
          component: 'Text',
          text: longSection,
        },
        {
          id: 'button',
          component: 'Button',
          child: 'button-label',
          action: {
            event: {
              name: 'long_button',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: longButton,
        },
        {
          id: 'snapshot',
          component: 'MarketSnapshot',
          headline: 'Budgeted table',
          summary: 'Rendered with bounded cells.',
          markets: [
            {
              name: longCell,
              price: '1',
              change: '+1%',
              sourceName: 'Example',
              sourceUrl: 'https://example.com/',
            },
            {
              name: 'Second',
              price: '2',
              change: '+2%',
              sourceName: 'Example',
              sourceUrl: 'https://example.com/',
            },
            {
              name: 'Third',
              price: '3',
              change: '+3%',
              sourceName: 'Example',
              sourceUrl: 'https://example.com/',
            },
          ],
          whyItMatters: 'Cell limits keep Slack output postable.',
          searchedAt: '2026-09-16T12:00:00Z',
        },
      ]),
    ]);

    const blocks = session.getSnapshot().blocks;
    expect(blockText(blocks.find(block => blockRecord(block).type === 'header'))).toHaveLength(
      SLACK_LIMITS.headerText,
    );
    expect(sectionText(blocks.find(block => blockRecord(block).type === 'section'))).toHaveLength(
      SLACK_LIMITS.sectionText,
    );
    expect(buttonText(session)).toHaveLength(SLACK_LIMITS.buttonText);
    expect(tableCellText(session)).toHaveLength(SLACK_LIMITS.cellText);
    expect(session.getSnapshot().diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({level: 'warning', code: 'SLACK_HEADER_TEXT_TRUNCATED'}),
        expect.objectContaining({level: 'warning', code: 'SLACK_SECTION_TEXT_TRUNCATED'}),
        expect.objectContaining({level: 'warning', code: 'SLACK_BUTTON_TEXT_TRUNCATED'}),
        expect.objectContaining({level: 'warning', code: 'SLACK_TABLE_CELL_TEXT_TRUNCATED'}),
      ]),
    );
  });

  it('rejects table output over Slack aggregate cell text limits, then recovers', () => {
    const aggregateOverflow = 'A'.repeat(SLACK_LIMITS.cellText - 1);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'MarketSnapshot',
          headline: 'Oversized table',
          summary: 'Every individual cell is within the Slack cell limit.',
          markets: [
            {
              name: aggregateOverflow,
              price: aggregateOverflow,
              change: aggregateOverflow,
              sourceName: aggregateOverflow,
              sourceUrl: 'https://example.com/one',
            },
            {
              name: aggregateOverflow,
              price: aggregateOverflow,
              change: aggregateOverflow,
              sourceName: aggregateOverflow,
              sourceUrl: 'https://example.com/two',
            },
            {
              name: aggregateOverflow,
              price: aggregateOverflow,
              change: '+1%',
              sourceName: 'Example',
              sourceUrl: 'https://example.com/three',
            },
          ],
          whyItMatters: 'Aggregate table cell limits keep Slack output postable.',
          searchedAt: '2026-09-16T12:00:00Z',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT_EXCEEDED',
        }),
      ],
    });
    expect(actionIds(session)).toEqual([]);

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Recovered after table budget error',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Recovered after table budget error');
  });

  it('does not infer truncation from exact-limit user text ending with an ellipsis', () => {
    const validHeader = `${'H'.repeat(SLACK_LIMITS.headerText - 1)}…`;

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: validHeader,
          variant: 'h1',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(blockText(session.getSnapshot().blocks[0])).toBe(validHeader);
    expect(diagnosticCodes(session)).not.toContain('SLACK_HEADER_TEXT_TRUNCATED');
  });

  it('diagnoses section truncation after Markdown expands to Slack mrkdwn', () => {
    const tableSource = [
      '| Left | Right |',
      '| --- | --- |',
      '| x | y |',
      `| ${'A'.repeat(500)} | ${'B'.repeat(500)} |`,
    ].join('\n');

    expect(tableSource.length).toBeLessThanOrEqual(SLACK_LIMITS.sectionText);
    expect(markdownToMrkdwn(tableSource).length).toBeGreaterThan(SLACK_LIMITS.sectionText);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: tableSource,
        },
      ]),
    ]);

    expect(sectionText(session.getSnapshot().blocks[0])).toHaveLength(SLACK_LIMITS.sectionText);
    expect(session.getSnapshot().diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({level: 'warning', code: 'SLACK_SECTION_TEXT_TRUNCATED'}),
      ]),
    );
  });

  it('accepts context and image fields at Slack boundary values', () => {
    const caption = 'C'.repeat(SLACK_LIMITS.sectionText);
    const description = 'D'.repeat(SLACK_LIMITS.fieldText);
    const imageUrl = fixedLengthImageUrl(SLACK_LIMITS.sectionText);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: ['caption', 'image'],
        },
        {
          id: 'caption',
          component: 'Text',
          text: caption,
          variant: 'caption',
        },
        {
          id: 'image',
          component: 'Image',
          url: imageUrl,
          description,
        },
      ]),
    ]);

    expect(session.getSnapshot().status).toBe('ready');
    expect(contextText(session)).toBe(caption);
    expect(imageBlockField(session, 'alt_text')).toBe(description);
    expect(imageBlockField(session, 'image_url')).toBe(imageUrl);
    expect(diagnosticCodes(session)).not.toEqual(
      expect.arrayContaining([
        'SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED',
        'SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED',
        'SLACK_IMAGE_URL_LIMIT_EXCEEDED',
      ]),
    );
  });

  it('rejects bound image URLs that cannot produce Slack image_url, clears stale output and actions, then recovers', async () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'valid-label',
          action: {
            event: {
              name: 'stale_button',
            },
          },
        },
        {
          id: 'valid-label',
          component: 'Text',
          text: 'Before image error',
        },
      ]),
    ]);

    expect(actionIds(session)).toEqual(['a2ui-1-1']);

    session.processMessages([
      updateData('test-surface', {
        imageUrl: {src: 'https://example.com/chart.png'},
        imageDescription: 'Revenue chart',
      }),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Image',
          url: {path: '/imageUrl'},
          description: {path: '/imageDescription'},
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'A2UI_INVALID_IMAGE_URL',
          componentId: 'root',
        }),
      ],
    });
    await session.dispatch('a2ui-1-1');
    expect(actions).toEqual([]);

    session.processMessages([
      updateData('test-surface', {
        imageUrl: 'https://example.com/chart.png',
        imageDescription: 'Revenue chart',
      }),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(imageBlockField(session, 'image_url')).toBe('https://example.com/chart.png');
    expect(imageBlockField(session, 'alt_text')).toBe('Revenue chart');
  });

  it.each([
    {
      name: 'missing description',
      expectedCode: 'A2UI_INVALID_PROPS',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/image.png',
      },
    },
    {
      name: 'empty description',
      expectedCode: 'A2UI_INVALID_IMAGE_ALT_TEXT',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/image.png',
        description: '',
      },
    },
    {
      name: 'empty bound URL',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: {path: '/imageUrl'},
        description: 'Chart image',
      },
      data: {imageUrl: ''},
    },
    {
      name: 'invalid URL',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'not-a-url',
        description: 'Chart image',
      },
    },
    {
      name: 'data URI',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'data:image/png;base64,iVBORw0KGgo=',
        description: 'Inline image',
      },
    },
    {
      name: 'mailto URI',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'mailto:image@example.com',
        description: 'Email URI',
      },
    },
    {
      name: 'malformed percent escape',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/%zz',
        description: 'Malformed escape',
      },
    },
    {
      name: 'trailing percent escape',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/%',
        description: 'Trailing escape',
      },
    },
    {
      name: 'unescaped square brackets',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/a[1].png',
        description: 'Bracket image',
      },
    },
    {
      name: 'unescaped pipe in path',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/a|b.png',
        description: 'Pipe image',
      },
    },
    {
      name: 'unescaped braces in query',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/image.png?label={chart}',
        description: 'Query image',
      },
    },
    {
      name: 'unescaped caret in fragment',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://example.com/image.png#chart^top',
        description: 'Fragment image',
      },
    },
    {
      name: 'malformed percent escape in username',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://user%zz:pass@example.com/a.png',
        description: 'Userinfo image',
      },
    },
    {
      name: 'malformed percent escape in password',
      expectedCode: 'A2UI_INVALID_IMAGE_URL',
      component: {
        id: 'root',
        component: 'Image',
        url: 'https://user:pass%@example.com/a.png',
        description: 'Password image',
      },
    },
  ])(
    'rejects image fields that would create invalid Slack image blocks: $name',
    ({component, data, expectedCode}) => {
      session.processMessages([
        createSurface(),
        ...(data === undefined ? [] : [updateData('test-surface', data)]),
        updateComponents('test-surface', [component]),
      ]);

      expect(session.getSnapshot()).toMatchObject({
        status: 'error',
        blocks: [],
        diagnostics: [
          expect.objectContaining({
            level: 'error',
            componentId: 'root',
          }),
        ],
      });
      expect(diagnosticCodes(session)).toEqual([expectedCode]);
    },
  );

  it.each([
    ['HTTP', 'http://example.com/image.png'],
    ['HTTPS', 'https://example.com/image.png'],
    ['IPv6 HTTPS', 'https://[2001:db8::1]/image.png'],
    ['encoded delimiters', 'https://example.com/a%5B1%5D.png?label=a%7Cb#chart%5Etop'],
    ['encoded userinfo', 'https://user%25:pass%40@example.com/a.png'],
  ])('accepts valid %s image URLs without rewriting them', (_, url) => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Image',
          url,
          description: 'Chart image',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(imageBlockField(session, 'image_url')).toBe(url);
    expect(imageBlockField(session, 'alt_text')).toBe('Chart image');
  });

  it.each([
    {
      name: 'whitespace-padded URL',
      url: ' https://example.com/image.png ',
      expectedUrl: 'https://example.com/image.png',
    },
    {
      name: 'unescaped internal space',
      url: 'https://example.com/a b.png',
      expectedUrl: 'https://example.com/a%20b.png',
    },
  ])('canonicalizes $name before emitting Slack image_url', ({url, expectedUrl}) => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Image',
          url,
          description: 'Chart image',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(imageBlockField(session, 'image_url')).toBe(expectedUrl);
    expect(imageBlockField(session, 'alt_text')).toBe('Chart image');
    expectValidGeneratedSlackImageUrl(session);
  });

  it('applies Slack image_url length limits after canonical URL encoding', () => {
    const prefix = 'https://example.com/';
    const rawUrlWithSpaceAtLimit = `${prefix}${'a'.repeat(
      SLACK_LIMITS.sectionText - prefix.length - 2,
    )} b`;

    expect(rawUrlWithSpaceAtLimit).toHaveLength(SLACK_LIMITS.sectionText);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Image',
          url: rawUrlWithSpaceAtLimit,
          description: 'Chart image',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'SLACK_IMAGE_URL_LIMIT_EXCEEDED',
        }),
      ],
    });
  });

  it('rejects rendered context caption text beyond Slack text object limits', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'C'.repeat(SLACK_LIMITS.sectionText + 1),
          variant: 'caption',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED',
        }),
      ],
    });
  });

  it('rejects rendered image descriptions beyond Slack image alt text limits', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Image',
          url: 'https://example.com/image.png',
          description: 'D'.repeat(SLACK_LIMITS.fieldText + 1),
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED',
        }),
      ],
    });
  });

  it('rejects rendered image URLs beyond Slack image URL limits', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Image',
          url: fixedLengthImageUrl(SLACK_LIMITS.sectionText + 1),
          description: 'Chart image',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'SLACK_IMAGE_URL_LIMIT_EXCEEDED',
        }),
      ],
    });
  });

  it('does not infer block trimming from user-authored context text', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: Array.from({length: SLACK_LIMITS.blocksPerMessage}, (_, index) =>
            index === SLACK_LIMITS.blocksPerMessage - 1 ? 'caption' : `copy-${index}`,
          ),
        },
        ...Array.from({length: SLACK_LIMITS.blocksPerMessage - 1}, (_, index) => ({
          id: `copy-${index}`,
          component: 'Text',
          text: `Block ${index}`,
        })),
        {
          id: 'caption',
          component: 'Text',
          text: 'A human wrote: more blocks truncated',
          variant: 'caption',
        },
      ]),
    ]);

    expect(session.getSnapshot().status).toBe('ready');
    expect(session.getSnapshot().blocks).toHaveLength(SLACK_LIMITS.blocksPerMessage);
    expect(diagnosticCodes(session)).not.toContain('SLACK_LAYOUT_FLATTENED');
    expect(diagnosticCodes(session)).not.toContain('SLACK_BLOCKS_TRIMMED');
  });

  it('bounds Slack actions rows, filters dropped action IDs, then recovers', async () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', buttonComponents(SLACK_LIMITS.actionsElements + 1)),
    ]);

    expect(actionIds(session)).toHaveLength(SLACK_LIMITS.actionsElements);
    expect(session.getSnapshot().diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({level: 'warning', code: 'SLACK_ACTIONS_ELEMENTS_TRIMMED'}),
      ]),
    );

    await session.dispatch('a2ui-1-1');
    await session.dispatch(`a2ui-1-${SLACK_LIMITS.actionsElements + 1}`);
    expect(actions.map(action => action.name)).toEqual(['button_0']);

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'valid-label',
          action: {
            event: {
              name: 'valid_button',
            },
          },
        },
        {
          id: 'valid-label',
          component: 'Text',
          text: 'Valid',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(actionIds(session)).toEqual(['a2ui-2-1']);
    await session.dispatch('a2ui-2-1');
    expect(actions.map(action => action.name)).toEqual(['button_0', 'valid_button']);
  });

  it('bounds Slack block count and diagnoses dropped blocks', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: Array.from(
            {length: SLACK_LIMITS.blocksPerMessage + 1},
            (_, index) => `copy-${index}`,
          ),
        },
        ...Array.from({length: SLACK_LIMITS.blocksPerMessage + 1}, (_, index) => ({
          id: `copy-${index}`,
          component: 'Text',
          text: `Block ${index}`,
        })),
      ]),
    ]);

    expect(session.getSnapshot().blocks).toHaveLength(SLACK_LIMITS.blocksPerMessage);
    expect(session.getSnapshot().diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({level: 'warning', code: 'SLACK_BLOCKS_TRIMMED'}),
      ]),
    );
  });

  it('filters nested button actions that do not survive in final Slack output', async () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'hidden-button',
          action: {
            event: {
              name: 'visible_parent',
            },
          },
        },
        {
          id: 'hidden-button',
          component: 'Button',
          child: 'hidden-label',
          action: {
            event: {
              name: 'hidden_child',
            },
          },
        },
        {
          id: 'hidden-label',
          component: 'Text',
          text: 'Nested',
        },
      ]),
    ]);

    expect(actionIds(session)).toEqual(['a2ui-1-2']);
    await session.dispatch('a2ui-1-1');
    expect(actions).toEqual([]);

    await session.dispatch('a2ui-1-2');
    expect(actions.map(action => action.name)).toEqual(['visible_parent']);
  });

  it('distinguishes an untouched surface from submitted components missing their root', () => {
    session.processMessages([createSurface()]);
    expect(session.getSnapshot()).toMatchObject({status: 'empty', blocks: [], diagnostics: []});

    session.processMessages([
      updateComponents('test-surface', [{id: 'main', component: 'Text', text: 'Unlinked content'}]),
    ]);
    expect(session.getSnapshot()).toMatchObject({
      status: 'waiting',
      diagnostics: [
        expect.objectContaining({code: 'A2UI_WAITING_FOR_COMPONENT', componentId: 'root'}),
      ],
    });

    session.processMessages([
      updateComponents('test-surface', [{id: 'root', component: 'Text', text: 'Ready message'}]),
    ]);
    expect(session.getSnapshot()).toMatchObject({status: 'ready'});
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Ready message');
  });

  it('reports waiting while a child component has not streamed yet and recovers when it arrives', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: ['missing-child'],
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'waiting',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'info',
          code: 'A2UI_WAITING_FOR_COMPONENT',
          componentId: 'missing-child',
        }),
      ],
    });

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'missing-child',
          component: 'Text',
          text: 'Child arrived',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Child arrived');
  });

  it('clears stale output and actions for invalid props, then recovers with valid props', async () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Valid',
        },
      ]),
    ]);

    expect(session.getSnapshot().status).toBe('ready');

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 42,
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'A2UI_INVALID_PROPS',
          componentId: 'root',
        }),
      ],
    });
    await session.dispatch('a2ui-1-1');
    expect(actions).toEqual([]);

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Recovered',
        },
      ]),
    ]);

    expect(session.getSnapshot().status).toBe('ready');
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Recovered');
  });

  it('reports dynamic function binding failures as recoverable errors, then recovers', async () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            event: {
              name: 'acknowledge',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Acknowledge',
        },
      ]),
    ]);

    const staleActionId = actionIds(session)[0];
    expect(staleActionId).toBe('a2ui-1-1');

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: {
            call: 'missingFunction',
            args: {},
          },
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'EXPRESSION_ERROR',
          componentId: 'root',
        }),
      ],
    });
    expect(session.getSnapshot().diagnostics[0].message).toContain('missingFunction');
    await session.dispatch(staleActionId);
    expect(actions).toEqual([]);

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Recovered after binding error',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session.getSnapshot().blocks[0])).toBe('Recovered after binding error');
  });

  it('reports unsupported components and cycles as recoverable errors with no stale output', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Valid',
        },
      ]),
    ]);

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'UnsupportedThing',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'A2UI_UNSUPPORTED_COMPONENT',
          componentId: 'root',
        }),
      ],
    });

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: ['root'],
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'A2UI_COMPONENT_CYCLE',
          componentId: 'root',
        }),
      ],
    });
  });

  it('lowers Divider and emits warnings when Slack flattens layout/style hints', () => {
    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: ['title', 'divider'],
          justify: 'center',
          align: 'center',
        },
        {
          id: 'title',
          component: 'Text',
          text: 'Daily brief',
          variant: 'h3',
        },
        {
          id: 'divider',
          component: 'Divider',
          axis: 'horizontal',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      blocks: [
        expect.objectContaining({
          type: 'header',
          text: {type: 'plain_text', text: 'Daily brief'},
        }),
        {type: 'divider'},
      ],
      diagnostics: [
        expect.objectContaining({
          level: 'warning',
          code: 'SLACK_LAYOUT_FLATTENED',
          componentId: 'root',
        }),
        expect.objectContaining({
          level: 'warning',
          code: 'SLACK_TEXT_VARIANT_APPROXIMATED',
          componentId: 'title',
        }),
      ],
    });
  });

  it.each([
    {component: 'Column', hints: {}, warns: false},
    {component: 'Column', hints: {align: 'center'}, warns: true},
    {component: 'Column', hints: {justify: 'center'}, warns: true},
    {component: 'Row', hints: {}, warns: true},
  ])(
    'reports layout loss only for rows or explicit column hints (%#)',
    ({component, hints, warns}) => {
      session.processMessages([
        createSurface(),
        updateComponents('test-surface', [
          {id: 'root', component, children: ['body'], ...hints},
          {id: 'body', component: 'Text', text: 'Content'},
        ]),
      ]);
      expect(session.getSnapshot().status).toBe('ready');
      expect(diagnosticCodes(session).includes('SLACK_LAYOUT_FLATTENED')).toBe(warns);
    },
  );

  it('notifies subscribers after snapshots change and stops after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = session.subscribe(listener);

    session.processMessages([createSurface()]);

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    session.clear();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot()).toMatchObject({
      revision: 2,
      status: 'empty',
      blocks: [],
      diagnostics: [],
    });
  });
});
