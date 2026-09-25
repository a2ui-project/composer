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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ChatPanel} from './chat-panel';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ChatPanelHarness} from './test/chat-panel.harness';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {ChatCoordinator} from '../chat-coordinator/chat-coordinator';
import {ChatState, LlmLogEntry, LlmLogType} from '../chat-state/chat-state';
import {signal, inject, computed} from '@angular/core';
import {LlmMessage, MessageRole, Attachment} from '../llm-client/llm-client';
import {PipelineStatus} from '../pipeline-status/pipeline-status';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {MatDialogHarness} from '@angular/material/dialog/testing';
import {MatMenuHarness} from '@angular/material/menu/testing';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {MatInputHarness} from '@angular/material/input/testing';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {ScreenshotCaptureService} from '../../shell/screenshot/screenshot-capture.service';
import {RendererSelection} from '../renderer-selection/renderer-selection';
import {RendererOption} from '../../settings/settings-service/settings.service';
import {FailureParseResult} from '../a2ui-payload-parser/a2ui-payload-parser';
import {McpClientManagerService} from '../../mcp/mcp-client-manager.service';
import {
  ChatPromptFactoryService,
  CustomInstructionPreset,
  CustomInstructionsState,
} from '../chat-prompt-factory/chat-prompt-factory.service';
import {CustomInstructionsDialogHarness} from '../custom-instructions-dialog/test/custom-instructions-dialog.harness';
import {ComposerPanelId} from '../../shell/composer-workspace/composer-panel-id';

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
  readonly currentTurnIndex = signal<number>(0);

  get pipelineStatus() {
    return this.chatState.pipelineStatus;
  }

  get isProgrammaticStreamActive() {
    return this.chatState.isProgrammaticStreamActive;
  }

  submitPrompt = vi.fn(
    async (
      prompt: string,
      attachments: Attachment[] = [],
      options?: {promptId?: string; promptTurnIndex?: number; retryOfPromptId?: string},
    ): Promise<void> => {},
  );
  cancelActiveStream = vi.fn();
}

class MockChatPromptFactoryService {
  readonly systemPrompt = signal<string>('Initial system prompt instructions block');
  readonly customInstructionsState = signal<CustomInstructionsState>({
    presets: [],
    activePresetId: null,
  });
  readonly activePreset = signal<CustomInstructionPreset | null>(null);
  readonly hasCustomInstructions = signal<boolean>(false);
  setCustomInstructionsState = vi.fn((state: CustomInstructionsState) => {
    this.customInstructionsState.set(state);
    const preset = state.presets.find(p => p.id === state.activePresetId) ?? null;
    this.activePreset.set(preset);
    this.hasCustomInstructions.set(!!preset && preset.content.trim().length > 0);
  });
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
}

class MockHostCommunication {
  getIframeElement = vi.fn().mockReturnValue(null);
}

class MockRendererSelection {
  readonly renderers = signal<RendererOption[]>([
    {id: 'default', name: 'Angular Basic', rendererUrl: '/angular', readOnly: true},
    {id: 'lit', name: 'Lit Basic', rendererUrl: '/lit', readOnly: true},
    {id: 'custom', name: 'My renderer', rendererUrl: '/custom', readOnly: false},
  ]);
  readonly selectedRendererId = signal<string | null>('default');
  readonly activeRenderer = computed(
    () => this.renderers().find(renderer => renderer.id === this.selectedRendererId()) || null,
  );
  readonly isSwitching = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectRenderer = vi.fn(async (rendererId: string) => {
    this.selectedRendererId.set(rendererId);
  });
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
  let screenshotServiceMock: ScreenshotCaptureService;
  let promptFactoryMock: MockChatPromptFactoryService;
  let rendererSelectionMock: MockRendererSelection;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatPanel],
      providers: [
        {
          provide: ScreenshotCaptureService,
          useValue: {
            captureScreenshot: vi.fn().mockResolvedValue('data:image/png;base64,mockScreenshot'),
          },
        },
        provideNoopAnimations(),
        provideRouter([]),
        {provide: ChatCoordinator, useClass: MockChatCoordinator},
        {provide: ChatPromptFactoryService, useClass: MockChatPromptFactoryService},
        {provide: ChatState, useClass: MockChatState},
        {provide: CatalogManagement, useClass: MockCatalogManagement},
        {provide: StartupResolution, useClass: MockStartupResolution},
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: HostCommunication, useClass: MockHostCommunication},
        {provide: RendererSelection, useClass: MockRendererSelection},
      ],
    }).compileComponents();

    chatServiceMock = TestBed.inject(ChatCoordinator) as unknown as MockChatCoordinator;
    promptFactoryMock = TestBed.inject(
      ChatPromptFactoryService,
    ) as unknown as MockChatPromptFactoryService;
    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    catalogManagementServiceMock = TestBed.inject(
      CatalogManagement,
    ) as unknown as MockCatalogManagement;
    startupResolutionMock = TestBed.inject(StartupResolution) as unknown as MockStartupResolution;
    configProviderMock = TestBed.inject(AppConfigProvider) as unknown as MockAppConfigProvider;
    hostCommunicationMock = TestBed.inject(HostCommunication) as unknown as MockHostCommunication;
    screenshotServiceMock = TestBed.inject(ScreenshotCaptureService);
    rendererSelectionMock = TestBed.inject(RendererSelection) as unknown as MockRendererSelection;
    fixture = TestBed.createComponent(ChatPanel);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ChatPanelHarness);
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    vi.restoreAllMocks();
  });

  it('switches the renderer through the shared service without discarding the typed prompt', async () => {
    await harness.setPromptText('Create a score card');
    expect(await harness.getRendererLabel()).toBe('A2UI');
    await harness.selectRenderer('Lit Basic');
    expect(rendererSelectionMock.selectRenderer).toHaveBeenCalledWith('lit');
    expect(await harness.getRendererLabel()).toBe('Lit Basic');
    expect(await harness.getPromptText()).toBe('Create a score card');
    expect(chatServiceMock.submitPrompt).not.toHaveBeenCalled();
  });

  it('lists configured renderers with the active option selected and reacts to external switches', async () => {
    rendererSelectionMock.selectedRendererId.set('custom');
    fixture.detectChanges();
    expect(await harness.getRendererLabel()).toBe('My renderer');
    const choices = await harness.getRendererChoices();
    expect(choices).toHaveLength(3);
    expect(choices.map(choice => choice.selected)).toEqual([false, false, true]);
    expect(choices[1].label).toContain('Lit Basic');
    rendererSelectionMock.selectedRendererId.set('lit');
    fixture.detectChanges();
    expect(await harness.getRendererLabel()).toBe('Lit Basic');
  });

  it('disables renderer changes during generation and renderer loading', async () => {
    expect(await harness.isRendererSelectorDisabled()).toBe(false);
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect(await harness.isRendererSelectorDisabled()).toBe(true);
    chatStateMock.isProgrammaticStreamActive.set(false);
    rendererSelectionMock.isSwitching.set(true);
    fixture.detectChanges();
    expect(await harness.isRendererSelectorDisabled()).toBe(true);
    expect(await harness.getRendererFeedback()).toBe('Switching renderer…');
    await harness.setPromptText('Keep this request');
    expect(await harness.isSubmitDisabled()).toBe(true);
    await harness.pressKeyOnPrompt('Enter');
    expect(chatServiceMock.submitPrompt).not.toHaveBeenCalled();
    expect(await harness.getPromptText()).toBe('Keep this request');
  });

  it('displays renderer failures and preserves the request for recovery', async () => {
    rendererSelectionMock.selectRenderer.mockImplementationOnce(async () => {
      rendererSelectionMock.error.set('The Lit Basic renderer could not connect. Try again.');
      throw new Error('Renderer handshake timed out');
    });
    await harness.setPromptText('Generate a Lit Basic message');
    await harness.selectRenderer('Lit Basic');
    expect(await harness.getRendererFeedback()).toBe(
      'The Lit Basic renderer could not connect. Try again.',
    );
    expect(await harness.getPromptText()).toBe('Generate a Lit Basic message');
    expect(await harness.isRendererSelectorDisabled()).toBe(false);
  });

  it('prevents renderer changes while attachments are being read', async () => {
    fixture.componentInstance.isReadingFiles.set(true);
    fixture.detectChanges();
    expect(await harness.isRendererSelectorDisabled()).toBe(true);
    fixture.componentInstance.isReadingFiles.set(false);
    fixture.detectChanges();
    expect(await harness.isRendererSelectorDisabled()).toBe(false);
  });

  it('renders native CopilotKit prose from ChatState and clears it on a new session', async () => {
    expect(await harness.hasCopilotChatView()).toBe(true);
    chatStateMock.chatHistory.set([
      {role: MessageRole.SYSTEM, content: 'Private system instructions'},
      {role: MessageRole.USER, content: 'Make this clearer', promptId: 'prompt-1'},
      {role: MessageRole.MODEL, content: 'I can help with that.'},
    ]);
    fixture.detectChanges();
    expect(await harness.getCopilotMessageRoles()).toEqual(['user', 'assistant']);
    expect(await harness.getBubblesText()).toEqual(['Make this clearer', 'I can help with that.']);
    chatStateMock.chatHistory.set([]);
    fixture.detectChanges();
    expect(await harness.getBubblesText()).toEqual([]);
    expect(await harness.hasWelcomeNotice()).toBe(false);
    chatStateMock.chatHistory.set([{role: MessageRole.USER, content: 'Start a different layout'}]);
    fixture.detectChanges();
    expect(await harness.getBubblesText()).toEqual(['Start a different layout']);
  });

  it('keeps malformed model JSON out of prose while retaining parser recovery', async () => {
    const invalid = '{"version":"v0.9","updateComponents": BROKEN}';
    chatStateMock.chatHistory.set([
      {
        role: MessageRole.MODEL,
        content: invalid,
        parseError: {error: 'Unexpected token'},
        isRetryable: true,
        originalPrompt: 'Update my layout',
      },
    ]);
    fixture.detectChanges();
    const text = (await harness.getBubblesText()).join(' ');
    expect(text).not.toContain(invalid);
    expect(text).toContain('Unexpected token');
    expect(await harness.hasParseErrorAction()).toBe(true);
    await harness.clickRetryButtonAt(0);
    expect(chatServiceMock.submitPrompt).toHaveBeenCalledWith('Update my layout', [], {
      retryOfPromptId: undefined,
    });
  });

  it('keeps partial JSON in a pending canvas card and surfaces its final parser failure', async () => {
    const partial = '{"vers';
    chatStateMock.isProgrammaticStreamActive.set(true);
    chatStateMock.chatHistory.set([{role: MessageRole.MODEL, content: partial}]);
    fixture.detectChanges();
    expect(await harness.getBubblesText()).toEqual(['Updating the canvas…']);
    expect(await harness.hasStopButton()).toBe(true);
    chatStateMock.isProgrammaticStreamActive.set(false);
    chatStateMock.chatHistory.set([
      {role: MessageRole.MODEL, content: partial, parseError: {error: 'Incomplete response'}},
    ]);
    fixture.detectChanges();
    const text = (await harness.getBubblesText()).join(' ');
    expect(text).not.toContain(partial);
    expect(text).not.toContain('components in this canvas');
    expect(text).toContain('Incomplete response');
    expect(await harness.hasParseErrorAction()).toBe(true);
  });

  it('restores the authoritative conversation on a route remount without duplicating messages', async () => {
    chatStateMock.chatHistory.set([
      {role: MessageRole.USER, content: 'Continue the selected canvas'},
      {role: MessageRole.MODEL, content: 'Here is the next revision.'},
    ]);
    fixture.detectChanges();
    fixture.destroy();
    fixture = TestBed.createComponent(ChatPanel);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ChatPanelHarness);
    expect(await harness.getBubblesText()).toEqual([
      'Continue the selected canvas',
      'Here is the next revision.',
    ]);
    expect(await harness.getCopilotMessageRoles()).toEqual(['user', 'assistant']);
    expect(chatServiceMock.submitPrompt).not.toHaveBeenCalled();
  });

  it('does not submit with Enter before the selected renderer handshake completes', async () => {
    catalogManagementServiceMock.activeCatalog.set(null);
    await harness.setPromptText('Change the selected layout');
    await harness.pressKeyOnPrompt('Enter');
    expect(chatServiceMock.submitPrompt).not.toHaveBeenCalled();
    expect(await harness.getPromptText()).toBe('Change the selected layout');
  });

  it('keeps the active canvas conversation ready when its history is empty', async () => {
    expect(harness).toBeTruthy();

    // Composer already has a canvas session even before its first history snapshot.
    const bubbles = await harness.getBubblesText();
    expect(bubbles.length).toBe(0);

    expect(await harness.hasWelcomeNotice()).toBe(false);
    expect(await harness.getPromptText()).toBe('');
    expect(await harness.hasCopilotChatView()).toBe(true);
  });

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
      expect(bubbleHeaders[1]).toBe('Canvas snapshot');
      expect(bubbles[1]).toBe('1 component in this canvas');
      expect(bubbleTypes[1]).toBe('layout-snapshot');

      // Bubble 3: Model response turn
      expect(bubbleHeaders[2]).toBe('Assistant');
      expect(bubbles[2]).toBe('I have successfully updated the layout configurations.');
      expect(bubbleTypes[2]).toBe('model-response');
    },
  );

  it('classifies turns wrapped in ```jsonl code blocks as layout snapshots and calculates component counts', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content:
          '```jsonl\n{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id":"b1","component":"Button"}, {"id":"b2","component":"Button"}]}}\n```',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('layout-snapshot');
    expect(bubbles[0]).toBe('2 components in this canvas');
  });

  it('classifies turns containing preamble text and ```jsonl code blocks as layout snapshots', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content:
          'Here is your layout:\n```jsonl\n{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id":"b1","component":"Button"}]}}\n```',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('layout-snapshot');
    expect(bubbles[0]).toBe('1 component in this canvas');
  });

  it('counts the single Text component without counting surface or data commands in snapshots', async () => {
    const content = [
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'test'}},
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 's1',
          components: [{id: 'root', component: 'Text', text: 'A single component'}],
        },
      },
      {version: 'v0.9', updateDataModel: {surfaceId: 's1', path: '/', value: {}}},
    ]
      .map(command => JSON.stringify(command))
      .join('\n');
    chatStateMock.chatHistory.set([
      {role: MessageRole.USER, content},
      {role: MessageRole.MODEL, content},
    ]);
    fixture.detectChanges();

    expect(await harness.getBubblesText()).toEqual([
      '1 component in this canvas',
      '1 component in this canvas',
    ]);
  });

  it('does not classify plain text messages mentioning "version" as layout snapshots', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: 'what version of python are you using?',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('human-text');
    expect(bubbles[0]).toBe('what version of python are you using?');
  });

  it('does not classify non-JSON bracketed prose as layout snapshots', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: 'user note [draft]',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('human-text');
    expect(bubbles[0]).toBe('user note [draft]');
  });

  it('ignores empty or whitespace-only messages without rendering empty bubbles', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: 'valid instruction',
      },
      {
        role: MessageRole.USER,
        content: '',
      },
      {
        role: MessageRole.USER,
        content: '   ',
      },
      {
        role: MessageRole.MODEL,
        content: '',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    expect(bubbles.length).toBe(1);
    expect(bubbles[0]).toBe('valid instruction');
  });

  it('handles messages with undefined or missing content gracefully without throwing runtime errors', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: undefined as unknown as string,
        attachments: [
          {name: 'photo.png', mimeType: 'image/png', dataUrl: 'data:image/png;base64,...'},
        ],
      },
      {
        role: MessageRole.USER,
        content: undefined as unknown as string,
      },
      {
        role: MessageRole.MODEL,
        content: undefined as unknown as string,
        thinking: 'thought process',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    expect(() => fixture.detectChanges()).not.toThrow();

    const bubbles = await harness.getBubblesText();
    expect(bubbles.length).toBe(2);
  });

  it('counts only well-formed update blocks when a payload omits its components array', async () => {
    // A partially healed model response can carry an `updateComponents` block with no
    // `components` array. `isRenderA2uiItem` must drop it before the count is taken.
    const malformedArray = JSON.stringify([
      {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'test'}},
      {version: 'v0.9', updateComponents: {surfaceId: 's1'}},
      {version: 'v0.9', updateComponents: {surfaceId: 's1', components: null}},
      {
        version: 'v0.9',
        updateComponents: {surfaceId: 's1', components: [{id: 'c1', component: 'Button'}]},
      },
    ]);

    chatStateMock.chatHistory.set([{role: MessageRole.MODEL, content: malformedArray}]);
    expect(() => fixture.detectChanges()).not.toThrow();

    const bubbles = await harness.getBubblesText();
    expect(bubbles[0]).toBe('1 component in this canvas');
  });

  it('classifies formatted multi-line JSON arrays as layout snapshots and calculates component counts', async () => {
    const formattedArray = JSON.stringify(
      [
        {version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'test'}},
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 's1',
            components: [
              {id: 'c1', component: 'Button'},
              {id: 'c2', component: 'Input'},
            ],
          },
        },
      ],
      null,
      2,
    );

    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: formattedArray,
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('layout-snapshot');
    expect(bubbles[0]).toBe('2 components in this canvas');
  });

  it('renders snapshot badges instead of text bubbles for streaming partial JSON arrays during streaming', async () => {
    chatStateMock.isProgrammaticStreamActive.set(true);
    const partialArray = '[\n  {\n    "version": "v0.9",\n    "createSurface": {"surfaceId": "s1"}';
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: partialArray,
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('layout-snapshot');
    expect(bubbles[0]).toContain('component');
    expect(bubbles[0]).toContain('in this canvas');
    expect(bubbles[0]).not.toContain(partialArray);
  });

  it('strips XML/HTML thinking tags and streaming pulse indicators when classifying layout snapshots', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content: `<thought>Thinking process...</thought>\n{"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id":"b1","component":"Button"}]}} ●●●`,
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('layout-snapshot');
    expect(bubbles[0]).toBe('1 component in this canvas');
  });

  it('ignores prose text brackets when extracting JSON content for snapshot classification', async () => {
    const historyMocks: LlmMessage[] = [
      {
        role: MessageRole.USER,
        content:
          'Here is the layout [note]: {"version": "v0.9", "updateComponents": {"surfaceId": "s1", "components": [{"id":"b1","component":"Button"}]}}',
      },
    ];

    chatStateMock.chatHistory.set(historyMocks);
    fixture.detectChanges();

    const bubbles = await harness.getBubblesText();
    const bubbleTypes = await harness.getBubbleTypes();

    expect(bubbles.length).toBe(1);
    expect(bubbleTypes[0]).toBe('layout-snapshot');
    expect(bubbles[0]).toBe('1 component in this canvas');
  });

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

    expect(submitSpy).toHaveBeenCalledWith('create standard button', [], {
      retryOfPromptId: undefined,
    });
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
      expect(submitSpy).toHaveBeenCalledWith('Make a pretty dashboard layout', [], undefined);

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

      expect(submitSpy).toHaveBeenCalledWith('Add Column', [], undefined);
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
      expect(await harness.getLoadingOverlayText()).toBe('Preparing your canvas…');

      // Milestone 3: Validation checks running
      chatStateMock.pipelineStatus.set(PipelineStatus.VALIDATING);
      fixture.detectChanges();
      expect(await harness.getLoadingOverlayText()).toBe('Checking your layout…');

      // Milestone 4: Self-repair auto-healing active
      chatStateMock.pipelineStatus.set(PipelineStatus.HEALING);
      fixture.detectChanges();
      expect(await harness.getLoadingOverlayText()).toBe('Repairing the layout…');

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

  it('preserves prompt focus when canvas snapshots initialize or reset the conversation', async () => {
    await harness.setPromptText('Keep this draft while the renderer changes');
    const host: HTMLElement = fixture.nativeElement;
    const prompt = host.querySelector('textarea');
    if (!prompt) throw new Error('Expected the chat prompt');
    prompt.focus();
    expect(document.activeElement).toBe(prompt);

    const snapshot: LlmMessage = {
      role: MessageRole.USER,
      content: '[{"version":"v0.9","createSurface":{"surfaceId":"canvas","catalogId":"test"}}]',
    };
    for (const history of [[snapshot], [], [snapshot]]) {
      chatStateMock.chatHistory.set(history);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(host.querySelector('textarea')).toBe(prompt);
      expect(document.activeElement).toBe(prompt);
      expect(await harness.getPromptText()).toBe('Keep this draft while the renderer changes');
    }
  });

  it('keeps the Add menu usable while canvas snapshots initialize or reset the conversation', async () => {
    const host: HTMLElement = fixture.nativeElement;
    const trigger = host.querySelector('.add-prompt-button');
    const menu = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      MatMenuHarness.with({selector: '.add-prompt-button'}),
    );
    await menu.open();
    const focusedItem = document.activeElement;
    expect(focusedItem?.getAttribute('role')).toBe('menuitem');

    const snapshot: LlmMessage = {
      role: MessageRole.USER,
      content: '[{"version":"v0.9","createSurface":{"surfaceId":"canvas","catalogId":"test"}}]',
    };
    for (const history of [[snapshot], [], [snapshot]]) {
      chatStateMock.chatHistory.set(history);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(host.querySelector('.add-prompt-button')).toBe(trigger);
      expect(await menu.isOpen()).toBe(true);
      expect(document.activeElement).toBe(focusedItem);
    }

    await menu.clickItem({text: /Instructions/});
    const dialog =
      await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MatDialogHarness);
    expect(await dialog.getTitleText()).toBe('System Instructions');
  });

  it('opens the system instructions dialog from the Add menu', async () => {
    expect(await harness.hasSystemInstructionsLink()).toBe(true);
    const documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    await harness.clickSystemInstructionsLink();
    fixture.detectChanges();

    const dialogs = await documentRootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const dialog = dialogs[0];
    expect(await dialog.getTitleText()).toBe('System Instructions');
  });

  it('opens the attachment picker only after selecting Attach files from the Add menu', async () => {
    const pickerClick = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    expect((await harness.getAddPromptActions()).map(action => action.text)).toEqual([
      expect.stringContaining('Attach files'),
      expect.stringContaining('Include screenshot'),
      expect.stringContaining('Instructions'),
      expect.stringContaining('Custom Instructions'),
    ]);
    expect(pickerClick).not.toHaveBeenCalled();
    await harness.clickAttachFiles();
    expect(pickerClick).toHaveBeenCalledOnce();
  });

  it('keeps both instruction dialogs available while attachment and screenshot changes are locked', async () => {
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect((await harness.getAddPromptActions()).map(action => action.disabled)).toEqual([
      true,
      true,
      false,
      false,
    ]);
    chatStateMock.isProgrammaticStreamActive.set(false);
    fixture.componentInstance.isReadingFiles.set(true);
    fixture.detectChanges();
    expect((await harness.getAddPromptActions()).map(action => action.disabled)).toEqual([
      true,
      true,
      false,
      false,
    ]);
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

    expect(submitSpy).toHaveBeenCalledWith(
      'Analyze this image',
      [
        {
          name: 'test-image.png',
          mimeType: 'image/png',
          data: 'base64data...',
          previewUrl: 'data:image/png;base64,base64data...',
        },
      ],
      undefined,
    );
    expect(component.attachedFiles().length).toBe(0);
    expect(component.userPrompt()).toBe('');
  });

  describe('Screenshot Integration', () => {
    it('renders the screenshot checkbox option in the Add menu', async () => {
      expect(await harness.hasScreenshotCheckbox()).toBe(true);
      expect(await harness.isScreenshotChecked()).toBe(false);
    });

    it('toggles setting when checkbox is clicked', async () => {
      const component = fixture.componentInstance;
      expect(await harness.isScreenshotChecked()).toBe(false);
      expect(component.includeScreenshot()).toBe(false);

      await harness.toggleScreenshot();
      fixture.detectChanges();

      expect(component.includeScreenshot()).toBe(true);
      expect(await harness.isScreenshotChecked()).toBe(true);
      expect(await harness.getAddPromptDescription()).toContain('screenshot will be included');

      await harness.toggleScreenshot();
      expect(await harness.isScreenshotChecked()).toBe(false);
      expect(await harness.getAddPromptDescription()).toBeNull();
    });

    it('captures screenshot and attaches it when sending prompt with includeScreenshot enabled', async () => {
      const component = fixture.componentInstance;
      const submitSpy = chatServiceMock.submitPrompt;
      const captureSpy = vi.spyOn(screenshotServiceMock, 'captureScreenshot');

      component.includeScreenshot.set(true);
      component.userPrompt.set('Add button');
      fixture.detectChanges();

      await harness.clickSubmit();
      fixture.detectChanges();

      expect(captureSpy).toHaveBeenCalledWith(hostCommunicationMock.getIframeElement());
      expect(submitSpy).toHaveBeenCalledWith(
        'Add button',
        [
          {
            name: 'screenshot.png',
            mimeType: 'image/png',
            data: 'mockScreenshot',
          },
        ],
        undefined,
      );
    });

    it('does not capture or attach screenshot when sending prompt with includeScreenshot disabled', async () => {
      const component = fixture.componentInstance;
      const submitSpy = chatServiceMock.submitPrompt;
      const captureSpy = vi.spyOn(screenshotServiceMock, 'captureScreenshot');

      component.includeScreenshot.set(false);
      component.userPrompt.set('Add button');
      fixture.detectChanges();

      await harness.clickSubmit();
      fixture.detectChanges();

      expect(captureSpy).not.toHaveBeenCalled();
      expect(submitSpy).toHaveBeenCalledWith('Add button', [], undefined);
    });

    it('correlates retryPrompt telemetry options with parent promptId', async () => {
      const submitSpy = chatServiceMock.submitPrompt;
      chatServiceMock.currentTurnIndex.set(2);

      const historyMocks: LlmMessage[] = [
        {
          role: MessageRole.ERROR,
          content: 'error',
          isRetryable: true,
          originalPrompt: 'Build table',
          promptId: 'prompt-123-abc',
        },
      ];
      chatStateMock.chatHistory.set(historyMocks);
      fixture.detectChanges();

      await harness.clickRetryButtonAt(0);
      fixture.detectChanges();

      expect(submitSpy).toHaveBeenCalledWith('Build table', [], {
        retryOfPromptId: 'prompt-123-abc',
      });
    });
  });

  describe('parse error card', () => {
    it('renders parse error card when message has parseError and is not streaming', async () => {
      const historyMocks: LlmMessage[] = [
        {
          role: MessageRole.MODEL,
          content: '{"bad json"',
          parseError: {
            success: false,
            error: 'Unexpected end of JSON input',
            line: 1,
            column: 11,
          },
        },
      ];
      chatStateMock.setChatHistory(historyMocks);
      chatStateMock.setProgrammaticStreamActive(false);
      fixture.detectChanges();

      expect(await harness.hasParseErrorCard()).toBe(true);
      const attributes = await harness.getParseErrorCardAttributes();
      expect(attributes.role).toBe('alert');
      expect(attributes.ariaLive).toBe('assertive');
      expect(await harness.getParseErrorText()).toContain('Unexpected end of JSON input');
    });

    it('dispatches OpenPanelEvent for Errors tab when clicking view error details button', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      const historyMocks: LlmMessage[] = [
        {
          role: MessageRole.MODEL,
          content: '{"bad json"',
          parseError: {
            success: false,
            error: 'Unexpected token',
          },
        },
      ];
      chatStateMock.setChatHistory(historyMocks);
      chatStateMock.setProgrammaticStreamActive(false);
      fixture.detectChanges();

      await harness.clickParseErrorDetailsButton();

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'a2ui-open-panel',
          detail: {panelId: ComposerPanelId.Errors},
        }),
      );
    });

    describe('getParseErrorMessage', () => {
      it('extracts error description when FailureParseResult is provided', () => {
        const failure: FailureParseResult = {
          success: false,
          error: 'Unexpected token at line 2',
          line: 2,
          column: 4,
        };
        const component = fixture.componentInstance;

        expect(component.getParseErrorMessage(failure)).toBe('Unexpected token at line 2');
      });

      it('returns fallback message when parseError is undefined or omitted', () => {
        const component = fixture.componentInstance;

        expect(component.getParseErrorMessage(undefined)).toBe('Invalid JSON layout structure');
        expect(component.getParseErrorMessage()).toBe('Invalid JSON layout structure');
      });
    });
  });

  it('renders custom instructions link and updates text based on active custom preset', async () => {
    expect(await harness.hasCustomInstructionsLink()).toBe(true);
    expect(await harness.getCustomInstructionsLinkText()).toBe('Custom Instructions');

    promptFactoryMock.setCustomInstructionsState({
      presets: [{id: 'preset-1', name: 'Concise Mode', content: 'Be concise'}],
      activePresetId: 'preset-1',
    });
    fixture.detectChanges();

    expect(await harness.getCustomInstructionsLinkText()).toBe('Custom Instructions: Concise Mode');
  });

  it('opens the custom instructions dialog when the custom instructions link is clicked', async () => {
    expect(await harness.hasCustomInstructionsLink()).toBe(true);
    const documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    await harness.clickCustomInstructionsLink();
    fixture.detectChanges();

    const dialogs = await documentRootLoader.getAllHarnesses(MatDialogHarness);
    expect(dialogs.length).toBe(1);

    const dialog = dialogs[0];
    expect(await dialog.getTitleText()).toBe('Custom Instructions');
  });

  it('saves updated custom instructions state to prompt factory when dialog saves', async () => {
    const documentRootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    await harness.clickCustomInstructionsLink();
    fixture.detectChanges();

    const customDialog = await documentRootLoader.getHarness(CustomInstructionsDialogHarness);
    await customDialog.setPresetName('Dark Theme');
    await customDialog.setInstructions('Always generate dark theme.');
    await customDialog.clickSave();
    fixture.detectChanges();

    expect(promptFactoryMock.setCustomInstructionsState).toHaveBeenCalledWith(
      expect.objectContaining({
        presets: [
          expect.objectContaining({
            name: 'Dark Theme',
            content: 'Always generate dark theme.',
          }),
        ],
        activePresetId: expect.any(String),
      }),
    );
  });

  describe('MCP catalog status indicator', () => {
    it('shows "Instructions" when callMcpTool is not in activeCatalog and "Instructions (includes X MCP Servers)" when it is', async () => {
      expect(await harness.getSystemInstructionsLinkText()).toBe('Instructions');

      catalogManagementServiceMock.activeCatalog.set({
        title: 'Basic with MCP',
        components: {},
        functions: {callMcpTool: {type: 'object'}},
      });
      fixture.detectChanges();

      expect(await harness.getSystemInstructionsLinkText()).toBe(
        'Instructions (includes 0 MCP Servers)',
      );

      const mcpManager = TestBed.inject(McpClientManagerService);
      mcpManager.servers.set([
        {
          id: 'server-1',
          url: 'http://localhost:3001/mcp',
          enabled: true,
          status: 'connected',
          tools: [{name: 'sample_tool', inputSchema: {}}],
        },
      ]);
      fixture.detectChanges();

      expect(await harness.getSystemInstructionsLinkText()).toBe(
        'Instructions (includes 1 MCP Server)',
      );

      mcpManager.servers.set([
        {
          id: 'server-1',
          url: 'http://localhost:3001/mcp',
          enabled: true,
          status: 'connected',
          tools: [{name: 'sample_tool_1', inputSchema: {}}],
        },
        {
          id: 'server-2',
          url: 'http://localhost:3002/mcp',
          enabled: true,
          status: 'connected',
          tools: [{name: 'sample_tool_2', inputSchema: {}}],
        },
      ]);
      fixture.detectChanges();

      expect(await harness.getSystemInstructionsLinkText()).toBe(
        'Instructions (includes 2 MCP Servers)',
      );
    });
  });
});
