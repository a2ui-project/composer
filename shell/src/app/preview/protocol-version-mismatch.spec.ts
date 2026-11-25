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
import {detectPayloadVersion, inspectPayloadVersion} from './protocol-version-mismatch';

describe('detectPayloadVersion', () => {
  it('returns null for null, undefined, or empty payload', () => {
    expect(detectPayloadVersion(null)).toBeNull();
    expect(detectPayloadVersion(undefined)).toBeNull();
    expect(detectPayloadVersion([])).toBeNull();
  });

  it('detects explicit versions v0.9, v1.0, and 1.0', () => {
    expect(detectPayloadVersion([{version: 'v0.9', createSurface: {surfaceId: 's1'}}])).toBe(
      'v0.9',
    );
    expect(detectPayloadVersion([{version: 'v1.0', createSurface: {surfaceId: 's1'}}])).toBe(
      'v1.0',
    );
    expect(detectPayloadVersion([{version: '1.0', createSurface: {surfaceId: 's1'}}])).toBe('v1.0');
  });

  it('returns null for unversioned minimal fixtures without structural markers', () => {
    expect(detectPayloadVersion([{createSurface: {surfaceId: 's1', catalogId: 'c1'}}])).toBeNull();
  });

  describe('structural marker detection', () => {
    it('detects v1.0 inline createSurface.components', () => {
      const payload = [
        {
          createSurface: {
            surfaceId: 's1',
            catalogId: 'c1',
            components: [{id: 'root', component: 'Column'}],
          },
        },
      ];
      expect(detectPayloadVersion(payload)).toBe('v1.0');
    });

    it('detects v1.0 inline createSurface.dataModel', () => {
      const payload = [
        {
          createSurface: {
            surfaceId: 's1',
            catalogId: 'c1',
            dataModel: {user: 'Alice'},
          },
        },
      ];
      expect(detectPayloadVersion(payload)).toBe('v1.0');
    });

    it('detects v1.0 callRendererFunction and agentFunctionResponse', () => {
      expect(
        detectPayloadVersion([
          {callRendererFunction: {functionCallId: '1', callFunction: {call: 'test'}}},
        ]),
      ).toBe('v1.0');
      expect(
        detectPayloadVersion([{agentFunctionResponse: {functionCallId: '1', value: 'ok'}}]),
      ).toBe('v1.0');
    });

    it('detects v1.0 @path / @call bindings', () => {
      const payload = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'c1', component: 'TextField', value: {'@path': '/data/val'}}],
          },
        },
      ];
      expect(detectPayloadVersion(payload)).toBe('v1.0');
    });

    it('detects v0.9 beginRendering', () => {
      expect(detectPayloadVersion([{beginRendering: {surfaceId: 's1'}}])).toBe('v0.9');
    });

    it('detects v0.9 legacy theme in createSurface', () => {
      expect(detectPayloadVersion([{createSurface: {surfaceId: 's1', theme: 'dark'}}])).toBe(
        'v0.9',
      );
    });

    it('detects v0.9 { path } binding', () => {
      const payload = [
        {
          updateComponents: {
            surfaceId: 's1',
            components: [{id: 'c1', component: 'TextField', value: {path: '/data/val'}}],
          },
        },
      ];
      expect(detectPayloadVersion(payload)).toBe('v0.9');
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
      expect(detectPayloadVersion(payload)).toBeNull();
    });

    it('skips recursing into createSurface.dataModel and updateDataModel.value', () => {
      const createSurfaceWithData = [
        {
          createSurface: {
            surfaceId: 's1',
            dataModel: {
              arbitraryUserPath: {path: '/nested/user/path'},
              directiveLookalike: {'@path': '/some/user/signal'},
            },
          },
        },
      ];
      const updateDataModelOnly = [
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
      // createSurface.dataModel itself is a v1.0 structural marker, not v0.9 from nested {path}.
      expect(detectPayloadVersion(createSurfaceWithData)).toBe('v1.0');
      expect(detectPayloadVersion(updateDataModelOnly)).toBeNull();
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
      expect(detectPayloadVersion(payload)).toBeNull();
    });

    it('does not infer v0.9 from catalogId substrings without version or structural markers (R2)', () => {
      expect(
        detectPayloadVersion([
          {
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
            },
          },
        ]),
      ).toBeNull();
      expect(
        detectPayloadVersion([
          {
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://example.com/v0.90/catalog.json',
            },
          },
        ]),
      ).toBeNull();
      expect(
        detectPayloadVersion([
          {
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://example.com/migrated-from-v0.9/catalog.json',
            },
          },
        ]),
      ).toBeNull();
      expect(
        detectPayloadVersion([
          {
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://a2ui.org/specification/v1_0/basic_catalog.json',
            },
          },
        ]),
      ).toBe('v1.0');
    });
  });

  describe('inspectPayloadVersion', () => {
    it('reports detected, mixed, and indeterminate payloads across all messages', () => {
      expect(inspectPayloadVersion([{createSurface: {surfaceId: 's1', catalogId: 'c1'}}])).toEqual({
        status: 'indeterminate',
      });
      expect(
        inspectPayloadVersion([
          {
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://example.com/migrated-from-v0.9/catalog.json',
            },
          },
        ]),
      ).toEqual({
        status: 'indeterminate',
      });
      expect(
        inspectPayloadVersion([
          {
            version: 'v0.9',
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            },
          },
          {version: 'v1.0', updateComponents: {surfaceId: 's1', components: []}},
        ]),
      ).toEqual({
        status: 'mixed',
        anchor: 'v1.0',
      });
      expect(
        inspectPayloadVersion([
          {
            version: 'v0.9',
            createSurface: {
              surfaceId: 's1',
              catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            },
          },
        ]),
      ).toEqual({
        status: 'detected',
        version: 'v0.9',
        anchor: 'v0.9',
      });
    });
  });
});
