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

/**
 * Defines the semantic roles for conversational message segments.
 * This categorizes the originator or context of chat communication.
 */
export enum MessageRole {
  /** The orchestrator or boundary level system instructions. */
  SYSTEM = 'system',
  /** The human user providing prompts. */
  USER = 'user',
  /** The generative model responding to inputs. */
  MODEL = 'model',
  /** Gateway diagnostic or API connection exceptions logs. */
  ERROR = 'error',
}

export declare interface Attachment {
  readonly name: string;
  readonly mimeType: string;
  readonly data: string; // base64 string
}

/**
 * Represents an individual conversational message segment exchanged in a chat
 * context. Serves as the primary turn record container passing communication
 * boundaries.
 */
export declare interface LlmMessage {
  /**
   * The semantic role of the message originator (e.g. system, user, model).
   * Restricts boundary to system, user, or model origin context.
   */
  readonly role: MessageRole;

  /**
   * The text payload content or instructions contained in this conversational
   * segment turn.
   */
  readonly content: string;

  /** Holds the optional attachment files context. */
  readonly attachments?: Attachment[];

  /** Holds the optional model thinking or thought process. */
  readonly thinking?: string;

  /** Unique identifier for correlating prompts and retries. */
  readonly promptId?: string;

  /** Indicates whether a failed gateway transaction is retryable. */
  readonly isRetryable?: boolean;

  /** Holds the original prompt text payload to re-dispatch upon retry. */
  readonly originalPrompt?: string;

  /** Optional semantic title for error messages. */
  readonly errorTitle?: string;

  /** Optional user-facing short message for error messages. */
  readonly errorMessage?: string;

  /** Optional technical details (e.g. stack trace) for error messages. */
  readonly errorDetails?: string;

  /** Optional user-facing actionable tip for error messages. */
  readonly errorTip?: string;
}

/**
 * Captures static, fully generated conversational completions returned by
 * generative model operations. Used primarily in synchronous or
 * non-incremental user flow layouts.
 */
export interface LlmResponse {
  /**
   * The final complete layout accumulated text content returned by the target
   * LLM client.
   */
  readonly content: string;

  /**
   * Optional final accumulated thought process.
   */
  readonly thinking?: string;

  /**
   * True if this represents the complete response rather than a partial chunk.
   */
  readonly isComplete?: boolean;
}

export const CANCEL_ERROR_NAME = 'CancelError';

/**
 * Represents dynamic, real-time incremental tokens compiled asynchronously.
 * Orchestrates rendering pipelines to dynamically resolve layout turns while
 * reducing operational latency.
 */
export interface LlmStreamResponse {
  /**
   * An asynchronous iterable stream yielding chunked text fragments as they
   * arrive from the platform pipeline.
   */
  readonly contentStream: AsyncIterable<LlmResponse>;

  /**
   * A promise that resolves to the final accumulated sequence, ensuring
   * downstream processes can synchronize operations upon generator depletion.
   */
  readonly complete: Promise<string>;

  /**
   * Optional cancel function to terminate the stream early.
   */
  readonly cancel?: () => void;
}

/**
 * Default token budget allocated for model reasoning and thought process
 * generation.
 */
export const THINKING_BUDGET = 1024;

/**
 * Tracks mutable accumulation state and lifecycle status during response stream
 * processing.
 */
export interface StreamProcessingState {
  /** Filtered text content accumulated so far, excluding XML thought tags. */
  accumulatedText: string;
  /**
   * Full raw text stream received from the backend, including embedded tags.
   */
  accumulatedRawText: string;
  /** Character length of content already yielded downstream. */
  emittedContentLength: number;
  /** Character length of thinking text already yielded downstream. */
  emittedThinkingLength: number;
  /** Indicates whether the underlying stream completed successfully. */
  isDone: boolean;
  /** Holds any error encountered during stream transmission. */
  streamError: unknown;
}

/**
 * Holds extracted model thinking alongside the cleaned conversational text
 * payload.
 */
export interface ExtractedXmlThoughts {
  /** The sanitized text content with XML thought tags removed. */
  readonly cleanText: string;
  /** The accumulated reasoning text extracted from within thought tags. */
  readonly totalExtractedThinking: string;
}

/**
 * Facade contract token representing boundary client capability endpoints.
 * Serves as the dynamic Angular DI injection boundary token mapping
 * conversational facades. Decouples the visual shell package from physical
 * network layers or specific 3P providers, shielding layout logic and
 * preventing direct reliance on raw external library dependencies.
 */
export abstract class LlmClient {
  /**
   * Dispatches conversational turns synchronously, compiling static model
   * completions.
   *
   * @param messages The accumulated sequence of messages representing the turn
   *   history.
   * @return A promise resolving to the final complete model response segment.
   */
  async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const stream = await this.chatStream(messages);
    const content = await stream.complete;
    // We don't get the combined thinking easily back from stream.complete
    // unless we change complete type, but chat is rarely used directly for full
    // text. We can just return content.
    return {
      content,
      isComplete: true,
    };
  }

  /**
   * Dispatches conversational turns in-stream, providing chunked generative
   * segments.
   *
   * @param messages The accumulated sequence of messages representing the turn
   *   history.
   * @return A promise resolving to an active stream response boundary
   *   interface.
   */
  abstract chatStream(messages: LlmMessage[]): Promise<LlmStreamResponse>;

  /**
   * Extracts and removes XML-like thought tags (`<thought>`, `<thinking>`,
   * `<reasoning>`) from raw streaming text.
   *
   * @param accumulatedRawText The raw stream string containing potential thought
   *     tags.
   * @return An object containing the sanitized clean text and extracted thoughts.
   */
  protected extractXmlThoughts(accumulatedRawText: string): ExtractedXmlThoughts {
    let totalExtractedThinking = '';
    const cleanText = accumulatedRawText.replace(
      /<(thought|thinking|reasoning)>([\s\S]*?)(?:<\/\1>|$)/gi,
      (_, _tag, innerText) => {
        totalExtractedThinking += innerText;
        return '';
      },
    );
    return {cleanText, totalExtractedThinking};
  }

  /**
   * Creates an asynchronous iterable stream from a buffered queue of responses.
   *
   * Resolves new chunks as they are pushed to the buffer, yields them in order,
   * and handles termination or error conditions signaled by the shared state.
   *
   * @param buffer The FIFO queue of accumulated LLM responses awaiting
   * consumption.
   * @param state The shared state monitoring completion and error status.
   * @param listeners An array of callback listeners notified when buffer or
   *     state
   * updates occur.
   * @return An asynchronous iterable stream yielding `LlmResponse` objects.
   */
  protected createContentStream(
    buffer: LlmResponse[],
    state: StreamProcessingState,
    listeners: Array<() => void>,
  ): AsyncIterable<LlmResponse> {
    return {
      [Symbol.asyncIterator](): AsyncIterator<LlmResponse> {
        let localBufferIndex = 0;
        return {
          async next(): Promise<IteratorResult<LlmResponse>> {
            // Wait in-loop while buffer is exhausted and stream is
            // active/errored
            while (localBufferIndex >= buffer.length && !state.isDone && !state.streamError) {
              await new Promise<void>((resolve, reject) => {
                listeners.push(() => {
                  if (state.streamError) {
                    reject(state.streamError);
                  } else {
                    resolve();
                  }
                });
              });
            }

            // Throw connection exceptions immediately upon exhausting
            // successful yields
            if (localBufferIndex >= buffer.length && state.streamError) {
              throw state.streamError;
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
  }
}
