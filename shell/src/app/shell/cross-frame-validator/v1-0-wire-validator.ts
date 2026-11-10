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

import type {TaggedLogger} from '../../debug/error-logger.service';
import {
  hasPrototypePollution,
  recordError,
  type A2uiWireVersionValidator,
} from './wire-version-validator';

/**
 * Valid action payload structure for v1.0 SEND_TO_SERVER messages.
 */
export declare interface V10ActionPayload {
  name: string;
  surfaceId?: string;
  sourceComponentId?: string;
  timestamp?: string;
  context?: Record<string, unknown>;
  userMessage?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Valid callAgentFunction payload structure for v1.0 SEND_TO_SERVER messages.
 */
export declare interface V10CallAgentFunctionPayload {
  surfaceId: string;
  functionCallId: string;
  callFunction?: {
    '@call'?: string;
    call?: string;
    '@args'?: Record<string, unknown>;
    args?: Record<string, unknown>;
    catalogId?: string;
    [key: string]: unknown;
  };
  call?: string;
  args?: Record<string, unknown>;
  catalogId?: string;
  [key: string]: unknown;
}

/**
 * Valid rendererFunctionResponse payload structure for v1.0 SEND_TO_SERVER messages.
 */
export declare interface V10RendererFunctionResponsePayload {
  surfaceId?: string;
  functionCallId: string;
  result?: unknown;
  value?: unknown;
  error?: {
    code?: string;
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Valid error payload structure for v1.0 SEND_TO_SERVER messages.
 */
export declare interface V10ErrorPayload {
  surfaceId?: string;
  functionCallId?: string;
  code?: string;
  message: string;
  path?: string;
  [key: string]: unknown;
}

/**
 * Normalized representation of an agent function invocation extracted from callAgentFunction.
 */
export declare interface NormalizedCallAgentFunctionDetails {
  surfaceId: string;
  functionCallId: string;
  functionName: string;
  args: Record<string, unknown>;
  catalogId?: string;
}

/**
 * Safely extracts normalized call agent function invocation parameters across both
 * `@a2ui/web_core` (`callFunction['@call']`, `@args`) and stub iframe (`call`, `args`) wire formats.
 *
 * @param payload The callAgentFunction payload object.
 * @returns Normalized call agent function details or `null` if invalid.
 */
function extractCallAgentFunctionDetails(
  payload: unknown,
): NormalizedCallAgentFunctionDetails | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  const obj = payload as Record<string, unknown>;
  const surfaceId = typeof obj['surfaceId'] === 'string' ? obj['surfaceId'].trim() : '';
  const functionCallId =
    typeof obj['functionCallId'] === 'string' ? obj['functionCallId'].trim() : '';
  if (!surfaceId || !functionCallId) {
    return null;
  }

  let functionName = '';
  let args: Record<string, unknown> = {};
  let catalogId: string | undefined = undefined;

  const callFunction = obj['callFunction'];
  if (callFunction && typeof callFunction === 'object' && !Array.isArray(callFunction)) {
    const cf = callFunction as Record<string, unknown>;
    if (typeof cf['@call'] === 'string' && cf['@call'].trim()) {
      functionName = cf['@call'].trim();
    } else if (typeof cf['call'] === 'string' && cf['call'].trim()) {
      functionName = cf['call'].trim();
    }

    if (cf['@args'] && typeof cf['@args'] === 'object' && !Array.isArray(cf['@args'])) {
      args = cf['@args'] as Record<string, unknown>;
    } else if (cf['args'] && typeof cf['args'] === 'object' && !Array.isArray(cf['args'])) {
      args = cf['args'] as Record<string, unknown>;
    }

    if (typeof cf['catalogId'] === 'string' && cf['catalogId'].trim()) {
      catalogId = cf['catalogId'].trim();
    }
  }

  if (!functionName) {
    if (typeof obj['call'] === 'string' && obj['call'].trim()) {
      functionName = obj['call'].trim();
    } else if (typeof obj['@call'] === 'string' && obj['@call'].trim()) {
      functionName = obj['@call'].trim();
    }
  }

  if (Object.keys(args).length === 0) {
    if (obj['args'] && typeof obj['args'] === 'object' && !Array.isArray(obj['args'])) {
      args = obj['args'] as Record<string, unknown>;
    } else if (obj['@args'] && typeof obj['@args'] === 'object' && !Array.isArray(obj['@args'])) {
      args = obj['@args'] as Record<string, unknown>;
    }
  }

  if (!catalogId && typeof obj['catalogId'] === 'string' && obj['catalogId'].trim()) {
    catalogId = obj['catalogId'].trim();
  }

  if (!functionName) {
    return null;
  }

  return {
    surfaceId,
    functionCallId,
    functionName,
    args,
    catalogId,
  };
}

/**
 * Wire validator implementation for A2UI v1.0 protocol specifications.
 */
export class V10WireValidator implements A2uiWireVersionValidator {
  readonly version = 'v1.0' as const;

  /**
   * Safely extracts normalized call agent function invocation parameters across both
   * `@a2ui/web_core` (`callFunction['@call']`, `@args`) and stub iframe (`call`, `args`) wire formats.
   *
   * @param payload The callAgentFunction payload object.
   * @returns Normalized call agent function details or `null` if invalid.
   */
  static extractCallAgentFunctionDetails(
    payload: unknown,
  ): NormalizedCallAgentFunctionDetails | null {
    return extractCallAgentFunctionDetails(payload);
  }

  /**
   * Validates a single v1.0 SEND_TO_SERVER wire payload from a child iframe.
   *
   * @param payload The SEND_TO_SERVER payload to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if valid, `false` otherwise.
   */
  validateSendToServer(
    payload: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      recordError('Malformed SEND_TO_SERVER payload: must be an object.', errors, logger);
      return false;
    }

    if (hasPrototypePollution(payload)) {
      recordError(
        'Malformed SEND_TO_SERVER payload: prototype pollution key detected.',
        errors,
        logger,
      );
      return false;
    }

    const obj = payload as Record<string, unknown>;
    const version = obj['version'];
    if (version === 'v1.0') {
      recordError(
        "Invalid wire message: A2UI v1.0 messages must specify version: '1.0' (got 'v1.0')",
        errors,
        logger,
      );
      return false;
    }
    if (version !== '1.0') {
      recordError(
        `Invalid version "${String(version)}" for v1.0 SEND_TO_SERVER payload (expected "1.0").`,
        errors,
        logger,
      );
      return false;
    }

    const hasAction = obj['action'] !== undefined;
    const hasCallAgentFunction = obj['callAgentFunction'] !== undefined;
    const hasRendererFunctionResponse = obj['rendererFunctionResponse'] !== undefined;
    const hasDataModelChange =
      obj['dataModelChange'] !== undefined || obj['updateDataModel'] !== undefined;
    const hasError = obj['error'] !== undefined;

    if (
      !hasAction &&
      !hasCallAgentFunction &&
      !hasRendererFunctionResponse &&
      !hasDataModelChange &&
      !hasError
    ) {
      recordError(
        'Malformed v1.0 SEND_TO_SERVER payload: must contain action, callAgentFunction, rendererFunctionResponse, dataModelChange, or error.',
        errors,
        logger,
      );
      return false;
    }

    if (hasAction) {
      if (typeof obj['action'] !== 'object' || Array.isArray(obj['action']) || !obj['action']) {
        recordError('Malformed v1.0 SEND_TO_SERVER: action must be an object.', errors, logger);
        return false;
      }
      const action = obj['action'] as Record<string, unknown>;
      if (typeof action['name'] !== 'string' || !action['name'].trim()) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: action must contain a string name.',
          errors,
          logger,
        );
        return false;
      }
      if (action['userMessage'] !== undefined && typeof action['userMessage'] !== 'string') {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: action userMessage must be a string.',
          errors,
          logger,
        );
        return false;
      }
      if (
        action['metadata'] !== undefined &&
        (typeof action['metadata'] !== 'object' ||
          Array.isArray(action['metadata']) ||
          !action['metadata'])
      ) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: action metadata must be an object.',
          errors,
          logger,
        );
        return false;
      }
    }

    if (hasCallAgentFunction) {
      const details = extractCallAgentFunctionDetails(obj['callAgentFunction']);
      if (!details) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: callAgentFunction must contain non-empty surfaceId, functionCallId, and function name.',
          errors,
          logger,
        );
        return false;
      }
    }

    if (hasRendererFunctionResponse) {
      if (
        typeof obj['rendererFunctionResponse'] !== 'object' ||
        Array.isArray(obj['rendererFunctionResponse']) ||
        !obj['rendererFunctionResponse']
      ) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: rendererFunctionResponse must be an object.',
          errors,
          logger,
        );
        return false;
      }
      const resp = obj['rendererFunctionResponse'] as Record<string, unknown>;
      if (typeof resp['functionCallId'] !== 'string' || !resp['functionCallId'].trim()) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: rendererFunctionResponse must contain non-empty functionCallId.',
          errors,
          logger,
        );
        return false;
      }
      if ('result' in resp) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: legacy result field is not permitted in v1.0 rendererFunctionResponse (use value or error).',
          errors,
          logger,
        );
        return false;
      }
      const hasValue = resp['value'] !== undefined;
      const hasErr = resp['error'] !== undefined;
      if ((hasValue && hasErr) || (!hasValue && !hasErr)) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: rendererFunctionResponse must specify exactly one of value or error.',
          errors,
          logger,
        );
        return false;
      }
      if (
        hasErr &&
        (!resp['error'] || typeof resp['error'] !== 'object' || Array.isArray(resp['error']))
      ) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: rendererFunctionResponse error must be an object.',
          errors,
          logger,
        );
        return false;
      }
    }

    if (hasDataModelChange) {
      const dm = (obj['dataModelChange'] ?? obj['updateDataModel']) as Record<string, unknown>;
      if (!dm || typeof dm !== 'object' || Array.isArray(dm)) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: updateDataModel must be an object.',
          errors,
          logger,
        );
        return false;
      }
      if (
        obj['updateDataModel'] !== undefined &&
        (typeof dm['surfaceId'] !== 'string' || !dm['surfaceId'].trim())
      ) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: updateDataModel must contain a non-empty string surfaceId.',
          errors,
          logger,
        );
        return false;
      }
      // `path` is optional on the wire (an absent path means a root
      // replacement), but when present it must be a non-empty string.
      if (dm['path'] !== undefined && (typeof dm['path'] !== 'string' || !dm['path'].trim())) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: updateDataModel path, when present, must be a non-empty string.',
          errors,
          logger,
        );
        return false;
      }
      if (dm['value'] === undefined) {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: updateDataModel must contain a value.',
          errors,
          logger,
        );
        return false;
      }
    }

    if (hasError) {
      if (typeof obj['error'] !== 'object' || Array.isArray(obj['error']) || !obj['error']) {
        recordError('Malformed v1.0 SEND_TO_SERVER: error must be an object.', errors, logger);
        return false;
      }
      const err = obj['error'] as Record<string, unknown>;
      if (typeof err['message'] !== 'string') {
        recordError(
          'Malformed v1.0 SEND_TO_SERVER: error must contain string message.',
          errors,
          logger,
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Validates a single v1.0 RENDER_A2UI item structure.
   *
   * @param item The single RENDER_A2UI item to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if the item is valid, `false` otherwise.
   */
  validateRenderItem(
    item: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      recordError(
        'Malformed payload for RENDER_A2UI: array items must be objects.',
        errors,
        logger,
      );
      return false;
    }

    if (hasPrototypePollution(item)) {
      recordError(
        'Malformed payload for RENDER_A2UI: prototype pollution key detected.',
        errors,
        logger,
      );
      return false;
    }

    const itemObj = item as Record<string, unknown>;
    const version = itemObj['version'];
    if (version === 'v1.0') {
      recordError(
        "Invalid wire message: A2UI v1.0 messages must specify version: '1.0' (got 'v1.0')",
        errors,
        logger,
      );
      return false;
    }
    if (version !== '1.0') {
      recordError(
        `Invalid version "${String(version)}" for v1.0 RENDER_A2UI item (expected "1.0").`,
        errors,
        logger,
      );
      return false;
    }

    const validKeys = [
      'createSurface',
      'updateComponents',
      'updateDataModel',
      'deleteSurface',
      'callRendererFunction',
      'callAgentFunctionResponse',
    ];
    const presentKeys = validKeys.filter(key => key in itemObj && itemObj[key] !== undefined);

    if (presentKeys.length === 0) {
      recordError(
        'Malformed v1.0 RENDER_A2UI item: item must contain an operation property (createSurface, updateComponents, updateDataModel, deleteSurface, callRendererFunction, or callAgentFunctionResponse).',
        errors,
        logger,
      );
      return false;
    }

    if (presentKeys.length > 1) {
      recordError(
        `Malformed v1.0 RENDER_A2UI item: item must contain exactly one operation property, but found: ${presentKeys.join(', ')}.`,
        errors,
        logger,
      );
      return false;
    }

    const opType = presentKeys[0];
    const opObj = itemObj[opType];
    if (!opObj || typeof opObj !== 'object' || Array.isArray(opObj)) {
      recordError(
        `Malformed v1.0 RENDER_A2UI item: ${opType} property must be an object.`,
        errors,
        logger,
      );
      return false;
    }

    const opRecord = opObj as Record<string, unknown>;

    if (opType === 'createSurface') {
      if (typeof opRecord['surfaceId'] !== 'string' || !opRecord['surfaceId'].trim()) {
        recordError(
          'Malformed v1.0 createSurface: must contain a non-empty string surfaceId.',
          errors,
          logger,
        );
        return false;
      }
      if (typeof opRecord['catalogId'] !== 'string' || !opRecord['catalogId'].trim()) {
        recordError(
          'Malformed v1.0 createSurface: must contain a non-empty string catalogId.',
          errors,
          logger,
        );
        return false;
      }
      if ('theme' in opRecord) {
        recordError(
          'Malformed v1.0 createSurface: legacy theme property is illegal in A2UI v1.0.',
          errors,
          logger,
        );
        return false;
      }
      return true;
    }

    if (opType === 'callRendererFunction') {
      if (typeof opRecord['surfaceId'] !== 'string' || !opRecord['surfaceId'].trim()) {
        recordError(
          'Malformed v1.0 callRendererFunction: must contain a non-empty string surfaceId.',
          errors,
          logger,
        );
        return false;
      }
      if (typeof opRecord['functionCallId'] !== 'string' || !opRecord['functionCallId'].trim()) {
        recordError(
          'Malformed v1.0 callRendererFunction: must contain a non-empty string functionCallId.',
          errors,
          logger,
        );
        return false;
      }
      const hasCall =
        (typeof opRecord['call'] === 'string' && !!opRecord['call'].trim()) ||
        (opRecord['callFunction'] && typeof opRecord['callFunction'] === 'object');
      if (!hasCall) {
        recordError(
          'Malformed v1.0 callRendererFunction: must specify function details via call or callFunction.',
          errors,
          logger,
        );
        return false;
      }
      return true;
    }

    if (opType === 'callAgentFunctionResponse') {
      if (typeof opRecord['functionCallId'] !== 'string' || !opRecord['functionCallId'].trim()) {
        recordError(
          'Malformed v1.0 callAgentFunctionResponse: must contain a non-empty string functionCallId.',
          errors,
          logger,
        );
        return false;
      }
      if ('result' in opRecord) {
        recordError(
          'Malformed v1.0 callAgentFunctionResponse: legacy result field is not permitted in v1.0 (use value or error).',
          errors,
          logger,
        );
        return false;
      }
      const hasValue = opRecord['value'] !== undefined;
      const hasErr = opRecord['error'] !== undefined;
      if ((hasValue && hasErr) || (!hasValue && !hasErr)) {
        recordError(
          'Malformed v1.0 callAgentFunctionResponse: must specify exactly one of value or error.',
          errors,
          logger,
        );
        return false;
      }
      if (
        hasErr &&
        (!opRecord['error'] ||
          typeof opRecord['error'] !== 'object' ||
          Array.isArray(opRecord['error']))
      ) {
        recordError(
          'Malformed v1.0 callAgentFunctionResponse: error must be an object.',
          errors,
          logger,
        );
        return false;
      }
      return true;
    }

    if (opType === 'updateDataModel') {
      if (typeof opRecord['surfaceId'] !== 'string' || !opRecord['surfaceId'].trim()) {
        recordError(
          'Malformed v1.0 updateDataModel: must contain a non-empty string surfaceId.',
          errors,
          logger,
        );
        return false;
      }
      if (
        opRecord['path'] !== undefined &&
        (typeof opRecord['path'] !== 'string' || !opRecord['path'].trim())
      ) {
        recordError(
          'Malformed v1.0 updateDataModel: path must be a non-empty string if present.',
          errors,
          logger,
        );
        return false;
      }
      if (opRecord['value'] === undefined) {
        recordError('Malformed v1.0 updateDataModel: must specify a value.', errors, logger);
        return false;
      }
      return true;
    }

    if (opType === 'deleteSurface') {
      if (typeof opRecord['surfaceId'] !== 'string' || !opRecord['surfaceId'].trim()) {
        recordError(
          'Malformed v1.0 deleteSurface: must contain a non-empty string surfaceId.',
          errors,
          logger,
        );
        return false;
      }
      return true;
    }

    if (opType === 'updateComponents') {
      if (typeof opRecord['surfaceId'] !== 'string' || !opRecord['surfaceId'].trim()) {
        recordError(
          'Malformed v1.0 updateComponents: must contain a non-empty string surfaceId.',
          errors,
          logger,
        );
        return false;
      }
      if (!Array.isArray(opRecord['components'])) {
        recordError(
          'Malformed v1.0 updateComponents: components must be an Array.',
          errors,
          logger,
        );
        return false;
      }
      return true;
    }

    return true;
  }
}
