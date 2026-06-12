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

import {Injectable, inject, computed, effect, untracked} from '@angular/core';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {LlmMessage, LlmClient, MessageRole} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {StateSync} from '../state-sync/state-sync';
import {ChatState, LlmLogType} from '../chat-state/chat-state';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

@Injectable({
  providedIn: 'root',
})
/**
 * Dynamic chat panel coordinator managing system prompt generation using
 * dynamic component configurations. Manages LLM completions transport
 * streams, self-healing parsers, schemas typo corrections, and gateway
 * error fallbacks.
 */
export class ChatCoordinator {
  private readonly catalogManagement = inject(CatalogManagement);
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

  /**
   * Dispatches a fresh text instruction, triggers GenAI completions
   * in-stream, buffers packets, runs auto-repair healing and schema
   * validation blocks.
   */
  async submitPrompt(prompt: string): Promise<void> {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    // Lock UI controls and transition state indicators to receiving stream
    this.chatState.setProgrammaticStreamActive(true);
    this.chatState.setPipelineStatus(PipelineStatus.RECEIVING_STREAM);

    // Append user prompt text turn to chat history
    this.chatState.updateChatHistory(h => [
      ...h,
      {
        role: MessageRole.USER,
        content: trimmed,
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
      // Trigger streaming GenAI completions call using client facade
      const responseStream = await this.llmClient.chatStream(fullContext);

      // Loop asynchronously over incoming stream packets to compile text
      let accumulatedRawText = '';
      for await (const packet of responseStream.contentStream) {
        accumulatedRawText += packet;

        // Update history bubble in real-time with trailing pulse indicator
        this.chatState.updateChatHistory(history => {
          const updated = [...history];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === MessageRole.MODEL) {
            updated[lastIdx] = {
              role: MessageRole.MODEL,
              content: accumulatedRawText + ' ●●●',
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
          };
        }
        return updated;
      });

      this.chatState.setPipelineStatus(PipelineStatus.RECEIVED_RAW);
      await this.processRawLlmPayload(finalRawText);
    } catch (err: unknown) {
      this.handleConnectivityError(err, trimmed);
    }
  }

  /**
   * Post-processes, extracts, syntax heals, and validates raw JSON lines.
   */
  private async processRawLlmPayload(rawText: string): Promise<void> {
    // Stage 1: Parse and Syntax Healing
    let parsedBlocks: unknown[] = [];
    try {
      parsedBlocks = this.parseAndHealJsonLines(rawText);
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
      this.runCatalogComponentSchemaCheck(parsedBlocks);

      // Stage 3: Ready & Commit Layout Wipes
      this.chatState.setPipelineStatus(PipelineStatus.READY);

      // Turn list of updates back into raw JSON lines text to write to
      // editor draft
      const finalLayoutText = parsedBlocks.map(b => JSON.stringify(b)).join('\n') + '\n';

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

  /**
   * Robust parser extracting JSON objects from blocks, performing syntax
   * repairs.
   */
  private parseAndHealJsonLines(text: string): unknown[] {
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
   * rules configurations.
   */
  private runCatalogComponentSchemaCheck(parsedBlocks: unknown[]): void {
    const catalog = this.catalogManagement.activeCatalog();
    const componentHealMap: Record<string, string> = {};

    if (catalog && catalog.components) {
      for (const key of Object.keys(catalog.components)) {
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
      const bObj = block as Record<string, unknown>;
      const updateComponents = bObj['updateComponents'] as Record<string, unknown>;
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

        const compObj = comp as Record<string, unknown>;
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
              // Fuzzy search matches (Worker 1 addition)
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

        // Recursively strip out dynamic mock setups configuration fields
        const cleanedComp = this.sanitizeComponentObject(compObj);
        // Restore corrected element name
        cleanedComp['component'] = targetType;
        cleanedComponents.push(cleanedComp);
      }

      // Commit sanitized array back in-place
      updateComponents['components'] = cleanedComponents;
    }
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
  private sanitizeComponentObject(obj: Record<string, unknown>): Record<string, unknown> {
    return this.sanitizeValue(obj) as Record<string, unknown>;
  }

  readonly TEST_ONLY = {
    sanitizeComponentObject: (obj: Record<string, unknown>) => this.sanitizeComponentObject(obj),
  };

  /**
   * Connectivity Exception Handling: bubbles diagnostics stack details.
   * Instantly dismisses overlays locks on network, proxy, or auth failures
   * to restore workspace editing controls immediately.
   */
  private handleConnectivityError(err: unknown, originalPrompt?: string): void {
    const errorMsg = err instanceof Error ? err.message : String(err);

    // Intercept timeouts, proxy locks, or public API fetch failures
    const isConnectivity =
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('fetch') ||
      errorMsg.includes('Timeout') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('504') ||
      errorMsg.includes('Proxy') ||
      errorMsg.includes('proxy') ||
      errorMsg.includes('NetworkError') ||
      errorMsg.includes('TypeError') ||
      errorMsg.includes('connection') ||
      errorMsg.includes('Connection') ||
      errorMsg.includes('401') ||
      errorMsg.includes('403') ||
      errorMsg.includes('credential') ||
      errorMsg.includes('quota') ||
      errorMsg.includes('blocked') ||
      errorMsg.includes('503') ||
      errorMsg.includes('UNAVAILABLE');

    if (isConnectivity) {
      // Instantly dismiss loading overlay locks
      this.chatState.setPipelineStatus(PipelineStatus.IDLE);
    } else {
      this.chatState.setPipelineStatus(PipelineStatus.FAILED);
    }
    this.chatState.setProgrammaticStreamActive(false);

    let errorDetails: string;
    if (err instanceof Error) {
      errorDetails = `Exception: ${err.message}\nStack: ${err.stack || 'None'}`;
    } else {
      errorDetails = `Unknown Exception: ${JSON.stringify(err)}`;
    }

    const isValidationError =
      errorMsg.includes('validation') ||
      errorMsg.includes('Syntax recovery') ||
      errorMsg.includes('Validation failure');

    let bubbleText = isValidationError
      ? '⚠️ Validation Failure. The generated layout contains invalid components or structure.'
      : '⚠️ Connectivity Failure. Remote gateway communication drop.';
    let isRetryable = !!originalPrompt;

    // Check specifically for 503 UNAVAILABLE high demand
    const is503 =
      errorMsg.includes('503') ||
      errorMsg.includes('UNAVAILABLE') ||
      errorMsg.includes('high demand') ||
      errorMsg.includes('experiencing high demand');

    if (is503) {
      bubbleText =
        '⚠️ This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.';
      isRetryable = true;
    } else if (errorMsg.includes('Timeout') || errorMsg.includes('504')) {
      bubbleText =
        '⚠️ REST Gateway Timeout. Remote generation service ' +
        'did not respond.\nDetails: ' +
        errorMsg;
    } else if (
      errorMsg.includes('Auth') ||
      errorMsg.includes('401') ||
      errorMsg.includes('403') ||
      errorMsg.includes('credential')
    ) {
      bubbleText =
        '⚠️ Authentication Refused. Please verify your 3P API ' +
        'credentials in Settings.\nDetails: ' +
        errorMsg;
    } else if (
      errorMsg.includes('quota') ||
      errorMsg.includes('blocked') ||
      errorMsg.includes('429')
    ) {
      bubbleText =
        '⚠️ GenAI Service Blocked. Resource quota depleted or ' +
        'content safety limits triggered.\nDetails: ' +
        errorMsg;
    }

    // Guides the developer directly on the error turn bubble content
    let diagnosticText = bubbleText;
    if (!is503) {
      const errorHeader = isValidationError
        ? '[A2UI Schema Validation or Parsing Exception]'
        : '[REST Gateway Timeout or Connectivity Exception]';
      const tipText = isValidationError
        ? 'Tip: Try rephrasing your prompt to guide the model to generate valid components.'
        : 'Tip: Please check your network proxy configurations or supply your third-party Gemini developer token key on the settings page to restore connections.';

      diagnosticText +=
        '\n\n' +
        errorHeader +
        '\n' +
        '-------------------------------------------------\n' +
        'Failed to compile generative turn. Diagnostic stack details:\n\n' +
        errorDetails +
        '\n\n' +
        tipText;
    }

    // Overwrite trailing blank MODEL placeholder bubble in-place to
    // avoid empty bubble drift
    this.chatState.updateChatHistory(history => {
      const updated = [...history];
      const lastIdx = updated.length - 1;
      const errorBubble: LlmMessage = {
        role: MessageRole.ERROR,
        content: diagnosticText,
        ...(isRetryable ? {isRetryable: true, originalPrompt} : {}),
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
  readonly systemPrompt = computed<string>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return (
        'You are an AI assistant designed to help model mock screens ' +
        'inside A2UI Composer shell.\n' +
        'Status: Awaiting renderer dynamic handshake settlement...'
      );
    }

    return this.generateSystemPrompt(JSON.stringify(catalog, null, 2));
  });

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
