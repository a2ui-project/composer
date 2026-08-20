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

import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {skip} from 'rxjs/operators';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {PromptTurnType, UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {formatJson} from '../../utils/json';
import {ChatState, LlmLogType} from '../chat-state/chat-state';
import {
  Attachment,
  CANCEL_ERROR_NAME,
  LlmClient,
  LlmMessage,
  LlmStreamResponse,
  MessageRole,
} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {StateSync} from '../state-sync/state-sync';
import {ChatCleaner} from '../chat-cleaner/chat-cleaner';
import {
  parseAndHealJsonLines,
  runCatalogComponentSchemaCheck,
} from '../a2ui-payload-parser/a2ui-payload-parser';
import {ChatPromptFactoryService} from '../chat-prompt-factory/chat-prompt-factory.service';
import {ChatErrorFormatterService} from '../chat-error-formatter/chat-error-formatter.service';
import {cleanErrorMessage, redactApiKey} from '../chat-service/error-utils';

/**
 * Dynamic chat panel coordinator managing system prompt generation using
 * dynamic component configurations. Manages LLM completions transport
 * streams, self-healing parsers, schemas typo corrections, and gateway
 * error fallbacks.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatCoordinator {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly stateSync = inject(StateSync);
  private readonly chatState = inject(ChatState);
  private readonly llmClient = inject(LlmClient);
  private readonly chatCleaner = inject(ChatCleaner);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly promptFactory = inject(ChatPromptFactoryService);
  private readonly errorPresenter = inject(ChatErrorFormatterService);
  private readonly destroyRef = inject(DestroyRef);

  /** Reactively mapped rendering pipeline execution milestones. */
  readonly pipelineStatus = this.chatState.pipelineStatus;

  /**
   * Public programmatic lock signal protecting against typing deadlocks
   * during streams.
   */
  readonly isProgrammaticStreamActive = this.chatState.isProgrammaticStreamActive;

  /** Turn index counter for telemetry. */
  readonly currentTurnIndex = signal(0);

  private activePromptId: string | null = null;

  constructor() {
    // Effect monitoring dynamic host preview configurations mapping cache
    // resets
    toObservable(this.configProvider.rendererUrl)
      // skip(1) prevents wiping the cache on the initial startup signal emission
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        queueMicrotask(() => this.wipeEnvironmentCache());
      });
  }

  /**
   * Resets turns logs history, overlays milestones, and locks indicators.
   */
  wipeEnvironmentCache(): void {
    this.currentTurnIndex.set(0);
    this.activePromptId = null;
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
        content: this.promptFactory.systemPrompt(),
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
    if (this.activePromptId) {
      this.usageTrackingService.trackChatCancel({
        promptId: this.activePromptId,
        turnIndex: this.currentTurnIndex(),
        pipelineStatus: this.pipelineStatus(),
      });
    }
    if (this.activeStreamResponse && this.activeStreamResponse.cancel) {
      this.activeStreamResponse.cancel();
    }
  }

  private emitPromptTracking(
    prompt: string,
    attachments: Attachment[],
    options?: {promptId?: string; promptTurnIndex?: number; retryOfPromptId?: string},
  ): string {
    const isRetry = !!options?.retryOfPromptId;
    const promptTurnIndex = options?.promptTurnIndex ?? this.currentTurnIndex() + 1;
    this.currentTurnIndex.set(promptTurnIndex);

    const catalogObj = this.catalogManagement.activeCatalog();
    const catalogId = catalogObj ? catalogObj.catalogId || catalogObj.$id || '' : '';

    const hasScreenshot = attachments.some(
      a => a.name === 'screenshot.png' || a.mimeType?.startsWith('image/'),
    );
    const nonScreenshotAttachments = attachments.filter(
      a => a.name !== 'screenshot.png' && !a.mimeType?.startsWith('image/'),
    );

    if (isRetry) {
      return this.usageTrackingService.trackChatRetry({
        promptId: options?.promptId,
        catalogId,
        turnIndex: promptTurnIndex,
        attemptNumber: 2,
        retryOfPromptId: options?.retryOfPromptId,
      });
    } else {
      return this.usageTrackingService.trackChatPrompt({
        promptId: options?.promptId,
        catalogId,
        turnType: promptTurnIndex === 1 ? PromptTurnType.INITIAL : PromptTurnType.FOLLOWUP,
        turnIndex: promptTurnIndex,
        attemptNumber: 1,
        hasScreenshot,
        attachmentCount: nonScreenshotAttachments.length,
      });
    }
  }

  /**
   * Dispatches a fresh text instruction, triggers GenAI completions
   * in-stream, buffers packets, runs auto-repair healing and schema
   * validation blocks.
   */
  async submitPrompt(
    prompt: string,
    attachments: Attachment[] = [],
    options?: {promptId?: string; promptTurnIndex?: number; retryOfPromptId?: string},
  ): Promise<void> {
    if (this.chatState.isProgrammaticStreamActive()) {
      console.warn('[ChatCoordinator] Blocked submitPrompt: programmatic stream is active.');
      return;
    }
    const trimmed = prompt.trim();
    if (!trimmed && attachments.length === 0) return;

    const promptId = this.emitPromptTracking(trimmed, attachments, options);
    this.activePromptId = promptId;

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
        promptId,
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
        content: this.chatCleaner.appendPulse(''),
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
              content: this.chatCleaner.appendPulse(accumulatedRawText),
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
        this.handleConnectivityError(err, trimmed, attachments, promptId);
      }
    } finally {
      this.activeStreamResponse = undefined;
    }
  }

  /**
   * Post-processes, extracts, syntax heals, and validates raw JSON lines.
   */
  private async processRawLlmPayload(rawText: string): Promise<void> {
    // Stage 1: Parse and Syntax Healing
    let parsedBlocks: unknown[] = [];
    try {
      if (this.chatCleaner.extractCodeFences(rawText).hasFences) {
        this.chatState.setPipelineStatus(PipelineStatus.HEALING);
      }
      const cleanedText = this.chatCleaner.cleanPayload(rawText);
      const parseResult = parseAndHealJsonLines(cleanedText);
      parsedBlocks = parseResult.blocks;
      if (parseResult.wasHealed) this.chatState.setPipelineStatus(PipelineStatus.HEALING);
      if (parsedBlocks.length === 0) {
        throw new Error('No valid A2UI JSON layout command block could be parsed or recovered.');
      }
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

      const validationErrors: string[] = [];
      const isValidEnvelope = CrossFrameValidator.validateOutgoingMessage(
        mockEnvMsg,
        validationErrors,
      );

      if (!isValidEnvelope) {
        throw new Error(
          `Outgoing message envelope validation failed:\n${validationErrors.join('\n')}`,
        );
      }

      // Catalog Component Schema Check & Name Typos Healing
      const wasHealed = runCatalogComponentSchemaCheck(
        parsedBlocks,
        this.catalogManagement.activeCatalog()?.components,
      );
      if (wasHealed) {
        this.chatState.setPipelineStatus(PipelineStatus.HEALING);
      }

      // Stage 3: Ready & Commit Layout Wipes
      this.chatState.setPipelineStatus(PipelineStatus.READY);

      // Turn list of updates back into raw formatted JSON text to write to
      // editor draft
      const finalLayoutText = formatJson(parsedBlocks);

      // Update latest MODEL turn message in history to normalized JSON string
      this.chatState.updateChatHistory(history => {
        const updated = [...history];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === MessageRole.MODEL) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: finalLayoutText,
          };
        }
        return updated;
      });

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

  private handleConnectivityError(
    err: unknown,
    originalPrompt?: string,
    attachments: Attachment[] = [],
    promptId?: string,
  ): void {
    const rawError = err instanceof Error ? err.message : String(err);
    const lowerMsg = rawError.toLowerCase();
    const cleanMsg = cleanErrorMessage(rawError);

    if (this.errorPresenter.isConnectivityError(lowerMsg)) {
      this.chatState.setPipelineStatus(PipelineStatus.IDLE);
    } else {
      this.chatState.setPipelineStatus(PipelineStatus.FAILED);
    }
    this.chatState.setProgrammaticStreamActive(false);

    const parsed = this.errorPresenter.parseError(lowerMsg, cleanMsg, !!originalPrompt);

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
        promptId,
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

  /**
   * A dynamic, reactive, computed signal property constructing conformed JSON
   * catalog schema specifications system instructions.
   */
  readonly systemPrompt = this.promptFactory.systemPrompt;
}
