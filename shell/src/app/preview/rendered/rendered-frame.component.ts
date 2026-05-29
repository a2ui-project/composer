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

import {Component, inject, viewChild, ElementRef, effect, computed} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {StartupResolutionService} from '../../shell/startup-resolution.service';
import {HostCommunicationService} from '../../shell/host-communication.service';
import {ChatStateService} from '../../chat/chat-state/chat-state.service';

@Component({
  selector: 'a2ui-composer-rendered-frame',
  standalone: true,
  imports: [],
  templateUrl: './rendered-frame.component.ng.html',
  styleUrl: './rendered-frame.component.scss',
})
/**
 * Orchestrates the secure, sandboxed iframe rendering the active preview target,
 * synchronizing layouts, data models, and diagnostic telemetry.
 */
export class RenderedFrameComponent {
  private sanitizer = inject(DomSanitizer);
  private startupResolutionService = inject(StartupResolutionService);
  private hostCommunicationService = inject(HostCommunicationService);
  private chatStateService = inject(ChatStateService);

  /** Programmatic streams active locking Signal, mapping visual lock bounds. */
  protected readonly isLocked = this.chatStateService.isProgrammaticStreamActive;

  protected iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');

  protected safeRendererUrl = computed(() => {
    const currentUrl = this.startupResolutionService.resolvedUrl();
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

      return this.sanitizer.bypassSecurityTrustResourceUrl(url.toString());
    } catch (e) {
      // Fallback if currentUrl is not a valid absolute or relative URL (e.g., malformed strings),
      // bypassing safety checks to render what we can.
      return this.sanitizer.bypassSecurityTrustResourceUrl(currentUrl);
    }
  });

  constructor() {
    effect(() => {
      const ref = this.iframeRef();
      if (typeof this.hostCommunicationService.registerIframeElement === 'function') {
        this.hostCommunicationService.registerIframeElement(ref?.nativeElement || null);
      }
      if (typeof this.hostCommunicationService.registerIframe === 'function') {
        this.hostCommunicationService.registerIframe(ref?.nativeElement?.contentWindow || null);
      }
    });
  }
}
