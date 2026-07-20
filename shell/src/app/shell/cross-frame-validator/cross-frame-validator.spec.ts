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

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {CrossFrameValidator} from './cross-frame-validator';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

describe('CrossFrameValidator', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Envelope Validation', () => {
    it('rejects null message', () => {
      expect(CrossFrameValidator.validateOutgoingMessage(null as never)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed message: message must be an object.');
    });

    it('rejects non-object message', () => {
      expect(CrossFrameValidator.validateOutgoingMessage('message' as never)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed message: message must be an object.');
    });

    it('rejects array message', () => {
      expect(CrossFrameValidator.validateOutgoingMessage([] as never)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed message: message must be an object.');
    });

    it('rejects missing type', () => {
      expect(CrossFrameValidator.validateOutgoingMessage({payload: {}} as never)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed message: type must be a non-empty string.');
    });

    it('rejects non-string type', () => {
      expect(CrossFrameValidator.validateOutgoingMessage({type: 123} as never)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed message: type must be a non-empty string.');
    });

    it('rejects empty string type', () => {
      expect(CrossFrameValidator.validateOutgoingMessage({type: '   '} as never)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed message: type must be a non-empty string.');
    });
  });

  describe('GET_CATALOG', () => {
    it('accepts valid GET_CATALOG with no payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({type: PreviewBridgeMessageType.GET_CATALOG}),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts valid GET_CATALOG with undefined payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.GET_CATALOG,
          payload: undefined,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts valid GET_CATALOG with null payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.GET_CATALOG,
          payload: null,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts valid GET_CATALOG with object payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.GET_CATALOG,
          payload: {},
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('rejects GET_CATALOG with primitive payload (string)', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.GET_CATALOG,
          payload: 'invalid',
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
      );
    });

    it('rejects GET_CATALOG with primitive payload (number)', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.GET_CATALOG,
          payload: 123,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
      );
    });

    it('rejects GET_CATALOG with array payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.GET_CATALOG,
          payload: [],
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for GET_CATALOG: must be an object, null, or undefined.',
      );
    });
  });

  describe('RENDER_A2UI', () => {
    it('rejects RENDER_A2UI with missing payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({type: PreviewBridgeMessageType.RENDER_A2UI}),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed payload for RENDER_A2UI: must be an Array.');
    });

    it('accepts RENDER_A2UI with empty array', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: [],
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts RENDER_A2UI with valid createSurface', () => {
      const payload = [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'surface-1',
            catalogId: 'catalog-1',
            sendDataModel: true,
          },
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts RENDER_A2UI with valid updateComponents', () => {
      const payload = [
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'surface-1',
            components: [{component: 'button'}],
          },
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts RENDER_A2UI with valid updateDataModel', () => {
      const payload = [
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 'surface-1',
            path: 'user.name',
            value: 'Jetski',
          },
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts RENDER_A2UI with valid deleteSurface', () => {
      const payload = [
        {
          version: 'v0.9',
          deleteSurface: {
            surfaceId: 'surface-1',
          },
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts RENDER_A2UI with multiple valid items', () => {
      const payload = [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'surface-1',
            catalogId: 'cat-1',
          },
        },
        {
          version: 'v0.9',
          updateDataModel: {
            surfaceId: 'surface-2',
          },
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('rejects RENDER_A2UI with non-array payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: {},
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed payload for RENDER_A2UI: must be an Array.');
    });

    it('rejects RENDER_A2UI when an item is not an object', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: ['invalid'],
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: array items must be objects.',
      );
    });

    it('rejects RENDER_A2UI when an item is null', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: [null],
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: array items must be objects.',
      );
    });

    it('rejects RENDER_A2UI when an item is an array', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: [[]],
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: array items must be objects.',
      );
    });

    it('rejects RENDER_A2UI when an item lacks version v0.9', () => {
      const payload = [{updateComponents: {surfaceId: 's-1', components: []}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: array items must specify version "v0.9".',
      );
    });

    it('rejects RENDER_A2UI when an item lacks any update property', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload: [{version: 'v0.9'}],
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: item must contain an update property (createSurface, updateComponents, updateDataModel, or deleteSurface).',
      );
    });

    it('rejects RENDER_A2UI when an item contains multiple update properties', () => {
      const payload = [
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'surface-1',
            catalogId: 'cat-1',
          },
          deleteSurface: {
            surfaceId: 'surface-1',
          },
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: item must contain exactly one update property, but found: createSurface, deleteSurface.',
      );
    });

    it('rejects RENDER_A2UI when createSurface property is not an object', () => {
      const payload = [{version: 'v0.9', createSurface: 'invalid'}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: createSurface property must be an object.',
      );
    });

    it('rejects RENDER_A2UI when createSurface lacks surfaceId', () => {
      const payload = [{version: 'v0.9', createSurface: {catalogId: 'cat-1'}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: createSurface must contain a valid surfaceId string.',
      );
    });

    it('rejects RENDER_A2UI when createSurface lacks catalogId', () => {
      const payload = [{version: 'v0.9', createSurface: {surfaceId: 's-1'}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: createSurface must contain a valid catalogId string.',
      );
    });

    it('rejects RENDER_A2UI when createSurface sendDataModel is not boolean', () => {
      const payload = [
        {
          version: 'v0.9',
          createSurface: {surfaceId: 's-1', catalogId: 'c-1', sendDataModel: 'true'},
        },
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: createSurface sendDataModel must be a boolean if present.',
      );
    });

    it('rejects RENDER_A2UI when updateComponents lacks surfaceId', () => {
      const payload = [{version: 'v0.9', updateComponents: {components: []}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: updateComponents must contain a valid surfaceId string.',
      );
    });

    it('rejects RENDER_A2UI when updateComponents components is not an array', () => {
      const payload = [{version: 'v0.9', updateComponents: {surfaceId: 's-1', components: {}}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: updateComponents must contain a components Array.',
      );
    });

    it('rejects RENDER_A2UI when updateComponents components array items are not objects', () => {
      const payload = [
        {version: 'v0.9', updateComponents: {surfaceId: 's-1', components: ['invalid']}},
      ];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: updateComponents components array items must be objects.',
      );
    });

    it('rejects RENDER_A2UI when updateDataModel lacks surfaceId', () => {
      const payload = [{version: 'v0.9', updateDataModel: {path: 'user'}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: updateDataModel must contain a valid surfaceId string.',
      );
    });

    it('rejects RENDER_A2UI when updateDataModel path is not a string', () => {
      const payload = [{version: 'v0.9', updateDataModel: {surfaceId: 's-1', path: 123}}];
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.RENDER_A2UI,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for RENDER_A2UI: updateDataModel path must be a string if present.',
      );
    });
  });

  describe('SET_BLOCKING_STATE', () => {
    it('accepts valid SET_BLOCKING_STATE payload', () => {
      const payload = {blocked: true, message: 'Processing...'};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('rejects SET_BLOCKING_STATE with missing payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for SET_BLOCKING_STATE: must be an object.',
      );
    });

    it('rejects SET_BLOCKING_STATE with array payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
          payload: [],
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for SET_BLOCKING_STATE: must be an object.',
      );
    });

    it('rejects SET_BLOCKING_STATE missing blocked', () => {
      const payload = {message: 'Processing...'};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for SET_BLOCKING_STATE: must contain boolean property blocked.',
      );
    });

    it('rejects SET_BLOCKING_STATE with non-string message', () => {
      const payload = {blocked: true, message: 123};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_BLOCKING_STATE,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for SET_BLOCKING_STATE: message property must be a string if present.',
      );
    });
  });

  describe('SET_THEME', () => {
    it('accepts valid SET_THEME payload with theme light', () => {
      const payload = {theme: 'light'};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_THEME,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('accepts valid SET_THEME payload with theme dark', () => {
      const payload = {theme: 'dark'};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_THEME,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('rejects SET_THEME with missing payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_THEME,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed payload for SET_THEME: must be an object.');
    });

    it('rejects SET_THEME with non-object payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_THEME,
          payload: 'light',
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('Malformed payload for SET_THEME: must be an object.');
    });

    it('rejects SET_THEME with invalid theme value', () => {
      const payload = {theme: 'blue'};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.SET_THEME,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for SET_THEME: theme must be "light" or "dark".',
      );
    });
  });

  describe('DATA_MODEL_CHANGE', () => {
    it('accepts valid DATA_MODEL_CHANGE payload', () => {
      const payload = {
        updateDataModel: {
          surfaceId: 'surface-1',
          path: 'user.name',
          value: 'Jetski',
        },
      };
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
          payload,
        }),
      ).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('rejects DATA_MODEL_CHANGE with missing payload', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for DATA_MODEL_CHANGE: must be an object.',
      );
    });

    it('rejects DATA_MODEL_CHANGE missing updateDataModel', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
          payload: {},
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for DATA_MODEL_CHANGE: must contain an updateDataModel object.',
      );
    });

    it('rejects DATA_MODEL_CHANGE with malformed updateDataModel', () => {
      const payload = {updateDataModel: {path: 'user'}};
      expect(
        CrossFrameValidator.validateOutgoingMessage({
          type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
          payload,
        }),
      ).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(
        'Malformed payload for DATA_MODEL_CHANGE: updateDataModel must contain a valid surfaceId string.',
      );
    });
  });

  describe('Unrecognized Message Types', () => {
    it('logs warning and returns true for unrecognized message type', () => {
      expect(
        CrossFrameValidator.validateOutgoingMessage({type: 'UNKNOWN_EVENT', payload: 123}),
      ).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith('Unrecognized message type: UNKNOWN_EVENT');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
