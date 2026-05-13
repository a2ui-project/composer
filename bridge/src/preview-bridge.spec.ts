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

import {describe, it, expect, beforeEach, vi} from 'vitest';
import {PreviewBridge} from './preview-bridge';

describe('PreviewBridge Core API Runtime', () => {
  let bridge: PreviewBridge;

  beforeEach(() => {
    bridge = new PreviewBridge();
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
});
