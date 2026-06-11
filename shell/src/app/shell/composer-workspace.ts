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
import {ChatPanel} from '../chat/chat-panel/chat-panel';
import {RawFrame} from '../preview/raw/raw-frame';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {DataModel} from '../debug/data-model/data-model';
import {Events} from '../debug/events/events';
import {Errors} from '../debug/errors/errors';
import {RawMessages} from '../debug/raw-messages/raw-messages';
import {MockRules} from '../debug/mock-rules/mock-rules';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatBadgeModule} from '@angular/material/badge';
import {StartupResolution} from './startup-resolution';
import {HostCommunication} from './host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';

const EVENTS_TAB_INDEX = 1;
const ERRORS_TAB_INDEX = 2;

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
  imports: [
    ChatPanel,
    RawFrame,
    RenderedFrame,
    DataModel,
    Events,
    Errors,
    RawMessages,
    MockRules,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './composer-workspace.ng.html',
  styleUrl: './composer-workspace.scss',
})
export class ComposerWorkspace implements OnInit {
  private startupResolution = inject(StartupResolution);
  private hostComm = inject(HostCommunication);

  isExtension = signal(false);
  isDebugCollapsed = signal(false);
  showMockRules = signal(false);
  selectedTabIndex = signal(0);
  unreadEventsCount = signal(0);
  unreadErrorsCount = signal(0);

  readonly rawMessages = viewChild(RawMessages);
  readonly events = viewChild(Events);
  readonly errors = viewChild(Errors);

  constructor() {
    effect(() => {
      const envelope = this.hostComm.messageStream();
      if (!envelope) return;

      const payload = envelope.payload as WorkspaceMessagePayload;

      untracked(() => {
        const activeTab = this.selectedTabIndex();
        if (envelope.type === PreviewBridgeMessageType.SEND_TO_SERVER && payload?.action) {
          if (activeTab !== EVENTS_TAB_INDEX) {
            this.unreadEventsCount.update(count => count + 1);
          }
        } else if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
          if (activeTab !== ERRORS_TAB_INDEX) {
            this.unreadErrorsCount.update(count => count + 1);
          }
        } else if (
          envelope.type === PreviewBridgeMessageType.DATA_MODEL_CHANGE &&
          payload?.validationErrors
        ) {
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

  ngOnInit(): void {
    const isExt = this.startupResolution.isExtensionMode();
    this.isExtension.set(isExt);
    if (isExt) {
      this.isDebugCollapsed.set(true);
    }
  }

  toggleDebugCollapse(): void {
    this.isDebugCollapsed.update(c => !c);
  }

  clearAllLogs(): void {
    this.rawMessages()?.clearLogs();
    this.events()?.clearLogs();
    this.errors()?.clearLogs();
  }
}
