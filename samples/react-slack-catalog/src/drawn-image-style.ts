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
 * @fileoverview The look that the images the preview draws have in common, so the
 * images in one message match: their font, weights and neutral colors, how they place
 * text by its baseline, estimate its width and shorten it when it doesn't fit, and how
 * they round coordinates.
 */

/** The font of drawn images: the system's sans-serif. */
export const DRAWN_IMAGE_FONT_FAMILY = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** The neutral colors of drawn images. Both text colors pass 4.5:1 contrast on the background. */
export enum DrawnImageColor {
  /** Titles, values, and other main text. */
  INK = '#1f2328',
  /** Labels and other secondary text. */
  MUTED = '#57606a',
  /** Gridlines and borders. */
  RULE = '#d0d7de',
  /** The fill behind a label, such as a scorecard's status. */
  SURFACE = '#f6f8fa',
  /** The image's background. */
  BACKGROUND = '#ffffff',
}

/** The font weights of drawn text, as CSS `font-weight` numbers. */
export enum FontWeight {
  /** Titles, team names, and the status. */
  SEMIBOLD = 600,
  /** Scores. */
  BOLD = 700,
}

/**
 * The height of a capital letter, as a fraction of the font size. SVG places text by its
 * baseline, so the drawings use this to put the middle or the top of a line of text where
 * they want it.
 */
const CAP_HEIGHT = 0.7;

/** The baseline that centers a line of text at `fontSize` on `middleY`. */
export function baselineCenteredOn(middleY: number, fontSize: number): number {
  return middleY + (fontSize * CAP_HEIGHT) / 2;
}

/** The baseline that puts the top of a line of text at `fontSize` at `topY`. */
export function baselineBelow(topY: number, fontSize: number): number {
  return topY + fontSize * CAP_HEIGHT;
}

/**
 * The average width of a character, as a fraction of the font size. SVG text doesn't wrap
 * or shrink by itself, and an image can't measure text in the viewer's font, so the
 * drawings estimate widths with this. It is a little wide for most text, so text laid out
 * with it fits with room to spare.
 */
const AVERAGE_CHARACTER_WIDTH = 0.6;

/** The estimated width of `text` at `fontSize`, in the same units as the font size. */
export function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * AVERAGE_CHARACTER_WIDTH;
}

/** How many characters fit in `width` at `fontSize`, by the same estimate. */
export function charactersThatFit(width: number, fontSize: number): number {
  return Math.floor(width / (fontSize * AVERAGE_CHARACTER_WIDTH));
}

/**
 * Rounds a coordinate to two decimal places: finer than a pixel, and short enough to keep
 * the SVG markup small.
 */
export function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Shortens text to at most `maxLength` characters, ending it with an ellipsis when cut. */
export function clipText(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}
