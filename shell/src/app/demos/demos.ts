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
 *
 * Its floor is set by what the reader can see rather than by taste: a card that
 * is on screen and holds no slot is a blank card, so the cap has to cover the
 * most cards that can share the viewport at once. Scrolling the basic catalog's
 * 43 demos end to end measures at most 11 cards overlapping the viewport at
 * 1280x800 (the e2e viewport, counted while cards still sat at their unmounted
 * placeholder height, which is the state slots are handed out in) and 12 at
 * 1920x1080. 12 is therefore the smallest value that leaves no visible card
 * unmountable at either size.
 *
 * Its ceiling is what a slot costs. Loading N copies of the sample renderer
 * measures around 7MB of browser RSS each, so this cap prices the wall at
 * roughly 85MB of frames where letting all 43 demos mount would cost about
 * 300MB — which is the runaway this exists to prevent, and 12 is still a long
 * way from it.
 *
 * A viewport taller than those measured can still show more cards than there are
 * slots, and the furthest of them will be blank until the reader scrolls: that is
 * the trade a fixed cap makes, and proximity ranking is what makes the blank one
 * the card furthest from the reader rather than an arbitrary one.
 */
export const MAX_MOUNTED_CARDS = 12;

/**
 * Intersection margin governing which cards are candidates for a mount slot.
 *
 * Half a scroller of vertical slack in each direction, applied to the wall's own
 * scrolling element (see {@link Demos.ensureIntersectionObserver} for why the
 * root has to be that element and not the window).
 *
 * Halved from a full viewport because the two jobs the margin used to do have
 * come apart. It no longer decides *which* cards win slots — {@link
 * Demos.reconcileMountedCards} ranks candidates by proximity now — so all it
 * still buys is lead time: how far ahead of the reader a card starts booting.
 * Half a scroller is 368px of that lead at 1280x800, a little over one card
 * height, and admits 14-16 candidates for the wall's 12 slots (19-23 at
 * 1920x1080), which leaves the ranking real competition to arbitrate while the
 * reader still arrives at cards that have finished rendering. A full viewport
 * bought lead time no card needs, over a candidate set twice the size of the
 * cap.
 */
const MOUNT_ROOT_MARGIN = '50% 0px';

/**
 * How much nearer the viewport a candidate must be before it takes the slot of
 * an already mounted card.
 *
 * Without it, two cards on opposite sides of the reader and near-equidistant
 * would trade one slot back and forth every time the wall reflowed or the reader
 * nudged the scrollbar, and each trade costs a frame teardown, a fresh boot and
 * a re-measure (see `DemoCard.applyReportedHeight`), which is worse than the
 * blank card this scheduling exists to avoid.
 *
 * 200px is a quarter of the 800px viewport this was measured at and under two
 * thirds of the wall's median card height there (318px), which puts it either
 * side of the two things it has to separate: far above the jitter of a reflow
 * settling, and far below a deliberate scroll, so a reader moving towards a card
 * still hands it the slot within a fifth of a screen.
 */
const EVICTION_HYSTERESIS_PX = 200;

/**
 * Attribute carrying a card's track key so intersection entries map back to
 * demos. It carries the shell-assigned `trackKey` rather than the renderer's
 * own `Demo.id`, because only the former is guaranteed to be present and
 * unique across the wall.
 */
const DEMO_KEY_ATTRIBUTE = 'data-demo-key';

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
 * rather than one observer per card, and the frames it may keep alive are capped
 * at {@link MAX_MOUNTED_CARDS}; which cards hold those slots is decided by
 * distance from the reader rather than by position in the wall, see {@link
 * Demos.reconcileMountedCards}. The theme broadcast (`HostCommunication
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

  private readonly wallScroller = viewChild<ElementRef<HTMLElement>>('wallScroller');

  private readonly cardHosts = viewChildren<unknown, ElementRef<HTMLElement>>('cardHost', {
    read: ElementRef,
  });

  private readonly mountedKeysSignal = signal<ReadonlySet<string>>(new Set<string>());

  /** Track keys of the demos whose cards currently hold a live renderer frame. */
  protected readonly mountedKeys = this.mountedKeysSignal.asReadonly();

  /** Number of demo cards currently holding a live renderer frame. */
  readonly mountedCount = computed(() => this.mountedKeysSignal().size);

  /**
   * Card hosts the observer currently reports as in range, keyed by track key.
   *
   * The elements are held rather than the keys alone because mount scheduling
   * ranks candidates by their live distance from the reader, which has to be
   * read off the element at reconcile time: an intersection entry's
   * `boundingClientRect` describes where the card was when it crossed the
   * observer's boundary, not where it is now.
   */
  private readonly visibleCards = new Map<string, Element>();

  /** Card host elements currently handed to the observer. */
  private readonly observedElements = new Set<Element>();

  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
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
    // the wall and released as they leave it. The observer itself is built on the
    // first run rather than in this constructor, because it needs an element the
    // view has not created yet — see {@link Demos.ensureIntersectionObserver}.
    effect(() => {
      const elements = this.cardHosts().map(ref => ref.nativeElement);
      // Read reactively: the scrolling element resolves with the view, so this
      // effect has to run again once it exists if it ran before it did.
      const root = this.wallScroller()?.nativeElement ?? null;
      untracked(() => {
        const observer = this.ensureIntersectionObserver(root);
        if (!observer) {
          return;
        }
        this.syncObservedElements(observer, elements);
      });
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
    this.visibleCards.clear();
  }

  /**
   * Builds the wall's observer once, rooted on the element the wall scrolls in.
   *
   * The root matters more than it looks. The wall does not scroll the page — it
   * scrolls inside `.demos-container` — and an observer left rooted on the
   * viewport clips every target against that container before {@link
   * MOUNT_ROOT_MARGIN} is applied, because the margin expands the root's own
   * rectangle and nothing else. Rooted on the viewport, the margin was therefore
   * inert at any value: measured against the basic catalog, exactly as many cards
   * were reported in range as were literally on screen, so cards mounted as the
   * reader reached them rather than before, and every card was watched booting.
   * Rooting the observer on the scroller is what makes the margin mean what it
   * says.
   *
   * @param root The element the wall scrolls in, or null before it is rendered.
   * @return The wall's observer, or null where the platform has none or the
   *     scrolling element has not been rendered yet.
   */
  private ensureIntersectionObserver(root: Element | null): IntersectionObserver | null {
    if (this.intersectionObserver) {
      return this.intersectionObserver;
    }
    if (!root || typeof IntersectionObserver === 'undefined') {
      return null;
    }
    this.intersectionObserver = new IntersectionObserver(entries => this.onIntersection(entries), {
      root,
      rootMargin: MOUNT_ROOT_MARGIN,
    });
    return this.intersectionObserver;
  }

  /**
   * Applies a batch of intersection entries and re-derives the mounted set.
   * @param entries Entries reported by the wall's single observer.
   */
  private onIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const trackKey = readTrackKey(entry.target);
      if (!trackKey) {
        continue;
      }
      if (entry.isIntersecting) {
        this.visibleCards.set(trackKey, entry.target);
      } else {
        this.visibleCards.delete(trackKey);
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
      const trackKey = readTrackKey(element);
      if (trackKey) {
        this.visibleCards.delete(trackKey);
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
   * Slots go to the cards nearest the reader, never to the cards that got here
   * first. Filling the cap in document order — which is what this did — meant six
   * early cards could hold every slot forever, and a card further down the wall
   * could not mount even when the reader had scrolled to it and it was the only
   * thing on screen. Two demos at the end of the basic catalog never mounted at
   * all and rendered as permanently blank cards.
   *
   * Candidates are the cards the observer reports as in range, ranked by the
   * distance between their centre and the viewport's. Ranking on the centre
   * rather than on the gap to the nearest viewport edge is what keeps the order
   * total: every card on screen would otherwise tie at zero and the tie-break
   * would be back to deciding things.
   *
   * Retention and eviction then follow from that ranking:
   *
   * - Cards already mounted keep their slots, so scrolling back over ground the
   *   reader has covered costs nothing.
   * - Free slots go to the nearest candidates that do not hold one.
   * - Once the cap is full, a candidate takes a mounted card's slot only if it is
   *   nearer by more than {@link EVICTION_HYSTERESIS_PX}, which is what stops two
   *   near-equidistant cards trading a slot back and forth.
   *
   * No card can starve under this. A card the reader scrolls to sits at the
   * viewport's centre, so the only thing that can hold it out is a full cap of
   * cards that are themselves within {@link EVICTION_HYSTERESIS_PX} of that same
   * centre — and the cap is set above the most cards that can share the viewport
   * at once, so a card the reader is actually looking at always wins a slot.
   */
  private reconcileMountedCards(): void {
    const previous = this.mountedKeysSignal();
    const ranked = this.rankCandidatesByProximity();

    const retained: RankedCard[] = [];
    const challengers: RankedCard[] = [];
    for (const candidate of ranked) {
      (previous.has(candidate.trackKey) ? retained : challengers).push(candidate);
    }

    // `retained` can only exceed the cap if the cap itself shrank, but truncating
    // by distance rather than trusting the previous set keeps that honest.
    const next = retained.slice(0, MAX_MOUNTED_CARDS);

    let challenger = 0;
    while (next.length < MAX_MOUNTED_CARDS && challenger < challengers.length) {
      next.push(challengers[challenger++]);
    }

    // `challengers` is sorted nearest first, so the moment the nearest one left
    // fails to clear the hysteresis, none of the rest can either.
    while (challenger < challengers.length) {
      const furthest = indexOfFurthest(next);
      if (furthest < 0) {
        break;
      }
      if (next[furthest].distance <= challengers[challenger].distance + EVICTION_HYSTERESIS_PX) {
        break;
      }
      next[furthest] = challengers[challenger++];
    }

    const nextKeys = new Set(next.map(card => card.trackKey));
    if (areSetsEqual(previous, nextKeys)) {
      return;
    }
    this.mountedKeysSignal.set(nextKeys);
  }

  /**
   * Orders the in-range cards by how close they are to the middle of the wall.
   *
   * Distances are measured live off each card host, because the wall reflows as
   * cards commit their measured heights and an intersection entry's geometry is
   * only true of the instant it was recorded.
   *
   * @return In-range cards, nearest first, ties broken by position in the wall.
   */
  private rankCandidatesByProximity(): RankedCard[] {
    const wallOrder = new Map<string, number>();
    (this.demos() ?? []).forEach((demo, index) => wallOrder.set(demo.trackKey, index));

    const viewportCentre = this.mountRootCentre();
    const ranked: RankedCard[] = [];
    for (const [trackKey, element] of this.visibleCards) {
      const rect = element.getBoundingClientRect();
      ranked.push({
        trackKey,
        distance: Math.abs(rect.top + rect.height / 2 - viewportCentre),
        wallIndex: wallOrder.get(trackKey) ?? Number.MAX_SAFE_INTEGER,
      });
    }

    ranked.sort((a, b) => a.distance - b.distance || a.wallIndex - b.wallIndex);
    return ranked;
  }

  /**
   * Locates the point cards are ranked by their distance from.
   *
   * The scrolling element rather than the window, so the ranking measures against
   * the same box the observer treats as its root: the wall sits below the app's
   * header, so the middle of the window is not the middle of what the reader is
   * reading.
   *
   * @return Distance in pixels from the top of the window to the middle of the
   *     wall's scrolling box.
   */
  private mountRootCentre(): number {
    const root = this.wallScroller()?.nativeElement;
    if (root) {
      const rect = root.getBoundingClientRect();
      return rect.top + rect.height / 2;
    }
    if (typeof window === 'undefined') {
      return 0;
    }
    return (window.innerHeight || document.documentElement?.clientHeight || 0) / 2;
  }
}

/** A candidate card paired with the proximity that decides its claim to a slot. */
interface RankedCard {
  /** Shell-assigned track key identifying the demo. */
  readonly trackKey: string;
  /** Pixels between the card's vertical centre and the middle of the wall. */
  readonly distance: number;
  /** Position in the wall, used only to break ties between equal distances. */
  readonly wallIndex: number;
}

/**
 * Finds the mounted candidate a challenger would displace.
 * @param cards Cards currently holding a slot.
 * @return Index of the card furthest from the reader, or -1 when there are none.
 */
function indexOfFurthest(cards: readonly RankedCard[]): number {
  let furthest = -1;
  for (let index = 0; index < cards.length; index++) {
    if (furthest < 0 || cards[index].distance > cards[furthest].distance) {
      furthest = index;
    }
  }
  return furthest;
}

/**
 * Reads the track key a card host element was tagged with.
 * @param element Card host element observed by the wall.
 * @return The demo's track key, or null when the element carries none.
 */
function readTrackKey(element: Element): string | null {
  return element.getAttribute(DEMO_KEY_ATTRIBUTE);
}

/**
 * Compares two track-key sets by content.
 * @param a First set.
 * @param b Second set.
 * @return Whether both sets hold exactly the same keys.
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
