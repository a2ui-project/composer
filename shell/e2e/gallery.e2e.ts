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

    // 4. Verify component catalog navigation is visible
    const navItems = page.locator('.catalog-list').getByRole('button');
    await expect(navItems.first()).toBeVisible();

    // Read the name of the first component dynamically to ensure test robustness
    const firstComponentName = (await navItems.first().textContent())?.trim();
    expect(firstComponentName).toBeTruthy();

    // 5. Assert first component is automatically selected upon gallery navigation and details pane is updated
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
    await page.locator('.usage-details summary').click();
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
    await iframe.evaluate(el => el.setAttribute('data-test-marker', 'persistent-preview'));

    // 10. Click copy to clipboard and assert clipboard content represents a JSON array envelope
    const copyButton = page.getByRole('button', {name: /copy/i});
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Assert clipboard matches using expect.poll (avoiding waitForTimeout)
    await expect
      .poll(async () => {
        const text = await page.evaluate(() => navigator.clipboard.readText());
        try {
          const commands = JSON.parse(text);
          if (!Array.isArray(commands)) {
            return {error: 'Expected a JSON array'};
          }
          if (commands.length !== 2) {
            return {error: `Expected 2 commands, got ${commands.length}`};
          }
          const cmd1 = commands[0] as Record<string, unknown>;
          const cmd2 = commands[1] as Record<string, unknown>;
          const createSurface = cmd1['createSurface'] as Record<string, unknown> | undefined;
          const updateComponents = cmd2['updateComponents'] as Record<string, unknown> | undefined;
          const components = updateComponents?.['components'] as
            Array<Record<string, unknown>> | undefined;
          const hasComponent =
            Array.isArray(components) &&
            components.some(c => c['component'] === firstComponentName);
          return {
            cmd1Version: cmd1['version'],
            hasCreateSurface: typeof createSurface === 'object' && createSurface !== null,
            hasCatalogId: typeof createSurface?.['catalogId'] === 'string',
            cmd2Version: cmd2['version'],
            hasUpdateComponents: typeof updateComponents === 'object' && updateComponents !== null,
            componentsArray: Array.isArray(components),
            hasComponent,
          };
        } catch (e) {
          return {error: 'Failed to parse JSON array'};
        }
      })
      .toEqual({
        cmd1Version: 'v0.9',
        hasCreateSurface: true,
        hasCatalogId: true,
        cmd2Version: 'v0.9',
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
    await expect(iframe).toHaveAttribute('data-test-marker', 'persistent-preview');

    // Take screenshot for verification
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('gallery-user-journey-success', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });

  test('keeps tall renderer controls inside the preview card and reachable', async ({page}) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await page.getByRole('link', {name: 'Components Gallery'}).click();

    const preview = page.frameLocator('.preview-card iframe');
    await expect(preview.locator('body')).toBeVisible();
    await preview.locator('body').evaluate(body => {
      const content = document.createElement('div');
      content.style.cssText = 'min-height:700px;display:flex;align-items:flex-end';
      const button = document.createElement('button');
      button.textContent = 'Tall preview action';
      button.addEventListener('click', () => (button.textContent = 'Action completed'));
      content.append(button);
      body.append(content);
    });

    const frame = page.locator('.preview-card iframe');
    await expect
      .poll(async () => (await frame.boundingBox())?.height ?? 0)
      .toBeGreaterThanOrEqual(700);
    await expect
      .poll(async () => {
        const cardBounds = await page.locator('.preview-card').boundingBox();
        const frameBounds = await frame.boundingBox();
        if (!cardBounds || !frameBounds) return -1;
        return cardBounds.y + cardBounds.height - frameBounds.y - frameBounds.height;
      })
      .toBeGreaterThanOrEqual(0);

    await page.locator('.gallery-content').evaluate(el => {
      const card = el.querySelector('.preview-card')!;
      el.scrollTop += card.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom;
    });
    const action = preview.getByRole('button', {name: 'Tall preview action'});
    await expect(action).toBeInViewport();
    await action.click();
    await expect(preview.getByRole('button', {name: 'Action completed'})).toBeVisible();
  });

  test('keeps the gallery beside its drawer when shell navigation changes width', async ({
    page,
  }) => {
    await page.setViewportSize({width: 820, height: 800});
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await page.getByRole('link', {name: 'Components Gallery'}).click();
    const toggle = page.getByRole('button', {name: 'Toggle sidenav'});
    await toggle.click();
    await expect(page.locator('.gallery-sidenav')).toHaveCSS('width', '144px');
    await page.setViewportSize({width: 830, height: 800});
    await expect
      .poll(() => page.locator('.gallery-content').evaluate(el => el.style.marginLeft))
      .toBe('144px');
    await toggle.click();
    await expect(page.locator('.gallery-sidenav')).toHaveCSS('width', '208px');
    await expect(page.locator('.gallery-content')).toHaveCSS('margin-left', '208px');
  });
  test('edits selected-catalog Text and opens the same valid example with its renderer', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await page.getByRole('link', {name: 'Components Gallery'}).click();
    await page.locator('.catalog-list').getByRole('button', {name: 'Text', exact: true}).click();
    const text = page.getByRole('textbox', {name: 'text', exact: true});
    await expect(text).toBeVisible();
    const edited = 'Ready to use from my selected catalog';
    await text.fill(edited);
    const preview = page.frameLocator('.preview-card iframe');
    await expect(preview.getByText(edited, {exact: true})).toBeVisible();

    await page.locator('.draft-editor summary').click();
    const draft = page.getByLabel('Components and optional data');
    await expect(draft).toHaveValue(new RegExp(edited));
    await draft.fill('{invalid');
    await expect(page.getByRole('alert').filter({hasText: 'last valid example'})).toBeVisible();
    await expect(preview.getByText(edited, {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Copy JSON', exact: true}).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain(edited);
    expect(JSON.parse(copied)[0].createSurface.catalogId).toBeTruthy();

    await page.getByRole('button', {name: 'Open in Composer', exact: true}).click();
    await page.waitForURL(url => !url.pathname.endsWith('/gallery') && url.hash.includes('a2ui='));
    const renderer = new URLSearchParams(new URL(page.url()).hash.slice(1)).get('renderer');
    expect(new URL(renderer!).origin).toBe('http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(edited, {exact: true}),
    ).toBeVisible();
  });
});
