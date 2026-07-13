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
  OnDestroy,
  signal,
  untracked,
  computed,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
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
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {DockviewComponent} from 'dockview';

/** Internal interface mapping raw cross-frame workspace telemetry payloads */
interface WorkspaceMessagePayload {
  action?: unknown;
  validationErrors?: unknown[] | Record<string, unknown> | string | boolean;
}

/**
 * The central workspace hub coordinating split-pane views between
 * the layout editors, active preview frame, and debug consoles.
 */
@Component({
  selector: 'a2ui-composer-workspace',
  standalone: true,
  templateUrl: './composer-workspace.ng.html',
  styleUrl: './composer-workspace.scss',
})
export class ComposerWorkspace implements OnInit, AfterViewInit, OnDestroy {
  private startupResolution = inject(StartupResolution);
  private hostComm = inject(HostCommunication);
  private viewContainerRef = inject(ViewContainerRef);
  private configProvider = inject(AppConfigProvider);

  @ViewChild('dockviewRoot') dockviewRoot!: ElementRef;

  isExtension = signal(false);
  showMockRules = signal(false);
  unreadEventsCount = signal(0);
  unreadErrorsCount = signal(0);
  isDarkTheme = computed(() => this.configProvider.themePreference() === 'dark');

  private dockviewApi!: DockviewComponent;
  private componentRefs: ComponentRef<unknown>[] = [];

  private rawMessagesInstance?: RawMessages;
  private eventsInstance?: Events;
  private errorsInstance?: Errors;

  constructor() {
    this.hostComm.messageStream$.pipe(takeUntilDestroyed()).subscribe(envelope => {
      if (!envelope) return;

      const payload = envelope.payload as WorkspaceMessagePayload | undefined;
      const activePanelId = this.dockviewApi?.activePanel?.id;

      if (envelope.type === PreviewBridgeMessageType.SEND_TO_SERVER && payload?.['action']) {
        if (activePanelId !== 'events') {
          this.unreadEventsCount.update(count => count + 1);
        }
      } else if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
        if (activePanelId !== 'errors') {
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

        if (hasErrors && activePanelId !== 'errors') {
          this.unreadErrorsCount.update(count => count + 1);
        }
      }
    });

    effect(() => {
      const count = this.unreadEventsCount();
      const panel = untracked(() => this.dockviewApi?.getGroupPanel('events'));
      if (panel) {
        panel.api.setTitle(count > 0 ? `Events (${count})` : 'Events');
      }
    });

    effect(() => {
      const count = this.unreadErrorsCount();
      const panel = untracked(() => this.dockviewApi?.getGroupPanel('errors'));
      if (panel) {
        panel.api.setTitle(count > 0 ? `Errors (${count})` : 'Errors');
      }
    });

    effect(() => {
      const show = this.showMockRules();
      const existingPanel = untracked(() => this.dockviewApi?.getGroupPanel('mockRules'));
      if (show && !existingPanel && this.dockviewApi) {
          const dataModel = this.dockviewApi.getGroupPanel('dataModel');
          if (dataModel) {
             this.dockviewApi.addPanel({ id: 'mockRules', component: 'mockRules', title: 'Mock Rules', position: { referencePanel: 'dataModel', direction: 'within' } });
          }
      } else if (!show && existingPanel && this.dockviewApi) {
          existingPanel.api.close();
      }
    });
    
    effect(() => {
      const isDark = this.isDarkTheme();
      const api = untracked(() => this.dockviewApi);
      if (api) {
        api.updateOptions({ className: isDark ? 'dockview-theme-dark' : 'dockview-theme-light' });
      }
    });
  }

  ngOnInit(): void {
    const isExt = this.startupResolution.isExtensionMode();
    this.isExtension.set(isExt);
  }

  ngAfterViewInit() {
    this.dockviewApi = new DockviewComponent(this.dockviewRoot.nativeElement, {
      className: this.isDarkTheme() ? 'dockview-theme-dark' : 'dockview-theme-light',
      createComponent: (options) => {
        let type: Type<unknown> | undefined;
        switch (options.name) {
          case 'chat': type = ChatPanel; break;
          case 'rendered': type = RenderedFrame; break;
          case 'raw': type = RawFrame; break;
          case 'dataModel': type = DataModel; break;
          case 'events': type = Events; break;
          case 'errors': type = Errors; break;
          case 'rawMessages': type = RawMessages; break;
          case 'mockRules': type = MockRules; break;
        }

        if (!type) {
            return { element: document.createElement('div'), init: () => {}, dispose: () => {} };
        }

        const componentRef = this.viewContainerRef.createComponent(type);
        this.componentRefs.push(componentRef);
        
        if (type === RawMessages) this.rawMessagesInstance = componentRef.instance as RawMessages;
        if (type === Events) this.eventsInstance = componentRef.instance as Events;
        if (type === Errors) this.errorsInstance = componentRef.instance as Errors;
        
        return {
          element: componentRef.location.nativeElement,
          init: (params) => {
             componentRef.changeDetectorRef.detectChanges();
          },
          dispose: () => {
             componentRef.destroy();
             this.componentRefs = this.componentRefs.filter(r => r !== componentRef);
          }
        };
      }
    });

    this.dockviewApi.onDidActivePanelChange((event) => {
      const panel = event.panel;
      if (panel?.id === 'events') {
          untracked(() => this.unreadEventsCount.set(0));
      } else if (panel?.id === 'errors') {
          untracked(() => this.unreadErrorsCount.set(0));
      }
    });

    this.dockviewApi.addPanel({ id: 'chat', component: 'chat', title: 'Chat' });
    this.dockviewApi.addPanel({ id: 'rendered', component: 'rendered', title: 'Rendered A2UI Preview', position: { direction: 'right', referencePanel: 'chat' } });
    this.dockviewApi.addPanel({ id: 'raw', component: 'raw', title: 'A2UI JSON Editor', position: { direction: 'right', referencePanel: 'rendered' } });

    this.dockviewApi.addPanel({ id: 'dataModel', component: 'dataModel', title: 'Data Model', position: { direction: 'below', referencePanel: 'rendered' } });
    this.dockviewApi.addPanel({ id: 'events', component: 'events', title: 'Events', position: { direction: 'within', referencePanel: 'dataModel' } });
    this.dockviewApi.addPanel({ id: 'errors', component: 'errors', title: 'Errors', position: { direction: 'within', referencePanel: 'dataModel' } });
    this.dockviewApi.addPanel({ id: 'rawMessages', component: 'rawMessages', title: 'Raw Messages', position: { direction: 'within', referencePanel: 'dataModel' } });
    
    if (this.showMockRules()) {
      this.dockviewApi.addPanel({ id: 'mockRules', component: 'mockRules', title: 'Mock Rules', position: { direction: 'within', referencePanel: 'dataModel' } });
    }
    
    // Force an initial layout pass. In browsers, ResizeObserver handles this,
    // but in jsdom tests with mocked observers, it requires an explicit call.
    this.dockviewApi.layout(1000, 1000);
  }

  ngOnDestroy() {
     this.dockviewApi?.dispose();
     this.componentRefs.forEach(ref => ref.destroy());
  }

  clearAllLogs(): void {
    this.rawMessagesInstance?.clearLogs();
    this.eventsInstance?.clearLogs();
    this.errorsInstance?.clearLogs();
  }
}
