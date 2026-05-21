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
  PreviewBridgeMessageType,
} from './preview-bridge';

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
  });

  it('registers message processors and routes payload types perfectly', () => {
    const handler = vi.fn();
    bridge['registerMessageProcessor']('TEST_EVENT', handler);

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'TEST_EVENT', payload: {status: 'active'}},
      }),
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({status: 'active'});
  });

  it('prevents duplicate message handlers from triggering multiple times naturally', () => {
    const handler = vi.fn();
    bridge['registerMessageProcessor']('TEST_EVENT', handler);
    bridge['registerMessageProcessor']('TEST_EVENT', handler);

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'TEST_EVENT', payload: 123},
      }),
    );

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emits RENDERER_READY signal automatically upon DOM readiness', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 10));
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

    expect(window.fetch).toHaveBeenCalledWith('/catalog');
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {catalog: mockCatalog},
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

    expect(window.fetch).toHaveBeenNthCalledWith(1, '/catalog');
    expect(window.fetch).toHaveBeenNthCalledWith(2, '/catalog.json');
    expect(spy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.A2UI_CATALOG,
        payload: {catalog: mockCatalog},
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
          catalog: {},
          error: {message: 'Catalog fetch failed with status: 500'},
        },
      },
      '*',
    );
  });

  it('unregisters message processor successfully', () => {
    const handler = vi.fn();
    bridge['registerMessageProcessor']('TEST_EVENT', handler);
    bridge['unregisterMessageProcessor']('TEST_EVENT', handler);

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'TEST_EVENT', payload: {status: 'active'}},
      }),
    );

    expect(handler).not.toHaveBeenCalled();
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
    const handler = vi.fn();
    bridge['registerMessageProcessor']('TEST_EVENT', handler);

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

    expect(handler).not.toHaveBeenCalled();
  });

  it('catches and logs errors thrown by message processor handlers', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const throwingHandler = vi.fn().mockImplementation(() => {
      throw new Error('Handler failed');
    });
    bridge['registerMessageProcessor']('THROWING_EVENT', throwingHandler);

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'THROWING_EVENT', payload: {}},
      }),
    );

    expect(throwingHandler).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error executing message processor for type THROWING_EVENT:',
      expect.any(Error),
    );
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

    it('should completely unsubscribe group subscription and all surface subscriptions on disconnect', () => {
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

    it('should unsubscribe older listeners when a surface with the same ID is re-registered', () => {
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
    it('DOMContentLoaded handshake timeout is cleanly cleared upon destroy()', () => {
      vi.useFakeTimers();
      const spy = vi.spyOn(window.parent, 'postMessage');

      const tempBridge = new PreviewBridge();
      tempBridge.destroy();

      vi.runAllTimers();
      expect(spy).not.toHaveBeenCalledWith(
        expect.objectContaining({type: PreviewBridgeMessageType.RENDERER_READY}),
        '*',
      );
      vi.useRealTimers();
    });

    it('All active surface group connections registered in the bridge are cleanly unsubscribed and evicted when bridge.destroy() is called', () => {
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
      const handler = vi.fn();
      bridge['registerMessageProcessor'](PreviewBridgeMessageType.RENDER_A2UI, handler);

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

      // Step 1: Immediate dispatch of null to trigger unmounting/reset
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenNthCalledWith(1, null);

      // Step 2: Advance timer tick to trigger deferred render payload
      vi.advanceTimersByTime(0);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(2, payload);

      vi.useRealTimers();
    });

    it('intercepts RENDER_A2UI messages and dispatches immediately without reset if createSurface is absent', () => {
      const handler = vi.fn();
      bridge['registerMessageProcessor'](PreviewBridgeMessageType.RENDER_A2UI, handler);

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
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(payload);
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
});
