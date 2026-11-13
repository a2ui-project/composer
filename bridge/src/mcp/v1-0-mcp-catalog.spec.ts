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
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {basicCatalog, MessageProcessor} from '@a2ui/web_core/v1_0';
import {createMcpFunctionsCatalog, MCP_FUNCTIONS_CATALOG_ID} from './v1-0-mcp-catalog.js';
import {PreviewBridge} from '../preview-bridge.js';
import {A2UI_MIME_TYPE} from './functions/callMcpTool.js';

describe('v1.0 MCP Functions Catalog', () => {
  let originalWindowBridge: unknown;

  beforeEach(() => {
    if (typeof window !== 'undefined') {
      originalWindowBridge = (window as unknown as {a2uiBridge?: unknown}).a2uiBridge;
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as {a2uiBridge?: unknown}).a2uiBridge = originalWindowBridge;
    }
  });

  it('exports MCP_FUNCTIONS_CATALOG_ID constant', () => {
    expect(MCP_FUNCTIONS_CATALOG_ID).toBe(
      'https://a2ui.org/composer/v1_0/catalogs/mcp-functions/catalog.json',
    );
  });

  it('creates Catalog instance with protocolVersion 1.0 and expected id', () => {
    const catalog = createMcpFunctionsCatalog();
    expect(catalog.id).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(catalog.protocolVersion).toBe('1.0');
  });

  it('generates non-empty JSON Schema definitions for all 6 registered functions via zod/v3', () => {
    const catalog = createMcpFunctionsCatalog();
    const schema = catalog.catalogSchema as {
      catalogId?: string;
      functions?: Record<
        string,
        {
          required?: string[];
          properties?: {args?: {required?: string[]; properties?: Record<string, unknown>}};
        }
      >;
    };

    expect(schema.catalogId).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(schema.functions).toBeDefined();

    const expectedFunctions = [
      'callMcpTool',
      'jmespath',
      'regexCapture',
      'regexReplace',
      'split',
      'updateDataModel',
    ];

    for (const fnName of expectedFunctions) {
      expect(schema.functions).toHaveProperty(fnName);
      const fnDef = schema.functions![fnName];
      expect(fnDef).toBeDefined();
      expect(fnDef.required).toEqual(expect.arrayContaining(['@call', 'args']));
      const argProps = fnDef.properties?.args?.properties;
      expect(argProps).toBeDefined();
      expect(Object.keys(argProps!)).not.toHaveLength(0);
      expect(fnDef.properties?.args?.required).toBeDefined();
    }

    expect(schema.functions!['callMcpTool'].properties!.args!.required).toEqual(['name']);
    expect(schema.functions!['jmespath'].properties!.args!.required).toEqual(
      expect.arrayContaining(['expression', 'data']),
    );
    expect(schema.functions!['regexCapture'].properties!.args!.required).toEqual(
      expect.arrayContaining(['value', 'pattern']),
    );
    expect(schema.functions!['regexReplace'].properties!.args!.required).toEqual(
      expect.arrayContaining(['value', 'pattern', 'replacement']),
    );
    expect(schema.functions!['split'].properties!.args!.required).toEqual(
      expect.arrayContaining(['value', 'separator']),
    );
    expect(schema.functions!['updateDataModel'].properties!.args!.required).toEqual(['updates']);

    expect(Object.keys(schema.functions!['callMcpTool'].properties!.args!.properties!)).toEqual(
      expect.arrayContaining(['name', 'arguments']),
    );
    expect(Object.keys(schema.functions!['jmespath'].properties!.args!.properties!)).toEqual(
      expect.arrayContaining(['expression', 'data']),
    );
    expect(Object.keys(schema.functions!['regexCapture'].properties!.args!.properties!)).toEqual(
      expect.arrayContaining(['value', 'pattern']),
    );
    expect(Object.keys(schema.functions!['regexReplace'].properties!.args!.properties!)).toEqual(
      expect.arrayContaining(['value', 'pattern', 'replacement']),
    );
    expect(Object.keys(schema.functions!['split'].properties!.args!.properties!)).toEqual(
      expect.arrayContaining(['value', 'separator']),
    );
    expect(Object.keys(schema.functions!['updateDataModel'].properties!.args!.properties!)).toEqual(
      expect.arrayContaining(['updates']),
    );

    const doc = catalog.toJson() as {
      functions?: Record<
        string,
        {required?: string[]; properties?: {args?: {required?: string[]}}}
      >;
    };
    for (const fnName of expectedFunctions) {
      expect(doc.functions![fnName].required).toEqual(expect.arrayContaining(['@call', 'args']));
      expect(doc.functions![fnName].properties?.args?.required).toBeDefined();
    }
    expect(doc.functions!['callMcpTool'].properties!.args!.required).toEqual(['name']);
  });

  it('executes data transformation functions (jmespath, split, regexCapture, regexReplace, updateDataModel)', async () => {
    const catalog = createMcpFunctionsCatalog();
    const splitFn = catalog.functions.get('split')!;
    const jmesFn = catalog.functions.get('jmespath')!;
    const captureFn = catalog.functions.get('regexCapture')!;
    const replaceFn = catalog.functions.get('regexReplace')!;
    const updateFn = catalog.functions.get('updateDataModel')!;

    const store: Record<string, unknown> = {};
    const mockCtx = {
      resolveDynamicValue: (v: unknown) => v,
      set: (path: string, val: unknown) => {
        store[path] = val;
      },
    } as never;

    expect(splitFn.execute({value: 'apple;banana;cherry', separator: ';'}, mockCtx)).toEqual([
      'apple',
      'banana',
      'cherry',
    ]);
    expect(
      jmesFn.execute(
        {expression: 'items[1].name', data: {items: [{name: 'a'}, {name: 'b'}]}},
        mockCtx,
      ),
    ).toBe('b');
    expect(captureFn.execute({value: 'order-987', pattern: 'order-(\\d+)'}, mockCtx)).toEqual([
      '987',
    ]);
    expect(
      replaceFn.execute({value: 'foo 123 bar', pattern: '\\d+', replacement: 'NUM'}, mockCtx),
    ).toBe('foo NUM bar');

    updateFn.execute({updates: {'/profile/name': 'Bob', '/count': 42}}, mockCtx);
    expect(store).toEqual({
      '/profile/name': 'Bob',
      '/count': 42,
    });
  });

  it('invokes callMcpTool with client tool caller and dispatches UI messages to processor', async () => {
    const mockClient = {
      callTool: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'resource',
            resource: {
              uri: 'ui://test-resource',
              mimeType: A2UI_MIME_TYPE,
              text: JSON.stringify({
                version: '1.0',
                updateDataModel: {surfaceId: 's1', value: {ok: true}},
              }),
            },
          },
          {type: 'text', text: 'Tool finished'},
        ],
      }),
    };

    const processedMessages: unknown[] = [];
    const mockProcessor = {
      processMessages: vi.fn(msgs => processedMessages.push(...msgs)),
      model: undefined,
    };

    const catalog = createMcpFunctionsCatalog({
      getMcpClientForTool: async () => mockClient,
      processor: mockProcessor,
    });

    const callFn = catalog.functions.get('callMcpTool')!;
    const res = await callFn.execute({name: 'computeStats', arguments: {items: [1, 2, 3]}}, {
      resolveDynamicValue: (v: unknown) => v,
    } as never);

    expect(mockClient.callTool).toHaveBeenCalledWith({
      name: 'computeStats',
      arguments: {items: [1, 2, 3]},
    });
    expect(res).toEqual(
      expect.objectContaining({
        content: expect.arrayContaining([
          expect.objectContaining({type: 'text', text: 'Tool finished'}),
        ]),
      }),
    );
    expect(mockProcessor.processMessages).toHaveBeenCalled();
    expect(processedMessages).toHaveLength(1);
  });

  it('lazily resolves window.a2uiBridge.getMcpClient() and getActiveProcessor() when options omitted', async () => {
    const mockClient = {
      callTool: vi.fn().mockResolvedValue({content: [{type: 'text', text: 'lazy success'}]}),
    };
    const mockProcessor = {
      processMessages: vi.fn(),
    };

    if (typeof window !== 'undefined') {
      (window as unknown as {a2uiBridge?: unknown}).a2uiBridge = {
        getMcpClient: () => mockClient,
        getActiveProcessor: () => mockProcessor,
      };
    }

    const catalog = createMcpFunctionsCatalog();
    const callFn = catalog.functions.get('callMcpTool')!;

    const res = await callFn.execute({name: 'lazyTool', arguments: {param: 'test'}}, {
      resolveDynamicValue: (v: unknown) => v,
    } as never);

    expect(mockClient.callTool).toHaveBeenCalledWith({
      name: 'lazyTool',
      arguments: {param: 'test'},
    });
    expect(res).toEqual({content: [{type: 'text', text: 'lazy success'}]});
  });

  it('fails gracefully when MCP client cannot be resolved', async () => {
    if (typeof window !== 'undefined') {
      (window as unknown as {a2uiBridge?: unknown}).a2uiBridge = undefined;
    }
    const catalog = createMcpFunctionsCatalog();
    const callFn = catalog.functions.get('callMcpTool')!;

    await expect(
      callFn.execute({name: 'unresolvable'}, {resolveDynamicValue: (v: unknown) => v} as never),
    ).rejects.toThrow(/MCP client for tool 'unresolvable' could not be resolved/);
  });

  it('is compatible with MessageProcessor alongside basicCatalog', () => {
    const mcpCatalog = createMcpFunctionsCatalog();
    const processor = new MessageProcessor([basicCatalog, mcpCatalog], () => {});
    expect(processor.model).toBeDefined();
  });

  it('allows invoker execution when arguments contain undefined or null data for pending async signals', () => {
    const catalog = createMcpFunctionsCatalog();
    const ctx = {
      resolveDynamicValue: (v: unknown) => v,
    } as never;

    const resUndefined = catalog.invoker(
      'jmespath',
      {expression: 'content[0].text', data: undefined},
      ctx,
    );
    expect(resUndefined).toBeNull();

    const resNull = catalog.invoker('jmespath', {expression: 'content[0].text', data: null}, ctx);
    expect(resNull).toBeNull();
  });

  it('fails validation when required arguments are completely omitted', () => {
    const catalog = createMcpFunctionsCatalog();
    const ctx = {
      resolveDynamicValue: (v: unknown) => v,
    } as never;

    expect(() => {
      catalog.invoker('jmespath', {expression: 'content[0].text'} as never, ctx);
    }).toThrow(/Required/);
  });

  it('emits DynamicString and DynamicValue $defs in catalogSchema', () => {
    const catalog = createMcpFunctionsCatalog();
    const schemaStr = JSON.stringify(catalog.catalogSchema);
    expect(schemaStr).toContain('#/$defs/DynamicString');
    expect(schemaStr).toContain('#/$defs/DynamicValue');
  });

  it('works with MessageProcessor with pending async callMcpTool and unset/null @path bindings', () => {
    const mcpCatalog = createMcpFunctionsCatalog();
    const processor = new MessageProcessor([basicCatalog, mcpCatalog], () => {});

    processor.processMessages([
      {
        version: '1.0',
        createSurface: {
          surfaceId: 'surface-1',
          catalogId: basicCatalog.id,
          components: [
            {
              id: 'text_1',
              component: 'Text',
              text: {
                ['@call']: 'jmespath',
                args: {
                  expression: 'title',
                  data: {['@path']: '/pendingOrUnset'},
                },
                catalogId: MCP_FUNCTIONS_CATALOG_ID,
              },
            },
          ],
        },
      },
    ]);

    expect(processor.model).toBeDefined();
    const surface = processor.model.getSurface('surface-1');
    expect(surface).toBeDefined();
  });

  it('executes agent callRendererFunction for split on MCP_FUNCTIONS_CATALOG_ID and emits response', async () => {
    const mcpCatalog = createMcpFunctionsCatalog();
    const emittedMessages: Array<{
      version?: string;
      rendererFunctionResponse?: {functionCallId: string; value?: unknown};
    }> = [];

    const processor = new MessageProcessor([basicCatalog, mcpCatalog], () => {}, {
      outboundListener: msg => {
        emittedMessages.push(
          msg as {
            version?: string;
            rendererFunctionResponse?: {functionCallId: string; value?: unknown};
          },
        );
      },
    });

    processor.processMessages([
      {
        version: '1.0',
        createSurface: {
          surfaceId: 'surf-agent-rpc',
          catalogId: MCP_FUNCTIONS_CATALOG_ID,
        },
      },
      {
        version: '1.0',
        callRendererFunction: {
          surfaceId: 'surf-agent-rpc',
          functionCallId: 'rpc-split-test',
          callFunction: {
            '@call': 'split',
            catalogId: MCP_FUNCTIONS_CATALOG_ID,
            args: {
              value: 'alpha,beta,gamma',
              separator: ',',
            },
          },
        },
      },
    ]);

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(emittedMessages).toHaveLength(1);
    expect(emittedMessages[0].version).toBe('1.0');
    expect(emittedMessages[0].rendererFunctionResponse).toEqual({
      functionCallId: 'rpc-split-test',
      value: ['alpha', 'beta', 'gamma'],
    });
  });

  it('preserves literal object {call: "sales", phone: "123"} intact when resolved in v1.0', async () => {
    const catalog = createMcpFunctionsCatalog();
    const jmesFn = catalog.functions.get('jmespath')!;

    const store: Record<string, unknown> = {};
    const v10Context = {
      atLeastV10: true,
      surfaceProtocolVersion: '1.0',
      resolveDynamicValue: (v: unknown) => v,
      set: (path: string, val: unknown) => {
        store[path] = val;
      },
    } as never;

    const literalObj = {call: 'sales', phone: '123'};
    const result = jmesFn.execute(
      {
        expression: 'info',
        data: {info: literalObj},
      },
      v10Context,
    );

    expect(result).toEqual({call: 'sales', phone: '123'});
  });

  it('normalizes cleanly in PreviewBridge catalog resolution as multi-catalog', async () => {
    const bridge = new PreviewBridge();
    const mcpCatalog = createMcpFunctionsCatalog();

    const mockGroup = {
      getSurface: vi.fn(),
    };
    bridge.attachRenderer(
      {
        processMessages: () => {},
      } as never,
      {
        surfaceGroup: mockGroup as never,
        catalogs: [basicCatalog, mcpCatalog],
      },
    );

    const sendSpy = vi.spyOn(bridge, 'sendMessage');
    // Trigger handleGetCatalog via postMessage
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window.parent,
        data: {type: 'GET_CATALOG'},
        origin: window.location.origin,
      }),
    );

    // Yield macro-task for async getCatalog
    await new Promise(resolve => setTimeout(resolve, 50));

    const catalogMessages = sendSpy.mock.calls
      .map(c => c[0] as {type?: string; payload?: {catalogs?: Array<Record<string, unknown>>}})
      .filter(m => m?.type === 'A2UI_CATALOG');

    expect(catalogMessages.length).toBeGreaterThan(0);
    const lastMsg = catalogMessages[catalogMessages.length - 1];
    expect(lastMsg.payload?.catalogs).toBeDefined();
    expect(lastMsg.payload!.catalogs!).toHaveLength(2);

    const mcpSchema = lastMsg.payload!.catalogs![1];
    expect(mcpSchema['$id']).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(mcpSchema['catalogId']).toBe(MCP_FUNCTIONS_CATALOG_ID);
    expect(mcpSchema['protocolVersion']).toBe('1.0');

    bridge.destroy();
  });
});
