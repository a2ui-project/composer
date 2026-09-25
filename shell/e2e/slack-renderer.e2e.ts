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

import {test, expect, type Page} from '@playwright/test';
import {
  collectUnexpectedErrors,
  DATA_BOUND_ACTION_JSON,
  expectBlockKitJsonToContain,
  getSevereMonacoMarkers,
  MARKET_SNAPSHOT_JSON,
  MONACO_MARKER_DEBOUNCE_MS,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  selectGalleryComponent,
  slackPreviewFrame,
  slackPreviewSurface,
  waitForMonaco,
} from './slack-renderer.helpers';

const EXPECTED_COMPONENTS = [
  'Button',
  'Card',
  'Column',
  'DateTimeInput',
  'Divider',
  'Image',
  'MarketSnapshot',
  'Row',
  'Table',
  'Text',
  'TextField',
];

/** Checks the selected component's example JSON shown in the Gallery. */
async function expectExampleJson(page: Page, fragments: string[]): Promise<void> {
  const example = page.locator('.usage-code');
  for (const fragment of fragments) {
    await expect(example).toContainText(fragment);
  }
}

test.describe('Slack renderer in Composer', () => {
  test('registers the Slack catalog and renders Button, Table, and MarketSnapshot Gallery usages', async ({
    page,
    context,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await openComposerWithSlackRenderer(page);
    await page.getByRole('link', {name: 'Components Gallery'}).click();
    await page.waitForURL('**/gallery');
    await expect(page.locator('.gallery-container')).toBeVisible();

    const navItems = page.locator('.catalog-list').getByRole('button');
    await expect(navItems).toHaveCount(EXPECTED_COMPONENTS.length);
    const componentNames = (await navItems.allTextContents()).map(text => text.trim()).sort();
    expect(componentNames).toEqual(EXPECTED_COMPONENTS);

    await selectGalleryComponent(page, 'Button');
    await expectExampleJson(page, ['"component": "Button"', '"name": "acknowledge"']);
    await expect(
      slackPreviewSurface(page).getByText('Ready for review', {exact: true}),
    ).toBeVisible();
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge'})).toBeVisible();

    await page.getByRole('button', {name: 'Copy to Clipboard'}).click();
    await expect
      .poll(async () => {
        const commands = JSON.parse(await page.evaluate(() => navigator.clipboard.readText())) as
          Array<Record<string, unknown>> | unknown;
        if (!Array.isArray(commands)) {
          return {isArray: false};
        }

        const createSurface = commands[0]?.['createSurface'] as Record<string, unknown> | undefined;
        const updateComponents = commands.find(command => 'updateComponents' in command)?.[
          'updateComponents'
        ] as Record<string, unknown> | undefined;
        const updateDataModel = commands.find(command => 'updateDataModel' in command)?.[
          'updateDataModel'
        ] as Record<string, unknown> | undefined;
        const components = updateComponents?.['components'] as
          Array<Record<string, unknown>> | undefined;

        return {
          isArray: true,
          commandCount: commands.length,
          catalogId: createSurface?.['catalogId'],
          updateSurfaceId: updateComponents?.['surfaceId'],
          dataSurfaceId: updateDataModel?.['surfaceId'],
          hasButton: components?.some(component => component['component'] === 'Button') ?? false,
          greeting: (updateDataModel?.['value'] as Record<string, unknown> | undefined)?.[
            'greeting'
          ],
        };
      })
      .toEqual({
        isArray: true,
        commandCount: 3,
        catalogId: 'https://a2ui-project.github.io/composer/catalogs/slack/v1',
        updateSurfaceId: 'gallery-preview',
        dataSurfaceId: 'gallery-preview',
        hasButton: true,
        greeting: 'Ready for review',
      });

    await selectGalleryComponent(page, 'Table');
    await expectExampleJson(page, ['"component": "Table"']);
    const scoreTable = slackPreviewSurface(page).getByRole('table');
    await expect(scoreTable.getByRole('row')).toHaveCount(3);
    await expect(scoreTable.getByRole('row').nth(1).getByRole('cell')).toHaveCount(3);
    await expect(scoreTable.getByText('Argentina', {exact: true})).toBeVisible();
    await expect(scoreTable.getByText('Won on penalties', {exact: true})).toBeVisible();

    await selectGalleryComponent(page, 'MarketSnapshot');
    await expectExampleJson(page, ['"component": "MarketSnapshot"', 'Brent crude']);
    await expect(
      slackPreviewSurface(page).getByText('Illustrative historical energy market snapshot'),
    ).toBeVisible();
    await expect(slackPreviewSurface(page).getByText('Brent crude')).toBeVisible();
    await expect(slackPreviewSurface(page).getByText('$79.42/bbl')).toBeVisible();

    expect(unexpectedErrors).toEqual([]);
  });

  test('renders complete Slack examples from Monaco after validation debounce settles', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);

    await openComposerWithSlackRenderer(page);
    await waitForMonaco(page);

    await replaceMonacoJson(page, DATA_BOUND_ACTION_JSON);
    await expect(
      slackPreviewSurface(page).getByText('Ready for review', {exact: true}),
    ).toBeVisible();
    await expect(slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge'})).toBeVisible();

    await page.waitForTimeout(MONACO_MARKER_DEBOUNCE_MS + 600);
    expect(await getSevereMonacoMarkers(page)).toEqual([]);

    const updatedDataBoundJson = DATA_BOUND_ACTION_JSON.replace(
      '"Ready for review"',
      '"Ready for detailed review"',
    );
    await replaceMonacoJson(page, updatedDataBoundJson);
    await expect(slackPreviewSurface(page).getByText('Ready for detailed review')).toBeVisible();
    await expect(slackPreviewSurface(page).getByText('Ready for review')).toHaveCount(0);
    await expectBlockKitJsonToContain(page, 'Ready for detailed review');

    await page.waitForTimeout(MONACO_MARKER_DEBOUNCE_MS + 600);
    expect(await getSevereMonacoMarkers(page)).toEqual([]);

    const updatedMarketJson = MARKET_SNAPSHOT_JSON.replace(
      '"Illustrative historical energy market snapshot"',
      '"Morning energy market snapshot"',
    ).replace('"$79.42/bbl"', '"$81.03/bbl"');
    await replaceMonacoJson(page, updatedMarketJson);

    const preview = slackPreviewSurface(page);
    await expect(preview.getByText('Morning energy market snapshot')).toBeVisible();
    await expect(preview.getByText('Brent crude')).toBeVisible();
    await expect(preview.getByText('$81.03/bbl')).toBeVisible();
    await expect(
      preview.getByText('Energy prices feed into transportation and consumer costs.'),
    ).toBeVisible();
    await expectBlockKitJsonToContain(page, 'Morning energy market snapshot');
    await expectBlockKitJsonToContain(page, '$81.03/bbl');

    await page.waitForTimeout(MONACO_MARKER_DEBOUNCE_MS + 600);
    expect(await getSevereMonacoMarkers(page)).toEqual([]);

    expect(unexpectedErrors).toEqual([]);
  });
});
