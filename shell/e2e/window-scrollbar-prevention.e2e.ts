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

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });
});

test.describe('Whole-UI Window Scrollbar Prevention', () => {
  test('verifies body, html, and shell layout containers apply overflow hidden styling', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('a2ui-composer-shell')).toBeVisible();

    const styles = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const shellEl = document.querySelector('a2ui-composer-shell');
      const shellStyle = shellEl ? window.getComputedStyle(shellEl) : null;
      const workspaceEl = document.querySelector('a2ui-composer-workspace');
      const workspaceStyle = workspaceEl ? window.getComputedStyle(workspaceEl) : null;

      return {
        bodyOverflow: bodyStyle.overflow,
        bodyOverflowY: bodyStyle.overflowY,
        shellOverflow: shellStyle ? shellStyle.overflow : null,
        workspaceOverflow: workspaceStyle ? workspaceStyle.overflow : null,
      };
    });

    expect(styles.bodyOverflow === 'hidden' || styles.bodyOverflowY === 'hidden').toBe(true);
    expect(styles.shellOverflow).toBe('hidden');
    expect(styles.workspaceOverflow).toBe('hidden');
  });

  test('prevents window-level scrolling even when tall content is dynamically present', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('a2ui-composer-shell')).toBeVisible();

    // Inject an oversized container to force overflow conditions
    await page.evaluate(() => {
      const spacer = document.createElement('div');
      spacer.id = 'e2e-overflow-spacer';
      spacer.style.height = '5000px';
      spacer.style.width = '100%';
      document.body.appendChild(spacer);
    });

    // Attempt to scroll the main document window
    await page.evaluate(() => {
      window.scrollTo(0, 1000);
    });

    const scrollY = await page.evaluate(() => window.scrollY);
    const scrollTop = await page.evaluate(
      () => document.documentElement.scrollTop || document.body.scrollTop,
    );

    expect(scrollY).toBe(0);
    expect(scrollTop).toBe(0);

    // Clean up injected spacer element
    await page.evaluate(() => {
      document.getElementById('e2e-overflow-spacer')?.remove();
    });
  });

  test('allows internal vertical scrolling in settings view while preventing whole-window scrollbars', async ({
    page,
  }) => {
    await page.goto('/settings');
    await page.waitForURL('**/settings');
    await expect(page.locator('.settings-container')).toBeVisible();

    const bodyOverflow = await page.evaluate(() => window.getComputedStyle(document.body).overflow);
    expect(bodyOverflow === 'hidden' || bodyOverflow === 'clip').toBe(true);

    const settingsHostOverflowY = await page.evaluate(() => {
      const settingsEl = document.querySelector('a2ui-composer-settings');
      return settingsEl ? window.getComputedStyle(settingsEl).overflowY : null;
    });

    expect(settingsHostOverflowY).toBe('auto');

    // Verify main window scroll is 0
    await page.evaluate(() => window.scrollTo(0, 500));
    const windowScrollY = await page.evaluate(() => window.scrollY);
    expect(windowScrollY).toBe(0);
  });

  test('preserves window scrollbar prevention in components gallery view', async ({page}) => {
    await page.goto('/gallery');
    await page.waitForURL('**/gallery');
    await expect(page.locator('.gallery-container')).toBeVisible();

    const bodyOverflow = await page.evaluate(() => window.getComputedStyle(document.body).overflow);
    expect(bodyOverflow === 'hidden' || bodyOverflow === 'clip').toBe(true);

    await page.evaluate(() => window.scrollTo(0, 500));
    const windowScrollY = await page.evaluate(() => window.scrollY);
    expect(windowScrollY).toBe(0);
  });
});
