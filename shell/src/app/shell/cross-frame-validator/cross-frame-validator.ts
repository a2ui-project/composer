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
  PreviewBridgeMessageType,
  UpdateDataModelDetails,
  SetBlockingStatePayload,
  SetThemePayload,
  DataModelChangePayload,
  ThemePreference,
} from 'a2ui-bridge';
import type {TaggedLogger} from '../../debug/error-logger.service';
import {hasPrototypePollution, recordError} from './wire-version-validator';
import {V09WireValidator} from './v0-9-wire-validator';
import {V10WireValidator} from './v1-0-wire-validator';

/**
 * Hardens postMessage channels by validating outgoing layout schemas,
 * component hierarchies, and data binding payloads prior to transmission.
 */
export class CrossFrameValidator {
  private static readonly v09Validator = new V09WireValidator();
  private static readonly v10Validator = new V10WireValidator();

  /**
   * Validates an outgoing message envelope and its payload structure.
   * Logs validation failures to logger.error and appends error messages to errors array if provided.
   *
   * @param message The outgoing message object to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @return `true` if the message is valid, `false` otherwise.
   */
  static validateOutgoingMessage(
    message: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      recordError('Malformed message: message must be an object.', errors, logger);
      return false;
    }

    const msgObj = message as {type?: unknown; payload?: unknown};
    const msgType = msgObj.type;
    const msgPayload = msgObj.payload;

    if (typeof msgType !== 'string' || !msgType.trim()) {
      recordError('Malformed message: type must be a non-empty string.', errors, logger);
      return false;
    }

    switch (msgType) {
      case PreviewBridgeMessageType.GET_CATALOG: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            recordError(
              'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
              errors,
              logger,
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.GET_COMPONENT_USAGES: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            recordError(
              'Malformed payload for GET_COMPONENT_USAGES: must be an object, null, or undefined.',
              errors,
              logger,
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.GET_DEMOS: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            recordError(
              'Malformed payload for GET_DEMOS: must be an object, null, or undefined.',
              errors,
              logger,
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.RENDER_A2UI: {
        if (!msgPayload || !Array.isArray(msgPayload)) {
          recordError('Malformed payload for RENDER_A2UI: must be an Array.', errors, logger);
          return false;
        }

        for (const item of msgPayload) {
          if (!CrossFrameValidator.validateSingleRenderMessage(item, errors, logger)) {
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_BLOCKING_STATE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          recordError(
            'Malformed payload for SET_BLOCKING_STATE: must be an object.',
            errors,
            logger,
          );
          return false;
        }

        const blockingState = msgPayload as SetBlockingStatePayload;
        if (typeof blockingState.blocked !== 'boolean') {
          recordError(
            'Malformed payload for SET_BLOCKING_STATE: must contain boolean property blocked.',
            errors,
            logger,
          );
          return false;
        }
        if (blockingState.message !== undefined && typeof blockingState.message !== 'string') {
          recordError(
            'Malformed payload for SET_BLOCKING_STATE: message property must be a string if present.',
            errors,
            logger,
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_THEME: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          recordError('Malformed payload for SET_THEME: must be an object.', errors, logger);
          return false;
        }

        const themePayload = msgPayload as SetThemePayload;
        if (!Object.values(ThemePreference).includes(themePayload.theme)) {
          recordError(
            `Invalid theme preference mode: ${String(themePayload.theme)}`,
            errors,
            logger,
          );
          return false;
        }

        return true;
      }

      case PreviewBridgeMessageType.DATA_MODEL_CHANGE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          recordError(
            'Malformed payload for DATA_MODEL_CHANGE: must be an object.',
            errors,
            logger,
          );
          return false;
        }

        const changePayload = msgPayload as DataModelChangePayload;
        const updateObj = changePayload.updateDataModel;
        if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
          recordError(
            'Malformed payload for DATA_MODEL_CHANGE: must contain an updateDataModel object.',
            errors,
            logger,
          );
          return false;
        }

        const updateData = updateObj as UpdateDataModelDetails;
        if (typeof updateData.surfaceId !== 'string') {
          recordError(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel must contain a valid surfaceId string.',
            errors,
            logger,
          );
          return false;
        }
        if (updateData.path !== undefined && typeof updateData.path !== 'string') {
          recordError(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel path must be a string if present.',
            errors,
            logger,
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.MCP_REQUEST: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          recordError('Malformed payload for MCP_REQUEST: must be an object.', errors, logger);
          return false;
        }
        const mcpReq = msgPayload as {requestId?: unknown; toolName?: unknown};
        if (typeof mcpReq.requestId !== 'string' || !mcpReq.requestId.trim()) {
          recordError(
            'Malformed payload for MCP_REQUEST: must contain a non-empty requestId string.',
            errors,
            logger,
          );
          return false;
        }
        if (typeof mcpReq.toolName !== 'string' || !mcpReq.toolName.trim()) {
          recordError(
            'Malformed payload for MCP_REQUEST: must contain a non-empty toolName string.',
            errors,
            logger,
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.MCP_RESPONSE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          recordError('Malformed payload for MCP_RESPONSE: must be an object.', errors, logger);
          return false;
        }
        const mcpRes = msgPayload as {requestId?: unknown};
        if (typeof mcpRes.requestId !== 'string' || !mcpRes.requestId.trim()) {
          recordError(
            'Malformed payload for MCP_RESPONSE: must contain a non-empty requestId string.',
            errors,
            logger,
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.A2UI_CATALOG: {
        return CrossFrameValidator.validateCatalogPayload(msgPayload, errors, logger);
      }

      case PreviewBridgeMessageType.SEND_TO_SERVER: {
        return CrossFrameValidator.validateSendToServerPayload(msgPayload, errors, logger);
      }

      default: {
        logger.warn(`Unrecognized message type: ${msgType}`);
        return true;
      }
    }
  }

  /**
   * Validates an incoming message envelope dispatched from an embedded iframe.
   * Logs validation failures to logger.error and appends error messages to errors array if provided.
   *
   * @param message The incoming message object to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if the message is valid, `false` otherwise.
   */
  static validateIncomingMessage(
    message: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      recordError('Malformed message: message must be an object.', errors, logger);
      return false;
    }

    const msgObj = message as {type?: unknown; payload?: unknown};
    const msgType = msgObj.type;
    const msgPayload = msgObj.payload;

    if (typeof msgType !== 'string' || !msgType.trim()) {
      recordError('Malformed message: type must be a non-empty string.', errors, logger);
      return false;
    }

    switch (msgType) {
      case PreviewBridgeMessageType.A2UI_CATALOG: {
        return CrossFrameValidator.validateCatalogPayload(msgPayload, errors, logger);
      }

      case PreviewBridgeMessageType.SEND_TO_SERVER: {
        return CrossFrameValidator.validateSendToServerPayload(msgPayload, errors, logger);
      }

      // Validates dimensional updates dispatched by the embedded preview iframe
      // to ensure height and optional width are safe numerical values before updating host layout.
      case PreviewBridgeMessageType.SURFACE_RESIZE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          recordError('Malformed payload for SURFACE_RESIZE: must be an object.', errors, logger);
          return false;
        }

        const MAX_SURFACE_DIMENSION = 20_000;
        const isValidDimension = (v: unknown): v is number =>
          typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_SURFACE_DIMENSION;

        const resizePayload = msgPayload as {
          height?: unknown;
          width?: unknown;
          viewportWidth?: unknown;
          contentReady?: unknown;
        };
        if (!isValidDimension(resizePayload.height)) {
          recordError(
            'Malformed payload for SURFACE_RESIZE: must contain number property height.',
            errors,
            logger,
          );
          return false;
        }
        if (resizePayload.width !== undefined && !isValidDimension(resizePayload.width)) {
          recordError(
            'Malformed payload for SURFACE_RESIZE: width property must be a number if present.',
            errors,
            logger,
          );
          return false;
        }
        if (
          resizePayload.viewportWidth !== undefined &&
          !isValidDimension(resizePayload.viewportWidth)
        ) {
          recordError(
            'Malformed payload for SURFACE_RESIZE: viewportWidth must be a number if present.',
            errors,
            logger,
          );
          return false;
        }
        if (
          resizePayload.contentReady !== undefined &&
          typeof resizePayload.contentReady !== 'boolean'
        ) {
          recordError(
            'Malformed payload for SURFACE_RESIZE: contentReady must be a boolean if present.',
            errors,
            logger,
          );
          return false;
        }
        return true;
      }

      default: {
        return true;
      }
    }
  }

  /**
   * Validates an A2UI_CATALOG payload supporting flat catalog definitions,
   * multi-catalog `{ catalog, catalogs }` handshakes, and empty/null settled responses.
   *
   * @param payload The A2UI_CATALOG payload to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if the payload is valid, `false` otherwise.
   */
  static validateCatalogPayload(
    payload: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    if (payload === null || payload === undefined) {
      return true;
    }

    if (typeof payload !== 'object' || Array.isArray(payload)) {
      recordError(
        'Malformed payload for A2UI_CATALOG: must be an object, null, or undefined.',
        errors,
        logger,
      );
      return false;
    }

    if (hasPrototypePollution(payload)) {
      recordError(
        'Malformed payload for A2UI_CATALOG: prototype pollution key detected.',
        errors,
        logger,
      );
      return false;
    }

    const payloadObj = payload as Record<string, unknown>;

    if (payloadObj['error'] !== undefined) {
      if (
        !payloadObj['error'] ||
        typeof payloadObj['error'] !== 'object' ||
        Array.isArray(payloadObj['error'])
      ) {
        recordError('Malformed error in A2UI_CATALOG: must be an object.', errors, logger);
        return false;
      }
      return true;
    }

    if (payloadObj['catalogs'] !== undefined) {
      if (!Array.isArray(payloadObj['catalogs'])) {
        recordError(
          'Malformed catalogs in A2UI_CATALOG: catalogs must be an Array.',
          errors,
          logger,
        );
        return false;
      }
      for (const entry of payloadObj['catalogs']) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
          recordError(
            'Malformed catalog entry in A2UI_CATALOG catalogs: entries must be objects.',
            errors,
            logger,
          );
          return false;
        }
      }
    }

    if (payloadObj['catalog'] !== undefined && payloadObj['catalog'] !== null) {
      if (typeof payloadObj['catalog'] !== 'object' || Array.isArray(payloadObj['catalog'])) {
        recordError(
          'Malformed catalog in A2UI_CATALOG: catalog must be an object or null.',
          errors,
          logger,
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Validates a SEND_TO_SERVER payload, delegating to versioned wire validators
   * based on the payload `version` attribute ('v1.0' / '1.0' vs 'v0.9' / '0.9' / omitted).
   *
   * @param payload The SEND_TO_SERVER payload to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if the payload is valid, `false` otherwise.
   */
  static validateSendToServerPayload(
    payload: unknown,
    errors: string[] | undefined,
    logger: Pick<TaggedLogger, 'error' | 'warn'>,
  ): boolean {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      recordError('Malformed payload for SEND_TO_SERVER: must be an object.', errors, logger);
      return false;
    }

    if (hasPrototypePollution(payload)) {
      recordError(
        'Malformed payload for SEND_TO_SERVER: prototype pollution key detected.',
        errors,
        logger,
      );
      return false;
    }

    const payloadObj = payload as Record<string, unknown>;
    const version = payloadObj['version'];

    if (version === 'v1.0') {
      recordError(
        "Invalid wire message: A2UI v1.0 messages must specify version: '1.0' (got 'v1.0')",
        errors,
        logger,
      );
      return false;
    }

    if (version === '1.0') {
      return CrossFrameValidator.v10Validator.validateSendToServer(payload, errors, logger);
    }

    if (version === 'v0.9' || version === '0.9' || version === undefined) {
      return CrossFrameValidator.v09Validator.validateSendToServer(payload, errors, logger);
    }

    recordError(
      `Unsupported protocol version for SEND_TO_SERVER: "${String(version)}".`,
      errors,
      logger,
    );
    return false;
  }

  /**
   * Validates a single render message item structure.
   *
   * @param item The single RENDER_A2UI item to validate.
   * @param errors An optional array to collect validation error messages.
   * @param logger A logger to record validation messages to.
   * @returns `true` if the item is valid, `false` otherwise.
   */
  private static validateSingleRenderMessage(
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

    if (version === 'v1.0') {
      recordError(
        "Invalid wire message: A2UI v1.0 messages must specify version: '1.0' (got 'v1.0')",
        errors,
        logger,
      );
      return false;
    }

    if (version === '1.0') {
      return CrossFrameValidator.v10Validator.validateRenderItem(item, errors, logger);
    }

    if (version === 'v0.9') {
      return CrossFrameValidator.v09Validator.validateRenderItem(item, errors, logger);
    }

    recordError(
      'Malformed payload for RENDER_A2UI: array items must specify version "v0.9" or "1.0".',
      errors,
      logger,
    );
    return false;
  }
}
