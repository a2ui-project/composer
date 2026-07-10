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
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {LlmClient, LlmMessage} from './llm-client';
import {Standalone3pLlmClient} from './standalone-3p-llm-client';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {MessageRole} from './llm-client';
import {
  EnvMode,
  AuthType,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {appConfig} from '../../app.config';

// TS Types matching official GenAI SDK (ensures zero 'any' type escapes)
interface MockGenAiConfig {
  apiKey: string;
  vertexai: boolean;
  httpOptions?: {baseUrl: string};
}

interface MockPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface MockContent {
  role: 'user' | 'model';
  parts: MockPart[];
}

interface MockGenerateContentConfig {
  systemInstruction?: string;
}

interface MockGenerateContentParameters {
  model: string;
  contents: MockContent[];
  config?: MockGenerateContentConfig;
}

interface MockGenerateContentResponse {
  text: string;
}

const mockConstructor = vi.fn<(config: MockGenAiConfig) => void>();
const mockGenerateContent =
  vi.fn<(params: MockGenerateContentParameters) => Promise<MockGenerateContentResponse>>();
const mockGenerateContentStream =
  vi.fn<
    (params: MockGenerateContentParameters) => Promise<AsyncIterable<MockGenerateContentResponse>>
  >();

// Unified mock module mapping
vi.mock('@google/genai', () => {
  class MockGoogleGenAI {
    readonly options: MockGenAiConfig;
    readonly models = {
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream,
    };

    constructor(options: MockGenAiConfig) {
      this.options = options;
      mockConstructor(options);
    }
  }

  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

/**
 * Robust compiler-verified mock configuration provider strictly extending the
 * physical contract facade. Ensures compatibility under Standalone contexts
 * without structural drifts.
 */
class MockAppConfigProvider extends AppConfigProvider {
  override readonly envMode = signal<EnvMode>(EnvMode.STANDALONE);
  override readonly authType = signal<AuthType>(AuthType.THREE_PARTY);
  override readonly rendererUrl = signal<string>('http://mock-renderer.com');
  override readonly geminiApiKey = signal<string>('mock-key-123');
  override readonly themePreference = signal<ThemePreference>('light');
  override readonly includeScreenshot = signal<boolean>(true);

  override setRendererUrl(url: string): void {}
  override setGeminiApiKey(key: string): void {}
  override setForcedAuthMode(mode: AuthType): void {}
  override setThemePreference(theme: ThemePreference): void {
    this.themePreference.set(theme);
  }
  override setIncludeScreenshot(include: boolean): void {
    this.includeScreenshot.set(include);
  }
  override flushConfig(): void {}
}

describe('LlmClient Facade and Standalone Provider Integration', () => {
  let client: LlmClient;
  let mockConfigProvider: MockAppConfigProvider;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        Standalone3pLlmClient,
        {
          provide: AppConfigProvider,
          useClass: MockAppConfigProvider,
        },
        {
          provide: LlmClient,
          useExisting: Standalone3pLlmClient,
        },
      ],
    });

    client = TestBed.inject(LlmClient);
    mockConfigProvider = TestBed.inject(AppConfigProvider) as MockAppConfigProvider;
  });

  // ---------------------------------------------------------
  // FACADE ARCHITECTURAL CONTRACT TESTS
  // ---------------------------------------------------------

  it('extends the abstract LlmClient facade boundary successfully', () => {
    expect(client).toBeInstanceOf(LlmClient);
  });

  it('resolves concrete LlmClient token to yield Standalone instance', () => {
    expect(client).toBeInstanceOf(Standalone3pLlmClient);
  });

  it('registers the dynamic DI provider mapping inside appConfig', () => {
    const targetProvider = appConfig.providers.find(
      provider =>
        typeof provider === 'object' &&
        provider !== null &&
        'provide' in provider &&
        provider.provide === LlmClient,
    );

    expect(targetProvider).toBeDefined();

    const castedProvider = targetProvider as {
      provide: typeof LlmClient;
      useExisting: typeof Standalone3pLlmClient;
    };

    expect(castedProvider.useExisting).toBe(Standalone3pLlmClient);
  });

  // ---------------------------------------------------------
  // DYNAMIC CONFIGURATION MAPPINGS
  // ---------------------------------------------------------

  describe('Dynamic SDK Initialization context resolution', () => {
    it('initializes GoogleGenAI constructor upon static chat', async () => {
      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield {text: 'Static Response mock'};
        },
      });

      const messages: LlmMessage[] = [{role: MessageRole.USER, content: 'Test prompt'}];
      await client.chat(messages);

      expect(mockConstructor).toHaveBeenCalledTimes(1);
      expect(mockConstructor).toHaveBeenLastCalledWith({
        apiKey: 'mock-key-123',
      });

      // Alter reactive configuration parameters
      mockConfigProvider.geminiApiKey.set('new-key-dynamic');
      mockConfigProvider.rendererUrl.set(''); // skips baseUrl mapping

      await client.chat(messages);

      expect(mockConstructor).toHaveBeenCalledTimes(2);
      expect(mockConstructor).toHaveBeenLastCalledWith({
        apiKey: 'new-key-dynamic',
      });
    });

    it('initializes GoogleGenAI constructor upon streaming', async () => {
      const mockChunksList: MockGenerateContentResponse[] = [{text: 'Done'}];
      const mockAsyncStream = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunksList) {
            yield chunk;
          }
        },
      };
      mockGenerateContentStream.mockResolvedValue(mockAsyncStream);

      const messages: LlmMessage[] = [{role: MessageRole.USER, content: 'Test stream'}];
      await client.chatStream(messages);

      expect(mockConstructor).toHaveBeenCalledTimes(1);
      expect(mockConstructor).toHaveBeenLastCalledWith({
        apiKey: 'mock-key-123',
      });
    });
  });

  // ---------------------------------------------------------
  // HISTORY CONSOLIDATION & ALTERNATING TURNS
  // ---------------------------------------------------------

  describe('Input LlmMessage Sequence turns mapper', () => {
    it(
      'consolidates system prompts to systemInstruction and alternates ' +
        'user/model contents accurately',
      async () => {
        mockGenerateContentStream.mockResolvedValue({
          async *[Symbol.asyncIterator]() {
            yield {text: 'Acknowledge'};
          },
        });

        const messages: LlmMessage[] = [
          {role: MessageRole.SYSTEM, content: 'Initial directive.'},
          {role: MessageRole.USER, content: 'User statement turn one.'},
          {role: MessageRole.SYSTEM, content: 'Secondary directive.'},
          {role: MessageRole.MODEL, content: 'Model explanation turn one.'},
          {role: MessageRole.USER, content: 'User clarification turn two.'},
        ];

        await client.chat(messages);

        expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
        const passedParams = mockGenerateContentStream.mock.calls[0][0];

        expect(passedParams.model).toBe('gemini-3.5-flash');

        // Assert system directives aggregate consolidation
        expect(passedParams.config).toBeDefined();
        expect(passedParams.config?.systemInstruction).toBe(
          'Initial directive.\nSecondary directive.',
        );

        // Assert alternating structure (ignoring system blocks)
        expect(passedParams.contents).toHaveLength(3);
        expect(passedParams.contents[0]).toEqual({
          role: 'user',
          parts: [{text: 'User statement turn one.'}],
        });
        expect(passedParams.contents[1]).toEqual({
          role: 'model',
          parts: [{text: 'Model explanation turn one.'}],
        });
        expect(passedParams.contents[2]).toEqual({
          role: 'user',
          parts: [{text: 'User clarification turn two.'}],
        });
      },
    );

    it('omits systemInstruction when no system message turns exist', async () => {
      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield {text: 'Acknowledge'};
        },
      });

      const messages: LlmMessage[] = [
        {role: MessageRole.USER, content: 'User text'},
        {role: MessageRole.MODEL, content: 'Model text'},
      ];

      await client.chat(messages);

      expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
      const passedParams = mockGenerateContentStream.mock.calls[0][0];
      expect(passedParams.config?.systemInstruction).toBeUndefined();
    });

    it('combines consecutive message segments targeting same role', async () => {
      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield {text: 'Combined response'};
        },
      });

      const messages: LlmMessage[] = [
        {role: MessageRole.USER, content: 'Turn 1 part A'},
        {role: MessageRole.USER, content: 'Turn 1 part B'},
        {role: MessageRole.MODEL, content: 'Response Part A'},
        {role: MessageRole.MODEL, content: 'Response Part B'},
        {role: MessageRole.USER, content: 'Final Turn'},
      ];

      await client.chat(messages);

      expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
      const passedParams = mockGenerateContentStream.mock.calls[0][0];

      expect(passedParams.contents).toHaveLength(3);
      expect(passedParams.contents[0]).toEqual({
        role: 'user',
        parts: [{text: 'Turn 1 part A'}, {text: 'Turn 1 part B'}],
      });
      expect(passedParams.contents[1]).toEqual({
        role: 'model',
        parts: [{text: 'Response Part A'}, {text: 'Response Part B'}],
      });
      expect(passedParams.contents[2]).toEqual({
        role: 'user',
        parts: [{text: 'Final Turn'}],
      });
    });

    it('supports attachments and maps them to inlineData parts', async () => {
      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield {text: 'Response with attachments'};
        },
      });

      const messages: LlmMessage[] = [
        {
          role: MessageRole.USER,
          content: 'Look at this file',
          attachments: [
            {
              name: 'test.png',
              mimeType: 'image/png',
              data: 'base64image...',
            },
          ],
        },
      ];

      await client.chat(messages);

      expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
      const passedParams = mockGenerateContentStream.mock.calls[0][0];

      expect(passedParams.contents).toHaveLength(1);
      expect(passedParams.contents[0]).toEqual({
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: 'base64image...',
            },
          },
          {text: 'Look at this file'},
        ],
      });
    });
  });

  // ---------------------------------------------------------
  // STATIC RESOLUTION TESTING
  // ---------------------------------------------------------

  describe('Generative Static Handshakes - chat()', () => {
    it('resolves concrete static payload text as LlmResponse', async () => {
      mockGenerateContentStream.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
          yield {text: 'Final response generated payload.'};
        },
      });

      const result = await client.chat([{role: MessageRole.USER, content: 'Generate content'}]);

      expect(result).toEqual({
        content: 'Final response generated payload.',
      });
    });

    it('catches static errors and bubbles normal failure envelopes', async () => {
      mockGenerateContentStream.mockRejectedValue(
        new Error('API_KEY_INVALID: Authorization failed.'),
      );

      const messages: LlmMessage[] = [{role: MessageRole.USER, content: 'Bad dispatch'}];
      await expect(client.chat(messages)).rejects.toThrow('API_KEY_INVALID: Authorization failed.');
    });
  });

  // ---------------------------------------------------------
  // EAGER REPLAYABLE STREAM PIPELINE
  // ---------------------------------------------------------

  describe('Generative Streaming Handshakes - chatStream()', () => {
    it('yields incremental raw chunks, yielding complete text sequentially', async () => {
      const mockChunksList: MockGenerateContentResponse[] = [
        {text: 'Starting'},
        {text: ' streaming '},
        {text: 'handshakes.'},
      ];

      const mockAsyncStream = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunksList) {
            yield chunk;
          }
        },
      };

      mockGenerateContentStream.mockResolvedValue(mockAsyncStream);

      const streamResponse = await client.chatStream([
        {role: MessageRole.USER, content: 'Begin stream now'},
      ]);

      expect(streamResponse.contentStream).toBeDefined();
      expect(streamResponse.complete).toBeDefined();

      const collectedChunks: string[] = [];
      for await (const chunk of streamResponse.contentStream) {
        collectedChunks.push(chunk);
      }

      expect(collectedChunks).toEqual(['Starting', ' streaming ', 'handshakes.']);

      const finalSynchronizerValue = await streamResponse.complete;
      expect(finalSynchronizerValue).toBe('Starting streaming handshakes.');
    });

    it('resolves dynamic streaming complete promise without consuming stream', async () => {
      const mockChunksList: MockGenerateContentResponse[] = [
        {text: 'Eager '},
        {text: 'exhaustion '},
        {text: 'check.'},
      ];

      const mockAsyncStream = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunksList) {
            yield chunk;
          }
        },
      };

      mockGenerateContentStream.mockResolvedValue(mockAsyncStream);

      const streamResponse = await client.chatStream([
        {role: MessageRole.USER, content: 'Trigger eager resolution'},
      ]);

      // Await complete promise directly without pulling chunks from stream
      const resolvedContent = await streamResponse.complete;
      expect(resolvedContent).toBe('Eager exhaustion check.');
    });

    it('allows multiple independent iterators to replay full chunk streams', async () => {
      const mockChunksList: MockGenerateContentResponse[] = [{text: 'Replay '}, {text: 'packet'}];

      const mockAsyncStream = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunksList) {
            yield chunk;
          }
        },
      };

      mockGenerateContentStream.mockResolvedValue(mockAsyncStream);

      const streamResponse = await client.chatStream([
        {role: MessageRole.USER, content: 'Replay checks'},
      ]);

      // Pull chunks from first reader iterator
      const collected1: string[] = [];
      for await (const chunk of streamResponse.contentStream) {
        collected1.push(chunk);
      }
      expect(collected1).toEqual(['Replay ', 'packet']);

      // Pull chunks from second subsequent reader iterator (replay check!)
      const collected2: string[] = [];
      for await (const chunk of streamResponse.contentStream) {
        collected2.push(chunk);
      }
      expect(collected2).toEqual(['Replay ', 'packet']);
    });

    it('supports multiple active iterators stepping in sync', async () => {
      let resolveChunk1!: (val: IteratorResult<MockGenerateContentResponse>) => void;
      let resolveChunk2!: (val: IteratorResult<MockGenerateContentResponse>) => void;

      const promiseChunk1 = new Promise<IteratorResult<MockGenerateContentResponse>>(resolve => {
        resolveChunk1 = resolve;
      });
      const promiseChunk2 = new Promise<IteratorResult<MockGenerateContentResponse>>(resolve => {
        resolveChunk2 = resolve;
      });

      const mockAsyncStream = {
        [Symbol.asyncIterator]() {
          let calls = 0;
          return {
            async next() {
              calls++;
              if (calls === 1) return promiseChunk1;
              if (calls === 2) return promiseChunk2;
              return {value: undefined, done: true};
            },
          };
        },
      };

      mockGenerateContentStream.mockResolvedValue(mockAsyncStream);

      const streamResponse = await client.chatStream([
        {role: MessageRole.USER, content: 'Concurrent active progress check'},
      ]);

      const iter1 = streamResponse.contentStream[Symbol.asyncIterator]();
      const iter2 = streamResponse.contentStream[Symbol.asyncIterator]();

      // Dispatch concurrent pulls
      const next1_p1 = iter1.next();
      const next2_p1 = iter2.next();

      // Trigger packet one delivery
      resolveChunk1({value: {text: 'A'}, done: false});

      const [res1_p1, res2_p1] = await Promise.all([next1_p1, next2_p1]);
      expect(res1_p1.value).toBe('A');
      expect(res2_p1.value).toBe('A');

      // Dispatch next concurrent pulls
      const next1_p2 = iter1.next();
      const next2_p2 = iter2.next();

      // Trigger packet two delivery
      resolveChunk2({value: {text: 'B'}, done: false});

      const [res1_p2, res2_p2] = await Promise.all([next1_p2, next2_p2]);
      expect(res1_p2.value).toBe('B');
      expect(res2_p2.value).toBe('B');
    });

    it('catches setups network failures and throws matches immediately', async () => {
      mockGenerateContentStream.mockRejectedValue(new Error('QUOTA_EXCEEDED: Resource exhausted.'));

      const messages: LlmMessage[] = [{role: MessageRole.USER, content: 'Over quota'}];
      await expect(client.chatStream(messages)).rejects.toThrow(
        'QUOTA_EXCEEDED: Resource exhausted.',
      );
    });

    it('propagates failures occurring in background loop to iterators', async () => {
      let failStream!: (err: Error) => void;
      const streamPromise = new Promise<IteratorResult<MockGenerateContentResponse>>(
        (_, reject) => {
          failStream = reject;
        },
      );

      const mockAsyncStream = {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              return streamPromise;
            },
          };
        },
      };
      mockGenerateContentStream.mockResolvedValue(mockAsyncStream);

      const streamResponse = await client.chatStream([
        {role: MessageRole.USER, content: 'Failure mid-transit check'},
      ]);

      const iterator = streamResponse.contentStream[Symbol.asyncIterator]();
      const nextPromise = iterator.next();

      // Inject server/transport failure mid-stream
      failStream(new Error('Network transport layer broke mid-packet.'));

      await expect(nextPromise).rejects.toThrow('Network transport layer broke mid-packet.');
      await expect(streamResponse.complete).rejects.toThrow(
        'Network transport layer broke mid-packet.',
      );
    });
  });
});
