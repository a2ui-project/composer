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

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });
});

test.describe('Components Gallery User Journey', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
      } catch (e) {}
    });
  });

  test('verifies navigation from home and loading components catalog details', async ({
    page,
    context,
  }, testInfo) => {
    // Enable clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // 1. Navigate to home with a valid renderer to trigger the catalog handshake
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();

    // Wait for the workspace to load, indicating handshake completed
    const workspaceIframe = page.locator('.workspace-container iframe');
    await expect(workspaceIframe).toBeVisible();

    // Wait for the catalog handshake to complete (indicated by header title updating)
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');

    // 2. Click on the gallery link in the sidebar
    const galleryLink = page.getByRole('link', {name: 'Components Gallery'});
    await expect(galleryLink).toBeVisible();
    await galleryLink.click();

    // 3. Redirected to /gallery and layout loads successfully
    await page.waitForURL('**/gallery');
    await expect(page.locator('.gallery-container')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'No Component Selected'})).toBeVisible();

    // 4. Verify component catalog navigation is visible
    const navItems = page.locator('.catalog-list').getByRole('button');
    await expect(navItems.first()).toBeVisible();

    // Read the name of the first component dynamically to ensure test robustness
    const firstComponentName = (await navItems.first().textContent())?.trim();
    expect(firstComponentName).toBeTruthy();

    // 5. Click the first component
    await navItems.first().click();

    // 6. Assert details pane is updated
    await expect(page.getByRole('heading', {name: firstComponentName!, exact: true})).toBeVisible();

    // Assert card headers are visible
    const cardHeaders = page.locator('mat-card-header mat-card-title');
    await expect(cardHeaders).toHaveText(['Preview', 'Usage', 'Properties']);

    // 7. Assert properties table is populated
    const propertiesTable = page.getByRole('table');
    await expect(propertiesTable).toBeVisible();
    const rows = propertiesTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // 8. Assert usage card renders the usage JSON block representing a raw components array
    const usageCode = page.locator('pre code');
    await expect(usageCode).toBeVisible();
    await expect(usageCode).toContainText(`"component": "${firstComponentName!}"`);
    const usageCodeText = (await usageCode.textContent()) || '';
    expect(usageCodeText.trim().startsWith('[')).toBe(true);
    expect(usageCodeText.trim().endsWith(']')).toBe(true);
    expect(usageCodeText).not.toContain('"usage": [');
    expect(usageCodeText).not.toContain('createSurface');
    expect(usageCodeText).not.toContain('updateComponents');

    // Explicitly select AudioPlayer to verify its custom usages rendering
    const audioPlayerItem = page
      .locator('.catalog-list')
      .getByRole('button', {name: 'AudioPlayer', exact: true});
    await expect(audioPlayerItem).toBeVisible();
    await audioPlayerItem.click();
    await expect(page.locator('pre code')).toContainText('"description": "Deep dive into A2UI"');
    const audioUsageCodeText = (await page.locator('pre code').textContent()) || '';
    expect(audioUsageCodeText).not.toContain('Audio Clip');

    // Click back to first component to continue the rest of the test flow
    await navItems.first().click();

    // 9. Assert sandboxed preview frame is mounted and has an iframe
    const renderedFrame = page.locator('a2ui-composer-rendered-frame');
    await expect(renderedFrame).toBeVisible();
    const iframe = renderedFrame.locator('iframe');
    await expect(iframe).toBeVisible();

    // 10. Click copy to clipboard and assert clipboard content represents a JSONLines envelope
    const copyButton = page.getByRole('button', {name: /copy/i});
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Assert clipboard matches using expect.poll (avoiding waitForTimeout)
    await expect
      .poll(async () => {
        const text = await page.evaluate(() => navigator.clipboard.readText());
        const lines = text.trim().split('\n');
        if (lines.length !== 2) {
          return {error: `Expected 2 lines, got ${lines.length}`};
        }
        try {
          const line1 = JSON.parse(lines[0]) as Record<string, unknown>;
          const line2 = JSON.parse(lines[1]) as Record<string, unknown>;
          const createSurface = line1['createSurface'] as Record<string, unknown> | undefined;
          const updateComponents = line2['updateComponents'] as Record<string, unknown> | undefined;
          const components = updateComponents?.['components'] as
            | Array<Record<string, unknown>>
            | undefined;
          const hasComponent =
            Array.isArray(components) &&
            components.some(c => c['component'] === firstComponentName);
          return {
            line1Version: line1['version'],
            hasCreateSurface: typeof createSurface === 'object' && createSurface !== null,
            hasCatalogId: typeof createSurface?.['catalogId'] === 'string',
            line2Version: line2['version'],
            hasUpdateComponents: typeof updateComponents === 'object' && updateComponents !== null,
            componentsArray: Array.isArray(components),
            hasComponent,
          };
        } catch (e) {
          return {error: 'Failed to parse JSON lines'};
        }
      })
      .toEqual({
        line1Version: 'v0.9',
        hasCreateSurface: true,
        hasCatalogId: true,
        line2Version: 'v0.9',
        hasUpdateComponents: true,
        componentsArray: true,
        hasComponent: true,
      });

    // 11. Verify in-place update when clicking the second component
    const secondNavItem = navItems.nth(1);
    await expect(secondNavItem).toBeVisible();
    const secondComponentName = (await secondNavItem.textContent())?.trim();
    expect(secondComponentName).toBeTruthy();

    const detailsPanel = page.locator('.details-panel');
    await detailsPanel.evaluate(el => {
      el.setAttribute('data-test-marker', 'in-place-verify');
    });

    await secondNavItem.click();

    // Title and usage code should update to second component
    await expect(
      page.getByRole('heading', {name: secondComponentName!, exact: true}),
    ).toBeVisible();

    await expect(page.locator('pre code')).toContainText(`"component": "${secondComponentName!}"`);
    const secondUsageCodeText = (await page.locator('pre code').textContent()) || '';
    expect(secondUsageCodeText.trim().startsWith('[')).toBe(true);
    expect(secondUsageCodeText.trim().endsWith(']')).toBe(true);
    expect(secondUsageCodeText).not.toContain('"usage": [');
    expect(secondUsageCodeText).not.toContain('createSurface');
    expect(secondUsageCodeText).not.toContain('updateComponents');

    // Assert that the marker is still present, proving the DOM element was reused in-place
    await expect(detailsPanel).toHaveAttribute('data-test-marker', 'in-place-verify');

    // Take screenshot for verification
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('gallery-user-journey-success', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });
});
