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
  let chatStateMock: MockChatState;
  let stateSyncMock: MockStateSync;
  let messageStreamSubject: ReplaySubject<MessageEnvelope>;
  /** Window of the default frame's iframe, which its guest's messages come from. */
  let guestWindow: Window;

  /**
   * Delivers `envelope` as sent by the default frame's own guest. Filtering by
   * source window is GuestFrame's, and is covered in guest-frame.spec.ts.
   */
  function emitFromGuest(envelope: MessageEnvelope): void {
    messageStreamSubject.next({...envelope, sourceWindow: guestWindow});
  }

  /** The window of `frameHarness`'s guest iframe. */
  async function guestWindowOf(frameHarness: RenderedFrameHarness): Promise<Window> {
    const iframe = await frameHarness.getIframe();
    if (!iframe) throw new Error('The frame has no iframe.');
    return (TestbedHarnessEnvironment.getNativeElement(iframe) as HTMLIFrameElement).contentWindow!;
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
      deliver: emitFromGuest,
      detectChanges: () => fixture.detectChanges(),
    };
  }

  beforeEach(async () => {
    resolvedUrlSignal = signal('http://localhost:3000/renderer');
    startupResolutionServiceMock = {
      resolvedUrl: resolvedUrlSignal,
    };

    messageStreamSubject = new ReplaySubject<MessageEnvelope>(1);
    hostCommunicationServiceMock = {
      registerIframe: vi.fn(),
      unregisterIframe: vi.fn(),
      sendRenderA2UI: vi.fn(),
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
            themePreference: signal<ThemePreference>(ThemePreference.LIGHT),
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
    guestWindow = await guestWindowOf(harness);
  });

  it('hosts the guest iframe while a renderer URL is resolved', async () => {
    expect(await harness.hasIframe()).toBe(true);
    expect(await harness.isPlaceholderShown()).toBe(false);
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
    expect(await nullHarness.isPlaceholderShown()).toBe(true);
  });

  it('renders a placeholder when the resolved URL is unsafe', async () => {
    fixture.destroy();
    resolvedUrlSignal.set('javascript:alert(1)');
    const unsafeFixture = createFrame();
    unsafeFixture.detectChanges();
    const unsafeHarness = await TestbedHarnessEnvironment.harnessForFixture(
      unsafeFixture,
      RenderedFrameHarness,
    );

    expect(await unsafeHarness.hasIframe()).toBe(false);
    expect(await unsafeHarness.isPlaceholderShown()).toBe(true);
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

  it('applies a reported surface height to the frame container', async () => {
    expect(await harness.getAppliedHeightPx()).toBeNull();

    emitFromGuest(surfaceResizeEnvelope(520));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(520);
  });

  it('lowers the applied height when a smaller SURFACE_RESIZE arrives', async () => {
    emitFromGuest(surfaceResizeEnvelope(520));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(520);

    emitFromGuest(surfaceResizeEnvelope(264));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(264);
  });

  it('keeps the frame at panel height when the guest reports zero', async () => {
    // CrossFrameValidator admits 0 as a valid dimension, so this component is
    // what stops a zero report from collapsing the frame: with no usable
    // height the container falls back to filling its panel.
    emitFromGuest(surfaceResizeEnvelope(0));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  it('holds the last applied height when a report exceeds the dimension cap', async () => {
    emitFromGuest(surfaceResizeEnvelope(520));
    fixture.detectChanges();

    // Above MAX_SURFACE_DIMENSION in CrossFrameValidator, which is the ceiling
    // the frame was pinned to during the resize feedback loop. The report is
    // dropped before it reaches the container, leaving the last good height.
    emitFromGuest(surfaceResizeEnvelope(20_001));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBe(520);
  });

  it('takes the sizing mode its host chose', async () => {
    expect(await harness.getSizing()).toBe('content');

    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    expect(await harness.getSizing()).toBe('fill');
  });

  it('stays at host height in fill mode', async () => {
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    // A panel is a fixed viewport; a guest measuring itself inside it must not
    // resize the frame to that measurement.
    emitFromGuest(surfaceResizeEnvelope(302));
    fixture.detectChanges();

    expect(await harness.getAppliedHeightPx()).toBeNull();
  });

  it('applies the last report at once when switched from fill to content', async () => {
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    emitFromGuest(surfaceResizeEnvelope(302));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBeNull();

    // A guest that de-duplicates its reports may never send this height
    // again, so the frame must not wait for a new one.
    fixture.componentRef.setInput('sizing', 'content');
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(302);

    emitFromGuest(surfaceResizeEnvelope(440));
    fixture.detectChanges();
    expect(await harness.getAppliedHeightPx()).toBe(440);
  });

  it('forgets the stored report when a new session starts', async () => {
    fixture.componentRef.setInput('sizing', 'fill');
    fixture.detectChanges();
    emitFromGuest(surfaceResizeEnvelope(302));
    fixture.detectChanges();

    stateSyncMock.sessionResetNonce.update(n => n + 1);
    fixture.detectChanges();
    fixture.componentRef.setInput('sizing', 'content');
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
      emitFromGuest(
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
      emitFromGuest(surfaceResizeEnvelope(MAX_CONTENT_HEIGHT_PX + 200));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBe(MAX_CONTENT_HEIGHT_PX);
    });

    it('follows a smaller report after clamping', async () => {
      emitFromGuest(surfaceResizeEnvelope(MAX_CONTENT_HEIGHT_PX + 200));
      fixture.detectChanges();
      emitFromGuest(surfaceResizeEnvelope(320));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBe(320);
    });

    it('rounds a fractional report up', async () => {
      emitFromGuest(surfaceResizeEnvelope(320.4));
      fixture.detectChanges();

      expect(await harness.getAppliedHeightPx()).toBe(321);
    });

    it('ignores a report above the cap in fill mode', async () => {
      fixture.componentRef.setInput('sizing', 'fill');
      fixture.detectChanges();
      emitFromGuest(surfaceResizeEnvelope(MAX_CONTENT_HEIGHT_PX + 200));
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
