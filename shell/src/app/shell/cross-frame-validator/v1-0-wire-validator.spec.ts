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

import {describe, it, expect, vi, beforeEach, afterEach, type Mock} from 'vitest';
import {V10WireValidator} from './v1-0-wire-validator';
import {hasPrototypePollution} from './wire-version-validator';

describe('V10WireValidator', () => {
  let validator: V10WireValidator;
  let mockLogger: {
    warn: Mock<(message: string, ...args: unknown[]) => void>;
    error: Mock<(message: string, ...args: unknown[]) => void>;
  };

  beforeEach(() => {
    validator = new V10WireValidator();
    mockLogger = {
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes version "v1.0"', () => {
    expect(validator.version).toBe('v1.0');
  });

  describe('Version discriminator validation', () => {
    it('rejects wire payload with version "v1.0" with canonical message', () => {
      const payload = {
        version: 'v1.0',
        action: {name: 'test'},
      };
      const errors: string[] = [];
      const valid = validator.validateSendToServer(payload, errors, mockLogger);
      expect(valid).toBe(false);
      expect(errors).toContain(
        "Invalid wire message: A2UI v1.0 messages must specify version: '1.0' (got 'v1.0')",
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Invalid wire message: A2UI v1.0 messages must specify version: '1.0' (got 'v1.0')",
      );
    });

    it('rejects wire payload with version "v0.9"', () => {
      const payload = {
        version: 'v0.9',
        action: {name: 'test'},
      };
      const errors: string[] = [];
      expect(validator.validateSendToServer(payload, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Invalid version "v0.9" for v1.0 SEND_TO_SERVER payload (expected "1.0").',
      );
    });
  });

  describe('Action payload', () => {
    it('accepts valid action with version "1.0"', () => {
      const payload = {
        version: '1.0',
        action: {
          surfaceId: 'surf-1',
          name: 'submit_order',
          sourceComponentId: 'btn-1',
          timestamp: '2026-11-04T12:00:00Z',
          context: {cartId: 'c123'},
          userMessage: 'User submitted the cart',
          metadata: {extensions: {source: 'inline'}},
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('accepts minimal valid action with version "1.0"', () => {
      const payload = {
        version: '1.0',
        action: {
          name: 'ping',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('rejects action with non-string userMessage', () => {
      const payload = {
        version: '1.0',
        action: {
          name: 'submit',
          userMessage: 12345,
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('userMessage'));
    });

    it('rejects action with non-object metadata', () => {
      const payload = {
        version: '1.0',
        action: {
          name: 'submit',
          metadata: 'invalid',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('metadata'));
    });
  });

  describe('CallAgentFunction payload', () => {
    it('accepts web_core format (@call, @args, catalogId)', () => {
      const payload = {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-1',
          functionCallId: 'fn-call-001',
          callFunction: {
            '@call': 'searchFlights',
            '@args': {destination: 'SFO', date: '2026-12-01'},
            catalogId: 'travel-catalog',
          },
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);

      const details = V10WireValidator.extractCallAgentFunctionDetails(payload.callAgentFunction);
      expect(details).toEqual({
        surfaceId: 'surf-1',
        functionCallId: 'fn-call-001',
        functionName: 'searchFlights',
        args: {destination: 'SFO', date: '2026-12-01'},
        catalogId: 'travel-catalog',
      });
    });

    it('accepts stub iframe / bridge format (call, args, catalogId)', () => {
      const payload = {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-2',
          functionCallId: 'fn-call-002',
          call: 'getWeather',
          args: {city: 'New York'},
          catalogId: 'weather-catalog',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);

      const details = V10WireValidator.extractCallAgentFunctionDetails(payload.callAgentFunction);
      expect(details).toEqual({
        surfaceId: 'surf-2',
        functionCallId: 'fn-call-002',
        functionName: 'getWeather',
        args: {city: 'New York'},
        catalogId: 'weather-catalog',
      });
    });

    it('accepts callFunction with call and args properties', () => {
      const payload = {
        version: '1.0',
        callAgentFunction: {
          surfaceId: 'surf-3',
          functionCallId: 'fn-call-003',
          callFunction: {
            call: 'lookupUser',
            args: {id: 42},
          },
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);

      const details = V10WireValidator.extractCallAgentFunctionDetails(payload.callAgentFunction);
      expect(details).toEqual({
        surfaceId: 'surf-3',
        functionCallId: 'fn-call-003',
        functionName: 'lookupUser',
        args: {id: 42},
        catalogId: undefined,
      });
    });

    it('rejects callAgentFunction missing surfaceId or functionCallId', () => {
      expect(
        validator.validateSendToServer(
          {
            version: '1.0',
            callAgentFunction: {
              functionCallId: 'fn-1',
              call: 'test',
            },
          },
          undefined,
          mockLogger,
        ),
      ).toBe(false);

      expect(
        validator.validateSendToServer(
          {
            version: '1.0',
            callAgentFunction: {
              surfaceId: 's-1',
              call: 'test',
            },
          },
          undefined,
          mockLogger,
        ),
      ).toBe(false);
    });

    it('rejects callAgentFunction without a function name', () => {
      expect(
        validator.validateSendToServer(
          {
            version: '1.0',
            callAgentFunction: {
              surfaceId: 's-1',
              functionCallId: 'fn-1',
              callFunction: {},
            },
          },
          undefined,
          mockLogger,
        ),
      ).toBe(false);
    });
  });

  describe('RendererFunctionResponse payload', () => {
    it('accepts response with value', () => {
      const payload = {
        version: '1.0',
        rendererFunctionResponse: {
          surfaceId: 'surf-1',
          functionCallId: 'call-99',
          value: {rendered: true},
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('rejects response with legacy result field', () => {
      const payload = {
        version: '1.0',
        rendererFunctionResponse: {
          functionCallId: 'call-100',
          result: 'completed',
        },
      };
      const errors: string[] = [];
      expect(validator.validateSendToServer(payload, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 SEND_TO_SERVER: legacy result field is not permitted in v1.0 rendererFunctionResponse (use value or error).',
      );
    });

    it('rejects response with both value and error (strict XOR)', () => {
      const payload = {
        version: '1.0',
        rendererFunctionResponse: {
          functionCallId: 'call-100',
          value: {rendered: true},
          error: {message: 'Something failed'},
        },
      };
      const errors: string[] = [];
      expect(validator.validateSendToServer(payload, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 SEND_TO_SERVER: rendererFunctionResponse must specify exactly one of value or error.',
      );
    });

    it('accepts response with error', () => {
      const payload = {
        version: '1.0',
        rendererFunctionResponse: {
          functionCallId: 'call-101',
          error: {
            code: 'FUNCTION_NOT_FOUND',
            message: 'Unknown function rendererFoo',
          },
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('rejects response missing functionCallId', () => {
      const payload = {
        version: '1.0',
        rendererFunctionResponse: {
          value: 123,
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
    });

    it('rejects response without value or error', () => {
      const payload = {
        version: '1.0',
        rendererFunctionResponse: {
          functionCallId: 'call-102',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
    });
  });

  describe('Error payload', () => {
    it('accepts error with message, code, and functionCallId', () => {
      const payload = {
        version: '1.0',
        error: {
          functionCallId: 'fn-error-1',
          code: 'EXECUTION_TIMEOUT',
          message: 'Agent function timed out after 30000ms',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('accepts error with surfaceId, path, and code', () => {
      const payload = {
        version: '1.0',
        error: {
          surfaceId: 'surf-1',
          path: '/components/0',
          code: 'VALIDATION_FAILED',
          message: 'Missing required prop title',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('rejects error without message', () => {
      const payload = {
        version: '1.0',
        error: {
          code: 'SOME_ERROR',
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
    });
  });

  describe('UpdateDataModel payload', () => {
    it('accepts updateDataModel with a non-empty string path and a value', () => {
      const payload = {
        version: '1.0',
        updateDataModel: {surfaceId: 'surf-1', path: '/user/name', value: 'Ada'},
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('accepts updateDataModel without a path (root replacement)', () => {
      const payload = {
        version: '1.0',
        updateDataModel: {surfaceId: 'surf-1', value: {user: {name: 'Ada'}}},
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    });

    it('rejects updateDataModel with missing or empty surfaceId', () => {
      const errors: string[] = [];
      const payloadMissing = {
        version: '1.0',
        updateDataModel: {value: {user: {name: 'Ada'}}},
      };
      expect(validator.validateSendToServer(payloadMissing, errors, mockLogger)).toBe(false);
      expect(errors[0]).toContain(
        'Malformed v1.0 SEND_TO_SERVER: updateDataModel must contain a non-empty string surfaceId.',
      );

      const errorsEmpty: string[] = [];
      const payloadEmpty = {
        version: '1.0',
        updateDataModel: {surfaceId: '   ', value: {user: {name: 'Ada'}}},
      };
      expect(validator.validateSendToServer(payloadEmpty, errorsEmpty, mockLogger)).toBe(false);
      expect(errorsEmpty[0]).toContain(
        'Malformed v1.0 SEND_TO_SERVER: updateDataModel must contain a non-empty string surfaceId.',
      );
    });

    it('rejects updateDataModel with an empty string path', () => {
      const errors: string[] = [];
      const payload = {
        version: '1.0',
        updateDataModel: {surfaceId: 'surf-1', path: '   ', value: 'Ada'},
      };
      expect(validator.validateSendToServer(payload, errors, mockLogger)).toBe(false);
      expect(errors[0]).toContain(
        'Malformed v1.0 SEND_TO_SERVER: updateDataModel path, when present, must be a non-empty string.',
      );
    });

    it('rejects updateDataModel with a non-string path', () => {
      const errors: string[] = [];
      const payload = {
        version: '1.0',
        updateDataModel: {surfaceId: 'surf-1', path: 42, value: 'Ada'},
      };
      expect(validator.validateSendToServer(payload, errors, mockLogger)).toBe(false);
      expect(errors[0]).toContain(
        'Malformed v1.0 SEND_TO_SERVER: updateDataModel path, when present, must be a non-empty string.',
      );
    });

    it('rejects updateDataModel without a value', () => {
      const errors: string[] = [];
      const payload = {
        version: '1.0',
        updateDataModel: {surfaceId: 'surf-1', path: '/user/name'},
      };
      expect(validator.validateSendToServer(payload, errors, mockLogger)).toBe(false);
      expect(errors[0]).toContain(
        'Malformed v1.0 SEND_TO_SERVER: updateDataModel must contain a value.',
      );
    });
  });

  describe('Envelope and Security validation', () => {
    it('rejects non-object or null payload', () => {
      expect(validator.validateSendToServer(null, undefined, mockLogger)).toBe(false);
      expect(validator.validateSendToServer('string', undefined, mockLogger)).toBe(false);
      expect(validator.validateSendToServer([], undefined, mockLogger)).toBe(false);
    });

    it('rejects missing version', () => {
      expect(validator.validateSendToServer({action: {name: 'test'}}, undefined, mockLogger)).toBe(
        false,
      );
    });

    it('rejects payload with prototype pollution keys', () => {
      const payload = {
        version: '1.0',
        action: {
          name: 'test',
          __proto__: {polluted: true},
        },
      };
      expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
    });

    it('populates error array when provided', () => {
      const errors: string[] = [];
      const payload = {version: '1.0'};
      const result = validator.validateSendToServer(payload, errors, mockLogger);
      expect(result).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateRenderItem', () => {
    it('accepts valid v1.0 createSurface item', () => {
      const item = {
        version: '1.0',
        createSurface: {
          surfaceId: 'main-surface',
          catalogId: 'basic-catalog',
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('rejects v1.0 createSurface with legacy theme property', () => {
      const item = {
        version: '1.0',
        createSurface: {
          surfaceId: 'main-surface',
          catalogId: 'basic-catalog',
          theme: 'dark',
        },
      };
      const errors: string[] = [];
      expect(validator.validateRenderItem(item, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 createSurface: legacy theme property is illegal in A2UI v1.0.',
      );
    });

    it('accepts valid v1.0 callAgentFunctionResponse with value', () => {
      const item = {
        version: '1.0',
        callAgentFunctionResponse: {
          functionCallId: 'fn-123',
          value: {data: 'result-data'},
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('rejects v1.0 callAgentFunctionResponse with legacy result field', () => {
      const item = {
        version: '1.0',
        callAgentFunctionResponse: {
          functionCallId: 'fn-123',
          result: {data: 'result-data'},
        },
      };
      const errors: string[] = [];
      expect(validator.validateRenderItem(item, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 callAgentFunctionResponse: legacy result field is not permitted in v1.0 (use value or error).',
      );
    });

    it('rejects v1.0 callAgentFunctionResponse with both value and error', () => {
      const item = {
        version: '1.0',
        callAgentFunctionResponse: {
          functionCallId: 'fn-123',
          value: {data: 'result-data'},
          error: {message: 'Failed'},
        },
      };
      const errors: string[] = [];
      expect(validator.validateRenderItem(item, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 callAgentFunctionResponse: must specify exactly one of value or error.',
      );
    });

    it('accepts valid v1.0 updateDataModel', () => {
      const item = {
        version: '1.0',
        updateDataModel: {
          surfaceId: 'surf-1',
          path: '/user/name',
          value: 'Alice',
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('accepts valid v1.0 updateDataModel without path', () => {
      const item = {
        version: '1.0',
        updateDataModel: {
          surfaceId: 'surf-1',
          value: {user: {name: 'Alice'}},
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('accepts valid v1.0 deleteSurface', () => {
      const item = {
        version: '1.0',
        deleteSurface: {
          surfaceId: 'surf-1',
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('accepts valid v1.0 updateComponents', () => {
      const item = {
        version: '1.0',
        updateComponents: {
          surfaceId: 'surf-1',
          components: [{id: 'c1', component: 'Text'}],
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('accepts v1.0 createSurface without catalogId', () => {
      const item = {
        version: '1.0',
        createSurface: {
          surfaceId: 'surf-1',
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('rejects v1.0 createSurface with empty string catalogId', () => {
      const item = {
        version: '1.0',
        createSurface: {
          surfaceId: 'surf-1',
          catalogId: '   ',
        },
      };
      const errors: string[] = [];
      expect(validator.validateRenderItem(item, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 createSurface: catalogId must be a non-empty string when provided.',
      );
    });

    it('accepts v1.0 callRendererFunction without surfaceId', () => {
      const item = {
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'fn-123',
          call: 'myFunc',
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });

    it('rejects v1.0 callRendererFunction with empty string surfaceId', () => {
      const item = {
        version: '1.0',
        callRendererFunction: {
          surfaceId: '  ',
          functionCallId: 'fn-123',
          call: 'myFunc',
        },
      };
      const errors: string[] = [];
      expect(validator.validateRenderItem(item, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 callRendererFunction: surfaceId must be a non-empty string when provided.',
      );
    });

    it('accepts v1.0 callRendererFunction with callFunction object specifying @call or call', () => {
      const itemAtCall = {
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'fn-123',
          callFunction: {'@call': 'myFunc', '@args': {x: 1}},
        },
      };
      expect(validator.validateRenderItem(itemAtCall, undefined, mockLogger)).toBe(true);

      const itemCall = {
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'fn-123',
          callFunction: {call: 'myFunc', args: {x: 1}},
        },
      };
      expect(validator.validateRenderItem(itemCall, undefined, mockLogger)).toBe(true);
    });

    it('rejects v1.0 callRendererFunction with array or empty callFunction', () => {
      const itemArray = {
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'fn-123',
          callFunction: [],
        },
      };
      const errorsArray: string[] = [];
      expect(validator.validateRenderItem(itemArray, errorsArray, mockLogger)).toBe(false);
      expect(errorsArray).toContain(
        'Malformed v1.0 callRendererFunction: must specify function details via call or callFunction.',
      );

      const itemEmpty = {
        version: '1.0',
        callRendererFunction: {
          functionCallId: 'fn-123',
          callFunction: {},
        },
      };
      const errorsEmpty: string[] = [];
      expect(validator.validateRenderItem(itemEmpty, errorsEmpty, mockLogger)).toBe(false);
      expect(errorsEmpty).toContain(
        'Malformed v1.0 callRendererFunction: must specify function details via call or callFunction.',
      );
    });

    it('rejects v1.0 updateComponents with empty components array', () => {
      const item = {
        version: '1.0',
        updateComponents: {
          surfaceId: 'surf-1',
          components: [],
        },
      };
      const errors: string[] = [];
      expect(validator.validateRenderItem(item, errors, mockLogger)).toBe(false);
      expect(errors).toContain(
        'Malformed v1.0 updateComponents: components must be an Array with at least one element.',
      );
    });

    it('accepts valid v1.0 agentFunctionResponse with error', () => {
      const item = {
        version: '1.0',
        agentFunctionResponse: {
          functionCallId: 'call-1',
          error: {
            code: 'NO_AGENT_CONNECTED',
            message: 'No agent is connected to handle agent function calls.',
          },
        },
      };
      expect(validator.validateRenderItem(item, undefined, mockLogger)).toBe(true);
    });
  });

  describe('hasPrototypePollution', () => {
    it('allows nesting up to depth 64', () => {
      let nested: Record<string, unknown> = {val: 1};
      for (let i = 0; i < 60; i++) {
        nested = {nested};
      }
      expect(hasPrototypePollution(nested)).toBe(false);
    });

    it('fails closed when maxDepth is exceeded', () => {
      let nested: Record<string, unknown> = {val: 1};
      for (let i = 0; i < 70; i++) {
        nested = {nested};
      }
      expect(hasPrototypePollution(nested)).toBe(true);
    });

    it('returns true when maxDepth <= 0 on object', () => {
      expect(hasPrototypePollution({a: 1}, 0)).toBe(true);
      expect(hasPrototypePollution({a: 1}, -1)).toBe(true);
      expect(hasPrototypePollution('primitive', 0)).toBe(false);
    });
  });
});
