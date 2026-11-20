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
import {getMonacoContent, resetStorageOnce} from './helpers';

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
      .locator('.toggle');
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

  test('selects a component from the tree, edits its property, and updates the preview and draft', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`/?renderer=${RENDERER_URLS.angular}`);
    await expect(previewFrame(page).getByRole('button', {name: 'Search Cars'})).toBeVisible();

    await page.getByRole('tab', {name: 'Component Tree'}).click();
    await page.getByRole('treeitem', {name: /#book_button_text/}).click();

    await expect(page.getByRole('tab', {name: 'Property Editor', selected: true})).toBeVisible();
    const propertyEditor = page.locator('a2ui-composer-property-editor');
    await expect(propertyEditor.locator('[data-property-header]')).toContainText(
      'Text #book_button_text',
    );
    const textInput = propertyEditor.getByRole('textbox', {name: 'text', exact: true});
    await expect(textInput).toHaveValue('Search Cars');

    await textInput.fill('Book Now');

    await page.getByRole('tab', {name: 'Rendered A2UI Preview'}).click();
    await expect(previewFrame(page).getByRole('button', {name: 'Book Now'})).toBeVisible();
    await expect
      .poll(async () => {
        const draft: unknown = JSON.parse(await getMonacoContent(page));
        return draft;
      })
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            updateComponents: expect.objectContaining({
              components: expect.arrayContaining([
                {
                  id: 'book_button_text',
                  component: 'Text',
                  text: 'Book Now',
                  variant: 'body',
                },
              ]),
            }),
          }),
        ]),
      );
    expect(pageErrors).toEqual([]);
  });
});
