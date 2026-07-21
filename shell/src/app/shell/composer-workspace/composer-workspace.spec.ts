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
import {ComposerWorkspace, ComposerPanelId} from './composer-workspace';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComposerWorkspaceHarness} from './test/composer-workspace.harness';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {HostCommunication} from '../host-communication/host-communication';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {DockviewComponent} from 'dockview-core';
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
  readonly authType = signal(AuthType.FIRST_PARTY);
  readonly rendererUrl = signal('http://localhost:4200/renderer');
  readonly geminiApiKey = signal('');
  readonly themePreference = signal<ThemePreference>(ThemePreference.LIGHT);
  readonly includeScreenshot = signal<boolean>(true);
  setThemePreference = vi.fn((theme: ThemePreference) => {
    this.themePreference.set(theme);
  });
  setIncludeScreenshot = vi.fn((include: boolean) => {
    this.includeScreenshot.set(include);
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
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ComposerWorkspace],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
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

  it('mounts all primary feature drawer placeholder components', () => {
    // Default preset is chat-preview; switch to the full layout to exercise every panel type.
    fixture.componentInstance.applyPreset('full');
    fixture.detectChanges();
    // Dockview dynamically renders panels via componentRefs. In jsdom without real
    // dimensions we verify the panel types were instantiated by the view container.
    const refs = (
      fixture.componentInstance as unknown as {componentRefs: {componentType: {name: string}}[]}
    ).componentRefs;
    const types = refs.map(r => r.componentType.name);
    expect(types).toContain('ChatPanel');
    expect(types).toContain('RenderedFrame');
    expect(types).toContain('RawFrame');
    expect(types).toContain('DataModel');
  });

  it('delegates clearLogs to all queried child components when clearAllLogs is called', () => {
    const component = fixture.componentInstance;
    // The debug consoles (Raw Messages / Events / Errors) exist only in the full layout.
    component.applyPreset('full');
    fixture.detectChanges();

    const rawMsgSpy = vi.spyOn(component['rawMessagesInstance']!, 'clearLogs');
    const eventsSpy = vi.spyOn(component['eventsInstance']!, 'clearLogs');
    const errorsSpy = vi.spyOn(component['errorsInstance']!, 'clearLogs');

    // Use internal state references for the dynamically instantiated components.
    // If they aren't instantiated yet, clearLogs should safely no-op via optional chaining
    component.clearAllLogs();

    expect(rawMsgSpy).toHaveBeenCalled();
    expect(eventsSpy).toHaveBeenCalled();
    expect(errorsSpy).toHaveBeenCalled();
  });

  describe('Unread Tab Badges', () => {
    let hostComm: HostCommunication;

    beforeEach(() => {
      hostComm = TestBed.inject(HostCommunication);
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
  });

  it('sets isExtensionMode correctly', async () => {
    const resolutionService = TestBed.inject(StartupResolution);
    vi.spyOn(resolutionService, 'isExtensionMode').mockReturnValue(true);

    const newFixture = TestBed.createComponent(ComposerWorkspace);
    newFixture.detectChanges();

    expect(newFixture.componentInstance.isExtension()).toBe(true);
  });

  describe('Dockview Layout and Effects', () => {
    it('updates events and errors panel titles based on unread count', async () => {
      fixture.componentInstance.applyPreset('full');
      fixture.detectChanges();
      fixture.componentInstance.unreadEventsCount.set(5);
      fixture.componentInstance.unreadErrorsCount.set(3);
      fixture.detectChanges();
      await fixture.whenStable();

      const eventsPanel = fixture.componentInstance['dockviewApi']?.getGroupPanel(
        ComposerPanelId.Events,
      );
      const errorsPanel = fixture.componentInstance['dockviewApi']?.getGroupPanel(
        ComposerPanelId.Errors,
      );
      expect(eventsPanel?.title).toBe('Events (5)');
      expect(errorsPanel?.title).toBe('Errors (3)');

      fixture.componentInstance.unreadEventsCount.set(0);
      fixture.componentInstance.unreadErrorsCount.set(0);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(eventsPanel?.title).toBe('Events');
      expect(errorsPanel?.title).toBe('Errors');
    });

    it('adds and removes the mockRules panel when showMockRules signal changes', async () => {
      fixture.componentInstance.applyPreset('full');
      fixture.detectChanges();
      fixture.componentInstance.showMockRules.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      const mockRulesPanel = fixture.componentInstance['dockviewApi']?.getGroupPanel(
        ComposerPanelId.MockRules,
      );
      expect(mockRulesPanel).toBeDefined();

      fixture.componentInstance.showMockRules.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      const removedPanel = fixture.componentInstance['dockviewApi']?.getGroupPanel(
        ComposerPanelId.MockRules,
      );
      expect(removedPanel).toBeUndefined();
    });

    it('updates dockview options with dark theme class dynamically', async () => {
      const configProvider = TestBed.inject(AppConfigProvider) as unknown as MockAppConfigProvider;
      configProvider.themePreference.set(ThemePreference.DARK);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance['dockviewApi']?.options.className).toBe(
        'dockview-theme-dark',
      );

      configProvider.themePreference.set(ThemePreference.LIGHT);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance['dockviewApi']?.options.className).toBe(
        'dockview-theme-light',
      );
    });

    it('restores dockview layout from localStorage on initialization', async () => {
      // Create new fixture since dockview is initialized on AfterViewInit
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockReturnValue(JSON.stringify({}));
      const newFixture = TestBed.createComponent(ComposerWorkspace);

      const apiSpy = vi.spyOn(DockviewComponent.prototype, 'fromJSON').mockImplementation(() => {});

      newFixture.detectChanges();
      await newFixture.whenStable();

      expect(apiSpy).toHaveBeenCalled();
      apiSpy.mockRestore();
      // Restore the getItem spy so its '{}' return does not leak into later tests.
      getItemSpy.mockRestore();
    });

    it('applies Material M3 tab styling class hook to the Dockview root element', () => {
      const rootEl = fixture.nativeElement.querySelector('.dockview-root');
      expect(rootEl.classList.contains('mat-m3-dockview-tabs')).toBe(true);
    });

    it('toggles has-tab-overflow on the #dockviewRoot element when .dv-tabs-container has scrollWidth > clientWidth + 2', async () => {
      const rootEl: HTMLElement = fixture.nativeElement.querySelector('.dockview-root');
      const tabsContainer = document.createElement('div');
      tabsContainer.className = 'dv-tabs-container';
      rootEl.appendChild(tabsContainer);

      Object.defineProperty(tabsContainer, 'scrollWidth', {value: 200, configurable: true});
      Object.defineProperty(tabsContainer, 'clientWidth', {value: 100, configurable: true});

      (fixture.componentInstance as unknown as {checkTabOverflow: () => void}).checkTabOverflow();
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(rootEl.classList.contains('has-tab-overflow')).toBe(true);

      Object.defineProperty(tabsContainer, 'scrollWidth', {value: 102, configurable: true});
      Object.defineProperty(tabsContainer, 'clientWidth', {value: 100, configurable: true});

      (fixture.componentInstance as unknown as {checkTabOverflow: () => void}).checkTabOverflow();
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(rootEl.classList.contains('has-tab-overflow')).toBe(false);
    });

    it('coalesces pending animation frames on multiple rapid calls to checkTabOverflow()', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      let nextId = 100;
      const requestSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(() => ++nextId);

      const component = fixture.componentInstance as unknown as {
        checkTabOverflow: () => void;
        animationFrameId?: number;
      };
      component.animationFrameId = undefined;

      component.checkTabOverflow();
      component.checkTabOverflow();

      expect(cancelSpy).toHaveBeenCalledWith(101);
      requestSpy.mockRestore();
      cancelSpy.mockRestore();
    });

    it('cancels any pending animation frame when the component is destroyed', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      const requestSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(999);

      const component = fixture.componentInstance as unknown as {
        checkTabOverflow: () => void;
        animationFrameId?: number;
      };
      component.checkTabOverflow();

      fixture.destroy();

      expect(cancelSpy).toHaveBeenCalledWith(999);
      requestSpy.mockRestore();
      cancelSpy.mockRestore();
    });
  });

  describe('Panel-setup presets', () => {
    it('opens on the chat-preview default when no saved layout exists', async () => {
      localStorage.clear();
      const newFixture = TestBed.createComponent(ComposerWorkspace);
      newFixture.detectChanges();
      await newFixture.whenStable();

      const ids = newFixture.componentInstance['dockviewApi'].panels.map(p => p.id).sort();
      expect(ids).toEqual([ComposerPanelId.Chat, ComposerPanelId.Rendered].sort());
      expect(newFixture.componentInstance.activePreset()).toBe('chat-preview');
    });

    it('applyPreset("chat") leaves only the Chat panel', () => {
      const component = fixture.componentInstance;
      component.applyPreset('chat');
      fixture.detectChanges();

      const ids = component['dockviewApi'].panels.map(p => p.id);
      expect(ids).toEqual([ComposerPanelId.Chat]);
      expect(component.activePreset()).toBe('chat');
    });

    it('applyPreset("chat-preview") yields Chat + Rendered', () => {
      const component = fixture.componentInstance;
      component.applyPreset('chat-preview');
      fixture.detectChanges();

      const ids = component['dockviewApi'].panels.map(p => p.id).sort();
      expect(ids).toEqual([ComposerPanelId.Chat, ComposerPanelId.Rendered].sort());
      expect(component.activePreset()).toBe('chat-preview');
    });

    it('applyPreset("full") yields the full panel set', () => {
      const component = fixture.componentInstance;
      component.applyPreset('full');
      fixture.detectChanges();

      const ids = component['dockviewApi'].panels.map(p => p.id);
      expect(ids).toContain(ComposerPanelId.Chat);
      expect(ids).toContain(ComposerPanelId.Rendered);
      expect(ids).toContain(ComposerPanelId.Raw);
      expect(ids).toContain(ComposerPanelId.DataModel);
      expect(ids).toContain(ComposerPanelId.Events);
      expect(ids).toContain(ComposerPanelId.Errors);
      expect(ids).toContain(ComposerPanelId.RawMessages);
      expect(component.activePreset()).toBe('full');
    });

    it('persists the applied preset to localStorage', () => {
      fixture.componentInstance.applyPreset('chat');
      expect(localStorage.getItem('composer_workspace_preset')).toBe('chat');
    });
  });
});
