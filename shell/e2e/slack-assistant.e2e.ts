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

import {expect, test, type Locator, type Page} from '@playwright/test';
import type {RenderA2uiItem} from 'a2ui-bridge';
import {
  FAKE_GEMINI_API_KEY,
  getCapturedGeminiRequests,
  installGeminiFixture,
  setGeminiScenarios,
  splitTextIntoGeminiChunks,
} from './helpers/gemini-fixture';
import {
  collectUnexpectedErrors,
  getBlockKitActionIds,
  getBlockKitJson,
  getBlockKitTextMatches,
  openComposerWithSlackRenderer,
  SLACK_360_EMBED_VIEWPORT,
  SLACK_CATALOG_ID,
  slackPreviewFrame,
  slackPreviewSurface,
} from './slack-renderer.helpers';

const SURFACE_ID = 'assistant-slack-surface';
const GENERATED_STATUS = 'Schedule approved for launch';
const REFINED_STATUS = 'Schedule approved for launch with legal copied';
const GENERATED_BUTTON_LABEL = 'Approve launch';
const GENERATED_ACTION_ID_PATTERN = /^a2ui-\d+-1$/;
/** A prompt asking the assistant for a Slack approval message. */
const APPROVAL_PROMPT = 'Create a Slack approval message with one action button.';

/** The assistant's World Cup score table, from which the table tests start. */
const TABLE_MESSAGES: RenderA2uiItem[] = [
  {version: 'v0.9', createSurface: {surfaceId: 'scores', catalogId: SLACK_CATALOG_ID}},
  {
    version: 'v0.9',
    updateDataModel: {surfaceId: 'scores', path: '/', value: {finalScore: '3–3 (4–2 pens)'}},
  },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'scores',
      components: [
        {id: 'root', component: 'Column', children: ['title', 'scores', 'note']},
        {id: 'title', component: 'Text', variant: 'h1', text: '🏆 World Cup · Classic matches'},
        {
          id: 'scores',
          component: 'Table',
          columns: [{header: 'Team A'}, {header: 'Score', align: 'center'}, {header: 'Team B'}],
          rows: [
            ['🇦🇷 Argentina', {path: '/finalScore'}, '🇫🇷 France'],
            ['🇭🇷 Croatia', '2–1', '🇲🇦 Morocco'],
            ['🇫🇷 France', '2–0', '🇲🇦 Morocco'],
          ],
        },
        {
          id: 'note',
          component: 'Text',
          variant: 'caption',
          text: 'Selected matches from Qatar 2022 · Historical example',
        },
      ],
    },
  },
];

test.describe('Slack assistant browser journey', () => {
  test.beforeEach(async ({page}) => {
    await installGeminiFixture(page);
  });

  test('shows a calm empty Slack preview when a custom renderer has no starter', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openComposerWithSlackRenderer(page, {forceAuthMode: '3p'});
    const frame = slackPreviewFrame(page);
    const emptyState = frame.getByRole('status');
    await expect(
      emptyState.getByRole('heading', {name: 'Your Slack preview starts here'}),
    ).toBeVisible();
    await expect(emptyState.getByText('Example preview', {exact: true})).toBeVisible();
    await expect(emptyState.getByText('Project update', {exact: true})).toBeVisible();
    await expect(emptyState.getByRole('button', {name: 'Approve update'})).toHaveCount(0);
    expect(
      await emptyState.locator('button').evaluate(button => {
        button.focus();
        return document.activeElement === button;
      }),
    ).toBe(false);
    await expect(emptyState).toContainText('Describe a message in the assistant');
    await expect(frame.getByRole('list', {name: 'Preview diagnostics'})).toHaveCount(0);
    await expect(frame.getByText('A2UI_WAITING_FOR_COMPONENT')).toHaveCount(0);
    await expect(frame.getByRole('button', {name: 'Copy Block Kit'})).toHaveCount(0);
    await expect(frame.getByRole('alert')).toHaveCount(0);
    expect(await emptyState.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    expect(unexpectedErrors).toEqual([]);
  });

  test('applies the dark theme to the empty Slack preview', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openComposerWithSlackRenderer(page, {forceAuthMode: '3p'});
    const frame = slackPreviewFrame(page);
    await expect(
      frame.getByRole('status').getByRole('heading', {name: 'Your Slack preview starts here'}),
    ).toBeVisible();
    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(frame.locator('main.slack-preview-shell')).toHaveAttribute('data-theme', 'dark');
    expect(unexpectedErrors).toEqual([]);
  });

  test('generates a Slack score table with aligned columns', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await generateScoreTable(page);
    const table = slackPreviewSurface(page).getByRole('table');
    await expect(
      slackPreviewFrame(page).getByRole('heading', {name: 'Your Slack preview starts here'}),
    ).toHaveCount(0);
    await expect(table.getByRole('row')).toHaveCount(4);
    const cells = table.getByRole('row').nth(1).getByRole('cell');
    await expect(cells).toHaveCount(3);
    await expect(cells.nth(0)).toHaveText('🇦🇷 Argentina');
    await expect(cells.nth(1)).toHaveText('3–3 (4–2 pens)');
    await expect(cells.nth(2)).toHaveText('🇫🇷 France');
    const boxes = await Promise.all([0, 1, 2].map(index => cells.nth(index).boundingBox()));
    expect(boxes.every(box => box !== null)).toBe(true);
    expect(Math.abs(boxes[0]!.y - boxes[2]!.y)).toBeLessThan(2);
    expect(boxes[0]!.x + boxes[0]!.width).toBeLessThanOrEqual(boxes[1]!.x + 1);
    const request = (await getCapturedGeminiRequests(page))[0];
    expect(JSON.stringify(request.body)).toContain('Use this instead of Row/Text combinations');
    expect(await getBlockKitJson(page)).toMatchObject({
      blocks: expect.arrayContaining([expect.objectContaining({type: 'table'})]),
    });
    expect(await getBlockKitTextMatches(page, ['🇦🇷 Argentina', '3–3 (4–2 pens)'])).toEqual([
      '🇦🇷 Argentina',
      '3–3 (4–2 pens)',
    ]);
    expect(unexpectedErrors).toEqual([]);
  });

  test('scrolls a wide generated table inside a 360px embed', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await generateScoreTable(page);
    // In a 360px Slack embed the table is wider than the message, so it scrolls inside
    // its own container while the page itself still fits.
    await page.setViewportSize(SLACK_360_EMBED_VIEWPORT);
    const tableContainer = slackPreviewSurface(page).locator('.slack_blocks_to_jsx__table');
    await expect
      .poll(() =>
        tableContainer.evaluate(element => {
          element.scrollLeft = element.scrollWidth;
          const lastCell = element.querySelector('tr:last-child td:last-child')!;
          return {
            pageFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            scrollable: element.scrollWidth > element.clientWidth && element.scrollLeft > 0,
            lastCellVisible:
              lastCell.getBoundingClientRect().right <= element.getBoundingClientRect().right + 1,
          };
        }),
      )
      .toEqual({pageFits: true, scrollable: true, lastCellVisible: true});
    expect(unexpectedErrors).toEqual([]);
  });

  test('applies the dark theme to a generated table', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await generateScoreTable(page);
    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(slackPreviewFrame(page).locator('main.slack-preview-shell')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    expect(unexpectedErrors).toEqual([]);
  });

  test('refines a generated table cell from a data model update', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await generateScoreTable(page);
    const table = slackPreviewSurface(page).getByRole('table');
    const cells = table.getByRole('row').nth(1).getByRole('cell');
    await setGeminiScenarios(page, [
      {
        chunks: splitTextIntoGeminiChunks(
          toJsonl([
            {
              version: 'v0.9',
              updateDataModel: {
                surfaceId: 'scores',
                path: '/finalScore',
                value: 'Argentina win on penalties',
              },
            },
          ]),
        ),
      },
    ]);
    await submitPrompt(page, 'Clarify the final result as Argentina win on penalties.');
    await expect(cells.nth(1)).toHaveText('Argentina win on penalties');
    await expect(table.getByRole('row')).toHaveCount(4);
    expect(await getBlockKitTextMatches(page, ['Argentina win on penalties'])).toEqual([
      'Argentina win on penalties',
    ]);
    expect(unexpectedErrors).toEqual([]);
  });

  test('shows the Slack catalog in the system instructions', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await page.getByLabel('Chat prompt').fill(APPROVAL_PROMPT);
    await page.getByRole('button', {name: 'Add to prompt'}).click();
    await page.getByRole('menuitem', {name: /^Instructions/}).click();
    const instructions = page.getByRole('dialog', {name: 'System Instructions'});
    await expect(instructions.getByLabel('System instructions text')).toContainText(
      SLACK_CATALOG_ID,
    );
    await instructions.getByRole('button', {name: 'Close', exact: true}).click();
    await expect(instructions).toBeHidden();
    expect(unexpectedErrors).toEqual([]);
  });

  test('passes the Slack Image URL pattern to the system instructions', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await page.getByLabel('Chat prompt').fill(APPROVAL_PROMPT);
    await page.getByRole('button', {name: 'Add to prompt'}).click();
    await page.getByRole('menuitem', {name: /^Instructions/}).click();
    const instructions = page.getByRole('dialog', {name: 'System Instructions'});
    // The catalog declares the pattern on Image.url; the shell reads it, not the wording.
    await expect(instructions.getByLabel('System instructions text')).toContainText(
      'For Image.url, use only URLs matching `^https?://`',
    );
    await instructions.getByRole('button', {name: 'Close', exact: true}).click();
    await expect(instructions).toBeHidden();
    expect(unexpectedErrors).toEqual([]);
  });

  test('turns including a screenshot on and off from the prompt menu', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await page.getByLabel('Chat prompt').fill(APPROVAL_PROMPT);
    const add = page.getByRole('button', {name: 'Add to prompt'});
    await add.click();
    await page.getByRole('menuitemcheckbox', {name: 'Include screenshot'}).click();
    await expect(add).toHaveAttribute('aria-description', /screenshot will be included/);
    await expect(page.getByRole('menu')).toBeHidden();
    await add.click();
    const screenshotOption = page.getByRole('menuitemcheckbox', {name: 'Include screenshot'});
    await expect(screenshotOption).toHaveAttribute('aria-checked', 'true');
    await screenshotOption.click();
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(page.locator('.submit-action-bar button')).toHaveCount(3);
    expect(unexpectedErrors).toEqual([]);
  });

  test('changes renderer from the composer pill and keeps the prompt', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await switchToAngularFromPill(page);
    await expect(page.getByLabel('Chat prompt')).toHaveValue(APPROVAL_PROMPT);
    await expect(page.getByRole('button', {name: 'Send prompt'})).toBeEnabled();
    expect(unexpectedErrors).toEqual([]);
  });

  test('changes renderer back to Slack from the assistant tool', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await switchToAngularFromPill(page);
    await setGeminiScenarios(page, [
      {
        chunks: [
          {
            candidates: [
              {
                content: {
                  role: 'model',
                  parts: [{functionCall: {name: 'switchRenderer', args: {rendererId: 'slack'}}}],
                },
              },
            ],
          },
        ],
      },
      {chunks: splitTextIntoGeminiChunks(toJsonl(generation()))},
    ]);
    await page.getByRole('button', {name: 'Send prompt'}).click();
    await expect(slackPreviewSurface(page).getByText(GENERATED_STATUS)).toBeVisible();
    await expect(slackRendererPill(page)).toBeEnabled();
    const requests = await getCapturedGeminiRequests(page);
    expect(requests).toHaveLength(2);
    expect(requests[0].body).toMatchObject({
      tools: [{functionDeclarations: [expect.objectContaining({name: 'switchRenderer'})]}],
    });
    expect(JSON.stringify(requests[1].body)).toContain(SLACK_CATALOG_ID);
    expect(JSON.stringify(requests[1].body)).toContain('Create a Slack approval message');
    expect(requests[1].body).not.toHaveProperty('tools');
    expect(unexpectedErrors).toEqual([]);
  });

  test('opens the renderer menu from the keyboard with the current renderer checked', async ({
    page,
  }) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    const selector = slackRendererPill(page);
    await expect(selector).toBeEnabled();
    await selector.focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('menuitemradio', {name: 'Slack Block Kit Preview', exact: true}),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.mat-mdc-menu-panel')).not.toHaveClass(/mat-menu-panel-animating/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(selector).toBeFocused();
    expect(unexpectedErrors).toEqual([]);
  });

  test('opens the renderer menu in the dark theme', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    const selector = slackRendererPill(page);
    await expect(selector).toBeEnabled();
    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    await selector.click();
    await expect(
      page.getByRole('menuitemradio', {name: 'Slack Block Kit Preview', exact: true}),
    ).toBeVisible();
    await expect(page.locator('.mat-mdc-menu-panel')).not.toHaveClass(/mat-menu-panel-animating/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    expect(unexpectedErrors).toEqual([]);
  });

  test('selects the built-in Slack renderer and shows it in Settings', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openComposerWithSlackRenderer(page, {rendererId: 'slack', forceAuthMode: '3p'});

    await expect(
      slackPreviewFrame(page).getByRole('textbox', {name: 'Pick-up Location'}),
    ).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('a2ui_composer_selected_renderer')))
      .toBe('slack');
    await addFakeGeminiApiKeyThroughSettings(page);
    await page.getByRole('link', {name: 'Settings'}).click();
    await expect(page.locator('a2ui-composer-renderer-selector')).toContainText(
      'Slack Block Kit Preview',
    );
    await expect(page.locator('a2ui-composer-api-key-selector')).toContainText(
      'E2E fake Gemini key',
    );
    await page.getByRole('link', {name: 'Composer Workspace'}).click();
    await expect(page.locator('.workspace-container')).toBeVisible();
    await expect(
      slackPreviewFrame(page).getByRole('textbox', {name: 'Pick-up Location'}),
    ).toBeVisible();
    expect(unexpectedErrors).toEqual([]);
  });

  test('generates Slack Block Kit with the built-in Slack renderer', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await expect(
      slackPreviewFrame(page).getByRole('textbox', {name: 'Pick-up Location'}),
    ).toBeVisible();

    await setGeminiScenarios(page, [{chunks: splitTextIntoGeminiChunks(toJsonl(generation()))}]);
    await submitPrompt(page, APPROVAL_PROMPT);

    await expect(slackPreviewSurface(page).getByText(GENERATED_STATUS)).toBeVisible();
    await expect(
      slackPreviewFrame(page).getByRole('button', {name: GENERATED_BUTTON_LABEL}),
    ).toBeVisible();
    expect(await getBlockKitTextMatches(page, [GENERATED_STATUS, GENERATED_BUTTON_LABEL])).toEqual([
      GENERATED_STATUS,
      GENERATED_BUTTON_LABEL,
    ]);
    expect(await getBlockKitActionIds(page)).toEqual(
      expect.arrayContaining([expect.stringMatching(GENERATED_ACTION_ID_PATTERN)]),
    );
    await expectCapturedGeminiRequest(page, 'Slack Preview Renderer Catalog');
    expect(unexpectedErrors).toEqual([]);
  });

  test('refines generated Slack Block Kit with a data model update', async ({page}) => {
    const unexpectedErrors = collectUnexpectedErrors(page);
    await openSlackAssistant(page);
    await setGeminiScenarios(page, [{chunks: splitTextIntoGeminiChunks(toJsonl(generation()))}]);
    await submitPrompt(page, APPROVAL_PROMPT);
    await expect(slackPreviewSurface(page).getByText(GENERATED_STATUS)).toBeVisible();

    await setGeminiScenarios(page, [{chunks: splitTextIntoGeminiChunks(toJsonl(refinement()))}]);
    await submitPrompt(page, 'Refine the Slack message to mention legal has copied.');

    await expect(slackPreviewSurface(page).getByText(REFINED_STATUS)).toBeVisible();
    await expect(
      slackPreviewFrame(page).getByRole('button', {name: GENERATED_BUTTON_LABEL}),
    ).toBeVisible();
    expect(await getBlockKitTextMatches(page, [REFINED_STATUS, GENERATED_BUTTON_LABEL])).toEqual([
      REFINED_STATUS,
      GENERATED_BUTTON_LABEL,
    ]);
    expect(await getBlockKitActionIds(page)).toEqual(
      expect.arrayContaining([expect.stringMatching(GENERATED_ACTION_ID_PATTERN)]),
    );
    await expectCapturedGeminiRequest(page, GENERATED_STATUS);
    expect(unexpectedErrors).toEqual([]);
  });
});

/**
 * Opens Composer on the built-in Slack renderer with a fake Gemini key, back on the
 * workspace, ready for a prompt.
 */
async function openSlackAssistant(page: Page): Promise<void> {
  await openComposerWithSlackRenderer(page, {rendererId: 'slack', forceAuthMode: '3p'});
  await addFakeGeminiApiKeyThroughSettings(page);
  await page.getByRole('link', {name: 'Composer Workspace'}).click();
}

/** Has the assistant generate the World Cup score table and waits for it to render. */
async function generateScoreTable(page: Page): Promise<void> {
  await openSlackAssistant(page);
  await setGeminiScenarios(page, [{chunks: splitTextIntoGeminiChunks(toJsonl(TABLE_MESSAGES))}]);
  await submitPrompt(page, 'Build a table with World Cup scores.');
  await expect(slackPreviewSurface(page).getByRole('table')).toBeVisible();
}

/** The composer's renderer pill while the Slack renderer is selected. */
function slackRendererPill(page: Page): Locator {
  return page.getByRole('button', {name: 'Choose renderer, current: Slack Block Kit Preview'});
}

/** Types APPROVAL_PROMPT, then switches to Angular from the renderer pill. */
async function switchToAngularFromPill(page: Page): Promise<void> {
  await page.getByLabel('Chat prompt').fill(APPROVAL_PROMPT);
  const selector = slackRendererPill(page);
  await expect(selector).toBeEnabled();
  await selector.click();
  await page.getByRole('menuitemradio', {name: 'Angular Basic (local)', exact: true}).click();
  await expect(
    page.getByRole('button', {name: 'Choose renderer, current: Angular Basic (local)'}),
  ).toBeEnabled();
}

async function addFakeGeminiApiKeyThroughSettings(page: Page): Promise<void> {
  await page.getByRole('link', {name: 'Settings'}).click();
  await page.getByRole('button', {name: 'Add Gemini API key'}).click();
  const apiKeyDialog = page.getByRole('dialog', {name: 'Add Gemini API Key'});
  await expect(apiKeyDialog).toBeVisible();
  await apiKeyDialog.getByLabel('Name', {exact: true}).fill('E2E fake Gemini key');
  await apiKeyDialog.getByLabel('API Key', {exact: true}).fill(FAKE_GEMINI_API_KEY);
  await apiKeyDialog.getByRole('button', {name: 'Add', exact: true}).click();
  await expect(apiKeyDialog).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('a2ui_composer_selected_api_key')))
    .toMatch(/^custom-\d+$/);
}

async function submitPrompt(page: Page, prompt: string): Promise<void> {
  await page.getByLabel('Chat prompt').fill(prompt);
  await page.getByRole('button', {name: 'Send prompt'}).click();
}

async function expectCapturedGeminiRequest(page: Page, expectedDraftText: string): Promise<void> {
  const requests = await getCapturedGeminiRequests(page);
  expect(requests).toHaveLength(1);
  const request = requests[0];
  // The default model is the client's choice and changes over time; the endpoint is what matters.
  expect(request.url).toMatch(/\/v1beta\/models\/[\w.-]+:streamGenerateContent/);
  expect(request.url).toContain('alt=sse');
  expect(request.headers['x-goog-api-key']).toBe(FAKE_GEMINI_API_KEY);
  const bodyText = JSON.stringify(request.body);
  expect(bodyText).toContain(expectedDraftText);
  expect(bodyText).toContain(SLACK_CATALOG_ID);
  expect(bodyText).toContain('thinkingConfig');
}

function toJsonl(items: RenderA2uiItem[]): string {
  return items.map(item => JSON.stringify(item)).join('\n');
}

function generation(): RenderA2uiItem[] {
  return [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: SURFACE_ID,
        catalogId: SLACK_CATALOG_ID,
      },
    },
    {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: '/',
        value: {
          status: GENERATED_STATUS,
          record: {
            id: 'launch-42',
          },
        },
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: slackComponents(),
      },
    },
  ];
}

function refinement(): RenderA2uiItem[] {
  return [
    {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: '/',
        value: {
          status: REFINED_STATUS,
          record: {
            id: 'launch-42',
          },
        },
      },
    },
  ];
}

function slackComponents(): Array<Record<string, unknown>> {
  return [
    {
      id: 'root',
      component: 'Column',
      children: ['status-copy', 'approval-button'],
      justify: 'start',
      align: 'stretch',
    },
    {
      id: 'status-copy',
      component: 'Text',
      text: {
        path: '/status',
      },
    },
    {
      id: 'approval-button',
      component: 'Button',
      child: 'approval-label',
      variant: 'primary',
      action: {
        event: {
          name: 'approve_launch',
          context: {
            recordId: {
              path: '/record/id',
            },
          },
        },
      },
    },
    {
      id: 'approval-label',
      component: 'Text',
      text: GENERATED_BUTTON_LABEL,
    },
  ];
}
