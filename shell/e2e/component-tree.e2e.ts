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

import {expect, test} from './fixtures';
import {previewFrame} from '../src/app/preview/testing/preview-frame-locators';
import {RENDERER_URLS} from '../src/app/preview/testing/renderer-urls';
import {resetStorageOnce} from './helpers';

test.beforeEach(async ({page}) => {
  await resetStorageOnce(page, {
    a2ui_composer_force_1p: 'true',
  });
});

test.describe('Component Tree Panel', () => {
  test('opens Component Tree tab and renders collapsible surface hierarchy', async ({page}) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(`/?renderer=${RENDERER_URLS.angular}`);
    await expect(previewFrame(page).getByRole('button', {name: 'Search Cars'})).toBeVisible();

    await page.locator('.dv-tab', {hasText: /^Component Tree/}).click();

    const treeContainer = page.locator('a2ui-composer-component-tree .component-tree-container');
    await expect(treeContainer).toBeVisible();
    await expect(treeContainer.locator('.surface-header')).toContainText('sample-surface');
    await expect(treeContainer.locator('.surface-header')).toContainText('7 components');

    const rowIds = treeContainer.locator('.tree-row .id');
    await expect(rowIds).toHaveText([
      '#root',
      '#title',
      '#location_input',
      '#pickup_input',
      '#dropoff_input',
      '#book_button',
      '#book_button_text',
    ]);

    const bookButtonToggle = treeContainer
      .locator('.tree-row', {hasText: '#book_button'})
      .first()
      .locator('button.toggle');
    await bookButtonToggle.click();
    await expect(rowIds).toHaveText([
      '#root',
      '#title',
      '#location_input',
      '#pickup_input',
      '#dropoff_input',
      '#book_button',
    ]);

    await bookButtonToggle.click();
    await expect(rowIds).toHaveText([
      '#root',
      '#title',
      '#location_input',
      '#pickup_input',
      '#dropoff_input',
      '#book_button',
      '#book_button_text',
    ]);
    expect(pageErrors).toEqual([]);
  });
});
