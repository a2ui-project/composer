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
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatCardModule} from '@angular/material/card';
import {Demo, PreviewBridgeMessageType} from 'a2ui-bridge';
import {buildRendererUrl} from '../preview/renderer-url';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {HostCommunication, MessageEnvelope} from '../shell/host-communication/host-communication';
import {AppConfigProvider} from '../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../shell/cross-frame-validator/cross-frame-validator';

/** Lifecycle phases of a single demo card's renderer frame handshake. */
type DemoCardState = 'idle' | 'mounting' | 'ready' | 'error';

/**
 * Smallest height a demo card's rendered surface is allowed to occupy.
 *
 * Must match the `--demo-card-min-h` custom property declared on `:host` in
 * demo-card.scss.
 */
const MIN_CARD_HEIGHT_PX = 200;

/**
 * Largest height a demo card's rendered surface is allowed to occupy.
 *
 * Must match the `--demo-card-max-h` custom property declared on `:host` in
 * demo-card.scss.
 */
const MAX_CARD_HEIGHT_PX = 560;

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
 * load after that frame's own RENDERER_READY handshake. The first *rendered*
 * surface height is clamped and then frozen so the surrounding CSS-columns
 * masonry layout never reflows underneath the reader; see
 * {@link DemoCard.cardHeightFrozen} for why the first report alone is not enough.
 */
@Component({
  selector: 'a2ui-composer-demo-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './demo-card.ng.html',
  styleUrl: './demo-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoCard {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly startupResolution = inject(StartupResolution);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly configProvider = inject(AppConfigProvider);

  /** The demo whose A2UI payload this card renders. */
  readonly demo = input.required<Demo>();

  /** Gate controlling frame attachment; the owning route drives it from viewport visibility. */
  readonly mount = input<boolean>(false);

  private readonly stateSignal = signal<DemoCardState>('idle');
  /** Readonly handshake state for this card's renderer frame. */
  readonly state = this.stateSignal.asReadonly();

  private readonly cardHeightSignal = signal<number | null>(null);
  /** Readonly frozen surface height in pixels, or null before the first resize report. */
  readonly cardHeight = this.cardHeightSignal.asReadonly();

  /**
   * Whether {@link DemoCard.cardHeight} has been locked to a rendered measurement.
   *
   * Deliberately not derived from `cardHeight() !== null`. The guest bridge's very
   * first SURFACE_RESIZE is dispatched immediately after RENDERER_READY and before
   * any content exists, so it measures an empty document whose `scrollHeight` is
   * just the iframe's own CSS height — `--demo-card-min-h`, i.e. exactly
   * MIN_CARD_HEIGHT_PX. Freezing on that report pinned every card in the wall to the
   * minimum and clipped its content under `.demo-card-surface { overflow: hidden }`.
   *
   * {@link DemoCard.payloadSentForCurrentLoad} cannot tell that report apart either:
   * the guest posts RENDERER_READY and the pre-render SURFACE_RESIZE back to back, so
   * the flag is already true by the time the resize envelope is delivered. Only the
   * measurement itself distinguishes them — a report that clamps to exactly
   * MIN_CARD_HEIGHT_PX carries no evidence that content has rendered, so the freeze
   * waits for one that clamps above it. A genuinely shorter demo lays out at the
   * minimum either way, so continuing to listen costs it nothing.
   */
  private cardHeightFrozen = false;

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

  protected readonly iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('demoIframe');

  protected readonly safeRendererUrl = computed(() => {
    const built = buildRendererUrl(
      this.startupResolution.resolvedUrl(),
      untracked(() => this.configProvider.themePreference()),
    );
    return built ? this.sanitizer.bypassSecurityTrustResourceUrl(built) : null;
  });

  constructor() {
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
      this.readyTimeoutId = setTimeout(() => {
        if (untracked(() => this.stateSignal()) !== 'ready') {
          this.stateSignal.set('error');
        }
      }, READY_TIMEOUT_MS);
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
      });
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
        this.clearReadyTimeout();
        this.stateSignal.set('ready');
        // React renderers under StrictMode announce readiness twice; the payload
        // must be dispatched exactly once per frame load.
        if (this.payloadSentForCurrentLoad) {
          return;
        }
        this.payloadSentForCurrentLoad = true;
        this.hostCommunication.sendToFrame(
          {type: PreviewBridgeMessageType.RENDER_A2UI, payload: this.demo().a2ui},
          iframe,
        );
        return;
      }
      case PreviewBridgeMessageType.SURFACE_RESIZE: {
        if (this.cardHeightFrozen) {
          // Height is frozen after the first rendered report so masonry columns stay stable.
          return;
        }
        if (!CrossFrameValidator.validateIncomingMessage(envelope)) {
          return;
        }
        const {height} = envelope.payload as {height: number};
        const clampedHeight = Math.min(
          MAX_CARD_HEIGHT_PX,
          Math.max(MIN_CARD_HEIGHT_PX, Math.round(height)),
        );
        this.cardHeightSignal.set(clampedHeight);
        if (clampedHeight > MIN_CARD_HEIGHT_PX) {
          this.cardHeightFrozen = true;
        }
        return;
      }
      default:
        return;
    }
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
}
