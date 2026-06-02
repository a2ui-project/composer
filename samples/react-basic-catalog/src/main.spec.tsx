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
import {act} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {App} from './App';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {useA2uiSandbox} from 'a2ui-bridge/react';
import {Catalog, ComponentApi} from '@a2ui/web_core/v0_9';
import {basicCatalog} from '@a2ui/react/v0_9';

describe('A2ui React Sandbox Integration Spec Tests (100% Parity)', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
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

    // Verify that the linear ready handshake was sent instantly upon attachRenderer() call
    expect(postSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.RENDERER_READY,
      }),
      '*',
    );
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

  it('processes RENDER_A2UI layout array and recursive tree loads successfully', async () => {
    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    // Simulate parent host returning layout blueprint
    const payload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'surf-1',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'surf-1',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['text-1', 'button-1'],
            },
            {
              id: 'text-1',
              component: 'Text',
              text: 'Welcome React User',
            },
            {
              id: 'button-1',
              component: 'Button',
              child: 'Submit Ticket',
              action: {
                event: {
                  name: 'TICKET_SUBMIT',
                  context: {},
                },
              },
            },
          ],
        },
      },
    ];

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload,
          },
        }),
      );
    });

    // Advance dynamic timers (Step 2 deferred rendering tick)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify dynamic child widget layout element paints resolved successfully!
    expect(container?.innerHTML).toContain('Welcome React User');
    expect(container?.innerHTML).toContain('Submit Ticket');
    expect(container?.querySelector('button')).not.toBeNull();
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
        version: 'v0.9',
        createSurface: {
          surfaceId: 'surf-1',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'surf-1',
          components: [
            {
              id: 'root',
              component: 'Button',
              child: 'Click Proxy',
              action: {
                event: {
                  name: 'PROXIED_CLICK',
                  context: {},
                },
              },
            },
          ],
        },
      },
    ];

    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
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

    // Trigger click inside JSX element dynamically
    await act(async () => {
      btn.click();
    });

    // Assert that dynamic SEND_TO_SERVER custom envelope message is routed back to parent host!
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
      '*',
    );
  });

  it('resolves catalog network-dependently over HTTP fetch when catalogJson is not preloaded', async () => {
    const postSpy = vi.spyOn(window.parent, 'postMessage');
    const mockCatalogPayload = {
      components: {
        'test-component': {type: 'Button'},
      },
    };
    const fetchSpy = vi.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(")]}'\n" + JSON.stringify(mockCatalogPayload)),
      } as Response),
    );

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<App />);
      }
    });

    // Simulate GET_CATALOG request payload
    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.GET_CATALOG,
          },
        }),
      );
    });

    // Wait for the async handleGetCatalog to settle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Verify fetch was triggered on standard path '/catalog'
    expect(fetchSpy).toHaveBeenCalledWith('/catalog', expect.any(Object));

    // Verify bridge posted back A2UI_CATALOG with resolved payload
    expect(postSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: expect.objectContaining(mockCatalogPayload),
      }),
      '*',
    );
  });

  it('bypasses network fetch and immediately returns preloaded in-memory catalogJson option when provided', async () => {
    const postSpy = vi.spyOn(window.parent, 'postMessage');
    const fetchSpy = vi.spyOn(window, 'fetch');
    const mockPreloadedCatalog = {
      components: {
        'preloaded-comp': {type: 'Text'},
      },
    };

    // Helper app testing target preloaded hook parameters
    function InMemoryPreloadedApp() {
      const {surface} = useA2uiSandbox([basicCatalog as unknown as Catalog<ComponentApi>], {
        catalogJson: mockPreloadedCatalog,
      });
      return <main className="sandbox-shell">{surface ? 'Ready' : 'Waiting...'}</main>;
    }

    await act(async () => {
      if (container) {
        root = createRoot(container);
        root.render(<InMemoryPreloadedApp />);
      }
    });

    // Simulate GET_CATALOG request payload
    await act(async () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.GET_CATALOG,
          },
        }),
      );
    });

    // Wait for the async handleGetCatalog to settle
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    // Verify fetch was NOT called
    expect(fetchSpy).not.toHaveBeenCalled();

    // Verify bridge posted back A2UI_CATALOG with our preloaded in-memory catalog
    expect(postSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: expect.objectContaining(mockPreloadedCatalog),
      }),
      '*',
    );
  });
});
