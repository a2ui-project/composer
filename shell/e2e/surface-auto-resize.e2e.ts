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

function generateSurfacePayload(rowCount: number): string {
  const children: string[] = [];
  const components: Array<Record<string, unknown>> = [];

  for (let i = 0; i < rowCount; i++) {
    const rowId = `row_${i}`;
    children.push(rowId);
    components.push({
      id: rowId,
      component: 'Text',
      text: `Row item index ${i} with substantial content line to verify natural surface expansion`,
      variant: 'body',
    });
  }

  components.unshift({
    id: 'root',
    component: 'Column',
    children,
  });

  return JSON.stringify([
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'resize_surface',
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'resize_surface',
        components,
      },
    },
  ]);
}

async function setMonacoContent(page: import('@playwright/test').Page, jsonString: string) {
  const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
  await expect(editorLocator).toBeVisible();

  await page.waitForFunction(() => {
    const monaco = (window as unknown as WindowWithMonaco).monaco;
    return (monaco?.editor?.getModels()?.length ?? 0) > 0;
  });

  await page.evaluate(val => {
    const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
    if (model) {
      model.setValue(val);
    }
  }, jsonString);
}

test.beforeEach(async ({page}) => {
  page.on('pageerror', err => {
    console.error(`Unhandled page error: ${err.message}`);
  });

  await page.addInitScript(() => {
    try {
      localStorage.setItem('a2ui_composer_force_1p', 'true');
    } catch (e) {}
  });
});

/** Renderer dev servers hosting the guest samples. */
const RENDERER_URLS: ReadonlyArray<{name: string; url: string}> = [
  {name: 'Angular', url: 'http://localhost:3456'},
  {name: 'Lit', url: 'http://localhost:3457'},
  {name: 'React', url: 'http://localhost:3458'},
];

/**
 * Covers the direction of travel of the frame height. The bound on how much
 * SURFACE_RESIZE traffic an idle preview may emit is asserted per renderer in
 * renderer-integration-and-telemetry.e2e.ts, off the postMessage wire.
 */
test.describe('Surface Auto-Resize & Height Latch Prevention', () => {
  // The latch lives in shared bridge code, but each guest brings its own
  // sizing CSS, so each one has to be shown shrinking back to its content.
  for (const renderer of RENDERER_URLS) {
    test(`shrinks the ${renderer.name} preview frame when the surface content shrinks`, async ({
      page,
    }) => {
      await page.goto(`/?renderer=${renderer.url}`);
      await expect(page.locator('.workspace-container')).toBeVisible();

      const container = page.locator('.rendered-frame-container');
      await expect(container).toBeVisible();

      // 1. Render tall surface (40 rows)
      const tallPayload = generateSurfacePayload(40);
      await setMonacoContent(page, tallPayload);

      // Wait for frame to expand beyond 2000px
      await expect
        .poll(
          async () => {
            const box = await container.boundingBox();
            return box?.height ?? 0;
          },
          {timeout: 10000},
        )
        .toBeGreaterThan(2000);

      // 2. Render small surface (3 rows)
      const smallPayload = generateSurfacePayload(3);
      await setMonacoContent(page, smallPayload);

      // Frame should shrink below 400px and remain >= 280px (min-height)
      await expect
        .poll(
          async () => {
            const box = await container.boundingBox();
            return box?.height ?? 0;
          },
          {timeout: 10000},
        )
        .toBeLessThan(400);

      const finalBox = await container.boundingBox();
      expect(finalBox?.height).toBeGreaterThanOrEqual(280);
    });
  }

  test('renders tall surface content without clipping', async ({page}) => {
    await page.goto(`/?renderer=${RENDERER_URLS[0].url}`);
    await expect(page.locator('.workspace-container')).toBeVisible();

    const container = page.locator('.rendered-frame-container');
    await expect(container).toBeVisible();

    // Render tall surface (40 rows)
    const tallPayload = generateSurfacePayload(40);
    await setMonacoContent(page, tallPayload);

    // Ensure frame has grown to accommodate tall content
    await expect
      .poll(
        async () => {
          const box = await container.boundingBox();
          return box?.height ?? 0;
        },
        {timeout: 10000},
      )
      .toBeGreaterThan(2000);

    // Verify container height is >= guest body scrollHeight
    const iframe = page.frameLocator('iframe.preview-iframe');
    const guestBody = iframe.locator('body');
    await expect(guestBody).toBeVisible();

    await expect
      .poll(
        async () => {
          const guestScrollHeight = await guestBody.evaluate(el => el.scrollHeight);
          const containerBox = await container.boundingBox();
          const containerHeight = containerBox?.height ?? 0;
          return containerHeight >= guestScrollHeight;
        },
        {timeout: 5000},
      )
      .toBe(true);
  });
});
