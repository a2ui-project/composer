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
import {connectMockAgent} from '../src/app/agent-chat/test/mock-a2a-agent';
import {RENDERER_URLS} from './helpers';

const AGENT_URL = 'http://mock-agent.local';

/** Budget for a guest frame to finish its handshake and draw a surface. */
const SURFACE_RENDER_TIMEOUT_MS = 15_000;

/** An A2A data part carrying a one-line inline surface (no Canvas). */
function surfacePart(surfaceId: string, text: string) {
  const payload = [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId,
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: [
          {id: 'root', component: 'Column', children: ['label']},
          {id: 'label', component: 'Text', text, variant: 'h3'},
        ],
      },
    },
  ];
  return {data: {mimeType: 'application/json+a2ui', data: JSON.stringify(payload)}};
}

/** One final agent turn whose message parts arrive in the given wire order. */
function sseTurn(turn: number, parts: unknown[]): string {
  const event = {
    taskId: `task-order-${turn}`,
    contextId: 'ctx-surface-order',
    message: {role: 'agent', parts},
    final: true,
  };
  return `event: message\ndata: ${JSON.stringify(event)}\n\n`;
}

async function sendPrompt(page: Page, text: string) {
  const prompt = page.locator('.prompt-textarea');
  await prompt.fill(text);
  await prompt.press('Enter');
}

/**
 * The order of the text and inline-surface blocks inside the n-th agent bubble
 * (0-based), top to bottom.
 */
function bubbleBlockOrder(page: Page, index: number): Promise<string[]> {
  return page
    .locator('.agent-message-body')
    .nth(index)
    .evaluate(body =>
      Array.from(body.children).flatMap(child => {
        if (child.classList.contains('inline-surface-card')) return ['surface'];
        if (child.classList.contains('agent-text-content')) return ['text'];
        return [];
      }),
    );
}

async function expectInlineSurface(page: Page, index: number, text: string) {
  const frame = page
    .locator('.inline-surface-card iframe.preview-iframe')
    .nth(index)
    .contentFrame();
  await expect(frame.locator('body')).toContainText(text, {timeout: SURFACE_RENDER_TIMEOUT_MS});
}

test('an inline surface is placed above or below the text to match the order the agent sent', async ({
  page,
}) => {
  // Point the default renderer at the local Angular guest so the inline frames
  // render real surfaces instead of the GitHub Pages build.
  await page.route('**/config.json', route =>
    route.fulfill({json: {renderers: {default: {rendererUrl: RENDERER_URLS.angular}}}}),
  );
  await connectMockAgent(page, AGENT_URL);

  // Registered after the mock agent's own routes, so this one answers the
  // message POSTs; everything else (the agent card) falls through to them.
  let turn = 0;
  await page.route(`${AGENT_URL}/**`, async route => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    const surfaceFirst = (route.request().postData() ?? '').includes('surface first');
    turn += 1;
    const parts = surfaceFirst
      ? [surfacePart(`turn-${turn}`, 'SURFACE SENT FIRST'), {text: 'Text sent after the surface.'}]
      : [{text: 'Text sent before the surface.'}, surfacePart(`turn-${turn}`, 'SURFACE SENT LAST')];
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: sseTurn(turn, parts),
    });
  });

  // Turn 1: the agent sends the surface, then the text. The surface is a
  // header for the prose and must render above it.
  await sendPrompt(page, 'surface first');
  await expect(page.locator('.agent-text-content')).toContainText('Text sent after the surface.');
  await expectInlineSurface(page, 0, 'SURFACE SENT FIRST');
  expect(await bubbleBlockOrder(page, 0)).toEqual(['surface', 'text']);

  // Turn 2: the agent sends the text, then the surface. The usual layout,
  // text above the surface, is unchanged.
  await sendPrompt(page, 'text first');
  await expect(page.locator('.agent-text-content').nth(1)).toContainText(
    'Text sent before the surface.',
  );
  await expectInlineSurface(page, 1, 'SURFACE SENT LAST');
  expect(await bubbleBlockOrder(page, 1)).toEqual(['text', 'surface']);

  // The first bubble kept its order after the second turn re-rendered the list.
  expect(await bubbleBlockOrder(page, 0)).toEqual(['surface', 'text']);
});
