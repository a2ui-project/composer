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

import {Component, inject, viewChild, ElementRef, effect, computed, untracked} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {ChatState} from '../../chat/chat-state/chat-state';

/**
 * Orchestrates the secure, sandboxed iframe rendering the active preview target,
 * synchronizing layouts, data models, and diagnostic telemetry.
 */
@Component({
  selector: 'a2ui-composer-rendered-frame',
  standalone: true,
  imports: [],
  templateUrl: './rendered-frame.ng.html',
  styleUrl: './rendered-frame.scss',
})
export class RenderedFrame {
  private sanitizer = inject(DomSanitizer);
  private startupResolution = inject(StartupResolution);
  private hostCommunication = inject(HostCommunication);
  private configProvider = inject(AppConfigProvider);
  private chatState = inject(ChatState);

  /** Programmatic streams active locking Signal, mapping visual lock bounds. */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;

  protected iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');

  protected safeRendererUrl = computed(() => {
    const currentUrl = this.startupResolution.resolvedUrl();
    if (!currentUrl) return null;

    try {
      // Fallback to empty string if globalThis.location is undefined (e.g., in Server-Side Rendering).
      const baseOrigin = globalThis.location?.origin || '';

      // Construct a URL object. Passing baseOrigin as the second argument ensures that
      // relative URLs (e.g., "/renderer") are parsed correctly relative to the current
      // domain. Absolute URLs will ignore this base parameter.
      const url = new URL(currentUrl, baseOrigin);

      // Append the parent origin as the 'origin' query parameter. The Boq backend is annotated
      // with @OriginCheckRequired(param = "origin"), which strictly validates this parameter
      // against a list of allowed internal domains (such as localhost.corp.google.com) to prevent
      // unauthorized cross-site framing.
      url.searchParams.set('origin', baseOrigin);
      const initialTheme = untracked(() => this.configProvider.themePreference());
      url.searchParams.set('theme', initialTheme);

      return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } catch (e) {
      console.error('Failed to parse renderer URL:', e);
      return null;
    }
  });

  constructor() {
    effect(() => {
      const ref = this.iframeRef();
      this.hostCommunication.registerIframeElement(ref?.nativeElement || null);
    });

    effect(() => {
      const theme = this.configProvider.themePreference();
      if (typeof this.hostCommunication.sendTheme === 'function') {
        this.hostCommunication.sendTheme(theme);
      }
    });
  }
}
