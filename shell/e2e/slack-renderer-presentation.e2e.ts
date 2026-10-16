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
import {
  collectUnexpectedErrors,
  DATA_BOUND_ACTION_JSON,
  openGeneratedBlockKit,
  openComposerWithSlackRenderer,
  replaceMonacoJson,
  SLACK_360_EMBED_VIEWPORT,
  slackPreviewFrame,
  slackPreviewSurface,
} from './slack-renderer.helpers';
import {waitForMonacoEditor} from './helpers';

const PREVIEW_360_EMBED_WIDTH = 360;
// Dockview split gutters and borders can add up to two CSS pixels to the panel width.
const PREVIEW_WIDTH_TOLERANCE = 2;
// The overflow check only means something if the panel is no wider than the embed and
// hasn't collapsed, so anything in this range counts as a 360px embed. The floor is
// loose because Linux's classic scrollbars make the panel about 20px narrower than
// macOS's overlay scrollbars do at the same viewport.
const PREVIEW_MIN_EMBED_WIDTH = 320;
const COPY_STATUS = {
  copied: 'Block Kit copied.',
  fallback: 'Clipboard unavailable. Select and copy the JSON below.',
} as const;

test.describe('Slack renderer presentation in Composer', () => {
  test('updates theme, fits a 360px embed, and exposes copy fallback without browser errors', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await page.setViewportSize(SLACK_360_EMBED_VIEWPORT);
    await loadDataBoundActionExample(page);

    await expect(slackPreviewFrame(page).locator('.slack-preview-shell')).toHaveAttribute(
      'data-theme',
      'light',
    );
    const lightTheme = await renderedThemeSnapshot(page);

    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(slackPreviewFrame(page).locator('.slack-preview-shell')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    await expect.poll(async () => renderedThemeSnapshot(page)).not.toEqual(lightTheme);

    await page.getByRole('button', {name: 'Switch to light theme'}).click();
    await expect(slackPreviewFrame(page).locator('.slack-preview-shell')).toHaveAttribute(
      'data-theme',
      'light',
    );

    await expectEmbeddedPreviewWidth(page);
    expect(await collectOverflowDiagnostics(page)).toEqual([]);

    await openGeneratedBlockKit(page);
    await expect(
      slackPreviewFrame(page).getByRole('button', {name: 'Copy Block Kit'}),
    ).toBeEnabled();
    await expect(slackPreviewFrame(page).getByTestId('block-kit-json')).toContainText(
      'Ready for review',
    );

    await stubClipboardSuccess(page);
    expect(await clickGeneratedBlockKitCopy(page, [COPY_STATUS.copied])).toBe(COPY_STATUS.copied);
    await expect.poll(async () => getLastCopiedBlockKitJson(page)).toContain('Ready for review');

    await stubClipboardFailure(page);
    expect(await clickGeneratedBlockKitCopy(page, [COPY_STATUS.fallback])).toBe(
      COPY_STATUS.fallback,
    );
    await expect(slackPreviewFrame(page).getByTestId('block-kit-json')).toContainText(
      'Ready for review',
    );

    expect(unexpectedErrors).toEqual([]);
  });
});

async function loadDataBoundActionExample(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page);
  await waitForMonacoEditor(page);
  await replaceMonacoJson(page, DATA_BOUND_ACTION_JSON);
  await expect(
    slackPreviewSurface(page).getByText('Ready for review', {exact: true}),
  ).toBeVisible();
  await expect(slackPreviewFrame(page).getByRole('button', {name: 'Acknowledge'})).toBeVisible();
}

async function renderedThemeSnapshot(page: Page): Promise<{
  backgroundColor: string;
  color: string;
}> {
  return slackPreviewSurface(page).evaluate(element => {
    const slackBlock = element.querySelector('[class*="slack_blocks_to_jsx"]') ?? element;
    const style = window.getComputedStyle(slackBlock);

    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
    };
  });
}

async function collectOverflowDiagnostics(page: Page): Promise<string[]> {
  const hostDiagnostics = await page.evaluate(() => {
    const diagnostics: string[] = [];
    const documentElement = document.documentElement;
    const body = document.body;

    for (const [name, element] of [
      ['host document', documentElement],
      ['host body', body],
    ] as const) {
      if (element.scrollWidth > element.clientWidth + 1) {
        diagnostics.push(
          `${name} overflows horizontally: scrollWidth=${element.scrollWidth}, clientWidth=${element.clientWidth}`,
        );
      }
    }

    return diagnostics;
  });

  const frameDiagnostics = await slackPreviewFrame(page)
    .locator('body')
    .evaluate(body => {
      const diagnostics: string[] = [];
      const documentElement = document.documentElement;
      const preview = document.querySelector('[aria-label="Slack preview"]');

      for (const [name, element] of [
        ['renderer document', documentElement],
        ['renderer body', body],
        ['Slack preview', preview],
      ] as const) {
        if (element && element.scrollWidth > element.clientWidth + 1) {
          diagnostics.push(
            `${name} overflows horizontally: scrollWidth=${element.scrollWidth}, clientWidth=${element.clientWidth}`,
          );
        }
      }

      return diagnostics;
    });

  return [...hostDiagnostics, ...frameDiagnostics];
}

async function expectEmbeddedPreviewWidth(page: Page): Promise<void> {
  const previewWidth = () =>
    page
      .locator('iframe.preview-iframe')
      .first()
      .evaluate(iframe => Math.floor(iframe.getBoundingClientRect().width));
  await expect.poll(previewWidth).toBeGreaterThanOrEqual(PREVIEW_MIN_EMBED_WIDTH);
  await expect
    .poll(previewWidth)
    .toBeLessThanOrEqual(PREVIEW_360_EMBED_WIDTH + PREVIEW_WIDTH_TOLERANCE);
}

async function clickGeneratedBlockKitCopy(
  page: Page,
  expectedStatuses: readonly string[],
): Promise<string> {
  await slackPreviewFrame(page).getByRole('button', {name: 'Copy Block Kit'}).click();
  const status = slackPreviewFrame(page).locator('[role="status"]');

  // Polling the text itself, rather than a boolean, reports the status actually shown
  // when the expected one never appears.
  await expect
    .poll(async () => (await status.textContent())?.trim() ?? '')
    .toMatch(new RegExp(`^(${expectedStatuses.map(escapeRegExp).join('|')})$`));

  return (await status.textContent())?.trim() ?? '';
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function stubClipboardSuccess(page: Page): Promise<void> {
  await slackPreviewFrame(page)
    .locator('body')
    .evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: (value: string) => {
            (window as typeof window & {__lastBlockKitCopy?: string}).__lastBlockKitCopy = value;
            return Promise.resolve();
          },
        },
      });
    });
}

async function getLastCopiedBlockKitJson(page: Page): Promise<string> {
  return slackPreviewFrame(page)
    .locator('body')
    .evaluate(
      () => (window as typeof window & {__lastBlockKitCopy?: string}).__lastBlockKitCopy ?? '',
    );
}

async function stubClipboardFailure(page: Page): Promise<void> {
  await slackPreviewFrame(page)
    .locator('body')
    .evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new Error('clipboard denied by test')),
        },
      });
    });
}
