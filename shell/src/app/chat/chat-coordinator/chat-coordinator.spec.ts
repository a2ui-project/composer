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
import {createEnvironmentInjector, EnvironmentInjector, signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ChatCoordinator} from './chat-coordinator';
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
import {PromptTurnType, UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
}

class MockAppConfigProvider {
  readonly rendererUrl = signal<string>('http://localhost:4200/preview');
  readonly geminiApiKey = signal<string>('sample-api-key');
  readonly envMode = signal(EnvMode.STANDALONE);
  readonly authType = signal(AuthType.THIRD_PARTY);
  readonly themePreference = signal<ThemePreference>(ThemePreference.LIGHT);
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

async function* createMockStream(chunks: string[]): AsyncIterable<LlmResponse> {
  for (const content of chunks) {
    yield {content};
  }
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
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
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

    expect(prompt).toContain(
      'You are an expert A2UI generation assistant. Your role is to translate user',
    );
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
  it('ignores submitPrompt when programmatic stream is actively locked', async () => {
    chatStateMock.setProgrammaticStreamActive(true);
    await service.submitPrompt('Test locked');
    expect(llmClientMock.chatStream).not.toHaveBeenCalled();
    expect(chatStateMock.chatHistory().length).toBe(0);
  });

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
    // - trailing comma removed
    const committedOutput = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
    const parsed = JSON.parse(committedOutput);
    expect(parsed.length).toBe(2);

    expect(parsed[0].createSurface.surfaceId).toBe('s1');

    expect(parsed[1].updateComponents.components[0].id).toBe('c1');
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

  it('unsubscribes from rendererUrl changes upon destruction', async () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([ChatCoordinator], parentInjector);
    const childService = childInjector.get(ChatCoordinator);
    const wipeSpy = vi.spyOn(childService, 'wipeEnvironmentCache');

    // Drain initial signal emission from constructor
    TestBed.tick();

    // Trigger mutation while active
    configProviderMock.rendererUrl.set('http://localhost:9999/preview-active');
    TestBed.tick();
    await Promise.resolve();
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));
    expect(wipeSpy).toHaveBeenCalledTimes(1);

    wipeSpy.mockClear();

    // Destroy child injector
    childInjector.destroy();

    // Trigger mutation after destruction
    configProviderMock.rendererUrl.set('http://localhost:9999/preview-destroyed');
    TestBed.tick();
    await Promise.resolve();
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));

    expect(wipeSpy).not.toHaveBeenCalled();
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

    try {
      await promptPromise;
    } catch (e) {
      // expected
    }

    expect(mockCancel).toHaveBeenCalled();
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);

    const history = chatStateMock.chatHistory();
    expect(history[history.length - 1].content).toBe('*You stopped this response.*');
  });

  it('handles schema validation failures with detailed error messages', async () => {
    const invalidEnvelopeJsonl =
      '{"version": "v0.8", "createSurface": {"surfaceId": "s1", "catalogId": "test"}}';

    llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
      const contentStream = createMockStream([invalidEnvelopeJsonl]);
      return {contentStream, complete: Promise.resolve(invalidEnvelopeJsonl)};
    });

    catalogManagementMock.activeCatalog.set({
      catalogId: 'test',
      components: {},
    });

    await service.submitPrompt('Invalid version envelope prompt');

    expect(service.pipelineStatus()).toBe(PipelineStatus.FAILED);
    expect(service.isProgrammaticStreamActive()).toBe(false);

    const history = chatStateMock.chatHistory();
    expect(history.length).toBe(2);
    expect(history[1].role).toBe(MessageRole.ERROR);
    expect(history[1].errorTitle).toBe('Validation Failure');
    expect(history[1].errorDetails).toContain('Outgoing message envelope validation failed');
    expect(history[1].errorDetails).toContain(
      'Malformed payload for RENDER_A2UI: array items must specify version "v0.9".',
    );
  });

  describe('Parsing and Cleanup', () => {
    it('cleans raw LLM text (markdown fences, thought tags) and sets HEALING status', async () => {
      catalogManagementMock.activeCatalog.set({catalogId: 'test', components: {TextField: {}}});

      const rawText = `
<thinking>
I should generate a text field.
</thinking>
\`\`\`jsonlines
{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "test"}}
{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"component": "TextField", "name": "input1"}]}}
\`\`\`
      `;

      llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
        const contentStream = createMockStream([rawText]);
        return {contentStream, complete: Promise.resolve(rawText), cancel: vi.fn()};
      });

      // Spy on pipeline status updates to verify HEALING is set
      const pipelineSpy = vi.spyOn(chatStateMock, 'setPipelineStatus');

      await service.submitPrompt('Build a layout');

      // Check that HEALING status was correctly set due to markdown code fences
      expect(pipelineSpy).toHaveBeenCalledWith(PipelineStatus.HEALING);

      // Verify the final pipeline status is READY
      expect(service.pipelineStatus()).toBe(PipelineStatus.READY);
      expect(service.isProgrammaticStreamActive()).toBe(false);

      const history = chatStateMock.chatHistory();
      const lastMessage = history[history.length - 1];

      // Extract the updated content - it should be cleanly parsed JSON text structure
      // that is successfully parsed from the payload.
      expect(lastMessage.content).toContain('"version": "v0.9"');
      expect(lastMessage.content).toContain('"createSurface"');
      expect(lastMessage.content).toContain('"TextField"');

      // The `<thinking>` tags should have been stripped out from the layout output
      expect(lastMessage.content).not.toContain('<thinking>');
      expect(lastMessage.content).not.toContain('```jsonlines');

      expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalled();
    });
  });

  describe('Telemetry Tracking', () => {
    it('tracks prompt turns upon submitPrompt', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const promptSpy = vi.spyOn(trackingService, 'trackChatPrompt');

      await service.submitPrompt('Build a landing page', [
        {name: 'screenshot.png', mimeType: 'image/png', data: 'data'},
        {name: 'data.json', mimeType: 'application/json', data: 'json'},
      ]);

      expect(promptSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          turnIndex: 1,
          turnType: PromptTurnType.INITIAL,
          hasScreenshot: true,
          attachmentCount: 1,
        }),
      );
      expect(service.currentTurnIndex()).toBe(1);
    });

    it('tracks prompt turn as retry when retryOfPromptId is specified', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const retrySpy = vi.spyOn(trackingService, 'trackChatRetry');

      await service.submitPrompt('Try again', [], {
        promptId: 'custom-retry-id',
        promptTurnIndex: 5,
        retryOfPromptId: 'parent-prompt-id',
      });

      expect(retrySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          promptId: 'custom-retry-id',
          turnIndex: 5,
          attemptNumber: 2,
          retryOfPromptId: 'parent-prompt-id',
        }),
      );
      expect(service.currentTurnIndex()).toBe(5);
    });

    it('tracks cancelled prompt when cancelActiveStream is triggered', async () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const cancelSpy = vi.spyOn(trackingService, 'trackChatCancel');

      let cancelCalled = false;
      const completePromise = new Promise<string>((_, reject) => {
        const check = setInterval(() => {
          if (cancelCalled) {
            clearInterval(check);
            const err = new Error('Cancelled');
            err.name = CANCEL_ERROR_NAME;
            reject(err);
          }
        }, 10);
      });
      completePromise.catch(() => {});

      llmClientMock.chatStream = vi.fn(async () => {
        const contentStream: AsyncIterable<{content: string; thinking?: string}> = {
          [Symbol.asyncIterator]() {
            return {
              async next(): Promise<IteratorResult<{content: string; thinking?: string}>> {
                if (cancelCalled) {
                  const err = new Error('Cancelled');
                  err.name = CANCEL_ERROR_NAME;
                  throw err;
                }
                await new Promise<void>((_, reject) => {
                  const check = setInterval(() => {
                    if (cancelCalled) {
                      clearInterval(check);
                      const err = new Error('Cancelled');
                      err.name = CANCEL_ERROR_NAME;
                      reject(err);
                    }
                  }, 10);
                });
                return {value: undefined as unknown as {content: string}, done: true};
              },
            };
          },
        };
        return {
          contentStream,
          complete: completePromise,
          cancel: () => {
            cancelCalled = true;
          },
        };
      });

      const submitPromise = service.submitPrompt('Long running prompt');
      service.cancelActiveStream();
      await submitPromise;

      expect(cancelSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          promptId: expect.any(String),
          turnIndex: 1,
        }),
      );
    });
  });
});
