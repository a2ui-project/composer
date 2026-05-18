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

import {Component, inject, signal, viewChild, OnInit, effect, untracked} from '@angular/core';
import {ChatPanelComponent} from '../chat/chat-panel/chat-panel.component';
import {RawFrameComponent} from '../preview/raw/raw-frame.component';
import {RenderedFrameComponent} from '../preview/rendered/rendered-frame.component';
import {DataModelComponent} from '../debug/data-model/data-model.component';
import {EventsComponent} from '../debug/events/events.component';
import {ErrorsComponent} from '../debug/errors/errors.component';
import {RawMessagesComponent} from '../debug/raw-messages/raw-messages.component';
import {MockRulesComponent} from '../debug/mock-rules/mock-rules.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {StartupResolutionService} from './startup-resolution.service';
import {HostCommunicationService} from './host-communication.service';

const EVENTS_TAB_INDEX = 1;
const ERRORS_TAB_INDEX = 2;

@Component({
  selector: 'a2ui-composer-workspace',
  standalone: true,
  imports: [
    ChatPanelComponent,
    RawFrameComponent,
    RenderedFrameComponent,
    DataModelComponent,
    EventsComponent,
    ErrorsComponent,
    RawMessagesComponent,
    MockRulesComponent,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './composer-workspace.component.ng.html',
  styleUrl: './composer-workspace.component.scss',
})
/**
 * The central workspace hub coordinating split-pane views between
 * the layout editors, active preview frame, and debug consoles.
 */
export class ComposerWorkspaceComponent implements OnInit {
  private startupResolutionService = inject(StartupResolutionService);
  private hostComm = inject(HostCommunicationService);

  public isExtension = signal(false);
  public isDebugCollapsed = signal(false);

  public selectedTabIndex = signal(0);
  public unreadEventsCount = signal(0);
  public unreadErrorsCount = signal(0);

  public readonly rawMessagesComponent = viewChild(RawMessagesComponent);
  public readonly eventsComponent = viewChild(EventsComponent);
  public readonly errorsComponent = viewChild(ErrorsComponent);

  constructor() {
    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (!envelope) return;

      const payload = envelope.payload as any;

      untracked(() => {
        const activeTab = this.selectedTabIndex();
        if (envelope.type === 'SEND_TO_SERVER' && payload?.action) {
          if (activeTab !== EVENTS_TAB_INDEX) {
            this.unreadEventsCount.update(count => count + 1);
          }
        } else if (envelope.type === 'CONSOLE_LOG') {
          if (activeTab !== ERRORS_TAB_INDEX) {
            this.unreadErrorsCount.update(count => count + 1);
          }
        } else if (envelope.type === 'DATA_MODEL_CHANGE' && payload?.validationErrors) {
          const validationErrors = payload.validationErrors;
          const hasErrors = Array.isArray(validationErrors)
            ? validationErrors.length > 0
            : typeof validationErrors === 'object' && validationErrors !== null
              ? Object.keys(validationErrors).length > 0
              : !!validationErrors;

          if (hasErrors && activeTab !== ERRORS_TAB_INDEX) {
            this.unreadErrorsCount.update(count => count + 1);
          }
        }
      });
    });

    effect(() => {
      const index = this.selectedTabIndex();
      if (index === EVENTS_TAB_INDEX) {
        untracked(() => {
          this.unreadEventsCount.set(0);
        });
      } else if (index === ERRORS_TAB_INDEX) {
        untracked(() => {
          this.unreadErrorsCount.set(0);
        });
      }
    });
  }

  public ngOnInit(): void {
    const isExt = this.startupResolutionService.isExtensionMode();
    this.isExtension.set(isExt);
    if (isExt) {
      this.isDebugCollapsed.set(true);
    }
  }

  public toggleDebugCollapse(): void {
    this.isDebugCollapsed.update(c => !c);
  }

  public clearAllLogs(): void {
    this.rawMessagesComponent()?.clearLogs();
    this.eventsComponent()?.clearLogs();
    this.errorsComponent()?.clearLogs();
  }
}
