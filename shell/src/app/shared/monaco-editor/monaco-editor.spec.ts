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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ComponentHarness} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {signal} from '@angular/core';
import {MonacoEditor} from './monaco-editor';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {ErrorLogger} from '../../debug/error-logger.service';

const {mockGetModel, mockCreateModel, mockSetValue, mockEditorCreate} = vi.hoisted(() => {
  const mockSetValue = vi.fn();
  const mockGetModel = vi.fn();
  const mockCreateModel = vi.fn((val: string, lang: string, uri: unknown) => ({
    setValue: mockSetValue,
    dispose: vi.fn(),
  }));
  const mockEditorCreate = vi.fn(() => ({
    getModel: vi.fn(() => null),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    updateOptions: vi.fn(),
    onDidChangeModelContent: vi.fn(() => ({dispose: vi.fn()})),
    dispose: vi.fn(),
  }));
  return {mockGetModel, mockCreateModel, mockSetValue, mockEditorCreate};
});

vi.mock('@monaco-editor/loader', () => ({
  default: {
    config: vi.fn(),
    init: vi.fn().mockResolvedValue({
      Uri: {
        parse: vi.fn((uri: string) => ({toString: () => uri})),
      },
      editor: {
        getModel: mockGetModel,
        createModel: mockCreateModel,
        create: mockEditorCreate,
        onDidChangeMarkers: vi.fn(() => ({dispose: vi.fn()})),
        getModelMarkers: vi.fn(() => []),
      },
      languages: {
        json: {
          jsonDefaults: {
            setDiagnosticsOptions: vi.fn(),
          },
        },
      },
    }),
  },
}));

class MonacoEditorHarness extends ComponentHarness {
  static hostSelector = 'a2ui-composer-monaco-editor';
}

class MockCatalogManagement {
  readonly activeCatalog = signal(null);
}

class MockAppConfigProvider {
  readonly themePreference = signal(ThemePreference.LIGHT);
  initialize = vi.fn();
}

class MockErrorLogger {
  error = vi.fn();
  warn = vi.fn();
  info = vi.fn();
  log = vi.fn();
}

describe('MonacoEditor utilities', () => {
  describe('resolveJsonPointer', () => {
    it('normalizes and decodes paths', () => {
      const obj = {'foo/bar': {'baz~qux': {'encoded%20': 42}}};
      expect(MonacoEditor['resolveJsonPointer'](obj, '#/foo~1bar/baz~0qux/encoded%2520')).toBe(42);
    });

    it('blocks __proto__, constructor, and prototype paths with hasOwnProperty checks', () => {
      const obj = JSON.parse('{"valid": true}');
      expect(MonacoEditor['resolveJsonPointer'](obj, '#/__proto__')).toBeUndefined();
      expect(MonacoEditor['resolveJsonPointer'](obj, '#/constructor')).toBeUndefined();
      expect(MonacoEditor['resolveJsonPointer'](obj, '#/prototype')).toBeUndefined();
    });

    it('returns undefined if non-object is encountered in path', () => {
      const obj = {a: 42};
      expect(MonacoEditor['resolveJsonPointer'](obj, '#/a/b')).toBeUndefined();
    });
  });

  describe('resolveAndFlattenSchemaForDraft07', () => {
    it('halts recursion when depth > 50', () => {
      const result = MonacoEditor['resolveAndFlattenSchemaForDraft07'](
        {},
        {},
        {},
        new Set(),
        true,
        51,
      );
      expect(result['error']).toBe('Max schema recursion depth exceeded');
    });

    it('scopes definitions strictly to root', () => {
      const externalSchemas = {
        'foo.json': {
          target: {type: 'string'},
        },
      };

      const raw = {
        $ref: 'foo.json#/target',
      };

      const rootDefinitions = {};
      const flattened = MonacoEditor['resolveAndFlattenSchemaForDraft07'](
        raw,
        externalSchemas,
        rootDefinitions,
        new Set(),
        true,
      );

      expect(flattened['$ref']).toBe('#/definitions/foo_json__target');
      // @ts-expect-error Types mismatch in tests
      expect(rootDefinitions['foo_json__target']['type']).toBe('string');
    });

    it('processes allOf properly and merges required properties', () => {
      const raw = {
        allOf: [
          {properties: {a: {type: 'string'}}, required: ['a']},
          {properties: {b: {type: 'number'}}, required: ['b']},
        ],
      };

      const flattened = MonacoEditor['resolveAndFlattenSchemaForDraft07'](raw);
      expect(flattened['allOf']).toBeUndefined();
      expect(flattened['additionalProperties']).toBe(false);
      // @ts-expect-error Types mismatch in tests
      expect(flattened['properties']['a']['type']).toBe('string');
      // @ts-expect-error Types mismatch in tests
      expect(flattened['properties']['b']['type']).toBe('number');
      // @ts-expect-error Types mismatch in tests
      expect(flattened['required']).toContain('a');
      // @ts-expect-error Types mismatch in tests
      expect(flattened['required']).toContain('b');
    });
  });
});

describe('MonacoEditor component', () => {
  let fixture: ComponentFixture<MonacoEditor>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MonacoEditor],
      providers: [
        provideNoopAnimations(),
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: ErrorLogger, useClass: MockErrorLogger},
      ],
    });
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('creates a new model when getModel returns null', async () => {
    mockGetModel.mockReturnValue(null);
    fixture = TestBed.createComponent(MonacoEditor);
    fixture.componentRef.setInput('value', '{"initial": true}');
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    expect(harness).toBeTruthy();

    await Promise.resolve();

    expect(mockCreateModel).toHaveBeenCalledWith(
      '{"initial": true}',
      'json',
      expect.objectContaining({toString: expect.anything()}),
    );
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('reuses existing model and updates its value via setValue when getModel returns an existing model', async () => {
    const existingModel = {
      setValue: mockSetValue,
      dispose: vi.fn(),
    };
    mockGetModel.mockReturnValue(existingModel);
    mockCreateModel.mockClear();
    mockSetValue.mockClear();

    fixture = TestBed.createComponent(MonacoEditor);
    fixture.componentRef.setInput('value', '{"reused": true}');
    fixture.detectChanges();

    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    expect(harness).toBeTruthy();

    await Promise.resolve();

    expect(mockSetValue).toHaveBeenCalledWith('{"reused": true}');
    expect(mockCreateModel).not.toHaveBeenCalled();
  });
});
