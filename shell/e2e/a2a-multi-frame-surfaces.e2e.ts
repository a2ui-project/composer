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

import {expect, test, type FrameLocator, type Page} from '@playwright/test';
import {connectMockAgent, sseEvent} from '../src/app/agent-chat/test/mock-a2a-agent';
import {RENDERER_URLS} from './helpers';

const AGENT_URL = 'http://mock-agent.local';

/** Budget for a guest frame to finish its handshake and draw a surface. */
const SURFACE_RENDER_TIMEOUT_MS = 15_000;

/**
 * One agent turn: a surface whose root Column holds an inline Text plus a
 * Canvas with its own Text. The chat view splits it into an inline frame in
 * the bubble and a "View in Canvas" card that opens the side canvas; with
 * `autoOpen: false` the test controls when that happens.
 */
function turnPayload(turn: number) {
  const surfaceId = `turn-${turn}`;
  return [
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
          {id: 'root', component: 'Column', children: ['inline_text', 'canvas']},
          {id: 'inline_text', component: 'Text', text: `INLINE SURFACE #${turn}`, variant: 'h3'},
          {
            id: 'canvas',
            component: {
              Canvas: {
                cardTitle: `Turn ${turn} details`,
                cardIcon: 'dashboard',
                autoOpen: false,
                children: ['canvas_text'],
              },
            },
          },
          {id: 'canvas_text', component: 'Text', text: `CANVAS CONTENT #${turn}`, variant: 'h3'},
        ],
      },
    },
  ];
}

function turnReply(turn: number): string {
  return sseEvent({
    taskId: `task-turn-${turn}`,
    contextId: 'ctx-multi-frame',
    message: {
      role: 'agent',
      parts: [
        {text: `Reply for turn ${turn}.`},
        {data: {mimeType: 'application/json+a2ui', data: JSON.stringify(turnPayload(turn))}},
      ],
    },
    final: true,
  });
}

async function sendPrompt(page: Page, text: string) {
  const prompt = page.locator('.prompt-textarea');
  await prompt.fill(text);
  await prompt.press('Enter');
}

/** The guest document of the n-th inline surface in the transcript (0-based). */
function inlineFrame(page: Page, index: number): FrameLocator {
  return page.locator('.inline-surface-card iframe.preview-iframe').nth(index).contentFrame();
}

function canvasFrame(page: Page): FrameLocator {
  return page.locator('.side-canvas-viewport iframe.preview-iframe').contentFrame();
}

async function expectSurface(frame: FrameLocator, text: string) {
  await expect(frame.locator('body')).toContainText(text, {timeout: SURFACE_RENDER_TIMEOUT_MS});
}

test.beforeEach(async ({page}) => {
  // Point the default renderer at the local Angular guest so the inline and
  // canvas frames render real surfaces instead of the GitHub Pages build.
  await page.route('**/config.json', route =>
    route.fulfill({json: {renderers: {default: {rendererUrl: RENDERER_URLS.angular}}}}),
  );
});

test('inline surfaces keep their own content while the side canvas is opened and replaced', async ({
  page,
}) => {
  let turn = 0;
  await connectMockAgent(page, AGENT_URL, () => turnReply(++turn));

  // Turn 1: an inline surface and a canvas card.
  await sendPrompt(page, 'turn one');
  await expect(page.locator('.agent-text-content')).toContainText('Reply for turn 1.');
  await expect(page.locator('.inline-surface-card')).toHaveCount(1);
  await expectSurface(inlineFrame(page, 0), 'INLINE SURFACE #1');

  // Opening canvas #1 mounts a second frame. Its payload must reach that
  // frame only: the inline frame, which was the default dispatch target until
  // now, keeps its own content.
  await page.getByRole('button', {name: 'View Turn 1 details in Canvas'}).click();
  await expect(page.locator('.side-canvas-column')).toBeVisible();
  await expectSurface(canvasFrame(page), 'CANVAS CONTENT #1');
  await expectSurface(inlineFrame(page, 0), 'INLINE SURFACE #1');
  await expect(inlineFrame(page, 0).locator('body')).not.toContainText('CANVAS CONTENT');

  // Turn 2 arrives while the canvas is open and mounts a new inline frame,
  // which becomes the newest frame. Nothing already on screen may change.
  await sendPrompt(page, 'turn two');
  await expect(page.locator('.inline-surface-card')).toHaveCount(2);
  await expectSurface(inlineFrame(page, 1), 'INLINE SURFACE #2');
  await expectSurface(inlineFrame(page, 0), 'INLINE SURFACE #1');
  await expectSurface(canvasFrame(page), 'CANVAS CONTENT #1');

  // Opening canvas #2 replaces the canvas payload. Before readiness was
  // tracked per frame this payload also went to the newest frame, so the
  // turn-2 inline surface was overwritten with the canvas content for good.
  await page.getByRole('button', {name: 'View Turn 2 details in Canvas'}).click();
  await expectSurface(canvasFrame(page), 'CANVAS CONTENT #2');
  await expectSurface(inlineFrame(page, 1), 'INLINE SURFACE #2');
  await expectSurface(inlineFrame(page, 0), 'INLINE SURFACE #1');
  for (const index of [0, 1]) {
    await expect(inlineFrame(page, index).locator('body')).not.toContainText('CANVAS CONTENT');
  }
  await expect(canvasFrame(page).locator('body')).not.toContainText('CANVAS CONTENT #1');
  await expect(canvasFrame(page).locator('body')).not.toContainText('INLINE SURFACE');
});
