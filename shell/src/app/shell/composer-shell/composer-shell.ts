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
import {TrackEventDirective} from '../../usage-tracking/track-event.directive';
import {Component, computed, effect, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {ShareService} from '../share/share.service';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs';
import {ChatCoordinator} from '../../chat/chat-coordinator/chat-coordinator';
import {ErrorLogger} from '../../debug/error-logger.service';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {HostCommunication} from '../host-communication/host-communication';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {StartupConfigStateService} from '../startup-resolution/state/startup-config-state.service';
import {ResetLayoutEvent} from '../composer-workspace/composer-panel-id';

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
    TrackEventDirective,
  ],
  templateUrl: './composer-shell.ng.html',
  styleUrl: './composer-shell.scss',
})
export class ComposerShell {
  readonly isCollapsed = signal(true);
  isDarkTheme = computed(() => this.configProvider.themePreference() === ThemePreference.DARK);
  private readonly router = inject(Router);

  private checkIsWorkspaceRoute(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];
    return path === '' || path === '/';
  }

  readonly isWorkspaceRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => this.checkIsWorkspaceRoute(e.urlAfterRedirects || e.url)),
    ),
    {initialValue: this.checkIsWorkspaceRoute(this.router.url)},
  );

  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly startupResolution = inject(StartupResolution);
  private readonly chatCoordinator = inject(ChatCoordinator);
  private readonly startupConfigState = inject(StartupConfigStateService);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly errorLogger = inject(ErrorLogger);
  private readonly usageTrackingService = inject(UsageTrackingService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly document = inject(DOCUMENT);
  private readonly shareService = inject(ShareService);

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
    const newTheme = this.isDarkTheme() ? ThemePreference.LIGHT : ThemePreference.DARK;
    this.usageTrackingService.trackThemeToggle({theme: newTheme});
    this.configProvider.setThemePreference(newTheme);
  }

  /**
   * Encodes active renderer URL and compressed A2UI active draft payload into shareable URL parameters
   * and copies the result directly to the user's clipboard.
   */
  async shareDesign(): Promise<void> {
    await this.shareService.shareDesign();
  }

  /**
   * Resets the current session in-memory without reloading the page or wiping
   * persisted renderer/catalog caches.
   */
  resetSession(): void {
    this.usageTrackingService.trackSessionReset({
      totalPromptTurns: this.chatCoordinator.currentTurnIndex(),
    });
    this.usageTrackingService.resetSession();
    this.chatCoordinator.startNewSession();
    this.startupConfigState.setSharedA2uiPayload(null);
    this.startupConfigState.setSharedA2uiError(null);
    this.startupResolution.cleanSharedA2uiUrl();
    this.hostCommunication.clearHistoryBuffer();
    this.errorLogger.clear();
  }

  /**
   * Resets the Dockview workspace back to default panels and split proportions
   * by dispatching ResetLayoutEvent to the window.
   */
  resetLayout(): void {
    if (this.document.defaultView) {
      this.document.defaultView.dispatchEvent(new ResetLayoutEvent());
    }
  }
}
