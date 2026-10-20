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
import {RENDERER_URLS} from './helpers';

/**
 * Commit-accuracy sweep for the demo wall.
 *
 * For every demo and every bundled renderer, the height a DemoCard commits for
 * its frame must equal the guest's content height (capped at
 * MAX_CONTENT_HEIGHT_PX) within COMMIT_TOLERANCE_PX. The variants change the
 * height the frame is held at before it commits (`--demo-card-measure-h`), and
 * each variant's commits must match the default run's, to show that the
 * measurement doesn't depend on the frame's own height (DF-12).
 *
 * This is the baseline for making DemoCard commit its height once and then
 * lock it: the same sweep must pass before and after that change.
 */

/** Number of demos every bundled renderer provides. */
const DEMO_CARD_COUNT = 46;

/**
 * Largest difference allowed between the committed and the content height, in
 * guest pixels. A scaled card's surface height is floored in wall pixels, so
 * its frame can be up to 1/previewScale guest pixels short of the commit.
 */
const COMMIT_TOLERANCE_PX = 2;

/** How long one card may take to mount and reveal its demo. */
const REVEAL_TIMEOUT_MS = 30_000;

/** How long a revealed card's committed height may take to reach its content height. */
const CONVERGE_TIMEOUT_MS = 5_000;

const RENDERERS = [
  {name: 'Angular', url: RENDERER_URLS.angular},
  {name: 'Lit', url: RENDERER_URLS.lit},
  {name: 'React', url: RENDERER_URLS.react},
] as const;

/**
 * Pre-commit frame heights to sweep. null keeps the stylesheet's own
 * `--demo-card-measure-h`; the others override it.
 */
const MEASURE_HEIGHTS = [null, '600px', '100px'] as const;

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
  /** Height of the first report marked contentReady: what the card committed at reveal. */
  firstReadyHeight: number | null;
  /**
   * Every width the demo has been laid out at since it revealed, in any of the
   * card's frames: the widths of the ready reports and the current one. More
   * than one means the wall resized the card after it committed.
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
 * at the stylesheet's height first, which page.addStyleTag after navigation
 * could not guarantee.
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

/**
 * The guest's content height after its webfonts have loaded, and the width it
 * is laid out at. Mirrors measureAndDispatch() in
 * bridge/src/surface-resize-observer.ts.
 */
function guestContent(
  card: Locator,
): Promise<{beforeFonts: number; afterFonts: number; width: number}> {
  return card
    .locator('iframe.demo-card-frame')
    .contentFrame()
    .locator('body')
    .evaluate(
      async () => {
        const measure = () =>
          Math.max(
            Math.ceil(document.body.getBoundingClientRect().height),
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
          );
        const beforeFonts = measure();
        await document.fonts.ready;
        return {
          beforeFonts,
          afterFonts: measure(),
          width: document.documentElement.clientWidth,
        };
      },
      undefined,
      {timeout: CONVERGE_TIMEOUT_MS},
    );
}

/** The card's committed frame height and the reports its current frame sent. */
function cardState(card: Locator) {
  return card.evaluate(host => {
    const iframe = host.querySelector<HTMLIFrameElement>('iframe.demo-card-frame');
    const allReports = (window as WindowWithSurfaceReports).__surfaceReports ?? [];
    const reports = allReports.filter(
      report => iframe !== null && report.source === iframe.contentWindow,
    );
    const firstReadyIndex = reports.findIndex(report => report.contentReady === true);
    const readyReports = firstReadyIndex < 0 ? [] : reports.slice(firstReadyIndex);
    const key = host.getAttribute('data-demo-key');
    return {
      title: host.querySelector('.demo-card-title')?.textContent?.trim() ?? '',
      committed: iframe?.offsetHeight ?? 0,
      previewScale:
        parseFloat(getComputedStyle(host).getPropertyValue('--demo-preview-scale')) || 1,
      measureHeight: getComputedStyle(host).getPropertyValue('--demo-card-measure-h').trim(),
      firstReadyHeight: readyReports[0]?.height ?? null,
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
 * Whether the wall resized the card after it committed. The wall packs cards
 * into rows by their heights, so a card's width can change as its neighbours
 * commit, and a wider demo is often shorter. The current DemoCard follows only
 * growth after its commit, so it keeps the taller height. The commit-once
 * change accepts a fresh commit when the available width changes (DF-15);
 * remove this exemption there, so the sweep checks that too.
 */
function relaidOutAfterCommit(measurement: CardMeasurement): boolean {
  return measurement.widths.length > 1;
}

/** Takes one measurement of a card that holds a frame. */
async function measureCard(card: Locator, key: string): Promise<CardMeasurement> {
  const content = await guestContent(card);
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
 * giving its committed height time to follow its content (the current growth
 * phase does). Returns the last measurement whether or not it is accurate.
 *
 * The card has to be on screen: Chrome stops rendering a cross-origin frame
 * that is scrolled out of view, so the guest's ResizeObserver, and with it
 * every SURFACE_RESIZE, waits until the frame is visible again. A card that
 * mounts off screen and then gets a late image only grows once the reader
 * scrolls to it.
 */
async function measureOnScreen(card: Locator, key: string): Promise<CardMeasurement> {
  await expect(async () => {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator('.demo-card-placeholder')).toBeHidden({timeout: 1000});
  }).toPass({timeout: REVEAL_TIMEOUT_MS});
  const result: {last?: CardMeasurement} = {};
  try {
    await expect(async () => {
      // Neighbours that finish measuring can push the card back off screen.
      await card.scrollIntoViewIfNeeded();
      result.last = await measureCard(card, key);
      expect(isAccurate(result.last)).toBe(true);
    }).toPass({timeout: CONVERGE_TIMEOUT_MS});
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
async function sweepWall(page: Page): Promise<CardMeasurement[]> {
  const cards = page.locator('a2ui-composer-demo-card');
  await expect(cards).toHaveCount(DEMO_CARD_COUNT);
  const keys = await cards.evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-demo-key') ?? ''),
  );
  const measurements: CardMeasurement[] = [];
  for (const key of keys) {
    measurements.push(await measureOnScreen(cardByKey(page, key), key));
  }
  return measurements;
}

function table(rows: readonly CardMeasurement[], renderer: string): string {
  const header =
    'demo | renderer | committed | content | before fonts | first ready | widths | scale | ' +
    'reports (height[? = not ready]@frame height/w viewport width)';
  return [
    header,
    ...rows.map(row =>
      [
        `${row.title} (${row.key})`,
        renderer,
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
 * Attaches what the commit-once change needs to know, without asserting it:
 * demos whose content changed once webfonts loaded (DF-14), demos whose
 * content differs from the report a card that commits once would keep (late
 * images, late layout), and demos the wall resized after their commit.
 */
async function attachEvidence(
  testInfo: TestInfo,
  renderer: string,
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
  const relaidOut = measurements.filter(row => !isAccurate(row) && relaidOutAfterCommit(row));
  const report = [
    `Content changed after document.fonts.ready (${fontsChanged.length}):`,
    table(fontsChanged, renderer),
    '',
    `Content differs from the first contentReady report, which a card that commits once ` +
      `would keep (${changedSinceReveal.length}):`,
    table(changedSinceReveal, renderer),
    '',
    `Inaccurate, but resized by the wall after the commit; not asserted (${relaidOut.length}):`,
    table(relaidOut, renderer),
    '',
    'All demos:',
    table(measurements, renderer),
  ].join('\n');
  await testInfo.attach('commit-accuracy', {body: report, contentType: 'text/plain'});
  console.log(`[${renderer} ${testInfo.title}]\n${report}`);
}

/**
 * Sweeps the wall once in a fresh page, with the given pre-commit frame height
 * (null for the stylesheet's own), and attaches the evidence.
 */
async function sweepVariant(
  context: BrowserContext,
  testInfo: TestInfo,
  renderer: {name: string; url: string},
  measureHeight: string | null,
): Promise<CardMeasurement[]> {
  const page = await context.newPage();
  try {
    await page.emulateMedia({colorScheme: 'light'});
    await installProbe(page, measureHeight);
    await page.goto(`/demos?renderer=${renderer.url}`);

    const first = page.locator('a2ui-composer-demo-card').first();
    await expect(first).toBeAttached();
    if (measureHeight !== null) {
      // Tripwire: the override must reach the card, or the variant is the baseline.
      expect((await cardState(first)).measureHeight).toBe(measureHeight);
    }

    const measurements = await sweepWall(page);
    await attachEvidence(testInfo, `${renderer.name} ${measureHeight ?? 'default'}`, measurements);
    return measurements;
  } finally {
    await page.close();
  }
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
      if (relaidOutAfterCommit(base) || relaidOutAfterCommit(row)) continue;
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

for (const renderer of RENDERERS) {
  test(`${renderer.name} demo cards commit their content height at any pre-commit height`, async ({
    context,
  }, testInfo) => {
    // Three sweeps of the whole wall.
    test.setTimeout(240_000);
    const runs: Array<{variant: string; measurements: CardMeasurement[]}> = [];
    for (const measureHeight of MEASURE_HEIGHTS) {
      const variant = measureHeight ?? 'default';
      runs.push({
        variant,
        measurements: await sweepVariant(context, testInfo, renderer, measureHeight),
      });
    }

    for (const {variant, measurements} of runs) {
      const inaccurate = measurements.filter(row => !isAccurate(row) && !relaidOutAfterCommit(row));
      expect(
        inaccurate,
        `${variant}: committed height differs from min(content, ${MAX_CONTENT_HEIGHT_PX}) by ` +
          `more than ${COMMIT_TOLERANCE_PX}px:\n${table(inaccurate, renderer.name)}`,
      ).toEqual([]);
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
