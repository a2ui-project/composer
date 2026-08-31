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
import {connectMockAgent} from '../test/mock-a2a-agent';

test.describe('A2aChatHistory Visual Regression & Layout', () => {
  test('renders empty welcome showcase with capability badges and sample prompts', async ({
    page,
  }) => {
    await connectMockAgent(page);

    const chatHistory = page.locator('a2ui-composer-chat-history');
    await expect(chatHistory).toBeVisible();
    await expect(chatHistory.locator('.welcome-card')).toBeVisible();
    await expect(chatHistory.locator('.welcome-title')).toContainText('Smart Travel Planner Agent');
    await expect(chatHistory.locator('.capability-chips')).toBeVisible();

    await expect(chatHistory).toHaveScreenshot('chat-history-welcome.png');
  });

  test('renders chat history with 2 conversation turns (2 user queries and 2 agent responses)', async ({
    page,
  }) => {
    await connectMockAgent(page);

    const chatHistory = page.locator('a2ui-composer-chat-history');
    await expect(chatHistory).toBeVisible();

    // Turn 1
    const textarea = page.locator('.prompt-textarea');
    await textarea.fill('What is the best season to visit Tokyo?');
    await textarea.press('Enter');
    await expect(chatHistory.locator('.agent-message-container').first()).toContainText(
      'cherry blossoms',
    );

    // Turn 2
    await textarea.fill('Recommend good areas to stay in Tokyo');
    await textarea.press('Enter');
    await expect(chatHistory.locator('.agent-message-container').nth(1)).toContainText(
      'Shinjuku or Shibuya',
    );

    // Assertions
    await expect(chatHistory.locator('.user-message-bubble')).toHaveCount(2);
    await expect(chatHistory.locator('.agent-message-container')).toHaveCount(2);
    await expect(chatHistory.locator('.welcome-card')).not.toBeVisible();

    await expect(chatHistory).toHaveScreenshot('chat-history-two-turns.png');
  });

  test('renders chat history with 1 conversation turn including a canvas artifact', async ({
    page,
  }) => {
    await connectMockAgent(page);

    const chatHistory = page.locator('a2ui-composer-chat-history');
    await expect(chatHistory).toBeVisible();

    // Turn 1 with canvas
    const textarea = page.locator('.prompt-textarea');
    await textarea.fill('Find non-stop flights from SFO to NRT next month');
    await textarea.press('Enter');

    // Assertions
    await expect(chatHistory.locator('.user-message-bubble')).toBeVisible();
    await expect(chatHistory.locator('.user-message-bubble')).toContainText(
      'Find non-stop flights from SFO to NRT next month',
    );
    await expect(chatHistory.locator('.agent-message-container')).toBeVisible();
    await expect(chatHistory.locator('.canvas-artifact-card')).toBeVisible();
    await expect(chatHistory.locator('.view-canvas-btn')).toBeVisible();
    await expect(chatHistory.locator('.welcome-card')).not.toBeVisible();

    await expect(chatHistory).toHaveScreenshot('chat-history-with-canvas.png');
  });
});
