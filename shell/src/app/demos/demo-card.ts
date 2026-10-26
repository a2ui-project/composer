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
import {Demo, PreviewBridgeMessageType, SurfaceResizePayload} from 'a2ui-bridge';
import {buildRendererUrl} from '../preview/renderer-url';
import {MAX_CONTENT_HEIGHT_PX} from '../preview/content-height';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {
  DefaultTarget,
  HostCommunication,
  MessageEnvelope,
} from '../shell/host-communication/host-communication';
import {AppConfigProvider} from '../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../shell/cross-frame-validator/cross-frame-validator';
import {DemoLauncher} from './services/demo-launcher';
import {ErrorLogger} from '../debug/error-logger.service';
import {
  initialSizing,
  MEASURE_HEIGHT_PX,
  previewScale,
  READY_TIMEOUT_MS,
  reduceSizing,
  SizingEvent,
  windowFor,
} from './demo-card-sizing';

/** Where a demo card is in loading its renderer iframe. */
export enum DemoCardState {
  /** The card hasn't been scrolled near enough to load its iframe yet. */
  IDLE = 'idle',
  /** The iframe is loading and the renderer hasn't sent RENDERER_READY yet. */
  MOUNTING = 'mounting',
  /** The renderer is ready and has been sent the demo. */
  READY = 'ready',
  /** Nothing rendered within {@link READY_TIMEOUT_MS}, or the demo failed to render. */
  ERROR = 'error',
}

/**
 * Renders one live A2UI demo inside its own sandboxed renderer iframe.
 *
 * The frame is only attached once {@link DemoCard.mount} turns true, which keeps
 * a wall of cards lazy, and the demo payload is dispatched exactly once per frame
 * load after that frame's own RENDERER_READY handshake.
 *
 * The card commits its height once, while it is on screen, from the first report the
 * guest marks ready, and then locks it: content that changes later scrolls inside the
 * card, so the wall doesn't reflow under the reader. The rules live in the pure reducer
 * in demo-card-sizing.ts; this component only feeds it events and renders its state.
 * Until it commits, the frame is held at `--demo-card-measure-h` under a placeholder.
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
    // The stylesheet holds the frame and caps the surface with the reducer's constants.
    '[style.--demo-card-measure-h]': 'measureHeightCss',
    '[style.--demo-card-max-h]': 'maxHeightCss',
  },
})
export class DemoCard {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly startupResolution = inject(StartupResolution);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly demoLauncher = inject(DemoLauncher);
  private readonly logger = inject(ErrorLogger).withTag('[DemoCard]');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The demo whose A2UI payload this card renders. */
  readonly demo = input.required<Demo>();

  /** Gate controlling frame attachment; the owning route drives it from viewport visibility. */
  readonly mount = input<boolean>(false);

  protected readonly measureHeightCss = `${MEASURE_HEIGHT_PX}px`;
  protected readonly maxHeightCss = `${MAX_CONTENT_HEIGHT_PX}px`;

  /** Where the frame is in its handshake; the sizing state adds the error case. */
  private readonly handshakeState = signal(DemoCardState.IDLE);

  private readonly sizing = signal(initialSizing());

  /** Where this card is in loading its renderer iframe. */
  readonly state = computed(() =>
    this.sizing().kind === 'error' ? DemoCardState.ERROR : this.handshakeState(),
  );

  /** Whether the renderer failed to show anything in time, or failed to render the demo. */
  protected readonly hasError = computed(() => this.state() === DemoCardState.ERROR);

  /**
   * The committed height in pixels, or null before the card has committed one.
   *
   * This is the height in the *guest's* coordinate space — what the demo measures inside
   * its own unscaled viewport — not the height the card occupies on the wall. See {@link
   * DemoCard.surfaceHeight} for the latter.
   */
  readonly cardHeight = computed(() => this.sizing().height);

  /** Width of the card around its surface: its borders and the surface's margin. */
  private readonly surfaceInset = signal(0);

  /**
   * Narrowest card, in pixels, that shows this demo without scaling it down, or 0 while
   * the demo has fit every card it has been shown in.
   *
   * It is learned from overflow, which only the renderer can see: the card records the
   * widest content the demo has reported beyond its frame. The wall gives a card that
   * needs more than its half of a row a wider slot or a full row.
   */
  readonly minimumCardWidth = computed(() => {
    const content = this.sizing().width.content;
    return content > 0 ? content + this.surfaceInset() : 0;
  });

  /** Fit wide, interactive content without reloading the frame or losing form state. */
  protected readonly previewScale = computed(() => previewScale(this.sizing()));

  /** Names the demo when assistive technology lists the wall's launch controls. */
  protected readonly openLabel = computed(() => `Open in Composer: ${this.demo().name}`);

  /** Painted height tracks the same scale as the iframe, preventing cropping or gaps. */
  protected readonly surfaceHeight = computed(() => {
    const measured = this.cardHeight();
    return measured === null ? null : Math.floor(measured * this.previewScale());
  });

  /**
   * The window the sizing state is waiting on. Tokens never repeat, so a new token
   * (or a window appearing or going away) restarts the timer.
   */
  private readonly sizingWindow = computed(() => windowFor(this.sizing()), {
    equal: (a, b) => a?.token === b?.token,
  });

  /** Whether the card has committed its height and revealed the current frame. */
  private readonly committed = computed(
    () => this.sizing().kind === 'committed' && this.sizing().revealed,
  );

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
      this.logger,
    );
    return built ? this.sanitizer.bypassSecurityTrustResourceUrl(built) : null;
  });

  /**
   * Whether the loading placeholder should cover the surface.
   *
   * It covers an unmounted card, and a mounted card whose frame isn't showing the demo
   * yet: before the commit the frame is held at `--demo-card-measure-h`, and a remounted
   * frame shows the renderer's own startup screen until it renders the demo again.
   */
  protected readonly showPlaceholder = computed(
    () => !this.sizing().revealed || !this.mount() || !this.safeRendererUrl(),
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
        untracked(() => this.handshakeState.set(DemoCardState.IDLE));
        return;
      }
      untracked(() => {
        if (this.handshakeState() === DemoCardState.IDLE) {
          this.handshakeState.set(DemoCardState.MOUNTING);
        }
        this.startReadyTimeout();
      });
      onCleanup(() => this.clearReadyTimeout());
    });

    // Once the height is committed and revealed, the ready deadline has nothing left to guard.
    effect(() => {
      if (this.committed()) untracked(() => this.clearReadyTimeout());
    });

    // Frame binding: registers this card's iframe with HostCommunication and handles
    // only the envelopes its own guest window sends (handleEnvelope drops the rest).
    //
    // The card registers with DefaultTarget.KEEP. The default target is the frame that
    // messages sent without a target go to, and on this page that has to stay the
    // coordinator: CatalogManagement answers every frame's RENDERER_READY with an
    // untargeted GET_CATALOG. If each card became the default as it mounted, that request
    // would go to the newest card, wait there if the card had not loaded yet, and be
    // dropped when the next card registered; CatalogManagement would then report its
    // 5-second watchdog timeout as a catalog error.
    effect(onCleanup => {
      const element = this.iframeRef()?.nativeElement ?? null;
      if (!element) {
        return;
      }

      this.payloadSentForCurrentLoad = false;
      this.dispatch({type: 'FrameAttached'});
      untracked(() => this.startReadyTimeout());
      this.hostCommunication.registerIframe(element, DefaultTarget.KEEP);
      const guestWindow = element.contentWindow;
      const subscription = guestWindow
        ? this.hostCommunication.messageStream$.subscribe(envelope =>
            untracked(() => this.handleEnvelope(envelope, element, guestWindow)),
          )
        : null;
      const visibility = this.observeVisibility(element);

      onCleanup(() => {
        visibility?.disconnect();
        subscription?.unsubscribe();
        this.hostCommunication.unregisterIframe(element);
        this.dispatch({type: 'VisibilityChanged', visible: false});
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
      const url = this.safeRendererUrl();
      untracked(() => {
        this.payloadSentForCurrentLoad = false;
        // A different renderer lays the same demo out differently, so the height
        // committed for the outgoing one is not evidence about the incoming one.
        this.dispatch({type: 'RendererChanged'});
        const mounting = this.mount() && url !== null;
        this.handshakeState.set(mounting ? DemoCardState.MOUNTING : DemoCardState.IDLE);
        if (mounting) {
          this.startReadyTimeout();
        } else {
          this.clearReadyTimeout();
        }
      });
    });

    // Runs the window the sizing state asks for and reports it back by its token.
    effect(onCleanup => {
      const open = this.sizingWindow();
      if (!open) return;
      const timeoutId = setTimeout(
        () => this.dispatch({type: 'WindowElapsed', token: open.token}),
        open.ms,
      );
      onCleanup(() => clearTimeout(timeoutId));
    });

    inject(DestroyRef).onDestroy(() => this.clearReadyTimeout());
  }

  private dispatch(event: SizingEvent): void {
    untracked(() => this.sizing.update(state => reduceSizing(state, event)));
  }

  /**
   * Reports whether the frame is on screen. Chrome stops rendering a cross-origin frame
   * that is scrolled out of view, so only a frame on screen can be trusted to report
   * what it shows. The iframe is observed rather than the surface, because the surface
   * is taller than the measuring frame at its top, and no root margin is used: the
   * question is whether the frame is on screen, not whether it is near. Where the
   * platform has no IntersectionObserver, the frame counts as on screen, so the card
   * still commits.
   */
  private observeVisibility(frame: HTMLIFrameElement): IntersectionObserver | null {
    if (typeof IntersectionObserver === 'undefined') {
      this.dispatch({type: 'VisibilityChanged', visible: true});
      return null;
    }
    const observer = new IntersectionObserver(entries => {
      const latest = entries[entries.length - 1];
      if (latest) this.dispatch({type: 'VisibilityChanged', visible: latest.isIntersecting});
    });
    observer.observe(frame);
    return observer;
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
        this.handshakeState.set(DemoCardState.READY);
        // React renderers under StrictMode announce readiness twice; the payload
        // must be dispatched exactly once per frame load.
        if (this.payloadSentForCurrentLoad) {
          return;
        }
        this.payloadSentForCurrentLoad = true;
        this.startReadyTimeout();
        // HostCommunication marks this frame ready before it hands the handshake to
        // subscribers, so the payload is posted at once instead of queued.
        this.hostCommunication.sendRenderA2UI(this.demo().a2ui, iframe);
        return;
      }
      case PreviewBridgeMessageType.SURFACE_RESIZE: {
        if (!CrossFrameValidator.validateIncomingMessage(envelope, undefined, this.logger)) {
          return;
        }
        const report = envelope.payload as SurfaceResizePayload;
        const surface = this.surfaceRef()?.nativeElement;
        if (surface) this.measureAvailableWidth(surface);
        // Older bridges don't report their viewport, so fall back to the frame's width.
        const measuredViewport = report.viewportWidth ?? iframe.clientWidth;
        this.dispatch({
          type: 'Resize',
          report: {
            height: report.height,
            width: report.width,
            viewportWidth: measuredViewport > 0 ? measuredViewport : undefined,
            contentReady: report.contentReady,
          },
        });
        return;
      }
      case PreviewBridgeMessageType.RENDER_SUCCESS:
        this.dispatch({type: 'RenderSuccess'});
        return;
      case PreviewBridgeMessageType.RENDER_ERROR:
        this.dispatch({type: 'RenderError'});
        return;
      default:
        return;
    }
  }

  private measureAvailableWidth(surface: HTMLElement): void {
    if (surface.clientWidth > 0) {
      this.dispatch({type: 'AvailableWidthChanged', width: surface.clientWidth});
      this.surfaceInset.set(Math.max(0, this.host.nativeElement.offsetWidth - surface.clientWidth));
    }
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

  private clearReadyTimeout(): void {
    if (this.readyTimeoutId !== null) {
      clearTimeout(this.readyTimeoutId);
      this.readyTimeoutId = null;
    }
  }

  private startReadyTimeout(): void {
    this.clearReadyTimeout();
    if (this.committed()) return;
    this.readyTimeoutId = setTimeout(() => this.dispatch({type: 'ReadyTimeout'}), READY_TIMEOUT_MS);
  }
}
