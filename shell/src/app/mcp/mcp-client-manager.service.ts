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

import {Injectable, inject, signal} from '@angular/core';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {ErrorLogger} from '../debug/error-logger.service';
import {LocalStorageInteractions} from '../storage/local-storage-interactions/local-storage-interactions';
import {Catalog} from '../storage/models/catalog-storage.model';
import {LocalStorageKey} from '../storage/models/local-storage-keys';

export interface McpToolInfo {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface McpServerConfig {
  id: string;
  name?: string;
  url: string;
  enabled: boolean;
  status?: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
  tools?: McpToolInfo[];
}

interface PersistedMcpServer {
  id: string;
  name?: string;
  url: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class McpClientManagerService {
  private readonly storage = inject(LocalStorageInteractions);
  private readonly errorLogger = inject(ErrorLogger).withTag('[McpClientManager]');
  private readonly clients = new Map<string, Client>();

  readonly servers = signal<McpServerConfig[]>([]);

  constructor() {
    this.loadFromStorage();
    for (const server of this.servers()) {
      if (server.enabled) {
        void this.connectServer(server.id);
      }
    }
  }

  /**
   * Checks whether the active catalog includes `callMcpTool` to determine if the renderer supports MCP mode.
   */
  doesCatalogSupportMcp(catalog: Catalog | null | undefined): boolean {
    if (!catalog) {
      return false;
    }
    if (catalog.functions && 'callMcpTool' in catalog.functions) {
      return true;
    }
    if (
      catalog.$defs &&
      ('callMcpTool' in catalog.$defs || 'catalog_callMcpTool' in catalog.$defs)
    ) {
      return true;
    }
    return false;
  }

  private loadFromStorage(): void {
    const rawServers = this.storage.getItem(LocalStorageKey.MCP_SERVERS);
    if (rawServers) {
      try {
        const parsed = JSON.parse(rawServers) as PersistedMcpServer[];
        if (Array.isArray(parsed)) {
          this.servers.set(
            parsed.map(s => ({
              id: s.id,
              name: s.name || s.url,
              url: s.url,
              enabled: Boolean(s.enabled),
              status: 'disconnected',
              tools: [],
            })),
          );
        }
      } catch (err) {
        this.errorLogger.warn('Failed to parse persisted MCP servers:', err);
        this.servers.set([]);
      }
    }
  }

  private persistServers(): void {
    const toSave: PersistedMcpServer[] = this.servers().map(s => ({
      id: s.id,
      name: s.name,
      url: s.url,
      enabled: s.enabled,
    }));
    this.storage.setItem(LocalStorageKey.MCP_SERVERS, JSON.stringify(toSave));
  }

  async addServer(url: string): Promise<void> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `mcp-srv-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const newServer: McpServerConfig = {
      id,
      name: trimmedUrl,
      url: trimmedUrl,
      enabled: true,
      status: 'disconnected',
      tools: [],
    };

    this.servers.update(list => [...list, newServer]);
    this.persistServers();
    await this.connectServer(id);
  }

  async updateServerUrl(id: string, url: string): Promise<void> {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    const existing = this.servers().find(s => s.id === id);
    if (!existing) return;

    await this.disconnectServer(id);

    this.servers.update(list =>
      list.map(s =>
        s.id === id
          ? {
              ...s,
              name: trimmedUrl,
              url: trimmedUrl,
              status: 'disconnected',
              errorMessage: undefined,
              tools: [],
            }
          : s,
      ),
    );
    this.persistServers();

    const updated = this.servers().find(s => s.id === id);
    if (updated?.enabled) {
      await this.connectServer(id);
    }
  }

  async removeServer(id: string): Promise<void> {
    await this.disconnectServer(id);
    this.servers.update(list => list.filter(s => s.id !== id));
    this.persistServers();
  }

  async toggleServer(id: string, enabled: boolean): Promise<void> {
    this.servers.update(list => list.map(s => (s.id === id ? {...s, enabled} : s)));
    this.persistServers();
    if (enabled) {
      await this.connectServer(id);
    } else {
      await this.disconnectServer(id);
    }
  }

  async testServer(id: string): Promise<void> {
    const server = this.servers().find(s => s.id === id);
    if (!server) return;

    if (server.enabled) {
      await this.connectServer(id);
      return;
    }

    this.servers.update(list =>
      list.map(s => (s.id === id ? {...s, status: 'connecting', errorMessage: undefined} : s)),
    );

    try {
      const transport = new StreamableHTTPClientTransport(new URL(server.url));
      const client = new Client({name: 'a2ui-composer', version: '1.0.0'});
      await client.connect(transport);
      const serverInfo = client.getServerVersion?.();
      const rawName = serverInfo?.name;
      const resolvedName =
        (typeof rawName === 'string' ? rawName.trim() : '') || server.name || server.url;
      const toolsRes = await client.listTools();
      const discoveredTools: McpToolInfo[] = (toolsRes?.tools ?? []).map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema as Record<string, unknown> | undefined,
        outputSchema: (t as unknown as {outputSchema?: Record<string, unknown>}).outputSchema,
      }));

      try {
        await client.close();
      } catch {
        // Ignore close errors after test
      }

      this.servers.update(list =>
        list.map(s =>
          s.id === id
            ? {
                ...s,
                name: resolvedName,
                status: 'connected',
                errorMessage: undefined,
                tools: discoveredTools,
              }
            : s,
        ),
      );
      this.persistServers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.servers.update(list =>
        list.map(s =>
          s.id === id
            ? {
                ...s,
                status: 'error',
                errorMessage,
                tools: [],
              }
            : s,
        ),
      );
    }
  }

  async connectServer(id: string): Promise<void> {
    const server = this.servers().find(s => s.id === id);
    if (!server || !server.enabled) return;

    await this.disconnectServer(id);

    const activeBeforeConnect = this.servers().find(s => s.id === id);
    if (!activeBeforeConnect || !activeBeforeConnect.enabled) return;

    this.servers.update(list =>
      list.map(s => (s.id === id ? {...s, status: 'connecting', errorMessage: undefined} : s)),
    );

    try {
      const transport = new StreamableHTTPClientTransport(new URL(server.url));
      const client = new Client({name: 'a2ui-composer', version: '1.0.0'});
      await client.connect(transport);
      const serverInfo = client.getServerVersion?.();
      const rawName = serverInfo?.name;
      const resolvedName =
        (typeof rawName === 'string' ? rawName.trim() : '') || server.name || server.url;
      const toolsRes = await client.listTools();
      const discoveredTools: McpToolInfo[] = (toolsRes.tools ?? []).map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema as Record<string, unknown> | undefined,
        outputSchema: (t as unknown as {outputSchema?: Record<string, unknown>}).outputSchema,
      }));

      const currentServer = this.servers().find(s => s.id === id);
      if (!currentServer || !currentServer.enabled) {
        try {
          await client.close();
        } catch (err) {
          this.errorLogger.warn(
            `Failed to close client during connect abort for server "${server.name || server.url}":`,
            err,
          );
        }
        return;
      }

      this.clients.set(id, client);
      this.servers.update(list =>
        list.map(s =>
          s.id === id
            ? {
                ...s,
                name: resolvedName,
                status: 'connected',
                errorMessage: undefined,
                tools: discoveredTools,
              }
            : s,
        ),
      );
      this.persistServers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.errorLogger.error(
        `Failed to connect to MCP server "${server.name || server.url}": ${errorMessage}`,
        error,
      );
      this.servers.update(list =>
        list.map(s =>
          s.id === id
            ? {
                ...s,
                status: 'error',
                errorMessage,
                tools: [],
              }
            : s,
        ),
      );
    }
  }

  async disconnectServer(id: string): Promise<void> {
    const existing = this.clients.get(id);
    if (existing) {
      this.clients.delete(id);
      try {
        await existing.close();
      } catch (err) {
        this.errorLogger.warn(`Failed to close client during disconnect for server "${id}":`, err);
      }
    }
    this.servers.update(list =>
      list.map(s => (s.id === id ? {...s, status: 'disconnected', errorMessage: undefined} : s)),
    );
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const activeServers = this.getActiveServersWithTools();
    const targetServer = activeServers.find(s => s.tools?.some(t => t.name === toolName));
    if (!targetServer) {
      const message = `No connected MCP server found for tool "${toolName}".`;
      this.errorLogger.error(message);
      throw new Error(message);
    }

    const client = this.clients.get(targetServer.id);
    if (!client) {
      const message = `MCP client for server "${targetServer.name || targetServer.url}" is not initialized.`;
      this.errorLogger.error(message);
      throw new Error(message);
    }

    try {
      return await client.callTool({
        name: toolName,
        arguments: args,
      });
    } catch (err) {
      this.errorLogger.error(
        `Failed to call MCP tool "${toolName}" on server "${targetServer.name || targetServer.url}":`,
        err,
      );
      throw err;
    }
  }

  getActiveServersWithTools(): McpServerConfig[] {
    return this.servers().filter(s => s.enabled && s.status === 'connected');
  }
}
