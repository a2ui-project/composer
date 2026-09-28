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

import {Provider} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {McpClientManagerService} from './mcp-client-manager.service';
import {MCP_SERVER_CONNECTOR, McpServerConnection} from './mcp-server-connector';
import {ErrorLogger} from '../debug/error-logger.service';
import {LocalStorageInteractions} from '../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../storage/models/local-storage-keys';

const supportsMock = vi.fn();
const connectMock = vi.fn();
const listToolsMock = vi.fn();
const callToolMock = vi.fn();
const closeMock = vi.fn();

const fakeConnector = {supports: supportsMock, connect: connectMock};

function fakeConnection(overrides: Partial<McpServerConnection> = {}): McpServerConnection {
  return {
    serverName: 'filesystem-mcp-server',
    listTools: listToolsMock,
    callTool: callToolMock,
    close: closeMock,
    ...overrides,
  };
}

describe('McpClientManagerService', () => {
  let service: McpClientManagerService;
  let storageMap: Map<string, string>;
  let mockStorage: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
  };
  let mockErrorLogger: {
    error: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    log: ReturnType<typeof vi.fn>;
    withTag: ReturnType<typeof vi.fn>;
  };

  function createService(providers: Provider[] = []): McpClientManagerService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        McpClientManagerService,
        {provide: LocalStorageInteractions, useValue: mockStorage},
        {provide: MCP_SERVER_CONNECTOR, useValue: fakeConnector},
        ...providers,
      ],
    });
    return TestBed.inject(McpClientManagerService);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    storageMap = new Map<string, string>();
    mockStorage = {
      getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
      setItem: vi.fn((key: string, val: string) => {
        storageMap.set(key, val);
      }),
    };

    mockErrorLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
      withTag: vi.fn().mockReturnThis(),
    };

    supportsMock.mockImplementation((address: string) => address.startsWith('http'));
    connectMock.mockImplementation(async () => fakeConnection());
    listToolsMock.mockResolvedValue([
      {
        name: 'list_directory',
        description: 'Lists directory entries',
        inputSchema: {type: 'object'},
      },
    ]);
    callToolMock.mockResolvedValue({
      content: [{type: 'text', text: 'ok'}],
    });
    closeMock.mockResolvedValue(undefined);

    service = createService([{provide: ErrorLogger, useValue: mockErrorLogger}]);
  });

  it('adds by URL, populates name from serverInfo, toggles, calls tool, and removes an MCP server', async () => {
    await service.addServer('http://localhost:3001/mcp');
    expect(connectMock).toHaveBeenCalledWith('http://localhost:3001/mcp');
    const servers = service.servers();
    expect(servers).toHaveLength(1);
    expect(servers[0].name).toBe('filesystem-mcp-server');
    expect(servers[0].status).toBe('connected');
    expect(servers[0].tools).toHaveLength(1);
    expect(service.getActiveServersWithTools()).toHaveLength(1);

    const res = await service.callTool('list_directory', {path: '/tmp'});
    expect(callToolMock).toHaveBeenCalledWith('list_directory', {path: '/tmp'});
    expect(res).toEqual({content: [{type: 'text', text: 'ok'}]});

    await service.toggleServer(servers[0].id, false);
    expect(service.servers()[0].enabled).toBe(false);
    expect(service.servers()[0].status).toBe('disconnected');
    expect(closeMock).toHaveBeenCalledTimes(1);

    await service.toggleServer(servers[0].id, true);
    expect(service.servers()[0].enabled).toBe(true);
    expect(service.servers()[0].status).toBe('connected');

    await service.connectServer(servers[0].id);
    expect(service.servers()[0].status).toBe('connected');

    await service.removeServer(servers[0].id);
    expect(service.servers()).toHaveLength(0);
  });

  it('passes non-HTTP addresses to the connector unchanged and persists them', async () => {
    await service.addServer('  custom:my-server  ');
    expect(connectMock).toHaveBeenCalledWith('custom:my-server');
    expect(service.servers()[0].status).toBe('connected');
    expect(JSON.parse(storageMap.get(LocalStorageKey.MCP_SERVERS)!)).toEqual([
      {
        id: service.servers()[0].id,
        name: 'filesystem-mcp-server',
        url: 'custom:my-server',
        enabled: true,
      },
    ]);
  });

  it('routes callTool to the connection that owns the tool', async () => {
    const otherCallTool = vi.fn().mockResolvedValue({content: [{type: 'text', text: 'other'}]});
    connectMock.mockImplementation(async (address: string) =>
      address === 'http://other/mcp'
        ? fakeConnection({
            serverName: 'other-server',
            listTools: async () => [{name: 'other_tool'}],
            callTool: otherCallTool,
          })
        : fakeConnection(),
    );
    await service.addServer('http://localhost:3001/mcp');
    await service.addServer('http://other/mcp');

    expect(await service.callTool('other_tool', {q: 1})).toEqual({
      content: [{type: 'text', text: 'other'}],
    });
    expect(otherCallTool).toHaveBeenCalledWith('other_tool', {q: 1});
    expect(callToolMock).not.toHaveBeenCalled();

    await service.callTool('list_directory', {});
    expect(callToolMock).toHaveBeenCalledWith('list_directory', {});
    expect(otherCallTool).toHaveBeenCalledTimes(1);
  });

  it('handles connection failure and missing server callTool', async () => {
    connectMock.mockRejectedValueOnce(new Error('Connection refused'));
    await service.addServer('http://localhost:9999/mcp');
    expect(service.servers()[0].status).toBe('error');
    expect(service.servers()[0].errorMessage).toContain('Connection refused');
    expect(mockErrorLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed to connect to MCP server "http://localhost:9999/mcp": Connection refused',
      ),
      expect.any(Error),
    );

    await expect(service.callTool('unknown-tool', {})).rejects.toThrow(
      /No connected MCP server found/,
    );
    expect(mockErrorLogger.error).toHaveBeenCalledWith(
      'No connected MCP server found for tool "unknown-tool".',
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

    const hydratedService = createService([{provide: ErrorLogger, useValue: mockErrorLogger}]);
    expect(hydratedService.servers()).toHaveLength(1);
    expect(hydratedService.servers()[0].name).toBe('saved-fs');
    expect(connectMock).not.toHaveBeenCalled();
  });

  it('logs warning to ErrorLogger when persisted servers JSON is corrupted', () => {
    storageMap.set(LocalStorageKey.MCP_SERVERS, 'invalid-json{{{');

    const hydratedService = createService([{provide: ErrorLogger, useValue: mockErrorLogger}]);
    expect(hydratedService.servers()).toHaveLength(0);
    expect(mockErrorLogger.warn).toHaveBeenCalledWith(
      'Failed to parse persisted MCP servers:',
      expect.any(SyntaxError),
    );
  });

  it('logs error to ErrorLogger and rethrows when connection callTool fails', async () => {
    await service.addServer('http://localhost:3001/mcp');
    callToolMock.mockRejectedValueOnce(new Error('Tool RPC crashed'));

    await expect(service.callTool('list_directory', {})).rejects.toThrow('Tool RPC crashed');
    expect(mockErrorLogger.error).toHaveBeenCalledWith(
      'Failed to call MCP tool "list_directory" on server "filesystem-mcp-server":',
      expect.any(Error),
    );
  });

  it('falls back to server name or url if the connection reports no server name', async () => {
    connectMock.mockImplementationOnce(async () => fakeConnection({serverName: '  '}));
    await service.addServer('http://localhost:3002/mcp');
    expect(service.servers()[0].name).toBe('http://localhost:3002/mcp');
  });

  it('closes connection and aborts connectServer if server is disabled while connecting', async () => {
    let resolveListTools!: (val: []) => void;
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
    resolveListTools([]);
    await addPromise;

    expect(closeMock).toHaveBeenCalled();
    expect(service.servers()[0].status).toBe('disconnected');
    await expect(service.callTool('list_directory', {})).rejects.toThrow(
      /No connected MCP server found/,
    );
  });

  it('updates server URL, reconnects if enabled, and ignores empty, unchanged, or unknown IDs', async () => {
    await service.addServer('http://localhost:3001/mcp');
    const id = service.servers()[0].id;
    closeMock.mockClear();
    connectMock.mockClear();

    // Unchanged URL should return early without disconnecting or reconnecting
    await service.updateServerUrl(id, '  http://localhost:3001/mcp  ');
    expect(closeMock).not.toHaveBeenCalled();
    expect(connectMock).not.toHaveBeenCalled();

    await service.updateServerUrl(id, '   ');
    expect(service.servers()[0].url).toBe('http://localhost:3001/mcp');

    await service.updateServerUrl('non-existent-id', 'http://localhost:3009/mcp');
    expect(service.servers()[0].url).toBe('http://localhost:3001/mcp');

    let resolveDisconnect!: () => void;
    closeMock.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          resolveDisconnect = resolve;
        }),
    );
    connectMock.mockImplementationOnce(async () =>
      fakeConnection({serverName: 'updated-mcp-server'}),
    );

    const updatePromise = service.updateServerUrl(id, 'http://localhost:3005/mcp');
    // URL should be updated synchronously in the signal before disconnectServer completes
    expect(service.servers()[0].url).toBe('http://localhost:3005/mcp');
    expect(service.servers()[0].name).toBe('http://localhost:3005/mcp');
    expect(service.servers()[0].status).toBe('disconnected');

    resolveDisconnect();
    await updatePromise;
    expect(connectMock).toHaveBeenCalledWith('http://localhost:3005/mcp');
    expect(service.servers()[0].url).toBe('http://localhost:3005/mcp');
    expect(service.servers()[0].name).toBe('updated-mcp-server');
    expect(service.servers()[0].status).toBe('connected');
  });

  it('tests server connection when enabled or disabled, including error handling and closing connection in finally block', async () => {
    await service.addServer('http://localhost:3001/mcp');
    const id = service.servers()[0].id;

    // Test when enabled (happy path)
    await service.testServer(id);
    expect(service.servers()[0].status).toBe('connected');

    // Test when enabled (connection failure)
    connectMock.mockRejectedValueOnce(new Error('Enabled test failed'));
    await service.testServer(id);
    expect(service.servers()[0].status).toBe('error');
    expect(service.servers()[0].errorMessage).toContain('Enabled test failed');

    // Test when disabled (connects, lists tools, and closes connection)
    await service.toggleServer(id, false);
    expect(service.servers()[0].status).toBe('disconnected');
    closeMock.mockClear();
    await service.testServer(id);
    expect(service.servers()[0].status).toBe('connected');
    expect(closeMock).toHaveBeenCalledTimes(1);

    // Test when disabled and listTools throws: close() must still be called in finally block
    closeMock.mockClear();
    listToolsMock.mockRejectedValueOnce(new Error('listTools failed after connect'));
    await service.testServer(id);
    expect(service.servers()[0].status).toBe('error');
    expect(service.servers()[0].errorMessage).toContain('listTools failed after connect');
    expect(closeMock).toHaveBeenCalledTimes(1);

    // Test failure when disabled (connect fails)
    connectMock.mockRejectedValueOnce(new Error('Test connection failed'));
    await service.testServer(id);
    expect(service.servers()[0].status).toBe('error');
    expect(service.servers()[0].errorMessage).toContain('Test connection failed');
  });

  it('handles malformed localStorage JSON, multiple servers in list updates, and testServer with unknown ID', async () => {
    storageMap.set(LocalStorageKey.MCP_SERVERS, '{invalid-json');
    const malformedService = createService();
    expect(malformedService.servers()).toEqual([]);

    await malformedService.addServer('http://localhost:3001/mcp');
    await malformedService.addServer('http://localhost:3002/mcp');
    const firstId = malformedService.servers()[0].id;
    await malformedService.updateServerUrl(firstId, 'http://localhost:3003/mcp');
    expect(malformedService.servers()[0].url).toBe('http://localhost:3003/mcp');
    expect(malformedService.servers()[1].url).toBe('http://localhost:3002/mcp');

    await malformedService.testServer('non-existent');
    expect(malformedService.servers()).toHaveLength(2);
  });

  it('checks whether a catalog supports MCP via doesCatalogSupportMcp', () => {
    expect(service.doesCatalogSupportMcp(null)).toBe(false);
    expect(service.doesCatalogSupportMcp(undefined)).toBe(false);
    expect(service.doesCatalogSupportMcp({functions: {required: {}}})).toBe(false);
    expect(service.doesCatalogSupportMcp({functions: {callMcpTool: {}}})).toBe(true);
    expect(service.doesCatalogSupportMcp({$defs: {callMcpTool: {}}})).toBe(true);
    expect(service.doesCatalogSupportMcp({$defs: {catalog_callMcpTool: {}}})).toBe(true);
  });
});
