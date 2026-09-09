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
 * 12 covers a screenful at the size the wall is usually read at. Sweeping the
 * basic catalog's 43 demos end to end in 150px steps counts at most 12 cards
 * overlapping the scrolling box at 1280x820, so every visible card holds a slot
 * there. Counts are taken with cards at whatever height they are holding at the
 * time, including the 260px placeholder an unmounted card sits at, because that
 * is the state slots are handed out in and the state that fits the most cards on
 * a screen.
 *
 * It does not cover a screenful at every size, and cannot be made to. The same
 * sweep at 1920x1080 counts up to 15 — an earlier note here recorded 12 at that
 * size, which measurement does not bear out — and a taller window would count
 * more again. The number of cards that fit on a screen grows with the window
 * without bound, so there is no value of this constant that guarantees a slot for
 * every visible card at every size; raising it only moves the size at which the
 * guarantee lapses. What that costs is real: loading the wall at 1920x1080 and
 * summing RSS across the browser's process tree measures 555MB holding 12 frames
 * against 571MB holding 15, around 5MB a frame and in line with the ~7MB a slot
 * was originally priced at, so the wall runs at roughly 85MB of frames where
 * letting all 43 demos mount would cost something like 300MB. That runaway is
 * what this exists to prevent.
 *
 * So where more cards share the viewport than there are slots, the surplus are
 * blank until the reader scrolls, and that is the trade a fixed cap makes rather
 * than a defect in scheduling. What the cap must not do is decide *which* cards
 * go blank. {@link Demos.reconcileMountedCards} owns that, and ranks cards the
 * reader can see ahead of cards they cannot, so the blank ones are the cards
 * furthest from the reader among those on screen and never a card the reader is
 * looking at while an off-screen card holds a frame. Measured against the sweep
 * above, the number of visible cards holding no slot is exactly
 * `max(0, onScreen - 12)` at every scroll position at both sizes: zero wherever
 * the cap is not binding, and never more than the shortfall where it is.
 */
export const MAX_MOUNTED_CARDS = 12;

/**
 * Intersection margin governing which cards are candidates for a mount slot.
 *
 * Half a scroller of vertical slack in each direction, applied to the wall's own
 * scrolling element (see {@link Demos.ensureIntersectionObserver} for why the
 * root has to be that element and not the window).
 *
 * All this buys is lead time: how far ahead of the reader a card starts booting.
 * Half a scroller is 410px of that at 1280x820, a little over one card height, so
 * the reader arrives at cards that have finished rendering rather than watching
 * them boot.
 *
 * It deliberately does *not* decide which cards win slots, and the size of the
 * candidate set it admits — around 18 for the wall's 12 slots — is no longer
 * load-bearing. It used to be: while ranking was a single centre-distance order,
 * a wide margin let an off-screen candidate outrank an on-screen one, so every
 * extra candidate was another card that could take a slot from a card the reader
 * was looking at. {@link Demos.reconcileMountedCards} now ranks on-screen cards
 * ahead of off-screen ones outright, which makes off-screen candidates unable to
 * hold a slot any on-screen card wants however many of them there are. Narrowing
 * the margin would therefore buy no correctness and cost the lead time it exists
 * for, so it stays where it is.
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
 *
 * It applies only between cards of the same visibility, never across the boundary
 * between an on-screen card and an off-screen one. Damping is for distinguishing
 * a reflow from a scroll among cards that are equally worth showing; it has no
 * business arbitrating between a card the reader can see and one they cannot,
 * and letting it do so is exactly what left visible cards blank — see {@link
 * Demos.reconcileMountedCards}.
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
 * Card mounting is driven by two observers owned here rather than a pair per
 * card — an {@link IntersectionObserver} for cards coming within range of the
 * reader and a {@link ResizeObserver} for the wall reflowing under them (see
 * {@link Demos.ensureResizeObserver} for why the second is needed) — and the
 * frames they may keep alive are capped at {@link MAX_MOUNTED_CARDS}; which cards
 * hold those slots is decided by what the reader can see rather than by position
 * in the wall, see {@link Demos.reconcileMountedCards}. The theme broadcast (`HostCommunication
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

  /**
   * Renderer URL the bridge is actually talking to, or null when startup has not
   * resolved one.
   *
   * The empty state reports it because "this renderer has no demos" and "a
   * different renderer than you think answered" are indistinguishable to a reader
   * otherwise — which is exactly how a preview whose shell is new but whose
   * renderers are the previously deployed build reads as a feature that does not
   * work at all. `getResolvedRendererUrl` is the same source
   * `HostCommunication.resolveExpectedRendererOrigin` checks frame traffic
   * against, so it names the renderer that actually replied rather than a
   * configured intent.
   *
   * Empty and whitespace-only values collapse to null so the empty state shows
   * its message alone rather than a dangling label or the string "null".
   */
  protected readonly resolvedRendererUrl = computed(
    () => this.startupResolution.getResolvedRendererUrl()?.trim() || null,
  );

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
   * ranks candidates on live geometry — both whether they overlap the
   * scrolling box and how far their centre sits from its middle — which has to be
   * read off the element at reconcile time: an intersection entry's
   * `boundingClientRect` describes where the card was when it crossed the
   * observer's boundary, not where it is now, and its `isIntersecting` is
   * measured against the root widened by {@link MOUNT_ROOT_MARGIN} rather than
   * against what the reader can see.
   */
  private readonly visibleCards = new Map<string, Element>();

  /** Card host elements currently handed to the observer. */
  private readonly observedElements = new Set<Element>();

  private intersectionObserver: IntersectionObserver | null = null;

  private resizeObserver: ResizeObserver | null = null;

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

  /**
   * Position in the entrance cascade for the card at a given place in the wall.
   *
   * The wall's cards are all created in one pass — it is their *frames* that arrive
   * lazily — so without a per-card offset all 43 would fade in on the same frame and
   * the entrance would read as the page appearing rather than as the wall
   * assembling. Multiplying by a step in the stylesheet turns this into a delay.
   *
   * Capped at the last index that can be on screen at once, which is what {@link
   * MAX_MOUNTED_CARDS} already measures: past that point a card is below the fold,
   * its delay would be time nobody is watching, and the reader who scrolls down
   * would arrive at cards still waiting for their turn to appear. Everything from
   * there on shares the last step and is finished before the reader reaches it.
   *
   * @param index Position of the card in the wall.
   * @return The card's step in the cascade.
   */
  protected entranceStep(index: number): number {
    return Math.min(index, MAX_MOUNTED_CARDS - 1);
  }

  ngOnInit(): void {
    this.demosCatalog.setDemosActive(true);
  }

  ngOnDestroy(): void {
    this.demosCatalog.setDemosActive(false);
    this.demosCatalog.setCoordinator(null);
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
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
   * Builds the observer that re-runs mount scheduling when the wall reflows.
   *
   * Intersection entries are not enough to keep the mount set true, because the
   * wall moves under the reader without anything crossing the observer's
   * boundary. A card that wins a slot boots its frame and commits a measured
   * height — a demo card grows from its 260px placeholder to as much as 508px —
   * and every card below it in that masonry column shifts by the difference. Cards
   * already inside {@link MOUNT_ROOT_MARGIN} cross no boundary as they shift, so
   * the observer stays silent and the mount set keeps describing the layout as it
   * was before the frames it mounted changed it. Measured on the wall, that left
   * two cards the reader could see holding no slot at one scroll position in three
   * — the same symptom as a bad ranking, from a stale one.
   *
   * Re-running the ranking on reflow terminates rather than feeding back, because
   * the growth that triggers it happens once per card: `DemoCard` keeps its
   * measured height when its frame is unmounted (only a change of renderer clears
   * it), so a card's height settles once and every later reconcile against it
   * agrees with the last. Reconciling is also free when nothing has changed —
   * {@link Demos.reconcileMountedCards} publishes nothing when the set it computes
   * matches the one already live — so the steady state costs one rect read per
   * candidate and no re-render.
   *
   * @return The wall's resize observer, or null where the platform has none.
   */
  private ensureResizeObserver(): ResizeObserver | null {
    if (this.resizeObserver) {
      return this.resizeObserver;
    }
    if (typeof ResizeObserver === 'undefined') {
      return null;
    }
    // Entries are ignored: any card changing size invalidates the ranking for all
    // of them, and the observer already coalesces a batch into one callback.
    this.resizeObserver = new ResizeObserver(() => this.reconcileMountedCards());
    return this.resizeObserver;
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
   * Brings both observers' target sets in line with the rendered card hosts.
   *
   * The two watch the same elements — one for when a card comes within range of
   * the reader, the other for when the wall reflows under them — so they are
   * synced together off one bookkeeping set.
   *
   * @param observer The wall's single intersection observer.
   * @param elements Card host elements currently rendered by the wall.
   */
  private syncObservedElements(observer: IntersectionObserver, elements: HTMLElement[]): void {
    const live = new Set<Element>(elements);
    const resizeObserver = this.ensureResizeObserver();

    for (const element of this.observedElements) {
      if (live.has(element)) {
        continue;
      }
      observer.unobserve(element);
      resizeObserver?.unobserve(element);
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
      resizeObserver?.observe(element);
    }

    this.reconcileMountedCards();
  }

  /**
   * Recomputes which cards hold a live renderer frame, honouring the mount cap.
   *
   * Slots go to the cards the reader can see, and only then to the cards nearest
   * them. Two earlier rules each failed on their own half of that.
   *
   * Filling the cap in document order meant six early cards could hold every slot
   * forever, and a card further down the wall could not mount even once the
   * reader had scrolled to it. Ranking purely by the distance between a card's
   * centre and the scroller's then fixed that but introduced its own starvation:
   * centre-to-centre distance is not a proxy for "the reader can see this". A
   * tall card can sit entirely on screen with its centre 500px from the middle of
   * the scroller, while a short card just past the fold sits nearer than it. With
   * a candidate set drawn from {@link MOUNT_ROOT_MARGIN} — half a scroller beyond
   * the fold in each direction — the wall measured on-screen cards at 501px and
   * 507px held out of slots by off-screen cards at 578px, 633px and 685px: every
   * gap smaller than {@link EVICTION_HYSTERESIS_PX}, so no eviction ever fired and
   * two cards the reader was looking at stayed blank indefinitely. Every card
   * caught blank that way was one of the wall's tall ones.
   *
   * So visibility is the primary key and distance is only the tie-break within it:
   *
   * - A candidate is on screen when its rect overlaps the scrolling root's at all,
   *   measured live rather than taken from the observer, whose entries are
   *   reported against the root *plus* its margin and describe where a card was
   *   when it crossed that boundary rather than where it is now.
   * - On-screen candidates outrank every off-screen one outright. Among cards of
   *   the same visibility, the nearer centre wins, ties broken by wall position.
   * - Cards already mounted keep their slots, so scrolling back over ground the
   *   reader has covered costs nothing.
   * - Free slots go to the best-ranked candidates that hold none.
   * - Once the cap is full, a challenger takes the weakest held slot only if it
   *   outranks it: across the visibility boundary that is enough on its own, and
   *   within one visibility class it must additionally be nearer by more than
   *   {@link EVICTION_HYSTERESIS_PX}.
   *
   * A visible card cannot starve while the cap exceeds the number of cards that
   * can share the viewport. The only cards that can hold it out are ones that
   * outrank it, and off-screen cards no longer can at any distance or hysteresis:
   * the moment a slot is held by an off-screen card, a visible challenger takes
   * it. So the slots a visible card competes for are contested only by other
   * visible cards, of which there are at most a screenful.
   *
   * Nor can dropping the hysteresis across that boundary reintroduce thrash,
   * because the crossing only runs one way. An off-screen challenger can never
   * take a visible card's slot, so the visible card that wins a slot holds it
   * until it either leaves the observer's range entirely or loses to another
   * *visible* card — which still has to clear the hysteresis. There is no pair of
   * states for a slot to oscillate between.
   */
  private reconcileMountedCards(): void {
    const previous = this.mountedKeysSignal();
    const ranked = this.rankCandidates();

    const retained: RankedCard[] = [];
    const challengers: RankedCard[] = [];
    for (const candidate of ranked) {
      (previous.has(candidate.trackKey) ? retained : challengers).push(candidate);
    }

    // `retained` can only exceed the cap if the cap itself shrank, but truncating
    // by rank rather than trusting the previous set keeps that honest.
    const next = retained.slice(0, MAX_MOUNTED_CARDS);

    let challenger = 0;
    while (next.length < MAX_MOUNTED_CARDS && challenger < challengers.length) {
      next.push(challengers[challenger++]);
    }

    // `challengers` is sorted best first, so the moment the best one left fails to
    // displace the weakest held slot, none of the rest can either: a later
    // challenger is either off screen against the same held card, or on screen and
    // further away, and both lose wherever this one did.
    while (challenger < challengers.length) {
      const weakest = indexOfWeakest(next);
      if (weakest < 0) {
        break;
      }
      if (!canDisplace(next[weakest], challengers[challenger])) {
        break;
      }
      next[weakest] = challengers[challenger++];
    }

    const nextKeys = new Set(next.map(card => card.trackKey));
    if (areSetsEqual(previous, nextKeys)) {
      return;
    }
    this.mountedKeysSignal.set(nextKeys);
  }

  /**
   * Orders the in-range cards by whether the reader can see them, then by how
   * close they are to the middle of the wall.
   *
   * Both facts are measured live off each card host, because the wall reflows as
   * cards commit their measured heights and an intersection entry's geometry is
   * only true of the instant it was recorded. The entry's `isIntersecting` is no
   * use for the visibility question either: it is reported against the root
   * widened by {@link MOUNT_ROOT_MARGIN}, so it is true of half a screen of cards
   * the reader cannot see.
   *
   * Overlap is treated as a yes/no rather than as an intersection ratio. A tall
   * card three quarters off screen still has a top edge the reader is reading,
   * and a ratio would rank it below a short card wholly on screen and let the cap
   * blank it — which is a milder version of the bug this ordering exists to fix.
   *
   * @return In-range cards, best claim first: on-screen before off-screen, then
   *     nearest first, ties broken by position in the wall.
   */
  private rankCandidates(): RankedCard[] {
    const wallOrder = new Map<string, number>();
    (this.demos() ?? []).forEach((demo, index) => wallOrder.set(demo.trackKey, index));

    const root = this.mountRootBounds();
    const centre = (root.top + root.bottom) / 2;
    const ranked: RankedCard[] = [];
    for (const [trackKey, element] of this.visibleCards) {
      const rect = element.getBoundingClientRect();
      ranked.push({
        trackKey,
        onScreen: rect.bottom > root.top && rect.top < root.bottom,
        distance: Math.abs(rect.top + rect.height / 2 - centre),
        wallIndex: wallOrder.get(trackKey) ?? Number.MAX_SAFE_INTEGER,
      });
    }

    ranked.sort(compareClaims);
    return ranked;
  }

  /**
   * Locates the box a card has to overlap to count as on screen, and whose middle
   * cards are ranked by their distance from.
   *
   * The scrolling element rather than the window, so both measurements are taken
   * against the same box the observer treats as its root: the wall sits below the
   * app's header, so neither the middle nor the extent of the window is the middle
   * or the extent of what the reader is reading.
   *
   * @return The top and bottom of the wall's scrolling box, in pixels from the top
   *     of the window.
   */
  private mountRootBounds(): {top: number; bottom: number} {
    const root = this.wallScroller()?.nativeElement;
    if (root) {
      const rect = root.getBoundingClientRect();
      return {top: rect.top, bottom: rect.bottom};
    }
    if (typeof window === 'undefined') {
      return {top: 0, bottom: 0};
    }
    return {top: 0, bottom: window.innerHeight || document.documentElement?.clientHeight || 0};
  }
}

/** A candidate card paired with the measurements that decide its claim to a slot. */
interface RankedCard {
  /** Shell-assigned track key identifying the demo. */
  readonly trackKey: string;
  /** Whether the card's rect overlaps the wall's scrolling box at all. */
  readonly onScreen: boolean;
  /** Pixels between the card's vertical centre and the middle of the wall. */
  readonly distance: number;
  /** Position in the wall, used only to break ties between equal distances. */
  readonly wallIndex: number;
}

/**
 * Orders two candidates by how strong a claim each has on a mount slot.
 *
 * Visibility dominates: a card the reader can see outranks one they cannot at any
 * distance. Distance only separates cards of the same visibility, and the wall
 * position only separates cards at the same distance — which is what keeps the
 * order total, so the set of cards that win slots does not depend on sort
 * stability.
 *
 * @param a First candidate.
 * @param b Second candidate.
 * @return Negative when `a` has the stronger claim, positive when `b` does.
 */
function compareClaims(a: RankedCard, b: RankedCard): number {
  if (a.onScreen !== b.onScreen) {
    return a.onScreen ? -1 : 1;
  }
  return a.distance - b.distance || a.wallIndex - b.wallIndex;
}

/**
 * Finds the held slot a challenger would displace.
 * @param cards Cards currently holding a slot.
 * @return Index of the card with the weakest claim, or -1 when there are none.
 */
function indexOfWeakest(cards: readonly RankedCard[]): number {
  let weakest = -1;
  for (let index = 0; index < cards.length; index++) {
    if (weakest < 0 || compareClaims(cards[index], cards[weakest]) > 0) {
      weakest = index;
    }
  }
  return weakest;
}

/**
 * Decides whether a challenger may take the slot a held card occupies.
 *
 * Across the visibility boundary the ranking decides it outright: a card the
 * reader can see displaces one they cannot, and one they cannot never displaces
 * one they can. {@link EVICTION_HYSTERESIS_PX} applies only between two cards of
 * the same visibility, where the question really is whether the reader moved or
 * the wall merely reflowed. Applying it across the boundary is what let off-screen
 * cards hold slots against visible ones.
 *
 * @param held The weakest card currently holding a slot.
 * @param challenger The best-ranked candidate holding none.
 * @return Whether the challenger takes the slot.
 */
function canDisplace(held: RankedCard, challenger: RankedCard): boolean {
  if (held.onScreen !== challenger.onScreen) {
    return challenger.onScreen;
  }
  return held.distance > challenger.distance + EVICTION_HYSTERESIS_PX;
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
