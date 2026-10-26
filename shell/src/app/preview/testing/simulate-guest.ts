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

import {vi} from 'vitest';
import {MessageEnvelope} from '../../shell/host-communication/host-communication';
import {RenderedFrameHarness} from '../rendered/test/rendered-frame.harness';
import {surfaceResizeEnvelope} from './bridge-envelopes';

/** Cadence of an observed SURFACE_RESIZE feedback loop, in milliseconds. */
export const LOOP_CADENCE_MS = 24;

/**
 * What a guest simulation drives: the frame under test (read only through
 * its applied height), a way to deliver a bridge envelope to it as
 * HostCommunication would, and change detection.
 *
 * The helpers expect vitest's fake timers, with `Date` faked as well, to be
 * installed: an envelope's timestamp is the host's receipt time, and the
 * helpers move the clock between reports.
 */
export interface GuestSimulationHost {
  readonly frame: Pick<RenderedFrameHarness, 'getAppliedHeightPx'>;
  deliver(envelope: MessageEnvelope): void;
  detectChanges(): void;
}

/** Options for {@link playReports}. */
export interface PlayReportsOptions {
  /** Time between two reports, in milliseconds. */
  cadenceMs: number;
  /**
   * Deliver every report before change detection runs once, as a burst that
   * arrives within a single tick. Defaults to false.
   */
  oneTick?: boolean;
}

/** Heights of a run that starts at `base` and grows by `step` per report. */
export function growingHeights(count: number, base: number, step: number): number[] {
  return Array.from({length: count}, (_, i) => base + i * step);
}

/**
 * A guest laid out against its own viewport (`100vh`): it first reports
 * `firstPx`, then `stepPx` more than whatever height the host applies.
 */
export function viewportBoundGuest(
  firstPx = 50,
  stepPx = 16,
): (appliedPx: number | null) => number {
  return appliedPx => (appliedPx === null ? firstPx : appliedPx + stepPx);
}

/** Delivers one SURFACE_RESIZE report `afterMs` after the previous one. */
export function report(host: GuestSimulationHost, height: number, afterMs: number): void {
  vi.advanceTimersByTime(afterMs);
  host.deliver(surfaceResizeEnvelope(height, {timestamp: Date.now()}));
}

/**
 * Runs every pending timer the frame may have armed, so the result no longer
 * depends on how the frame times its decisions, and returns the applied height.
 */
export async function settle(host: GuestSimulationHost): Promise<number | null> {
  vi.runAllTimers();
  host.detectChanges();
  return host.frame.getAppliedHeightPx();
}

/**
 * Delivers a scripted sequence of reports, independent of what the frame
 * applies (a guest growing on its own, such as a CSS transition or a stream),
 * then settles and returns the applied height.
 */
export async function playReports(
  host: GuestSimulationHost,
  heights: readonly number[],
  {cadenceMs, oneTick = false}: PlayReportsOptions,
): Promise<number | null> {
  for (const height of heights) {
    report(host, height, cadenceMs);
    if (!oneTick) {
      host.detectChanges();
    }
  }
  return settle(host);
}

/** Outcome of {@link simulateGuest}. */
export interface GuestSimulationResult {
  /** Applied height once nothing changes any more. */
  applied: number | null;
  /** Reports the guest sent. */
  reports: number;
  /** False if the run hit its report budget while the frame was still changing. */
  converged: boolean;
}

/**
 * Simulates a guest that reacts to the height the host applies: whenever the
 * applied height changes (and once at the start), the guest reports
 * `reportFor(applied)` after `cadenceMs`. When the applied height stops
 * changing, the frame's pending timers run once; if that changes nothing
 * either, the run has converged.
 *
 * `reportFor` returning null means the guest stays silent.
 */
export async function simulateGuest(
  host: GuestSimulationHost,
  reportFor: (appliedPx: number | null) => number | null,
  {cadenceMs, maxReports = 200}: Pick<PlayReportsOptions, 'cadenceMs'> & {maxReports?: number},
): Promise<GuestSimulationResult> {
  let applied = await host.frame.getAppliedHeightPx();
  let reports = 0;
  while (reports < maxReports) {
    const next = reportFor(applied);
    if (next !== null) {
      report(host, next, cadenceMs);
      host.detectChanges();
      reports++;
    }
    const before = applied;
    applied = await host.frame.getAppliedHeightPx();
    if (applied !== before) {
      continue;
    }
    // Nothing moved: give the frame's own timers their turn.
    vi.runOnlyPendingTimers();
    host.detectChanges();
    applied = await host.frame.getAppliedHeightPx();
    if (applied === before) {
      return {applied, reports, converged: true};
    }
  }
  return {applied, reports, converged: false};
}
