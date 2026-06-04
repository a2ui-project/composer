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
import {StateSyncService} from './state-sync.service';
import {ChatStateService, LlmLogEntry, LlmLogType} from '../chat-state/chat-state.service';
import {LlmMessage} from '../llm-client/llm-client';
import {MessageRole} from '../llm-client/llm-client';
import {CAR_BOOKING} from '../chat-service/initial-draft';

class MockChatStateService {
  private readonly _chatHistory: LlmMessage[] = [];
  public readonly chatHistory = vi.fn(() => this._chatHistory);
  public setChatHistory = vi.fn((history: LlmMessage[]) => {
    this._chatHistory.length = 0;
    this._chatHistory.push(...history);
  });
  public updateChatHistory = vi.fn((updater: (history: LlmMessage[]) => LlmMessage[]) => {
    const updated = updater([...this._chatHistory]);
    this._chatHistory.length = 0;
    this._chatHistory.push(...updated);
  });

  private _latestLlmLog: LlmLogEntry | null = null;
  private _llmHistory: LlmLogEntry[] = [];
  public readonly latestLlmLog = vi.fn(() => this._latestLlmLog);
  public readonly llmHistory = vi.fn(() => this._llmHistory);
  public addRawLlmLog = vi.fn((type: LlmLogType, payload: unknown) => {
    const entry = {type, timestamp: Date.now(), payload};
    this._latestLlmLog = entry;
    this._llmHistory.push(entry);
    if (this._llmHistory.length > 50) {
      this._llmHistory.shift();
    }
  });
  public clearRawLlmHistory = vi.fn(() => {
    this._latestLlmLog = null;
    this._llmHistory.length = 0;
  });
}

describe('StateSyncService Autosave Draft Integrations', () => {
  let service: StateSyncService;
  let chatStateMock: MockChatStateService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [StateSyncService, {provide: ChatStateService, useClass: MockChatStateService}],
    });

    service = TestBed.inject(StateSyncService);
    chatStateMock = TestBed.inject(ChatStateService) as unknown as MockChatStateService;

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
  });
});
