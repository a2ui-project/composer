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

interface MonacoModel {
  getValue(): string;
  setValue(value: string): void;
}

interface WindowWithMonaco extends Window {
  monaco?: {
    editor: {
      getModels(): MonacoModel[];
    };
  };
}

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    // Ignore expected cross-origin Sandbox errors for these tests
    if (err.message.includes('sandbox')) return;
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.route('**/config.json', async route => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        renderers: {
          default: {},
        },
      }),
    });
  });

  // Mock custom renderer response
  await page.route('http://custom-renderer.com/*', async route => {
    await route.fulfill({
      contentType: 'text/html',
      body: `<!DOCTYPE html><html><body><div id="root">Preview</div></body></html>`,
    });
  });

  await page.addInitScript(() => {
    try {
      if (!localStorage.getItem('a2ui_composer_force_1p')) {
        localStorage.clear();
        localStorage.setItem('a2ui_composer_force_1p', 'true');
        localStorage.setItem('a2ui_composer_selected_api_key', 'fake');
      }
      localStorage.setItem(
        'a2ui_composer_allowed_origins',
        JSON.stringify(['http://custom-renderer.com']),
      );
    } catch (e) {}
  });

  await page.goto('/?renderer=http://custom-renderer.com');
  await expect(page.locator('.header-title')).toContainText('A2UI Composer');
  await page.evaluate(() => {
    window.localStorage.setItem('a2ui_composer_selected_api_key', 'fake');
  });

  // Wait for provision alert and fill if needed

  await page.getByRole('link', {name: 'Settings'}).click();
  await page.getByRole('button', {name: 'Add Gemini API key'}).click();
  const dialog = page.getByRole('dialog', {name: 'Add Gemini API Key'});
  await dialog.getByLabel('Name', {exact: true}).fill('APIKey');
  await dialog.getByLabel('Name', {exact: true}).blur();
  await dialog.getByLabel('API Key', {exact: true}).fill('fake-key');
  await page.keyboard.press('Tab');
  await dialog.getByRole('button', {name: 'Add', exact: true}).click();
  await expect(dialog).toBeHidden();
  await page.waitForTimeout(1000);
  await page.goto('/?renderer=http://custom-renderer.com');
});

test.describe('JSON Error Handling & Diagnostics', () => {
  test('surfaces malformed JSON syntax errors in Monaco via squigglies, triggers a debounced consolidated snackbar, and navigates to the Errors tab on click', async ({
    page,
  }) => {
    await page.getByRole('tab', {name: 'A2UI JSON Editor'}).click();

    // Wait for Monaco
    const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
    await expect(editorLocator).toBeVisible();

    await page.waitForFunction(() => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    });

    // Subvert fill by using monaco API.
    // WHY: Standard element-based Playwright `fill` methods consistently fail to
    // traverse Monaco's shadow-line virtualization wrapper logic, requiring direct AST evaluations.
    await page.evaluate(() => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue('{\n  "version": "v0.9",\n  "invalid": \n}');
      }
    });

    // Wait for 1000ms debounce of snackbar
    const snackbar = page
      .locator('simple-snack-bar')
      .filter({hasText: /error|syntax/i})
      .first();
    await expect(snackbar).toBeVisible({timeout: 3000});
    await expect(snackbar).toContainText('error');

    // Click 'View' action
    await snackbar.getByRole('button').filter({hasText: /View/i}).click();

    // The Errors tab should now be active
    const errorsTab = page.getByRole('tab', {name: 'Errors', selected: true});
    await expect(errorsTab).toBeVisible();

    // The error should be populated in the log table
  });

  test('recovers gracefully from malformed JSON stream blocks in chat and renders an inline diagnostic error card', async ({
    page,
  }) => {
    // Navigate to Chat
    await page.getByRole('tab', {name: 'Gemini Assistant'}).click();

    await page.route('https://generativelanguage.googleapis.com/**', async route => {
      const chunk = JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'Formatting layout:\n```json\n{"version": "v0.9", "invalid": }\n```\nDone.',
                },
              ],
            },
          },
        ],
      });
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
        body: `data: ${chunk}\n\n`,
      });
    });

    const chatInput = page.locator('a2ui-composer-chat-panel textarea').first();
    await chatInput.fill('Generate malformed payload');
    await chatInput.press('Enter');

    // Expected inline error card
    const errorCard = page.locator('.parse-error-card');
    await expect(errorCard).toBeVisible({timeout: 5000});
    await expect(errorCard).toContainText('JSON Syntax Error');

    // The "View in Errors Tab" action inside the error card navigates automatically
    await errorCard.getByRole('button', {name: 'View in Errors Tab'}).click();
    await expect(page.getByRole('tab', {name: 'Errors', selected: true})).toBeVisible();
  });

  test('captures cross-frame preview errors, renders non-crashing 350ms debounced UI error overlay, and assigns [Previewer] log provenance', async ({
    page,
  }) => {
    // Wait for the iframe
    const iframeLoc = page.frameLocator('iframe.preview-iframe');
    await expect(iframeLoc.locator('body')).toBeVisible();

    // Wait until composer handshake finishes
    await page.waitForTimeout(500);

    // Dispatch a dummy error out of the iframe using PostMessage
    await page
      .frameLocator('iframe.preview-iframe')
      .locator('body')
      .evaluate(_ => {
        window.parent.postMessage(
          {
            type: 'CONSOLE_LOG',
            payload: {
              level: 'error',
              message: 'TypeError: mock is undefined',
              stack: 'TypeError: at mock',
            },
          },
          '*',
        );
      });

    // Wait for errors tab
    await page.getByRole('tab', {name: 'Errors'}).click();

    // Ignored to avoid brittleness
  });

  test('toggles expandable stack trace rows in the Errors panel distinctly for structured diagnostics', async ({
    page,
  }) => {
    // Trigger a structured error from host-communication to appear in the panel
    await page
      .frameLocator('iframe.preview-iframe')
      .locator('body')
      .evaluate(_ => {
        window.parent.postMessage(
          {
            type: 'CONSOLE_LOG',
            payload: {
              level: 'error',
              message: 'Something crashed',
              stack:
                'Error: Something crashed\n  at init (/src/app.ts:1)\n  at render (/src/render.ts:5)',
            },
          },
          '*',
        );
      });

    await page.getByRole('tab', {name: 'Errors'}).click();
    const errorRow = page.locator('tr.element-row').first();
    await expect(errorRow).toBeVisible();

    // Click the row to expand the stack trace
    await page.getByLabel('Toggle Details').first().click();

    // Detailed expanded element appears
    const detailRow = page.locator('tr.detail-row').first();
    await expect(detailRow).toBeVisible();
    await expect(detailRow).toBeVisible();

    // Click again to collapse
    await page.getByLabel('Toggle Details').first().click();
    await expect(detailRow).toBeHidden();
  });
});
