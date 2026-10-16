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
 * Query parameters the preview adds to a renderer's configured URL when it loads
 * that renderer in the iframe.
 *
 * Code that compares the iframe's URL with a configured renderer URL removes these
 * first, so every parameter the preview adds has to be listed here.
 * `rendered-frame.spec.ts` fails if the preview adds one that isn't.
 */
export enum PreviewUrlParam {
  /** A host origin the renderer's bridge accepts messages from, one per origin. */
  ORIGIN = 'origin',
  /** The theme the renderer starts in. Later changes are sent over the bridge. */
  THEME = 'theme',
}
