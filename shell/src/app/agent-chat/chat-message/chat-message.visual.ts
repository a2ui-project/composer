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

import {test, expect} from '@playwright/test';
import {RENDERER_URLS} from '../../../../e2e/helpers';
import {connectMockAgent, mockAgentCard, sseEvent, sseFlightBody} from '../test/mock-a2a-agent';

/** Budget for a guest frame to finish its handshake and draw a surface. */
const SURFACE_RENDER_TIMEOUT_MS = 15_000;

/** An A2A data part carrying a small inline surface (no Canvas) for the basic catalog. */
function inlineSurfacePart(surfaceId: string, title: string, caption: string) {
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
          {id: 'root', component: 'Card', child: 'body'},
          {id: 'body', component: 'Column', children: ['title', 'caption']},
          {id: 'title', component: 'Text', text: title, variant: 'h3'},
          {id: 'caption', component: 'Text', text: caption, variant: 'caption'},
        ],
      },
    },
  ];
  return {data: {mimeType: 'application/json+a2ui', data: JSON.stringify(payload)}};
}

test.describe('A2aChatMessage Visual Regression & Layout', () => {
  test('renders user message, agent message, and live A2UI surface card', async ({page}) => {
    await connectMockAgent(page);

    // Send prompt
    const textarea = page.locator('.prompt-textarea');
    await textarea.fill('Find non-stop flights from SFO to NRT next month');
    await textarea.press('Enter');

    const chatHistory = page.locator('a2ui-composer-chat-history');
    await expect(chatHistory).toBeVisible();

    // Verify User Message
    const userBubble = chatHistory.locator('.user-message-bubble');
    await expect(userBubble).toBeVisible();
    await expect(userBubble).toContainText('Find non-stop flights from SFO to NRT next month');

    // Verify Agent Message & A2UI Surface
    const agentContainer = chatHistory.locator('.agent-message-container');
    await expect(agentContainer).toBeVisible();
    await expect(chatHistory.locator('.agent-badge-name')).toContainText(
      'Smart Travel Planner Agent',
    );
    await expect(chatHistory.locator('.canvas-artifact-card')).toBeVisible();
    await expect(chatHistory.locator('.view-canvas-btn')).toBeVisible();

    await expect(chatHistory).toHaveScreenshot('chat-conversation-and-surface.png');
  });

  test('renders an inline surface above or below the text to match the order the agent sent', async ({
    page,
  }) => {
    // Render the inline frames with the local Angular guest so their pixels
    // come from this checkout rather than the GitHub Pages build.
    await page.route('**/config.json', route =>
      route.fulfill({json: {renderers: {default: {rendererUrl: RENDERER_URLS.angular}}}}),
    );

    // Turn 1 answers surface-then-text, turn 2 text-then-surface.
    let turn = 0;
    await connectMockAgent(page, 'http://mock-agent.local', postData => {
      turn += 1;
      const parts = postData.includes('surface first')
        ? [
            inlineSurfacePart(`turn-${turn}`, 'Surface sent first', 'Rendered above the text'),
            {text: 'The agent sent this text after the surface, so it reads below it.'},
          ]
        : [
            {text: 'The agent sent this text before the surface, so the surface follows it.'},
            inlineSurfacePart(`turn-${turn}`, 'Surface sent last', 'Rendered below the text'),
          ];
      return sseEvent({
        taskId: `task-order-${turn}`,
        contextId: 'ctx-surface-order',
        message: {role: 'agent', parts},
        final: true,
      });
    });

    const chatHistory = page.locator('a2ui-composer-chat-history');
    const textarea = page.locator('.prompt-textarea');

    await textarea.fill('surface first');
    await textarea.press('Enter');
    await expect(chatHistory.locator('.agent-text-content').first()).toContainText(
      'after the surface',
    );

    await textarea.fill('text first');
    await textarea.press('Enter');
    await expect(chatHistory.locator('.agent-text-content').nth(1)).toContainText(
      'before the surface',
    );

    // Both guest frames must have drawn their surface before the pictures are taken.
    const inlineFrames = chatHistory.locator('.inline-surface-card iframe.preview-iframe');
    await expect(inlineFrames).toHaveCount(2);
    await expect(inlineFrames.nth(0).contentFrame().getByText('Surface sent first')).toBeVisible({
      timeout: SURFACE_RENDER_TIMEOUT_MS,
    });
    await expect(inlineFrames.nth(1).contentFrame().getByText('Surface sent last')).toBeVisible({
      timeout: SURFACE_RENDER_TIMEOUT_MS,
    });

    // The history scrolls to the newest message, so snapshot each bubble on
    // its own rather than the scroll container, which would crop the first one.
    const agentBubbles = chatHistory.locator('.agent-message-container');
    await expect(agentBubbles).toHaveCount(2);
    await expect(agentBubbles.nth(0)).toHaveScreenshot('chat-message-inline-surface-first.png');
    await expect(agentBubbles.nth(1)).toHaveScreenshot('chat-message-inline-surface-last.png');
  });

  test('renders pending loading indicator when waiting for agent response', async ({page}) => {
    let fulfillStream: () => void = () => {};
    await page.route('http://mock-agent.local/**', async route => {
      const url = route.request().url();
      if (url.includes('.well-known') || url.includes('agent.json')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAgentCard),
        });
      } else {
        // Hold the stream response open so the pending indicator displays
        await new Promise<void>(resolve => {
          fulfillStream = resolve;
        });
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          headers: {'Cache-Control': 'no-cache', Connection: 'keep-alive'},
          body: sseFlightBody,
        });
      }
    });

    await page.goto('/a2a');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/a2a');

    const configPanel = page.locator('.agent-config-panel-card');
    await configPanel.getByLabel('Agent Endpoint URL').fill('http://mock-agent.local');
    await configPanel.getByRole('button', {name: 'Connect Agent'}).click();

    await configPanel.waitFor({state: 'hidden'});
    await page.locator('a2ui-composer-agent-header').waitFor({state: 'visible'});

    // Send prompt
    const textarea = page.locator('.prompt-textarea');
    await textarea.fill('Find flights from SFO to NRT');
    await textarea.press('Enter');

    const chatHistory = page.locator('a2ui-composer-chat-history');
    await expect(chatHistory).toBeVisible();

    const pendingIndicator = chatHistory.locator('.pending-response-indicator');
    await expect(pendingIndicator).toBeVisible();
    await expect(pendingIndicator.locator('.typing-dots')).toBeVisible();

    await expect(chatHistory).toHaveScreenshot('chat-message-pending-indicator.png');

    fulfillStream();
  });
});
