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
import {WindowWithMonaco} from './types';
import {ELECTRIC_CAR_CHARGING_UI, EV_CHARGE_CONTROL_A2UI} from './samples';

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch (e) {}
  });
  await page.goto('/');
});

test.describe('E2E Workspace User Journey', () => {
  test('verifies full workflow across settings connection status, forced 3P mode toggle, and raw editor invalid JSON gate', async ({
    page,
  }) => {
    // 1. Launch Composer Workspace and verify static header and New Session button
    await expect(page.locator('.header-title')).toContainText('A2UI Composer');
    await expect(page.locator('.reset-session-button')).toBeVisible();

    // 2. Switch to Settings Page via Sidenav
    await page.getByRole('link', {name: 'Settings'}).click();
    await page.waitForURL('**/settings');

    // 3. Verify connection status badges
    await expect(page.locator('.bridge-badge')).toBeVisible();
    await expect(page.locator('.catalog-badge')).toBeVisible();

    // 4. Verify auth section is hidden and API key provisioning section appears when IS_1P_AUTH_ENABLED is false
    await expect(page.locator('.first-party-auth-section')).toBeHidden();
    await expect(page.getByText('Gemini API Provisioning')).toBeVisible();

    // 5. Provide API key to unlock workspace
    await page.getByRole('button', {name: 'Add Gemini API key'}).click();
    const apiKeyDialog = page.getByRole('dialog', {name: 'Add Gemini API Key'});
    await expect(apiKeyDialog).toBeVisible();
    await apiKeyDialog.getByLabel('Name', {exact: true}).fill('Test Key');
    await apiKeyDialog.getByLabel('API Key', {exact: true}).fill('test-api-key');
    await apiKeyDialog.getByRole('button', {name: 'Add', exact: true}).click();
    await expect(apiKeyDialog).toBeHidden();

    // 6. Navigate back to workspace
    await page.getByRole('link', {name: 'Composer Workspace'}).click();
    await page.waitForURL(url => url.pathname === '/');
    await page.waitForLoadState('load');

    // 7. Wait for Monaco to load and enter malformed JSON
    const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
    await expect(editorLocator).toBeVisible();

    await page.waitForFunction(() => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    });

    await page.waitForTimeout(500); // Give Monaco time to fully attach event listeners

    await page.evaluate(() => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue('invalid json {');
      }
    });

    // 8. Assert that snackbar appears and no empty text bubbles are created in chat panel
    const snackbarLocator = page.locator('.mat-mdc-snack-bar-label').first();
    await expect(snackbarLocator).toContainText('Invalid JSON syntax detected.');
    await page.waitForTimeout(400); // Allow debounce to settle
    await expect(page.locator('.chat-history-log .bubble-text')).toHaveCount(0);

    // 9. Correct JSON and verify snackbar disappears
    await page.evaluate(() => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue(
          '{"version": "v0.9", "createSurface": {"surfaceId": "test", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json"}}',
        );
      }
    });
    // With dismissal logic, it should disappear immediately
    await expect(page.locator('.mat-mdc-snack-bar-label')).toHaveCount(0, {timeout: 3000});
  });

  test('prevents empty chat bubbles when invalid JSON is entered in editor', async ({page}) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('a2ui_composer_selected_api_key', 'fake');
      } catch (e) {}
    });
    await page.goto('/');

    // Wait for Monaco to load
    const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
    await expect(editorLocator).toBeVisible();

    await page.waitForFunction(() => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    });

    // Wait for initial layout snapshot in chat history
    await expect(page.locator('.chat-history-log .bubble-layout')).toHaveCount(1);

    // Set invalid JSON
    await page.evaluate(() => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue('invalid json {');
      }
    });

    // Wait for debounce period (300ms)
    await page.waitForTimeout(400);

    // Verify no empty text bubbles are created and existing snapshot is preserved
    await expect(page.locator('.chat-history-log .bubble-text')).toHaveCount(0);
    await expect(page.locator('.chat-history-log .bubble-layout')).toHaveCount(1);
  });

  test('verifies sharing design URL copies a2ui in URL hash and loads payload on new page', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await expect(page.locator('.header-title')).toContainText('A2UI Composer');

    await page.waitForFunction(() => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    });

    await page.evaluate(payload => {
      const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
      if (model) {
        model.setValue(payload);
      }
    }, EV_CHARGE_CONTROL_A2UI);

    await expect(page.locator('.header-title')).toContainText('A2UI Composer');
    const shareButton = page.getByRole('button', {name: 'Share design'});
    await expect(shareButton).toBeVisible();
    await shareButton.click();

    const snackbarLocator = page.locator('.mat-mdc-snack-bar-label').first();
    await expect(snackbarLocator).toContainText('Shareable link copied to clipboard');

    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareUrl).toContain(ELECTRIC_CAR_CHARGING_UI);

    // Open recipient page with copied link
    const recipientPage = await context.newPage();
    await recipientPage.goto(shareUrl);
    await recipientPage.waitForLoadState('load');

    const editorLocator = recipientPage
      .locator('a2ui-composer-monaco-editor .monaco-editor')
      .first();
    await expect(editorLocator).toBeVisible();

    const previewIframe = recipientPage
      .frameLocator('.preview-frame iframe, iframe.preview-iframe, iframe')
      .first();
    await expect(previewIframe.locator('body')).toBeVisible({timeout: 10000});
    await expect(previewIframe.locator('a2ui-v09-surface').first()).toBeVisible({timeout: 10000});
  });

  test('displays informative error snackbar when navigating with truncated or corrupted shared design URL', async ({
    page,
  }) => {
    await page.goto('/#a2ui=d1.corrupted_truncated_payload_data!!!');
    await page.waitForLoadState('load');

    const snackbarLocator = page.locator('.mat-mdc-snack-bar-label').first();
    await expect(snackbarLocator).toBeVisible({timeout: 10000});
    await expect(snackbarLocator).toContainText('Unable to load shared design');
    await expect(snackbarLocator).toContainText('truncated or corrupted');
  });

  test('updates active draft and renders preview when hash URL is navigated to on the same page', async ({
    page,
  }) => {
    await expect(page.locator('.header-title')).toContainText('A2UI Composer');

    // Dynamically change the hash on the existing page (triggers hashchange event)
    await page.evaluate(payload => {
      window.location.hash = `a2ui=${payload}`;
    }, ELECTRIC_CAR_CHARGING_UI);

    const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
    await expect(editorLocator).toBeVisible();

    const previewIframe = page
      .frameLocator('.preview-frame iframe, iframe.preview-iframe, iframe')
      .first();
    await expect(previewIframe.locator('body')).toBeVisible({timeout: 10000});
    await expect(previewIframe.locator('a2ui-v09-surface').first()).toBeVisible({timeout: 10000});
  });
});
