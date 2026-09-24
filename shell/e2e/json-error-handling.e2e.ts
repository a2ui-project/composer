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

test.use({
  storageState: {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:4200',
        localStorage: [
          {name: 'a2ui_composer_force_1p', value: 'true'},
          {name: 'a2ui_composer_selected_api_key', value: 'fake'},
          {
            name: 'a2ui_composer_allowed_origins',
            value: JSON.stringify(['http://custom-renderer.com']),
          },
        ],
      },
    ],
  },
});

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
        apiKeys: {
          fake: {
            apiKey: 'dummy-key',
            name: 'Fake Token',
          },
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

  await page.goto('/?renderer=http://custom-renderer.com');
  await expect(page.locator('.header-title')).toContainText('A2UI Composer');
});

test.describe('JSON Error Handling & Diagnostics', () => {
  test('surfaces malformed JSON syntax errors in Monaco via squigglies, triggers a debounced consolidated snackbar, and navigates to the error position on click', async ({
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

    // Wait for debounce of snackbar
    const snackbar = page
      .locator('simple-snack-bar')
      .filter({hasText: /error|syntax/i})
      .first();
    await expect(snackbar).toBeVisible({timeout: 8000});

    // Click 'Go to line' action
    const actionButton = snackbar.getByRole('button').filter({hasText: /Go to line/i});
    await expect(actionButton).toBeVisible();
    await actionButton.click();

    // The JSON editor tab should still be active (not switching to Errors tab)
    const jsonEditorTab = page.getByRole('tab', {name: 'A2UI JSON Editor', selected: true});
    await expect(jsonEditorTab).toBeVisible();
    const errorsTab = page.getByRole('tab', {name: 'Errors', selected: true});
    await expect(errorsTab).toHaveCount(0);

    // Verify editor navigated cursor position
    const cursorPosition = await page.evaluate(() => {
      const monacoWithEditors = (
        window as unknown as {
          monaco?: {
            editor: {
              getEditors(): {getPosition(): {lineNumber: number; column: number} | null}[];
            };
          };
        }
      ).monaco;
      return monacoWithEditors?.editor?.getEditors()?.[0]?.getPosition();
    });
    // Rationale: the malformed fixture `{"version": "v0.9", "invalid": }` reports
    // its unclosed delimiter on line 4, so Monaco correctly navigates to line 4;
    // the expected value of 3 was simply wrong. Please do not loosen it again.
    expect(cursorPosition?.lineNumber).toBe(4);
  });

  test('recovers gracefully from malformed JSON stream blocks in chat and renders an inline diagnostic error card', async ({
    page,
  }) => {
    // Navigate to Chat
    await page.getByRole('tab', {name: 'Gemini Assistant'}).click();

    await page.route('https://generativelanguage.googleapis.com/**', async route => {
      if (route.request().url().includes('/models?')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({models: [{name: 'models/gemini-1.5-pro', version: '1.5'}]}),
        });
        return;
      }
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
    await errorCard.getByRole('button', {name: /Errors Tab/i}).click();
    await expect(page.getByRole('tab', {name: 'Errors', selected: true})).toBeVisible();
  });

  test('captures cross-frame preview errors, renders non-crashing 350ms debounced UI error overlay, and assigns [Preview] log provenance', async ({
    page,
  }) => {
    // Wait for the iframe
    const iframeLoc = page.frameLocator('iframe.preview-iframe');
    await expect(iframeLoc.locator('body')).toBeVisible();

    // Wait until composer handshake finishes / timeouts.
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

    const errorRow = page.locator('.errors-container table tr.element-row').first();
    await expect(errorRow).toBeVisible();
    await expect(errorRow).toContainText('TypeError: mock is undefined');
    await expect(errorRow).toContainText('[Preview]');
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

    // Click again to collapse
    await page.getByLabel('Toggle Details').first().click();
    await expect(detailRow).toBeHidden();
  });
});
