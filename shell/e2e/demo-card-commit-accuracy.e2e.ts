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

import {
  test,
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import {MAX_CONTENT_HEIGHT_PX} from '../src/app/preview/content-height';
import {
  COMMIT_TOLERANCE_PX,
  DEMO_CARD_COUNT,
  DEMO_RENDERERS,
  type DemoRenderer,
  measureGuestContent,
  REVEAL_TIMEOUT_MS,
  revealCard,
} from './demo-wall-helpers';

/**
 * Commit-accuracy sweep for the demo wall.
 *
 * For every demo and every bundled renderer, the height a DemoCard commits for
 * its frame equals the guest's content height (capped at MAX_CONTENT_HEIGHT_PX)
 * within COMMIT_TOLERANCE_PX, including after the wall changes the card's width.
 * The variants change the height the frame is held at before it commits
 * (`--demo-card-measure-h`), and each variant's commits match the default run's,
 * so the measurement doesn't depend on the frame's own height. A throttled run
 * checks the same under CPU load.
 */

/** How long a revealed card's committed height may take to reach its content height. */
const CONVERGE_TIMEOUT_MS = 5_000;

/**
 * Pre-commit frame heights to sweep. null keeps the card's own
 * `--demo-card-measure-h`; the others override it.
 */
const MEASURE_HEIGHTS = [null, '600px', '100px'] as const;

/** How much the throttled run slows the CPU down. */
const CPU_THROTTLING_RATE = 4;

/** One SURFACE_RESIZE as the top window received it. */
interface SurfaceReport {
  source: MessageEventSource | null;
  /** Track key of the card whose frame sent the report. */
  cardKey: string | null;
  height: number;
  /** The guest's root clientWidth, i.e. the width the demo was laid out at. */
  viewportWidth?: number;
  contentReady?: boolean;
  /** Height of the reporting iframe when the report arrived, before the card handled it. */
  frameHeight: number | null;
}

interface WindowWithSurfaceReports extends Window {
  __surfaceReports?: SurfaceReport[];
}

/** What the sweep learned about one card. */
interface CardMeasurement {
  key: string;
  title: string;
  /** The frame's height in guest pixels: its layout height, before the preview scale. */
  committed: number;
  /** The guest's content height after its webfonts loaded, measured like the bridge does. */
  content: number;
  /** The same measurement taken before waiting for document.fonts.ready. */
  contentBeforeFonts: number;
  /** Height of the first report marked contentReady from the card's current frame. */
  firstReadyHeight: number | null;
  /**
   * Every width the demo has been laid out at since it revealed, in any of the
   * card's frames: the widths of the ready reports and the current one.
   */
  widths: number[];
  /** The width the demo is laid out at now, in guest pixels. */
  frameWidth: number;
  /** Every report the current frame sent, as `height@frameHeight/wWidth`, `?` marking not ready. */
  reports: string[];
  previewScale: number;
  error: boolean;
}

/**
 * Records every SURFACE_RESIZE the top window receives and, for a variant,
 * overrides the pre-commit frame height. Runs in every frame; only the top
 * window acts. The style goes in before the app boots, so no card can mount
 * at its own measuring height first, which page.addStyleTag after navigation
 * could not guarantee; `!important` wins over the height the card binds.
 */
async function installProbe(page: Page, measureHeight: string | null): Promise<void> {
  await page.addInitScript(override => {
    if (window.top !== window) return;
    localStorage.setItem('a2ui_composer_force_1p', 'true');
    const reports: SurfaceReport[] = [];
    (window as WindowWithSurfaceReports).__surfaceReports = reports;
    window.addEventListener('message', event => {
      const data = event.data as {
        type?: string;
        payload?: {height?: number; viewportWidth?: number; contentReady?: boolean};
      } | null;
      if (data?.type !== 'SURFACE_RESIZE' || typeof data.payload?.height !== 'number') return;
      const frame = Array.from(document.querySelectorAll('iframe')).find(
        candidate => candidate.contentWindow === event.source,
      );
      reports.push({
        source: event.source,
        cardKey: frame?.closest('a2ui-composer-demo-card')?.getAttribute('data-demo-key') ?? null,
        height: data.payload.height,
        viewportWidth: data.payload.viewportWidth,
        contentReady: data.payload.contentReady,
        frameHeight: frame ? frame.offsetHeight : null,
      });
    });
    if (override) {
      const style = document.createElement('style');
      style.textContent = `a2ui-composer-demo-card { --demo-card-measure-h: ${override} !important; }`;
      const append = () => document.head.appendChild(style);
      if (document.head) {
        append();
      } else {
        document.addEventListener('DOMContentLoaded', append, {once: true});
      }
    }
  }, measureHeight);
}

function cardByKey(page: Page, key: string): Locator {
  return page.locator(`a2ui-composer-demo-card[data-demo-key=${JSON.stringify(key)}]`);
}

/** The card's committed frame height and the reports its frames sent. */
function cardState(card: Locator) {
  return card.evaluate(host => {
    const iframe = host.querySelector<HTMLIFrameElement>('iframe.demo-card-frame');
    const allReports = (window as WindowWithSurfaceReports).__surfaceReports ?? [];
    const reports = allReports.filter(
      report => iframe !== null && report.source === iframe.contentWindow,
    );
    const firstReady = reports.find(report => report.contentReady === true);
    const key = host.getAttribute('data-demo-key');
    return {
      title: host.querySelector('.demo-card-title')?.textContent?.trim() ?? '',
      committed: iframe?.offsetHeight ?? 0,
      previewScale:
        parseFloat(getComputedStyle(host).getPropertyValue('--demo-preview-scale')) || 1,
      measureHeight: getComputedStyle(host).getPropertyValue('--demo-card-measure-h').trim(),
      firstReadyHeight: firstReady?.height ?? null,
      // Every frame the card has had: the wall remounts frames as the reader scrolls.
      readyWidths: allReports.flatMap(report =>
        report.cardKey === key && report.contentReady === true && report.viewportWidth !== undefined
          ? [report.viewportWidth]
          : [],
      ),
      reports: reports.map(
        report =>
          `${report.height}${report.contentReady === true ? '' : '?'}` +
          `@${report.frameHeight}/w${report.viewportWidth ?? '-'}`,
      ),
      error: host.querySelector('.demo-card-error') !== null,
    };
  });
}

function expectedHeight(content: number): number {
  return Math.min(content, MAX_CONTENT_HEIGHT_PX);
}

function isAccurate(measurement: CardMeasurement): boolean {
  return (
    !measurement.error &&
    Math.abs(measurement.committed - expectedHeight(measurement.content)) <= COMMIT_TOLERANCE_PX
  );
}

/**
 * Takes one measurement of a card that holds a frame. `slowdown` stretches the
 * timeout for a throttled CPU.
 */
async function measureCard(card: Locator, key: string, slowdown: number): Promise<CardMeasurement> {
  const content = await measureGuestContent(card, CONVERGE_TIMEOUT_MS * slowdown);
  const state = await cardState(card);
  return {
    key,
    title: state.title,
    committed: state.committed,
    content: content.afterFonts,
    contentBeforeFonts: content.beforeFonts,
    firstReadyHeight: state.firstReadyHeight,
    widths: [...new Set([...state.readyWidths, content.width])],
    frameWidth: content.width,
    reports: state.reports,
    previewScale: state.previewScale,
    error: state.error,
  };
}

/**
 * Brings a card on screen, waits for it to reveal its demo, and measures it,
 * giving it time to take the one fresh commit it is allowed when the wall
 * changes its width as neighbours commit. Returns the last measurement whether
 * or not it is accurate.
 *
 * The card has to be on screen: Chrome stops rendering a cross-origin frame
 * that is scrolled out of view, so the guest's ResizeObserver, and with it
 * every SURFACE_RESIZE, waits until the frame is visible again.
 */
async function measureOnScreen(
  card: Locator,
  key: string,
  slowdown: number,
): Promise<CardMeasurement> {
  await revealCard(card, REVEAL_TIMEOUT_MS * slowdown);
  const result: {last?: CardMeasurement} = {};
  try {
    await expect(async () => {
      // Neighbours that finish measuring can push the card back off screen.
      await card.scrollIntoViewIfNeeded();
      result.last = await measureCard(card, key, slowdown);
      expect(isAccurate(result.last)).toBe(true);
    }).toPass({timeout: CONVERGE_TIMEOUT_MS * slowdown});
  } catch (error) {
    // An inaccurate card is reported with all the others by the caller.
    if (!result.last) throw error;
  }
  if (!result.last) throw new Error(`${key} was never measured`);
  return result.last;
}

/**
 * Scrolls through the wall and measures every card while it is on screen. The
 * wall keeps at most MAX_MOUNTED_CARDS frames and mounts the cards nearest the
 * viewport, so each card mounts as the sweep reaches it.
 */
async function sweepWall(page: Page, slowdown: number): Promise<CardMeasurement[]> {
  const cards = page.locator('a2ui-composer-demo-card');
  await expect(cards).toHaveCount(DEMO_CARD_COUNT);
  const keys = await cards.evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-demo-key') ?? ''),
  );
  const measurements: CardMeasurement[] = [];
  for (const key of keys) {
    measurements.push(await measureOnScreen(cardByKey(page, key), key, slowdown));
  }
  return measurements;
}

function table(rows: readonly CardMeasurement[], label: string): string {
  const header =
    'demo | run | committed | content | before fonts | first ready | widths | scale | ' +
    'reports (height[? = not ready]@frame height/w viewport width)';
  return [
    header,
    ...rows.map(row =>
      [
        `${row.title} (${row.key})`,
        label,
        row.error ? 'error' : row.committed,
        row.content,
        row.contentBeforeFonts,
        row.firstReadyHeight ?? '-',
        row.widths.join(','),
        row.previewScale.toFixed(3),
        row.reports.join(' '),
      ].join(' | '),
    ),
  ].join('\n');
}

/**
 * Attaches evidence for diagnosing a failure: demos whose content changed once
 * webfonts loaded, demos whose content differs from their first contentReady
 * report (late images, late layout), and demos the wall laid out at more than
 * one width after they revealed, which rely on the fresh commit a width change
 * allows.
 */
async function attachEvidence(
  testInfo: TestInfo,
  label: string,
  measurements: readonly CardMeasurement[],
): Promise<void> {
  const fontsChanged = measurements.filter(
    row => Math.abs(row.content - row.contentBeforeFonts) > COMMIT_TOLERANCE_PX,
  );
  const changedSinceReveal = measurements.filter(
    row =>
      row.firstReadyHeight !== null &&
      Math.abs(expectedHeight(row.content) - expectedHeight(Math.ceil(row.firstReadyHeight))) >
        COMMIT_TOLERANCE_PX,
  );
  const relaidOut = measurements.filter(row => row.widths.length > 1);
  const report = [
    `Content changed after document.fonts.ready (${fontsChanged.length}):`,
    table(fontsChanged, label),
    '',
    `Content differs from the first contentReady report (${changedSinceReveal.length}):`,
    table(changedSinceReveal, label),
    '',
    `Laid out at more than one width after revealing (${relaidOut.length}):`,
    table(relaidOut, label),
    '',
    'All demos:',
    table(measurements, label),
  ].join('\n');
  await testInfo.attach(`commit-accuracy ${label}`, {body: report, contentType: 'text/plain'});
  console.log(`[${testInfo.title} ${label}]\n${report}`);
}

/**
 * Sweeps the wall once in a fresh page, with the given pre-commit frame height
 * (null for the card's own), and attaches the evidence.
 */
async function sweepVariant(
  context: BrowserContext,
  testInfo: TestInfo,
  renderer: DemoRenderer,
  measureHeight: string | null,
  {cpuThrottlingRate = 1} = {},
): Promise<CardMeasurement[]> {
  const page = await context.newPage();
  try {
    if (cpuThrottlingRate !== 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', {rate: cpuThrottlingRate});
    }
    await page.emulateMedia({colorScheme: 'light'});
    await installProbe(page, measureHeight);
    await page.goto(`/demos?renderer=${renderer.url}`);

    const first = page.locator('a2ui-composer-demo-card').first();
    await expect(first).toBeAttached();
    if (measureHeight !== null) {
      // Tripwire: the override must reach the card, or the variant is the baseline.
      expect((await cardState(first)).measureHeight).toBe(measureHeight);
    }

    const measurements = await sweepWall(page, cpuThrottlingRate);
    await attachEvidence(testInfo, `${renderer.name} ${measureHeight ?? 'default'}`, measurements);
    return measurements;
  } finally {
    await page.close();
  }
}

function expectAccurate(
  label: string,
  renderer: DemoRenderer,
  measurements: readonly CardMeasurement[],
): void {
  const inaccurate = measurements.filter(row => !isAccurate(row));
  expect(
    inaccurate,
    `${label}: committed height differs from min(content, ${MAX_CONTENT_HEIGHT_PX}) by ` +
      `more than ${COMMIT_TOLERANCE_PX}px:\n${table(inaccurate, renderer.name)}`,
  ).toEqual([]);
}

/** A variant's commit that differs from the default run's for the same demo. */
interface VariantMismatch {
  key: string;
  variant: string;
  committed: number;
  baseline: number;
}

/**
 * Compares each variant's commits with the default run's, demo by demo. The
 * accuracy check alone can't catch a commit that followed the pre-commit frame
 * height for content that fills its viewport (height: 100%, 100vh), because such
 * content measures as tall as whatever frame it is in. Demos the wall laid out at
 * a different width in the two runs are skipped: they lay out differently.
 */
function compareWithBaseline(
  baseline: readonly CardMeasurement[],
  variants: ReadonlyArray<{variant: string; measurements: readonly CardMeasurement[]}>,
): {mismatches: VariantMismatch[]; skipped: string[]} {
  const byKey = new Map(baseline.map(row => [row.key, row]));
  const mismatches: VariantMismatch[] = [];
  const skipped: string[] = [];
  for (const {variant, measurements} of variants) {
    for (const row of measurements) {
      const base = byKey.get(row.key);
      if (!base || base.error || row.error) continue;
      if (Math.abs(base.frameWidth - row.frameWidth) > COMMIT_TOLERANCE_PX) {
        skipped.push(`${row.key} at ${variant}: ${row.frameWidth} vs ${base.frameWidth}px wide`);
        continue;
      }
      if (Math.abs(row.committed - base.committed) > COMMIT_TOLERANCE_PX) {
        mismatches.push({
          key: row.key,
          variant,
          committed: row.committed,
          baseline: base.committed,
        });
      }
    }
  }
  return {mismatches, skipped};
}

for (const renderer of DEMO_RENDERERS) {
  test(`${renderer.name} demo cards commit their content height at any pre-commit height`, async ({
    context,
  }, testInfo) => {
    // Three sweeps of the whole wall.
    test.setTimeout(240_000);
    const runs: Array<{variant: string; measurements: CardMeasurement[]}> = [];
    for (const measureHeight of MEASURE_HEIGHTS) {
      runs.push({
        variant: measureHeight ?? 'default',
        measurements: await sweepVariant(context, testInfo, renderer, measureHeight),
      });
    }

    for (const {variant, measurements} of runs) {
      expectAccurate(variant, renderer, measurements);
    }

    const [baseline, ...variants] = runs;
    const {mismatches, skipped} = compareWithBaseline(baseline.measurements, variants);
    await testInfo.attach('variants-skipped', {
      body: skipped.join('\n') || 'none',
      contentType: 'text/plain',
    });
    expect(
      mismatches,
      `Committed height depends on the pre-commit frame height (skipped as laid out at ` +
        `another width: ${skipped.length})`,
    ).toEqual([]);
  });
}

// The renderers whose first contentReady report most often differed from the
// final height before the bridge waited for the content to settle.
for (const renderer of DEMO_RENDERERS.filter(({name}) => name !== 'Lit')) {
  test(`${renderer.name} demo cards commit their content height under CPU load`, async ({
    context,
  }, testInfo) => {
    test.slow();
    // A whole-wall sweep at a quarter of the CPU.
    test.setTimeout(360_000);
    const measurements = await sweepVariant(context, testInfo, renderer, null, {
      cpuThrottlingRate: CPU_THROTTLING_RATE,
    });
    expectAccurate(`${CPU_THROTTLING_RATE}x CPU throttling`, renderer, measurements);
  });
}
