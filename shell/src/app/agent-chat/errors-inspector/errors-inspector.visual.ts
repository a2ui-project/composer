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

test.describe('A2aErrorsInspector Visual Regression & Layout', () => {
  test('renders initial errors inspector', async ({page}) => {
    await page.clock.setFixedTime(new Date('2026-09-18T11:24:22Z'));

    await page.route('**/config.json', route =>
      route.fulfill({
        json: {
          renderers: {
            default: {rendererUrl: 'http://localhost:4200'},
          },
        },
      }),
    );

    await connectMockAgent(page);

    const errorsToggleBtn = page.locator('.errors-toggle-btn');
    await expect(errorsToggleBtn.locator('.errors-count-badge')).toBeHidden();

    await errorsToggleBtn.click();

    const inspector = page.locator('a2ui-composer-errors-inspector');
    await expect(inspector).toBeVisible();
    await expect(inspector.locator('.errors-inspector-title')).toHaveText('Errors');
    await expect(inspector.locator('.errors-container table')).toBeVisible();
    await expect(inspector).toHaveScreenshot('errors-inspector.png');
  });
});
