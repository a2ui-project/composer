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
  getResolvedRendererUrl = vi.fn(() => 'http://localhost:3000/renderer');
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
 * Pins each card's geometry so proximity ranking is deterministic.
 *
 * jsdom reports every element at the origin with no size, which leaves every card
 * exactly as near the reader as every other; a test that cares which card is
 * nearest has to say where the cards are.
 *
 * @param fixture The wall under test.
 * @param centreOffsets Signed pixel offset of each card's centre from the middle
 *     of the scrolling box, keyed by track key. Cards left out are parked far
 *     away.
 * @return The card host elements, keyed by track key.
 */
function placeCards(
  fixture: ComponentFixture<Demos>,
  centreOffsets: Record<string, number>,
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
    const top = viewportCentre + offset - STUB_CARD_HEIGHT / 2;
    card.getBoundingClientRect = () =>
      ({
        top,
        bottom: top + STUB_CARD_HEIGHT,
        height: STUB_CARD_HEIGHT,
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

describe('Demos Component', () => {
  let fixture: ComponentFixture<Demos>;
  let harness: DemosHarness;
  let demosCatalogMock: MockDemosCatalog;
  let originalIntersectionObserver: typeof IntersectionObserver;

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
    // near-equidistant cards would trade one slot on every reflow.
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
