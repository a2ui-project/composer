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

  public iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');

  public safeRendererUrl = computed(() => {
    const currentUrl = this.startupResolutionService.resolvedUrl();
    return currentUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(currentUrl) : null;
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
