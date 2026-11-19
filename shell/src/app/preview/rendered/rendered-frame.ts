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
  effect,
  computed,
  untracked,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {type SurfaceResizePayload} from 'a2ui-bridge';
import {clampContentHeight} from '../content-height';
import {
  GuestFrame,
  GUEST_FRAME_CATALOG_MANAGEMENT,
  PayloadDispatchedEvent,
} from '../guest-frame/guest-frame';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {DefaultTarget} from '../../shell/host-communication/host-communication';
import {ChatState} from '../../chat/chat-state/chat-state';
import {StateSync} from '../../chat/state-sync/state-sync';

/** How a {@link RenderedFrame} is sized; see {@link RenderedFrame.sizing}. */
export type RenderedFrameSizing = 'fill' | 'content';

/** Payload and target window emitted once a dispatched surface finishes rendering. */
export interface RenderedSurfaceDispatch {
  payload: unknown[];
  sourceWindow: Window;
}

interface InFlightSurfaceDispatch extends RenderedSurfaceDispatch {
  renderId: string;
}

/**
 * Renders the active preview target in a {@link GuestFrame}, which owns the
 * sandboxed iframe, its registration and the payload sends. This component
 * sizes that frame, locks it while a model streams, and forgets the guest's
 * height when a new session starts.
 *
 * In content sizing the applied height comes from `clampContentHeight`, which
 * documents how the cap bounds growth.
 */
@Component({
  selector: 'a2ui-composer-rendered-frame',
  standalone: true,
  imports: [GuestFrame],
  providers: [
    {
      provide: GUEST_FRAME_CATALOG_MANAGEMENT,
      useFactory: () => inject(CatalogManagement, {optional: true}),
    },
  ],
  templateUrl: './rendered-frame.ng.html',
  styleUrl: './rendered-frame.scss',
})
export class RenderedFrame implements OnDestroy {
  private readonly chatState = inject(ChatState);
  private readonly stateSync = inject(StateSync);

  readonly guestFrame = viewChild(GuestFrame);

  get contentWindow(): Window | null {
    return this.guestFrame()?.contentWindow ?? null;
  }

  /**
   * Automatically rejects incoming agent function calls with NO_AGENT_CONNECTED
   * when no live agent is connected to the session.
   */
  readonly autoRejectAgentFunctions = input<boolean>(false);

  /**
   * Emits after a dispatched RENDER_A2UI payload finishes rendering (`RENDER_SUCCESS`)
   * in the inner GuestFrame.
   */
  readonly payloadRendered = output<RenderedSurfaceDispatch>();

  /**
   * Emits when this frame's rendered state is cleared or replaced (document
   * replacement, same-URL reload, empty payload, session reset, render error,
   * rejected dispatch, or teardown), carrying the associated guest Window so
   * parents can drop stale tracking entries immediately.
   */
  readonly renderStateReset = output<Window>();

  /**
   * Emits only when this frame's hosted guest document is replaced, reloaded, or
   * destroyed (`documentReplaced`, same-URL reload `documentReset`, or teardown),
   * not on same-document render errors or rejected dispatches.
   */
  readonly documentReset = output<Window>();

  /**
   * The A2UI messages to render in the guest. Sent once the guest's document
   * has announced itself with RENDERER_READY, and again when the content
   * changes; see GuestFrame. Defaults to `undefined` so the frame can
   * distinguish an unbound `[payload]` from an explicitly bound `null` or `[]`.
   */
  readonly payload = input<unknown[] | null | undefined>(undefined);

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
   * Whether registering this frame replaces `HostCommunication`'s default
   * target. Required, so that every host chooses explicitly between
   * `DefaultTarget.REPLACE` (the primary workspace, side canvas, gallery, or
   * demos coordinator frame) and `DefaultTarget.KEEP` (secondary inline chat
   * frames that receive their payloads directly via `[payload]`).
   */
  readonly defaultTarget = input.required<DefaultTarget>();

  /**
   * Latest surface height reported by the guest renderer frame, in pixels,
   * whatever the sizing mode.
   */
  private readonly reportedHeight = signal<number | null>(null);

  private lastHandledResetNonce = this.stateSync.sessionResetNonce();
  private readonly inFlightDispatches: InFlightSurfaceDispatch[] = [];
  private hasRenderError = false;
  private lastKnownWindow: Window | null = null;

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

  constructor() {
    effect(() => {
      const payload = this.payload();
      if (payload !== undefined && (!Array.isArray(payload) || payload.length === 0)) {
        this.resetRenderState({notifyReset: true});
      }
    });

    // A new session starts from the default size until the guest reports again.
    effect(() => {
      const nonce = this.stateSync.sessionResetNonce();
      if (nonce > this.lastHandledResetNonce) {
        this.lastHandledResetNonce = nonce;
        this.resetRenderState({notifyReset: true});
      }
    });
  }

  ngOnDestroy(): void {
    this.resetRenderState({clearHeight: false, notifyReset: true, notifyDocumentReset: true});
  }

  private rememberContentWindow(): Window | null {
    const win = this.contentWindow;
    if (win) {
      this.lastKnownWindow = win;
    }
    return win ?? this.lastKnownWindow;
  }

  private emitRenderStateReset(): void {
    const win = this.rememberContentWindow();
    if (win) {
      this.renderStateReset.emit(win);
    }
  }

  private emitDocumentReset(): void {
    const win = this.rememberContentWindow();
    if (win) {
      this.documentReset.emit(win);
    }
  }

  private resetRenderState(
    options: {clearHeight?: boolean; notifyReset?: boolean; notifyDocumentReset?: boolean} = {},
  ): void {
    this.inFlightDispatches.length = 0;
    this.hasRenderError = false;
    if (options.clearHeight !== false) {
      untracked(() => this.reportedHeight.set(null));
    }
    if (options.notifyDocumentReset) {
      this.emitDocumentReset();
    }
    if (options.notifyReset) {
      this.emitRenderStateReset();
    }
  }

  protected onDocumentReplaced(): void {
    this.resetRenderState({notifyReset: true, notifyDocumentReset: true});
  }

  protected onDocumentReset(): void {
    this.resetRenderState({notifyReset: true, notifyDocumentReset: true});
  }

  protected onRenderRejected(): void {
    // GuestFrame emits renderError(undefined) immediately after renderRejected,
    // which latches hasRenderError and emits renderStateReset once.
    this.resetRenderState();
  }

  protected onPayloadDispatched(event: PayloadDispatchedEvent): void {
    const sourceWindow = this.rememberContentWindow();
    if (event.initialForDocument) {
      this.resetRenderState({notifyReset: true});
    }
    const payload = this.payload();
    if (Array.isArray(payload) && sourceWindow) {
      this.inFlightDispatches.push({renderId: event.renderId, payload, sourceWindow});
    }
  }

  private consumeInFlightDispatch(renderId?: string): InFlightSurfaceDispatch | undefined {
    if (renderId !== undefined) {
      const idx = this.inFlightDispatches.findIndex(dispatch => dispatch.renderId === renderId);
      if (idx === -1) {
        return undefined;
      }
      const settled = this.inFlightDispatches.splice(0, idx + 1);
      return settled[settled.length - 1];
    }
    return this.inFlightDispatches.shift();
  }

  protected onRenderSuccess(renderId?: string): void {
    const completed = this.consumeInFlightDispatch(renderId);
    if (renderId !== undefined && !completed) {
      return;
    }
    this.hasRenderError = false;
    if (completed) {
      this.lastKnownWindow = completed.sourceWindow;
      this.payloadRendered.emit({
        payload: completed.payload,
        sourceWindow: completed.sourceWindow,
      });
    }
  }

  protected onRenderError(renderId?: string): void {
    const settled = this.consumeInFlightDispatch(renderId);
    if (renderId !== undefined && !settled) {
      return;
    }
    if (this.inFlightDispatches.length === 0) {
      this.hasRenderError = true;
      this.reportedHeight.set(null);
      this.emitRenderStateReset();
    }
  }

  /**
   * Stores the guest's report in either sizing mode; `frameHeightPx` decides
   * whether it applies. A frame that fills its host keeps its default size,
   * and a switch to content sizing applies the latest report without waiting
   * for another.
   */
  protected onSurfaceResize(report: SurfaceResizePayload): void {
    const currentPayload = untracked(() => this.payload());
    if (
      this.hasRenderError ||
      this.inFlightDispatches.length > 0 ||
      report.contentReady === false ||
      (currentPayload !== undefined &&
        (!Array.isArray(currentPayload) || currentPayload.length === 0))
    ) {
      return;
    }
    this.reportedHeight.set(report.height);
  }
}
