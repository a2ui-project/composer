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
import {describe, it, expect, beforeEach, afterEach, vi, onTestFinished} from 'vitest';
import {AppRoot} from './main';
import {a2uiBridge, PreviewBridgeMessageType} from 'a2ui-bridge';
import {V09_SPEC_FUNCTIONS} from '@a2ui/web_core/v0_9/basic_catalog';
import {v09Catalogs} from './catalogs/v0-9-catalogs.js';
import {
  COMPOSER_V09_BASIC_CATALOG_ID,
  NPM_V09_BASIC_CATALOG_ID,
} from '../../shared/v0-9/basic-catalog-id.js';

describe('AppRoot Lit Element (v0.9)', () => {
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
    const textEl =
      surfaceEl?.querySelector('a2ui-basic-text') ??
      surfaceEl?.shadowRoot?.querySelector('a2ui-basic-text');
    await (textEl as unknown as {updateComplete: Promise<void>})?.updateComplete;
    expect(textEl?.innerHTML).toContain('<strong>bold text</strong>');
  });

  it('slots an empty loading element when surface has no root component', async () => {
    const mockPayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'blank-surface-123',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
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
    expect(element.shadowRoot?.innerHTML).not.toContain('Waiting for RENDER_A2UI...');
    const surfaceEl = element.shadowRoot?.querySelector('a2ui-surface');
    expect(surfaceEl).not.toBeNull();
    const loadingSlot = surfaceEl?.querySelector('[slot="loading"]');
    expect(loadingSlot).not.toBeNull();
    expect(loadingSlot?.textContent).toBe('');
  });

  it('registers both v0.9 basic catalog IDs with protocolVersion 0.9', () => {
    const v09Catalogs = (AppRoot.catalogs as Array<{id?: string; protocolVersion?: string}>).filter(
      c => c.protocolVersion === '0.9',
    );
    expect(v09Catalogs.map(c => c.id)).toEqual([
      COMPOSER_V09_BASIC_CATALOG_ID,
      NPM_V09_BASIC_CATALOG_ID,
    ]);
  });

  it('exposes theme definitions and web_core V09_SPEC_FUNCTIONS in v0.9 catalogSchema', () => {
    const schema = (
      v09Catalogs[0] as unknown as {
        catalogSchema?: {
          $defs?: Record<string, unknown>;
          functions?: Record<string, unknown>;
        };
      }
    ).catalogSchema;
    expect(schema?.$defs).toBeDefined();
    expect(schema?.$defs?.['theme']).toBeDefined();
    expect(Object.keys(schema?.functions ?? {}).sort()).toEqual(
      V09_SPEC_FUNCTIONS.map(fn => fn.name).sort(),
    );
  });

  it('renders a v0.9 payload referencing the published NPM basic catalog ID', async () => {
    const mockPayload = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'npm-v09-surface',
          catalogId: NPM_V09_BASIC_CATALOG_ID,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'npm-v09-surface',
          components: [{id: 'root', component: 'Text', text: 'NPM v0.9 ID'}],
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

    await vi.waitFor(async () => {
      await element.updateComplete;
      const surfaceEl = element.shadowRoot?.querySelector('a2ui-surface');
      expect(surfaceEl).not.toBeNull();
      await (surfaceEl as unknown as {updateComplete: Promise<void>})?.updateComplete;
      const textEl =
        surfaceEl?.querySelector('a2ui-basic-text') ??
        surfaceEl?.shadowRoot?.querySelector('a2ui-basic-text');
      expect(textEl).not.toBeNull();
      await (textEl as unknown as {updateComplete: Promise<void>})?.updateComplete;
      expect(textEl?.textContent).toContain('NPM v0.9 ID');
    });
    expect(element.shadowRoot?.querySelector('.error-overlay')).toBeNull();
  });

  it('wires getDemos from the bootstrap options through to the bridge', async () => {
    const {DEMOS} = await import('../../shared/demos');
    // Capture the sandbox options the element actually hands the bridge on
    // connect: `bootstrapLitSandbox` in main.ts copies `getDemos` onto the
    // element class, and `connectedCallback` forwards it here. Reading the
    // callback off this call (rather than off a locally built options object)
    // is what makes deleting `getDemos` from main.ts fail this test.
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const bootstrapped = new AppRoot();
    onTestFinished(() => {
      bootstrapped.remove();
      attachSpy.mockRestore();
    });

    document.body.appendChild(bootstrapped);
    await bootstrapped.updateComplete;

    expect(attachSpy).toHaveBeenCalledTimes(1);
    const rendererConfig = attachSpy.mock.calls[0][1];
    expect(rendererConfig.getDemos).toBeTypeOf('function');

    const served = await rendererConfig.getDemos!();
    expect(served).toBe(DEMOS);
  });
});
