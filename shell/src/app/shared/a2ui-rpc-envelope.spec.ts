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
import type {RenderA2uiItem} from 'a2ui-bridge';
import {
  buildAgentFunctionResponseItem,
  isV10RpcEnvelopeItem,
  normalizeV10RpcEnvelopeItem,
} from './a2ui-rpc-envelope';

describe('a2ui-rpc-envelope', () => {
  describe('buildAgentFunctionResponseItem', () => {
    it('builds canonical v1.0 value response envelopes', () => {
      expect(buildAgentFunctionResponseItem('fn-1', {value: {ok: true}})).toEqual({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-1',
          value: {ok: true},
        },
      });
    });

    it('builds canonical v1.0 error response envelopes with optional details', () => {
      expect(
        buildAgentFunctionResponseItem('fn-2', {
          error: {
            code: 'CANCELLED',
            message: 'Cancelled by user',
            details: {reason: 'abort'},
          },
        }),
      ).toEqual({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-2',
          error: {
            code: 'CANCELLED',
            message: 'Cancelled by user',
            details: {reason: 'abort'},
          },
        },
      });
    });
  });

  describe('normalizeV10RpcEnvelopeItem', () => {
    it('promotes callAgentFunctionResponse to agentFunctionResponse and omits legacy alias', () => {
      const normalized = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        callAgentFunctionResponse: {
          functionCallId: 'fn-alias',
          value: 42,
        },
      } as unknown as RenderA2uiItem);

      expect(normalized).toEqual({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-alias',
          value: 42,
        },
      });
      expect('callAgentFunctionResponse' in normalized).toBe(false);
    });

    it('maps legacy result to value when value/error are absent and always omits result', () => {
      const legacyOnly = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-legacy',
          result: {data: 'hello'},
        },
      } as unknown as RenderA2uiItem);

      expect(legacyOnly).toEqual({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-legacy',
          value: {data: 'hello'},
        },
      });
      expect('result' in (legacyOnly.agentFunctionResponse as Record<string, unknown>)).toBe(false);

      const withBothValueAndResult = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-both',
          value: 'canonical',
          result: 'legacy',
        },
      } as unknown as RenderA2uiItem);

      expect(withBothValueAndResult).toEqual({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-both',
          value: 'canonical',
        },
      });
      expect(
        'result' in (withBothValueAndResult.agentFunctionResponse as Record<string, unknown>),
      ).toBe(false);

      const withErrorAndResult = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-err',
          error: {code: 'FAIL', message: 'boom'},
          result: 'stale',
        },
      } as unknown as RenderA2uiItem);

      expect(withErrorAndResult).toEqual({
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'fn-err',
          error: {code: 'FAIL', message: 'boom'},
        },
      });
      expect(
        'result' in (withErrorAndResult.agentFunctionResponse as Record<string, unknown>),
      ).toBe(false);
    });

    it('normalizes callRendererFunction shorthand (call/args/catalogId) into callFunction', () => {
      const normalized = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        callRendererFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'fn-shorthand',
          call: 'scrollTo',
          args: {y: 100},
          catalogId: 'cat-1',
        },
      } as unknown as RenderA2uiItem);

      expect(normalized).toEqual({
        version: '1.0',
        callRendererFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'fn-shorthand',
          callFunction: {
            ['@call']: 'scrollTo',
            args: {y: 100},
            catalogId: 'cat-1',
          },
        },
      });
    });

    it('normalizes callFunction.call to @call and hoists/deletes crf.catalogId without overwriting cf.catalogId', () => {
      const hoisted = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'f-hoist',
          catalogId: 'outer.cat',
          callFunction: {
            call: 'nestedFn',
            args: {x: 1},
          },
        },
      } as unknown as RenderA2uiItem);
      expect(hoisted).toEqual({
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'f-hoist',
          callFunction: {
            ['@call']: 'nestedFn',
            args: {x: 1},
            catalogId: 'outer.cat',
          },
        },
      });

      const preserved = normalizeV10RpcEnvelopeItem({
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'f-preserve',
          catalogId: 'outer.cat',
          callFunction: {
            ['@call']: 'innerFn',
            catalogId: 'inner.cat',
          },
        },
      } as unknown as RenderA2uiItem);
      expect(preserved).toEqual({
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'f-preserve',
          callFunction: {
            ['@call']: 'innerFn',
            catalogId: 'inner.cat',
          },
        },
      });
    });
  });

  describe('isV10RpcEnvelopeItem', () => {
    it('returns true only when one of the three v1.0 RPC keys has a non-nullish value', () => {
      expect(isV10RpcEnvelopeItem({callRendererFunction: {functionCallId: 'f1'}})).toBe(true);
      expect(isV10RpcEnvelopeItem({agentFunctionResponse: {functionCallId: 'f2'}})).toBe(true);
      expect(isV10RpcEnvelopeItem({callAgentFunctionResponse: {functionCallId: 'f3'}})).toBe(true);
    });

    it('returns false for explicit undefined/null RPC keys, surface items, and non-objects', () => {
      expect(
        isV10RpcEnvelopeItem({
          version: '1.0',
          updateDataModel: {surfaceId: 's1', value: {}},
          callRendererFunction: undefined,
          agentFunctionResponse: null,
          callAgentFunctionResponse: undefined,
        }),
      ).toBe(false);
      expect(isV10RpcEnvelopeItem({createSurface: {surfaceId: 's1'}})).toBe(false);
      expect(isV10RpcEnvelopeItem(null)).toBe(false);
      expect(isV10RpcEnvelopeItem(['callRendererFunction'])).toBe(false);
    });
  });
});
