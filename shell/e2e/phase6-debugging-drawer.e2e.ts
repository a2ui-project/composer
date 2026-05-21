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
import {PreviewBridgeMessageType} from 'a2ui-bridge';

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  // Mock custom renderer response
  await page.route('http://custom-renderer.com/*', async route => {
    await route.fulfill({
      contentType: 'text/html',
      body: `<!DOCTYPE html><html><body>Preview</body></html>`,
    });
  });

  await page.goto('/?renderer=http://custom-renderer.com/index.html');
  await page.evaluate(() => {
    try {
      localStorage.clear();
      localStorage.setItem('a2ui_composer_force_1p', 'true');
    } catch (e) {}
  });
  await page.goto('/?renderer=http://custom-renderer.com/index.html');
});

test.describe('Phase 6 Interactive Debugging Panels', () => {
  test('verifies collapsible debug drawer and global clear sweeps', async ({page}) => {
    // 1. Verify debug panel is expanded by default on mount in 1P mode
    const debugSection = page.locator('.debug-section');
    await expect(debugSection).not.toHaveClass(/collapsed/);

    // 2. Collapse debug drawer via toggle button
    const collapseBtn = page.getByRole('button', {name: 'Toggle Debug Panel'});
    await collapseBtn.click();
    await expect(debugSection).toHaveClass(/collapsed/);

    // 3. Expand debug drawer back
    await collapseBtn.click();
    await expect(debugSection).not.toHaveClass(/collapsed/);

    // 4. Locate iframe and evaluate postMessage events originating from iframe
    const iframeBody = page.frameLocator('iframe.preview-iframe').locator('body');
    await expect(iframeBody).toBeVisible();
    await page.waitForTimeout(1000);

    const clickMsg = {
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        version: 'v0.9',
        action: {
          name: 'e2e_button_click',
          surfaceId: 'e2e_surface',
          sourceComponentId: 'e2e_btn',
          context: {test: true},
        },
      },
    };
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, clickMsg);

    await page.waitForTimeout(100);

    const errorMsg = {
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'E2E Exception trace',
        stack: 'Error: E2E Failure\n  at e2e.ts:20',
      },
    };
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, errorMsg);

    // 5. Switch to Events tab to verify it mapped the event correctly
    await page.getByRole('tab', {name: 'Events'}).click();
    const eventRow = page.locator('.events-container table tr.element-row');
    await expect(eventRow).toHaveCount(1);
    await expect(page.locator('.events-container table')).toContainText('e2e_button_click');

    // 6. Switch to Errors tab to verify exception consolidation and expansion
    await page.getByRole('tab', {name: 'Errors'}).click();
    const errorRow = page.locator('.errors-container table tr.element-row');
    await expect(errorRow).toHaveCount(1);
    await expect(page.locator('.errors-container table')).toContainText('E2E Exception trace');

    // Expand the stack trace detail panel
    const expandBtn = page.getByRole('button', {name: 'Toggle Stack Trace'});
    await expandBtn.click();
    await expect(page.locator('.stack-preview')).toBeVisible();
    await expect(page.locator('.stack-preview')).toContainText('Error: E2E Failure');

    // 7. Switch to Data Model tab and enter valid JSON
    await page.getByRole('tab', {name: 'Data Model'}).click();
    const dataModelField = page.locator('.data-model-field textarea');
    await dataModelField.fill('{"valid": true}');
    await expect(page.locator('.invalid-json-badge')).not.toBeVisible();

    // Enter invalid JSON to assert syntax warning badge appears
    await dataModelField.fill('{"invalid": }');
    await expect(page.locator('.invalid-json-badge')).toBeVisible();

    // 8. Click Global Clear Sweeps button
    const clearBtn = page.getByRole('button', {name: 'Clear Logs'});
    await clearBtn.click();

    // Assert Data Model syntax warning remains (not a log, should be unaffected)
    await expect(page.locator('.invalid-json-badge')).toBeVisible();

    // Assert Events table is empty (shows placeholder)
    await page.getByRole('tab', {name: 'Events'}).click();
    await expect(page.locator('.events-placeholder')).toBeVisible();

    // Assert Errors table is empty (shows placeholder)
    await page.getByRole('tab', {name: 'Errors'}).click();
    await expect(page.locator('.errors-placeholder')).toBeVisible();
  });

  test('verifies unread tab badging animations and resets', async ({page}) => {
    // Start in Data Model tab (index 0)
    await page.getByRole('tab', {name: 'Data Model'}).click();

    // Events badge should be hidden initially
    const eventsTabLabel = page.locator('.mat-mdc-tab-label-container .mdc-tab:nth-child(2)');
    const eventsBadge = eventsTabLabel.locator('.mat-badge-content');
    await expect(eventsBadge).toBeHidden();

    // Errors badge should be hidden initially
    const errorsTabLabel = page.locator('.mat-mdc-tab-label-container .mdc-tab:nth-child(3)');
    const errorsBadge = errorsTabLabel.locator('.mat-badge-content');
    await expect(errorsBadge).toBeHidden();

    // Locate iframe and evaluate postMessage unread events originating from iframe
    const iframeBody = page.frameLocator('iframe.preview-iframe').locator('body');
    await expect(iframeBody).toBeVisible();
    await page.waitForTimeout(1000);

    const unreadClickMsg = {
      type: PreviewBridgeMessageType.SEND_TO_SERVER,
      payload: {
        version: 'v0.9',
        action: {
          name: 'click_unread',
          surfaceId: 's_unread',
        },
      },
    };
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, unreadClickMsg);

    await page.waitForTimeout(100);

    const crashMsg = {
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {
        level: 'error',
        message: 'Telemetry Crash log',
      },
    };
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, crashMsg);

    // Assert unread badges incremented and appear visible
    await expect(eventsBadge).toBeVisible();
    await expect(eventsBadge).toContainText('1');
    await expect(errorsBadge).toBeVisible();
    await expect(errorsBadge).toContainText('1');

    // Switch to Events Tab and verify it resets events unread counter to 0 and hides
    await page.getByRole('tab', {name: /Events/}).click();
    await expect(eventsBadge).toBeHidden();

    // Switch to Errors Tab and verify it resets errors unread counter to 0 and hides
    await page.getByRole('tab', {name: /Errors/}).click();
    await expect(errorsBadge).toBeHidden();
  });
});
