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
import {ComposerWorkspace} from './composer-workspace';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComposerWorkspaceHarness} from './test/composer-workspace.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {HostCommunication} from '../host-communication/host-communication';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {ChatCoordinator} from '../../chat/chat-service/chat-coordinator';
import {LlmClient, LlmMessage} from '../../chat/llm-client/llm-client';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {PipelineStatus} from '../../chat/pipeline-status/pipeline-status';
import {
  AppConfigProvider,
  EnvMode,
  AuthType,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {signal} from '@angular/core';

class MockChatState {
  readonly chatHistory = signal<LlmMessage[]>([]);
  readonly pipelineStatus = signal(PipelineStatus.IDLE);
  readonly isProgrammaticStreamActive = signal(false);
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
    const entry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }

  clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

class MockChatCoordinator {
  readonly systemPrompt = signal('Initial system prompt block');
  readonly pipelineStatus = signal(PipelineStatus.IDLE);
  readonly isProgrammaticStreamActive = signal(false);
}

class MockStateSync {
  readonly activeDraftSignal = signal('{}');
  readonly activeDraft = this.activeDraftSignal.asReadonly();
  updateDraft = vi.fn((val: string) => {
    this.activeDraftSignal.set(val);
  });
  hydrateActiveDraft = vi.fn(() => this.activeDraftSignal());
}

class MockAppConfigProvider {
  readonly envMode = signal(EnvMode.STANDALONE);
  readonly authType = signal(AuthType.ONE_PARTY);
  readonly rendererUrl = signal('http://localhost:4200/renderer');
  readonly geminiApiKey = signal('');
  readonly themePreference = signal<ThemePreference>('light');
  setThemePreference = vi.fn((theme: ThemePreference) => {
    this.themePreference.set(theme);
  });
}

class MockLlmClient {
  chat = vi.fn();
  chatStream = vi.fn();
}

describe('ComposerWorkspace Dashboard', () => {
  let fixture: ComponentFixture<ComposerWorkspace>;
  let harness: ComposerWorkspaceHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposerWorkspace],
      providers: [
        provideNoopAnimations(),
        {provide: ChatState, useClass: MockChatState},
        {provide: ChatCoordinator, useClass: MockChatCoordinator},
        {provide: StateSync, useClass: MockStateSync},
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: LlmClient, useClass: MockLlmClient},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerWorkspace);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComposerWorkspaceHarness);
  });

  it('creates the central workspace dashboard component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('mounts all primary feature drawer placeholder components via child test harnesses', async () => {
    expect(await harness.getChatPanelHarness()).toBeTruthy();
    expect(await harness.getRenderedFrameHarness()).toBeTruthy();
    expect(await harness.getRawFrameHarness()).toBeTruthy();
    expect(await harness.getDataModelHarness()).toBeTruthy();
  });

  it('renders debugging components inside a mat-tab-group with appropriate labels and conditionally hides Mock Rules', () => {
    const textContent = fixture.nativeElement.textContent;
    expect(textContent).toContain('Data Model');
    expect(textContent).toContain('Events');
    expect(textContent).toContain('Errors');
    expect(textContent).toContain('Raw Messages');
    expect(textContent).not.toContain('Mock Rules');

    fixture.componentInstance.showMockRules.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Mock Rules');
  });

  it(
    'toggles collapse signal and updates the .debug-section.collapsed ' + 'layout class',
    async () => {
      const component = fixture.componentInstance;

      expect(component.isDebugCollapsed()).toBe(false);
      expect(await harness.isDebugSectionCollapsed()).toBe(false);

      // Call toggleDebugCollapse()
      component.toggleDebugCollapse();
      fixture.detectChanges();

      expect(component.isDebugCollapsed()).toBe(true);
      expect(await harness.isDebugSectionCollapsed()).toBe(true);

      // Toggle back
      component.toggleDebugCollapse();
      fixture.detectChanges();

      expect(component.isDebugCollapsed()).toBe(false);
      expect(await harness.isDebugSectionCollapsed()).toBe(false);
    },
  );

  it('delegates clearLogs to all queried child components when clearAllLogs is called', () => {
    const component = fixture.componentInstance;

    const rawMsgSpy = vi.spyOn(component.rawMessages()!, 'clearLogs');
    const eventsSpy = vi.spyOn(component.events()!, 'clearLogs');
    const errorsSpy = vi.spyOn(component.errors()!, 'clearLogs');

    component.clearAllLogs();

    expect(rawMsgSpy).toHaveBeenCalled();
    expect(eventsSpy).toHaveBeenCalled();
    expect(errorsSpy).toHaveBeenCalled();
  });

  describe('Unread Tab Badges', () => {
    let hostComm: HostCommunication;

    beforeEach(() => {
      hostComm = TestBed.inject(HostCommunication);
      fixture.componentInstance.selectedTabIndex.set(0);
      fixture.componentInstance.unreadEventsCount.set(0);
      fixture.componentInstance.unreadErrorsCount.set(0);
      fixture.detectChanges();
    });

    it('increments Events unread count when a SEND_TO_SERVER message arrives and Events tab is inactive', () => {
      expect(fixture.componentInstance.unreadEventsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {action: {name: 'click-button'}},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadEventsCount()).toBe(1);
    });

    it('does not increment Events unread count when a SEND_TO_SERVER message arrives without an action payload', () => {
      expect(fixture.componentInstance.unreadEventsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {name: 'click-button'}, // Missing action!
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadEventsCount()).toBe(0);
    });

    it('does not increment Events unread count when a SEND_TO_SERVER message arrives and Events tab is active (index 1)', () => {
      fixture.componentInstance.selectedTabIndex.set(1);
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadEventsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {action: {name: 'click-button'}},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadEventsCount()).toBe(0);
    });

    it('increments Errors unread count when a CONSOLE_LOG error arrives and Errors tab is inactive', () => {
      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {level: 'error', message: 'Failed to load'},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadErrorsCount()).toBe(1);
    });

    it('increments Errors unread count when a DATA_MODEL_CHANGE validation error arrives and Errors tab is inactive', () => {
      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
        payload: {validationErrors: ['Invalid type']},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadErrorsCount()).toBe(1);
    });

    it('does not increment Errors unread count when a DATA_MODEL_CHANGE arrives with empty validationErrors', () => {
      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.DATA_MODEL_CHANGE,
        payload: {validationErrors: []}, // Empty errors!
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);
    });

    it('does not increment Errors unread count when error arrives and Errors tab is active (index 2)', () => {
      fixture.componentInstance.selectedTabIndex.set(2);
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);

      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {level: 'error', message: 'Failed to load'},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);
    });

    it('resets Events unread count to 0 when switching to Events tab', () => {
      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.SEND_TO_SERVER,
        payload: {action: {name: 'click-button'}},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.unreadEventsCount()).toBe(1);

      fixture.componentInstance.selectedTabIndex.set(1);
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadEventsCount()).toBe(0);
    });

    it('resets Errors unread count to 0 when switching to Errors tab', () => {
      hostComm.TEST_ONLY.triggerMessageStreamForTesting({
        type: PreviewBridgeMessageType.CONSOLE_LOG,
        payload: {level: 'error', message: 'Failed'},
        origin: 'http://localhost',
        timestamp: Date.now(),
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.unreadErrorsCount()).toBe(1);

      fixture.componentInstance.selectedTabIndex.set(2);
      fixture.detectChanges();

      expect(fixture.componentInstance.unreadErrorsCount()).toBe(0);
    });
  });

  it(
    'collapses the debug panel automatically on mount when isExtensionMode ' + 'is true',
    async () => {
      const resolutionService = TestBed.inject(StartupResolution);
      vi.spyOn(resolutionService, 'isExtensionMode').mockReturnValue(true);

      // Recreate fixture to trigger ngOnInit with mock return value
      const newFixture = TestBed.createComponent(ComposerWorkspace);
      newFixture.detectChanges();

      const newHarness = await TestbedHarnessEnvironment.harnessForFixture(
        newFixture,
        ComposerWorkspaceHarness,
      );

      expect(newFixture.componentInstance.isDebugCollapsed()).toBe(true);
      expect(await newHarness.isDebugSectionCollapsed()).toBe(true);
    },
  );
});
