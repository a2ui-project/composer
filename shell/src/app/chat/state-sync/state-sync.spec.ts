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
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {StateSync} from './state-sync';
import {ChatState, LlmLogEntry, LlmLogType} from '../chat-state/chat-state';
import {LlmMessage} from '../llm-client/llm-client';
import {MessageRole} from '../llm-client/llm-client';
import {CAR_BOOKING} from '../chat-service/initial-draft';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';
import {formatJson} from '../../utils/json';
import {signal} from '@angular/core';
import {ErrorLogger} from '../../debug/error-logger.service';

class MockChatState {
  private readonly _chatHistory: LlmMessage[] = [];
  readonly chatHistory = vi.fn(() => this._chatHistory);
  setChatHistory = vi.fn((history: LlmMessage[]) => {
    this._chatHistory.length = 0;
    this._chatHistory.push(...history);
  });
  updateChatHistory = vi.fn((updater: (history: LlmMessage[]) => LlmMessage[]) => {
    const updated = updater([...this._chatHistory]);
    this._chatHistory.length = 0;
    this._chatHistory.push(...updated);
  });

  private _latestLlmLog: LlmLogEntry | null = null;
  private _llmHistory: LlmLogEntry[] = [];
  readonly latestLlmLog = vi.fn(() => this._latestLlmLog);
  readonly llmHistory = vi.fn(() => this._llmHistory);
  addRawLlmLog = vi.fn((type: LlmLogType, payload: unknown) => {
    const entry = {type, timestamp: Date.now(), payload};
    this._latestLlmLog = entry;
    this._llmHistory.push(entry);
    if (this._llmHistory.length > 50) {
      this._llmHistory.shift();
    }
  });
  clearRawLlmHistory = vi.fn(() => {
    this._latestLlmLog = null;
    this._llmHistory.length = 0;
  });
}

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

class MockStartupConfigState {
  readonly activeRenderer = signal<{samplePayload?: string} | null>(null);
  readonly selectedRendererId = signal<string | null>(null);
  readonly sharedA2uiPayload = signal<string | null>(null);
}

describe('StateSync Autosave Draft Integrations', () => {
  let service: StateSync;
  let chatStateMock: MockChatState;
  let catalogManagementMock: MockCatalogManagement;
  let startupConfigStateMock: MockStartupConfigState;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();

    startupConfigStateMock = new MockStartupConfigState();

    TestBed.configureTestingModule({
      providers: [
        StateSync,
        {provide: ChatState, useClass: MockChatState},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: StartupConfigStateService, useValue: startupConfigStateMock},
      ],
    });

    service = TestBed.inject(StateSync);
    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;

    // Initialize catalog mock with the basic catalog ID
    catalogManagementMock.activeCatalog.set({
      catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
    });

    // Eagerly flush Angular change detection effect bindings instantly upon
    // setup to prevent microtask leaks
    TestBed.tick();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes activeDraft with CAR_BOOKING constant on startup when empty and sharedA2uiPayload is null', () => {
    expect(service.activeDraft()).toBe(CAR_BOOKING);
  });

  it('prepopulates activeDraft with sharedA2uiPayload when present on StartupResolution', () => {
    const customSharedJson = '[{"version":"v0.9","createSurface":{"surfaceId":"shared-surface"}}]';
    startupConfigStateMock.sharedA2uiPayload.set(customSharedJson);

    // Create fresh instance after setting shared payload
    const sharedService = TestBed.inject(StateSync);
    TestBed.tick();
    expect(sharedService.activeDraft()).toBe(customSharedJson);
  });

  it('updates activeDraft dynamically when sharedA2uiPayload signal emits a new value', () => {
    const newSharedJson = '[{"version":"v0.9","createSurface":{"surfaceId":"dynamic-hashchange"}}]';
    startupConfigStateMock.sharedA2uiPayload.set(newSharedJson);
    TestBed.tick();

    expect(service.activeDraft()).toBe(newSharedJson);
  });

  it('updates draft in-memory synchronously and ignores initial setup debouncer', () => {
    service.updateDraft('[{"version": "v0.9"}]');
    expect(service.hydrateActiveDraft()).toBe('[{"version": "v0.9"}]');
    expect(service.activeDraft()).toBe('[{"version": "v0.9"}]');

    // Debounce timer should NOT fire synchronization instantly
    expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
    expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
  });

  it('resynchronizes a restored draft after the model changed the canvas', () => {
    const original = '[{"version":"v0.9","text":"original flight"}]';
    const generated = '[{"version":"v0.9","text":"changed flight"}]';
    service.injectExternalDraft(original);
    service.syncActiveDraftToHistory();
    service.commitLayoutFromLlm(generated);
    chatStateMock.updateChatHistory(history => [
      ...history,
      {role: MessageRole.MODEL, content: generated},
    ]);
    service.updateDraft(original);
    service.syncActiveDraftToHistory();
    expect(chatStateMock.chatHistory().at(-1)?.role).toBe(MessageRole.USER);
    expect(chatStateMock.chatHistory().at(-1)?.content).toContain('original flight');
  });

  it('syncs an injected draft before its initial observable emission', () => {
    const draft = '[{"version":"v0.9","text":"edited gallery draft","mockRules":[]} ]';
    service.injectExternalDraft(draft);

    service.syncActiveDraftToHistory();

    expect(chatStateMock.chatHistory()).toHaveLength(1);
    expect(chatStateMock.chatHistory()[0].content).toContain('edited gallery draft');
  });

  it('does not append a delayed draft snapshot after the prompt and model placeholder', () => {
    service.updateDraft('[{"version":"v0.9","text":"edited canvas"}]');
    TestBed.tick();
    service.syncActiveDraftToHistory();
    chatStateMock.updateChatHistory(history => [
      ...history,
      {role: MessageRole.USER, content: 'Make this blue'},
      {role: MessageRole.MODEL, content: ' ●●●'},
    ]);

    vi.advanceTimersByTime(300);

    expect(chatStateMock.chatHistory()).toHaveLength(3);
    expect(chatStateMock.chatHistory().at(-1)?.role).toBe(MessageRole.MODEL);
  });

  it('does not restore an older pending edit after a model commits a new canvas', () => {
    service.updateDraft('[{"version":"v0.9","text":"old canvas"}]');
    TestBed.tick();
    service.commitLayoutFromLlm('[{"version":"v0.9","text":"new canvas"}]');

    vi.advanceTimersByTime(300);

    expect(chatStateMock.chatHistory()).toEqual([]);
  });

  it('triggers history sync after 300ms debouncing, appending a new node', () => {
    service.updateDraft('[{"version": "v0.9"}]');
    TestBed.tick(); // Flush toObservable event boundaries instantly!

    vi.advanceTimersByTime(150);
    expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(chatStateMock.setChatHistory).toHaveBeenCalledWith([
      {
        role: MessageRole.USER,
        content: '[\n  {\n    "version": "v0.9"\n  }\n]',
      },
    ]);
  });

  it('updates target layout node in-place if last message is also user layout snapshot', () => {
    // Prime the mock history with user snapshot
    chatStateMock.setChatHistory([
      {
        role: MessageRole.USER,
        content: '[\n  {\n    "version": "v0.9",\n    "orig": true\n  }\n]',
      },
    ]);

    service.updateDraft('[{"version": "v0.9", "updated": true}]');
    TestBed.tick();

    vi.advanceTimersByTime(300);

    // Overwrite trailing snapshot turn in-place to avoid array inflation
    expect(chatStateMock.setChatHistory).toHaveBeenCalledWith([
      {
        role: MessageRole.USER,
        content: '[\n  {\n    "version": "v0.9",\n    "updated": true\n  }\n]',
      },
    ]);
    expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
  });

  it('appends a new turn snapshot if last message is dynamic model explanation', () => {
    chatStateMock.setChatHistory([
      {
        role: MessageRole.USER,
        content: '[\n  {\n    "version": "v0.9"\n  }\n]',
      },
      {
        role: MessageRole.MODEL,
        content: 'I have successfully processed your query.',
      },
    ]);

    service.updateDraft('[{"version": "v0.9", "post-turn": true}]');
    TestBed.tick();

    vi.advanceTimersByTime(300);

    // Append new turn since last message belongs to model
    expect(chatStateMock.updateChatHistory).toHaveBeenCalled();
    const updaterCallback = chatStateMock.updateChatHistory.mock.calls[0][0];
    const initialMockHistory = [
      {
        role: MessageRole.USER,
        content: '[\n  {\n    "version": "v0.9"\n  }\n]',
      },
      {
        role: MessageRole.MODEL,
        content: 'I have successfully processed your query.',
      },
    ];
    const updated = updaterCallback(initialMockHistory);

    expect(updated).toHaveLength(3);
    expect(updated[2]).toEqual({
      role: MessageRole.USER,
      content: '[\n  {\n    "version": "v0.9",\n    "post-turn": true\n  }\n]',
    });
  });

  it('preserves plain human instructions, appending snapshots separately', () => {
    chatStateMock.setChatHistory([
      {
        role: MessageRole.USER,
        content: 'Can you render a textfield widget?',
      },
    ]);

    service.updateDraft('[{"version": "v0.9", "components": []}]');
    TestBed.tick();

    vi.advanceTimersByTime(300);

    // Assert human instruction preserved (appended instead of overwritten!)
    expect(chatStateMock.updateChatHistory).toHaveBeenCalled();
    const updaterCallback = chatStateMock.updateChatHistory.mock.calls[0][0];
    const initialMockHistory = [
      {
        role: MessageRole.USER,
        content: 'Can you render a textfield widget?',
      },
    ];
    const updated = updaterCallback(initialMockHistory);

    expect(updated).toHaveLength(2);
    expect(updated[0]).toEqual({
      role: MessageRole.USER,
      content: 'Can you render a textfield widget?',
    });
    expect(updated[1]).toEqual({
      role: MessageRole.USER,
      content: '[\n  {\n    "version": "v0.9",\n    "components": []\n  }\n]',
    });
  });

  it('commits layouts from LLM synchronously, suppressing history syncs', () => {
    service.commitLayoutFromLlm('{"version": "v0.9", "from-llm": true}');
    TestBed.tick();

    expect(service.hydrateActiveDraft()).toBe('{"version": "v0.9", "from-llm": true}');

    // Debouncer timers should NOT be active
    vi.advanceTimersByTime(300);
    expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
    expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
  });

  it('resets layout config to default CAR_BOOKING on flushDraft', () => {
    service.updateDraft('{"version": "dirty"}');
    expect(service.activeDraft()).toBe('{"version": "dirty"}');

    service.flushDraft();
    expect(service.activeDraft()).toBe(CAR_BOOKING);
  });

  describe('Autosave Draft Sanitizations & Mock Security Checks', () => {
    it('aggressively strips registerMockRules commands', () => {
      const dirtyLayout =
        '[\n' +
        '  {"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": []}},\n' +
        '  {"registerMockRules": {"rule": "always-fail"}},\n' +
        '  {"mockRulesConfig": {"latency": 500}},\n' +
        '  {"version": "v0.9", "updateDataModel": {"surfaceId": "s-1", "path": "/p1", "value": ""}}\n' +
        ']';

      service.updateDraft(dirtyLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      // Rules commands should be excluded entirely
      expect(syncedContent).not.toContain('"registerMockRules"');
      expect(syncedContent).not.toContain('"mockRulesConfig"');

      // Valid layout payload components should remain intact
      expect(syncedContent).toContain('"updateComponents"');
      expect(syncedContent).toContain('"updateDataModel"');
    });

    it('recursively strips property keys matching /rules/ or prefix /^mock/i', () => {
      const dirtyLayout =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "TextField", "label": "L1", "value": {"path": "/p1"}, ' +
        '"rules": ["r1"], "mockProp": "m1"}' +
        ']}}]';

      service.updateDraft(dirtyLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"c-1"');
      expect(syncedContent).not.toContain('"rules"');
      expect(syncedContent).not.toContain('"mockProp"');
    });

    it('discards syntax-corrupt layout without syncing to history and outputs warning diagnostics', () => {
      const errorLogger = TestBed.inject(ErrorLogger);
      const warnSpy = vi.spyOn(errorLogger, 'warn');
      const badLayout = '[ {"version": "v0.9"}, corrupt... ]';

      service.updateDraft(badLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });

    it(
      'aggressively filters components with ID mock_rules_container and ' +
        'strips their children array reference markers from layout hierarchy',
      () => {
        const dirtyLayout =
          '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
          '{"id": "root", "component": "Column", "children": ["c-1", "mock_rules_container"]},' +
          '{"id": "c-1", "component": "TextField", "label": "L1"},' +
          '{"id": "mock_rules_container", "component": "Container", "children": ["m-1"]},' +
          '{"id": "m-1", "component": "Text", "text": "Mock rule visual element"}' +
          ']}}]';

        service.updateDraft(dirtyLayout);
        TestBed.tick();

        vi.advanceTimersByTime(300);

        const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
        const syncedContent = syncCall[0].content;

        // Verify component presence and layout structure integrity
        expect(syncedContent).toContain('"id": "root"');
        expect(syncedContent).toContain('"id": "c-1"');

        // Verify that 'mock_rules_container' component itself is stripped
        expect(syncedContent).not.toContain('"id": "mock_rules_container"');
        // Verify that reference to 'mock_rules_container' in root's children array is pruned
        expect(syncedContent).toContain('"c-1"');
        expect(syncedContent).not.toContain('mock_rules_container');
      },
    );

    it('handles non-object items in components list during sanitization', () => {
      const dirtyLayout =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "TextField", "label": "L1"},' +
        '"invalid-string-element"' +
        ']}}]';

      service.updateDraft(dirtyLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"id": "c-1"');
      expect(syncedContent).toContain('"invalid-string-element"');
    });

    it('handles component array properties containing primitive values during sanitization', () => {
      const dirtyLayout =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "ChoicePicker", "options": ["option-1", "option-2"]}' +
        ']}}]';

      service.updateDraft(dirtyLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"option-1"');
      expect(syncedContent).toContain('"option-2"');
    });

    it('handles JSON array format during sanitization', () => {
      const arrayLayout =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "TextField", "label": "L1"}' +
        ']}}]';

      service.updateDraft(arrayLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"id": "c-1"');
    });

    it('sanitizes objects inside component array properties', () => {
      const dirtyLayout =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "ChoicePicker", "options": [' +
        '{"label": "L1", "value": "V1", "mockProp": "strip-me"}' +
        ']}' +
        ']}}]';

      service.updateDraft(dirtyLayout);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"label": "L1"');
      expect(syncedContent).not.toContain('mockProp');
    });

    it('discards empty or whitespace layout without syncing to history', () => {
      service.updateDraft('   ');
      TestBed.tick();

      vi.advanceTimersByTime(300);

      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
    });

    it('does not append an empty message to history when invalid JSON is entered after a model response', () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content: 'create a contact card',
        },
        {
          role: MessageRole.MODEL,
          content: '[{"version": "v0.9", "updateComponents": {"components": []}}]',
        },
      ]);
      chatStateMock.setChatHistory.mockClear();
      chatStateMock.updateChatHistory.mockClear();

      service.updateDraft('[{"version": "v0.9", invalid_json');
      TestBed.tick();

      vi.advanceTimersByTime(300);

      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
    });

    it('does not overwrite existing user layout snapshot in history when invalid JSON is entered', () => {
      const initialSnapshot = [
        {
          role: MessageRole.USER,
          content: '[\n  {\n    "version": "v0.9"\n  }\n]',
        },
      ];
      chatStateMock.setChatHistory(initialSnapshot);
      chatStateMock.setChatHistory.mockClear();
      chatStateMock.updateChatHistory.mockClear();

      service.updateDraft('corrupted json');
      TestBed.tick();

      vi.advanceTimersByTime(300);

      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
    });

    it('handles JSON array containing non-object primitive elements during sanitization', () => {
      const arrayWithPrimitive =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": []}}, "primitive-element"]';

      service.updateDraft(arrayWithPrimitive);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"updateComponents"');
      expect(syncedContent).toContain('"primitive-element"');
    });

    it('returns empty array when all layout lines are sanitized to null', () => {
      service.updateDraft('[{"registerMockRules": true}]');
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toBe('[]');
    });

    it('handles updateComponents without components array during sanitization', () => {
      const invalidComponents =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": "not-an-array"}}]';

      service.updateDraft(invalidComponents);
      TestBed.tick();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"components": "not-an-array"');
    });
  });

  describe('Dynamic Initial Draft Pre-population', () => {
    it('populates default template on initial handshake when unmodified', () => {
      // Upon startup (handled in beforeEach), activeDraft is initialized with basic catalog (CAR_BOOKING)
      expect(service.activeDraft()).toBe(CAR_BOOKING);
    });

    it('prepopulates with generic template when catalog does not support basic catalog', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          StateSync,
          {provide: ChatState, useClass: MockChatState},
          {provide: CatalogManagement, useClass: MockCatalogManagement},
        ],
      });
      const newCatalogMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
      newCatalogMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      const newService = TestBed.inject(StateSync);
      TestBed.tick();

      expect(newService.activeDraft()).toContain('material_catalog.json');
      expect(newService.activeDraft()).not.toContain('Book a Car');
    });

    it('seamlessly loads new default template on a pristine cross-catalog transition', () => {
      // Start with basic catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      });
      TestBed.tick();
      expect(service.activeDraft()).toBe(CAR_BOOKING);

      // Transition to material catalog while pristine
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();

      // Verify that the new template loaded seamlessly
      expect(service.activeDraft()).toContain('material_catalog.json');
      expect(service.activeDraft()).not.toContain('Book a Car');
    });

    it('preserves externally injected draft when subsequent activeCatalog handshake resolves', () => {
      // Injected draft
      const injectedPayload = '[{"version": "v0.9", "createSurface": {"surfaceId": "injected"}}]';
      service.injectExternalDraft(injectedPayload);
      TestBed.tick();

      // Handshake resolves with a new catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();

      expect(service.activeDraft()).toBe(injectedPayload);
    });

    it('preserves user-edited draft when subsequent activeCatalog handshake resolves', () => {
      // User updates draft
      const editedPayload = '[{"version": "v0.9", "createSurface": {"surfaceId": "edited"}}]';
      service.updateDraft(editedPayload);
      TestBed.tick();

      // Handshake resolves with a new catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();

      expect(service.activeDraft()).toBe(editedPayload);
    });

    it('preserves user-edited draft across same-catalog metadata refreshes and reconnects', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();

      const editedPayload = '[{"version": "v0.9", "createSurface": {"surfaceId": "edited"}}]';
      service.updateDraft(editedPayload);
      TestBed.tick();

      // Reconnect/metadata refresh with same catalog ID but additional fields
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        title: 'Refreshed Catalog Name',
      });
      TestBed.tick();

      expect(service.activeDraft()).toBe(editedPayload);
    });

    it("replaces an untouched sample with the new renderer's sample when the renderer changes", () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      });
      TestBed.tick();
      expect(service.activeDraft()).toBe(CAR_BOOKING);
      expect(service.hasEditedDraft()).toBe(false);

      const newSamplePayload = '[{"version": "v0.9", "materialSample": true}]';
      startupConfigStateMock.activeRenderer.set({samplePayload: newSamplePayload});
      startupConfigStateMock.selectedRendererId.set('renderer-material');
      TestBed.tick();

      // Loaded from the renderer's samplePayload, before its catalog arrives.
      expect(service.activeDraft()).toBe(newSamplePayload);
    });

    it('keeps an edited canvas when the renderer changes, including after its catalog arrives', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      });
      TestBed.tick();
      const edited = '[{"version": "v0.9", "edited": true}]';
      service.updateDraft(edited);
      TestBed.tick();
      expect(service.hasEditedDraft()).toBe(true);

      startupConfigStateMock.activeRenderer.set({
        samplePayload: '[{"version": "v0.9", "materialSample": true}]',
      });
      startupConfigStateMock.selectedRendererId.set('renderer-material');
      TestBed.tick();
      catalogManagementMock.activeCatalog.set({catalogId: 'https://example.com/material'});
      TestBed.tick();

      expect(service.activeDraft()).toBe(edited);
      expect(service.hasEditedDraft()).toBe(true);
    });

    it('resets draft to clean default template upon flushDraft() even when started from a shared payload', () => {
      const customSharedJson =
        '[{"version":"v0.9","createSurface":{"surfaceId":"shared-surface"}}]';
      startupConfigStateMock.sharedA2uiPayload.set(customSharedJson);

      // Re-instantiate StateSync to consume the shared payload on boot
      const sharedService = TestBed.inject(StateSync);
      TestBed.tick();

      expect(sharedService.activeDraft()).toBe(customSharedJson);

      // Perform flushDraft()
      sharedService.flushDraft();
      TestBed.tick();

      // Verify it resets to the default basic catalog template (since activeCatalog is basic catalog)
      expect(sharedService.activeDraft()).toBe(CAR_BOOKING);
    });

    it('supports custom renderers with empty catalogId and loads samplePayload', () => {
      // Configure custom renderer
      startupConfigStateMock.activeRenderer.set({
        samplePayload: '[{"version": "v0.9", "customSample": true}]',
      });
      catalogManagementMock.activeCatalog.set({
        catalogId: '',
      });
      TestBed.tick();

      expect(service.activeDraft()).toBe('[{"version": "v0.9", "customSample": true}]');
    });

    it('supports custom renderers with empty catalogId and loads empty string when no samplePayload exists', () => {
      startupConfigStateMock.activeRenderer.set(null);
      catalogManagementMock.activeCatalog.set({
        catalogId: '',
      });
      TestBed.tick();

      expect(service.activeDraft()).toBe('');
    });

    it('resets previousCatalogId allowing subsequent catalog emission to rehydrate activeDraft on flushDraft', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      });
      TestBed.tick();
      expect(service.activeDraft()).toBe(CAR_BOOKING);

      service.updateDraft('[{"version": "v0.9", "custom": true}]');
      TestBed.tick();

      service.flushDraft();
      TestBed.tick();

      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();

      expect(service.activeDraft()).toContain('material_catalog.json');
      expect(service.activeDraft()).not.toContain('Book a Car');
    });

    it('falls back to CAR_BOOKING when activeRenderer samplePayload is absent and catalogId is empty on flushDraft', () => {
      startupConfigStateMock.activeRenderer.set(null);
      catalogManagementMock.activeCatalog.set(null);
      TestBed.tick();

      service.flushDraft();
      TestBed.tick();

      expect(service.activeDraft()).toBe(CAR_BOOKING);
    });

    it('populates blank createSurface payload on resetToBlankDraft, synchronously syncs to chatHistory at 0ms, and increments sessionResetNonce', () => {
      const expectedBlankSurface = formatJson([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            sendDataModel: true,
          },
        },
      ]);

      chatStateMock.setChatHistory.mockClear();
      expect(service.sessionResetNonce()).toBe(0);

      service.resetToBlankDraft();

      expect(service.sessionResetNonce()).toBe(1);
      expect(service.activeDraft()).toBe(expectedBlankSurface);
      expect(service.activeDraft()).not.toBe(CAR_BOOKING);
      // Synchronously synced at 0ms without waiting for 300ms timer
      expect(chatStateMock.setChatHistory).toHaveBeenCalledTimes(1);
      expect(chatStateMock.setChatHistory).toHaveBeenCalledWith([
        {
          role: MessageRole.USER,
          content: expectedBlankSurface,
        },
      ]);

      // Subsequent flushDraft restores CAR_BOOKING
      service.flushDraft();
      expect(service.activeDraft()).toBe(CAR_BOOKING);
    });

    it('ignores activeRenderer samplePayload and uses active catalogId or $id or BASIC_CATALOG_ID fallback on resetToBlankDraft', () => {
      startupConfigStateMock.activeRenderer.set({
        samplePayload: '[{"version": "v0.9", "customSample": true}]',
      });
      catalogManagementMock.activeCatalog.set({
        $id: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();

      service.resetToBlankDraft();

      const expectedMaterialBlank = formatJson([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
            sendDataModel: true,
          },
        },
      ]);
      expect(service.activeDraft()).toBe(expectedMaterialBlank);

      // When activeCatalog has empty catalogId or is null, falls back to BASIC_CATALOG_ID
      catalogManagementMock.activeCatalog.set(null);
      service.resetToBlankDraft();

      const expectedBasicBlank = formatJson([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            sendDataModel: true,
          },
        },
      ]);
      expect(service.activeDraft()).toBe(expectedBasicBlank);
    });

    it('cancels pending <300ms updateDraft timer on resetToBlankDraft, flushDraft, and commitLayoutFromLlm, and does not emit duplicate layout bubble at 300ms', () => {
      const expectedBlankSurface = formatJson([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            sendDataModel: true,
          },
        },
      ]);

      // 1. Pending user edit cancelled by resetToBlankDraft + prompt submitted at 100ms
      chatStateMock.setChatHistory([]);
      chatStateMock.setChatHistory.mockClear();
      chatStateMock.updateChatHistory.mockClear();

      service.updateDraft('[{"version": "v0.9", "dirtyBeforeReset": true}]');
      vi.advanceTimersByTime(100);

      service.resetToBlankDraft();
      expect(chatStateMock.setChatHistory).toHaveBeenCalledTimes(1);
      expect(chatStateMock.chatHistory()).toEqual([
        {
          role: MessageRole.USER,
          content: expectedBlankSurface,
        },
      ]);

      // Simulate user submitting a prompt 100ms after reset (appending USER text + MODEL streaming placeholder)
      vi.advanceTimersByTime(100);
      chatStateMock.updateChatHistory(h => [
        ...h,
        {role: MessageRole.USER, content: 'Create a dashboard'},
        {role: MessageRole.MODEL, content: ' ●●●'},
      ]);
      chatStateMock.setChatHistory.mockClear();
      chatStateMock.updateChatHistory.mockClear();

      // Advance past 300ms mark: neither the cancelled dirty edit nor a duplicate blank sync should fire
      vi.advanceTimersByTime(300);
      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.chatHistory()).toHaveLength(3);
      expect(chatStateMock.chatHistory()[2].role).toBe(MessageRole.MODEL);

      // 2. Pending user edit cancelled by commitLayoutFromLlm
      service.updateDraft('[{"version": "v0.9", "dirtyBeforeLlm": true}]');
      vi.advanceTimersByTime(100);
      service.commitLayoutFromLlm('[{"version": "v0.9", "fromLlm": true}]');
      vi.advanceTimersByTime(300);
      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();

      // 3. Pending user edit cancelled by flushDraft, which queues initial draft (CAR_BOOKING) sync at 300ms
      chatStateMock.setChatHistory([]);
      chatStateMock.setChatHistory.mockClear();
      service.updateDraft('[{"version": "v0.9", "dirtyBeforeFlush": true}]');
      vi.advanceTimersByTime(100);
      service.flushDraft();
      vi.advanceTimersByTime(200);
      // At 200ms after flushDraft (300ms after dirtyBeforeFlush), dirty edit must not have fired
      expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(chatStateMock.setChatHistory).toHaveBeenCalledTimes(1);
      expect(chatStateMock.chatHistory()[0].content).toContain('Book a Car');
      expect(chatStateMock.chatHistory()[0].content).not.toContain('dirtyBeforeFlush');
    });

    it('synchronously re-populates chatHistory across repeated consecutive resetToBlankDraft calls and after commitLayoutFromLlm', () => {
      const expectedBlankSurface = formatJson([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            sendDataModel: true,
          },
        },
      ]);

      // First reset
      chatStateMock.setChatHistory([]);
      service.resetToBlankDraft();
      expect(service.sessionResetNonce()).toBe(1);
      expect(chatStateMock.chatHistory()).toEqual([
        {role: MessageRole.USER, content: expectedBlankSurface},
      ]);

      // Simulate ChatCoordinator clearing history and calling resetToBlankDraft a second time in a row
      chatStateMock.setChatHistory([]);
      service.resetToBlankDraft();
      expect(service.sessionResetNonce()).toBe(2);
      expect(chatStateMock.chatHistory()).toEqual([
        {role: MessageRole.USER, content: expectedBlankSurface},
      ]);

      // Simulate LLM committing layout, then clearing history and calling resetToBlankDraft again
      service.commitLayoutFromLlm('[{"version": "v0.9", "llmCommitted": true}]');
      chatStateMock.setChatHistory([]);
      service.resetToBlankDraft();
      expect(service.sessionResetNonce()).toBe(3);
      expect(service.activeDraft()).toBe(expectedBlankSurface);
      expect(chatStateMock.chatHistory()).toEqual([
        {role: MessageRole.USER, content: expectedBlankSurface},
      ]);
    });

    it('does not overwrite blank surface on subsequent same-catalog emissions (including pre-handshake reset), while auto-populating on a different catalog', () => {
      const expectedBasicBlank = formatJson([
        {
          version: 'v0.9',
          createSurface: {
            surfaceId: 'sample-surface',
            catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
            sendDataModel: true,
          },
        },
      ]);

      // 1. Pre-handshake reset: activeCatalog is null when resetToBlankDraft() is called
      catalogManagementMock.activeCatalog.set(null);
      service.resetToBlankDraft();
      expect(service.activeDraft()).toBe(expectedBasicBlank);

      // Initial basic_catalog handshake arrives -> must NOT overwrite blank surface with CAR_BOOKING
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      });
      TestBed.tick();
      expect(service.activeDraft()).toBe(expectedBasicBlank);

      // Same-catalog metadata refresh -> must NOT overwrite blank surface with CAR_BOOKING
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
        title: 'Refreshed Basic Catalog',
      });
      TestBed.tick();
      expect(service.activeDraft()).toBe(expectedBasicBlank);

      // Switching to a different catalog -> auto-populates the new catalog's template
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.tick();
      expect(service.activeDraft()).toContain('material_catalog.json');
    });
  });
});
