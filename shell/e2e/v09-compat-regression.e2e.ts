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

import {test, expect, type Page, type BrowserContext, type Route} from '@playwright/test';
import {CAR_BOOKING_V1_0} from '../src/app/chat/chat-service/initial-draft';
import {CATALOG_WATCHDOG_MESSAGE} from '../src/app/storage/catalog-management/catalog-watchdog';
import {inlineSurfaceFrame, previewFrame} from '../src/app/preview/testing/preview-frame-locators';
import {RENDERER_URLS} from '../src/app/preview/testing/renderer-urls';
import {connectMockAgent, sseEvent} from '../src/app/agent-chat/test/mock-a2a-agent';
import {getMonacoContent, setMonacoContent, waitForMonacoEditor} from './helpers';

const V09_RENDERER_URL = 'http://mock-v09-renderer.local/index.html';
const V10_RENDERER_URL = 'http://mock-v10-renderer.local/index.html';

function createStubRendererHtml(options: {
  protocolVersion?: '0.9' | '1.0';
  catalogId?: string;
  bodyContent?: string;
}): string {
  const isV10 = options.protocolVersion === '1.0';
  const catalogId =
    options.catalogId ??
    (isV10
      ? 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json'
      : 'https://a2ui.org/specification/v0_9/basic_catalog.json');
  const catalogObj = {
    catalogId,
    title: isV10 ? 'Stub v1.0 Catalog' : 'Stub v0.9 Catalog',
    description: isV10 ? 'Stub v1.0 Catalog Description' : 'Stub v0.9 Catalog Description',
    ...(isV10 ? {protocolVersion: '1.0'} : {version: 'v0.9'}),
    components: {
      Column: {},
      Text: {},
      TextField: {},
      DateTimeInput: {},
      Button: {},
    },
  };

  return `<!DOCTYPE html>
<html>
<head>
<script>
  window.__receivedRenderA2ui = [];
  window.__receivedMessages = [];
  let answered = false;
  let interval = null;

  function respondCatalog() {
    if (answered) return;
    answered = true;
    if (interval) clearInterval(interval);
    window.parent.postMessage({
      type: 'A2UI_CATALOG',
      payload: {
        catalog: ${JSON.stringify(catalogObj)},
        catalogs: [${JSON.stringify(catalogObj)}]
      }
    }, '*');
  }

  interval = setInterval(() => {
    if (answered) {
      clearInterval(interval);
      return;
    }
    window.parent.postMessage({ type: 'RENDERER_READY' }, '*');
  }, 100);

  window.addEventListener('message', (event) => {
    const data = event.data;
    window.__receivedMessages.push(data);
    if (data?.type === 'GET_CATALOG') {
      respondCatalog();
    } else if (data?.type === 'RENDER_A2UI') {
      window.__receivedRenderA2ui.push(data.payload);
    }
  });

  window.parent.postMessage({ type: 'RENDERER_READY' }, '*');
</script>
</head>
<body>${options.bodyContent ?? '<div id="root">Stub Renderer</div>'}</body>
</html>`;
}

async function setupMockRenderers(context: BrowserContext | Page): Promise<void> {
  const configPayload = {
    renderers: {
      default: {
        rendererUrl: V09_RENDERER_URL,
        displayName: 'Mock V09',
      },
      v09: {
        rendererUrl: V09_RENDERER_URL,
        displayName: 'Mock V09',
      },
      v10: {
        rendererUrl: V10_RENDERER_URL,
        displayName: 'Mock V10',
      },
      liveAngular: {
        rendererUrl: RENDERER_URLS.angular,
        displayName: 'Angular Basic',
      },
    },
    apiKeys: {
      fake: {
        apiKey: 'test-api-key',
        displayName: 'Test Key',
      },
    },
  };

  const handleConfig = (route: Route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(configPayload),
    });

  await context.route('**/config.json', handleConfig);
  await context.route('**/renderers.json', handleConfig);

  await context.route('http://mock-v09-renderer.local/**', route =>
    route.fulfill({
      contentType: 'text/html',
      body: createStubRendererHtml({protocolVersion: '0.9'}),
    }),
  );

  await context.route('http://mock-v10-renderer.local/**', route =>
    route.fulfill({
      contentType: 'text/html',
      body: createStubRendererHtml({protocolVersion: '1.0'}),
    }),
  );
}

test.describe('v0.9 Compatibility Regression Suite', () => {
  test.beforeEach(async ({context, page}) => {
    page.on('pageerror', err => {
      console.error(`Unhandled page error: ${err.message}`);
    });

    await setupMockRenderers(context);

    const allowedOrigins = [
      'http://mock-v09-renderer.local',
      'http://mock-v10-renderer.local',
      'http://mock-agent.local',
      new URL(RENDERER_URLS.angular).origin,
    ];
    await page.addInitScript(origins => {
      if (window === window.top && !sessionStorage.getItem('__a2ui_e2e_cleared__')) {
        sessionStorage.setItem('__a2ui_e2e_cleared__', '1');
        localStorage.clear();
        localStorage.setItem('a2ui_composer_force_1p', 'true');
        localStorage.setItem('a2ui_composer_allowed_origins', JSON.stringify(origins));
      }
    }, allowedOrigins);
  });

  test('loads CAR_BOOKING (v0.9) starter draft on /workspace and dispatches 3-message v0.9 RENDER_A2UI', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(V09_RENDERER_URL)}`);
    await waitForMonacoEditor(page);

    const draft = await getMonacoContent(page);
    expect(draft).toContain('"version": "v0.9"');
    expect(draft).toContain('createSurface');
    expect(draft).toContain('updateComponents');
    expect(draft).toContain('updateDataModel');
    expect(draft).toContain('Book a Car');

    const iframe = previewFrame(page);
    await expect(iframe.locator('body')).toBeVisible();

    await expect
      .poll(async () => {
        return iframe.locator('body').evaluate(() => {
          const msgs =
            (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
          return msgs.some(
            batch =>
              Array.isArray(batch) &&
              batch.length === 3 &&
              (batch[0] as Record<string, unknown>)['version'] === 'v0.9' &&
              (batch[1] as Record<string, unknown>)['version'] === 'v0.9' &&
              (batch[2] as Record<string, unknown>)['version'] === 'v0.9' &&
              !!(batch[0] as Record<string, unknown>)['createSurface'] &&
              !!(batch[1] as Record<string, unknown>)['updateComponents'] &&
              !!(batch[2] as Record<string, unknown>)['updateDataModel'],
          );
        });
      })
      .toBe(true);
  });

  test('setting a v1.0 payload in Monaco while connected to the v0.9 stub renderer immediately logs PROTOCOL_VERSION_MISMATCH without arming/waiting for the 15s watchdog', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(V09_RENDERER_URL)}`);
    await waitForMonacoEditor(page);

    await setMonacoContent(page, CAR_BOOKING_V1_0);

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
          const shell = document.querySelector('a2ui-composer-shell');
          const comp =
            ng && shell
              ? (ng.getComponent(shell) as {
                  errorLogger?: {
                    getHistory(): Array<{code?: string; message?: string; level?: string}>;
                  };
                })
              : null;
          const history = comp?.errorLogger?.getHistory() ?? [];
          return history.some(
            item =>
              item.code === 'PROTOCOL_VERSION_MISMATCH' ||
              item.message?.includes('PROTOCOL_VERSION_MISMATCH') ||
              item.message?.includes('Protocol version mismatch'),
          );
        });
      })
      .toBe(true);

    const history = await page.evaluate(() => {
      const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
      const shell = document.querySelector('a2ui-composer-shell');
      const comp =
        ng && shell
          ? (ng.getComponent(shell) as {
              errorLogger?: {
                getHistory(): Array<{code?: string; message?: string; level?: string}>;
              };
            })
          : null;
      return comp?.errorLogger?.getHistory() ?? [];
    });
    const watchdogErrors = history.filter(item => item.message?.includes(CATALOG_WATCHDOG_MESSAGE));
    expect(watchdogErrors).toEqual([]);
  });

  async function switchRenderer(page: Page, targetName: string) {
    await page.getByRole('link', {name: 'Settings', exact: true}).click();
    await page.locator('a2ui-composer-renderer-selector mat-select').click();
    await page.locator('mat-option', {hasText: targetName}).first().click();
    await page.getByRole('link', {name: 'Composer Workspace'}).click();
    await waitForMonacoEditor(page);
  }

  test('switching /workspace between a v0.9 stub renderer and a v1.0 stub renderer auto-swaps untouched CAR_BOOKING <-> CAR_BOOKING_V1_0, whereas user-edited JSON is preserved across the switch', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(V09_RENDERER_URL)}`);
    await waitForMonacoEditor(page);

    const initialDraft = await getMonacoContent(page);
    expect(initialDraft).toContain('"version": "v0.9"');
    expect(initialDraft).toContain('"path": "/booking/location"');

    // Switch from v0.9 to v1.0
    await switchRenderer(page, 'Mock V10');

    await expect
      .poll(async () => {
        return getMonacoContent(page);
      })
      .toContain('"version": "1.0"');

    const v10Draft = await getMonacoContent(page);
    expect(v10Draft).toContain('"@path"');
    expect(v10Draft).toContain('/booking/location');

    // Switch back to v0.9
    await switchRenderer(page, 'Mock V09');

    await expect
      .poll(async () => {
        return getMonacoContent(page);
      })
      .toContain('"version": "v0.9"');

    // Now modify the draft so isDraftEdited becomes true
    const userCustomDraft = JSON.stringify(
      [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'user-custom-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
          },
          customUserMarker: 'user-edited-preserved-value',
        },
      ],
      null,
      2,
    );
    await setMonacoContent(page, userCustomDraft);

    // Switch to v1.0 again
    await switchRenderer(page, 'Mock V10');

    await expect
      .poll(() => page.locator('.workspace-container iframe').getAttribute('src'))
      .toContain('mock-v10-renderer.local');

    // Verify user-edited JSON was preserved rather than overwritten by CAR_BOOKING_V1_0
    const preservedDraft = await getMonacoContent(page);
    expect(preservedDraft).toContain('user-edited-preserved-value');
  });

  test('/agent-chat with a v0.9 stub renderer + mock v0.9 A2A SSE stream renders v0.9 surfaces and sends v0.9 action round-trips cleanly', async ({
    page,
  }) => {
    let capturedActionRequest: Record<string, unknown> | null = null;

    const v09InlinePayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'flight-options',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'flight-options',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['confirm_btn'],
            },
            {
              id: 'confirm_btn',
              component: 'Button',
              child: 'confirm_btn_text',
              variant: 'primary',
              action: {
                event: {
                  name: 'selectFlight',
                  context: {
                    flightNumber: 'NH007',
                  },
                },
              },
            },
            {
              id: 'confirm_btn_text',
              component: 'Text',
              text: 'Select ANA NH007 & Continue',
            },
          ],
        },
      },
    ];

    await connectMockAgent(page, 'http://mock-agent.local', postData => {
      if (postData.includes('selectFlight')) {
        try {
          capturedActionRequest = JSON.parse(postData) as Record<string, unknown>;
        } catch {
          capturedActionRequest = {raw: postData};
        }
        return sseEvent({
          taskId: 'task-v09-action-ack',
          contextId: 'ctx-trip-202',
          message: {
            role: 'agent',
            parts: [{text: 'Your flight selection is confirmed!'}],
          },
          final: true,
        });
      }
      return sseEvent({
        taskId: 'task-tokyo-101',
        contextId: 'ctx-trip-202',
        message: {
          role: 'agent',
          parts: [
            {
              text: 'I found non-stop flights from SFO to NRT:',
            },
            {
              data: {
                mimeType: 'application/json+a2ui',
                data: JSON.stringify(v09InlinePayload),
              },
            },
          ],
        },
        final: true,
      });
    });

    const prompt = page.locator('.prompt-textarea');
    await prompt.fill('Find non-stop flights from SFO to NRT');
    await prompt.press('Enter');

    const surface = inlineSurfaceFrame(page);
    await expect(surface.locator('body')).toBeVisible();

    // Verify RENDER_A2UI was received by the guest frame
    await expect
      .poll(async () => {
        return surface.locator('body').evaluate(() => {
          const msgs =
            (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
          return msgs.length;
        });
      })
      .toBeGreaterThan(0);

    // Dispatch a v0.9 action from inside the guest frame
    await surface.locator('body').evaluate(
      (_el: HTMLElement, payload: unknown) => {
        window.parent.postMessage(payload, '*');
      },
      {
        type: 'SEND_TO_SERVER',
        payload: {
          version: 'v0.9',
          action: {
            name: 'selectFlight',
            surfaceId: 'flight-options',
            sourceComponentId: 'confirm_btn',
            context: {
              flightNumber: 'NH007',
            },
          },
        },
      },
    );

    // Verify outbound action sent to the mock agent has version 'v0.9'
    await expect.poll(() => capturedActionRequest).not.toBeNull();

    const requestObj = capturedActionRequest as Record<string, unknown> | null;
    const params = requestObj?.['params'] as Record<string, unknown> | undefined;
    const message = params?.['message'] as Record<string, unknown> | undefined;
    const parts = (message?.['parts'] as Array<Record<string, unknown>> | undefined) ?? [];
    const actionPart = parts.find(p => {
      const data = p['data'] as Record<string, unknown> | undefined;
      const meta = p['metadata'] as Record<string, unknown> | undefined;
      return (
        data?.['version'] === 'v0.9' ||
        meta?.['type'] === 'a2ui_action' ||
        meta?.['mimeType'] === 'application/a2ui+json' ||
        meta?.['mimeType'] === 'application/json+a2ui'
      );
    });
    expect(actionPart).toBeDefined();

    const dataObj = (
      typeof actionPart!['data'] === 'string'
        ? JSON.parse(actionPart!['data'])
        : actionPart!['data']
    ) as Record<string, unknown>;
    expect(dataObj['version']).toBe('v0.9');
    expect((dataObj['action'] as Record<string, unknown>)?.['name']).toBe('selectFlight');

    // Verify agent response is rendered in the chat transcript
    await expect(page.locator('.chat-history-container')).toContainText(
      'Your flight selection is confirmed!',
    );
  });

  test('switching between live v1.0 sample renderer and hermetic v0.9 renderer auto-swaps starter draft when unedited, preserves user-edited v0.9 draft, flags PROTOCOL_VERSION_MISMATCH on live v1.0, and recovers cleanly', async ({
    page,
  }) => {
    // 1. Navigate to live v1.0 sample renderer on /workspace
    await page.goto(`/?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    await waitForMonacoEditor(page);

    // Initial draft is CAR_BOOKING_V1_0
    let draft = await getMonacoContent(page);
    expect(draft).toContain('"version": "1.0"');

    // 2. Switch to v0.9 renderer while draft is unedited -> starter draft auto-swaps to CAR_BOOKING (v0.9)
    await switchRenderer(page, 'Mock V09');

    draft = await getMonacoContent(page);
    expect(draft).toContain('"version": "v0.9"');
    expect(draft).toContain('Book a Car');

    // 3. User edits the draft while on v0.9
    const userEditedV09Draft = draft.replace('Book a Car', 'User Customised Car Booking');
    await setMonacoContent(page, userEditedV09Draft);

    const editedDraftCheck = await getMonacoContent(page);
    expect(editedDraftCheck).toContain('User Customised Car Booking');

    // 4. Switch to live v1.0 sample renderer -> user-edited draft is preserved, but PROTOCOL_VERSION_MISMATCH is logged
    await switchRenderer(page, 'Angular Basic');

    // User draft is preserved (not overwritten by v1.0 starter)
    const preservedDraft = await getMonacoContent(page);
    expect(preservedDraft).toContain('User Customised Car Booking');
    expect(preservedDraft).toContain('"version": "v0.9"');

    // Immediate PROTOCOL_VERSION_MISMATCH error is logged without waiting for 15s watchdog
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
          const shell = document.querySelector('a2ui-composer-shell');
          const comp =
            ng && shell
              ? (ng.getComponent(shell) as {
                  errorLogger?: {
                    getHistory(): Array<{code?: string; message?: string; level?: string}>;
                  };
                })
              : null;
          const history = comp?.errorLogger?.getHistory() ?? [];
          return history.some(
            item =>
              item.code === 'PROTOCOL_VERSION_MISMATCH' ||
              item.message?.includes('PROTOCOL_VERSION_MISMATCH') ||
              item.message?.includes('Protocol version mismatch'),
          );
        });
      })
      .toBe(true);

    // 5. Clean recovery: switch back to v0.9 renderer
    await switchRenderer(page, 'Mock V09');

    const recoveredDraft = await getMonacoContent(page);
    expect(recoveredDraft).toContain('User Customised Car Booking');

    // Verify v0.9 renderer receives the customised payload and no new PROTOCOL_VERSION_MISMATCH is logged
    const iframe = previewFrame(page);
    await expect(iframe.locator('body')).toBeVisible();

    await expect
      .poll(async () => {
        return iframe.locator('body').evaluate(() => {
          const msgs =
            (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
          return msgs.some(
            batch =>
              Array.isArray(batch) && JSON.stringify(batch).includes('User Customised Car Booking'),
          );
        });
      })
      .toBe(true);

    const historyAfterRecovery = await page.evaluate(() => {
      const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
      const shell = document.querySelector('a2ui-composer-shell');
      const comp =
        ng && shell
          ? (ng.getComponent(shell) as {
              errorLogger?: {
                getHistory(): Array<{code?: string; message?: string; level?: string}>;
              };
            })
          : null;
      return comp?.errorLogger?.getHistory() ?? [];
    });
    const mismatchCount = historyAfterRecovery.filter(
      item =>
        item.code === 'PROTOCOL_VERSION_MISMATCH' ||
        item.message?.includes('PROTOCOL_VERSION_MISMATCH') ||
        item.message?.includes('Protocol version mismatch'),
    ).length;
    expect(mismatchCount).toBe(1);
  });
});
