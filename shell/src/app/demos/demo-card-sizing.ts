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

/**
 * How a demo card decides its height: a pure reducer over the events its frame and
 * the wall produce. The card commits a height once, while it is on screen, and then
 * locks it; content that changes later scrolls inside the card, so the wall never
 * reshuffles under the reader.
 *
 * - **Commit.** The first report marked `contentReady` that arrives while the card is
 *   visible, above {@link MEASURE_HEIGHT_PX}, is committed (rounded up and capped by
 *   `clampContentHeight`). The bridge marks a report ready only once the content has
 *   settled.
 * - **Visibility.** Chrome stops rendering a cross-origin frame that is scrolled out of
 *   view, so a hidden frame can report content that is out of date. A ready report
 *   that arrives while the card is hidden is kept pending; when the card becomes
 *   visible a short window opens, and when it closes the latest report is committed.
 * - **Older bridges** don't mark readiness. After RENDER_SUCCESS the card waits for
 *   their reports to stop changing, and commits the latest, even one from before
 *   RENDER_SUCCESS if none follows. A current bridge whose content never becomes ready
 *   (its `onInitialRender` rejected) gets the same treatment after a longer window.
 * - **Widening.** A demo that overflows its frame widens it and is scaled down; it
 *   lays out again at the new width, so the card waits until the widening stops
 *   before committing.
 * - **Available width.** When the wall changes the card's width after the commit and
 *   the frame's width changes with it, the demo lays out again, so the card accepts
 *   one fresh commit from the first report laid out at the new frame width. The offer
 *   closes when the frame returns to the width it committed at, once it is taken, or
 *   when its window closes.
 * - **Errors.** RENDER_ERROR before the commit, or no usable report before the
 *   card's ready timeout, puts the card in `error`.
 *
 * Every wait is bounded. Windows are requested by the state ({@link windowFor}), with
 * the durations in {@link SIZING_WINDOW_MS}; the card runs the timer and reports
 * `WindowElapsed` with the window's token. The card also reports `ReadyTimeout`
 * {@link READY_TIMEOUT_MS} after it mounts or sends its demo.
 */

import {CONTENT_QUIET_MS, CONTENT_SETTLE_MAX_MS, type SurfaceResizePayload} from 'a2ui-bridge';
import {clampContentHeight} from '../preview/content-height';

/**
 * CSS height the renderer frame is held at until the card commits, and the largest
 * report the card discards. Until a guest renders, its document measures only the
 * body's padding (16px), and a render error's overlay is fixed-position, so it
 * measures the same; the shortest real demo (Row Layout) measures 56px. The card
 * binds it as `--demo-card-measure-h`.
 */
export const MEASURE_HEIGHT_PX = 32;

/**
 * Grace period a freshly mounted frame gets to show the demo, in milliseconds. It
 * restarts when the card sends the demo. Renderer-side failures are only logged
 * inside the guest frame, so without it a broken demo would present as a silently
 * blank card.
 */
export const READY_TIMEOUT_MS = 8000;

/**
 * Quiet periods (the bridge's {@link CONTENT_QUIET_MS}) the card's short windows
 * last. After the guest resumes rendering or lays out again, it takes about one
 * quiet period to reach a stable layout, and its report takes up to about another
 * to arrive (the bridge coalesces reports, then a postMessage hop and a change
 * detection tick on the host); two leave that margin without holding the
 * placeholder noticeably longer.
 */
const QUIET_PERIODS_PER_WINDOW = 2;

const SHORT_WINDOW_MS = QUIET_PERIODS_PER_WINDOW * CONTENT_QUIET_MS;

/** How long each window the card can wait on lasts, in milliseconds. */
export const SIZING_WINDOW_MS = {
  /**
   * A hidden card holding a ready report has become visible: time for its frame to
   * render again and report what it now shows, before the latest report commits.
   */
  becameVisible: SHORT_WINDOW_MS,
  /** A demo is widening its frame: restarted by each widening, then the latest commits. */
  widening: SHORT_WINDOW_MS,
  /**
   * A current bridge has sent RENDER_SUCCESS: longer than its settle cap, which counts
   * from the same render, so this only fires when readiness never comes.
   */
  renderSuccessNotReady: CONTENT_SETTLE_MAX_MS + SHORT_WINDOW_MS,
  /**
   * An older bridge has sent RENDER_SUCCESS: time for its first report after it. Such
   * a bridge measures on a timer, without forcing layout, and on a loaded machine
   * that report arrived more than 150ms later; committing first kept the startup
   * screen's height (130px for React's Event Detail instead of 322px).
   */
  legacyRenderSuccess: 1000,
  /**
   * An older bridge is reporting after RENDER_SUCCESS: how long its reports must stop
   * changing before the latest commits. Every report restarts it. Such a bridge
   * can't say when its content has settled, so this stands in for its quiet period,
   * with the same margin as the card's other short windows.
   */
  legacySettling: 300,
  /**
   * The frame's width has changed after the commit: how long a visible card waits for
   * a report laid out at the new width before it keeps its height. A frame that is
   * visible re-lays out and reports within a few frames; the window only runs while
   * the card is visible, since a hidden frame doesn't render.
   */
  freshCommit: 1000,
} as const;

/**
 * Overflow in pixels a frame's width report may show without counting as overflow:
 * fractional widths round in either direction on both sides of the frame.
 */
const ROUNDING_TOLERANCE_PX = 2;

/**
 * Largest overflow, in pixels, that may repeat while a scaled demo still counts as
 * converging. React's invitation builder overflows by 3px twice before it fits.
 */
const MAX_REPEATED_OVERFLOW_PX = 3;

/**
 * Most times in a row a card widens a scaled frame for a demo that still overflows it.
 * React's invitation builder converges in 12 at its narrowest card.
 */
const MAX_SCALED_WIDENINGS = 20;

/**
 * How far, in pixels, a report's viewport width may differ from the width the card gives
 * its frame and still count as laid out at that width: a guest's classic vertical
 * scrollbar (about 15px) narrows its viewport, and widths round.
 */
const FRAME_WIDTH_TOLERANCE_PX = 20;

/** Everything that can change how a card sizes itself. */
export type SizingEvent =
  /**
   * The card's frame reported its content's dimensions in a SURFACE_RESIZE
   * payload. The card fills in `viewportWidth` with the frame's width when an
   * older bridge leaves it out.
   */
  | {type: 'Resize'; report: SurfaceResizePayload}
  /** The card's frame rendered the demo. */
  | {type: 'RenderSuccess'}
  /** The card's frame failed to render the demo. */
  | {type: 'RenderError'}
  /** A window from {@link windowFor} closed. */
  | {type: 'WindowElapsed'; token: number}
  /** {@link READY_TIMEOUT_MS} passed since the card mounted or sent its demo. */
  | {type: 'ReadyTimeout'}
  /** The renderer changed, so the demo will lay out differently. */
  | {type: 'RendererChanged'}
  /** The card's surface was measured at this width, in pixels. */
  | {type: 'AvailableWidthChanged'; width: number}
  /** The card's frame came into view or left it. */
  | {type: 'VisibilityChanged'; visible: boolean}
  /** The card has a new frame, for example after the wall remounted it. */
  | {type: 'FrameAttached'};

/** The card's width and what it has learned about the demo's. */
export interface WidthState {
  /** Width of the card's surface, in pixels, or 0 before it is measured. */
  available: number;
  /** Widest content the demo has overflowed its frame with, or 0 while it fits. */
  content: number;
  /** Overflow of the report that last widened {@link content}. */
  recordedOverflow: number;
  /** Widenings recorded in a row from a scaled frame. */
  scaledWidenings: number;
}

/** What the card has heard from its current frame. */
interface FrameReports {
  /** Latest usable height, from any report. */
  latest: number | null;
  /** Latest usable height from a report marked ready. */
  latestReady: number | null;
  /** Whether the frame has sent RENDER_SUCCESS. */
  renderSucceeded: boolean;
  /** Whether the frame's bridge marks readiness (a current bridge). */
  marksReadiness: boolean;
}

/** What every sizing state carries. */
interface SizingBase {
  /** Whether the card's frame is on screen. */
  visible: boolean;
  width: WidthState;
  frame: FrameReports;
  /** The committed height in guest pixels, or null before the first commit. */
  height: number | null;
  /** The frame's width when {@link height} was committed, in pixels, or 0 before. */
  committedFrameWidth: number;
  /** Whether the current frame shows the demo, so the placeholder can go. */
  revealed: boolean;
  /**
   * Identifies the latest window opened; a `WindowElapsed` for another is stale. It
   * only ever increases, so a new window never reuses an old one's timer.
   */
  windowToken: number;
}

/** Why a `fallbackWindow` is open; see {@link SIZING_WINDOW_MS} for each. */
export type WindowReason =
  'legacyRenderSuccess' | 'legacySettling' | 'renderSuccessNotReady' | 'becameVisible';

/** Where a card is in sizing itself. */
export type CardSizing =
  /**
   * Waiting for a report to commit. `height` is null before the first commit, or the
   * committed height while a fresh commit waits for a hidden card to become visible.
   */
  | (SizingBase & {
      kind: 'awaiting';
      /** Whether a report is waiting for the card to become visible to commit. */
      pending: boolean;
    })
  /**
   * Waiting for a window to close, then committing the latest report. `height` is
   * null, or the committed height while a fresh commit waits on a visible card.
   */
  | (SizingBase & {kind: 'fallbackWindow'; reason: WindowReason})
  /**
   * The demo is widening its frame; the card commits once it stops. `height` is null,
   * or the committed height while a fresh commit converges.
   */
  | (SizingBase & {kind: 'widening'})
  /** The height is committed and locked; `height` is non-null. */
  | (SizingBase & {
      kind: 'committed';
      /**
       * Whether the next report laid out at the card's frame width may replace the
       * height: open while the frame's width differs from {@link committedFrameWidth}
       * after a width change, until taken or until its window closes.
       */
      acceptsFreshCommit: boolean;
    })
  /**
   * The demo failed to render, or nothing usable arrived in time. `height` is null:
   * a committed card doesn't enter this state.
   */
  | (SizingBase & {kind: 'error'; reason: 'timeout' | 'render'});

const FRESH_FRAME: FrameReports = {
  latest: null,
  latestReady: null,
  renderSucceeded: false,
  marksReadiness: false,
};

/** A card that has no frame yet, no width and no height. */
export function initialSizing(): CardSizing {
  return {
    kind: 'awaiting',
    pending: false,
    visible: false,
    width: restartConvergence({available: 0, content: 0, recordedOverflow: 0, scaledWidenings: 0}),
    frame: FRESH_FRAME,
    height: null,
    committedFrameWidth: 0,
    revealed: false,
    windowToken: 0,
  };
}

/** Factor the frame is drawn at so that content wider than the card fits it. */
export function previewScale(state: CardSizing): number {
  const {available, content} = state.width;
  return isScaled(state.width) ? available / content : 1;
}

/** The window the state is waiting on, if any: the card times it and reports it back. */
export function windowFor(state: CardSizing): {token: number; ms: number} | null {
  switch (state.kind) {
    case 'fallbackWindow':
      return {token: state.windowToken, ms: SIZING_WINDOW_MS[state.reason]};
    case 'widening':
      return state.visible ? {token: state.windowToken, ms: SIZING_WINDOW_MS.widening} : null;
    case 'committed':
      return state.acceptsFreshCommit && state.visible
        ? {token: state.windowToken, ms: SIZING_WINDOW_MS.freshCommit}
        : null;
    default:
      return null;
  }
}

/** The card's next sizing state after an event. */
export function reduceSizing(state: CardSizing, event: SizingEvent): CardSizing {
  switch (event.type) {
    case 'Resize':
      return onResize(state, event.report);
    case 'RenderSuccess':
      return onRenderSuccess(state);
    case 'RenderError':
      return onRenderError(state);
    case 'WindowElapsed':
      return windowFor(state)?.token === event.token ? onWindowElapsed(state) : state;
    case 'ReadyTimeout':
      return onReadyTimeout(state);
    case 'RendererChanged':
      return onRendererChanged(state);
    case 'AvailableWidthChanged':
      return onAvailableWidthChanged(state, event.width);
    case 'VisibilityChanged':
      return onVisibilityChanged(state, event.visible);
    case 'FrameAttached':
      return onFrameAttached(state);
  }
}

function base(state: CardSizing): SizingBase {
  const {visible, width, frame, height, committedFrameWidth, revealed, windowToken} = state;
  return {visible, width, frame, height, committedFrameWidth, revealed, windowToken};
}

/** Whether the demo is wider than the card, so the frame is scaled down to fit. */
function isScaled(width: WidthState): boolean {
  return width.available > 0 && width.content > width.available;
}

/** Width the card gives its frame: the content width while scaled down, else its own. */
function frameWidth(width: WidthState): number {
  return isScaled(width) ? width.content : width.available;
}

/** Lets overflow be recorded again from scratch, as for a new widening sequence. */
function restartConvergence(width: WidthState): WidthState {
  return {...width, recordedOverflow: Number.POSITIVE_INFINITY, scaledWidenings: 0};
}

function awaiting(state: CardSizing, pending: boolean): CardSizing {
  return {...base(state), kind: 'awaiting', pending};
}

function openWindow(state: CardSizing, reason: WindowReason): CardSizing {
  return {...base(state), kind: 'fallbackWindow', reason, windowToken: state.windowToken + 1};
}

function widening(state: CardSizing, width: WidthState): CardSizing {
  return {...base(state), kind: 'widening', width, windowToken: state.windowToken + 1};
}

function commit(state: CardSizing, height: number): CardSizing {
  return {
    ...base(state),
    kind: 'committed',
    height,
    committedFrameWidth: frameWidth(state.width),
    revealed: true,
    acceptsFreshCommit: false,
  };
}

/** Whether a window an older bridge's RENDER_SUCCESS opened is open. */
function isLegacyWindow(state: CardSizing): boolean {
  return (
    state.kind === 'fallbackWindow' &&
    (state.reason === 'legacyRenderSuccess' || state.reason === 'legacySettling')
  );
}

/** The height a report would commit, or null for one the card discards. */
function usableHeight(report: SurfaceResizePayload): number | null {
  return report.height > MEASURE_HEIGHT_PX ? clampContentHeight(report.height) : null;
}

/**
 * The width state after a report, if it records overflow, or null if it doesn't.
 *
 * Overflow in an unscaled frame always counts. A scaled frame is widened to the content
 * width already recorded, and some demos lay out wider in a wider frame, so the demo
 * can overflow again. It's recorded again while that converges: while the overflow
 * shrinks, or is within rounding of shrinking, up to {@link MAX_SCALED_WIDENINGS} times
 * in a row. A demo that is always wider than its frame by the same amount (the sample
 * Task Card is, by about 65px at any width) stops after one.
 */
function recordOverflow(state: CardSizing, report: SurfaceResizePayload): WidthState | null {
  const {viewportWidth, width: contentWidth} = report;
  if (!viewportWidth || viewportWidth <= 0 || contentWidth === undefined) return null;
  const overflow = contentWidth - viewportWidth;
  if (overflow <= ROUNDING_TOLERANCE_PX) return null;
  const width = state.width;
  let scaledWidenings = 0;
  if (isScaled(width)) {
    const shrinking = overflow < width.recordedOverflow;
    // Widths are reported in whole pixels, rounded up, so an overflow that is still
    // shrinking can show the same few pixels twice.
    const shrinkingWithinRounding =
      overflow === width.recordedOverflow && overflow <= MAX_REPEATED_OVERFLOW_PX;
    if (width.scaledWidenings >= MAX_SCALED_WIDENINGS || !(shrinking || shrinkingWithinRounding)) {
      return null;
    }
    scaledWidenings = width.scaledWidenings + 1;
  }
  return {
    ...width,
    recordedOverflow: overflow,
    scaledWidenings,
    content: Math.max(width.content, Math.ceil(contentWidth)),
  };
}

/**
 * Whether a report was laid out at a frame width other than the one the card gives its
 * frame now: a transient layout from while the card was being resized, which says
 * nothing about the height at the new width.
 */
function laidOutElsewhere(width: WidthState, report: SurfaceResizePayload): boolean {
  const expected = frameWidth(width);
  return (
    report.viewportWidth !== undefined &&
    expected > 0 &&
    Math.abs(report.viewportWidth - expected) > FRAME_WIDTH_TOLERANCE_PX
  );
}

/**
 * Whether a report ends the wait for a commit: one the bridge marked ready, or, from
 * an older bridge that can't mark readiness, the one that ends a widening after
 * RENDER_SUCCESS (the demo has rendered and now fits its frame, which is as settled
 * as such a bridge can say).
 */
function commitsNow(state: CardSizing, report: SurfaceResizePayload): boolean {
  return (
    report.contentReady === true ||
    (state.kind === 'widening' && state.frame.renderSucceeded && !state.frame.marksReadiness)
  );
}

function recordHeight(
  frame: FrameReports,
  report: SurfaceResizePayload,
  height: number | null,
): FrameReports {
  if (height === null) return frame;
  return {
    ...frame,
    latest: height,
    latestReady: report.contentReady === true ? height : frame.latestReady,
  };
}

function onResize(state: CardSizing, report: SurfaceResizePayload): CardSizing {
  if (state.kind === 'error' && state.reason === 'render') return state;
  const height = usableHeight(report);
  const frame: FrameReports = {
    ...state.frame,
    marksReadiness: state.frame.marksReadiness || report.contentReady !== undefined,
  };
  const next: CardSizing = {...state, frame};
  return next.kind === 'committed'
    ? onResizeCommitted(next, report, height)
    : onResizeUncommitted(next, report, height);
}

/** A report reaching a committed card: locked, unless a fresh commit is open. */
function onResizeCommitted(
  state: CardSizing & {kind: 'committed'},
  report: SurfaceResizePayload,
  height: number | null,
): CardSizing {
  if (height === null || report.contentReady === false) return state;
  const shown: CardSizing & {kind: 'committed'} = {...state, revealed: true};
  if (!shown.acceptsFreshCommit || laidOutElsewhere(shown.width, report)) return shown;
  const recorded: CardSizing & {kind: 'committed'} = {
    ...shown,
    frame: recordHeight(shown.frame, report, height),
  };
  const widened = recordOverflow(recorded, report);
  if (widened && widened.content > recorded.width.content) return widening(recorded, widened);
  const laidOut: CardSizing = {...recorded, width: widened ?? recorded.width};
  // A hidden frame may not have finished laying out; commit once the card is seen.
  return laidOut.visible ? commit(laidOut, height) : awaiting(laidOut, true);
}

/** A report reaching a card that is waiting to commit. */
function onResizeUncommitted(
  state: CardSizing,
  report: SurfaceResizePayload,
  height: number | null,
): CardSizing {
  let next = state;
  // An older bridge's window learning that this frame marks readiness waits for it.
  if (isLegacyWindow(next) && report.contentReady !== undefined) {
    next = openWindow(next, 'renderSuccessNotReady');
  }
  if (height === null) return next;
  if (report.contentReady === false) {
    return {...next, frame: recordHeight(next.frame, report, height)};
  }

  const widened = recordOverflow(next, report);
  if (widened) {
    const grew = widened.content > next.width.content;
    next = {...next, width: widened};
    if (grew) {
      return widening({...next, frame: recordHeight(next.frame, report, height)}, widened);
    }
  }
  if (next.kind === 'widening' && laidOutElsewhere(next.width, report)) return next;
  next = {...next, frame: recordHeight(next.frame, report, height)};
  if (next.kind === 'fallbackWindow' && next.reason === 'becameVisible') return next;
  // An older bridge can't say when its content has settled: wait for its reports to stop.
  if (isLegacyWindow(next)) return openWindow(next, 'legacySettling');
  if (!commitsNow(next, report)) return next;
  return next.visible ? commit(next, height) : awaiting(next, true);
}

function onRenderSuccess(state: CardSizing): CardSizing {
  const next: CardSizing = {...state, frame: {...state.frame, renderSucceeded: true}};
  if (next.kind === 'awaiting' || (next.kind === 'error' && next.reason === 'timeout')) {
    return openWindow(
      next,
      next.frame.marksReadiness ? 'renderSuccessNotReady' : 'legacyRenderSuccess',
    );
  }
  return next;
}

function onRenderError(state: CardSizing): CardSizing {
  return state.height === null && state.kind !== 'error'
    ? {...base(state), kind: 'error', reason: 'render'}
    : state;
}

function onReadyTimeout(state: CardSizing): CardSizing {
  if (state.kind === 'fallbackWindow' && state.reason === 'legacySettling') {
    // An older bridge's reports that never stop changing commit as they are.
    return onWindowElapsed(state);
  }
  return state.kind === 'awaiting' && !state.pending
    ? {...base(state), kind: 'error', reason: 'timeout'}
    : state;
}

function onWindowElapsed(state: CardSizing): CardSizing {
  // The fresh commit a width change offered wasn't taken in time: keep the height.
  if (state.kind === 'committed') return {...state, acceptsFreshCommit: false};
  // An older bridge's report before RENDER_SUCCESS may be its startup screen.
  const legacyBeforeRender = !state.frame.marksReadiness && !state.frame.renderSucceeded;
  const candidate = legacyBeforeRender ? null : (state.frame.latestReady ?? state.frame.latest);
  if (candidate === null) {
    return state.height === null ? awaiting(state, false) : commit(state, state.height);
  }
  if (!state.visible) return awaiting(state, true);
  return commit(state, candidate);
}

function onRendererChanged(state: CardSizing): CardSizing {
  return {
    ...initialSizing(),
    visible: state.visible,
    width: restartConvergence({...state.width, content: 0}),
    windowToken: state.windowToken,
  };
}

function onVisibilityChanged(state: CardSizing, visible: boolean): CardSizing {
  const next: CardSizing = {...state, visible};
  if (visible && next.kind === 'awaiting' && next.pending) {
    return openWindow(next, 'becameVisible');
  }
  if (!visible && next.kind === 'fallbackWindow' && next.reason === 'becameVisible') {
    return awaiting(next, true);
  }
  return next;
}

/**
 * Records the card's new width. When the frame's width changes after the commit, the
 * demo lays out again, so the card offers one fresh commit, in a new window; when it
 * returns to the width the card committed at, the offer closes. A scaled card whose
 * frame keeps the content's width only changes its scale, so the demo doesn't.
 */
function onAvailableWidthChanged(state: CardSizing, available: number): CardSizing {
  if (available === state.width.available) return state;
  const next: CardSizing = {...state, width: {...state.width, available}};
  if (
    next.height !== null &&
    state.width.available > 0 &&
    frameWidth(next.width) === next.committedFrameWidth
  ) {
    return {
      ...commit(next, next.height),
      revealed: next.revealed,
      committedFrameWidth: next.committedFrameWidth,
    };
  }
  if (next.kind !== 'committed') return next;
  if (state.width.available <= 0) {
    // Committed before the card was measured: the first width is the committed one.
    return {...next, committedFrameWidth: frameWidth(next.width)};
  }
  if (frameWidth(next.width) === frameWidth(state.width)) return next;
  return {
    ...next,
    acceptsFreshCommit: true,
    frame: {...next.frame, latest: null, latestReady: null},
    width: restartConvergence(next.width),
    windowToken: next.windowToken + 1,
  };
}

function onFrameAttached(state: CardSizing): CardSizing {
  // Visibility is observed on the iframe, so a new frame is hidden until reported.
  const fresh = {...base(state), frame: FRESH_FRAME, revealed: false, visible: false};
  if (state.height !== null) {
    // The wall often remounts frames while it repacks: a frame whose width still
    // differs from the committed one lays the demo out at the new width too.
    const refreshing = frameWidth(state.width) !== state.committedFrameWidth;
    return {
      ...fresh,
      kind: 'committed',
      acceptsFreshCommit: refreshing,
      windowToken: refreshing ? fresh.windowToken + 1 : fresh.windowToken,
    };
  }
  return {...fresh, kind: 'awaiting', pending: false};
}
