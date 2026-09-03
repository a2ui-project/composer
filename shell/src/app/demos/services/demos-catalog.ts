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

import {Injectable, inject, signal, computed, effect, DestroyRef, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {PreviewBridgeMessageType, type Demo} from 'a2ui-bridge';

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
   * Windows that have reported RENDERER_READY at least once, i.e. "this
   * coordinator has finished booting".
   *
   * Membership is recorded unconditionally, the moment a window first
   * reports ready, because booting is a property of the frame alone.
   * {@link requestDemos} reads it to decide whether the 2s fallback timeout
   * may be armed: a request sent to a frame that has never spoken cannot be
   * answered, so timing it out would only flash "No Demos Available" over a
   * renderer that is still coming up.
   *
   * The same membership separately dedupes the re-request that readiness
   * triggers: React `<StrictMode>` emits RENDERER_READY twice per frame
   * mount, so only the first envelope from a given window identity
   * re-requests demos.
   *
   * Caveat: a WindowProxy's identity is stable across the frame's own
   * navigations, so this WeakSet cannot by itself distinguish a coordinator
   * reload's fresh RENDERER_READY from a duplicate of the one before it —
   * the same trap that was a live bug in `DemoCard` before it switched to a
   * per-load flag reset on the frame's `load` event. It is not a live bug
   * here only because the sole thing that reloads the coordinator frame
   * (switching the active renderer) also clears `activeCatalog()` to null
   * before the new renderer's catalog resolves, and that closing and
   * reopening of the gate independently re-requests demos via the
   * `effect()` below. If that coupling ever changes, this WeakSet will
   * silently swallow the coordinator's post-reload readiness.
   */
  private readonly readyWindows = new WeakSet<Window>();

  /**
   * Stable identity of the active catalog: its id, or null when no catalog is
   * established.
   *
   * The gating effect below depends on this rather than on
   * `CatalogManagement.activeCatalog()` directly, because that signal changes
   * object identity on every completed catalog handshake even when the catalog
   * is byte-identical: the A2UI_CATALOG handler `structuredClone`s the payload
   * and sets the result. And handshakes happen constantly on this route —
   * `CatalogManagement` subscribes to `messageStream$` with no `sourceWindow`
   * filter, so every one of the N demo card frames registered via
   * `registerSecondaryIframe` starts a fresh one when it reports RENDERER_READY.
   *
   * Keyed on the object, each of those replies re-entered `requestDemos()`,
   * which sets `_demos` back to null; the route's `@else` branch was destroyed,
   * every card torn down, and the remounted cards' frames booted and reported
   * ready again — a wall that tore itself down and rebuilt on a loop. Keyed on
   * the id, a re-handshake that yields the same catalog is a no-op.
   *
   * For the record: this does not stop the redundant per-card handshakes, which
   * are still issued inside `CatalogManagement`. It only stops them from cycling
   * the demos wall.
   *
   * `catalogId ?? $id` is the same identifier `CatalogManagement` requires before
   * it will accept a catalog at all — an A2UI_CATALOG payload carrying neither is
   * rejected outright — so a catalog reaching this signal always has one. The
   * empty-string fallback only keeps a hypothetical id-less catalog reading as
   * "present" here rather than collapsing into the null/absent case.
   */
  private readonly activeCatalogId = computed<string | null>(() => {
    const catalog = this.catalogManagement.activeCatalog();
    if (!catalog) {
      return null;
    }
    return catalog.catalogId ?? catalog.$id ?? '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.demosTimeoutId) {
        clearTimeout(this.demosTimeoutId);
        this.demosTimeoutId = undefined;
      }
    });

    effect(() => {
      const active = this._demosActive();
      const catalogId = this.activeCatalogId();
      const coordinator = this.coordinatorSignal();

      if (active && catalogId !== null && coordinator) {
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
        const demos = Array.isArray(payload) ? sanitizeDemos(payload) : [];
        this._demos.set(demos);
        this._loadingDemos.set(false);
      } else if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
        const win = envelope.sourceWindow;
        if (win && !this.readyWindows.has(win)) {
          // Record the boot before consulting the gate. On a cold load the
          // gate is still shut here: `CatalogManagement` sends GET_CATALOG in
          // response to this very RENDERER_READY and only sets
          // `activeCatalog` when the A2UI_CATALOG reply lands. Recording the
          // boot inside the gate would drop it on exactly the load where the
          // fallback timeout matters most.
          this.readyWindows.add(win);
          if (this._demosActive() && this.catalogManagement.activeCatalog()) {
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
 * Normalizes a renderer-supplied demos array: entries that are not objects
 * are dropped, and each surviving demo's `name`/`description` are reduced to
 * plain strings.
 *
 * The array itself is guarded by `Array.isArray` at the call site, but its
 * elements are not, and this runs inside the `messageStream$` subscriber
 * where a throw escapes to RxJS's global unhandled-error handler: the DEMOS
 * envelope would be dropped and the wall left spinning on `loadingDemos`.
 *
 * `name` and `description` are deliberately not HTML-sanitized. Their only
 * consumers are `{{ }}` interpolation and a plain-text `[title]` attribute
 * binding in `demo-card.ng.html`, and Angular already escapes both, so an
 * HTML round-trip on top of that only corrupts the text: a demo named
 * "Tables & Charts" would reach the card as "Tables &amp; Charts". If either
 * field ever gains an HTML sink such as an `[innerHTML]` binding,
 * sanitization has to be reintroduced there, at that sink.
 * @param demos Raw demos array received from the renderer.
 * @return A new array holding only object entries, with plain-text
 *     `name`/`description` fields.
 */
function sanitizeDemos(demos: readonly unknown[]): Demo[] {
  return demos
    .filter((demo): demo is Demo => typeof demo === 'object' && demo !== null)
    .map(demo => ({
      ...demo,
      name: typeof demo.name === 'string' ? demo.name : '',
      description: typeof demo.description === 'string' ? demo.description : '',
    }));
}
