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

import {Injectable} from '@angular/core';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {isValidHttpUrl} from '../utils/url';
import type {McpToolInfo} from './mcp-client-manager.service';
import type {McpServerConnection, McpServerConnector} from './mcp-server-connector';

/** Connects to MCP servers over Streamable HTTP using the MCP TypeScript SDK. */
@Injectable({
  providedIn: 'root',
})
export class SdkHttpMcpConnector implements McpServerConnector {
  readonly addressHint = 'http://localhost:3001/mcp';

  supports(address: string): boolean {
    return isValidHttpUrl(address);
  }

  async connect(address: string): Promise<McpServerConnection> {
    const transport = new StreamableHTTPClientTransport(new URL(address));
    const client = new Client({name: 'a2ui-composer', version: '1.0.0'});
    await client.connect(transport);
    const rawName = client.getServerVersion?.()?.name;

    return {
      serverName: typeof rawName === 'string' ? rawName : undefined,
      listTools: async (): Promise<McpToolInfo[]> => {
        const toolsRes = await client.listTools();
        return (toolsRes?.tools ?? []).map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema as Record<string, unknown> | undefined,
          outputSchema: (t as unknown as {outputSchema?: Record<string, unknown>}).outputSchema,
        }));
      },
      callTool: (name, args) => client.callTool({name, arguments: args}),
      close: () => client.close(),
    };
  }
}
