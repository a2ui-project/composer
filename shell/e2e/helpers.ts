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

import {expect, Page} from '@playwright/test';

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

/**
 * Renderer dev servers hosting the guest samples, started by the `webServer`
 * entries in playwright.config.ts. The ports live in both places because the
 * config starts the servers by command line; these are the addresses the tests
 * navigate to.
 */
export const RENDERER_URLS = {
  angular: 'http://localhost:3456',
  lit: 'http://localhost:3457',
  react: 'http://localhost:3458',
} as const;

/**
 * Timeout in milliseconds waiting for dockview tabs or frame containers to be visible.
 */
export const TAB_VISIBILITY_TIMEOUT_MS = 10_000;

/**
 * Timeout in milliseconds waiting for Monaco editor models to initialize.
 */
export const MONACO_MODEL_TIMEOUT_MS = 10_000;

/**
 * Duration in milliseconds to wait for the shell's draft synchronization debouncer
 * (300ms) to process editor content changes before switching tabs.
 */
export const MONACO_DRAFT_DEBOUNCE_MS = 350;

/** Waits until the Raw A2UI editor is visible and has a Monaco model. */
export async function waitForMonacoEditor(page: Page): Promise<void> {
  const editorTab = page.locator('.dv-tab:has-text("A2UI JSON Editor")');
  if ((await editorTab.count()) > 0) {
    const isActive = await editorTab.evaluate(el => el.classList.contains('dv-active-tab'));
    if (!isActive) {
      await editorTab.click();
    }
  }

  const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
  await expect(editorLocator).toBeVisible({timeout: TAB_VISIBILITY_TIMEOUT_MS});

  await page.waitForFunction(
    () => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    },
    undefined,
    {timeout: MONACO_MODEL_TIMEOUT_MS},
  );
}

/** Waits until the Rendered A2UI Preview tab is visible and selected. */
export async function waitForPreviewTab(page: Page): Promise<void> {
  const previewTab = page.locator('.dv-tab:has-text("Rendered A2UI Preview")');
  if ((await previewTab.count()) > 0) {
    const isActive = await previewTab.evaluate(el => el.classList.contains('dv-active-tab'));
    if (!isActive) {
      await previewTab.click();
    }
  }
  await expect(page.locator('.rendered-frame-container')).toBeVisible({
    timeout: TAB_VISIBILITY_TIMEOUT_MS,
  });
}

/** Replaces the contents of the Raw A2UI editor. */
export async function setMonacoContent(page: Page, contents: string): Promise<void> {
  const previewTab = page.locator('.dv-tab:has-text("Rendered A2UI Preview")');
  const wasPreviewActive =
    (await previewTab.count()) > 0 &&
    (await previewTab.evaluate(el => el.classList.contains('dv-active-tab')));

  await waitForMonacoEditor(page);

  await page.evaluate(value => {
    const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
    if (model) {
      model.setValue(value);
    }
  }, contents);

  if (wasPreviewActive) {
    await page.waitForTimeout(MONACO_DRAFT_DEBOUNCE_MS);
    await waitForPreviewTab(page);
  }
}

/** Returns the contents of the Raw A2UI editor once it is no longer empty. */
export async function getMonacoContent(page: Page): Promise<string> {
  await waitForMonacoEditor(page);

  let contents = '';
  await expect
    .poll(async () => {
      contents = await page.evaluate(() => {
        const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
        return model ? model.getValue() : '';
      });
      return contents;
    })
    .not.toBe('');

  return contents;
}
