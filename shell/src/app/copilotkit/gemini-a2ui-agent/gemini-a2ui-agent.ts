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
import {AbstractAgent} from '@ag-ui/client';
import {EventType, type BaseEvent, type Message, type RunAgentInput} from '@ag-ui/core';
import {Observable} from 'rxjs';
import {A2uiGenerationService} from '../a2ui-generation/a2ui-generation.service';
import {LlmMessage, MessageRole} from '../../chat/llm-client/llm-client';

/** The custom tool the agent emits to hand a validated A2UI layout to the UI. */
export const RENDER_A2UI_TOOL = 'render_a2ui';
/** The custom tool the agent emits to surface silently-applied component-name heals. */
export const A2UI_REPAIR_TOOL = 'a2ui_repair';

const STATUS_NARRATION = 'Generating your UI…';

/**
 * In-browser AG-UI agent that wraps the composer's existing client-side Gemini
 * generation pipeline ({@link A2uiGenerationService}) and exposes it to the
 * CopilotKit sidebar. The raw model JSONL never reaches the conversation: the
 * agent emits short, deterministic status narration as an assistant text
 * message, then hands the healed/validated A2UI blocks to the UI as a
 * `render_a2ui` tool call (plus an `a2ui_repair` tool call when the pipeline
 * corrected any component names). No backend — everything runs in the browser.
 */
@Injectable({providedIn: 'root'})
export class GeminiA2uiAgent extends AbstractAgent {
  private readonly generation = inject(A2uiGenerationService);
  private cancelled = false;

  constructor() {
    super({agentId: 'default'});
  }

  override run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>(subscriber => {
      this.cancelled = false;
      const threadId = input.threadId;
      const runId = input.runId;
      const messageId = crypto.randomUUID();

      const emit = (event: BaseEvent) => {
        if (!this.cancelled) subscriber.next(event);
      };

      void (async () => {
        try {
          emit({type: EventType.RUN_STARTED, threadId, runId} as BaseEvent);

          // Deterministic, agent-synthesized status text — NOT model prose.
          emit({type: EventType.TEXT_MESSAGE_START, messageId, role: 'assistant'} as BaseEvent);
          emit({type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: STATUS_NARRATION} as BaseEvent);
          emit({type: EventType.TEXT_MESSAGE_END, messageId} as BaseEvent);

          // Stream the model's thinking as an AG-UI reasoning message so the
          // sidebar shows it live in a collapsible reasoning bubble. Only the
          // thoughts flow here — the raw JSONL still never reaches the thread.
          const reasoningId = crypto.randomUUID();
          let reasoningStarted = false;
          const onThinking = (delta: string) => {
            if (!delta || this.cancelled) return;
            if (!reasoningStarted) {
              reasoningStarted = true;
              emit({
                type: EventType.REASONING_MESSAGE_START,
                messageId: reasoningId,
                role: 'reasoning',
              } as BaseEvent);
            }
            emit({type: EventType.REASONING_MESSAGE_CONTENT, messageId: reasoningId, delta} as BaseEvent);
          };

          const messages = this.toLlmContext(input.messages);
          const result = await this.generation.generate(messages, {onThinking});
          if (reasoningStarted) {
            emit({type: EventType.REASONING_MESSAGE_END, messageId: reasoningId} as BaseEvent);
          }
          if (this.cancelled) {
            subscriber.complete();
            return;
          }

          if (result.ok) {
            this.emitToolCall(emit, RENDER_A2UI_TOOL, messageId, {
              surfaceTitle: result.surfaceTitle,
              blocks: result.blocks,
            });
            if (result.heals.length > 0) {
              this.emitToolCall(emit, A2UI_REPAIR_TOOL, messageId, {fixes: result.heals});
            }
            emit({type: EventType.RUN_FINISHED, threadId, runId} as BaseEvent);
          } else {
            // Surface the typed error as a friendly assistant message, then end the run.
            const errId = crypto.randomUUID();
            emit({type: EventType.TEXT_MESSAGE_START, messageId: errId, role: 'assistant'} as BaseEvent);
            emit({
              type: EventType.TEXT_MESSAGE_CONTENT,
              messageId: errId,
              delta: `${result.title}: ${result.message}${result.tip ? `\n\n${result.tip}` : ''}`,
            } as BaseEvent);
            emit({type: EventType.TEXT_MESSAGE_END, messageId: errId} as BaseEvent);
            emit({type: EventType.RUN_ERROR, message: result.message} as BaseEvent);
          }
          subscriber.complete();
        } catch (err) {
          if (!this.cancelled) {
            emit({type: EventType.RUN_ERROR, message: err instanceof Error ? err.message : String(err)} as BaseEvent);
          }
          subscriber.complete();
        }
      })();

      // Teardown: cancel the in-flight Gemini stream when the run is aborted.
      return () => {
        this.cancelled = true;
        this.generation.cancel();
      };
    });
  }

  /** Streams a complete tool call (START → ARGS → END) as three AG-UI events. */
  private emitToolCall(
    emit: (event: BaseEvent) => void,
    toolName: string,
    parentMessageId: string,
    args: unknown,
  ): void {
    const toolCallId = crypto.randomUUID();
    emit({type: EventType.TOOL_CALL_START, toolCallId, toolCallName: toolName, parentMessageId} as BaseEvent);
    emit({type: EventType.TOOL_CALL_ARGS, toolCallId, delta: JSON.stringify(args)} as BaseEvent);
    emit({type: EventType.TOOL_CALL_END, toolCallId} as BaseEvent);
  }

  /**
   * Maps the AG-UI thread into the composer's LlmMessage context: the system
   * prompt (catalog-driven, read live) followed by the user/assistant text
   * turns. Tool calls and empty turns are dropped.
   */
  private toLlmContext(messages: ReadonlyArray<Message>): LlmMessage[] {
    const context: LlmMessage[] = [{role: MessageRole.SYSTEM, content: this.generation.systemPrompt()}];
    for (const message of messages) {
      const content = typeof message.content === 'string' ? message.content.trim() : '';
      if (!content) continue;
      if (message.role === 'user') {
        context.push({role: MessageRole.USER, content});
      } else if (message.role === 'assistant' && content !== STATUS_NARRATION) {
        context.push({role: MessageRole.MODEL, content});
      }
    }
    return context;
  }
}
