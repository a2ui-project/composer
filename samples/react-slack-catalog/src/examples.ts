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

import {type ComponentUsages} from 'a2ui-bridge';

/**
 * One example per Slack catalog component. The renderer sends these to
 * Composer's Gallery, and the catalog tests check each against its schema.
 * The Button and MarketSnapshot examples are also served, as complete message
 * arrays, from `public/examples/`; the catalog tests keep the two in step.
 */
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
    data: {
      greeting: 'Ready for review',
      record: {
        id: 'example-42',
      },
    },
  },
  TextField: {
    usage: [
      {
        id: 'root',
        component: 'TextField',
        label: 'Pickup location',
        value: {path: '/pickupLocation'},
        variant: 'shortText',
      },
    ],
  },
  DateTimeInput: {
    usage: [
      {
        id: 'root',
        component: 'DateTimeInput',
        label: 'Pickup date',
        value: {path: '/pickupDate'},
        enableDate: true,
        enableTime: false,
      },
    ],
  },
  Table: {
    usage: [
      {
        id: 'root',
        component: 'Table',
        accessibility: {label: 'Illustrative 2022 World Cup final scores'},
        columns: [{header: 'Team'}, {header: 'Goals', align: 'right'}, {header: 'Result'}],
        rows: [
          ['Argentina', '3', 'Won on penalties'],
          ['France', '3', 'Runner-up'],
        ],
      },
    ],
  },
  Chart: {
    usage: [
      {
        id: 'root',
        component: 'Chart',
        type: 'pie',
        title: 'Illustrative possession split',
        data: [
          {label: 'Argentina', value: 70},
          {label: 'Mexico', value: 30},
        ],
      },
    ],
  },
  Scorecard: {
    usage: [
      {
        id: 'root',
        component: 'Scorecard',
        home: {name: 'Argentina', score: 2},
        away: {name: 'Mexico', score: 0},
        status: 'Full time',
        competition: 'World Cup, Group C',
      },
    ],
  },
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
