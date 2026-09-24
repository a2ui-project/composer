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

import {expect, test, type Page} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {connectMockAgent} from '../src/app/agent-chat/test/mock-a2a-agent';

async function themeColor(page: Page, token: string): Promise<string> {
  const hex = await page.locator('body').evaluate((body, name) => {
    return getComputedStyle(body).getPropertyValue(name).trim();
  }, token);
  expect(hex).toMatch(/^#[\da-f]{6}$/i);
  return `rgb(${[1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)).join(', ')})`;
}

test('A2A surfaces and controls follow both themes without losing the conversation or draft', async ({
  page,
}) => {
  await connectMockAgent(page);
  const prompt = page.locator('.prompt-textarea');
  await prompt.fill('What is the best season to visit Tokyo?');
  await prompt.press('Enter');
  await expect(page.locator('.agent-text-content')).toContainText('Spring');
  await page.locator('.inspector-toggle-btn').click();
  await expect(page.locator('.event-panel').first()).toBeVisible();
  await prompt.fill('Keep this draft while switching themes');

  for (const [index, theme] of ['light', 'dark', 'light'].entries()) {
    if (index > 0) {
      await page.getByRole('button', {name: `Switch to ${theme} theme`}).click();
    }
    await expect
      .poll(() => page.locator('body').evaluate(body => body.classList.contains('dark-theme')))
      .toBe(theme === 'dark');
    const surface = await themeColor(page, '--mat-sys-surface');
    for (const selector of [
      '.a2a-chat-view-root',
      '.agent-header',
      '.inspector-drawer',
      '.event-panel',
    ]) {
      await expect(page.locator(selector).first()).toHaveCSS('background-color', surface);
    }
    await expect(page.locator('.input-card')).toHaveCSS(
      'background-color',
      await themeColor(page, '--mat-sys-surface-container-low'),
    );
    await expect(page.locator('.new-session-btn')).toHaveCSS(
      'color',
      await themeColor(page, '--mat-sys-primary'),
    );
    await expect(page.locator('.inspector-toggle-btn')).toHaveCSS(
      'color',
      await themeColor(page, '--mat-sys-on-primary-container'),
    );
    await expect(prompt).toHaveValue('Keep this draft while switching themes');
    await expect(page.locator('.agent-text-content')).toContainText('Spring');
    await expect(page.locator('.inspector-toggle-btn')).toHaveAttribute('aria-expanded', 'true');
  }
});

test('Composer chat and raw update labels share the workspace palette in both themes', async ({
  page,
}) => {
  await page.route('**/config.json', route => route.fulfill({json: {renderers: {default: {}}}}));
  await page.route('http://theme-renderer.test/**', route =>
    route.fulfill({contentType: 'text/html', body: '<html><body>Theme preview</body></html>'}),
  );
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('a2ui_composer_force_1p', 'true');
    localStorage.setItem(
      'a2ui_composer_allowed_origins',
      JSON.stringify(['http://theme-renderer.test']),
    );
  });
  await page.goto('/?renderer=http://theme-renderer.test/index.html');
  const frame = page.frameLocator('iframe.preview-iframe').locator('body');
  await expect(frame).toContainText('Theme preview');
  await expect(page.locator('.disabled-chat-panel')).toBeVisible();
  await frame.evaluate((_, type) => {
    window.parent.postMessage(
      {
        type,
        payload: {
          version: 'v0.9',
          action: {
            name: 'theme-check',
            surfaceId: 'test',
            sourceComponentId: 'button',
            context: {},
          },
        },
      },
      '*',
    );
  }, PreviewBridgeMessageType.SEND_TO_SERVER);
  await page.locator('.dv-tab', {hasText: /^Raw Messages/}).click();
  await expect(page.locator('.message-type').first()).toBeVisible();

  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') {
      await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    }
    await expect
      .poll(() => page.locator('body').evaluate(body => body.classList.contains('dark-theme')))
      .toBe(theme === 'dark');
    await expect(page.locator('.disabled-chat-panel')).toHaveCSS(
      'background-color',
      await themeColor(page, '--mat-sys-surface'),
    );
    await expect(page.locator('.message-type').first()).toHaveCSS(
      'color',
      await themeColor(page, '--mat-sys-primary'),
    );
    await expect(page.locator('.raw-messages-container')).toContainText('theme-check');
  }
});

test('Material configuration controls use the shell palette in light and dark modes', async ({
  page,
}) => {
  await connectMockAgent(page);
  await page.locator('.inline-config-btn').click();
  const dialog = page.getByRole('dialog', {name: 'A2A Agent Configuration'});
  await expect(dialog).toHaveCSS('opacity', '1');
  const endpoint = dialog.getByLabel('Agent Endpoint URL');
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') {
      await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
      await page.getByRole('button', {name: 'Switch to dark theme'}).click();
      await expect(page.locator('body')).toHaveClass(/dark-theme/);
      await page.locator('.inline-config-btn').click();
      await expect(dialog).toHaveCSS('opacity', '1');
    }
    await endpoint.focus();
    const field = dialog
      .locator('mat-form-field')
      .filter({has: page.getByLabel('Agent Endpoint URL')});
    await expect(field.locator('.mdc-floating-label')).toHaveCSS(
      'color',
      await themeColor(page, '--mat-sys-primary'),
    );
    await expect(field.locator('.mdc-notched-outline__leading')).toHaveCSS(
      'border-top-color',
      await themeColor(page, '--mat-sys-primary'),
    );
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      await themeColor(page, '--mat-sys-background'),
    );
    await expect(endpoint).toHaveValue('http://mock-agent.local');
  }
});

test('Workspace panels, the JSON editor, and the chat panel share one surface in both themes', async ({
  page,
}) => {
  const rendererUrl = 'http://localhost:3456';
  await page.route('**/config.json', route =>
    route.fulfill({json: {renderers: {default: {rendererUrl}}}}),
  );
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('a2ui_composer_force_1p', 'true');
  });
  await page.goto(`/?renderer=${rendererUrl}`);
  await expect(page.locator('.monaco-editor .monaco-editor-background')).toBeVisible();

  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') {
      await page.getByRole('button', {name: 'Switch to dark theme'}).click();
      await expect(page.locator('body')).toHaveClass(/dark-theme/);
    }
    const surface = await themeColor(page, '--mat-sys-surface');
    // Dockview's own theme classes sit below the workspace root; the group
    // background proves the shell's variables still reach them.
    for (const group of await page.locator('.dv-groupview').all()) {
      await expect(group).toHaveCSS('background-color', surface);
    }
    await expect(page.locator('.monaco-editor .monaco-editor-background')).toHaveCSS(
      'background-color',
      surface,
    );
    await expect(page.locator('.disabled-chat-panel')).toHaveCSS('background-color', surface);
  }
});
