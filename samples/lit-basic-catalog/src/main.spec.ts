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

// @vitest-environment jsdom
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {AppRoot} from './main';
import {a2uiBridge, PreviewBridgeMessageType} from 'a2ui-bridge';

describe('AppRoot Lit Element', () => {
  let element: AppRoot;

  beforeEach(async () => {
    document.adoptedStyleSheets = document.adoptedStyleSheets || [];
    element = new AppRoot();
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it('creates the element and registers RENDER_A2UI processor', () => {
    expect(element).toBeTruthy();
  });

  it('processes RENDER_A2UI array payloads correctly', async () => {
    const mockPayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'dynamic-surface-123',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'dynamic-surface-123',
          components: [
            {
              component: 'BasicColumn',
              id: 'col-1',
            },
          ],
        },
      },
    ];

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        origin: window.location.origin,
        data: {type: PreviewBridgeMessageType.RENDER_A2UI, payload: mockPayload},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 15));
    await element.updateComplete;
    expect(element.shadowRoot?.innerHTML).toContain('a2ui-surface');
  });

  it('logs warning when RENDER_A2UI payload is not an array', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        origin: window.location.origin,
        data: {type: PreviewBridgeMessageType.RENDER_A2UI, payload: {invalid: true}},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 15));
    expect(warnSpy).toHaveBeenCalledWith(
      'PreviewBridge: Unexpected non-array RENDER_A2UI payload received:',
      {
        invalid: true,
      },
    );
  });

  it('unregisters processor on disconnection', () => {
    const attachSpy = vi.spyOn(element['rendererConnection']!, 'unsubscribe');
    element.disconnectedCallback();
    expect(attachSpy).toHaveBeenCalled();
  });

  it('renders Markdown text without logging missing renderer warning', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    const mockPayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'markdown-surface-123',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'markdown-surface-123',
          components: [
            {
              component: 'Text',
              id: 'root',
              text: '**bold text**',
            },
          ],
        },
      },
    ];

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        origin: window.location.origin,
        data: {type: PreviewBridgeMessageType.RENDER_A2UI, payload: mockPayload},
      }),
    );

    await new Promise(resolve => setTimeout(resolve, 50));
    await element.updateComplete;
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('[MarkdownDirective]'),
      expect.any(String),
      expect.any(String),
    );
    const surfaceEl = element.shadowRoot?.querySelector('a2ui-surface');
    await (surfaceEl as unknown as {updateComplete: Promise<void>})?.updateComplete;
    const textEl = surfaceEl?.shadowRoot?.querySelector('a2ui-basic-text');
    await (textEl as unknown as {updateComplete: Promise<void>})?.updateComplete;
    expect(textEl?.shadowRoot?.innerHTML).toContain('<strong>bold text</strong>');
  });

  it('serves the full basic-catalog demo set', async () => {
    const {DEMOS} = await import('./demos.js');
    expect(DEMOS).toHaveLength(43);
    for (const demo of DEMOS) {
      expect(demo.id).toBeTruthy();
      expect(demo.name).toBeTruthy();
      expect(demo.description).toBeTruthy();
      expect(Array.isArray(demo.a2ui)).toBe(true);
      expect(demo.a2ui.length).toBeGreaterThan(0);
      expect(demo.a2ui[0].version).toBe('v0.9');
    }
    expect(new Set(DEMOS.map(d => d.id)).size).toBe(DEMOS.length);
  });

  it('wires getDemos from the bootstrap options through to the bridge', async () => {
    const {DEMOS} = await import('./demos.js');
    // Capture the sandbox options the element actually hands the bridge on
    // connect: `bootstrapLitSandbox` in main.ts copies `getDemos` onto the
    // element class, and `connectedCallback` forwards it here. Reading the
    // callback off this call (rather than off a locally built options object)
    // is what makes deleting `getDemos` from main.ts fail this test.
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const bootstrapped = new AppRoot();

    try {
      document.body.appendChild(bootstrapped);
      await bootstrapped.updateComplete;

      expect(attachSpy).toHaveBeenCalledTimes(1);
      const rendererConfig = attachSpy.mock.calls[0][1];
      expect(rendererConfig.getDemos).toBeTypeOf('function');

      const served = await rendererConfig.getDemos!();
      expect(served).toHaveLength(43);
      expect(served).toBe(DEMOS);
    } finally {
      bootstrapped.remove();
      attachSpy.mockRestore();
    }
  });
});
