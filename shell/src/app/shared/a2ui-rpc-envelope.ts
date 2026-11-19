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

import {
  isV10RpcEnvelopeItem,
  type AgentFunctionResponsePayload,
  type RenderA2uiItem,
} from 'a2ui-bridge';

export {isV10RpcEnvelopeItem};

/** Error descriptor carried by an `agentFunctionResponse` wire item. */
export interface AgentFunctionResponseError {
  code: string;
  message: string;
  details?: unknown;
  [key: string]: unknown;
}

/** Result or error outcome for {@link buildAgentFunctionResponseItem}. */
export type AgentFunctionResponseOutcome = {value: unknown} | {error: AgentFunctionResponseError};

/**
 * Builds a canonical A2UI v1.0 `agentFunctionResponse` wire envelope item.
 */
export function buildAgentFunctionResponseItem(
  functionCallId: string,
  outcome: AgentFunctionResponseOutcome,
): RenderA2uiItem {
  const responseBody: AgentFunctionResponsePayload =
    'error' in outcome
      ? {functionCallId, error: outcome.error}
      : {functionCallId, value: outcome.value};
  return {
    version: '1.0',
    agentFunctionResponse: responseBody,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Normalizes legacy A2UI v1.0 RPC envelope aliases and shorthands:
 * - Promotes `callAgentFunctionResponse` to `agentFunctionResponse` and omits the legacy key.
 * - Maps `agentFunctionResponse.result` to `value` when `value`/`error` are absent, and omits `result`.
 * - Normalizes `callRendererFunction` shorthand (`call`/`args`/`catalogId`) to `callFunction`,
 *   converts `callFunction.call` to `@call`, and hoists/removes top-level `catalogId`.
 */
export function normalizeV10RpcEnvelopeItem<T extends RenderA2uiItem | Record<string, unknown>>(
  item: T,
): T {
  let normalized: Record<string, unknown> = {...(item as Record<string, unknown>)};

  if ('callAgentFunctionResponse' in normalized) {
    const legacyResp = normalized['callAgentFunctionResponse'];
    const {callAgentFunctionResponse: _omitted, ...rest} = normalized;
    normalized = rest;
    if (normalized['agentFunctionResponse'] === undefined && legacyResp !== undefined) {
      normalized['agentFunctionResponse'] = legacyResp;
    }
  }

  if (isPlainObject(normalized['agentFunctionResponse'])) {
    const resp = normalized['agentFunctionResponse'];
    if ('result' in resp) {
      const {result, ...respRest} = resp;
      if (respRest['value'] === undefined && respRest['error'] === undefined) {
        respRest['value'] = result;
      }
      normalized['agentFunctionResponse'] = respRest;
    }
  }

  if (isPlainObject(normalized['callRendererFunction'])) {
    const crf = normalized['callRendererFunction'];
    if (crf['call'] !== undefined && !isPlainObject(crf['callFunction'])) {
      const {call, args, catalogId, ...crfRest} = crf;
      const callFunction: Record<string, unknown> = {
        ['@call']: String(call),
      };
      if (args !== undefined) {
        callFunction['args'] = args;
      }
      if (catalogId !== undefined) {
        callFunction['catalogId'] = catalogId;
      }
      normalized['callRendererFunction'] = {
        ...crfRest,
        callFunction,
      };
    } else if (isPlainObject(crf['callFunction'])) {
      const {catalogId, ...crfRest} = crf;
      const cf = {...crf['callFunction']};
      if (cf['call'] !== undefined && !cf['@call']) {
        cf['@call'] = String(cf['call']);
        delete cf['call'];
      }
      if (catalogId !== undefined && cf['catalogId'] === undefined) {
        cf['catalogId'] = catalogId;
      }
      normalized['callRendererFunction'] = {
        ...crfRest,
        callFunction: cf,
      };
    }
  }

  return normalized as T;
}
