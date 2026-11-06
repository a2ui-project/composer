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

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import React, {act} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {App} from './App';
import {a2uiBridge, PreviewBridgeMessageType, MCP_FUNCTIONS_CATALOG_ID} from 'a2ui-bridge';
import {COMPONENT_USAGES} from '../../shared/usages.js';
import {assertValidV10ComponentUsages} from '../../shared/usages-test-helper.js';

describe('A2ui React Sandbox Integration Spec Tests (v1.0 Parity)', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let originalParent: Window;

  beforeEach(() => {
    document.adoptedStyleSheets = document.adoptedStyleSheets || [];
    originalParent = window.parent;
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: {
        postMessage: vi.fn(),
      },
    });
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    container = null;
    root = null;
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: originalParent,
    });
    vi.restoreAllMocks();
  });

  it('attaches renderer and dispatches RENDERER_READY handshake upon mounting', async () => {
    const postSpy = vi.spyOn(window.parent, 'postMessage');

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    expect(postSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.RENDERER_READY,
      }),
      window.location.origin,
    );
  });

  it('registers multi-catalog handshake with v1.0 basicCatalog and McpFunctionsCatalog', async () => {
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    expect(attachSpy).toHaveBeenCalledTimes(1);
    const catalogs = attachSpy.mock.calls[0][1].catalogs as Array<{
      id?: string;
      protocolVersion?: string;
    }>;
    expect(catalogs).toBeDefined();
    expect(catalogs).toHaveLength(2);
    const [basic, mcp] = catalogs;
    expect(basic?.id).toBe('https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json');
    expect(basic?.protocolVersion).toBe('1.0');
    expect(mcp?.id).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(mcp?.protocolVersion).toBe('1.0');
  });

  it('renders loading placeholder initially before blueprints arrive', async () => {
    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    expect(container?.innerHTML).toContain('Waiting for RENDER_A2UI payloads...');
  });

  it('processes RENDER_A2UI v1.0 layout single message and renders successfully', async () => {
    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    const payload = [
      {
        version: '1.0',
        createSurface: {
          surfaceId: 'surf-1',
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['text1', 'button1'],
            },
            {
              id: 'text1',
              component: 'Text',
              text: '**Welcome React User**',
            },
            {
              id: 'button1',
              component: 'Button',
              child: 'buttonText',
              action: {
                event: {
                  name: 'TICKET_SUBMIT',
                  context: {},
                },
              },
            },
            {
              id: 'buttonText',
              component: 'Text',
              text: 'Submit Ticket',
            },
          ],
        },
      },
    ];

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload,
          },
        }),
      );
    });

    await vi.waitFor(() => {
      expect(container?.querySelector('strong')?.textContent).toBe('Welcome React User');
      expect(container?.innerHTML).toContain('Submit Ticket');
      expect(container?.querySelector('a2ui-basic-button')).not.toBeNull();
      expect(container?.querySelector('button')).not.toBeNull();
      expect(document.adoptedStyleSheets.length).toBeGreaterThan(0);
    });
  });

  it('renders a blank canvas when surface has no root component and renders once root is added', async () => {
    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    // Step 1: Send createSurface without any root component
    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [
              {
                version: '1.0',
                createSurface: {
                  surfaceId: 'blank-surf',
                  catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
                  components: [
                    {
                      id: 'sidebar',
                      component: 'Text',
                      text: 'No root yet',
                    },
                  ],
                },
              },
            ],
          },
        }),
      );
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(container?.innerHTML).not.toContain('Waiting for RENDER_A2UI payloads...');
    expect(container?.innerHTML).not.toContain('[Loading root...]');

    // Step 2: Stream in the root component on the existing surface
    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [
              {
                version: '1.0',
                updateComponents: {
                  surfaceId: 'blank-surf',
                  components: [
                    {
                      id: 'root',
                      component: 'Text',
                      text: 'Root Arrived',
                    },
                  ],
                },
              },
            ],
          },
        }),
      );
    });

    expect(container?.innerHTML).toContain('Root Arrived');
  });

  it('pipes user custom elements clicks telemetry actions upward to parent frame', async () => {
    const postSpy = vi.spyOn(window.parent, 'postMessage');

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    const payload = [
      {
        version: '1.0',
        createSurface: {
          surfaceId: 'surf-1',
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'root',
              component: 'Button',
              child: 'buttonChild',
              action: {
                event: {
                  name: 'PROXIED_CLICK',
                  context: {},
                },
              },
            },
            {
              id: 'buttonChild',
              component: 'Text',
              text: 'Click Proxy',
            },
          ],
        },
      },
    ];

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload,
          },
        }),
      );
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const btn = container?.querySelector('button') as HTMLButtonElement;
    expect(btn).not.toBeNull();

    await act(async () => {
      btn.click();
    });

    expect(postSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: expect.objectContaining({
          action: expect.objectContaining({
            name: 'PROXIED_CLICK',
            sourceComponentId: 'root',
          }),
        }),
      }),
      window.location.origin,
    );
  });

  it('bypasses network fetch and immediately resolves v1.0 in-memory catalogs on GET_CATALOG', async () => {
    const postSpy = vi.spyOn(window.parent, 'postMessage');
    const fetchSpy = vi.spyOn(window, 'fetch');

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: PreviewBridgeMessageType.GET_CATALOG,
          },
        }),
      );
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(fetchSpy).not.toHaveBeenCalled();

    const catalogMsg = postSpy.mock.calls
      .map(c => c[0] as {type?: string; payload?: Record<string, unknown>})
      .find(m => m?.type === PreviewBridgeMessageType.A2UI_CATALOG);
    expect(catalogMsg).toBeDefined();
    expect(catalogMsg?.payload?.['protocolVersion']).toBe('1.0');
    const catalogsPayload = catalogMsg?.payload?.['catalogs'] as Array<Record<string, unknown>>;
    expect(catalogsPayload).toHaveLength(2);
    expect(catalogsPayload[0]?.['catalogId']).toBe(
      'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
    );
    expect(catalogsPayload[1]?.['catalogId']).toBe(MCP_FUNCTIONS_CATALOG_ID);
  });

  it('serves the full basic-catalog demo set', async () => {
    const {DEMOS} = await import('../../shared/demos');
    expect(DEMOS).toHaveLength(46);
    for (const demo of DEMOS) {
      expect(demo.id).toBeTruthy();
      expect(demo.name).toBeTruthy();
      expect(demo.description).toBeTruthy();
      expect(Array.isArray(demo.a2ui)).toBe(true);
      expect(demo.a2ui.length).toBeGreaterThan(0);
      expect(demo.a2ui[0].version).toBe('1.0');
    }
    expect(new Set(DEMOS.map(d => d.id)).size).toBe(DEMOS.length);
  });

  it('wires getDemos from the sandbox options through to the bridge', async () => {
    const {DEMOS} = await import('../../shared/demos');
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    expect(attachSpy).toHaveBeenCalledTimes(1);
    const rendererConfig = attachSpy.mock.calls[0][1];
    expect(rendererConfig.getDemos).toBeTypeOf('function');

    const served = await rendererConfig.getDemos!();
    expect(served).toHaveLength(46);
    expect(served).toBe(DEMOS);
  });

  it('renders error overlay with error-overlay class on debounced error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    const invalidPayload = [
      {
        version: '1.0',
        updateComponents: {
          surfaceId: 'surf-err',
          components: [
            {
              id: 'err-comp',
              component: 'NonExistentComponentType',
            },
          ],
        },
      },
    ];

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window.parent,
          origin: window.location.origin,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: invalidPayload,
          },
        }),
      );
    });

    // Advance past the 350ms debounce window
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const overlay = container?.querySelector('.error-overlay') as HTMLElement;
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain('JSON Preview Error');
    expect(overlay.classList.contains('error-overlay')).toBe(true);

    const shell = container?.querySelector('.sandbox-shell') as HTMLElement;
    expect(shell.style.minHeight).toBe('');
    expect(shell.style.height).toBe('');
  });

  describe('A2UI v1.0 COMPONENT_USAGES validation', () => {
    it('validates every usage entry in usages.ts against v1.0 CreateSurfaceMessageSchema and BASIC_COMPONENTS', () => {
      assertValidV10ComponentUsages(COMPONENT_USAGES);
    });
  });
});
