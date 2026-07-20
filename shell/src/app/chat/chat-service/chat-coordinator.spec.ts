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
import {ChatCoordinator} from './chat-coordinator';
import {redactApiKey} from './error-utils';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {ChatState, LlmLogEntry, LlmLogType} from '../chat-state/chat-state';
import {
  AppConfigProvider,
  EnvMode,
  AuthType,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {StateSync} from '../state-sync/state-sync';
import {
  LlmClient,
  LlmMessage,
  LlmResponse,
  LlmStreamResponse,
  MessageRole,
  CANCEL_ERROR_NAME,
} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

class MockAppConfigProvider {
  readonly rendererUrl = signal<string>('http://localhost:4200/preview');
  readonly geminiApiKey = signal<string>('sample-api-key');
  readonly envMode = signal(EnvMode.STANDALONE);
  readonly authType = signal(AuthType.THIRD_PARTY);
  readonly themePreference = signal<ThemePreference>('light');
  readonly includeScreenshot = signal<boolean>(true);
  setRendererUrl = vi.fn((url: string) => {
    this.rendererUrl.set(url);
  });
  setGeminiApiKey = vi.fn((key: string) => {
    this.geminiApiKey.set(key);
  });
  setForcedAuthMode = vi.fn();
  setThemePreference = vi.fn((theme: ThemePreference) => {
    this.themePreference.set(theme);
  });
  setIncludeScreenshot = vi.fn((include: boolean) => {
    this.includeScreenshot.set(include);
  });
  flushConfig = vi.fn();
}

class MockChatState {
  readonly chatHistory = signal<LlmMessage[]>([]);
  readonly pipelineStatus = signal<PipelineStatus>(PipelineStatus.IDLE);
  readonly isProgrammaticStreamActive = signal<boolean>(false);
  readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  readonly llmHistory = signal<LlmLogEntry[]>([]);

  setChatHistory(history: LlmMessage[]) {
    this.chatHistory.set(history);
  }
  updateChatHistory(updater: (history: LlmMessage[]) => LlmMessage[]) {
    this.chatHistory.update(updater);
  }
  setPipelineStatus(status: PipelineStatus) {
    this.pipelineStatus.set(status);
  }
  setProgrammaticStreamActive(active: boolean) {
    this.isProgrammaticStreamActive.set(active);
  }
  addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry: LlmLogEntry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(history => [...history, entry].slice(-50));
  }
  clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

class MockStateSync {
  readonly activeDraftSignal = signal<string>('Initial draft text');
  readonly activeDraft = this.activeDraftSignal.asReadonly();
  commitLayoutFromLlm = vi.fn((val: string) => {
    this.activeDraftSignal.set(val);
  });
  flushDraft = vi.fn(() => {
    this.activeDraftSignal.set('Initial draft text');
  });
  hydrateActiveDraft = vi.fn(() => this.activeDraftSignal());
}

function createMockStream(chunks: string[]): AsyncIterable<LlmResponse> {
  return {
    [Symbol.asyncIterator]() {
      let idx = 0;
      return {
        async next(): Promise<IteratorResult<LlmResponse>> {
          if (idx < chunks.length) {
            const content = chunks[idx++];
            return {value: {content}, done: false};
          }
          return {value: undefined, done: true};
        },
      };
    },
  };
}

class MockLlmClient {
  chat = vi.fn();
  chatStream = vi.fn(async (messages: LlmMessage[]): Promise<LlmStreamResponse> => {
    const contentStream = createMockStream([
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", ' + '"catalogId": "basic"}}\n',
    ]);
    const complete = Promise.resolve(
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", ' + '"catalogId": "basic"}}\n',
    );
    return {contentStream, complete};
  });
}

describe('ChatCoordinator Pipeline & State Integration', () => {
  let service: ChatCoordinator;
  let chatStateMock: MockChatState;
  let catalogManagementMock: MockCatalogManagement;
  let configProviderMock: MockAppConfigProvider;
  let stateSyncMock: MockStateSync;
  let llmClientMock: MockLlmClient;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ChatCoordinator,
        {provide: ChatState, useClass: MockChatState},
        {
          provide: CatalogManagement,
          useClass: MockCatalogManagement,
        },
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: StateSync, useClass: MockStateSync},
        {provide: LlmClient, useClass: MockLlmClient},
      ],
    });

    service = TestBed.inject(ChatCoordinator);
    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
    configProviderMock = TestBed.inject(AppConfigProvider) as unknown as MockAppConfigProvider;
    stateSyncMock = TestBed.inject(StateSync) as unknown as MockStateSync;
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
    expect(updatedHistory[1].content).toContain('"createSurface": {');
    expect(updatedHistory[1].content).not.toContain('●●●');

    // Verify layout committed back in a single commit transaction
    expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalledTimes(1);
    expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalledWith(
      JSON.stringify(
        [
          {
            version: 'v0.9',
            createSurface: {
              surfaceId: 's1',
              catalogId: 'basic',
            },
          },
        ],
        null,
        2,
      ),
    );
  });

  it('extracts layouts markdown and heals unmatched curly braces', async () => {
    // Return a corrupted Markdown wrap payload
    const corruptedRawOutput =
      'Conversational filler text preceding block...\n' +
      '```json\n' +
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n' +
      '{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id": "c1", "component": "Text", "rules": [1, 2],}\n' +
      '```\n' +
      'Filler text following block...';

    llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
      const contentStream = createMockStream([corruptedRawOutput]);
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
    // - missing bracket appended to array
    // - trailing comma removed, mock property 'rules' stripped!
    const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
    const parsed = JSON.parse(committedOutput);
    expect(parsed.length).toBe(2);

    expect(parsed[0].createSurface.surfaceId).toBe('s1');

    expect(parsed[1].updateComponents.components[0].id).toBe('c1');
    // mock fields stripped!
    expect(parsed[1].updateComponents.components[0].rules).toBeUndefined();
  });

  /* Legacy Widget Fallback healing check */
  it('heals elements with legacy "name" properties mapping to type', async () => {
    const legacyRawOutput =
      '{"version": "v0.9", "createSurface": {"surfaceId": "s2", "catalogId": "test"}}\n' +
      '{"version": "v0.9", "updateComponents": {"surfaceId": "s2", "components": [{"id": "c1", "name": "TextField"}]}}';

    llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
      const contentStream = createMockStream([legacyRawOutput]);
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
    const parsed = JSON.parse(committedOutput);
    const comp = parsed[1].updateComponents.components[0];

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
      const contentStream = createMockStream([typosRawOutput]);
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
    const parsed = JSON.parse(committedOutput);
    const components = parsed[1].updateComponents.components;

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
    expect(history[1].errorTitle).toBe('REST Gateway Timeout');
    expect(history[1].errorMessage).toBe('Remote generation service did not respond.');
    expect(history[1].errorDetails).toContain('Details: HTTP 504: Gateway Timeout');
    expect(history[1].content).toBe(history[1].errorMessage);
  });

  it('bubbles service unavailable errors to error log without technical details', async () => {
    const error = new Error('HTTP 503 Service Unavailable');
    llmClientMock.chatStream = vi.fn(async () => {
      throw error;
    });

    await service.submitPrompt('Generate widgets list');

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorTitle).toBe('Service Unavailable');
    expect(history[1].errorMessage).toBe(
      'The generative service is temporarily unavailable. Please try again later.',
    );
    expect(history[1].errorDetails).toBeUndefined();
    expect(history[1].errorTip).toBeUndefined();
  });

  it('bubbles model high demand errors to error log without technical details', async () => {
    const error = new Error('Model is experiencing high demand');
    llmClientMock.chatStream = vi.fn(async () => {
      throw error;
    });

    await service.submitPrompt('Generate widgets list');

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorTitle).toBe('Model High Demand');
    expect(history[1].errorMessage).toBe(
      'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
    );
    expect(history[1].errorDetails).toBeUndefined();
    expect(history[1].errorTip).toBeUndefined();
  });

  it('bubbles invalid API key errors to error log with custom error message and specific tip', async () => {
    const error = new Error('API_KEY_INVALID: API key expired');
    llmClientMock.chatStream = vi.fn(async () => {
      throw error;
    });

    await service.submitPrompt('Generate widgets list');

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorTitle).toBe('Invalid API Key');
    expect(history[1].errorMessage).toBe('The provided Gemini API key is invalid or missing.');
    expect(history[1].errorDetails).toContain('Details: API key expired');
    expect(history[1].errorTip).toBe(
      'Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.',
    );
    expect(history[1].errorDetails).toBeDefined();
  });

  it('bubbles authentication failure errors to error log', async () => {
    const error = new Error('AuthError: 401 Unauthorized');
    llmClientMock.chatStream = vi.fn(async () => {
      throw error;
    });

    await service.submitPrompt('Generate widgets list');

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorTitle).toBe('Authentication Refused');
    expect(history[1].errorMessage).toBe(
      'Authentication failed. Please verify your credentials in Settings.',
    );
    expect(history[1].errorDetails).toContain('Details: 401 Unauthorized');
    expect(history[1].errorTip).toContain(
      'Please check your network proxy configurations or verify your settings',
    );
    expect(history[1].errorDetails).toBeDefined();
  });

  it('redacts Gemini API keys from error messages and details', async () => {
    const error = new Error(
      'API_KEY_INVALID: Invalid API key: AIzaSyDUMMY_KEY_123. Please check key.',
    );
    llmClientMock.chatStream = vi.fn(async () => {
      throw error;
    });

    await service.submitPrompt('Generate widgets list');

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorMessage).toBe('The provided Gemini API key is invalid or missing.');
    expect(history[1].errorDetails).toContain('Invalid API key: redacted for your protection');
    expect(history[1].errorDetails).not.toContain('AIzaSyDUMMY_KEY_123');
  });

  it('redacts generic API key patterns even if not matching AIzaSy', async () => {
    const error = new Error('ConnectivityError: Invalid API key: dummy_key_here');
    llmClientMock.chatStream = vi.fn(async () => {
      throw error;
    });

    await service.submitPrompt('Generate widgets list');

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorTitle).toBe('Invalid API Key');
    expect(history[1].errorMessage).toBe('The provided Gemini API key is invalid or missing.');
    expect(history[1].errorDetails).toContain('Invalid API key: redacted for your protection');
    expect(history[1].errorDetails).not.toContain('dummy_key_here');
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
    await Promise.resolve();

    // Wait for the scheduled microtask to execute
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));

    // Verify dynamic flushes wipes resets instantly execute!
    expect(chatStateMock.chatHistory()).toEqual([]);
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);
    expect(stateSyncMock.flushDraft).toHaveBeenCalledTimes(1);
  });

  it('handles active stream cancellation cleanly', async () => {
    let cancelCalled = false;
    let rejectCompletePromise!: (err: unknown) => void;
    const completePromise = new Promise<string>((_, reject) => {
      rejectCompletePromise = reject;
    });
    completePromise.catch(() => {});

    const mockCancel = vi.fn(() => {
      cancelCalled = true;
      const err = new Error('Cancelled');
      err.name = CANCEL_ERROR_NAME;
      rejectCompletePromise(err);
    });

    const contentStream: AsyncIterable<LlmResponse> = {
      [Symbol.asyncIterator]() {
        return {
          async next(): Promise<IteratorResult<LlmResponse>> {
            if (cancelCalled) {
              const err = new Error('Cancelled');
              err.name = CANCEL_ERROR_NAME;
              throw err;
            }
            // Hang or wait until cancel is called
            await new Promise<void>((resolve, reject) => {
              const check = setInterval(() => {
                if (cancelCalled) {
                  clearInterval(check);
                  const err = new Error('Cancelled');
                  err.name = CANCEL_ERROR_NAME;
                  reject(err);
                }
              }, 10);
            });
            return {value: undefined, done: true};
          },
        };
      },
    };

    llmClientMock.chatStream.mockResolvedValue({
      contentStream,
      complete: completePromise,
      cancel: mockCancel,
    });

    const promptPromise = service.submitPrompt('Cancel me');

    // Wait a tiny bit for stream turn setup to run
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(service.pipelineStatus()).toBe(PipelineStatus.RECEIVING_STREAM);
    expect(service.isProgrammaticStreamActive()).toBe(true);

    // Trigger cancel
    service.cancelActiveStream();

    await expect(promptPromise).resolves.toBeUndefined();

    expect(mockCancel).toHaveBeenCalled();
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);

    const history = chatStateMock.chatHistory();
    expect(history[history.length - 1].content).toBe('*You stopped this response.*');
  });

  describe('JSONL Parsing & Line-Level Healing', () => {
    it('successfully parses multiple JSON Lines into a single JSON array', async () => {
      const jsonlOutput =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "test"}}\n' +
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id": "c1", "component": "TextField"}]}}';

      llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
        const contentStream = createMockStream([jsonlOutput]);
        return {contentStream, complete: Promise.resolve(jsonlOutput)};
      });

      catalogManagementMock.activeCatalog.set({
        catalogId: 'test',
        components: {
          TextField: {},
        },
      });

      await service.submitPrompt('JSONL test prompt');

      const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
      const parsed = JSON.parse(committedOutput);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[0].createSurface.surfaceId).toBe('s1');
      expect(parsed[1].updateComponents.components[0].component).toBe('TextField');
    });

    it('heals a truncated last line of JSONL output', async () => {
      // Last line is truncated, missing closing braces
      const truncatedJsonlOutput =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "test"}}\n' +
        '{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id": "c1", "component": "TextField"}]';

      llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
        const contentStream = createMockStream([truncatedJsonlOutput]);
        return {contentStream, complete: Promise.resolve(truncatedJsonlOutput)};
      });

      catalogManagementMock.activeCatalog.set({
        catalogId: 'test',
        components: {
          TextField: {},
        },
      });

      await service.submitPrompt('Truncated JSONL test prompt');

      const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
      const parsed = JSON.parse(committedOutput);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(2);
      expect(parsed[1].updateComponents.components[0].component).toBe('TextField');
    });

    it('throws error when a critical layout line is completely corrupted and cannot be healed', async () => {
      const corruptedJsonlOutput =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "test"}}\n' +
        '{"version": "v0.9", "updateComponents": { {{{ corrupt';

      llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
        const contentStream = createMockStream([corruptedJsonlOutput]);
        return {contentStream, complete: Promise.resolve(corruptedJsonlOutput)};
      });

      catalogManagementMock.activeCatalog.set({
        catalogId: 'test',
        components: {},
      });

      await service.submitPrompt('Corrupted JSONL test prompt');

      expect(service.pipelineStatus()).toBe(PipelineStatus.FAILED);
    });
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

  describe('API Key Redaction (Direct)', () => {
    it('redacts Gemini API keys matching standard pattern', () => {
      const input = 'Error using key AIzaSyA1B2C3D4E5F6G7H8I9J0K_L-M and some other text';
      const expected = 'Error using key redacted for your protection and some other text';
      expect(redactApiKey(input)).toBe(expected);
    });

    it('redacts Invalid API key: <key> pattern', () => {
      const input = 'API_KEY_INVALID: Invalid API key: asd';
      const expected = 'API_KEY_INVALID: Invalid API key: redacted for your protection';
      expect(redactApiKey(input)).toBe(expected);
    });

    it('redacts API key: <key> pattern', () => {
      const input = 'Some details API key: 12345-abc';
      const expected = 'Some details API key: redacted for your protection';
      expect(redactApiKey(input)).toBe(expected);
    });

    it('prevents double redaction of already redacted keys', () => {
      const input = 'Invalid API key: redacted for your protection';
      expect(redactApiKey(input)).toBe(input);
    });
  });
});
