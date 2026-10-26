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
import {CONTENT_QUIET_MS, CONTENT_SETTLE_MAX_MS} from './content-settle';

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

/** A promise with its resolver, for holding a render commit open until a test releases it. */
function deferred(): {promise: Promise<void>; resolve: () => void} {
  let resolve!: () => void;
  const promise = new Promise<void>(release => {
    resolve = release;
  });
  return {promise, resolve};
}

function rendererConfig(onInitialRender?: () => Promise<void>): RendererConfig {
  return {
    surfaceGroup: {onSurfaceCreated: {subscribe: () => ({unsubscribe() {}})}},
    onSurfaceReady() {},
    onInitialRender,
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
    const committed = deferred();
    const onInitialRender = vi.fn(() => committed.promise);
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer({processMessages() {}}, rendererConfig(onInitialRender));
    expect(send).toHaveBeenLastCalledWith({
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 300, width: 400, contentReady: false},
    });

    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    // Short of the cap, which would report readiness without the commit.
    await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS * 2);
    expect(onInitialRender).toHaveBeenCalledOnce();
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
    expect(onInitialRender).toHaveBeenCalledOnce();
  });

  it('waits for a root component when a surface arrives progressively', async () => {
    const onInitialRender = vi.fn(async () => {});
    bridge.attachRenderer({processMessages() {}}, rendererConfig(onInitialRender));
    bridge['handleRenderA2ui']([createSurface]);
    await vi.runAllTimersAsync();
    expect(onInitialRender).not.toHaveBeenCalled();

    bridge['handleRenderA2ui']([rootComponent]);
    await vi.runAllTimersAsync();
    expect(onInitialRender).toHaveBeenCalledOnce();
  });

  it.each(['clear', 'detach', 'destroy'] as const)(
    'ignores a pending render completion after %s',
    async operation => {
      const committed = deferred();
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
    const first = deferred();
    const second = deferred();
    const onInitialRender = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const send = vi.spyOn(bridge, 'sendMessage');
    bridge.attachRenderer({processMessages() {}}, rendererConfig(onInitialRender));
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    bridge['handleRenderA2ui'](null);
    bridge['handleRenderA2ui']([createSurface, rootComponent]);
    send.mockClear();
    first.resolve();
    // Short of the cap, which would report readiness without the commit.
    await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS * 2);
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

  describe('waiting for the content to settle', () => {
    let height: number;
    let send: ReturnType<typeof vi.spyOn<PreviewBridge, 'sendMessage'>>;

    /** The SURFACE_RESIZE messages sent so far that claim the content is ready. */
    function readyReports(): unknown[] {
      return send.mock.calls
        .map(([message]) => message)
        .filter(
          message =>
            message.type === PreviewBridgeMessageType.SURFACE_RESIZE &&
            (message.payload as {contentReady?: boolean}).contentReady === true,
        );
    }

    /** Renders a surface whose framework commit resolves at once, and lets it commit. */
    async function renderAndCommit(): Promise<void> {
      bridge.attachRenderer(
        {processMessages() {}},
        rendererConfig(async () => {}),
      );
      bridge['handleRenderA2ui']([createSurface, rootComponent]);
      await vi.advanceTimersByTimeAsync(0);
    }

    beforeEach(() => {
      height = 300;
      Object.defineProperty(document.body, 'scrollHeight', {
        get: () => height,
        configurable: true,
      });
      send = vi.spyOn(bridge, 'sendMessage');
    });

    afterEach(() => {
      document.body.replaceChildren();
      Reflect.deleteProperty(document, 'fonts');
    });

    it('reports readiness only after a quiet period', async () => {
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toEqual([
        {
          type: PreviewBridgeMessageType.SURFACE_RESIZE,
          payload: {height: 300, width: 400, contentReady: true},
        },
      ]);
    });

    it('restarts the quiet period when the layout changes late', async () => {
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(100);
      height = 350;
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toEqual([
        expect.objectContaining({payload: {height: 350, width: 400, contentReady: true}}),
      ]);
    });

    it('waits for an image that is still loading', async () => {
      let loaded = false;
      const image = document.createElement('img');
      Object.defineProperty(image, 'complete', {get: () => loaded});
      document.body.appendChild(image);
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(1000);
      expect(readyReports()).toEqual([]);

      loaded = true;
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toHaveLength(1);
    });

    it('waits for an image inside a shadow root', async () => {
      // Lit components render into shadow roots, which document.images doesn't reach.
      let loaded = false;
      const host = document.createElement('div');
      const inner = host.attachShadow({mode: 'open'}).appendChild(document.createElement('div'));
      const image = inner.attachShadow({mode: 'open'}).appendChild(document.createElement('img'));
      Object.defineProperty(image, 'complete', {get: () => loaded});
      document.body.appendChild(host);
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(1000);
      expect(readyReports()).toEqual([]);

      loaded = true;
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toHaveLength(1);
    });

    /** Stands in for document.fonts, with a status the test controls. */
    function stubFonts(status: FontFaceSetLoadStatus): {status: FontFaceSetLoadStatus} {
      // `ready` stays resolved, the way a FontFaceSet's ready promise is already
      // resolved when a font starts loading after it was read.
      const fonts = {status, ready: Promise.resolve()};
      Object.defineProperty(document, 'fonts', {value: fonts, configurable: true});
      return fonts;
    }

    it('waits for webfonts to load', async () => {
      const fonts = stubFonts('loading');
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(1000);
      expect(readyReports()).toEqual([]);

      fonts.status = 'loaded';
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toHaveLength(1);
    });

    it('waits for a webfont that starts loading after the wait began', async () => {
      // The new content asks for a font only once it is laid out.
      const fonts = stubFonts('loaded');
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(50);
      fonts.status = 'loading';
      await vi.advanceTimersByTimeAsync(1000);
      expect(readyReports()).toEqual([]);

      fonts.status = 'loaded';
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toHaveLength(1);
    });

    it('does not count unmeasured zero-height ticks toward the quiet period', async () => {
      height = 0;
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(1000);
      expect(readyReports()).toEqual([]);

      height = 240;
      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS - 50);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(CONTENT_QUIET_MS);
      expect(readyReports()).toEqual([
        expect.objectContaining({payload: {height: 240, width: 400, contentReady: true}}),
      ]);
    });

    it('reports readiness at the cap when webfonts never load', async () => {
      stubFonts('loading');
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(CONTENT_SETTLE_MAX_MS - 100);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(200);
      expect(readyReports()).toHaveLength(1);
    });

    it('reports readiness at the cap when the content never stops growing', async () => {
      await renderAndCommit();
      const grow = setInterval(() => (height += 10), 40);
      await vi.advanceTimersByTimeAsync(CONTENT_SETTLE_MAX_MS - 100);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(200);
      clearInterval(grow);
      expect(readyReports()).toHaveLength(1);
    });

    it('counts the cap from the render when the framework commit is slow', async () => {
      // The host's fallback window starts at RENDER_SUCCESS, so readiness has to
      // arrive within the cap of the render, however long the commit takes.
      const committed = deferred();
      bridge.attachRenderer(
        {processMessages() {}},
        rendererConfig(() => committed.promise),
      );
      bridge['handleRenderA2ui']([createSurface, rootComponent]);
      const grow = setInterval(() => (height += 10), 40);
      await vi.advanceTimersByTimeAsync(500);
      committed.resolve();
      await vi.advanceTimersByTimeAsync(CONTENT_SETTLE_MAX_MS - 600);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(200);
      clearInterval(grow);
      expect(readyReports()).toHaveLength(1);
    });

    it('reports readiness at the cap when the framework commit never resolves', async () => {
      bridge.attachRenderer(
        {processMessages() {}},
        rendererConfig(() => new Promise<void>(() => {})),
      );
      bridge['handleRenderA2ui']([createSurface, rootComponent]);
      await vi.advanceTimersByTimeAsync(CONTENT_SETTLE_MAX_MS - 100);
      expect(readyReports()).toEqual([]);

      await vi.advanceTimersByTimeAsync(200);
      expect(readyReports()).toHaveLength(1);
    });

    it('drops the wait when the surface is cleared partway through', async () => {
      await renderAndCommit();
      await vi.advanceTimersByTimeAsync(50);
      bridge['handleRenderA2ui'](null);
      await vi.advanceTimersByTimeAsync(CONTENT_SETTLE_MAX_MS * 2);
      expect(readyReports()).toEqual([]);
    });
  });
});
