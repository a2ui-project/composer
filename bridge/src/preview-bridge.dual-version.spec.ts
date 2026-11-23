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
import {MessageProcessor, type Catalog, type ComponentApi} from '@a2ui/web_core/v0_9';
import {basicCatalog as v09BasicCatalog} from '@a2ui/web_core/v0_9/basic_catalog';
import {basicCatalog as v10BasicCatalog} from '@a2ui/web_core/catalogs/basic/v1';
import {PreviewBridge, a2uiBridge, type SurfaceGroupLike} from './index';
import {PreviewBridgeMessageType} from './bridge-message';
import {createMcpFunctionsCatalog, MCP_FUNCTIONS_CATALOG_ID} from './mcp/v1-0-mcp-catalog';

const COMPOSER_V09_BASIC_CATALOG_ID = 'https://a2ui.org/specification/v0_9/basic_catalog.json';
const NPM_V09_BASIC_CATALOG_ID = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';
const V10_BASIC_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

function dispatchHostMessage(data: unknown): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      source: window.parent,
      origin: window.location.origin,
      data,
    }),
  );
}

describe('PreviewBridge dual-version (v0.9 + v1.0) characterization', () => {
  let bridge: PreviewBridge;
  let originalParent: Window;
  let originalLocation: Location;
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalParent = window.parent;
    originalLocation = window.location;
    postMessageSpy = vi.fn();

    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: {
        postMessage: postMessageSpy,
      },
    });

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...originalLocation, search: ''},
      writable: true,
    });

    a2uiBridge.destroy();
    bridge = new PreviewBridge();
  });

  afterEach(() => {
    bridge.destroy();
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: originalParent,
    });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
      writable: true,
    });
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function attachDualVersionProcessor(): {
    processor: MessageProcessor<ComponentApi>;
    conn: {unsubscribe: () => void};
  } {
    const v09ComposerCatalog = v09BasicCatalog.derive({
      catalogId: COMPOSER_V09_BASIC_CATALOG_ID,
    });
    const mcpCatalog = createMcpFunctionsCatalog();
    const catalogs = [
      v10BasicCatalog,
      mcpCatalog,
      v09ComposerCatalog,
      v09BasicCatalog,
    ] as unknown as Catalog<ComponentApi>[];

    const processor = new MessageProcessor<ComponentApi>(catalogs, action => {
      bridge.sendAction(action);
    });
    const conn = bridge.attachRenderer(processor, {
      surfaceGroup: processor.model as unknown as SurfaceGroupLike,
      catalogs,
      onSurfaceReady: vi.fn(),
      onError: vi.fn(),
    });
    return {processor, conn};
  }

  it('announces all four catalogs in A2UI_CATALOG with v1.0 first and each protocolVersion', async () => {
    const {conn} = attachDualVersionProcessor();
    postMessageSpy.mockClear();

    dispatchHostMessage({type: PreviewBridgeMessageType.GET_CATALOG});

    const catalogReply = await vi.waitFor(() => {
      const reply = postMessageSpy.mock.calls
        .map(call => call[0] as {type?: string; payload?: unknown})
        .find(msg => msg.type === PreviewBridgeMessageType.A2UI_CATALOG);
      expect(reply).toBeDefined();
      return reply!;
    });
    const payload = catalogReply?.payload as {
      catalogs?: Array<{catalogId?: string; $id?: string; protocolVersion?: string}>;
    };
    expect(payload.catalogs).toHaveLength(4);
    expect(
      payload.catalogs?.map(c => ({
        id: c.catalogId ?? c.$id,
        protocolVersion: c.protocolVersion,
      })),
    ).toEqual([
      {id: V10_BASIC_CATALOG_ID, protocolVersion: '1.0'},
      {id: MCP_FUNCTIONS_CATALOG_ID, protocolVersion: '1.0'},
      {id: COMPOSER_V09_BASIC_CATALOG_ID, protocolVersion: '0.9'},
      {id: NPM_V09_BASIC_CATALOG_ID, protocolVersion: '0.9'},
    ]);

    conn.unsubscribe();
  });

  it('renders v0.9 (Composer id and npm id) and v1.0 payloads with RENDER_SUCCESS', () => {
    vi.useFakeTimers();
    const {processor, conn} = attachDualVersionProcessor();

    const makeV09Payload = (surfaceId: string, catalogId: string) => [
      {
        version: 'v0.9',
        createSurface: {surfaceId, catalogId, sendDataModel: true},
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: [{id: 'root', component: 'Text', text: 'Hello v0.9'}],
        },
      },
    ];

    postMessageSpy.mockClear();
    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      renderId: 'r-v09-composer',
      payload: makeV09Payload('surf-composer', COMPOSER_V09_BASIC_CATALOG_ID),
    });
    vi.runAllTimers();
    expect(postMessageSpy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.RENDER_SUCCESS, renderId: 'r-v09-composer'},
      window.location.origin,
    );
    expect(processor.model.getSurface('surf-composer')).toBeDefined();

    postMessageSpy.mockClear();
    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      renderId: 'r-v09-npm',
      payload: makeV09Payload('surf-npm', NPM_V09_BASIC_CATALOG_ID),
    });
    vi.runAllTimers();
    expect(postMessageSpy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.RENDER_SUCCESS, renderId: 'r-v09-npm'},
      window.location.origin,
    );
    expect(processor.model.getSurface('surf-npm')).toBeDefined();

    postMessageSpy.mockClear();
    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      renderId: 'r-v10',
      payload: [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'surf-v10',
            catalogId: V10_BASIC_CATALOG_ID,
            components: [{id: 'root', component: 'Text', text: 'Hello v1.0'}],
          },
        },
      ],
    });
    vi.runAllTimers();
    expect(postMessageSpy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.RENDER_SUCCESS, renderId: 'r-v10'},
      window.location.origin,
    );
    expect(processor.model.getSurface('surf-v10')).toBeDefined();

    conn.unsubscribe();
  });

  it('produces RENDER_ERROR containing "Catalog not found" for an unknown v0.9 catalogId', () => {
    vi.useFakeTimers();
    const {conn} = attachDualVersionProcessor();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    postMessageSpy.mockClear();
    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      renderId: 'r-unknown-cat',
      payload: [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'surf-bad',
            catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
          },
        },
      ],
    });
    vi.runAllTimers();

    const errorMsg = postMessageSpy.mock.calls
      .map(call => call[0] as {type?: string; error?: string; renderId?: string})
      .find(msg => msg.type === PreviewBridgeMessageType.RENDER_ERROR);

    expect(errorMsg).toBeDefined();
    expect(errorMsg?.renderId).toBe('r-unknown-cat');
    expect(errorMsg?.error).toContain('Catalog not found');

    consoleErrorSpy.mockRestore();
    conn.unsubscribe();
  });

  it('stamps v0.9 on sendAction after a v0.9 render and 1.0 after a v1.0 render', () => {
    vi.useFakeTimers();
    const {conn} = attachDualVersionProcessor();

    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      payload: [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'surf-v09',
            catalogId: COMPOSER_V09_BASIC_CATALOG_ID,
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'surf-v09',
            components: [{id: 'root', component: 'Text', text: 'v0.9'}],
          },
        },
      ],
    });
    vi.runAllTimers();

    postMessageSpy.mockClear();
    bridge.sendAction({name: 'submitV09'});
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {version: 'v0.9', action: {name: 'submitV09'}},
      },
      window.location.origin,
    );

    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      payload: [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'surf-v10',
            catalogId: V10_BASIC_CATALOG_ID,
            components: [{id: 'root', component: 'Text', text: 'v1.0'}],
          },
        },
      ],
    });
    vi.runAllTimers();

    postMessageSpy.mockClear();
    bridge.sendAction({name: 'submitV10'});
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {version: '1.0', action: {name: 'submitV10'}},
      },
      window.location.origin,
    );

    conn.unsubscribe();
  });

  it('still renders a foreign catalogId via aliasing when only one catalog is registered', () => {
    vi.useFakeTimers();
    const singleCatalog = v09BasicCatalog.derive({
      catalogId: COMPOSER_V09_BASIC_CATALOG_ID,
    });
    const catalogs = [singleCatalog] as unknown as Catalog<ComponentApi>[];
    const processor = new MessageProcessor<ComponentApi>(catalogs, action => {
      bridge.sendAction(action);
    });
    const conn = bridge.attachRenderer(processor, {
      surfaceGroup: processor.model as unknown as SurfaceGroupLike,
      catalogs,
      onCatalogResolved: catalogId => {
        bridge.aliasSingleCatalogId(catalogId, catalogs);
      },
      onSurfaceReady: vi.fn(),
      onError: vi.fn(),
    });

    postMessageSpy.mockClear();
    dispatchHostMessage({
      type: PreviewBridgeMessageType.RENDER_A2UI,
      renderId: 'r-aliased',
      payload: [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'surf-aliased',
            catalogId: 'https://example.com/custom_v09_catalog.json',
          },
        },
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'surf-aliased',
            components: [{id: 'root', component: 'Text', text: 'Aliased'}],
          },
        },
      ],
    });
    vi.runAllTimers();

    expect(postMessageSpy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.RENDER_SUCCESS, renderId: 'r-aliased'},
      window.location.origin,
    );
    expect(processor.model.getSurface('surf-aliased')).toBeDefined();

    conn.unsubscribe();
  });
});
