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

import {
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FileIngestionService, AttachedFile} from '../file-ingestion/file-ingestion.service';
import {MatDialog} from '@angular/material/dialog';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {ScreenshotCaptureService} from '../../shell/screenshot/screenshot-capture.service';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {ChatCleaner} from '../chat-cleaner/chat-cleaner';
import {
  FailureParseResult,
  isRenderA2uiItem,
  parseAndHealJsonLines,
} from '../a2ui-payload-parser/a2ui-payload-parser';
import {ComposerPanelId, OpenPanelEvent} from '../../shell/composer-workspace/composer-panel-id';
import {ChatCoordinator} from '../chat-coordinator/chat-coordinator';
import {ChatState} from '../chat-state/chat-state';
import {LlmMessage, MessageRole} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {SystemInstructionsDialog} from '../system-instructions-dialog/system-instructions-dialog';
import {RendererSelection} from '../renderer-selection/renderer-selection';
import {McpClientManagerService} from '../../mcp/mcp-client-manager.service';
import {CustomInstructionsDialog} from '../custom-instructions-dialog/custom-instructions-dialog';
import {
  ChatPromptFactoryService,
  CustomInstructionsState,
} from '../chat-prompt-factory/chat-prompt-factory.service';

/**
 * Directive responsible for automatically scrolling a container to the bottom whenever its inputs change.
 */
@Directive({
  selector: '[a2uiComposerAutoScroll]',
  standalone: true,
})
export class AutoScroll {
  autoScroll = input<string | undefined>('', {alias: 'a2uiComposerAutoScroll'});
  private readonly el = inject(ElementRef);

  constructor() {
    effect(() => {
      this.autoScroll();
      requestAnimationFrame(() => {
        this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
      });
    });
  }
}

/** A visible chat turn with the display state both panels render. */
export interface PresentedTurn extends LlmMessage {
  id: string;
  isSnapshot: boolean;
  isStreaming: boolean;
  componentCount: number | null;
  displayContent: string;
}

/**
 * State and actions shared by every chat panel implementation. Subclasses
 * supply only the presentation, so the plain panel and the CopilotKit panel
 * submit, retry, attach files, and switch renderers the same way.
 */
@Directive()
export abstract class ChatPanelBase {
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatCoordinator = inject(ChatCoordinator);
  private readonly chatCleaner = inject(ChatCleaner);
  private readonly chatState = inject(ChatState);
  private readonly dialog = inject(MatDialog);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly startupResolution = inject(StartupResolution);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly fileIngestionService = inject(FileIngestionService);
  private readonly screenshotCaptureService = inject(ScreenshotCaptureService);
  protected readonly mcpManager = inject(McpClientManagerService);
  private readonly promptFactory = inject(ChatPromptFactoryService);
  protected readonly hasCustomInstructions = this.promptFactory.hasCustomInstructions;
  protected readonly activeCustomPreset = this.promptFactory.activePreset;
  protected readonly isMcpSupported = computed(() =>
    this.mcpManager.doesCatalogSupportMcp(this.catalogManagement.activeCatalog()),
  );
  protected readonly activeMcpServerCount = computed(
    () => this.mcpManager.getActiveServersWithTools().length,
  );

  protected readonly rendererSelection = inject(RendererSelection);

  protected readonly rendererLabel = computed(() => {
    const renderer = this.rendererSelection.activeRenderer();
    if (!renderer) return 'Renderer';
    if (renderer.id === 'default' || renderer.id === 'angular-dev') return 'A2UI';
    return renderer.name;
  });

  protected readonly isRendererSwitchDisabled = computed(
    () => this.isLocked() || this.isReadingFiles() || this.rendererSelection.isSwitching(),
  );

  protected async selectRenderer(rendererId: string): Promise<void> {
    if (this.isRendererSwitchDisabled()) return;
    try {
      await this.rendererSelection.selectRenderer(rendererId);
    } catch {
      // The shared selection service exposes the failure beside the composer controls.
    }
  }

  protected readonly includeScreenshot = signal<boolean>(false);

  protected onIncludeScreenshotChange(checked: boolean): void {
    this.includeScreenshot.set(checked);
  }

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
  protected readonly visibleChatHistory = computed<PresentedTurn[]>(() => {
    const history = this.chatState.chatHistory();
    return history.flatMap((message, index) => {
      if (
        message.role === MessageRole.SYSTEM ||
        (!message.content?.trim() &&
          !message.attachments?.length &&
          !message.thinking &&
          message.role !== MessageRole.ERROR)
      )
        return [];

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
        },
      ];
    });
  });

  /** Reactively resolved milestones overlay text badges maps. */
  protected readonly pipelineStatusText = computed<string>(() => {
    const status = this.pipelineStatus();
    switch (status) {
      case PipelineStatus.RECEIVING_STREAM:
        return 'Updating your canvas…';
      case PipelineStatus.RECEIVED_RAW:
        return 'Preparing your canvas…';
      case PipelineStatus.VALIDATING:
        return 'Checking your layout…';
      case PipelineStatus.HEALING:
        return 'Repairing the layout…';
      case PipelineStatus.READY:
        return 'Your canvas is ready.';
      case PipelineStatus.FAILED:
        return 'The layout needs attention.';
      default:
        return '';
    }
  });

  /**
   * Delegates plain instructions text queries to GenAI pipeline.
   */
  protected async submitPrompt(options?: {
    promptId?: string;
    promptTurnIndex?: number;
    retryOfPromptId?: string;
  }): Promise<void> {
    const textVal = this.userPrompt().trim();
    const attachments = [...this.attachedFiles()];
    if (
      (!textVal && attachments.length === 0) ||
      this.isLocked() ||
      this.isReadingFiles() ||
      this.rendererSelection.isSwitching() ||
      this.isChatDisabled() ||
      !this.isHandshakeComplete()
    ) {
      return;
    }

    let screenshotSuccess = true;
    if (this.includeScreenshot()) {
      this.isReadingFiles.set(true);
      try {
        const screenshotDataUrl = await this.screenshotCaptureService.captureScreenshot(
          this.hostCommunication.getIframeElement(),
        );
        if (screenshotDataUrl) {
          const commaIndex = screenshotDataUrl.indexOf(',');
          const base64Data =
            commaIndex !== -1 ? screenshotDataUrl.substring(commaIndex + 1) : screenshotDataUrl;
          attachments.push({
            name: 'screenshot.png',
            mimeType: 'image/png',
            data: base64Data,
          });
        }
      } catch (err) {
        console.error('ChatPanel: Failed to capture screenshot context:', err);
        screenshotSuccess = false;
      } finally {
        this.isReadingFiles.set(false);
      }
    }

    if (!screenshotSuccess) {
      return;
    }

    // Clear prompt textarea draft and attachments only after successful capture
    this.userPrompt.set('');
    this.attachedFiles.set([]);

    // Trigger vertex async pipeline stream completions
    await this.chatCoordinator.submitPrompt(textVal, attachments, options);
  }

  /**
   * Cancels the currently active prompt stream.
   */
  protected cancelPrompt(): void {
    this.chatCoordinator.cancelActiveStream();
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
  protected getBubbleClass(message: PresentedTurn): string {
    if (message.role === MessageRole.USER) {
      return message.isSnapshot ? 'bubble-user bubble-layout' : 'bubble-user bubble-text';
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
   * Type-safe helper to extract the parser syntax error message from the structured payload.
   */
  getParseErrorMessage(parseError?: FailureParseResult): string {
    return parseError?.error ?? 'Invalid JSON layout structure';
  }

  viewParseErrorDetails(): void {
    window.dispatchEvent(new OpenPanelEvent(ComposerPanelId.Errors));
  }

  /**
   * Opens the custom instructions configuration modal dialog.
   */
  protected showCustomInstructions(): void {
    const dialogRef = this.dialog.open(CustomInstructionsDialog, {
      data: this.promptFactory.customInstructionsState(),
      width: '600px',
      maxWidth: '90vw',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: CustomInstructionsState | undefined) => {
        if (result) {
          this.promptFactory.setCustomInstructionsState(result);
        }
      });
  }

  /**
   * Opens the system instructions modal dialog.
   */
  protected showSystemInstructions(): void {
    this.dialog.open(SystemInstructionsDialog, {
      data: this.chatCoordinator.systemPrompt(),
      maxWidth: '90vw',
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
  protected async retryPrompt(
    prompt: string,
    attachments: AttachedFile[] = [],
    options?: {promptId?: string},
  ): Promise<void> {
    this.userPrompt.set(prompt);
    this.attachedFiles.set(attachments);
    await this.submitPrompt({
      retryOfPromptId: options?.promptId,
    });
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
          const attached = await this.fileIngestionService.readFileAsAttachment(file);
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

  protected removeAttachment(index: number): void {
    this.attachedFiles.update(current => current.filter((_, i) => i !== index));
  }

  protected isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}
