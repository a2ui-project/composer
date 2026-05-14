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

import {describe, it, expect, beforeEach, beforeAll, afterAll, afterEach, vi} from 'vitest';

// Use dynamic import inside beforeAll to ensure that the module-level singleton's
// event listener registration (run on import) is captured by our window spy.
let PreviewBridgeClass: any;

describe('PreviewBridge Core API Runtime', () => {
  let bridge: any;
  const listeners: {type: string; handler: any}[] = [];
  const originalAdd = window.addEventListener.bind(window);
  const originalRemove = window.removeEventListener.bind(window);

  beforeAll(async () => {
    window.addEventListener = vi.fn().mockImplementation((type, handler, options) => {
      listeners.push({type, handler});
      originalAdd(type, handler, options);
    }) as any;

    const module = await import('./preview-bridge');
    PreviewBridgeClass = module.PreviewBridge;
  });

  afterAll(() => {
    window.addEventListener = originalAdd;
  });

  beforeEach(() => {
    bridge = new PreviewBridgeClass();
    const existing = document.getElementById('a2ui-blocking-overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  });

  afterEach(() => {
    listeners.forEach(({type, handler}) => {
      originalRemove(type, handler);
    });
    listeners.length = 0;

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

  it('intercepts fetch calls targeting catalog paths and correlates async resolution using secure IDs', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const fetchPromise = fetch('/catalog');

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({type: 'FETCH_CATALOG_REQUEST'}), '*');

    const lastCall = spy.mock.lastCall as any[];
    const requestId = lastCall[0].payload.requestId;

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {
          type: 'FETCH_CATALOG_RESPONSE',
          payload: {requestId, catalog: {items: ['BasicColumn']}},
        },
      }),
    );

    const response = await fetchPromise;
    const data = await response.json();
    expect(data).toEqual({items: ['BasicColumn']});
  });

  it('rejects intercepted fetch promise if response times out after interval bounds', async () => {
    vi.useFakeTimers();
    const fetchPromise = fetch('/catalog');

    vi.advanceTimersByTime(5001);
    await expect(fetchPromise).rejects.toThrow(/Catalog fetch interception timeout/);
    vi.useRealTimers();
  });

  it('rejects intercepted fetch promise if payload resolves explicit error properties', async () => {
    const spy = vi.spyOn(window.parent, 'postMessage');
    const fetchPromise = fetch('/catalog');

    const lastCall = spy.mock.lastCall as any[];
    const requestId = lastCall[0].payload.requestId;

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: {
          type: 'FETCH_CATALOG_RESPONSE',
          payload: {requestId, error: {message: 'Catalog Resolution Failed'}},
        },
      }),
    );

    await expect(fetchPromise).rejects.toThrow('Catalog Resolution Failed');
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

  it('emits UNBLOCK_REQUEST signal upward to parent window when clicking Force Unblock button', () => {
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

    expect(spy).toHaveBeenCalledWith({type: 'UNBLOCK_REQUEST'}, '*');
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
