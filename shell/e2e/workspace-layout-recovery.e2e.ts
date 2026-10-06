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

import {expect, test} from '@playwright/test';
import type {SerializedDockview} from 'dockview-core';
import {LocalStorageKey} from '../src/app/storage/models/local-storage-keys';

const rendererUrl = 'http://localhost:3456';

test.beforeEach(async ({page}) => {
  await page.route('**/config.json', route =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({renderers: {default: {rendererUrl}}}),
    }),
  );
  await page.addInitScript(() => {
    if (location.protocol === 'http:') {
      localStorage.setItem('a2ui_composer_force_1p', 'true');
    }
  });
});

for (const invalidState of ['retired panel', 'mismatched panel ID']) {
  test(`opens usable default panels after rejecting a saved ${invalidState}`, async ({page}) => {
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`/?renderer=${rendererUrl}`);
    await page.locator('.dv-tab', {hasText: /^Data Model/}).click();
    await expect
      .poll(() => page.evaluate(key => localStorage.getItem(key), LocalStorageKey.DOCKVIEW_LAYOUT))
      .not.toBeNull();

    // Leave before replacing storage so the current workspace cannot save over it.
    await page.getByRole('link', {name: 'Settings', exact: true}).click();
    await expect(page.locator('.settings-container')).toBeVisible();
    await page.evaluate(
      ({key, invalidState}) => {
        const saved = localStorage.getItem(key);
        if (saved === null) {
          throw new Error('The real workspace layout was not saved.');
        }
        const layout: SerializedDockview = JSON.parse(saved);
        if (invalidState === 'retired panel') {
          layout.panels['rendered'].contentComponent = 'retiredPanel';
        } else {
          layout.panels['rendered'].id = 'missing';
        }
        localStorage.setItem(key, JSON.stringify(layout));
      },
      {key: LocalStorageKey.DOCKVIEW_LAYOUT, invalidState},
    );

    await page.goto(`/?renderer=${rendererUrl}`);
    await expect(page.locator('.workspace-container')).toBeVisible();
    await expect(page.locator('.dv-tab')).toHaveCount(7);
    await expect(page.locator('.dv-tab', {hasText: /^Rendered A2UI Preview/})).toBeVisible();

    const preview = page.frameLocator('iframe.preview-iframe');
    await preview.getByRole('button', {name: 'Search Cars'}).click();
    await expect(page.locator('.dv-tab', {hasText: /^Events/})).toContainText('(1)');
    await page.locator('.dv-tab', {hasText: /^Data Model/}).click();
    await expect(page.locator('.data-model-container textarea')).toBeVisible();
    await page.locator('.dv-tab', {hasText: /^Errors/}).click();
    await expect(
      page.locator('.errors-container tr.element-row', {
        hasText: 'Failed to restore dockview layout',
      }),
    ).toHaveCount(1);
    expect(pageErrors).toEqual([]);
  });
}

test('resets modified dockview layout back to default when clicking Reset Layout toolbar button repeatedly', async ({
  page,
}) => {
  await page.goto(`/?renderer=${rendererUrl}`);
  await expect(page.locator('.workspace-container')).toBeVisible();

  const preview = page.frameLocator('iframe.preview-iframe');

  for (let cycle = 1; cycle <= 3; cycle++) {
    // Initially default tabs are active: Rendered A2UI Preview and Data Model
    await expect(page.locator('.dv-tab', {hasText: /^Rendered A2UI Preview/})).toHaveClass(
      /dv-active-tab/,
    );
    await expect(page.locator('.dv-tab', {hasText: /^Data Model/})).toHaveClass(/dv-active-tab/);

    // Verify initial preview is fully loaded and visible inside iframe before modifying layout
    await expect(preview.getByRole('button', {name: 'Search Cars'})).toBeVisible();

    // Move A2UI JSON Editor pane to dock on the right of Preview (reproducing user's drag action)
    await page.evaluate(() => {
      const ws = (
        window as unknown as {
          ng?: {
            getComponent: (el: Element) => {
              composerDockview?: {
                api: {getGroupPanel: (id: string) => {api: {moveTo: (opts: unknown) => void}}};
              };
            };
          };
        }
      ).ng?.getComponent(document.querySelector('a2ui-composer-workspace')!);
      const rawPanel = ws?.composerDockview?.api?.getGroupPanel('raw');
      if (rawPanel) {
        rawPanel.api.moveTo({position: 'right'});
        return true;
      }
      return false;
    });

    // Wait for debounced layout save to populate localStorage
    await expect
      .poll(() => page.evaluate(key => localStorage.getItem(key), LocalStorageKey.DOCKVIEW_LAYOUT))
      .not.toBeNull();

    // Click the Reset Layout button in the main toolbar
    await page.locator('button.reset-layout-button').click();

    // Verify default tabs are active again
    await expect(page.locator('.dv-tab', {hasText: /^Rendered A2UI Preview/})).toHaveClass(
      /dv-active-tab/,
    );
    await expect(page.locator('.dv-tab', {hasText: /^Data Model/})).toHaveClass(/dv-active-tab/);

    // Verify all 7 tabs are present
    await expect(page.locator('.dv-tab')).toHaveCount(7);

    // Verify DOCKVIEW_LAYOUT was cleared from localStorage
    const savedLayout = await page.evaluate(
      key => localStorage.getItem(key),
      LocalStorageKey.DOCKVIEW_LAYOUT,
    );
    expect(savedLayout).toBeNull();

    // Verify the preview is visible and interactive immediately without toggling tabs
    await expect(preview.getByRole('button', {name: 'Search Cars'})).toBeVisible();

    // Verify the preview iframe properly expands and is not clipped to the ~130px initial sandbox fallback banner.
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const iframe = document.querySelector<HTMLIFrameElement>('iframe.preview-iframe');
          const iframeHeight = iframe?.getBoundingClientRect().height ?? 0;
          return {
            iframeHeight,
            iframeExpanded: iframeHeight > 300,
          };
        });
      })
      .toEqual(
        expect.objectContaining({
          iframeExpanded: true,
        }),
      );

    // Verify no spurious errors were logged to the Errors tab (circuit breaker did not false-trip)
    await expect(page.locator('.dv-tab', {hasText: /^Errors/})).toHaveText('Errors');
  }

  // Click Search Cars and verify Events tab increments
  await preview.getByRole('button', {name: 'Search Cars'}).click();
  await expect(page.locator('.dv-tab', {hasText: /^Events/})).toContainText('(1)');

  // Verify the Data Model panel is visible immediately without toggling tabs
  await expect(page.locator('textarea[aria-label="Data model JSON"]')).toBeVisible();
});
