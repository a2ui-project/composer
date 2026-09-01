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
import {connectMockAgent} from './test/mock-a2a-agent';

test.describe('A2aChatView Full Orchestration Visual Regression & Layout', () => {
  test('renders orchestrated full page layout with header, conversation, input, and inspector drawer', async ({
    page,
  }) => {
    await connectMockAgent(page);

    // Verify root layout container and child components
    await expect(page.locator('.a2a-chat-view-root')).toBeVisible();
    await expect(page.locator('a2ui-composer-agent-header')).toBeVisible();
    await expect(page.locator('.chat-main-layout')).toBeVisible();
    await expect(page.locator('.chat-viewport-column')).toBeVisible();
    await expect(page.locator('a2ui-composer-chat-history')).toBeVisible();
    await expect(page.locator('a2ui-composer-input-area')).toBeVisible();

    // Send prompt
    const textarea = page.locator('.prompt-textarea');
    await textarea.fill('Find non-stop flights from SFO to NRT next month');
    await textarea.press('Enter');
    await expect(page.locator('.agent-message-container')).toContainText('Flight NH007');

    // Open inspector drawer
    await page.locator('.inspector-toggle-btn').click();
    await expect(page.locator('a2ui-composer-message-inspector')).toBeVisible();
    await expect(page.locator('.chat-main-layout.with-inspector')).toBeVisible();

    await expect(page).toHaveScreenshot('a2a-full-chat-view.png', {fullPage: true});
  });
});
