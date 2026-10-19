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

import {inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {skip} from 'rxjs/operators';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {PromptTurnType, UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {formatJson, tryParseJsonArray} from '../../utils/json';
import {ChatState, LlmLogType} from '../chat-state/chat-state';
import {
  Attachment,
  CANCEL_ERROR_NAME,
  LlmClient,
  LlmMessage,
  LlmStreamResponse,
  LlmToolCall,
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
import {RendererSelection} from '../renderer-selection/renderer-selection';
import {RendererTool} from '../renderer-selection/renderer-tool';
import {ErrorLogger} from '../../debug/error-logger.service';
import {getCatalogId} from '../../storage/models/catalog-storage.model';

/** Why a response was cancelled before it finished. */
enum CancelReason {
  /** The user pressed Stop or started a new session. */
  USER = 'user',
  /**
   * The renderer changed. The response was written for the old renderer's catalog, so
   * it's no longer wanted.
   */
  RENDERER_CHANGED = 'rendererChanged',
}

/**
 * The most model requests one prompt makes. The first may switch renderers with the
 * renderer tool; the second answers with the new catalog and can't switch again, so a
 * model can't keep cycling between renderers.
 */
const MAX_MODEL_REQUESTS_PER_PROMPT = 2;

/** Shown in place of a response the user cancelled. */
const USER_CANCELLED_NOTE = '*You stopped this response.*';

/** Shown in place of a response cancelled because the renderer changed. */
const RENDERER_CHANGED_NOTE = '*This response was stopped because the renderer changed.*';

/** A prompt in progress, from when it's submitted until its response ends. */
interface PromptRun {
  /** The prompt the user sent, trimmed. */
  readonly prompt: string;
  readonly attachments: Attachment[];
  /** Identifies the prompt in telemetry and in the conversation. */
  readonly promptId: string;
  /**
   * The value of `activeRequestId` when the prompt was submitted. Once they differ,
   * the conversation was cleared or replaced and the prompt's response is dropped.
   */
  readonly requestId: number;
  /** Cancels a renderer switch the model asked for. */
  readonly toolSignal: AbortSignal;
  /** The messages the next model request sends. */
  context: LlmMessage[];
  /** The renderer the response is being written for. */
  rendererUrl: string;
  /** The ID of the catalog the response is being written for. */
  catalogId: string;
  /** The stream of the latest model request, once it has been sent. */
  responseStream?: LlmStreamResponse;
}

/** A model request's finished response. */
interface ModelResponse {
  /** The response's complete text. */
  text: string;
  /** The model's thinking, if it shared any. */
  thinking: string;
  /** The tools the model called instead of answering. */
  toolCalls: LlmToolCall[];
}

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
  private readonly rendererTool = inject(RendererTool);
  private readonly rendererSelection = inject(RendererSelection);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly logger = inject(ErrorLogger).withTag('[ChatCoordinator]');
  private readonly chatCleaner = inject(ChatCleaner);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly promptFactory = inject(ChatPromptFactoryService);
  private readonly errorPresenter = inject(ChatErrorFormatterService);

  /** Reactively mapped rendering pipeline execution milestones. */
  readonly pipelineStatus = this.chatState.pipelineStatus;

  /**
   * Public programmatic lock signal protecting against typing deadlocks
   * during streams.
   */
  readonly isProgrammaticStreamActive = this.chatState.isProgrammaticStreamActive;

  /** Turn index counter for telemetry. */
  readonly currentTurnIndex = signal(0);

  /**
   * A dynamic, reactive, computed signal property constructing conformed JSON
   * catalog schema specifications system instructions.
   */
  readonly systemPrompt = this.promptFactory.systemPrompt;

  private activePromptId: string | null = null;
  private activeRequestId = 0;
  private expectedToolRendererUrl: string | undefined;
  private toolAbortController?: AbortController;

  constructor() {
    // Reacts to renderer changes; see handleRendererChange.
    toObservable(this.configProvider.rendererUrl)
      // skip(1) ignores the renderer chosen at startup
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(url => {
        // The renderer tool's own switch is part of the request in flight, which
        // rebuilds the canvas for the new catalog itself.
        if (url === this.expectedToolRendererUrl) {
          this.expectedToolRendererUrl = undefined;
          return;
        }
        queueMicrotask(() => this.handleRendererChange());
      });
  }

  /**
   * Cancels any response still streaming, since it was written for the old renderer's
   * catalog. Then keeps an edited canvas, so it can be viewed in the new renderer, or
   * starts a new session from the new renderer's sample if the canvas is unedited.
   */
  private handleRendererChange(): void {
    this.cancelStream(CancelReason.RENDERER_CHANGED);
    // The conversation is kept only along with the canvas. It's the history of how an
    // edited canvas got its content, and the assistant needs it for follow-up prompts,
    // so it stays with an edited canvas. An unedited canvas is the old renderer's sample
    // and is replaced; nothing in the conversation changed it, and the conversation was
    // about the old renderer's catalog, so it's cleared with it.
    if (this.stateSync.hasEditedDraft()) {
      // The new renderer draws the kept canvas as is. If it has no catalog with the
      // canvas's createSurface catalogId, it can't draw the canvas and reports
      // `Catalog not found` as a render error; the canvas is left for the user to fix.
      return;
    }
    this.wipeEnvironmentCache();
  }

  private clearConversation(): void {
    // Invalidate any request still in flight. Its stream and renderer tool call were
    // cancelled by the cancel that precedes every clear.
    this.activeRequestId++;
    this.expectedToolRendererUrl = undefined;
    this.currentTurnIndex.set(0);
    this.activePromptId = null;
    this.activeStreamResponse = undefined;
    this.cancelReason = null;
    this.chatState.setChatHistory([]);
    this.finalizeStream(PipelineStatus.IDLE);
    this.chatState.clearRawLlmHistory();
  }

  /**
   * Resets turns logs history, overlays milestones, and locks indicators.
   */
  wipeEnvironmentCache(): void {
    this.clearConversation();
    this.stateSync.flushDraft();
  }

  /**
   * Starts a fresh user-initiated session, cancelling any active stream and
   * resetting the layout to a blank surface rather than the catalog sample template.
   */
  startNewSession(): void {
    this.cancelActiveStream();
    this.clearConversation();
    this.stateSync.resetToBlankDraft();
  }

  private finalizeStream(status: PipelineStatus = PipelineStatus.IDLE): void {
    this.chatState.setPipelineStatus(status);
    this.chatState.setProgrammaticStreamActive(false);
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
  /** Why the active response was cancelled, or null if it wasn't. */
  private cancelReason: CancelReason | null = null;

  /**
   * Cancels the currently active streaming request, at the user's request, if there is
   * one.
   */
  cancelActiveStream(): void {
    this.cancelStream(CancelReason.USER);
  }

  /**
   * Cancels the active streaming request if there is one. Only a cancel the user asked
   * for is tracked as a chat cancel.
   */
  private cancelStream(reason: CancelReason): void {
    // A response is cancelled once, for the first reason.
    if (!this.activePromptId || this.cancelReason !== null) {
      return;
    }
    this.cancelReason = reason;
    this.toolAbortController?.abort(this.cancelError());
    if (reason === CancelReason.USER) {
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

    const catalogId = this.getActiveCatalogId();

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
      this.logger.warn('Blocked submitPrompt: programmatic stream is active.');
      return;
    }
    const trimmed = prompt.trim();
    if (!trimmed && attachments.length === 0) return;

    // Include the latest canvas even before the debounced editor/history sync fires.
    this.stateSync.syncActiveDraftToHistory();

    const promptId = this.emitPromptTracking(trimmed, attachments, options);
    const run = this.beginPrompt(trimmed, attachments, promptId);
    try {
      await this.requestResponse(run);
    } catch (err: unknown) {
      this.handlePromptError(err, run);
    } finally {
      this.endPrompt(run);
    }
  }

  /**
   * Starts a prompt: makes it the active one, locks the chat controls, and adds the
   * user's turn followed by a placeholder model turn that the response streams into.
   */
  private beginPrompt(prompt: string, attachments: Attachment[], promptId: string): PromptRun {
    this.activePromptId = promptId;
    const requestId = ++this.activeRequestId;
    const rendererUrl = this.configProvider.rendererUrl();
    const catalogId = this.getActiveCatalogId();

    // Lock UI controls and transition state indicators to receiving stream
    this.chatState.setProgrammaticStreamActive(true);
    this.chatState.setPipelineStatus(PipelineStatus.RECEIVING_STREAM);

    this.chatState.updateChatHistory(h => [
      ...h,
      {
        role: MessageRole.USER,
        content: prompt,
        attachments: attachments.length > 0 ? attachments : undefined,
        promptId,
      },
    ]);

    // Construct system-prepended context matching conversational bounds
    const context = this.getFullMessageContext();

    this.chatState.addRawLlmLog(LlmLogType.REQUEST, context);

    // Push initial model turn placeholder with loading pulse indicator to history
    this.chatState.updateChatHistory(h => [
      ...h,
      {
        role: MessageRole.MODEL,
        content: this.chatCleaner.appendPulse(''),
      },
    ]);

    this.cancelReason = null;
    const toolAbortController = new AbortController();
    this.toolAbortController = toolAbortController;
    return {
      prompt,
      attachments,
      promptId,
      requestId,
      toolSignal: toolAbortController.signal,
      context,
      rendererUrl,
      catalogId,
    };
  }

  /**
   * Requests the prompt's response and applies it to the canvas. A model that asks to
   * switch renderers instead of answering gets the switch, and is asked again with the
   * new catalog; see MAX_MODEL_REQUESTS_PER_PROMPT.
   *
   * @throws If the response is cancelled, the model asks for more than one switch, or
   *     a request or the switch fails.
   */
  private async requestResponse(run: PromptRun): Promise<void> {
    for (let request = 1; request <= MAX_MODEL_REQUESTS_PER_PROMPT; request++) {
      const isLastRequest = request === MAX_MODEL_REQUESTS_PER_PROMPT;
      const response = await this.streamModelResponse(run, isLastRequest);
      if (!response) {
        return;
      }

      if (!response.toolCalls.length) {
        await this.applyResponse(response, run.promptId);
        return;
      }

      if (isLastRequest || response.toolCalls.length !== 1) {
        throw new Error('The assistant must request one renderer change at a time.');
      }
      const nextContext = await this.switchRendererForToolCall(
        response.toolCalls[0],
        run.context,
        run.requestId,
        run.rendererUrl,
        run.toolSignal,
      );
      if (!nextContext) {
        return;
      }
      run.context = nextContext;
      run.rendererUrl = this.configProvider.rendererUrl();
      run.catalogId = this.getActiveCatalogId();
    }
  }

  /**
   * Sends one model request and streams its response into the placeholder model turn.
   * Every request but the last offers the model the renderer tool.
   *
   * @return The finished response, or null if the conversation was cleared first.
   * @throws If the response is cancelled, including because the renderer changed.
   */
  private async streamModelResponse(
    run: PromptRun,
    isLastRequest: boolean,
  ): Promise<ModelResponse | null> {
    // Trigger streaming GenAI completions call using client facade
    const responseStream = await this.llmClient.chatStream(
      run.context,
      isLastRequest ? undefined : {tools: [this.rendererTool.definition()]},
    );
    run.responseStream = responseStream;

    // The conversation was cleared while the stream connection was establishing.
    if (run.requestId !== this.activeRequestId) {
      responseStream.cancel?.();
      return null;
    }

    // If a cancel was requested while the stream connection was establishing
    if (this.cancelReason !== null) {
      responseStream.cancel?.();
      throw this.cancelError();
    }

    this.activeStreamResponse = responseStream;
    this.throwIfRendererChanged(run.rendererUrl, run.catalogId);

    // Loop asynchronously over incoming stream packets to compile text
    const toolCalls: LlmToolCall[] = [];
    let accumulatedRawText = '';
    let accumulatedThinking = '';
    for await (const chunk of responseStream.contentStream) {
      if (run.requestId !== this.activeRequestId) {
        return null;
      }
      this.throwIfRendererChanged(run.rendererUrl, run.catalogId);
      if (chunk.toolCalls) {
        toolCalls.push(...chunk.toolCalls);
      }
      accumulatedRawText += chunk.content;
      if (chunk.thinking) {
        accumulatedThinking += chunk.thinking;
      }

      // Update history bubble in real-time with trailing pulse indicator
      this.setModelTurn(this.chatCleaner.appendPulse(accumulatedRawText), accumulatedThinking);
    }

    // Stream exhausted, resolve final complete text
    const text = await responseStream.complete;
    if (run.requestId !== this.activeRequestId) {
      return null;
    }
    this.throwIfRendererChanged(run.rendererUrl, run.catalogId);
    return {text, thinking: accumulatedThinking, toolCalls};
  }

  /**
   * Shows a finished response in the model turn, without the loading indicator, and
   * applies it to the canvas.
   */
  private async applyResponse(response: ModelResponse, promptId: string): Promise<void> {
    // Log the raw LLM response telemetry
    this.chatState.addRawLlmLog(LlmLogType.RESPONSE, response.text);
    this.setModelTurn(response.text, response.thinking);

    this.chatState.setPipelineStatus(PipelineStatus.RECEIVED_RAW);
    await this.processRawLlmPayload(response.text, promptId);
  }

  /** Replaces the last turn's content, if it's the model's. */
  private setModelTurn(content: string, thinking: string): void {
    this.chatState.updateChatHistory(history => {
      const updated = [...history];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.role === MessageRole.MODEL) {
        updated[lastIdx] = {role: MessageRole.MODEL, content, thinking};
      }
      return updated;
    });
  }

  /**
   * Ends a prompt whose response failed. A cancelled response is replaced with a note
   * saying why it stopped; any other failure is shown as an error. A prompt whose
   * conversation was cleared is no longer shown, so it's left alone.
   */
  private handlePromptError(err: unknown, run: PromptRun): void {
    if (run.requestId !== this.activeRequestId) {
      return;
    }
    // If it was cancelled, don't show an error. Just leave what was generated or remove the bubble.
    // But we probably want to just reset the UI lock.
    if (err && typeof err === 'object' && 'name' in err && err.name === CANCEL_ERROR_NAME) {
      this.finalizeStream(PipelineStatus.IDLE);
      // Replace trailing pulse or partial JSON with stopped message, and force non-snapshot
      this.chatState.updateChatHistory(history => {
        const updated = [...history];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.role === MessageRole.MODEL) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content:
              this.cancelReason === CancelReason.RENDERER_CHANGED
                ? RENDERER_CHANGED_NOTE
                : USER_CANCELLED_NOTE,
          };
        }
        return updated;
      });
    } else {
      this.handleConnectivityError(err, run.prompt, run.attachments, run.promptId);
    }
  }

  /**
   * Lets go of the prompt's renderer-switch controller and stream, unless a newer
   * request has already replaced them.
   */
  private endPrompt(run: PromptRun): void {
    if (this.activeRequestId === run.requestId) {
      this.toolAbortController = undefined;
    }
    if (
      this.activeRequestId === run.requestId &&
      this.activeStreamResponse === run.responseStream
    ) {
      this.activeStreamResponse = undefined;
    }
  }

  /**
   * Switches to the renderer the model asked for with the renderer tool, instead of
   * answering, and returns the request to send next: the same conversation, told to
   * use the newly selected catalog. The switch is the request's own, so it isn't
   * handled as a renderer change (see the constructor); the canvas is rebuilt for the
   * new catalog by the next response.
   *
   * @return The next request's messages, or null if the conversation was cleared
   *     during the switch.
   * @throws If the call is invalid, the switch fails, or the response is cancelled.
   */
  private async switchRendererForToolCall(
    call: LlmToolCall,
    context: LlmMessage[],
    requestId: number,
    rendererUrlAtSubmit: string,
    signal: AbortSignal,
  ): Promise<LlmMessage[] | null> {
    if (this.cancelReason !== null) {
      throw this.cancelError();
    }
    const renderer = this.rendererTool.rendererFor(call);
    const changedRenderer = renderer.rendererUrl !== rendererUrlAtSubmit;
    this.expectedToolRendererUrl = changedRenderer ? renderer.rendererUrl : undefined;
    try {
      await this.rendererSelection.selectRenderer(renderer.id, signal);
    } finally {
      if (requestId === this.activeRequestId) {
        this.expectedToolRendererUrl = undefined;
      }
    }
    if (requestId !== this.activeRequestId) {
      return null;
    }
    if (this.cancelReason !== null) {
      throw this.cancelError();
    }
    if (changedRenderer) {
      this.stateSync.flushDraft();
    }
    // Retain the user's intent and attachments. Earlier layouts remain
    // reference material, while only the newly selected catalog is allowed.
    const nextContext: LlmMessage[] = [
      {
        role: MessageRole.SYSTEM,
        content:
          this.promptFactory.systemPrompt() +
          '\nThe renderer has been selected. Use only this catalog. Rebuild any prior layout using its supported components and emit a complete createSurface/updateComponents/updateDataModel sequence.',
      },
      ...context.filter(message => message.role !== MessageRole.SYSTEM),
    ];
    this.chatState.addRawLlmLog(LlmLogType.REQUEST, nextContext);
    return nextContext;
  }

  private cancelError(): Error {
    const error = new Error('Cancelled');
    error.name = CANCEL_ERROR_NAME;
    return error;
  }

  /**
   * Post-processes, extracts, syntax heals, and validates raw JSON lines.
   */
  private async processRawLlmPayload(rawText: string, promptId?: string): Promise<void> {
    if (promptId && this.activePromptId !== promptId) return;
    // Stage 1: Parse and Syntax Healing
    let parsedBlocks: unknown[] = [];
    let componentCount = 0;
    try {
      if (this.chatCleaner.extractCodeFences(rawText).hasFences) {
        this.chatState.setPipelineStatus(PipelineStatus.HEALING);
      }
      const cleanedText = this.chatCleaner.cleanPayload(rawText);
      const parseResult = parseAndHealJsonLines(cleanedText);

      if (parseResult.success && parseResult.isConversational) {
        this.finalizeStream(PipelineStatus.IDLE);
        return;
      }

      if (!parseResult.success) {
        const errorPrefix = promptId ? `[prompt:${promptId}] ` : '';
        this.errorLogger.error({
          sourceTag: '[ChatParser]',
          message: `${errorPrefix}${parseResult.error}`,
          line: parseResult.line,
          column: parseResult.column,
          snippet: parseResult.snippet,
        });

        this.chatState.updateChatHistory(history => {
          const updated = [...history];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === MessageRole.MODEL) {
            updated[lastIdx] = {...updated[lastIdx], parseError: parseResult};
          }
          return updated;
        });
        this.finalizeStream(PipelineStatus.IDLE);
        return;
      }

      parsedBlocks = parseResult.blocks;
      componentCount = parseResult.count;
    } catch (err: unknown) {
      this.finalizeStream(PipelineStatus.FAILED);
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
        this.logger,
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

      // Validate surface references before replacing the editor. A delta must
      // retain the creation and component messages needed to replay the draft.
      parsedBlocks = this.resolveLayoutUpdate(parsedBlocks);
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
            isSnapshot: true,
            componentCount,
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
      this.finalizeStream(PipelineStatus.FAILED);
      throw err;
    }
  }

  private getActiveCatalogId(): string {
    const catalog = this.catalogManagement.activeCatalog();
    return (catalog && getCatalogId(catalog)) || '';
  }

  /**
   * Cancels the response once the renderer, or its catalog, is no longer the one it's
   * being written for, so it's never applied to the new one. handleRendererChange
   * cancels it too, but only once the renderer URL change has been observed, and the
   * response can arrive before then.
   */
  private throwIfRendererChanged(rendererUrlAtSubmit: string, catalogIdAtSubmit: string): void {
    if (
      this.configProvider.rendererUrl() === rendererUrlAtSubmit &&
      this.getActiveCatalogId() === catalogIdAtSubmit
    ) {
      return;
    }
    this.cancelStream(CancelReason.RENDERER_CHANGED);
    throw this.cancelError();
  }

  /**
   * Turns a model response into the complete message list for the editor.
   *
   * The model can answer an edit in two ways:
   * - A full replacement: the response starts a surface with `createSurface`.
   *   It replaces the draft, so it is returned unchanged.
   * - An incremental edit: the response only sends `updateComponents`,
   *   `updateDataModel`, or `deleteSurface` for surfaces the draft already has.
   *   Written to the editor on its own, it would erase the draft, because the
   *   editor replays the whole message list to render the preview. So the
   *   edit is appended to the current draft instead.
   *
   * Before appending, every surface an update targets is checked against the
   * surfaces the draft and the response create (minus the ones they delete).
   * If the model invents a surface ID, for example by copying one from the
   * prompt's examples, this throws. The caller reports it like any other
   * validation failure, and the draft in the editor is left unchanged.
   */
  private resolveLayoutUpdate(updates: unknown[]): unknown[] {
    // Reads `item[command].surfaceId` when `item` is that kind of A2UI message.
    const surfaceId = (item: unknown, command: string): string | undefined => {
      if (!item || typeof item !== 'object' || !(command in item)) {
        return undefined;
      }
      const payload: unknown = Reflect.get(item, command);
      return payload &&
        typeof payload === 'object' &&
        'surfaceId' in payload &&
        typeof payload.surfaceId === 'string'
        ? payload.surfaceId
        : undefined;
    };

    // A response that creates a surface is a full replacement; otherwise it
    // builds on the current draft, when the draft parses.
    const replacesDraft = updates.some(item => surfaceId(item, 'createSurface') !== undefined);
    const current = tryParseJsonArray(this.stateSync.activeDraft());
    const base = !replacesDraft && current.success ? current.data : [];

    // Surfaces that exist once the base draft has been replayed.
    const activeSurfaces = new Set<string>();
    for (const item of base) {
      const created = surfaceId(item, 'createSurface');
      const deleted = surfaceId(item, 'deleteSurface');
      if (created !== undefined) {
        activeSurfaces.add(created);
      }
      if (deleted !== undefined) {
        activeSurfaces.delete(deleted);
      }
    }

    // Replay the response in order, so an update may target a surface created
    // earlier in the same response but not one deleted before it.
    for (const item of updates) {
      const created = surfaceId(item, 'createSurface');
      if (created !== undefined) {
        activeSurfaces.add(created);
      }
      for (const command of ['updateComponents', 'updateDataModel', 'deleteSurface']) {
        const id = surfaceId(item, command);
        if (id === undefined) {
          continue;
        }
        if (!activeSurfaces.has(id)) {
          throw new Error(
            `Surface validation failed: cannot apply ${command}: surface "${id}" does not exist in the current draft. The draft was preserved.`,
          );
        }
        if (command === 'deleteSurface') {
          activeSurfaces.delete(id);
        }
      }
    }
    return [...base, ...updates];
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
      this.finalizeStream(PipelineStatus.IDLE);
    } else {
      this.finalizeStream(PipelineStatus.FAILED);
    }

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

    this.logger.error('Gemini chat execution failed:', err);

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
}
