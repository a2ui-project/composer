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
import {A2uiGenerationService} from './a2ui-generation.service';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {StateSync} from '../../chat/state-sync/state-sync';
import {
  LlmClient,
  LlmMessage,
  LlmResponse,
  LlmStreamResponse,
  MessageRole,
  CANCEL_ERROR_NAME,
} from '../../chat/llm-client/llm-client';
import {PipelineStatus} from '../../chat/pipeline-status/pipeline-status';

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>(null);
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

/** Builds a resolved streaming response from a single final payload string. */
function streamOf(payload: string): LlmStreamResponse {
  return {
    contentStream: createMockStream([payload]),
    complete: Promise.resolve(payload),
  };
}

/** A stream whose chunks may carry `thinking` deltas alongside content. */
async function* createThinkingStream(
  chunks: Array<{content?: string; thinking?: string}>,
): AsyncIterable<LlmResponse> {
  for (const chunk of chunks) {
    yield {content: chunk.content ?? '', thinking: chunk.thinking};
  }
}

class MockLlmClient {
  chat = vi.fn();
  chatStream = vi.fn(async (): Promise<LlmStreamResponse> => streamOf(''));
}

const VALID_THREE_LINE_PAYLOAD =
  '{"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}\n' +
  '{"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [{"id": "root", "component": "MaterialText", "text": {"path": "/message"}}]}}\n' +
  '{"version": "v0.9", "updateDataModel": {"surfaceId": "main", "value": {"message": "Hello, world!"}}}';

const USER_MESSAGES: LlmMessage[] = [
  {role: MessageRole.SYSTEM, content: 'system prompt'},
  {role: MessageRole.USER, content: 'Create a greeting screen'},
];

describe('A2uiGenerationService', () => {
  let service: A2uiGenerationService;
  let chatStateMock: MockChatState;
  let catalogManagementMock: MockCatalogManagement;
  let stateSyncMock: MockStateSync;
  let llmClientMock: MockLlmClient;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        A2uiGenerationService,
        {provide: ChatState, useClass: MockChatState},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: StateSync, useClass: MockStateSync},
        {provide: LlmClient, useClass: MockLlmClient},
      ],
    });

    service = TestBed.inject(A2uiGenerationService);
    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    catalogManagementMock = TestBed.inject(CatalogManagement) as unknown as MockCatalogManagement;
    stateSyncMock = TestBed.inject(StateSync) as unknown as MockStateSync;
    llmClientMock = TestBed.inject(LlmClient) as unknown as MockLlmClient;
  });

  it('generates and commits a valid three-line A2UI payload with no heals', async () => {
    llmClientMock.chatStream = vi.fn(async () => streamOf(VALID_THREE_LINE_PAYLOAD));

    const result = await service.generate(USER_MESSAGES);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok result');

    expect(result.heals).toEqual([]);
    expect(result.blocks.length).toBe(3);

    // Layout committed once, with the formatted parsed blocks.
    expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalledTimes(1);
    const committed = stateSyncMock.commitLayoutFromLlm.mock.calls[0][0];
    expect(committed).toBe(result.layoutText);

    const parsed = JSON.parse(committed);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].createSurface.surfaceId).toBe('main');
    expect(parsed[1].updateComponents.components[0].component).toBe('MaterialText');
    expect(parsed[2].updateDataModel.value.message).toBe('Hello, world!');

    // Pipeline reaches READY and releases the lock.
    expect(chatStateMock.pipelineStatus()).toBe(PipelineStatus.READY);
    expect(chatStateMock.isProgrammaticStreamActive()).toBe(false);
  });

  it('heals a synonym/mis-cased component name and reports the correction', async () => {
    const payload =
      '{"version": "v0.9", "createSurface": {"surfaceId": "s1", "catalogId": "test"}}\n' +
      '{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id": "c1", "component": "textbox"}]}}';
    llmClientMock.chatStream = vi.fn(async () => streamOf(payload));

    catalogManagementMock.activeCatalog.set({
      catalogId: 'test',
      components: {
        TextField: {},
      },
    });

    const result = await service.generate(USER_MESSAGES);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected ok result');

    // The synonym "textbox" is corrected to the catalog's "TextField".
    expect(result.heals).toEqual([{from: 'textbox', to: 'TextField'}]);

    const parsed = JSON.parse(stateSyncMock.commitLayoutFromLlm.mock.calls[0][0]);
    expect(parsed[1].updateComponents.components[0].component).toBe('TextField');
  });

  it('returns a validation failure result and does not commit for an invalid payload', async () => {
    // Missing the mandatory top-level "version" field fails envelope validation.
    const invalidPayload = '{"createSurface": {"surfaceId": "s1", "catalogId": "basic"}}';
    llmClientMock.chatStream = vi.fn(async () => streamOf(invalidPayload));

    const result = await service.generate(USER_MESSAGES);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure result');

    expect(result.title).toBe('Validation Failure');
    expect(result.message).toBe('The generated layout contains invalid components or structure.');
    // Retryable because the message context carried a user prompt.
    expect(result.retryable).toBe(true);

    // Nothing committed on a failed generation; pipeline marked FAILED.
    expect(stateSyncMock.commitLayoutFromLlm).not.toHaveBeenCalled();
    expect(chatStateMock.pipelineStatus()).toBe(PipelineStatus.FAILED);
    expect(chatStateMock.isProgrammaticStreamActive()).toBe(false);
  });

  it('forwards the model thinking deltas to the onThinking callback', async () => {
    llmClientMock.chatStream = vi.fn(async () => ({
      contentStream: createThinkingStream([
        {thinking: 'First I '},
        {thinking: 'plan the layout.'},
        {content: 'streamed-content-with-no-thinking'},
      ]),
      complete: Promise.resolve(VALID_THREE_LINE_PAYLOAD),
    }));

    const deltas: string[] = [];
    let lastAccumulated = '';
    const result = await service.generate(USER_MESSAGES, {
      onThinking: (delta, accumulated) => {
        deltas.push(delta);
        lastAccumulated = accumulated;
      },
    });

    // Only chunks carrying `thinking` fire the callback; content-only chunks don't.
    expect(deltas).toEqual(['First I ', 'plan the layout.']);
    expect(lastAccumulated).toBe('First I plan the layout.');
    // The final layout still comes from `complete`, not the streamed chunks.
    expect(result.ok).toBe(true);
    expect(stateSyncMock.commitLayoutFromLlm).toHaveBeenCalledTimes(1);
  });

  it('cancels an active stream and resolves without committing', async () => {
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
            return {value: undefined, done: true};
          },
        };
      },
    };

    llmClientMock.chatStream = vi.fn(async () => ({
      contentStream,
      complete: completePromise,
      cancel: mockCancel,
    }));

    const generatePromise = service.generate(USER_MESSAGES);

    // Let the stream setup run.
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(chatStateMock.pipelineStatus()).toBe(PipelineStatus.RECEIVING_STREAM);
    expect(chatStateMock.isProgrammaticStreamActive()).toBe(true);

    service.cancel();

    const result = await generatePromise;

    expect(mockCancel).toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(stateSyncMock.commitLayoutFromLlm).not.toHaveBeenCalled();
    expect(chatStateMock.pipelineStatus()).toBe(PipelineStatus.IDLE);
    expect(chatStateMock.isProgrammaticStreamActive()).toBe(false);
  });
});
