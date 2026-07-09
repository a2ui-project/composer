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
import {LlmClient, LlmMessage, LlmResponse, LlmStreamResponse, MessageRole} from './llm-client';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {GoogleGenAI, Content, GenerateContentParameters, Part} from '@google/genai';

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

      if (parts.length === 0) {
        parts.push({text: ''});
      }

      if (lastContent && lastContent.role === mappedRole) {
        if (!lastContent.parts) {
          lastContent.parts = [];
        }
        lastContent.parts.push(...parts);
      } else {
        contents.push({
          role: mappedRole,
          parts,
        });
      }
    }

    return {systemInstruction, contents};
  }

  /**
   * Generates a static conversational response for the provided chat history.
   * Dynamically constructs the GoogleGenAI network target matching active
   * configurations.
   *
   * @param messages The sequence of messages representing the turn history.
   * @returns A promise resolving to the completed response content envelope.
   */
  override async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const stream = await this.chatStream(messages);
    const content = await stream.complete;
    return {
      content,
    };
  }

  /**
   * Generates a streamed, incremental response for the provided chat
   * history.
   * Dynamically spawns a concurrent eager exhaust loop to buffer results,
   * returning pointer-safe replay streams.
   *
   * @param messages The sequence of messages representing the turn history.
   * @returns A promise resolving to an active stream response boundary
   *   interface.
   */
  override async chatStream(messages: LlmMessage[]): Promise<LlmStreamResponse> {
    const apiKeyVal = this.config.geminiApiKey();

    const ai = new GoogleGenAI({
      apiKey: apiKeyVal,
    });

    const {systemInstruction, contents} = this.parseMessages(messages);

    const params: GenerateContentParameters = {
      model: 'gemini-3.5-flash',
      contents,
      config: systemInstruction ? {systemInstruction} : undefined,
    };

    // Instantiate response generator stream eagerly
    const responseStream = await ai.models.generateContentStream(params);

    const buffer: string[] = [];
    let accumulatedText = '';
    let isDone = false;
    let streamError: unknown = null;
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
    void (async () => {
      try {
        for await (const chunk of responseStream) {
          const textVal = chunk.text || '';
          accumulatedText += textVal;
          buffer.push(textVal); // Always preserve history in full replay buffer!
          notifyListeners();
        }
        isDone = true;
        resolveComplete(accumulatedText);
        notifyListeners();
      } catch (err) {
        streamError = err;
        rejectComplete(err);
        notifyListeners();
      }
    })();

    // Independent pointer-safe AsyncIterable reader mapping
    const contentStream: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        let localBufferIndex = 0;
        return {
          async next(): Promise<IteratorResult<string>> {
            // Wait in-loop while buffer is exhausted and stream is active/errored
            while (localBufferIndex >= buffer.length && !isDone && !streamError) {
              await new Promise<void>((resolve, reject) => {
                listeners.push(() => {
                  if (streamError) {
                    reject(streamError);
                  } else {
                    resolve();
                  }
                });
              });
            }

            // Throw connection exceptions immediately upon exhausting successful yields
            if (localBufferIndex >= buffer.length && streamError) {
              throw streamError;
            }

            // Yield buffered chunks
            if (localBufferIndex < buffer.length) {
              const value = buffer[localBufferIndex];
              localBufferIndex++;
              return {value, done: false};
            }

            return {value: undefined, done: true};
          },
        };
      },
    };

    return {
      contentStream,
      complete,
    };
  }
}
