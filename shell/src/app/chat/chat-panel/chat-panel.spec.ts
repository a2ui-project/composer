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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChatPanel} from './chat-panel';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChatPanelHarness} from './test/chat-panel.harness';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ChatCoordinator} from '../chat-service/chat-coordinator';
import {ChatState, LlmLogEntry, LlmLogType} from '../chat-state/chat-state';
import {signal, inject} from '@angular/core';
import {LlmMessage, MessageRole, Attachment} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {MatInputHarness} from '@angular/material/input/testing';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {HostCommunication} from '../../shell/host-communication/host-communication';

class MockChatState {
  readonly chatHistory = signal<LlmMessage[]>([]);
  readonly pipelineStatus = signal<PipelineStatus>(PipelineStatus.IDLE);
  readonly isProgrammaticStreamActive = signal<boolean>(false);
  readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  readonly llmHistory = signal<LlmLogEntry[]>([]);

  setPipelineStatus(status: PipelineStatus): void {
    this.pipelineStatus.set(status);
  }

  setProgrammaticStreamActive(active: boolean): void {
    this.isProgrammaticStreamActive.set(active);
  }

  setChatHistory(history: LlmMessage[]): void {
    this.chatHistory.set(history);
  }

  updateChatHistory(updater: (h: LlmMessage[]) => LlmMessage[]): void {
    this.chatHistory.update(updater);
  }

  addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry: LlmLogEntry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }

  clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

class MockChatCoordinator {
  private readonly chatState = inject(ChatState) as unknown as MockChatState;

  readonly systemPrompt = signal<string>('Initial system prompt instructions block');

  get pipelineStatus() {
    return this.chatState.pipelineStatus;
  }

  get isProgrammaticStreamActive() {
    return this.chatState.isProgrammaticStreamActive;
  }

  submitPrompt = vi.fn(async (prompt: string, attachments: Attachment[] = []): Promise<void> => {});
  cancelActiveStream = vi.fn();
}

class MockCatalogManagement {
  readonly activeCatalog = signal<Catalog | null>({}); // non-null by default
}

class MockStartupResolution {
  is3PVal = false;
  isThirdPartyEnvironment() {
    return this.is3PVal;
  }
}

class MockAppConfigProvider {
  geminiApiKey = signal<string>('AIzaSyValidKey');
  includeScreenshot = signal<boolean>(false);
  setIncludeScreenshot = vi.fn((include: boolean) => {
    this.includeScreenshot.set(include);
  });
}

class MockHostCommunication {
  captureScreenshot = vi.fn().mockResolvedValue('data:image/png;base64,mockScreenshot');
}

describe('ChatPanel Gemini Dialogue Panel Integration', () => {
  let fixture: ComponentFixture<ChatPanel>;
  let harness: ChatPanelHarness;
  let chatServiceMock: MockChatCoordinator;
  let chatStateMock: MockChatState;
  let catalogManagementServiceMock: MockCatalogManagement;
  let startupResolutionMock: MockStartupResolution;
  let configProviderMock: MockAppConfigProvider;
  let hostCommunicationMock: MockHostCommunication;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatPanel],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        {provide: ChatCoordinator, useClass: MockChatCoordinator},
        {provide: ChatState, useClass: MockChatState},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: StartupResolution, useClass: MockStartupResolution},
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: HostCommunication, useClass: MockHostCommunication},
      ],
    }).compileComponents();

    chatServiceMock = TestBed.inject(ChatCoordinator) as unknown as MockChatCoordinator;
    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    catalogManagementServiceMock = TestBed.inject(
      CatalogManagement,
    ) as unknown as MockCatalogManagement;
    startupResolutionMock = TestBed.inject(StartupResolution) as unknown as MockStartupResolution;
    configProviderMock = TestBed.inject(AppConfigProvider) as unknown as MockAppConfigProvider;
    hostCommunicationMock = TestBed.inject(HostCommunication) as unknown as MockHostCommunication;
    fixture = TestBed.createComponent(ChatPanel);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ChatPanelHarness);
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it(
    'renders the chat panel shell along with empty history welcome ' + 'text correctly',
    async () => {
      expect(harness).toBeTruthy();

      // Verify welcome card renders on empty histories
      const bubbles = await harness.getBubblesText();
      expect(bubbles.length).toBe(0);

      expect(await harness.hasWelcomeNotice()).toBe(true);
      expect(await harness.getWelcomeNoticeText()).toContain('Ask Gemini to shape your layout');
    },
  );

  it(
    'renders conversational turns bubbles log correctly ' +
      'distinguishing plain user text from JSON layout snapshots and ' +
      'counts component nodes',
    async () => {
      const historyMocks: LlmMessage[] = [
        {
          role: MessageRole.USER,
          content: 'please append a basic search form widget',
        },
        {
          role: MessageRole.USER,
          content:
            '{"version": "v0.9", "updateComponents": {"surfaceId": "s1", ' +
            '"components": [{"id":"b1","component":"Button"}]}}',
        },
        {
          role: MessageRole.MODEL,
          content: 'I have successfully updated the layout configurations.',
        },
      ];

      chatStateMock.chatHistory.set(historyMocks);
      fixture.detectChanges();

      const bubbles = await harness.getBubblesText();
      const bubbleTypes = await harness.getBubbleTypes();
      const bubbleHeaders = await harness.getBubbleHeaders();

      expect(bubbles.length).toBe(3);

      // Bubble 1: Human text turn
      expect(bubbleHeaders[0]).toBe('You');
      expect(bubbles[0]).toBe('please append a basic search form widget');
      expect(bubbleTypes[0]).toBe('human-text');

      // Bubble 2: Layout snapshot block
      expect(bubbleHeaders[1]).toBe('Canvas Revision Snapshot');
      expect(bubbles[1]).toBe('Received 1 A2UI JSON Components');
      expect(bubbleTypes[1]).toBe('layout-snapshot');

      // Bubble 3: Model response turn
      expect(bubbleHeaders[2]).toBe('Gemini AI');
      expect(bubbles[2]).toBe('I have successfully updated the layout configurations.');
      expect(bubbleTypes[2]).toBe('model-response');
    },
  );

  it(
    'bubbles and renders connection gateway diagnostic errors inside ' +
      'standard dialogue alerts log',
    async () => {
      const errorLog =
        '[REST Gateway Timeout or Connectivity Exception]\n' +
        '-------------------------------------------------\n' +
        'Failed to compile generative turn. Diagnostic stack details:\n' +
        'Exception: Internal Server Error';

      const historyMocks: LlmMessage[] = [
        {role: MessageRole.USER, content: 'create column'},
        {role: MessageRole.ERROR, content: errorLog},
      ];

      chatStateMock.chatHistory.set(historyMocks);
      fixture.detectChanges();

      const bubbles = await harness.getBubblesText();
      const bubbleTypes = await harness.getBubbleTypes();

      expect(bubbles.length).toBe(2);

      const bubbleHeaders = await harness.getBubbleHeaders();
      expect(bubbleHeaders.length).toBe(1);
      expect(bubbleHeaders[0]).toBe('You');
      expect(bubbles[1]).toContain('Exception: Internal Server Error');
      expect(bubbleTypes[1]).toBe('diagnostic-error');
    },
  );

  it('renders Retry Request action buttons below eligible error bubbles and triggers submitPrompt when clicked', async () => {
    const submitSpy = chatServiceMock.submitPrompt;
    const errorLog = '⚠️ Connectivity Failure. Remote gateway communication drop.';

    const historyMocks: LlmMessage[] = [
      {role: MessageRole.USER, content: 'create standard button'},
      {
        role: MessageRole.ERROR,
        content: errorLog,
        isRetryable: true,
        originalPrompt: 'create standard button',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    expect(await harness.getRetryButtonsCount()).toBe(1);

    await harness.clickRetryButtonAt(0);
    fixture.detectChanges();

    expect(submitSpy).toHaveBeenCalledWith('create standard button', []);
  });

  it(
    'triggers prompt submissions when submit action button is clicked, ' +
      'clearing textarea afterwards',
    async () => {
      const submitSpy = chatServiceMock.submitPrompt;
      // Empty prompt disables Send button
      expect(await harness.isSubmitDisabled()).toBe(true);

      await harness.setPromptText('  Make a pretty dashboard layout   ');
      fixture.detectChanges();

      expect(await harness.isSubmitDisabled()).toBe(false);
      expect(await harness.getPromptText()).toBe('  Make a pretty dashboard layout   ');

      await harness.clickSubmit();
      fixture.detectChanges();

      // Verify submit service call made with sanitized, trimmed inputs
      expect(submitSpy).toHaveBeenCalledWith('Make a pretty dashboard layout', []);

      // Verify textbox cleared out instantly
      expect(await harness.getPromptText()).toBe('');
    },
  );

  it(
    'triggers prompt submissions when keyboard Enter key is pressed ' + 'without Shift modifier',
    async () => {
      const submitSpy = chatServiceMock.submitPrompt;
      await harness.setPromptText('Add Column');
      fixture.detectChanges();

      await harness.pressKeyOnPrompt('Enter', {shiftKey: false});
      fixture.detectChanges();

      expect(submitSpy).toHaveBeenCalledWith('Add Column', []);
      expect(await harness.getPromptText()).toBe('');
    },
  );

  it(
    'preserves newline line-breaks inside prompt textbox when Enter is ' +
      'pressed along with Shift modifier',
    async () => {
      const submitSpy = chatServiceMock.submitPrompt;
      await harness.setPromptText('Line 1');
      fixture.detectChanges();

      await harness.pressKeyOnPrompt('Enter', {shiftKey: true});
      fixture.detectChanges();

      // Submit NOT triggered
      expect(submitSpy).not.toHaveBeenCalled();
    },
  );

  it(
    'forcefully locks out textareas inputs and submit actions during active ' +
      'streams, releasing afterwards',
    async () => {
      await harness.setPromptText('Hello Gemini');
      fixture.detectChanges();

      expect(await harness.isPromptDisabled()).toBe(false);
      expect(await harness.isSubmitDisabled()).toBe(false);

      // Lock panel
      chatStateMock.isProgrammaticStreamActive.set(true);
      fixture.detectChanges();

      expect(await harness.isPromptDisabled()).toBe(true);
      expect(await harness.isSubmitDisabled()).toBe(true);

      // Release lock
      chatStateMock.isProgrammaticStreamActive.set(false);
      fixture.detectChanges();

      expect(await harness.isPromptDisabled()).toBe(false);
      expect(await harness.isSubmitDisabled()).toBe(false);
    },
  );

  it('displays stop button during active stream and triggers cancellation on click', async () => {
    expect(await harness.hasStopButton()).toBe(false);

    // Lock panel simulating active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();

    expect(await harness.hasStopButton()).toBe(true);

    const cancelSpy = vi.spyOn(chatServiceMock, 'cancelActiveStream');

    await harness.clickStop();
    fixture.detectChanges();

    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  it(
    'transitions progress badge overlays reactively matching pipeline ' +
      'milestones and supports click dismiss manual resets',
    async () => {
      expect(await harness.hasLoadingOverlay()).toBe(false);

      // Milestone 1: Receiving LLM stream packets
      chatStateMock.pipelineStatus.set(PipelineStatus.RECEIVING_STREAM);
      fixture.detectChanges();
      expect(await harness.hasLoadingOverlay()).toBe(false);

      // Milestone 2: Received Raw
      chatStateMock.pipelineStatus.set(PipelineStatus.RECEIVED_RAW);
      fixture.detectChanges();
      expect(await harness.getLoadingOverlayText()).toBe('Received A2UI JSON.');

      // Milestone 3: Validation checks running
      chatStateMock.pipelineStatus.set(PipelineStatus.VALIDATING);
      fixture.detectChanges();
      expect(await harness.getLoadingOverlayText()).toBe('Validating A2UI JSON catalog schemas...');

      // Milestone 4: Self-repair auto-healing active
      chatStateMock.pipelineStatus.set(PipelineStatus.HEALING);
      fixture.detectChanges();
      expect(await harness.getLoadingOverlayText()).toBe(
        'Fixing A2UI JSON (Self-repair loop active)...',
      );

      // Milestone 5: Layout Ready (overlay is hidden, inputs are active)
      chatStateMock.pipelineStatus.set(PipelineStatus.READY);
      fixture.detectChanges();
      expect(await harness.hasLoadingOverlay()).toBe(false);

      // Milestone 6: Aborted/Failed turns (overlay is hidden on failure)
      chatStateMock.pipelineStatus.set(PipelineStatus.FAILED);
      fixture.detectChanges();
      expect(await harness.hasLoadingOverlay()).toBe(false);
    },
  );

  it('opens the system instructions dialog when the link is clicked', async () => {
    expect(await harness.hasSystemInstructionsLink()).toBe(true);
    const documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    await harness.clickSystemInstructionsLink();
    fixture.detectChanges();

    const dialogs = await documentRootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const dialog = dialogs[0];
    expect(await dialog.getTitleText()).toBe('System Instructions');
  });

  it('disables the Send button when the catalog handshake is pending, and enables it when complete', async () => {
    // Set activeCatalog to null (handshake pending)
    catalogManagementServiceMock.activeCatalog.set(null);
    await harness.setPromptText('Test prompt');
    fixture.detectChanges();

    // Send button must be disabled
    expect(await harness.isSubmitDisabled()).toBe(true);

    // Set activeCatalog to non-null (handshake resolved)
    catalogManagementServiceMock.activeCatalog.set({});
    fixture.detectChanges();

    // Send button must now be enabled
    expect(await harness.isSubmitDisabled()).toBe(false);
  });

  it('applies the accessible name "Chat prompt" to the prompt textarea', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const input = await loader.getHarness(MatInputHarness);
    const host = await input.host();
    expect(await host.getAttribute('aria-label')).toBe('Chat prompt');
  });

  it('attaches structural accessibility attributes (role, tabindex, aria-label) to the pipeline dismiss overlay', async () => {
    chatStateMock.pipelineStatus.set(PipelineStatus.VALIDATING);
    fixture.detectChanges();

    const attrs = await harness.getPipelineOverlayAttributes();
    expect(attrs.role).toBe('button');
    expect(attrs.tabindex).toBe('0');
    expect(attrs.ariaLabel).toBe('Dismiss status overlay');
  });

  it('applies aria-hidden attribute to purely decorative MatIcon elements across the chat panel', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.ERROR,
        content: 'error',
        isRetryable: true,
        originalPrompt: 'prompt',
      },
    ];
    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const hiddenAttrs = await harness.getIconsAriaHidden();
    expect(hiddenAttrs.length).toBeGreaterThan(0);
    hiddenAttrs.forEach(attr => {
      expect(attr).toBe('true');
    });
  });

  it('disables the chat panel when in a 3P environment and the API key is empty', async () => {
    startupResolutionMock.is3PVal = true;
    configProviderMock.geminiApiKey.set('');
    fixture.detectChanges();

    expect(await harness.isDisabled()).toBe(true);
    expect(await harness.getDisabledNoticeText()).toContain(
      'This feature is only available with a valid Gemini API key.',
    );
    expect(await harness.hasAddKeyButton()).toBe(true);
  });

  it('keeps the chat panel active in 1P environment even if API key is empty', async () => {
    startupResolutionMock.is3PVal = false;
    configProviderMock.geminiApiKey.set('');
    fixture.detectChanges();

    expect(await harness.isDisabled()).toBe(false);
  });

  it('keeps the chat panel active in 3P environment if API key is supplied', async () => {
    startupResolutionMock.is3PVal = true;
    configProviderMock.geminiApiKey.set('AIzaSyValidKey');
    fixture.detectChanges();

    expect(await harness.isDisabled()).toBe(false);
  });

  it('bubbles and renders connection gateway diagnostic errors with collapsible technical details', async () => {
    const errorBubble: LlmMessage = {
      role: MessageRole.ERROR,
      content: 'API key is missing.',
      errorTitle: 'Authentication Refused',
      errorMessage:
        'Please verify your 3P API credentials in Settings. Details: API key is missing.',
      errorDetails: 'Exception: API key is missing.\\nStack: None',
      errorTip: 'Tip: Please check your network proxy configurations...',
    };

    const historyMocks: LlmMessage[] = [
      {role: MessageRole.USER, content: 'create column'},
      errorBubble,
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();

    expect(bubbles.length).toBe(2);

    expect(await harness.hasErrorDetailsAt(1)).toBe(true);
    expect(await harness.getErrorDetailsTextAt(1)).toContain('Exception: API key is missing.');
  });

  it('renders API key redaction in italics in the error bubble', async () => {
    const errorBubble: LlmMessage = {
      role: MessageRole.ERROR,
      content: 'Error with API key: redacted for your protection',
      errorTitle: 'Invalid API Key',
      errorMessage: 'The key redacted for your protection is invalid.',
      errorTip: 'Tip: redacted for your protection is the message.',
      errorDetails: 'Details: redacted for your protection',
    };

    const historyMocks: LlmMessage[] = [{role: MessageRole.USER, content: 'test'}, errorBubble];
    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();
    expect(await harness.isRedactedTextItalicizedAt(1)).toBe(true);
  });

  it('supports selecting files and displays attachment previews', async () => {
    const component = fixture.componentInstance;

    // Simulate selecting a file
    const file = new File(['dummy content'], 'test-image.png', {type: 'image/png'});
    const event = {
      target: {
        files: [file],
        value: '',
      },
    } as unknown as Event;

    await component.onFilesSelected(event);
    fixture.detectChanges();

    // Verify files were added to component signal
    expect(component.attachedFiles().length).toBe(1);
    expect(component.attachedFiles()[0].name).toBe('test-image.png');
    expect(component.attachedFiles()[0].mimeType).toBe('image/png');

    // Verify previews are rendered using harness
    expect(await harness.hasAttachmentPreviews()).toBe(true);
    const attachmentNames = await harness.getAttachmentNames();
    expect(attachmentNames).toContain('test-image.png');

    // Remove the attachment using harness
    await harness.clickRemoveAttachmentAt(0);
    fixture.detectChanges();

    expect(component.attachedFiles().length).toBe(0);
    expect(await harness.hasAttachmentPreviews()).toBe(false);
  });

  it('submits prompts with attached files successfully', async () => {
    const component = fixture.componentInstance;
    const submitSpy = chatServiceMock.submitPrompt;

    // Simulate attached files
    component.attachedFiles.set([
      {
        name: 'test-image.png',
        mimeType: 'image/png',
        data: 'base64data...',
        previewUrl: 'data:image/png;base64,base64data...',
      },
    ]);
    component.userPrompt.set('Analyze this image');
    fixture.detectChanges();

    await harness.clickSubmit();
    fixture.detectChanges();

    expect(submitSpy).toHaveBeenCalledWith('Analyze this image', [
      {
        name: 'test-image.png',
        mimeType: 'image/png',
        data: 'base64data...',
        previewUrl: 'data:image/png;base64,base64data...',
      },
    ]);
    expect(component.attachedFiles().length).toBe(0);
    expect(component.userPrompt()).toBe('');
  });

  describe('Screenshot Integration', () => {
    it('renders the screenshot checkbox toggle in the action bar', async () => {
      expect(await harness.hasScreenshotCheckbox()).toBe(true);
      expect(await harness.isScreenshotChecked()).toBe(false);
    });

    it('toggles setting when checkbox is clicked', async () => {
      expect(await harness.isScreenshotChecked()).toBe(false);
      const setScreenshotSpy = vi.spyOn(configProviderMock, 'setIncludeScreenshot');

      await harness.toggleScreenshot();
      fixture.detectChanges();

      expect(setScreenshotSpy).toHaveBeenCalledWith(true);
      expect(await harness.isScreenshotChecked()).toBe(true);
    });

    it('captures screenshot and attaches it when sending prompt with includeScreenshot enabled', async () => {
      const component = fixture.componentInstance;
      const submitSpy = chatServiceMock.submitPrompt;
      const captureSpy = vi.spyOn(hostCommunicationMock, 'captureScreenshot');

      configProviderMock.includeScreenshot.set(true);
      component.userPrompt.set('Add button');
      fixture.detectChanges();

      await harness.clickSubmit();
      fixture.detectChanges();

      expect(captureSpy).toHaveBeenCalledTimes(1);
      expect(submitSpy).toHaveBeenCalledWith('Add button', [
        {
          name: 'screenshot.png',
          mimeType: 'image/png',
          data: 'mockScreenshot',
        },
      ]);
    });

    it('does not capture or attach screenshot when sending prompt with includeScreenshot disabled', async () => {
      const component = fixture.componentInstance;
      const submitSpy = chatServiceMock.submitPrompt;
      const captureSpy = vi.spyOn(hostCommunicationMock, 'captureScreenshot');

      configProviderMock.includeScreenshot.set(false);
      component.userPrompt.set('Add button');
      fixture.detectChanges();

      await harness.clickSubmit();
      fixture.detectChanges();

      expect(captureSpy).not.toHaveBeenCalled();
      expect(submitSpy).toHaveBeenCalledWith('Add button', []);
    });
  });
});
