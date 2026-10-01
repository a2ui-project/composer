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
 * A renderer-supplied {@link Demo} paired with the shell's own display
 * identity.
 *
 * `Demo.id` is protocol data: a renderer is free to omit it, send a non-string,
 * or reuse one across two demos, and a wall keyed on it survives none of those.
 * The key it needs is the `@for` track expression, the mounted-cards set member
 * and a DOM attribute all at once, so a duplicate raises NG0955 in a dev build
 * and silently reconciles two cards onto one frame in a production one.
 * `trackKey` is assigned by {@link sanitizeDemos} and is guaranteed to be a
 * non-empty string that is unique across one demos payload; the renderer's own
 * `id` is left exactly as it arrived.
 *
 * This type is deliberately internal to the shell: `Demo` is a published
 * protocol type in `bridge/src/render-config.ts` and gains nothing from it.
 */
export interface TrackedDemo extends Demo {
  /** Shell-assigned identity: non-empty, and unique within one demos payload. */
  readonly trackKey: string;
}

/**
 * Fetches the connected renderer's demos for the demos page, and tracks
 * whether that request is loading, done, or failed.
 *
 * The demos page renders each demo in its own iframe (a card), plus one more,
 * hidden iframe: the coordinator. The coordinator loads the same renderer and
 * exists only to answer GET_DEMOS, so requests go to it directly
 * (`HostCommunication.sendToFrame`), and replies are accepted only from its
 * window, never from a card's.
 */
@Injectable({
  providedIn: 'root',
})
export class DemosCatalog {
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _demos = signal<TrackedDemo[] | null>(null);
  /** Cached demos returned by the connected renderer, or null if unresolved. */
  readonly demos = this._demos.asReadonly();

  private readonly _loadingDemos = signal<boolean>(false);
  /** Whether a demos request is currently in flight. */
  readonly loadingDemos = this._loadingDemos.asReadonly();

  private readonly _loadFailed = signal(false);
  /** Whether the coordinator returned a failed or invalid demos response. */
  readonly loadFailed = this._loadFailed.asReadonly();

  private readonly _demosActive = signal<boolean>(false);
  /** Whether the demos route/view is currently active. */
  readonly demosActive = this._demosActive.asReadonly();

  /** The hidden coordinator iframe; see the class comment. */
  private readonly coordinator = signal<HTMLIFrameElement | null>(null);

  private demosTimeoutId?: ReturnType<typeof setTimeout>;

  /**
   * Coordinator windows (an iframe's `contentWindow`) that have sent
   * RENDERER_READY, meaning the renderer inside has loaded and can answer.
   *
   * A window is added as soon as it first reports ready, whatever else is
   * going on. Two things read it:
   * - {@link requestDemos} only starts the 2s timeout for a window in this set.
   *   A request to a renderer that hasn't loaded yet can't be answered, and
   *   timing it out would show "No Demos Available" while it is still loading.
   * - The RENDERER_READY handler only re-requests demos the first time a window
   *   reports ready. React's `<StrictMode>` sends RENDERER_READY twice per
   *   mount, and the second must not trigger another request.
   *
   * A window keeps its identity when its iframe reloads, so this set can't tell
   * a reloaded coordinator's RENDERER_READY from a repeat. That's safe today
   * because the coordinator only reloads when the active renderer changes, and
   * that clears the active catalog first, which re-requests demos through the
   * effect in the constructor.
   */
  private readonly readyWindows = new WeakSet<Window>();

  /**
   * The active catalog's id, or null when there is no active catalog.
   *
   * The effect in the constructor re-requests demos when this changes. It keys
   * on the id, not on `CatalogManagement.activeCatalog()`, because that signal
   * gets a new object every time a catalog handshake completes, even when the
   * catalog is identical, and handshakes keep happening on the demos page: each
   * card's renderer sends RENDERER_READY when it loads, and `CatalogManagement`
   * answers any frame's RENDERER_READY with a new handshake. Keyed on the
   * object, every card that loaded would re-request demos, which clears the
   * list, removes every card, and starts the loop again as they reload.
   *
   * `catalogId ?? $id` is the identifier `CatalogManagement` requires before it
   * accepts a catalog, so an active catalog always has one; the empty-string
   * fallback only keeps a catalog without one counting as present.
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
      const coordinator = this.coordinator();

      if (active && catalogId !== null && coordinator) {
        this.requestDemos();
      } else {
        untracked(() => {
          this._loadFailed.set(false);
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
      const coordinator = untracked(() => this.coordinator());
      if (!coordinator || envelope.sourceWindow !== coordinator.contentWindow) {
        return;
      }

      if (envelope.type === PreviewBridgeMessageType.DEMOS) {
        if (this.demosTimeoutId) {
          clearTimeout(this.demosTimeoutId);
          this.demosTimeoutId = undefined;
        }
        const payload = envelope.payload;
        this._loadFailed.set(!Array.isArray(payload));
        const demos = Array.isArray(payload) ? sanitizeDemos(payload) : [];
        this._demos.set(demos);
        this._loadingDemos.set(false);
      } else if (envelope.type === PreviewBridgeMessageType.RENDERER_READY) {
        const win = envelope.sourceWindow;
        if (win && !this.readyWindows.has(win)) {
          // Record that this window is ready before checking whether demos can be
          // requested. On a first load there's no active catalog yet at this point:
          // `CatalogManagement` requests it in response to this same RENDERER_READY,
          // and the request is made from the effect once it arrives. That's the
          // load where the timeout in requestDemos matters most, so the window has
          // to be recorded even though no request is made here.
          this.readyWindows.add(win);
          if (this._demosActive() && this.catalogManagement.activeCatalog()) {
            this.requestDemos();
          }
        }
      }
    });
  }

  private requestDemos(): void {
    const coordinator = untracked(() => this.coordinator());
    if (!coordinator) {
      return;
    }

    untracked(() => {
      this._loadFailed.set(false);
      this._demos.set(null);
      this._loadingDemos.set(true);
    });

    if (this.demosTimeoutId) {
      clearTimeout(this.demosTimeoutId);
      this.demosTimeoutId = undefined;
    }

    this.hostCommunication.sendToFrame({type: PreviewBridgeMessageType.GET_DEMOS}, coordinator);

    // The first request after the coordinator is created can't be answered: its
    // renderer hasn't loaded yet. The RENDERER_READY handler requests again once
    // it has. A timeout on that first request would race the retry, and a cold
    // development build often takes longer than 2s to load, so the page would
    // flash "No Demos Available". Only time out a renderer that has reported ready.
    if (coordinator.contentWindow && this.readyWindows.has(coordinator.contentWindow)) {
      this.demosTimeoutId = setTimeout(() => {
        if (this._loadingDemos()) {
          this._loadingDemos.set(false);
          this._loadFailed.set(true);
          this._demos.set([]);
        }
      }, 2000);
    }
  }

  /** Retries the active coordinator after a failed response. */
  retry(): void {
    if (this._demosActive()) this.requestDemos();
  }

  /**
   * Sets whether the demos route/view is currently active.
   * @param active Whether demos are active.
   */
  setDemosActive(active: boolean): void {
    this._demosActive.set(active);
  }

  /**
   * Registers the coordinator: the hidden iframe that answers GET_DEMOS (see the
   * class comment).
   * @param el The coordinator iframe, or null to clear it.
   */
  setCoordinator(el: HTMLIFrameElement | null): void {
    this.coordinator.set(el);
  }
}

/**
 * Normalizes a renderer-supplied demos array: entries that are not plain
 * objects — including arrays, which `typeof` also reports as `'object'` —
 * are dropped, each surviving demo's `name`/`description` are reduced to
 * plain strings, and every survivor is given a {@link TrackedDemo.trackKey}
 * that is non-empty and unique across the returned array.
 *
 * The array itself is guarded by `Array.isArray` at the call site, but its
 * elements are not, and this runs inside the `messageStream$` subscriber
 * where a throw escapes to RxJS's global unhandled-error handler: the DEMOS
 * envelope would be dropped and the wall left spinning on `loadingDemos`.
 *
 * Nothing renderer-supplied is rewritten to establish that key. Demos are
 * never dropped for a bad id, and `id` itself is passed through untouched so
 * that a renderer keeps whatever identity it published; the wall consumes
 * `trackKey` instead. `name` and `description` are display content and are
 * likewise never touched for keying purposes.
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
 *     `name`/`description` fields and a unique `trackKey` each.
 */
function sanitizeDemos(demos: readonly unknown[]): TrackedDemo[] {
  const usedKeys = new Set<string>();
  const tracked: TrackedDemo[] = [];

  demos.forEach((entry, index) => {
    // `typeof [] === 'object'`, so without the `Array.isArray` guard a nested array survives as a
    // demo: it would be spread into a card with empty text, and — since the spread copies nothing
    // useful — the wall would show a blank tile for it.
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      return;
    }
    const demo = entry as Demo;
    tracked.push({
      ...demo,
      name: typeof demo.name === 'string' ? demo.name : '',
      description: typeof demo.description === 'string' ? demo.description : '',
      // Assigned after the spread so a renderer that happens to publish its own
      // `trackKey` field cannot displace the one guaranteed here.
      trackKey: reserveTrackKey(demo.id, index, usedKeys),
    });
  });

  return tracked;
}

/**
 * Reserves a unique track key for one demo, preferring the renderer's own id.
 *
 * A usable id (a non-empty string) is used verbatim, which keeps the wall's
 * DOM attributes readable and matches what a well-behaved renderer intends. An
 * id that is missing, empty or not a string falls back to the demo's position
 * in the payload, and any key already taken — by an earlier duplicate id, or
 * by an id that collides with a positional fallback — is suffixed until it is
 * free. The loop terminates because each attempt proposes a key it has not
 * proposed before and only finitely many are taken.
 * @param id The `id` field as received from the renderer, of unknown type.
 * @param index Position of the demo within the payload.
 * @param usedKeys Keys already handed out for this payload; mutated here.
 * @return A non-empty key that no other demo in this payload holds.
 */
function reserveTrackKey(id: unknown, index: number, usedKeys: Set<string>): string {
  const base = typeof id === 'string' && id !== '' ? id : `demo-${index}`;
  let key = base;
  let suffix = 1;
  while (usedKeys.has(key)) {
    key = `${base}#${suffix++}`;
  }
  usedKeys.add(key);
  return key;
}
