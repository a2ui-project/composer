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
import {describe, it, expect, beforeEach, vi, type MockInstance} from 'vitest';
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
  pushAppError = vi.fn();
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
  resetToBlankDraft = vi.fn(() => {
    this.activeDraftSignal.set(
      '[{"version":"v0.9","createSurface":{"surfaceId":"sample-surface","catalogId":"basic"}}]',
    );
  });
  hydrateActiveDraft = vi.fn(() => this.activeDraftSignal());
  syncActiveDraftToHistory = vi.fn();
  hasEditedDraft = vi.fn(() => false);
}

async function* createMockStream(chunks: string[]): AsyncIterable<LlmResponse> {
  for (const content of chunks) {
    yield {content};
  }
}

/** A promise and the functions that settle it, so a test decides when it settles. */
function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return {promise, resolve, reject};
}

/**
 * A response that streams nothing until it's cancelled, then fails the way the real client
 * does: its content stream and `complete` both reject with an error named
 * CANCEL_ERROR_NAME.
 *
 * By default the response fails as soon as `cancel` is called. With `holdCancel`, it fails
 * only when the test calls `finishCancel`. The real client's response also fails a moment
 * after `cancel`, once its request has stopped; holding the cancel lets a test act while
 * the cancel is under way.
 */
function createStreamAwaitingCancel({holdCancel = false} = {}) {
  const started = createDeferred<void>();
  const cancelled = createDeferred<never>();
  // As in the real client: once the content stream fails, nobody awaits `complete`.
  cancelled.promise.catch(() => {});
  const finishCancel = () => {
    const err = new Error('Cancelled');
    err.name = CANCEL_ERROR_NAME;
    cancelled.reject(err);
  };
  const cancel = vi.fn(() => {
    if (!holdCancel) {
      finishCancel();
    }
  });
  const response: LlmStreamResponse = {
    contentStream: {
      async *[Symbol.asyncIterator]() {
        started.resolve();
        await cancelled.promise;
      },
    },
    complete: cancelled.promise,
    cancel,
  };
  return {response, started: started.promise, cancel, finishCancel};
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
    expect(prompt).toContain('"components":{}');
  });

  describe('Multimodal Guidelines Conditional Injection', () => {
    beforeEach(() => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'basic',
        components: {Text: {}},
      });
    });

    it('omits Multimodal & Image-to-UI Guidelines on text-only turns', async () => {
      await service.submitPrompt('Build a login card');
      const messages = llmClientMock.chatStream.mock.calls[0][0];
      expect(messages[0].role).toBe(MessageRole.SYSTEM);
      expect(messages[0].content).not.toContain('## Multimodal & Image-to-UI Guidelines');
      expect(service.systemPrompt()).not.toContain('## Multimodal & Image-to-UI Guidelines');
    });

    it('omits Multimodal & Image-to-UI Guidelines when only non-image attachments (e.g., application/json) are present', async () => {
      await service.submitPrompt('Import this data', [
        {name: 'data.json', mimeType: 'application/json', data: 'e30='},
      ]);
      const messages = llmClientMock.chatStream.mock.calls[0][0];
      expect(messages[0].role).toBe(MessageRole.SYSTEM);
      expect(messages[0].content).not.toContain('## Multimodal & Image-to-UI Guidelines');
    });

    it('omits Multimodal & Image-to-UI Guidelines when image attachments exist only on MessageRole.ERROR messages', () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.ERROR,
          content: 'Failed turn',
          attachments: [{name: 'screenshot.png', mimeType: 'image/png', data: 'base64'}],
        },
      ]);
      const context = service.getFullMessageContext();
      expect(context[0].content).not.toContain('## Multimodal & Image-to-UI Guidelines');
      expect(service.systemPrompt()).not.toContain('## Multimodal & Image-to-UI Guidelines');
    });

    it('includes Multimodal & Image-to-UI Guidelines when an image attachment is present and updates systemPrompt() reactively', async () => {
      await service.submitPrompt('Match this mockup', [
        {name: 'mockup.png', mimeType: 'image/png', data: 'base64'},
      ]);
      const messages = llmClientMock.chatStream.mock.calls[0][0];
      expect(messages[0].role).toBe(MessageRole.SYSTEM);
      expect(messages[0].content).toContain('## Multimodal & Image-to-UI Guidelines');
      expect(service.systemPrompt()).toContain('## Multimodal & Image-to-UI Guidelines');
    });

    it('includes Multimodal & Image-to-UI Guidelines for screenshot.png, uppercase MIME types, and extension-inferred image files', async () => {
      await service.submitPrompt('Fix spacing', [
        {name: 'screenshot.png', mimeType: '', data: 'base64'},
      ]);
      expect(llmClientMock.chatStream.mock.calls[0][0][0].content).toContain(
        '## Multimodal & Image-to-UI Guidelines',
      );

      service.startNewSession();
      await service.submitPrompt('Check uppercase MIME', [
        {name: 'upload', mimeType: 'IMAGE/PNG', data: 'base64'},
      ]);
      expect(llmClientMock.chatStream.mock.calls[1][0][0].content).toContain(
        '## Multimodal & Image-to-UI Guidelines',
      );

      service.startNewSession();
      await service.submitPrompt('Check extension fallback', [
        {name: 'wireframe.webp', mimeType: 'application/octet-stream', data: 'base64'},
      ]);
      expect(llmClientMock.chatStream.mock.calls[2][0][0].content).toContain(
        '## Multimodal & Image-to-UI Guidelines',
      );
    });
  });

  describe('editing an imported demo', () => {
    const flight = [
      {version: 'v0.9', createSurface: {surfaceId: 'showcase-01-flight', catalogId: 'basic'}},
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'showcase-01-flight',
          components: [{id: 'root', component: 'Text', text: 'JFK'}],
        },
      },
    ];
    function respondWith(blocks: unknown[]) {
      const text = blocks.map(block => JSON.stringify(block)).join('\n');
      llmClientMock.chatStream.mockResolvedValue({
        contentStream: createMockStream([text]),
        complete: Promise.resolve(text),
      });
    }
    it('sends the current imported draft even before history synchronization', async () => {
      stateSyncMock.activeDraftSignal.set(JSON.stringify(flight));
      stateSyncMock.syncActiveDraftToHistory.mockImplementation(() => {
        chatStateMock.setChatHistory([
          {role: MessageRole.USER, content: stateSyncMock.activeDraft()},
        ]);
      });
      await service.submitPrompt('Change the destination to SF');
      const messages = llmClientMock.chatStream.mock.calls[0][0];
      expect(
        messages.some(
          message =>
            message.role === MessageRole.USER &&
            message.content.includes('showcase-01-flight') &&
            message.content.includes('JFK'),
        ),
      ).toBe(true);
      expect(messages.at(-1)?.content).toBe('Change the destination to SF');
    });
    it('rejects an unknown surface without replacing the draft', async () => {
      const original = JSON.stringify(flight);
      stateSyncMock.activeDraftSignal.set(original);
      respondWith([
        {
          version: 'v0.9',
          updateDataModel: {surfaceId: 'vacation_booking', path: '/destination_value', value: 'SF'},
        },
      ]);
      await service.submitPrompt('Change the destination to SF');
      expect(stateSyncMock.commitLayoutFromLlm).not.toHaveBeenCalled();
      expect(stateSyncMock.activeDraft()).toBe(original);
      expect(service.pipelineStatus()).toBe(PipelineStatus.FAILED);
      expect(chatStateMock.chatHistory().at(-1)?.errorTitle).toBe('Validation Failure');
      expect(chatStateMock.chatHistory().at(-1)?.errorDetails).toContain('vacation_booking');
    });
    it('retains the imported surface when applying a valid component edit', async () => {
      stateSyncMock.activeDraftSignal.set(JSON.stringify(flight));
      const update = {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'showcase-01-flight',
          components: [{id: 'root', component: 'Text', text: 'SFO'}],
        },
      };
      respondWith([update]);
      await service.submitPrompt('Change the destination to SF');
      expect(JSON.parse(stateSyncMock.activeDraft())).toEqual([...flight, update]);
      expect(service.pipelineStatus()).toBe(PipelineStatus.READY);
    });
  });

  /* Pipeline submit and Lockout assertions */
  it('ignores submitPrompt when programmatic stream is actively locked', async () => {
    chatStateMock.setProgrammaticStreamActive(true);
    await service.submitPrompt('Test locked');
    expect(llmClientMock.chatStream).not.toHaveBeenCalled();
    expect(chatStateMock.chatHistory().length).toBe(0);
  });

  it('includes the current canvas before the user instruction in the request', async () => {
    stateSyncMock.syncActiveDraftToHistory.mockImplementation(() => {
      chatStateMock.setChatHistory([
        {role: MessageRole.USER, content: '[{"text":"edited gallery draft"}]'},
      ]);
    });

    await service.submitPrompt('Make this blue');

    const request = llmClientMock.chatStream.mock.calls[0][0];
    expect(request.slice(1)).toEqual([
      {role: MessageRole.USER, content: '[{"text":"edited gallery draft"}]'},
      expect.objectContaining({role: MessageRole.USER, content: 'Make this blue'}),
    ]);
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

    // Verify compact JSON content stored in model's turn log
    const updatedHistory = chatStateMock.chatHistory();
    expect(updatedHistory[1].role).toBe(MessageRole.MODEL);
    expect(updatedHistory[1].content).toBe(
      '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
    );
    expect(updatedHistory[1].content).not.toContain('\n');
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

    // Assert that the committed layout is fully healed and sanitized:
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

  /** Changes the renderer and waits for ChatCoordinator to handle the change. */
  async function changeRenderer(): Promise<void> {
    configProviderMock.rendererUrl.set('http://localhost:9999/other-renderer');
    TestBed.tick();
    await new Promise<void>(resolve => queueMicrotask(() => resolve()));
  }

  it('starts a new session when the renderer changes while the canvas is unedited', async () => {
    chatStateMock.chatHistory.set([
      {role: MessageRole.USER, content: 'What can you build?'},
      {role: MessageRole.MODEL, content: 'Forms, lists and cards.'},
    ]);
    chatStateMock.pipelineStatus.set(PipelineStatus.READY);

    await changeRenderer();

    expect(chatStateMock.chatHistory()).toEqual([]);
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);
    expect(stateSyncMock.flushDraft).toHaveBeenCalledTimes(1);
  });

  it('keeps the conversation and canvas when the renderer changes after an edit', async () => {
    stateSyncMock.hasEditedDraft.mockReturnValue(true);
    const history = [
      {role: MessageRole.USER, content: 'Make a card'},
      {role: MessageRole.MODEL, content: 'Here it is'},
    ];
    chatStateMock.chatHistory.set(history);
    stateSyncMock.activeDraftSignal.set('Edited canvas');

    await changeRenderer();

    expect(chatStateMock.chatHistory()).toEqual(history);
    expect(stateSyncMock.flushDraft).not.toHaveBeenCalled();
    expect(stateSyncMock.hydrateActiveDraft()).toBe('Edited canvas');
  });

  it('cancels a streaming response, without tracking a user cancel, when the renderer changes after an edit', async () => {
    stateSyncMock.hasEditedDraft.mockReturnValue(true);
    const trackChatCancel = vi.spyOn(TestBed.inject(UsageTrackingService), 'trackChatCancel');
    const stream = createStreamAwaitingCancel();
    llmClientMock.chatStream = vi.fn(async () => stream.response);
    const submission = service.submitPrompt('Make a card', [], {promptId: 'prompt-1'});
    await stream.started;

    await changeRenderer();
    await submission;

    expect(stream.cancel).toHaveBeenCalledTimes(1);
    expect(trackChatCancel).not.toHaveBeenCalled();
    expect(chatStateMock.chatHistory()).toEqual([
      {role: MessageRole.USER, content: 'Make a card', isSnapshot: false, promptId: 'prompt-1'},
      {
        role: MessageRole.MODEL,
        content: '*This response was stopped because the renderer changed.*',
        isCancelled: true,
        promptId: 'prompt-1',
      },
    ]);
    expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(service.isProgrammaticStreamActive()).toBe(false);
    expect(stateSyncMock.flushDraft).not.toHaveBeenCalled();
  });

  it('cancels a streaming response, without tracking a user cancel, when the renderer changes while the canvas is unedited', async () => {
    const trackChatCancel = vi.spyOn(TestBed.inject(UsageTrackingService), 'trackChatCancel');
    const stream = createStreamAwaitingCancel();
    llmClientMock.chatStream = vi.fn(async () => stream.response);
    const submission = service.submitPrompt('Make a card', [], {promptId: 'prompt-1'});
    await stream.started;

    await changeRenderer();
    await submission;

    expect(stream.cancel).toHaveBeenCalledTimes(1);
    expect(trackChatCancel).not.toHaveBeenCalled();
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

      // Extract the updated content - it should be cleanly parsed compact JSON text structure
      // that is successfully parsed from the payload.
      expect(lastMessage.content).toContain('"version":"v0.9"');
      expect(lastMessage.content).toContain('"createSurface"');
      expect(lastMessage.content).toContain('"TextField"');

      // The `<thinking>` tags should have been stripped out from the layout output
      expect(lastMessage.content).not.toContain('<thinking>');
      expect(lastMessage.content).not.toContain('```jsonlines');

      expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalled();
    });

    it('handles empty LLM response as conversational and aborts layout commit', async () => {
      catalogManagementMock.activeCatalog.set({catalogId: 'test', components: {}});
      const rawText = `
<thinking>
I have no idea what to do, I'll output nothing.
</thinking>
      `;

      llmClientMock.chatStream = vi.fn(async () => {
        const contentStream = (async function* () {
          yield {content: rawText};
        })();
        return {contentStream, complete: Promise.resolve(rawText), cancel: vi.fn()};
      });

      const commitSpy = vi.spyOn(stateSyncMock, 'commitLayoutFromLlm');
      const pipelineSpy = vi.spyOn(chatStateMock, 'setPipelineStatus');

      await service.submitPrompt('Do nothing');

      expect(commitSpy).not.toHaveBeenCalled();
      expect(pipelineSpy).toHaveBeenCalledWith(PipelineStatus.IDLE);
    });

    it('detects unparseable layout outputs, sets IDLE status, and records diagnostic error', async () => {
      catalogManagementMock.activeCatalog.set({catalogId: 'test', components: {}});
      const rawText = `
<thinking>
I'll output bad JSON.
</thinking>
{ "version": "v
      `;

      llmClientMock.chatStream = vi.fn(async () => {
        const contentStream = (async function* () {
          yield {content: rawText};
        })();
        return {contentStream, complete: Promise.resolve(rawText), cancel: vi.fn()};
      });

      const commitSpy = vi.spyOn(stateSyncMock, 'commitLayoutFromLlm');
      const pipelineSpy = vi.spyOn(chatStateMock, 'setPipelineStatus');
      const updateHistorySpy = vi.spyOn(chatStateMock, 'updateChatHistory');

      await service.submitPrompt('Do nothing');

      expect(commitSpy).not.toHaveBeenCalled();
      expect(pipelineSpy).toHaveBeenCalledWith(PipelineStatus.IDLE);

      const historyUpdateArg =
        updateHistorySpy.mock.calls[updateHistorySpy.mock.calls.length - 1][0];
      const resultHistory = historyUpdateArg([
        {role: MessageRole.MODEL, content: ''} as unknown as LlmMessage,
      ]);
      const lastMsg = resultHistory[resultHistory.length - 1];

      expect(lastMsg.role).toBe(MessageRole.MODEL);
      expect(lastMsg.parseError?.success).toBe(false);
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
      const completePromise = new Promise((_, reject) => {
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
        const contentStream = {
          [Symbol.asyncIterator]() {
            return {
              async next() {
                if (cancelCalled) {
                  const err = new Error('Cancelled');
                  err.name = CANCEL_ERROR_NAME;
                  throw err;
                }
                await new Promise((_, reject) => {
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

  describe('cancelling when no response is streaming or a cancel is under way', () => {
    let trackChatCancel: MockInstance<UsageTrackingService['trackChatCancel']>;

    beforeEach(() => {
      trackChatCancel = vi.spyOn(TestBed.inject(UsageTrackingService), 'trackChatCancel');
    });

    it('does not track a cancel when a new session starts after a response completes', async () => {
      await service.submitPrompt('Make a card');

      service.startNewSession();

      expect(trackChatCancel).not.toHaveBeenCalled();
    });

    it('does not track a cancel when a new session starts after a response fails', async () => {
      llmClientMock.chatStream.mockRejectedValueOnce(new Error('Connection failed'));
      await service.submitPrompt('Make a card');

      service.startNewSession();

      expect(trackChatCancel).not.toHaveBeenCalled();
    });

    it('ignores a second Stop while the response is still connecting', async () => {
      const connection = createDeferred<LlmStreamResponse>();
      llmClientMock.chatStream.mockReturnValueOnce(connection.promise);
      const submission = service.submitPrompt('Make a card', [], {promptId: 'prompt-1'});

      service.cancelActiveStream();
      service.cancelActiveStream();
      connection.resolve(createStreamAwaitingCancel().response);
      await submission;

      expect(trackChatCancel).toHaveBeenCalledExactlyOnceWith({
        promptId: 'prompt-1',
        turnIndex: 1,
        pipelineStatus: PipelineStatus.RECEIVING_STREAM,
      });
    });

    it('ignores a second Stop while the first Stop is cancelling the response', async () => {
      const stream = createStreamAwaitingCancel({holdCancel: true});
      llmClientMock.chatStream.mockResolvedValueOnce(stream.response);
      const submission = service.submitPrompt('Make a card', [], {promptId: 'prompt-1'});
      await stream.started;

      service.cancelActiveStream();
      service.cancelActiveStream();
      stream.finishCancel();
      await submission;

      expect(stream.cancel).toHaveBeenCalledTimes(1);
      expect(trackChatCancel).toHaveBeenCalledExactlyOnceWith({
        promptId: 'prompt-1',
        turnIndex: 1,
        pipelineStatus: PipelineStatus.RECEIVING_STREAM,
      });
    });

    it('keeps the Stop note when the renderer changes while Stop is cancelling the response', async () => {
      // With an edited canvas, a renderer change keeps the conversation, so the note that
      // replaces the stopped response stays in the chat. With an unedited canvas, the
      // renderer change would clear the conversation, and the note would never be added.
      stateSyncMock.hasEditedDraft.mockReturnValue(true);
      const stream = createStreamAwaitingCancel({holdCancel: true});
      llmClientMock.chatStream.mockResolvedValueOnce(stream.response);
      const submission = service.submitPrompt('Make a card', [], {promptId: 'prompt-1'});
      await stream.started;

      service.cancelActiveStream();
      await changeRenderer();
      stream.finishCancel();
      await submission;

      expect(chatStateMock.chatHistory()).toEqual([
        {role: MessageRole.USER, content: 'Make a card', promptId: 'prompt-1'},
        {role: MessageRole.MODEL, content: '*You stopped this response.*'},
      ]);
    });

    it('ignores Stop while a renderer change is cancelling the response', async () => {
      // With an edited canvas, a renderer change keeps the conversation, and the response
      // it cancelled keeps streaming until the cancel finishes. With an unedited canvas,
      // the renderer change would start a new session, and Stop would have no response
      // to act on.
      stateSyncMock.hasEditedDraft.mockReturnValue(true);
      const stream = createStreamAwaitingCancel({holdCancel: true});
      llmClientMock.chatStream.mockResolvedValueOnce(stream.response);
      const submission = service.submitPrompt('Make a card', [], {promptId: 'prompt-1'});
      await stream.started;

      await changeRenderer();
      service.cancelActiveStream();
      stream.finishCancel();
      await submission;

      expect(trackChatCancel).not.toHaveBeenCalled();
      expect(chatStateMock.chatHistory()).toEqual([
        {role: MessageRole.USER, content: 'Make a card', promptId: 'prompt-1'},
        {
          role: MessageRole.MODEL,
          content: '*This response was stopped because the renderer changed.*',
        },
      ]);
    });
  });

  describe('startNewSession vs wipeEnvironmentCache & In-Flight Stream Cancellation', () => {
    it('resets currentTurnIndex, clears chat and raw LLM history, sets IDLE status, and calls stateSync.resetToBlankDraft on startNewSession', async () => {
      await service.submitPrompt('Turn 1');
      chatStateMock.addRawLlmLog(LlmLogType.REQUEST, {test: true});
      expect(service.currentTurnIndex()).toBe(1);
      expect(chatStateMock.chatHistory().length).toBeGreaterThan(0);
      expect(chatStateMock.llmHistory().length).toBeGreaterThan(0);

      stateSyncMock.flushDraft.mockClear();
      stateSyncMock.resetToBlankDraft.mockClear();

      service.startNewSession();

      expect(service.currentTurnIndex()).toBe(0);
      expect(chatStateMock.chatHistory()).toEqual([]);
      expect(chatStateMock.llmHistory()).toEqual([]);
      expect(chatStateMock.latestLlmLog()).toBeNull();
      expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
      expect(service.isProgrammaticStreamActive()).toBe(false);
      expect(stateSyncMock.resetToBlankDraft).toHaveBeenCalledTimes(1);
      expect(stateSyncMock.flushDraft).not.toHaveBeenCalled();
    });

    it('resets currentTurnIndex, clears chat and raw LLM history, sets IDLE status, and calls stateSync.flushDraft on wipeEnvironmentCache', async () => {
      await service.submitPrompt('Turn 1');
      chatStateMock.addRawLlmLog(LlmLogType.REQUEST, {test: true});
      expect(service.currentTurnIndex()).toBe(1);

      stateSyncMock.flushDraft.mockClear();
      stateSyncMock.resetToBlankDraft.mockClear();

      service.wipeEnvironmentCache();

      expect(service.currentTurnIndex()).toBe(0);
      expect(chatStateMock.chatHistory()).toEqual([]);
      expect(chatStateMock.llmHistory()).toEqual([]);
      expect(chatStateMock.latestLlmLog()).toBeNull();
      expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
      expect(service.isProgrammaticStreamActive()).toBe(false);
      expect(stateSyncMock.flushDraft).toHaveBeenCalledTimes(1);
      expect(stateSyncMock.resetToBlankDraft).not.toHaveBeenCalled();
    });

    it('cancels stream if startNewSession is called before chatStream resolves and prevents stale mutations', async () => {
      let resolveChatStream!: (resp: LlmStreamResponse) => void;
      const mockCancel = vi.fn();

      llmClientMock.chatStream = vi.fn(
        () =>
          new Promise<LlmStreamResponse>(resolve => {
            resolveChatStream = resolve;
          }),
      );

      const submitPromise = service.submitPrompt('Slow start prompt');
      expect(service.isProgrammaticStreamActive()).toBe(true);

      // Call startNewSession before chatStream resolves
      service.startNewSession();
      expect(service.currentTurnIndex()).toBe(0);
      expect(service.isProgrammaticStreamActive()).toBe(false);
      expect(chatStateMock.chatHistory()).toEqual([]);

      stateSyncMock.commitLayoutFromLlm.mockClear();

      // Now resolve chatStream with a stream that would yield valid A2UI
      const rawText =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n';
      resolveChatStream({
        contentStream: createMockStream([rawText]),
        complete: Promise.resolve(rawText),
        cancel: mockCancel,
      });

      await submitPromise;

      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(stateSyncMock.commitLayoutFromLlm).not.toHaveBeenCalled();
      expect(chatStateMock.chatHistory()).toEqual([]);
      expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    });

    it('cancels active stream mid-iteration on startNewSession and ignores late chunks or non-rejecting complete promise', async () => {
      let emitNextChunk!: () => void;
      const mockCancel = vi.fn();
      const rawText =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n';

      llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
        const contentStream: AsyncIterable<LlmResponse> = {
          [Symbol.asyncIterator]() {
            let step = 0;
            return {
              async next(): Promise<IteratorResult<LlmResponse>> {
                step++;
                if (step === 1) {
                  return {value: {content: '{"version": "v0.9"'}, done: false};
                }
                if (step === 2) {
                  await new Promise<void>(resolve => {
                    emitNextChunk = resolve;
                  });
                  return {
                    value: {
                      content: ', "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n',
                    },
                    done: false,
                  };
                }
                return {value: undefined, done: true};
              },
            };
          },
        };
        return {
          contentStream,
          complete: Promise.resolve(rawText),
          cancel: mockCancel,
        };
      });

      const submitPromise = service.submitPrompt('Mid-stream reset');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Trigger startNewSession while stream is paused on chunk 2
      service.startNewSession();
      expect(mockCancel).toHaveBeenCalledTimes(1);
      expect(chatStateMock.chatHistory()).toEqual([]);
      expect(service.currentTurnIndex()).toBe(0);

      stateSyncMock.commitLayoutFromLlm.mockClear();

      // Resume stream chunk 2 without throwing CANCEL_ERROR_NAME
      emitNextChunk();
      await submitPromise;

      expect(stateSyncMock.commitLayoutFromLlm).not.toHaveBeenCalled();
      expect(chatStateMock.chatHistory()).toEqual([]);
      expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    });

    it('ignores late responseStream.complete resolution and late errors after startNewSession', async () => {
      let resolveComplete!: (val: string) => void;
      const rawText =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n';

      llmClientMock.chatStream = vi.fn(async (): Promise<LlmStreamResponse> => {
        return {
          contentStream: createMockStream([rawText]),
          complete: new Promise<string>(resolve => {
            resolveComplete = resolve;
          }),
          cancel: vi.fn(),
        };
      });

      const submitPromise = service.submitPrompt('Pending complete');
      await new Promise(resolve => setTimeout(resolve, 10));

      service.startNewSession();
      stateSyncMock.commitLayoutFromLlm.mockClear();

      resolveComplete(rawText);
      await submitPromise;

      expect(stateSyncMock.commitLayoutFromLlm).not.toHaveBeenCalled();
      expect(chatStateMock.chatHistory()).toEqual([]);
      expect(service.pipelineStatus()).toBe(PipelineStatus.IDLE);
    });

    it('does not append error or cancelled message to new session when cancelled stream rejects after startNewSession, and preserves new stream reference', async () => {
      let rejectFirstStream!: (err: unknown) => void;
      const firstCancel = vi.fn();

      llmClientMock.chatStream = vi
        .fn()
        .mockImplementationOnce(async (): Promise<LlmStreamResponse> => {
          const complete = new Promise<string>((_, reject) => {
            rejectFirstStream = reject;
          });
          complete.catch(() => {});
          const contentStream: AsyncIterable<LlmResponse> = {
            [Symbol.asyncIterator]() {
              return {
                async next() {
                  await complete;
                  return {value: undefined, done: true};
                },
              };
            },
          };
          return {contentStream, complete, cancel: firstCancel};
        });

      const firstPromise = service.submitPrompt('First prompt');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Reset session while first prompt is in-flight
      service.startNewSession();
      expect(firstCancel).toHaveBeenCalledTimes(1);

      // Start a second prompt in the new session before firstPromise settles
      let rejectSecondStream!: (err: unknown) => void;
      const secondCancel = vi.fn(() => {
        const err = new Error('Cancelled');
        err.name = CANCEL_ERROR_NAME;
        rejectSecondStream(err);
      });
      llmClientMock.chatStream.mockImplementationOnce(async (): Promise<LlmStreamResponse> => {
        const complete = new Promise<string>((_, reject) => {
          rejectSecondStream = reject;
        });
        complete.catch(() => {});
        const contentStream: AsyncIterable<LlmResponse> = {
          [Symbol.asyncIterator]() {
            return {
              async next() {
                await complete;
                return {value: undefined, done: true};
              },
            };
          },
        };
        return {contentStream, complete, cancel: secondCancel};
      });

      const secondPromise = service.submitPrompt('Second prompt');
      await new Promise(resolve => setTimeout(resolve, 10));

      // Now reject the first stream with an error; its catch & finally must NOT clobber the second stream
      rejectFirstStream(new Error('Network failure from old session'));
      await firstPromise;

      expect(chatStateMock.chatHistory().some(msg => msg.role === MessageRole.ERROR)).toBe(false);
      expect(service.isProgrammaticStreamActive()).toBe(true);

      // Second stream should still be cancellable via cancelActiveStream()
      service.cancelActiveStream();
      await secondPromise;
      expect(secondCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Failed Turn Context Exclusion', () => {
    it('excludes failed user prompt turns and their attachments from LLM context on retry while preserving them in chatHistory', async () => {
      const screenshotAttachment = {
        name: 'screenshot.png',
        mimeType: 'image/png',
        data: 'base64-image-data',
      };
      llmClientMock.chatStream.mockRejectedValueOnce(new Error('HTTP 503 Service Unavailable'));

      await service.submitPrompt('Build this complex dashboard', [screenshotAttachment]);

      const historyAfterFailure = chatStateMock.chatHistory();
      expect(historyAfterFailure).toHaveLength(2);
      expect(historyAfterFailure[0].role).toBe(MessageRole.USER);
      expect(historyAfterFailure[1].role).toBe(MessageRole.ERROR);
      const failedPromptId = historyAfterFailure[0].promptId;
      expect(failedPromptId).toBeDefined();

      // Restore working stream for retry
      const validResponse =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n';
      llmClientMock.chatStream.mockResolvedValueOnce({
        contentStream: createMockStream([validResponse]),
        complete: Promise.resolve(validResponse),
      });

      await service.submitPrompt('Build this complex dashboard', [screenshotAttachment], {
        retryOfPromptId: failedPromptId,
      });

      const retryMessages = llmClientMock.chatStream.mock.calls[1][0];
      const userMessagesSentToLlm = retryMessages.filter(m => m.role === MessageRole.USER);
      expect(userMessagesSentToLlm).toHaveLength(1);
      expect(userMessagesSentToLlm[0].content).toBe('Build this complex dashboard');
      expect(userMessagesSentToLlm[0].promptId).not.toBe(failedPromptId);

      // UI chatHistory still retains the failed user turn and error message
      expect(chatStateMock.chatHistory().some(m => m.role === MessageRole.ERROR)).toBe(true);
      expect(
        chatStateMock
          .chatHistory()
          .filter(m => m.role === MessageRole.USER && m.content === 'Build this complex dashboard'),
      ).toHaveLength(2);
    });

    it('preserves a succeeded retry that reuses promptId in getFullMessageContext() on subsequent follow-up turns', async () => {
      llmClientMock.chatStream.mockRejectedValueOnce(new Error('HTTP 503 Service Unavailable'));
      await service.submitPrompt('Build a profile card', [], {promptId: 'reused-prompt-id'});

      const validResponse =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n';
      llmClientMock.chatStream.mockResolvedValue({
        contentStream: createMockStream([validResponse]),
        complete: Promise.resolve(validResponse),
      });

      // Retry reusing the same promptId and succeed
      await service.submitPrompt('Build a profile card', [], {
        promptId: 'reused-prompt-id',
        retryOfPromptId: 'reused-prompt-id',
      });

      // Submit a subsequent follow-up turn
      await service.submitPrompt('Now add an avatar', [], {promptId: 'followup-prompt-id'});

      const followupMessages = llmClientMock.chatStream.mock.calls[2][0];
      const userMessages = followupMessages.filter(m => m.role === MessageRole.USER);
      expect(userMessages.map(m => m.content)).toEqual([
        'Build a profile card',
        'Now add an avatar',
      ]);
    });

    it('excludes cancelled turns (*You stopped this response.*) and their preceding user messages/attachments from subsequent LLM requests', async () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'basic',
        components: {Text: {}},
      });
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content: '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
        },
        {
          role: MessageRole.USER,
          content: 'Cancelled image prompt',
          promptId: 'cancelled-id',
          attachments: [{name: 'screenshot.png', mimeType: 'image/png', data: 'base64'}],
        },
        {role: MessageRole.MODEL, content: '*You stopped this response.*'},
      ]);

      await service.submitPrompt('Text-only follow-up after cancel');

      const sentMessages = llmClientMock.chatStream.mock.calls[0][0];
      expect(sentMessages[0].role).toBe(MessageRole.SYSTEM);
      // Since the cancelled turn with the image attachment was excluded, multimodal guidelines should be omitted
      expect(sentMessages[0].content).not.toContain('## Multimodal & Image-to-UI Guidelines');
      expect(sentMessages.some(m => m.content === '*You stopped this response.*')).toBe(false);
      expect(sentMessages.some(m => m.content === 'Cancelled image prompt')).toBe(false);
      expect(sentMessages.filter(m => m.role === MessageRole.USER).map(m => m.content)).toEqual([
        '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
        'Text-only follow-up after cancel',
      ]);
    });

    it('excludes un-tagged failed user messages immediately preceding an error while preserving layout snapshots', () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content: '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
          isSnapshot: true,
        },
        {role: MessageRole.USER, content: 'Failed prompt without promptId'},
        {role: MessageRole.ERROR, content: 'Service unavailable'},
        {role: MessageRole.USER, content: 'Successful followup', promptId: 'valid-id'},
      ]);

      const context = service.getFullMessageContext();
      const userContents = context.filter(m => m.role === MessageRole.USER).map(m => m.content);
      expect(userContents).toEqual([
        '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
        'Successful followup',
      ]);
    });

    it('preserves an earlier succeeded turn when a later retry reusing the same promptId fails', async () => {
      const validResponse =
        '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "basic"}}\n';
      llmClientMock.chatStream.mockResolvedValueOnce({
        contentStream: createMockStream([validResponse]),
        complete: Promise.resolve(validResponse),
      });

      // Turn 1 succeeds with promptId 'p1'
      await service.submitPrompt('Initial succeeded prompt', [], {promptId: 'p1'});

      // Turn 2 reuses promptId 'p1' and fails
      llmClientMock.chatStream.mockRejectedValueOnce(new Error('HTTP 503 Service Unavailable'));
      await service.submitPrompt('Retried prompt that fails', [], {
        promptId: 'p1',
        retryOfPromptId: 'p1',
      });

      const context = service.getFullMessageContext();
      const nonSystem = context.filter(m => m.role !== MessageRole.SYSTEM);
      expect(nonSystem.map(m => ({role: m.role, content: m.content}))).toEqual([
        {role: MessageRole.USER, content: 'Initial succeeded prompt'},
        {
          role: MessageRole.MODEL,
          content: '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
        },
      ]);
    });

    it('excludes MODEL turns with parseError and their preceding USER prompt and image attachments from context and systemPrompt()', async () => {
      catalogManagementMock.activeCatalog.set({
        catalogId: 'basic',
        components: {Text: {}},
      });
      const unparseableRawText = '<thinking>bad</thinking>\n{"version": "v';
      llmClientMock.chatStream.mockResolvedValueOnce({
        contentStream: createMockStream([unparseableRawText]),
        complete: Promise.resolve(unparseableRawText),
      });

      await service.submitPrompt('Broken image prompt', [
        {name: 'screenshot.png', mimeType: 'image/png', data: 'base64'},
      ]);

      const context = service.getFullMessageContext();
      expect(context).toHaveLength(1);
      expect(context[0].role).toBe(MessageRole.SYSTEM);
      expect(context[0].content).not.toContain('## Multimodal & Image-to-UI Guidelines');
      expect(service.systemPrompt()).not.toContain('## Multimodal & Image-to-UI Guidelines');
    });

    it('excludes a cancelled user prompt even when the prompt text contains an A2UI JSON snippet', () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content:
            'Please fix this layout:\n```json\n[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]\n```',
          promptId: 'cancelled-json-prompt',
        },
        {
          role: MessageRole.MODEL,
          content: '*You stopped this response.*',
          isCancelled: true,
          promptId: 'cancelled-json-prompt',
        },
        {
          role: MessageRole.USER,
          content: 'Fresh prompt',
          promptId: 'fresh-prompt',
        },
      ]);

      const context = service.getFullMessageContext();
      const userMessages = context.filter(m => m.role === MessageRole.USER);
      expect(userMessages.map(m => m.content)).toEqual(['Fresh prompt']);
    });

    it('deduplicates consecutive layout snapshots left adjacent after stripping an intervening failed turn', () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content: '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
          isSnapshot: true,
        },
        {
          role: MessageRole.USER,
          content: 'Failed prompt between snapshots',
          promptId: 'failed-p1',
        },
        {
          role: MessageRole.ERROR,
          content: '503 Service Unavailable',
          promptId: 'failed-p1',
        },
        {
          role: MessageRole.USER,
          content: '[{"version":"v0.9","createSurface":{"surfaceId":"s2","catalogId":"basic"}}]',
          isSnapshot: true,
        },
        {
          role: MessageRole.USER,
          content: 'Follow-up prompt',
          promptId: 'valid-p2',
        },
      ]);

      const context = service.getFullMessageContext();
      const userMessages = context.filter(m => m.role === MessageRole.USER);
      expect(userMessages.map(m => m.content)).toEqual([
        '[{"version":"v0.9","createSurface":{"surfaceId":"s2","catalogId":"basic"}}]',
        'Follow-up prompt',
      ]);
    });

    it('updates the matching MODEL placeholder by promptId when a USER layout snapshot is appended mid-stream', async () => {
      let resolveStream!: (val: string) => void;
      const streamPromise = new Promise<string>(resolve => {
        resolveStream = resolve;
      });
      async function* delayedGenerator() {
        const chunk = await streamPromise;
        yield chunk;
      }
      llmClientMock.chatStream.mockResolvedValueOnce({
        contentStream: delayedGenerator(),
        complete: streamPromise,
      });

      const submitPromise = service.submitPrompt('Prompt with mid-stream snapshot', [], {
        promptId: 'turn-mid-snap',
      });

      const historyDuringStream = chatStateMock.chatHistory();
      expect(historyDuringStream[0]).toEqual(
        expect.objectContaining({
          role: MessageRole.USER,
          content: 'Prompt with mid-stream snapshot',
          isSnapshot: false,
          promptId: 'turn-mid-snap',
        }),
      );

      // Simulate a USER layout snapshot appended after the MODEL placeholder while stream is active
      chatStateMock.updateChatHistory(h => [
        ...h,
        {
          role: MessageRole.USER,
          content:
            '[{"version":"v0.9","createSurface":{"surfaceId":"interleaved","catalogId":"basic"}}]',
          isSnapshot: true,
        },
      ]);

      const validResponse =
        '{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}';
      resolveStream(validResponse);
      await submitPromise;

      const historyAfterComplete = chatStateMock.chatHistory();
      const modelTurn = historyAfterComplete.find(
        m => m.role === MessageRole.MODEL && m.promptId === 'turn-mid-snap',
      );
      expect(modelTurn?.content).toBe(`[${validResponse}]`);
    });

    it('excludes a failed or cancelled USER prompt while preserving an interleaved USER layout snapshot', () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content: 'Failed prompt before snapshot',
          isSnapshot: false,
          promptId: 'p-failed',
        },
        {
          role: MessageRole.USER,
          content:
            '[{"version":"v0.9","createSurface":{"surfaceId":"kept-snap","catalogId":"basic"}}]',
          isSnapshot: true,
        },
        {
          role: MessageRole.ERROR,
          content: '503 Service Unavailable',
          promptId: 'p-failed',
        },
        {
          role: MessageRole.USER,
          content: 'Cancelled prompt before snapshot',
          isSnapshot: false,
          promptId: 'p-cancelled',
        },
        {
          role: MessageRole.USER,
          content:
            '[{"version":"v0.9","createSurface":{"surfaceId":"kept-snap-2","catalogId":"basic"}}]',
          isSnapshot: true,
        },
        {
          role: MessageRole.MODEL,
          content: '*You stopped this response.*',
          isCancelled: true,
          promptId: 'p-cancelled',
        },
        {
          role: MessageRole.USER,
          content: 'Active prompt',
          isSnapshot: false,
          promptId: 'p-active',
        },
      ]);

      const context = service.getFullMessageContext();
      const userMessages = context.filter(m => m.role === MessageRole.USER);
      expect(userMessages.map(m => m.content)).toEqual([
        '[{"version":"v0.9","createSurface":{"surfaceId":"kept-snap-2","catalogId":"basic"}}]',
        'Active prompt',
      ]);
    });

    it('appends a new ERROR bubble instead of overwriting an earlier completed MODEL turn with a different promptId when no matching MODEL placeholder exists', async () => {
      chatStateMock.setChatHistory([
        {
          role: MessageRole.USER,
          content: 'Earlier succeeded prompt',
          isSnapshot: false,
          promptId: 'earlier-turn',
        },
        {
          role: MessageRole.MODEL,
          content: '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
          promptId: 'earlier-turn',
        },
      ]);

      llmClientMock.chatStream.mockImplementationOnce(async () => {
        // Remove the newly appended 'later-turn' MODEL placeholder (and USER prompt) so the last
        // entry in chatHistory is the earlier completed MODEL turn with promptId 'earlier-turn'
        chatStateMock.updateChatHistory(h => h.filter(m => m.promptId !== 'later-turn'));
        throw new Error('HTTP 503 Service Unavailable');
      });

      await service.submitPrompt('Later failed prompt', [], {promptId: 'later-turn'});

      const history = chatStateMock.chatHistory();
      expect(history).toHaveLength(3);
      expect(history[1]).toEqual({
        role: MessageRole.MODEL,
        content: '[{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"basic"}}]',
        promptId: 'earlier-turn',
      });
      expect(history[2]).toEqual(
        expect.objectContaining({
          role: MessageRole.ERROR,
          promptId: 'later-turn',
          originalPrompt: 'Later failed prompt',
        }),
      );
    });
  });
});
