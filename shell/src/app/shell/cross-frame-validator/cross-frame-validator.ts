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
  RenderA2uiItem,
  A2UI_UPDATE_KEYS,
  BaseSurfaceDetails,
  CreateSurfaceDetails,
  UpdateComponentsDetails,
  UpdateDataModelDetails,
  SetBlockingStatePayload,
  SetThemePayload,
  DataModelChangePayload,
  ThemePreference,
} from 'a2ui-bridge';

/**
 * Hardens postMessage channels by validating outgoing layout schemas,
 * component hierarchies, and data binding payloads prior to transmission.
 */
export class CrossFrameValidator {
  /**
   * Validates an outgoing message envelope and its payload structure.
   * Logs validation failures to console.error and appends error messages to errors array if provided.
   *
   * @param message The outgoing message object to validate.
   * @param errors An optional array to collect validation error messages.
   * @return `true` if the message is valid, `false` otherwise.
   */
  static validateOutgoingMessage(message: unknown, errors?: string[]): boolean {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      CrossFrameValidator.recordError('Malformed message: message must be an object.', errors);
      return false;
    }

    const msgObj = message as {type?: unknown; payload?: unknown};
    const msgType = msgObj.type;
    const msgPayload = msgObj.payload;

    if (typeof msgType !== 'string' || !msgType.trim()) {
      CrossFrameValidator.recordError(
        'Malformed message: type must be a non-empty string.',
        errors,
      );
      return false;
    }

    switch (msgType) {
      case PreviewBridgeMessageType.GET_CATALOG: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            CrossFrameValidator.recordError(
              'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
              errors,
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.GET_COMPONENT_USAGES: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            CrossFrameValidator.recordError(
              'Malformed payload for GET_COMPONENT_USAGES: must be an object, null, or undefined.',
              errors,
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.RENDER_A2UI: {
        if (!msgPayload || !Array.isArray(msgPayload)) {
          CrossFrameValidator.recordError(
            'Malformed payload for RENDER_A2UI: must be an Array.',
            errors,
          );
          return false;
        }

        for (const item of msgPayload) {
          if (!CrossFrameValidator.validateSingleRenderMessage(item, errors)) {
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_BLOCKING_STATE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          CrossFrameValidator.recordError(
            'Malformed payload for SET_BLOCKING_STATE: must be an object.',
            errors,
          );
          return false;
        }

        const blockingState = msgPayload as SetBlockingStatePayload;
        if (typeof blockingState.blocked !== 'boolean') {
          CrossFrameValidator.recordError(
            'Malformed payload for SET_BLOCKING_STATE: must contain boolean property blocked.',
            errors,
          );
          return false;
        }
        if (blockingState.message !== undefined && typeof blockingState.message !== 'string') {
          CrossFrameValidator.recordError(
            'Malformed payload for SET_BLOCKING_STATE: message property must be a string if present.',
            errors,
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_THEME: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          CrossFrameValidator.recordError(
            'Malformed payload for SET_THEME: must be an object.',
            errors,
          );
          return false;
        }

        const themePayload = msgPayload as SetThemePayload;
        if (!Object.values(ThemePreference).includes(themePayload.theme)) {
          CrossFrameValidator.recordError(
            `Invalid theme preference mode: ${String(themePayload.theme)}`,
            errors,
          );
          return false;
        }

        return true;
      }

      case PreviewBridgeMessageType.DATA_MODEL_CHANGE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          CrossFrameValidator.recordError(
            'Malformed payload for DATA_MODEL_CHANGE: must be an object.',
            errors,
          );
          return false;
        }

        const changePayload = msgPayload as DataModelChangePayload;
        const updateObj = changePayload.updateDataModel;
        if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
          CrossFrameValidator.recordError(
            'Malformed payload for DATA_MODEL_CHANGE: must contain an updateDataModel object.',
            errors,
          );
          return false;
        }

        const updateData = updateObj as UpdateDataModelDetails;
        if (typeof updateData.surfaceId !== 'string') {
          CrossFrameValidator.recordError(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel must contain a valid surfaceId string.',
            errors,
          );
          return false;
        }
        if (updateData.path !== undefined && typeof updateData.path !== 'string') {
          CrossFrameValidator.recordError(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel path must be a string if present.',
            errors,
          );
          return false;
        }
        return true;
      }

      default: {
        console.warn(`Unrecognized message type: ${msgType}`);
        return true;
      }
    }
  }

  /**
   * Validates an incoming message envelope dispatched from an embedded iframe.
   * Logs validation failures to console.error and appends error messages to errors array if provided.
   *
   * @param message The incoming message object to validate.
   * @param errors An optional array to collect validation error messages.
   * @returns `true` if the message is valid, `false` otherwise.
   */
  static validateIncomingMessage(message: unknown, errors?: string[]): boolean {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      CrossFrameValidator.recordError('Malformed message: message must be an object.', errors);
      return false;
    }

    const msgObj = message as {type?: unknown; payload?: unknown};
    const msgType = msgObj.type;
    const msgPayload = msgObj.payload;

    if (typeof msgType !== 'string' || !msgType.trim()) {
      CrossFrameValidator.recordError(
        'Malformed message: type must be a non-empty string.',
        errors,
      );
      return false;
    }

    switch (msgType) {
      // Validates dimensional updates dispatched by the embedded preview iframe
      // to ensure height and optional width are safe numerical values before updating host layout.
      case PreviewBridgeMessageType.SURFACE_RESIZE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          CrossFrameValidator.recordError(
            'Malformed payload for SURFACE_RESIZE: must be an object.',
            errors,
          );
          return false;
        }

        const MAX_SURFACE_DIMENSION = 20_000;
        const isValidDimension = (v: unknown): v is number =>
          typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= MAX_SURFACE_DIMENSION;

        const resizePayload = msgPayload as {height?: unknown; width?: unknown};
        if (!isValidDimension(resizePayload.height)) {
          CrossFrameValidator.recordError(
            'Malformed payload for SURFACE_RESIZE: must contain number property height.',
            errors,
          );
          return false;
        }
        if (resizePayload.width !== undefined && !isValidDimension(resizePayload.width)) {
          CrossFrameValidator.recordError(
            'Malformed payload for SURFACE_RESIZE: width property must be a number if present.',
            errors,
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
   * Validates a single render message item structure.
   */
  private static validateSingleRenderMessage(item: unknown, errors?: string[]): boolean {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      CrossFrameValidator.recordError(
        'Malformed payload for RENDER_A2UI: array items must be objects.',
        errors,
      );
      return false;
    }

    const itemObj = item as RenderA2uiItem;
    if (itemObj.version !== 'v0.9') {
      CrossFrameValidator.recordError(
        'Malformed payload for RENDER_A2UI: array items must specify version "v0.9".',
        errors,
      );
      return false;
    }

    const presentKeys = A2UI_UPDATE_KEYS.filter(
      key => key in itemObj && (itemObj as Record<string, unknown>)[key] !== undefined,
    );

    if (presentKeys.length === 0) {
      CrossFrameValidator.recordError(
        'Malformed payload for RENDER_A2UI: item must contain an update property (createSurface, updateComponents, updateDataModel, or deleteSurface).',
        errors,
      );
      return false;
    }

    if (presentKeys.length > 1) {
      CrossFrameValidator.recordError(
        `Malformed payload for RENDER_A2UI: item must contain exactly one update property, but found: ${presentKeys.join(', ')}.`,
        errors,
      );
      return false;
    }

    const updateType = presentKeys[0];
    const updateObj = (itemObj as Record<string, unknown>)[updateType];

    if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
      CrossFrameValidator.recordError(
        `Malformed payload for RENDER_A2UI: ${updateType} property must be an object.`,
        errors,
      );
      return false;
    }

    const updateData = updateObj as BaseSurfaceDetails;
    if (typeof updateData.surfaceId !== 'string') {
      CrossFrameValidator.recordError(
        `Malformed payload for RENDER_A2UI: ${updateType} must contain a valid surfaceId string.`,
        errors,
      );
      return false;
    }

    if (updateType === 'createSurface') {
      const createDetails = updateObj as CreateSurfaceDetails;
      if (typeof createDetails.catalogId !== 'string') {
        CrossFrameValidator.recordError(
          'Malformed payload for RENDER_A2UI: createSurface must contain a valid catalogId string.',
          errors,
        );
        return false;
      }
      if (
        createDetails.sendDataModel !== undefined &&
        typeof createDetails.sendDataModel !== 'boolean'
      ) {
        CrossFrameValidator.recordError(
          'Malformed payload for RENDER_A2UI: createSurface sendDataModel must be a boolean if present.',
          errors,
        );
        return false;
      }
    } else if (updateType === 'updateComponents') {
      const updateCompDetails = updateObj as UpdateComponentsDetails;
      if (!Array.isArray(updateCompDetails.components)) {
        CrossFrameValidator.recordError(
          'Malformed payload for RENDER_A2UI: updateComponents must contain a components Array.',
          errors,
        );
        return false;
      }
      for (const comp of updateCompDetails.components) {
        if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
          CrossFrameValidator.recordError(
            'Malformed payload for RENDER_A2UI: updateComponents components array items must be objects.',
            errors,
          );
          return false;
        }
      }
    } else if (updateType === 'updateDataModel') {
      const updateModelDetails = updateObj as UpdateDataModelDetails;
      if (updateModelDetails.path !== undefined && typeof updateModelDetails.path !== 'string') {
        CrossFrameValidator.recordError(
          'Malformed payload for RENDER_A2UI: updateDataModel path must be a string if present.',
          errors,
        );
        return false;
      }
    }

    return true;
  }

  private static recordError(errorMsg: string, errors?: string[]): void {
    console.error(errorMsg);
    if (errors) {
      errors.push(errorMsg);
    }
  }
}
