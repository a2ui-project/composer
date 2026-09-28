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

import {TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {MCP_SERVER_CONNECTOR} from './mcp-server-connector';
import {SdkHttpMcpConnector} from './sdk-http-mcp-connector';

const connectMock = vi.fn();
const getServerVersionMock = vi.fn();
const listToolsMock = vi.fn();
const callToolMock = vi.fn();
const closeMock = vi.fn();
const transportUrls: URL[] = [];

vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: class {
    connect = connectMock;
    getServerVersion = getServerVersionMock;
    listTools = listToolsMock;
    callTool = callToolMock;
    close = closeMock;
  },
}));

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: class {
    constructor(readonly url: URL) {
      transportUrls.push(url);
    }
  },
}));

describe('SdkHttpMcpConnector', () => {
  let connector: SdkHttpMcpConnector;

  beforeEach(() => {
    vi.clearAllMocks();
    transportUrls.length = 0;
    connectMock.mockResolvedValue(undefined);
    getServerVersionMock.mockReturnValue({name: 'filesystem-mcp-server', version: '1.0.0'});
    listToolsMock.mockResolvedValue({
      tools: [
        {
          name: 'list_directory',
          description: 'Lists directory entries',
          inputSchema: {type: 'object'},
          outputSchema: {type: 'object', properties: {entries: {type: 'array'}}},
        },
      ],
    });
    callToolMock.mockResolvedValue({content: [{type: 'text', text: 'ok'}]});
    closeMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({});
    connector = TestBed.inject(SdkHttpMcpConnector);
  });

  it('is the default MCP_SERVER_CONNECTOR', () => {
    expect(TestBed.inject(MCP_SERVER_CONNECTOR)).toBe(connector);
    expect(connector.addressHint).toBe('http://localhost:3001/mcp');
  });

  it('supports only http(s) URLs', () => {
    expect(connector.supports('http://localhost:3001/mcp')).toBe(true);
    expect(connector.supports('https://example.com/mcp')).toBe(true);
    expect(connector.supports('')).toBe(false);
    expect(connector.supports('not-a-valid-url')).toBe(false);
    expect(connector.supports('localhost:3001')).toBe(false);
    expect(connector.supports('ftp://example.com/mcp')).toBe(false);
    expect(connector.supports('custom:my-server')).toBe(false);
  });

  it('connects over Streamable HTTP and maps tools', async () => {
    const connection = await connector.connect('http://localhost:3001/mcp');

    expect(transportUrls.map(u => u.href)).toEqual(['http://localhost:3001/mcp']);
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(connection.serverName).toBe('filesystem-mcp-server');
    expect(await connection.listTools()).toEqual([
      {
        name: 'list_directory',
        description: 'Lists directory entries',
        inputSchema: {type: 'object'},
        outputSchema: {type: 'object', properties: {entries: {type: 'array'}}},
      },
    ]);
  });

  it('ignores a non-string server name', async () => {
    getServerVersionMock.mockReturnValueOnce({name: {unexpected: 'object'}});
    const connection = await connector.connect('http://localhost:3001/mcp');
    expect(connection.serverName).toBeUndefined();
  });

  it('delegates callTool and close to the SDK client', async () => {
    const connection = await connector.connect('http://localhost:3001/mcp');

    expect(await connection.callTool('list_directory', {path: '/tmp'})).toEqual({
      content: [{type: 'text', text: 'ok'}],
    });
    expect(callToolMock).toHaveBeenCalledWith({name: 'list_directory', arguments: {path: '/tmp'}});

    await connection.close();
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('propagates connection errors', async () => {
    connectMock.mockRejectedValueOnce(new Error('Connection refused'));
    await expect(connector.connect('http://localhost:9999/mcp')).rejects.toThrow(
      'Connection refused',
    );
  });
});
