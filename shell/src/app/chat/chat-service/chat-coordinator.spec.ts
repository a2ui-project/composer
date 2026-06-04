/**
 * @license
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
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ChatService} from './chat-coordinator';
import {CatalogManagementService} from '../../storage/catalog-management';
import {Catalog} from '../../storage/catalog-storage.model';
import {ChatStateService, LlmLogEntry, LlmLogType} from '../chat-state/chat-state';
import {
  AppConfigProvider,
  EnvMode,
  AuthType,
  ThemePreference,
} from '../../settings/app-config-provider';
import {StateSyncService} from '../state-sync/state-sync';
import {LlmClient, LlmMessage, LlmStreamResponse, MessageRole} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';

class MockCatalogManagementService {
  public readonly activeCatalog = signal<Catalog | null>(null);
}

class MockAppConfigProvider {
  public readonly rendererUrl = signal<string>('http://localhost:4200/preview');
  public readonly geminiApiKey = signal<string>('sample-api-key');
  public readonly envMode = signal(EnvMode.STANDALONE);
  public readonly authType = signal(AuthType.THREE_PARTY);
  public readonly themePreference = signal<ThemePreference>('light');
  public setRendererUrl = vi.fn((url: string) => {
    this.rendererUrl.set(url);
  });
  public setGeminiApiKey = vi.fn((key: string) => {
    this.geminiApiKey.set(key);
  });
  public setForcedAuthMode = vi.fn();
  public setThemePreference = vi.fn((theme: ThemePreference) => {
    this.themePreference.set(theme);
  });
  public flushConfig = vi.fn();
}

class MockChatStateService {
  public readonly chatHistory = signal<LlmMessage[]>([]);
  public readonly pipelineStatus = signal<PipelineStatus>(PipelineStatus.IDLE);
  public readonly isProgrammaticStreamActive = signal<boolean>(false);
  public readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  public readonly llmHistory = signal<LlmLogEntry[]>([]);

  public setChatHistory(history: LlmMessage[]) {
    this.chatHistory.set(history);
  }
  public updateChatHistory(updater: (history: LlmMessage[]) => LlmMessage[]) {
    this.chatHistory.update(updater);
  }
  public setPipelineStatus(status: PipelineStatus) {
    this.pipelineStatus.set(status);
  }
  public setProgrammaticStreamActive(active: boolean) {
    this.isProgrammaticStreamActive.set(active);
  }
  public addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry: LlmLogEntry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(history => [...history, entry].slice(-50));
  }
  public clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

class MockStateSyncService {
  public readonly activeDraftSignal = signal<string>('Initial draft text');
  public readonly activeDraft = this.activeDraftSignal.asReadonly();
  public commitLayoutFromLlm = vi.fn((val: string) => {
    this.activeDraftSignal.set(val);
  });
  public flushDraft = vi.fn(() => {
    this.activeDraftSignal.set('Initial draft text');
  });
  public hydrateActiveDraft = vi.fn(() => this.activeDraftSignal());
}

class MockLlmClient {
  public chat = vi.fn();
  public chatStream = vi.fn(async (messages: LlmMessage[]): Promise<LlmStreamResponse> => {
    const contentStream: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        const chunks = [
          '{"version": "v0.9", "createSurface": {"surfaceId": "s1", ' + '"catalogId": "basic"}}\n',
        ];
        let idx = 0;
        return {
          async next(): Promise<IteratorResult<string>> {
            if (idx < chunks.length) {
              const value = chunks[idx];
              idx++;
              return {value, done: false};
            }
            return {value: undefined, done: true};
          },
        };
      },
    };
    const complete = Promise.resolve(
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", ' + '"catalogId": "basic"}}\n',
    );
    return {contentStream, complete};
  });
}

describe('ChatService Pipeline & State Integration', () => {
  let service: ChatService;
  let chatStateMock: MockChatStateService;
  let catalogManagementMock: MockCatalogManagementService;
  let configProviderMock: MockAppConfigProvider;
  let stateSyncMock: MockStateSyncService;
  let llmClientMock: MockLlmClient;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        {provide: ChatStateService, useClass: MockChatStateService},
        {
          provide: CatalogManagementService,
          useClass: MockCatalogManagementService,
        },
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: StateSyncService, useClass: MockStateSyncService},
        {provide: LlmClient, useClass: MockLlmClient},
      ],
    });

    service = TestBed.inject(ChatService);
    chatStateMock = TestBed.inject(ChatStateService) as unknown as MockChatStateService;
    catalogManagementMock = TestBed.inject(
      CatalogManagementService,
    ) as unknown as MockCatalogManagementService;
    configProviderMock = TestBed.inject(AppConfigProvider) as unknown as MockAppConfigProvider;
    stateSyncMock = TestBed.inject(StateSyncService) as unknown as MockStateSyncService;
    llmClientMock = TestBed.inject(LlmClient) as unknown as MockLlmClient;

    // Eagerly execute initial constructor tracking effects skips
    TestBed.tick();
  });

  /* Pre-existing baseline specs mapped to dynamic settings mocks */
  it('initializes successfully with dynamic computed signal properties', () => {
    expect(service).toBeTruthy();
    expect(service.systemPrompt).toBeDefined();
  });

  it('returns default instructions fallback prompt on empty catalog', () => {
    catalogManagementMock.activeCatalog.set(null);
    const prompt = service.systemPrompt();

    expect(prompt).toContain('You are an AI assistant designed to help');
    expect(prompt).toContain('Status: Awaiting renderer dynamic handshake');
  });

  it('injects dynamic catalog title and registered component schemas', () => {
    const customCatalog: Catalog = {
      catalogId: 'test-catalog-123',
      title: 'Mock Catalog Custom',
      description: 'Provides mock interface components.',
      components: {
        CustomButton: {
          properties: {
            label: {type: 'string'},
          },
        },
      },
    };

    catalogManagementMock.activeCatalog.set(customCatalog);
    const prompt = service.systemPrompt();

    expect(prompt).toContain('A2UI Generation Expert');
    expect(prompt).toContain('test-catalog-123');
    expect(prompt).toContain('"Mock Catalog Custom"');
    expect(prompt).toContain('"Provides mock interface components."');
    expect(prompt).toContain('"CustomButton"');
    expect(prompt).toContain('"label"');
  });

  it('stringifies dynamic catalog even with empty components lists', () => {
    const emptyCatalog: Catalog = {
      catalogId: 'empty-catalog',
      title: 'Empty Catalog',
      description: 'Zero custom elements.',
      components: {},
    };

    catalogManagementMock.activeCatalog.set(emptyCatalog);
    const prompt = service.systemPrompt();

    expect(prompt).toContain('"Empty Catalog"');
    expect(prompt).toContain('"components": {}');
  });

  /* Pipeline submit and Lockout assertions */
  it('triggers prompt stream turns locking panel and commits', async () => {
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);

    const promptPromise = service.submitPrompt('Create checkout form');

    // Instantly enters receiving stream state and locks panels
    expect(service.pipelineStatus()).toBe(PipelineStatus.RECEIVING_STREAM);
    expect(service.isProgrammaticStreamActive()).toBe(true);

    const history = chatStateMock.chatHistory();
    // USER text turn AND MODEL empty placeholder turn
    expect(history.length).toBe(2);
    expect(history[0].role).toBe(MessageRole.USER);
    expect(history[0].content).toBe('Create checkout form');
    expect(history[1].role).toBe(MessageRole.MODEL);
    // pulse dots initial overlay during packets buffering
    expect(history[1].content).toBe(' ●●●');

    // Wait completion
    await promptPromise;

    // Releases locks, transitions to READY status
    expect(service.pipelineStatus()).toBe(PipelineStatus.READY);
    expect(service.isProgrammaticStreamActive()).toBe(false);

    // Verify raw content streamed directly inside model's turn logs
    const updatedHistory = chatStateMock.chatHistory();
    expect(updatedHistory[1].role).toBe(MessageRole.MODEL);
    expect(updatedHistory[1].content).toContain('"createSurface": {"surfaceId": "s1"');
    expect(updatedHistory[1].content).not.toContain('●●●');

    // Verify layout committed back in a single commit transaction
    expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalledTimes(1);
    expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalledWith(
      '{"version":"v0.9","createSurface":{"surfaceId":"s1",' + '"catalogId":"basic"}}\n',
    );
  });

  it('extracts layouts markdown and heals unmatched curly braces', async () => {
    // Return a corrupted Markdown wrap payload
    const corruptedRawOutput =
      'Conversational filler text preceding block...\n' +
      '```json\n' +
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", ' +
      '"catalogId": "basic"\n' + // unclosed curly braces!
      '{"version": "v0.9", "updateComponents": {"surfaceId": "s1", ' +
      '"components": [{"id": "c1", "component": "Text", "rules": [1, 2],}\n' +
      '```\n' +
      'Filler text following block...';

    llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
      const contentStream: AsyncIterable<string> = {
        [Symbol.asyncIterator]() {
          const chunks = [corruptedRawOutput];
          let idx = 0;
          return {
            async next(): Promise<IteratorResult<string>> {
              if (idx < chunks.length) {
                return {value: chunks[idx++], done: false};
              }
              return {value: undefined, done: true};
            },
          };
        },
      };
      return {contentStream, complete: Promise.resolve(corruptedRawOutput)};
    });

    // We also mock dynamic components so that 'Text' passes catalog validation
    catalogManagementMock.activeCatalog.set({
      catalogId: 'basic',
      components: {
        Text: {name: 'Text'},
      },
    });

    await service.submitPrompt('Create broken screen');

    // Assert that the commited layout is fully healed and sanitized:
    // - Markdown stripped
    // - missing curly brace appended to createSurface
    // - trailing comma removed, mock property 'rules' stripped!
    const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
    const lines = committedOutput.trim().split('\n');
    expect(lines.length).toBe(2);

    const parsed1 = JSON.parse(lines[0]);
    expect(parsed1.createSurface.surfaceId).toBe('s1'); // healed braces!

    const parsed2 = JSON.parse(lines[1]);
    expect(parsed2.updateComponents.components[0].id).toBe('c1');
    // mock fields stripped!
    expect(parsed2.updateComponents.components[0].rules).toBeUndefined();
  });

  /* Legacy Widget Fallback healing check */
  it('heals elements with legacy "name" properties mapping to type', async () => {
    const legacyRawOutput =
      '{"version": "v0.9", "createSurface": {"surfaceId": "s2", ' +
      '"catalogId": "test"}}\n' +
      '{"version": "v0.9", "updateComponents": {"surfaceId": "s2", ' +
      '"components": [' +
      '  {"id": "c1", "name": "TextField"}' + // legacy name property!
      ']}}\n';

    llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
      const contentStream: AsyncIterable<string> = {
        [Symbol.asyncIterator]() {
          const chunks = [legacyRawOutput];
          let idx = 0;
          return {
            async next(): Promise<IteratorResult<string>> {
              if (idx < chunks.length) {
                return {value: chunks[idx++], done: false};
              }
              return {value: undefined, done: true};
            },
          };
        },
      };
      return {contentStream, complete: Promise.resolve(legacyRawOutput)};
    });

    catalogManagementMock.activeCatalog.set({
      catalogId: 'test',
      components: {
        TextField: {},
      },
    });

    await service.submitPrompt('Legacy widget prompt');

    // Verify committed element has mapped corrected component field
    const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
    const parsed = JSON.parse(committedOutput.trim().split('\n')[1]);
    const comp = parsed.updateComponents.components[0];

    expect(comp.component).toBe('TextField');
    expect(comp.name).toBeUndefined();
    expect(service.pipelineStatus()).toBe(PipelineStatus.READY);
  });

  /* Typo Component healing assertions */
  it('corrects common widget naming typo slips mapping components', async () => {
    // Return layout with typos: 'textbox', 'checkbox', 'datepicker'
    const typosRawOutput =
      '{"version": "v0.9", "createSurface": {"surfaceId": "s2", ' +
      '"catalogId": "test"}}\n' +
      '{"version": "v0.9", "updateComponents": {"surfaceId": "s2", ' +
      '"components": [' +
      '  {"id": "c1", "component": "textbox"},' +
      '  {"id": "c2", "component": "checkbox"},' +
      '  {"id": "c3", "component": "datepicker"},' +
      '  {"id": "c4", "component": "ButtonVariantGroup"}' + // matches Button!
      ']}}\n';

    llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
      const contentStream: AsyncIterable<string> = {
        [Symbol.asyncIterator]() {
          const chunks = [typosRawOutput];
          let idx = 0;
          return {
            async next(): Promise<IteratorResult<string>> {
              if (idx < chunks.length) {
                return {value: chunks[idx++], done: false};
              }
              return {value: undefined, done: true};
            },
          };
        },
      };
      return {contentStream, complete: Promise.resolve(typosRawOutput)};
    });

    // Active catalog registers standard element mapping targets
    catalogManagementMock.activeCatalog.set({
      catalogId: 'test',
      components: {
        TextField: {},
        CheckBox: {},
        DateTimeInput: {},
        Button: {},
      },
    });

    await service.submitPrompt('Typos prompt');

    // Verify committed output elements have been mapped correct elements!
    const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
    const parsed = JSON.parse(committedOutput.trim().split('\n')[1]);
    const components = parsed.updateComponents.components;

    expect(components[0].component).toBe('TextField');
    expect(components[1].component).toBe('CheckBox');
    expect(components[2].component).toBe('DateTimeInput');
    expect(components[3].component).toBe('Button'); // fuzzy match success!
  });

  it('bubbles connectivity and gateway timeout exceptions to error log', async () => {
    const networkError = new Error('HTTP 504: Gateway Timeout connecting to Vertex AI Endpoint.');
    llmClientMock.chatStream = vi.fn(async () => {
      throw networkError;
    });

    // Act
    await service.submitPrompt('Generate widgets list');

    // Instantly dismisses overlay block lockouts under proxy timeout exception
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);

    // Verify prompt turn is preserved and a diagnostic turn appended below
    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[0].role).toBe(MessageRole.USER);
    expect(history[0].content).toBe('Generate widgets list');

    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].content).toContain('REST Gateway Timeout or Connectivity Exception');
    expect(history[1].content).toContain('HTTP 504: Gateway Timeout');
  });

  it('monitors rendererUrl mutations triggering flushing resets', async () => {
    // Setup initial state: history has data, status is ready, locks active
    chatStateMock.chatHistory.set([{role: MessageRole.USER, content: 'Some logs'}]);
    chatStateMock.pipelineStatus.set(PipelineStatus.READY);
    chatStateMock.isProgrammaticStreamActive.set(true);
    stateSyncMock.activeDraftSignal.set('Custom unsaved draft configs');

    // Verify setup
    expect(chatStateMock.chatHistory().length).toBe(1);
    expect(service.pipelineStatus()).toBe(PipelineStatus.READY);
    expect(service.isProgrammaticStreamActive()).toBe(true);
    expect(stateSyncMock.hydrateActiveDraft()).toBe('Custom unsaved draft configs');

    // Trigger dynamic rendererUrl setting override
    configProviderMock.rendererUrl.set('http://localhost:9999/preview-env-fresh');

    // Trigger Angular effects change detections
    TestBed.tick();

    // Wait for the scheduled microtask to execute
    await new Promise(resolve => queueMicrotask(resolve));

    // Verify dynamic flushes wipes resets instantly execute!
    expect(chatStateMock.chatHistory()).toEqual([]);
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);
    expect(stateSyncMock.flushDraft).toHaveBeenCalledTimes(1);
  });

  describe('sanitizeComponentObject', () => {
    it('strips out top-level rules and mock prefix properties', () => {
      const input = {
        component: 'MaterialText',
        rules: {someRule: true},
        mockField: 'mock value',
        otherProp: 'retained',
      };
      const result = service.TEST_ONLY.sanitizeComponentObject(input);
      expect(result).toEqual({
        component: 'MaterialText',
        otherProp: 'retained',
      });
    });

    it('handles deeply nested properties correctly', () => {
      const input = {
        component: 'MaterialColumn',
        nested: {
          rules: {nestedRule: true},
          mockNested: 'nested value',
          safeNested: {
            value: 'keep',
          },
        },
      };
      const result = service.TEST_ONLY.sanitizeComponentObject(input);
      expect(result).toEqual({
        component: 'MaterialColumn',
        nested: {
          safeNested: {
            value: 'keep',
          },
        },
      });
    });

    it('safely cleans elements inside arrays recursively', () => {
      const input = {
        component: 'MaterialRow',
        children: [
          {component: 'MaterialText', rules: {x: 1}, text: 'A'},
          {component: 'MaterialButton', mockProp: 10, label: 'B'},
          'plain string',
          null,
        ],
      };
      const result = service.TEST_ONLY.sanitizeComponentObject(input);
      expect(result).toEqual({
        component: 'MaterialRow',
        children: [
          {component: 'MaterialText', text: 'A'},
          {component: 'MaterialButton', label: 'B'},
          'plain string',
          null,
        ],
      });
    });

    it('prevents crash and returns safe values for null, undefined, or empty inputs', () => {
      const input = {
        component: 'MaterialCard',
        nullProp: null,
        undefinedProp: undefined,
        emptyObj: {},
      };
      const result = service.TEST_ONLY.sanitizeComponentObject(input);
      expect(result).toEqual({
        component: 'MaterialCard',
        nullProp: null,
        undefinedProp: undefined,
        emptyObj: {},
      });
    });
  });
});
