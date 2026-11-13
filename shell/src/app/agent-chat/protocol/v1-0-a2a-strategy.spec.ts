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
import {V10A2aStrategy} from './v1-0-a2a-strategy';
import type {CatalogJson} from '../../storage/models/catalog-storage.model';

describe('V10A2aStrategy', () => {
  const strategy = new V10A2aStrategy();

  it('exposes canonical v1.0 wire version constants', () => {
    expect(strategy.version).toBe('v1.0');
    expect(strategy.canonicalWireVersion).toBe('1.0');
    expect(strategy.mimeType).toBe('application/a2ui+json');
  });

  describe('getClientConfiguration', () => {
    it('advertises standard v1.0 extension URI and acceptedOutputModes without non-standard capabilities', () => {
      const activeCatalogs = [
        {
          ['$id']: 'https://a2ui.org/specification/v1_0/basic_catalog.json',
          title: 'Basic Catalog',
        },
        {
          ['$id']: 'https://company.org/catalogs/mcp_functions.json',
          title: 'MCP Catalog',
        },
      ] as unknown as CatalogJson[];
      const config = strategy.getClientConfiguration(activeCatalogs);
      expect(config['extensions']).toEqual(['https://a2ui.org/a2a-extension/a2ui/v1.0']);
      expect(config['acceptedOutputModes']).toEqual([
        'text/plain',
        'application/json',
        'application/a2ui+json',
      ]);
      expect(config['capabilities']).toBeUndefined();
      expect(config['supportedCatalogIds']).toBeUndefined();
    });

    it('handles empty activeCatalogs gracefully', () => {
      const config = strategy.getClientConfiguration([]);
      expect(config['extensions']).toEqual(['https://a2ui.org/a2a-extension/a2ui/v1.0']);
      expect(config['acceptedOutputModes']).toEqual([
        'text/plain',
        'application/json',
        'application/a2ui+json',
      ]);
      expect(config['capabilities']).toBeUndefined();
      expect(config['supportedCatalogIds']).toBeUndefined();
    });
  });

  describe('normalizeWireVersion', () => {
    it('accepts 1.0 and v1.0 and normalizes to canonical 1.0 without leading v', () => {
      expect(strategy.normalizeWireVersion('1.0')).toBe('1.0');
      expect(strategy.normalizeWireVersion('v1.0')).toBe('1.0');
      expect(strategy.normalizeWireVersion(undefined)).toBe('1.0');
      expect(strategy.normalizeWireVersion('v0.9')).toBe('1.0');
    });
  });

  describe('buildActionDataPart', () => {
    it('formats outbound action DataPart with canonical version 1.0, userMessage, and metadata nested inside action', () => {
      const action = {name: 'submitOrder', context: {orderId: 'xyz'}};
      const part = strategy.buildActionDataPart(action, 'Please confirm my order', {clientTs: 123});
      expect(part).toEqual({
        data: {
          ['version']: '1.0',
          ['action']: {
            ...action,
            userMessage: 'Please confirm my order',
            metadata: {clientTs: 123},
          },
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_action',
        },
      });
      expect(Object.keys(part.data as Record<string, unknown>)).toEqual(['version', 'action']);
    });

    it('omits userMessage and metadata when undefined', () => {
      const action = {name: 'simpleClick'};
      const part = strategy.buildActionDataPart(action);
      expect(part).toEqual({
        data: {
          ['version']: '1.0',
          ['action']: action,
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_action',
        },
      });
    });
  });

  describe('buildCallAgentFunctionDataPart', () => {
    it('formats outbound callAgentFunction DataPart with version 1.0', () => {
      const payload = {
        surfaceId: 'surf-main',
        functionCallId: 'rpc-call-1',
        callFunction: {
          ['@call']: 'fetchWeather',
          args: {city: 'San Francisco'},
        },
      };
      const part = strategy.buildCallAgentFunctionDataPart(payload);
      expect(part).toEqual({
        data: {
          ['version']: '1.0',
          ['callAgentFunction']: payload,
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_call_agent_function',
        },
      });
    });
  });

  describe('buildRendererFunctionResponseDataPart', () => {
    it('formats outbound rendererFunctionResponse DataPart with version 1.0', () => {
      const payload = {
        functionCallId: 'rpc-call-2',
        value: {coords: {lat: 37.77, lon: -122.41}},
      };
      const part = strategy.buildRendererFunctionResponseDataPart(payload);
      expect(part).toEqual({
        data: {
          ['version']: '1.0',
          ['rendererFunctionResponse']: payload,
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_renderer_function_response',
        },
      });
    });
  });

  describe('isA2uiItem', () => {
    it('recognizes v1.0 surface updates and RPC operations', () => {
      expect(strategy.isA2uiItem({createSurface: {surfaceId: 's1'}})).toBe(true);
      expect(strategy.isA2uiItem({updateComponents: {surfaceId: 's1', components: []}})).toBe(true);
      expect(strategy.isA2uiItem({updateDataModel: {surfaceId: 's1', value: {}}})).toBe(true);
      expect(strategy.isA2uiItem({deleteSurface: {surfaceId: 's1'}})).toBe(true);
      expect(strategy.isA2uiItem({callRendererFunction: {functionCallId: 'fn-1'}})).toBe(true);
      expect(strategy.isA2uiItem({agentFunctionResponse: {functionCallId: 'fn-2'}})).toBe(true);
      expect(strategy.isA2uiItem({callAgentFunctionResponse: {functionCallId: 'fn-3'}})).toBe(true);
    });

    it('rejects non-A2UI objects', () => {
      expect(strategy.isA2uiItem(null)).toBe(false);
      expect(strategy.isA2uiItem({})).toBe(false);
      expect(strategy.isA2uiItem({name: 'randomTool', args: {}})).toBe(false);
    });
  });

  describe('normalizeItems', () => {
    it('normalizes single-message createSurface with inline components and dataModel to canonical 1.0', () => {
      const raw = [
        {
          ['__proto__']: {polluted: true},
          version: 'v1.0',
          createSurface: {
            surfaceId: 'surf_v1',
            catalogId: 'https://a2ui.org/specification/v1_0/basic_catalog.json',
            sendDataModel: true,
            dataModel: {user: 'Alice'},
            components: [
              {
                id: 'root',
                component: 'Card',
                children: ['t1'],
                ['constructor']: {bad: true},
              },
              {id: 't1', component: 'Text', text: 'Hello Alice'},
            ] as unknown as Record<string, unknown>[],
          },
        },
      ];
      const normalized = strategy.normalizeItems(raw);
      expect(normalized.length).toBe(1);
      expect(normalized[0].version).toBe('1.0');
      expect(Object.hasOwn(normalized[0], '__proto__')).toBe(false);

      const cs = normalized[0].createSurface;
      expect(cs).toBeDefined();
      expect(cs?.surfaceId).toBe('surf_v1');
      expect(cs?.catalogId).toBe('https://a2ui.org/specification/v1_0/basic_catalog.json');
      expect(cs?.sendDataModel).toBe(true);
      expect(cs?.dataModel).toEqual({user: 'Alice'});
      expect(cs?.components?.length).toBe(2);
      expect(Object.hasOwn(cs?.components?.[0] as Record<string, unknown>, 'constructor')).toBe(
        false,
      );
    });

    it('normalizes callRendererFunction and agentFunctionResponse items to canonical 1.0', () => {
      const raw = [
        {
          version: '1.0',
          callRendererFunction: {
            functionCallId: 'f1',
            callFunction: {['@call']: 'getLocation'},
          },
        },
        {
          version: 'v1.0',
          agentFunctionResponse: {
            functionCallId: 'f2',
            value: {ok: true},
          },
        },
      ];
      const normalized = strategy.normalizeItems(raw);
      expect(normalized.length).toBe(2);
      expect(normalized[0].version).toBe('1.0');
      expect(normalized[0].callRendererFunction).toBeDefined();
      expect(normalized[1].version).toBe('1.0');
      expect(normalized[1].agentFunctionResponse).toBeDefined();
    });

    it('filters out non-A2UI items, ignores duplicate createSurface, and handles deleteSurface', () => {
      const raw = [
        {notAnA2uiItem: true},
        {createSurface: {surfaceId: 'surf-v1', catalogId: 'c1'}},
        {createSurface: {surfaceId: 'surf-v1', catalogId: 'c1-dup'}},
        {updateComponents: {surfaceId: 'surf-v1', components: []}},
        {deleteSurface: {surfaceId: 'surf-v1'}},
        {createSurface: {surfaceId: 'surf-v1', catalogId: 'c1-recreated'}},
      ];
      const normalized = strategy.normalizeItems(raw);
      expect(normalized.length).toBe(4);
      expect(normalized[0].createSurface?.surfaceId).toBe('surf-v1');
      expect(normalized[1].updateComponents?.surfaceId).toBe('surf-v1');
      expect(normalized[2].deleteSurface?.surfaceId).toBe('surf-v1');
      expect(normalized[3].createSurface?.catalogId).toBe('c1-recreated');
    });

    it('returns empty array when items is null, undefined, or not an array', () => {
      expect(strategy.normalizeItems(null as unknown as readonly unknown[])).toEqual([]);
      expect(strategy.normalizeItems(undefined as unknown as readonly unknown[])).toEqual([]);
      expect(strategy.normalizeItems({} as unknown as readonly unknown[])).toEqual([]);
    });
  });

  describe('isA2uiRpcEnvelope', () => {
    it('classifies callAgentFunction, rendererFunctionResponse, agentFunctionResponse, and callRendererFunction as RPC envelopes', () => {
      expect(strategy.isA2uiRpcEnvelope({callAgentFunction: {functionCallId: 'c1'}})).toBe(true);
      expect(strategy.isA2uiRpcEnvelope({rendererFunctionResponse: {functionCallId: 'r1'}})).toBe(
        true,
      );
      expect(strategy.isA2uiRpcEnvelope({agentFunctionResponse: {functionCallId: 'a1'}})).toBe(
        true,
      );
      expect(strategy.isA2uiRpcEnvelope({callAgentFunctionResponse: {functionCallId: 'ca1'}})).toBe(
        true,
      );
      expect(strategy.isA2uiRpcEnvelope({callRendererFunction: {functionCallId: 'cr1'}})).toBe(
        true,
      );
      expect(strategy.isA2uiRpcEnvelope({version: '1.0', callAgentFunction: {}})).toBe(true);
    });

    it('returns false for surface update commands and regular content', () => {
      expect(strategy.isA2uiRpcEnvelope({createSurface: {surfaceId: 's1'}})).toBe(false);
      expect(strategy.isA2uiRpcEnvelope({updateComponents: {surfaceId: 's1'}})).toBe(false);
      expect(strategy.isA2uiRpcEnvelope({text: 'hello'})).toBe(false);
      expect(strategy.isA2uiRpcEnvelope(null)).toBe(false);
    });
  });
});
