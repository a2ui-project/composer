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
import {
  PreviewBridge,
  a2uiBridge,
  SurfaceGroupLike,
  SurfaceInstance,
  RendererConfig,
} from './preview-bridge';
import {PreviewBridgeMessageType} from './bridge-message';
import type {A2uiMessage} from '@a2ui/web_core/v0_9';

declare const process: {
  env: {
    NODE_ENV: string;
  };
};

describe('PreviewBridge Core API Runtime', () => {
  let bridge: PreviewBridge;

  beforeEach(() => {
    a2uiBridge.destroy(); // Cleanly disable and destroy module-level global instance
    bridge = new PreviewBridge();
    const existing = document.getElementById('a2ui-blocking-overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  });

  afterEach(() => {
    bridge.destroy();

    const existing = document.getElementById('a2ui-blocking-overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('routes SET_BLOCKING_STATE events correctly and handles overlays', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
          payload: {blocked: true, message: 'Freezing UI'},
        },
      }),
    );

    const overlay = document.getElementById('a2ui-blocking-overlay');
    expect(overlay).not.toBeNull();
    expect(document.getElementById('a2ui-blocking-message')?.innerText).toBe('Freezing UI');
  });

  it('replaces the previous active renderer and warns when attachRenderer is invoked repeatedly', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockGroup1 = {onSurfaceCreated: {subscribe: vi.fn()}};
    const mockGroup2 = {onSurfaceCreated: {subscribe: vi.fn()}};

    const processor1 = {processMessages: vi.fn()};
    const processor2 = {processMessages: vi.fn()};

    const conn1 = bridge.attachRenderer(processor1, {
      surfaceGroup: mockGroup1 as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    const conn2 = bridge.attachRenderer(processor2, {
      surfaceGroup: mockGroup2 as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    expect(warnSpy).toHaveBeenCalledWith(
      'PreviewBridge: A renderer is already attached. Replacing the previous renderer.',
    );
    expect(bridge['activeRenderer']?.processor).toBe(processor2);

    conn1.unsubscribe();
    conn2.unsubscribe();
  });

  it('clears the activeRenderer reference hook upon unsubscription', () => {
    const mockGroup = {
      onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
    };
    const processor = {processMessages: vi.fn()};

    const conn = bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    expect(bridge['activeRenderer']?.processor).toBe(processor);

    conn.unsubscribe();

    expect(bridge['activeRenderer']).toBeNull();
  });

  it('emits RENDERER_READY signal only when attachRenderer is called', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');

    // Handshake should NOT be sent upon simple document load events anymore
    window.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(spy).not.toHaveBeenCalled();

    // Handshake should fire instantly upon attachRenderer() call
    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};
    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({type: PreviewBridgeMessageType.RENDERER_READY}),
      '*',
    );
  });

  it('mounts full-viewport overlay DOM element dynamically upon SET_BLOCKING_STATE true', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
          payload: {blocked: true, message: 'Freezing UI'},
        },
      }),
    );

    const overlay = document.getElementById('a2ui-blocking-overlay');
    expect(overlay).not.toBeNull();
    expect(document.getElementById('a2ui-blocking-message')?.innerText).toBe('Freezing UI');

    const button = overlay?.querySelector('button');
    expect(button).not.toBeNull();

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.SET_BLOCKING_STATE, payload: {blocked: false}},
      }),
    );
    expect(document.getElementById('a2ui-blocking-overlay')).toBeNull();
  });

  it('emits FORCE_UNBLOCK signal upward to parent window when clicking Force Unblock button', () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.SET_BLOCKING_STATE, payload: {blocked: true}},
      }),
    );

    const button = document.querySelector('#a2ui-blocking-overlay button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    button.click();

    expect(spy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.FORCE_UNBLOCK, payload: {}},
      '*',
    );
  });

  it('fetches catalog schema and transmits A2UI_CATALOG payload on GET_CATALOG message', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const mockCatalog = {items: ['BasicColumn']};
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mockCatalog),
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenCalledWith('catalog', expect.any(Object));
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('falls back to /catalog.json if /catalog returns HTML (SPA fallback scenario)', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const mockCatalog = {items: ['BasicColumn']};

    window.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<!doctype html><html>SPA Fallback</html>',
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockCatalog),
      });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenNthCalledWith(1, 'catalog', expect.any(Object));
    expect(window.fetch).toHaveBeenNthCalledWith(2, 'catalog.json', expect.any(Object));
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('emits A2UI_CATALOG error when both /catalog and /catalog.json return HTML', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');

    window.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<!doctype html><html>SPA Fallback 1</html>',
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<!doctype html><html>SPA Fallback 2</html>',
      });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenNthCalledWith(1, 'catalog', expect.any(Object));
    expect(window.fetch).toHaveBeenNthCalledWith(2, 'catalog.json', expect.any(Object));
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {
          error: {
            message:
              'Catalog fetch returned HTML (SPA fallback) for both catalog and catalog.json. Ensure the catalog JSON is correctly hosted and served.',
          },
        },
      },
      '*',
    );
  });

  it('falls back to /catalog.json if /catalog returns HTML with irregular doctype spacing', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const mockCatalog = {items: ['IrregularSpacing']};

    window.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<!doctype   html><html>SPA Fallback</html>',
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockCatalog),
      });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenNthCalledWith(1, 'catalog', expect.any(Object));
    expect(window.fetch).toHaveBeenNthCalledWith(2, 'catalog.json', expect.any(Object));
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('transmits A2UI_CATALOG error payload on failed GET_CATALOG fetch', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {
          error: {message: 'Catalog fetch failed with status: 500'},
        },
      },
      '*',
    );
  });

  it('serves registered catalog from configuration setup in-memory, bypassing fetch', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.fetch = vi.fn();

    const mockCatalog = {items: ['InMemoryComponent']};
    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      catalogJson: mockCatalog,
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('triggers onCatalogResolved callback when createSurface command contains catalogId', async () => {
    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};
    const onCatalogResolved = vi.fn();

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      onCatalogResolved,
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: [
            {
              version: 'v0.9',
              createSurface: {
                surfaceId: 'surface-123',
                catalogId: 'urn:a2ui:catalog:surface_dynamic_id',
              },
            },
          ],
        },
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(onCatalogResolved).toHaveBeenCalledWith('urn:a2ui:catalog:surface_dynamic_id');
  });

  it('triggers onCatalogResolved callback when GET_CATALOG resolves the catalogId', async () => {
    const mockCatalog = {catalogId: 'urn:a2ui:catalog:get_catalog_id', items: ['MyComponent']};
    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};
    const onCatalogResolved = vi.fn();

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      catalogJson: mockCatalog,
      onCatalogResolved,
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(onCatalogResolved).toHaveBeenCalledWith('urn:a2ui:catalog:get_catalog_id');
  });

  it('strictly halts and transmits A2UI_CATALOG error envelope if in-memory catalog processing throws', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.fetch = vi.fn();

    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      catalogJson: '{ invalid json ',
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {
          error: {message: expect.any(String)},
        },
      },
      '*',
    );
  });

  it('falls back to standard HTTP network fetch if catalog is undefined in configuration', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const mockCatalog = {items: ['HTTPComponent']};
    window.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mockCatalog),
    });

    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      catalogJson: undefined,
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenCalledWith('catalog', expect.any(Object));
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('falls back to /catalog.json if /catalog returns HTML with case-insensitive uppercase tags', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const mockCatalog = {items: ['CaseInsensitiveComponent']};

    window.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '<!DOCTYPE HTML><html>SPA Fallback</html>',
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockCatalog),
      });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenNthCalledWith(1, 'catalog', expect.any(Object));
    expect(window.fetch).toHaveBeenNthCalledWith(2, 'catalog.json', expect.any(Object));
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('serves registered legacy catalog from configuration setup in-memory, bypassing fetch', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.fetch = vi.fn();

    const mockCatalog = {items: ['LegacyComponent']};
    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      catalog: mockCatalog,
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: mockCatalog,
      },
      '*',
    );
  });

  it('intercepts fetch abort error cleanly and posts standard catalog error envelope', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.fetch = vi
      .fn()
      .mockRejectedValue(new DOMException('The user aborted a request.', 'AbortError'));

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {
          error: {message: expect.stringContaining('The user aborted a request.')},
        },
      },
      '*',
    );
  });

  it('aborts fetch signal and handles timeout cleanly after 3000ms using fake timers', async () => {
    vi.useFakeTimers();
    vi.spyOn(window.parent, 'postMessage');

    let abortSignal: AbortSignal | undefined;
    window.fetch = vi.fn().mockImplementation((url, options) => {
      abortSignal = options?.signal;
      return new Promise(() => {}); // Never resolves
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: PreviewBridgeMessageType.GET_CATALOG},
      }),
    );

    // Let event microtasks run to trigger handleGetCatalog
    await vi.advanceTimersByTimeAsync(0);

    expect(window.fetch).toHaveBeenCalled();
    expect(abortSignal).toBeDefined();
    expect(abortSignal?.aborted).toBe(false);

    // Advance by 2999ms (just before 3 seconds)
    await vi.advanceTimersByTimeAsync(2999);
    expect(abortSignal?.aborted).toBe(false);

    // Advance past the 3000ms timeout
    await vi.advanceTimersByTimeAsync(1);
    expect(abortSignal?.aborted).toBe(true);

    // Clean up fake timers
    vi.useRealTimers();
  });

  it('ignores sendMessage when window.parent is null or equal to window in non-test env', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const spy = vi.spyOn(window.parent, 'postMessage');
    spy.mockClear();
    bridge.sendMessage({type: PreviewBridgeMessageType.A2UI_CATALOG});
    expect(spy).not.toHaveBeenCalled();
    process.env.NODE_ENV = originalEnv;
  });

  it('ignores malformed incoming message payloads without throwing', () => {
    const mockGroup = {
      onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
    };
    const processor = {processMessages: vi.fn()};

    const conn = bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    expect(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: null,
        }),
      );

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: 'malformed string data',
        }),
      );
    }).not.toThrow();

    expect(processor.processMessages).not.toHaveBeenCalled();
    conn.unsubscribe();
  });

  it('catches and logs errors thrown by the attached dynamic renderer during RENDER_A2UI dispatching', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockGroup = {
      onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
    };

    const throwingProcessor = {
      processMessages: vi.fn().mockImplementation(() => {
        throw new Error('Dynamic renderer compilation error');
      }),
    };

    const conn = bridge.attachRenderer(throwingProcessor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: [
            {
              version: 'v0.9',
              updateComponents: {surfaceId: 'surf-1', components: []},
            },
          ],
        },
      }),
    );

    expect(throwingProcessor.processMessages).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      'PreviewBridge: Error during direct RENDER_A2UI payload dispatch:',
      expect.any(Error),
    );

    conn.unsubscribe();
  });

  describe('sendAction and connectSurfaceGroup APIs', () => {
    it('packages and transmits custom actions upward via sendAction', () => {
      const spy = vi.spyOn(window.parent, 'postMessage');
      bridge.sendAction({click: 'button'}, 'v0.9');
      expect(spy).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.SEND_TO_SERVER,
          payload: {version: 'v0.9', action: {click: 'button'}},
        },
        '*',
      );
    });

    it('encapsulates surface creation and data model change routing correctly', () => {
      const parentSpy = vi.spyOn(window.parent, 'postMessage');
      let surfaceCallback: (surface: SurfaceInstance) => void = () => {};
      const surfaceGroupMock: SurfaceGroupLike = {
        onSurfaceCreated: {
          subscribe: vi.fn().mockImplementation(cb => {
            surfaceCallback = cb;
            return {unsubscribe: vi.fn()};
          }),
        },
      };

      bridge['connectSurfaceGroup'](surfaceGroupMock);
      expect(surfaceGroupMock.onSurfaceCreated.subscribe).toHaveBeenCalled();

      let modelCallback: (val: unknown) => void = () => {};
      const surfaceMock: SurfaceInstance = {
        id: 'surf-1',
        dataModel: {
          subscribe: vi.fn().mockImplementation((path, cb) => {
            modelCallback = cb;
            return {unsubscribe: vi.fn()};
          }),
        },
      };

      surfaceCallback(surfaceMock);

      expect(surfaceMock.dataModel.subscribe).toHaveBeenCalledWith('', expect.any(Function));

      modelCallback('new-model-value');

      expect(parentSpy).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
          payload: {
            updateDataModel: {
              surfaceId: 'surf-1',
              value: 'new-model-value',
            },
          },
        },
        '*',
      );
    });

    it('unsubscribes group subscription and all surface subscriptions completely on disconnect', () => {
      const groupUnsubscribe = vi.fn();
      const surfaceUnsubscribe = vi.fn();

      let surfaceCallback: (surface: SurfaceInstance) => void = () => {};
      const surfaceGroupMock: SurfaceGroupLike = {
        onSurfaceCreated: {
          subscribe: vi.fn().mockImplementation(cb => {
            surfaceCallback = cb;
            return {unsubscribe: groupUnsubscribe};
          }),
        },
      };

      const connection = bridge['connectSurfaceGroup'](surfaceGroupMock);

      const surfaceMock: SurfaceInstance = {
        id: 'surf-1',
        dataModel: {
          subscribe: vi.fn().mockImplementation(() => {
            return {unsubscribe: surfaceUnsubscribe};
          }),
        },
      };

      surfaceCallback(surfaceMock);

      connection.unsubscribe();

      expect(groupUnsubscribe).toHaveBeenCalledTimes(1);
      expect(surfaceUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('unsubscribes older listeners when a surface with the same ID is re-registered', () => {
      const firstSurfaceUnsubscribe = vi.fn();
      const secondSurfaceUnsubscribe = vi.fn();

      let surfaceCallback: (surface: SurfaceInstance) => void = () => {};
      const surfaceGroupMock: SurfaceGroupLike = {
        onSurfaceCreated: {
          subscribe: vi.fn().mockImplementation(cb => {
            surfaceCallback = cb;
            return {unsubscribe: vi.fn()};
          }),
        },
      };

      bridge['connectSurfaceGroup'](surfaceGroupMock);

      const surfaceMock1: SurfaceInstance = {
        id: 'surf-duplicate',
        dataModel: {
          subscribe: vi.fn().mockImplementation(() => {
            return {unsubscribe: firstSurfaceUnsubscribe};
          }),
        },
      };

      const surfaceMock2: SurfaceInstance = {
        id: 'surf-duplicate',
        dataModel: {
          subscribe: vi.fn().mockImplementation(() => {
            return {unsubscribe: secondSurfaceUnsubscribe};
          }),
        },
      };

      surfaceCallback(surfaceMock1);
      surfaceCallback(surfaceMock2);

      expect(firstSurfaceUnsubscribe).toHaveBeenCalledTimes(1);
      expect(secondSurfaceUnsubscribe).not.toHaveBeenCalled();
    });

    it('handles defensive inputs and mock objects safely without throwing', () => {
      let surfaceCallback: (surface: SurfaceInstance) => void = () => {};
      const surfaceGroupMock: SurfaceGroupLike = {
        onSurfaceCreated: {
          subscribe: vi.fn().mockImplementation(cb => {
            surfaceCallback = cb;
            return {unsubscribe: vi.fn()};
          }),
        },
      };

      bridge['connectSurfaceGroup'](surfaceGroupMock);

      expect(() => {
        surfaceCallback(null as unknown as SurfaceInstance);
        surfaceCallback({} as unknown as SurfaceInstance);
        surfaceCallback({id: 'only-id'} as unknown as SurfaceInstance);
      }).not.toThrow();
    });
  });

  describe('Memory-safety and timeout cleanups on destroy', () => {
    it('clears deferred render layout timeout cleanly upon destroy()', () => {
      vi.useFakeTimers();

      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processSpy = vi.fn();
      bridge.attachRenderer(
        {processMessages: processSpy},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      // Pre-track an old active surface ID to verify reset dispatch dispatches
      bridge['activeRenderer']?.activeSurfaceIds.add('old-surface');

      // Dispatch layout setup message (which schedules deferred rendering)
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [
              {
                version: 'v0.9',
                createSurface: {surfaceId: 'surf-1'},
              },
            ],
          },
        }),
      );

      // Verify that the synchronous unmount reset (deleteSurface) was dispatched instantly
      expect(processSpy).toHaveBeenCalledWith([
        {
          version: 'v0.9',
          deleteSurface: {surfaceId: 'old-surface'},
        } as A2uiMessage,
      ]);

      // Clear/Destroy bridge (which cancels the deferred render timeout)
      bridge.destroy();

      vi.runAllTimers();

      // The deferred render payload MUST NOT be processed since the timeout was cleanly canceled!
      expect(processSpy).toHaveBeenCalledTimes(1); // Only the initial deleteSurface reset
      vi.useRealTimers();
    });

    it('unsubscribes and evicts all active surface group connections registered in the bridge when bridge.destroy() is called', () => {
      const groupUnsubscribe = vi.fn();
      const surfaceGroupMock: SurfaceGroupLike = {
        onSurfaceCreated: {
          subscribe: vi.fn().mockImplementation(() => {
            return {unsubscribe: groupUnsubscribe};
          }),
        },
      };

      bridge['connectSurfaceGroup'](surfaceGroupMock);
      bridge.destroy();

      expect(groupUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('Two-Step Dispatch and Lifecycle Routing', () => {
    it('intercepts RENDER_A2UI messages and performs a two-step dispatch when createSurface is present', async () => {
      vi.useFakeTimers();

      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processMessagesSpy = vi.fn();
      const onSurfaceClearedSpy = vi.fn();

      const conn = bridge.attachRenderer(
        {processMessages: processMessagesSpy},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
          onSurfaceCleared: onSurfaceClearedSpy,
        },
      );

      // Pre-track an old active surface
      bridge['activeRenderer']?.activeSurfaceIds.add('old-surface');

      const payload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 'sample-surface', catalogId: 'basic-catalog'},
        },
      ];

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {type: PreviewBridgeMessageType.RENDER_A2UI, payload},
        }),
      );

      // Step 1: Immediate dispatch of null to trigger unmounting/reset of old-surface
      expect(processMessagesSpy).toHaveBeenCalledTimes(1);
      expect(processMessagesSpy).toHaveBeenNthCalledWith(1, [
        {
          version: 'v0.9',
          deleteSurface: {surfaceId: 'old-surface'},
        } as A2uiMessage,
      ]);
      expect(onSurfaceClearedSpy).toHaveBeenCalledTimes(1);

      // Step 2: Advance timer tick to trigger deferred render payload
      vi.advanceTimersByTime(0);

      expect(processMessagesSpy).toHaveBeenCalledTimes(2);
      expect(processMessagesSpy).toHaveBeenNthCalledWith(2, payload as A2uiMessage[]);

      conn.unsubscribe();
      vi.useRealTimers();
    });

    it('intercepts RENDER_A2UI messages and dispatches immediately without reset if createSurface is absent', () => {
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processMessagesSpy = vi.fn();

      const conn = bridge.attachRenderer(
        {processMessages: processMessagesSpy},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      const payload = [
        {
          version: 'v0.9',
          updateComponents: {surfaceId: 'sample-surface', components: []},
        },
      ];

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {type: PreviewBridgeMessageType.RENDER_A2UI, payload},
        }),
      );

      // Standard updates bypass the two-step dispatch to prevent visual flicker
      expect(processMessagesSpy).toHaveBeenCalledTimes(1);
      expect(processMessagesSpy).toHaveBeenCalledWith(payload);

      conn.unsubscribe();
    });
  });

  describe('Coverage Edge Cases & Telemetry Guardrails', () => {
    it('logs error and returns empty subscription handle when attachRenderer is called without a surfaceGroup', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processor = {processMessages: vi.fn()};

      const conn = bridge.attachRenderer(processor, {
        onSurfaceReady: vi.fn(),
      } as unknown as RendererConfig);

      expect(errorSpy).toHaveBeenCalledWith(
        'PreviewBridge: surfaceGroup parameter is required in RendererConfig.',
      );
      expect(conn).toBeDefined();
      expect(conn.unsubscribe).toBeTypeOf('function');
      conn.unsubscribe();
    });

    it('handles incoming DATA_MODEL_CHANGE messages and updates active rendering layout with standard data model updates', () => {
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processSpy = vi.fn();

      const conn = bridge.attachRenderer({processMessages: processSpy}, {
        surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
        onSurfaceReady: vi.fn(),
      } as unknown as RendererConfig);

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
            payload: {updateDataModel: {surfaceId: 'surf-1', value: 'dynamic-change'}},
          },
        }),
      );

      expect(processSpy).toHaveBeenCalledWith([
        {
          version: 'v0.9',
          updateDataModel: {surfaceId: 'surf-1', value: 'dynamic-change'},
        },
      ]);
      conn.unsubscribe();
    });

    it('logs warning when an unrecognized incoming message type is received', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: 'UNRECOGNIZED_TEST_MESSAGE_TYPE',
            payload: {},
          },
        }),
      );

      expect(warnSpy).toHaveBeenCalledWith(
        'PreviewBridge: Unrecognized incoming message type: UNRECOGNIZED_TEST_MESSAGE_TYPE',
      );
    });

    it('logs error when active renderer clear throws during RENDER_A2UI reset dispatching', () => {
      vi.useFakeTimers();
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };

      const throwingClearedMock = vi.fn().mockImplementation(() => {
        throw new Error('Callback failed');
      });

      const conn = bridge.attachRenderer(
        {processMessages: vi.fn()},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
          onSurfaceCleared: throwingClearedMock,
        },
      );

      // Track a surface to trigger the reset
      bridge['activeRenderer']?.activeSurfaceIds.add('surf-trigger');

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [
              {
                version: 'v0.9',
                createSurface: {surfaceId: 'new-surf'},
              },
            ],
          },
        }),
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'PreviewBridge: Error during RENDER_A2UI null reset dispatch:',
        expect.any(Error),
      );

      vi.runAllTimers();
      conn.unsubscribe();
      vi.useRealTimers();
    });

    it('cancels pending deferred rendering timeout when a subsequent layout message arrives rapidly', () => {
      vi.useFakeTimers();
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processSpy = vi.fn();

      const conn = bridge.attachRenderer(
        {processMessages: processSpy},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      // Dispatch 1st message triggering deferred mount
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [{version: 'v0.9', createSurface: {surfaceId: 'surf-1'}}],
          },
        }),
      );

      const firstTimerId = bridge['renderTimeoutId'];
      expect(firstTimerId).toBeDefined();

      // Dispatch 2nd message rapidly
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [{version: 'v0.9', createSurface: {surfaceId: 'surf-2'}}],
          },
        }),
      );

      const secondTimerId = bridge['renderTimeoutId'];
      expect(secondTimerId).toBeDefined();
      expect(firstTimerId).not.toBe(secondTimerId);

      vi.runAllTimers();

      // Ensure second payload is processed after clearing first
      expect(processSpy).toHaveBeenLastCalledWith([
        {version: 'v0.9', createSurface: {surfaceId: 'surf-2'}},
      ]);
      expect(processSpy).toHaveBeenCalledTimes(1);

      conn.unsubscribe();
      vi.useRealTimers();
    });

    it('logs error when deferred RENDER_A2UI layout processing throws in macro-task timer', () => {
      vi.useFakeTimers();
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };

      const throwingProcessor = {
        processMessages: vi.fn().mockImplementation(() => {
          throw new Error('Failed to render deferred payload');
        }),
      };

      const conn = bridge.attachRenderer(throwingProcessor, {
        surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
        onSurfaceReady: vi.fn(),
      });

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [{version: 'v0.9', createSurface: {surfaceId: 'surf-throw'}}],
          },
        }),
      );

      vi.runAllTimers();

      expect(errorSpy).toHaveBeenCalledWith(
        'PreviewBridge: Error during deferred RENDER_A2UI payload dispatch:',
        expect.any(Error),
      );

      conn.unsubscribe();
      vi.useRealTimers();
    });

    it('logs warning when createSurface command is processed without surfaceId', () => {
      vi.useFakeTimers();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };

      const conn = bridge.attachRenderer(
        {processMessages: vi.fn()},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [{version: 'v0.9', createSurface: {}}],
          },
        }),
      );

      vi.runAllTimers();

      expect(warnSpy).toHaveBeenCalledWith(
        'PreviewBridge: createSurface command found, but no surfaceId present.',
      );
      conn.unsubscribe();
      vi.useRealTimers();
    });

    it('logs warning when unexpected non-array RENDER_A2UI layout payload is received', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };

      const conn = bridge.attachRenderer(
        {processMessages: vi.fn()},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: {notAnArray: true},
          },
        }),
      );

      expect(warnSpy).toHaveBeenCalledWith(
        'PreviewBridge: Unexpected non-array RENDER_A2UI payload received:',
        expect.objectContaining({notAnArray: true}),
      );
      conn.unsubscribe();
    });

    it('logs warning when dynamic surface clearing fails during active renderer reset', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };

      const throwingProcessor = {
        processMessages: vi.fn().mockImplementation(payload => {
          if (Array.isArray(payload) && payload.some(p => 'deleteSurface' in p)) {
            throw new Error('Failed to delete surface');
          }
        }),
      };

      const conn = bridge.attachRenderer(throwingProcessor, {
        surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
        onSurfaceReady: vi.fn(),
        onSurfaceCleared: vi.fn(),
      });

      // Track an active surface
      bridge['activeRenderer']?.activeSurfaceIds.add('surf-to-clear');

      // Trigger reset by sending null payload
      bridge['handleRenderA2ui'](null);

      expect(warnSpy).toHaveBeenCalledWith(
        'PreviewBridge: Error clearing surface surf-to-clear during reset:',
        expect.any(Error),
      );
      conn.unsubscribe();
    });

    it('logs error when data model subscription fails for a dynamically registered surface', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let surfaceCallback: (surface: SurfaceInstance) => void = () => {};
      const surfaceGroupMock: SurfaceGroupLike = {
        onSurfaceCreated: {
          subscribe: vi.fn().mockImplementation(cb => {
            surfaceCallback = cb;
            return {unsubscribe: vi.fn()};
          }),
        },
      };

      bridge['connectSurfaceGroup'](surfaceGroupMock);

      const brokenSurfaceMock: SurfaceInstance = {
        id: 'surf-broken',
        dataModel: {
          subscribe: vi.fn().mockImplementation(() => {
            throw new Error('Subscription crashed');
          }),
        },
      };

      surfaceCallback(brokenSurfaceMock);

      expect(errorSpy).toHaveBeenCalledWith(
        'Error subscribing to data model for surface surf-broken:',
        expect.any(Error),
      );
    });

    it('updates blocking overlay message text dynamically upon receiving subsequent SET_BLOCKING_STATE messages', () => {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
            payload: {blocked: true, message: 'Message One'},
          },
        }),
      );

      const overlay = document.getElementById('a2ui-blocking-overlay');
      expect(overlay).not.toBeNull();
      expect(document.getElementById('a2ui-blocking-message')?.innerText).toBe('Message One');

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
            payload: {blocked: true, message: 'Message Two'},
          },
        }),
      );

      expect(document.getElementById('a2ui-blocking-message')?.innerText).toBe('Message Two');

      // Update blocking state again with omitted/falsy message to test default fallback path on update (line 551 branch)
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
            payload: {blocked: true}, // message omitted!
          },
        }),
      );

      expect(document.getElementById('a2ui-blocking-message')?.innerText).toBe(
        'Processing framework layouts...',
      );
    });

    it('transmits A2UI_CATALOG error payload when catalog fetch returns HTML and subsequent fallback also fails', async () => {
      const spy = vi.spyOn(window.parent, 'postMessage');

      window.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          text: async () => '<!doctype html><html>SPA Fallback</html>',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {type: PreviewBridgeMessageType.GET_CATALOG},
        }),
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(window.fetch).toHaveBeenNthCalledWith(1, 'catalog', expect.any(Object));
      expect(window.fetch).toHaveBeenNthCalledWith(2, 'catalog.json', expect.any(Object));
      expect(spy).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.A2UI_CATALOG,
          payload: {
            error: {
              message:
                'Catalog fetch returned HTML and fallback to catalog.json failed with status: 404',
            },
          },
        },
        '*',
      );
    });

    it('logs warning when a postMessage is received but no active renderer is attached', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [{version: 'v0.9', createSurface: {surfaceId: 'surf-1'}}],
          },
        }),
      );

      expect(warnSpy).toHaveBeenCalledWith(
        'PreviewBridge: Received RENDER_A2UI but no active renderer is attached. Ignoring payload.',
      );
    });

    it('handles overlay updates gracefully if the message node is missing in the DOM', () => {
      // 1. Show the overlay
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
            payload: {blocked: true, message: 'Initial Message'},
          },
        }),
      );

      const messageNode = document.getElementById('a2ui-blocking-message');
      expect(messageNode).not.toBeNull();

      // 2. Manually destroy/remove the message node to simulate outer DOM corruption/edge-case
      messageNode?.remove();

      // 3. Trigger another blocking state update (should not throw despite missing text container)
      expect(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            source: window,
            data: {
              type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
              payload: {blocked: true, message: 'Updated Message'},
            },
          }),
        );
      }).not.toThrow();

      // Message node was not updated (since it's gone), overlay remains connected
      expect(document.getElementById('a2ui-blocking-message')).toBeNull();
      expect(document.getElementById('a2ui-blocking-overlay')).not.toBeNull();
    });

    it('strips JSON vulnerability safety prefix successfully when present in the raw catalog text payload', async () => {
      const spy = vi.spyOn(window.parent, 'postMessage');
      const mockCatalog = {items: ['BasicColumn']};
      const rawTextWithPrefix = ")]}'\n" + JSON.stringify(mockCatalog);

      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => rawTextWithPrefix,
      });

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {type: PreviewBridgeMessageType.GET_CATALOG},
        }),
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(window.fetch).toHaveBeenCalledWith('catalog', expect.any(Object));
      expect(spy).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.A2UI_CATALOG,
          payload: mockCatalog,
        },
        '*',
      );
    });

    it('handles generic non-Error exception types thrown during catalog fetching processes', async () => {
      const spy = vi.spyOn(window.parent, 'postMessage');

      // We throw a plain string instead of an Error object
      window.fetch = vi.fn().mockImplementation(() => {
        throw 'Network target unreachable (generic)';
      });

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {type: PreviewBridgeMessageType.GET_CATALOG},
        }),
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(spy).toHaveBeenCalledWith(
        {
          type: PreviewBridgeMessageType.A2UI_CATALOG,
          payload: {
            error: {message: 'Network target unreachable (generic)'},
          },
        },
        '*',
      );
    });

    it('handles deferred layout execution gracefully if the active renderer is detached prior to macro-task execution', () => {
      vi.useFakeTimers();
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processSpy = vi.fn();

      const conn = bridge.attachRenderer(
        {processMessages: processSpy},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      // 1. Dispatch layout (schedules macro-task)
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            payload: [{version: 'v0.9', createSurface: {surfaceId: 'surf-deferred'}}],
          },
        }),
      );

      // 2. Synchronously unsubscribe (detaches activeRenderer)
      conn.unsubscribe();
      expect(bridge['activeRenderer']).toBeNull();

      // 3. Advance timers so macro-task fires
      expect(() => {
        vi.runAllTimers();
      }).not.toThrow();

      // processMessages should NOT have been called with the mount payload since there was no active renderer!
      expect(processSpy).not.toHaveBeenCalledWith([
        {version: 'v0.9', createSurface: {surfaceId: 'surf-deferred'}},
      ]);

      vi.useRealTimers();
    });

    it('skips active renderer reset early-returning if no renderer is attached', () => {
      expect(bridge['activeRenderer']).toBeNull();

      expect(() => {
        bridge['resetActiveRendererState']();
      }).not.toThrow();
    });

    it('logs warning and falls back to entire message payload when RENDER_A2UI data payload field is omitted', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };

      const conn = bridge.attachRenderer(
        {processMessages: vi.fn()},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      // Dispatch RENDER_A2UI but omitting the payload field
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.RENDER_A2UI,
            // payload: is missing!
          },
        }),
      );

      expect(warnSpy).toHaveBeenCalledWith(
        'PreviewBridge: Unexpected non-array RENDER_A2UI payload received:',
        expect.objectContaining({type: PreviewBridgeMessageType.RENDER_A2UI}),
      );
      conn.unsubscribe();
    });

    it('ignores DATA_MODEL_CHANGE messages when the payload is missing or updateDataModel field is absent', () => {
      const mockGroup = {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      };
      const processSpy = vi.fn();

      const conn = bridge.attachRenderer(
        {processMessages: processSpy},
        {
          surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
          onSurfaceReady: vi.fn(),
        },
      );

      // 1. Send DATA_MODEL_CHANGE but with undefined payload
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
            // payload is undefined
          },
        }),
      );

      // 2. Send DATA_MODEL_CHANGE but with empty payload object (missing updateDataModel)
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          data: {
            type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
            payload: {},
          },
        }),
      );

      expect(processSpy).not.toHaveBeenCalled();
      conn.unsubscribe();
    });

    it('ignores blocking overlay updates gracefully if the global document object is undefined', () => {
      // Stub global document to undefined
      vi.stubGlobal('document', undefined);

      expect(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            source: window,
            data: {
              type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
              payload: {blocked: true},
            },
          }),
        );
      }).not.toThrow();

      vi.unstubAllGlobals();
    });
  });

  it('resets overlayElement pointer reference to null upon unblocking even if DOM node is already detached independently', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'SET_BLOCKING_STATE', payload: {blocked: true}},
      }),
    );

    const overlay = document.getElementById('a2ui-blocking-overlay');
    expect(overlay).not.toBeNull();
    expect(bridge['overlayElement']).not.toBeNull();

    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }

    expect(document.getElementById('a2ui-blocking-overlay')).toBeNull();
    expect(bridge['overlayElement']).not.toBeNull();

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'SET_BLOCKING_STATE', payload: {blocked: false}},
      }),
    );

    expect(bridge['overlayElement']).toBeNull();
  });

  it('logs error and returns empty handle when attachRenderer is called with null config', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processor = {processMessages: vi.fn()};

    const handle = bridge.attachRenderer(processor, null as unknown as RendererConfig);

    expect(errorSpy).toHaveBeenCalledWith(
      'PreviewBridge: config parameter is required in RendererConfig.',
    );
    expect(handle).toBeDefined();
    expect(() => handle.unsubscribe()).not.toThrow();
  });

  it('logs error when connection.unsubscribe() throws during bridge.destroy()', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const processor = {processMessages: vi.fn()};

    const throwingGroup = {
      onSurfaceCreated: {
        subscribe: () => ({
          unsubscribe: () => {
            throw new Error('Unsubscribe failed');
          },
        }),
      },
    };

    bridge.attachRenderer(processor, {
      surfaceGroup: throwingGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
    });

    bridge.destroy();

    expect(errorSpy).toHaveBeenCalledWith(
      'PreviewBridge: Error during connection unsubscribe:',
      expect.any(Error),
    );
  });

  it('returns empty subscription handle when connectSurfaceGroup is called on a group missing onSurfaceCreated', () => {
    const handle = bridge['connectSurfaceGroup']({} as SurfaceGroupLike);
    expect(handle).toBeDefined();
    expect(() => handle.unsubscribe()).not.toThrow();
  });

  it('logs error when onCatalogResolved callback throws an unexpected exception', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockGroup = {onSurfaceCreated: {subscribe: vi.fn()}};
    const processor = {processMessages: vi.fn()};

    bridge.attachRenderer(processor, {
      surfaceGroup: mockGroup as unknown as SurfaceGroupLike,
      onSurfaceReady: vi.fn(),
      onCatalogResolved: () => {
        throw new Error('Catalog callback crashed');
      },
    });

    bridge['notifyCatalogResolved']('urn:a2ui:catalog:test');

    expect(errorSpy).toHaveBeenCalledWith(
      'PreviewBridge: Error inside onCatalogResolved callback:',
      expect.any(Error),
    );
  });
});
