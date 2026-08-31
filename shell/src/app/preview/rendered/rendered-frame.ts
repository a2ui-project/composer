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
  inject,
  viewChild,
  ElementRef,
  effect,
  computed,
  untracked,
  input,
  signal,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {isValidHttpUrl} from '../../utils/url';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {ChatState} from '../../chat/chat-state/chat-state';

import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';

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

  /** Optional layout payload to render immediately into the guest iframe. */
  readonly payload = input<unknown[] | null | undefined>(null);

  /** Tracks dynamic surface height reported by the guest renderer frame. */
  readonly dynamicHeight = signal<number | null>(null);

  /** Computed pixel height string or 100% when rendered within dynamic/inline layout contexts. */
  readonly frameHeight = computed(() => {
    const h = this.dynamicHeight();
    return h && h > 0 ? h : null;
  });

  /** Programmatic streams active locking Signal, mapping visual lock bounds. */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;

  protected iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');

  protected safeRendererUrl = computed(() => {
    const currentUrl = this.startupResolution.resolvedUrl();
    if (!currentUrl) return null;

    try {
      // Fallback to undefined if globalThis.location is undefined
      // (e.g., in Server-Side Rendering).
      const baseOrigin = globalThis.location?.origin || undefined;

      // Construct a URL object. Passing baseOrigin as the second argument ensures that
      // relative URLs (e.g., "/renderer") are parsed correctly relative to the current
      // domain. Absolute URLs will ignore this base parameter.
      const url = new URL(currentUrl, baseOrigin);

      // Prevent unauthorized cross-site framing by appending parent and
      // ancestor origins.
      url.searchParams.delete('origin');

      const origins = new Set<string>();
      if (baseOrigin) {
        origins.add(baseOrigin);
      }

      const ancestorOrigins = (
        globalThis.location as Location & {['ancestorOrigins']?: DOMStringList}
      )?.['ancestorOrigins'];
      if (ancestorOrigins) {
        for (let i = 0; i < ancestorOrigins.length; i++) {
          if (ancestorOrigins[i]) {
            origins.add(ancestorOrigins[i]);
          }
        }
      }

      for (const origin of origins) {
        url.searchParams.append('origin', origin);
      }

      const initialTheme = untracked(() => this.configProvider.themePreference());
      url.searchParams.set('theme', initialTheme);

      const urlString = url.toString();
      if (!isValidHttpUrl(urlString)) {
        console.error('Renderer URL failed safe validation:', urlString);
        return null;
      }

      return this.sanitizer.bypassSecurityTrustResourceUrl(urlString);
    } catch (e) {
      console.error('Failed to parse renderer URL:', e);
      return null;
    }
  });

  constructor() {
    effect(onCleanup => {
      const ref = this.iframeRef();
      const el = ref?.nativeElement ?? null;
      if (el) {
        this.hostCommunication.registerIframe(el);
        onCleanup(() => {
          this.hostCommunication.unregisterIframe(el);
        });
      }
    });

    effect(() => {
      const theme = this.configProvider.themePreference();
      this.hostCommunication.sendTheme(theme);
    });

    // Outbound payload dispatch: forwards updated A2UI declarative JSON payloads
    // from the host/parent component to the renderer iframe over postMessage whenever
    // the payload input signal emits a non-empty array and the iframe element is available.
    effect(() => {
      const payload = this.payload();
      const iframe = this.iframeRef()?.nativeElement;
      if (iframe && payload !== null && Array.isArray(payload) && payload.length > 0) {
        this.hostCommunication.sendRenderA2UI(payload, iframe);
      }
    });

    // Inbound bridge listener: adjusts the iframe container height to fit the rendered
    // A2UI content dimensions, eliminating unnecessary inner scrollbars or clipping.
    effect(() => {
      const envelope = this.hostCommunication.messageStream();
      if (envelope) {
        const myIframe = this.iframeRef()?.nativeElement;
        const myWindow = myIframe?.contentWindow;

        // In multi-frame environments, ignore messages dispatched by other iframes
        if (envelope.sourceWindow && myWindow && envelope.sourceWindow !== myWindow) {
          return;
        }

        if (
          envelope.type === PreviewBridgeMessageType.RENDERER_READY ||
          envelope.type === PreviewBridgeMessageType.A2UI_CATALOG
        ) {
          const payload = untracked(() => this.payload());
          if (myIframe && payload !== null && Array.isArray(payload) && payload.length > 0) {
            this.hostCommunication.sendRenderA2UI(payload, myIframe);
          }
        } else if (envelope.type === PreviewBridgeMessageType.SURFACE_RESIZE) {
          if (CrossFrameValidator.validateIncomingMessage(envelope)) {
            const resizePayload = envelope.payload as {height: number; width?: number};
            this.dynamicHeight.set(resizePayload.height);
          }
        }
      }
    });
  }

  /**
   * Forwards wheel events from the guest iframe to parent scroll containers
   * to ensure mouse/trackpad scrolling is not trapped by iframe viewports.
   */
  protected setupIframeWheelForwarding(iframe: HTMLIFrameElement): void {
    try {
      iframe.contentWindow?.addEventListener(
        'wheel',
        (event: WheelEvent) => {
          const scrollParent = iframe.closest('.chat-history-container, .side-canvas-viewport');
          if (scrollParent) {
            scrollParent.scrollBy({
              top: event.deltaY,
              left: event.deltaX,
              behavior: 'auto',
            });
          }
        },
        {passive: true},
      );
    } catch {
      // Safe fallback if frame is restricted by cross-origin policies
    }
  }

  /**
   * Dispatches the active A2UI payload to the renderer iframe once the DOM iframe element finishes loading.
   */
  protected syncPayloadOnIframeLoad(): void {
    const payload = this.payload();
    const iframe = this.iframeRef()?.nativeElement;
    if (iframe) {
      this.setupIframeWheelForwarding(iframe);
      if (payload !== null && Array.isArray(payload) && payload.length > 0) {
        this.hostCommunication.sendRenderA2UI(payload, iframe);
      }
    }
  }
}
