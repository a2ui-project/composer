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
import {signal} from '@angular/core';

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

describe('StateSync Autosave Draft Integrations', () => {
  let service: StateSync;
  let chatStateMock: MockChatState;
  let catalogManagementMock: MockCatalogManagement;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        StateSync,
        {provide: ChatState, useClass: MockChatState},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
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
    TestBed.flushEffects();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes activeDraft with CAR_BOOKING constant', () => {
    expect(service.activeDraft()).toBe(CAR_BOOKING);
  });

  it('updates draft in-memory synchronously and ignores initial setup debouncer', () => {
    service.updateDraft('{"version": "v0.9"}');
    expect(service.hydrateActiveDraft()).toBe('{"version": "v0.9"}');
    expect(service.activeDraft()).toBe('{"version": "v0.9"}');

    // Debounce timer should NOT fire synchronization instantly
    expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();
    expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
  });

  it('triggers history sync after 300ms debouncing, appending a new node', () => {
    service.updateDraft('{"version": "v0.9"}');
    TestBed.flushEffects(); // Flush toObservable event boundaries instantly!

    vi.advanceTimersByTime(150);
    expect(chatStateMock.setChatHistory).not.toHaveBeenCalled();

    vi.advanceTimersByTime(150);
    expect(chatStateMock.setChatHistory).toHaveBeenCalledWith([
      {
        role: MessageRole.USER,
        content: '{"version":"v0.9"}\n',
      },
    ]);
  });

  it('updates target layout node in-place if last message is also user layout snapshot', () => {
    // Prime the mock history with user snapshot
    chatStateMock.setChatHistory([
      {
        role: MessageRole.USER,
        content: '{"version": "v0.9", "orig": true}\n',
      },
    ]);

    service.updateDraft('{"version": "v0.9", "updated": true}');
    TestBed.flushEffects();

    vi.advanceTimersByTime(300);

    // Overwrite trailing snapshot turn in-place to avoid array inflation
    expect(chatStateMock.setChatHistory).toHaveBeenCalledWith([
      {
        role: MessageRole.USER,
        content: '{"version":"v0.9","updated":true}\n',
      },
    ]);
    expect(chatStateMock.updateChatHistory).not.toHaveBeenCalled();
  });

  it('appends a new turn snapshot if last message is dynamic model explanation', () => {
    chatStateMock.setChatHistory([
      {
        role: MessageRole.USER,
        content: '{"version": "v0.9"}\n',
      },
      {
        role: MessageRole.MODEL,
        content: 'I have successfully processed your query.',
      },
    ]);

    service.updateDraft('{"version": "v0.9", "post-turn": true}');
    TestBed.flushEffects();

    vi.advanceTimersByTime(300);

    // Append new turn since last message belongs to model
    expect(chatStateMock.updateChatHistory).toHaveBeenCalled();
    const updaterCallback = chatStateMock.updateChatHistory.mock.calls[0][0];
    const initialMockHistory = [
      {
        role: MessageRole.USER,
        content: '{"version": "v0.9"}\n',
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
      content: '{"version":"v0.9","post-turn":true}\n',
    });
  });

  it('preserves plain human instructions, appending snapshots separately', () => {
    chatStateMock.setChatHistory([
      {
        role: MessageRole.USER,
        content: 'Can you render a textfield widget?',
      },
    ]);

    service.updateDraft('{"version": "v0.9", "components": []}');
    TestBed.flushEffects();

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
      content: '{"version":"v0.9","components":[]}\n',
    });
  });

  it('commits layouts from LLM synchronously, suppressing history syncs', () => {
    service.commitLayoutFromLlm('{"version": "v0.9", "from-llm": true}');
    TestBed.flushEffects();

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
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": []}}\n' +
        '{"registerMockRules": {"rule": "always-fail"}}\n' +
        '{"mockRulesConfig": {"latency": 500}}\n' +
        '{"version": "v0.9", "updateDataModel": {"surfaceId": "s-1", "path": "/p1", "value": ""}}';

      service.updateDraft(dirtyLayout);
      TestBed.flushEffects();

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
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "TextField", "label": "L1", "value": {"path": "/p1"}, ' +
        '"rules": ["r1"], "mockProp": "m1"}' +
        ']}}';

      service.updateDraft(dirtyLayout);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"c-1"');
      expect(syncedContent).not.toContain('"rules"');
      expect(syncedContent).not.toContain('"mockProp"');
    });

    it('discard syntax-corrupt layout components, outputting warning diagnostics', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const badLayout =
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": []}}\n' +
        '{"corrupted_json_lines...\n' +
        '{"version": "v0.9", "updateDataModel": {"surfaceId": "s-1", "path": "/p", "value": ""}}';

      service.updateDraft(badLayout);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"updateComponents"');
      expect(syncedContent).toContain('"updateDataModel"');
      expect(syncedContent).not.toContain('"corrupted_json_lines"');

      expect(warnSpy).toHaveBeenCalled();
    });

    it(
      'aggressively filters components with ID mock_rules_container and ' +
        'strips their children array reference markers from layout hierarchy',
      () => {
        const dirtyLayout =
          '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
          '{"id": "root", "component": "Column", "children": ["c-1", "mock_rules_container"]},' +
          '{"id": "c-1", "component": "TextField", "label": "L1"},' +
          '{"id": "mock_rules_container", "component": "Container", "children": ["m-1"]},' +
          '{"id": "m-1", "component": "Text", "text": "Mock rule visual element"}' +
          ']}}';

        service.updateDraft(dirtyLayout);
        TestBed.flushEffects();

        vi.advanceTimersByTime(300);

        const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
        const syncedContent = syncCall[0].content;

        // Verify component presence and layout structure integrity
        expect(syncedContent).toContain('"id":"root"');
        expect(syncedContent).toContain('"id":"c-1"');

        // Verify that 'mock_rules_container' component itself is stripped
        expect(syncedContent).not.toContain('"id":"mock_rules_container"');
        // Verify that reference to 'mock_rules_container' in root's children array is pruned
        expect(syncedContent).toContain('"children":["c-1"]');
        expect(syncedContent).not.toContain('mock_rules_container');
      },
    );

    it('handles non-object items in components list during sanitization', () => {
      const dirtyLayout =
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "TextField", "label": "L1"},' +
        '"invalid-string-element"' +
        ']}}';

      service.updateDraft(dirtyLayout);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"id":"c-1"');
      expect(syncedContent).toContain('"invalid-string-element"');
    });

    it('handles component array properties containing primitive values during sanitization', () => {
      const dirtyLayout =
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "ChoicePicker", "options": ["option-1", "option-2"]}' +
        ']}}';

      service.updateDraft(dirtyLayout);
      TestBed.flushEffects();

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
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"id":"c-1"');
    });

    it('handles non-object lines in JSON Lines format during sanitization', () => {
      const dirtyLayout =
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": []}}\n' +
        '"invalid-primitive-line"\n' +
        '{"version": "v0.9", "updateDataModel": {"surfaceId": "s-1", "path": "/p", "value": ""}}';

      service.updateDraft(dirtyLayout);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"updateComponents"');
      expect(syncedContent).toContain('"updateDataModel"');
      expect(syncedContent).not.toContain('invalid-primitive-line');
    });

    it('sanitizes objects inside component array properties', () => {
      const dirtyLayout =
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": [' +
        '{"id": "c-1", "component": "ChoicePicker", "options": [' +
        '{"label": "L1", "value": "V1", "mockProp": "strip-me"}' +
        ']}' +
        ']}}';

      service.updateDraft(dirtyLayout);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"label":"L1"');
      expect(syncedContent).not.toContain('mockProp');
    });

    it('returns empty string when sanitizing empty or whitespace layout', () => {
      service.updateDraft('   ');
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toBe('');
    });

    it('handles JSON array containing non-object primitive elements during sanitization', () => {
      const arrayWithPrimitive =
        '[{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": []}}, "primitive-element"]';

      service.updateDraft(arrayWithPrimitive);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"updateComponents"');
      expect(syncedContent).toContain('"primitive-element"');
    });

    it('returns empty string when all layout lines are sanitized to null', () => {
      service.updateDraft('{"registerMockRules": true}');
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toBe('');
    });

    it('handles updateComponents without components array during sanitization', () => {
      const invalidComponents =
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s-1", "components": "not-an-array"}}';

      service.updateDraft(invalidComponents);
      TestBed.flushEffects();

      vi.advanceTimersByTime(300);

      const syncCall = chatStateMock.setChatHistory.mock.calls[0][0];
      const syncedContent = syncCall[0].content;

      expect(syncedContent).toContain('"components":"not-an-array"');
    });
  });

  describe('Dynamic Initial Draft Pre-population', () => {
    it('pre-populates with generic draft instead of CAR_BOOKING if catalog does not support basic catalog', () => {
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
      TestBed.flushEffects();

      expect(newService.activeDraft()).toContain('material_catalog.json');
      expect(newService.activeDraft()).not.toContain('Book a Car');
    });

    it('resets to appropriate dynamic initial draft on flushDraft', () => {
      // Switch activeCatalog to material_catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();

      service.updateDraft('{"version": "dirty"}');
      expect(service.activeDraft()).toBe('{"version": "dirty"}');

      service.flushDraft();
      expect(service.activeDraft()).toContain('material_catalog.json');
      expect(service.activeDraft()).not.toContain('Book a Car');
    });

    it('resets activeDraft dynamically when catalogId changes and draft is incompatible', () => {
      // Start with basic catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/basic_catalog.json',
      });
      TestBed.flushEffects();
      expect(service.activeDraft()).toBe(CAR_BOOKING);

      // User has typed some layout (dirty) matching basic catalog
      service.updateDraft(
        '{"version": "v0.9", "createSurface": {"surfaceId": "sample-surface", "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json", "sendDataModel": true}}\n{"version": "v0.9", "updateComponents": {"components": []}}',
      );
      TestBed.flushEffects();

      // Catalog changes to material
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();

      // Expect draft to be reset to material initial draft because the old draft was basic catalog
      expect(service.activeDraft()).toContain('material_catalog.json');
      expect(service.activeDraft()).not.toContain('basic_catalog.json');
    });

    it('does not reset activeDraft if catalogId changes but draft already matches it', () => {
      // Start with material catalog
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();
      const materialInitialDraft = service.activeDraft();
      expect(materialInitialDraft).toContain('material_catalog.json');

      // User makes a change (dirty layout) but still on material catalog
      const editedMaterialDraft =
        materialInitialDraft +
        '{"version": "v0.9", "updateComponents": {"components": [{"id": "foo"}]}}';
      service.updateDraft(editedMaterialDraft);
      TestBed.flushEffects();

      // Trigger a catalog change with the same catalog ID (e.g. metadata refresh)
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        title: 'New Title', // different title, same catalogId
      });
      TestBed.flushEffects();

      // Expect draft NOT to be reset, preserving user changes
      expect(service.activeDraft()).toBe(editedMaterialDraft);
    });

    it('does not reset activeDraft if catalogId changes and draft is a matching single JSON object', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();

      const singleObjectDraft =
        '{"version": "v0.9", "createSurface": {"surfaceId": "sample-surface", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json", "sendDataModel": true}}';
      service.updateDraft(singleObjectDraft);
      TestBed.flushEffects();

      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        title: 'New Title',
      });
      TestBed.flushEffects();

      expect(service.activeDraft()).toBe(singleObjectDraft);
    });

    it('does not reset activeDraft if catalogId changes and draft is a matching JSON array', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();

      const arrayDraft =
        '[{"version": "v0.9", "createSurface": {"surfaceId": "sample-surface", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json", "sendDataModel": true}}]';
      service.updateDraft(arrayDraft);
      TestBed.flushEffects();

      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        title: 'New Title',
      });
      TestBed.flushEffects();

      expect(service.activeDraft()).toBe(arrayDraft);
    });

    it('resets activeDraft if catalogId changes and draft has no catalogId', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();

      service.updateDraft('{"version": "v0.9", "updateComponents": {"components": []}}');
      TestBed.flushEffects();

      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        title: 'New Title',
      });
      TestBed.flushEffects();

      expect(service.activeDraft()).toContain('material_catalog.json');
      expect(service.activeDraft()).not.toContain('updateComponents');
    });

    it('resets activeDraft if catalogId changes and draft is whitespace', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
      });
      TestBed.flushEffects();

      service.updateDraft('   ');
      TestBed.flushEffects();

      catalogManagementMock.activeCatalog.set({
        catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        title: 'New Title',
      });
      TestBed.flushEffects();

      expect(service.activeDraft()).toContain('material_catalog.json');
    });

    it('sets activeDraft to empty string on flushDraft if activeCatalog has no catalogId', () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: '',
      });
      TestBed.flushEffects();
      service.updateDraft('{"version": "dirty"}');

      service.flushDraft();
      expect(service.activeDraft()).toBe('');
    });
  });
});
