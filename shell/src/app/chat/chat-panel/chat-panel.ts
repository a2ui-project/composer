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

import {Component, inject, signal, computed} from '@angular/core';
import {ChatCoordinator} from '../chat-service/chat-coordinator';
import {ChatState} from '../chat-state/chat-state';
import {LlmMessage} from '../llm-client/llm-client';
import {MessageRole} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import {CatalogManagement} from '../../storage/catalog-management';
import {SystemInstructionsDialog} from '../system-instructions-dialog/system-instructions-dialog';
import {tryParseJsonArray} from '../../utils/json';

@Component({
  selector: 'a2ui-composer-chat-panel',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './chat-panel.ng.html',
  styleUrl: './chat-panel.scss',
})
/**
 * Displays the interactive Gemini chat dialogue drawer within the Composer
 * shell. Visualizes conversational bubble histories list, loading Overlay
 * milestone Spinners, and handles prompt dispatches with lockout editing
 * controls.
 */
export class ChatPanel {
  private readonly chatCoordinator = inject(ChatCoordinator);
  private readonly chatState = inject(ChatState);
  private readonly dialog = inject(MatDialog);
  private readonly catalogManagement = inject(CatalogManagement);

  /**
   * Reactively computed dynamic system prompt instructions spec viewport
   * text.
   */
  protected readonly systemPrompt = this.chatCoordinator.systemPrompt;
  protected readonly isHandshakeComplete = computed(
    () => this.catalogManagement.activeCatalog() !== null,
  );

  /**
   * Exposes the active streaming pipeline execution status point
   * reactively.
   */
  protected readonly pipelineStatus = this.chatState.pipelineStatus;

  /**
   * Dynamic panel lockout indicators, preventing deadlocks during stream
   * completions.
   */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;

  /** Backing mutable signal capturing prompts typed by researcher. */
  protected readonly userPrompt = signal<string>('');

  /**
   * Reactively computed visible logs history turns log list excluding
   * system specs.
   */
  protected readonly visibleChatHistory = computed<
    Array<LlmMessage & {isSnapshot: boolean; componentCount?: number}>
  >(() => {
    return this.chatState
      .chatHistory()
      .filter(m => m.role !== MessageRole.SYSTEM)
      .map(m => {
        const isSnapshot = this.isLayoutSnapshot(m.content);
        if (isSnapshot) {
          return {
            ...m,
            isSnapshot,
            componentCount: this.getComponentCount(m.content),
          };
        }
        return {...m, isSnapshot};
      });
  });

  /** Reactively resolved milestones overlay text badges maps. */
  protected readonly pipelineStatusText = computed<string>(() => {
    const status = this.pipelineStatus();
    switch (status) {
      case PipelineStatus.RECEIVING_STREAM:
        return 'Receiving A2UI JSON stream...';
      case PipelineStatus.RECEIVED_RAW:
        return 'Received A2UI JSON.';
      case PipelineStatus.VALIDATING:
        return 'Validating A2UI JSON catalog schemas...';
      case PipelineStatus.HEALING:
        return 'Fixing A2UI JSON (Self-repair loop active)...';
      case PipelineStatus.READY:
        return 'Raw A2UI JSON is ready.';
      case PipelineStatus.FAILED:
        return 'A2UI JSON validation failed.';
      default:
        return '';
    }
  });

  /**
   * Delegates plain instructions text queries to GenAI pipeline.
   */
  protected async submitPrompt(): Promise<void> {
    const textVal = this.userPrompt().trim();
    if (!textVal || this.isLocked()) {
      return;
    }

    // Instantly clear prompt textarea draft
    this.userPrompt.set('');

    // Trigger vertex async pipeline stream completions
    await this.chatCoordinator.submitPrompt(textVal);
  }

  /**
   * Keydown listener intercepting Enter triggers (without line breaks
   * submits) and preserving Shift+Enter.
   */
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void this.submitPrompt();
    }
  }

  /**
   * Classifies dialogue turn bubbles mapping semantic CSS layout classes.
   */
  protected getBubbleClass(message: LlmMessage): string {
    if (message.role === MessageRole.USER) {
      return this.isLayoutSnapshot(message.content)
        ? 'bubble-user bubble-layout'
        : 'bubble-user bubble-text';
    }
    if (message.role === MessageRole.MODEL) {
      return 'bubble-model';
    }
    if (message.role === MessageRole.ERROR) {
      return 'bubble-error';
    }
    return '';
  }

  /**
   * Distinguishes user prompts from visual snap dispatch code snippets.
   */
  protected isLayoutSnapshot(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith('{"version"') || (trimmed.startsWith('[') && trimmed.endsWith(']'));
  }

  /**
   * Dynamically parses visual turn snap contents and counts number of
   * components declared inside.
   */
  protected getComponentCount(content: string): number {
    try {
      const trimmed = content.trim();
      const parsedArray = tryParseJsonArray(trimmed);
      if (parsedArray) {
        return parsedArray.reduce(
          (acc: number, cmd: unknown) => acc + this.getCommandComponentCount(cmd),
          0,
        );
      }

      const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
      let count = 0;
      for (const line of lines) {
        if (!line.startsWith('{')) {
          continue;
        }

        try {
          const parsed = JSON.parse(line);
          count += this.getCommandComponentCount(parsed);
        } catch (e) {
          // Ignore single line parse failures to remain resilient
        }
      }
      return count;
    } catch (e) {
      // Swallows parse errors dynamically in visuals badge check loops
    }
    return 0;
  }

  private getCommandComponentCount(parsed: unknown): number {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return 0;
    }
    const parsedObj = parsed as Record<string, unknown>;
    if (parsedObj['updateComponents'] && typeof parsedObj['updateComponents'] === 'object') {
      const updateObj = parsedObj['updateComponents'] as Record<string, unknown>;
      if (Array.isArray(updateObj['components'])) {
        return updateObj['components'].length;
      }
    } else if (parsedObj['createSurface']) {
      return 1;
    }
    return 0;
  }

  /**
   * Opens the system instructions modal dialog.
   */
  protected showSystemInstructions(): void {
    this.dialog.open(SystemInstructionsDialog, {
      data: this.chatCoordinator.systemPrompt(),
      width: '600px',
    });
  }

  /**
   * Resets status back to IDLE, dismissing active milestone overlays.
   */
  protected dismissOverlay(): void {
    this.chatState.setPipelineStatus(PipelineStatus.IDLE);
  }

  /**
   * Re-dispatches a failed dynamic Human prompt turn, bypassing standard
   * inputs validations.
   */
  protected async retryPrompt(prompt: string): Promise<void> {
    this.userPrompt.set(prompt);
    await this.submitPrompt();
  }
}
