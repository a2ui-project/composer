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
import {V09A2aStrategy} from './v0-9-a2a-strategy';

describe('V09A2aStrategy', () => {
  const strategy = new V09A2aStrategy();

  it('exposes v0.9 version constants', () => {
    expect(strategy.version).toBe('v0.9');
    expect(strategy.canonicalWireVersion).toBe('v0.9');
    expect(strategy.mimeType).toBe('application/a2ui+json');
  });

  describe('getClientConfiguration', () => {
    it('advertises v0.9 and v0.8 extension URIs and accepted output modes', () => {
      const config = strategy.getClientConfiguration();
      const capabilities = config['capabilities'] as Record<string, unknown>;
      const extensions = capabilities['extensions'] as Array<Record<string, unknown>>;
      expect(extensions).toEqual([
        {['uri']: 'https://a2ui.org/a2a-extension/a2ui/v0.9'},
        {['uri']: 'https://a2ui.org/a2a-extension/a2ui/v0.8'},
      ]);
      expect(config['extensions']).toEqual([
        'https://a2ui.org/a2a-extension/a2ui/v0.9',
        'https://a2ui.org/a2a-extension/a2ui/v0.8',
      ]);
      const modes = config['acceptedOutputModes'] as string[];
      expect(modes).toContain('text/plain');
      expect(modes).toContain('application/json');
      expect(modes).toContain('application/json+a2ui');
    });
  });

  describe('normalizeWireVersion', () => {
    it('normalizes undefined or any version string to canonical v0.9', () => {
      expect(strategy.normalizeWireVersion(undefined)).toBe('v0.9');
      expect(strategy.normalizeWireVersion('v0.9')).toBe('v0.9');
      expect(strategy.normalizeWireVersion('0.9')).toBe('v0.9');
      expect(strategy.normalizeWireVersion('1.0')).toBe('v0.9');
    });
  });

  describe('buildActionDataPart', () => {
    it('formats action data part with version v0.9 and a2ui_action metadata', () => {
      const part = strategy.buildActionDataPart({name: 'clickSubmit', context: {id: 42}});
      expect(part).toEqual({
        data: {
          ['version']: 'v0.9',
          ['action']: {name: 'clickSubmit', context: {id: 42}},
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_action',
        },
      });
    });
  });

  describe('isA2uiItem', () => {
    it('recognizes v0.9 canonical update keys', () => {
      expect(strategy.isA2uiItem({createSurface: {surfaceId: 's1'}})).toBe(true);
      expect(strategy.isA2uiItem({updateComponents: {surfaceId: 's1', components: []}})).toBe(true);
      expect(strategy.isA2uiItem({updateDataModel: {surfaceId: 's1', value: {}}})).toBe(true);
      expect(strategy.isA2uiItem({deleteSurface: {surfaceId: 's1'}})).toBe(true);
    });

    it('rejects non-A2UI objects', () => {
      expect(strategy.isA2uiItem(null)).toBe(false);
      expect(strategy.isA2uiItem({})).toBe(false);
      expect(strategy.isA2uiItem({name: 'someToolCall', args: {}})).toBe(false);
    });
  });

  describe('normalizeItems', () => {
    it('normalizes items with canonical v0.9 version and strips prototype pollution', () => {
      const raw = [
        {
          ['__proto__']: {polluted: true},
          createSurface: {surfaceId: 's1', catalogId: 'c1'},
        },
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'root', component: 'Text', ['constructor']: {polluted: true}}],
          },
        },
      ];
      const normalized = strategy.normalizeItems(raw);
      expect(normalized.length).toBe(2);
      expect(normalized[0].version).toBe('v0.9');
      expect(normalized[1].version).toBe('v0.9');
      expect(Object.hasOwn(normalized[0], '__proto__')).toBe(false);
      const rootComp = normalized[1].updateComponents?.components[0] as Record<string, unknown>;
      expect(rootComp['polluted']).toBeUndefined();
    });

    it('filters out non-A2UI items, ignores duplicate createSurface, and handles deleteSurface', () => {
      const raw = [
        {notAnA2uiItem: true},
        {createSurface: {surfaceId: 'surf-1', catalogId: 'c1'}},
        {createSurface: {surfaceId: 'surf-1', catalogId: 'c1-dup'}},
        {updateComponents: {surfaceId: 'surf-1', components: []}},
        {deleteSurface: {surfaceId: 'surf-1'}},
        {createSurface: {surfaceId: 'surf-1', catalogId: 'c1-recreated'}},
      ];
      const normalized = strategy.normalizeItems(raw);
      expect(normalized.length).toBe(4);
      expect(normalized[0].createSurface?.surfaceId).toBe('surf-1');
      expect(normalized[1].updateComponents?.surfaceId).toBe('surf-1');
      expect(normalized[2].deleteSurface?.surfaceId).toBe('surf-1');
      expect(normalized[3].createSurface?.catalogId).toBe('c1-recreated');
    });

    it('returns empty array when items is null, undefined, or not an array', () => {
      expect(strategy.normalizeItems(null as unknown as readonly unknown[])).toEqual([]);
      expect(strategy.normalizeItems(undefined as unknown as readonly unknown[])).toEqual([]);
      expect(strategy.normalizeItems({} as unknown as readonly unknown[])).toEqual([]);
    });
  });

  describe('RPC data part builders', () => {
    it('builds callAgentFunction data part with v0.9 version and mimeType', () => {
      const part = strategy.buildCallAgentFunctionDataPart({
        surfaceId: 's1',
        functionCallId: 'call-1',
        callFunction: {['@call']: 'myFunc'},
      });
      expect(part).toEqual({
        data: {
          ['version']: 'v0.9',
          ['callAgentFunction']: {
            surfaceId: 's1',
            functionCallId: 'call-1',
            callFunction: {['@call']: 'myFunc'},
          },
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_call_agent_function',
        },
      });
    });

    it('builds rendererFunctionResponse data part with v0.9 version and mimeType', () => {
      const part = strategy.buildRendererFunctionResponseDataPart({
        functionCallId: 'call-1',
        result: {success: true},
      });
      expect(part).toEqual({
        data: {
          ['version']: 'v0.9',
          ['rendererFunctionResponse']: {
            functionCallId: 'call-1',
            result: {success: true},
          },
        },
        metadata: {
          ['mimeType']: 'application/a2ui+json',
          ['type']: 'a2ui_renderer_function_response',
        },
      });
    });
  });

  describe('isA2uiRpcEnvelope', () => {
    it('returns false for standard v0.9 items', () => {
      expect(strategy.isA2uiRpcEnvelope({createSurface: {surfaceId: 's1'}})).toBe(false);
      expect(strategy.isA2uiRpcEnvelope({name: 'action'})).toBe(false);
    });
  });
});
