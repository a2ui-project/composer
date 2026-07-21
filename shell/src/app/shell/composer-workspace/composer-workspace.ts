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
  Component,
  effect,
  inject,
  OnInit,
  AfterViewInit,
  DestroyRef,
  signal,
  untracked,
  computed,
  ElementRef,
  viewChild,
  ViewContainerRef,
  ComponentRef,
  Type,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ChatPanel} from '../../chat/chat-panel/chat-panel';
import {RawFrame} from '../../preview/raw/raw-frame';
import {RenderedFrame} from '../../preview/rendered/rendered-frame';
import {DataModel} from '../../debug/data-model/data-model';
import {Events} from '../../debug/events/events';
import {Errors} from '../../debug/errors/errors';
import {RawMessages} from '../../debug/raw-messages/raw-messages';
import {MockRules} from '../../debug/mock-rules/mock-rules';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {HostCommunication} from '../host-communication/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {DockviewComponent} from 'dockview';

/** Internal interface mapping raw cross-frame workspace telemetry payloads */
interface WorkspaceMessagePayload {
  action?: unknown;
  validationErrors?: unknown[] | Record<string, unknown> | string | boolean;
}

/**
 * Defines the possible panel IDs within the Dockview workspace.
 */
export enum ComposerPanelId {
  Chat = 'chat',
  Rendered = 'rendered',
  Raw = 'raw',
  DataModel = 'dataModel',
  Events = 'events',
  Errors = 'errors',
  RawMessages = 'rawMessages',
  MockRules = 'mockRules',
}

/** Named workspace layout presets selectable from the panel-setup switcher. */
export type WorkspacePreset = 'chat' | 'chat-preview' | 'full';

/** localStorage key remembering the last-applied preset (for the toggle highlight). */
const WORKSPACE_PRESET_KEY = 'composer_workspace_preset';

/**
 * The central workspace hub coordinating split-pane views between
 * the layout editors, active preview frame, and debug consoles.
 */
@Component({
  selector: 'a2ui-composer-workspace',
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule, MatTooltipModule],
  templateUrl: './composer-workspace.ng.html',
  styleUrl: './composer-workspace.scss',
})
export class ComposerWorkspace implements OnInit, AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private startupResolution = inject(StartupResolution);
  private hostComm = inject(HostCommunication);
  private viewContainerRef = inject(ViewContainerRef);
  private configProvider = inject(AppConfigProvider);

  readonly dockviewRoot = viewChild.required<ElementRef<HTMLElement>>('dockviewRoot');

  isExtension = signal(false);
  showMockRules = signal(false);
  unreadEventsCount = signal(0);
  unreadErrorsCount = signal(0);
  isDarkTheme = computed(() => this.configProvider.themePreference() === ThemePreference.DARK);

  /** The workspace layout preset currently applied (drives the switcher highlight). */
  readonly activePreset = signal<WorkspacePreset>('chat-preview');

  private readonly isDockviewInitialized = signal(false);
  private dockviewApi!: DockviewComponent;
  private componentRefs: ComponentRef<unknown>[] = [];

  private rawMessagesInstance?: RawMessages;
  private eventsInstance?: Events;
  private errorsInstance?: Errors;

  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.animationFrameId !== undefined) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.resizeObserver?.disconnect();
      this.dockviewApi?.dispose();
      this.componentRefs.forEach(ref => ref.destroy());
    });

    this.hostComm.messageStream$.pipe(takeUntilDestroyed()).subscribe(envelope => {
      if (!envelope) return;

      const payload = envelope.payload as WorkspaceMessagePayload | undefined;
      const eventsPanel = this.dockviewApi?.getGroupPanel(ComposerPanelId.Events);
      const errorsPanel = this.dockviewApi?.getGroupPanel(ComposerPanelId.Errors);

      if (envelope.type === PreviewBridgeMessageType.SEND_TO_SERVER && payload?.['action']) {
        if (!eventsPanel?.api.isVisible) {
          this.unreadEventsCount.update(count => count + 1);
        }
      } else if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
        if (!errorsPanel?.api.isVisible) {
          this.unreadErrorsCount.update(count => count + 1);
        }
      } else if (
        envelope.type === PreviewBridgeMessageType.DATA_MODEL_CHANGE &&
        payload?.['validationErrors']
      ) {
        const validationErrors = payload['validationErrors'];
        const hasErrors = Array.isArray(validationErrors)
          ? validationErrors.length > 0
          : typeof validationErrors === 'object' && validationErrors !== null
            ? Object.keys(validationErrors).length > 0
            : !!validationErrors;

        if (hasErrors && !errorsPanel?.api.isVisible) {
          this.unreadErrorsCount.update(count => count + 1);
        }
      }
    });

    effect(() => {
      const count = this.unreadEventsCount();
      const panel = untracked(() => this.dockviewApi?.getGroupPanel(ComposerPanelId.Events));
      if (panel) {
        panel.api.setTitle(count > 0 ? `Events (${count})` : 'Events');
      }
    });

    effect(() => {
      const count = this.unreadErrorsCount();
      const panel = untracked(() => this.dockviewApi?.getGroupPanel(ComposerPanelId.Errors));
      if (panel) {
        panel.api.setTitle(count > 0 ? `Errors (${count})` : 'Errors');
      }
    });

    effect(() => {
      const show = this.showMockRules();
      if (!this.isDockviewInitialized()) return;

      const existingPanel = untracked(() =>
        this.dockviewApi.getGroupPanel(ComposerPanelId.MockRules),
      );
      if (show && !existingPanel) {
        const dataModel = this.dockviewApi.getGroupPanel(ComposerPanelId.DataModel);
        if (dataModel) {
          this.dockviewApi.addPanel({
            id: ComposerPanelId.MockRules,
            component: ComposerPanelId.MockRules,
            title: 'Mock Rules',
            position: {referencePanel: ComposerPanelId.DataModel, direction: 'within'},
          });
        }
      } else if (!show && existingPanel) {
        existingPanel.api.close();
      }
    });

    effect(() => {
      const isDark = this.isDarkTheme();
      const api = untracked(() => this.dockviewApi);
      if (api) {
        api.updateOptions({className: isDark ? 'dockview-theme-dark' : 'dockview-theme-light'});
      }
    });
  }

  ngOnInit(): void {
    const isExt = this.startupResolution.isExtensionMode();
    this.isExtension.set(isExt);
  }

  ngAfterViewInit() {
    this.dockviewApi = new DockviewComponent(this.dockviewRoot().nativeElement, {
      className: this.isDarkTheme() ? 'dockview-theme-dark' : 'dockview-theme-light',
      defaultRenderer: 'always',
      createComponent: options => {
        let type: Type<unknown> | undefined;
        switch (options.name as ComposerPanelId) {
          case ComposerPanelId.Chat:
            type = ChatPanel;
            break;
          case ComposerPanelId.Rendered:
            type = RenderedFrame;
            break;
          case ComposerPanelId.Raw:
            type = RawFrame;
            break;
          case ComposerPanelId.DataModel:
            type = DataModel;
            break;
          case ComposerPanelId.Events:
            type = Events;
            break;
          case ComposerPanelId.Errors:
            type = Errors;
            break;
          case ComposerPanelId.RawMessages:
            type = RawMessages;
            break;
          case ComposerPanelId.MockRules:
            type = MockRules;
            break;
        }

        if (!type) {
          return {element: document.createElement('div'), init: () => {}, dispose: () => {}};
        }

        const componentRef = this.viewContainerRef.createComponent(type);
        this.componentRefs.push(componentRef);

        if (type === RawMessages) this.rawMessagesInstance = componentRef.instance as RawMessages;
        if (type === Events) this.eventsInstance = componentRef.instance as Events;
        if (type === Errors) this.errorsInstance = componentRef.instance as Errors;

        return {
          element: componentRef.location.nativeElement,
          init: params => {
            componentRef.changeDetectorRef.detectChanges();
          },
          dispose: () => {
            if (componentRef.instance === this.rawMessagesInstance) {
              this.rawMessagesInstance = undefined;
            }
            if (componentRef.instance === this.eventsInstance) {
              this.eventsInstance = undefined;
            }
            if (componentRef.instance === this.errorsInstance) {
              this.errorsInstance = undefined;
            }
            componentRef.destroy();
            this.componentRefs = this.componentRefs.filter(r => r !== componentRef);
          },
        };
      },
    });

    this.dockviewApi.onDidActivePanelChange(event => {
      const panel = event.panel;
      if (panel?.id === ComposerPanelId.Events) {
        untracked(() => this.unreadEventsCount.set(0));
      } else if (panel?.id === ComposerPanelId.Errors) {
        untracked(() => this.unreadErrorsCount.set(0));
      }
      this.checkTabOverflow();
    });

    const savedLayout = localStorage.getItem('composer_dockview_layout');
    let layoutRestored = false;

    if (savedLayout) {
      try {
        this.dockviewApi.fromJSON(JSON.parse(savedLayout));
        layoutRestored = true;
      } catch (e) {
        console.error('Failed to restore dockview layout', e);
      }
    }

    if (!layoutRestored) {
      // Fresh workspace opens on the "Chat + Preview" preset (focus on render)
      // rather than the full debug layout. Users switch via the preset toolbar.
      this.buildChatPreviewLayout();
    }

    let saveTimeout: ReturnType<typeof setTimeout>;
    this.dockviewApi.onDidLayoutChange(() => {
      this.checkTabOverflow();
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem('composer_dockview_layout', JSON.stringify(this.dockviewApi.toJSON()));
      }, 1000);
    });
    this.dockviewApi.onDidAddPanel(() => this.checkTabOverflow());
    this.dockviewApi.onDidRemovePanel(() => this.checkTabOverflow());

    this.resizeObserver = new ResizeObserver(() => this.checkTabOverflow());
    this.resizeObserver.observe(this.dockviewRoot().nativeElement);

    // Force an initial layout pass. In browsers, ResizeObserver handles this,
    // but in jsdom tests with mocked observers, it requires an explicit call.
    this.dockviewApi.layout(1000, 1000);
    this.isDockviewInitialized.set(true);
    this.checkTabOverflow();

    // Highlight the toggle matching the last-applied preset. The layout itself
    // is Google's saved freeform JSON when present, so the toggle is a hint of
    // the last chosen arrangement, not a guarantee the layout still matches it.
    const savedPreset = localStorage.getItem(WORKSPACE_PRESET_KEY);
    if (savedPreset === 'chat' || savedPreset === 'chat-preview' || savedPreset === 'full') {
      this.activePreset.set(savedPreset);
    }
  }

  /**
   * Applies a named layout preset: clears the workspace and rebuilds it with the
   * preset's panel subset. Dockview's debounced layout-save then records the
   * result, so a reload restores it (freeform edits included). No-op until the
   * Dockview instance is initialized.
   */
  applyPreset(preset: WorkspacePreset): void {
    if (!this.isDockviewInitialized()) return;
    this.dockviewApi.clear();
    if (preset === 'chat') {
      this.buildChatLayout();
    } else if (preset === 'chat-preview') {
      this.buildChatPreviewLayout();
    } else {
      this.buildFullLayout();
    }
    this.activePreset.set(preset);
    localStorage.setItem(WORKSPACE_PRESET_KEY, preset);
  }

  /** Preset "Chat": conversation only. */
  private buildChatLayout(): void {
    this.dockviewApi.addPanel({
      id: ComposerPanelId.Chat,
      component: ComposerPanelId.Chat,
      title: 'Gemini Assistant',
    });
  }

  /** Preset "Chat + Preview": conversation beside the live render (default focus). */
  private buildChatPreviewLayout(): void {
    this.buildChatLayout();
    this.dockviewApi.addPanel({
      id: ComposerPanelId.Rendered,
      component: ComposerPanelId.Rendered,
      title: 'Rendered A2UI Preview',
      position: {direction: 'right', referencePanel: ComposerPanelId.Chat},
    });
  }

  /**
   * Preset "Chat + Preview + Code & Engine": the full workspace — chat, render,
   * JSON editor, and the data-model / events / errors / raw-messages consoles.
   * This is Google's original default layout.
   */
  private buildFullLayout(): void {
    this.buildChatPreviewLayout();
    this.dockviewApi.addPanel({
      id: ComposerPanelId.Raw,
      component: ComposerPanelId.Raw,
      title: 'A2UI JSON Editor',
      position: {direction: 'right', referencePanel: ComposerPanelId.Rendered},
    });
    this.dockviewApi.addPanel({
      id: ComposerPanelId.DataModel,
      component: ComposerPanelId.DataModel,
      title: 'Data Model',
      position: {direction: 'below', referencePanel: ComposerPanelId.Rendered},
    });
    this.dockviewApi.addPanel({
      id: ComposerPanelId.Events,
      component: ComposerPanelId.Events,
      title: 'Events',
      position: {direction: 'within', referencePanel: ComposerPanelId.DataModel},
    });
    this.dockviewApi.addPanel({
      id: ComposerPanelId.Errors,
      component: ComposerPanelId.Errors,
      title: 'Errors',
      position: {direction: 'within', referencePanel: ComposerPanelId.DataModel},
    });
    this.dockviewApi.addPanel({
      id: ComposerPanelId.RawMessages,
      component: ComposerPanelId.RawMessages,
      title: 'Raw Messages',
      position: {direction: 'within', referencePanel: ComposerPanelId.DataModel},
    });

    if (this.showMockRules()) {
      this.dockviewApi.addPanel({
        id: ComposerPanelId.MockRules,
        component: ComposerPanelId.MockRules,
        title: 'Mock Rules',
        position: {direction: 'within', referencePanel: ComposerPanelId.DataModel},
      });
    }
  }

  /**
   * If the tabs don't fit in the available space, then we want the dockview
   * overflow selector to be displayed. Otherwise, it's redundant, so it
   * should be hidden. Unfortunately, there doesn't seem to be a "native"
   * mechanism in dockview to support this.
   */
  private checkTabOverflow(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(() => {
      this.animationFrameId = undefined;
      const rootEl = this.dockviewRoot()?.nativeElement;
      if (!rootEl) return;
      const tabContainers = rootEl.querySelectorAll<HTMLElement>('.dv-tabs-container');
      let hasOverflow = false;
      tabContainers.forEach(container => {
        if (container.scrollWidth > container.clientWidth + 2) {
          hasOverflow = true;
        }
      });
      rootEl.classList.toggle('has-tab-overflow', hasOverflow);
    });
  }

  clearAllLogs(): void {
    this.rawMessagesInstance?.clearLogs();
    this.eventsInstance?.clearLogs();
    this.errorsInstance?.clearLogs();
  }
}
