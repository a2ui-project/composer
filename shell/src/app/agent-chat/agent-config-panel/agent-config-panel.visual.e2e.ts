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

import {test, expect, type Locator} from '@playwright/test';

async function waitForImageLoad(locator: Locator): Promise<void> {
  await locator.evaluate((img: HTMLImageElement) =>
    img.complete && img.naturalWidth > 0
      ? Promise.resolve()
      : new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
  );
}

test.describe('AgentConfigPanel Visual Regression & Layout', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/a2a');
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {}
    });
    await page.reload();
  });

  test('renders default modal configuration card with avatar, title, subtitle, and input hints', async ({
    page,
  }) => {
    const panel = page.locator('.agent-config-panel-card');
    await expect(panel).toBeVisible();

    // Verify DOM structure, avatar logo, titles, and button states
    const avatar = panel.locator('.avatar-image');
    await expect(avatar).toHaveAttribute('src', /Untitled_design\.original\.png/);
    await waitForImageLoad(avatar);

    const title = panel.locator('.config-title');
    await expect(title).toHaveText('A2A Agent Configuration');

    const subtitle = panel.locator('.config-subtitle');
    await expect(subtitle).toContainText('Configure the target A2A service endpoint');

    const saveBtn = panel.locator('.save-btn');
    await expect(saveBtn).toBeDisabled();
    await expect(saveBtn).toContainText('Connect Agent');

    const clearBtn = panel.locator('.clear-address-btn');
    await expect(clearBtn).toBeVisible();
    await expect(clearBtn).toContainText('Clear Address');

    await expect(panel).toHaveScreenshot('agent-config-panel.png');
  });

  test('renders connection error alert banner with warning icon and message', async ({page}) => {
    await page.route('http://mock-failing-agent.local/**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({error: 'Agent service unavailable'}),
      });
    });

    await page.goto('/a2a');
    const panel = page.locator('.agent-config-panel-card');
    await expect(panel).toBeVisible();

    const avatar = panel.locator('.avatar-image');
    await expect(avatar).toHaveAttribute('src', /Untitled_design\.original\.png/);
    await waitForImageLoad(avatar);

    await panel.getByLabel('Agent Endpoint URL').fill('http://mock-failing-agent.local');
    await panel.locator('.save-btn').click();

    const errorBox = panel.locator('.connection-error-box');
    await expect(errorBox).toBeVisible();
    await expect(errorBox.locator('mat-icon')).toHaveText('error_outline');
    await expect(errorBox.locator('.error-msg')).toContainText(
      'Failed to retrieve AgentCard from A2A service',
    );

    await expect(panel).toHaveScreenshot('agent-config-panel-error.png');
  });

  test('renders populated configuration card with endpoint and tenant ID ready to connect', async ({
    page,
  }) => {
    await page.goto('/a2a');
    const panel = page.locator('.agent-config-panel-card');
    await expect(panel).toBeVisible();

    const avatar = panel.locator('.avatar-image');
    await expect(avatar).toHaveAttribute('src', /Untitled_design\.original\.png/);
    await waitForImageLoad(avatar);

    await panel.getByLabel('Agent Endpoint URL').fill('http://localhost:8088');
    await panel.getByLabel('Tenant ID').fill('tenant-prod-east');

    const saveBtn = panel.locator('.save-btn');
    await expect(saveBtn).toBeEnabled();

    await expect(panel).toHaveScreenshot('agent-config-panel-populated.png');
  });
});
