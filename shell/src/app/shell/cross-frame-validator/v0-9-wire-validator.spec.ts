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
import {V09WireValidator} from './v0-9-wire-validator';

describe('V09WireValidator', () => {
  let validator: V09WireValidator;
  let mockLogger: {
    warn: Mock<(message: string, ...args: unknown[]) => void>;
    error: Mock<(message: string, ...args: unknown[]) => void>;
  };

  beforeEach(() => {
    validator = new V09WireValidator();
    mockLogger = {
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes version "v0.9"', () => {
    expect(validator.version).toBe('v0.9');
  });

  it('accepts valid action payload with version "v0.9"', () => {
    const payload = {
      version: 'v0.9',
      action: {
        name: 'button_click',
        context: {userId: '123'},
      },
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('accepts valid action payload with version "0.9"', () => {
    const payload = {
      version: '0.9',
      action: {
        name: 'button_click',
      },
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
  });

  it('accepts valid action payload with omitted version', () => {
    const payload = {
      action: {
        name: 'button_click',
      },
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
  });

  it('accepts valid dataModelChange payload', () => {
    const payload = {
      version: 'v0.9',
      dataModelChange: {
        surfaceId: 'surf-1',
        value: {counter: 1},
      },
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
  });

  it('accepts valid updateDataModel payload', () => {
    const payload = {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'surf-1',
        path: 'user.name',
        value: 'Jetski',
      },
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
  });

  it('accepts valid error payload', () => {
    const payload = {
      version: 'v0.9',
      error: {
        message: 'Something went wrong in renderer',
      },
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
  });

  it('rejects null or primitive payload', () => {
    expect(validator.validateSendToServer(null, undefined, mockLogger)).toBe(false);
    expect(validator.validateSendToServer('invalid', undefined, mockLogger)).toBe(false);
    expect(validator.validateSendToServer(123, undefined, mockLogger)).toBe(false);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('rejects array payload', () => {
    expect(validator.validateSendToServer([], undefined, mockLogger)).toBe(false);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('rejects payload with invalid version for v0.9 validator', () => {
    const payload = {
      version: 'v2.0',
      action: {name: 'click'},
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
  });

  it('rejects payload without recognized discriminator (action, dataModelChange, updateDataModel, error)', () => {
    const payload = {
      version: 'v0.9',
      otherProp: 'test',
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
  });

  it('rejects action if not an object or string', () => {
    const payload = {
      version: 'v0.9',
      action: 12345,
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(false);
  });

  it('accepts action as string', () => {
    const payload = {
      version: 'v0.9',
      action: 'flight_clicked',
    };
    expect(validator.validateSendToServer(payload, undefined, mockLogger)).toBe(true);
  });

  it('rejects prototype pollution keys (__proto__, constructor, prototype)', () => {
    const payloadProto = JSON.parse(
      '{"version":"v0.9","action":{"name":"test"},"__proto__":{"polluted":true}}',
    );
    expect(validator.validateSendToServer(payloadProto, undefined, mockLogger)).toBe(false);

    const payloadConstructor = {
      version: 'v0.9',
      action: {name: 'test'},
      constructor: {name: 'Evil'},
    };
    expect(validator.validateSendToServer(payloadConstructor, undefined, mockLogger)).toBe(false);

    const payloadNestedProto = {
      version: 'v0.9',
      action: {
        name: 'test',
        nested: JSON.parse('{"__proto__":{"polluted":true}}'),
      },
    };
    expect(validator.validateSendToServer(payloadNestedProto, undefined, mockLogger)).toBe(false);
  });

  it('populates error messages in errors array when provided', () => {
    const errors: string[] = [];
    const payload = {version: 'v0.9'};
    const result = validator.validateSendToServer(payload, errors, mockLogger);
    expect(result).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });
});
