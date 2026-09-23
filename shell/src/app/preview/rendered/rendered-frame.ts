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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DomSanitizer} from '@angular/platform-browser';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {isValidHttpUrl} from '../../utils/url';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {ChatState} from '../../chat/chat-state/chat-state';
import {ErrorLogger} from '../../debug/error-logger.service';

import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';

/**
 * Number of consecutive growing SURFACE_RESIZE reports that trips the growth
 * circuit breaker. A healthy renderer settles within a handful of reports, so
 * this is high enough never to fire on legitimate content while still bounding
 * a feedback loop to a fraction of a second.
 *
 * This covers monotonic divergence, which is the failure mode that scrolls
 * content out of view and pins the frame at its maximum. It deliberately does
 * not try to detect an oscillating loop: healthy renderers oscillate too. The
 * Lit sample reports 32,148,288,312,148,288,312 for one ordinary re-render, so
 * alternation is not a signal that can be separated from normal behaviour
 * here. Oscillation is covered by the settle assertion in
 * shell/e2e/renderer-integration-and-telemetry.e2e.ts instead.
 */
const MAX_MONOTONIC_GROWTH_REPORTS = 8;

/**
 * Maximum gap between two reports for them to belong to the same growth run.
 * Legitimate streaming also grows the frame step by step, but not at the
 * sub-frame cadence a resize feedback loop runs at.
 */
const RUNAWAY_REPORT_INTERVAL_MS = 500;

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
  private errorLogger = inject(ErrorLogger);

  /** Optional layout payload to render immediately into the guest iframe. */
  readonly payload = input<unknown[] | null | undefined>(null);

  /** Tracks dynamic surface height reported by the guest renderer frame. */
  readonly dynamicHeight = signal<number | null>(null);

  private readonly growthBreakerLatched = signal<boolean>(false);

  /** True once the guest has been detected driving the frame into unbounded growth. */
  readonly isGrowthBreakerLatched = this.growthBreakerLatched.asReadonly();

  /** Height reported by the first message of the current growth run, in pixels. */
  private growthRunStartHeight: number | null = null;
  private lastReportedHeight: number | null = null;
  private lastReportTimestamp = 0;
  private growthRunLength = 0;
  /** Renderer URL the current breaker state belongs to; undefined until first read. */
  private trackedRendererUrl: string | null | undefined = undefined;

  /** Computed pixel height string or 100% when rendered within dynamic/inline layout contexts. */
  readonly frameHeight = computed(() => {
    const h = this.dynamicHeight();
    return h && h > 0 ? h : null;
  });

  /**
   * `frameHeight` as a CSS length, or undefined when the guest has not
   * reported one.
   *
   * Applied as both `height` and `min-height` so that a reported height wins
   * over the stylesheet's minimum, which would otherwise leave a tall empty
   * area below a short surface.
   */
  protected readonly frameHeightPx = computed<string | undefined>(() => {
    const height = this.frameHeight();
    return height === null ? undefined : `${height}px`;
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
        // New content legitimately resizes the surface; start counting afresh.
        this.resetGrowthRun();
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
            this.dynamicHeight.set(this.capReportedHeight(resizePayload.height));
          }
        }
      }
    });

    // Runaway growth circuit breaker. The counting must happen here rather than in
    // the effect above: signal effects coalesce, so a burst of messages arriving in
    // one change detection tick runs that effect once, for the last value only, and
    // a counter inside it would never see the ramp that defines a feedback loop.
    this.hostCommunication.messageStream$
      .pipe(takeUntilDestroyed())
      .subscribe(envelope => this.trackReportedGrowth(envelope));

    // A different renderer means a different guest; give it a clean slate.
    effect(() => {
      const rendererUrl = this.startupResolution.resolvedUrl();
      untracked(() => {
        if (this.trackedRendererUrl !== undefined && rendererUrl !== this.trackedRendererUrl) {
          this.resetGrowthBreaker();
        }
        this.trackedRendererUrl = rendererUrl;
      });
    });
  }

  /**
   * Counts consecutive growing surface reports and latches the circuit breaker
   * when a guest drives the frame into unbounded growth.
   */
  private trackReportedGrowth(envelope: MessageEnvelope | null): void {
    if (!envelope) {
      return;
    }

    const myWindow = untracked(() => this.iframeRef()?.nativeElement)?.contentWindow;
    if (envelope.sourceWindow && myWindow && envelope.sourceWindow !== myWindow) {
      return;
    }

    if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
      this.resetGrowthBreaker();
      return;
    }

    if (
      envelope.type !== PreviewBridgeMessageType.SURFACE_RESIZE ||
      !CrossFrameValidator.validateIncomingMessage(envelope)
    ) {
      return;
    }

    const height = (envelope.payload as {height: number}).height;
    const grewAtLoopCadence =
      this.lastReportedHeight !== null &&
      height > this.lastReportedHeight &&
      envelope.timestamp - this.lastReportTimestamp <= RUNAWAY_REPORT_INTERVAL_MS;

    if (grewAtLoopCadence) {
      this.growthRunLength++;
    } else {
      this.growthRunLength = 1;
      this.growthRunStartHeight = height;
    }
    this.lastReportedHeight = height;
    this.lastReportTimestamp = envelope.timestamp;

    if (this.growthRunLength >= MAX_MONOTONIC_GROWTH_REPORTS && !this.growthBreakerLatched()) {
      this.growthBreakerLatched.set(true);
      this.errorLogger.warn({
        message:
          `Preview frame growth stopped: the renderer reported ${this.growthRunLength} ` +
          `consecutive larger heights within ${RUNAWAY_REPORT_INTERVAL_MS}ms, which is a ` +
          `runaway resize loop. Frame held at ${untracked(() => this.dynamicHeight()) ?? this.growthRunStartHeight}px; ` +
          `last reported height ${height}px.`,
        sourceTag: '[Shell]',
      });
    }
  }

  /**
   * Clamps a reported height so a latched guest can shrink the frame but never
   * grow it further.
   */
  private capReportedHeight(height: number): number {
    if (!untracked(() => this.growthBreakerLatched())) {
      return height;
    }
    const ceiling = untracked(() => this.dynamicHeight()) ?? this.growthRunStartHeight;
    return ceiling === null ? height : Math.min(height, ceiling);
  }

  /** Ends the current growth run without clearing an existing latch. */
  private resetGrowthRun(): void {
    this.growthRunLength = 0;
    this.growthRunStartHeight = null;
    this.lastReportedHeight = null;
    this.lastReportTimestamp = 0;
  }

  /** Clears the latch and the growth run, restoring unrestricted sizing. */
  private resetGrowthBreaker(): void {
    this.resetGrowthRun();
    this.growthBreakerLatched.set(false);
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
