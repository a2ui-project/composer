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

import {PreviewBridgeMessageType} from 'a2ui-bridge';

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

    if (typeof message.type !== 'string' || !message.type.trim()) {
      console.error('Malformed message: type must be a non-empty string.');
      return false;
    }

    switch (message.type) {
      case PreviewBridgeMessageType.GET_CATALOG: {
        if (message.payload !== undefined && message.payload !== null) {
          if (typeof message.payload !== 'object' || Array.isArray(message.payload)) {
            console.error(
              'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
            );
            return false;
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.RENDER_A2UI: {
        if (!message.payload || !Array.isArray(message.payload)) {
          console.error('Malformed payload for RENDER_A2UI: must be an Array.');
          return false;
        }

        for (const item of message.payload) {
          if (!item || typeof item !== 'object' || Array.isArray(item)) {
            console.error('Malformed payload for RENDER_A2UI: array items must be objects.');
            return false;
          }

          const itemObj = item as Record<string, unknown>;
          if (itemObj['version'] !== 'v0.9') {
            console.error(
              'Malformed payload for RENDER_A2UI: array items must specify version "v0.9".',
            );
            return false;
          }

          const updateKeys = [
            'createSurface',
            'updateComponents',
            'updateDataModel',
            'deleteSurface',
          ];
          const presentKeys = updateKeys.filter(
            key => key in itemObj && itemObj[key] !== undefined,
          );

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
            console.error(
              `Malformed payload for RENDER_A2UI: ${updateType} property must be an object.`,
            );
            return false;
          }

          const u = updateObj as Record<string, unknown>;
          if (typeof u['surfaceId'] !== 'string') {
            console.error(
              `Malformed payload for RENDER_A2UI: ${updateType} must contain a valid surfaceId string.`,
            );
            return false;
          }

          if (updateType === 'createSurface') {
            if (typeof u['catalogId'] !== 'string') {
              console.error(
                'Malformed payload for RENDER_A2UI: createSurface must contain a valid catalogId string.',
              );
              return false;
            }
            if (u['sendDataModel'] !== undefined && typeof u['sendDataModel'] !== 'boolean') {
              console.error(
                'Malformed payload for RENDER_A2UI: createSurface sendDataModel must be a boolean if present.',
              );
              return false;
            }
          } else if (updateType === 'updateComponents') {
            if (!Array.isArray(u['components'])) {
              console.error(
                'Malformed payload for RENDER_A2UI: updateComponents must contain a components Array.',
              );
              return false;
            }
            for (const comp of u['components']) {
              if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
                console.error(
                  'Malformed payload for RENDER_A2UI: updateComponents components array items must be objects.',
                );
                return false;
              }
            }
          } else if (updateType === 'updateDataModel') {
            if (u['path'] !== undefined && typeof u['path'] !== 'string') {
              console.error(
                'Malformed payload for RENDER_A2UI: updateDataModel path must be a string if present.',
              );
              return false;
            }
          }
        }
        return true;
      }

      case PreviewBridgeMessageType.SET_BLOCKING_STATE: {
        if (
          !message.payload ||
          typeof message.payload !== 'object' ||
          Array.isArray(message.payload)
        ) {
          console.error('Malformed payload for SET_BLOCKING_STATE: must be an object.');
          return false;
        }

        const p = message.payload as Record<string, unknown>;
        if (typeof p['blocked'] !== 'boolean') {
          console.error(
            'Malformed payload for SET_BLOCKING_STATE: must contain boolean property blocked.',
          );
          return false;
        }
        if (p['message'] !== undefined && typeof p['message'] !== 'string') {
          console.error(
            'Malformed payload for SET_BLOCKING_STATE: message property must be a string if present.',
          );
          return false;
        }
        return true;
      }

      case PreviewBridgeMessageType.DATA_MODEL_CHANGE: {
        if (
          !message.payload ||
          typeof message.payload !== 'object' ||
          Array.isArray(message.payload)
        ) {
          console.error('Malformed payload for DATA_MODEL_CHANGE: must be an object.');
          return false;
        }

        const p = message.payload as Record<string, unknown>;
        const updateObj = p['updateDataModel'];
        if (!updateObj || typeof updateObj !== 'object' || Array.isArray(updateObj)) {
          console.error(
            'Malformed payload for DATA_MODEL_CHANGE: must contain an updateDataModel object.',
          );
          return false;
        }

        const u = updateObj as Record<string, unknown>;
        if (typeof u['surfaceId'] !== 'string') {
          console.error(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel must contain a valid surfaceId string.',
          );
          return false;
        }
        if (u['path'] !== undefined && typeof u['path'] !== 'string') {
          console.error(
            'Malformed payload for DATA_MODEL_CHANGE: updateDataModel path must be a string if present.',
          );
          return false;
        }
        return true;
      }

      default: {
        console.warn(`Unrecognized message type: ${message.type}`);
        return true;
      }
    }
  }
}
