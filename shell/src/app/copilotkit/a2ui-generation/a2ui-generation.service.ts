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

import {Injectable, inject, computed, Signal} from '@angular/core';
import {formatJson} from '../../utils/json';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {
  LlmMessage,
  LlmClient,
  MessageRole,
  LlmStreamResponse,
  CANCEL_ERROR_NAME,
} from '../../chat/llm-client/llm-client';
import {PipelineStatus} from '../../chat/pipeline-status/pipeline-status';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState, LlmLogType} from '../../chat/chat-state/chat-state';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {
  PreviewBridgeMessageType,
  RenderA2uiItem,
  A2uiComponentInstance,
  UpdateComponentsDetails,
  UpdateDataModelDetails,
} from 'a2ui-bridge';
import {cleanErrorMessage, redactApiKey} from '../../chat/chat-service/error-utils';

/**
 * Describes a single component-name correction applied during catalog schema
 * healing, mapping the raw name emitted by the model to the healed catalog name.
 */
export interface Heal {
  readonly from: string;
  readonly to: string;
}

/**
 * Discriminated result of an A2UI generation attempt. Successful generations
 * carry the parsed blocks, the committed layout text, and any component-name
 * heals applied. Failed generations carry a user-facing diagnostic built from
 * the shared error parser, never throwing for expected generation, validation,
 * or connectivity failures.
 */
export type GenerationResult =
  | {
      ok: true;
      blocks: unknown[];
      layoutText: string;
      heals: Heal[];
      surfaceTitle?: string;
    }
  | {
      ok: false;
      title: string;
      message: string;
      details?: string;
      tip?: string;
      retryable: boolean;
    };

/**
 * Structured representation returned by {@link A2uiGenerationService.parseError},
 * describing a user-facing diagnostic for a generation, validation, or
 * connectivity failure.
 */
export interface ParsedError {
  errorTitle: string;
  errorMessage: string;
  errorTip: string;
  isRetryable: boolean;
  showDetails: boolean;
  errorDetails?: string;
}

@Injectable({
  providedIn: 'root',
})
/**
 * Headless A2UI generation pipeline extracted from the chat coordinator. Owns
 * the system prompt, the streamed LLM accumulation loop, the self-healing JSON
 * Lines parser, catalog component schema healing, and gateway error mapping,
 * without producing any chat-bubble side effects. This lets an external driver
 * (e.g. a CopilotKit AG-UI agent) run generation while the chat coordinator
 * continues to own conversational history.
 */
export class A2uiGenerationService {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly stateSync = inject(StateSync);
  private readonly chatState = inject(ChatState);
  private readonly llmClient = inject(LlmClient);

  private activeStreamResponse?: LlmStreamResponse;
  private isCancelRequested = false;

  /**
   * A dynamic, reactive, computed signal property constructing conformed JSON
   * catalog schema specifications system instructions.
   */
  readonly systemPrompt: Signal<string> = computed<string>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return (
        'You are an AI assistant designed to help model mock screens ' +
        'inside A2UI Composer shell.\n' +
        'Status: Awaiting renderer dynamic handshake settlement...'
      );
    }

    return this.generateSystemPrompt(formatJson(catalog));
  });

  /**
   * Runs the full generation pipeline for the supplied message context:
   * streams the LLM completion, accumulates it, heals and validates the JSON
   * Lines payload, applies catalog component healing, and on success commits
   * the formatted layout to the editor draft. Never touches chat-history
   * bubbles. Expected generation, validation, and connectivity failures resolve
   * to an `{ok: false}` result rather than throwing.
   */
  async generate(messages: LlmMessage[]): Promise<GenerationResult> {
    // Lock UI controls and transition state indicators to receiving stream
    this.chatState.setProgrammaticStreamActive(true);
    this.chatState.setPipelineStatus(PipelineStatus.RECEIVING_STREAM);

    // Log the raw LLM request telemetry
    this.chatState.addRawLlmLog(LlmLogType.REQUEST, messages);

    let finalRawText: string;
    try {
      this.isCancelRequested = false;
      // Trigger streaming GenAI completions call using client facade
      const responseStream = await this.llmClient.chatStream(messages);

      // If a cancel was requested while the stream connection was establishing
      if (this.isCancelRequested) {
        if (responseStream.cancel) responseStream.cancel();
        throw this.makeCancelError();
      }

      this.activeStreamResponse = responseStream;

      // Drive the stream to completion so an in-flight cancel can interrupt
      // it. Chunk content is surfaced to chat bubbles only by ChatCoordinator,
      // so streamed fragments intentionally produce no side effects here.
      for await (const _chunk of responseStream.contentStream) {
        // Intentionally empty: the headless pipeline consumes only the final
        // accumulated text resolved by `complete` below.
      }

      // Stream exhausted, resolve final complete text
      finalRawText = await responseStream.complete;

      // Log the raw LLM response telemetry
      this.chatState.addRawLlmLog(LlmLogType.RESPONSE, finalRawText);
      this.chatState.setPipelineStatus(PipelineStatus.RECEIVED_RAW);
    } catch (err: unknown) {
      if (this.isCancelError(err)) {
        this.chatState.setPipelineStatus(PipelineStatus.IDLE);
        this.chatState.setProgrammaticStreamActive(false);
        return {
          ok: false,
          title: 'Generation Cancelled',
          message: 'Generation was cancelled before completion.',
          retryable: true,
        };
      }
      return this.buildErrorResult(err, messages);
    } finally {
      this.activeStreamResponse = undefined;
    }

    return this.processPayload(finalRawText, messages);
  }

  /**
   * Cancels the currently active streaming request if there is one, reusing the
   * shared {@link CANCEL_ERROR_NAME} mechanism.
   */
  cancel(): void {
    this.isCancelRequested = true;
    if (this.activeStreamResponse && this.activeStreamResponse.cancel) {
      this.activeStreamResponse.cancel();
    }
  }

  /**
   * Post-processes an accumulated raw payload: parses and syntax-heals the JSON
   * Lines, validates the outgoing envelope, applies catalog component healing,
   * and commits the formatted layout on success.
   */
  private processPayload(rawText: string, messages: LlmMessage[]): GenerationResult {
    // Stage 1: Parse and Syntax Healing
    let parsedBlocks: unknown[];
    try {
      parsedBlocks = this.parseAndHealJsonLines(rawText);
    } catch (err: unknown) {
      return this.buildErrorResult(err, messages);
    }

    // Stage 2: Schema Validation
    this.chatState.setPipelineStatus(PipelineStatus.VALIDATING);
    try {
      this.validateEnvelope(parsedBlocks);

      // Catalog Component Schema Check & Name Typos Healing
      const heals = this.runCatalogComponentSchemaCheck(parsedBlocks);

      // Stage 3: Ready & Commit Layout Wipes
      this.chatState.setPipelineStatus(PipelineStatus.READY);

      // Turn list of updates back into raw formatted JSON text to write to
      // editor draft
      const layoutText = formatJson(parsedBlocks);

      // Commit layout synchronously to editor viewport before releasing lockout
      this.stateSync.commitLayoutFromLlm(layoutText);

      // Release panel textareas lockout synchronously to avoid race condition
      this.chatState.setProgrammaticStreamActive(false);

      const surfaceTitle = this.extractSurfaceTitle(parsedBlocks);
      return {ok: true, blocks: parsedBlocks, layoutText, heals, surfaceTitle};
    } catch (err: unknown) {
      return this.buildErrorResult(err, messages);
    }
  }

  /**
   * Verifies basic schema envelopes using the pre-existing CrossFrameValidator,
   * temporarily capturing console.error output to surface validation failures.
   */
  private validateEnvelope(parsedBlocks: unknown[]): void {
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
  }

  /**
   * Robust parser extracting JSON objects from blocks, performing syntax
   * repairs.
   */
  parseAndHealJsonLines(text: string): unknown[] {
    let content = text.trim();

    // Markdown Extraction: If output has Markdown wrappers, extract content
    const mdJsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = content.match(mdJsonRegex);
    if (match && match[1]) {
      this.chatState.setPipelineStatus(PipelineStatus.HEALING);
      content = match[1].trim();
    }

    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    const parsedBlocks: unknown[] = [];

    for (const line of lines) {
      // Skip Markdown code tags if they leaked, or general prompt filler
      // text lines
      if (line.startsWith('```') || (!line.startsWith('{') && !line.startsWith('['))) {
        continue;
      }

      try {
        parsedBlocks.push(JSON.parse(line));
      } catch (err) {
        // Syntax Healing Loop
        this.chatState.setPipelineStatus(PipelineStatus.HEALING);
        const healedObj = this.attemptSyntaxHealing(line);
        if (healedObj !== null) {
          parsedBlocks.push(healedObj);
        } else {
          // If it looks like A2UI JSON but couldn't be repaired, throw
          // validation error
          if (line.includes('"version"') || line.includes('"createSurface"')) {
            throw new Error(`Syntax recovery failed for corrupted JSON Line:\n"${line}"`);
          }
        }
      }
    }

    if (parsedBlocks.length === 0) {
      throw new Error('No valid A2UI JSON layout command block could be parsed or recovered.');
    }

    return parsedBlocks;
  }

  /**
   * Attempts structural syntax patching on broken JSON strings.
   */
  private attemptSyntaxHealing(line: string): unknown | null {
    let patched = line.trim();

    // Repair 1: Strip trailing commas inside properties arrays
    patched = patched.replace(/,\s*([\]}])/g, '$1');

    // Repair 2: Auto-close braces
    try {
      return JSON.parse(patched);
    } catch (e) {
      // Loop to try appending up to 5 missing closing curly braces
      for (let i = 1; i <= 5; i++) {
        try {
          return JSON.parse(patched + '}'.repeat(i));
        } catch (_) {}
      }

      // Loop to try appending matching square brackets then curly braces
      for (let i = 1; i <= 3; i++) {
        for (let j = 1; j <= 3; j++) {
          try {
            return JSON.parse(patched + ']'.repeat(i) + '}'.repeat(j));
          } catch (_) {}
        }
      }
    }

    return null;
  }

  /**
   * Validates parsed components against custom catalog schemas, healing name
   * typos, mapping legacy names, and recursively stripping out custom mock
   * rules configurations. Returns the list of component-name corrections that
   * were applied.
   */
  runCatalogComponentSchemaCheck(parsedBlocks: unknown[]): Heal[] {
    const heals: Heal[] = [];
    const catalog = this.catalogManagement.activeCatalog();
    const componentHealMap: Record<string, string> = {};

    if (catalog && catalog['components']) {
      for (const key of Object.keys(catalog['components'])) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
        componentHealMap[normalizedKey] = key;
      }
    }

    const SYNONYM_MAP: Record<string, string> = {
      textbox: 'textfield',
      textinput: 'textfield',
      rowlayout: 'row',
      columnlayout: 'column',
      choice: 'choicepicker',
      datepicker: 'datetimeinput',
      datetimepicker: 'datetimeinput',
    };

    for (const block of parsedBlocks) {
      if (!block || typeof block !== 'object') {
        continue;
      }
      const bObj = block as RenderA2uiItem;
      const updateComponents = bObj['updateComponents'];
      if (
        !updateComponents ||
        typeof updateComponents !== 'object' ||
        !Array.isArray(updateComponents['components'])
      ) {
        continue;
      }

      const cleanedComponents: unknown[] = [];
      for (const comp of updateComponents['components']) {
        if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
          cleanedComponents.push(comp);
          continue;
        }

        const compObj = comp as A2uiComponentInstance;
        let compType = compObj['component'] as string;

        // legacy property "name" fallback: heal to "component" key mapping
        if (compObj['name'] && !compObj['component']) {
          this.chatState.setPipelineStatus(PipelineStatus.HEALING);
          compType = compObj['name'] as string;
          compObj['component'] = compType;
          delete compObj['name'];
        }

        if (typeof compType !== 'string') {
          throw new Error('Component declaration is missing component type name string.');
        }

        let targetType = compType;

        // Schema validation (only if catalog is actively loaded with components)
        if (catalog && catalog.components) {
          if (!catalog.components[compType]) {
            // Unrecognized component type - check case-insensitive lookup!
            const normalized = compType.toLowerCase().replace(/[^a-z]/g, '');
            let healedType = componentHealMap[normalized];

            // If not found directly, check synonym translation dictionary
            if (!healedType) {
              const synonymTarget = SYNONYM_MAP[normalized];
              if (synonymTarget) {
                healedType = componentHealMap[synonymTarget];
              }
            }

            if (healedType && catalog.components[healedType]) {
              this.chatState.setPipelineStatus(PipelineStatus.HEALING);
              targetType = healedType;
            } else {
              // Fuzzy search matches
              const fuzzyMatch = normalized
                ? Object.keys(catalog.components).find(
                    key =>
                      key.toLowerCase().includes(normalized) ||
                      normalized.includes(key.toLowerCase()),
                  )
                : undefined;

              if (fuzzyMatch) {
                this.chatState.setPipelineStatus(PipelineStatus.HEALING);
                targetType = fuzzyMatch;
              } else {
                throw new Error(
                  `Validation failure: Component type "${compType}" is ` +
                    'not registered in the active custom catalog.',
                );
              }
            }
          }
        }

        // Record a component-name correction when healing changed the type.
        if (targetType !== compType) {
          heals.push({from: compType, to: targetType});
        }

        // Recursively strip out dynamic mock setups configuration fields
        const cleanedComp = this.sanitizeComponentObject(compObj);
        // Restore corrected element name
        cleanedComp['component'] = targetType;
        cleanedComponents.push(cleanedComp);
      }

      // Commit sanitized array back in-place
      updateComponents['components'] = cleanedComponents;
    }

    return heals;
  }

  /**
   * Unifies recursive sanitization traversal and strips out dynamic mock setups
   * configurations recursively.
   */
  private sanitizeValue(val: unknown): unknown {
    if (val === null || typeof val !== 'object') {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map(item => this.sanitizeValue(item));
    }

    const obj = val as Record<string, unknown>;
    const cleaned: Record<string, unknown> = {};

    for (const [key, propVal] of Object.entries(obj)) {
      if (key === 'rules' || /^mock/i.test(key)) {
        continue;
      }
      cleaned[key] = this.sanitizeValue(propVal);
    }

    return cleaned;
  }

  /**
   * Recursively sanitizes component declarations maps.
   * Strips out dynamic rules configs matching /rules/ or prefix /^mock/i.
   */
  sanitizeComponentObject(obj: A2uiComponentInstance): A2uiComponentInstance {
    return this.sanitizeValue(obj) as A2uiComponentInstance;
  }

  /**
   * Best-effort extraction of a human-readable surface title from parsed
   * blocks: first a `title`-like key in an `updateDataModel` value, then the
   * static text of the first Text-like component, else undefined.
   */
  private extractSurfaceTitle(parsedBlocks: unknown[]): string | undefined {
    for (const block of parsedBlocks) {
      if (!block || typeof block !== 'object') {
        continue;
      }
      const updateDataModel = (block as RenderA2uiItem)['updateDataModel'] as
        UpdateDataModelDetails | undefined;
      const value = updateDataModel?.['value'];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, propVal] of Object.entries(value as Record<string, unknown>)) {
          if (/title/i.test(key) && typeof propVal === 'string' && propVal.trim()) {
            return propVal;
          }
        }
      }
    }

    for (const block of parsedBlocks) {
      if (!block || typeof block !== 'object') {
        continue;
      }
      const updateComponents = (block as RenderA2uiItem)['updateComponents'] as
        UpdateComponentsDetails | undefined;
      if (!updateComponents || !Array.isArray(updateComponents['components'])) {
        continue;
      }
      for (const comp of updateComponents['components']) {
        if (!comp || typeof comp !== 'object' || Array.isArray(comp)) {
          continue;
        }
        const compObj = comp as A2uiComponentInstance;
        const componentName = typeof compObj['component'] === 'string' ? compObj['component'] : '';
        if (/text/i.test(componentName) && typeof compObj['text'] === 'string') {
          const text = (compObj['text'] as string).trim();
          if (text) {
            return text;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Builds an `{ok: false}` generation result from the shared error parser,
   * mirroring the connectivity/failed pipeline-status transitions and API-key
   * redaction of the chat coordinator's error handling.
   */
  private buildErrorResult(err: unknown, messages: LlmMessage[]): GenerationResult {
    const rawError = err instanceof Error ? err.message : String(err);
    const lowerMsg = rawError.toLowerCase();
    const cleanMsg = cleanErrorMessage(rawError);

    if (this.isConnectivityError(lowerMsg)) {
      this.chatState.setPipelineStatus(PipelineStatus.IDLE);
    } else {
      this.chatState.setPipelineStatus(PipelineStatus.FAILED);
    }
    this.chatState.setProgrammaticStreamActive(false);

    const parsed = this.parseError(lowerMsg, cleanMsg, this.lastUserPrompt(messages));

    return {
      ok: false,
      title: parsed.errorTitle,
      message: redactApiKey(parsed.errorMessage),
      details:
        parsed.showDetails && parsed.errorDetails ? redactApiKey(parsed.errorDetails) : undefined,
      tip: parsed.showDetails && parsed.errorTip ? redactApiKey(parsed.errorTip) : undefined,
      retryable: parsed.isRetryable,
    };
  }

  /**
   * Connectivity Exception classification: network, proxy, or auth failures.
   */
  isConnectivityError(lowerMsg: string): boolean {
    return (
      lowerMsg.includes('failed to fetch') ||
      lowerMsg.includes('fetch') ||
      lowerMsg.includes('timeout') ||
      lowerMsg.includes('504') ||
      lowerMsg.includes('proxy') ||
      lowerMsg.includes('networkerror') ||
      lowerMsg.includes('connection') ||
      lowerMsg.includes('401') ||
      lowerMsg.includes('403') ||
      lowerMsg.includes('credential') ||
      lowerMsg.includes('quota') ||
      lowerMsg.includes('blocked') ||
      lowerMsg.includes('503') ||
      lowerMsg.includes('unavailable') ||
      lowerMsg.includes('api key') ||
      lowerMsg.includes('apikey')
    );
  }

  /**
   * Maps a raw error into a structured, user-facing diagnostic describing the
   * generation, validation, or connectivity failure.
   */
  parseError(lowerMsg: string, cleanMsg: string, originalPrompt?: string): ParsedError {
    // Default values (Connectivity Failure)
    const errorTitle = 'Connectivity Failure';
    const isJson = cleanMsg.trim().startsWith('{');
    const errorMessage = isJson ? 'A connectivity error occurred.' : cleanMsg;
    const errorDetails = isJson ? 'Details: ' + cleanMsg : undefined;
    const errorTip =
      'Tip: Please check your network proxy configurations or verify your settings to restore connections.';
    const isRetryable = !!originalPrompt;
    const showDetails = true;

    const isValidationError =
      lowerMsg.includes('validation') ||
      lowerMsg.includes('syntax recovery') ||
      lowerMsg.includes('validation failure');

    if (isValidationError) {
      return {
        errorTitle: 'Validation Failure',
        errorMessage: 'The generated layout contains invalid components or structure.',
        errorTip:
          'Tip: Try rephrasing your prompt to guide the model to generate valid components.',
        isRetryable: !!originalPrompt,
        showDetails: true,
        errorDetails: 'Details: ' + cleanMsg,
      };
    }

    if (lowerMsg.includes('503') || lowerMsg.includes('unavailable')) {
      return {
        errorTitle: 'Service Unavailable',
        errorMessage: 'The generative service is temporarily unavailable. Please try again later.',
        errorTip: '',
        isRetryable: true,
        showDetails: false,
      };
    }

    if (lowerMsg.includes('high demand')) {
      return {
        errorTitle: 'Model High Demand',
        errorMessage:
          'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.',
        errorTip: '',
        isRetryable: true,
        showDetails: false,
      };
    }

    if (lowerMsg.includes('timeout') || lowerMsg.includes('504')) {
      return {
        errorTitle: 'REST Gateway Timeout',
        errorMessage: 'Remote generation service did not respond.',
        errorDetails: 'Details: ' + cleanMsg,
        errorTip,
        isRetryable,
        showDetails: true,
      };
    }

    if (lowerMsg.includes('api key') || lowerMsg.includes('apikey')) {
      return {
        errorTitle: 'Invalid API Key',
        errorMessage: 'The provided Gemini API key is invalid or missing.',
        errorDetails: 'Details: ' + cleanMsg,
        errorTip:
          'Tip: Please update your third-party Gemini developer API key on the settings page to restore connections.',
        isRetryable,
        showDetails: true,
      };
    }

    if (
      lowerMsg.includes('auth') ||
      lowerMsg.includes('401') ||
      lowerMsg.includes('403') ||
      lowerMsg.includes('credential')
    ) {
      return {
        errorTitle: 'Authentication Refused',
        errorMessage: 'Authentication failed. Please verify your credentials in Settings.',
        errorDetails: 'Details: ' + cleanMsg,
        errorTip,
        isRetryable,
        showDetails: true,
      };
    }

    if (lowerMsg.includes('quota') || lowerMsg.includes('blocked') || lowerMsg.includes('429')) {
      return {
        errorTitle: 'GenAI Service Blocked',
        errorMessage: 'Resource quota depleted or content safety limits triggered.',
        errorDetails: 'Details: ' + cleanMsg,
        errorTip,
        isRetryable,
        showDetails: true,
      };
    }

    return {
      errorTitle,
      errorMessage,
      errorTip,
      isRetryable,
      showDetails,
      errorDetails,
    };
  }

  /**
   * Extracts the most recent user prompt text from a message context, used to
   * determine retryability of a failed generation.
   */
  private lastUserPrompt(messages: LlmMessage[]): string | undefined {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === MessageRole.USER) {
        return messages[i].content;
      }
    }
    return undefined;
  }

  private makeCancelError(): Error {
    const err = new Error('Cancelled');
    err.name = CANCEL_ERROR_NAME;
    return err;
  }

  private isCancelError(err: unknown): boolean {
    return (
      !!err && typeof err === 'object' && 'name' in err && (err as Error).name === CANCEL_ERROR_NAME
    );
  }

  private generateSystemPrompt(catalog: string): string {
    return `
  # A2UI Generation Expert

  ## Role
  You are an A2UI expert. Your job is to translate the user's request into valid
  A2UI messages.

  # Overview
  You MUST ensure all payloads strictly adhere to the **JSON Lines (JSONL)**
  format. Each JSON object MUST be flattened to a single line without unescaped
  newline characters.

  The generated A2UI MUST conform to this A2UI JSON:
  \`\`\`json
  ${catalog}.
  \`\`\`

  ## Protocol
  When building the \`createSurface\` message, you MUST set the \`catalogId\` to
  reference the appropriate catalog schema URL.

  You MUST follow the strict message sequence (\`createSurface\` ->
  \`updateComponents\` -> \`updateDataModel\`) and use JSON Pointers for data
  binding.

  ## Validation

  A complete A2UI payload consists of one or more message objects sent as
  continuous JSON objects (or JSON Lines). Every message object MUST include a
  top-level \`"version": "v0.9"\` field.

  The four primary messages you must use to manage a UI surface are:

  1.  **\`createSurface\`**: Sent **FIRST** to signal the client to create a new
      surface. It defines the \`catalogId\` and optional \`theme\` parameters.
  2.  **\`updateComponents\`**: Used to define or update the UI component tree. You
      must provide a flat list of components. One component MUST have an \`id\` of
      \`"root"\`.
  3.  **\`updateDataModel\`**: Used to define or update data values that the
      components bind to.
  4.  **\`deleteSurface\`**: Signals the client to destroy the surface.

  ## Lifecycle and Ordering

  Typical sequence: \`createSurface\` -> \`updateComponents\` -> \`updateDataModel\` (or
  combined/interleaved after creation).

  ## Examples

    * **Simple Example**: A basic column with text:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "main", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "main", "components": [{"id": "root", "component": "MaterialColumn", "children": ["header", "content"]}, {"id": "header", "component": "MaterialText", "text": "Welcome"}, {"id": "content", "component": "MaterialText", "text": {"path": "/message"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "main", "path": "/message", "value": "Hello, world!"}}
      \`\`\`

    * **Complex Form Example**: A vacation booking form demonstrating advanced
      Material form controls (\`MaterialDatepicker\`, \`MaterialSelect\`,
      \`MaterialSlideToggle\`) and buttons using the modernized Material catalog:
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "vacation_booking", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "vacation_booking", "components": [{"id": "root", "component": "MaterialColumn", "children": ["title", "destination_input", "checkin_datepicker", "checkout_datepicker", "room_type_select", "passenger_select", "flexible_dates_toggle", "search_button"]}, {"id": "title", "component": "MaterialText", "text": {"path": "/title_label"}, "usageHint": "h1"}, {"id": "destination_input", "component": "MaterialInput", "label": {"path": "/destination_label"}, "value": {"path": "/destination_value"}}, {"id": "checkin_datepicker", "component": "MaterialDatepicker", "label": {"path": "/checkin_label"}, "value": {"path": "/checkin_value"}}, {"id": "checkout_datepicker", "component": "MaterialDatepicker", "label": {"path": "/checkout_label"}, "value": {"path": "/checkout_value"}}, {"id": "room_type_select", "component": "MaterialSelect", "label": {"path": "/room_type_label"}, "value": {"path": "/room_type_value"}, "options": [{"label": "Standard Room", "value": "standard"}, {"label": "Deluxe Suite", "value": "deluxe"}]}, {"id": "passenger_select", "component": "MaterialSelect", "label": {"path": "/passenger_label"}, "value": {"path": "/passenger_value"}, "options": [{"label": "1 Passenger", "value": "1"}, {"label": "2 Passengers", "value": "2"}, {"label": "3+ Passengers", "value": "3"}]}, {"id": "flexible_dates_toggle", "component": "MaterialSlideToggle", "label": {"path": "/flexible_dates_label"}, "checked": {"path": "/flexible_dates_checked"}, "color": "primary"}, {"id": "search_button", "component": "MaterialButton", "label": {"path": "/search_label"}, "action": {"event": {"name": "searchVacation"}}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "vacation_booking", "value": {"title_label": "Book Your Dream Vacation", "destination_label": "Destination", "destination_value": "Hawaii", "checkin_label": "Check-in Date", "checkin_value": "2026-07-01", "checkout_label": "Check-out Date", "checkout_value": "2026-07-14", "room_type_label": "Room Type", "room_type_value": "standard", "passenger_label": "Passengers", "passenger_value": "2", "flexible_dates_label": "Flexible Dates (+/- 3 days)", "flexible_dates_checked": true, "search_label": "Search Flights & Hotels"}}}
      \`\`\`

    * **Dynamic List Example**: An example using templates to render a list of
      items.
      \`\`\`jsonl
      {"version": "v0.9", "createSurface": {"surfaceId": "dynamic_list_demo", "catalogId": "https://a2ui.org/specification/v0_9/material_catalog.json"}}
      {"version": "v0.9", "updateComponents": {"surfaceId": "dynamic_list_demo", "components": [{"id": "root", "component": "MaterialColumn", "children": ["title", "list_container"]}, {"id": "title", "component": "MaterialText", "text": "Dynamic List Demo"}, {"id": "list_container", "component": "MaterialColumn", "children": {"componentId": "item_template", "path": "/items"}}, {"id": "item_template", "component": "MaterialText", "text": {"path": "text"}}]}}
      {"version": "v0.9", "updateDataModel": {"surfaceId": "dynamic_list_demo", "value": {"items": [{"text": "Item One"}, {"text": "Item Two"}]}}}
      \`\`\`

  ## Data Binding
  Every component property value MUST come from the data model (with minor
  exceptions for static primitives).

  When referencing data in the data model, you MUST use valid JSON Pointer syntax
  starting with \`/\`.

  ## Actions and Context

  When defining actions (e.g., on buttons), the \`context\` payload is a standard
  JSON object, rather than an array of key-value pairs.

  Example action definition:

  \`\`\`jsonl
  "action": {
    "event": {
      "name": "selectItem",
      "context": {
        "itemId": "12345",
        "itemName": {"path": "/selected/name"}
      }
    }
  }
  \`\`\`

  `;
  }
}
