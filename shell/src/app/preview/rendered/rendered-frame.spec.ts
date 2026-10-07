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
import {RenderedFrame} from './rendered-frame';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {RenderedFrameHarness} from './test/rendered-frame.harness';
import {describe, it, afterEach, expect, beforeEach, vi} from 'vitest';
import {ReplaySubject} from 'rxjs';
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

/** Builds a SURFACE_RESIZE envelope in the shape HostCommunication delivers. */
function surfaceResize(height: number, timestamp = Date.now()): MessageEnvelope {
  return {
    type: 'SURFACE_RESIZE',
    payload: {height, width: 800},
    origin: 'http://localhost:3000',
    timestamp,
  };
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
      ],
    }).compileComponents();

    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
    stateSyncMock = TestBed.inject(StateSync) as unknown as MockStateSync;
    fixture = TestBed.createComponent(RenderedFrame);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, RenderedFrameHarness);
  });

  afterEach(() => async () => {
    vi.unstubAllGlobals();
  });

  it('renders the iframe securely bound to the active renderer URL', async () => {
    expect(await harness.hasIframe()).toBe(true);
    expect(await harness.getIframeSrc()).toBe(
      'http://localhost:3000/renderer?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
    );
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
    const nullFixture = TestBed.createComponent(RenderedFrame);
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
    const malformedFixture = TestBed.createComponent(RenderedFrame);
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
    const unsafeFixture = TestBed.createComponent(RenderedFrame);
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
    const relativeFixture = TestBed.createComponent(RenderedFrame);
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
    const localFixture = TestBed.createComponent(RenderedFrame);
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
    const localFixture = TestBed.createComponent(RenderedFrame);
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
    const localFixture = TestBed.createComponent(RenderedFrame);
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
    const localFixture = TestBed.createComponent(RenderedFrame);
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
    const localFixture = TestBed.createComponent(RenderedFrame);
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
    emitBridgeMessage(surfaceResize(520));
    fixture.detectChanges();

    expect(fixture.componentInstance.dynamicHeight()).toBe(520);
    expect(await harness.getFrameHeight()).toBe('520px');
  });

  it('exposes a reported height as a CSS length and none otherwise', () => {
    const component = fixture.componentInstance;
    expect(component['frameHeightPx']()).toBeUndefined();

    component.dynamicHeight.set(320);
    expect(component['frameHeightPx']()).toBe('320px');

    // A guest reporting no usable height must not pin the container's height.
    component.dynamicHeight.set(0);
    expect(component['frameHeightPx']()).toBeUndefined();
  });

  it('lowers the applied height when a smaller SURFACE_RESIZE arrives', async () => {
    emitBridgeMessage(surfaceResize(3224));
    fixture.detectChanges();
    expect(await harness.getFrameHeight()).toBe('3224px');

    emitBridgeMessage(surfaceResize(264));
    fixture.detectChanges();

    expect(fixture.componentInstance.dynamicHeight()).toBe(264);
    expect(await harness.getFrameHeight()).toBe('264px');
  });

  it('shrinks dynamicHeight when a smaller surface height is reported', async () => {
    emitBridgeMessage(surfaceResize(600));
    fixture.detectChanges();
    expect(fixture.componentInstance.dynamicHeight()).toBe(600);

    emitBridgeMessage(surfaceResize(394));
    fixture.detectChanges();

    expect(fixture.componentInstance.dynamicHeight()).toBe(394);
    expect(await harness.getFrameHeight()).toBe('394px');
  });

  it('keeps the frame at panel height when the guest reports zero', async () => {
    // CrossFrameValidator admits 0 as a valid dimension, so this component is
    // what stops a zero report from collapsing the frame: with no usable
    // height the container falls back to filling its panel.
    emitBridgeMessage(surfaceResize(0));
    fixture.detectChanges();

    expect(fixture.componentInstance.frameHeight()).toBeNull();
    expect(await harness.getFrameHeight()).toBe('100%');
  });

  it('holds the last applied height when a report exceeds the dimension cap', async () => {
    emitBridgeMessage(surfaceResize(520));
    fixture.detectChanges();

    // Above MAX_SURFACE_DIMENSION in CrossFrameValidator, which is the ceiling
    // the frame was pinned to during the resize feedback loop. The report is
    // dropped before it reaches the container, leaving the last good height.
    emitBridgeMessage(surfaceResize(20_001));
    fixture.detectChanges();

    expect(await harness.getFrameHeight()).toBe('520px');
  });

  it('sizes to its content by default', async () => {
    expect(await harness.fillsContainer()).toBe(false);
  });

  it('stays at container height when it fills its container', async () => {
    fixture.componentRef.setInput('fillContainer', true);
    fixture.detectChanges();
    expect(await harness.fillsContainer()).toBe(true);
    expect(await harness.getFrameHeight()).toBe('100%');

    // The side canvas is a fixed viewport; a guest measuring itself inside it
    // must not shrink the frame to that measurement.
    emitBridgeMessage(surfaceResize(302));
    fixture.detectChanges();

    expect(fixture.componentInstance.dynamicHeight()).toBeNull();
    expect(fixture.componentInstance.frameHeight()).toBeNull();
    expect(await harness.getFrameHeight()).toBe('100%');
  });

  it('follows reports again once it stops filling its container', async () => {
    fixture.componentRef.setInput('fillContainer', true);
    fixture.detectChanges();
    emitBridgeMessage(surfaceResize(302));
    fixture.detectChanges();

    fixture.componentRef.setInput('fillContainer', false);
    fixture.detectChanges();
    // Nothing was applied while filling, so the frame starts from its default.
    expect(await harness.getFrameHeight()).toBe('100%');

    emitBridgeMessage(surfaceResize(640));
    fixture.detectChanges();
    expect(await harness.getFrameHeight()).toBe('640px');
  });

  it('re-dispatches sendRenderA2UI when RENDERER_READY or A2UI_CATALOG arrives from bridge', () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.componentRef.setInput('payload', payload);
    newFixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    messageStreamSubject.next({
      type: 'RENDERER_READY',
      payload: {},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    newFixture.detectChanges();

    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());

    sendSpy.mockClear();
    messageStreamSubject.next({
      type: 'A2UI_CATALOG',
      payload: {},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    newFixture.detectChanges();

    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());
  });

  it('triggers syncPayloadOnIframeLoad and dispatches payload if available', () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    fixture.componentRef.setInput('payload', payload);
    fixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    fixture.componentInstance['syncPayloadOnIframeLoad']();
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

  it('ignores SURFACE_RESIZE when height is missing or not a number', () => {
    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.detectChanges();

    messageStreamSubject.next({
      type: 'SURFACE_RESIZE',
      payload: {width: 500},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    newFixture.detectChanges();

    expect(newFixture.componentInstance.dynamicHeight()).toBeNull();
  });

  it('does not dispatch when RENDERER_READY arrives and payload is empty', () => {
    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.componentRef.setInput('payload', null);
    newFixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    messageStreamSubject.next({
      type: 'RENDERER_READY',
      payload: {},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    newFixture.detectChanges();

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('ignores incoming bridge messages when sourceWindow belongs to a different frame', () => {
    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.detectChanges();

    const otherWindow = {postMessage: vi.fn()} as unknown as Window;
    messageStreamSubject.next({
      type: 'SURFACE_RESIZE',
      payload: {height: 999},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      sourceWindow: otherWindow,
    });
    newFixture.detectChanges();

    expect(newFixture.componentInstance.dynamicHeight()).toBeNull();
  });

  it('does not drop SURFACE_RESIZE when followed immediately by other messages in the same tick', () => {
    messageStreamSubject.next(surfaceResize(720));
    messageStreamSubject.next({
      type: 'RENDER_SUCCESS',
      payload: {},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.dynamicHeight()).toBe(720);
  });

  it('forwards wheel events from iframe contentWindow to parent scrollable container', () => {
    const parentContainer = document.createElement('div');
    parentContainer.className = 'chat-history-container';
    parentContainer.scrollBy = vi.fn();

    const iframe = document.createElement('iframe');
    parentContainer.appendChild(iframe);
    document.body.appendChild(parentContainer);

    let wheelListener: ((event: WheelEvent) => void) | undefined;
    const fakeContentWindow = {
      addEventListener: vi.fn((type: string, listener: (event: WheelEvent) => void) => {
        if (type === 'wheel') {
          wheelListener = listener;
        }
      }),
    };
    Object.defineProperty(iframe, 'contentWindow', {
      value: fakeContentWindow,
      configurable: true,
    });

    fixture.componentInstance['setupIframeWheelForwarding'](iframe);
    expect(fakeContentWindow.addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), {
      passive: true,
    });

    wheelListener?.({deltaY: 50, deltaX: 0} as WheelEvent);
    expect(parentContainer.scrollBy).toHaveBeenCalledWith({
      top: 50,
      left: 0,
      behavior: 'auto',
    });

    document.body.removeChild(parentContainer);
  });

  describe('runaway growth circuit breaker', () => {
    /** Cadence of the observed SURFACE_RESIZE feedback loop, in milliseconds. */
    const LOOP_CADENCE_MS = 24;
    /** Growth increment of the observed loop (guest body padding), in pixels. */
    const LOOP_STEP_PX = 32;
    /** Cadence of per-frame reports from a CSS height transition at 60fps. */
    const FRAME_MS = 16;
    /** Per-frame growth of such a transition, in pixels. */
    const TRANSITION_STEP_PX = 20;
    /** Quiet period after which a held guest counts as settled. */
    const SETTLE_MS = 500;
    /**
     * Index (counting from 0) of the first report of a run that is held: the
     * sixteenth consecutive growing report reaches the limit.
     */
    const HOLD_AT = 15;
    const BASE_HEIGHT_PX = 300;
    const START_TIME = 1_700_000_000_000;
    const NEW_CONTENT = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];

    beforeEach(() => {
      vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /** Emits through both the uncoalesced stream and the coalesced signal, as the host does. */
    function emit(envelope: MessageEnvelope): void {
      messageStreamSubject.next(envelope);
      messageStreamSignal.set(envelope);
    }

    function logged(logger: ErrorLogger, level: 'warn' | 'info'): string[] {
      return logger
        .getHistory()
        .filter(item => item.level === level)
        .map(item => item.message);
    }

    function appliedHeight(): number | null {
      return fixture.componentInstance.dynamicHeight();
    }

    /**
     * Drives the component with a guest stuck in a resize feedback loop: every
     * time the host applies a reported height, the guest lays out LOOP_STEP_PX
     * taller and reports that. Like a real loop it falls silent as soon as the
     * host stops applying its reports. Returns the last report it made.
     */
    function runFeedbackLoop(
      startHeight = BASE_HEIGHT_PX,
      startTime = START_TIME,
    ): {height: number; time: number} {
      let height = startHeight;
      let time = startTime;
      emit(surfaceResize(height, time));
      fixture.detectChanges();
      for (let step = 0; step < 40 && appliedHeight() === height; step++) {
        height += LOOP_STEP_PX;
        time += LOOP_CADENCE_MS;
        emit(surfaceResize(height, time));
        fixture.detectChanges();
      }
      return {height, time};
    }

    /** Emits `count` per-frame reports of a height transition, returning the last one. */
    function runTransition(count: number, startTime = START_TIME): {height: number; time: number} {
      let height = BASE_HEIGHT_PX;
      let time = startTime;
      for (let i = 0; i < count; i++) {
        height = BASE_HEIGHT_PX + i * TRANSITION_STEP_PX;
        time = startTime + i * FRAME_MS;
        emit(surfaceResize(height, time));
        fixture.detectChanges();
      }
      return {height, time};
    }

    it('holds the frame once a guest grows in response to every applied height', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();

      const last = runFeedbackLoop();

      // The report that reaches the limit is held, so the one before it is the last applied.
      expect(last.height).toBe(BASE_HEIGHT_PX + HOLD_AT * LOOP_STEP_PX);
      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + (HOLD_AT - 1) * LOOP_STEP_PX);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);
      expect(logged(logger, 'info').filter(message => message.includes('held'))).toHaveLength(1);
      expect(logged(logger, 'warn')).toHaveLength(0);
    });

    it('does not engage when the frame fills its container', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();
      fixture.componentRef.setInput('fillContainer', true);
      fixture.detectChanges();

      // A whole runaway burst, long enough to hold an inline frame.
      for (let i = 0; i <= HOLD_AT; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * LOOP_CADENCE_MS));
        fixture.detectChanges();
      }

      expect(appliedHeight()).toBeNull();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
      expect(logged(logger, 'warn')).toHaveLength(0);
      expect(logged(logger, 'info')).toHaveLength(0);
    });

    it('confirms the loop when the guest grows again as soon as its settled height applies', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();
      const last = runFeedbackLoop();

      // Held, the guest is silent. Once it counts as settled its last report is applied...
      vi.advanceTimersByTime(SETTLE_MS);
      expect(appliedHeight()).toBe(last.height);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);

      // ...and the guest reacts to that like it reacts to every applied height.
      const reactionTime = last.time + SETTLE_MS + LOOP_CADENCE_MS;
      emit(surfaceResize(last.height + LOOP_STEP_PX, reactionTime));
      fixture.detectChanges();

      expect(appliedHeight()).toBe(last.height);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);
      const warnings = logged(logger, 'warn').filter(message => message.includes('feedback loop'));
      expect(warnings).toHaveLength(1);

      // A confirmed hold is not probed again: the frame stays put however long the guest is silent.
      vi.advanceTimersByTime(10 * SETTLE_MS);
      expect(appliedHeight()).toBe(last.height);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);
    });

    it('releases the hold when the guest keeps growing while the frame is held', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();

      // A long height transition: growing per-frame reports independent of the
      // host, more than the limit plus the few it takes to prove that.
      const last = runTransition(HOLD_AT + 11);

      expect(appliedHeight()).toBe(last.height);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
      expect(logged(logger, 'warn')).toHaveLength(0);
    });

    it('applies the settled height when a held guest stops reporting', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();

      // Too few reports after the hold to prove the growth is the guest's own.
      const last = runTransition(HOLD_AT + 2);
      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + (HOLD_AT - 1) * TRANSITION_STEP_PX);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      vi.advanceTimersByTime(SETTLE_MS);

      expect(appliedHeight()).toBe(last.height);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
      expect(logged(logger, 'warn')).toHaveLength(0);
    });

    it('does not take growth caused by new content for a reaction to the settled height', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();
      const last = runTransition(HOLD_AT + 2);
      vi.advanceTimersByTime(SETTLE_MS);
      expect(appliedHeight()).toBe(last.height);

      fixture.componentRef.setInput('payload', NEW_CONTENT);
      fixture.detectChanges();
      emit(surfaceResize(last.height + 200, last.time + SETTLE_MS + LOOP_CADENCE_MS));
      fixture.detectChanges();

      expect(appliedHeight()).toBe(last.height + 200);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
      expect(logged(logger, 'warn')).toHaveLength(0);
    });

    it('holds a burst delivered inside a single change detection tick', () => {
      emit(surfaceResize(BASE_HEIGHT_PX, START_TIME));
      fixture.detectChanges();
      expect(appliedHeight()).toBe(BASE_HEIGHT_PX);

      for (let i = 1; i <= HOLD_AT + 1; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * LOOP_CADENCE_MS));
      }
      fixture.detectChanges();

      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + (HOLD_AT - 1) * LOOP_STEP_PX);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      vi.advanceTimersByTime(SETTLE_MS);
      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + (HOLD_AT + 1) * LOOP_STEP_PX);
    });

    it('keeps applying growth when reports arrive slower than the runaway window', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();

      const slowIntervalMs = 600;
      for (let i = 0; i < 20; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * slowIntervalMs));
        fixture.detectChanges();
      }

      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + 19 * LOOP_STEP_PX);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
      expect(logged(logger, 'info')).toHaveLength(0);
    });

    it('restarts the growth run when a report does not grow', () => {
      let time = START_TIME;
      for (let cycle = 0; cycle < 4; cycle++) {
        for (let i = 0; i < HOLD_AT - 2; i++) {
          emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, time));
          time += LOOP_CADENCE_MS;
          fixture.detectChanges();
        }
        // A single non-growing report ends the run before it reaches the limit.
        emit(surfaceResize(BASE_HEIGHT_PX, time));
        time += LOOP_CADENCE_MS;
        fixture.detectChanges();
      }

      emit(surfaceResize(BASE_HEIGHT_PX + LOOP_STEP_PX, time));
      fixture.detectChanges();

      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + LOOP_STEP_PX);
    });

    it('ends the hold when the guest reports a smaller height', () => {
      const last = runFeedbackLoop();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      emit(surfaceResize(264, last.time + LOOP_CADENCE_MS));
      fixture.detectChanges();
      expect(appliedHeight()).toBe(264);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);

      // Growth after that is a new run and is applied again.
      emit(surfaceResize(264 + LOOP_STEP_PX, last.time + 2 * LOOP_CADENCE_MS));
      fixture.detectChanges();
      expect(appliedHeight()).toBe(264 + LOOP_STEP_PX);
    });

    it('ends a confirmed hold when the guest reports again after a pause', () => {
      const last = runFeedbackLoop();
      vi.advanceTimersByTime(SETTLE_MS);
      const reactionTime = last.time + SETTLE_MS + LOOP_CADENCE_MS;
      emit(surfaceResize(last.height + LOOP_STEP_PX, reactionTime));
      fixture.detectChanges();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      emit(surfaceResize(1024, reactionTime + SETTLE_MS + 1));
      fixture.detectChanges();

      expect(appliedHeight()).toBe(1024);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
    });

    it('keeps a confirmed hold while new content is rendered', () => {
      const last = runFeedbackLoop();
      vi.advanceTimersByTime(SETTLE_MS);
      const reactionTime = last.time + SETTLE_MS + LOOP_CADENCE_MS;
      emit(surfaceResize(last.height + LOOP_STEP_PX, reactionTime));
      fixture.detectChanges();

      fixture.componentRef.setInput('payload', NEW_CONTENT);
      fixture.detectChanges();
      emit(surfaceResize(last.height + 2 * LOOP_STEP_PX, reactionTime + LOOP_CADENCE_MS));
      fixture.detectChanges();

      expect(appliedHeight()).toBe(last.height);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);
    });

    it('holds for good within a run once the guest has been released twice', () => {
      // Grows to the limit, 3 held reports and a release, twice over, then held until settled.
      const releasedTwiceAt = 2 * (HOLD_AT + 3);
      const lastAppliedBeforeHold = releasedTwiceAt + HOLD_AT - 1;
      const last = runTransition(lastAppliedBeforeHold + 6);

      expect(appliedHeight()).toBe(BASE_HEIGHT_PX + lastAppliedBeforeHold * TRANSITION_STEP_PX);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      vi.advanceTimersByTime(SETTLE_MS);
      expect(appliedHeight()).toBe(last.height);
    });

    it('clears the hold when the renderer signals that it is ready again', () => {
      const last = runFeedbackLoop();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      emit({
        type: 'RENDERER_READY',
        payload: {},
        origin: 'http://localhost:3000',
        timestamp: last.time + LOOP_CADENCE_MS,
      });
      fixture.detectChanges();

      emit(surfaceResize(1024, last.time + 2 * LOOP_CADENCE_MS));
      fixture.detectChanges();

      expect(appliedHeight()).toBe(1024);
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);
    });

    it('resets dynamicHeight to null and clears the hold when sessionResetNonce increments', () => {
      const last = runFeedbackLoop();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);
      expect(appliedHeight()).not.toBeNull();

      stateSyncMock.sessionResetNonce.update(n => n + 1);
      fixture.detectChanges();

      expect(appliedHeight()).toBeNull();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(false);

      // Subsequent resize reports in the new session are not clamped by the prior hold.
      emit(surfaceResize(1024, last.time + SETTLE_MS));
      fixture.detectChanges();
      expect(appliedHeight()).toBe(1024);
    });

    it('drops the settle timer when the component is destroyed', () => {
      runTransition(HOLD_AT + 2);
      const heldHeight = appliedHeight();
      expect(fixture.componentInstance.isGrowthBreakerLatched()).toBe(true);

      fixture.destroy();
      vi.advanceTimersByTime(SETTLE_MS);

      expect(fixture.componentInstance.dynamicHeight()).toBe(heldHeight);
    });
  });
});
