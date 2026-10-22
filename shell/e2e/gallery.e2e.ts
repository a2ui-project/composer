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
import {
  RENDERER_URLS,
  expectNoCatalogWatchdog,
  galleryPreview,
  getMonacoContent,
  guestContentHeight,
  guestScrollRange,
  setMonacoContent,
  trackRendererReady,
} from './helpers';

/** Minimum height of the gallery's Preview frame, set in gallery.scss. */
const PREVIEW_CARD_HEIGHT_PX = 400;

/** Height of the content added to the guest to make it taller than the card. */
const TALL_CONTENT_HEIGHT_PX = 1200;

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });
});

test.describe('Components Gallery User Journey', () => {
  test.beforeEach(async ({page}) => {
    await page.addInitScript(() => {
      if (window === window.top) {
        localStorage.setItem('a2ui_composer_force_1p', 'true');
      }
    });
  });

  test('verifies navigation from home and loading components catalog details', async ({
    page,
    context,
  }, testInfo) => {
    // Enable clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // 1. Navigate to home with a valid renderer to trigger the catalog handshake
    await page.goto(`/?renderer=${RENDERER_URLS.angular}`);
    await expect(page.locator('.workspace-container')).toBeVisible();

    // Wait for the workspace to load, indicating handshake completed
    const workspaceIframe = page.locator('.workspace-container iframe');
    await expect(workspaceIframe).toBeVisible();

    // Wait for the catalog handshake to complete (indicated by header title updating)
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');

    // 2. Click on the gallery link in the sidebar
    const galleryLink = page.getByRole('link', {name: 'Components Gallery'});
    await expect(galleryLink).toBeVisible();
    await galleryLink.click();

    // 3. Redirected to /gallery and layout loads successfully
    await page.waitForURL('**/gallery');
    await expect(page.locator('.gallery-container')).toBeVisible();

    // 4. Verify component catalog navigation is visible
    const navItems = page.locator('.catalog-list').getByRole('button');
    await expect(navItems.first()).toBeVisible();

    // Read the name of the first component dynamically to ensure test robustness
    const firstComponentName = (await navItems.first().textContent())?.trim();
    expect(firstComponentName).toBeTruthy();

    // 5. Assert first component is automatically selected upon gallery navigation and details pane is updated
    await expect(page.getByRole('heading', {name: firstComponentName!, exact: true})).toBeVisible();

    // Assert card headers are visible (only Preview, Edit JSON, and Properties are mat-cards)
    const cardHeaders = page.locator('mat-card-header mat-card-title');
    await expect(cardHeaders).toHaveText(['Interactive Playground', 'Properties']);

    // 6. Verify the Playground toolbar has Preview/Edit JSON tabs on the top left, Copy JSON/Open in Composer on the top right,
    // Usage section on the left (narrower than Preview/Edit JSON) with Reset example at its bottom, and Preview card on the right by default
    const previewTab = page.getByRole('tab', {name: 'Preview', exact: true});
    const editJsonTab = page.getByRole('tab', {name: 'Edit JSON', exact: true});
    await expect(previewTab).toHaveAttribute('aria-selected', 'true');
    await expect(editJsonTab).toHaveAttribute('aria-selected', 'false');
    await expect(
      page.locator('.usage-card').getByRole('button', {name: 'Reset example', exact: true}),
    ).toBeVisible();

    await expect
      .poll(async () => {
        const tabsBox = await page.locator('.playground-tabs:visible').boundingBox();
        const actionsBox = await page.locator('.playground-actions:visible').boundingBox();
        const usageCard = await page.locator('.usage-card').boundingBox();
        const previewCard = await page.locator('.preview-card').boundingBox();
        const previewSlot = await page.locator('.preview-slot').boundingBox();
        if (!tabsBox || !actionsBox || !usageCard || !previewCard || !previewSlot) {
          return null;
        }
        return {
          tabsLeftOfActions: tabsBox.x + tabsBox.width <= actionsBox.x,
          usageLeftOfPreview: usageCard.x + usageCard.width <= previewCard.x,
          usageNarrowerThanPreview: usageCard.width < previewCard.width,
          equalColumnHeight: Math.abs(previewSlot.height - usageCard.height) <= 1,
        };
      })
      .toEqual({
        tabsLeftOfActions: true,
        usageLeftOfPreview: true,
        usageNarrowerThanPreview: true,
        equalColumnHeight: true,
      });

    // 7. Assert properties table is populated
    const propertiesTable = page.getByRole('table');
    await expect(propertiesTable).toBeVisible();
    const rows = propertiesTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    // 8. Assert sandboxed preview frame is mounted and has an iframe on the Preview tab
    const renderedFrame = page.locator('a2ui-composer-rendered-frame');
    await expect(renderedFrame).toBeVisible();
    const iframe = renderedFrame.locator('iframe');
    await expect(iframe).toBeVisible();
    await iframe.evaluate(el => el.setAttribute('data-test-marker', 'persistent-preview'));

    // 9. Switch to the Edit JSON tab and assert the Edit JSON card is on the right side and holds the editable example in Monaco Editor
    await editJsonTab.click();
    await expect(editJsonTab).toHaveAttribute('aria-selected', 'true');
    await expect(previewTab).toHaveAttribute('aria-selected', 'false');
    await expect
      .poll(async () => {
        const usageCard = await page.locator('.usage-card').boundingBox();
        const jsonCard = await page.locator('.json-card').boundingBox();
        if (!usageCard || !jsonCard) {
          return null;
        }
        return usageCard.x + usageCard.width <= jsonCard.x;
      })
      .toBe(true);

    const draftJson = page.locator('a2ui-composer-monaco-editor.draft-json');
    await expect(draftJson).toBeVisible();
    await expect
      .poll(() => getMonacoContent(page))
      .toMatch(new RegExp(`"component": "${firstComponentName!}"`));
    const draftText = await getMonacoContent(page);
    expect(Array.isArray(JSON.parse(draftText).components)).toBe(true);
    expect(draftText).not.toContain('"usage": [');
    expect(draftText).not.toContain('createSurface');
    expect(draftText).not.toContain('updateComponents');

    // Explicitly select AudioPlayer to verify its custom usages rendering
    const audioPlayerItem = page
      .locator('.catalog-list')
      .getByRole('button', {name: 'AudioPlayer', exact: true});
    await expect(audioPlayerItem).toBeVisible();
    await audioPlayerItem.click();
    await expect.poll(() => getMonacoContent(page)).toMatch(/"description": "Deep dive into A2UI"/);
    expect(await getMonacoContent(page)).not.toContain('Audio Clip');

    // Click back to first component and switch back to Preview tab
    await navItems.first().click();
    await previewTab.click();
    await expect(previewTab).toHaveAttribute('aria-selected', 'true');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('data-test-marker', 'persistent-preview');

    // 10. Switch to Edit JSON tab to click copy to clipboard and assert clipboard content represents a JSON array envelope
    await editJsonTab.click();
    const copyButton = page.getByRole('button', {name: /copy/i});
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Assert clipboard matches using expect.poll
    await expect
      .poll(async () => {
        const text = await page.evaluate(() => navigator.clipboard.readText());
        try {
          const commands = JSON.parse(text);
          if (!Array.isArray(commands)) {
            return {error: 'Expected a JSON array'};
          }
          if (commands.length !== 2) {
            return {error: `Expected 2 commands, got ${commands.length}`};
          }
          const cmd1 = commands[0] as Record<string, unknown>;
          const cmd2 = commands[1] as Record<string, unknown>;
          const createSurface = cmd1['createSurface'] as Record<string, unknown> | undefined;
          const updateComponents = cmd2['updateComponents'] as Record<string, unknown> | undefined;
          const components = updateComponents?.['components'] as
            Array<Record<string, unknown>> | undefined;
          const hasComponent =
            Array.isArray(components) &&
            components.some(c => c['component'] === firstComponentName);
          return {
            cmd1Version: cmd1['version'],
            hasCreateSurface: typeof createSurface === 'object' && createSurface !== null,
            hasCatalogId: typeof createSurface?.['catalogId'] === 'string',
            cmd2Version: cmd2['version'],
            hasUpdateComponents: typeof updateComponents === 'object' && updateComponents !== null,
            componentsArray: Array.isArray(components),
            hasComponent,
          };
        } catch (e) {
          return {error: 'Failed to parse JSON array'};
        }
      })
      .toEqual({
        cmd1Version: 'v0.9',
        hasCreateSurface: true,
        hasCatalogId: true,
        cmd2Version: 'v0.9',
        hasUpdateComponents: true,
        componentsArray: true,
        hasComponent: true,
      });

    // 11. Verify in-place update when clicking the second component
    const secondNavItem = navItems.nth(1);
    await expect(secondNavItem).toBeVisible();
    const secondComponentName = (await secondNavItem.textContent())?.trim();
    expect(secondComponentName).toBeTruthy();

    const detailsPanel = page.locator('.details-panel');
    await detailsPanel.evaluate(el => {
      el.setAttribute('data-test-marker', 'in-place-verify');
    });

    await secondNavItem.click();

    // Title and usage code should update to second component
    await expect(
      page.getByRole('heading', {name: secondComponentName!, exact: true}),
    ).toBeVisible();

    // Switch to Edit JSON tab to verify it holds the selected component's editable example
    await editJsonTab.click();
    await expect
      .poll(() => getMonacoContent(page))
      .toMatch(new RegExp(`"component": "${secondComponentName!}"`));
    const secondDraftText = await getMonacoContent(page);
    const secondDraft = JSON.parse(secondDraftText) as Record<string, unknown>;
    expect(Array.isArray(secondDraft['components'])).toBe(true);
    expect(secondDraftText).not.toContain('createSurface');
    expect(secondDraftText).not.toContain('updateComponents');

    // Switch back to Preview tab and assert that the markers are still present, proving DOM elements were reused in-place
    await previewTab.click();
    await expect(detailsPanel).toHaveAttribute('data-test-marker', 'in-place-verify');
    await expect(iframe).toHaveAttribute('data-test-marker', 'persistent-preview');

    // Take screenshot for verification
    const screenshotBuffer = await page.screenshot();
    await testInfo.attach('gallery-user-journey-success', {
      body: screenshotBuffer,
      contentType: 'image/png',
    });
  });

  test('keeps the gallery beside its drawer when shell navigation changes width', async ({
    page,
  }) => {
    await page.setViewportSize({width: 820, height: 800});
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await page.getByRole('link', {name: 'Components Gallery'}).click();
    const toggle = page.getByRole('button', {name: 'Toggle sidenav'});
    await toggle.click();
    await expect(page.locator('.gallery-sidenav')).toHaveCSS('width', '144px');
    await page.setViewportSize({width: 830, height: 800});
    await expect
      .poll(() => page.locator('.gallery-content').evaluate(el => el.style.marginLeft))
      .toBe('144px');
    await toggle.click();
    await expect(page.locator('.gallery-sidenav')).toHaveCSS('width', '208px');
    await expect(page.locator('.gallery-content')).toHaveCSS('margin-left', '208px');
  });

  test('lays out every property with its name on top of its control, JSON fields included', async ({
    page,
  }) => {
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await page.getByRole('link', {name: 'Components Gallery'}).click();
    await page.locator('.catalog-list').getByRole('button', {name: 'Modal', exact: true}).click();
    await expect(page.locator('[data-property-row="accessibility"]')).toBeVisible();

    const rows = await page.locator('[data-property-row]').evaluateAll(elements =>
      elements.map(row => {
        const name = row.querySelector('.property-name')!.getBoundingClientRect();
        const control = row.querySelector('.property-control')!.getBoundingClientRect();
        return {
          property: row.getAttribute('data-property-row'),
          nameBottom: name.bottom,
          controlTop: control.top,
        };
      }),
    );
    expect(rows.map(row => row.property)).toContain('accessibility');
    for (const row of rows) {
      expect(row.nameBottom, row.property ?? '').toBeLessThanOrEqual(row.controlTop + 1);
    }
  });

  test('edits selected-catalog Text and opens the same valid example with its renderer', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/?renderer=http://localhost:3456');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await page.getByRole('link', {name: 'Components Gallery'}).click();
    await page.locator('.catalog-list').getByRole('button', {name: 'Text', exact: true}).click();
    const text = page.getByRole('textbox', {name: 'text', exact: true});
    await expect(text).toBeVisible();
    const edited = 'Ready to use from my selected catalog';
    await text.fill(edited);
    const preview = page.frameLocator('.preview-card iframe');
    await expect(preview.getByText(edited, {exact: true})).toBeVisible();

    await page.getByRole('tab', {name: 'Edit JSON', exact: true}).click();
    await expect.poll(() => getMonacoContent(page)).toMatch(new RegExp(edited));
    await setMonacoContent(page, '{invalid');
    await expect(page.getByRole('alert').filter({hasText: 'last valid example'})).toBeVisible();
    await page.getByRole('tab', {name: 'Preview', exact: true}).click();
    await expect(preview.getByText(edited, {exact: true})).toBeVisible();
    await page.getByRole('tab', {name: 'Edit JSON', exact: true}).click();
    await page.getByRole('button', {name: 'Copy JSON', exact: true}).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain(edited);
    expect(JSON.parse(copied)[0].createSurface.catalogId).toBeTruthy();

    await page.getByRole('button', {name: 'Open in Composer', exact: true}).click();
    await page.waitForURL(url => !url.pathname.endsWith('/gallery') && url.hash.includes('a2ui='));
    const renderer = new URLSearchParams(new URL(page.url()).hash.slice(1)).get('renderer');
    expect(new URL(renderer!).origin).toBe('http://localhost:3456');
    await expect(page.locator('.workspace-container')).toBeVisible();
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(edited, {exact: true}),
    ).toBeVisible();
  });

  test('keeps the preview card at its column height (at least 400px) without growing with guest content', async ({
    page,
  }) => {
    await trackRendererReady(page);
    await page.goto(`/gallery?renderer=${RENDERER_URLS.angular}`);
    await expect(page.locator('.gallery-container')).toBeVisible();

    const preview = galleryPreview(page);
    // While no component is selected, `.hidden-frame` collapses the preview
    // frame to 0px while keeping the iframe mounted for catalog handshakes.
    expect((await preview.boundingBox())?.height ?? 0).toBe(0);

    await page.locator('.catalog-list').getByRole('button', {name: 'Text', exact: true}).click();
    await expect(page.getByRole('heading', {name: 'Text', exact: true})).toBeVisible();

    const guest = preview.locator('iframe.preview-iframe').contentFrame();
    // Wait for the component to render before measuring it.
    await expect
      .poll(() =>
        guest
          .locator('body')
          .evaluate(() => document.body.firstElementChild?.getBoundingClientRect().height ?? 0),
      )
      .toBeGreaterThan(0);

    /** The frame host, its content box, and the iframe inside it, which fills it. */
    const sizes = () =>
      preview.evaluate(host => {
        const style = getComputedStyle(host);
        return {
          host: Math.round(host.clientHeight),
          card: Math.round(
            host.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
          ),
          frame: Math.round(host.querySelector('iframe')!.getBoundingClientRect().height),
        };
      });

    // A small component: the preview card has a 400px minimum height and
    // stretches with `.usage-card`, so it does not shrink to the guest content.
    const small = await guestContentHeight(guest);
    const initial = await sizes();
    expect(initial.host).toBeGreaterThanOrEqual(PREVIEW_CARD_HEIGHT_PX);
    expect(initial.frame).toBe(initial.card);
    expect(small).toBeLessThan(initial.frame);
    expect(await guestScrollRange(guest)).toBeLessThanOrEqual(1);

    // A tall component: no component in the basic catalog renders taller than
    // the card at this width, so the guest's content is made taller in place.
    // The guest reports the new height; the card must not grow with it, and
    // the extra content must scroll inside the frame instead.
    const tallReport = page.evaluate(
      minHeight =>
        new Promise<number>(resolve => {
          window.addEventListener('message', event => {
            const data = event.data as {type?: string; payload?: {height?: number}} | null;
            if (data?.type === 'SURFACE_RESIZE' && (data.payload?.height ?? 0) >= minHeight) {
              resolve(data.payload!.height!);
            }
          });
        }),
      TALL_CONTENT_HEIGHT_PX,
    );
    await guest.locator('body').evaluate((body, height) => {
      const filler = document.createElement('div');
      filler.style.height = `${height}px`;
      body.appendChild(filler);
    }, TALL_CONTENT_HEIGHT_PX);
    expect(await tallReport).toBeGreaterThanOrEqual(TALL_CONTENT_HEIGHT_PX);
    expect(await guestScrollRange(guest)).toBeGreaterThan(0);
    expect(await sizes()).toEqual(initial);
    expect(
      await guest.locator('html').evaluate(el => {
        el.scrollTop = el.scrollHeight;
        return el.scrollTop;
      }),
    ).toBeGreaterThan(0);

    // This frame is the gallery's default bridge target, and in fill mode it
    // takes its host's height (0px while hidden before a selection). It
    // must keep answering the catalog handshake either way.
    await expectNoCatalogWatchdog(page);
  });
});
