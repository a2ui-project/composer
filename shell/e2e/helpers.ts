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
import {WindowWithMonaco} from './types';

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

/** Waits until the Raw A2UI editor is visible and has a Monaco model. */
export async function waitForMonacoEditor(page: Page): Promise<void> {
  const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
  await expect(editorLocator).toBeVisible();

  await page.waitForFunction(() => {
    const monaco = (window as unknown as WindowWithMonaco).monaco;
    return (monaco?.editor?.getModels()?.length ?? 0) > 0;
  });
}

/** Replaces the contents of the Raw A2UI editor. */
export async function setMonacoContent(page: Page, contents: string): Promise<void> {
  await waitForMonacoEditor(page);

  await page.evaluate(value => {
    const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
    if (model) {
      model.setValue(value);
    }
  }, contents);
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
