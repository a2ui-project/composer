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

import {TestBed} from '@angular/core/testing';
import {RawFrame} from './raw-frame';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RawFrameHarness} from './test/raw-frame.harness';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {IS_EXTENSION_MODE} from '../../shell/environment-tokens/environment-tokens';
import {signal, WritableSignal} from '@angular/core';
import {Subject} from 'rxjs';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import type * as monaco from 'monaco-editor';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';
import {ErrorLogger} from '../../debug/error-logger.service';

const {createMock, mockEditor, mockModel, undoStack, redoStack} = vi.hoisted(() => {
  const undoStack: string[] = [];
  const redoStack: string[] = [];

  const mockModel = {
    getFullModelRange: vi.fn(() => ({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    })),
    setValue: vi.fn(),
    dispose: vi.fn(),
  };

  const mockEditor = {
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    dispose: vi.fn(),
    executeEdits: vi.fn(),
    pushUndoStop: vi.fn(),
    trigger: vi.fn(),
    setPosition: vi.fn(),
    revealPositionInCenterIfOutsideViewport: vi.fn(),
    revealPositionInCenter: vi.fn(),
    focus: vi.fn(),
    onDidChangeModelContent: vi.fn(() => ({dispose: () => {}})),
    onDidChangeCursorPosition: vi.fn(() => ({dispose: () => {}})),
    onDidChangeCursorSelection: vi.fn(() => ({dispose: () => {}})),
    onKeyDown: vi.fn(() => ({dispose: () => {}})),
    onMouseDown: vi.fn(() => ({dispose: () => {}})),
    onDidChangeMarkers: vi.fn(() => ({dispose: () => {}})),
    getModelMarkers: vi.fn(() => []),
    updateOptions: vi.fn(),
    dispose: vi.fn(),
    getModel: vi.fn(() => ({
      getFullModelRange: vi.fn(() => ({})),
      dispose: vi.fn(),
    })),
  };

  const create = vi.fn(
    (container: HTMLElement, options: monaco.editor.IStandaloneEditorConstructionOptions) => {
      const textarea = document.createElement('textarea');
      textarea.className = 'mock-monaco-textarea';
      textarea.value = (options.model as unknown)?.value || '';
      if (options.readOnly) {
        textarea.readOnly = true;
      }
      container.appendChild(textarea);

      mockEditor.getValue.mockImplementation(() => textarea.value);
      mockEditor.setValue.mockImplementation((val: string) => {
        undoStack.length = 0;
        redoStack.length = 0;
        textarea.value = val;
        textarea.dispatchEvent(new Event('input'));
      });
      mockEditor.executeEdits.mockImplementation(
        (source: string, edits: monaco.editor.IIdentifiedSingleEditOperation[]) => {
          if (textarea.readOnly) {
            return false;
          }
          if (edits && edits.length > 0) {
            undoStack.push(textarea.value);
            redoStack.length = 0;
            textarea.value = edits[0].text;
            textarea.dispatchEvent(new Event('input'));
          }
          return true;
        },
      );
      mockEditor.trigger.mockImplementation((source: string, actionId: string) => {
        if (actionId === 'undo' && undoStack.length > 0) {
          const prev = undoStack.pop()!;
          redoStack.push(textarea.value);
          textarea.value = prev;
          textarea.dispatchEvent(new Event('input'));
        } else if (actionId === 'redo' && redoStack.length > 0) {
          const next = redoStack.pop()!;
          undoStack.push(textarea.value);
          textarea.value = next;
          textarea.dispatchEvent(new Event('input'));
        }
      });
      mockEditor.onDidChangeModelContent.mockImplementation((cb: () => void) => {
        textarea.addEventListener('input', cb);
        return {
          dispose: () => textarea.removeEventListener('input', cb),
        };
      });
      mockEditor.updateOptions.mockImplementation((newOpts: monaco.editor.IEditorOptions) => {
        if (newOpts.readOnly !== undefined) {
          textarea.readOnly = newOpts.readOnly;
        }
      });
      mockEditor.dispose.mockImplementation(() => {
        textarea.remove();
      });

      return mockEditor as unknown as monaco.editor.IStandaloneCodeEditor;
    },
  );

  return {createMock: create, mockEditor, mockModel, undoStack, redoStack};
});

vi.mock('@monaco-editor/loader', () => {
  return {
    default: {
      config: vi.fn(),
      init: vi.fn().mockResolvedValue({
        Uri: {
          parse: vi.fn((uri: string) => ({toString: () => uri})),
        },
        editor: {
          create: createMock,
          getModel: vi.fn(() => null),
          onDidChangeMarkers: vi.fn(() => ({dispose: vi.fn()})),
          createModel: vi.fn((value, language, uri) => ({
            value,
            language,
            uri,
            setValue: vi.fn(),
            dispose: vi.fn(),
          })),
          onDidChangeMarkers: vi.fn(() => ({dispose: () => {}})),
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
  };
});

class MockChatState {
  readonly isProgrammaticStreamActive = signal<boolean>(false);
  readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  readonly llmHistory = signal<LlmLogEntry[]>([]);
  addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }
  clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

class MockStateSync {
  readonly activeDraftSignal = signal(
    '[\n' +
      '  {\n' +
      '    "version": "v0.9",\n' +
      '    "createSurface": {\n' +
      '      "surfaceId": "sample-surface",\n' +
      '      "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",\n' +
      '      "sendDataModel": true\n' +
      '    }\n' +
      '  },\n' +
      '  {\n' +
      '    "version": "v0.9",\n' +
      '    "updateComponents": {\n' +
      '      "surfaceId": "sample-surface",\n' +
      '      "components": [\n' +
      '        {\n' +
      '          "id": "root",\n' +
      '          "component": "Column",\n' +
      '          "children": ["title", "location_input", "pickup_input", "dropoff_input", "book_button"],\n' +
      '          "justify": "start",\n' +
      '          "align": "stretch"\n' +
      '        },\n' +
      '        {\n' +
      '          "id": "title",\n' +
      '          "component": "Text",\n' +
      '          "text": "Book a Car",\n' +
      '          "variant": "h1"\n' +
      '        },\n' +
      '        {\n' +
      '          "id": "location_input",\n' +
      '          "component": "TextField",\n' +
      '          "label": "Pick-up Location",\n' +
      '          "value": {"path": "/booking/location"},\n' +
      '          "variant": "shortText"\n' +
      '        },\n' +
      '        {\n' +
      '          "id": "pickup_input",\n' +
      '          "component": "DateTimeInput",\n' +
      '          "label": "Pick-up Date",\n' +
      '          "value": {"path": "/booking/pickupDate"},\n' +
      '          "enableDate": true,\n' +
      '          "enableTime": false\n' +
      '        },\n' +
      '        {\n' +
      '          "id": "dropoff_input",\n' +
      '          "component": "DateTimeInput",\n' +
      '          "label": "Drop-off Date",\n' +
      '          "value": {"path": "/booking/dropoffDate"},\n' +
      '          "enableDate": true,\n' +
      '          "enableTime": false\n' +
      '        },\n' +
      '        {\n' +
      '          "id": "book_button",\n' +
      '          "component": "Button",\n' +
      '          "child": "book_button_text",\n' +
      '          "variant": "primary",\n' +
      '          "action": {\n' +
      '            "event": {\n' +
      '              "name": "searchCars",\n' +
      '              "context": {\n' +
      '                "location": {"path": "/booking/location"},\n' +
      '                "pickupDate": {"path": "/booking/pickupDate"},\n' +
      '                "dropoffDate": {"path": "/booking/dropoffDate"}\n' +
      '              }\n' +
      '            }\n' +
      '          }\n' +
      '        },\n' +
      '        {\n' +
      '          "id": "book_button_text",\n' +
      '          "component": "Text",\n' +
      '          "text": "Search Cars",\n' +
      '          "variant": "body"\n' +
      '        }\n' +
      '      ]\n' +
      '    }\n' +
      '  },\n' +
      '  {\n' +
      '    "version": "v0.9",\n' +
      '    "updateDataModel": {\n' +
      '      "surfaceId": "sample-surface",\n' +
      '      "path": "/booking",\n' +
      '      "value": {\n' +
      '        "location": "",\n' +
      '        "pickupDate": "",\n' +
      '        "dropoffDate": ""\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      ']',
  );
  readonly activeDraft = this.activeDraftSignal.asReadonly();
  updateDraft = vi.fn((val: string) => {
    this.activeDraftSignal.set(val);
  });
  hydrateActiveDraft = vi.fn(() => this.activeDraftSignal());
}

describe('RawFrame JSON Source Editor View', () => {
  let sendRenderA2UIMock: ReturnType<typeof vi.fn>;
  let sendRenderErrorMock: ReturnType<typeof vi.fn>;
  let mockActiveCatalog: WritableSignal<Catalog | null>;
  let mockThemePreference: WritableSignal<ThemePreference>;
  let stateSyncMock: MockStateSync;
  let chatStateMock: MockChatState;
  let snackBarMock: {open: ReturnType<typeof vi.fn>; dismiss: ReturnType<typeof vi.fn>};
  let messageStreamSubject: Subject<unknown>;
  let errorLoggerMock: {error: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    sendRenderA2UIMock = vi.fn();
    sendRenderErrorMock = vi.fn();
    mockActiveCatalog = signal<Catalog | null>({title: 'Sample Catalog'});
    mockThemePreference = signal<ThemePreference>(ThemePreference.LIGHT);
    snackBarMock = {
      open: vi.fn().mockReturnValue({
        onAction: () => ({
          subscribe: cb => {
            cb();
            return {unsubscribe: () => {}};
          },
        }),
      }),
      dismiss: vi.fn(),
    };
    errorLoggerMock = {error: vi.fn()};
    messageStreamSubject = new Subject<unknown>();

    undoStack.length = 0;
    redoStack.length = 0;
    mockEditor.trigger.mockClear();
    mockEditor.getValue.mockClear();
    mockEditor.setValue.mockClear();
    mockEditor.executeEdits.mockClear();
    mockEditor.onDidChangeModelContent.mockClear();
    mockEditor.updateOptions.mockClear();
    mockEditor.dispose.mockClear();
    mockEditor.getModel.mockClear();
    mockEditor.getModel.mockReturnValue(mockModel as unknown as monaco.editor.ITextModel);
    mockEditor.setPosition.mockClear();
    mockEditor.revealPositionInCenterIfOutsideViewport.mockClear();
    mockEditor.revealPositionInCenter.mockClear();
    mockEditor.focus.mockClear();
    mockModel.getFullModelRange.mockClear();
    mockModel.setValue.mockClear();
    createMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  async function setup(isExtension: boolean) {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RawFrame],
      providers: [
        provideNoopAnimations(),
        {provide: IS_EXTENSION_MODE, useValue: signal(isExtension)},
        {
          provide: HostCommunication,
          useValue: {
            sendRenderA2UI: sendRenderA2UIMock,
            sendRenderError: sendRenderErrorMock,
            messageStream$: messageStreamSubject.asObservable(),
            isRendererReady: vi.fn().mockReturnValue(false),
          },
        },
        {
          provide: CatalogManagement,
          useValue: {
            activeCatalog: mockActiveCatalog,
          },
        },
        {
          provide: AppConfigProvider,
          useValue: {
            themePreference: mockThemePreference,
          },
        },
        {provide: StateSync, useClass: MockStateSync},
        {provide: ChatState, useClass: MockChatState},
        {provide: MatSnackBar, useValue: snackBarMock},
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
        {provide: ErrorLogger, useValue: errorLoggerMock},
      ],
    }).compileComponents();

    stateSyncMock = TestBed.inject(StateSync) as unknown as MockStateSync;
    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;

    const fixture = TestBed.createComponent(RawFrame);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RawFrameHarness);
    const component = fixture.componentInstance;
    return {fixture, harness, component};
  }

  it('renders the raw JSON layout inside the editor', async () => {
    const {harness} = await setup(false);
    expect(await harness.getJsonText()).toContain('"createSurface"');
  });

  it('applies standard uncollapsed layout padding when extension mode signal is false', async () => {
    const {harness} = await setup(false);
    expect(await harness.isCollapsed()).toBe(false);
  });

  it('applies collapsed container styling when extension mode signal is true', async () => {
    const {harness} = await setup(true);
    expect(await harness.isCollapsed()).toBe(true);
  });

  it('updates backing signal when text is entered via test harness', async () => {
    const {fixture, harness} = await setup(false);
    await harness.setJsonText('{"updated": true}');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.TEST_ONLY.layoutJson()()).toBe('{"updated": true}');
  });

  it('calls sendRenderA2UI immediately during component setup with the parsed CAR_BOOKING payload', async () => {
    await setup(false);
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(sendRenderA2UIMock).toHaveBeenCalledWith([
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'sample-surface',
          catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
          sendDataModel: true,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'sample-surface',
          components: [
            {
              id: 'root',
              component: 'Column',
              children: ['title', 'location_input', 'pickup_input', 'dropoff_input', 'book_button'],
              justify: 'start',
              align: 'stretch',
            },
            {id: 'title', component: 'Text', text: 'Book a Car', variant: 'h1'},
            {
              id: 'location_input',
              component: 'TextField',
              label: 'Pick-up Location',
              value: {path: '/booking/location'},
              variant: 'shortText',
            },
            {
              id: 'pickup_input',
              component: 'DateTimeInput',
              label: 'Pick-up Date',
              value: {path: '/booking/pickupDate'},
              enableDate: true,
              enableTime: false,
            },
            {
              id: 'dropoff_input',
              component: 'DateTimeInput',
              label: 'Drop-off Date',
              value: {path: '/booking/dropoffDate'},
              enableDate: true,
              enableTime: false,
            },
            {
              id: 'book_button',
              component: 'Button',
              child: 'book_button_text',
              variant: 'primary',
              action: {
                event: {
                  name: 'searchCars',
                  context: {
                    location: {path: '/booking/location'},
                    pickupDate: {path: '/booking/pickupDate'},
                    dropoffDate: {path: '/booking/dropoffDate'},
                  },
                },
              },
            },
            {
              id: 'book_button_text',
              component: 'Text',
              text: 'Search Cars',
              variant: 'body',
            },
          ],
        },
      },
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId: 'sample-surface',
          path: '/booking',
          value: {location: '', pickupDate: '', dropoffDate: ''},
        },
      },
    ]);
  });

  it('triggers sendRenderA2UI after 300ms debouncing when valid JSON is typed, and badge remains hidden', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText(
      '[{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "c1"}}]',
    );
    fixture.detectChanges();

    // Before debounce passes
    vi.advanceTimersByTime(150);
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);

    // After debounce passes
    vi.advanceTimersByTime(150);
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(2);
    expect(sendRenderA2UIMock).toHaveBeenLastCalledWith([
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}},
    ]);
    expect(snackBarMock.open).not.toHaveBeenCalled();
  });

  it('sets isJsonInvalid to true, suppresses sendRenderA2UI, and displays the invalid JSON badge when malformed JSON is typed', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('{"version": "v0.9", invalid_json...');
    fixture.detectChanges();

    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Invalid JSON syntax detected.',
      'Go to line 1, col 21',
      expect.any(Object),
    );
  });

  it('sets isJsonInvalid to true, suppresses sendRenderA2UI, and displays the invalid JSON badge when a malformed JSON array is typed', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('[{"version": "v0.9"}');
    fixture.detectChanges();

    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Invalid JSON syntax detected.',
      'Go to line 1, col 21',
      expect.any(Object),
    );
  });

  it('suppresses the snackbar notification when malformed JSON is typed during an active stream (isLocked is true)', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();

    // Lock active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();

    await harness.setJsonText('{"version": "v0.9", invalid_json...');
    fixture.detectChanges();

    vi.advanceTimersByTime(3300);
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
    expect(snackBarMock.open).not.toHaveBeenCalled();
  });

  it('resets invalid JSON error timeout upon user interaction', async () => {
    const {fixture, harness, component} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('{"version": "v0.9", invalid_json...');
    fixture.detectChanges();

    // 300ms layout debounce expires and starts 3000ms invalid JSON timer
    vi.advanceTimersByTime(300);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    // Advance 2000ms (1000ms remaining)
    vi.advanceTimersByTime(2000);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    // User interaction occurs -> resets timer to 3000ms
    component['onUserInteraction']();

    // Advance 2000ms (4300ms total since typing, but only 2000ms since interaction)
    vi.advanceTimersByTime(2000);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    // Advance remaining 1000ms
    vi.advanceTimersByTime(1000);
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Invalid JSON syntax detected.',
      'Go to line 1, col 21',
      expect.any(Object),
    );
  });

  it('cancels invalid JSON error timer immediately when valid JSON is restored', async () => {
    const {fixture, harness, component} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('{"version": "v0.9", invalid_json...');
    fixture.detectChanges();

    // 300ms layout debounce expires and starts 3000ms timer
    vi.advanceTimersByTime(300);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    // Advance 1500ms while invalid
    vi.advanceTimersByTime(1500);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    // User restores valid JSON
    await harness.setJsonText('[{"version": "v0.9", "createSurface": {"surfaceId": "valid"}}]');
    fixture.detectChanges();

    // Layout debounce expires (300ms) and parses valid JSON
    vi.advanceTimersByTime(300);
    expect(snackBarMock.open).not.toHaveBeenCalled();
    expect(component['isJsonInvalid']()).toBe(false);

    // Advancing well past the original timeout does not trigger error snackbar
    vi.advanceTimersByTime(5000);
    expect(snackBarMock.open).not.toHaveBeenCalled();
  });

  it('clears invalid JSON error timer on destroy', async () => {
    const {fixture, harness} = await setup(false);
    vi.useFakeTimers();
    await harness.setJsonText('{"version": "v0.9", invalid_json...');
    fixture.detectChanges();

    vi.advanceTimersByTime(300);
    expect(snackBarMock.open).not.toHaveBeenCalled();

    fixture.destroy();

    vi.advanceTimersByTime(5000);
    expect(snackBarMock.open).not.toHaveBeenCalled();
  });

  it('dispatches initial layout dynamically when activeCatalog transitions from null to a valid catalog', async () => {
    mockActiveCatalog = signal(null);
    const {fixture} = await setup(false);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    mockActiveCatalog.set({title: 'Sample Catalog'});
    fixture.detectChanges();
    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
  });

  it('dispatches empty array when layout is an empty string on startup', async () => {
    mockActiveCatalog = signal(null);
    const {fixture, component} = await setup(false);
    expect(sendRenderA2UIMock).not.toHaveBeenCalled();

    component.TEST_ONLY.layoutJson().set('   ');
    mockActiveCatalog.set({title: 'Sample Catalog'});
    fixture.detectChanges();

    expect(sendRenderA2UIMock).toHaveBeenCalledWith([]);
  });

  it('propagates manual edits back to the state synchronization service to trigger history syncs', async () => {
    const {fixture, harness} = await setup(false);
    await harness.setJsonText('{"version": "v0.9"}');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(stateSyncMock.updateDraft).toHaveBeenCalledWith('{"version": "v0.9"}');
  });

  it('locks editor inputs forcefully during active streams lockouts periods', async () => {
    const {fixture, harness} = await setup(false);
    expect(await harness.isReadOnly()).toBe(false);

    // Lock active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect(await harness.isReadOnly()).toBe(true);

    // Release active stream lock
    chatStateMock.isProgrammaticStreamActive.set(false);
    fixture.detectChanges();
    expect(await harness.isReadOnly()).toBe(false);
  });

  it('applies the accessible name "Raw layout JSON" to the raw layout editor options', async () => {
    await setup(false);
    expect(createMock).toHaveBeenCalled();
    const lastCall = createMock.mock.calls[createMock.mock.calls.length - 1];
    expect(lastCall[1].ariaLabel).toBe('Raw layout JSON');
  });

  it('initializes monaco with vs-dark theme when dark mode is active', async () => {
    mockThemePreference.set(ThemePreference.DARK);
    await setup(false);
    expect(createMock).toHaveBeenCalled();
    const lastCall = createMock.mock.calls[createMock.mock.calls.length - 1];
    expect(lastCall[1].theme).toBe('vs-dark');
  });

  it('updates monaco theme dynamically when dark mode preference changes', async () => {
    const {fixture} = await setup(false);
    expect(createMock).toHaveBeenCalled();
    const lastCall = createMock.mock.calls[createMock.mock.calls.length - 1];
    expect(lastCall[1].theme).toBe('vs-light');

    mockThemePreference.set(ThemePreference.DARK);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockEditor.updateOptions).toHaveBeenCalledWith({theme: 'vs-dark'});
  });

  it('preserves undo and redo history allowing undo to restore previous content when stateSync activeDraft changes', async () => {
    const {fixture, harness} = await setup(false);
    const initialContent = await harness.getJsonText();

    // 1. Push a new draft from stateSync
    const newDraft = '[{"version": "v0.9", "createSurface": {"surfaceId": "undo-test"}}]';
    stateSyncMock.activeDraftSignal.set(newDraft);
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify content updated to newDraft
    expect(await harness.getJsonText()).toBe(newDraft);

    // 2. Perform undo operation on editor
    mockEditor.trigger('keyboard', 'undo', null);
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify content reverted back to initialContent
    expect(await harness.getJsonText()).toBe(initialContent);

    // 3. Perform redo operation on editor
    mockEditor.trigger('keyboard', 'redo', null);
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify content restored to newDraft
    expect(await harness.getJsonText()).toBe(newDraft);
  });

  it('falls back to setValue (flushing history) when stateSync activeDraft changes and editor model is missing', async () => {
    const {fixture, harness} = await setup(false);
    mockEditor.getModel.mockReturnValue(null);

    const fallbackDraft = '[{"version": "v0.9", "createSurface": {"surfaceId": "fallback-test"}}]';
    stateSyncMock.activeDraftSignal.set(fallbackDraft);
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify content updated to fallbackDraft
    expect(await harness.getJsonText()).toBe(fallbackDraft);

    // Perform undo operation on editor
    mockEditor.trigger('keyboard', 'undo', null);
    fixture.detectChanges();

    // Undo should have no effect because setValue flushed history stack
    expect(await harness.getJsonText()).toBe(fallbackDraft);
  });

  it('updates editor content via stateSync even when programmatic stream lock (readOnly) is active', async () => {
    const {fixture, harness} = await setup(false);

    // 1. Lock the active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect(await harness.isReadOnly()).toBe(true);

    // 2. Push a stream update from stateSync while locked
    const streamDraft = '[{"version": "v0.9", "createSurface": {"surfaceId": "stream-test"}}]';
    stateSyncMock.activeDraftSignal.set(streamDraft);
    fixture.detectChanges();
    await fixture.whenStable();

    // Verify content updated successfully and editor restored back to readOnly: true
    expect(await harness.getJsonText()).toBe(streamDraft);
    expect(await harness.isReadOnly()).toBe(true);
  });

  it('re-dispatches layout payload when receiving RENDERER_READY event from messageStream$', async () => {
    await setup(false);
    sendRenderA2UIMock.mockClear();

    messageStreamSubject.next({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://test',
      timestamp: Date.now(),
    });

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
  });

  it('re-dispatches layout payload when receiving A2UI_CATALOG event from messageStream$', async () => {
    await setup(false);
    sendRenderA2UIMock.mockClear();

    messageStreamSubject.next({
      type: PreviewBridgeMessageType.A2UI_CATALOG,
      origin: 'http://test',
      timestamp: Date.now(),
    });

    expect(sendRenderA2UIMock).toHaveBeenCalledTimes(1);
  });

  it('tracks isDestroyed state on component destruction', async () => {
    const {fixture, component} = await setup(false);
    expect(component['isDestroyed']).toBe(false);

    fixture.destroy();
    expect(component['isDestroyed']).toBe(true);
  });

  it('handles SyntaxError gracefully incorporating structured JsonParseResult metadata on failure', async () => {
    const {component} = await setup(false);

    let caughtError: (Error & {line?: number; column?: number; snippet?: string}) | undefined;
    try {
      component['parseLayoutString']('{\n  "invalid": json\n}');
    } catch (e) {
      caughtError = e as Error;
    }

    expect(caughtError!.message).toMatch(/Unexpected token/);
    // V8 node tests output this pattern
    expect(caughtError?.message).toMatch(/Unexpected token/);
    expect('line' in caughtError!).toBe(true);
    expect('snippet' in caughtError!).toBe(true);
  });

  it('aborts microtask execution and signal update guard when component is destroyed before microtask runs', async () => {
    const {fixture, component} = await setup(false);
    const initialLayout = component.TEST_ONLY.layoutJson()();

    stateSyncMock.activeDraftSignal.set(
      '[{"version": "v0.9", "createSurface": {"surfaceId": "abort-test"}}]',
    );

    fixture.destroy();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(component.TEST_ONLY.layoutJson()()).toBe(initialLayout);
  });

  describe('watchdog timer', () => {
    it('logs error when renderer is unresponsive after watchdog timeout', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Preview frame did not respond within 15 seconds.',
          sourceTag: '[Previewer]',
        }),
      );
    });

    it('logs IFRAME_UNRESPONSIVE_ERROR when renderer is ready but watchdog timeout fires', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      TestBed.inject(HostCommunication).isRendererReady.mockReturnValue(true);
      component.TEST_ONLY.startWatchdog();

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Preview frame failed to process payload within 15 seconds.',
          sourceTag: '[Previewer]',
        }),
      );
    });

    it('clears watchdog on RENDER_SUCCESS ping', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      TestBed.inject(HostCommunication).isRendererReady.mockReturnValue(true);

      component.TEST_ONLY.startWatchdog();
      vi.advanceTimersByTime(10000);

      // Emit RENDER_SUCCESS
      messageStreamSubject.next({type: 'RENDER_SUCCESS'});

      // Wait remaining 15s to ensure timer is fully cleared (not restarted)
      vi.advanceTimersByTime(15000);

      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('clears watchdog timer when render completion message arrives', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      messageStreamSubject.next({
        type: PreviewBridgeMessageType.RENDER_SUCCESS,
        origin: 'http://test',
        timestamp: Date.now(),
      });

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('cancels watchdog timer when invalid JSON syntax is detected in editor', async () => {
      vi.useFakeTimers();
      const {component, harness, fixture} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      await harness.setJsonText('{"version": "v0.9", invalid_json...');
      fixture.detectChanges();
      vi.advanceTimersByTime(300);

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('cancels watchdog timer when error markers are received', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      component['onMarkersChange']([
        {
          severity: 8,
          message: 'Syntax error',
          startLineNumber: 2,
          startColumn: 5,
        } as monaco.editor.IMarker,
      ]);

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('clears watchdog timer immediately when onLayoutChange is called', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      component['onLayoutChange']('{"changed": true}');

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('clears watchdog timer when SURFACE_RESIZE arrives from messageStream$', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      messageStreamSubject.next({
        type: PreviewBridgeMessageType.SURFACE_RESIZE,
        origin: 'http://test',
        timestamp: Date.now(),
      });

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('cancels watchdog timer and suppresses watchdog arming when schema error markers arrive', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      component.TEST_ONLY.startWatchdog();

      component['onMarkersChange']([
        {
          severity: 8,
          message: 'Schema validation error',
          startLineNumber: 2,
          startColumn: 3,
        } as monaco.editor.IMarker,
      ]);

      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();

      component.TEST_ONLY.startWatchdog();
      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('suspends watchdog when generative streaming is active', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      chatStateMock.isProgrammaticStreamActive.set(true);

      component.TEST_ONLY.startWatchdog();
      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();
    });

    it('suspends watchdog when document is hidden', async () => {
      vi.useFakeTimers();
      const {component} = await setup(false);
      Object.defineProperty(document, 'hidden', {value: true, configurable: true});

      component.TEST_ONLY.startWatchdog();
      vi.advanceTimersByTime(15000);
      expect(errorLoggerMock.error).not.toHaveBeenCalled();

      // Reset
      Object.defineProperty(document, 'hidden', {value: false, configurable: true});
    });
  });

  describe('notifySchemaErrors', () => {
    it('opens snackbar with schema error information and navigates to position upon action', async () => {
      const {component} = await setup(false);
      const markers = [
        {
          severity: 8,
          message: 'Invalid field',
          startLineNumber: 4,
          startColumn: 10,
        },
      ];

      const editor = component.monacoEditor();
      const navigateSpy = vi.spyOn(editor!, 'navigateToPosition');

      component.TEST_ONLY.notifySchemaErrors(markers as unknown[] as monaco.editor.IMarker[]);

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Schema error: Invalid field',
        'Go to line 4, col 10',
        expect.any(Object),
      );
      expect(navigateSpy).toHaveBeenCalledWith(4, 10);
    });

    it('displays schema error snackbar and provides navigation for severity 4 warning markers', async () => {
      const {component} = await setup(false);
      const editor = component.monacoEditor();
      expect(editor).toBeTruthy();
      const navigateSpy = vi.spyOn(editor!, 'navigateToPosition');

      const warningMarkers: monaco.editor.IMarker[] = [
        {
          severity: 4,
          message: 'Deprecated field used',
          startLineNumber: 8,
          startColumn: 15,
        } as monaco.editor.IMarker,
      ];

      component.TEST_ONLY.notifySchemaErrors(warningMarkers);

      expect(snackBarMock.open).toHaveBeenCalledWith(
        'Schema error: Deprecated field used',
        'Go to line 8, col 15',
        expect.objectContaining({
          panelClass: 'schema-error-snackbar',
        }),
      );
      expect(navigateSpy).toHaveBeenCalledWith(8, 15);
    });
  });

  it('handles schema marker changes and shows snackbar for errors', async () => {
    const {fixture} = await setup(false);
    vi.useFakeTimers();
    const markers = [
      {severity: 8, message: 'Invalid property a', startLineNumber: 3, startColumn: 7},
      {severity: 8, message: 'Invalid property b', startLineNumber: 6, startColumn: 2},
    ];
    fixture.componentInstance['onMarkersChange'](
      markers as unknown as import('monaco-editor').editor.IMarker[],
    );
    vi.advanceTimersByTime(3100);
    fixture.detectChanges();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Found 2 schema errors in JSON.',
      'Go to line 3, col 7',
      expect.any(Object),
    );

    // Clear
    fixture.componentInstance['onMarkersChange']([]);
    vi.advanceTimersByTime(3100);
    expect(snackBarMock.open).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('navigates to syntax error position when snackbar action is triggered', async () => {
    const {fixture, harness, component} = await setup(false);
    vi.useFakeTimers();

    const editor = component.monacoEditor();
    const navigateSpy = vi.spyOn(editor!, 'navigateToPosition');

    await harness.setJsonText('{"a": 1}\n{"syntax_error": }');
    fixture.detectChanges();

    vi.advanceTimersByTime(300);
    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Invalid JSON syntax detected.',
      'Go to line 2',
      expect.any(Object),
    );
    expect(navigateSpy).toHaveBeenCalledWith(2, 1);
  });

  it('falls back to Monaco getFirstErrorMarker when syntax error coordinates are missing from V8', async () => {
    const {component} = await setup(false);
    const editor = component.monacoEditor();
    expect(editor).toBeTruthy();
    vi.spyOn(editor!, 'getFirstErrorMarker').mockReturnValue({line: 5, column: 12});
    const navigateSpy = vi.spyOn(editor!, 'navigateToPosition');

    component['lastSyntaxError'] = null;
    component['showJsonSyntaxError']();

    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Invalid JSON syntax detected.',
      'Go to line 5, col 12',
      expect.objectContaining({
        duration: 5000,
      }),
    );
    expect(navigateSpy).toHaveBeenCalledWith(5, 12);
  });
});
