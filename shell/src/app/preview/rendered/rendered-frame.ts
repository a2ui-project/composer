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
  OnInit,
  signal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DomSanitizer} from '@angular/platform-browser';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {buildRendererUrl} from '../renderer-url';
import {clampContentHeight} from '../content-height';
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

/** How a {@link RenderedFrame} is sized; see {@link RenderedFrame.sizing}. */
export type RenderedFrameSizing = 'fill' | 'content';

/**
 * Orchestrates the secure, sandboxed iframe rendering the active preview target,
 * synchronizing layouts, data models, and diagnostic telemetry.
 *
 * In content sizing the applied height comes from `clampContentHeight`, which
 * documents how the cap bounds growth.
 */
@Component({
  selector: 'a2ui-composer-rendered-frame',
  standalone: true,
  imports: [],
  templateUrl: './rendered-frame.ng.html',
  styleUrl: './rendered-frame.scss',
})
export class RenderedFrame implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private startupResolution = inject(StartupResolution);
  private hostCommunication = inject(HostCommunication);
  private configProvider = inject(AppConfigProvider);
  private chatState = inject(ChatState);
  private stateSync = inject(StateSync);
  private errorLogger = inject(ErrorLogger);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = this.errorLogger.withTag('[RenderedFrame]');

  /** Optional layout payload to render immediately into the guest iframe. */
  readonly payload = input<unknown[] | null | undefined>(null);

  /**
   * How the frame is sized. Required, so that every host chooses explicitly.
   *
   * - `fill`: the frame takes its host's height and the guest document
   *   scrolls inside it. Use it wherever the host has a definite height: a
   *   side canvas, a Dockview panel, a fixed-height card, or a hidden frame.
   *   With the frame's size independent of the guest, a guest laid out
   *   against its own viewport (`100%`, `100vh`) cannot feed back into it.
   * - `content`: the frame follows the guest's SURFACE_RESIZE reports through
   *   `clampContentHeight`, with a 280px floor until the first report. Use it
   *   only where the host grows with its content, such as an inline preview
   *   in the chat history.
   *
   * The guest's latest report is kept in either mode, so a switch to
   * `content` applies it at once.
   */
  readonly sizing = input.required<RenderedFrameSizing>();

  /**
   * Latest surface height reported by the guest renderer frame, in pixels,
   * whatever the sizing mode.
   */
  private readonly reportedHeight = signal<number | null>(null);

  private lastHandledResetNonce = this.stateSync.sessionResetNonce();

  /**
   * Height applied in content sizing, as a CSS length: the latest report
   * through `clampContentHeight`. Undefined when the frame fills its host or
   * the guest has not reported a usable height, in which case the container
   * falls back to 100% of its host.
   *
   * Applied as both `height` and `min-height` so that a reported height wins
   * over the stylesheet's minimum, which would otherwise leave a tall empty
   * area below a short surface.
   */
  protected readonly frameHeightPx = computed<string | undefined>(() => {
    if (this.sizing() === 'fill') {
      return undefined;
    }
    const reported = this.reportedHeight();
    const height = reported === null ? null : clampContentHeight(reported);
    return height === null ? undefined : `${height}px`;
  });

  /** Programmatic streams active locking Signal, mapping visual lock bounds. */
  protected readonly isLocked = this.chatState.isProgrammaticStreamActive;

  protected iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('previewIframe');

  protected safeRendererUrl = computed(() => {
    const built = buildRendererUrl(
      this.startupResolution.resolvedUrl(),
      untracked(() => this.configProvider.themePreference()),
      this.logger,
    );
    return built ? this.sanitizer.bypassSecurityTrustResourceUrl(built) : null;
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
      this.dispatchPayload(this.payload(), this.iframeRef()?.nativeElement);
    });

    // A new session starts from the default size until the guest reports again.
    effect(() => {
      const nonce = this.stateSync.sessionResetNonce();
      if (nonce > this.lastHandledResetNonce) {
        this.lastHandledResetNonce = nonce;
        untracked(() => this.reportedHeight.set(null));
      }
    });
  }

  ngOnInit(): void {
    // Inbound bridge listener. It re-sends the payload when the guest
    // announces RENDERER_READY or A2UI_CATALOG, and stores every
    // SURFACE_RESIZE report: a content-sized frame applies it as its height,
    // while a filling frame only keeps it, for a later switch to content.
    // Subscribed directly to messageStream$ rather than an effect so bursts of
    // messages (e.g. SURFACE_RESIZE followed immediately by DATA_MODEL_CHANGE)
    // do not coalesce and drop the resize report.
    //
    // Subscribed here rather than in the constructor because messageStream$
    // replays its last envelope synchronously, and handling it reads the
    // required `sizing` input, which the host has set only by now (NG0950).
    this.hostCommunication.messageStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(envelope => this.handleInboundEnvelope(envelope));
  }

  /**
   * True when an envelope was sent by a frame other than this one. Until this
   * frame's iframe exists (a replay delivered on subscription), an envelope
   * that names a source window cannot be this frame's, so it counts as
   * foreign; an envelope without one, as in a single-frame host, does not.
   */
  private isFromOtherFrame(envelope: MessageEnvelope): boolean {
    if (!envelope.sourceWindow) {
      return false;
    }
    const myWindow = untracked(() => this.iframeRef()?.nativeElement)?.contentWindow;
    return envelope.sourceWindow !== myWindow;
  }

  /**
   * Handles incoming bridge messages (renderer ready, catalog ready, surface resize)
   * without dropping messages during rapid bursts.
   */
  private handleInboundEnvelope(envelope: MessageEnvelope | null): void {
    if (!envelope || this.isFromOtherFrame(envelope)) {
      return;
    }

    if (
      envelope.type === PreviewBridgeMessageType.RENDERER_READY ||
      envelope.type === PreviewBridgeMessageType.A2UI_CATALOG
    ) {
      this.dispatchPayload(
        untracked(() => this.payload()),
        untracked(() => this.iframeRef()?.nativeElement),
      );
    } else if (envelope.type === PreviewBridgeMessageType.SURFACE_RESIZE) {
      // Stored in either sizing mode; `frameHeightPx` decides whether it applies.
      // A frame that fills its host keeps its default size, and a switch to
      // content sizing applies the latest report without waiting for another.
      if (CrossFrameValidator.validateIncomingMessage(envelope, undefined, this.logger)) {
        const resizePayload = envelope.payload as {height: number; width?: number};
        this.reportedHeight.set(resizePayload.height);
      }
    }
  }

  /**
   * Dispatches the active A2UI payload to the renderer iframe once the DOM iframe element finishes loading.
   */
  protected syncPayloadOnIframeLoad(): void {
    this.dispatchPayload(this.payload(), this.iframeRef()?.nativeElement);
  }

  /** Sends `payload` to `iframe` when the iframe exists and the payload is a non-empty array. */
  private dispatchPayload(
    payload: unknown[] | null | undefined,
    iframe: HTMLIFrameElement | undefined,
  ): void {
    if (iframe && Array.isArray(payload) && payload.length > 0) {
      this.hostCommunication.sendRenderA2UI(payload, iframe);
    }
  }
}
