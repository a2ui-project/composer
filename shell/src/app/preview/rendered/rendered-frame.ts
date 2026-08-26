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
import {SafeUrlValidatorService} from '../../shared/security/safe-url-validator.service';
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
  private urlValidator = inject(SafeUrlValidatorService);
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
      if (!this.urlValidator.isValidHttpUrl(urlString)) {
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
    effect(() => {
      const ref = this.iframeRef();
      this.hostCommunication.registerIframe(ref?.nativeElement ?? null);
    });

    effect(() => {
      const theme = this.configProvider.themePreference();
      this.hostCommunication.sendTheme(theme);
    });

    // Outbound payload dispatch: forwards updated A2UI declarative JSON payloads
    // from the host/parent component to the renderer iframe over postMessage whenever
    // the payload input signal emits a non-empty array.
    effect(() => {
      const payload = this.payload();
      if (payload !== null && Array.isArray(payload) && payload.length > 0) {
        this.sendPayloadToIframe(payload);
      }
    });

    // Inbound bridge listener: handles lifecycle signals and dynamic layout updates
    // received from the renderer iframe:
    // 1. RENDERER_READY / A2UI_CATALOG: Resolves startup race conditions by flushing
    //    the current untracked payload as soon as the iframe finishes booting and catalog loading.
    // 2. SURFACE_RESIZE: Automatically adjusts the iframe container height to fit the rendered
    //    A2UI content dimensions, eliminating unnecessary inner scrollbars or clipping.
    effect(() => {
      const msgStream = this.hostCommunication?.messageStream;
      if (typeof msgStream === 'function') {
        const envelope = msgStream();
        if (envelope) {
          if (
            envelope.type === PreviewBridgeMessageType.RENDERER_READY ||
            envelope.type === PreviewBridgeMessageType.A2UI_CATALOG
          ) {
            const payload = untracked(() => this.payload());
            if (payload !== null && Array.isArray(payload) && payload.length > 0) {
              this.sendPayloadToIframe(payload);
            }
          } else if (envelope.type === PreviewBridgeMessageType.SURFACE_RESIZE) {
            if (CrossFrameValidator.validateIncomingMessage(envelope)) {
              const resizePayload = envelope.payload as {height: number; width?: number};
              this.dynamicHeight.set(resizePayload.height);
            }
          }
        }
      }
    });
  }

  private sendPayloadToIframe(payload: unknown[]): void {
    const frame = this.iframeRef()?.nativeElement;
    const targetWindow = frame?.contentWindow;
    if (targetWindow) {
      const expectedUrl =
        typeof this.startupResolution?.getResolvedRendererUrl === 'function'
          ? this.startupResolution.getResolvedRendererUrl()
          : typeof this.startupResolution?.resolvedUrl === 'function'
            ? this.startupResolution.resolvedUrl()
            : null;
      if (expectedUrl) {
        try {
          const targetOrigin = new URL(expectedUrl, globalThis.location?.href).origin;
          targetWindow.postMessage(
            {
              type: PreviewBridgeMessageType.RENDER_A2UI,
              payload,
            },
            targetOrigin,
          );
        } catch (e) {
          console.warn('Failed to postMessage to iframe:', e);
        }
      }
    }
    this.hostCommunication.sendRenderA2UI(payload);
  }

  /**
   * Dispatches the active A2UI payload to the renderer iframe once the DOM iframe element finishes loading.
   */
  protected syncPayloadOnIframeLoad(): void {
    const payload = this.payload();
    if (payload !== null && Array.isArray(payload) && payload.length > 0) {
      this.sendPayloadToIframe(payload);
    }
  }
}
