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
import {a2uiBridge, PreviewBridgeMessageType, MCP_FUNCTIONS_CATALOG_ID} from 'a2ui-bridge';
import {COMPONENT_USAGES} from '../../shared/usages.js';
import {assertValidV10ComponentUsages} from '../../shared/usages-test-helper.js';
import {attachCatalogSchema} from '../../shared/attach-catalog-schema.js';

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

  it('registers multi-catalog handshake with v1.0 basicCatalog and McpFunctionsCatalog', () => {
    expect(AppRoot.catalogs).toHaveLength(2);
    const [basic, mcp] = AppRoot.catalogs as Array<{id?: string; protocolVersion?: string}>;
    expect(basic?.id).toBe('https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json');
    expect(basic?.protocolVersion).toBe('1.0');
    expect(mcp?.id).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(mcp?.protocolVersion).toBe('1.0');
  });

  it('processes RENDER_A2UI v1.0 createSurface payload correctly', async () => {
    const mockPayload = [
      {
        version: '1.0',
        createSurface: {
          surfaceId: 'dynamic-surface-123',
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: [],
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
        version: '1.0',
        createSurface: {
          surfaceId: 'markdown-surface-123',
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'root',
              component: 'Text',
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
        version: '1.0',
        createSurface: {
          surfaceId: 'blank-surface-123',
          catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          components: [
            {
              id: 'sidebar',
              component: 'Text',
              text: 'Not the root',
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
    expect(element.shadowRoot?.innerHTML).not.toContain('Waiting for RENDER_A2UI...');
    const surfaceEl = element.shadowRoot?.querySelector('a2ui-surface');
    expect(surfaceEl).not.toBeNull();
    const loadingSlot = surfaceEl?.querySelector('[slot="loading"]');
    expect(loadingSlot).not.toBeNull();
    expect(loadingSlot?.textContent).toBe('');
  });

  it('serves the full basic-catalog demo set', async () => {
    const {DEMOS} = await import('../../shared/demos');
    expect(DEMOS).toHaveLength(46);
    for (const demo of DEMOS) {
      expect(demo.id).toBeTruthy();
      expect(demo.name).toBeTruthy();
      expect(demo.description).toBeTruthy();
      expect(Array.isArray(demo.a2ui)).toBe(true);
      expect(demo.a2ui.length).toBeGreaterThan(0);
      expect(demo.a2ui[0].version).toBe('1.0');
    }
    expect(new Set(DEMOS.map(d => d.id)).size).toBe(DEMOS.length);
  });

  it('wires getDemos from the bootstrap options through to the bridge', async () => {
    const {DEMOS} = await import('../../shared/demos');
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
    expect(served).toHaveLength(46);
    expect(served).toBe(DEMOS);
  });

  describe('A2UI v1.0 COMPONENT_USAGES validation', () => {
    it('validates every usage entry in usages.ts against v1.0 CreateSurfaceMessageSchema and BASIC_COMPONENTS', () => {
      assertValidV10ComponentUsages(COMPONENT_USAGES);
    });
  });
});

describe('attachCatalogSchema', () => {
  it('resolves dynamic own catalogSchema getter without eager snapshotting', () => {
    let dynamicCount = 0;
    const target = {
      components: new Map(),
      get catalogSchema() {
        dynamicCount++;
        return {title: `Dynamic Title ${dynamicCount}`};
      },
    };

    attachCatalogSchema(target);
    expect(dynamicCount).toBe(0);

    const firstRead = target.catalogSchema as {title: string};
    expect(firstRead.title).toBe('Dynamic Title 1');
    expect(dynamicCount).toBe(1);

    const secondRead = target.catalogSchema as {title: string};
    expect(secondRead.title).toBe('Dynamic Title 2');
    expect(dynamicCount).toBe(2);
  });

  it('allows own data catalogSchema property to shadow an inherited prototype getter', () => {
    const proto = {
      get catalogSchema() {
        return {title: 'Proto Title'};
      },
    };
    const target = Object.create(proto);
    target.components = new Map();
    Object.defineProperty(target, 'catalogSchema', {
      value: {title: 'Instance Title'},
      writable: true,
      configurable: true,
      enumerable: true,
    });

    attachCatalogSchema(target);
    const schema = target.catalogSchema as {title: string};
    expect(schema.title).toBe('Instance Title');
  });

  it('avoids stacking wrapper getters when called twice on the same instance', () => {
    let dynamicCount = 0;
    const target = {
      components: new Map(),
      get catalogSchema() {
        dynamicCount++;
        return {
          title: `Dynamic Title ${dynamicCount}`,
          components: {Button: {type: 'object'}, Card: {type: 'object'}},
        };
      },
    };

    attachCatalogSchema(target);
    attachCatalogSchema(target);
    expect(dynamicCount).toBe(0);

    const schema = target.catalogSchema as unknown as {
      title: string;
      description: string;
      components: Record<string, unknown>;
    };
    expect(schema.title).toBe('Dynamic Title 1');
    expect(schema.description).toBe('Unified catalog of basic A2UI components and functions.');
    expect(dynamicCount).toBe(1);
  });

  it('gracefully handles frozen catalog and component objects without throwing', () => {
    const frozenComp = Object.freeze({name: 'Text'});
    const frozenCatalog = Object.freeze({
      components: new Map([['Text', frozenComp]]),
      catalogSchema: {title: 'Frozen Catalog'},
    });

    expect(() => {
      attachCatalogSchema(frozenCatalog);
    }).not.toThrow();

    const nonConfigurableCatalog = {};
    Object.defineProperty(nonConfigurableCatalog, 'catalogSchema', {
      value: {title: 'Locked'},
      configurable: false,
      writable: false,
    });
    expect(() => {
      attachCatalogSchema(nonConfigurableCatalog);
    }).not.toThrow();
  });
});
