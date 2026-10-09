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

import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';
import type {Page} from '@playwright/test';
import type {RenderA2uiItem} from 'a2ui-bridge';
import {deflateRawSync} from 'node:zlib';
import {
  FAKE_GEMINI_API_KEY,
  geminiTextChunk,
  getCapturedGeminiRequests,
  installGeminiFixture,
  setGeminiScenarios,
  splitTextIntoGeminiChunks,
} from './helpers/gemini-fixture';

const DRAFT_TEXT = 'Ready to use from my selected catalog';
const MODEL_TEXT = 'Updated by deterministic Gemini fixture';
const RECOVERY_TEXT = 'Recovered by deterministic Gemini fixture';

const pageErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({page}) => {
  pageErrors.set(page, []);
  page.on('pageerror', err => {
    pageErrors.get(page)?.push(err.message);
  });

  await installGeminiFixture(page);
  await page.route('**/config.json', async route => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        renderers: {
          default: {
            rendererUrl: 'http://localhost:3456',
            displayName: 'Angular Basic',
          },
          lit: {
            rendererUrl: 'http://localhost:3457',
            displayName: 'Lit Basic',
          },
        },
        apiKeys: {
          default: {
            displayName: 'E2E fake Gemini key',
            apiKey: FAKE_GEMINI_API_KEY,
          },
        },
      }),
    });
  });
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('a2ui_composer_force_3p', 'true');
    localStorage.removeItem('a2ui_composer_force_1p');
  });
});

test.afterEach(async ({page}) => {
  expect(pageErrors.get(page)).toEqual([]);
});

/**
 * Opens the workspace on a one-Text draft through a shared design link, so the assistant
 * journeys start from known draft content.
 */
async function openDraftInWorkspace(page: Page): Promise<void> {
  await page.goto('/?renderer=http://localhost:3456');
  await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
  await expect.poll(() => readRawDraft(page)).toContain('createSurface');
  const defaultDraft: RenderA2uiItem[] = JSON.parse(await readRawDraft(page));
  const catalogId = defaultDraft.find(message => message.createSurface)?.createSurface?.catalogId;
  if (!catalogId) {
    throw new Error('Expected the default draft to name its catalog.');
  }
  const draft = [
    {version: 'v0.9', createSurface: {surfaceId: 'selected-example', catalogId}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'selected-example',
        components: [{id: 'root', component: 'Text', text: DRAFT_TEXT}],
      },
    },
  ];
  // Open the draft the way a user opens a shared design link.
  await page.goto(
    `/?renderer=http://localhost:3456#a2ui=${sharedDesignPayload(JSON.stringify(draft))}`,
  );

  await expect(
    page.frameLocator('.workspace-container iframe').getByText(DRAFT_TEXT),
  ).toBeVisible();
  await expect.poll(() => readRawDraft(page)).toContain(DRAFT_TEXT);
}

/**
 * Builds the `#a2ui=` payload that Composer's Share button produces (see
 * `QueryParser.compressPayload`): the JSON, deflate-raw compressed, as URL-safe
 * Base64 with a `d1.` prefix.
 */
function sharedDesignPayload(json: string): string {
  return `d1.${deflateRawSync(Buffer.from(json)).toString('base64url')}`;
}

async function readRawDraft(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const monaco = (window as unknown as {monaco?: {editor?: {getModels?: () => unknown[]}}})
      .monaco;
    const model = monaco?.editor?.getModels?.()[0] as {getValue?: () => string} | undefined;
    return model?.getValue?.() || '';
  });
}

function replaceDraftText(draft: string, from: string, to: string): string {
  return draft.replaceAll(from, to);
}

function chatHistory(page: Page) {
  return page.locator('.chat-history-log, [data-testid="copilot-chat-history"]').first();
}

function parseErrorCard(page: Page) {
  return page.locator('.parse-error-card, [data-testid="parse-error-card"]').first();
}

/** Scans the chat panel with axe's WCAG 2 A and AA rules, which include text contrast. */
async function expectAccessibleChatPanel(page: Page): Promise<void> {
  const results = await new AxeBuilder({page})
    .include('a2ui-composer-chat-panel')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations.map(violation => `${violation.id}: ${violation.help}`)).toEqual([]);
}

async function submitPrompt(page: Page, prompt: string): Promise<void> {
  await page.getByLabel('Chat prompt').fill(prompt);
  await page.getByRole('button', {name: 'Send prompt'}).click();
}

async function expectGeminiRequestForCurrentDraft(page: Page, expectedDraftText: string) {
  const requests = await getCapturedGeminiRequests(page);
  expect(requests).toHaveLength(1);
  const request = requests[0];
  // The default model is the client's choice and changes over time; the endpoint is what matters.
  expect(request.url).toMatch(/\/v1beta\/models\/[\w.-]+:streamGenerateContent/);
  expect(request.url).toContain('alt=sse');
  expect(request.headers['x-goog-api-key']).toBe(FAKE_GEMINI_API_KEY);
  const bodyText = JSON.stringify(request.body);
  expect(bodyText).toContain(expectedDraftText);
  expect(bodyText).toContain('my_basic_catalog');
  expect(bodyText).toContain('thinkingConfig');
  return request;
}

test.describe('Copilot assistant replacement browser journey', () => {
  test('switches standard renderers from the pill and keeps the canvas and typed prompt', async ({
    page,
  }) => {
    await openDraftInWorkspace(page);
    const prompt = page.getByRole('textbox', {name: 'Chat prompt'});
    await prompt.fill('Create a simple card in this renderer');
    const selector = page.getByRole('button', {name: /Choose renderer, current:/});

    await selector.click();
    await expect(page.getByRole('menuitemradio', {name: 'Angular Basic'})).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.getByRole('menuitemradio', {name: 'Lit Basic'}).click();
    await expect(selector).toHaveAccessibleName('Choose renderer, current: Lit Basic');
    await expect(page.locator('.workspace-container iframe')).toHaveAttribute(
      'src',
      /localhost:3457/,
    );
    await expect(page.getByRole('button', {name: 'Send prompt'})).toBeEnabled();
    await expect(prompt).toHaveValue('Create a simple card in this renderer');
    // The canvas comes along: same draft in the editor, now drawn by the Lit renderer.
    await expect.poll(() => readRawDraft(page)).toContain(DRAFT_TEXT);
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(DRAFT_TEXT),
    ).toBeVisible();

    await page.getByRole('button', {name: 'Add to prompt', exact: true}).click();
    await page.getByRole('menuitem', {name: /^Instructions/}).click();
    const instructions = page.getByRole('dialog');
    await expect(instructions.getByRole('textbox', {name: 'System instructions text'})).toHaveValue(
      /https:\/\/a2ui\.org\/specification\/v0_9\/basic_catalog\.json/,
    );
    await instructions.getByRole('button', {name: 'Close', exact: true}).click();

    await selector.click();
    await expect(page.getByRole('menuitemradio', {name: 'Lit Basic'})).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.getByRole('menuitemradio', {name: 'Angular Basic'}).click();
    await expect(selector).toHaveAccessibleName('Choose renderer, current: Angular Basic');
    await expect(page.locator('.header-title')).toContainText('my_basic_catalog');
    await expect(page.getByRole('button', {name: 'Send prompt'})).toBeEnabled();
    await expect(prompt).toHaveValue('Create a simple card in this renderer');
    await expect.poll(() => readRawDraft(page)).toContain(DRAFT_TEXT);
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(DRAFT_TEXT),
    ).toBeVisible();
  });

  test('explains under the renderer menu why a renderer could not be selected', async ({page}) => {
    await page.addInitScript(() => {
      if (window === window.top) {
        localStorage.setItem(
          'a2ui_composer_custom_renderers',
          JSON.stringify([
            {id: 'legacy', name: 'Legacy preview', rendererUrl: 'ftp://files.example/renderer'},
          ]),
        );
      }
    });
    await openDraftInWorkspace(page);
    const selector = page.getByRole('button', {name: /Choose renderer, current:/});

    await selector.click();
    await page.getByRole('menuitemradio', {name: 'Legacy preview'}).click();

    await expect(page.locator('a2ui-composer-chat-panel').getByRole('alert')).toHaveText(
      "Couldn't switch to Legacy preview because its URL isn't an http or https address. Fix its URL in Settings, or choose another renderer.",
    );
    await expect(selector).toHaveAccessibleName('Choose renderer, current: Angular Basic');
    await expect(page.locator('.workspace-container iframe')).toHaveAttribute(
      'src',
      /localhost:3456/,
    );
  });

  test('keeps prompt helpers in the Add menu and preserves drafted text', async ({page}) => {
    await openDraftInWorkspace(page);
    const prompt = page.getByRole('textbox', {name: 'Chat prompt'});
    await prompt.fill('Keep this draft while I add context');
    const add = page.getByRole('button', {name: 'Add to prompt', exact: true});

    await add.click();
    await expect(page.getByRole('menuitem', {name: 'Attach files'})).toBeVisible();
    await expect(page.getByRole('menuitemcheckbox', {name: 'Include screenshot'})).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(page.getByRole('menuitem', {name: 'Attach files'})).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(add).toBeFocused();

    await add.click();
    await page.getByRole('menuitemcheckbox', {name: 'Include screenshot'}).click();
    await expect(add).toHaveAttribute('aria-description', /screenshot will be included/);
    await add.click();
    const screenshot = page.getByRole('menuitemcheckbox', {name: 'Include screenshot'});
    await expect(screenshot).toHaveAttribute('aria-checked', 'true');
    await screenshot.click();
    await expect(add).not.toHaveAttribute('aria-description');

    await add.click();
    await page.getByRole('menuitem', {name: /^Instructions/}).click();
    const instructions = page.getByRole('dialog');
    await expect(instructions.getByRole('heading', {name: 'System Instructions'})).toBeVisible();
    await expect(instructions.getByRole('textbox', {name: 'System instructions text'})).toHaveValue(
      /my_basic_catalog/,
    );
    await instructions.getByRole('button', {name: 'Close', exact: true}).click();

    await add.click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('menuitem', {name: 'Attach files', exact: true}).click();
    await (
      await chooser
    ).setFiles({
      name: 'brief.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Make the selected card easier to read.'),
    });
    await expect(page.locator('.attachment-previews')).toContainText('brief.txt');
    await page.getByRole('button', {name: 'Remove attachment'}).click();
    await expect(page.locator('.attachment-previews')).not.toBeVisible();
    await expect(prompt).toHaveValue('Keep this draft while I add context');
  });

  test('uses the current draft as context to update the workspace preview', async ({page}) => {
    await openDraftInWorkspace(page);
    const originalDraft = await readRawDraft(page);
    expect(originalDraft).toContain(DRAFT_TEXT);
    const updatedDraft = replaceDraftText(originalDraft, DRAFT_TEXT, MODEL_TEXT);

    await setGeminiScenarios(page, [{chunks: splitTextIntoGeminiChunks(updatedDraft)}]);
    await submitPrompt(
      page,
      'Change the selected Text component copy to the deterministic fixture text.',
    );

    await expect(
      page.frameLocator('.workspace-container iframe').getByText(MODEL_TEXT),
    ).toBeVisible();
    await expect(chatHistory(page)).toContainText('1 component in this canvas');
    await expect.poll(() => readRawDraft(page)).toContain(MODEL_TEXT);
    await expectGeminiRequestForCurrentDraft(page, DRAFT_TEXT);
    await expectAccessibleChatPanel(page);

    await page.getByRole('button', {name: 'Switch to dark theme'}).click();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    await expectAccessibleChatPanel(page);
  });

  test('keeps the last valid draft after an invalid reply and recovers on the next prompt', async ({
    page,
  }) => {
    await openDraftInWorkspace(page);
    const originalDraft = await readRawDraft(page);
    const recoveredDraft = replaceDraftText(originalDraft, DRAFT_TEXT, RECOVERY_TEXT);

    await setGeminiScenarios(page, [
      {chunks: [geminiTextChunk('{"version":"v0.9","updateComponents": BROKEN}')]},
    ]);
    await submitPrompt(page, 'Return an invalid response for the deterministic fixture.');

    await expect(parseErrorCard(page)).toBeVisible();
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(DRAFT_TEXT),
    ).toBeVisible();
    await expect.poll(() => readRawDraft(page)).toBe(originalDraft);
    await expectGeminiRequestForCurrentDraft(page, DRAFT_TEXT);

    await setGeminiScenarios(page, [{chunks: splitTextIntoGeminiChunks(recoveredDraft)}]);
    await submitPrompt(page, 'Recover with valid A2UI JSON for the same selected draft.');

    await expect(
      page.frameLocator('.workspace-container iframe').getByText(RECOVERY_TEXT),
    ).toBeVisible();
    await expect.poll(() => readRawDraft(page)).toContain(RECOVERY_TEXT);
    await expectGeminiRequestForCurrentDraft(page, DRAFT_TEXT);
  });

  test('rejects unknown surfaces and applies a valid incremental edit without losing the draft', async ({
    page,
  }) => {
    await openDraftInWorkspace(page);
    const originalDraft = await readRawDraft(page);
    const messages: RenderA2uiItem[] = JSON.parse(originalDraft);
    const components = messages.find(message => message.updateComponents)?.updateComponents;
    const target = components?.components.find(
      (component): component is Record<string, unknown> =>
        component !== null &&
        typeof component === 'object' &&
        !Array.isArray(component) &&
        'text' in component &&
        component.text === DRAFT_TEXT,
    );
    if (!components || !target) {
      throw new Error('Expected the selected Text component in the draft.');
    }
    await setGeminiScenarios(page, [
      {
        chunks: [
          geminiTextChunk(
            JSON.stringify({
              version: 'v0.9',
              updateDataModel: {
                surfaceId: 'vacation_booking',
                path: '/destination_value',
                value: 'SF',
              },
            }),
          ),
        ],
      },
    ]);
    await submitPrompt(page, 'Edit the selected canvas');
    await expect(chatHistory(page)).toContainText('Validation Failure');
    await expect.poll(() => readRawDraft(page)).toBe(originalDraft);
    await expectGeminiRequestForCurrentDraft(page, DRAFT_TEXT);

    await setGeminiScenarios(page, [
      {
        chunks: [
          geminiTextChunk(
            JSON.stringify({
              version: 'v0.9',
              updateComponents: {
                surfaceId: components.surfaceId,
                components: [{...target, text: MODEL_TEXT}],
              },
            }),
          ),
        ],
      },
    ]);
    await submitPrompt(page, 'Update the selected text');
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(MODEL_TEXT, {exact: true}),
    ).toBeVisible();
    await expect.poll(() => readRawDraft(page)).toContain('createSurface');
    await expectGeminiRequestForCurrentDraft(page, DRAFT_TEXT);
  });

  test('stops an active stream without committing partial model output', async ({page}) => {
    await openDraftInWorkspace(page);
    const originalDraft = await readRawDraft(page);

    await setGeminiScenarios(page, [
      {
        chunks: [geminiTextChunk('[{"version":"v0.9"')],
        hangAfterChunks: true,
      },
    ]);
    await submitPrompt(page, 'Start a long-running deterministic fixture response.');

    await expect(page.getByRole('button', {name: 'Stop generating'})).toBeVisible();
    await page.getByRole('button', {name: 'Stop generating'}).click();

    await expect(chatHistory(page)).toContainText('You stopped this response');
    await expect(
      page.frameLocator('.workspace-container iframe').getByText(DRAFT_TEXT),
    ).toBeVisible();
    await expect.poll(() => readRawDraft(page)).toBe(originalDraft);
    await expectGeminiRequestForCurrentDraft(page, DRAFT_TEXT);
  });
});
