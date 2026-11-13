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

import {describe, it, expect} from 'vitest';
import {validatePayloadProtocolVersion} from './protocol-version-mismatch';

describe('validatePayloadProtocolVersion', () => {
  it('returns valid for null, undefined, or empty payload', () => {
    expect(validatePayloadProtocolVersion(null, 'v0.9')).toEqual({valid: true});
    expect(validatePayloadProtocolVersion(undefined, 'v1.0')).toEqual({valid: true});
    expect(validatePayloadProtocolVersion([], 'v1.0')).toEqual({valid: true});
  });

  it('validates matching explicit versions', () => {
    const v09Payload = [{version: 'v0.9', createSurface: {surfaceId: 's1'}}];
    expect(validatePayloadProtocolVersion(v09Payload, 'v0.9')).toEqual({valid: true});

    const v10Payload = [{version: 'v1.0', createSurface: {surfaceId: 's1'}}];
    expect(validatePayloadProtocolVersion(v10Payload, 'v1.0')).toEqual({valid: true});

    const v10Numeric = [{version: '1.0', createSurface: {surfaceId: 's1'}}];
    expect(validatePayloadProtocolVersion(v10Numeric, 'v1.0')).toEqual({valid: true});
  });

  it('permits unversioned minimal v0.9 test fixtures on v0.9 without false positives', () => {
    const minimalFixture = [{createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    expect(validatePayloadProtocolVersion(minimalFixture, 'v0.9')).toEqual({valid: true});
  });

  describe('mismatch detection with explicit version', () => {
    it('detects v0.9 explicit payload when v1.0 is expected', () => {
      const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1'}}];
      const result = validatePayloadProtocolVersion(payload, 'v1.0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('PROTOCOL_VERSION_MISMATCH');
        expect(result.detectedVersion).toBe('v0.9');
        expect(result.expectedVersion).toBe('v1.0');
        expect(result.message).toContain('v0.9');
        expect(result.message).toContain('v1.0');
      }
    });

    it('detects v1.0 explicit payload when v0.9 is expected', () => {
      const payload = [{version: 'v1.0', createSurface: {surfaceId: 's1'}}];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('PROTOCOL_VERSION_MISMATCH');
        expect(result.detectedVersion).toBe('v1.0');
        expect(result.expectedVersion).toBe('v0.9');
      }
    });

    it('detects 1.0 explicit payload when v0.9 is expected', () => {
      const payload = [{version: '1.0', createSurface: {surfaceId: 's1'}}];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('PROTOCOL_VERSION_MISMATCH');
        expect(result.detectedVersion).toBe('v1.0');
        expect(result.expectedVersion).toBe('v0.9');
      }
    });
  });

  describe('mismatch detection with structural markers', () => {
    it('detects v1.0 inline createSurface.components on v0.9 expected version', () => {
      const payload = [
        {
          createSurface: {
            surfaceId: 's1',
            catalogId: 'c1',
            components: [{id: 'root', component: 'Column'}],
          },
        },
      ];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('PROTOCOL_VERSION_MISMATCH');
        expect(result.detectedVersion).toBe('v1.0');
        expect(result.expectedVersion).toBe('v0.9');
      }
    });

    it('detects v1.0 inline createSurface.dataModel on v0.9 expected version', () => {
      const payload = [
        {
          createSurface: {
            surfaceId: 's1',
            catalogId: 'c1',
            dataModel: {user: 'Alice'},
          },
        },
      ];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.code).toBe('PROTOCOL_VERSION_MISMATCH');
        expect(result.detectedVersion).toBe('v1.0');
      }
    });

    it('detects v1.0 callRendererFunction on v0.9 expected version', () => {
      const payload = [{callRendererFunction: {functionCallId: '1', callFunction: {call: 'test'}}}];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.detectedVersion).toBe('v1.0');
      }
    });

    it('detects v1.0 agentFunctionResponse on v0.9 expected version', () => {
      const payload = [{agentFunctionResponse: {functionCallId: '1', value: 'ok'}}];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.detectedVersion).toBe('v1.0');
      }
    });

    it('detects v1.0 @path / @call bindings on v0.9 expected version', () => {
      const payload = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'c1', component: 'TextField', value: {'@path': '/data/val'}}],
          },
        },
      ];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.detectedVersion).toBe('v1.0');
      }
    });

    it('detects v0.9 beginRendering on v1.0 expected version', () => {
      const payload = [{beginRendering: {surfaceId: 's1'}}];
      const result = validatePayloadProtocolVersion(payload, 'v1.0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.detectedVersion).toBe('v0.9');
      }
    });

    it('detects v0.9 legacy theme in createSurface on v1.0 expected version', () => {
      const payload = [{createSurface: {surfaceId: 's1', theme: 'dark'}}];
      const result = validatePayloadProtocolVersion(payload, 'v1.0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.detectedVersion).toBe('v0.9');
      }
    });

    it('detects v0.9 { path } binding on v1.0 expected version', () => {
      const payload = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'c1', component: 'TextField', value: {path: '/data/val'}}],
          },
        },
      ];
      const result = validatePayloadProtocolVersion(payload, 'v1.0');
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.detectedVersion).toBe('v0.9');
      }
    });

    it('does not treat objects with path and additional keys as v0.9 dynamic bindings', () => {
      const payload = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'c1', component: 'FileItem', item: {path: '/usr/bin', name: 'bin'}}],
          },
        },
      ];
      const result = validatePayloadProtocolVersion(payload, 'v1.0');
      expect(result.valid).toBe(true);
    });

    it('skips recursing into createSurface.dataModel and updateDataModel.value', () => {
      const payload = [
        {
          createSurface: {
            surfaceId: 's1',
            dataModel: {
              arbitraryUserPath: {path: '/nested/user/path'},
              directiveLookalike: {'@path': '/some/user/signal'},
            },
          },
        },
        {
          updateDataModel: {
            surfaceId: 's1',
            path: '/users/alice',
            value: {
              legacyPath: {path: '/home/alice'},
              v1Directive: {'@call': 'fetchUser'},
            },
          },
        },
      ];
      const resultV1 = validatePayloadProtocolVersion(payload, 'v1.0');
      expect(resultV1.valid).toBe(true);
    });

    it('does not falsely flag standard v0.9 updateComponents with component: Text as v1.0', () => {
      const payload = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'root', component: 'Text', text: 'Hello World'}],
          },
        },
      ];
      const result = validatePayloadProtocolVersion(payload, 'v0.9');
      expect(result.valid).toBe(true);
    });
  });
});
