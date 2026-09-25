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

import {Component, computed, inject, ViewEncapsulation} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  CopilotChatView,
  CopilotChatMessageView,
  CopilotChatUserMessage,
  CopilotChatAssistantMessage,
  CopilotChatUserMessageCopyButton,
  CopilotChatAssistantMessageCopyButton,
  provideCopilotChatLabels,
} from '@copilotkit/angular';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {AutoScroll, ChatPanelBase} from '../chat-panel/chat-panel-base';
import {isRenderA2uiItem, parseAndHealJsonLines} from '../a2ui-payload-parser/a2ui-payload-parser';
import {LlmMessage, MessageRole} from '../llm-client/llm-client';
import {RendererSelection} from '../renderer-selection/renderer-selection';
import {stableStringify} from '../../storage/stable-stringify/stable-stringify';

/** A chat turn as the CopilotKit panel presents it. */
export interface PresentedTurn extends LlmMessage {
  /** Stable ID that CopilotKit uses to match rendered messages to turns. */
  id: string;
  isSnapshot: boolean;
  isStreaming: boolean;
  componentCount: number | null;
  /** The text CopilotKit renders for the turn: a summary for canvas JSON, else the message. */
  displayContent: string;
  /** A key-order-independent fingerprint of a snapshot's JSON, to spot repeats. */
  snapshotSignature: string | null;
}

/**
 * Controlled CopilotKit presentation of Composer's conversation and generation
 * actions. All CopilotKit usage in Composer lives in this folder; applications
 * that can't depend on CopilotKit keep the default plain chat panel.
 */
@Component({
  selector: 'a2ui-composer-chat-panel',
  standalone: true,
  imports: [
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    RouterLink,
    AutoScroll,
    CopilotChatView,
    CopilotChatMessageView,
    CopilotChatUserMessage,
    CopilotChatAssistantMessage,
    CopilotChatUserMessageCopyButton,
    CopilotChatAssistantMessageCopyButton,
  ],
  providers: [provideCopilotChatLabels({welcomeMessageText: 'Build on your canvas'})],
  templateUrl: './copilotkit-chat-panel.ng.html',
  // CopilotKit renders its own child components, so its stylesheet and theme
  // are loaded unencapsulated when this panel mounts and scoped by selector.
  styleUrls: ['./copilotkit-chat-panel.scss', './copilotkit-theme.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CopilotKitChatPanel extends ChatPanelBase {
  /**
   * Backs the renderer menu in the prompt pill, which makes switching output
   * formats, for example to the Slack renderer, one step instead of a trip to
   * Settings.
   */
  protected readonly rendererSelection = inject(RendererSelection);

  /** The active renderer's configured display name, so no renderer is special-cased. */
  protected readonly rendererLabel = computed(
    () => this.rendererSelection.activeRenderer()?.name ?? 'Renderer',
  );

  protected readonly isRendererSwitchDisabled = computed(
    () => this.isLocked() || this.isReadingFiles() || this.rendererSelection.isSwitching(),
  );

  protected async selectRenderer(rendererId: string): Promise<void> {
    if (this.isRendererSwitchDisabled()) {
      return;
    }
    try {
      await this.rendererSelection.selectRenderer(rendererId);
    } catch {
      // RendererSelection publishes the failure, which the template shows under the menu.
    }
  }

  /**
   * Sends the prompt, unless a renderer switch is in progress.
   *
   * During a switch the Send button is disabled and the panel shows "Switching
   * renderer…". Pressing Enter calls this method directly, so it repeats that
   * check. The prompt stays in the input, and the user sends it once the new
   * renderer's catalog is active, so it's never generated against the old one.
   */
  protected override async submitPrompt(options?: {
    promptId?: string;
    promptTurnIndex?: number;
    retryOfPromptId?: string;
  }): Promise<void> {
    if (this.rendererSelection.isSwitching()) {
      // Not sent: the text stays in the input until the switch finishes.
      return;
    }
    await super.submitPrompt(options);
  }

  /**
   * The visible conversation, prepared for CopilotKit.
   *
   * CopilotKit renders every turn as Markdown prose, so this panel has to know
   * which turns carry canvas JSON and show a one-line summary for them instead
   * of the raw JSON. That differs from the plain panel's history in a few ways:
   * - Only the newest model turn counts as streaming. The plain panel marks every
   *   model turn as streaming during a stream, which would briefly turn earlier
   *   canvas snapshots back into raw JSON here.
   * - A turn is classified from its content even while it streams, so a response
   *   that starts with `[` or `{` shows "Updating the canvas…" rather than
   *   partial JSON.
   * - A finished model turn whose JSON can't be parsed becomes a parse error card
   *   instead of prose.
   * - The component count only includes components in `updateComponents`
   *   messages, not surface or data-model commands.
   * - Snapshots that repeat what the conversation already shows are dropped
   *   (see `dropRedundantSnapshots`).
   */
  protected readonly presentedTurns = computed<PresentedTurn[]>(() => {
    const history = this.chatState.chatHistory();
    const turns = history.flatMap((message, index) => {
      if (
        message.role === MessageRole.SYSTEM ||
        (!message.content?.trim() &&
          !message.attachments?.length &&
          !message.thinking &&
          message.role !== MessageRole.ERROR)
      ) {
        return [];
      }

      const isStreaming =
        message.role === MessageRole.MODEL && index === history.length - 1 && this.isLocked();
      const cleaned = message.content ? this.chatCleaner.cleanPayload(message.content) : '';
      const parsed = cleaned ? parseAndHealJsonLines(cleaned) : null;
      const isLayout =
        message.role !== MessageRole.ERROR &&
        ((parsed?.success && !parsed.isConversational) ||
          this.chatCleaner.isLayoutSnapshot(message.content) ||
          (message.role === MessageRole.MODEL && isStreaming && /^\s*[\[{]/.test(cleaned)));
      const parseError =
        message.parseError ||
        (message.role === MessageRole.MODEL && isLayout && !isStreaming && parsed && !parsed.success
          ? parsed
          : undefined);
      const isSnapshot = !!isLayout && !parseError;
      const componentCount =
        isSnapshot && parsed?.success
          ? parsed.blocks
              .filter(isRenderA2uiItem)
              .reduce((count, block) => count + (block.updateComponents?.components.length ?? 0), 0)
          : null;
      const snapshotSignature =
        isSnapshot && parsed?.success ? stableStringify(parsed.blocks) : null;
      const displayContent = parseError
        ? 'This response could not update the canvas.'
        : isSnapshot
          ? isStreaming
            ? 'Updating the canvas…'
            : `${componentCount ?? 0} ${componentCount === 1 ? 'component' : 'components'} in this canvas`
          : message.content || '';
      return [
        {
          ...message,
          id: `${message.promptId || 'turn'}-${index}`,
          isSnapshot,
          isStreaming,
          componentCount,
          parseError,
          displayContent,
          snapshotSignature,
        },
      ];
    });
    return this.dropRedundantSnapshots(turns);
  });

  /**
   * Drops canvas snapshots that would repeat what the conversation already shows:
   * - An empty snapshot opening the conversation. A renderer that starts with an
   *   empty canvas would otherwise open the chat with "0 components in this canvas".
   * - A snapshot identical to the assistant snapshot just before it. After a
   *   response is applied, Composer records the resulting canvas as the next
   *   context turn, which would otherwise repeat the same summary.
   */
  private dropRedundantSnapshots(turns: PresentedTurn[]): PresentedTurn[] {
    const visibleTurns: PresentedTurn[] = [];
    for (const turn of turns) {
      const opensWithEmptySnapshot =
        turn.isSnapshot &&
        !turn.isStreaming &&
        !this.isLocked() &&
        turn.componentCount === 0 &&
        visibleTurns.length === 0;
      if (opensWithEmptySnapshot) {
        continue;
      }
      const previousTurn = visibleTurns[visibleTurns.length - 1];
      const repeatsAssistantSnapshot =
        turn.isSnapshot &&
        !!turn.snapshotSignature &&
        previousTurn?.role === MessageRole.MODEL &&
        previousTurn.isSnapshot &&
        previousTurn.snapshotSignature === turn.snapshotSignature;
      if (repeatsAssistantSnapshot) {
        continue;
      }
      visibleTurns.push(turn);
    }
    return visibleTurns;
  }

  // These are read-only projections. Composer owns history, retries, and the active stream.
  protected readonly chatMessages = computed<ReturnType<CopilotChatView['messages']>>(() =>
    this.presentedTurns().map(turn => ({
      id: turn.id,
      role: turn.role === MessageRole.USER ? 'user' : 'assistant',
      content: turn.displayContent,
    })),
  );
  protected readonly turnsById = computed(
    () => new Map(this.presentedTurns().map(turn => [turn.id, turn])),
  );

  /** Classifies a presented turn's bubble for styling. */
  protected getTurnClass(turn: PresentedTurn): string {
    if (turn.role === MessageRole.USER) {
      return turn.isSnapshot ? 'bubble-user bubble-layout' : 'bubble-user bubble-text';
    }
    if (turn.role === MessageRole.MODEL) {
      return 'bubble-model';
    }
    if (turn.role === MessageRole.ERROR) {
      return 'bubble-error';
    }
    return '';
  }
}
