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

export interface Attachment {
  readonly name: string;
  readonly mimeType: string;
  readonly data: string; // base64 string
}

/**
 * Represents an individual conversational message segment exchanged in a chat
 * context. Serves as the primary turn record container passing communication
 * boundaries.
 */
export interface LlmMessage {
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
}

export interface LlmStreamChunk {
  readonly content: string;
  readonly thinking?: string;
}

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
  readonly contentStream: AsyncIterable<LlmStreamChunk>;

  /**
   * A promise that resolves to the final accumulated sequence, ensuring
   * downstream processes can synchronize operations upon generator depletion.
   */
  readonly complete: Promise<string>;

  /**
   * Optional abort controller function to terminate the stream early.
   */
  readonly abort?: () => void;
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
   * @returns A promise resolving to the final complete model response segment.
   */
  abstract chat(messages: LlmMessage[]): Promise<LlmResponse>;

  /**
   * Dispatches conversational turns in-stream, providing chunked generative
   * segments.
   *
   * @param messages The accumulated sequence of messages representing the turn
   *   history.
   * @returns A promise resolving to an active stream response boundary
   *   interface.
   */
  abstract chatStream(messages: LlmMessage[]): Promise<LlmStreamResponse>;
}
