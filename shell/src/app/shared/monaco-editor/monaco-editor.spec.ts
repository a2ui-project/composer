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

const {
  mockGetModel,
  mockCreateModel,
  mockSetValue,
  mockEditorCreate,
  mockOnDidChangeMarkers,
  mockGetModelMarkers,
  mockOnDidChangeModelContent,
  mockOnDidChangeCursorPosition,
  mockOnDidChangeCursorSelection,
  mockOnKeyDown,
  mockOnMouseDown,
  mockModelContentDisposable,
  mockCursorPositionDisposable,
  mockCursorSelectionDisposable,
  mockKeyDownDisposable,
  mockMouseDownDisposable,
} = vi.hoisted(() => {
  const mockSetValue = vi.fn();
  const mockGetModel = vi.fn();
  const mockCreateModel = vi.fn((val: string, lang: string, uri: unknown) => ({
    setValue: mockSetValue,
    dispose: vi.fn(),
  }));
  const mockModelContentDisposable = {dispose: vi.fn()};
  const mockCursorPositionDisposable = {dispose: vi.fn()};
  const mockCursorSelectionDisposable = {dispose: vi.fn()};
  const mockKeyDownDisposable = {dispose: vi.fn()};
  const mockMouseDownDisposable = {dispose: vi.fn()};

  const mockOnDidChangeModelContent = vi.fn(() => mockModelContentDisposable);
  const mockOnDidChangeCursorPosition = vi.fn(() => mockCursorPositionDisposable);
  const mockOnDidChangeCursorSelection = vi.fn(() => mockCursorSelectionDisposable);
  const mockOnKeyDown = vi.fn(() => mockKeyDownDisposable);
  const mockOnMouseDown = vi.fn(() => mockMouseDownDisposable);

  const mockEditorCreate = vi.fn(() => ({
    getModel: vi.fn(() => null),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    updateOptions: vi.fn(),
    onDidChangeModelContent: mockOnDidChangeModelContent,
    onDidChangeCursorPosition: mockOnDidChangeCursorPosition,
    onDidChangeCursorSelection: mockOnDidChangeCursorSelection,
    onKeyDown: mockOnKeyDown,
    onMouseDown: mockOnMouseDown,
    dispose: vi.fn(),
  }));
  const mockOnDidChangeMarkers = vi.fn(() => ({dispose: vi.fn()}));
  const mockGetModelMarkers = vi.fn(() => []);
  return {
    mockGetModel,
    mockCreateModel,
    mockSetValue,
    mockEditorCreate,
    mockOnDidChangeMarkers,
    mockGetModelMarkers,
    mockOnDidChangeModelContent,
    mockOnDidChangeCursorPosition,
    mockOnDidChangeCursorSelection,
    mockOnKeyDown,
    mockOnMouseDown,
    mockModelContentDisposable,
    mockCursorPositionDisposable,
    mockCursorSelectionDisposable,
    mockKeyDownDisposable,
    mockMouseDownDisposable,
  };
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
        onDidChangeMarkers: mockOnDidChangeMarkers,
        getModelMarkers: mockGetModelMarkers,
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

    it('recursively flattens allOf and refs inside properties', () => {
      const externalSchemas = {
        'common.json': {
          definitions: {
            address: {
              type: 'object',
              properties: {
                street: {type: 'string'},
              },
            },
          },
        },
      };

      const raw = {
        type: 'object',
        properties: {
          user: {
            allOf: [{properties: {name: {type: 'string'}}}, {properties: {age: {type: 'number'}}}],
          },
          home: {
            $ref: 'common.json#/definitions/address',
          },
        },
      };

      const rootDefinitions: Record<string, unknown> = {};
      const flattened = MonacoEditor.resolveAndFlattenSchemaForDraft07(
        raw,
        externalSchemas,
        rootDefinitions,
      );

      const properties = flattened['properties'] as Record<string, Record<string, unknown>>;
      expect(properties['user']['allOf']).toBeUndefined();
      expect(properties['user']['additionalProperties']).toBe(false);
      const userProps = properties['user']['properties'] as Record<string, Record<string, unknown>>;
      expect(userProps['name']['type']).toBe('string');
      expect(userProps['age']['type']).toBe('number');

      expect(properties['home']['$ref']).toBe('#/definitions/common_json__definitions_address');
      const def = rootDefinitions['common_json__definitions_address'] as Record<string, unknown>;
      expect(def).toBeDefined();
      expect((def['properties'] as Record<string, Record<string, unknown>>)['street']['type']).toBe(
        'string',
      );
    });

    it('recursively flattens allOf inside array items', () => {
      const raw = {
        type: 'array',
        items: {
          allOf: [{properties: {id: {type: 'string'}}}, {properties: {active: {type: 'boolean'}}}],
        },
      };

      const flattened = MonacoEditor.resolveAndFlattenSchemaForDraft07(raw);
      const items = flattened['items'] as Record<string, unknown>;
      expect(items['allOf']).toBeUndefined();
      expect(items['additionalProperties']).toBe(false);
      const itemProps = items['properties'] as Record<string, Record<string, unknown>>;
      expect(itemProps['id']['type']).toBe('string');
      expect(itemProps['active']['type']).toBe('boolean');
    });

    it('recursively flattens schemas inside anyOf and oneOf', () => {
      const raw = {
        anyOf: [
          {
            allOf: [
              {properties: {kind: {type: 'string'}}},
              {properties: {radius: {type: 'number'}}},
            ],
          },
        ],
        oneOf: [
          {
            allOf: [{properties: {kind: {type: 'string'}}}, {properties: {side: {type: 'number'}}}],
          },
        ],
      };

      const flattened = MonacoEditor.resolveAndFlattenSchemaForDraft07(raw);
      const anyOf = flattened['anyOf'] as Array<Record<string, unknown>>;
      expect(anyOf[0]['allOf']).toBeUndefined();
      const anyOfProps = anyOf[0]['properties'] as Record<string, Record<string, unknown>>;
      expect(anyOfProps['kind']['type']).toBe('string');
      expect(anyOfProps['radius']['type']).toBe('number');

      const oneOf = flattened['oneOf'] as Array<Record<string, unknown>>;
      expect(oneOf[0]['allOf']).toBeUndefined();
      const oneOfProps = oneOf[0]['properties'] as Record<string, Record<string, unknown>>;
      expect(oneOfProps['kind']['type']).toBe('string');
      expect(oneOfProps['side']['type']).toBe('number');
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
    vi.clearAllTimers();
    vi.useRealTimers();
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

  it('handles empty uris array without throwing TypeError', async () => {
    fixture = TestBed.createComponent(MonacoEditor);
    fixture.componentRef.setInput('value', '{"test": true}');
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    expect(mockOnDidChangeMarkers).toHaveBeenCalled();
    const markerListener = mockOnDidChangeMarkers.mock.calls[0][0] as (
      uris: readonly {toString: () => string}[],
    ) => void;

    expect(() => markerListener([])).not.toThrow();
    expect(mockGetModelMarkers).not.toHaveBeenCalled();
  });

  it('handles multiple URIs and emits markers for matching model URI', async () => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MonacoEditor);
    fixture.componentRef.setInput('value', '{"test": true}');
    const markersSpy = vi.fn();
    fixture.componentInstance.markersChange.subscribe(markersSpy);
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    expect(mockOnDidChangeMarkers).toHaveBeenCalled();
    const markerListener = mockOnDidChangeMarkers.mock.calls[0][0] as (
      uris: readonly {toString: () => string}[],
    ) => void;

    const mockMarker = {
      severity: 8,
      message: 'Syntax error in JSON',
      startLineNumber: 1,
      startColumn: 5,
    };
    mockGetModelMarkers.mockReturnValue([mockMarker]);

    const otherUri = {toString: () => 'inmemory://other/unrelated.json'};
    const modelUri = {toString: () => 'inmemory://model/layout.json'};

    // Multi-URI array where modelUri is not at index 0
    markerListener([otherUri, modelUri]);
    vi.advanceTimersByTime(3000);

    expect(markersSpy).toHaveBeenCalledWith([mockMarker]);
    expect(mockGetModelMarkers).toHaveBeenCalled();

    // Consecutive event with identical marker signature is deduplicated
    markersSpy.mockClear();
    markerListener([modelUri]);
    vi.advanceTimersByTime(3000);
    expect(markersSpy).not.toHaveBeenCalled();
  });

  it('debounces error marker logging and emission by 3000ms', async () => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MonacoEditor);
    const markersSpy = vi.fn();
    fixture.componentInstance.markersChange.subscribe(markersSpy);
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    const markerListener = mockOnDidChangeMarkers.mock.calls[0][0] as (
      uris: readonly {toString: () => string}[],
    ) => void;

    const errorMarker = {
      severity: 8,
      message: 'Unexpected token',
      startLineNumber: 2,
      startColumn: 3,
    };
    mockGetModelMarkers.mockReturnValue([errorMarker]);
    const modelUri = {toString: () => 'inmemory://model/layout.json'};

    markerListener([modelUri]);

    // Before 3000ms, nothing emitted or logged
    vi.advanceTimersByTime(2999);
    expect(markersSpy).not.toHaveBeenCalled();
    const errorLogger = TestBed.inject(ErrorLogger);
    expect(errorLogger.error).not.toHaveBeenCalled();

    // At 3000ms, emitted and logged
    vi.advanceTimersByTime(1);
    expect(markersSpy).toHaveBeenCalledWith([errorMarker]);
    expect(errorLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unexpected token',
        sourceTag: '[Editor]',
        line: 2,
        column: 3,
      }),
    );
  });

  it('resets error debounce timer when user types or repositions cursor', async () => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MonacoEditor);
    const markersSpy = vi.fn();
    fixture.componentInstance.markersChange.subscribe(markersSpy);
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    const markerListener = mockOnDidChangeMarkers.mock.calls[0][0] as (
      uris: readonly {toString: () => string}[],
    ) => void;
    const contentListener = mockOnDidChangeModelContent.mock.calls[0][0] as () => void;
    const cursorListener = mockOnDidChangeCursorPosition.mock.calls[0][0] as () => void;

    const errorMarker = {
      severity: 8,
      message: 'Syntax error',
      startLineNumber: 1,
      startColumn: 1,
    };
    mockGetModelMarkers.mockReturnValue([errorMarker]);
    const modelUri = {toString: () => 'inmemory://model/layout.json'};

    markerListener([modelUri]);

    // Advance 2000ms
    vi.advanceTimersByTime(2000);
    expect(markersSpy).not.toHaveBeenCalled();

    // User types (content changes) -> timer reset to 3000ms
    contentListener();

    // Advance 2000ms (total 4000ms elapsed since marker, but only 2000ms since reset)
    vi.advanceTimersByTime(2000);
    expect(markersSpy).not.toHaveBeenCalled();

    // User moves cursor -> timer reset again
    cursorListener();

    // Advance 2500ms
    vi.advanceTimersByTime(2500);
    expect(markersSpy).not.toHaveBeenCalled();

    // Complete remaining 500ms
    vi.advanceTimersByTime(500);
    expect(markersSpy).toHaveBeenCalledWith([errorMarker]);
  });

  it('flushes clean markers immediately and cancels pending error timer', async () => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MonacoEditor);
    const markersSpy = vi.fn();
    fixture.componentInstance.markersChange.subscribe(markersSpy);
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    const markerListener = mockOnDidChangeMarkers.mock.calls[0][0] as (
      uris: readonly {toString: () => string}[],
    ) => void;

    const errorMarker = {
      severity: 8,
      message: 'Syntax error',
      startLineNumber: 1,
      startColumn: 1,
    };
    mockGetModelMarkers.mockReturnValue([errorMarker]);
    const modelUri = {toString: () => 'inmemory://model/layout.json'};

    // Error marker arrives
    markerListener([modelUri]);
    vi.advanceTimersByTime(1500);
    expect(markersSpy).not.toHaveBeenCalled();

    // Clean markers arrive (error resolved)
    mockGetModelMarkers.mockReturnValue([]);
    markerListener([modelUri]);

    // Flushed immediately without waiting for 3000ms
    expect(markersSpy).toHaveBeenCalledWith([]);

    // Advancing past original timer does not re-emit or crash
    vi.advanceTimersByTime(3000);
    expect(markersSpy).toHaveBeenCalledTimes(1);
    const errorLogger = TestBed.inject(ErrorLogger);
    expect(errorLogger.error).not.toHaveBeenCalled();
  });

  it('emits userInteraction on content change, cursor position, selection, keydown, and mousedown', async () => {
    fixture = TestBed.createComponent(MonacoEditor);
    const interactionSpy = vi.fn();
    fixture.componentInstance.userInteraction.subscribe(interactionSpy);
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    const contentListener = mockOnDidChangeModelContent.mock.calls[0][0] as () => void;
    const cursorPositionListener = mockOnDidChangeCursorPosition.mock.calls[0][0] as () => void;
    const cursorSelectionListener = mockOnDidChangeCursorSelection.mock.calls[0][0] as () => void;
    const keyDownListener = mockOnKeyDown.mock.calls[0][0] as () => void;
    const mouseDownListener = mockOnMouseDown.mock.calls[0][0] as () => void;

    contentListener();
    expect(interactionSpy).toHaveBeenCalledTimes(1);

    cursorPositionListener();
    expect(interactionSpy).toHaveBeenCalledTimes(2);

    cursorSelectionListener();
    expect(interactionSpy).toHaveBeenCalledTimes(3);

    keyDownListener();
    expect(interactionSpy).toHaveBeenCalledTimes(4);

    mouseDownListener();
    expect(interactionSpy).toHaveBeenCalledTimes(5);
  });

  it('cleans up debounce timer and Monaco disposables on destroy', async () => {
    vi.useFakeTimers();
    fixture = TestBed.createComponent(MonacoEditor);
    const markersSpy = vi.fn();
    fixture.componentInstance.markersChange.subscribe(markersSpy);
    fixture.detectChanges();

    await TestbedHarnessEnvironment.harnessForFixture(fixture, MonacoEditorHarness);
    await Promise.resolve();

    const markerListener = mockOnDidChangeMarkers.mock.calls[0][0] as (
      uris: readonly {toString: () => string}[],
    ) => void;

    const errorMarker = {
      severity: 8,
      message: 'Syntax error',
      startLineNumber: 1,
      startColumn: 1,
    };
    mockGetModelMarkers.mockReturnValue([errorMarker]);
    const modelUri = {toString: () => 'inmemory://model/layout.json'};

    markerListener([modelUri]);

    fixture.destroy();

    expect(mockModelContentDisposable.dispose).toHaveBeenCalled();
    expect(mockCursorPositionDisposable.dispose).toHaveBeenCalled();
    expect(mockCursorSelectionDisposable.dispose).toHaveBeenCalled();
    expect(mockKeyDownDisposable.dispose).toHaveBeenCalled();
    expect(mockMouseDownDisposable.dispose).toHaveBeenCalled();

    // Advance timers after destroy
    vi.advanceTimersByTime(5000);
    expect(markersSpy).not.toHaveBeenCalled();
  });
});
