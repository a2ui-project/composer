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
import {connectMockAgent, mockAgentCard, sseFlightBody} from '../test/mock-a2a-agent';

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
