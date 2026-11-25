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
import type {Page, Route} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {CAR_BOOKING} from '../src/app/chat/chat-service/initial-draft';
import type {ErrorLogItem, ErrorLogLevel} from '../src/app/debug/error-logger.service';
import {previewFrame} from '../src/app/preview/testing/preview-frame-locators';
import {RENDERER_URLS} from '../src/app/preview/testing/renderer-urls';
import {
  FAKE_GEMINI_API_KEY,
  getCapturedGeminiRequests,
  installGeminiFixture,
  setGeminiScenarios,
  splitTextIntoGeminiChunks,
} from './helpers/gemini-fixture';
import {
  getMonacoContent,
  resetStorageOnce,
  setMonacoContent,
  stubRendererHtml,
  waitForMonacoEditor,
  waitForPreviewTab,
} from './helpers';
import {
  collectUnexpectedErrors,
  getJsonValidationProblems,
  openComposerWithSlackRenderer,
  waitForPreviewToSettle,
} from './slack-renderer.helpers';

const COMPOSER_V09_CATALOG_ID = 'https://a2ui.org/specification/v0_9/basic_catalog.json';
const NPM_V09_CATALOG_ID = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';
const MATERIAL_V09_CATALOG_ID = 'https://a2ui.org/specification/v0_9/material_catalog.json';
const V10_BASIC_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

const SAMPLE_RENDERERS = [
  {name: 'Angular', url: RENDERER_URLS.angular, isAngular: true},
  {name: 'Lit', url: RENDERER_URLS.lit, isAngular: false},
  {name: 'React', url: RENDERER_URLS.react, isAngular: false},
] as const;

interface MonacoMarker {
  owner?: string;
  severity: number;
  message: string;
}

interface WindowWithMonacoMarkers extends Window {
  monaco?: {
    editor: {
      getModels(): Array<{uri?: unknown}>;
      getModelMarkers(filter?: {resource?: unknown}): MonacoMarker[];
    };
  };
}

function makeV09InteractivePayload(catalogId: string, label: string): string {
  return JSON.stringify(
    [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'dual-v09-surface',
          catalogId,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'dual-v09-surface',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['heading', 'action_btn'],
            },
            {
              id: 'heading',
              component: 'Text',
              text: label,
            },
            {
              id: 'action_btn',
              component: 'Button',
              child: 'action_btn_label',
              action: {
                event: {
                  name: 'dualV09Click',
                  context: {source: label},
                },
              },
            },
            {
              id: 'action_btn_label',
              component: 'Text',
              text: 'Trigger Action',
            },
          ],
        },
      },
    ],
    null,
    2,
  );
}

const MATERIAL_V09_PAYLOAD = JSON.stringify(
  [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'brew-guide',
        catalogId: MATERIAL_V09_CATALOG_ID,
      },
    },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'brew-guide',
        components: [
          {
            id: 'root',
            component: 'Text',
            text: 'Pour Over Guide',
          },
        ],
      },
    },
  ],
  null,
  2,
);

const MIXED_VERSION_PAYLOAD = JSON.stringify(
  [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'mixed-surface',
        catalogId: COMPOSER_V09_CATALOG_ID,
      },
    },
    {
      version: '1.0',
      updateComponents: {
        surfaceId: 'mixed-surface',
        components: [{id: 'root', component: 'Text', text: 'Mixed'}],
      },
    },
  ],
  null,
  2,
);

async function getMonacoErrorMarkers(page: Page): Promise<MonacoMarker[]> {
  return page.evaluate(() => {
    const editorApi = (window as WindowWithMonacoMarkers).monaco?.editor;
    if (!editorApi) {
      return [];
    }
    const model = editorApi.getModels()[0];
    if (!model) {
      return [];
    }
    return editorApi
      .getModelMarkers({resource: model.uri})
      .filter(marker => marker.severity === 8)
      .map(marker => ({owner: marker.owner, severity: marker.severity, message: marker.message}));
  });
}

const ERROR_OR_WARN_LEVELS: ReadonlySet<ErrorLogLevel> = new Set(['error', 'warn']);

async function getErrorLoggerHistory(
  page: Page,
): Promise<Array<Pick<ErrorLogItem, 'code' | 'message' | 'level'>>> {
  return page.evaluate(() => {
    const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
    const shell = document.querySelector('a2ui-composer-shell');
    const comp =
      ng && shell
        ? (ng.getComponent(shell) as {
            errorLogger?: {
              getHistory(): Array<Pick<ErrorLogItem, 'code' | 'message' | 'level'>>;
            };
          })
        : null;
    return comp?.errorLogger?.getHistory() ?? [];
  });
}

async function waitForHandshakeReady(page: Page): Promise<void> {
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
          const shell = document.querySelector('a2ui-composer-shell');
          const comp =
            ng && shell
              ? (ng.getComponent(shell) as {
                  catalogManagement?: {hasReceivedCatalogResponse?: () => boolean};
                })
              : null;
          return comp?.catalogManagement?.hasReceivedCatalogResponse?.() ?? false;
        }),
      {timeout: 20_000},
    )
    .toBe(true);
}

function getRequestSystemPrompt(request: {body: unknown}): string {
  const body = request.body as {
    systemInstruction?: {parts?: Array<{text?: string}>};
  };
  return body.systemInstruction?.parts?.map(part => part.text ?? '').join('\n') ?? '';
}

async function switchRenderer(page: Page, targetName: string): Promise<void> {
  await page.getByRole('link', {name: 'Settings', exact: true}).click();
  await page.locator('a2ui-composer-renderer-selector mat-select').click();
  await page.locator('mat-option', {hasText: targetName}).first().click();
  await page.getByRole('link', {name: 'Composer Workspace'}).click();
  await waitForMonacoEditor(page);
  await waitForHandshakeReady(page);
}

test.describe('Dual-version v0.9 and v1.0 basic renderers', () => {
  test.beforeEach(async ({page}) => {
    await resetStorageOnce(page);
  });

  test('defaults to v1.0 on Angular, Lit, and React with zero Monaco markers', async ({page}) => {
    for (const renderer of SAMPLE_RENDERERS) {
      await test.step(`Default v1.0 boot: ${renderer.name}`, async () => {
        await page.goto(`/?renderer=${encodeURIComponent(renderer.url)}`);
        await waitForMonacoEditor(page);
        await waitForHandshakeReady(page);

        const draft = await getMonacoContent(page);
        expect(draft).toContain('"version": "1.0"');

        const iframe = previewFrame(page);
        await expect(iframe.getByText('Book a Car')).toBeVisible({timeout: 20_000});

        await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);
        expect(await getJsonValidationProblems(page)).toEqual([]);
      });
    }
  });

  test('renders v0.9 payloads with Composer catalog ID, zero Monaco markers, and v0.9 action round-trip across Angular, Lit, and React', async ({
    page,
  }) => {
    for (const renderer of SAMPLE_RENDERERS) {
      await test.step(`Composer v0.9 payload: ${renderer.name}`, async () => {
        const unexpectedErrors = collectUnexpectedErrors(page);
        await page.goto(`/?renderer=${encodeURIComponent(renderer.url)}`);
        await waitForMonacoEditor(page);
        await waitForHandshakeReady(page);

        const label = `Composer v0.9 ${renderer.name}`;
        await setMonacoContent(page, makeV09InteractivePayload(COMPOSER_V09_CATALOG_ID, label));

        const iframe = previewFrame(page);
        await expect(iframe.getByText(label)).toBeVisible({timeout: 20_000});

        if (renderer.isAngular) {
          await expect(iframe.locator('a2ui-v09-text').first()).toContainText(label);
          await expect(iframe.locator('a2ui-v09-button').first()).toBeVisible();
          await expect(iframe.locator('a2ui-basic-text')).toHaveCount(0);
        }

        await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);
        expect(await getJsonValidationProblems(page)).toEqual([]);

        await waitForPreviewTab(page);
        await iframe.getByRole('button', {name: 'Trigger Action'}).click();

        const eventsTab = page.locator('.dv-tab', {hasText: /^Events/});
        await expect(eventsTab).toContainText('(1)');

        await page.locator('.dv-tab', {hasText: /^Raw Messages/}).click();
        const envelope = page
          .locator(
            '.raw-messages-container [data-testid="raw-message-envelope"], .raw-messages-container [data-testid="llm-log-panel"]',
          )
          .filter({hasText: PreviewBridgeMessageType.SEND_TO_SERVER})
          .first();
        await expect(envelope.locator('pre')).toContainText('"name": "dualV09Click"');
        await expect(envelope.locator('pre')).toContainText('"version": "v0.9"');
        expect(unexpectedErrors).toEqual([]);
      });
    }
  });

  test('renders v0.9 payloads with published NPM catalog ID and zero Monaco markers across Angular, Lit, and React', async ({
    page,
  }) => {
    for (const renderer of SAMPLE_RENDERERS) {
      await test.step(`NPM v0.9 payload: ${renderer.name}`, async () => {
        await page.goto(`/?renderer=${encodeURIComponent(renderer.url)}`);
        await waitForMonacoEditor(page);
        await waitForHandshakeReady(page);

        const label = `NPM v0.9 ${renderer.name}`;
        await setMonacoContent(page, makeV09InteractivePayload(NPM_V09_CATALOG_ID, label));

        const iframe = previewFrame(page);
        await expect(iframe.getByText(label)).toBeVisible({timeout: 20_000});
        if (renderer.isAngular) {
          await expect(iframe.locator('a2ui-v09-text').first()).toContainText(label);
          await expect(iframe.locator('a2ui-basic-text')).toHaveCount(0);
        }
        await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);
        expect(await getJsonValidationProblems(page)).toEqual([]);
      });
    }
  });

  test('renders real CAR_BOOKING v0.9 starter payload with interactive widgets and zero Monaco markers across Angular, Lit, and React', async ({
    page,
  }) => {
    for (const renderer of SAMPLE_RENDERERS) {
      await test.step(`CAR_BOOKING v0.9: ${renderer.name}`, async () => {
        const unexpectedErrors = collectUnexpectedErrors(page);
        await page.goto(`/?renderer=${encodeURIComponent(renderer.url)}`);
        await waitForMonacoEditor(page);
        await waitForHandshakeReady(page);

        await setMonacoContent(page, CAR_BOOKING);

        const iframe = previewFrame(page);
        await expect(iframe.getByText('Book a Car')).toBeVisible({timeout: 20_000});
        await expect(iframe.getByText('Pick-up Location')).toBeVisible();
        await expect(iframe.getByText('Pick-up Date')).toBeVisible();
        await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible();
        if (renderer.isAngular) {
          await expect(iframe.locator('a2ui-v09-text').first()).toContainText('Book a Car');
          await expect(iframe.locator('a2ui-basic-text')).toHaveCount(0);
        }
        await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);
        expect(await getJsonValidationProblems(page)).toEqual([]);
        expect(unexpectedErrors).toEqual([]);
      });
    }
  });

  test('switches the same draft cleanly v0.9 -> v1.0 -> v0.9 on Angular Basic with zero stale markers or errors', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    const makeV10Payload = (label: string) =>
      JSON.stringify(
        [
          {
            version: '1.0',
            createSurface: {
              surfaceId: 'toggle-surface',
              catalogId: V10_BASIC_CATALOG_ID,
              components: [{id: 'root', component: 'Text', text: label}],
            },
          },
        ],
        null,
        2,
      );

    const iframe = previewFrame(page);

    // Step 1: v0.9
    await setMonacoContent(
      page,
      makeV09InteractivePayload(COMPOSER_V09_CATALOG_ID, 'Toggle Step v0.9'),
    );
    await expect(iframe.locator('a2ui-v09-text').first()).toContainText('Toggle Step v0.9', {
      timeout: 20_000,
    });
    await expect(iframe.locator('a2ui-basic-text')).toHaveCount(0);
    await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);

    // Step 2: v1.0
    await setMonacoContent(page, makeV10Payload('Toggle Step v1.0'));
    await expect(iframe.locator('a2ui-basic-text').first()).toContainText('Toggle Step v1.0', {
      timeout: 20_000,
    });
    await expect(iframe.locator('a2ui-v09-text')).toHaveCount(0);
    await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);

    // Step 3: back to v0.9
    await setMonacoContent(
      page,
      makeV09InteractivePayload(NPM_V09_CATALOG_ID, 'Toggle Step v0.9 Restored'),
    );
    await expect(iframe.locator('a2ui-v09-text').first()).toContainText(
      'Toggle Step v0.9 Restored',
      {timeout: 20_000},
    );
    await expect(iframe.locator('a2ui-basic-text')).toHaveCount(0);
    await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);
    expect(await getJsonValidationProblems(page)).toEqual([]);
    const errorOrWarningHistory = (await getErrorLoggerHistory(page)).filter(item =>
      ERROR_OR_WARN_LEVELS.has(item.level),
    );
    expect(errorOrWarningHistory).toEqual([]);
  });

  test('blocks Material catalog v0.9 payload on Angular Basic with UNSUPPORTED_CATALOG instead of PROTOCOL_VERSION_MISMATCH', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    await setMonacoContent(page, MATERIAL_V09_PAYLOAD);

    await expect
      .poll(async () => {
        const markers = await getMonacoErrorMarkers(page);
        return markers.find(m => m.owner === 'a2ui-protocol')?.message ?? '';
      })
      .toContain(`This renderer does not provide the catalog "${MATERIAL_V09_CATALOG_ID}"`);

    await expect
      .poll(async () => {
        const history = await getErrorLoggerHistory(page);
        return history.some(item => item.code === 'UNSUPPORTED_CATALOG');
      })
      .toBe(true);

    await waitForPreviewToSettle(page);

    const markers = await getMonacoErrorMarkers(page);
    expect(markers.filter(m => m.owner === 'a2ui-protocol')).toHaveLength(1);
    expect(markers.some(m => m.message.includes('Value must be "1.0"'))).toBe(false);

    const history = await getErrorLoggerHistory(page);
    expect(history.filter(item => item.code === 'UNSUPPORTED_CATALOG')).toHaveLength(1);
    expect(history.some(item => item.code === 'PROTOCOL_VERSION_MISMATCH')).toBe(false);
  });

  test('allows single-catalog v0.9 renderer to receive Material catalog v0.9 payload without UNSUPPORTED_CATALOG', async ({
    page,
  }) => {
    const singleCatalogUrl = 'http://mock-single-v09.local/index.html';
    const html = stubRendererHtml('<div id="root">Single Catalog V09</div>', {
      version: 'v0.9',
      catalogId: COMPOSER_V09_CATALOG_ID,
      title: 'Single V09',
      components: {Text: {}},
      wrapCatalog: false,
      recordMessages: true,
    });
    const handleConfig = (route: Route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          renderers: {
            default: {
              rendererUrl: singleCatalogUrl,
              displayName: 'Single V09',
            },
          },
        }),
      });
    await page.route('**/config.json', handleConfig);
    await page.route(
      url => url.href === singleCatalogUrl || url.href.startsWith(singleCatalogUrl),
      (route: Route) => route.fulfill({contentType: 'text/html', body: html}),
    );

    await page.goto('/');
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    await setMonacoContent(page, MATERIAL_V09_PAYLOAD);

    const iframe = previewFrame(page);
    await expect
      .poll(async () =>
        iframe.locator('body').evaluate(() => {
          const msgs =
            (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
          return msgs.some(batch => JSON.stringify(batch).includes('Pour Over Guide'));
        }),
      )
      .toBe(true);

    const history = await getErrorLoggerHistory(page);
    expect(history.some(item => item.code === 'UNSUPPORTED_CATALOG')).toBe(false);
  });

  test('blocks foreign protocol versions on single-version renderers with PROTOCOL_VERSION_MISMATCH', async ({
    page,
  }) => {
    // Slack is v0.9-only, so it rejects a v1.0 payload.
    await openComposerWithSlackRenderer(page);
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    const v10Payload = JSON.stringify(
      [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'blocked-v10',
            catalogId: V10_BASIC_CATALOG_ID,
            components: [{id: 'root', component: 'Text', text: 'Blocked v1.0'}],
          },
        },
      ],
      null,
      2,
    );
    await setMonacoContent(page, v10Payload);

    await expect
      .poll(async () => {
        const markers = await getMonacoErrorMarkers(page);
        return markers.find(m => m.owner === 'a2ui-protocol')?.message ?? '';
      })
      .toContain('This renderer does not support A2UI v1.0');

    await expect
      .poll(async () => {
        const history = await getErrorLoggerHistory(page);
        return history.some(item => item.code === 'PROTOCOL_VERSION_MISMATCH');
      })
      .toBe(true);
  });

  test('blocks payloads mixing v0.9 and v1.0 messages with PROTOCOL_VERSION_MISMATCH', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    await setMonacoContent(page, MIXED_VERSION_PAYLOAD);

    await expect
      .poll(async () => {
        const markers = await getMonacoErrorMarkers(page);
        return markers.find(m => m.owner === 'a2ui-protocol')?.message ?? '';
      })
      .toContain('This payload mixes A2UI v0.9 and v1.0 messages');

    await expect
      .poll(async () => {
        const history = await getErrorLoggerHistory(page);
        return history.some(item => item.code === 'PROTOCOL_VERSION_MISMATCH');
      })
      .toBe(true);
  });

  test('chat on dual-version Angular Basic defaults to v1.0, honors v0.9 ask, keeps v0.9 on follow-up, and replaces on explicit v1.0 switch', async ({
    page,
  }) => {
    await installGeminiFixture(page);
    await page.addInitScript(() => {
      if (window.top !== window) {
        return;
      }
      localStorage.setItem('a2ui_composer_force_3p', 'true');
      localStorage.removeItem('a2ui_composer_force_1p');
    });
    await page.route('**/config.json', (route: Route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          renderers: {
            default: {
              rendererUrl: RENDERER_URLS.angular,
              displayName: 'Angular Basic',
            },
          },
          apiKeys: {
            default: {
              apiKey: FAKE_GEMINI_API_KEY,
              displayName: 'Test Key',
            },
          },
        }),
      }),
    );

    await page.goto('/');
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    // Ensure New Session clears starter draft to a placeholder so generation starts from scratch.
    await page.getByRole('button', {name: 'New Session'}).click();

    const v10Response = JSON.stringify({
      version: '1.0',
      createSurface: {
        surfaceId: 'chat-main',
        catalogId: V10_BASIC_CATALOG_ID,
        components: [{id: 'root', component: 'Text', text: 'Default v1.0 Card'}],
      },
    });
    const v09Response = [
      JSON.stringify({
        version: 'v0.9',
        createSurface: {
          surfaceId: 'chat-main',
          catalogId: COMPOSER_V09_CATALOG_ID,
        },
      }),
      JSON.stringify({
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'chat-main',
          components: [{id: 'root', component: 'Text', text: 'Explicit v0.9 Card'}],
        },
      }),
    ].join('\n');
    const v09FollowUp = JSON.stringify({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'chat-main',
        components: [{id: 'root', component: 'Text', text: 'Status: Ready'}],
      },
    });
    const v10Replacement = JSON.stringify({
      version: '1.0',
      createSurface: {
        surfaceId: 'chat-main',
        catalogId: V10_BASIC_CATALOG_ID,
        components: [{id: 'root', component: 'Text', text: 'Switched back to v1.0'}],
      },
    });
    const v10FollowUp = JSON.stringify({
      version: '1.0',
      updateComponents: {
        surfaceId: 'chat-main',
        components: [{id: 'root', component: 'Text', text: 'Confirmed v1.0'}],
      },
    });

    await setGeminiScenarios(page, [
      {chunks: splitTextIntoGeminiChunks(v10Response)},
      {chunks: splitTextIntoGeminiChunks(v09Response)},
      {chunks: splitTextIntoGeminiChunks(v09FollowUp)},
      {chunks: splitTextIntoGeminiChunks(v10Replacement)},
      {chunks: splitTextIntoGeminiChunks(v10FollowUp)},
    ]);

    const promptInput = page.getByLabel('Chat prompt');
    const sendBtn = page.getByRole('button', {name: 'Send prompt'});

    // Turn 1: from scratch without version -> defaults to v1.0
    await promptInput.fill('Build a status card');
    await sendBtn.click();
    await expect(previewFrame(page).locator('a2ui-basic-text').first()).toContainText(
      'Default v1.0 Card',
      {timeout: 20_000},
    );
    let requests = await getCapturedGeminiRequests(page);
    expect(requests).toHaveLength(1);
    expect(getRequestSystemPrompt(requests[0])).toContain('"version": "1.0"');

    // Start fresh placeholder, then explicitly ask for v0.9
    await page.getByRole('button', {name: 'New Session'}).click();
    await promptInput.fill('Build a v0.9 status card');
    await sendBtn.click();
    await expect(previewFrame(page).locator('a2ui-v09-text').first()).toContainText(
      'Explicit v0.9 Card',
      {timeout: 20_000},
    );
    requests = await getCapturedGeminiRequests(page);
    expect(requests).toHaveLength(2);
    expect(getRequestSystemPrompt(requests[1])).toContain(COMPOSER_V09_CATALOG_ID);

    // Follow-up edit on the v0.9 draft without naming a version -> keeps v0.9
    await promptInput.fill('Change the status to Ready');
    await sendBtn.click();
    await expect(previewFrame(page).locator('a2ui-v09-text').first()).toContainText(
      'Status: Ready',
      {timeout: 20_000},
    );
    requests = await getCapturedGeminiRequests(page);
    expect(requests).toHaveLength(3);
    expect(getRequestSystemPrompt(requests[2])).toContain(COMPOSER_V09_CATALOG_ID);

    // Explicit v1.0 switch on the v0.9 draft -> switches to v1.0 and replaces draft
    await promptInput.fill('Rebuild this in v1.0');
    await sendBtn.click();
    await expect(previewFrame(page).locator('a2ui-basic-text').first()).toContainText(
      'Switched back to v1.0',
      {timeout: 20_000},
    );
    await expect(previewFrame(page).locator('a2ui-v09-text')).toHaveCount(0);
    requests = await getCapturedGeminiRequests(page);
    expect(requests).toHaveLength(4);
    expect(getRequestSystemPrompt(requests[3])).toContain(V10_BASIC_CATALOG_ID);

    // Follow-up edit on the v1.0 UI without naming a version -> keeps v1.0
    await promptInput.fill('Change the text to Confirmed v1.0');
    await sendBtn.click();
    await expect(previewFrame(page).locator('a2ui-basic-text').first()).toContainText(
      'Confirmed v1.0',
      {timeout: 20_000},
    );
    await expect(previewFrame(page).locator('a2ui-v09-text')).toHaveCount(0);
    requests = await getCapturedGeminiRequests(page);
    expect(requests).toHaveLength(5);
    expect(getRequestSystemPrompt(requests[4])).toContain(V10_BASIC_CATALOG_ID);
    expect(getRequestSystemPrompt(requests[4])).toContain('"version": "1.0"');
  });

  test('recovers cleanly from PROTOCOL_VERSION_MISMATCH after switching back from a single-version renderer to Angular Basic', async ({
    page,
  }) => {
    const v10StubUrl = 'http://mock-v10-only.local/index.html';
    const html = stubRendererHtml('<div id="root">V10 Only</div>', {
      version: 'v1.0',
      catalogId: V10_BASIC_CATALOG_ID,
      title: 'Mock V10',
      components: {Text: {}},
      wrapCatalog: true,
      recordMessages: true,
    });
    const handleConfig = (route: Route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          renderers: {
            angular: {
              rendererUrl: RENDERER_URLS.angular,
              displayName: 'Angular Basic',
            },
            mockV10: {
              rendererUrl: v10StubUrl,
              displayName: 'Mock V10',
            },
          },
        }),
      });
    await page.route('**/config.json', handleConfig);
    await page.route(
      url => url.href === v10StubUrl || url.href.startsWith(v10StubUrl),
      (route: Route) => route.fulfill({contentType: 'text/html', body: html}),
    );

    await page.goto(`/?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    await setMonacoContent(
      page,
      makeV09InteractivePayload(COMPOSER_V09_CATALOG_ID, 'Recover v0.9'),
    );
    await expect(previewFrame(page).locator('a2ui-v09-text').first()).toContainText(
      'Recover v0.9',
      {
        timeout: 20_000,
      },
    );

    // Switch to single-version v1.0 renderer -> user-edited v0.9 draft triggers PROTOCOL_VERSION_MISMATCH
    await switchRenderer(page, 'Mock V10');
    await expect
      .poll(async () => {
        const markers = await getMonacoErrorMarkers(page);
        return markers.find(m => m.owner === 'a2ui-protocol')?.message ?? '';
      })
      .toContain('This renderer does not support A2UI v0.9');

    await expect
      .poll(async () => {
        const history = await getErrorLoggerHistory(page);
        return history.filter(item => item.code === 'PROTOCOL_VERSION_MISMATCH').length;
      })
      .toBe(1);
    const mismatchCountBeforeRecovery = (await getErrorLoggerHistory(page)).filter(
      item => item.code === 'PROTOCOL_VERSION_MISMATCH',
    ).length;

    // Switch back to dual-version Angular Basic -> clean render and no stale Monaco markers or new errors
    await switchRenderer(page, 'Angular Basic');
    await expect(previewFrame(page).locator('a2ui-v09-text').first()).toContainText(
      'Recover v0.9',
      {
        timeout: 20_000,
      },
    );
    await expect.poll(() => getMonacoErrorMarkers(page)).toEqual([]);
    expect(await getJsonValidationProblems(page)).toEqual([]);
    const mismatchCountAfterRecovery = (await getErrorLoggerHistory(page)).filter(
      item => item.code === 'PROTOCOL_VERSION_MISMATCH',
    ).length;
    expect(mismatchCountAfterRecovery).toBe(mismatchCountBeforeRecovery);
  });

  test('chat on v1.0-only renderer refuses explicit v0.9 request without calling Gemini', async ({
    page,
  }) => {
    const v10StubUrl = 'http://mock-v10-only.local/index.html';
    const html = stubRendererHtml('<div id="root">V10 Only</div>', {
      version: 'v1.0',
      catalogId: V10_BASIC_CATALOG_ID,
      title: 'Mock V10',
      components: {Text: {}},
      wrapCatalog: true,
      recordMessages: true,
    });
    const handleConfig = (route: Route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          renderers: {
            default: {
              rendererUrl: v10StubUrl,
              displayName: 'Mock V10',
            },
          },
          apiKeys: {
            default: {
              apiKey: FAKE_GEMINI_API_KEY,
              displayName: 'Test Key',
            },
          },
        }),
      });
    await page.route('**/config.json', handleConfig);
    await page.route(
      url => url.href === v10StubUrl || url.href.startsWith(v10StubUrl),
      (route: Route) => route.fulfill({contentType: 'text/html', body: html}),
    );
    await page.addInitScript(() => {
      if (window.top !== window) {
        return;
      }
      localStorage.setItem('a2ui_composer_force_3p', 'true');
      localStorage.removeItem('a2ui_composer_force_1p');
    });
    await installGeminiFixture(page);
    await page.goto('/');
    await waitForMonacoEditor(page);
    await waitForHandshakeReady(page);

    await page.getByLabel('Chat prompt').fill('Build a v0.9 login form');
    await page.getByRole('button', {name: 'Send prompt'}).click();

    await expect(page.getByRole('log', {name: 'Conversation'})).toContainText(
      "The selected renderer supports A2UI v1.0 only, so I can't generate v0.9 for it. Ask again without a version, or select a renderer that supports v0.9.",
    );
    expect(await getCapturedGeminiRequests(page)).toEqual([]);
  });
});
