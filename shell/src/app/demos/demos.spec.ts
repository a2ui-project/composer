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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal} from '@angular/core';
import {describe, it, expect, afterEach, beforeEach, vi} from 'vitest';
import {EMPTY, ReplaySubject} from 'rxjs';
import {Demos, MAX_MOUNTED_CARDS} from './demos';
import {DemosHarness} from './test/demos.harness';
import {DemosCatalog, type TrackedDemo} from './services/demos-catalog';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ChatState} from '../chat/chat-state/chat-state';

class MockDemosCatalog {
  readonly demos = signal<TrackedDemo[] | null>(null);
  readonly loadingDemos = signal(false);
  setDemosActive = vi.fn();
  setCoordinator = vi.fn();
}

class MockHostCommunication {
  sendRenderA2UI = vi.fn();
  sendToFrame = vi.fn();
  registerIframe = vi.fn();
  unregisterIframe = vi.fn();
  registerSecondaryIframe = vi.fn();
  unregisterSecondaryIframe = vi.fn();
  sendTheme = vi.fn();
  messageStreamFor = vi.fn(() => EMPTY);
  readonly messageStream$ = new ReplaySubject<unknown>(1);
  readonly messageStream = signal(null);
}

class MockStartupResolution {
  readonly resolvedUrl = signal<string | null>('http://localhost:3000/renderer');
  // Delegates to the signal the way the real service does, so a test can move the
  // resolved renderer by setting one thing.
  getResolvedRendererUrl = vi.fn((): string | null => this.resolvedUrl());
}

class MockChatState {
  readonly isProgrammaticStreamActive = signal<boolean>(false);
}

/**
 * Builds a deterministic list of demos.
 * @param count How many demos to synthesize.
 * @return A list of demos with stable ids and track keys.
 */
function makeDemos(count: number): TrackedDemo[] {
  return Array.from({length: count}, (_unused, index) => ({
    id: `demo-${index}`,
    trackKey: `demo-${index}`,
    name: `Demo ${index}`,
    description: `Description ${index}`,
    a2ui: [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: `surface-${index}`,
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
    ],
  }));
}

/**
 * Intersection observer stub whose reports the test can also drive by hand.
 *
 * It reproduces the auto-reporting stub `test-setup.ts` installs — every observed
 * target is announced as intersecting on the next macrotask — and additionally
 * exposes the observed targets and a {@link TestIntersectionObserver.report} hook,
 * which is what lets a test re-run the wall's mount scheduling after moving cards
 * around.
 */
class TestIntersectionObserver {
  /** Every instance constructed since the current test began. */
  static readonly instances: TestIntersectionObserver[] = [];

  readonly targets = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
    setTimeout(() => this.report([{target, isIntersecting: true}]), 0);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  disconnect(): void {
    this.targets.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /**
   * Delivers a batch of entries to the observing component.
   * @param entries Targets and whether each is currently in range.
   */
  report(entries: Array<{target: Element; isIntersecting: boolean}>): void {
    this.callback(
      entries as unknown as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver,
    );
  }
}

/** Height every stubbed card is given, roughly the wall's measured median. */
const STUB_CARD_HEIGHT = 320;

/**
 * Pins each card's geometry so mount ranking is deterministic.
 *
 * jsdom reports every element at the origin with no size, which leaves every card
 * exactly as near the reader as every other and none of them overlapping the
 * viewport; a test that cares which card wins a slot has to say where the cards
 * are and how tall they are.
 *
 * @param fixture The wall under test.
 * @param centreOffsets Signed pixel offset of each card's centre from the middle
 *     of the scrolling box, keyed by track key. Cards left out are parked far
 *     away.
 * @param heights Height of individual cards, keyed by track key. Cards left out
 *     get {@link STUB_CARD_HEIGHT}. Heights matter because a card's visibility
 *     and its centre distance move independently once cards differ in size —
 *     which is the situation the wall's ranking exists to get right.
 * @return The card host elements, keyed by track key.
 */
function placeCards(
  fixture: ComponentFixture<Demos>,
  centreOffsets: Record<string, number>,
  heights: Record<string, number> = {},
): Map<string, Element> {
  const viewportCentre = window.innerHeight / 2;
  const placed = new Map<string, Element>();
  const host = fixture.nativeElement as HTMLElement;

  // Cards are ranked against the middle of the element the wall scrolls in, so
  // the scroller has to be given a box too or every distance is measured from the
  // top of the document.
  const scroller = host.querySelector('.demos-container');
  if (scroller) {
    scroller.getBoundingClientRect = () =>
      ({
        top: 0,
        bottom: window.innerHeight,
        height: window.innerHeight,
        left: 0,
        right: 1280,
        width: 1280,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
  }

  const cards = host.querySelectorAll('a2ui-composer-demo-card');
  for (const card of Array.from(cards)) {
    const trackKey = card.getAttribute('data-demo-key') ?? '';
    const offset = centreOffsets[trackKey] ?? 100_000;
    const height = heights[trackKey] ?? STUB_CARD_HEIGHT;
    const top = viewportCentre + offset - height / 2;
    card.getBoundingClientRect = () =>
      ({
        top,
        bottom: top + height,
        height,
        left: 0,
        right: 400,
        width: 400,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
    placed.set(trackKey, card);
  }
  return placed;
}

/**
 * Centre offset that puts a card of the default height wholly above the viewport.
 *
 * Its bottom edge lands half a card above the top of the scrolling box, so it is
 * off screen by any measure, and its centre sits `viewport/2 + cardHeight` from
 * the middle of the box.
 */
const OFF_SCREEN_OFFSET = -(window.innerHeight / 2 + STUB_CARD_HEIGHT);

/**
 * Centre offset that leaves a card of the default height showing a 24px sliver at
 * the bottom of the viewport.
 *
 * This is the shape of card the wall used to blank: on screen, so the reader is
 * looking at it, but with its centre well below the middle of the scrolling box
 * because most of its height is past the fold. Against {@link OFF_SCREEN_OFFSET}
 * it is nearer by `STUB_CARD_HEIGHT / 2 + 24` — 184px, inside the wall's 200px
 * eviction hysteresis, and independent of the viewport jsdom happens to report.
 */
const ON_SCREEN_SLIVER_OFFSET = window.innerHeight / 2 + STUB_CARD_HEIGHT / 2 - 24;

/**
 * Resize observer stub the test can fire by hand.
 *
 * The wall re-runs its mount scheduling whenever a card resizes, because a card
 * that mounts commits a measured height and shifts every card below it without
 * anything crossing the intersection observer's boundary. Nothing resizes in
 * jsdom, so a test that wants that path has to announce the reflow itself.
 */
class TestResizeObserver {
  /** Every instance constructed since the current test began. */
  static readonly instances: TestResizeObserver[] = [];

  readonly targets = new Set<Element>();

  constructor(private readonly callback: () => void) {
    TestResizeObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }

  unobserve(target: Element): void {
    this.targets.delete(target);
  }

  disconnect(): void {
    this.targets.clear();
  }

  /** Announces that the observed cards changed size. */
  report(): void {
    this.callback();
  }
}

/**
 * Retrieves the single observer the wall installs for its card hosts.
 * @return The wall's intersection observer.
 */
function wallObserver(): TestIntersectionObserver {
  const [observer] = TestIntersectionObserver.instances;
  if (!observer) {
    throw new Error('The wall installed no intersection observer.');
  }
  return observer;
}

/**
 * Retrieves the single resize observer the wall installs for its card hosts.
 * @return The wall's resize observer.
 */
function wallResizeObserver(): TestResizeObserver {
  const [observer] = TestResizeObserver.instances;
  if (!observer) {
    throw new Error('The wall installed no resize observer.');
  }
  return observer;
}

describe('Demos Component', () => {
  let fixture: ComponentFixture<Demos>;
  let harness: DemosHarness;
  let demosCatalogMock: MockDemosCatalog;
  let startupResolutionMock: MockStartupResolution;
  let originalIntersectionObserver: typeof IntersectionObserver;
  let originalResizeObserver: typeof ResizeObserver;

  /**
   * Lets {@link TestIntersectionObserver} deliver the entries it queues when a
   * card is first observed, then flushes the resulting render.
   */
  async function flushIntersections(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    TestIntersectionObserver.instances.length = 0;
    originalIntersectionObserver = window.IntersectionObserver;
    const stub = TestIntersectionObserver as unknown as typeof IntersectionObserver;
    Object.defineProperty(window, 'IntersectionObserver', {value: stub, writable: true});
    Object.defineProperty(globalThis, 'IntersectionObserver', {value: stub, writable: true});

    // The shared setup's resize stub reports on its own the moment a card is
    // observed, which fires the wall's reflow path before a test has placed its
    // cards. This one only reports when asked.
    TestResizeObserver.instances.length = 0;
    originalResizeObserver = window.ResizeObserver;
    const resizeStub = TestResizeObserver as unknown as typeof ResizeObserver;
    Object.defineProperty(window, 'ResizeObserver', {value: resizeStub, writable: true});
    Object.defineProperty(globalThis, 'ResizeObserver', {value: resizeStub, writable: true});

    await TestBed.configureTestingModule({
      imports: [Demos],
      providers: [
        provideNoopAnimations(),
        {provide: DemosCatalog, useClass: MockDemosCatalog},
        {provide: HostCommunication, useClass: MockHostCommunication},
        {provide: StartupResolution, useClass: MockStartupResolution},
        {provide: AppConfigProvider, useValue: {themePreference: signal(ThemePreference.LIGHT)}},
        {provide: ChatState, useClass: MockChatState},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Demos);
    fixture.detectChanges();
    await fixture.whenStable();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, DemosHarness);

    demosCatalogMock = TestBed.inject(DemosCatalog) as unknown as MockDemosCatalog;
    startupResolutionMock = TestBed.inject(StartupResolution) as unknown as MockStartupResolution;
  });

  afterEach(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: originalIntersectionObserver,
      writable: true,
    });
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      value: originalIntersectionObserver,
      writable: true,
    });
    Object.defineProperty(window, 'ResizeObserver', {
      value: originalResizeObserver,
      writable: true,
    });
    Object.defineProperty(globalThis, 'ResizeObserver', {
      value: originalResizeObserver,
      writable: true,
    });
  });

  it('mounts a hidden coordinator frame unconditionally', async () => {
    expect(demosCatalogMock.demos()).toBeNull();

    expect(await harness.hasCoordinatorFrame()).toBe(true);
  });

  it('registers the coordinator frame iframe element with the demos service', async () => {
    const coordinatorIframe = (fixture.nativeElement as HTMLElement).querySelector(
      '.coordinator-frame iframe',
    );

    expect(coordinatorIframe).not.toBeNull();
    expect(demosCatalogMock.setCoordinator).toHaveBeenCalledWith(coordinatorIframe);
  });

  it('activates demos on init and deactivates them when the route is destroyed', () => {
    expect(demosCatalogMock.setDemosActive).toHaveBeenCalledWith(true);

    fixture.destroy();

    expect(demosCatalogMock.setDemosActive).toHaveBeenLastCalledWith(false);
  });

  it('renders one demo card per demo returned by the renderer', async () => {
    demosCatalogMock.demos.set(makeDemos(2));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getCardCount()).toBe(2);
  });

  it('staggers the entrance of every card and caps the cascade at one screenful', async () => {
    demosCatalogMock.demos.set(makeDemos(MAX_MOUNTED_CARDS + 4));
    fixture.detectChanges();
    await fixture.whenStable();

    const steps = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        'a2ui-composer-demo-card',
      ),
    ).map(card => card.style.getPropertyValue('--demo-card-enter-index'));

    // The cascade runs one step per card up to the last position that can share the
    // viewport, then holds: past there the delay would be time nobody is watching,
    // and a reader scrolling down would meet cards still waiting to appear.
    expect(steps.slice(0, MAX_MOUNTED_CARDS)).toEqual(
      Array.from({length: MAX_MOUNTED_CARDS}, (_unused, index) => String(index)),
    );
    expect(steps.slice(MAX_MOUNTED_CARDS)).toEqual(
      Array.from({length: 4}, () => String(MAX_MOUNTED_CARDS - 1)),
    );
  });

  it('creates every card up front, so no entrance can replay on scroll-back', async () => {
    demosCatalogMock.demos.set(makeDemos(MAX_MOUNTED_CARDS + 6));
    fixture.detectChanges();
    await fixture.whenStable();

    const hosts = () =>
      Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('a2ui-composer-demo-card'),
      );
    const before = hosts();

    // Only frames are mounted and unmounted as the reader scrolls; the card elements
    // themselves are created once. That is what makes an entrance animation keyed on
    // element creation unable to replay — there is no second creation to key on.
    expect(before).toHaveLength(MAX_MOUNTED_CARDS + 6);
    expect(await harness.getMountedCardCount()).toBeLessThan(before.length);

    await flushIntersections();

    expect(hosts()).toEqual(before);
  });

  it('renders a card per demo when the renderer reuses an id across two demos', async () => {
    // The wall keys off the shell-assigned track key rather than the
    // renderer's `id`, so two demos sharing an id still reconcile as two
    // independent cards instead of raising NG0955 and collapsing into one.
    demosCatalogMock.demos.set([
      {id: 'chart', trackKey: 'chart', name: 'Chart One', description: 'First', a2ui: []},
      {id: 'chart', trackKey: 'chart#1', name: 'Chart Two', description: 'Second', a2ui: []},
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getCardCount()).toBe(2);
    const cardKeys = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('a2ui-composer-demo-card'),
    ).map(card => card.getAttribute('data-demo-key'));
    expect(cardKeys).toEqual(['chart', 'chart#1']);
  });

  it('shows the empty state when the renderer answers with no demos', async () => {
    demosCatalogMock.demos.set([]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getCardCount()).toBe(0);
    expect(await harness.getEmptyStateSubtitleText()).toContain("doesn't provide demos yet");
  });

  it('names the renderer that answered in the empty state', async () => {
    // Which renderer replied is the whole diagnosis when the wall is empty: a
    // shell talking to a renderer that predates `getDemos` is answered with an
    // empty list and looks identical to a renderer that simply ships no demos.
    startupResolutionMock.resolvedUrl.set('https://example.test/composer/pr/1/samples/ng/');
    demosCatalogMock.demos.set([]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getEmptyStateRendererUrlText()).toBe(
      'https://example.test/composer/pr/1/samples/ng/',
    );
  });

  it('shows the empty state without a renderer line when no URL resolved', async () => {
    startupResolutionMock.resolvedUrl.set(null);
    demosCatalogMock.demos.set([]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getEmptyStateSubtitleText()).toContain("doesn't provide demos yet");
    expect(await harness.getEmptyStateRendererUrlText()).toBeNull();
  });

  it('never mounts more demo cards than the cap, however many are in range', async () => {
    const demoCount = MAX_MOUNTED_CARDS * 3;
    demosCatalogMock.demos.set(makeDemos(demoCount));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    // Every card in the wall reports in range, spread evenly around the reader.
    const offsets: Record<string, number> = {};
    for (let index = 0; index < demoCount; index++) {
      offsets[`demo-${index}`] = index * 100;
    }
    const cards = placeCards(fixture, offsets);
    wallObserver().report(
      Array.from(cards.values()).map(target => ({target, isIntersecting: true})),
    );
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getCardCount()).toBe(demoCount);
    expect(fixture.componentInstance.mountedCount()).toBe(MAX_MOUNTED_CARDS);
    const mountedFrames = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.demos-wall iframe',
    );
    expect(mountedFrames.length).toBe(MAX_MOUNTED_CARDS);
  });

  it('gives a slot to the card the reader scrolled to, taking it from one far away', async () => {
    // The defect this covers: slots used to be filled in document order, so once
    // the earliest cards held them all, a card further down the wall could never
    // mount — not even when the reader had scrolled to it and it was the only
    // thing on screen.
    const demoCount = MAX_MOUNTED_CARDS + 4;
    demosCatalogMock.demos.set(makeDemos(demoCount));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const lateKey = `demo-${demoCount - 1}`;
    expect(fixture.componentInstance.mountedKeys().has(lateKey)).toBe(false);
    const mountedBefore = new Set(fixture.componentInstance.mountedKeys());

    // The reader scrolls the last card to the middle of the viewport; everything
    // holding a slot is now far above it.
    const offsets: Record<string, number> = {[lateKey]: 0};
    for (const key of mountedBefore) {
      offsets[key] = -5000;
    }
    const cards = placeCards(fixture, offsets);
    wallObserver().report([{target: cards.get(lateKey)!, isIntersecting: true}]);
    fixture.detectChanges();
    await fixture.whenStable();

    const mountedAfter = fixture.componentInstance.mountedKeys();
    expect(mountedAfter.has(lateKey)).toBe(true);
    expect(mountedAfter.size).toBe(MAX_MOUNTED_CARDS);
    // Exactly one far-away card gave up its slot; the rest kept theirs.
    const evicted = [...mountedBefore].filter(key => !mountedAfter.has(key));
    expect(evicted.length).toBe(1);
  });

  it('keeps mounted cards when the visible set is unchanged', async () => {
    demosCatalogMock.demos.set(makeDemos(MAX_MOUNTED_CARDS + 4));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const cards = placeCards(fixture, {});
    const entries = Array.from(cards.values()).map(target => ({target, isIntersecting: true}));
    wallObserver().report(entries);
    fixture.detectChanges();
    await fixture.whenStable();
    const settled = fixture.componentInstance.mountedKeys();

    wallObserver().report(entries);
    wallObserver().report(entries);
    fixture.detectChanges();
    await fixture.whenStable();

    // Identity, not equality: an equal set published again would re-render the
    // wall and tear every frame down and back up, which is the churn the reader
    // pays for in a re-measure of every card.
    expect(fixture.componentInstance.mountedKeys()).toBe(settled);
  });

  it('does not hand a slot to a card that is only marginally nearer', async () => {
    const demoCount = MAX_MOUNTED_CARDS + 4;
    demosCatalogMock.demos.set(makeDemos(demoCount));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const mountedBefore = new Set(fixture.componentInstance.mountedKeys());
    const lateKey = `demo-${demoCount - 1}`;

    // Every mounted card sits 300px from the reader and the challenger 150px:
    // nearer, but by less than the hysteresis, so nothing moves. Otherwise two
    // near-equidistant cards would trade one slot on every reflow. All of them are
    // on screen, which is what puts the hysteresis in charge — it damps churn
    // within a visibility class and is not consulted across one.
    const offsets: Record<string, number> = {[lateKey]: 150};
    for (const key of mountedBefore) {
      offsets[key] = -300;
    }
    const cards = placeCards(fixture, offsets);
    wallObserver().report([{target: cards.get(lateKey)!, isIntersecting: true}]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mountedKeys().has(lateKey)).toBe(false);
    expect([...fixture.componentInstance.mountedKeys()]).toEqual([...mountedBefore]);
  });

  it('gives a slot to a card on screen, taking it from one off screen it barely beats', async () => {
    // The defect this covers: ranking was a single centre-to-centre order, so a
    // card the reader could see competed with cards they could not on distance
    // alone — and lost, because the eviction hysteresis is wider than the gap
    // between them. A tall card mostly below the fold is fully on screen with its
    // centre far from the middle of the scroller, which is how the wall came to
    // show blank cards at 501px and 507px while cards at 633px and 685px, both off
    // screen, held slots.
    const demoCount = MAX_MOUNTED_CARDS + 4;
    demosCatalogMock.demos.set(makeDemos(demoCount));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const mountedBefore = new Set(fixture.componentInstance.mountedKeys());
    const onScreenKey = `demo-${demoCount - 1}`;
    expect(mountedBefore.has(onScreenKey)).toBe(false);

    // Every held slot is off screen above the reader; the challenger shows a
    // sliver at the bottom of the viewport and is nearer by only 184px, well
    // inside the 200px hysteresis. Under a distance-only ranking nothing moves and
    // the card the reader is looking at stays blank.
    const offsets: Record<string, number> = {[onScreenKey]: ON_SCREEN_SLIVER_OFFSET};
    for (const key of mountedBefore) {
      offsets[key] = OFF_SCREEN_OFFSET;
    }
    const cards = placeCards(fixture, offsets);
    wallObserver().report([{target: cards.get(onScreenKey)!, isIntersecting: true}]);
    fixture.detectChanges();
    await fixture.whenStable();

    const mountedAfter = fixture.componentInstance.mountedKeys();
    expect(mountedAfter.has(onScreenKey)).toBe(true);
    expect(mountedAfter.size).toBe(MAX_MOUNTED_CARDS);
    // One off-screen card gave up its slot and no more: visibility decides the
    // claim, it does not license a stampede.
    const evicted = [...mountedBefore].filter(key => !mountedAfter.has(key));
    expect(evicted).toHaveLength(1);
  });

  it('never lets a card off screen take the slot of one on screen, however near', async () => {
    // The other half of the same invariant, and the reason the ranking cannot
    // oscillate: visibility outranks distance in both directions. A short card
    // just past the fold can be much nearer the middle of the scroller than a tall
    // card the reader is reading, and must still lose to it.
    const demoCount = MAX_MOUNTED_CARDS + 4;
    demosCatalogMock.demos.set(makeDemos(demoCount));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const mountedBefore = new Set(fixture.componentInstance.mountedKeys());
    const offScreenKey = `demo-${demoCount - 1}`;
    const halfViewport = window.innerHeight / 2;

    // Held slots go to tall cards showing their top edge at the bottom of the
    // viewport, centres 800px out. The challenger is a 40px card just above the
    // fold, 424px out — nearer by 376px, nearly twice the hysteresis, and still
    // not something the reader can see.
    const tallHeight = 900;
    const offsets: Record<string, number> = {[offScreenKey]: -(halfViewport + 40)};
    const heights: Record<string, number> = {[offScreenKey]: 40};
    for (const key of mountedBefore) {
      offsets[key] = 800;
      heights[key] = tallHeight;
    }
    const cards = placeCards(fixture, offsets, heights);
    wallObserver().report([{target: cards.get(offScreenKey)!, isIntersecting: true}]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mountedKeys().has(offScreenKey)).toBe(false);
    expect([...fixture.componentInstance.mountedKeys()]).toEqual([...mountedBefore]);
  });

  it('releases the slot of a card that scrolls out of range', async () => {
    demosCatalogMock.demos.set(makeDemos(MAX_MOUNTED_CARDS + 4));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const cards = placeCards(fixture, {});
    const mountedBefore = [...fixture.componentInstance.mountedKeys()];
    const leaving = mountedBefore[0];
    wallObserver().report([{target: cards.get(leaving)!, isIntersecting: false}]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mountedKeys().has(leaving)).toBe(false);
  });

  it('re-ranks the wall when a reflow moves a card on screen without an entry', async () => {
    // A card that wins a slot boots its frame, commits a measured height and shifts
    // every card below it in its masonry column. Cards already inside the
    // observer's margin cross no boundary as they shift, so no intersection entry
    // is reported and the mount set would otherwise keep describing the layout as
    // it was before the frames it mounted changed it.
    const demoCount = MAX_MOUNTED_CARDS + 4;
    demosCatalogMock.demos.set(makeDemos(demoCount));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    const mountedBefore = new Set(fixture.componentInstance.mountedKeys());
    const arrivingKey = `demo-${demoCount - 1}`;
    expect(mountedBefore.has(arrivingKey)).toBe(false);

    // The reflow puts a card the reader can see where an off-screen one used to be.
    // Nothing reports it, because every one of these cards was already in range.
    const offsets: Record<string, number> = {[arrivingKey]: ON_SCREEN_SLIVER_OFFSET};
    for (const key of mountedBefore) {
      offsets[key] = OFF_SCREEN_OFFSET;
    }
    placeCards(fixture, offsets);

    wallResizeObserver().report();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.mountedKeys().has(arrivingKey)).toBe(true);
  });

  it('shows the loading state while demos are unresolved, before any request is in flight', async () => {
    expect(demosCatalogMock.demos()).toBeNull();
    expect(demosCatalogMock.loadingDemos()).toBe(false);

    expect(await harness.isLoading()).toBe(true);
    expect(await harness.getCardCount()).toBe(0);
    expect(await harness.getEmptyStateSubtitleText()).toBeNull();
  });

  it('broadcasts the theme exactly once when the route mounts', () => {
    const hostCommunicationMock = TestBed.inject(
      HostCommunication,
    ) as unknown as MockHostCommunication;

    expect(hostCommunicationMock.sendTheme).toHaveBeenCalledTimes(1);
  });
});
