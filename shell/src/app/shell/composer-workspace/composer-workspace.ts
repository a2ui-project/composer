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
  signal,
  untracked,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {HostCommunication} from '../host-communication/host-communication';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {ComposerPanelId} from './composer-panel-id';
import {ComposerDockview} from './composer-dockview.service';

export {ComposerPanelId};

/** Internal interface mapping raw cross-frame workspace telemetry payloads */
export declare interface WorkspaceMessagePayload {
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
  providers: [ComposerDockview],
  templateUrl: './composer-workspace.ng.html',
  styleUrl: './composer-workspace.scss',
})
export class ComposerWorkspace implements OnInit, AfterViewInit {
  private readonly startupResolution = inject(StartupResolution);
  private readonly hostComm = inject(HostCommunication);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly composerDockview = inject(ComposerDockview);

  readonly dockviewRoot = viewChild.required<ElementRef<HTMLElement>>('dockviewRoot');

  isExtension = signal(false);
  showMockRules = signal(false);
  unreadEventsCount = signal(0);
  unreadErrorsCount = signal(0);
  isDarkTheme = computed(() => this.configProvider.themePreference() === ThemePreference.DARK);

  constructor() {
    this.hostComm.messageStream$.pipe(takeUntilDestroyed()).subscribe(envelope => {
      if (!envelope) return;

      const payload = envelope.payload as WorkspaceMessagePayload | undefined;

      if (envelope.type === PreviewBridgeMessageType.SEND_TO_SERVER && payload?.action) {
        if (!this.composerDockview.isPanelVisible(ComposerPanelId.Events)) {
          this.unreadEventsCount.update(count => count + 1);
        }
      } else if (envelope.type === PreviewBridgeMessageType.CONSOLE_LOG) {
        if (!this.composerDockview.isPanelVisible(ComposerPanelId.Errors)) {
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

        if (hasErrors && !this.composerDockview.isPanelVisible(ComposerPanelId.Errors)) {
          this.unreadErrorsCount.update(count => count + 1);
        }
      }
    });

    effect(() => {
      const count = this.unreadEventsCount();
      this.composerDockview.setPanelTitle(
        ComposerPanelId.Events,
        count > 0 ? `Events (${count})` : 'Events',
      );
    });

    effect(() => {
      const count = this.unreadErrorsCount();
      this.composerDockview.setPanelTitle(
        ComposerPanelId.Errors,
        count > 0 ? `Errors (${count})` : 'Errors',
      );
    });

    effect(() => {
      this.composerDockview.toggleMockRules(this.showMockRules());
    });

    effect(() => {
      this.composerDockview.updateTheme(this.isDarkTheme());
    });
  }

  ngOnInit(): void {
    const isExt = this.startupResolution.isExtensionMode();
    this.isExtension.set(isExt);
  }

  ngAfterViewInit(): void {
    this.composerDockview.initialize({
      rootEl: this.dockviewRoot().nativeElement,
      isDarkTheme: this.isDarkTheme(),
      showMockRules: this.showMockRules(),
      onActivePanelChange: panelId => {
        if (panelId === ComposerPanelId.Events) {
          untracked(() => this.unreadEventsCount.set(0));
        } else if (panelId === ComposerPanelId.Errors) {
          untracked(() => this.unreadErrorsCount.set(0));
        }
      },
    });
  }

  clearAllLogs(): void {
    this.composerDockview.clearAllLogs();
  }
}
