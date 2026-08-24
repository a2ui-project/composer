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

test.describe('A2aAgentHeader Visual Regression & Layout', () => {
  test('renders connected agent header with metadata pills and actions', async ({page}) => {
    await connectMockAgent(page);

    const header = page.locator('a2ui-composer-agent-header');
    await expect(header).toBeVisible();
    await expect(header.locator('.agent-title')).toContainText('Smart Travel Planner Agent');
    await expect(header.locator('.agent-version-chip')).toContainText('1.2.0');
    await expect(header.locator('.endpoint-text')).toContainText('http://mock-agent.local');
    await expect(header.locator('.inspector-toggle-btn')).toBeVisible();
    await expect(header.locator('.new-session-btn')).toContainText('New conversation');
    await expect(header.locator('.settings-btn')).toBeVisible();
    await expect(header.locator('.settings-btn mat-icon')).toHaveText('build');

    await expect(header).toHaveScreenshot('agent-header.png');
  });
});
