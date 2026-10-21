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
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal, WritableSignal} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {afterEach, beforeEach, describe, expect, it, MockInstance, vi} from 'vitest';
import {Demo, PreviewBridgeMessageType} from 'a2ui-bridge';
import {DemoCard, DemoCardState} from './demo-card';
import {DemoCardHarness} from './test/demo-card.harness';
import {MEASURE_HEIGHT_PX, READY_TIMEOUT_MS, SIZING_WINDOW_MS} from './demo-card-sizing';
import {MAX_CONTENT_HEIGHT_PX} from '../preview/content-height';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {
  DefaultTarget,
  HostCommunication,
  MessageEnvelope,
} from '../shell/host-communication/host-communication';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {DemoLauncher} from './services/demo-launcher';

const RENDERER_URL = 'http://localhost:3000/renderer';
const RENDERER_ORIGIN = 'http://localhost:3000';

const DEMO: Demo = {
  id: 'weather-summary',
  name: 'Weather Summary',
  description: 'A compact live weather surface.',
  a2ui: [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'surface-weather',
        catalogId: 'catalog-weather',
        sendDataModel: true,
      },
    },
  ],
};

/**
 * Stands in for IntersectionObserver so a test decides when the card is on screen.
 * The card observes its iframe with one observer per frame.
 */
class TestIntersectionObserver {
  static readonly instances: TestIntersectionObserver[] = [];
  readonly targets = new Set<Element>();

  constructor(private readonly callback: IntersectionObserverCallback) {
    TestIntersectionObserver.instances.push(this);
  }

  /** Reports every observed target as on screen or off it. */
  static reportAll(visible: boolean): void {
    for (const observer of TestIntersectionObserver.instances) {
      const entries = [...observer.targets].map(target => ({target, isIntersecting: visible}));
      if (entries.length > 0) {
        observer.callback(
          entries as unknown as IntersectionObserverEntry[],
          observer as unknown as IntersectionObserver,
        );
      }
    }
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

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('DemoCard sandboxed live demo frame', () => {
  let hostCommunication: HostCommunication;
  let sendMessageSpy: MockInstance<HostCommunication['sendMessage']>;
  let resolvedUrlSignal: WritableSignal<string | null>;
  let openInWorkspaceSpy: MockInstance<DemoLauncher['openInWorkspace']>;
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(async () => {
    originalIntersectionObserver = window.IntersectionObserver;
    TestIntersectionObserver.instances.length = 0;
    Object.defineProperty(window, 'IntersectionObserver', {
      value: TestIntersectionObserver,
      writable: true,
    });

    resolvedUrlSignal = signal<string | null>(RENDERER_URL);
    const startupResolutionMock: Partial<StartupResolution> = {
      resolvedUrl: resolvedUrlSignal,
      getResolvedRendererUrl: () => resolvedUrlSignal(),
    };

    await TestBed.configureTestingModule({
      imports: [DemoCard],
      providers: [
        provideNoopAnimations(),
        {provide: StartupResolution, useValue: startupResolutionMock},
        {
          provide: AppConfigProvider,
          useValue: {themePreference: signal<ThemePreference>(ThemePreference.LIGHT)},
        },
      ],
    }).compileComponents();

    openInWorkspaceSpy = vi
      .spyOn(TestBed.inject(DemoLauncher), 'openInWorkspace')
      .mockResolvedValue(undefined);
    hostCommunication = TestBed.inject(HostCommunication);
    sendMessageSpy = vi.spyOn(hostCommunication, 'sendMessage');
  });

  afterEach(() => {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: originalIntersectionObserver,
      writable: true,
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  interface MountedCard {
    fixture: ComponentFixture<DemoCard>;
    harness: DemoCardHarness;
  }

  /** Creates and renders a DemoCard bound to {@link DEMO} with the given mount gate. */
  async function mountCard(mount: boolean): Promise<MountedCard> {
    const fixture = TestBed.createComponent(DemoCard);
    fixture.componentRef.setInput('demo', DEMO);
    fixture.componentRef.setInput('mount', mount);
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, DemoCardHarness);
    return {fixture, harness};
  }

  /** A mounted card the reader can see. */
  async function visibleCard(): Promise<MountedCard> {
    const card = await mountCard(true);
    setVisible(card.fixture, true);
    return card;
  }

  function setVisible(fixture: ComponentFixture<DemoCard>, visible: boolean): void {
    TestIntersectionObserver.reportAll(visible);
    fixture.detectChanges();
  }

  /** The card's renderer iframe element, or null while the card is unmounted. */
  async function frameOf(harness: DemoCardHarness): Promise<HTMLIFrameElement | null> {
    const iframe = await harness.getIframe();
    return iframe
      ? (TestbedHarnessEnvironment.getNativeElement(iframe) as HTMLIFrameElement)
      : null;
  }

  async function surfaceOf(harness: DemoCardHarness): Promise<HTMLElement> {
    return TestbedHarnessEnvironment.getNativeElement(await harness.getSurface()) as HTMLElement;
  }

  /** Runs the card's timers forward and lets the resulting signal writes render. */
  function advance(fixture: ComponentFixture<DemoCard>, ms: number): void {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  /**
   * Simulates a bridge message dispatched by the card's own renderer frame. Pass
   * `render: false` to deliver several in one tick, without change detection between.
   */
  function emitFrom(
    fixture: ComponentFixture<DemoCard>,
    iframe: HTMLIFrameElement,
    type: PreviewBridgeMessageType,
    payload?: unknown,
    {render = true} = {},
  ): void {
    const envelope: MessageEnvelope = {
      type,
      payload,
      origin: RENDERER_ORIGIN,
      timestamp: Date.now(),
      sourceWindow: iframe.contentWindow,
    };
    hostCommunication.TEST_ONLY.triggerMessageStreamForTesting(envelope);
    if (render) fixture.detectChanges();
  }

  function resize(
    fixture: ComponentFixture<DemoCard>,
    iframe: HTMLIFrameElement,
    payload: {height: number; width?: number; viewportWidth?: number; contentReady?: boolean},
    options?: {render?: boolean},
  ): void {
    emitFrom(
      fixture,
      iframe,
      PreviewBridgeMessageType.SURFACE_RESIZE,
      {width: 480, ...payload},
      options,
    );
  }

  it('keeps the full description reachable while the card shows one truncated line', async () => {
    const {harness} = await mountCard(true);

    // Truncation is a stylesheet concern (white-space/text-overflow), never a binding
    // one: the whole description stays in the DOM so assistive technology still reads
    // it, and the native title attribute puts it back within a sighted reader's reach.
    expect(await harness.getSubtitleText()).toBe(DEMO.description);
    expect(await harness.getSubtitleTitle()).toBe(DEMO.description);
  });

  it('names the demo in the accessible name of its open control', async () => {
    const {harness} = await mountCard(true);

    // The accessible name tells a screen reader which demo this control opens.
    expect(await harness.getOpenButtonText()).toContain('Open');
    expect(await harness.getOpenButtonLabel()).toBe(`Open in Composer: ${DEMO.name}`);
  });

  it('sends its own demo to the workspace when the open control is activated', async () => {
    const {harness} = await mountCard(true);

    await harness.clickOpenButton();

    expect(openInWorkspaceSpy).toHaveBeenCalledTimes(1);
    expect(openInWorkspaceSpy).toHaveBeenCalledWith(DEMO);
  });

  it('keeps the open control available to keyboard users', async () => {
    const {harness} = await mountCard(true);

    expect(await harness.isOpenButtonFocusable()).toBe(true);
  });

  it('places the open control ahead of the demo frame in the tab order', async () => {
    const {harness} = await mountCard(true);

    // A keyboard reader must arrive at "Open" on the way into a card rather than after
    // traversing every focusable element the live demo contains.
    expect(await harness.isOpenButtonBeforeFrame()).toBe(true);
  });

  it('renders no iframe while the card is not mounted', async () => {
    const {fixture, harness} = await mountCard(false);

    expect(await harness.getIframe()).toBeNull();
    expect(fixture.componentInstance.state()).toBe(DemoCardState.IDLE);
  });

  it('renders the sandboxed iframe once the card is mounted', async () => {
    const {harness} = await mountCard(true);

    const iframe = await harness.getIframe();
    expect(iframe).not.toBeNull();
    expect(await iframe!.getAttribute('sandbox')).toBe(
      'allow-scripts allow-same-origin allow-forms',
    );
    expect(await iframe!.getAttribute('src')).toContain('/renderer');
  });

  it('sends the demo payload exactly once after its own frame reports ready', async () => {
    const {fixture, harness} = await mountCard(true);
    const iframe = (await frameOf(harness))!;
    sendMessageSpy.mockClear();

    // React renderers under StrictMode genuinely announce readiness twice, so two
    // handshakes with no intervening frame load must still collapse to a single send.
    emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
    emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});

    // The payload is addressed to this card's own frame. Sent without a target it
    // would go to the default target instead, which is never a card.
    expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    expect(sendMessageSpy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui},
      iframe,
    );
    expect(fixture.componentInstance.state()).toBe(DemoCardState.READY);
  });

  it('posts the demo payload to its own frame as soon as that frame announces itself', async () => {
    const {fixture, harness} = await mountCard(true);
    const iframe = (await frameOf(harness))!;
    const guestWindow = iframe.contentWindow!;
    const postMessageSpy = vi.spyOn(guestWindow, 'postMessage').mockImplementation(() => {});

    // A real handshake through HostCommunication's message listener, rather than an
    // envelope injected into its stream: the listener marks the frame ready before
    // the card sees the envelope, so the payload is posted rather than queued.
    window.dispatchEvent(
      new MessageEvent('message', {
        source: guestWindow,
        origin: RENDERER_ORIGIN,
        data: {type: PreviewBridgeMessageType.RENDERER_READY},
      }),
    );
    fixture.detectChanges();

    const renderCalls = postMessageSpy.mock.calls.filter(
      ([message]) => (message as {type?: string}).type === PreviewBridgeMessageType.RENDER_A2UI,
    );
    expect(renderCalls).toEqual([
      [{type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui}, RENDERER_ORIGIN],
    ]);
  });

  it('resends the demo payload after its own frame reloads', async () => {
    const {fixture, harness} = await mountCard(true);
    const iframe = (await frameOf(harness))!;
    sendMessageSpy.mockClear();

    emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
    expect(sendMessageSpy).toHaveBeenCalledTimes(1);

    // Switching renderers in Settings changes resolvedUrl(), which changes the frame's
    // src and reloads it, so a freshly booted guest announces RENDERER_READY again.
    // contentWindow keeps a stable WindowProxy identity across the frame's own
    // navigations, so dedup keyed on that identity suppresses the resend and strands the
    // card on the renderer's idle placeholder. Sent state must be per frame load.
    await harness.simulateFrameLoad();
    emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});

    expect(sendMessageSpy).toHaveBeenCalledTimes(2);
    expect(sendMessageSpy).toHaveBeenNthCalledWith(
      1,
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui},
      iframe,
    );
    expect(sendMessageSpy).toHaveBeenNthCalledWith(
      2,
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui},
      iframe,
    );
    expect(fixture.componentInstance.state()).toBe(DemoCardState.READY);
  });

  describe('sizing', () => {
    beforeEach(() => {
      vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
    });

    it('holds the frame under a placeholder, then commits the first ready report', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;
      expect(await harness.isMeasured()).toBe(false);
      expect(await harness.isPlaceholderShown()).toBe(true);

      resize(fixture, iframe, {height: 166, contentReady: false});
      expect(fixture.componentInstance.cardHeight()).toBeNull();

      resize(fixture, iframe, {height: 240, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(240);
      expect(await harness.isMeasured()).toBe(true);
      expect(await harness.getSurfaceHeightPx()).toBe(240);
      expect(await harness.isPlaceholderShown()).toBe(false);
    });

    it('locks the committed height against later reports', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;
      resize(fixture, iframe, {height: 228, contentReady: true});

      // A late image or an expanded section scrolls inside the card instead.
      resize(fixture, iframe, {height: 395, contentReady: true});
      resize(fixture, iframe, {height: 120, contentReady: true});
      advance(fixture, READY_TIMEOUT_MS);

      expect(fixture.componentInstance.cardHeight()).toBe(228);
      expect(await harness.getSurfaceHeightPx()).toBe(228);
    });

    it('never commits a report at or below the measuring height', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;

      resize(fixture, iframe, {height: MEASURE_HEIGHT_PX, contentReady: true});

      expect(fixture.componentInstance.cardHeight()).toBeNull();
      expect(await harness.getSurfaceHeightPx()).toBeNull();
      expect(await harness.isMeasured()).toBe(false);
    });

    it('commits a burst of reports delivered in one tick at the first ready height', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;

      resize(fixture, iframe, {height: 166, contentReady: false}, {render: false});
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDER_SUCCESS, undefined, {
        render: false,
      });
      resize(fixture, iframe, {height: 300, contentReady: true}, {render: false});
      resize(fixture, iframe, {height: 320, contentReady: true}, {render: false});
      fixture.detectChanges();

      expect(fixture.componentInstance.cardHeight()).toBe(300);
    });

    it('waits until it is visible, then commits the latest report after a short window', async () => {
      const {fixture, harness} = await mountCard(true);
      const iframe = (await frameOf(harness))!;

      // Chrome doesn't render a cross-origin frame that is out of view, so this report
      // can describe content the frame hasn't finished laying out.
      resize(fixture, iframe, {height: 240, contentReady: true});
      advance(fixture, READY_TIMEOUT_MS);
      expect(fixture.componentInstance.cardHeight()).toBeNull();
      expect(fixture.componentInstance.state()).not.toBe(DemoCardState.ERROR);

      setVisible(fixture, true);
      resize(fixture, iframe, {height: 310, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBeNull();

      advance(fixture, SIZING_WINDOW_MS.becameVisible);
      expect(fixture.componentInstance.cardHeight()).toBe(310);
      expect(await harness.isPlaceholderShown()).toBe(false);
    });

    it('commits an older bridge once its reports after RENDER_SUCCESS settle', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;

      resize(fixture, iframe, {height: 166});
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDER_SUCCESS);
      resize(fixture, iframe, {height: 300});
      expect(fixture.componentInstance.cardHeight()).toBeNull();

      advance(fixture, SIZING_WINDOW_MS.legacySettling);
      expect(fixture.componentInstance.cardHeight()).toBe(300);
    });

    it('shows an error instead of committing after RENDER_ERROR', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;

      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDER_ERROR);
      // The guest's error overlay still reports readiness; it must not set the height.
      resize(fixture, iframe, {height: 48, contentReady: true});

      expect(fixture.componentInstance.state()).toBe(DemoCardState.ERROR);
      expect(fixture.componentInstance.cardHeight()).toBeNull();
      expect(await harness.isErrorShown()).toBe(true);
    });

    it('enters the error state when no ready handshake arrives in time', async () => {
      const {fixture} = await visibleCard();
      expect(fixture.componentInstance.state()).toBe(DemoCardState.MOUNTING);

      advance(fixture, READY_TIMEOUT_MS);

      expect(fixture.componentInstance.state()).toBe(DemoCardState.ERROR);
    });

    it('recovers from a timeout when the demo renders after all', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
      resize(fixture, iframe, {height: 166, contentReady: false});
      advance(fixture, READY_TIMEOUT_MS);
      expect(fixture.componentInstance.state()).toBe(DemoCardState.ERROR);

      resize(fixture, iframe, {height: 250, contentReady: true});
      expect(fixture.componentInstance.state()).toBe(DemoCardState.READY);
      expect(await harness.isPlaceholderShown()).toBe(false);
    });

    it('keeps its height when the wall remounts its frame', async () => {
      const {fixture, harness} = await visibleCard();
      resize(fixture, (await frameOf(harness))!, {height: 304, contentReady: true});

      fixture.componentRef.setInput('mount', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('mount', true);
      fixture.detectChanges();
      const iframe = (await frameOf(harness))!;

      // The new frame shows the renderer's startup screen under the placeholder.
      expect(await harness.isPlaceholderShown()).toBe(true);
      expect(await harness.getSurfaceHeightPx()).toBe(304);

      resize(fixture, iframe, {height: 166, contentReady: false});
      resize(fixture, iframe, {height: 388, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(304);
      expect(await harness.isPlaceholderShown()).toBe(false);
    });

    it('drops its height and restarts the ready deadline when the renderer changes underneath it', async () => {
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
      resize(fixture, iframe, {height: 420, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(420);
      expect(fixture.componentInstance.state()).toBe(DemoCardState.READY);

      // A different renderer lays the same demo out differently, so the old height is
      // not evidence about the new one, and the new renderer gets its own ready deadline.
      resolvedUrlSignal.set('http://localhost:3000/other-renderer');
      fixture.detectChanges();

      expect(fixture.componentInstance.cardHeight()).toBeNull();
      expect(await harness.isMeasured()).toBe(false);
      expect(fixture.componentInstance.state()).toBe(DemoCardState.MOUNTING);

      advance(fixture, READY_TIMEOUT_MS);
      expect(fixture.componentInstance.state()).toBe(DemoCardState.ERROR);
    });

    it('arms no ready timeout on a committed card after a repeat handshake or remount', async () => {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const {fixture, harness} = await visibleCard();
      const iframe = (await frameOf(harness))!;
      setTimeoutSpy.mockClear();
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
      const readyCallIndex = setTimeoutSpy.mock.calls.findIndex(
        ([, ms]) => ms === READY_TIMEOUT_MS,
      );
      const readyTimerId = setTimeoutSpy.mock.results[readyCallIndex]?.value;
      expect(readyTimerId).toBeDefined();

      clearTimeoutSpy.mockClear();
      resize(fixture, iframe, {height: 304, contentReady: true});
      expect(clearTimeoutSpy).toHaveBeenCalledWith(readyTimerId);

      setTimeoutSpy.mockClear();
      // A guest reload or repeat handshake after commit must not arm a ready timeout.
      await harness.simulateFrameLoad();
      emitFrom(fixture, iframe, PreviewBridgeMessageType.RENDERER_READY, {});
      expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), READY_TIMEOUT_MS);

      // Closing the mount gate returns the handshake state to IDLE, and reopening it
      // on an already-committed card needs no ready timeout.
      fixture.componentRef.setInput('mount', false);
      fixture.detectChanges();
      expect(fixture.componentInstance.state()).toBe(DemoCardState.IDLE);

      fixture.componentRef.setInput('mount', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.state()).toBe(DemoCardState.MOUNTING);
      expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), READY_TIMEOUT_MS);
    });

    it('caps the committed height and publishes the cap to the stylesheet', async () => {
      const {fixture, harness} = await visibleCard();

      resize(fixture, (await frameOf(harness))!, {height: 9000, contentReady: true});

      // The frame is a real viewport, so the demo keeps its full height and scrolls
      // inside the card instead of dominating a column.
      expect(fixture.componentInstance.cardHeight()).toBe(MAX_CONTENT_HEIGHT_PX);
      expect(await harness.getMaxHeight()).toBe(`${MAX_CONTENT_HEIGHT_PX}px`);
      expect(await harness.getMeasureHeight()).toBe(`${MEASURE_HEIGHT_PX}px`);
    });

    it('publishes the preview scale to the stylesheet instead of restating it there', async () => {
      const {harness} = await mountCard(true);

      // demo-card.scss reads --demo-preview-scale for the frame's transform and for the
      // calc() that compensates its layout box. If this binding ever stopped landing, the
      // stylesheet's `1` fallback would silently return the wall to an unscaled layout
      // while surfaceHeight() went on dividing.
      expect(await harness.getPreviewScale()).toBe('1');
    });

    it('fits overflowing content and asks for a wider card without reloading the frame', async () => {
      const {fixture, harness} = await visibleCard();
      const frame = (await frameOf(harness))!;
      const surface = await surfaceOf(harness);
      vi.spyOn(frame, 'clientWidth', 'get').mockReturnValue(400);
      vi.spyOn(surface, 'clientWidth', 'get').mockReturnValue(400);

      resize(fixture, frame, {height: 500, width: 800, contentReady: true});
      expect(await harness.getPreviewScale()).toBe('0.5');
      expect(fixture.componentInstance.minimumCardWidth()).toBe(800);

      // Widened to 800px, the demo fits, and the card commits the height it has there.
      vi.spyOn(frame, 'clientWidth', 'get').mockReturnValue(800);
      resize(fixture, frame, {height: 460, width: 800, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(460);
      expect(await harness.getSurfaceHeightPx()).toBe(230);
      expect(await frameOf(harness)).toBe(frame);

      resolvedUrlSignal.set('http://localhost:3000/other-renderer');
      fixture.detectChanges();
      expect(fixture.componentInstance.minimumCardWidth()).toBe(0);
    });

    it('compares content width with the viewport at measurement time', async () => {
      const {fixture, harness} = await visibleCard();
      const frame = (await frameOf(harness))!;
      vi.spyOn(frame, 'clientWidth', 'get').mockReturnValue(1124);
      vi.spyOn(await surfaceOf(harness), 'clientWidth', 'get').mockReturnValue(1124);

      resize(fixture, frame, {height: 300, width: 1230, viewportWidth: 1230, contentReady: true});

      expect(fixture.componentInstance.minimumCardWidth()).toBe(0);
      expect(await harness.getPreviewScale()).toBe('1');
    });

    it('accepts one fresh commit when the wall gives it a different width', async () => {
      const {fixture, harness} = await visibleCard();
      const frame = (await frameOf(harness))!;
      const surface = await surfaceOf(harness);
      const surfaceWidth = vi.spyOn(surface, 'clientWidth', 'get').mockReturnValue(445);
      resize(fixture, frame, {height: 241, width: 445, viewportWidth: 445, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(241);

      surfaceWidth.mockReturnValue(639);
      resize(fixture, frame, {height: 217, width: 639, viewportWidth: 639, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(217);

      resize(fixture, frame, {height: 300, width: 639, viewportWidth: 700, contentReady: true});
      expect(fixture.componentInstance.cardHeight()).toBe(217);
    });
  });

  it('registers its frame without taking over the default target', async () => {
    const coordinatorWindow = {postMessage: vi.fn()} as unknown as Window;
    const coordinator = {contentWindow: coordinatorWindow} as unknown as HTMLIFrameElement;
    hostCommunication.registerIframe(coordinator);
    const registerIframeSpy = vi.spyOn(hostCommunication, 'registerIframe');

    const {harness} = await mountCard(true);
    const iframe = await frameOf(harness);

    // The default target is the frame that untargeted messages go to, such as the
    // GET_CATALOG that CatalogManagement sends on every frame's handshake. On the demos
    // page that has to stay the coordinator, however many cards mount after it.
    expect(iframe).not.toBeNull();
    expect(registerIframeSpy).toHaveBeenCalledWith(iframe, DefaultTarget.KEEP);
    expect(hostCommunication.getIframeElement()).toBe(coordinator);
  });

  it('unregisters its iframe when the mount gate closes', async () => {
    const unregisterSpy = vi.spyOn(hostCommunication, 'unregisterIframe');
    const {fixture, harness} = await mountCard(true);
    const iframe = await frameOf(harness);
    expect(iframe).not.toBeNull();

    fixture.componentRef.setInput('mount', false);
    fixture.detectChanges();

    // A frame left registered would keep being accepted as a message source, keep
    // receiving theme changes, and keep its readiness after the card let it go.
    expect(unregisterSpy).toHaveBeenCalledWith(iframe);
  });

  it('unregisters its iframe when the card is destroyed', async () => {
    const unregisterSpy = vi.spyOn(hostCommunication, 'unregisterIframe');
    const {fixture, harness} = await mountCard(true);
    const iframe = await frameOf(harness);
    expect(iframe).not.toBeNull();

    fixture.destroy();

    expect(unregisterSpy).toHaveBeenCalledWith(iframe);
  });

  it('ignores envelopes for message types it does not act on and envelopes from foreign windows', async () => {
    const {fixture, harness} = await visibleCard();
    const iframe = (await frameOf(harness))!;
    sendMessageSpy.mockClear();

    // Most demos set sendDataModel: true, so cards constantly receive
    // DATA_MODEL_CHANGE echoes from their own frame that this page has no use for.
    emitFrom(fixture, iframe, PreviewBridgeMessageType.DATA_MODEL_CHANGE, {
      updateDataModel: {surfaceId: 'surface-weather'},
    });

    // A SURFACE_RESIZE dispatched by some other window entirely must also be ignored,
    // even though the type is one this card otherwise acts on.
    const foreignEnvelope: MessageEnvelope = {
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 320, width: 480, contentReady: true},
      origin: RENDERER_ORIGIN,
      timestamp: Date.now(),
      sourceWindow: {} as Window,
    };
    hostCommunication.TEST_ONLY.triggerMessageStreamForTesting(foreignEnvelope);
    fixture.detectChanges();

    expect(fixture.componentInstance.cardHeight()).toBeNull();
    expect(sendMessageSpy).not.toHaveBeenCalled();
  });
});
