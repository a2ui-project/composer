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
import {RenderedFrame, RenderedFrameSizing} from './rendered-frame';
import {MAX_CONTENT_HEIGHT_PX} from '../content-height';
import {PreviewUrlParam} from '../preview-url-param';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RenderedFrameHarness} from './test/rendered-frame.harness';
import {describe, it, afterEach, expect, beforeEach, vi} from 'vitest';
import {ReplaySubject, config as rxjsConfig} from 'rxjs';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {ErrorLogger} from '../../debug/error-logger.service';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {ChatState, LlmLogEntry, LlmLogType} from '../../chat/chat-state/chat-state';
import {StateSync} from '../../chat/state-sync/state-sync';
import {signal, WritableSignal} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {bridgeEnvelope, surfaceResizeEnvelope} from '../testing/bridge-envelopes';
import {
  GuestSimulationHost,
  LOOP_CADENCE_MS,
  growingHeights,
  playReports,
  report,
  settle,
  simulateGuest,
  viewportBoundGuest,
} from '../testing/simulate-guest';

class MockStateSync {
  readonly sessionResetNonce = signal(0);
}

class MockChatState {
  readonly isProgrammaticStreamActive = signal<boolean>(false);
  readonly latestLlmLog = signal<LlmLogEntry | null>(null);
  readonly llmHistory = signal<LlmLogEntry[]>([]);
  addRawLlmLog(type: LlmLogType, payload: unknown): void {
    const entry = {type, timestamp: Date.now(), payload};
    this.latestLlmLog.set(entry);
    this.llmHistory.update(h => [...h, entry].slice(-50));
  }
  clearRawLlmHistory(): void {
    this.latestLlmLog.set(null);
    this.llmHistory.set([]);
  }
}

describe('RenderedFrame Live Preview Viewport', () => {
  let fixture: ComponentFixture<RenderedFrame>;
  let harness: RenderedFrameHarness;
  let startupResolutionServiceMock: Partial<StartupResolution>;
  let hostCommunicationServiceMock: Partial<HostCommunication>;
  let resolvedUrlSignal: WritableSignal<string | null>;
  let themePreferenceSignal: WritableSignal<ThemePreference>;
  let chatStateMock: MockChatState;
  let stateSyncMock: MockStateSync;
  let messageStreamSubject: ReplaySubject<MessageEnvelope>;
  let messageStreamSignal: WritableSignal<MessageEnvelope | null>;

  function emitBridgeMessage(envelope: MessageEnvelope): void {
    messageStreamSubject.next(envelope);
    messageStreamSignal.set(envelope);
  }

  /**
   * Creates a frame with its required `sizing` input set before the first
   * change detection, as every real host does.
   */
  function createFrame(sizing: RenderedFrameSizing = 'content'): ComponentFixture<RenderedFrame> {
    const frameFixture = TestBed.createComponent(RenderedFrame);
    frameFixture.componentRef.setInput('sizing', sizing);
    return frameFixture;
  }

  /** The default frame, driven as a guest simulation; see simulate-guest.ts. */
  function guestHost(): GuestSimulationHost {
    return {
      frame: harness,
      deliver: emitBridgeMessage,
      detectChanges: () => fixture.detectChanges(),
    };
  }

  beforeEach(async () => {
    resolvedUrlSignal = signal('http://localhost:3000/renderer');
    themePreferenceSignal = signal<ThemePreference>(ThemePreference.LIGHT);
    startupResolutionServiceMock = {
      resolvedUrl: resolvedUrlSignal,
    };

    messageStreamSubject = new ReplaySubject<MessageEnvelope>(1);
    messageStreamSignal = signal<MessageEnvelope | null>(null);
    hostCommunicationServiceMock = {
      registerIframe: vi.fn(),
      unregisterIframe: vi.fn(),
      sendTheme: vi.fn(),
      sendRenderA2UI: vi.fn(),
      messageStream: messageStreamSignal,
      messageStream$: messageStreamSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [RenderedFrame],
      providers: [
        {
          provide: StartupResolution,
          useValue: startupResolutionServiceMock,
        },
        {
          provide: HostCommunication,
          useValue: hostCommunicationServiceMock,
        },
        {
          provide: AppConfigProvider,
          useValue: {
            themePreference: themePreferenceSignal,
          },
        },
        {
          provide: ChatState,
          useClass: MockChatState,
        },
        {
          provide: StateSync,
          useClass: MockStateSync,
        },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    stateSyncMock = TestBed.inject(StateSync) as unknown as MockStateSync;
    fixture = createFrame();
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RenderedFrameHarness);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the iframe securely bound to the active renderer URL', async () => {
    expect(await harness.hasIframe()).toBe(true);
    expect(await harness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });

  it('adds only the query parameters listed in PreviewUrlParam', async () => {
    // RendererSelection removes these before comparing the iframe's URL with a
    // renderer's, so a parameter added without being listed would break that match.
    const src = new URL((await harness.getIframeSrc())!);
    const listed: string[] = Object.values(PreviewUrlParam);
    expect([...new Set(src.searchParams.keys())].filter(key => !listed.includes(key))).toEqual([]);
  });

  it('registers the iframe element with HostCommunication upon view initialization', () => {
    expect(hostCommunicationServiceMock.registerIframe).toHaveBeenCalled();
  });

  it('dispatches sendTheme via hostCommunication when theme preference changes without reloading iframe URL', async () => {
    expect(hostCommunicationServiceMock.sendTheme).toHaveBeenCalledWith(ThemePreference.LIGHT);
    const initialSrc = await harness.getIframeSrc();

    themePreferenceSignal.set(ThemePreference.DARK);
    fixture.detectChanges();

    expect(hostCommunicationServiceMock.sendTheme).toHaveBeenCalledWith(ThemePreference.DARK);
    expect(await harness.getIframeSrc()).toBe(initialSrc);
  });

  it('renders a placeholder when no renderer URL is resolved', async () => {
    fixture.destroy();
    resolvedUrlSignal.set(null);
    const nullFixture = createFrame();
    nullFixture.detectChanges();
    const nullHarness = await TestbedHarnessEnvironment.harnessForFixture(
      nullFixture,
      RenderedFrameHarness,
    );

    expect(await nullHarness.hasIframe()).toBe(false);
  });

  it('renders a placeholder when the renderer URL is malformed and fails parsing', async () => {
    fixture.destroy();
    resolvedUrlSignal.set('http://[invalid]');
    const malformedFixture = createFrame();
    malformedFixture.detectChanges();
    const malformedHarness = await TestbedHarnessEnvironment.harnessForFixture(
      malformedFixture,
      RenderedFrameHarness,
    );

    expect(await malformedHarness.hasIframe()).toBe(false);
  });

  it('fails closed when the resolved URL is unsafe', async () => {
    fixture.destroy();
    resolvedUrlSignal.set('javascript:alert(1)');
    const unsafeFixture = createFrame();
    unsafeFixture.detectChanges();
    const unsafeHarness = await TestbedHarnessEnvironment.harnessForFixture(
      unsafeFixture,
      RenderedFrameHarness,
    );

    expect(await unsafeHarness.hasIframe()).toBe(false);
  });

  it('correctly handles relative renderer URLs and appends the origin', async () => {
    fixture.destroy();
    resolvedUrlSignal.set('/renderer');
    const relativeFixture = createFrame();
    relativeFixture.detectChanges();
    const relativeHarness = await TestbedHarnessEnvironment.harnessForFixture(
      relativeFixture,
      RenderedFrameHarness,
    );

    expect(await relativeHarness.hasIframe()).toBe(true);
    expect(await relativeHarness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
  });

  it('appends all ancestor origins and base origin to the renderer URL query params', async () => {
    fixture.destroy();
    vi.stubGlobal('location', {
      origin: 'http://localhost:3000',
      ancestorOrigins: ['https://proxy.googlers.com', 'https://jetski.corp.google.com'],
    });

    resolvedUrlSignal.set('/renderer');
    const localFixture = createFrame();
    localFixture.detectChanges();
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      localFixture,
      RenderedFrameHarness,
    );

    const src = await localHarness.getIframeSrc();
    expect(src).toContain('origin=http%3A%2F%2Flocalhost%3A3000');
    expect(src).toContain('origin=https%3A%2F%2Fproxy.googlers.com');
    expect(src).toContain('origin=https%3A%2F%2Fjetski.corp.google.com');
  });

  it('deduplicates ancestor origins matching the base origin or each other', async () => {
    fixture.destroy();
    vi.stubGlobal('location', {
      origin: 'http://localhost:3000',
      ancestorOrigins: [
        'http://localhost:3000',
        'https://proxy.googlers.com',
        'https://proxy.googlers.com',
      ],
    });

    resolvedUrlSignal.set('/renderer');
    const localFixture = createFrame();
    localFixture.detectChanges();
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      localFixture,
      RenderedFrameHarness,
    );

    const src = await localHarness.getIframeSrc();
    expect(src).toContain('origin=http%3A%2F%2Flocalhost%3A3000');
    expect(src).toContain('origin=https%3A%2F%2Fproxy.googlers.com');

    // Validate deduplication
    expect(src!.match(/origin=http%3A%2F%2Flocalhost%3A3000/g)?.length).toBe(1);
    expect(src!.match(/origin=https%3A%2F%2Fproxy\.googlers\.com/g)?.length).toBe(1);
  });

  it('handles environments where location.ancestorOrigins is undefined (e.g. Firefox)', async () => {
    fixture.destroy();
    vi.stubGlobal('location', {
      origin: 'http://localhost:3000',
      // ancestorOrigins omitted to simulate Firefox
    });

    resolvedUrlSignal.set('/renderer');
    const localFixture = createFrame();
    localFixture.detectChanges();
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      localFixture,
      RenderedFrameHarness,
    );

    const src = await localHarness.getIframeSrc();
    expect(src).toContain('origin=http%3A%2F%2Flocalhost%3A3000');
    expect(src!.match(/origin=/g)?.length).toBe(1);
  });

  it('processes absolute URLs correctly in SSR environments', async () => {
    fixture.destroy();
    vi.stubGlobal('location', undefined);

    resolvedUrlSignal.set('http://localhost:3000/renderer');
    const localFixture = createFrame();
    localFixture.detectChanges();
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      localFixture,
      RenderedFrameHarness,
    );

    const src = await localHarness.getIframeSrc();
    // In SSR, no origin is appended if location is undefined
    expect(src).toBe('http://localhost:3000/renderer?theme=light');
  });

  it('returns null and hides iframe when rendering a relative URL in SSR environments', async () => {
    fixture.destroy();
    vi.stubGlobal('location', undefined);

    resolvedUrlSignal.set('/renderer');
    const localFixture = createFrame();
    localFixture.detectChanges();
    const localHarness = await TestbedHarnessEnvironment.harnessForFixture(
      localFixture,
      RenderedFrameHarness,
    );

    expect(await localHarness.hasIframe()).toBe(false);
  });

  it('visually locks manual preview visual click dispatches during active model stream turns', async () => {
    expect(await harness.isLocked()).toBe(false);

    // Lock active stream
    chatStateMock.isProgrammaticStreamActive.set(true);
    fixture.detectChanges();
    expect(await harness.isLocked()).toBe(true);

    // Release lock
    chatStateMock.isProgrammaticStreamActive.set(false);
    fixture.detectChanges();
    expect(await harness.isLocked()).toBe(false);
  });

  it('dispatches sendRenderA2UI when payload input changes', () => {
    hostCommunicationServiceMock.sendRenderA2UI = vi.fn();
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];

    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();

    expect(hostCommunicationServiceMock.sendRenderA2UI).toHaveBeenCalledWith(
      payload,
      expect.anything(),
    );
  });
  it('applies a reported surface height to the frame container', async () => {
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitBridgeMessage(surfaceResizeEnvelope(520));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(520);
  });

  it('lowers the applied height when a smaller SURFACE_RESIZE arrives', async () => {
    emitBridgeMessage(surfaceResizeEnvelope(520));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(520);

    emitBridgeMessage(surfaceResizeEnvelope(264));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(264);
  });

  it('keeps the frame at panel height when the guest reports zero', async () => {
    // CrossFrameValidator admits 0 as a valid dimension, so this component is
    // what stops a zero report from collapsing the frame: with no usable
    // height the container falls back to filling its panel.
    emitBridgeMessage(surfaceResizeEnvelope(0));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  it('holds the last applied height when a report exceeds the dimension cap', async () => {
    emitBridgeMessage(surfaceResizeEnvelope(520));
    fixture.detectChanges();

    // Above MAX_SURFACE_DIMENSION in CrossFrameValidator, which is the ceiling
    // the frame was pinned to during the resize feedback loop. The report is
    // dropped before it reaches the container, leaving the last good height.
    emitBridgeMessage(surfaceResizeEnvelope(20_001));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(520);
  });

  it('takes the sizing mode its host chose', async () => {
    expect(await harness.getSizing()).toBe('content');

    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    expect(await harness.getSizing()).toBe('fill');
  });

  it('handles an envelope buffered before it was created once its sizing is set', async () => {
    // HostCommunication replays its last envelope to every new subscriber. In
    // a single-frame host the guest's envelopes carry no source window, so a
    // frame mounted after the guest has spoken takes that replay as its own.
    // It must not read the required `sizing` input before its host can set
    // it: that throws NG0950, which RxJS reports asynchronously as an uncaught
    // error, and the replayed report is lost.
    const unhandled = vi.fn();
    const previousHandler = rxjsConfig.onUnhandledError;
    rxjsConfig.onUnhandledError = unhandled;
    try {
      emitBridgeMessage(surfaceResizeEnvelope(320));
      const lateFixture = createFrame('content');
      lateFixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve));

      expect(unhandled).not.toHaveBeenCalled();
      const lateHarness = await TestbedHarnessEnvironment.harnessForFixture(
        lateFixture,
        RenderedFrameHarness,
      );
      expect(await lateHarness.getAppliedHeightPx()).toBe(320);
      lateFixture.destroy();
    } finally {
      rxjsConfig.onUnhandledError = previousHandler;
    }
  });

  it('ignores a replayed envelope from another frame', async () => {
    // The replay reaches a new frame before its own iframe exists, so it
    // cannot yet tell its window apart; an envelope that names a window must
    // belong to some other frame (a second inline surface, the docked preview).
    const otherWindow = {postMessage: vi.fn()} as unknown as Window;
    emitBridgeMessage(surfaceResizeEnvelope(320, {sourceWindow: otherWindow}));
    const lateFixture = createFrame('content');
    lateFixture.detectChanges();
    const lateHarness = await TestbedHarnessEnvironment.harnessForFixture(
      lateFixture,
      RenderedFrameHarness,
    );

    expect(await lateHarness.getAppliedHeightPx()).toBeNull();
    lateFixture.destroy();
  });

  it('stays at host height in fill mode', async () => {
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    // A panel is a fixed viewport; a guest measuring itself inside it must not
    // resize the frame to that measurement.
    emitBridgeMessage(surfaceResizeEnvelope(302));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  it('applies the last report at once when switched from fill to content', async () => {
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(302));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    // A guest that de-duplicates its reports may never send this height
    // again, so the frame must not wait for a new one.
    fixture.componentRef.setInput('sizing', 'content');
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(302);

    emitBridgeMessage(surfaceResizeEnvelope(440));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(440);
  });

  it('forgets the stored report when a new session starts', async () => {
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(302));
    fixture.detectChanges();

    stateSyncMock.sessionResetNonce.update(n => n + 1);
    fixture.detectChanges();
    fixture.componentRef.setInput('sizing', 'content');
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  it('keeps sending the payload when the frame loads in fill mode', async () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();
    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    await harness.simulateFrameLoad();

    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());
  });

  it('re-dispatches sendRenderA2UI when RENDERER_READY or A2UI_CATALOG arrives from bridge', () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    const newFixture = createFrame();
    newFixture.componentRef.setInput('payload', payload);
    newFixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    messageStreamSubject.next(bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY));
    newFixture.detectChanges();

    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());

    sendSpy.mockClear();
    messageStreamSubject.next(bridgeEnvelope(PreviewBridgeMessageType.A2UI_CATALOG));
    newFixture.detectChanges();

    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());
  });

  it('dispatches the payload when the frame loads', async () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    await harness.simulateFrameLoad();
    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());
  });

  it('does not dispatch sendRenderA2UI when payload is empty or null', () => {
    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    fixture.componentRef.setInput('payload', []);
    fixture.detectChanges();

    expect(sendSpy).not.toHaveBeenCalled();

    fixture.componentRef.setInput('payload', null);
    fixture.detectChanges();

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('ignores SURFACE_RESIZE when height is missing or not a number', async () => {
    const newFixture = createFrame();
    newFixture.detectChanges();
    const newHarness = await TestbedHarnessEnvironment.harnessForFixture(
      newFixture,
      RenderedFrameHarness,
    );

    messageStreamSubject.next(
      bridgeEnvelope(PreviewBridgeMessageType.SURFACE_RESIZE, {width: 500}),
    );
    newFixture.detectChanges();

    expect(await newHarness.getAppliedHeightPx()).toBeNull();
  });

  it('ignores SURFACE_RESIZE when contentReady is false and applies once contentReady is true', async () => {
    const newFixture = createFrame();
    newFixture.detectChanges();
    const newHarness = await TestbedHarnessEnvironment.harnessForFixture(
      newFixture,
      RenderedFrameHarness,
    );

    messageStreamSubject.next(
      bridgeEnvelope(PreviewBridgeMessageType.SURFACE_RESIZE, {
        height: 180,
        width: 500,
        contentReady: false,
      }),
    );
    newFixture.detectChanges();
    expect(await newHarness.getAppliedHeightPx()).toBeNull();

    messageStreamSubject.next(
      bridgeEnvelope(PreviewBridgeMessageType.SURFACE_RESIZE, {
        height: 340,
        width: 500,
        contentReady: true,
      }),
    );
    newFixture.detectChanges();
    expect(await newHarness.getAppliedHeightPx()).toBe(340);
  });

  it('does not dispatch when RENDERER_READY arrives and payload is empty', () => {
    const newFixture = createFrame();
    newFixture.componentRef.setInput('payload', null);
    newFixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    messageStreamSubject.next(bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY));
    newFixture.detectChanges();

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('ignores incoming bridge messages when sourceWindow belongs to a different frame', async () => {
    const newFixture = createFrame();
    newFixture.detectChanges();
    const newHarness = await TestbedHarnessEnvironment.harnessForFixture(
      newFixture,
      RenderedFrameHarness,
    );

    const otherWindow = {postMessage: vi.fn()} as unknown as Window;
    messageStreamSubject.next(surfaceResizeEnvelope(480, {sourceWindow: otherWindow}));
    newFixture.detectChanges();

    expect(await newHarness.getAppliedHeightPx()).toBeNull();
  });

  it('does not drop SURFACE_RESIZE when followed immediately by other messages in the same tick', async () => {
    messageStreamSubject.next(surfaceResizeEnvelope(480));
    messageStreamSubject.next(bridgeEnvelope(PreviewBridgeMessageType.RENDER_SUCCESS));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(480);
  });

  it('resets the applied height when the resolved renderer URL changes', async () => {
    emitBridgeMessage(surfaceResizeEnvelope(420));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(420);

    resolvedUrlSignal.set('http://localhost:4200/other-renderer');
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  it('ignores pre-render startup SURFACE_RESIZE after RENDERER_READY until RENDER_SUCCESS when payload is bound', async () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();

    emitBridgeMessage(surfaceResizeEnvelope(420));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(420);

    emitBridgeMessage(bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    // Startup measurement before RENDER_SUCCESS must not collapse the 280px floor.
    emitBridgeMessage(surfaceResizeEnvelope(48));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitBridgeMessage(bridgeEnvelope(PreviewBridgeMessageType.RENDER_SUCCESS));
    emitBridgeMessage(surfaceResizeEnvelope(360));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(360);
  });

  it('clears applied height and ignores subsequent SURFACE_RESIZE after RENDER_ERROR until recovery', async () => {
    emitBridgeMessage(surfaceResizeEnvelope(420));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(420);

    emitBridgeMessage(
      bridgeEnvelope(PreviewBridgeMessageType.RENDER_ERROR, {message: 'Failed to render'}),
    );
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitBridgeMessage(surfaceResizeEnvelope(60));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    // Setting a new non-empty payload while in hasRenderError === true must not
    // prematurely clear hasRenderError or accept a trailing error-overlay
    // SURFACE_RESIZE before RENDER_SUCCESS arrives.
    fixture.componentRef.setInput('payload', [
      {version: 'v0.9', createSurface: {surfaceId: 's2', catalogId: 'c1'}},
    ]);
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(60));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitBridgeMessage(bridgeEnvelope(PreviewBridgeMessageType.RENDER_SUCCESS));
    emitBridgeMessage(surfaceResizeEnvelope(380));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(380);
  });

  it('does not leave awaitingRender stuck true when RENDERER_READY arrives while payload is null or empty', async () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    fixture.componentRef.setInput('payload', null);
    fixture.detectChanges();

    emitBridgeMessage(bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY));
    fixture.detectChanges();

    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(340));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(340);

    fixture.componentRef.setInput('payload', []);
    fixture.detectChanges();
    emitBridgeMessage(bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY));
    fixture.detectChanges();

    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(360));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(360);
  });

  it('resets applied height and ignores SURFACE_RESIZE when payload is null or empty', async () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(420));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(420);

    fixture.componentRef.setInput('payload', null);
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitBridgeMessage(surfaceResizeEnvelope(180));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();
    emitBridgeMessage(surfaceResizeEnvelope(400));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(400);

    fixture.componentRef.setInput('payload', []);
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitBridgeMessage(surfaceResizeEnvelope(180));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  /**
   * Growth behavior of a content-sized frame. Each scenario reads the frame
   * only through the height it applies, after every timer it may have armed
   * has run. Every scenario except RT-4 ends below MAX_CONTENT_HEIGHT_PX, and
   * the runaway and transition runs are long enough to trip any count- or
   * time-based limit on growth.
   */
  describe('growth behavior', () => {
    const START_TIME = 1_700_000_000_000;
    const BASE_PX = 100;
    const STEP_PX = 15;
    /** Per-frame reports at 60Hz. */
    const FRAME_MS = 16;
    /** Per-frame reports at 120Hz, the fastest a guest reports. */
    const FAST_FRAME_MS = 8;
    /** Growing reports in a runaway or transition run: 100px to 490px. */
    const RUN_REPORTS = 27;
    const RUN_FINAL_PX = BASE_PX + (RUN_REPORTS - 1) * STEP_PX;
    /** Fast growing reports that leave a run in progress when an event arrives. */
    const MID_RUN_REPORTS = 17;
    const NEW_CONTENT = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];

    let host: GuestSimulationHost;

    beforeEach(() => {
      vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
      vi.setSystemTime(START_TIME);
      host = guestHost();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /** Leaves a runaway run of fast growing reports in flight, without settling. */
    function startRunaway(): void {
      for (const height of growingHeights(MID_RUN_REPORTS, BASE_PX, STEP_PX)) {
        report(host, height, FAST_FRAME_MS);
        fixture.detectChanges();
      }
    }

    it('RT-1a follows a short expansion transition to its final height', async () => {
      const heights = growingHeights(14, BASE_PX, STEP_PX);

      expect(await playReports(host, heights, {cadenceMs: FRAME_MS})).toBe(heights.at(-1));
    });

    it('RT-1b follows a long expansion transition at 120Hz to its final height', async () => {
      const heights = growingHeights(RUN_REPORTS, BASE_PX, STEP_PX);

      expect(await playReports(host, heights, {cadenceMs: FAST_FRAME_MS})).toBe(RUN_FINAL_PX);
    });

    it('RT-2 follows streaming growth in small steps', async () => {
      const heights = growingHeights(20, BASE_PX, 10);

      expect(await playReports(host, heights, {cadenceMs: 200})).toBe(heights.at(-1));
    });

    it('RT-3 follows an expansion down and back up without ratcheting', async () => {
      const expand = growingHeights(RUN_REPORTS, BASE_PX, STEP_PX);
      const collapse = growingHeights(RUN_REPORTS, RUN_FINAL_PX, -STEP_PX);

      expect(await playReports(host, expand, {cadenceMs: FAST_FRAME_MS})).toBe(RUN_FINAL_PX);
      expect(await playReports(host, collapse, {cadenceMs: FAST_FRAME_MS})).toBe(BASE_PX);
      expect(await playReports(host, expand, {cadenceMs: FAST_FRAME_MS})).toBe(RUN_FINAL_PX);
    });

    it('RT-4 stops growing when the guest grows with every applied height', async () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();
      const result = await simulateGuest(host, viewportBoundGuest(), {
        cadenceMs: LOOP_CADENCE_MS,
      });

      expect(result.converged).toBe(true);
      // Long enough to have run into whatever bounds the growth.
      expect(result.reports).toBeGreaterThan(16);
      expect(await settle(host)).toBe(result.applied);
      expect(result.applied).toBe(MAX_CONTENT_HEIGHT_PX);
      // Reaching the cap is normal and logs nothing.
      expect(logger.getHistory()).toEqual([]);
    });

    it('RT-5 follows a transition of more than 48 reports to its final height', async () => {
      const heights = growingHeights(56, BASE_PX, 6);

      expect(await playReports(host, heights, {cadenceMs: FAST_FRAME_MS})).toBe(heights.at(-1));
    });

    it('RT-6 follows streaming that runs straight into an expansion', async () => {
      for (const height of growingHeights(10, BASE_PX, 10)) {
        report(host, height, 200);
        fixture.detectChanges();
      }
      const expansion = growingHeights(RUN_REPORTS, 200, 10);

      expect(await playReports(host, expansion, {cadenceMs: FAST_FRAME_MS})).toBe(expansion.at(-1));
    });

    it('RT-7 applies every report of growth that arrives 600ms apart', async () => {
      for (const height of growingHeights(20, BASE_PX, STEP_PX)) {
        report(host, height, 600);
        fixture.detectChanges();
        expect(await harness.getAppliedHeightPx()).toBe(height);
      }
    });

    it('RT-8 follows a new payload down and then up', async () => {
      startRunaway();
      fixture.componentRef.setInput('payload', NEW_CONTENT);
      fixture.detectChanges();

      report(host, 200, FAST_FRAME_MS);
      fixture.detectChanges();
      expect(await harness.getAppliedHeightPx()).toBe(200);

      report(host, 300, FAST_FRAME_MS);
      fixture.detectChanges();
      expect(await settle(host)).toBe(300);
    });

    it('RT-9 applies a smaller report after the renderer signals ready again', async () => {
      startRunaway();
      vi.advanceTimersByTime(FAST_FRAME_MS);
      emitBridgeMessage(
        bridgeEnvelope(PreviewBridgeMessageType.RENDERER_READY, {}, {timestamp: Date.now()}),
      );
      fixture.detectChanges();

      report(host, 200, FAST_FRAME_MS);
      fixture.detectChanges();

      expect(await settle(host)).toBe(200);
    });

    it('RT-10 returns to its default size on a session reset, then follows new reports', async () => {
      startRunaway();
      stateSyncMock.sessionResetNonce.update(n => n + 1);
      fixture.detectChanges();
      expect(await harness.getAppliedHeightPx()).toBeNull();

      report(host, 250, FAST_FRAME_MS);
      fixture.detectChanges();
      expect(await harness.getAppliedHeightPx()).toBe(250);

      report(host, 300, FAST_FRAME_MS);
      fixture.detectChanges();
      expect(await settle(host)).toBe(300);
    });

    it('RT-11 neither throws nor logs when destroyed in the middle of a run', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();
      const unhandled = vi.fn();
      const previousHandler = rxjsConfig.onUnhandledError;
      rxjsConfig.onUnhandledError = unhandled;
      try {
        startRunaway();
        fixture.destroy();

        expect(() => vi.runAllTimers()).not.toThrow();
        expect(() => report(host, 400, FAST_FRAME_MS)).not.toThrow();
        expect(() => vi.runAllTimers()).not.toThrow();
        expect(unhandled).not.toHaveBeenCalled();
        expect(logger.getHistory().filter(item => item.level === 'error')).toEqual([]);
      } finally {
        rxjsConfig.onUnhandledError = previousHandler;
      }
    });

    it('RT-12 applies the final report of a burst delivered within one tick', async () => {
      report(host, BASE_PX, FAST_FRAME_MS);
      fixture.detectChanges();
      const burst = growingHeights(RUN_REPORTS, BASE_PX + STEP_PX, STEP_PX);

      expect(await playReports(host, burst, {cadenceMs: FAST_FRAME_MS, oneTick: true})).toBe(
        burst.at(-1),
      );
    });

    it('RT-13 follows a run interrupted by one report that does not grow', async () => {
      const first = growingHeights(13, BASE_PX, STEP_PX);
      const second = growingHeights(13, first.at(-1)! + STEP_PX, STEP_PX);
      const heights = [...first, first.at(-1)!, ...second];

      expect(await playReports(host, heights, {cadenceMs: FAST_FRAME_MS})).toBe(second.at(-1));
    });

    it('applies no height in fill mode, even after a runaway burst settles', async () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();
      fixture.componentRef.setInput('sizing', 'fill');
      fixture.detectChanges();

      // A whole runaway burst, at the cadence of an observed feedback loop.
      const burst = growingHeights(RUN_REPORTS, BASE_PX, STEP_PX);
      expect(await playReports(host, burst, {cadenceMs: LOOP_CADENCE_MS})).toBeNull();
      expect(logger.getHistory()).toEqual([]);
    });
  });

  describe('content height cap', () => {
    it('applies the cap for a report above it', async () => {
      emitBridgeMessage(surfaceResizeEnvelope(MAX_CONTENT_HEIGHT_PX + 200));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBe(MAX_CONTENT_HEIGHT_PX);
    });

    it('follows a smaller report after clamping', async () => {
      emitBridgeMessage(surfaceResizeEnvelope(MAX_CONTENT_HEIGHT_PX + 200));
      fixture.detectChanges();
      emitBridgeMessage(surfaceResizeEnvelope(320));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBe(320);
    });

    it('rounds a fractional report up', async () => {
      emitBridgeMessage(surfaceResizeEnvelope(320.4));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBe(321);
    });

    it('ignores a report above the cap in fill mode', async () => {
      fixture.componentRef.setInput('sizing', 'fill');
      fixture.detectChanges();
      emitBridgeMessage(surfaceResizeEnvelope(MAX_CONTENT_HEIGHT_PX + 200));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBeNull();
    });
  });

  describe('sizing mode switches', () => {
    let host: GuestSimulationHost;

    beforeEach(() => {
      vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'Date']});
      vi.setSystemTime(1_700_000_000_000);
      host = guestHost();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    // Invariant: the latest report wins, whatever mode the frame was in when
    // earlier reports arrived.
    it('applies the report stored while filling once switched back to content', async () => {
      const capped = await simulateGuest(host, viewportBoundGuest(), {
        cadenceMs: LOOP_CADENCE_MS,
      });
      expect(capped.applied).toBe(MAX_CONTENT_HEIGHT_PX);

      // While filling, the guest settles smaller; nothing from the run that
      // reached the cap may overwrite that report.
      fixture.componentRef.setInput('sizing', 'fill');
      fixture.detectChanges();
      report(host, 264, 24);
      fixture.detectChanges();
      await settle(host);

      fixture.componentRef.setInput('sizing', 'content');
      fixture.detectChanges();
      expect(await harness.getAppliedHeightPx()).toBe(264);
    });
  });
});
