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

import {Component, inject, effect, computed, untracked, input, signal} from '@angular/core';
import {type SurfaceResizePayload} from 'a2ui-bridge';
import {clampContentHeight} from '../content-height';
import {GuestFrame} from '../guest-frame/guest-frame';
import {ChatState} from '../../chat/chat-state/chat-state';
import {StateSync} from '../../chat/state-sync/state-sync';

/** How a {@link RenderedFrame} is sized; see {@link RenderedFrame.sizing}. */
export type RenderedFrameSizing = 'fill' | 'content';

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
  templateUrl: './rendered-frame.ng.html',
  styleUrl: './rendered-frame.scss',
})
export class RenderedFrame {
  private chatState = inject(ChatState);
  private stateSync = inject(StateSync);

  /**
   * The A2UI messages to render in the guest. Sent once the guest's document
   * has announced itself with RENDERER_READY, and again when the content
   * changes; see GuestFrame.
   */
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

  constructor() {
    // A new session starts from the default size until the guest reports again.
    effect(() => {
      const nonce = this.stateSync.sessionResetNonce();
      if (nonce > this.lastHandledResetNonce) {
        this.lastHandledResetNonce = nonce;
        untracked(() => this.reportedHeight.set(null));
      }
    });
  }

  /**
   * Stores the guest's report in either sizing mode; `frameHeightPx` decides
   * whether it applies. A frame that fills its host keeps its default size,
   * and a switch to content sizing applies the latest report without waiting
   * for another.
   */
  protected onSurfaceResize(report: SurfaceResizePayload): void {
    this.reportedHeight.set(report.height);
  }
}
