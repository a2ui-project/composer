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
import {signal, WritableSignal} from '@angular/core';

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
  let messageStreamSubject: ReplaySubject<MessageEnvelope>;
  let messageStreamSignal: WritableSignal<MessageEnvelope | null>;

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
      ],
    }).compileComponents();

    chatStateMock = TestBed.inject(ChatState) as unknown as MockChatState;
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

  it('resolves catalog-relative renderer URLs against a GitHub Pages base path', async () => {
    fixture.destroy();
    const base = document.createElement('base');
    base.href = 'http://localhost:3000/composer/';
    document.head.appendChild(base);

    try {
      resolvedUrlSignal.set('samples/react-slack-catalog/');
      const relativeFixture = TestBed.createComponent(RenderedFrame);
      relativeFixture.detectChanges();
      const relativeHarness = await TestbedHarnessEnvironment.harnessForFixture(
        relativeFixture,
        RenderedFrameHarness,
      );

      expect(await relativeHarness.getIframeSrc()).toBe(
        'http://localhost:3000/composer/samples/react-slack-catalog/?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
      );
    } finally {
      base.remove();
    }
  });

  it('resolves catalog-relative renderer URLs against a PR preview base path', async () => {
    fixture.destroy();
    const base = document.createElement('base');
    base.href = 'http://localhost:3000/composer/pr/216/';
    document.head.appendChild(base);

    try {
      resolvedUrlSignal.set('samples/react-slack-catalog/');
      const relativeFixture = TestBed.createComponent(RenderedFrame);
      relativeFixture.detectChanges();
      const relativeHarness = await TestbedHarnessEnvironment.harnessForFixture(
        relativeFixture,
        RenderedFrameHarness,
      );

      expect(await relativeHarness.getIframeSrc()).toBe(
        'http://localhost:3000/composer/pr/216/samples/react-slack-catalog/?origin=http%3A%2F%2Flocalhost%3A3000&theme=light',
      );
    } finally {
      base.remove();
    }
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
    messageStreamSignal.set(surfaceResize(520));
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
    messageStreamSignal.set(surfaceResize(3224));
    fixture.detectChanges();
    expect(await harness.getFrameHeight()).toBe('3224px');

    messageStreamSignal.set(surfaceResize(264));
    fixture.detectChanges();

    expect(fixture.componentInstance.dynamicHeight()).toBe(264);
    expect(await harness.getFrameHeight()).toBe('264px');
  });

  it('keeps the frame at panel height when the guest reports zero', async () => {
    // CrossFrameValidator admits 0 as a valid dimension, so this component is
    // what stops a zero report from collapsing the frame: with no usable
    // height the container falls back to filling its panel.
    messageStreamSignal.set(surfaceResize(0));
    fixture.detectChanges();

    expect(fixture.componentInstance.frameHeight()).toBeNull();
    expect(await harness.getFrameHeight()).toBe('100%');
  });

  it('holds the last applied height when a report exceeds the dimension cap', async () => {
    messageStreamSignal.set(surfaceResize(520));
    fixture.detectChanges();

    // Above MAX_SURFACE_DIMENSION in CrossFrameValidator, which is the ceiling
    // the frame was pinned to during the resize feedback loop. The report is
    // dropped before it reaches the container, leaving the last good height.
    messageStreamSignal.set(surfaceResize(20_001));
    fixture.detectChanges();

    expect(await harness.getFrameHeight()).toBe('520px');
  });

  it('re-dispatches sendRenderA2UI when RENDERER_READY or A2UI_CATALOG arrives from bridge', () => {
    const payload = [{version: 'v0.9', createSurface: {surfaceId: 's1', catalogId: 'c1'}}];
    const messageStreamSignal = signal<unknown>(null);
    Object.defineProperty(hostCommunicationServiceMock, 'messageStream', {
      value: messageStreamSignal,
      writable: true,
    });

    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.componentRef.setInput('payload', payload);
    newFixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    messageStreamSignal.set({
      type: 'RENDERER_READY',
      payload: {},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    newFixture.detectChanges();

    expect(sendSpy).toHaveBeenCalledWith(payload, expect.anything());

    sendSpy.mockClear();
    messageStreamSignal.set({
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
    const messageStreamSignal = signal<unknown>({
      type: 'SURFACE_RESIZE',
      payload: {width: 500},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    Object.defineProperty(hostCommunicationServiceMock, 'messageStream', {
      value: messageStreamSignal,
      writable: true,
    });

    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.detectChanges();

    expect(newFixture.componentInstance.dynamicHeight()).toBeNull();
  });
  it('does not dispatch when RENDERER_READY arrives and payload is empty', () => {
    const messageStreamSignal = signal<unknown>(null);
    Object.defineProperty(hostCommunicationServiceMock, 'messageStream', {
      value: messageStreamSignal,
      writable: true,
    });

    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.componentRef.setInput('payload', null);
    newFixture.detectChanges();

    const sendSpy = vi.spyOn(hostCommunicationServiceMock, 'sendRenderA2UI');
    sendSpy.mockClear();

    messageStreamSignal.set({
      type: 'RENDERER_READY',
      payload: {},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
    });
    newFixture.detectChanges();

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it('ignores incoming bridge messages when sourceWindow belongs to a different frame', () => {
    const messageStreamSignal = signal<unknown>(null);
    Object.defineProperty(hostCommunicationServiceMock, 'messageStream', {
      value: messageStreamSignal,
      writable: true,
    });

    const newFixture = TestBed.createComponent(RenderedFrame);
    newFixture.detectChanges();

    const otherWindow = {postMessage: vi.fn()} as unknown as Window;
    messageStreamSignal.set({
      type: 'SURFACE_RESIZE',
      payload: {height: 999},
      origin: 'http://localhost:3000',
      timestamp: Date.now(),
      sourceWindow: otherWindow,
    });
    newFixture.detectChanges();

    expect(newFixture.componentInstance.dynamicHeight()).toBeNull();
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
    const BASE_HEIGHT_PX = 300;
    const START_TIME = 1_700_000_000_000;

    /** Emits through both the uncoalesced stream and the coalesced signal, as the host does. */
    function emit(envelope: MessageEnvelope): void {
      messageStreamSubject.next(envelope);
      messageStreamSignal.set(envelope);
    }

    function warnings(logger: ErrorLogger): string[] {
      return logger
        .getHistory()
        .filter(item => item.level === 'warn')
        .map(item => item.message);
    }

    it('freezes the frame height once reports grow monotonically at loop cadence', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();

      let frozenHeight: number | null = null;
      for (let i = 0; i < 20; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * LOOP_CADENCE_MS));
        fixture.detectChanges();
        const applied = fixture.componentInstance.dynamicHeight();
        if (frozenHeight === null && applied !== BASE_HEIGHT_PX + i * LOOP_STEP_PX) {
          frozenHeight = applied;
        }
      }

      expect(frozenHeight).not.toBeNull();
      expect(fixture.componentInstance.dynamicHeight()).toBe(frozenHeight);
      expect(fixture.componentInstance.dynamicHeight()).toBeLessThan(
        BASE_HEIGHT_PX + 19 * LOOP_STEP_PX,
      );
      expect(warnings(logger).filter(message => message.includes('runaway'))).toHaveLength(1);
    });

    it('latches when reports arrive faster than change detection runs', () => {
      emit(surfaceResize(BASE_HEIGHT_PX, START_TIME));
      fixture.detectChanges();
      expect(fixture.componentInstance.dynamicHeight()).toBe(BASE_HEIGHT_PX);

      // A whole runaway burst delivered inside a single change detection tick.
      // The Angular effect coalesces these into one run for the final value only,
      // so a counter living inside the effect would never see the ramp.
      for (let i = 1; i <= 15; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * LOOP_CADENCE_MS));
      }
      fixture.detectChanges();

      expect(fixture.componentInstance.dynamicHeight()).toBe(BASE_HEIGHT_PX);
    });

    it('keeps applying growth when reports arrive slower than the runaway window', () => {
      const logger = TestBed.inject(ErrorLogger);
      logger.clear();

      const slowIntervalMs = 600;
      for (let i = 0; i < 20; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * slowIntervalMs));
        fixture.detectChanges();
      }

      expect(fixture.componentInstance.dynamicHeight()).toBe(BASE_HEIGHT_PX + 19 * LOOP_STEP_PX);
      expect(warnings(logger).filter(message => message.includes('runaway'))).toHaveLength(0);
    });

    it('restarts the growth run when a report does not grow', () => {
      let time = START_TIME;
      for (let cycle = 0; cycle < 4; cycle++) {
        for (let i = 0; i < 6; i++) {
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

      expect(fixture.componentInstance.dynamicHeight()).toBe(BASE_HEIGHT_PX + LOOP_STEP_PX);
    });

    it('applies shrinking heights after the breaker latches', () => {
      for (let i = 0; i < 20; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * LOOP_CADENCE_MS));
        fixture.detectChanges();
      }
      const latchedHeight = fixture.componentInstance.dynamicHeight();
      expect(latchedHeight).toBeLessThan(BASE_HEIGHT_PX + 19 * LOOP_STEP_PX);

      emit(surfaceResize(264, START_TIME + 20 * LOOP_CADENCE_MS));
      fixture.detectChanges();

      expect(fixture.componentInstance.dynamicHeight()).toBe(264);
    });

    it('clears the latch when the renderer signals that it is ready again', () => {
      for (let i = 0; i < 20; i++) {
        emit(surfaceResize(BASE_HEIGHT_PX + i * LOOP_STEP_PX, START_TIME + i * LOOP_CADENCE_MS));
        fixture.detectChanges();
      }
      expect(fixture.componentInstance.dynamicHeight()).toBeLessThan(
        BASE_HEIGHT_PX + 19 * LOOP_STEP_PX,
      );

      emit({
        type: 'RENDERER_READY',
        payload: {},
        origin: 'http://localhost:3000',
        timestamp: START_TIME + 20 * LOOP_CADENCE_MS,
      });
      fixture.detectChanges();

      emit(surfaceResize(1024, START_TIME + 21 * LOOP_CADENCE_MS));
      fixture.detectChanges();

      expect(fixture.componentInstance.dynamicHeight()).toBe(1024);
    });
  });
});
