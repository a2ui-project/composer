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

import {describe, expect, it} from 'vitest';
import {CONTENT_SETTLE_MAX_MS, type SurfaceResizePayload} from 'a2ui-bridge';
import {MAX_CONTENT_HEIGHT_PX} from '../preview/content-height';
import {
  CardSizing,
  initialSizing,
  MEASURE_HEIGHT_PX,
  previewScale,
  reduceSizing,
  SIZING_WINDOW_MS,
  SizingEvent,
  windowFor,
} from './demo-card-sizing';

function reduceAll(state: CardSizing, events: readonly SizingEvent[]): CardSizing {
  return events.reduce(reduceSizing, state);
}

function resize(report: SurfaceResizePayload): SizingEvent {
  return {type: 'Resize', report};
}

/** A report from this repository's bridge once the demo has settled. */
function ready(height: number, extra: Partial<SurfaceResizePayload> = {}): SizingEvent {
  return resize({height, width: 400, viewportWidth: 400, contentReady: true, ...extra});
}

/** A report from this repository's bridge before the demo has settled. */
function notReady(height: number): SizingEvent {
  return resize({height, width: 400, viewportWidth: 400, contentReady: false});
}

/** A report from an older bridge, which doesn't say whether the demo has rendered. */
function legacy(height: number): SizingEvent {
  return resize({height, width: 400, viewportWidth: 400});
}

const VISIBLE: SizingEvent = {type: 'VisibilityChanged', visible: true};
const HIDDEN: SizingEvent = {type: 'VisibilityChanged', visible: false};
const RENDER_SUCCESS: SizingEvent = {type: 'RenderSuccess'};

/** A card on screen, 400px wide, that hasn't committed. */
function visibleCard(): CardSizing {
  return reduceAll(initialSizing(), [VISIBLE, {type: 'AvailableWidthChanged', width: 400}]);
}

/** Closes whatever window the state has open. */
function elapse(state: CardSizing): CardSizing {
  const open = windowFor(state);
  expect(open).not.toBeNull();
  return reduceSizing(state, {type: 'WindowElapsed', token: open!.token});
}

describe('demo card sizing', () => {
  it('starts out hidden, awaiting a height', () => {
    const state = initialSizing();
    expect(state.kind).toBe('awaiting');
    expect(state.height).toBeNull();
    expect(state.visible).toBe(false);
    expect(windowFor(state)).toBeNull();
  });

  describe('with a bridge that marks readiness', () => {
    it('commits the first ready report that arrives while visible', () => {
      const state = reduceAll(visibleCard(), [notReady(166), ready(240)]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(240);
      expect(state.revealed).toBe(true);
    });

    it('rounds the committed height up and caps it', () => {
      expect(reduceSizing(visibleCard(), ready(240.2)).height).toBe(241);
      expect(reduceSizing(visibleCard(), ready(9000)).height).toBe(MAX_CONTENT_HEIGHT_PX);
    });

    it('never commits a report at or below the measuring height', () => {
      let state = reduceSizing(visibleCard(), ready(MEASURE_HEIGHT_PX));
      expect(state.kind).toBe('awaiting');
      // The error overlay is fixed-position, so the body measures only its padding.
      state = reduceSizing(state, ready(16));
      expect(state.kind).toBe('awaiting');
      expect(state.height).toBeNull();
    });

    it('does not commit a report that is not ready', () => {
      const state = reduceSizing(visibleCard(), notReady(300));
      expect(state.kind).toBe('awaiting');
      expect(state.height).toBeNull();
    });

    it('locks the height once committed', () => {
      const state = reduceAll(visibleCard(), [ready(240), ready(395), ready(120), legacy(500)]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(240);
    });

    it('commits the same height for a burst delivered in one tick', () => {
      const state = reduceAll(visibleCard(), [
        notReady(166),
        RENDER_SUCCESS,
        notReady(250),
        ready(300),
        ready(320),
      ]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(300);
    });

    describe('while hidden', () => {
      it('keeps a ready report pending instead of committing it', () => {
        const state = reduceSizing(initialSizing(), ready(240));
        expect(state.kind).toBe('awaiting');
        expect(state.height).toBeNull();
        expect(state.kind === 'awaiting' && state.pending).toBe(true);
      });

      it('commits the latest report a short window after the card becomes visible', () => {
        let state = reduceAll(initialSizing(), [ready(240), VISIBLE]);
        expect(state.kind).toBe('fallbackWindow');
        expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.becameVisible);

        // The frame renders again once visible and reports what it now shows.
        state = reduceSizing(state, ready(310));
        expect(state.kind).toBe('fallbackWindow');
        state = elapse(state);
        expect(state.kind).toBe('committed');
        expect(state.height).toBe(310);
      });

      it('goes back to pending when hidden again before the window closes', () => {
        const state = reduceAll(initialSizing(), [ready(240), VISIBLE, HIDDEN]);
        expect(state.kind).toBe('awaiting');
        expect(state.kind === 'awaiting' && state.pending).toBe(true);
        expect(windowFor(state)).toBeNull();
      });

      it('ignores a window that has already been replaced', () => {
        let state = reduceAll(initialSizing(), [ready(240), VISIBLE]);
        const stale = windowFor(state)!.token;
        state = reduceAll(state, [HIDDEN, VISIBLE]);
        state = reduceSizing(state, {type: 'WindowElapsed', token: stale});
        expect(state.kind).toBe('fallbackWindow');
        expect(elapse(state).height).toBe(240);
      });
    });

    it('commits the latest report when ready never arrives after RENDER_SUCCESS', () => {
      // onInitialRender rejected: contentReady stays false for the rest of the frame's life.
      let state = reduceAll(visibleCard(), [notReady(166), RENDER_SUCCESS, notReady(280)]);
      expect(state.kind).toBe('fallbackWindow');
      // Long enough for the bridge to settle the content first.
      expect(windowFor(state)!.ms).toBeGreaterThan(CONTENT_SETTLE_MAX_MS);
      state = elapse(state);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(280);
    });

    it('commits a ready report that arrives during the RENDER_SUCCESS window', () => {
      const state = reduceAll(visibleCard(), [notReady(166), RENDER_SUCCESS, ready(300)]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(300);
    });
  });

  describe('with an older bridge', () => {
    it('does not commit before RENDER_SUCCESS', () => {
      const state = reduceAll(visibleCard(), [legacy(166), legacy(300)]);
      expect(state.kind).toBe('awaiting');
    });

    it('commits the report after RENDER_SUCCESS once the reports stop changing', () => {
      let state = reduceAll(visibleCard(), [legacy(166), RENDER_SUCCESS]);
      expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.legacyRenderSuccess);
      state = reduceSizing(state, legacy(300));
      expect(state.kind).toBe('fallbackWindow');
      expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.legacySettling);
      state = elapse(state);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(300);
      expect(reduceSizing(state, legacy(400)).height).toBe(300);
    });

    it('waits until the reports after RENDER_SUCCESS stop changing', () => {
      let state = reduceAll(visibleCard(), [legacy(148), RENDER_SUCCESS, legacy(355)]);
      const first = windowFor(state)!.token;
      state = reduceSizing(state, legacy(399));
      state = reduceSizing(state, {type: 'WindowElapsed', token: first});
      expect(state.kind).toBe('fallbackWindow');
      state = elapse(reduceSizing(state, legacy(441)));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(441);
    });

    it('commits the latest report at the ready timeout if the reports never settle', () => {
      const state = reduceAll(visibleCard(), [
        legacy(166),
        RENDER_SUCCESS,
        legacy(300),
        legacy(310),
        {type: 'ReadyTimeout'},
      ]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(310);
    });

    it('commits the report from before RENDER_SUCCESS when none follows', () => {
      const state = elapse(reduceAll(visibleCard(), [legacy(300), RENDER_SUCCESS]));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(300);
    });

    it('commits the latest report when a stale one arrives first', () => {
      const state = elapse(reduceAll(visibleCard(), [RENDER_SUCCESS, legacy(166), legacy(300)]));
      expect(state.height).toBe(300);
    });

    it('keeps the window result pending while the card is hidden', () => {
      let state = elapse(reduceAll(initialSizing(), [legacy(300), RENDER_SUCCESS]));
      expect(state.kind).toBe('awaiting');
      expect(state.kind === 'awaiting' && state.pending).toBe(true);
      state = elapse(reduceSizing(state, VISIBLE));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(300);
    });

    it('stays awaiting when the window closes without a usable report', () => {
      const state = elapse(reduceAll(visibleCard(), [legacy(MEASURE_HEIGHT_PX), RENDER_SUCCESS]));
      expect(state.kind).toBe('awaiting');
    });

    it('does not commit a widening startup screen before RENDER_SUCCESS', () => {
      let state = reduceSizing(
        visibleCard(),
        resize({height: 166, width: 500, viewportWidth: 400}),
      );
      expect(state.kind).toBe('widening');
      state = elapse(state);
      expect(state.kind).toBe('awaiting');
      expect(state.height).toBeNull();
    });
  });

  describe('errors', () => {
    it('enters the error state on RENDER_ERROR before a commit', () => {
      let state = reduceAll(visibleCard(), [notReady(166), {type: 'RenderError'}]);
      expect(state.kind).toBe('error');
      // The guest still reports readiness for its error overlay; it must not commit.
      state = reduceAll(state, [ready(48), RENDER_SUCCESS]);
      expect(state.kind).toBe('error');
      expect(state.height).toBeNull();
      expect(windowFor(state)).toBeNull();
    });

    it('ignores RENDER_ERROR after a commit', () => {
      const state = reduceAll(visibleCard(), [ready(240), {type: 'RenderError'}]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(240);
    });

    it('times out when nothing usable arrived, and recovers on a later ready report', () => {
      let state = reduceAll(visibleCard(), [notReady(166), {type: 'ReadyTimeout'}]);
      expect(state.kind).toBe('error');
      state = reduceSizing(state, ready(250));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(250);
    });

    it('does not time out a hidden card holding a pending report', () => {
      const state = reduceAll(initialSizing(), [ready(240), {type: 'ReadyTimeout'}]);
      expect(state.kind).toBe('awaiting');
    });

    it('does not time out a committed card', () => {
      const state = reduceAll(visibleCard(), [
        ready(240),
        {type: 'FrameAttached'},
        {type: 'ReadyTimeout'},
      ]);
      expect(state.kind).toBe('committed');
    });
  });

  describe('frames and renderers', () => {
    it('keeps the committed height for a remounted frame and reveals it once it renders', () => {
      let state = reduceAll(visibleCard(), [ready(304), {type: 'FrameAttached'}]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(304);
      expect(state.revealed).toBe(false);

      state = reduceAll(state, [notReady(166), ready(388)]);
      expect(state.height).toBe(304);
      expect(state.revealed).toBe(true);
    });

    it('starts over for a frame replaced before it committed', () => {
      const state = reduceAll(initialSizing(), [ready(240), {type: 'FrameAttached'}, VISIBLE]);
      expect(state.kind).toBe('awaiting');
      expect(windowFor(state)).toBeNull();
    });

    it('treats a new frame as hidden until its own visibility is reported', () => {
      // Visibility is observed on the iframe, so the old frame's says nothing about this one.
      const state = reduceAll(visibleCard(), [{type: 'FrameAttached'}, ready(240)]);
      expect(state.visible).toBe(false);
      expect(state.height).toBeNull();
    });

    it('resets everything but visibility and width when the renderer changes', () => {
      const state = reduceAll(visibleCard(), [
        ready(420, {width: 500}),
        ready(420, {width: 500, viewportWidth: 500}),
        {type: 'RendererChanged'},
      ]);
      expect(state.kind).toBe('awaiting');
      expect(state.height).toBeNull();
      expect(state.visible).toBe(true);
      expect(state.width.available).toBe(400);
      expect(state.width.content).toBe(0);
      expect(previewScale(state)).toBe(1);
    });
  });

  describe('widening', () => {
    it('waits for a converging widening to end before committing', () => {
      // The demo overflows a 400px frame, so the frame is widened and scaled down.
      let state = reduceSizing(visibleCard(), ready(500, {width: 500}));
      expect(state.kind).toBe('widening');
      expect(state.height).toBeNull();
      expect(previewScale(state)).toBe(0.8);

      // In the 500px frame it lays out 16px wider, then fits at 516px.
      state = reduceSizing(state, ready(470, {width: 516, viewportWidth: 500}));
      expect(state.kind).toBe('widening');
      state = reduceSizing(state, ready(460, {width: 516, viewportWidth: 516}));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(460);
      expect(previewScale(state)).toBe(400 / 516);
    });

    it('commits once a demo that is always wider stops counting as converging', () => {
      let state = reduceSizing(visibleCard(), ready(300, {width: 500}));
      state = reduceSizing(state, ready(280, {width: 600, viewportWidth: 500}));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(280);
      expect(previewScale(state)).toBe(0.8);
    });

    it('commits the latest report if the widening window closes first', () => {
      let state = reduceSizing(visibleCard(), ready(300, {width: 500}));
      expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.widening);
      state = elapse(state);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(300);
    });

    it('holds the widening window while hidden and times it once visible', () => {
      let state = reduceAll(visibleCard(), [HIDDEN, ready(500, {width: 500, viewportWidth: 400})]);
      expect(state.kind).toBe('widening');
      expect(windowFor(state)).toBeNull();

      state = reduceSizing(state, VISIBLE);
      expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.widening);
      state = elapse(state);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(500);
    });

    it('ignores a report laid out at the old width when the widening window closes', () => {
      let state = reduceSizing(visibleCard(), ready(500, {width: 500, viewportWidth: 400}));
      expect(state.kind).toBe('widening');

      // A report still laid out at the 400px viewport must not replace the 500px height.
      state = reduceSizing(state, ready(320, {width: 400, viewportWidth: 400}));
      expect(state.kind).toBe('widening');

      state = elapse(state);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(500);
    });

    it('ignores overflow the demo causes after the commit', () => {
      const state = reduceAll(visibleCard(), [ready(300), ready(300, {width: 700})]);
      expect(state.kind).toBe('committed');
      expect(previewScale(state)).toBe(1);
    });
  });

  describe('when the available width changes after the commit', () => {
    it('accepts one fresh commit from a report laid out at the new width', () => {
      let state = reduceAll(visibleCard(), [
        ready(241, {viewportWidth: 445}),
        {type: 'AvailableWidthChanged', width: 639},
      ]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(true);

      // A report at the old width (for example the user typing) is not the new layout.
      state = reduceSizing(state, ready(260, {viewportWidth: 445}));
      expect(state.height).toBe(241);

      state = reduceSizing(state, ready(217, {viewportWidth: 639}));
      expect(state.height).toBe(217);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(false);

      state = reduceSizing(state, ready(300, {viewportWidth: 700}));
      expect(state.height).toBe(217);
    });

    it('ignores a width report that repeats the current width', () => {
      const state = reduceAll(visibleCard(), [
        ready(241),
        {type: 'AvailableWidthChanged', width: 400},
      ]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(false);
    });

    it('records the new layout while hidden and commits it once visible', () => {
      // A window resize reaches cards the reader can't see; their frames still report.
      let state = reduceAll(visibleCard(), [
        ready(300),
        HIDDEN,
        {type: 'AvailableWidthChanged', width: 300},
        ready(320, {width: 345, viewportWidth: 300}),
      ]);
      expect(state.kind).toBe('widening');
      expect(previewScale(state)).toBe(300 / 345);
      state = reduceSizing(state, ready(330, {width: 345, viewportWidth: 345}));
      expect(state.kind).toBe('awaiting');
      expect(state.height).toBe(300);
      expect(state.revealed).toBe(true);

      state = elapse(reduceSizing(state, VISIBLE));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(330);
    });

    it('waits for a report laid out at the frame width the card now gives it', () => {
      let state = reduceAll(visibleCard(), [
        ready(310),
        {type: 'AvailableWidthChanged', width: 266},
        // Laid out at a transient width before the frame took its new one.
        ready(320, {width: 340, viewportWidth: 340}),
      ]);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(310);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(true);

      state = reduceSizing(state, ready(330, {width: 311, viewportWidth: 266}));
      expect(state.kind).toBe('widening');
      state = reduceSizing(state, ready(340, {width: 311, viewportWidth: 311}));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(340);
      expect(previewScale(state)).toBe(266 / 311);
    });

    it('does not commit a report received while locked when a later width change widens and expires', () => {
      let state = reduceAll(visibleCard(), [
        ready(240),
        // Locked: this report is ignored and must not be remembered for a future window.
        ready(395),
        {type: 'AvailableWidthChanged', width: 300},
        // Laid out at the old width: also ignored and must not be remembered.
        ready(380, {width: 400, viewportWidth: 400}),
        // An unready report at the new width widens the frame, then the window expires.
        resize({height: 320, width: 360, viewportWidth: 300}),
      ]);
      expect(state.kind).toBe('widening');
      state = elapse(state);
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(320);
    });

    it('does not reopen the commit when only the scale of a scaled frame changes', () => {
      // Scaled down, the frame keeps the content's width, so the demo doesn't re-lay out.
      let state = reduceAll(visibleCard(), [
        ready(300, {width: 699, viewportWidth: 400}),
        ready(310, {width: 699, viewportWidth: 699}),
        {type: 'AvailableWidthChanged', width: 266},
      ]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(false);
      state = reduceSizing(state, ready(320, {width: 699, viewportWidth: 699}));
      expect(state.height).toBe(310);
      expect(previewScale(state)).toBe(266 / 699);
    });

    it('keeps accepting the fresh commit when the wall remounts the frame partway', () => {
      let state = reduceAll(visibleCard(), [
        ready(310),
        {type: 'AvailableWidthChanged', width: 266},
        ready(330, {width: 311, viewportWidth: 266}),
        {type: 'FrameAttached'},
        VISIBLE,
      ]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(true);
      state = reduceSizing(state, ready(350, {width: 311, viewportWidth: 311}));
      expect(state.height).toBe(350);
    });

    it('records overflow again and converges before the fresh commit', () => {
      let state = reduceAll(visibleCard(), [
        ready(300),
        {type: 'AvailableWidthChanged', width: 300},
        ready(320, {width: 400, viewportWidth: 300}),
      ]);
      expect(state.kind).toBe('widening');
      // The card keeps showing its previous height while it converges.
      expect(state.height).toBe(300);
      expect(state.revealed).toBe(true);
      state = reduceSizing(state, ready(310, {width: 400, viewportWidth: 400}));
      expect(state.kind).toBe('committed');
      expect(state.height).toBe(310);
      expect(previewScale(state)).toBe(0.75);
    });

    it('closes the fresh commit when the width returns to the one it committed at', () => {
      const state = reduceAll(visibleCard(), [
        ready(300),
        {type: 'AvailableWidthChanged', width: 300},
        {type: 'AvailableWidthChanged', width: 400},
        // Caused by the reader, for example an expanded section, at the committed width.
        ready(360),
      ]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(false);
      expect(state.height).toBe(300);
      expect(windowFor(state)).toBeNull();
    });

    it('restores the committed height when the width returns after a hidden resize', () => {
      const pending = reduceAll(visibleCard(), [
        ready(300),
        HIDDEN,
        {type: 'AvailableWidthChanged', width: 300},
        ready(260, {width: 300, viewportWidth: 300}),
        {type: 'AvailableWidthChanged', width: 400},
        VISIBLE,
      ]);
      expect(pending.kind).toBe('committed');
      expect(pending.kind === 'committed' && pending.acceptsFreshCommit).toBe(false);
      expect(pending.height).toBe(300);
      expect(windowFor(pending)).toBeNull();

      const widened = reduceAll(visibleCard(), [
        ready(300),
        HIDDEN,
        {type: 'AvailableWidthChanged', width: 300},
        ready(320, {width: 345, viewportWidth: 300}),
        {type: 'AvailableWidthChanged', width: 400},
        VISIBLE,
      ]);
      expect(widened.kind).toBe('committed');
      expect(widened.kind === 'committed' && widened.acceptsFreshCommit).toBe(false);
      expect(widened.height).toBe(300);
      expect(windowFor(widened)).toBeNull();
    });

    it('closes the fresh commit when no report at the new width arrives in time', () => {
      let state = reduceAll(visibleCard(), [
        ready(300),
        {type: 'AvailableWidthChanged', width: 300},
      ]);
      expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.freshCommit);
      state = elapse(state);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(false);
      state = reduceSizing(state, ready(280, {width: 300, viewportWidth: 300}));
      expect(state.height).toBe(300);
    });

    it('keeps the fresh commit open while hidden and times it once visible', () => {
      // A hidden frame doesn't render, so it can't report the new layout until seen.
      let state = reduceAll(visibleCard(), [
        ready(300),
        HIDDEN,
        {type: 'AvailableWidthChanged', width: 300},
      ]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(true);
      expect(windowFor(state)).toBeNull();
      state = reduceSizing(state, VISIBLE);
      expect(windowFor(state)!.ms).toBe(SIZING_WINDOW_MS.freshCommit);
      state = reduceSizing(state, ready(280, {width: 300, viewportWidth: 300}));
      expect(state.height).toBe(280);
    });

    it('keeps the fresh commit open for a remount while a visible window is pending', () => {
      let state = reduceAll(visibleCard(), [
        ready(300),
        HIDDEN,
        {type: 'AvailableWidthChanged', width: 300},
        ready(280, {width: 300, viewportWidth: 300}),
        VISIBLE,
      ]);
      expect(state.kind).toBe('fallbackWindow');
      expect(state.height).toBe(300);
      state = reduceAll(state, [{type: 'FrameAttached'}, VISIBLE]);
      expect(state.kind === 'committed' && state.acceptsFreshCommit).toBe(true);
      state = reduceSizing(state, ready(290, {width: 300, viewportWidth: 300}));
      expect(state.height).toBe(290);
    });
  });

  it('never reuses a window token, even after the renderer changes', () => {
    const before = reduceAll(initialSizing(), [ready(240), VISIBLE]);
    const opened = windowFor(before)!.token;
    const after = reduceAll(before, [{type: 'RendererChanged'}, HIDDEN, ready(250), VISIBLE]);
    expect(windowFor(after)!.token).toBeGreaterThan(opened);
  });

  it('opens no window and keeps no timers while committed', () => {
    expect(windowFor(reduceSizing(visibleCard(), ready(240)))).toBeNull();
  });
});
