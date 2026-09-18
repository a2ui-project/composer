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

import {fileURLToPath} from 'node:url';
import type {Page} from '@playwright/test';
import {A2A_PROTOCOL_ICON_URL} from '../converters/a2a-ui-converter';

/**
 * Byte-identical copy of the remote A2A logo served by `stubA2aProtocolIcon`.
 * Committed alongside the tests so the avatar renders exactly as the baseline
 * screenshots expect without reaching raw.githubusercontent.com.
 */
const A2A_PROTOCOL_ICON_FIXTURE = fileURLToPath(new URL('./a2a-logo-black.svg', import.meta.url));

/**
 * Serves the A2A protocol logo from the local fixture.
 *
 * The avatar's `src` points at a file on raw.githubusercontent.com. Fetching it
 * makes every screenshot that shows the avatar depend on GitHub being reachable
 * and on the upstream file never changing, so the request is answered locally
 * instead. Must be called before the page navigates.
 */
export async function stubA2aProtocolIcon(page: Page): Promise<void> {
  await page.route(A2A_PROTOCOL_ICON_URL, route =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      path: A2A_PROTOCOL_ICON_FIXTURE,
    }),
  );
}

export const mockAgentCard = {
  name: 'Smart Travel Planner Agent',
  description:
    'An AI assistant for booking flights, hotels, and exploring destinations with interactive A2UI.',
  version: '1.2.0',
  skills: [
    {
      id: 'flight_search',
      name: 'Flight Finder',
      description: 'Search and compare flight itineraries.',
    },
    {
      id: 'hotel_book',
      name: 'Hotel Reservation',
      description: 'Browse accommodations and view room amenities.',
    },
  ],
  samplePrompts: [
    'Find non-stop flights from SFO to NRT next month',
    'Show top-rated luxury hotels in Tokyo',
  ],
};

export const flightA2uiPayload = [
  {
    version: 'v0.9',
    createSurface: {
      surfaceId: 'flight-options',
      catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      sendDataModel: true,
    },
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'flight-options',
      components: [
        {
          id: 'root',
          component: {
            Canvas: {
              cardTitle: 'Flight Options',
              cardDescription: 'Review and select non-stop flights',
              cardIcon: 'flight',
              autoOpen: true,
              children: ['header_text', 'flight_card_ana', 'flight_card_jal', 'confirm_btn'],
            },
          },
        },
        {
          id: 'header_text',
          component: 'Text',
          text: 'Available Non-Stop Flights (SFO ➔ NRT)',
          variant: 'h2',
        },
        {
          id: 'flight_card_ana',
          component: 'Card',
          child: 'flight_col_ana',
        },
        {
          id: 'flight_col_ana',
          component: 'Column',
          children: ['ana_title', 'ana_route', 'ana_meta'],
        },
        {
          id: 'ana_title',
          component: 'Text',
          text: '✈️ All Nippon Airways (ANA NH007)',
          variant: 'h3',
        },
        {
          id: 'ana_route',
          component: 'Text',
          text: 'Depart 11:30 AM (SFO) ➔ Arrive 3:45 PM (+1 day, NRT)',
          variant: 'body',
        },
        {
          id: 'ana_meta',
          component: 'Text',
          text: 'Duration: 11h 15m (Non-stop) • Fare: $1,180 (Economy)',
          variant: 'caption',
        },
        {
          id: 'flight_card_jal',
          component: 'Card',
          child: 'flight_col_jal',
        },
        {
          id: 'flight_col_jal',
          component: 'Column',
          children: ['jal_title', 'jal_route', 'jal_meta'],
        },
        {
          id: 'jal_title',
          component: 'Text',
          text: '✈️ Japan Airlines (JAL JL001)',
          variant: 'h3',
        },
        {
          id: 'jal_route',
          component: 'Text',
          text: 'Depart 1:15 PM (SFO) ➔ Arrive 5:30 PM (+1 day, NRT)',
          variant: 'body',
        },
        {
          id: 'jal_meta',
          component: 'Text',
          text: 'Duration: 11h 15m (Non-stop) • Fare: $1,240 (Economy)',
          variant: 'caption',
        },
        {
          id: 'confirm_btn',
          component: 'Button',
          child: 'confirm_btn_text',
          variant: 'primary',
          action: {
            event: {
              name: 'selectFlight',
              context: {
                flightNumber: 'NH007',
              },
            },
          },
        },
        {
          id: 'confirm_btn_text',
          component: 'Text',
          text: 'Select ANA NH007 & Continue',
          variant: 'body',
        },
      ],
    },
  },
  {
    version: 'v0.9',
    updateDataModel: {
      surfaceId: 'flight-options',
      data: {
        selectedFlight: 'NH007',
        tripType: 'RoundTrip',
      },
    },
  },
];

export const sseFlightBody = [
  'event: message\n',
  'data: ' +
    JSON.stringify({
      taskId: 'task-tokyo-101',
      contextId: 'ctx-trip-202',
      message: {
        role: 'agent',
        parts: [
          {
            thought: 'Searching flight databases for Tokyo Haneda and Narita...',
          },
          {
            text: 'I found the best non-stop flight options from San Francisco (SFO) to Tokyo Narita (NRT) for your trip:\n\n1. Flight NH007 - Direct, 11h 15m\n2. Flight JL001 - Direct, 11h 20m',
          },
          {
            data: {
              mimeType: 'application/json+a2ui',
              data: JSON.stringify(flightA2uiPayload),
            },
          },
        ],
      },
      final: true,
    }) +
    '\n\n',
].join('');

export const sseTextResponseBody = [
  'event: message\n',
  'data: ' +
    JSON.stringify({
      taskId: 'task-tokyo-102',
      contextId: 'ctx-trip-202',
      message: {
        role: 'agent',
        parts: [
          {
            thought: 'Analyzing travel seasons and weather patterns in Tokyo...',
          },
          {
            text: 'Spring (March to May) and Autumn (September to November) are the best times to visit Tokyo. You will enjoy mild temperatures and iconic cherry blossoms or vibrant autumn foliage.',
          },
        ],
      },
      final: true,
    }) +
    '\n\n',
].join('');

export const sseHotelResponseBody = [
  'event: message\n',
  'data: ' +
    JSON.stringify({
      taskId: 'task-tokyo-103',
      contextId: 'ctx-trip-202',
      message: {
        role: 'agent',
        parts: [
          {
            thought: 'Reviewing neighborhood safety and transit accessibility in Tokyo...',
          },
          {
            text: 'I recommend staying in Shinjuku or Shibuya for convenient transit access and vibrant dining options. For a more traditional atmosphere, Asakusa and Ueno are excellent choices.',
          },
        ],
      },
      final: true,
    }) +
    '\n\n',
].join('');

/** Sets up network route mocks for the A2A test agent */
export async function setupMockA2aRoutes(page: Page, agentUrl = 'http://mock-agent.local') {
  await stubA2aProtocolIcon(page);
  await page.route(`${agentUrl}/**`, async route => {
    const url = route.request().url();
    if (url.includes('.well-known') || url.includes('agent.json')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAgentCard),
      });
    } else {
      const postData = route.request().postData() || '';
      let body = sseFlightBody;
      if (postData.includes('hotel') || postData.includes('stay') || postData.includes('area')) {
        body = sseHotelResponseBody;
      } else if (
        postData.includes('time') ||
        postData.includes('season') ||
        postData.includes('visit') ||
        postData.includes('weather')
      ) {
        body = sseTextResponseBody;
      }

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        headers: {
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
        body,
      });
    }
  });
}

/** Navigates to /a2a, resets state, and connects to the mock agent */
export async function connectMockAgent(page: Page, agentUrl = 'http://mock-agent.local') {
  await setupMockA2aRoutes(page, agentUrl);
  await page.goto('/a2a');
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch (e) {}
  });
  await page.goto('/a2a');

  const configPanel = page.locator('.agent-config-panel-card');
  await configPanel.getByLabel('Agent Endpoint URL').fill(agentUrl);
  await configPanel.getByRole('button', {name: 'Connect Agent'}).click();

  await configPanel.waitFor({state: 'hidden'});
  await page.locator('.agent-title').waitFor({state: 'visible'});
}
