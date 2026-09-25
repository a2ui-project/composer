/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) Atai Barkai
 *
 * Adapted from CopilotKit commit 00904af842b2f8c015f1e405a0c590a86d7842f8:
 * - examples/channels-a2ui-playground/src/examples.ts
 * - examples/channels-a2ui-playground/src/poc/market-snapshot.fixture.ts
 */

import {type A2uiMessage} from '@a2ui/web_core/v0_9';
import {type ComponentUsages} from 'a2ui-bridge';
import {SLACK_CATALOG_ID, SLACK_COMPONENT_USAGES as CATALOG_COMPONENT_USAGES} from './catalog';

export const EXAMPLE_INITIAL_DATA = {
  greeting: 'Ready for review',
  record: {
    id: 'example-42',
  },
} as const;

export const SLACK_COMPONENT_USAGES = {
  Text: {
    usage: [
      {
        id: 'root',
        component: 'Text',
        text: 'Slack-ready status update',
        variant: 'body',
      },
    ],
  },
  Image: {
    usage: [
      {
        id: 'root',
        component: 'Image',
        url: 'https://www.gstatic.com/marketing-cms/assets/images/c5/3a/200414104c669203c62270f7884f/google-wordmarks-2x.webp=n-w100-h32-fcrop64=1,00000000ffffffff-rw',
        description: 'Google wordmark',
        fit: 'scaleDown',
        variant: 'mediumFeature',
      },
    ],
  },
  Divider: {
    usage: [
      {
        id: 'root',
        component: 'Divider',
        axis: 'horizontal',
      },
    ],
  },
  Row: {
    usage: [
      {
        id: 'root',
        component: 'Row',
        children: ['left-copy', 'right-copy'],
        justify: 'spaceBetween',
        align: 'center',
      },
      {
        id: 'left-copy',
        component: 'Text',
        text: 'Open',
      },
      {
        id: 'right-copy',
        component: 'Text',
        text: '42',
      },
    ],
  },
  Column: {
    usage: [
      {
        id: 'root',
        component: 'Column',
        children: ['title-copy', 'body-copy'],
        justify: 'start',
        align: 'stretch',
      },
      {
        id: 'title-copy',
        component: 'Text',
        text: 'Daily brief',
        variant: 'h3',
      },
      {
        id: 'body-copy',
        component: 'Text',
        text: 'Three updates are ready for review.',
      },
    ],
  },
  Card: {
    usage: [
      {
        id: 'root',
        component: 'Card',
        child: 'card-copy',
      },
      {
        id: 'card-copy',
        component: 'Text',
        text: 'Card content',
      },
    ],
  },
  Button: {
    usage: [
      {
        id: 'root',
        component: 'Column',
        children: ['bound-greeting', 'acknowledge-button'],
        justify: 'start',
        align: 'stretch',
      },
      {
        id: 'bound-greeting',
        component: 'Text',
        text: {
          path: '/greeting',
        },
      },
      {
        id: 'acknowledge-button',
        component: 'Button',
        child: 'button-label',
        variant: 'primary',
        action: {
          event: {
            name: 'acknowledge',
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
        text: 'Acknowledge',
      },
    ],
    data: EXAMPLE_INITIAL_DATA,
  },
  TextField: CATALOG_COMPONENT_USAGES.TextField,
  DateTimeInput: CATALOG_COMPONENT_USAGES.DateTimeInput,
  Table: CATALOG_COMPONENT_USAGES.Table,
  MarketSnapshot: {
    usage: [
      {
        id: 'root',
        component: 'MarketSnapshot',
        headline: 'Illustrative historical energy market snapshot',
        summary: 'Oil benchmarks moved lower in the latest session.',
        markets: [
          {
            name: 'Brent crude',
            price: '$79.42/bbl',
            change: '-0.8%',
            sourceName: 'Reuters',
            sourceUrl: 'https://www.reuters.com/markets/commodities/',
          },
          {
            name: 'WTI crude',
            price: '$75.18/bbl',
            change: '-0.6%',
            sourceName: 'CME Group',
            sourceUrl: 'https://www.cmegroup.com/markets/energy/crude-oil.html',
          },
          {
            name: 'RBOB gasoline',
            price: '$2.31/gal',
            change: '+0.2%',
            sourceName: 'CME Group',
            sourceUrl:
              'https://www.cmegroup.com/markets/energy/refined-products/rbob-gasoline.html',
          },
        ],
        whyItMatters: 'Energy prices feed into transportation and consumer costs.',
        searchedAt: '2026-08-28T12:00:00Z',
      },
    ],
  },
} satisfies ComponentUsages;

function createExampleMessages(surfaceId: string, usage: ComponentUsages[string]): A2uiMessage[] {
  return [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId,
        catalogId: SLACK_CATALOG_ID,
      },
    },
    ...(usage.data === undefined
      ? []
      : [
          {
            version: 'v0.9' as const,
            updateDataModel: {
              surfaceId,
              path: '/',
              value: usage.data,
            },
          },
        ]),
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: usage.usage,
      },
    },
  ];
}

export const DATA_BOUND_ACTION_MESSAGES = createExampleMessages(
  'data-bound-action',
  SLACK_COMPONENT_USAGES.Button,
);

export const MARKET_SNAPSHOT_MESSAGES = createExampleMessages(
  'market-snapshot',
  SLACK_COMPONENT_USAGES.MarketSnapshot,
);
