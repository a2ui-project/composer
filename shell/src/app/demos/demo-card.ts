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
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {Demo, PreviewBridgeMessageType} from 'a2ui-bridge';
import {buildRendererUrl} from '../preview/renderer-url';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {HostCommunication, MessageEnvelope} from '../shell/host-communication/host-communication';
import {AppConfigProvider} from '../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../shell/cross-frame-validator/cross-frame-validator';
import {DemoLauncher} from './services/demo-launcher';

/** Lifecycle phases of a single demo card's renderer frame handshake. */
type DemoCardState = 'idle' | 'mounting' | 'ready' | 'error';

/**
 * Phases a card's height measurement passes through for one attached frame.
 *
 * `measuring` is the window opened by the frame's first usable report, during which the
 * last report wins; `growing` follows it, during which only a larger report is
 * information; `settled` is silence outlasting {@link GROWTH_SETTLE_MS}, after which the
 * card ignores its frame entirely. See {@link DemoCard.applyReportedHeight}.
 */
type MeasurementPhase = 'measuring' | 'growing' | 'settled';

/**
 * CSS height the renderer frame is held at until a measurement commits.
 *
 * This constant is not cosmetic — it is the *measurement floor*. The guest bridge
 * reports `max(body.scrollHeight, documentElement.scrollHeight, body.offsetHeight,
 * documentElement.offsetHeight)`, and `documentElement.scrollHeight` can never fall
 * below the frame's own viewport, i.e. below this height. So every report the card
 * receives is `max(trueContentHeight, MEASURE_HEIGHT_PX)`, and any demo shorter than
 * this floor is indistinguishable from one exactly this tall.
 *
 * It is therefore deliberately far below any plausible rendered demo: the shortest
 * demo in the basic catalog (Row Layout) measures 56px, so a 32px floor leaves every
 * real demo measurable while still swallowing the empty pre-render document (whose
 * body is nothing but its own 16px padding, exactly this height).
 *
 * Must match the `--demo-card-measure-h` custom property in demo-card.scss.
 */
const MEASURE_HEIGHT_PX = 32;

/**
 * Largest height a demo card's rendered surface is allowed to occupy.
 *
 * A demo taller than this is committed at the clamp and scrolls inside its own frame
 * rather than being truncated: the frame is a real viewport, so the guest document
 * simply overflows it and the reader can scroll the demo in place. Tall examples scroll internally so they do not dominate a row.
 *
 * Must match the `--demo-card-max-h` custom property declared on `:host` in
 * demo-card.scss.
 */
const MAX_CARD_HEIGHT_PX = 560;

/**
 * Fallback measurement window for external renderers without content-ready reports.
 *
 * The window opens on that frame's first usable report and the last report to arrive
 * before it closes is the one committed. It exists because the *first* report is not the
 * demo: the renderer draws its own "waiting for a payload" screen while it boots, which
 * against the Angular sample measures 166px, so committing on sight republished the old
 * defect at a new number — every demo shorter than that idle screen would sit at the idle
 * screen's height, since once the frame is sized to a committed height the reports are
 * floored there and a shrink can no longer be seen.
 *
 * 1s is sized off measured report timings against the Angular sample renderer. A frame
 * rendering on screen goes idle screen -> final demo within ~60ms (the widest observed
 * burst is Login Form with Validation at 53ms: 166, 417, 465), so 1s is more than an
 * order of magnitude of headroom, while still being short enough that the placeholder
 * covering a card's very first measurement is gone before the reader — who is scrolling
 * towards a card mounted a full viewport ahead — arrives at it.
 *
 * The window is armed once rather than restarted per report, which bounds measuring: a
 * demo that never stops changing height still commits, instead of never resolving.
 */
const MEASURE_SETTLE_MS = 1000;

/**
 * Quiet period a committed card waits out before it stops listening for growth.
 *
 * A demo does not reach its final size in one report and not all of it arrives in the
 * first burst: images decode late, and a frame that mounted off screen is render
 * throttled by the browser and only finishes once it is scrolled into view. Recipe Card
 * grows 228 -> 395 when its image lands, up to 5.1s after the report that preceded it in
 * the runs this constant was measured from. 8s covers that with headroom.
 *
 * A long window is close to free, which is why it is set from the worst case rather than
 * the typical one. Guest reports are deduplicated and floored at the frame's own height,
 * so a card that has grown to fit its content is told nothing new and nothing moves; the
 * window governs how long a card stays *willing* to grow, not how long it churns. What it
 * does bound is a demo that animates its own height, which would otherwise reshuffle the
 * grid columns under the reader for as long as the wall is open.
 */
const GROWTH_SETTLE_MS = 8000;

/**
 * Grace period allowed for a freshly mounted frame to report RENDERER_READY.
 * Renderer-side failures are only logged inside the guest frame, so without
 * this deadline a broken demo would present as a silently blank card.
 */
const READY_TIMEOUT_MS = 8000;

/**
 * Renders one live A2UI demo inside its own sandboxed renderer iframe.
 *
 * The frame is only attached once {@link DemoCard.mount} turns true, which keeps
 * a wall of cards lazy, and the demo payload is dispatched exactly once per frame
 * load after that frame's own RENDERER_READY handshake.
 *
 * Height is measured rather than assumed. Until a card has a height, its frame is held at
 * {@link MEASURE_HEIGHT_PX} — far below any real demo — so the guest's reports carry the
 * content's height rather than the frame's own; the card commits the last height reported
 * inside a short window, then follows growth until the reports stop, which keeps the
 * surrounding grid from reflowing underneath the reader. See {@link
 * DemoCard.applyReportedHeight} for why no single report can be trusted on its own.
 */
@Component({
  selector: 'a2ui-composer-demo-card',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './demo-card.ng.html',
  styleUrl: './demo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The iframe and its layout box share a scale, including after viewport changes.
    '[style.--demo-preview-scale]': 'previewScale()',
  },
})
export class DemoCard {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly startupResolution = inject(StartupResolution);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly demoLauncher = inject(DemoLauncher);

  /** The demo whose A2UI payload this card renders. */
  readonly demo = input.required<Demo>();

  /** Gate controlling frame attachment; the owning route drives it from viewport visibility. */
  readonly mount = input<boolean>(false);

  private readonly stateSignal = signal<DemoCardState>('idle');
  /** Readonly handshake state for this card's renderer frame. */
  readonly state = this.stateSignal.asReadonly();

  private readonly cardHeightSignal = signal<number | null>(null);
  private readonly hasRenderedContent = signal(false);
  /**
   * Readonly measured height in pixels, or null before any rendered report.
   *
   * This is the height in the *guest's* coordinate space — what the demo measures inside
   * its own unscaled viewport — not the height the card occupies on the wall. See {@link
   * DemoCard.surfaceHeight} for the latter.
   */
  readonly cardHeight = this.cardHeightSignal.asReadonly();

  private readonly availableWidth = signal(0);
  private readonly contentWidth = signal(0);
  /** Overflow is renderer-owned evidence that this demo needs a full-width tile. */
  readonly needsWideLayout = computed(() => this.contentWidth() > 0);

  /** Fit wide, interactive content without reloading the frame or losing form state. */
  protected readonly previewScale = computed(() => {
    const available = this.availableWidth();
    return available > 0 && this.contentWidth() > available ? available / this.contentWidth() : 1;
  });

  /** Names the demo when assistive technology lists the wall's launch controls. */
  protected readonly openLabel = computed(() => `Open in Composer: ${this.demo().name}`);

  /** Painted height tracks the same scale as the iframe, preventing cropping or gaps. */
  protected readonly surfaceHeight = computed(() => {
    const measured = this.cardHeight();
    return measured === null ? null : Math.floor(measured * this.previewScale());
  });

  /**
   * How this card is currently treating its frame's height reports. Reset to `measuring`
   * every time a frame is attached, so a card the wall unmounts and remounts measures the
   * demo again rather than living forever with whatever its first pass caught.
   */
  private phase: MeasurementPhase = 'measuring';

  /** Latest height reported inside the open measurement window, or null when none is. */
  private pendingHeight: number | null = null;

  private settleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Whether the demo payload has already been sent for the frame's current document.
   *
   * Deliberately keyed on the frame's *load*, not on `contentWindow` identity: a
   * WindowProxy keeps a stable identity across the frame's own navigations, so an
   * identity-keyed guard cannot tell a re-announcing fresh document apart from a
   * duplicate handshake. See {@link DemoCard.onFrameLoad}.
   */
  private payloadSentForCurrentLoad = false;

  private readyTimeoutId: ReturnType<typeof setTimeout> | null = null;

  protected readonly surfaceRef = viewChild<ElementRef<HTMLElement>>('demoSurface');

  protected readonly iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('demoIframe');

  protected readonly safeRendererUrl = computed(() => {
    const built = buildRendererUrl(
      this.startupResolution.resolvedUrl(),
      untracked(() => this.configProvider.themePreference()),
    );
    return built ? this.sanitizer.bypassSecurityTrustResourceUrl(built) : null;
  });

  /**
   * Whether the loading placeholder should cover the surface.
   *
   * It covers an unmounted card, as it always has, and now also a mounted card that has
   * not committed a height yet: during that window the frame is deliberately held at
   * {@link MEASURE_HEIGHT_PX} so the guest's reports describe its content rather than
   * its frame, and a stunted frame — showing the renderer's own pre-payload idle screen
   * across the top of an otherwise blank surface — is not what the reader should see.
   */
  protected readonly showPlaceholder = computed(
    () => !this.hasRenderedContent() || !this.mount() || !this.safeRendererUrl(),
  );

  constructor() {
    effect(onCleanup => {
      const surface = this.surfaceRef()?.nativeElement;
      if (!surface) return;
      const observer = new ResizeObserver(() => this.measureAvailableWidth(surface));
      observer.observe(surface);
      onCleanup(() => observer.disconnect());
    });

    // Mount gate: opening the gate starts the ready deadline for this card only.
    effect(onCleanup => {
      if (!this.mount()) {
        return;
      }
      untracked(() => {
        if (this.stateSignal() === 'idle') {
          this.stateSignal.set('mounting');
        }
      });
      this.startReadyTimeout();
      onCleanup(() => this.clearReadyTimeout());
    });

    // Frame binding: registers this card as a secondary consumer and listens only to
    // envelopes dispatched by its own guest window. registerSecondaryIframe is required
    // here; registerIframe would clear the shared outbound buffer and reset global
    // renderer readiness for every other consumer each time a card mounts.
    effect(onCleanup => {
      const element = this.iframeRef()?.nativeElement ?? null;
      if (!element) {
        return;
      }

      this.payloadSentForCurrentLoad = false;
      this.hasRenderedContent.set(false);
      this.hostCommunication.registerSecondaryIframe(element);
      const guestWindow = element.contentWindow;
      const subscription = guestWindow
        ? this.hostCommunication
            .messageStreamFor(guestWindow)
            .subscribe(envelope =>
              untracked(() => this.handleEnvelope(envelope, element, guestWindow)),
            )
        : null;

      onCleanup(() => {
        subscription?.unsubscribe();
        this.hostCommunication.unregisterSecondaryIframe(element);
        this.endMeasurementForTornDownFrame();
      });
    });

    // Renderer-switch trigger: switching renderers in Settings is what actually causes
    // a reload (it changes resolvedUrl(), which changes safeRendererUrl() and thus the
    // iframe's `src`). Resetting here reacts to that cause directly, instead of relying
    // on the frame's `load` event as a proxy for it. That matters because `load` and this
    // load's RENDERER_READY posts are both delivered asynchronously with no ordering
    // guarantee between them: under React StrictMode, if `load` were to fire between the
    // two READY posts, a reset keyed only on `load` would re-arm the flag mid-load and
    // cause a duplicate RENDER_A2UI send that replays createSurface for the same
    // surfaceId. This effect closes that gap for the actual renderer-switch case; the
    // `load` listener (see {@link DemoCard.onFrameLoad}) remains as the cover for a
    // guest-initiated reload that doesn't change safeRendererUrl().
    effect(() => {
      this.safeRendererUrl();
      untracked(() => {
        this.payloadSentForCurrentLoad = false;
        // A different renderer lays the same demo out differently, so the height measured
        // for the outgoing one is not evidence about the incoming one. Dropping back to
        // the measuring floor is what lets the new guest report its own content height
        // instead of inheriting the old card's floor.
        this.cardHeightSignal.set(null);
        this.hasRenderedContent.set(false);
        this.contentWidth.set(0);
        this.pendingHeight = null;
        this.phase = 'measuring';
        this.clearSettleTimeout();
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.clearSettleTimeout();
      this.clearReadyTimeout();
    });
  }

  /**
   * Applies a bridge envelope originating from this card's own renderer frame.
   *
   * DATA_MODEL_CHANGE and every other message type are deliberately ignored: most
   * demos request data model echoes that this page has no use for.
   */
  private handleEnvelope(
    envelope: MessageEnvelope,
    iframe: HTMLIFrameElement,
    guestWindow: Window,
  ): void {
    if (envelope.sourceWindow !== guestWindow) {
      return;
    }

    switch (envelope.type) {
      case PreviewBridgeMessageType.RENDERER_READY: {
        this.stateSignal.set('ready');
        // React renderers under StrictMode announce readiness twice; the payload
        // must be dispatched exactly once per frame load.
        if (this.payloadSentForCurrentLoad) {
          return;
        }
        this.payloadSentForCurrentLoad = true;
        this.startReadyTimeout();
        this.hostCommunication.sendToFrame(
          {type: PreviewBridgeMessageType.RENDER_A2UI, payload: this.demo().a2ui},
          iframe,
        );
        return;
      }
      case PreviewBridgeMessageType.SURFACE_RESIZE: {
        if (!CrossFrameValidator.validateIncomingMessage(envelope)) {
          return;
        }
        const {height, width, viewportWidth, contentReady} = envelope.payload as {
          height: number;
          width?: number;
          viewportWidth?: number;
          contentReady?: boolean;
        };
        // New bridges distinguish a committed A2UI surface from the startup screen.
        // Older external renderers still use the bounded measurement window.
        if (contentReady === false) {
          // A constructor-time legacy report can precede the capability handshake.
          // It must not reveal the startup screen while native rendering is pending.
          if (this.phase === 'measuring') {
            this.clearSettleTimeout();
            this.pendingHeight = null;
          }
          return;
        }
        const surface = this.surfaceRef()?.nativeElement;
        if (surface) this.measureAvailableWidth(surface);
        // Ignore the viewport's own width and fractional rounding. Only actual
        // horizontal overflow earns a larger canvas, retained across lazy remounts.
        const measuredViewport = viewportWidth ?? iframe.clientWidth;
        if (measuredViewport > 0 && width !== undefined && width > measuredViewport + 2) {
          this.contentWidth.set(Math.max(this.contentWidth(), Math.ceil(width)));
        }
        if (this.phase !== 'settled') this.applyReportedHeight(height);
        if (contentReady === true && this.phase === 'measuring' && this.pendingHeight !== null) {
          this.clearSettleTimeout();
          this.closeMeasurementWindow();
        }
        return;
      }
      default:
        return;
    }
  }

  private measureAvailableWidth(surface: HTMLElement): void {
    if (surface.clientWidth > 0) this.availableWidth.set(surface.clientWidth);
  }

  /**
   * Sends this card's demo to the composer workspace as the active draft.
   *
   * The work belongs to {@link DemoLauncher}, which encodes the payload into the same
   * shared-design link the Share button produces; the card only names the demo.
   */
  protected openInWorkspace(): void {
    void this.demoLauncher.openInWorkspace(this.demo());
  }

  /**
   * Re-arms the payload send for the document the frame has just finished loading.
   *
   * Switching renderers in Settings changes {@link StartupResolution.resolvedUrl}, so
   * every card's iframe `src` changes and the frame reloads: the guest app boots fresh
   * and emits a new RENDERER_READY. Because `contentWindow` returns a WindowProxy whose
   * identity is stable across the frame's own navigations, guarding on window identity
   * suppressed that resend and left the card sitting on the renderer's idle placeholder
   * with no console error. Resetting only the sent state here lets a reload re-request
   * the payload while a StrictMode double RENDERER_READY inside one load still collapses
   * to a single send, and avoids unregister/re-register churn on the subscription.
   */
  protected onFrameLoad(): void {
    this.payloadSentForCurrentLoad = false;
  }

  /**
   * Folds a height the guest has just reported into this frame's measurement.
   *
   * Everything here follows from one fact about the report: the guest measures
   * `max(body/documentElement scroll and offset heights)`, and
   * `documentElement.scrollHeight` can never come back smaller than the frame's own
   * viewport. Every report is therefore `max(trueContentHeight, currentFrameHeight)` —
   * the frame's height is an input to its own measurement — which is what makes a
   * measurement *window* necessary rather than a single trusted report.
   *
   * **Measuring.** The window opens on the first usable report and the last report inside
   * it wins. It has to work that way because the first report is not the demo: the
   * renderer draws its own "waiting for a payload" screen while it boots, which measures
   * 166px against the Angular sample, and the demo that replaces it is very often shorter.
   * On a card's first frame nothing is committed yet, so the frame is still held at {@link
   * MEASURE_HEIGHT_PX} and reports carry the content's own height, free to move down as
   * well as up. On a later frame the floor is instead the height already on screen, which
   * is what keeps the card from flashing a placeholder every time the wall remounts it;
   * the idle screen may briefly measure above that floor, but it is never the last report
   * in the window.
   *
   * **Growing.** Past the window, only a larger report carries information: the frame now
   * fills the committed height, so a shorter measurement is not observable and an equal
   * one says only that the content still fits. Growth is real — a late image decode, a
   * frame that finished rendering once the browser stopped throttling it — so the card
   * follows it upwards, converging rather than oscillating, until {@link
   * GROWTH_SETTLE_MS} of silence settles it.
   *
   * In both phases a report at or below {@link MEASURE_HEIGHT_PX} is discarded outright.
   * It is the floor itself and carries no evidence that any content rendered: the guest
   * posts RENDERER_READY and a SURFACE_RESIZE back to back, before content exists, so
   * that first report measures an empty document and comes back as exactly the frame's
   * CSS height. Committing it is the regression that pinned every card in the wall to one
   * height and clipped its demo under `.demo-card-surface { overflow: hidden }`. {@link
   * DemoCard.payloadSentForCurrentLoad} cannot screen it out either, since it is already
   * true by the time the resize envelope is delivered — only the measurement distinguishes
   * them.
   *
   * @param height Raw height in pixels as reported by this card's guest frame.
   */
  private applyReportedHeight(height: number): void {
    const clampedHeight = Math.min(
      MAX_CARD_HEIGHT_PX,
      Math.max(MEASURE_HEIGHT_PX, Math.round(height)),
    );
    if (clampedHeight <= MEASURE_HEIGHT_PX) {
      return;
    }

    if (this.phase === 'measuring') {
      this.pendingHeight = clampedHeight;
      // Armed once, not restarted per report, so that measuring terminates even for a
      // demo whose height never stops moving.
      if (this.settleTimeoutId === null) {
        this.settleTimeoutId = setTimeout(() => {
          this.settleTimeoutId = null;
          this.closeMeasurementWindow();
        }, MEASURE_SETTLE_MS);
      }
      return;
    }

    const committedHeight = this.cardHeightSignal();
    if (committedHeight !== null && clampedHeight <= committedHeight) {
      return;
    }
    this.cardHeightSignal.set(clampedHeight);
    this.restartGrowthTimeout();
  }

  /** Commits the last height measured inside the window and opens the growth phase. */
  private closeMeasurementWindow(): void {
    this.phase = 'growing';
    if (this.pendingHeight !== null) {
      this.cardHeightSignal.set(this.pendingHeight);
      this.hasRenderedContent.set(true);
      this.stateSignal.set('ready');
      this.clearReadyTimeout();
      this.pendingHeight = null;
    }
    this.restartGrowthTimeout();
  }

  /**
   * Closes out the measurement of a frame the wall has just taken away.
   *
   * A frame torn down mid-window still measured something real, so that height is
   * committed rather than discarded: it beats leaving the card as a bare placeholder, and
   * costs nothing if it was a fragment, because the next frame this card is given opens
   * its own window and measures the demo again from scratch.
   */
  private endMeasurementForTornDownFrame(): void {
    this.clearSettleTimeout();
    if (this.phase === 'measuring' && this.pendingHeight !== null) {
      this.cardHeightSignal.set(this.pendingHeight);
    }
    this.pendingHeight = null;
    this.phase = 'measuring';
  }

  private restartGrowthTimeout(): void {
    this.clearSettleTimeout();
    this.settleTimeoutId = setTimeout(() => {
      this.settleTimeoutId = null;
      this.phase = 'settled';
    }, GROWTH_SETTLE_MS);
  }

  private clearSettleTimeout(): void {
    if (this.settleTimeoutId !== null) {
      clearTimeout(this.settleTimeoutId);
      this.settleTimeoutId = null;
    }
  }

  private clearReadyTimeout(): void {
    if (this.readyTimeoutId !== null) {
      clearTimeout(this.readyTimeoutId);
      this.readyTimeoutId = null;
    }
  }

  private startReadyTimeout(): void {
    this.clearReadyTimeout();
    this.readyTimeoutId = setTimeout(() => {
      if (!this.hasRenderedContent()) this.stateSignal.set('error');
    }, READY_TIMEOUT_MS);
  }
}
