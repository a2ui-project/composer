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

import {expect, type FrameLocator, type Locator, Page} from '@playwright/test';
import {connectMockAgent, sseEvent} from '../src/app/agent-chat/test/mock-a2a-agent';
import {
  CATALOG_WATCHDOG_MESSAGE,
  CATALOG_WATCHDOG_TIMEOUT_MS,
} from '../src/app/storage/catalog-management/catalog-watchdog';
import {RENDERED_FRAME_SELECTORS} from '../src/app/preview/rendered/test/rendered-frame-selectors';
import {
  dockedPreview,
  inlineSurfaceFrame,
  renderedFrameContainer,
} from '../src/app/preview/testing/preview-frame-locators';

export interface MonacoModel {
  getValue(): string;
  setValue(value: string): void;
}

export interface WindowWithMonaco extends Window {
  monaco?: {
    editor: {
      getModels(): MonacoModel[];
    };
  };
}

/**
 * Timeout in milliseconds waiting for dockview tabs or frame containers to be visible.
 */
export const TAB_VISIBILITY_TIMEOUT_MS = 10_000;

/**
 * Timeout in milliseconds waiting for Monaco editor models to initialize.
 */
export const MONACO_MODEL_TIMEOUT_MS = 10_000;

/**
 * Duration in milliseconds to wait for the shell's draft synchronization debouncer
 * (300ms) to process editor content changes before switching tabs.
 */
export const MONACO_DRAFT_DEBOUNCE_MS = 350;

/**
 * Waits until the Monaco editor is visible and has a model in either the
 * Workspace Dockview tab or the Components Gallery card.
 */
export async function waitForMonacoEditor(page: Page): Promise<void> {
  const editorTab = page.locator('.dv-tab:has-text("A2UI JSON Editor")');
  const editorLocator = page.locator('a2ui-composer-monaco-editor .monaco-editor').first();
  try {
    // Monaco is used both inside a Dockview tab (Workspace) and directly inside
    // a card (Components Gallery), so wait for whichever is present first.
    await editorTab
      .or(editorLocator)
      .first()
      .waitFor({state: 'attached', timeout: TAB_VISIBILITY_TIMEOUT_MS});
    if ((await editorTab.count()) > 0) {
      const isActive = await editorTab.evaluate(el => el.classList.contains('dv-active-tab'));
      if (!isActive) {
        await editorTab.click();
      }
    }
  } catch {
    // If no tab is present, proceed to editorLocator check
  }

  await expect(editorLocator).toBeVisible({timeout: TAB_VISIBILITY_TIMEOUT_MS});

  await page.waitForFunction(
    () => {
      const monaco = (window as unknown as WindowWithMonaco).monaco;
      return (monaco?.editor?.getModels()?.length ?? 0) > 0;
    },
    undefined,
    {timeout: MONACO_MODEL_TIMEOUT_MS},
  );
}

/** Waits until the Rendered A2UI Preview tab is visible and selected. */
export async function waitForPreviewTab(page: Page): Promise<void> {
  const previewTab = page.locator('.dv-tab:has-text("Rendered A2UI Preview")');
  try {
    await previewTab.waitFor({state: 'attached', timeout: TAB_VISIBILITY_TIMEOUT_MS});
    const isActive = await previewTab.evaluate(el => el.classList.contains('dv-active-tab'));
    if (!isActive) {
      await previewTab.click();
    }
  } catch {
    // If no tab is present, proceed to container check
  }
  await expect(renderedFrameContainer(page)).toBeVisible({
    timeout: TAB_VISIBILITY_TIMEOUT_MS,
  });
}

/** Replaces the contents of the Raw A2UI editor. */
export async function setMonacoContent(page: Page, contents: string): Promise<void> {
  const previewTab = page.locator('.dv-tab:has-text("Rendered A2UI Preview")');
  const wasPreviewActive =
    (await previewTab.count()) > 0 &&
    (await previewTab.evaluate(el => el.classList.contains('dv-active-tab')));

  await waitForMonacoEditor(page);

  await page.evaluate(value => {
    const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
    if (model) {
      model.setValue(value);
    }
  }, contents);

  if (wasPreviewActive) {
    await page.waitForTimeout(MONACO_DRAFT_DEBOUNCE_MS);
    await waitForPreviewTab(page);
  }
}

/** Returns the contents of the Raw A2UI editor once it is no longer empty. */
export async function getMonacoContent(page: Page): Promise<string> {
  await waitForMonacoEditor(page);

  let contents = '';
  await expect
    .poll(async () => {
      contents = await page.evaluate(() => {
        const model = (window as unknown as WindowWithMonaco).monaco?.editor?.getModels()?.[0];
        return model ? model.getValue() : '';
      });
      return contents;
    })
    .not.toBe('');

  return contents;
}

/** The chat panels the workspace can mount, for journeys that should cover both. */
export const CHAT_PANELS = ['copilotkit', 'plain'] as const;

/** One of {@link CHAT_PANELS}. */
export type ChatPanelKind = (typeof CHAT_PANELS)[number];

/**
 * Makes the page mount the given chat panel. The app provides the CopilotKit
 * panel by default; the flag switches it to the dependency-free panel.
 */
export async function useChatPanel(page: Page, panel: ChatPanelKind): Promise<void> {
  await page.addInitScript(usePlain => {
    if (usePlain) {
      localStorage.setItem('a2ui_composer_force_plain_chat_panel', 'true');
    }
  }, panel === 'plain');
}

/** The chat history's scroll container. */
export function chatHistory(page: Page): Locator {
  return page.locator('.chat-history-container');
}

/**
 * Renders `payload` as an inline chat surface, the content-sized frame host:
 * connects the A2A chat to a mock agent whose every reply carries the payload,
 * against the given renderer, and sends one prompt. Returns the guest document
 * of the new surface once it exists.
 */
export async function showInlineSurface(
  page: Page,
  rendererUrl: string,
  payload: unknown[] | string,
): Promise<FrameLocator> {
  // Registered last, so it wins over any config.json route a spec installs.
  await page.route('**/config.json', route =>
    route.fulfill({json: {renderers: {default: {rendererUrl}}}}),
  );
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  await connectMockAgent(page, 'http://mock-agent.local', () =>
    sseEvent({
      taskId: 'task-inline-surface',
      contextId: 'ctx-inline-surface',
      message: {
        role: 'agent',
        parts: [{text: 'Inline surface.'}, {data: {mimeType: 'application/json+a2ui', data}}],
      },
      final: true,
    }),
  );
  const prompt = page.locator('.prompt-textarea');
  await prompt.fill('show the surface');
  await prompt.press('Enter');
  await expect(page.locator('.inline-surface-card')).toHaveCount(1);
  return inlineSurfaceFrame(page);
}

/**
 * The guest's content height as the bridge reports it. Mirrors
 * measureAndDispatch() in bridge/src/surface-resize-observer.ts: body margins
 * escape through the root element, so body.scrollHeight alone can be short.
 */
export function guestContentHeight(frame: FrameLocator): Promise<number> {
  return frame
    .locator('body')
    .evaluate(() =>
      Math.max(
        Math.ceil(document.body.getBoundingClientRect().height),
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
      ),
    );
}

/**
 * How far the guest's document can scroll: the root element's scrollHeight
 * minus its clientHeight. Positive means the guest, not the host, scrolls.
 */
export function guestScrollRange(frame: FrameLocator): Promise<number> {
  return frame.locator('html').evaluate(el => el.scrollHeight - el.clientHeight);
}

/** Geometry of the docked preview against the Dockview group that holds it. */
export interface DockedPreviewGeometry {
  /** Rendered height of the preview iframe. */
  frameHeight: number;
  /** Bottom edge of the preview iframe. */
  frameBottom: number;
  /** Height of the panel's content box, which a filling frame matches. */
  panelContentHeight: number;
  /** Bottom edge of the panel group. */
  panelBottom: number;
  /** How far the frame's host element itself can scroll. */
  hostScrollRange: number;
}

/** Measures the docked preview against its Dockview panel. */
export function dockedPreviewGeometry(page: Page): Promise<DockedPreviewGeometry> {
  return dockedPreview(page).evaluate((host, iframeSelector) => {
    const frame = host.querySelector(iframeSelector)!.getBoundingClientRect();
    const panel = host.closest('.dv-render-overlay')!;
    const style = getComputedStyle(panel);
    return {
      frameHeight: frame.height,
      frameBottom: frame.bottom,
      panelContentHeight:
        panel.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
      panelBottom: panel.getBoundingClientRect().bottom,
      hostScrollRange: host.scrollHeight - host.clientHeight,
    };
  }, RENDERED_FRAME_SELECTORS.iframe);
}

/**
 * Drags the Dockview sash under the docked preview's group by `deltaY` pixels,
 * resizing the preview group against the debug drawer below it.
 */
export async function dragPreviewSplitter(page: Page, deltaY: number): Promise<void> {
  const {x, y} = await dockedPreview(page).evaluate(host => {
    const groupBottom = host.closest('.dv-render-overlay')!.getBoundingClientRect().bottom;
    const sashes = Array.from(
      document.querySelectorAll(
        '.dv-split-view-container.dv-vertical > .dv-sash-container > .dv-sash',
      ),
    );
    const sash = sashes
      .map(el => el.getBoundingClientRect())
      .find(rect => Math.abs(rect.top + rect.height / 2 - groupBottom) <= rect.height + 2);
    if (!sash) {
      throw new Error(`No horizontal sash at the preview group's bottom edge (${groupBottom}px)`);
    }
    return {x: sash.left + sash.width / 2, y: sash.top + sash.height / 2};
  });
  await page.mouse.move(x, y);
  await page.mouse.down();
  // One move only: in headless Chromium a pointercancel follows the drag's
  // second pointermove (also before the sizing change), which ends Dockview's
  // sash drag after the first step.
  await page.mouse.move(x, y + deltaY);
  await page.mouse.up();
}

/**
 * Makes the page record when the last RENDERER_READY reached the top window,
 * for {@link expectNoCatalogWatchdog}. Call before navigating.
 */
export async function trackRendererReady(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (window !== window.top) return;
    window.addEventListener('message', event => {
      if ((event.data as {type?: string} | null)?.type === 'RENDERER_READY') {
        (window as WindowWithRendererReady).__lastRendererReadyAt = performance.now();
      }
    });
  });
}

interface WindowWithRendererReady extends Window {
  __lastRendererReadyAt?: number;
}

/**
 * How long after the last RENDERER_READY the catalog watchdog has certainly
 * either fired or been cleared: its timeout plus a margin.
 */
const CATALOG_WATCHDOG_SETTLE_MS = CATALOG_WATCHDOG_TIMEOUT_MS + 500;

/**
 * Asserts that the catalog handshake never timed out on this page. Waits until
 * the watchdog of the last RENDERER_READY has had time to fire, then reads the
 * shell's ErrorLogger history through Angular's dev-mode debugging API.
 * Requires {@link trackRendererReady} before navigation.
 */
export async function expectNoCatalogWatchdog(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const readyAt = (window as WindowWithRendererReady).__lastRendererReadyAt;
          return readyAt === undefined ? -1 : performance.now() - readyAt;
        }),
      {timeout: 20_000, message: 'RENDERER_READY never reached the page, or kept arriving'},
    )
    .toBeGreaterThan(CATALOG_WATCHDOG_SETTLE_MS);

  const history = await page.evaluate(() => {
    const ng = (window as unknown as {ng?: {getComponent(el: Element): unknown}}).ng;
    const shell = document.querySelector('a2ui-composer-shell');
    const component =
      ng && shell
        ? (ng.getComponent(shell) as {
            errorLogger?: {getHistory(): Array<{level: string; message: string}>};
          } | null)
        : null;
    return component?.errorLogger?.getHistory() ?? null;
  });
  // Tripwire: without the dev-mode API the check below would pass vacuously.
  expect(history, 'ErrorLogger history is unreadable').not.toBeNull();
  expect(history!.filter(item => item.message.includes(CATALOG_WATCHDOG_MESSAGE))).toEqual([]);
}
