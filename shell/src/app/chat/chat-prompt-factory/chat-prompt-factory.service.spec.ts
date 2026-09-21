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
import {describe, it, expect, vi, beforeEach} from 'vitest';

import {TestBed} from '@angular/core/testing';
import {ChatPromptFactoryService} from './chat-prompt-factory.service';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {McpClientManagerService} from '../../mcp/mcp-client-manager.service';

describe('ChatPromptFactoryService', () => {
  let service: ChatPromptFactoryService;
  let catalogSpy: {
    activeCatalog: ReturnType<typeof vi.fn>;
    activeCatalogSignal: ReturnType<typeof vi.fn>;
  };
  let mcpSpy: {getActiveServersWithTools: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    catalogSpy = {activeCatalog: vi.fn(), activeCatalogSignal: vi.fn(() => null)};
    mcpSpy = {getActiveServersWithTools: vi.fn(() => [])};
    TestBed.configureTestingModule({
      providers: [
        ChatPromptFactoryService,
        {provide: CatalogManagement, useValue: catalogSpy},
        {provide: McpClientManagerService, useValue: mcpSpy},
      ],
    });
    service = TestBed.inject(ChatPromptFactoryService);
  });

  it('generate default prompt when no active catalog', () => {
    catalogSpy.activeCatalog.mockReturnValue(null);
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
    expect(service.systemPrompt()).not.toContain('Active Catalog Schema');
  });

  it('generate catalog specific prompt without MCP instructions when callMcpTool is absent', () => {
    mcpSpy.getActiveServersWithTools.mockReturnValue([
      {
        id: 'srv-1',
        name: 'fs-server',
        url: 'http://localhost:3001/mcp',
        enabled: true,
        status: 'connected',
        tools: [{name: 'read_file', description: 'Reads a file'}],
      },
    ]);
    catalogSpy.activeCatalog.mockReturnValue({components: {}});
    expect(service.systemPrompt()).toContain('Active Catalog Schema');
    expect(service.systemPrompt()).toContain('A2UI Generation Expert');
    expect(service.systemPrompt()).not.toContain('Available MCP Tools & Catalog Instructions');
  });

  it('appends active MCP tool names without server name or URL when callMcpTool is present in catalog functions', () => {
    mcpSpy.getActiveServersWithTools.mockReturnValue([
      {
        id: 'srv-1',
        name: 'fs-server',
        url: 'http://localhost:3001/mcp',
        enabled: true,
        status: 'connected',
        tools: [{name: 'read_file', description: 'Reads a file'}],
      },
    ]);
    catalogSpy.activeCatalog.mockReturnValue({
      components: {},
      functions: {callMcpTool: {type: 'object'}},
    });
    expect(service.systemPrompt()).toContain('Available MCP Tools & Catalog Instructions');
    expect(service.systemPrompt()).toContain('read_file');
    expect(service.systemPrompt()).not.toContain('fs-server');
    expect(service.systemPrompt()).not.toContain('http://localhost:3001/mcp');
  });
});
