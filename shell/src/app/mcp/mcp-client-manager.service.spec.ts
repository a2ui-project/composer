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
import {McpClientManagerService} from './mcp-client-manager.service';
import {LocalStorageInteractions} from '../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../storage/models/local-storage-keys';

const connectMock = vi.fn();
const getServerVersionMock = vi.fn();
const listToolsMock = vi.fn();
const callToolMock = vi.fn();
const closeMock = vi.fn();

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
    constructor(readonly url: URL) {}
  },
}));

describe('McpClientManagerService', () => {
  let service: McpClientManagerService;
  let storageMap: Map<string, string>;
  let mockStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storageMap = new Map<string, string>();
    mockStorage = {
      getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
      setItem: vi.fn((key: string, val: string) => {
        storageMap.set(key, val);
      }),
    };

    connectMock.mockResolvedValue(undefined);
    getServerVersionMock.mockReturnValue({name: 'filesystem-mcp-server', version: '1.0.0'});
    listToolsMock.mockResolvedValue({
      tools: [
        {
          name: 'list_directory',
          description: 'Lists directory entries',
          inputSchema: {type: 'object'},
        },
      ],
    });
    callToolMock.mockResolvedValue({
      content: [{type: 'text', text: 'ok'}],
    });
    closeMock.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        McpClientManagerService,
        {provide: LocalStorageInteractions, useValue: mockStorage},
      ],
    });
    service = TestBed.inject(McpClientManagerService);
  });

  it('adds by URL, populates name from serverInfo, toggles, calls tool, and removes an MCP server', async () => {
    await service.addServer('http://localhost:3001/mcp');
    const servers = service.servers();
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe('filesystem-mcp-server');
    expect(servers[0].status).toBe('connected');
    expect(servers[0].tools).toHaveLength(1);
    expect(service.getActiveServersWithTools()).toHaveLength(1);

    const res = await service.callTool('list_directory', {path: '/tmp'});
    expect(callToolMock).toHaveBeenCalledWith({
      name: 'list_directory',
      arguments: {path: '/tmp'},
    });
    expect(res).toEqual({content: [{type: 'text', text: 'ok'}]});

    await service.toggleServer(servers[0].id, false);
    expect(service.servers()[0].enabled).toBe(false);
    expect(service.servers()[0].status).toBe('disconnected');

    await service.toggleServer(servers[0].id, true);
    expect(service.servers()[0].enabled).toBe(true);
    expect(service.servers()[0].status).toBe('connected');

    await service.connectServer(servers[0].id);
    expect(service.servers()[0].status).toBe('connected');

    await service.removeServer(servers[0].id);
    expect(service.servers()).toHaveLength(0);
  });

  it('handles connection failure and missing server callTool', async () => {
    connectMock.mockRejectedValueOnce(new Error('Connection refused'));
    await service.addServer('http://localhost:9999/mcp');
    expect(service.servers()[0].status).toBe('error');
    expect(service.servers()[0].errorMessage).toContain('Connection refused');

    await expect(service.callTool('unknown-tool', {})).rejects.toThrow(
      /No connected MCP server found/,
    );
  });

  it('hydrates saved servers from localStorage on initialization', () => {
    storageMap.set(
      LocalStorageKey.MCP_SERVERS,
      JSON.stringify([
        {
          id: 'saved-1',
          name: 'saved-fs',
          url: 'http://localhost:3001/mcp',
          enabled: false,
        },
      ]),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        McpClientManagerService,
        {provide: LocalStorageInteractions, useValue: mockStorage},
      ],
    });
    const hydratedService = TestBed.inject(McpClientManagerService);
    expect(hydratedService.servers()).toHaveLength(1);
    expect(hydratedService.servers()[0].name).toBe('saved-fs');
  });

  it('falls back to server name or url if getServerVersion returns a non-string name', async () => {
    getServerVersionMock.mockReturnValueOnce({name: {unexpected: 'object'}});
    await service.addServer('http://localhost:3002/mcp');
    expect(service.servers()[0].name).toBe('http://localhost:3002/mcp');
  });

  it('closes client and aborts connectServer if server is disabled while connecting', async () => {
    let resolveListTools!: (val: {tools: []}) => void;
    listToolsMock.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveListTools = resolve;
        }),
    );

    const addPromise = service.addServer('http://localhost:3003/mcp');
    await Promise.resolve();
    await Promise.resolve();
    const id = service.servers()[0].id;
    await service.toggleServer(id, false);
    resolveListTools({tools: []});
    await addPromise;

    expect(closeMock).toHaveBeenCalled();
    expect(service.servers()[0].status).toBe('disconnected');
  });
});
