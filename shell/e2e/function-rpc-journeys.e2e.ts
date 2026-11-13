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
import {
  demosCoordinator,
  firstPreviewFrame,
  inlineSurfaceFrame,
  previewFrame,
} from '../src/app/preview/testing/preview-frame-locators';
import {RENDERER_URLS} from '../src/app/preview/testing/renderer-urls';
import {connectMockAgent, sseEvent} from '../src/app/agent-chat/test/mock-a2a-agent';
import {setMonacoContent, waitForMonacoEditor, waitForPreviewTab} from './helpers';

const V10_RENDERER_URL = 'http://mock-v10-renderer.local/index.html';

const BASIC_CATALOG_V1_0 = {
  catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
  protocolVersion: '1.0',
  title: 'Basic Catalog',
  description: 'Basic Catalog v1.0',
  components: {
    Column: {},
    Text: {},
    TextField: {},
    DateTimeInput: {},
    Button: {},
  },
};

const MCP_FUNCTIONS_CATALOG = {
  catalogId: 'https://a2ui.org/specification/v1_0/catalogs/mcp/functions.json',
  protocolVersion: '1.0',
  title: 'MCP Functions Catalog',
  description: 'MCP Functions Catalog v1.0',
  functions: {
    getWeather: {
      description: 'Get weather for location',
    },
    confirmBooking: {
      description: 'Confirm booking reservation',
    },
  },
};

function createStubV10RendererHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<script>
  window.__receivedRenderA2ui = [];
  window.__receivedResponses = [];
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
        catalog: ${JSON.stringify(BASIC_CATALOG_V1_0)},
        catalogs: [${JSON.stringify(BASIC_CATALOG_V1_0)}, ${JSON.stringify(MCP_FUNCTIONS_CATALOG)}]
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
    } else if (data?.type === 'GET_DEMOS') {
      window.parent.postMessage({
        type: 'DEMOS',
        payload: [
          {
            id: 'demo-card-1',
            name: 'Demo Auto Reject',
            description: 'Hermetic test demo',
            payload: [
              {
                version: '1.0',
                createSurface: {
                  surfaceId: 'demo-surface-1',
                  catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json'
                }
              }
            ]
          }
        ]
      }, '*');
    } else if (data?.type === 'RENDER_A2UI') {
      window.__receivedRenderA2ui.push(data.payload);
      if (Array.isArray(data.payload)) {
        for (const item of data.payload) {
          if (item?.callRendererFunction?.functionCallId) {
            window.parent.postMessage({
              type: 'SEND_TO_SERVER',
              payload: {
                version: '1.0',
                rendererFunctionResponse: {
                  functionCallId: item.callRendererFunction.functionCallId,
                  surfaceId: item.callRendererFunction.surfaceId,
                  value: { ok: true }
                }
              }
            }, '*');
          }
          if (item?.agentFunctionResponse?.functionCallId) {
            window.__receivedResponses.push(item.agentFunctionResponse.functionCallId);
          }
        }
      }
    }
  });

  window.parent.postMessage({ type: 'RENDERER_READY' }, '*');
</script>
</head>
<body><div id="root">Stub v1.0 Renderer</div></body>
</html>`;
}

async function setupV10Config(context: BrowserContext | Page): Promise<void> {
  const configPayload = {
    renderers: {
      default: {
        rendererUrl: V10_RENDERER_URL,
        displayName: 'Mock V10',
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
        apiKey: 'test-key',
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

  await context.route('http://mock-v10-renderer.local/**', route =>
    route.fulfill({
      contentType: 'text/html',
      body: createStubV10RendererHtml(),
    }),
  );
}

test.describe('A2UI v1.0 Function RPC Journeys Suite', () => {
  test.beforeEach(async ({context, page}) => {
    page.on('pageerror', err => {
      console.error(`Unhandled page error: ${err.message}`);
    });

    await setupV10Config(context);

    await page.addInitScript(() => {
      if (window === window.top && !sessionStorage.getItem('__a2ui_e2e_cleared__')) {
        sessionStorage.setItem('__a2ui_e2e_cleared__', '1');
        localStorage.clear();
        localStorage.setItem('a2ui_composer_force_1p', 'true');
        localStorage.setItem(
          'a2ui_composer_allowed_origins',
          JSON.stringify([
            'http://mock-v10-renderer.local',
            'http://mock-agent.local',
            'http://localhost:3456',
          ]),
        );
      }
    });
  });

  test('a. /workspace Debug Events RPC Journey with live countdown, error validation, and reply dispatching', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${encodeURIComponent(V10_RENDERER_URL)}`);
    await waitForMonacoEditor(page);
    await waitForPreviewTab(page);

    const eventsTab = page.locator('.dv-tab', {hasText: /^Events/});
    await expect(eventsTab).not.toContainText('(1)');

    const iframe = previewFrame(page);
    await expect(iframe.locator('body')).toBeVisible();

    // 1. Stub iframe emits callAgentFunction while Debug drawer is closed
    const callMsg1 = {
      type: 'SEND_TO_SERVER',
      payload: {
        version: '1.0',
        callAgentFunction: {
          functionCallId: 'rpc-call-101',
          surfaceId: 'sample-surface',
          call: 'confirmBooking',
          args: {itemId: 'item-abc'},
        },
      },
    };

    await iframe.locator('body').evaluate((_el: HTMLElement, msg: unknown) => {
      window.parent.postMessage(msg, '*');
    }, callMsg1);

    // 2. Unread Events badge increments to (1)
    await expect(eventsTab).toContainText('(1)');

    // 3. Open Debug Events tab
    await eventsTab.click();

    // 4. Verify RpcReplyForm with live countdown is visible
    const form1 = page.locator('a2ui-composer-rpc-reply-form').filter({hasText: 'rpc-call-101'});
    await expect(form1).toBeVisible();
    await expect(form1.locator('.rpc-remaining-time')).toContainText('Expires in:');

    // 5. Test entering malformed JSON: displays inline validation error without dispatching
    await form1.locator('.rpc-value-input').fill('{oops');
    await form1.locator('.rpc-reply-value-btn').click();

    await expect(form1.locator('.rpc-validation-error')).toBeVisible();
    await expect(form1.locator('.rpc-validation-error')).toContainText('Malformed JSON');

    const hasPrematureReply = await iframe.locator('body').evaluate(() => {
      const msgs =
        (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
      return msgs.some(
        batch =>
          Array.isArray(batch) &&
          batch.some(item => (item as Record<string, unknown>)?.['agentFunctionResponse']),
      );
    });
    expect(hasPrematureReply).toBe(false);

    // 6. Submit valid JSON: dispatches agentFunctionResponse with value
    await form1.locator('.rpc-value-input').fill('{"status":"confirmed"}');
    await form1.locator('.rpc-reply-value-btn').click();

    await expect
      .poll(async () => {
        return iframe.locator('body').evaluate(() => {
          const msgs =
            (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
          return msgs.some(
            batch =>
              Array.isArray(batch) &&
              batch.some(item => {
                const resp = (item as Record<string, unknown>)?.['agentFunctionResponse'] as
                  Record<string, unknown> | undefined;
                const val = resp?.['value'] as Record<string, unknown> | undefined;
                return (
                  (item as Record<string, unknown>)?.['version'] === '1.0' &&
                  resp?.['functionCallId'] === 'rpc-call-101' &&
                  val?.['status'] === 'confirmed'
                );
              }),
          );
        });
      })
      .toBe(true);

    // 7. Second callAgentFunction replied via Reply Error
    const callMsg2 = {
      type: 'SEND_TO_SERVER',
      payload: {
        version: '1.0',
        callAgentFunction: {
          functionCallId: 'rpc-call-102',
          surfaceId: 'sample-surface',
          call: 'confirmBooking',
          args: {itemId: 'item-xyz'},
        },
      },
    };

    await iframe.locator('body').evaluate((_el: HTMLElement, msg: unknown) => {
      window.parent.postMessage(msg, '*');
    }, callMsg2);

    const form2 = page.locator('a2ui-composer-rpc-reply-form').filter({hasText: 'rpc-call-102'});
    await expect(form2).toBeVisible();

    await form2.locator('.rpc-error-code-input').fill('INVENTORY_EXHAUSTED');
    await form2.locator('.rpc-error-message-input').fill('Requested item is not in stock.');
    await form2.locator('.rpc-reply-error-btn').click();

    await expect
      .poll(async () => {
        return iframe.locator('body').evaluate(() => {
          const msgs =
            (window as unknown as {__receivedRenderA2ui?: unknown[][]}).__receivedRenderA2ui || [];
          return msgs.some(
            batch =>
              Array.isArray(batch) &&
              batch.some(item => {
                const resp = (item as Record<string, unknown>)?.['agentFunctionResponse'] as
                  Record<string, unknown> | undefined;
                const err = resp?.['error'] as Record<string, unknown> | undefined;
                return (
                  (item as Record<string, unknown>)?.['version'] === '1.0' &&
                  resp?.['functionCallId'] === 'rpc-call-102' &&
                  err?.['code'] === 'INVENTORY_EXHAUSTED' &&
                  err?.['message'] === 'Requested item is not in stock.'
                );
              }),
          );
        });
      })
      .toBe(true);
  });

  test('b. /agent-chat Concurrent A2A v1.0 RPC Journey, action.userMessage, and stop button abort', async ({
    page,
  }) => {
    let fastResolved = false;
    let capturedRendererFunctionResponse: Record<string, unknown> | null = null;

    await connectMockAgent(page, 'http://mock-agent.local', async postData => {
      if (postData.includes('rendererFunctionResponse')) {
        try {
          capturedRendererFunctionResponse = JSON.parse(postData) as Record<string, unknown>;
        } catch {
          capturedRendererFunctionResponse = {raw: postData};
        }
        return sseEvent({
          taskId: 'task-rfr-ack',
          message: {
            role: 'agent',
            parts: [{text: 'Renderer function response received.'}],
          },
          final: true,
        });
      }

      if (postData.includes('rpc-fast')) {
        fastResolved = true;
        return sseEvent({
          taskId: 'task-rpc-fast',
          message: {
            role: 'agent',
            parts: [
              {
                data: {
                  mimeType: 'application/a2ui+json',
                  data: JSON.stringify({
                    version: '1.0',
                    agentFunctionResponse: {
                      functionCallId: 'rpc-fast',
                      value: {speed: 'fast', completed: true},
                    },
                  }),
                },
              },
            ],
          },
          final: true,
        });
      }

      if (postData.includes('rpc-slow')) {
        // Slow RPC answers only after fast has resolved
        while (!fastResolved) {
          await new Promise(r => setTimeout(r, 20));
        }
        return sseEvent({
          taskId: 'task-rpc-slow',
          message: {
            role: 'agent',
            parts: [
              {
                data: {
                  mimeType: 'application/a2ui+json',
                  data: JSON.stringify({
                    version: '1.0',
                    agentFunctionResponse: {
                      functionCallId: 'rpc-slow',
                      value: {speed: 'slow', afterFast: fastResolved},
                    },
                  }),
                },
              },
            ],
          },
          final: true,
        });
      }

      if (postData.includes('confirmPurchase')) {
        return sseEvent({
          taskId: 'task-purchase-ack',
          message: {
            role: 'agent',
            parts: [{text: 'Order placed successfully!'}],
          },
          final: true,
        });
      }

      // Initial prompt returns single-message createSurface + callRendererFunction
      const initialPayload = [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'v10-chat-surface',
            catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
            components: [
              {
                id: 'root',
                component: 'Column',
                children: ['status_text'],
              },
              {
                id: 'status_text',
                component: 'Text',
                text: 'Surface Ready',
              },
            ],
          },
        },
        {
          version: '1.0',
          callRendererFunction: {
            functionCallId: 'crf-init-1',
            surfaceId: 'v10-chat-surface',
            call: 'initializeView',
            args: {},
          },
        },
      ];

      return sseEvent({
        taskId: 'task-init-surface',
        message: {
          role: 'agent',
          parts: [
            {
              text: 'Surface loaded with renderer function invocation.',
            },
            {
              data: {
                mimeType: 'application/a2ui+json',
                data: JSON.stringify(initialPayload),
              },
            },
          ],
        },
        final: true,
      });
    });

    const prompt = page.locator('.prompt-textarea');
    await prompt.fill('Start v1.0 RPC test');
    await prompt.press('Enter');

    const surface = inlineSurfaceFrame(page);
    await expect(surface.locator('body')).toBeVisible();

    // Verify stub renderer answered callRendererFunction and forwarded to agent
    await expect.poll(() => capturedRendererFunctionResponse).not.toBeNull();

    // Now emit two concurrent callAgentFunction calls from the guest frame:
    // rpc-slow and rpc-fast
    await surface.locator('body').evaluate((_el: HTMLElement) => {
      window.parent.postMessage(
        {
          type: 'SEND_TO_SERVER',
          payload: {
            version: '1.0',
            callAgentFunction: {
              surfaceId: 'sample-surface',
              functionCallId: 'rpc-slow',
              call: 'fetchSlow',
              args: {},
            },
          },
        },
        '*',
      );
      window.parent.postMessage(
        {
          type: 'SEND_TO_SERVER',
          payload: {
            version: '1.0',
            callAgentFunction: {
              surfaceId: 'sample-surface',
              functionCallId: 'rpc-fast',
              call: 'fetchFast',
              args: {},
            },
          },
        },
        '*',
      );
    });

    // Verify both responses arrived in originating frame and rpc-fast arrived first
    await expect
      .poll(async () => {
        return surface.locator('body').evaluate(() => {
          const resps =
            (window as unknown as {__receivedResponses?: string[]}).__receivedResponses || [];
          return resps.length;
        });
      })
      .toBe(2);

    const responseOrder = await surface.locator('body').evaluate(() => {
      return (window as unknown as {__receivedResponses?: string[]}).__receivedResponses || [];
    });
    expect(responseOrder).toEqual(['rpc-fast', 'rpc-slow']);

    // Now test action with userMessage
    await surface.locator('body').evaluate((_el: HTMLElement) => {
      window.parent.postMessage(
        {
          type: 'SEND_TO_SERVER',
          payload: {
            version: '1.0',
            action: {
              name: 'confirmPurchase',
              userMessage: 'I would like to order two blue widgets',
              context: {quantity: 2},
            },
          },
        },
        '*',
      );
    });

    // Verify userMessage is displayed in the conversation history
    await expect(page.locator('.chat-history-container')).toContainText(
      'I would like to order two blue widgets',
    );
    await expect(page.locator('.chat-history-container')).toContainText(
      'Order placed successfully!',
    );

    // Now test Stop button aborts an in-flight RPC stream cleanly
    await page.route('http://mock-agent.local/**', async route => {
      const postData = route.request().postData() || '';
      if (postData.includes('rpc-hanging') || postData.includes('Hanging prompt to abort')) {
        // Keep route open without responding to simulate in-flight long-running RPC
        return;
      }
      await route.continue();
    });

    await surface.locator('body').evaluate((_el: HTMLElement) => {
      window.parent.postMessage(
        {
          type: 'SEND_TO_SERVER',
          payload: {
            version: '1.0',
            callAgentFunction: {
              surfaceId: 'v10-chat-surface',
              functionCallId: 'rpc-hanging',
              call: 'longRunningRpc',
              args: {},
            },
          },
        },
        '*',
      );
    });

    await prompt.fill('Hanging prompt to abort');
    await prompt.press('Enter');

    // Click stop button
    const stopButton = page.locator('.stop-circle-btn');
    await expect(stopButton).toBeVisible();
    await stopButton.click();
    await expect(stopButton).toHaveCount(0);
  });

  test('c. /gallery and /demos auto-reject callAgentFunction with NO_AGENT_CONNECTED (< 1s)', async ({
    page,
  }) => {
    // 1. Test /gallery auto-reject
    await page.goto('/gallery');
    const galleryCard = page.locator('.preview-card');
    await expect(galleryCard).toBeVisible();

    const galleryFrame = firstPreviewFrame(galleryCard);
    await expect(galleryFrame.locator('body')).toBeVisible();

    const galleryStartTime = Date.now();
    const galleryResult = await galleryFrame.locator('body').evaluate(async (_el: HTMLElement) => {
      return new Promise<Record<string, unknown>>(resolve => {
        const handler = (event: MessageEvent) => {
          const payload = event.data?.payload;
          if (event.data?.type === 'RENDER_A2UI' && Array.isArray(payload)) {
            const match = payload.find((item: Record<string, unknown>) => {
              const resp = item?.['agentFunctionResponse'] as Record<string, unknown> | undefined;
              return resp?.['functionCallId'] === 'gal-call-reject';
            });
            if (match) {
              window.removeEventListener('message', handler);
              resolve(match as Record<string, unknown>);
            }
          }
        };
        window.addEventListener('message', handler);
        window.parent.postMessage(
          {
            type: 'SEND_TO_SERVER',
            payload: {
              version: '1.0',
              callAgentFunction: {
                surfaceId: 'gallery-surface',
                functionCallId: 'gal-call-reject',
                call: 'testAutoReject',
                args: {},
              },
            },
          },
          '*',
        );
      });
    });

    const galleryDuration = Date.now() - galleryStartTime;
    expect(galleryDuration).toBeLessThan(1000);

    const galResp = galleryResult['agentFunctionResponse'] as Record<string, unknown>;
    const galErr = galResp['error'] as Record<string, unknown>;
    expect(galErr['code']).toBe('NO_AGENT_CONNECTED');

    // 2. Test /demos auto-reject
    await page.goto(`/demos?renderer=${encodeURIComponent(V10_RENDERER_URL)}`);
    const coordinator = demosCoordinator(page);
    await expect(coordinator).toHaveCount(1);

    const demoFrame = previewFrame(coordinator);
    await demoFrame.locator('body').waitFor({state: 'attached'});

    const demoStartTime = Date.now();
    const demoResult = await demoFrame.locator('body').evaluate(async (_el: HTMLElement) => {
      return new Promise<Record<string, unknown>>(resolve => {
        const handler = (event: MessageEvent) => {
          const payload = event.data?.payload;
          if (event.data?.type === 'RENDER_A2UI' && Array.isArray(payload)) {
            const match = payload.find((item: Record<string, unknown>) => {
              const resp = item?.['agentFunctionResponse'] as Record<string, unknown> | undefined;
              return resp?.['functionCallId'] === 'demo-call-reject';
            });
            if (match) {
              window.removeEventListener('message', handler);
              resolve(match as Record<string, unknown>);
            }
          }
        };
        window.addEventListener('message', handler);
        window.parent.postMessage(
          {
            type: 'SEND_TO_SERVER',
            payload: {
              version: '1.0',
              callAgentFunction: {
                surfaceId: 'demo-surface-1',
                functionCallId: 'demo-call-reject',
                call: 'testAutoReject',
                args: {},
              },
            },
          },
          '*',
        );
      });
    });

    const demoDuration = Date.now() - demoStartTime;
    expect(demoDuration).toBeLessThan(1000);

    const demoResp = demoResult['agentFunctionResponse'] as Record<string, unknown>;
    const demoErr = demoResp['error'] as Record<string, unknown>;
    expect(demoErr['code']).toBe('NO_AGENT_CONNECTED');
  });

  test('d. live v1.0 sample renderer: a2uiBridge.callAgentFunction round-trips via Debug Events reply form and auto-rejects on /gallery in < 1s', async ({
    page,
  }) => {
    // 1. In /workspace with live sample renderer: load a simple surface
    await page.goto(`/?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    await waitForMonacoEditor(page);
    await waitForPreviewTab(page);

    const liveRpcPayload = JSON.stringify([
      {
        version: '1.0',
        createSurface: {
          surfaceId: 'live-rpc-surface',
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'root',
              component: 'Text',
              text: 'Live RPC Surface',
            },
          ],
        },
      },
    ]);

    await setMonacoContent(page, liveRpcPayload);

    const iframe = previewFrame(page);
    await expect(iframe.getByText('Live RPC Surface')).toBeVisible({timeout: 15_000});

    // 2. Trigger callAgentFunction via real RpcHandler / PreviewBridge in live sample renderer
    await iframe.locator('body').evaluate(() => {
      const bridge = (
        window as unknown as {
          a2uiBridge?: {
            callAgentFunction: (
              surfaceId: string,
              call: Record<string, unknown>,
              opts?: {functionCallId?: string},
            ) => Promise<unknown>;
          };
        }
      ).a2uiBridge;
      if (!bridge?.callAgentFunction) {
        throw new Error('a2uiBridge.callAgentFunction is not available in renderer iframe');
      }
      (window as unknown as {__rpcCallPromise?: Promise<unknown>}).__rpcCallPromise =
        bridge.callAgentFunction(
          'live-rpc-surface',
          {'@call': 'orderCoffee', args: {size: 'large'}},
          {functionCallId: 'rpc-live-order'},
        );
    });

    // 3. Events tab in Debug drawer gets unread badge
    const eventsTab = page.locator('.dv-tab', {hasText: /^Events/});
    await expect(eventsTab).toContainText('(1)');

    // 4. Open Events tab and verify RpcReplyForm
    await eventsTab.click();
    await expect(page.locator('td.mat-column-action').first()).toContainText('orderCoffee');
    const replyForm = page
      .locator('a2ui-composer-rpc-reply-form')
      .filter({hasText: 'rpc-live-order'});
    await expect(replyForm).toBeVisible();

    // 5. Submit Reply Value
    await replyForm.locator('.rpc-value-input').fill('{"orderId":"coffee-42","status":"brewing"}');
    await replyForm.locator('.rpc-reply-value-btn').click();

    // Verify reply form actions are dismissed and status becomes Replied
    await expect(replyForm.locator('.rpc-actions-section')).not.toBeVisible();
    await expect(replyForm.locator('.rpc-status-badge')).toContainText('Replied');

    // Verify renderer promise resolves with the replied value
    const rpcResult = await iframe.locator('body').evaluate(async () => {
      return (window as unknown as {__rpcCallPromise: Promise<unknown>}).__rpcCallPromise;
    });
    expect(rpcResult).toEqual({orderId: 'coffee-42', status: 'brewing'});

    // 6. Test /gallery auto-reject with live sample renderer in < 1s
    await page.goto(`/gallery?renderer=${encodeURIComponent(RENDERER_URLS.angular)}`);
    const galleryCard = page.locator('.preview-card');
    await expect(galleryCard).toBeVisible();

    const galleryFrame = firstPreviewFrame(galleryCard);
    await expect(galleryFrame.locator('body')).toBeVisible();

    const galleryStartTime = Date.now();
    const galleryError = await galleryFrame.locator('body').evaluate(async () => {
      const bridge = (
        window as unknown as {
          a2uiBridge?: {
            callAgentFunction: (
              surfaceId: string,
              call: Record<string, unknown>,
              opts?: {functionCallId?: string},
            ) => Promise<unknown>;
          };
        }
      ).a2uiBridge;
      if (!bridge?.callAgentFunction) {
        throw new Error('a2uiBridge.callAgentFunction is not available in gallery frame');
      }
      try {
        await bridge.callAgentFunction(
          'gallery-surface',
          {'@call': 'orderCoffee', args: {}},
          {functionCallId: 'live-gal-reject'},
        );
        return null;
      } catch (err: unknown) {
        return {
          message: (err as Error).message,
          code: (err as {code?: string}).code,
        };
      }
    });

    const galleryDuration = Date.now() - galleryStartTime;
    expect(galleryDuration).toBeLessThan(1000);
    expect(galleryError).toBeDefined();
    expect(galleryError?.code || galleryError?.message).toMatch(/NO_AGENT_CONNECTED/);
  });
});
