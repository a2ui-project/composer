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

import type {FrameLocator, Locator, Page} from '@playwright/test';
import {DEMO_CARD_SELECTORS} from '../../demos/test/demo-card-selectors';
import {RENDERED_FRAME_SELECTORS} from '../rendered/test/rendered-frame-selectors';

/**
 * Playwright locators for the preview frames the shell embeds: RenderedFrame in
 * the workspace, gallery, chat and canvas, and the iframe of each demo card. The
 * e2e and visual tests reach the guest documents through these, so a change
 * to the frames' markup is made here and in the selector modules they read.
 *
 * Code that runs in the page (evaluate callbacks and init scripts) cannot call
 * the locators below; it imports the selector modules and takes selectors as
 * arguments instead. Kept free of Angular so that the Playwright runner can
 * load it.
 */

/** Where a locator searches: the whole page, or inside an element. */
type Scope = Page | Locator;

/** The guest iframe of every RenderedFrame inside `scope`. */
export function previewIframe(scope: Scope): Locator {
  return scope.locator(RENDERED_FRAME_SELECTORS.iframe);
}

/** The guest document of the single RenderedFrame inside `scope`. */
export function previewFrame(scope: Scope): FrameLocator {
  return previewIframe(scope).contentFrame();
}

/** The guest document of the first RenderedFrame inside `scope`, in document order. */
export function firstPreviewFrame(scope: Scope): FrameLocator {
  return previewIframe(scope).first().contentFrame();
}

/** The sized container of every RenderedFrame inside `scope`. */
export function renderedFrameContainer(scope: Scope): Locator {
  return scope.locator(RENDERED_FRAME_SELECTORS.container);
}

/** The preview frame host in the Components Gallery's Preview card. */
export function galleryPreview(page: Page): Locator {
  return page.locator('.preview-card a2ui-composer-rendered-frame');
}

/** The hidden preview frame host that coordinates the /demos page. */
export function demosCoordinator(page: Page): Locator {
  return page.locator('.coordinator-frame a2ui-composer-rendered-frame');
}

/** The preview frame host in the composer workspace's "Rendered" Dockview panel. */
export function dockedPreview(page: Page): Locator {
  return page.locator('.dockview-root a2ui-composer-rendered-frame');
}

/** The sized container of the inline chat surface. */
export function inlineSurfaceContainer(page: Page): Locator {
  return renderedFrameContainer(page.locator('.inline-surface-card'));
}

/**
 * The iframe of the inline chat surface, or of the n-th one in the transcript
 * (0-based) when `index` is given.
 */
export function inlineSurfaceIframe(scope: Scope, index?: number): Locator {
  const iframes = previewIframe(scope.locator('.inline-surface-card'));
  return index === undefined ? iframes : iframes.nth(index);
}

/**
 * The guest document of the inline chat surface, or of the n-th one in the
 * transcript (0-based) when `index` is given.
 */
export function inlineSurfaceFrame(scope: Scope, index?: number): FrameLocator {
  return inlineSurfaceIframe(scope, index).contentFrame();
}

/** The guest document of the A2A chat's side canvas. */
export function sideCanvasFrame(page: Page): FrameLocator {
  return previewFrame(page.locator('.side-canvas-viewport'));
}

/** The demo card's iframe, which exists only while the card holds a frame slot. */
export function demoCardIframe(card: Locator): Locator {
  return card.locator(DEMO_CARD_SELECTORS.iframe);
}

/** The guest document of the demo card's iframe. */
export function demoCardFrame(card: Locator): FrameLocator {
  return demoCardIframe(card).contentFrame();
}

/** The box the demo card's frame sits in. */
export function demoCardSurface(card: Locator): Locator {
  return card.locator(DEMO_CARD_SELECTORS.surface);
}

/** The skeleton that covers the demo card's frame until the card reveals its demo. */
export function demoCardPlaceholder(card: Locator): Locator {
  return card.locator(DEMO_CARD_SELECTORS.placeholder);
}
