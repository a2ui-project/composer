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

import {DOCUMENT} from '@angular/common';
import {Component, computed, effect, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {ChatCoordinator} from '../../chat/chat-coordinator/chat-coordinator';
import {StateSync} from '../../chat/state-sync/state-sync';
import {
  AppConfigProvider,
  EnvMode,
} from '../../settings/app-config-provider/app-config-provider';
import {HostCommunication} from '../host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {IndexedDbStorage} from '../../storage/indexed-db-storage/indexed-db-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SessionStorageInteractions} from '../../storage/session-storage-interactions/session-storage-interactions';
import {
  PromptTurnType,
  UsageTrackingService,
} from '../../usage-tracking/usage-tracking.service';
import {ThemePreference} from '../../settings/app-config-provider/app-config-provider';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import {StartupConfigStateService} from '../startup-resolution/state/startup-config-state.service';
import {QueryParser} from '../query-parser/query-parser';
import {StartupResolution} from '../startup-resolution/startup-resolution';

/** Standard length for showing any snack bar notification. */
const SNACK_BAR_DURATION_MS = 5000;

/**
 * Global presentation wrapper for the A2UI Composer application routing and
 * core integrations (telemetry, session tracking, root layout scaffolding).
 */
@Component({
  selector: 'a2ui-composer-shell',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterModule,
  ],
  templateUrl: './composer-shell.ng.html',
  styleUrl: './composer-shell.scss',
})
export class ComposerShell {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly indexedDbStorage = inject(IndexedDbStorage);
  private readonly localStorage = inject(LocalStorageInteractions);
  private readonly sessionStorage = inject(SessionStorageInteractions);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly startupResolution = inject(StartupResolution);
  private readonly stateSync = inject(StateSync);
  private readonly chatCoordinator = inject(ChatCoordinator);
  private readonly startupConfigState = inject(StartupConfigStateService);
  protected readonly currentTurnIndex = this.chatCoordinator.currentTurnIndex;
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);

  readonly isAppReady = signal<boolean>(false);
  activeCatalogTitle = this.catalogManagement.activeCatalogTitle;
  activeCatalogDescription = this.catalogManagement.activeCatalogDescription;

  constructor() {
    effect(() => {
      if (this.isDarkTheme()) {
        this.document.body.classList.add('dark-theme');
      } else {
        this.document.body.classList.remove('dark-theme');
      }
    });

    effect(() => {
      const error = this.startupConfigState.sharedA2uiError();
      if (error) {
        this.snackBar.open(`Unable to load shared design: ${error}`, 'Dismiss', {
          duration: SNACK_BAR_DURATION_MS,
        });
      }
    });

    this.checkHandshakeTimeout();
    this.startPrewarmingBridgeIframe();
  }

  isDarkTheme = computed(() => {
    return this.configProvider.themePreference() === ThemePreference.DARK;
  });

  isStandaloneMode = computed(() => {
    return this.configProvider.envMode() === EnvMode.STANDALONE;
  });

  toggleTheme() {
    this.usageTrackingService.trackThemeToggle();
    const newTheme = this.isDarkTheme() ? ThemePreference.LIGHT : ThemePreference.DARK;
    this.configProvider.setThemePreference(newTheme);
  }

  async resetSession() {
    this.usageTrackingService.trackSessionReset();

    this.localStorage.removeItem(LocalStorageKey.CHAT_HISTORY);

    await this.indexedDbStorage.clearLogs();

    this.sessionStorage.resetSessionUuid();
    this.stateSync.flushDraft();
    this.chatCoordinator.clearHistory();

    this.removeShareParamsAndReload();
  }

  async shareDesign() {
    const activeDraft = this.stateSync.activeDraft();
    const href = this.document.defaultView?.location.href;
    if (!activeDraft || !activeDraft.trim()) {
      return;
    }
    if (!href) {
      return;
    }
    const clipboard = this.document.defaultView?.navigator?.clipboard;
    if (!clipboard) {
      this.usageTrackingService.trackShareDesign({
        status: 'UNAVAILABLE',
        payloadSize: activeDraft.length,
      });
      this.snackBar.open(
        'Clipboard is not available. Please ensure you are viewing this page on a secure (HTTPS) origin.',
        'Dismiss',
        {duration: SNACK_BAR_DURATION_MS},
      );
      return;
    }
    try {
      const rendererUrl = this.startupConfigState.resolvedUrl() || '';
      const compressed = await QueryParser.encodeSharedPayload(activeDraft);
      const shareUrl = new URL(href);
      const hashParams = new URLSearchParams();
      if (rendererUrl) {
        hashParams.set('rendererUrl', rendererUrl);
      }
      hashParams.set('a2ui', compressed);
      shareUrl.hash = `#?${hashParams.toString()}`;
      await clipboard.writeText(shareUrl.toString());

      this.usageTrackingService.trackShareDesign({
        status: 'SUCCESS',
        payloadSize: activeDraft.length,
      });
      this.snackBar.open('Design link copied to clipboard.', undefined, {
        duration: SNACK_BAR_DURATION_MS,
      });
    } catch (e) {
      this.usageTrackingService.trackShareDesign({
        status: 'ERROR',
        payloadSize: activeDraft.length,
      });
      this.snackBar.open('Unable to encode or copy design Link.', 'Dismiss', {
        duration: SNACK_BAR_DURATION_MS,
      });
      console.warn('Failed to encode and copy a2ui query param value:', e);
    }
  }

  private removeShareParamsAndReload(): void {
    const w = this.document.defaultView;
    if (!w) return;
    const url = new URL(w.location.href);

    if (url.searchParams.has('a2ui')) url.searchParams.delete('a2ui');
    if (url.searchParams.has('rendererUrl')) url.searchParams.delete('rendererUrl');
    if (url.searchParams.has('rendererId')) url.searchParams.delete('rendererId');

    const hashStr = url.hash.substring(1);
    if (hashStr) {
      let isHashPath = false;
      let qParamsStr = hashStr;
      if (hashStr.includes('?')) {
         isHashPath = true;
         qParamsStr = hashStr.substring(hashStr.indexOf('?') + 1);
      }
      const hashParams = new URLSearchParams(qParamsStr);
      if (hashParams.has('a2ui')) hashParams.delete('a2ui');
      if (hashParams.has('rendererUrl')) hashParams.delete('rendererUrl');
      if (hashParams.has('rendererId')) hashParams.delete('rendererId');
      if (isHashPath) {
          url.hash = hashStr.substring(0, hashStr.indexOf('?')) + (hashParams.toString() ? '?' + hashParams.toString() : '');
      } else {
          url.hash = hashParams.toString();
      }
    }
    
    // Also call the environment service cleaner for safe fallback
    this.startupResolution.cleanSharedA2uiUrl();

    // Reassign href so we navigate cleanly
    w.location.href = url.toString();
  }

  private checkHandshakeTimeout(): void {
    setTimeout(() => {
      this.isAppReady.set(true);
    }, 1500);
  }

  private startPrewarmingBridgeIframe(): void {
      const rendererUrl = this.startupConfigState.resolvedUrl() || '';
      this.hostCommunication.preselectRendererForConnection(rendererUrl);
  }
}
