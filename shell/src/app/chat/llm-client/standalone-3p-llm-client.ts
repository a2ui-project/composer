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

import {Injectable, inject} from '@angular/core';
import {
  extractXmlThoughts,
  LlmClient,
  LlmMessage,
  LlmResponse,
  LlmStreamResponse,
  MessageRole,
  CANCEL_ERROR_NAME,
  StreamProcessingState,
  THINKING_BUDGET,
} from './llm-client';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {
  GoogleGenAI,
  Content,
  GenerateContentParameters,
  Part,
  GenerateContentConfig,
  GenerateContentResponse,
} from '@google/genai';

/**
 * Standard public endpoint authentication client utilizing user developer keys.
 * Implements a standalone third-party developer integration facade matching
 * LlmClient boundaries.
 * Constructor-injects dynamic settings contexts to initialize Gemini
 * handshakes securely under native Standalone Browser-Native environments.
 */
@Injectable({
  providedIn: 'root',
})
export class Standalone3pLlmClient extends LlmClient {
  /**
   * Dynamic context configurations tracking identity status, api keys, and
   * visual destinations.
   */
  private readonly config = inject(AppConfigProvider);

  /**
   * Helper function to extract system instructions and map conversational
   * entries into an alternating Google GenAI compatible history, robustly
   * combining consecutive message segments targeting the same semantic role.
   */
  private parseMessages(messages: LlmMessage[]): {
    systemInstruction?: string;
    contents: Content[];
  } {
    const systemMessages = messages.filter(m => m.role === MessageRole.SYSTEM);
    const systemInstruction =
      systemMessages.length > 0 ? systemMessages.map(m => m.content).join('\n') : undefined;

    const chatHistory = messages.filter(m => m.role !== MessageRole.SYSTEM);
    const contents: Content[] = [];

    for (const m of chatHistory) {
      const mappedRole = m.role === MessageRole.USER ? 'user' : 'model';
      const lastContent = contents[contents.length - 1];

      const parts: Part[] = [];
      if (m.attachments) {
        for (const att of m.attachments) {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
        }
      }
      if (m.content) {
        parts.push({text: m.content});
      }

      if (lastContent && lastContent.role === mappedRole) {
        if (!lastContent.parts) {
          lastContent.parts = [];
        }
        lastContent.parts.push(...parts);
      } else {
        if (parts.length === 0) {
          parts.push({text: ''});
        }
        contents.push({
          role: mappedRole,
          parts,
        });
      }
    }

    return {systemInstruction, contents};
  }

  /**
   * Generates a streamed, incremental response for the provided chat
   * history.
   */
  override async chatStream(messages: LlmMessage[]): Promise<LlmStreamResponse> {
    const apiKeyVal = this.config.geminiApiKey();

    const ai = new GoogleGenAI({
      apiKey: apiKeyVal,
    });

    const abortController = new AbortController();
    const params = this.buildGenerateContentParams(messages, abortController.signal);

    // Instantiate response generator stream eagerly
    const responseStream = await ai.models.generateContentStream(params);

    const buffer: LlmResponse[] = [];
    const state: StreamProcessingState = {
      accumulatedText: '',
      accumulatedRawText: '',
      emittedContentLength: 0,
      emittedThinkingLength: 0,
      isDone: false,
      streamError: null,
    };
    const listeners: (() => void)[] = [];

    let resolveComplete!: (val: string) => void;
    let rejectComplete!: (err: unknown) => void;
    const complete = new Promise<string>((resolve, reject) => {
      resolveComplete = resolve;
      rejectComplete = reject;
    });

    // Notify all active listeners of updates
    const notifyListeners = () => {
      while (listeners.length > 0) {
        const nextListener = listeners.shift();
        nextListener?.();
      }
    };

    // Eager background thread to pull chunks from standard SDK stream instantly
    void this.consumeStream(
      responseStream,
      state,
      buffer,
      notifyListeners,
      resolveComplete,
      rejectComplete,
    );

    // Independent pointer-safe AsyncIterable reader mapping
    const contentStream = this.createContentStream(buffer, state, listeners);

    return {
      contentStream,
      complete,
      cancel: () => {
        const cancelErr = new Error('Cancelled');
        cancelErr.name = CANCEL_ERROR_NAME;
        abortController.abort(cancelErr);
      },
    };
  }

  private buildGenerateContentConfig(
    systemInstruction?: string,
    abortSignal?: AbortSignal,
  ): GenerateContentConfig {
    const config: GenerateContentConfig = systemInstruction ? {systemInstruction} : {};
    if (abortSignal) {
      config.abortSignal = abortSignal;
    }
    config.thinkingConfig = {
      includeThoughts: true,
      thinkingBudget: THINKING_BUDGET,
    };
    return config;
  }

  private buildGenerateContentParams(
    messages: LlmMessage[],
    abortSignal: AbortSignal,
  ): GenerateContentParameters {
    const {systemInstruction, contents} = this.parseMessages(messages);
    const config = this.buildGenerateContentConfig(systemInstruction, abortSignal);
    return {
      model: 'gemini-3.5-flash',
      contents,
      config,
    };
  }

  private parseChunkParts(chunk: GenerateContentResponse): {
    chunkContent: string;
    nativeThoughtVal: string;
  } {
    let chunkContent = '';
    let nativeThoughtVal = '';
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.thought === true) {
          if (part.text) {
            nativeThoughtVal += part.text;
          }
        } else {
          if (part.text) {
            chunkContent += part.text;
          }
        }
      }
    } else {
      chunkContent = chunk.text || '';
    }
    return {chunkContent, nativeThoughtVal};
  }

  private async consumeStream(
    responseStream: AsyncIterable<GenerateContentResponse>,
    state: StreamProcessingState,
    buffer: LlmResponse[],
    notify: () => void,
    resolveComplete: (val: string) => void,
    rejectComplete: (err: unknown) => void,
  ): Promise<void> {
    try {
      for await (const chunk of responseStream) {
        const {chunkContent, nativeThoughtVal} = this.parseChunkParts(chunk);

        state.accumulatedRawText += chunkContent;

        const {cleanText, totalExtractedThinking} = extractXmlThoughts(state.accumulatedRawText);

        const contentVal = cleanText.slice(state.emittedContentLength);
        const tagThought = totalExtractedThinking.slice(state.emittedThinkingLength);
        const thoughtVal = nativeThoughtVal + tagThought;

        state.emittedContentLength = cleanText.length;
        state.emittedThinkingLength = totalExtractedThinking.length;

        state.accumulatedText += contentVal;

        buffer.push({content: contentVal, thinking: thoughtVal, isComplete: false});
        notify();
      }
      state.isDone = true;
      resolveComplete(state.accumulatedText);
      notify();
    } catch (err: unknown) {
      let finalErr = err;
      if (err && typeof err === 'object' && 'name' in err && err.name === CANCEL_ERROR_NAME) {
        finalErr = err;
      }

      if (
        finalErr &&
        typeof finalErr === 'object' &&
        'name' in finalErr &&
        finalErr.name === CANCEL_ERROR_NAME
      ) {
        state.isDone = true;
        state.streamError = finalErr;
        rejectComplete(finalErr);
        notify();
        return;
      }
      state.streamError = finalErr;
      rejectComplete(finalErr);
      notify();
    }
  }
}
