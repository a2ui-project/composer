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
  static validateOutgoingMessage(message: {type: string; payload?: unknown}): boolean {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      console.error('Malformed message: message must be an object.');
      return false;
    }

    // NOTE: Bracket notation is used to access properties on the incoming message object
    // to prevent compilers from renaming these property accesses during minification.
    const msgType = message['type'];
    const msgPayload = message['payload'];

    if (typeof msgType !== 'string' || !msgType.trim()) {
      console.error('Malformed message: type must be a non-empty string.');
      return false;
    }

    switch (msgType) {
      case PreviewBridgeMessageType.GET_CATALOG: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            console.error(
              'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.GET_COMPONENT_USAGES: {
        if (msgPayload !== undefined && msgPayload !== null) {
          if (typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
            console.error(
              'Malformed payload for GET_COMPONENT_USAGES: must be an object, null, or undefined.',
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.RENDER_A2UI: {
        if (!msgPayload || !Array.isArray(msgPayload)) {
          console.error('Malformed payload for RENDER_A2UI: must be an Array.');
          return false;
        }

        for (const item of msgPayload) {
          if (!CrossFrameValidator.validateSingleRenderMessage(item)) {
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_BLOCKING_STATE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          console.error('Malformed payload for SET_BLOCKING_STATE: must be an object.');
          return false;
        }

        const blockingState = msgPayload as SetBlockingStatePayload;
        if (typeof blockingState['blocked'] !== 'boolean') {
          console.error(
            'Malformed payload for SET_BLOCKING_STATE: must contain boolean property blocked.',
          );
          return false;
        }
        if (
          blockingState['message'] !== undefined &&
          typeof blockingState['message'] !== 'string'
        ) {
          console.error(
            'Malformed payload for SET_BLOCKING_STATE: message property must be a string if present.',
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_THEME: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          console.error('Malformed payload for SET_THEME: must be an object.');
          return false;
        }

        const themePayload = msgPayload as SetThemePayload;
        if (!Object.values(ThemePreference).includes(themePayload['theme'])) {
          console.error(`Invalid theme preference mode: ${String(themePayload['theme'])}`);
          return false;
        }

        return true;
      }

      case PreviewBridgeMessageType.DATA_MODEL_CHANGE: {
        if (!msgPayload || typeof msgPayload !== 'object' || Array.isArray(msgPayload)) {
          console.error('Malformed payload for DATA_MODEL_CHANGE: must be an object.');
          return false;
        }

        const changePayload = msgPayload as DataModelChangePayload;
        const updateObj = changePayload['updateDataModel'];
        if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
          console.error(
            'Malformed payload for DATA_MODEL_CHANGE: must contain an updateDataModel object.',
          );
          return false;
        }

        const updateData = updateObj as UpdateDataModelDetails;
        if (typeof updateData['surfaceId'] !== 'string') {
          console.error(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel must contain a valid surfaceId string.',
          );
          return false;
        }
        if (updateData['path'] !== undefined && typeof updateData['path'] !== 'string') {
          console.error(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel path must be a string if present.',
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

  private static validateSingleRenderMessage(item: unknown): boolean {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      console.error('Malformed payload for RENDER_A2UI: array items must be objects.');
      return false;
    }

    // NOTE: Bracket notation is used to access properties on cross-frame message objects
    // to prevent compilers from renaming these properties during production minification.
    const itemObj = item as RenderA2uiItem;
    if (itemObj['version'] !== 'v0.9') {
      console.error('Malformed payload for RENDER_A2UI: array items must specify version "v0.9".');
      return false;
    }

    const updateKeys = ['createSurface', 'updateComponents', 'updateDataModel', 'deleteSurface'];
    const presentKeys = updateKeys.filter(key => key in itemObj && itemObj[key] !== undefined);

    if (presentKeys.length === 0) {
      console.error(
        'Malformed payload for RENDER_A2UI: item must contain an update property (createSurface, updateComponents, updateDataModel, or deleteSurface).',
      );
      return false;
    }

    if (presentKeys.length > 1) {
      console.error(
        `Malformed payload for RENDER_A2UI: item must contain exactly one update property, but found: ${presentKeys.join(', ')}.`,
      );
      return false;
    }

    const updateType = presentKeys[0];
    const updateObj = itemObj[updateType];

    if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
      console.error(`Malformed payload for RENDER_A2UI: ${updateType} property must be an object.`);
      return false;
    }

    const updateData = updateObj as BaseSurfaceDetails;
    if (typeof updateData['surfaceId'] !== 'string') {
      console.error(
        `Malformed payload for RENDER_A2UI: ${updateType} must contain a valid surfaceId string.`,
      );
      return false;
    }

    if (updateType === 'createSurface') {
      const createDetails = updateObj as CreateSurfaceDetails;
      if (typeof createDetails['catalogId'] !== 'string') {
        console.error(
          'Malformed payload for RENDER_A2UI: createSurface must contain a valid catalogId string.',
        );
        return false;
      }
      if (
        createDetails['sendDataModel'] !== undefined &&
        typeof createDetails['sendDataModel'] !== 'boolean'
      ) {
        console.error(
          'Malformed payload for RENDER_A2UI: createSurface sendDataModel must be a boolean if present.',
        );
        return false;
      }
    } else if (updateType === 'updateComponents') {
      const updateCompDetails = updateObj as UpdateComponentsDetails;
      if (!Array.isArray(updateCompDetails['components'])) {
        console.error(
          'Malformed payload for RENDER_A2UI: updateComponents must contain a components Array.',
        );
        return false;
      }
      for (const comp of updateCompDetails['components']) {
        if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
          console.error(
            'Malformed payload for RENDER_A2UI: updateComponents components array items must be objects.',
          );
          return false;
        }
      }
    } else if (updateType === 'updateDataModel') {
      const updateModelDetails = updateObj as UpdateDataModelDetails;
      if (
        updateModelDetails['path'] !== undefined &&
        typeof updateModelDetails['path'] !== 'string'
      ) {
        console.error(
          'Malformed payload for RENDER_A2UI: updateDataModel path must be a string if present.',
        );
        return false;
      }
    }

    return true;
  }
}
