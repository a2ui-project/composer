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

// @vitest-environment node
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

/**
 * Matches any viewport-relative length unit.
 *
 * This pattern and FULL_HEIGHT are repeated in the other sample workspaces and
 * in bridge/src/lit/lit-bridge.spec.ts. The samples are separate packages with
 * no shared test-only module between them, so the copies have to be kept in
 * step by hand.
 */
const VIEWPORT_UNIT = /\d+\s*(vh|dvh|svh|lvh|vmin|vmax|vb|vi)\b/i;

/** Matches a full-height declaration that inherits the iframe viewport. */
const FULL_HEIGHT = /height:\s*'?100%/i;

/** Guest document rendered inside the preview iframe. */
const INDEX_HTML = fileURLToPath(new URL('../index.html', import.meta.url));

/**
 * The host sizes the preview iframe to the height the guest reports, so any
 * guest length derived from the viewport is a function of the host's last
 * decision. That closes a SURFACE_RESIZE feedback loop in which the guest keeps
 * reporting a height larger than the frame it was just given.
 */
describe('Lit sample guest sizing', () => {
  it('keeps index.html free of viewport-coupled sizing', () => {
    const html = readFileSync(INDEX_HTML, 'utf8');

    expect(html).not.toMatch(VIEWPORT_UNIT);
    expect(html).not.toMatch(FULL_HEIGHT);
  });
});
