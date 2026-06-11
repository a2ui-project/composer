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

test.describe('Debugging Panels & Diagnostic Logs', () => {
  test('verifies collapsible debug drawer layout and global clear sweeps', async ({page}) => {
    const debugSection = page.locator('.debug-section');
    await expect(debugSection).not.toHaveClass(/collapsed/);

    const collapseBtn = page.getByRole('button', {name: 'Toggle Debug Panel'});
    await collapseBtn.click();
    await expect(debugSection).toHaveClass(/collapsed/);

    await collapseBtn.click();
    await expect(debugSection).not.toHaveClass(/collapsed/);

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

    // Verify Events tab mapping
    await page.getByRole('tab', {name: 'Events'}).click();
    const eventRow = page.locator('.events-container table tr.element-row');
    await expect(eventRow).toHaveCount(1);
    await expect(page.locator('.events-container table')).toContainText('e2e_button_click');

    // Verify Errors tab consolidation & stack trace expansion
    await page.getByRole('tab', {name: 'Errors'}).click();
    const errorRow = page.locator('.errors-container table tr.element-row');
    await expect(errorRow).toHaveCount(1);
    await expect(page.locator('.errors-container table')).toContainText('E2E Exception trace');

    const expandBtn = page.getByRole('button', {name: 'Toggle Stack Trace'});
    await expandBtn.click();
    await expect(page.locator('.stack-preview')).toBeVisible();
    await expect(page.locator('.stack-preview')).toContainText('Error: E2E Failure');

    // Verify Data Model tab valid/invalid JSON alerts
    await page.getByRole('tab', {name: 'Data Model'}).click();
    const dataModelField = page.locator('.data-model-field textarea');
    await dataModelField.fill('{"valid": true}');
    await expect(page.locator('.invalid-json-badge')).not.toBeVisible();

    await dataModelField.fill('{"invalid": }');
    await expect(page.locator('.invalid-json-badge')).toBeVisible();

    // Verify Global Clear
    const clearBtn = page.getByRole('button', {name: 'Clear Logs'});
    await clearBtn.click();

    // Warnings remain, but logs clear
    await expect(page.locator('.invalid-json-badge')).toBeVisible();

    await page.getByRole('tab', {name: 'Events'}).click();
    await expect(page.locator('.events-placeholder')).toBeVisible();

    await page.getByRole('tab', {name: 'Errors'}).click();
    await expect(page.locator('.errors-placeholder')).toBeVisible();
  });

  test('verifies console log warning routing from preview frame to Errors tab', async ({page}) => {
    const iframeBody = page.frameLocator('iframe.preview-iframe').locator('body');
    await expect(iframeBody).toBeVisible();
    await page.waitForTimeout(1000);

    const logMsg = {
      type: PreviewBridgeMessageType.CONSOLE_LOG,
      payload: {level: 'warn', message: 'Telemetry active warn'},
    };
    await iframeBody.evaluate((_, msg) => {
      window.parent.postMessage(msg, '*');
    }, logMsg);

    await page.getByRole('tab', {name: 'Errors'}).click();
    const errorRow = page.locator('.errors-container table tr.element-row').first();
    await expect(errorRow).toBeVisible();
    const rowText = await errorRow.textContent();
    expect(rowText).toContain('warn');
    expect(rowText).toContain('console');
    expect(rowText).toContain('Telemetry active warn');
  });

  test('verifies unread tab badging animations and resets', async ({page}) => {
    await page.getByRole('tab', {name: 'Data Model'}).click();

    const eventsTabLabel = page.locator('.mat-mdc-tab-label-container .mdc-tab:nth-child(2)');
    const eventsBadge = eventsTabLabel.locator('.mat-badge-content');
    await expect(eventsBadge).toBeHidden();

    const errorsTabLabel = page.locator('.mat-mdc-tab-label-container .mdc-tab:nth-child(3)');
    const errorsBadge = errorsTabLabel.locator('.mat-badge-content');
    await expect(errorsBadge).toBeHidden();

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

    await expect(eventsBadge).toBeVisible();
    await expect(eventsBadge).toContainText('1');
    await expect(errorsBadge).toBeVisible();
    await expect(errorsBadge).toContainText('1');

    await page.getByRole('tab', {name: /Events/}).click();
    await expect(eventsBadge).toBeHidden();

    await page.getByRole('tab', {name: /Errors/}).click();
    await expect(errorsBadge).toBeHidden();
  });

  test('verifies New Session reset button clears localStorage session cache', async ({page}) => {
    await page.evaluate(() => {
      try {
        localStorage.setItem('a2ui_composer_session_state', 'test_value');
      } catch (e) {}
    });

    await page.evaluate(() => {
      (window as unknown as {__BEFORE_RELOAD__?: boolean}).__BEFORE_RELOAD__ = true;
    });

    await page.getByRole('button', {name: 'New Session'}).click();

    // Wait for the page reload navigation to complete
    await page.waitForFunction(
      () => (window as unknown as {__BEFORE_RELOAD__?: boolean}).__BEFORE_RELOAD__ === undefined,
    );

    const testVal = await page.evaluate(() => {
      try {
        return localStorage.getItem('a2ui_composer_session_state');
      } catch (e) {
        return null;
      }
    });
    expect(testVal).toBeNull();
  });
});
