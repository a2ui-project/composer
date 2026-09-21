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

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {Catalog, MessageProcessor, type ComponentApi} from '@a2ui/web_core/v0_9';
import {
  IframeMcpClient,
  createMcpCatalogFunctions,
  PreviewBridge,
  PreviewBridgeMessageType,
  extractA2uiMessages,
  parseA2uiMessages,
  readUiResourceUris,
  A2UI_MIME_TYPE,
} from '../index.js';
import {resolveDynamicValueDeep} from './dynamic-values.js';
import {withSettledArgs} from './functions/common.js';

describe('MCP Bridge & Catalog Functions', () => {
  describe('resolveDynamicValueDeep & withSettledArgs', () => {
    it('resolves nested DataBindings, FunctionCalls, arrays, and enforces depth limit', () => {
      const mockContext = {
        resolveDynamicValue: (v: unknown) => {
          if (typeof v === 'object' && v !== null && 'path' in v) {
            return `resolved:${(v as {path: string}).path}`;
          }
          if (typeof v === 'object' && v !== null && 'call' in v) {
            return `called:${(v as {call: string}).call}`;
          }
          return v;
        },
      } as never;

      expect(resolveDynamicValueDeep('primitive', mockContext)).toBe('primitive');
      expect(resolveDynamicValueDeep(null, mockContext)).toBeNull();
      expect(resolveDynamicValueDeep({path: '/user/name'}, mockContext)).toBe(
        'resolved:/user/name',
      );
      expect(resolveDynamicValueDeep({call: 'formatString', args: {val: 'x'}}, mockContext)).toBe(
        'called:formatString',
      );
      expect(
        resolveDynamicValueDeep(
          {
            nested: [{path: '/a'}, {b: {call: 'fn', args: {}}}],
          },
          mockContext,
        ),
      ).toEqual({
        nested: ['resolved:/a', {b: 'called:fn'}],
      });

      // Depth > 10 stops recursion
      let deepObj: unknown = {path: '/too-deep'};
      for (let i = 0; i < 12; i++) {
        deepObj = {child: deepObj};
      }
      const resolvedDeep = resolveDynamicValueDeep(deepObj, mockContext);
      expect(resolvedDeep).toBeDefined();
    });

    it('settles nested Promise arguments in withSettledArgs', async () => {
      const result = await withSettledArgs(
        {
          directPromise: Promise.resolve('done'),
          nestedList: [Promise.resolve(1), {deep: Promise.resolve('ok')}],
        },
        settled => settled,
      );
      expect(result).toEqual({
        directPromise: 'done',
        nestedList: [1, {deep: 'ok'}],
      });
    });
  });

  describe('IframeMcpClient', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('resolves callTool when matching MCP_RESPONSE is received', async () => {
      const sentPayloads: Array<{
        requestId: string;
        server: string;
        toolName: string;
        args: Record<string, unknown>;
      }> = [];
      const client = new IframeMcpClient('fs', payload => {
        sentPayloads.push(payload);
      });

      const promise = client.callTool({name: 'list_dir', arguments: {path: '/root'}});
      expect(sentPayloads).toHaveLength(1);
      expect(sentPayloads[0].server).toBe('fs');
      expect(sentPayloads[0].toolName).toBe('list_dir');
      expect(sentPayloads[0].args).toEqual({path: '/root'});

      client.handleResponse({
        requestId: sentPayloads[0].requestId,
        result: {content: [{type: 'text', text: 'file1.txt'}]},
      });

      const result = await promise;
      expect(result).toEqual({content: [{type: 'text', text: 'file1.txt'}]});
    });

    it('rejects callTool when MCP_RESPONSE contains error', async () => {
      let reqId = '';
      const client = new IframeMcpClient('fs', payload => {
        reqId = payload.requestId;
      });

      const promise = client.callTool({name: 'fail_tool'});
      client.handleResponse({
        requestId: reqId,
        error: 'Server unreachable',
      });

      await expect(promise).rejects.toThrow('Server unreachable');
    });

    it('times out if no response is received within timeoutMs', async () => {
      const client = new IframeMcpClient('fs', () => {}, 1000);
      const promise = client.callTool({name: 'slow_tool'});
      vi.advanceTimersByTime(1001);
      await expect(promise).rejects.toThrow(/timed out/);
    });
  });

  describe('createMcpCatalogFunctions & Data Functions', () => {
    it('evaluates jmespath, split, regexCapture, regexReplace, updateDataModel, and callMcpTool', async () => {
      const mockClient = {
        callTool: vi.fn().mockResolvedValue({
          content: [{type: 'text', text: 'alpha,beta,gamma'}],
        }),
      };

      const procRef: {current?: MessageProcessor<ComponentApi>} = {};
      const mcpFunctions = createMcpCatalogFunctions(
        {
          processMessages: msgs => procRef.current?.processMessages(msgs),
        },
        async () => mockClient,
      );

      const catalog = new Catalog<ComponentApi>(
        'https://a2ui.org/specification/v0_9/catalogs/basic_with_mcp/catalog.json',
        [],
        mcpFunctions,
      );
      const processor = new MessageProcessor([catalog], () => {});
      procRef.current = processor;

      processor.processMessages([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 's1',
            catalogId: 'https://a2ui.org/specification/v0_9/catalogs/basic_with_mcp/catalog.json',
          },
        },
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 's1',
            value: {
              raw: 'item-123',
              items: 'one|two|three',
              nested: {a: {b: 'found'}},
            },
          },
        },
      ]);

      const surface = processor.model.getSurface('s1')!;
      expect(surface).toBeDefined();

      const splitFn = mcpFunctions.find(f => f.name === 'split')!;
      const jmesFn = mcpFunctions.find(f => f.name === 'jmespath')!;
      const captureFn = mcpFunctions.find(f => f.name === 'regexCapture')!;
      const replaceFn = mcpFunctions.find(f => f.name === 'regexReplace')!;

      const mockCtx = {
        resolveDynamicValue: (v: unknown) => v,
        set: (path: string, val: unknown) => surface.dataModel.set(path, val),
      } as unknown as Parameters<typeof splitFn.execute>[1];

      expect(splitFn.execute({value: 'a,b,c', separator: ','}, mockCtx)).toEqual(['a', 'b', 'c']);
      expect(jmesFn.execute({expression: 'a.b', data: {a: {b: 'found'}}}, mockCtx)).toBe('found');
      expect(() => jmesFn.execute({expression: 'invalid[[[', data: {}}, mockCtx)).toThrow(
        /JMESPath expression/,
      );
      expect(captureFn.execute({value: 'user-42', pattern: 'user-(\\d+)'}, mockCtx)).toEqual([
        '42',
      ]);
      expect(captureFn.execute({value: 'no-match', pattern: 'user-(\\d+)'}, mockCtx)).toBeNull();
      expect(
        replaceFn.execute({value: 'hello world', pattern: 'world', replacement: 'MCP'}, mockCtx),
      ).toBe('hello MCP');

      const updateFn = mcpFunctions.find(f => f.name === 'updateDataModel')!;
      updateFn.execute({updates: {'/title': 'Updated'}}, mockCtx);
      expect(surface.dataModel.get('/title')).toBe('Updated');
      expect(() =>
        updateFn.execute({updates: {'/a': 1}}, {resolveDynamicValue: (v: unknown) => v} as never),
      ).toThrow(/context\.set is not a function/);

      const callMcpFn = mcpFunctions.find(f => f.name === 'callMcpTool')!;
      const toolRes = await callMcpFn.execute(
        {name: 'list_dir', server: 'fs', arguments: {path: '/'}},
        mockCtx,
      );
      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: 'list_dir',
        arguments: {path: '/'},
      });
      expect(toolRes).toEqual({
        content: [{type: 'text', text: 'alpha,beta,gamma'}],
      });
    });

    it('supports callMcpTool with client.request, listTools, readResource, and error handling', async () => {
      const processedMsgs: unknown[] = [];
      const mockToolResult = {
        content: [
          {
            type: 'resource',
            resource: {
              uri: 'ui://inline',
              mimeType: A2UI_MIME_TYPE,
              text: JSON.stringify({
                version: 'v0.9',
                deleteSurface: {surfaceId: 'inline-surface'},
              }),
            },
          },
        ],
      };
      const fullClient = {
        request: vi.fn().mockResolvedValue(mockToolResult),
        listTools: vi.fn().mockResolvedValue({
          tools: [
            {
              name: 'rich_tool',
              _meta: {ui: {resourceUri: 'ui://tool-res'}},
            },
          ],
        }),
        readResource: vi.fn().mockResolvedValue({
          contents: [
            {
              uri: 'ui://tool-res',
              mimeType: A2UI_MIME_TYPE,
              text: JSON.stringify([
                {version: 'v0.9', deleteSurface: {surfaceId: 'fetched-surface'}},
              ]),
            },
          ],
        }),
      };

      const mcpFunctions = createMcpCatalogFunctions(
        {
          processMessages: msgs => processedMsgs.push(...msgs),
        },
        async server => {
          if (server === 'broken') {
            throw new Error('Server offline');
          }
          return fullClient;
        },
      );

      const callMcpFn = mcpFunctions.find(f => f.name === 'callMcpTool')!;
      const mockCtx = {
        resolveDynamicValue: (v: unknown) => v,
      } as never;

      const res = await callMcpFn.execute(
        {name: 'rich_tool', server: 'ok', arguments: {x: 1}},
        mockCtx,
      );
      expect(res).toBeDefined();
      expect(fullClient.request).toHaveBeenCalled();
      expect(fullClient.listTools).toHaveBeenCalled();
      expect(fullClient.readResource).toHaveBeenCalledTimes(1);
      expect(processedMsgs.length).toBeGreaterThanOrEqual(2);

      await expect(
        callMcpFn.execute({name: 'rich_tool', server: 'broken', arguments: {}}, mockCtx),
      ).rejects.toThrow(/Server offline/);
    });

    it('parses A2UI resources and UI resource URIs', () => {
      expect(
        readUiResourceUris({_meta: {ui: {resourceUri: ['ui://a', 'ui://a', 'ui://b']}}}),
      ).toEqual(['ui://a', 'ui://b']);
      expect(readUiResourceUris(null)).toEqual([]);

      const inlineMsgs = extractA2uiMessages([
        {
          type: 'resource',
          resource: {
            uri: 'ui://test',
            mimeType: A2UI_MIME_TYPE,
            text: JSON.stringify({
              version: 'v0.9',
              deleteSurface: {surfaceId: 's1'},
            }),
          },
        } as never,
      ]);
      expect(inlineMsgs).toEqual([{version: 'v0.9', deleteSurface: {surfaceId: 's1'}}]);

      const parsedMsgs = parseA2uiMessages(
        {
          contents: [
            {
              uri: 'ui://res',
              mimeType: A2UI_MIME_TYPE,
              text: JSON.stringify([{version: 'v0.9', deleteSurface: {surfaceId: 's2'}}]),
            },
          ],
        },
        'ui://res',
      );
      expect(parsedMsgs).toEqual([{version: 'v0.9', deleteSurface: {surfaceId: 's2'}}]);
    });
  });

  describe('PreviewBridge MCP integration', () => {
    it('routes MCP_REQUEST and MCP_RESPONSE across PreviewBridge', async () => {
      const bridge = new PreviewBridge();
      const sendSpy = vi.spyOn(bridge, 'sendMessage');

      const client = bridge.getMcpClient('fs');
      expect(bridge.getMcpClient('fs')).toBe(client);

      const callPromise = client.callTool({name: 'read_file', arguments: {path: '/a'}});
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: PreviewBridgeMessageType.MCP_REQUEST,
        }),
      );
      const sentRequest = sendSpy.mock.lastCall![0].payload as {requestId: string};

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          source: window.parent,
          data: {
            type: PreviewBridgeMessageType.MCP_RESPONSE,
            payload: {
              requestId: sentRequest.requestId,
              result: {ok: true},
            },
          },
        }),
      );

      await expect(callPromise).resolves.toEqual({ok: true});
      bridge.destroy();
    });
  });
});
