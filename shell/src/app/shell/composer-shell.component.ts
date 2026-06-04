/**
 * @license
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

import {Component, Inject, inject, computed, effect} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {RouterOutlet, RouterLink} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {IndexedDbStorageService} from '../storage/indexed-db-storage.service';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CatalogManagementService} from '../storage/catalog-management.service';
import {AppConfigProvider} from '../settings/app-config-provider';
import {LocalStorageKey} from '../settings/local-storage-keys';
import {LocalStorageService} from '../settings/local-storage.service';

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
    MatTooltipModule,
  ],
  templateUrl: './composer-shell.component.ng.html',
  styleUrl: './composer-shell.component.scss',
})
/**
 * The primary layout container for the A2UI Composer.
 * Renders the permanent header bar, persistent navigation sidebar,
 * and hosts the active workspace routing outlet.
 */
export class ComposerShellComponent {
  isDarkTheme = computed(() => this.configProvider.themePreference() === 'dark');
  private readonly catalogManagementService = inject(CatalogManagementService);
  private readonly indexedDbStorageService = inject(IndexedDbStorageService);
  private readonly storageService = inject(LocalStorageService);
  private readonly configProvider = inject(AppConfigProvider);

  activeCatalogTitle = this.catalogManagementService.activeCatalogTitle;
  activeCatalogDescription = this.catalogManagementService.activeCatalogDescription;

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect(() => {
      if (this.isDarkTheme()) {
        this.document.body.classList.add('dark-theme');
      } else {
        this.document.body.classList.remove('dark-theme');
      }
    });
  }

  /**
   * Switches between light and dark visual design system palettes.
   */
  toggleTheme(): void {
    this.configProvider.setThemePreference(this.isDarkTheme() ? 'light' : 'dark');
  }

  /**
   * Flushes all local state caches (IndexedDB, localStorage) and reloads
   * the page to simulate a fresh hardware handshake connection.
   */
  async resetSession(): Promise<void> {
    await this.indexedDbStorageService.flushAllRecords();
    this.storageService.removeItem(LocalStorageKey.SESSION_STATE);
    this.storageService.removeItem(LocalStorageKey.EDITOR_CACHE);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
      }
    } catch (e) {
      console.warn('Failed to clear session cache safely:', e);
    }
    if (this.document.defaultView) {
      this.document.defaultView.location.reload();
    }
    console.log('Session state cleared.');
  }
}
