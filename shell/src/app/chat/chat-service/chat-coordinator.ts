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

import {Injectable, inject, effect, untracked} from '@angular/core';
import {formatJson} from '../../utils/json';
import {
  LlmMessage,
  LlmClient,
  MessageRole,
  Attachment,
  LlmStreamResponse,
  CANCEL_ERROR_NAME,
} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {StateSync} from '../state-sync/state-sync';
import {ChatState, LlmLogType} from '../chat-state/chat-state';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {PreviewBridgeMessageType, A2uiComponentInstance} from 'a2ui-bridge';
import {cleanErrorMessage, redactApiKey} from './error-utils';
import {A2uiGenerationService} from '../../copilotkit/a2ui-generation/a2ui-generation.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Dynamic chat panel coordinator managing the conversational chat-bubble UX
 * around A2UI generation. Owns the streamed chat history turns, the loading
 * pulse indicator, and gateway error bubbles, while delegating the headless
 * generation pipeline (system prompt, JSON healing, schema validation, catalog
 * healing, and error mapping) to the shared {@link A2uiGenerationService}.
 */
export class ChatCoordinator {
  private readonly generationService = inject(A2uiGenerationService);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly stateSync = inject(StateSync);
  private readonly chatState = inject(ChatState);
  private readonly llmClient = inject(LlmClient);

  /** Reactively mapped rendering pipeline execution milestones. */
  readonly pipelineStatus = this.chatState.pipelineStatus;

  /**
   * Public programmatic lock signal protecting against typing deadlocks
   * during streams.
   */
  readonly isProgrammaticStreamActive = this.chatState.isProgrammaticStreamActive;

  /**
   * A dynamic, reactive, computed signal property constructing conformed JSON
   * catalog schema specifications system instructions. Delegated to the shared
   * generation service so both chat and headless agent drivers share prompts.
   */
  readonly systemPrompt = this.generationService.systemPrompt;

  private lastSeenRendererUrl = '';
  private isFirstUrlEffectRun = true;

  constructor() {
    // Effect monitoring dynamic host preview configurations mapping cache
    // resets
    effect(() => {
      const url = this.configProvider.rendererUrl();
      untracked(() => {
        if (this.isFirstUrlEffectRun) {
          this.isFirstUrlEffectRun = false;
          this.lastSeenRendererUrl = url;
          return;
        }
        if (this.lastSeenRendererUrl !== url) {
          queueMicrotask(() => this.wipeEnvironmentCache());
        }
        this.lastSeenRendererUrl = url;
      });
    });
  }

  /**
   * Resets turns logs history, overlays milestones, and locks indicators.
   */
  wipeEnvironmentCache(): void {
    this.chatState.setChatHistory([]);
    this.chatState.setPipelineStatus(PipelineStatus.IDLE);
    this.chatState.setProgrammaticStreamActive(false);
    this.chatState.clearRawLlmHistory();
    this.stateSync.flushDraft();
  }

  /**
   * Constructs System instructions prepended message logs context.
   */
  getFullMessageContext(): LlmMessage[] {
    return [
      {
        role: MessageRole.SYSTEM,
        content: this.systemPrompt(),
      },
      ...this.chatState.chatHistory().filter(m => m.role !== MessageRole.ERROR),
    ];
  }

  private activeStreamResponse?: LlmStreamResponse;
  private isCancelRequested = false;

  /**
   * Cancels the currently active streaming request if there is one.
   */
  cancelActiveStream(): void {
    this.isCancelRequested = true;
    if (this.activeStreamResponse && this.activeStreamResponse.cancel) {
      this.activeStreamResponse.cancel();
    }
  }

  /**
   * Dispatches a fresh text instruction, triggers GenAI completions
   * in-stream, buffers packets, runs auto-repair healing and schema
   * validation blocks.
   */
  async submitPrompt(prompt: string, attachments: Attachment[] = []): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed && attachments.length === 0) return;

    // Lock UI controls and transition state indicators to receiving stream
    this.chatState.setProgrammaticStreamActive(true);
    this.chatState.setPipelineStatus(PipelineStatus.RECEIVING_STREAM);

    // Append user prompt text turn to chat history
    this.chatState.updateChatHistory(h => [
      ...h,
      {
        role: MessageRole.USER,
        content: trimmed,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    ]);

    // Construct system-prepended context matching conversational bounds
    const fullContext = this.getFullMessageContext();

    // Log the raw LLM request telemetry
    this.chatState.addRawLlmLog(LlmLogType.REQUEST, fullContext);

    // Push initial model turn placeholder with loading pulse indicator to history
    this.chatState.updateChatHistory(h => [
      ...h,
      {
        role: MessageRole.MODEL,
        content: ' ●●●',
      },
    ]);

    try {
      this.isCancelRequested = false;
      // Trigger streaming GenAI completions call using client facade
      const responseStream = await this.llmClient.chatStream(fullContext);

      // If a cancel was requested while the stream connection was establishing
      if (this.isCancelRequested) {
        if (responseStream.cancel) responseStream.cancel();
        const err = new Error('Cancelled');
        err.name = CANCEL_ERROR_NAME;
        throw err;
      }

      this.activeStreamResponse = responseStream;

      // Loop asynchronously over incoming stream packets to compile text
      let accumulatedRawText = '';
      let accumulatedThinking = '';
      for await (const chunk of responseStream.contentStream) {
        accumulatedRawText += chunk.content;
        if (chunk.thinking) {
          accumulatedThinking += chunk.thinking;
        }

        // Update history bubble in real-time with trailing pulse indicator
        this.chatState.updateChatHistory(history => {
          const updated = [...history];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === MessageRole.MODEL) {
            updated[lastIdx] = {
              role: MessageRole.MODEL,
              content: accumulatedRawText + ' ●●●',
              thinking: accumulatedThinking,
            };
          }
          return updated;
        });
      }

      // Stream exhausted, resolve final complete text and remove visual loading indicator
      const finalRawText = await responseStream.complete;

      // Log the raw LLM response telemetry
      this.chatState.addRawLlmLog(LlmLogType.RESPONSE, finalRawText);
      this.chatState.updateChatHistory(history => {
        const updated = [...history];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === MessageRole.MODEL) {
          updated[lastIdx] = {
            role: MessageRole.MODEL,
            content: finalRawText,
            thinking: accumulatedThinking,
          };
        }
        return updated;
      });

      this.chatState.setPipelineStatus(PipelineStatus.RECEIVED_RAW);
      await this.processRawLlmPayload(finalRawText);
    } catch (err: unknown) {
      // If it was cancelled, don't show an error. Just leave what was generated or remove the bubble.
      // But we probably want to just reset the UI lock.
      if (err && typeof err === 'object' && 'name' in err && err.name === CANCEL_ERROR_NAME) {
        this.chatState.setPipelineStatus(PipelineStatus.IDLE);
        this.chatState.setProgrammaticStreamActive(false);
        // Replace trailing pulse or partial JSON with stopped message, and force non-snapshot
        this.chatState.updateChatHistory(history => {
          const updated = [...history];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === MessageRole.MODEL) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: '*You stopped this response.*',
            };
          }
          return updated;
        });
      } else {
        this.handleConnectivityError(err, trimmed, attachments);
      }
    } finally {
      this.activeStreamResponse = undefined;
    }
  }

  /**
   * Post-processes, extracts, syntax heals, and validates raw JSON lines.
   * The parsing, healing, and catalog schema checks are delegated to the
   * shared {@link A2uiGenerationService}; this method retains the chat-panel
   * pipeline status transitions and layout commit.
   */
  private async processRawLlmPayload(rawText: string): Promise<void> {
    // Stage 1: Parse and Syntax Healing
    let parsedBlocks: unknown[] = [];
    try {
      parsedBlocks = this.generationService.parseAndHealJsonLines(rawText);
    } catch (err: unknown) {
      this.chatState.setPipelineStatus(PipelineStatus.FAILED);
      this.chatState.setProgrammaticStreamActive(false);
      throw err;
    }

    // Stage 2: Schema Validation
    this.chatState.setPipelineStatus(PipelineStatus.VALIDATING);
    try {
      // Verify basic schema envelopes using pre-existing CrossFrameValidator
      const mockEnvMsg = {
        type: PreviewBridgeMessageType.RENDER_A2UI,
        payload: parsedBlocks,
      };

      // Temporary override console.error to capture validation failures
      const originalConsoleError = console.error;
      const validationErrors: string[] = [];
      console.error = (...args: unknown[]) => {
        validationErrors.push(
          args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
        );
      };

      let isValidEnvelope = false;
      try {
        isValidEnvelope = CrossFrameValidator.validateOutgoingMessage(mockEnvMsg);
      } finally {
        console.error = originalConsoleError;
      }

      if (!isValidEnvelope) {
        throw new Error(
          `Outgoing message envelope validation failed:\n${validationErrors.join('\n')}`,
        );
      }

      // Catalog Component Schema Check & Name Typos Healing
      this.generationService.runCatalogComponentSchemaCheck(parsedBlocks);

      // Stage 3: Ready & Commit Layout Wipes
      this.chatState.setPipelineStatus(PipelineStatus.READY);

      // Turn list of updates back into raw formatted JSON text to write to
      // editor draft
      const finalLayoutText = formatJson(parsedBlocks);

      // Commit layout synchronously to editor viewport before releasing
      // lockout
      this.stateSync.commitLayoutFromLlm(finalLayoutText);

      // Release panel textareas lockout synchronously to avoid race
      // condition escapes
      this.chatState.setProgrammaticStreamActive(false);
    } catch (err: unknown) {
      this.chatState.setPipelineStatus(PipelineStatus.FAILED);
      this.chatState.setProgrammaticStreamActive(false);
      throw err;
    }
  }

  readonly TEST_ONLY = {
    sanitizeComponentObject: (obj: A2uiComponentInstance) =>
      this.generationService.sanitizeComponentObject(obj),
  };

  private handleConnectivityError(
    err: unknown,
    originalPrompt?: string,
    attachments: Attachment[] = [],
  ): void {
    const rawError = err instanceof Error ? err.message : String(err);
    const lowerMsg = rawError.toLowerCase();
    const cleanMsg = cleanErrorMessage(rawError);

    if (this.generationService.isConnectivityError(lowerMsg)) {
      this.chatState.setPipelineStatus(PipelineStatus.IDLE);
    } else {
      this.chatState.setPipelineStatus(PipelineStatus.FAILED);
    }
    this.chatState.setProgrammaticStreamActive(false);

    const parsed = this.generationService.parseError(lowerMsg, cleanMsg, originalPrompt);

    let exceptionDetails = '';
    if (err instanceof Error) {
      exceptionDetails = 'Exception: ' + err.message + '\nStack: ' + (err.stack || 'None');
    } else {
      exceptionDetails = 'Unknown Exception: ' + JSON.stringify(err);
    }

    let combinedDetails = '';
    if (parsed.errorDetails) {
      combinedDetails += parsed.errorDetails + '\n\n';
    }
    combinedDetails += exceptionDetails;

    // Apply API key redaction
    const redactedErrorMessage = redactApiKey(parsed.errorMessage);
    const redactedErrorDetails = parsed.showDetails ? redactApiKey(combinedDetails) : undefined;
    const redactedErrorTip = parsed.showDetails ? redactApiKey(parsed.errorTip) : undefined;

    console.error('Gemini chat execution failed:', err);

    this.chatState.updateChatHistory(history => {
      const updated = [...history];
      const lastIdx = updated.length - 1;
      const errorBubble = {
        role: MessageRole.ERROR,
        content: redactedErrorMessage,
        errorTitle: parsed.errorTitle,
        errorMessage: redactedErrorMessage,
        errorDetails: redactedErrorDetails,
        errorTip: redactedErrorTip,
        ...(parsed.isRetryable ? {isRetryable: true, originalPrompt, attachments} : {}),
      };
      if (lastIdx >= 0 && updated[lastIdx].role === MessageRole.MODEL) {
        updated[lastIdx] = errorBubble;
        return updated;
      }
      updated.push(errorBubble);
      return updated;
    });
  }
}
