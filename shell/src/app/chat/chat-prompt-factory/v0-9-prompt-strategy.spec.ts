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

import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {V09PromptStrategy} from './v0-9-prompt-strategy';

describe('V09PromptStrategy', () => {
  let strategy: V09PromptStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [V09PromptStrategy],
    });
    strategy = TestBed.inject(V09PromptStrategy);
  });

  it('has protocolVersion set to v0.9', () => {
    expect(strategy.protocolVersion).toBe('v0.9');
  });

  it('generates fallback prompt when no active catalog is provided', () => {
    const prompt = strategy.buildSystemPrompt({});
    expect(prompt).toContain('A2UI Generation Expert');
    expect(prompt).toContain('valid A2UI v0.9 interactive user interfaces');
    expect(prompt).not.toContain('Active Catalog Schema');
  });

  it('generates catalog-specific prompt with schema and v0.9 rules', () => {
    const catalog = {
      $id: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      components: {
        Column: {type: 'object'},
        Button: {type: 'object'},
      },
    };
    const prompt = strategy.buildSystemPrompt({activeCatalog: catalog});
    expect(prompt).toContain('Active Catalog Schema');
    expect(prompt).toContain('"version": "v0.9"');
    expect(prompt).toContain('createSurface -> updateComponents -> updateDataModel');
    expect(prompt).toContain('{"path":"/name"}');
  });

  it('includes multimodal guidelines when requested', () => {
    const catalog = {components: {}};
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: catalog,
      includeMultimodalGuidelines: true,
    });
    expect(prompt).toContain('## Multimodal & Image-to-UI Guidelines');
    expect(prompt).toContain('Visual Layout, Scope & Sizing Fidelity');
  });

  it('appends MCP instructions when active servers with tools are provided', () => {
    const catalog = {components: {}};
    const activeServers = [
      {
        id: 'srv-1',
        url: 'http://localhost:3001/mcp',
        enabled: true,
        status: 'connected' as const,
        tools: [
          {
            name: 'weather_lookup',
            description: 'Get current weather',
            inputSchema: {type: 'object', properties: {city: {type: 'string'}}},
          },
        ],
      },
    ];
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: catalog,
      activeServers,
    });
    expect(prompt).toContain('Available MCP Tools & Catalog Instructions');
    expect(prompt).toContain('weather_lookup');
    expect(prompt).toContain('"call": "callMcpTool"');
    expect(prompt).toContain('"path": "/mcp_arguments"');
  });

  it('appends custom instructions when provided', () => {
    const catalog = {components: {}};
    const prompt = strategy.buildSystemPrompt({
      activeCatalog: catalog,
      customInstructions: 'Prefer compact cards.',
    });
    expect(prompt).toContain('## Custom User Instructions');
    expect(prompt).toContain('Prefer compact cards.');
  });
});
