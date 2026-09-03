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

  it('freezes its height after the first surface resize report', () => {
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 320, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(320);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 500, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(320);
  });

  it('adopts the first rendered height instead of the guest bridge pre-render report', () => {
    const fixture = mountCard(true);

    // preview-bridge dispatches RENDERER_READY and a SURFACE_RESIZE back to back, so the
    // first report measures an empty document whose scrollHeight is the iframe's own CSS
    // height (--demo-card-min-h, 200px). Freezing on it pinned every card in the wall to
    // the minimum and clipped the demo under .demo-card-surface { overflow: hidden }.
    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 200, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(200);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 420, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(420);
  });

  it('freezes once a rendered height has been adopted after a pre-render report', () => {
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.RENDERER_READY, {});
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 200, width: 480});
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 420, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(420);

    // Continuing to listen past the pre-render report must not weaken the freeze: later
    // reflows inside the guest would otherwise reshuffle the masonry columns under the
    // reader.
    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 500, width: 480});
    expect(fixture.componentInstance.cardHeight()).toBe(420);
  });

  it('clamps an out-of-range reported height into the card bounds', () => {
    const fixture = mountCard(true);

    emitFromCard(fixture, PreviewBridgeMessageType.SURFACE_RESIZE, {height: 9000, width: 480});

    expect(fixture.componentInstance.cardHeight()).toBe(560);
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
