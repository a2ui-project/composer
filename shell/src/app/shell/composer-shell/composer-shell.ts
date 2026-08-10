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

import {Component, computed, effect, inject, signal} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {IndexedDbStorage} from '../../storage/indexed-db-storage/indexed-db-storage';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {SessionStorageInteractions} from '../../storage/session-storage-interactions/session-storage-interactions';

import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {StateSync} from '../../chat/state-sync/state-sync';
import {QueryParser} from '../query-parser/query-parser';

/** Standard length for showing any snack bar notification. */
const SNACK_BAR_DURATION_MS = 5000;

/**
 * The primary layout container for the A2UI Composer.
 * Renders the permanent header bar, persistent navigation sidebar,
 * and hosts the active workspace routing outlet.
 */
@Component({
  selector: 'a2ui-composer-shell',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './composer-shell.ng.html',
  styleUrl: './composer-shell.scss',
})
export class ComposerShell {
  readonly isCollapsed = signal(true);
  isDarkTheme = computed(() => this.configProvider.themePreference() === ThemePreference.DARK);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly indexedDbStorage = inject(IndexedDbStorage);
  private readonly storage = inject(LocalStorageInteractions);
  private readonly sessionStorage = inject(SessionStorageInteractions);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly startupResolution = inject(StartupResolution);
  private readonly stateSync = inject(StateSync);
  private readonly snackBar = inject(MatSnackBar);
  private readonly document = inject(DOCUMENT);

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
      const error = this.startupResolution.sharedA2uiError();
      if (error) {
        this.snackBar.open(`Unable to load shared design: ${error}`, 'Dismiss', {
          duration: SNACK_BAR_DURATION_MS,
        });
      }
    });
  }

  /**
   * Toggles collapsed state of the side navigation bar.
   */
  toggleCollapsed(): void {
    this.isCollapsed.update(c => !c);
  }

  /** Ensure the sidenav is collapsed. Called after the user clicks an item. */
  ensureCollapsed(): void {
    this.isCollapsed.set(true);
  }

  /**
   * Switches between light and dark visual design system palettes.
   */
  toggleTheme(): void {
    this.configProvider.setThemePreference(
      this.isDarkTheme() ? ThemePreference.LIGHT : ThemePreference.DARK,
    );
  }

  /**
   * Encodes active renderer URL and compressed A2UI active draft payload into shareable URL parameters
   * and copies the result directly to the user's clipboard.
   */
  async shareDesign(): Promise<void> {
    const href = this.document.defaultView?.location.href;
    if (!href) {
      return;
    }
    const clipboard = this.document.defaultView?.navigator?.clipboard;
    if (!clipboard) {
      this.snackBar.open('Clipboard API unavailable', 'Close', {duration: SNACK_BAR_DURATION_MS});
      return;
    }
    const activeDraft = this.stateSync.activeDraft() || '';
    try {
      JSON.parse(activeDraft);
    } catch {
      this.snackBar.open('Cannot share design: invalid JSON syntax', 'Close', {
        duration: SNACK_BAR_DURATION_MS,
      });
      return;
    }
    try {
      const rendererUrl = this.startupResolution.resolvedUrl() || '';
      const compressed = await QueryParser.encodeSharedPayload(activeDraft);
      const shareUrl = new URL(href);
      const hashParams = new URLSearchParams();
      if (rendererUrl) {
        hashParams.set('renderer', rendererUrl);
      }
      hashParams.set('a2ui', compressed);
      shareUrl.hash = hashParams.toString();
      shareUrl.search = '';

      await clipboard.writeText(shareUrl.toString());
      const lengthKb = (shareUrl.toString().length / 1024).toFixed(1);
      this.snackBar.open(`Shareable link copied to clipboard (${lengthKb} KB)`, 'Close', {
        duration: SNACK_BAR_DURATION_MS,
      });
    } catch (err) {
      console.error('Failed to copy shareable link:', err);
      this.snackBar.open('Failed to copy link to clipboard', 'Close', {
        duration: SNACK_BAR_DURATION_MS,
      });
    }
  }

  /**
   * Flushes all local state caches (IndexedDB, localStorage) and reloads
   * the page to simulate a fresh hardware handshake connection.
   */
  async resetSession(): Promise<void> {
    await this.indexedDbStorage.flushAllRecords();
    this.storage.removeItem(LocalStorageKey.SESSION_STATE);
    this.storage.removeItem(LocalStorageKey.EDITOR_CACHE);
    this.sessionStorage.clear();
    if (this.document.defaultView) {
      const url = new URL(this.document.defaultView.location.href);
      url.searchParams.delete('a2ui');
      url.searchParams.delete('renderer');
      url.searchParams.delete('rendererId');
      url.hash = '';
      this.document.defaultView.location.href = url.toString();
    }
    console.log('Session state cleared.');
  }
}
