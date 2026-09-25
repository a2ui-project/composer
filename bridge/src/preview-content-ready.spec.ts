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

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PreviewBridge, a2uiBridge} from './preview-bridge';
import {PreviewBridgeMessageType} from './bridge-message';
import type {RendererConfig} from './render-config';

const createSurface = {
  version: 'v0.9',
  createSurface: {surfaceId: 'demo', catalogId: 'test'},
};
const rootComponent = {
  version: 'v0.9',
  updateComponents: {
    surfaceId: 'demo',
    components: [{id: 'root', component: 'Column', children: []}],
  },
};

function rendererConfig(whenSurfaceRendered?: () => Promise<void>): RendererConfig {
  return {
    surfaceGroup: {onSurfaceCreated: {subscribe: () => ({unsubscribe() {}})}},
    onSurfaceReady() {},
    whenSurfaceRendered,
  };
}

describe('preview content readiness', () => {
  let bridge: PreviewBridge;

  beforeEach(() => {
    vi.useFakeTimers();
    a2uiBridge.destroy();
    bridge = new PreviewBridge();
    Object.defineProperty(document.body, 'scrollHeight', {value: 300, configurable: true});
    Object.defineProperty(document.body, 'scrollWidth', {value: 400, configurable: true});
  });

  afterEach(() => {
    bridge.destroy();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('waits for the framework commit and forces readiness even when dimensions stay unchanged', async () => {
    const committed = Promise.withResolvers<void>();
    const whenSurfaceRendered = vi.fn(() => committed.promise);
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer({processMessages() {}}, rendererConfig(whenSurfaceRendered));
    expect(send).toHaveBeenLastCalledWith({
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 300, width: 400, contentReady: false},
    });

    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    await vi.runAllTimersAsync();
    expect(whenSurfaceRendered).toHaveBeenCalledOnce();
    expect(send).not.toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({contentReady: true}),
      }),
    );

    committed.resolve();
    await vi.runAllTimersAsync();
    expect(send).toHaveBeenLastCalledWith({
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 300, width: 400, contentReady: true},
    });

    bridge['handleRenderA2ui']([
      {version: 'v0.9', updateDataModel: {surfaceId: 'demo', value: {}}},
    ]);
    await vi.runAllTimersAsync();
    expect(whenSurfaceRendered).toHaveBeenCalledOnce();
  });

  it('waits for a root component when a surface arrives progressively', async () => {
    const whenSurfaceRendered = vi.fn(async () => {});
    bridge.attachRenderer({processMessages() {}}, rendererConfig(whenSurfaceRendered));
    bridge['handleRenderA2ui']([createSurface]);
    await vi.runAllTimersAsync();
    expect(whenSurfaceRendered).not.toHaveBeenCalled();

    bridge['handleRenderA2ui']([rootComponent]);
    await vi.runAllTimersAsync();
    expect(whenSurfaceRendered).toHaveBeenCalledOnce();
  });

  it.each(['clear', 'detach', 'destroy'] as const)(
    'ignores a pending render completion after %s',
    async operation => {
      const committed = Promise.withResolvers<void>();
      const connection = bridge.attachRenderer(
        {processMessages() {}},
        rendererConfig(() => committed.promise),
      );
      bridge['handleRenderA2ui']([createSurface, rootComponent]);
      const send = vi.spyOn(bridge, 'sendMessage');
      if (operation === 'clear') bridge['handleRenderA2ui'](null);
      if (operation === 'detach') connection.unsubscribe();
      if (operation === 'destroy') bridge.destroy();
      send.mockClear();
      committed.resolve();
      await vi.runAllTimersAsync();
      expect(send).not.toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({contentReady: true}),
        }),
      );
      if (operation === 'destroy') expect(send).not.toHaveBeenCalled();
    },
  );

  it('resets readiness and ignores completion from the previous surface', async () => {
    const first = Promise.withResolvers<void>();
    const second = Promise.withResolvers<void>();
    const whenSurfaceRendered = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer({processMessages() {}}, rendererConfig(whenSurfaceRendered));
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    bridge['handleRenderA2ui'](null);
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    send.mockClear();
    first.resolve();
    await vi.runAllTimersAsync();
    expect(send).not.toHaveBeenCalledWith(
      expect.objectContaining({payload: expect.objectContaining({contentReady: true})}),
    );
    second.resolve();
    await vi.runAllTimersAsync();
    expect(send).toHaveBeenLastCalledWith(
      expect.objectContaining({payload: expect.objectContaining({contentReady: true})}),
    );
  });

  it('publishes a false readiness reset even when dimensions are unchanged', async () => {
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer(
      {processMessages() {}},
      rendererConfig(async () => {}),
    );
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    await vi.runAllTimersAsync();
    send.mockClear();
    bridge['handleRenderA2ui'](null);
    await vi.runAllTimersAsync();
    expect(send).toHaveBeenLastCalledWith({
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 300, width: 400, contentReady: false},
    });
  });

  it('cancels a queued surface mount when a clear arrives before rendering', async () => {
    const processor = {processMessages: vi.fn()};
    const config = rendererConfig(async () => {});
    const ready = vi.spyOn(config, 'onSurfaceReady');
    bridge.attachRenderer(processor, config);
    bridge['dispatchRenderA2ui']([createSurface, rootComponent]);
    bridge['dispatchRenderA2ui'](null);
    await vi.runAllTimersAsync();
    expect(ready).not.toHaveBeenCalled();
  });

  it('reports a failed framework commit without claiming content is ready', async () => {
    const error = new Error('Render failed');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer(
      {processMessages() {}},
      rendererConfig(async () => {
        throw error;
      }),
    );
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    await vi.runAllTimersAsync();
    expect(log).toHaveBeenCalledWith(
      'PreviewBridge: Error waiting for surface content to render:',
      error,
    );
    expect(send).not.toHaveBeenCalledWith(
      expect.objectContaining({payload: expect.objectContaining({contentReady: true})}),
    );
  });

  it('keeps legacy resize payloads unchanged when the renderer has no commit hook', async () => {
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer({processMessages() {}}, rendererConfig());
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    await vi.runAllTimersAsync();
    expect(send).toHaveBeenCalledWith({
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 300, width: 400},
    });
  });
});
