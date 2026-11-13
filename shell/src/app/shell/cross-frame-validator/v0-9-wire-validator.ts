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
  A2UI_UPDATE_KEYS,
  type BaseSurfaceDetails,
  type CreateSurfaceDetails,
  type UpdateComponentsDetails,
  type UpdateDataModelDetails,
} from 'a2ui-bridge';
import type {TaggedLogger} from '../../debug/error-logger.service';
import {
  hasPrototypePollution,
  recordError,
  type A2uiWireVersionValidator,
} from './wire-version-validator';

/**
 * Valid action payload structure for v0.9 SEND_TO_SERVER messages.
 */
export declare interface V09ActionPayload {
  name?: string;
  [key: string]: unknown;
}

/**
 * Valid dataModelChange payload structure for v0.9 SEND_TO_SERVER messages.
 */
export declare interface V09DataModelChangePayload {
  surfaceId?: string;
  path?: string;
  value?: unknown;
  [key: string]: unknown;
}

/**
 * Valid error payload structure for v0.9 SEND_TO_SERVER messages.
 */
export declare interface V09ErrorPayload {
  message?: string;
  code?: string;
  [key: string]: unknown;
}

/**
 * Valid v0.9 SEND_TO_SERVER message envelope.
 */
export declare interface V09SendToServerPayload {
  version?: 'v0.9' | '0.9';
  action?: V09ActionPayload;
  dataModelChange?: V09DataModelChangePayload;
  updateDataModel?: V09DataModelChangePayload;
  error?: V09ErrorPayload;
  [key: string]: unknown;
}

/**
 * Wire validator implementation for A2UI v0.9 protocol specifications.
 */
export class V09WireValidator implements A2uiWireVersionValidator {
  readonly version = 'v0.9' as const;

  /**
   * Validates a v0.9 SEND_TO_SERVER payload against the v0.9 specification.
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
    if (version !== undefined && version !== 'v0.9' && version !== '0.9') {
      recordError(
        `Invalid version "${String(version)}" for v0.9 SEND_TO_SERVER payload.`,
        errors,
        logger,
      );
      return false;
    }

    const hasAction = obj['action'] !== undefined;
    const hasDataModelChange =
      obj['dataModelChange'] !== undefined || obj['updateDataModel'] !== undefined;
    const hasError = obj['error'] !== undefined;

    if (!hasAction && !hasDataModelChange && !hasError) {
      recordError(
        'Malformed v0.9 SEND_TO_SERVER payload: must contain at least one of action, dataModelChange, updateDataModel, or error.',
        errors,
        logger,
      );
      return false;
    }

    if (
      hasAction &&
      typeof obj['action'] !== 'string' &&
      (typeof obj['action'] !== 'object' || Array.isArray(obj['action']))
    ) {
      recordError(
        'Malformed v0.9 SEND_TO_SERVER action: must be a string or object.',
        errors,
        logger,
      );
      return false;
    }

    if (
      obj['dataModelChange'] !== undefined &&
      (typeof obj['dataModelChange'] !== 'object' || Array.isArray(obj['dataModelChange']))
    ) {
      recordError(
        'Malformed v0.9 SEND_TO_SERVER dataModelChange: must be an object.',
        errors,
        logger,
      );
      return false;
    }

    if (
      obj['updateDataModel'] !== undefined &&
      (typeof obj['updateDataModel'] !== 'object' || Array.isArray(obj['updateDataModel']))
    ) {
      recordError(
        'Malformed v0.9 SEND_TO_SERVER updateDataModel: must be an object.',
        errors,
        logger,
      );
      return false;
    }

    if (hasError && (typeof obj['error'] !== 'object' || Array.isArray(obj['error']))) {
      recordError('Malformed v0.9 SEND_TO_SERVER error: must be an object.', errors, logger);
      return false;
    }

    return true;
  }

  /**
   * Validates a single v0.9 RENDER_A2UI item structure.
   *
   * @param item The single RENDER_A2UI item to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if valid, `false` otherwise.
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
    const itemObj = item as Record<string, unknown>;
    const version = itemObj['version'];

    if (version !== 'v0.9') {
      recordError(
        `Invalid version "${String(version)}" for v0.9 RENDER_A2UI item (expected "v0.9").`,
        errors,
        logger,
      );
      return false;
    }

    const presentKeys = A2UI_UPDATE_KEYS.filter(
      key => key in itemObj && (itemObj as Record<string, unknown>)[key] !== undefined,
    );

    if (presentKeys.length === 0) {
      recordError(
        'Malformed payload for RENDER_A2UI: item must contain an update property (createSurface, updateComponents, updateDataModel, or deleteSurface).',
        errors,
        logger,
      );
      return false;
    }

    if (presentKeys.length > 1) {
      recordError(
        `Malformed payload for RENDER_A2UI: item must contain exactly one update property, but found: ${presentKeys.join(', ')}.`,
        errors,
        logger,
      );
      return false;
    }

    const updateType = presentKeys[0];
    const updateObj = (itemObj as Record<string, unknown>)[updateType];

    if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
      recordError(
        `Malformed payload for RENDER_A2UI: ${updateType} property must be an object.`,
        errors,
        logger,
      );
      return false;
    }

    const updateData = updateObj as BaseSurfaceDetails;
    if (typeof updateData.surfaceId !== 'string') {
      recordError(
        `Malformed payload for RENDER_A2UI: ${updateType} must contain a valid surfaceId string.`,
        errors,
        logger,
      );
      return false;
    }

    if (updateType === 'createSurface') {
      const createDetails = updateObj as CreateSurfaceDetails;
      if (typeof createDetails.catalogId !== 'string') {
        recordError(
          'Malformed payload for RENDER_A2UI: createSurface must contain a valid catalogId string.',
          errors,
          logger,
        );
        return false;
      }
      if (
        createDetails.sendDataModel !== undefined &&
        typeof createDetails.sendDataModel !== 'boolean'
      ) {
        recordError(
          'Malformed payload for RENDER_A2UI: createSurface sendDataModel must be a boolean if present.',
          errors,
          logger,
        );
        return false;
      }
    } else if (updateType === 'updateComponents') {
      const updateCompDetails = updateObj as UpdateComponentsDetails;
      if (!Array.isArray(updateCompDetails.components)) {
        recordError(
          'Malformed payload for RENDER_A2UI: updateComponents must contain a components Array.',
          errors,
          logger,
        );
        return false;
      }
      for (const comp of updateCompDetails.components) {
        if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
          recordError(
            'Malformed payload for RENDER_A2UI: updateComponents components array items must be objects.',
            errors,
            logger,
          );
          return false;
        }
      }
    } else if (updateType === 'updateDataModel') {
      const updateModelDetails = updateObj as UpdateDataModelDetails;
      if (updateModelDetails.path !== undefined && typeof updateModelDetails.path !== 'string') {
        recordError(
          'Malformed payload for RENDER_A2UI: updateDataModel path must be a string if present.',
          errors,
          logger,
        );
        return false;
      }
    }

    return true;
  }
}
