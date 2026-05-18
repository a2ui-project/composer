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
import {PreviewBridge, a2uiBridge} from './preview-bridge';

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
  });

  it('registers message processors and routes payload types perfectly', () => {
    const handler = vi.fn();
    bridge.registerMessageProcessor('TEST_EVENT', handler);

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
    bridge.registerMessageProcessor('TEST_EVENT', handler);
    bridge.registerMessageProcessor('TEST_EVENT', handler);

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
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({type: 'RENDERER_READY'}), '*');
  });

  it('mounts full-viewport overlay DOM element dynamically upon SET_BLOCKING_STATE true', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'SET_BLOCKING_STATE', payload: {blocked: true, message: 'Freezing UI'}},
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
        data: {type: 'SET_BLOCKING_STATE', payload: {blocked: false}},
      }),
    );
    expect(document.getElementById('a2ui-blocking-overlay')).toBeNull();
  });

  it('emits FORCE_UNBLOCK signal upward to parent window when clicking Force Unblock button', () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {type: 'SET_BLOCKING_STATE', payload: {blocked: true}},
      }),
    );

    const button = document.querySelector('#a2ui-blocking-overlay button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    button.click();

    expect(spy).toHaveBeenCalledWith({type: 'FORCE_UNBLOCK', payload: {}}, '*');
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
        data: {type: 'GET_CATALOG'},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenCalledWith('/catalog');
    expect(spy).toHaveBeenCalledWith(
      {
        type: 'A2UI_CATALOG',
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
        data: {type: 'GET_CATALOG'},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(window.fetch).toHaveBeenNthCalledWith(1, '/catalog');
    expect(window.fetch).toHaveBeenNthCalledWith(2, '/catalog.json');
    expect(spy).toHaveBeenCalledWith(
      {
        type: 'A2UI_CATALOG',
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
        data: {type: 'GET_CATALOG'},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(spy).toHaveBeenCalledWith(
      {
        type: 'A2UI_CATALOG',
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
    bridge.registerMessageProcessor('TEST_EVENT', handler);
    bridge.unregisterMessageProcessor('TEST_EVENT', handler);

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
    bridge.sendMessage({type: 'IGNORED'});
    expect(spy).not.toHaveBeenCalled();
    process.env.NODE_ENV = originalEnv;
  });

  it('ignores malformed incoming message payloads without throwing', () => {
    const handler = vi.fn();
    bridge.registerMessageProcessor('TEST_EVENT', handler);

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
    bridge.registerMessageProcessor('THROWING_EVENT', throwingHandler);

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
