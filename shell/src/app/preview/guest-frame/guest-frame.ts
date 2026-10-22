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
  OnInit,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DomSanitizer} from '@angular/platform-browser';
import {PreviewBridgeMessageType, type SurfaceResizePayload} from 'a2ui-bridge';
import {ErrorLogger} from '../../debug/error-logger.service';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CrossFrameValidator} from '../../shell/cross-frame-validator/cross-frame-validator';
import {
  DefaultTarget,
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {stableStringify} from '../../storage/stable-stringify/stable-stringify';
import {buildRendererUrl} from '../renderer-url';

/**
 * The sandboxed iframe that loads the guest renderer, shared by every preview
 * that hosts one (RenderedFrame and DemoCard; RawFrame has no iframe). The
 * iframe fills this element, so the host sizes the frame by sizing it.
 *
 * It owns the plumbing those previews would otherwise each repeat:
 * - **The URL.** Built with `buildRendererUrl` and sanitized. While there is
 *   no usable URL, the content the host projects is shown instead.
 * - **Registration** with HostCommunication while the iframe exists, as the
 *   default target or not according to {@link GuestFrame.defaultTarget}.
 * - **The payload.** Sent once per document, after that document's
 *   RENDERER_READY, and again only when its content changes; see
 *   {@link GuestFrame.onLoad} for how documents are told apart.
 * - **Inbound messages.** Only envelopes whose source window is this iframe's
 *   own are handled. An envelope with no source window, or one that arrives
 *   before the iframe exists, cannot be told apart from another frame's and
 *   is dropped. The rest are re-emitted as typed outputs, one emission per
 *   message, so a burst within one tick reaches the host whole and in order.
 *
 * Theme changes are not handled here: HostCommunication broadcasts them to
 * every ready frame, and each new frame gets the current theme in its URL and
 * again on its handshake.
 */
@Component({
  selector: 'a2ui-composer-guest-frame',
  standalone: true,
  templateUrl: './guest-frame.ng.html',
  styleUrl: './guest-frame.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestFrame implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly startupResolution = inject(StartupResolution);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(ErrorLogger).withTag('[GuestFrame]');

  /**
   * The A2UI messages to render. Sent once the guest's document has announced
   * itself with RENDERER_READY, and again whenever its content changes; never
   * while it is null or empty.
   */
  readonly payload = input<unknown[] | null | undefined>(null);

  /** Accessible name of the iframe (its `title` attribute). */
  readonly frameTitle = input.required<string>();

  /**
   * Whether the iframe becomes HostCommunication's default target, the frame
   * that messages sent without a target go to. Read when the iframe attaches.
   * A page that mounts many frames next to the one that should answer such
   * messages passes {@link DefaultTarget.KEEP} for the others.
   */
  readonly defaultTarget = input<DefaultTarget>(DefaultTarget.REPLACE);

  /** A validated SURFACE_RESIZE report from this frame's guest. */
  readonly surfaceResize = output<SurfaceResizePayload>();
  /**
   * The guest announced RENDERER_READY. Fires for every announcement, including
   * a StrictMode guest's repeat and a reloaded document's. If the payload was
   * new to the document it has been sent by the time this fires; otherwise
   * nothing was sent, because the document already has it or there is none.
   */
  readonly rendererReady = output<void>();
  /**
   * Emits whenever `syncPayload` dispatches `RENDER_A2UI` to the guest frame:
   * `true` for the first payload sent to the current document, and `false` for
   * subsequent payload updates on the same document.
   */
  readonly payloadDispatched = output<boolean>();
  /** The guest rendered the payload. */
  readonly renderSuccess = output<void>();
  /** The guest failed to render the payload. */
  readonly renderError = output<void>();
  /**
   * The renderer URL changed, so the iframe now shows another renderer's
   * document, or none, and that document starts its own handshake. Not emitted
   * when the frame mounts, nor for a reload of the same URL.
   */
  readonly documentReplaced = output<void>();

  private readonly iframeRef = viewChild<ElementRef<HTMLIFrameElement>>('guestIframe');

  /** Whether an iframe element is currently rendered for a valid renderer URL. */
  readonly hasIframe = computed(
    () => this.safeRendererUrl() !== null && this.iframeRef() !== undefined,
  );

  protected readonly safeRendererUrl = computed(() => {
    const built = buildRendererUrl(
      this.startupResolution.resolvedUrl(),
      untracked(() => this.configProvider.themePreference()),
      this.logger,
    );
    return built ? this.sanitizer.bypassSecurityTrustResourceUrl(built) : null;
  });

  /** The current document announced RENDERER_READY, so it can receive. */
  private readyForCurrentLoad = false;
  /** The current document has fired its `load` event. */
  private loadedCurrentDocument = false;
  /**
   * A repeat RENDERER_READY arrived while the current document was already
   * ready and has not yet completed a render cycle.
   */
  private readySinceLoad = false;
  /**
   * The most recent `load` event took the pre-load reload path and sent the
   * payload immediately; if another RENDERER_READY arrives before a render
   * completion, that `load` was a post-load reload and the new document needs
   * the payload on its RENDERER_READY.
   */
  private reloadedOnLoad = false;
  /**
   * The payload last sent to the current document, as `stableStringify`
   * writes it, or null while the document has been sent nothing.
   */
  private lastSentPayload: string | null = null;

  constructor() {
    // A new iframe only appears along with a new renderer URL, so the effect
    // below has already reset the document state for it.
    effect(onCleanup => {
      const iframe = this.iframeRef()?.nativeElement;
      if (!iframe) return;
      untracked(() => this.hostCommunication.registerIframe(iframe, this.defaultTarget()));
      onCleanup(() => this.hostCommunication.unregisterIframe(iframe));
    });

    // A new renderer URL loads a new document, which announces itself again.
    let previousUrl = untracked(() => this.safeRendererUrl());
    effect(() => {
      const url = this.safeRendererUrl();
      untracked(() => {
        if (url === previousUrl) return;
        const hadDocument = previousUrl !== null;
        previousUrl = url;
        this.resetForNewDocument();
        if (hadDocument) {
          this.documentReplaced.emit();
        }
      });
    });

    effect(() => {
      this.payload();
      untracked(() => this.syncPayload());
    });
  }

  ngOnInit(): void {
    // One subscription to the uncoalesced stream, so a burst of messages
    // within one tick is handled message by message. Set up here rather than in
    // the constructor because messageStream$ replays its last envelope
    // synchronously; that replay is dropped, since the iframe does not exist yet.
    this.hostCommunication.messageStream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(envelope => untracked(() => this.handleEnvelope(envelope)));
  }

  /**
   * Tells a reloaded document from the current one.
   *
   * The `load` event and the guest's RENDERER_READY arrive in either order,
   * and a React guest under StrictMode announces itself twice per document.
   * Each document fires one `load`, so READY, load, READY and load, READY,
   * READY each send once. A further `load` without a URL change is a new
   * document (a frame reload, or a renderer dev server's live reload).
   *
   * The iframe's initial about:blank document fires a `load` of its own
   * before the renderer's. It is same-origin, so it can be told apart, and is
   * ignored. The renderer's document is cross-origin or has a real URL.
   *
   * A reloaded document that announces itself before its `load` looks like a
   * repeat of the old document's announcement. When a repeat READY arrived
   * after the first document's READY without a subsequent render completion,
   * that `load` forgets what was sent to the old document, immediately
   * synchronizes the current payload with the reloaded document, and marks
   * `reloadedOnLoad` in case the repeat READY was actually a StrictMode repeat
   * before a post-load reload. Otherwise the frame resets for the new document
   * and waits for its RENDERER_READY.
   */
  protected onLoad(): void {
    if (this.iframeRef()?.nativeElement.contentDocument?.URL === 'about:blank') return;
    if (!this.loadedCurrentDocument) {
      this.loadedCurrentDocument = true;
    } else if (this.readySinceLoad) {
      this.reloadedOnLoad = true;
      this.lastSentPayload = null;
      this.syncPayload();
    } else {
      this.resetForNewDocument();
      this.loadedCurrentDocument = true;
    }
    this.readySinceLoad = false;
  }

  private resetForNewDocument(): void {
    this.readyForCurrentLoad = false;
    this.loadedCurrentDocument = false;
    this.readySinceLoad = false;
    this.reloadedOnLoad = false;
    this.lastSentPayload = null;
    const iframe = this.iframeRef()?.nativeElement;
    if (iframe) {
      this.hostCommunication.registerIframe(iframe, this.defaultTarget());
    }
  }

  private handleEnvelope(envelope: MessageEnvelope): void {
    const guestWindow = this.iframeRef()?.nativeElement.contentWindow;
    if (!envelope.sourceWindow || envelope.sourceWindow !== guestWindow) {
      return;
    }

    switch (envelope.type) {
      case PreviewBridgeMessageType.RENDERER_READY: {
        const wasReady = this.readyForCurrentLoad;
        this.readyForCurrentLoad = true;
        if (wasReady) {
          this.readySinceLoad = true;
        }
        if (this.reloadedOnLoad) {
          this.reloadedOnLoad = false;
          this.lastSentPayload = null;
        }
        this.syncPayload();
        this.rendererReady.emit();
        return;
      }
      case PreviewBridgeMessageType.SURFACE_RESIZE:
        if (CrossFrameValidator.validateIncomingMessage(envelope, undefined, this.logger)) {
          this.surfaceResize.emit(envelope.payload as SurfaceResizePayload);
        }
        return;
      case PreviewBridgeMessageType.RENDER_SUCCESS:
        this.readySinceLoad = false;
        this.reloadedOnLoad = false;
        this.renderSuccess.emit();
        return;
      case PreviewBridgeMessageType.RENDER_ERROR:
        this.readySinceLoad = false;
        this.reloadedOnLoad = false;
        this.renderError.emit();
        return;
      default:
        return;
    }
  }

  /**
   * Brings the current document up to date with the payload, the only place
   * that sends it. Does nothing until the document has announced itself, so
   * HostCommunication posts at once rather than queueing a copy that its flush
   * on RENDERER_READY would deliver again. Does nothing either when the
   * document already got a payload with exactly this content: a host may hand
   * over a new but equal array, as the A2A chat does when it partitions its
   * messages again once the first catalog resolves, and sending it would
   * replay createSurface and lose what the user typed.
   */
  private syncPayload(): void {
    const payload = this.payload();
    if (!Array.isArray(payload) || payload.length === 0) {
      this.lastSentPayload = null;
      return;
    }
    if (!this.readyForCurrentLoad) return;
    const iframe = this.iframeRef()?.nativeElement;
    if (!iframe) return;
    const content = stableStringify(payload);
    if (content === this.lastSentPayload) return;
    const initialForDocument = this.lastSentPayload === null;
    this.lastSentPayload = content;
    this.hostCommunication.sendRenderA2UI(payload, iframe);
    this.payloadDispatched.emit(initialForDocument);
  }
}
