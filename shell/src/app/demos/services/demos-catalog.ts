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

import {Injectable, inject, signal, effect, DestroyRef, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType, type Demo} from 'a2ui-bridge';
import {sanitizeHtml} from 'safevalues';

/**
 * Owns the request/cache/timeout lifecycle for demos fetched from the
 * renderer connected over the bridge.
 *
 * Unlike `GalleryCatalog`, which is safe to broadcast to a single
 * primary iframe, the `/demos` route hosts a hidden coordinator frame
 * alongside N visible card frames. Requests are therefore targeted
 * explicitly at the registered coordinator element via
 * `HostCommunication.sendToFrame`, and incoming replies are filtered
 * by `sourceWindow` so that a card frame can never be mistaken for the
 * coordinator's response.
 */
@Injectable({
  providedIn: 'root',
})
export class DemosCatalog {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _demos = signal<Demo[] | null>(null);
  /** Cached demos returned by the connected renderer, or null if unresolved. */
  readonly demos = this._demos.asReadonly();

  private readonly _loadingDemos = signal<boolean>(false);
  /** Whether a demos request is currently in flight. */
  readonly loadingDemos = this._loadingDemos.asReadonly();

  private readonly _demosActive = signal<boolean>(false);
  /** Whether the demos route/view is currently active. */
  readonly demosActive = this._demosActive.asReadonly();

  /** The hidden coordinator iframe that answers demos requests. */
  private readonly coordinatorSignal = signal<HTMLIFrameElement | null>(null);

  private demosTimeoutId?: ReturnType<typeof setTimeout>;

  /**
   * Windows that have already triggered a re-request in response to
   * RENDERER_READY. React `<StrictMode>` emits RENDERER_READY twice per
   * frame mount, so this dedupes the resulting re-request to once per
   * window identity.
   *
   * This also doubles as "has this coordinator ever finished booting", used
   * by {@link requestDemos} to decide whether the 2s fallback timeout can be
   * armed at all (see finding A1).
   *
   * Caveat: a WindowProxy's identity is stable across the frame's own
   * navigations, so this WeakSet cannot by itself distinguish a coordinator
   * reload's fresh RENDERER_READY from a duplicate of the one before it —
   * the same trap that was a live bug in `DemoCard` before it switched to a
   * per-load flag reset on the frame's `load` event. It is not a live bug
   * here only because the sole thing that reloads the coordinator frame
   * (switching the active renderer) also swaps `activeCatalog()`'s object
   * identity, which independently re-requests demos via the `effect()`
   * below. If that coupling ever changes, this WeakSet will silently
   * swallow the coordinator's post-reload readiness.
   */
  private readonly readyWindows = new WeakSet<Window>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.demosTimeoutId) {
        clearTimeout(this.demosTimeoutId);
        this.demosTimeoutId = undefined;
      }
    });

    effect(() => {
      const active = this._demosActive();
      const catalog = this.catalogManagement.activeCatalog();
      const coordinator = this.coordinatorSignal();

      if (active && catalog && coordinator) {
        this.requestDemos();
      } else {
        untracked(() => {
          this._demos.set(null);
          this._loadingDemos.set(false);
        });
        if (this.demosTimeoutId) {
          clearTimeout(this.demosTimeoutId);
          this.demosTimeoutId = undefined;
        }
      }
    });

    this.hostCommunication.messageStream$.pipe(takeUntilDestroyed()).subscribe(envelope => {
      const coordinator = untracked(() => this.coordinatorSignal());
      if (!coordinator || envelope.sourceWindow !== coordinator.contentWindow) {
        return;
      }

      if (envelope.type === PreviewBridgeMessageType.DEMOS) {
        if (this.demosTimeoutId) {
          clearTimeout(this.demosTimeoutId);
          this.demosTimeoutId = undefined;
        }
        const payload = envelope.payload;
        const demos = Array.isArray(payload) ? sanitizeDemos(payload as Demo[]) : [];
        this._demos.set(demos);
        this._loadingDemos.set(false);
      } else if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
        const win = envelope.sourceWindow;
        if (win && !this.readyWindows.has(win)) {
          if (this._demosActive() && this.catalogManagement.activeCatalog()) {
            this.readyWindows.add(win);
            this.requestDemos();
          }
        }
      }
    });
  }

  private requestDemos(): void {
    const coordinator = untracked(() => this.coordinatorSignal());
    if (!coordinator) {
      return;
    }

    untracked(() => {
      this._demos.set(null);
      this._loadingDemos.set(true);
    });

    if (this.demosTimeoutId) {
      clearTimeout(this.demosTimeoutId);
      this.demosTimeoutId = undefined;
    }

    this.hostCommunication.sendToFrame({type: PreviewBridgeMessageType.GET_DEMOS}, coordinator);

    // The very first GET_DEMOS after a fresh mount can never be answered:
    // the coordinator iframe was created microseconds ago and is still on
    // about:blank. The RENDERER_READY handler above is what actually
    // rescues that case by re-requesting once the frame boots. Arming the
    // fallback timeout for an unanswerable request would race that rescue —
    // a cold dev bundle routinely takes longer than 2s to boot, so the
    // timeout would fire first and flash "No Demos Available". Only arm it
    // once this coordinator has proven it can respond at all.
    if (coordinator.contentWindow && this.readyWindows.has(coordinator.contentWindow)) {
      this.demosTimeoutId = setTimeout(() => {
        if (this._loadingDemos()) {
          this._loadingDemos.set(false);
          this._demos.set([]);
        }
      }, 2000);
    }
  }

  /**
   * Sets whether the demos route/view is currently active.
   * @param active Whether demos are active.
   */
  setDemosActive(active: boolean): void {
    this._demosActive.set(active);
  }

  /**
   * Registers the hidden coordinator iframe that answers demos requests.
   * @param el Coordinator iframe element, or null to clear it.
   */
  setCoordinator(el: HTMLIFrameElement | null): void {
    this.coordinatorSignal.set(el);
  }
}

/**
 * Sanitizes renderer-supplied demo `name` and `description` fields, matching
 * how {@link CatalogManagement} treats renderer-supplied catalog `title` and
 * `description` fields.
 * @param demos Raw demos array received from the renderer.
 * @return A new array of demos with sanitized `name`/`description` fields.
 */
function sanitizeDemos(demos: Demo[]): Demo[] {
  return demos.map(demo => ({
    ...demo,
    name: typeof demo.name === 'string' ? sanitizeHtml(demo.name).toString() : demo.name,
    description:
      typeof demo.description === 'string'
        ? sanitizeHtml(demo.description).toString()
        : demo.description,
  }));
}
