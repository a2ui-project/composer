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
 * images in one message match: their font, their neutral colors, and how they shorten
 * text that doesn't fit.
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

/** Shortens text to at most `maxLength` characters, ending it with an ellipsis when cut. */
export function clipText(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}
