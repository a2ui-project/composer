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
import {
  FAKE_GEMINI_API_KEY,
  installGeminiFixture,
  setGeminiScenarios,
  splitTextIntoGeminiChunks,
} from '../../../../e2e/helpers/gemini-fixture';

const RENDERER_URL = 'http://localhost:3456';

test.describe('CopilotKitChatPanel Visual Regression', () => {
  test.beforeEach(async ({page}) => {
    await installGeminiFixture(page);
    await page.route('**/config.json', route =>
      route.fulfill({
        json: {
          renderers: {default: {rendererUrl: RENDERER_URL, displayName: 'Angular Basic'}},
          apiKeys: {default: {displayName: 'Visual test key', apiKey: FAKE_GEMINI_API_KEY}},
        },
      }),
    );
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('a2ui_composer_force_3p', 'true');
    });
  });

  // CopilotKit's own styles fade the message list into a white gradient above the
  // prompt. Composer's theme maps that fade to the Material surface color; in dark
  // mode, a regression shows up as a white band above the input.
  test('renders a conversation in dark mode with the message fade in the surface color', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${RENDERER_URL}`);
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');

    const panel = page.locator('a2ui-composer-chat-panel');
    await setGeminiScenarios(page, [
      {
        chunks: splitTextIntoGeminiChunks(
          'I can help with that. Tell me which part of the canvas to change.',
        ),
      },
    ]);
    await panel.getByLabel('Chat prompt').fill('Make the booking form easier to scan.');
    await panel.getByRole('button', {name: 'Send prompt'}).click();
    await expect(panel).toContainText('Tell me which part of the canvas to change.');

    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    await expect(panel).toHaveScreenshot('copilotkit-chat-panel-dark.png');
  });
});
