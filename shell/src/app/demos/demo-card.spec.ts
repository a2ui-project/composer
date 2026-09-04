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
import {signal, WritableSignal} from '@angular/core';
import {afterEach, beforeEach, describe, expect, it, MockInstance, vi} from 'vitest';
import {Demo, PreviewBridgeMessageType} from 'a2ui-bridge';
import {DemoCard} from './demo-card';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {HostCommunication, MessageEnvelope} from '../shell/host-communication/host-communication';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';

const RENDERER_URL = 'http://localhost:3000/renderer';
const RENDERER_ORIGIN = 'http://localhost:3000';

/** Ready handshake grace period the card allows before failing the demo closed. */
const READY_TIMEOUT_MS = 8000;

/**
 * Height the frame is held at until a measurement commits, mirroring MEASURE_HEIGHT_PX
 * in demo-card.ts. Reports at or below it are the frame measuring itself.
 */
const MEASURE_HEIGHT_PX = 32;

/** Measurement window a newly attached frame gets, mirroring MEASURE_SETTLE_MS. */
const MEASURE_SETTLE_MS = 1000;

/** Quiet period that ends a committed card's growth phase, mirroring GROWTH_SETTLE_MS. */
const GROWTH_SETTLE_MS = 8000;

/** Upper bound on a committed height, mirroring MAX_CARD_HEIGHT_PX. */
const MAX_CARD_HEIGHT_PX = 560;

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

describe('DemoCard sandboxed live demo frame', () => {
  let hostCommunication: HostCommunication;
  let sendToFrameSpy: MockInstance<HostCommunication['sendToFrame']>;
  let sendMessageSpy: MockInstance<HostCommunication['sendMessage']>;
  let resolvedUrlSignal: WritableSignal<string | null>;

  beforeEach(async () => {
    resolvedUrlSignal = signal<string | null>(RENDERER_URL);
    const startupResolutionMock: Partial<StartupResolution> = {
      resolvedUrl: resolvedUrlSignal,
      getResolvedRendererUrl: () => resolvedUrlSignal(),
    };

    await TestBed.configureTestingModule({
      imports: [DemoCard],
      providers: [
        {provide: StartupResolution, useValue: startupResolutionMock},
        {
          provide: AppConfigProvider,
          useValue: {themePreference: signal<ThemePreference>(ThemePreference.LIGHT)},
        },
      ],
    }).compileComponents();

    hostCommunication = TestBed.inject(HostCommunication);
    sendToFrameSpy = vi.spyOn(hostCommunication, 'sendToFrame');
    sendMessageSpy = vi.spyOn(hostCommunication, 'sendMessage');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Creates and renders a DemoCard bound to {@link DEMO} with the given mount gate. */
  function mountCard(mount: boolean): ComponentFixture<DemoCard> {
    const fixture = TestBed.createComponent(DemoCard);
    fixture.componentRef.setInput('demo', DEMO);
    fixture.componentRef.setInput('mount', mount);
    fixture.detectChanges();
    return fixture;
  }

  /** Reads the card's renderer iframe element, or null while the card is unmounted. */
  function frameOf(fixture: ComponentFixture<DemoCard>): HTMLIFrameElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('iframe');
  }

  /** Reads the card's measured surface element. */
  function surfaceOf(fixture: ComponentFixture<DemoCard>): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelector('.demo-card-surface')!;
  }

  /** Reads the card's loading placeholder, or null once a height has been committed. */
  function placeholderOf(fixture: ComponentFixture<DemoCard>): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('.demo-card-placeholder');
  }

  /** Runs the card's height timers forward and lets the resulting signal writes render. */
  function advance(fixture: ComponentFixture<DemoCard>, ms: number): void {
    vi.advanceTimersByTime(ms);
    fixture.detectChanges();
  }

  /** Simulates a bridge message dispatched by this card's own renderer frame. */
  function emitFromCard(
    fixture: ComponentFixture<DemoCard>,
    type: PreviewBridgeMessageType,
    payload?: unknown,
  ): void {
    const iframe = frameOf(fixture);
    expect(iframe).not.toBeNull();
    const envelope: MessageEnvelope = {
      type,
      payload,
      origin: RENDERER_ORIGIN,
      timestamp: Date.now(),
      sourceWindow: iframe!.contentWindow,
    };
    hostCommunication.TEST_ONLY.triggerMessageStreamForTesting(envelope);
    fixture.detectChanges();
  }

  it('keeps the full description reachable while the card shows one truncated line', () => {
    const fixture = mountCard(true);
    const subtitle = (fixture.nativeElement as HTMLElement).querySelector('.demo-card-subtitle')!;

    // Truncation is a stylesheet concern (white-space/text-overflow), never a binding
    // one: the whole description stays in the DOM so assistive technology still reads
    // it, and the native title attribute puts it back within a sighted reader's reach.
    expect(subtitle.textContent!.trim()).toBe(DEMO.description);
    expect(subtitle.getAttribute('title')).toBe(DEMO.description);
  });

  it('renders no iframe while the card is not mounted', () => {
    const fixture = mountCard(false);

    expect(frameOf(fixture)).toBeNull();
    expect(fixture.componentInstance.state()).toBe('idle');
  });

  it('renders the sandboxed iframe once the card is mounted', () => {
    const fixture = mountCard(true);

    const iframe = frameOf(fixture);
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin allow-forms');
    expect(iframe!.getAttribute('src')).toContain('/renderer');
  });

  it('sends the demo payload exactly once after its own frame reports ready', () => {
    const fixture = mountCard(true);
    const iframe = frameOf(fixture)!;
    sendToFrameSpy.mockClear();

    // React renderers under StrictMode genuinely announce readiness twice, so two
    // handshakes with no intervening frame load must still collapse to a single send.
    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});
    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});

    expect(sendToFrameSpy).toHaveBeenCalledTimes(1);
    expect(sendToFrameSpy).toHaveBeenCalledWith(
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui},
      iframe,
    );
    // Targeted sends to this card's own frame must go through sendToFrame; sendMessage
    // broadcasts to every registered iframe and would leak this card's payload to others.
    expect(sendMessageSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.state()).toBe('ready');
  });

  it('resends the demo payload after its own frame reloads', () => {
    const fixture = mountCard(true);
    const iframe = frameOf(fixture)!;
    sendToFrameSpy.mockClear();

    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});
    expect(sendToFrameSpy).toHaveBeenCalledTimes(1);

    // Switching renderers in Settings changes resolvedUrl(), which changes the frame's
    // src and reloads it, so a freshly booted guest announces RENDERER_READY again.
    // contentWindow keeps a stable WindowProxy identity across the frame's own
    // navigations, so dedup keyed on that identity suppresses the resend and strands the
    // card on the renderer's idle placeholder. Sent state must be per frame load.
    iframe.dispatchEvent(new Event('load'));
    fixture.detectChanges();
    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});

    expect(sendToFrameSpy).toHaveBeenCalledTimes(2);
    expect(sendToFrameSpy).toHaveBeenNthCalledWith(
      1,
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui},
      iframe,
    );
    expect(sendToFrameSpy).toHaveBeenNthCalledWith(
      2,
      {type: PreviewBridgeMessageType.RENDER_A2UI, payload: DEMO.a2ui},
      iframe,
    );
    expect(fixture.componentInstance.state()).toBe('ready');
  });

  it('commits the last height reported inside the measurement window, not the first', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    // The renderer paints its own "waiting for a payload" screen before the demo mounts,
    // so the first report above the floor measures that screen and not this demo. Against
    // the Angular sample it is 166px, taller than seven of the catalog's demos: committing
    // it on sight would leave each of them at the idle screen's height, and unable to
    // recover, because sizing the frame to a committed height floors every later report at
    // it and makes the shrink to the real content unobservable.
    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 166, width: 480});
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 56, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBeNull();

    advance(fixture, MEASURE_SETTLE_MS);

    expect(fixture.componentInstance.cardHeight()).toBe(56);
  });

  it('never commits a report at or below the height the frame is measured at', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    // preview-bridge dispatches RENDERER_READY and a SURFACE_RESIZE back to back, so the
    // first report measures an empty document, whose scrollHeight is nothing but the
    // frame's own CSS height (--demo-card-measure-h). It is the measurement floor rather
    // than evidence that anything rendered, and committing it pinned every card in the
    // wall to one height and clipped its demo under .demo-card-surface { overflow: hidden }.
    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {
      height: MEASURE_HEIGHT_PX,
      width: 480,
    });
    advance(fixture, MEASURE_SETTLE_MS);

    // Nothing committed, so the surface is still governed by its placeholder height and
    // the frame is still short enough to measure the demo that has yet to arrive.
    expect(fixture.componentInstance.cardHeight()).toBeNull();
    expect(surfaceOf(fixture).style.height).toBe('');
    expect(surfaceOf(fixture).classList.contains('is-measured')).toBe(false);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 420, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);

    expect(fixture.componentInstance.cardHeight()).toBe(420);
  });

  it('holds the frame at the measuring height under a placeholder until it commits', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    // Sizing the frame to the card is what floors the guest's measurement, so a card that
    // has not measured yet keeps its frame short and hides it behind the placeholder.
    expect(surfaceOf(fixture).classList.contains('is-measured')).toBe(false);
    expect(placeholderOf(fixture)).not.toBeNull();

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 240, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);

    expect(surfaceOf(fixture).classList.contains('is-measured')).toBe(true);
    expect(surfaceOf(fixture).style.height).toBe('240px');
    expect(placeholderOf(fixture)).toBeNull();
  });

  it('keeps growing after the window closes but never shrinks', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 228, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);
    expect(fixture.componentInstance.cardHeight()).toBe(228);

    // A late image decode genuinely enlarges the demo, and the card has to follow it or
    // it cuts through the content it just grew.
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 395, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(395);

    // A smaller report is not news: the frame is 395px tall, so the guest's
    // documentElement.scrollHeight cannot come back below that, and anything that does is
    // a stale measurement. Following it down would make the card oscillate.
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 300, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(395);
  });

  it('stops following its frame once the reports have gone quiet', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 320, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);
    expect(fixture.componentInstance.cardHeight()).toBe(320);

    advance(fixture, GROWTH_SETTLE_MS);

    // Past the settle window the masonry columns are stable and the reader is looking at
    // them, so a demo that reflows itself must no longer move the wall.
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 500, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(320);
  });

  it('measures the demo again when the wall remounts its frame', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 304, width: 480});
    advance(fixture, MEASURE_SETTLE_MS + GROWTH_SETTLE_MS);
    expect(fixture.componentInstance.cardHeight()).toBe(304);

    // The wall drops a card's frame once it is more than a viewport away and gives it a
    // new one on the way back. A first pass that caught a partial render would otherwise
    // be permanent, so each frame gets its own measurement window.
    fixture.componentRef.setInput('mount', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('mount', true);
    fixture.detectChanges();

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 388, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);

    expect(fixture.componentInstance.cardHeight()).toBe(388);
  });

  it('clamps an out-of-range reported height into the card bounds', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 9000, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);

    // Clamped rather than honoured: the frame is a real viewport, so the demo keeps its
    // full height and scrolls inside the card instead of dominating a masonry column.
    expect(fixture.componentInstance.cardHeight()).toBe(MAX_CARD_HEIGHT_PX);
  });

  it('drops its measurement when the renderer changes underneath it', () => {
    vi.useFakeTimers();
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 420, width: 480});
    advance(fixture, MEASURE_SETTLE_MS);
    expect(fixture.componentInstance.cardHeight()).toBe(420);

    // A different renderer lays the same demo out differently, so the old height is not
    // evidence about the new one — and keeping it would floor the new guest's reports at
    // a height it never measured.
    resolvedUrlSignal.set('http://localhost:3000/other-renderer');
    fixture.detectChanges();

    expect(fixture.componentInstance.cardHeight()).toBeNull();
    expect(surfaceOf(fixture).classList.contains('is-measured')).toBe(false);
  });

  it('enters the error state when no ready handshake arrives in time', () => {
    vi.useFakeTimers();

    const fixture = mountCard(true);
    expect(fixture.componentInstance.state()).toBe('mounting');

    vi.advanceTimersByTime(READY_TIMEOUT_MS);
    fixture.detectChanges();

    expect(fixture.componentInstance.state()).toBe('error');
  });

  it('registers as a secondary consumer and never claims the primary iframe slot', () => {
    const registerSecondarySpy = vi.spyOn(hostCommunication, 'registerSecondaryIframe');
    const registerIframeSpy = vi.spyOn(hostCommunication, 'registerIframe');

    const fixture = mountCard(true);
    const iframe = frameOf(fixture);

    // registerIframe clears the shared outboundMessageBuffer and resets the global
    // isRendererReadySignal on every call, which would wipe in-flight sends for every
    // other consumer in the app when a card lazily mounts. Cards must only ever use
    // registerSecondaryIframe, which performs neither reset.
    expect(iframe).not.toBeNull();
    expect(registerSecondarySpy).toHaveBeenCalledWith(iframe);
    expect(registerIframeSpy).not.toHaveBeenCalled();
  });

  it('unregisters its iframe when the mount gate closes', () => {
    const unregisterSecondarySpy = vi.spyOn(hostCommunication, 'unregisterSecondaryIframe');
    const fixture = mountCard(true);
    const iframe = frameOf(fixture);
    expect(iframe).not.toBeNull();

    fixture.componentRef.setInput('mount', false);
    fixture.detectChanges();

    // A leaked entry in registeredIframes would silently widen matchesSource's
    // acceptance check and the sendTheme broadcast fan-out for every other consumer.
    expect(unregisterSecondarySpy).toHaveBeenCalledWith(iframe);
  });

  it('unregisters its iframe when the card is destroyed', () => {
    const unregisterSecondarySpy = vi.spyOn(hostCommunication, 'unregisterSecondaryIframe');
    const fixture = mountCard(true);
    const iframe = frameOf(fixture);
    expect(iframe).not.toBeNull();

    fixture.destroy();

    expect(unregisterSecondarySpy).toHaveBeenCalledWith(iframe);
  });

  it('ignores envelopes for message types it does not act on and envelopes from foreign windows', () => {
    const fixture = mountCard(true);
    sendToFrameSpy.mockClear();

    // 37 of the 43 demos set sendDataModel: true, so cards constantly receive
    // DATA_MODEL_CHANGE echoes from their own frame that this page has no use for.
    emitFromCard(fixture, PreviewBridgeMessageType.DATA_MODEL_CHANGE, {
      updateDataModel: {surfaceId: 'surface-weather'},
    });

    // A SURFACE_RESIZE dispatched by some other window entirely must also be ignored,
    // even though the type is one this card otherwise acts on.
    const foreignEnvelope: MessageEnvelope = {
      type: PreviewBridgeMessageType.SURFACE_RESIZE,
      payload: {height: 320, width: 480},
      origin: RENDERER_ORIGIN,
      timestamp: Date.now(),
      sourceWindow: {} as Window,
    };
    hostCommunication.TEST_ONLY.triggerMessageStreamForTesting(foreignEnvelope);
    fixture.detectChanges();

    expect(fixture.componentInstance.cardHeight()).toBeNull();
    expect(sendToFrameSpy).not.toHaveBeenCalled();
  });
});
