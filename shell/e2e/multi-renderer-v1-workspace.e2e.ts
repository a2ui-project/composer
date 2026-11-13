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
import {previewFrame} from '../src/app/preview/testing/preview-frame-locators';
import {RENDERER_URLS} from '../src/app/preview/testing/renderer-urls';
import {
  getMonacoContent,
  mockLocalRenderersConfig,
  setMonacoContent,
  waitForMonacoEditor,
} from './helpers';

interface MonacoMarker {
  severity: number;
  message: string;
  startLineNumber?: number;
}

interface WindowWithMonacoMarkers extends Window {
  monaco?: {
    editor: {
      getModels(): Array<{uri?: unknown}>;
      getModelMarkers(filter?: {resource?: unknown}): MonacoMarker[];
    };
  };
}

const V10_SAMPLE_RENDERERS = [
  {name: 'Angular', url: RENDERER_URLS.angular},
  {name: 'Lit', url: RENDERER_URLS.lit},
  {name: 'React', url: RENDERER_URLS.react},
] as const;

const VALID_V10_PAYLOAD = JSON.stringify([
  {
    version: '1.0',
    createSurface: {
      surfaceId: 'v10-valid-surface',
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      components: [
        {
          id: 'root',
          component: 'Column',
          children: ['title', 'btn_basic', 'btn_mcp'],
        },
        {
          id: 'title',
          component: 'Text',
          text: {
            '@path': '/headline',
          },
        },
        {
          id: 'btn_basic',
          component: 'Button',
          child: 'btn_basic_text',
          action: {
            functionCall: {
              '@call': 'openUrl',
              args: {
                url: 'https://example.com',
              },
            },
          },
        },
        {
          id: 'btn_basic_text',
          component: 'Text',
          text: 'Open Link',
        },
        {
          id: 'btn_mcp',
          component: 'Button',
          child: 'btn_mcp_text',
          action: {
            functionCall: {
              catalogId: 'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
              '@call': 'regexCapture',
              args: {
                pattern: '.*',
                value: 'test',
              },
            },
          },
        },
        {
          id: 'btn_mcp_text',
          component: 'Text',
          text: 'Call Regex Capture',
        },
      ],
      dataModel: {
        headline: 'Welcome to A2UI v1.0',
      },
    },
  },
]);

const INVALID_V10_PAYLOAD = JSON.stringify([
  {
    version: '1.0',
    createSurface: {
      surfaceId: 'v10-invalid-surface',
      invalidUnknownPropA2UI: 999,
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      components: [
        {
          id: 'root',
          component: 'Text',
          text: 12345,
          variant: 'invalid_text_variant',
        },
      ],
    },
  },
]);

const INVALID_FN_CALL_PAYLOAD = JSON.stringify([
  {
    version: '1.0',
    createSurface: {
      surfaceId: 'v10-invalid-fn-surface',
      catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
      components: [
        {
          id: 'root',
          component: 'Button',
          child: 'btn_text',
          action: {
            functionCall: {
              '@call': 'openUrl',
              args: {
                url: 12345,
              },
            },
          },
        },
        {
          id: 'btn_text',
          component: 'Text',
          text: 'Invalid Function',
        },
      ],
    },
  },
]);

test.describe('Multi-Renderer v1.0 Workspace E2E Suite', () => {
  test.beforeEach(async ({context, page}) => {
    await mockLocalRenderersConfig(context);

    await page.addInitScript(() => {
      try {
        if (window === window.top) {
          localStorage.setItem('a2ui_composer_force_1p', 'true');
        }
      } catch {
        // Ignore cross-origin sandboxed frame SecurityError
      }
    });
  });

  test('switches across all three live v1.0 sample renderers (Angular, Lit, React) on /workspace and verifies CAR_BOOKING_V1_0 renders cleanly', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    for (const renderer of V10_SAMPLE_RENDERERS) {
      await test.step(`Verify live v1.0 sample renderer: ${renderer.name}`, async () => {
        consoleErrors.length = 0;

        await page.goto(`/?renderer=${renderer.url}`);
        await waitForMonacoEditor(page);

        // Header shows Basic Catalog title (allow timeout for dev server handshake)
        await expect(page.locator('.header-title')).toContainText('Basic Catalog', {
          timeout: 20_000,
        });

        // Initial draft is CAR_BOOKING_V1_0
        const draft = await getMonacoContent(page);
        expect(draft).toContain('"version": "1.0"');
        expect(draft).toContain('Book a Car');

        // Preview frame is rendered cleanly
        const iframe = previewFrame(page);
        await expect(iframe.getByRole('button', {name: 'Search Cars'})).toBeVisible({
          timeout: 20_000,
        });
        await expect(iframe.getByText('Book a Car')).toBeVisible();

        // Verify negotiated protocolVersion is '1.0' and multi-catalog is established
        await expect
          .poll(
            async () => {
              return page.evaluate(() => {
                const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
                const shell = document.querySelector('a2ui-composer-shell');
                const comp =
                  ng && shell
                    ? (ng.getComponent(shell) as {
                        catalogManagement?: {
                          activeCatalogs?: () => Array<{catalogId?: string; $id?: string}>;
                          activeProtocolVersion?: () => string;
                        };
                      })
                    : null;
                const catalogs = comp?.catalogManagement?.activeCatalogs?.() ?? [];
                const protocolVersion = comp?.catalogManagement?.activeProtocolVersion?.();
                const hasBasic = catalogs.some(c =>
                  (c.catalogId || c.$id)?.includes('specification/v1_0/catalogs/basic'),
                );
                const hasMcp = catalogs.some(c =>
                  (c.catalogId || c.$id)?.includes('catalogs/mcp-functions/catalog.json'),
                );
                return protocolVersion === 'v1.0' && hasBasic && hasMcp;
              });
            },
            {timeout: 20_000},
          )
          .toBe(true);

        // Verify zero errorLogger errors
        const errors = await page.evaluate(() => {
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
          return comp?.errorLogger?.getHistory()?.filter(e => e.level === 'error') ?? [];
        });
        expect(errors).toEqual([]);
        expect(consoleErrors).toEqual([]);
      });
    }
  });

  test('validates v1.0 JSON schema in Monaco editor: accepts @path, @call, and McpFunctionsCatalog with zero error markers, and flags invalid component properties', async ({
    page,
  }) => {
    await page.goto(`/?renderer=${RENDERER_URLS.angular}`);
    await waitForMonacoEditor(page);
    await expect(page.locator('.header-title')).toContainText('Basic Catalog', {timeout: 20_000});

    // 1. Set valid v1.0 payload with @path, @call, and McpFunctionsCatalog
    await setMonacoContent(page, VALID_V10_PAYLOAD);

    // Verify Monaco has zero error markers for the valid v1.0 payload
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const monaco = (window as unknown as WindowWithMonacoMarkers).monaco;
            if (!monaco) return -1;
            const markers = monaco.editor.getModelMarkers({});
            return markers.filter(m => m.severity === 8).length;
          });
        },
        {timeout: 15_000},
      )
      .toBe(0);

    // 2. Set invalid v1.0 payload with invalid component properties
    await setMonacoContent(page, INVALID_V10_PAYLOAD);

    // Verify Monaco produces error markers flagging the invalid properties
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const monaco = (window as unknown as WindowWithMonacoMarkers).monaco;
            if (!monaco) return false;
            const markers = monaco.editor.getModelMarkers({});
            return markers.some(m => m.severity === 8);
          });
        },
        {timeout: 15_000},
      )
      .toBe(true);

    // 3. Set payload with invalid function argument to verify FunctionCall schema enforcement
    await setMonacoContent(page, INVALID_FN_CALL_PAYLOAD);

    // Verify Monaco produces error markers flagging the invalid function call argument
    await expect
      .poll(
        async () => {
          return page.evaluate(() => {
            const monaco = (window as unknown as WindowWithMonacoMarkers).monaco;
            if (!monaco) return false;
            const markers = monaco.editor.getModelMarkers({});
            return markers.some(m => m.severity === 8);
          });
        },
        {timeout: 15_000},
      )
      .toBe(true);
  });
});
