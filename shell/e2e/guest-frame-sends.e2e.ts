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

import {expect, test, type Page} from '@playwright/test';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  inlineSurfaceFrame,
  inlineSurfaceIframe,
  PREVIEW_FRAME_HOSTS,
  sideCanvasFrame,
} from '../src/app/preview/testing/preview-frame-locators';
import {cardTitled, DEMO_RENDERERS, revealCard} from './demo-wall-helpers';
import {showInlineSurface} from './helpers';

/**
 * Counts what each guest document receives from the shell, to pin down
 * GuestFrame's contract: one RENDER_A2UI per document per payload, and one
 * SET_THEME per mounted frame per theme change.
 *
 * Every guest document records the messages its parent posts to it, from an
 * init script that runs before the renderer's own code. The top window records
 * each frame's RENDERER_READY and `load`, to tell which order they came in.
 * Everything is observed from the page and the guests; nothing reaches into
 * the shell's components.
 */

/** A message the guest's parent posted to it. */
interface Received {
  type: string;
  at: number;
}

/** A frame event the top window saw. */
interface FrameEvent {
  kind: 'RENDERER_READY' | 'A2UI_CATALOG' | 'load';
  frame: number | null;
  at: number;
}

interface QaWindow extends Window {
  __qaReceived?: Received[];
  __qaFrameEvents?: FrameEvent[];
}

/** Which kind of host a guest iframe sits in. */
type Consumer =
  'inline' | 'canvas' | 'demo-card' | 'coordinator' | 'gallery' | 'dockview' | 'other';

/**
 * How a guest iframe's host decides its consumer: the first entry whose host
 * contains the iframe. Inner hosts come before the ones they can sit in.
 */
const CONSUMERS: ReadonlyArray<{consumer: Exclude<Consumer, 'other'>; host: string}> = [
  {consumer: 'inline', host: PREVIEW_FRAME_HOSTS.inlineSurface},
  {consumer: 'canvas', host: PREVIEW_FRAME_HOSTS.sideCanvas},
  {consumer: 'demo-card', host: PREVIEW_FRAME_HOSTS.demoCard},
  {consumer: 'coordinator', host: PREVIEW_FRAME_HOSTS.demosCoordinator},
  {consumer: 'gallery', host: PREVIEW_FRAME_HOSTS.galleryPreview},
  {consumer: 'dockview', host: PREVIEW_FRAME_HOSTS.dockview},
];

/** What one guest document received, and where its iframe is. */
interface GuestDocument {
  consumer: Consumer;
  frameId: number | null;
  received: Received[];
  renders: number;
}

const RENDERER_ORIGINS = DEMO_RENDERERS.map(renderer => renderer.url);

/** The bundled catalog every test surface uses. */
const BASIC_CATALOG = 'https://a2ui.org/specification/v0_9/basic_catalog.json';

/** Long enough for any follow-up traffic to have arrived. */
const QUIET_MS = 1_500;

/** How long the delayed catalog and webfont responses are held. */
const CATALOG_DELAY_MS = 1_500;
const FONT_DELAY_MS = 3_000;

const FORM_VALUE = 'Ada Lovelace';

/**
 * A surface with an inline text field and a Canvas card. The chat splits it
 * into an inline frame and a "View in Canvas" card that opens the side canvas.
 */
function formPayload(): unknown[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'qa-form', catalogId: BASIC_CATALOG}},
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'qa-form',
        components: [
          {id: 'root', component: 'Column', children: ['name', 'canvas']},
          {
            id: 'name',
            component: 'TextField',
            label: 'Guest name',
            value: {path: '/name'},
            variant: 'shortText',
          },
          {
            id: 'canvas',
            component: {
              Canvas: {
                cardTitle: 'Form details',
                cardIcon: 'dashboard',
                autoOpen: false,
                children: ['canvas_text'],
              },
            },
          },
          {id: 'canvas_text', component: 'Text', text: 'CANVAS FORM DETAILS', variant: 'h3'},
        ],
      },
    },
    {version: 'v0.9', updateDataModel: {surfaceId: 'qa-form', path: '/name', value: ''}},
  ];
}

async function instrument(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const qa = window as QaWindow;
    if (window !== window.top) {
      const received: Received[] = (qa.__qaReceived = []);
      window.addEventListener(
        'message',
        event => {
          if (event.source !== window.parent) return;
          const type = (event.data as {type?: unknown} | null)?.type;
          if (typeof type === 'string') received.push({type, at: performance.now()});
        },
        true,
      );
      return;
    }

    const ids = new WeakMap<HTMLIFrameElement, number>();
    let nextId = 0;
    const idOf = (iframe: HTMLIFrameElement): number => {
      let id = ids.get(iframe);
      if (id === undefined) {
        id = ++nextId;
        ids.set(iframe, id);
        iframe.dataset['qaFrameId'] = String(id);
      }
      return id;
    };
    const frameEvents: FrameEvent[] = (qa.__qaFrameEvents = []);
    window.addEventListener(
      'message',
      event => {
        const type = (event.data as {type?: unknown} | null)?.type;
        if (type !== 'RENDERER_READY' && type !== 'A2UI_CATALOG') return;
        const iframe = Array.from(document.querySelectorAll('iframe')).find(
          candidate => candidate.contentWindow === event.source,
        );
        frameEvents.push({kind: type, frame: iframe ? idOf(iframe) : null, at: performance.now()});
      },
      true,
    );
    document.addEventListener(
      'load',
      event => {
        if (event.target instanceof HTMLIFrameElement) {
          frameEvents.push({kind: 'load', frame: idOf(event.target), at: performance.now()});
        }
      },
      true,
    );
  });
}

/** Every guest document on the page and what it has received so far. */
async function guestDocuments(page: Page): Promise<GuestDocument[]> {
  const documents: GuestDocument[] = [];
  for (const frame of page.frames()) {
    if (!RENDERER_ORIGINS.some(origin => frame.url().startsWith(origin))) continue;
    try {
      const received = await frame.evaluate(() => (window as QaWindow).__qaReceived ?? null);
      if (!received) continue;
      const element = await frame.frameElement();
      const {consumer, frameId} = await element.evaluate(
        (node, consumers): {consumer: Consumer; frameId: number | null} => {
          const iframe = node as HTMLElement;
          const match = consumers.find(entry => iframe.closest(entry.host) !== null);
          const id = iframe.dataset['qaFrameId'];
          return {
            consumer: match ? match.consumer : 'other',
            frameId: id === undefined ? null : Number(id),
          };
        },
        CONSUMERS,
      );
      documents.push({
        consumer,
        frameId,
        received,
        renders: received.filter(m => m.type === PreviewBridgeMessageType.RENDER_A2UI).length,
      });
    } catch {
      // The frame navigated or detached while being read.
    }
  }
  return documents;
}

async function totalTraffic(page: Page): Promise<number> {
  const documents = await guestDocuments(page);
  const events = await page.evaluate(() => (window as QaWindow).__qaFrameEvents?.length ?? 0);
  return documents.reduce((sum, doc) => sum + doc.received.length, events + documents.length);
}

/** Waits until no guest has received a message, and no frame announced itself, for QUIET_MS. */
async function waitForQuiet(page: Page): Promise<void> {
  let last = -1;
  let stableSince = Date.now();
  await expect
    .poll(
      async () => {
        const total = await totalTraffic(page);
        if (total !== last) {
          last = total;
          stableSince = Date.now();
        }
        return Date.now() - stableSince;
      },
      {timeout: 30_000, intervals: [250], message: 'guest traffic never settled'},
    )
    .toBeGreaterThanOrEqual(QUIET_MS);
}

async function frameEvents(page: Page): Promise<FrameEvent[]> {
  return page.evaluate(() => (window as QaWindow).__qaFrameEvents ?? []);
}

function describeDocuments(documents: GuestDocument[]): string {
  return JSON.stringify(
    documents.map(doc => ({
      consumer: doc.consumer,
      frame: doc.frameId,
      received: doc.received.map(m => m.type),
    })),
  );
}

/** Whether the frame's first RENDERER_READY reached the shell before its last `load`. */
function readyBeforeLoad(events: FrameEvent[], frameId: number | null): boolean {
  const ready = events.find(e => e.frame === frameId && e.kind === 'RENDERER_READY');
  const loads = events.filter(e => e.frame === frameId && e.kind === 'load');
  return !!ready && loads.length > 0 && ready.at < loads[loads.length - 1].at;
}

/**
 * Holds the guests' webfont files so their `load` event fires well after their
 * RENDERER_READY. The stylesheet itself is answered at once, since a pending
 * stylesheet in the head would hold the guest's scripts, and READY, as well.
 * It declares a font that an invisible pseudo-element uses, so every guest
 * requests the held file during its first layout, before its `load`. The
 * shell's own font requests are left alone.
 */
async function delayWebfonts(page: Page): Promise<void> {
  await page.route('https://fonts.googleapis.com/**', route =>
    route.request().frame() === page.mainFrame()
      ? route.fallback()
      : route.fulfill({
          contentType: 'text/css',
          body: `@font-face { font-family: 'QA Delayed'; src: url(https://fonts.gstatic.com/qa-delayed.woff2) format('woff2'); }
body::before { content: 'qa'; font-family: 'QA Delayed'; position: absolute; opacity: 0; }`,
        }),
  );
  await page.route('https://fonts.gstatic.com/qa-delayed.woff2', async route => {
    await new Promise(resolve => setTimeout(resolve, FONT_DELAY_MS));
    await route.fulfill({status: 404, body: ''}).catch(() => {});
  });
}

/** Holds a renderer's catalog response, so the shell resolves it late. */
async function delayCatalog(page: Page, rendererUrl: string): Promise<void> {
  await page.route(`${rendererUrl}/catalog**`, async route => {
    await new Promise(resolve => setTimeout(resolve, CATALOG_DELAY_MS));
    await route.continue().catch(() => {});
  });
}

/**
 * Reloads the inline surface's guest document in place, as a frame reload or a
 * renderer dev server's live reload does: the same URL, a new document. Waits
 * until the new document is the one the iframe shows.
 */
async function reloadInlineGuest(page: Page): Promise<void> {
  const guest = await (await inlineSurfaceIframe(page).elementHandle())!.contentFrame();
  await guest!.evaluate(() => {
    (window as QaWindow & {__qaReloaded?: boolean}).__qaReloaded = true;
    setTimeout(() => location.reload());
  });
  await expect
    .poll(
      () =>
        guest!
          .evaluate(() => (window as QaWindow & {__qaReloaded?: boolean}).__qaReloaded === true)
          .catch(() => true),
      {timeout: 10_000, message: 'the guest document never reloaded'},
    )
    .toBe(false);
}

async function toggleTheme(page: Page): Promise<void> {
  await page.getByRole('button', {name: /^Switch to (dark|light) theme$/}).click();
}

/**
 * Toggles the theme once and returns, for every guest document that had
 * finished its handshake before the toggle, how many SET_THEME it got after it.
 */
async function setThemeCountsAfterToggle(
  page: Page,
): Promise<Array<{consumer: Consumer; frameId: number | null; count: number}>> {
  const before = await guestDocuments(page);
  const marks = new Map<number | null, number>();
  for (const doc of before) {
    if (doc.received.some(m => m.type === PreviewBridgeMessageType.SET_THEME)) {
      marks.set(doc.frameId, doc.received.length);
    }
  }
  expect(marks.size, 'no guest had finished its handshake').toBeGreaterThan(0);
  await toggleTheme(page);
  await waitForQuiet(page);
  const after = await guestDocuments(page);
  return after
    .filter(doc => marks.has(doc.frameId) && doc.received.length >= marks.get(doc.frameId)!)
    .map(doc => ({
      consumer: doc.consumer,
      frameId: doc.frameId,
      count: doc.received
        .slice(marks.get(doc.frameId))
        .filter(m => m.type === PreviewBridgeMessageType.SET_THEME).length,
    }));
}

test.describe('GuestFrame sends', () => {
  test.beforeEach(async ({page}) => {
    await instrument(page);
  });

  for (const renderer of DEMO_RENDERERS) {
    test.describe(renderer.name, () => {
      test('an inline surface and the side canvas each get one RENDER_A2UI per document, and typed input survives the first catalog resolution', async ({
        page,
      }) => {
        // The Angular guest has its catalog in memory; the others fetch it, and
        // holding that fetch makes the shell resolve its first catalog after
        // the inline surface is up and edited.
        await delayCatalog(page, renderer.url);
        const inline = await showInlineSurface(page, renderer.url, formPayload());
        const field = inline.getByRole('textbox').first();
        await expect(field).toBeVisible({timeout: 15_000});
        await field.fill(FORM_VALUE);

        await expect
          .poll(async () => (await frameEvents(page)).some(e => e.kind === 'A2UI_CATALOG'), {
            timeout: 15_000,
          })
          .toBe(true);
        await waitForQuiet(page);

        await expect(field).toHaveValue(FORM_VALUE);
        let documents = await guestDocuments(page);
        const inlineDocs = documents.filter(doc => doc.consumer === 'inline');
        expect(inlineDocs, describeDocuments(documents)).toHaveLength(1);
        expect(inlineDocs[0].renders, describeDocuments(documents)).toBe(1);

        await page.getByRole('button', {name: 'View Form details in Canvas'}).click();
        await expect(sideCanvasFrame(page).locator('body')).toContainText('CANVAS FORM DETAILS', {
          timeout: 15_000,
        });
        await waitForQuiet(page);

        // A send without a target would reach the default frame, one of these two,
        // as an extra RENDER_A2UI; so would a canvas payload sent to the wrong frame.
        documents = await guestDocuments(page);
        expect(
          documents.map(doc => ({consumer: doc.consumer, renders: doc.renders})),
          describeDocuments(documents),
        ).toEqual(
          expect.arrayContaining([
            {consumer: 'inline', renders: 1},
            {consumer: 'canvas', renders: 1},
          ]),
        );
        expect(documents, describeDocuments(documents)).toHaveLength(2);
        await expect(inlineSurfaceFrame(page).getByRole('textbox').first()).toHaveValue(FORM_VALUE);
      });

      test('demo cards get one RENDER_A2UI per document and the coordinator none', async ({
        page,
      }) => {
        await page.setViewportSize({width: 1280, height: 1000});
        await page.goto(`/demos?renderer=${renderer.url}`);
        await revealCard(page.locator('a2ui-composer-demo-card').first());
        await waitForQuiet(page);

        const documents = await guestDocuments(page);
        const cards = documents.filter(doc => doc.consumer === 'demo-card');
        expect(cards.length, describeDocuments(documents)).toBeGreaterThan(0);
        for (const card of cards) {
          expect(card.renders, describeDocuments(documents)).toBe(1);
        }
        // The coordinator is the default target, so a send without a target would
        // show up here.
        const coordinator = documents.filter(doc => doc.consumer === 'coordinator');
        expect(coordinator.map(doc => doc.renders)).toEqual([0]);
      });

      test('a theme toggle on /demos reaches every handshaken card and the coordinator once', async ({
        page,
      }) => {
        await page.setViewportSize({width: 1280, height: 1000});
        await page.goto(`/demos?renderer=${renderer.url}`);
        await revealCard(page.locator('a2ui-composer-demo-card').first());
        await revealCard(cardTitled(page, 'Live Invitation Builder'));
        await waitForQuiet(page);

        for (let toggle = 0; toggle < 2; toggle++) {
          const counts = await setThemeCountsAfterToggle(page);
          expect(counts.filter(c => c.consumer === 'coordinator')).toHaveLength(1);
          expect(counts.filter(c => c.consumer === 'demo-card').length).toBeGreaterThan(1);
          expect(
            counts.filter(c => c.count !== 1),
            JSON.stringify(counts),
          ).toEqual([]);
        }
      });

      test('a theme toggle reaches the docked preview once', async ({page}) => {
        await page.goto(`/?renderer=${renderer.url}`);
        await expect(page.locator('.header-title')).not.toHaveText('A2UI Composer');
        await waitForQuiet(page);

        const documents = await guestDocuments(page);
        const docked = documents.filter(doc => doc.consumer === 'dockview');
        expect(docked, describeDocuments(documents)).toHaveLength(1);
        // The docked RenderedFrame has no payload input, so GuestFrame sends it
        // nothing: what it renders comes from the raw editor, which sends without a
        // target and has its own rules. Recorded, not asserted.
        test.info().annotations.push({
          type: 'raw-editor-sends',
          description: `${renderer.name}: docked guest received ${docked[0].renders} RENDER_A2UI`,
        });

        const counts = await setThemeCountsAfterToggle(page);
        expect(counts.filter(c => c.consumer === 'dockview')).toHaveLength(1);
        expect(
          counts.filter(c => c.count !== 1),
          JSON.stringify(counts),
        ).toEqual([]);
      });

      test('a theme toggle reaches the gallery preview once', async ({page}) => {
        await page.goto(`/gallery?renderer=${renderer.url}`);
        await expect(page.locator('.gallery-container')).toBeVisible();
        await waitForQuiet(page);

        for (let toggle = 0; toggle < 2; toggle++) {
          const counts = await setThemeCountsAfterToggle(page);
          expect(counts.map(c => c.consumer)).toEqual(['gallery']);
          expect(counts[0].count, JSON.stringify(counts)).toBe(1);
        }
      });

      test('a theme toggle reaches the inline surface and the side canvas once and keeps typed input', async ({
        page,
      }) => {
        const inline = await showInlineSurface(page, renderer.url, formPayload());
        await page.getByRole('button', {name: 'View Form details in Canvas'}).click();
        await expect(sideCanvasFrame(page).locator('body')).toContainText('CANVAS FORM DETAILS', {
          timeout: 15_000,
        });
        await waitForQuiet(page);
        const field = inline.getByRole('textbox').first();
        await field.fill(FORM_VALUE);

        const counts = await setThemeCountsAfterToggle(page);
        expect(counts.map(c => c.consumer).sort()).toEqual(['canvas', 'inline']);
        expect(
          counts.filter(c => c.count !== 1),
          JSON.stringify(counts),
        ).toEqual([]);
        await expect(field).toHaveValue(FORM_VALUE);
        const documents = await guestDocuments(page);
        expect(
          documents.filter(doc => doc.renders !== 1),
          describeDocuments(documents),
        ).toEqual([]);
      });

      test('an inline surface that reloads without a URL change gets one RENDER_A2UI', async ({
        page,
      }) => {
        const inline = await showInlineSurface(page, renderer.url, formPayload());
        await expect(inline.getByRole('textbox').first()).toBeVisible({timeout: 15_000});
        await waitForQuiet(page);

        await reloadInlineGuest(page);
        await expect(inline.getByRole('textbox').first()).toBeVisible({timeout: 15_000});
        await waitForQuiet(page);

        const documents = await guestDocuments(page);
        const inlineDocs = documents.filter(doc => doc.consumer === 'inline');
        expect(inlineDocs, describeDocuments(documents)).toHaveLength(1);
        expect(inlineDocs[0].renders, describeDocuments(documents)).toBe(1);
      });
    });
  }

  test.describe('with webfonts delayed past RENDERER_READY', () => {
    const react = DEMO_RENDERERS.find(renderer => renderer.name === 'React')!;

    test.beforeEach(async ({page}) => {
      await delayWebfonts(page);
    });

    test('an inline surface gets one RENDER_A2UI although its load comes after READY', async ({
      page,
    }) => {
      const inline = await showInlineSurface(page, react.url, formPayload());
      await expect(inline.getByRole('textbox').first()).toBeVisible({timeout: 15_000});
      const frameId = Number(await inlineSurfaceIframe(page).getAttribute('data-qa-frame-id'));
      await expect
        .poll(async () => readyBeforeLoad(await frameEvents(page), frameId), {
          timeout: FONT_DELAY_MS + 10_000,
          message: 'the guest never fired load after its RENDERER_READY',
        })
        .toBe(true);
      await waitForQuiet(page);

      const documents = await guestDocuments(page);
      const inlineDocs = documents.filter(doc => doc.consumer === 'inline');
      expect(inlineDocs, describeDocuments(documents)).toHaveLength(1);
      expect(inlineDocs[0].renders, describeDocuments(documents)).toBe(1);
    });

    test('an inline surface that reloads and announces itself before its load gets one RENDER_A2UI on load', async ({
      page,
    }) => {
      const inline = await showInlineSurface(page, react.url, formPayload());
      await expect(inline.getByRole('textbox').first()).toBeVisible({timeout: 15_000});
      const frameId = Number(await inlineSurfaceIframe(page).getAttribute('data-qa-frame-id'));
      const frameEventsSince = async (start: number) =>
        (await frameEvents(page)).slice(start).filter(e => e.frame === frameId);
      await expect
        .poll(async () => readyBeforeLoad(await frameEventsSince(0), frameId), {
          timeout: FONT_DELAY_MS + 10_000,
        })
        .toBe(true);
      await waitForQuiet(page);

      const start = (await frameEvents(page)).length;
      await reloadInlineGuest(page);
      await expect
        .poll(async () => readyBeforeLoad(await frameEventsSince(start), frameId), {
          timeout: FONT_DELAY_MS + 10_000,
          message: 'the reloaded guest should announce itself before its load',
        })
        .toBe(true);
      await expect(inline.getByRole('textbox').first()).toBeVisible({timeout: 15_000});
      await waitForQuiet(page);

      const documents = await guestDocuments(page);
      const inlineDocs = documents.filter(doc => doc.consumer === 'inline');
      expect(inlineDocs[0].renders, describeDocuments(documents)).toBe(1);
    });

    test('demo cards get one RENDER_A2UI although their load comes after READY', async ({page}) => {
      await page.setViewportSize({width: 1280, height: 1000});
      await page.goto(`/demos?renderer=${react.url}`);
      await revealCard(page.locator('a2ui-composer-demo-card').first());
      await expect
        .poll(
          async () => {
            const events = await frameEvents(page);
            const cards = (await guestDocuments(page)).filter(doc => doc.consumer === 'demo-card');
            return cards.length > 0 && cards.every(card => readyBeforeLoad(events, card.frameId));
          },
          {timeout: FONT_DELAY_MS + 10_000, message: 'a card never fired load after its READY'},
        )
        .toBe(true);
      await waitForQuiet(page);

      const documents = await guestDocuments(page);
      const cards = documents.filter(doc => doc.consumer === 'demo-card');
      for (const card of cards) {
        expect(card.renders, describeDocuments(documents)).toBe(1);
      }
    });
  });
});
