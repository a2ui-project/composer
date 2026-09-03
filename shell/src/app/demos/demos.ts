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
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {DemosCatalog} from './services/demos-catalog';
import {DemoCard} from './demo-card';
import {RenderedFrame} from '../preview/rendered/rendered-frame';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';

/**
 * Largest number of demo cards allowed to hold a live renderer frame at once.
 *
 * This cap is load-bearing rather than an optimization: a renderer can serve
 * dozens of demos, and dozens of simultaneously live renderer iframes would
 * exhaust the browser long before the reader reached the bottom of the wall.
 */
export const MAX_MOUNTED_CARDS = 6;

/**
 * Intersection margin governing when a card mounts and unmounts. One viewport
 * of vertical slack in each direction means cards mount just before scrolling
 * into view and only unmount once they are more than one viewport away.
 */
const MOUNT_ROOT_MARGIN = '100% 0px';

/** Attribute carrying a card's demo id so intersection entries map back to demos. */
const DEMO_ID_ATTRIBUTE = 'data-demo-id';

/**
 * Hosts the `/demos` route: a hidden coordinator frame plus a lazily mounted
 * masonry wall of live demo cards.
 *
 * The coordinator frame is mounted unconditionally and is the only frame on this
 * page that registers as the bridge's primary target. Its handshake is what makes
 * `CatalogManagement.activeCatalog()` non-null, and {@link DemosCatalog} gates its
 * `GET_DEMOS` request on that catalog, so a wall that only mounted frames once
 * demos had arrived could never bootstrap: no frame, no handshake, no catalog, no
 * request, no demos. Mounting it hidden mirrors the `/gallery` idiom.
 *
 * Card mounting is driven by a single {@link IntersectionObserver} owned here
 * rather than one observer per card. The theme broadcast (`HostCommunication
 * .sendTheme`) is not this component's concern: the mounted {@link
 * RenderedFrame} coordinator already runs that effect in its own constructor,
 * so the cost of a theme flip is one broadcast regardless of how many cards
 * happen to be mounted, and {@link DemoCard} deliberately adds none.
 *
 * Inbound bridge traffic is deliberately not consumed here: DATA_MODEL_CHANGE
 * echoes from card frames are of no use to this page, and each card handles its
 * own frame's handshake and resize reports.
 */
@Component({
  selector: 'a2ui-composer-demos',
  standalone: true,
  imports: [MatIconModule, MatProgressSpinnerModule, RenderedFrame, DemoCard],
  templateUrl: './demos.ng.html',
  styleUrl: './demos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Demos implements OnInit, OnDestroy {
  private readonly demosCatalog = inject(DemosCatalog);
  private readonly startupResolution = inject(StartupResolution);

  /** Demos served by the connected renderer, or null while unresolved. */
  protected readonly demos = this.demosCatalog.demos;

  /** Whether a demos request is currently in flight. */
  protected readonly loadingDemos = this.demosCatalog.loadingDemos;

  /**
   * Whether the renderer answered with no demos. This is a legitimate answer
   * rather than an error: a renderer that does not implement `getDemos` replies
   * with an empty list.
   */
  protected readonly isEmpty = computed(() => this.demos()?.length === 0);

  /**
   * Whether the wall should show its loading state rather than the empty state
   * or the demo wall. This covers both an in-flight request and the initial
   * `demos() === null` state that precedes it: the request itself is gated on
   * the coordinator's handshake resolving the active catalog, so on a fresh
   * load there is a window — unbounded, if the configured renderer never
   * responds — where nothing is loading yet and `demos()` is still null. Without
   * this, `isEmpty()` would read `undefined === 0` as `false` and the page would
   * fall through to an empty `.demos-wall` with no explanation.
   */
  protected readonly isResolving = computed(() => this.loadingDemos() || this.demos() === null);

  private readonly coordinatorHost = viewChild.required<ElementRef<HTMLElement>>('coordinatorHost');

  private readonly cardHosts = viewChildren<unknown, ElementRef<HTMLElement>>('cardHost', {
    read: ElementRef,
  });

  private readonly mountedIdsSignal = signal<ReadonlySet<string>>(new Set<string>());

  /** Ids of the demos whose cards currently hold a live renderer frame. */
  protected readonly mountedIds = this.mountedIdsSignal.asReadonly();

  /** Number of demo cards currently holding a live renderer frame. */
  readonly mountedCount = computed(() => this.mountedIdsSignal().size);

  /** Ids reported by the observer as within one viewport of the reader. */
  private readonly visibleIds = new Set<string>();

  /** Card host elements currently handed to the observer. */
  private readonly observedElements = new Set<Element>();

  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        entries => this.onIntersection(entries),
        {
          rootMargin: MOUNT_ROOT_MARGIN,
        },
      );
    }

    // Coordinator registration.
    //
    // The coordinator's iframe belongs to RenderedFrame's own template and
    // `RenderedFrame.iframeRef` is protected, so the element cannot be read off the
    // component instance. Of the two available routes, querying this route's own
    // wrapper is preferred over `hostCommunication.getIframeElement()`: the latter
    // is only correct while the coordinator remains the single frame that registers
    // as primary, an invariant owned by other files (cards register as secondary),
    // whereas the wrapper query is scoped to markup this component owns outright.
    //
    // `afterRenderEffect` rather than `effect`, because the iframe only exists once
    // the child view has rendered; `resolvedUrl()` is the reactive trigger, since it
    // gates that iframe and may resolve asynchronously after startup.
    afterRenderEffect(() => {
      this.startupResolution.resolvedUrl();
      const iframe = this.coordinatorHost().nativeElement.querySelector('iframe');
      untracked(() => this.demosCatalog.setCoordinator(iframe));
    });

    // Observation sync: one observer, N targets. Cards are observed as they enter
    // the wall and released as they leave it.
    effect(() => {
      const observer = this.intersectionObserver;
      const elements = this.cardHosts().map(ref => ref.nativeElement);
      if (!observer) {
        return;
      }
      untracked(() => this.syncObservedElements(observer, elements));
    });
  }

  ngOnInit(): void {
    this.demosCatalog.setDemosActive(true);
  }

  ngOnDestroy(): void {
    this.demosCatalog.setDemosActive(false);
    this.demosCatalog.setCoordinator(null);
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.observedElements.clear();
    this.visibleIds.clear();
  }

  /**
   * Applies a batch of intersection entries and re-derives the mounted set.
   * @param entries Entries reported by the wall's single observer.
   */
  private onIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const demoId = readDemoId(entry.target);
      if (!demoId) {
        continue;
      }
      if (entry.isIntersecting) {
        this.visibleIds.add(demoId);
      } else {
        this.visibleIds.delete(demoId);
      }
    }
    this.reconcileMountedCards();
  }

  /**
   * Brings the observer's target set in line with the rendered card hosts.
   * @param observer The wall's single intersection observer.
   * @param elements Card host elements currently rendered by the wall.
   */
  private syncObservedElements(observer: IntersectionObserver, elements: HTMLElement[]): void {
    const live = new Set<Element>(elements);

    for (const element of this.observedElements) {
      if (live.has(element)) {
        continue;
      }
      observer.unobserve(element);
      this.observedElements.delete(element);
      const demoId = readDemoId(element);
      if (demoId) {
        this.visibleIds.delete(demoId);
      }
    }

    for (const element of elements) {
      if (this.observedElements.has(element)) {
        continue;
      }
      this.observedElements.add(element);
      observer.observe(element);
    }

    this.reconcileMountedCards();
  }

  /**
   * Recomputes which cards hold a live renderer frame, honouring the mount cap.
   *
   * Already mounted cards that remain in range keep their frame, so scrolling never
   * tears down a demo the reader is still looking at; whatever budget is left over
   * is then spent on the remaining visible cards in document order.
   */
  private reconcileMountedCards(): void {
    const previous = this.mountedIdsSignal();
    const next = new Set<string>();

    for (const demoId of previous) {
      if (this.visibleIds.has(demoId)) {
        next.add(demoId);
      }
    }

    for (const demo of this.demos() ?? []) {
      if (next.size >= MAX_MOUNTED_CARDS) {
        break;
      }
      if (this.visibleIds.has(demo.id)) {
        next.add(demo.id);
      }
    }

    if (areSetsEqual(previous, next)) {
      return;
    }
    this.mountedIdsSignal.set(next);
  }
}

/**
 * Reads the demo id a card host element was tagged with.
 * @param element Card host element observed by the wall.
 * @return The demo id, or null when the element carries none.
 */
function readDemoId(element: Element): string | null {
  return element.getAttribute(DEMO_ID_ATTRIBUTE);
}

/**
 * Compares two id sets by content.
 * @param a First set.
 * @param b Second set.
 * @return Whether both sets hold exactly the same ids.
 */
function areSetsEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}
