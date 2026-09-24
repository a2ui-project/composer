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
import {ComposerPanelId, ComposerWorkspace} from './composer-workspace';
import {
  ComposerDockview,
  DEFAULT_CONTAINER_WIDTH,
  DEFAULT_CONTAINER_HEIGHT,
} from './composer-dockview.service';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComposerWorkspaceHarness} from './test/composer-workspace.harness';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {HostCommunication} from '../host-communication/host-communication';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {DockviewComponent} from 'dockview';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {ChatCoordinator} from '../../chat/chat-coordinator/chat-coordinator';
import {LlmClient, LlmMessage} from '../../chat/llm-client/llm-client';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {PipelineStatus} from '../../chat/pipeline-status/pipeline-status';
import {
  AppConfigProvider,
  AuthType,
  EnvMode,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {signal} from '@angular/core';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';
import {ErrorLogger} from '../../debug/error-logger.service';

class MockChatState {
  readonly chatHistory = signal<LlmMessage[]>([]);
  readonly pipelineStatus = signal(PipelineStatus.IDLE);
  readonly currentTurnIndex = signal(0);
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
  readonly currentTurnIndex = signal(0);
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
        provideRouter([]),
        {provide: ChatState, useClass: MockChatState},
        {provide: ChatCoordinator, useClass: MockChatCoordinator},
        {provide: StateSync, useClass: MockStateSync},
        {provide: AppConfigProvider, useClass: MockAppConfigProvider},
        {provide: LlmClient, useClass: MockLlmClient},
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
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
    // Dockview dynamically renders panels via dynamicComponentRefs.
    // In jsdom without real dimensions, dockview may not attach them all to the DOM,
    // so we verify they were instantiated by the Angular view container.
    const manager = fixture.debugElement.injector.get(ComposerDockview);
    const refs = manager.dynamicComponentRefs;
    expect(refs.length).toBe(7);
    const types = refs.map(
      (r: unknown) => (r as {componentType: {name: string}}).componentType.name,
    );
    expect(types).toContain('ChatPanel');
    expect(types).toContain('RenderedFrame');
    expect(types).toContain('RawFrame');
    expect(types).toContain('DataModel');
  });

  it('delegates clearLogs to all queried child components when clearAllLogs is called', () => {
    const manager = fixture.debugElement.injector.get(ComposerDockview);

    const rawMsgSpy = vi.spyOn(manager['rawMessagesInstance']!, 'clearLogs');
    const eventsSpy = vi.spyOn(manager['eventsInstance']!, 'clearLogs');
    const errorsSpy = vi.spyOn(manager['errorsInstance']!, 'clearLogs');

    // Use internal state references for the dynamically instantiated components.
    fixture.componentInstance.clearAllLogs();

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
      fixture.componentInstance.unreadEventsCount.set(5);
      fixture.componentInstance.unreadErrorsCount.set(3);
      fixture.detectChanges();
      await fixture.whenStable();

      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      const errorsPanel = manager.api.getGroupPanel(ComposerPanelId.Errors);
      expect(eventsPanel?.title).toBe('Events (5)');
      expect(errorsPanel?.title).toBe('Errors (3)');

      fixture.componentInstance.unreadEventsCount.set(0);
      fixture.componentInstance.unreadErrorsCount.set(0);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(eventsPanel?.title).toBe('Events');
      expect(errorsPanel?.title).toBe('Errors');
    });

    it('updates dockview options with dark theme class dynamically', async () => {
      const configProvider = TestBed.inject(AppConfigProvider) as unknown as MockAppConfigProvider;
      configProvider.themePreference.set(ThemePreference.DARK);
      fixture.detectChanges();
      await fixture.whenStable();

      const manager = fixture.debugElement.injector.get(ComposerDockview);
      expect(manager.api.options.className).toBe('dockview-theme-dark');

      configProvider.themePreference.set(ThemePreference.LIGHT);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(manager.api.options.className).toBe('dockview-theme-light');
    });

    describe('Saved layout recovery', () => {
      let storage: LocalStorageInteractions;
      let previousLayout: string | null;
      let returningFixture: ComponentFixture<ComposerWorkspace> | undefined;

      beforeEach(() => {
        storage = TestBed.inject(LocalStorageInteractions);
        previousLayout = storage.getItem(LocalStorageKey.DOCKVIEW_LAYOUT);
        returningFixture = undefined;
      });

      afterEach(() => {
        vi.useRealTimers();
        returningFixture?.destroy();
        fixture.destroy();
        vi.restoreAllMocks();
        if (previousLayout === null) {
          storage.removeItem(LocalStorageKey.DOCKVIEW_LAYOUT);
        } else {
          storage.setItem(LocalStorageKey.DOCKVIEW_LAYOUT, previousLayout);
        }
      });

      async function returnToWorkspace(): Promise<ComposerDockview> {
        returningFixture = TestBed.createComponent(ComposerWorkspace);
        returningFixture.detectChanges();
        await returningFixture.whenStable();
        return returningFixture.debugElement.injector.get(ComposerDockview);
      }

      it('restores dockview layout from localStorage on initialization', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({}));
        const restoreSpy = vi
          .spyOn(DockviewComponent.prototype, 'fromJSON')
          .mockImplementation(() => {});

        await returnToWorkspace();

        expect(restoreSpy).toHaveBeenCalled();
      });

      it('preserves a real saved layout when leaving and returning to the workspace', async () => {
        const manager = fixture.debugElement.injector.get(ComposerDockview);
        const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');
        manager.setPanelTitle(ComposerPanelId.Rendered, 'My preview');
        vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
        manager.openPanel(ComposerPanelId.Events);
        // Past the 1000ms layout-save debounce.
        await vi.advanceTimersByTimeAsync(1100);
        const savedLayout = storage.getItem(LocalStorageKey.DOCKVIEW_LAYOUT);
        expect(savedLayout).toBe(JSON.stringify(manager.api.toJSON()));

        fixture.destroy();
        await vi.advanceTimersByTimeAsync(1100);
        vi.useRealTimers();
        expect(storage.getItem(LocalStorageKey.DOCKVIEW_LAYOUT)).toBe(savedLayout);

        const restored = await returnToWorkspace();
        expect(restored.api.getGroupPanel(ComposerPanelId.Rendered)?.title).toBe('My preview');
        expect(restored.api.getGroupPanel(ComposerPanelId.Events)?.api.isActive).toBe(true);
        expect(restored.api.panels.map(panel => panel.id).sort()).toEqual(
          Object.values(ComposerPanelId).sort(),
        );
        expect(errorSpy).not.toHaveBeenCalled();
      });

      it.each(['retired panel', 'mismatched panel ID'])(
        'rejects a layout with a %s and opens usable default panels',
        async invalidState => {
          const manager = fixture.debugElement.injector.get(ComposerDockview);
          if (invalidState === 'retired panel') {
            manager.api.addPanel({id: 'retiredPanel', component: 'retiredPanel'});
          }
          const layout = manager.api.toJSON();
          if (invalidState === 'mismatched panel ID') {
            layout.panels[ComposerPanelId.Rendered].id = 'missing';
          }
          fixture.destroy();
          const savedLayout = JSON.stringify(layout);
          storage.setItem(LocalStorageKey.DOCKVIEW_LAYOUT, savedLayout);
          const restoreSpy = vi.spyOn(DockviewComponent.prototype, 'fromJSON');
          const errorSpy = vi.spyOn(TestBed.inject(ErrorLogger), 'error');

          const restored = await returnToWorkspace();

          expect(restoreSpy).not.toHaveBeenCalled();
          expect(restored.api.panels.map(panel => panel.id).sort()).toEqual(
            Object.values(ComposerPanelId).sort(),
          );
          expect(restored.api.getGroupPanel(ComposerPanelId.Rendered)?.title).toBe(
            'Rendered A2UI Preview',
          );
          restored.openPanel(ComposerPanelId.DataModel);
          expect(restored.api.getGroupPanel(ComposerPanelId.DataModel)?.api.isActive).toBe(true);
          expect(errorSpy).toHaveBeenCalledExactlyOnceWith({
            message: 'Failed to restore dockview layout',
            sourceTag: '[Shell]',
          });
          expect(storage.getItem(LocalStorageKey.DOCKVIEW_LAYOUT)).toBe(savedLayout);
        },
      );
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

      const manager = fixture.debugElement.injector.get(ComposerDockview);
      manager.checkTabOverflow(rootEl);
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(rootEl.classList.contains('has-tab-overflow')).toBe(true);

      Object.defineProperty(tabsContainer, 'scrollWidth', {value: 102, configurable: true});
      Object.defineProperty(tabsContainer, 'clientWidth', {value: 100, configurable: true});

      manager.checkTabOverflow(rootEl);
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(rootEl.classList.contains('has-tab-overflow')).toBe(false);
    });

    it('coalesces pending animation frames on multiple rapid calls to checkTabOverflow()', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      let nextId = 100;
      const requestSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(() => ++nextId);

      const manager = fixture.debugElement.injector.get(ComposerDockview) as unknown as {
        checkTabOverflow: (el?: HTMLElement) => void;
        animationFrameId?: number;
      };
      manager.animationFrameId = undefined;

      const rootEl = fixture.componentInstance.dockviewRoot().nativeElement;
      manager.checkTabOverflow(rootEl);
      manager.checkTabOverflow(rootEl);

      expect(cancelSpy).toHaveBeenCalledWith(101);
      requestSpy.mockRestore();
      cancelSpy.mockRestore();
    });

    it('cancels any pending animation frame when the component is destroyed', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      const requestSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(999);

      const manager = fixture.debugElement.injector.get(ComposerDockview) as unknown as {
        checkTabOverflow: (el?: HTMLElement) => void;
        animationFrameId?: number;
      };
      const rootEl = fixture.componentInstance.dockviewRoot().nativeElement;
      manager.checkTabOverflow(rootEl);

      fixture.destroy();

      expect(cancelSpy).toHaveBeenCalledWith(999);
      requestSpy.mockRestore();
      cancelSpy.mockRestore();
    });

    it('uses container element dimensions during initial dockview layout pass', async () => {
      const layoutSpy = vi.spyOn(DockviewComponent.prototype, 'layout');
      const widthSpy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1200);
      const heightSpy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800);

      try {
        const newFixture = TestBed.createComponent(ComposerWorkspace);
        newFixture.detectChanges();
        await newFixture.whenStable();

        expect(layoutSpy).toHaveBeenCalledWith(1200, 800);
      } finally {
        layoutSpy.mockRestore();
        widthSpy.mockRestore();
        heightSpy.mockRestore();
      }
    });

    it('activates panel and triggers change detection when pointerdown occurs on tab element', () => {
      const component = fixture.componentInstance;
      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      const tabEl = eventsPanel.view.tab.element;
      tabEl.classList.add('dv-tab');
      const rootEl = component.dockviewRoot().nativeElement;
      if (!rootEl.contains(tabEl)) {
        rootEl.appendChild(tabEl);
      }

      vi.spyOn(eventsPanel.api, 'isActive', 'get').mockReturnValue(false);
      const setActiveSpy = vi.spyOn(eventsPanel.api, 'setActive');

      tabEl.dispatchEvent(new Event('pointerdown', {bubbles: true, cancelable: true}));

      expect(setActiveSpy).toHaveBeenCalled();
    });

    it('activates panel when click occurs on tab element', () => {
      const component = fixture.componentInstance;
      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      const tabEl = eventsPanel.view.tab.element;
      tabEl.classList.add('dv-tab');
      const rootEl = component.dockviewRoot().nativeElement;
      if (!rootEl.contains(tabEl)) {
        rootEl.appendChild(tabEl);
      }

      vi.spyOn(eventsPanel.api, 'isActive', 'get').mockReturnValue(false);
      const setActiveSpy = vi.spyOn(eventsPanel.api, 'setActive');

      tabEl.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));

      expect(setActiveSpy).toHaveBeenCalled();
    });

    it('activates panel when pointerdown occurs on a nested child element within a tab', () => {
      const component = fixture.componentInstance;
      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      const tabEl = eventsPanel.view.tab.element;
      tabEl.classList.add('dv-tab');
      const childEl = document.createElement('span');
      childEl.className = 'tab-title-text';
      tabEl.appendChild(childEl);

      const rootEl = component.dockviewRoot().nativeElement;
      if (!rootEl.contains(tabEl)) {
        rootEl.appendChild(tabEl);
      }

      vi.spyOn(eventsPanel.api, 'isActive', 'get').mockReturnValue(false);
      const setActiveSpy = vi.spyOn(eventsPanel.api, 'setActive');

      childEl.dispatchEvent(new Event('pointerdown', {bubbles: true, cancelable: true}));

      expect(setActiveSpy).toHaveBeenCalled();
    });

    it('activates panel when click occurs on a nested child element within a tab', () => {
      const component = fixture.componentInstance;
      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      const tabEl = eventsPanel.view.tab.element;
      tabEl.classList.add('dv-tab');
      const childEl = document.createElement('span');
      childEl.className = 'tab-title-text';
      tabEl.appendChild(childEl);

      const rootEl = component.dockviewRoot().nativeElement;
      if (!rootEl.contains(tabEl)) {
        rootEl.appendChild(tabEl);
      }

      vi.spyOn(eventsPanel.api, 'isActive', 'get').mockReturnValue(false);
      const setActiveSpy = vi.spyOn(eventsPanel.api, 'setActive');

      childEl.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));

      expect(setActiveSpy).toHaveBeenCalled();
    });

    it('does not activate panel when click occurs on non-tab workspace elements', () => {
      const component = fixture.componentInstance;
      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      const nonTabEl = document.createElement('div');
      nonTabEl.className = 'some-other-element';
      const rootEl = component.dockviewRoot().nativeElement;
      rootEl.appendChild(nonTabEl);

      vi.spyOn(eventsPanel.api, 'isActive', 'get').mockReturnValue(false);
      const setActiveSpy = vi.spyOn(eventsPanel.api, 'setActive');

      nonTabEl.dispatchEvent(new Event('click', {bubbles: true, cancelable: true}));

      expect(setActiveSpy).not.toHaveBeenCalled();
    });

    it('triggers change detection via cdr.markForCheck when active panel changes', () => {
      const manager = fixture.debugElement.injector.get(ComposerDockview);
      const cdr = manager['cdr'];
      const markForCheckSpy = vi.spyOn(cdr, 'markForCheck');

      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      (
        manager.api as unknown as {
          _onDidActivePanelChange: {fire: (event: {panel: unknown}) => void};
        }
      )['_onDidActivePanelChange'].fire({panel: eventsPanel});

      expect(markForCheckSpy).toHaveBeenCalled();
    });

    it('cleans up event listeners when component is destroyed', () => {
      const rootEl = fixture.componentInstance.dockviewRoot().nativeElement;
      const removeEventListenerSpy = vi.spyOn(rootEl, 'removeEventListener');

      fixture.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'pointerdown',
        expect.any(Function),
        true,
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
    });

    it('tracks debug tab view when active panel changes', () => {
      const trackingService = TestBed.inject(UsageTrackingService);
      const trackSpy = vi.spyOn(trackingService, 'trackDebugTabView');
      const manager = fixture.debugElement.injector.get(ComposerDockview);

      const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
      expect(eventsPanel).toBeDefined();
      if (!eventsPanel) return;

      (
        manager.api as unknown as {
          _onDidActivePanelChange: {fire: (event: {panel: unknown}) => void};
        }
      )['_onDidActivePanelChange'].fire({panel: eventsPanel});

      expect(trackSpy).toHaveBeenCalledWith({panelId: ComposerPanelId.Events});
    });

    describe('Initial Layout Configuration', () => {
      it('places Rendered A2UI Preview and A2UI JSON Editor in the same panel group with Rendered active', () => {
        const manager = fixture.debugElement.injector.get(ComposerDockview);
        const renderedPanel = manager.api.getGroupPanel(ComposerPanelId.Rendered);
        const rawPanel = manager.api.getGroupPanel(ComposerPanelId.Raw);

        expect(renderedPanel).toBeDefined();
        expect(rawPanel).toBeDefined();
        expect(renderedPanel!.group).toBe(rawPanel!.group);

        const panelIds = renderedPanel!.group.panels.map(p => p.id);
        expect(panelIds).toContain(ComposerPanelId.Rendered);
        expect(panelIds).toContain(ComposerPanelId.Raw);
        expect(renderedPanel!.group.activePanel?.id).toBe(ComposerPanelId.Rendered);
      });

      it('groups Data Model, Events, Errors, and Raw Messages together with Data Model active', () => {
        const manager = fixture.debugElement.injector.get(ComposerDockview);
        const dataModelPanel = manager.api.getGroupPanel(ComposerPanelId.DataModel);
        const eventsPanel = manager.api.getGroupPanel(ComposerPanelId.Events);
        const errorsPanel = manager.api.getGroupPanel(ComposerPanelId.Errors);
        const rawMessagesPanel = manager.api.getGroupPanel(ComposerPanelId.RawMessages);

        expect(dataModelPanel).toBeDefined();
        expect(eventsPanel).toBeDefined();
        expect(errorsPanel).toBeDefined();
        expect(rawMessagesPanel).toBeDefined();

        const debugGroup = dataModelPanel!.group;
        expect(eventsPanel!.group).toBe(debugGroup);
        expect(errorsPanel!.group).toBe(debugGroup);
        expect(rawMessagesPanel!.group).toBe(debugGroup);

        const debugPanelIds = debugGroup.panels.map(p => p.id);
        expect(debugPanelIds).toEqual([
          ComposerPanelId.DataModel,
          ComposerPanelId.Events,
          ComposerPanelId.Errors,
          ComposerPanelId.RawMessages,
        ]);
        expect(debugGroup.activePanel?.id).toBe(ComposerPanelId.DataModel);
      });

      it('allocates less vertical space to the debug drawer group relative to the preview group', () => {
        const manager = fixture.debugElement.injector.get(ComposerDockview);
        const renderedPanel = manager.api.getGroupPanel(ComposerPanelId.Rendered);
        const dataModelPanel = manager.api.getGroupPanel(ComposerPanelId.DataModel);

        expect(renderedPanel).toBeDefined();
        expect(dataModelPanel).toBeDefined();

        const previewHeight = renderedPanel!.group.height;
        const debugHeight = dataModelPanel!.group.height;

        expect(debugHeight).toBeLessThan(previewHeight);
        expect(debugHeight).toBeLessThanOrEqual(Math.round(DEFAULT_CONTAINER_HEIGHT * 0.35));
        expect(dataModelPanel!.group.width).toBeGreaterThanOrEqual(renderedPanel!.group.width);
      });

      it('matches debug drawer width with the shared preview and editor tab group width', () => {
        const manager = fixture.debugElement.injector.get(ComposerDockview);
        const renderedPanel = manager.api.getGroupPanel(ComposerPanelId.Rendered);
        const dataModelPanel = manager.api.getGroupPanel(ComposerPanelId.DataModel);

        expect(renderedPanel).toBeDefined();
        expect(dataModelPanel).toBeDefined();
        expect(dataModelPanel!.group.width).toBe(renderedPanel!.group.width);
      });

      it('limits Gemini Assistant initial width to not exceed 1/3 of the overall page width', () => {
        const manager = fixture.debugElement.injector.get(ComposerDockview);
        const chatPanel = manager.api.getGroupPanel(ComposerPanelId.Chat);

        expect(chatPanel).toBeDefined();
        const chatWidth = chatPanel!.group.width;

        expect(chatWidth).toBeLessThanOrEqual(Math.ceil(DEFAULT_CONTAINER_WIDTH / 3));
      });

      it('enforces Gemini Assistant initial width and debug drawer initial height on layout initialization', async () => {
        const storageSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
        const widthSpy = vi
          .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
          .mockReturnValue(1200);
        const heightSpy = vi
          .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
          .mockReturnValue(900);

        try {
          const newFixture = TestBed.createComponent(ComposerWorkspace);
          newFixture.detectChanges();
          await newFixture.whenStable();

          const manager = newFixture.debugElement.injector.get(ComposerDockview);
          const chatPanel = manager.api.getGroupPanel(ComposerPanelId.Chat);
          const dataModelPanel = manager.api.getGroupPanel(ComposerPanelId.DataModel);
          const renderedPanel = manager.api.getGroupPanel(ComposerPanelId.Rendered);

          expect(chatPanel).toBeDefined();
          expect(dataModelPanel).toBeDefined();
          expect(renderedPanel).toBeDefined();

          // Chat <= 1/3 of 1200 (400)
          expect(chatPanel!.group.width).toBeLessThanOrEqual(400);

          // Debug height ~28% of 900 (252), preview ~648
          expect(dataModelPanel!.group.height).toBeLessThan(renderedPanel!.group.height);
          expect(dataModelPanel!.group.height).toBeLessThanOrEqual(300);
        } finally {
          storageSpy.mockRestore();
          widthSpy.mockRestore();
          heightSpy.mockRestore();
        }
      });
    });
  });
});
