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

import {Component, inject, signal, computed} from '@angular/core';
import {ChatCoordinator} from '../chat-service/chat-coordinator';
import {ChatState} from '../chat-state/chat-state';
import {LlmMessage, MessageRole, Attachment} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {SystemInstructionsDialog} from '../system-instructions-dialog/system-instructions-dialog';
import {tryParseJsonArray} from '../../utils/json';
import {RouterLink} from '@angular/router';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {RenderA2uiItem} from 'a2ui-bridge';

interface AttachedFile extends Attachment {
  readonly previewUrl?: string;
}

/**
 * Displays the interactive Gemini chat dialogue drawer within the Composer
 * shell. Visualizes conversational bubble histories list, loading Overlay
 * milestone Spinners, and handles prompt dispatches with lockout editing
 * controls.
 */
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
    RouterLink,
  ],
  templateUrl: './chat-panel.ng.html',
  styleUrl: './chat-panel.scss',
})
export class ChatPanel {
  private readonly chatCoordinator = inject(ChatCoordinator);
  private readonly chatState = inject(ChatState);
  private readonly dialog = inject(MatDialog);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly startupResolution = inject(StartupResolution);
  private readonly configProvider = inject(AppConfigProvider);

  /**
   * Reactively computed dynamic system prompt instructions spec viewport
   * text.
   */
  protected readonly systemPrompt = this.chatCoordinator.systemPrompt;
  protected readonly isHandshakeComplete = computed(
    () => this.catalogManagement.activeCatalog() !== null,
  );
  protected readonly isChatDisabled = computed(() => {
    const is3P = this.startupResolution.isThirdPartyEnvironment();
    const hasNoKey = !this.configProvider.geminiApiKey();
    return is3P && hasNoKey;
  });

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

  protected readonly isReadingFiles = signal<boolean>(false);

  /** Backing mutable signal capturing prompts typed by researcher. */
  protected readonly userPrompt = signal<string>('');

  /** Backing mutable signal capturing uploaded files context. */
  protected readonly attachedFiles = signal<AttachedFile[]>([]);

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
    const attachments = this.attachedFiles();
    if ((!textVal && attachments.length === 0) || this.isLocked()) {
      return;
    }

    // Instantly clear prompt textarea draft and attachments
    this.userPrompt.set('');
    this.attachedFiles.set([]);

    // Trigger vertex async pipeline stream completions
    await this.chatCoordinator.submitPrompt(textVal, attachments);
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
    const parsedObj = parsed as RenderA2uiItem;
    if (parsedObj['updateComponents'] && typeof parsedObj['updateComponents'] === 'object') {
      const updateObj = parsedObj['updateComponents'];
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
  protected async retryPrompt(prompt: string, attachments: AttachedFile[] = []): Promise<void> {
    this.userPrompt.set(prompt);
    this.attachedFiles.set(attachments);
    await this.submitPrompt();
  }

  protected parseMessage(text: string | undefined): Array<{text: string; isRedacted: boolean}> {
    if (!text) return [];
    const delimiter = 'redacted for your protection';
    const parts = text.split(delimiter);
    const result: Array<{text: string; isRedacted: boolean}> = [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        result.push({text: parts[i], isRedacted: false});
      }
      if (i < parts.length - 1) {
        result.push({text: delimiter, isRedacted: true});
      }
    }
    return result;
  }

  protected async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    this.isReadingFiles.set(true);
    try {
      const newFiles: AttachedFile[] = [];
      const filesArray = Array.from(input.files);

    for (const file of filesArray) {
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds the 10MB size limit.`);
        continue;
      }

      try {
        const attached = await this.readFileAsAttachment(file);
        newFiles.push(attached);
      } catch (err) {
        console.error(`Failed to read file ${file.name}:`, err);
      }
    }

      this.attachedFiles.update(current => [...current, ...newFiles]);
    } finally {
      this.isReadingFiles.set(false);
      input.value = '';
    }
  }

  private readFileAsAttachment(file: File): Promise<AttachedFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read file.'));
          return;
        }
        const commaIndex = result.indexOf(',');
        if (commaIndex === -1) {
          reject(new Error('Invalid data URL format.'));
          return;
        }
        const base64Data = result.substring(commaIndex + 1);
        resolve({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? result : undefined,
        });
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  protected removeAttachment(index: number): void {
    this.attachedFiles.update(current => current.filter((_, i) => i !== index));
  }

  protected isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}
