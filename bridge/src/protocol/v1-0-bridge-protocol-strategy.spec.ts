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

import {describe, it, expect} from 'vitest';
import {
  AgentToRendererMessageSchema,
  Catalog,
  FunctionDefinitionSchema,
  MessageProcessor,
  RendererToAgentMessageSchema,
  basicCatalog,
} from '@a2ui/web_core/v1_0';
import {createMcpFunctionsCatalog, MCP_FUNCTIONS_CATALOG_ID} from '../mcp/v1-0-mcp-catalog.js';
import {V10BridgeProtocolStrategy} from './v1-0-bridge-protocol-strategy';

describe('V10BridgeProtocolStrategy', () => {
  const strategy = new V10BridgeProtocolStrategy();

  it('exposes version "v1.0"', () => {
    expect(strategy.version).toBe('v1.0');
  });

  describe('normalizeIncomingMessages', () => {
    it('normalizes various v1 version formats to canonical 1.0', () => {
      const messages = [
        {version: 'v1.0', createSurface: {surfaceId: 's1'}},
        {version: '1.0', createSurface: {surfaceId: 's2'}},
        {version: 'v1.1', createSurface: {surfaceId: 's3'}},
        {version: '1.2', createSurface: {surfaceId: 's4'}},
        {version: 'v0.9', createSurface: {surfaceId: 's5'}},
      ];
      strategy.normalizeIncomingMessages(messages);
      expect(messages[0].version).toBe('1.0');
      expect(messages[1].version).toBe('1.0');
      expect(messages[2].version).toBe('1.0');
      expect(messages[3].version).toBe('1.0');
      expect(messages[4].version).toBe('v0.9');
    });
  });

  describe('extractSurfaceIdsToReset', () => {
    it('extracts unique surfaceIds from createSurface commands with 1.0 and v1.0', () => {
      const messages = [
        {
          version: '1.0',
          createSurface: {surfaceId: 'surf-a', catalogId: 'cat-1'},
        },
        {
          version: 'v1.0',
          updateComponents: {surfaceId: 'surf-a', components: []},
        },
        {
          version: '1.0',
          createSurface: {surfaceId: 'surf-b', catalogId: 'cat-2'},
        },
        {
          version: 'v1.0',
          createSurface: {surfaceId: 'surf-a', catalogId: 'cat-1'},
        },
      ];
      expect(strategy.extractSurfaceIdsToReset(messages)).toEqual(['surf-a', 'surf-b']);
    });
  });

  describe('buildDeleteSurfaceItem', () => {
    it('constructs a canonical 1.0 deleteSurface item', () => {
      expect(strategy.buildDeleteSurfaceItem('surf-target')).toEqual({
        version: '1.0',
        deleteSurface: {
          surfaceId: 'surf-target',
        },
      });
    });
  });

  describe('buildSyntheticEnvelope', () => {
    it('stamps canonical wire version 1.0 on action envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('action', {name: 'submit'});
      expect(env).toEqual({
        version: '1.0',
        action: {name: 'submit'},
      });
    });

    it('stamps canonical wire version 1.0 on dataModelChange envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('dataModelChange', {
        surfaceId: 's1',
        value: 456,
      });
      expect(env).toEqual({
        version: '1.0',
        updateDataModel: {
          surfaceId: 's1',
          value: 456,
        },
      });
    });

    it('stamps canonical wire version 1.0 on error envelopes', () => {
      const env = strategy.buildSyntheticEnvelope('error', {
        message: 'v1.0 error occurred',
      });
      expect(env).toEqual({
        version: '1.0',
        error: {
          message: 'v1.0 error occurred',
        },
      });
    });
  });

  describe('v1.0 schema and wire validation', () => {
    it('validates canonical v1.0 createSurface and updateComponents against AgentToRendererMessageSchema', () => {
      const starterPayload = [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          },
        },
        {
          version: '1.0',
          updateComponents: {
            surfaceId: 'sample-surface',
            components: [
              {
                id: 'root',
                component: 'Card',
                child: 'title_text',
              },
              {
                id: 'title_text',
                component: 'Text',
                text: 'Hello World',
              },
            ],
          },
        },
      ];

      for (const item of starterPayload) {
        const parsed = AgentToRendererMessageSchema.safeParse(item);
        expect(parsed.success).toBe(true);
      }

      const blankPayload = [
        {
          version: '1.0',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json',
          },
        },
      ];
      expect(AgentToRendererMessageSchema.safeParse(blankPayload[0]).success).toBe(true);

      expect(
        AgentToRendererMessageSchema.safeParse({
          version: '1.0',
          createSurface: {surfaceId: 'main', components: []},
        }).success,
      ).toBe(false);

      expect(
        AgentToRendererMessageSchema.safeParse({
          version: 'v1.0',
          createSurface: {surfaceId: 'main'},
        }).success,
      ).toBe(false);

      const processor = new MessageProcessor([basicCatalog], () => {});
      processor.processMessages(starterPayload);
      expect(processor.model.getSurface('sample-surface')).toBeDefined();
    });

    it('validates createMcpFunctionsCatalog() output against canonical FunctionDefinitionSchema and Catalog.fromJson()', () => {
      const mcpCatalog = createMcpFunctionsCatalog();
      const doc = mcpCatalog.toJson() as {
        $id?: string;
        protocolVersion?: string;
        functions?: Record<string, Record<string, unknown>>;
      };
      expect(doc.$id).toBe(MCP_FUNCTIONS_CATALOG_ID);

      const fnNames = [
        'callMcpTool',
        'jmespath',
        'regexCapture',
        'regexReplace',
        'split',
        'updateDataModel',
      ];
      for (const fnName of fnNames) {
        const fnDef = doc.functions?.[fnName];
        expect(fnDef).toBeDefined();
        const parsed = FunctionDefinitionSchema.safeParse(fnDef);
        expect(parsed.success).toBe(true);
      }

      const roundTripped = Catalog.fromJson(doc);
      expect(roundTripped.id).toBe(MCP_FUNCTIONS_CATALOG_ID);
      expect(roundTripped.protocolVersion).toBe('1.0');
      expect([...roundTripped.functions.keys()].sort()).toEqual(fnNames.sort());
    });

    it('validates v1.0 RPC and bidirectional wire envelopes against AgentToRendererMessageSchema and RendererToAgentMessageSchema', () => {
      const deleteEnv = strategy.buildDeleteSurfaceItem('surf-1');
      expect(AgentToRendererMessageSchema.safeParse(deleteEnv).success).toBe(true);

      const dataModelEnv = strategy.buildSyntheticEnvelope('dataModelChange', {
        surfaceId: 'surf-1',
        path: '/user',
        value: {name: 'Ada'},
      });
      expect(AgentToRendererMessageSchema.safeParse(dataModelEnv).success).toBe(true);

      const errorEnv = strategy.buildSyntheticEnvelope('error', {
        code: 'RUNTIME_FAILURE',
        surfaceId: 'surf-1',
        message: 'Failed to evaluate binding',
      });
      expect(RendererToAgentMessageSchema.safeParse(errorEnv).success).toBe(true);

      const agentFnSuccess = {
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fc-101',
          value: {approved: true},
        },
      };
      expect(AgentToRendererMessageSchema.safeParse(agentFnSuccess).success).toBe(true);

      const agentFnError = {
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fc-102',
          error: {code: 'NO_AGENT_CONNECTED', message: 'No agent connected'},
        },
      };
      expect(AgentToRendererMessageSchema.safeParse(agentFnError).success).toBe(true);

      const callRendererFn = {
        version: '1.0',
        callRendererFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'rc-201',
          callFunction: {
            ['@call']: 'split',
            catalogId: MCP_FUNCTIONS_CATALOG_ID,
            args: {value: 'a,b', separator: ','},
          },
        },
      };
      expect(AgentToRendererMessageSchema.safeParse(callRendererFn).success).toBe(true);

      const callAgentFn = {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'fc-101',
          callFunction: {
            ['@call']: 'approveBooking',
            catalogId: 'https://example.com/agent-catalog.json',
            args: {bookingId: 'b-1'},
          },
        },
      };
      expect(RendererToAgentMessageSchema.safeParse(callAgentFn).success).toBe(true);

      const rendererFnResponse = {
        version: '1.0',
        rendererFunctionResponse: {
          functionCallId: 'rc-201',
          value: ['a', 'b'],
        },
      };
      expect(RendererToAgentMessageSchema.safeParse(rendererFnResponse).success).toBe(true);

      const actionMsg = {
        version: '1.0',
        action: {
          name: 'searchCars',
          surfaceId: 'surf-1',
          sourceComponentId: 'book_button',
          timestamp: '2026-11-05T00:00:00Z',
          context: {location: 'SFO'},
        },
      };
      expect(RendererToAgentMessageSchema.safeParse(actionMsg).success).toBe(true);
    });
  });
});
