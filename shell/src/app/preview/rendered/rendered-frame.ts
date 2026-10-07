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
  DestroyRef,
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
import {StateSync} from '../../chat/state-sync/state-sync';
import {ErrorLogger} from '../../debug/error-logger.service';

import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';

/**
 * Number of consecutive growing SURFACE_RESIZE reports that makes the growth
 * circuit breaker hold the frame. A healthy renderer settles within a handful
 * of reports, so this bounds a feedback loop to a fraction of a second while
 * rarely firing on legitimate content; when it does, the hold is released
 * again as described on {@link HELD_GROWTH_REPORTS_TO_RELEASE}.
 *
 * This covers monotonic divergence, which is the failure mode that scrolls
 * content out of view and pins the frame at its maximum. It deliberately does
 * not try to detect an oscillating loop: healthy renderers oscillate too. The
 * Lit sample reports 32,148,288,312,148,288,312 for one ordinary re-render, so
 * alternation is not a signal that can be separated from normal behaviour
 * here. Oscillation is covered by the settle assertion in
 * shell/e2e/renderer-integration-and-telemetry.e2e.ts instead.
 */
const MAX_MONOTONIC_GROWTH_REPORTS = 16;

/**
 * Maximum gap between two reports for them to belong to the same growth run.
 * Legitimate streaming also grows the frame step by step, but not at the
 * sub-frame cadence a resize feedback loop runs at.
 *
 * Doubles as the quiet period after which a held guest counts as settled, and
 * as the window within which growth following an applied height counts as a
 * reaction to it.
 */
const RUNAWAY_REPORT_INTERVAL_MS = 500;

/**
 * Number of further growing reports a held guest sends before the hold is
 * released as a false alarm.
 *
 * A resize feedback loop only grows because the host applies each reported
 * height, so a held guest falls silent after at most the report already in
 * flight. A guest that keeps reporting larger heights while the frame is held
 * is growing on its own, for example through a CSS height transition (Angular
 * Material's expansion panel animates its height over 225ms, which is a dozen
 * per-frame reports at 60Hz and twice that on a 120Hz display) or a streaming
 * surface, and has to be followed or its content ends up clipped.
 */
const HELD_GROWTH_REPORTS_TO_RELEASE = 3;

/**
 * Maximum number of times within one growth run that a hold is released
 * because the guest kept growing. A guest that answers every applied height
 * with a long burst of growth would otherwise alternate between holding and
 * releasing forever; after this many releases the hold lasts until the reports
 * settle.
 */
const MAX_OWN_GROWTH_RELEASES_PER_RUN = 2;

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
  private stateSync = inject(StateSync);
  private errorLogger = inject(ErrorLogger);
  private readonly logger = this.errorLogger.withTag('[RenderedFrame]');

  /** Optional layout payload to render immediately into the guest iframe. */
  readonly payload = input<unknown[] | null | undefined>(null);

  /**
   * Sizes the frame to its container instead of to the guest's reported
   * surface height.
   *
   * An inline preview sizes itself to its content, so the host follows the
   * guest's SURFACE_RESIZE reports. A side panel is a fixed viewport whose
   * content scrolls, like the canvas panels of production hosts, so there the
   * frame fills the panel and the reports are ignored. With the frame's size
   * no longer depending on the guest, a guest laid out against its own
   * viewport (`100%`, `100vh`) cannot feed back into it, and the growth
   * circuit breaker has nothing to guard.
   */
  readonly fillContainer = input<boolean>(false);

  /** Tracks dynamic surface height reported by the guest renderer frame. */
  readonly dynamicHeight = signal<number | null>(null);

  private readonly growthBreakerLatched = signal<boolean>(false);

  /**
   * True while the frame is held because the guest looked like it was driving
   * the frame into unbounded growth.
   */
  readonly isGrowthBreakerLatched = this.growthBreakerLatched.asReadonly();

  /** Height reported by the first message of the current growth run, in pixels. */
  private growthRunStartHeight: number | null = null;
  private lastReportedHeight: number | null = null;
  private lastReportTimestamp = 0;
  private growthRunLength = 0;
  /** Growing reports received since the frame was last held. */
  private heldGrowthReports = 0;
  /** Holds released in the current run because the guest kept growing while held. */
  private ownGrowthReleases = 0;
  /**
   * Set while the frame waits for a held guest to settle, in which case its last
   * reported height is applied as a probe for the feedback loop.
   */
  private settleTimer: ReturnType<typeof setTimeout> | null = null;
  /** True once a settled guest's height has been applied and its reaction is awaited. */
  private settleProbePending = false;
  /**
   * True once the guest grew again right after its settled height was applied,
   * which confirms the feedback loop and ends the probing for this run.
   */
  private loopConfirmed = false;
  /** Renderer URL the current breaker state belongs to; undefined until first read. */
  private trackedRendererUrl: string | null | undefined = undefined;
  private lastHandledResetNonce = this.stateSync.sessionResetNonce();

  /**
   * Usable height reported by the guest, in pixels, or null when there is none
   * or the frame fills its container, in which case the container falls back to
   * 100% of its host.
   */
  readonly frameHeight = computed(() => {
    if (this.fillContainer()) {
      return null;
    }
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
        this.logger.error('Renderer URL failed safe validation:', urlString);
        return null;
      }

      return this.sanitizer.bypassSecurityTrustResourceUrl(urlString);
    } catch (e) {
      this.logger.error('Failed to parse renderer URL:', e);
      return null;
    }
  });

  constructor() {
    effect(onCleanup => {
      const ref = this.iframeRef();
      const el = ref?.nativeElement ?? null;
      if (el) {
        this.resetGrowthRun();
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
    // Subscribed directly to messageStream$ rather than an effect so bursts of
    // messages (e.g. SURFACE_RESIZE followed immediately by DATA_MODEL_CHANGE)
    // do not coalesce and drop the resize report.
    this.hostCommunication.messageStream$.pipe(takeUntilDestroyed()).subscribe(envelope => {
      this.trackReportedGrowth(envelope);
      this.handleInboundEnvelope(envelope);
    });
    inject(DestroyRef).onDestroy(() => this.clearSettleTimer());

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

    // Reset dynamic height and growth breaker latch when starting a new session.
    effect(() => {
      const nonce = this.stateSync.sessionResetNonce();
      if (nonce > this.lastHandledResetNonce) {
        this.lastHandledResetNonce = nonce;
        untracked(() => {
          this.dynamicHeight.set(null);
          this.resetGrowthBreaker();
        });
      }
    });
  }

  /**
   * Handles incoming bridge messages (renderer ready, catalog ready, surface resize)
   * without dropping messages during rapid bursts.
   */
  private handleInboundEnvelope(envelope: MessageEnvelope | null): void {
    if (!envelope) {
      return;
    }

    const myIframe = untracked(() => this.iframeRef()?.nativeElement);
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
      // A frame that fills its container has a fixed size; the guest's
      // measurements are informational only. Read untracked so that a mode
      // switch does not replay the last report.
      if (
        !untracked(() => this.fillContainer()) &&
        CrossFrameValidator.validateIncomingMessage(envelope, undefined, this.logger)
      ) {
        const resizePayload = envelope.payload as {height: number; width?: number};
        this.dynamicHeight.set(this.capReportedHeight(resizePayload.height));
      }
    }
  }

  /**
   * Counts consecutive growing surface reports, holds the frame when a guest
   * appears to drive it into unbounded growth, and releases the hold again
   * once the guest proves otherwise.
   *
   * A feedback loop only grows because the host applies each reported height,
   * so holding the frame is also the test for one: a looping guest falls
   * silent, while a guest that is growing on its own keeps reporting. A silent
   * guest gets its last height applied once the reports settle; growing again
   * right after that confirms the loop.
   */
  private trackReportedGrowth(envelope: MessageEnvelope | null): void {
    // A feedback loop needs the host to apply the reports; a frame that fills
    // its container never does, so there is nothing to count.
    if (!envelope || untracked(() => this.fillContainer())) {
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

    if (envelope.type === PreviewBridgeMessageType.RENDER_SUCCESS) {
      this.resetGrowthRun();
      return;
    }

    if (
      envelope.type !== PreviewBridgeMessageType.SURFACE_RESIZE ||
      !CrossFrameValidator.validateIncomingMessage(envelope, undefined, this.logger)
    ) {
      return;
    }

    const height = (envelope.payload as {height: number}).height;
    const grewAtLoopCadence =
      this.lastReportedHeight !== null &&
      height > this.lastReportedHeight &&
      envelope.timestamp - this.lastReportTimestamp <= RUNAWAY_REPORT_INTERVAL_MS;

    if (!grewAtLoopCadence) {
      // A report that does not grow, or that arrives after a pause, ends the
      // run: whatever burst the guest was in is over, so any hold ends with it.
      this.resetGrowthBreaker();
      this.growthRunStartHeight = height;
    }
    this.growthRunLength++;
    this.lastReportedHeight = height;
    this.lastReportTimestamp = envelope.timestamp;

    if (this.settleProbePending) {
      // The guest grew again as soon as its settled height was applied, which
      // is the host feeding the loop. Hold until the run ends.
      this.settleProbePending = false;
      this.holdFrame(height, /* confirmed= */ true);
      return;
    }

    if (this.growthBreakerLatched()) {
      this.heldGrowthReports++;
      if (
        this.heldGrowthReports >= HELD_GROWTH_REPORTS_TO_RELEASE &&
        this.ownGrowthReleases < MAX_OWN_GROWTH_RELEASES_PER_RUN
      ) {
        // The frame did not move, yet the guest kept growing: it is not reacting
        // to the host. Follow it, and start counting afresh so a guest that does
        // run away eventually is still caught.
        this.ownGrowthReleases++;
        this.growthRunLength = 1;
        this.releaseHold();
      } else if (!this.loopConfirmed) {
        this.armSettleTimer();
      }
      return;
    }

    if (this.growthRunLength >= MAX_MONOTONIC_GROWTH_REPORTS) {
      this.holdFrame(height, /* confirmed= */ false);
    }
  }

  /**
   * Holds the frame at its current height. An unconfirmed hold is a probe that
   * {@link trackReportedGrowth} or {@link applySettledHeight} release again; a
   * confirmed one lasts until the growth run ends.
   */
  private holdFrame(reportedHeight: number, confirmed: boolean): void {
    const heldHeight = untracked(() => this.dynamicHeight()) ?? this.growthRunStartHeight;
    this.growthBreakerLatched.set(true);
    this.heldGrowthReports = 0;

    if (confirmed) {
      this.loopConfirmed = true;
      this.clearSettleTimer();
      this.errorLogger.warn({
        message:
          `Preview frame growth stopped: the renderer grew again as soon as its reported ` +
          `height was applied, which confirms a resize feedback loop. Frame held at ` +
          `${heldHeight}px; last reported height ${reportedHeight}px. The hold ends when ` +
          `the renderer reports a smaller height or pauses for more than ` +
          `${RUNAWAY_REPORT_INTERVAL_MS}ms.`,
        sourceTag: '[Shell]',
      });
      return;
    }

    if (this.ownGrowthReleases === 0) {
      this.errorLogger.info({
        message:
          `Preview frame growth held: the renderer reported ${this.growthRunLength} ` +
          `consecutive larger heights within ${RUNAWAY_REPORT_INTERVAL_MS}ms, which may be a ` +
          `runaway resize loop. Frame held at ${heldHeight}px; last reported height ` +
          `${reportedHeight}px. The hold is released if the renderer keeps growing on its ` +
          `own or once its reports settle.`,
        sourceTag: '[Shell]',
      });
    }
    this.armSettleTimer();
  }

  /** Lets reported heights through again; the current growth run continues. */
  private releaseHold(): void {
    this.clearSettleTimer();
    this.heldGrowthReports = 0;
    this.growthBreakerLatched.set(false);
  }

  /**
   * Applies a held guest's last reported height once it has stopped reporting.
   *
   * The silence means the burst is over; for a transition, the last report is
   * where it ended and withholding it would leave the content clipped. The
   * apply doubles as a probe: a guest that grows again within the runaway
   * window was reacting to it, and {@link trackReportedGrowth} then confirms
   * the loop.
   */
  private applySettledHeight(): void {
    this.settleTimer = null;
    const settledHeight = this.lastReportedHeight;
    if (!this.growthBreakerLatched() || settledHeight === null) {
      return;
    }
    // Reports are timed against the apply from here on, so a reaction to it is
    // recognised as such rather than as the start of an unrelated run.
    this.lastReportTimestamp += RUNAWAY_REPORT_INTERVAL_MS;
    this.growthRunLength = 0;
    this.settleProbePending = true;
    this.releaseHold();
    this.dynamicHeight.set(settledHeight);
  }

  private armSettleTimer(): void {
    this.clearSettleTimer();
    this.settleTimer = setTimeout(() => this.applySettledHeight(), RUNAWAY_REPORT_INTERVAL_MS);
  }

  private clearSettleTimer(): void {
    if (this.settleTimer !== null) {
      clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }
  }

  /**
   * Clamps a reported height so a held guest can shrink the frame but never
   * grow it further.
   */
  private capReportedHeight(height: number): number {
    if (!untracked(() => this.growthBreakerLatched())) {
      return height;
    }
    const ceiling = untracked(() => this.dynamicHeight()) ?? this.growthRunStartHeight;
    return ceiling === null ? height : Math.min(height, ceiling);
  }

  /**
   * Restarts the growth count without ending an existing hold. The last report
   * is kept so the next one is still judged against it: a hold ends only when
   * the guest stops growing, not when the host sends it new content. New
   * content is also a legitimate reason to grow right after a settled height
   * was applied, so an outstanding probe is withdrawn, and a settle timer still
   * armed for the previous content is dropped: firing it later would apply that
   * content's height and take the new content's first report for a reaction.
   */
  private resetGrowthRun(): void {
    this.growthRunLength = 0;
    this.growthRunStartHeight = null;
    this.settleProbePending = false;
    this.clearSettleTimer();
  }

  /** Ends the growth run and any hold, restoring unrestricted sizing. */
  private resetGrowthBreaker(): void {
    this.resetGrowthRun();
    this.lastReportedHeight = null;
    this.lastReportTimestamp = 0;
    this.heldGrowthReports = 0;
    this.ownGrowthReleases = 0;
    this.loopConfirmed = false;
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
      this.resetGrowthRun();
      if (payload !== null && Array.isArray(payload) && payload.length > 0) {
        this.hostCommunication.sendRenderA2UI(payload, iframe);
      }
    }
  }
}
