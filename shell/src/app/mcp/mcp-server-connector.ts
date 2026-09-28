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

import {InjectionToken, inject} from '@angular/core';
import type {McpToolInfo} from './mcp-client-manager.service';
import {SdkHttpMcpConnector} from './sdk-http-mcp-connector';

/** A live connection to one MCP server. */
export interface McpServerConnection {
  /** Server-reported name (from initialize), if any. */
  readonly serverName?: string;
  listTools(): Promise<McpToolInfo[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
  close(): Promise<void>;
}

/** Turns a user-entered server address into a connection. */
export interface McpServerConnector {
  /** Whether this connector handles `address`; also validates user input. */
  supports(address: string): boolean;
  connect(address: string): Promise<McpServerConnection>;
  /** Example address shown as the "Add MCP Server" placeholder. */
  readonly addressHint?: string;
}

/**
 * Connector used by `McpClientManagerService`. Defaults to Streamable HTTP; hosts can override it
 * to support other transports.
 */
export const MCP_SERVER_CONNECTOR = new InjectionToken<McpServerConnector>('MCP_SERVER_CONNECTOR', {
  providedIn: 'root',
  factory: () => inject(SdkHttpMcpConnector),
});
