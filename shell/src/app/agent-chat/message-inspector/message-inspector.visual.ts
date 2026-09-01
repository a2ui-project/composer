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

test.describe('A2aMessageInspector Visual Regression & Layout', () => {
  test('renders protocol inspector drawer with filter chips, search bar, and events', async ({
    page,
  }) => {
    await connectMockAgent(page);

    // Send prompt to generate events
    const textarea = page.locator('.prompt-textarea');
    await textarea.fill('Find non-stop flights from SFO to NRT next month');
    await textarea.press('Enter');
    await expect(page.locator('.agent-message-container')).toBeVisible({timeout: 10000});

    // Open Inspector Drawer
    await page.locator('.inspector-toggle-btn').click();
    const inspector = page.locator('a2ui-composer-message-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector.locator('.inspector-title')).toContainText('A2A Message Inspector');
    await expect(inspector.locator('.event-counter-badge')).toBeVisible();
    await expect(inspector.locator('.clear-all-btn')).toBeVisible();
    await expect(inspector.locator('.filter-chips')).toBeVisible();
    await expect(inspector.locator('.search-input')).toBeVisible();

    await expect(inspector).toHaveScreenshot('message-inspector-drawer.png');
  });

  test('renders empty inspector state when events are cleared', async ({page}) => {
    await connectMockAgent(page);

    // Open Inspector Drawer without sending prompts
    await page.locator('.inspector-toggle-btn').click();
    const inspector = page.locator('a2ui-composer-message-inspector');
    await expect(inspector).toBeVisible();

    // Clear any existing handshake events
    if (await inspector.locator('.clear-all-btn').isVisible()) {
      await inspector.locator('.clear-all-btn').click();
    }

    const emptyState = inspector.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState.locator('.empty-icon')).toHaveText('history');
    await expect(emptyState.locator('p')).toContainText('No matching A2A protocol events recorded');

    await expect(inspector).toHaveScreenshot('message-inspector-empty.png');
  });
});
