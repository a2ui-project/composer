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

import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {Demo} from 'a2ui-bridge';
import {DemoLauncher} from './demo-launcher';
import {QueryParser} from '../../shell/query-parser/query-parser';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';

const RENDERER_URL = 'http://localhost:3456/';
const RENDERER_ID = 'basic-catalog';
const WALL_HREF = 'http://localhost:4200/demos?renderer=http%3A%2F%2Flocalhost%3A3456';

const DEMO: Demo = {
  id: 'simple-login-form',
  name: 'Simple Login Form',
  description: 'A login form with validation.',
  a2ui: [
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: 'gallery-simple-login-form',
        catalogId: 'https://a2ui.org/default_catalog.json',
      },
    },
  ],
};

describe('DemoLauncher', () => {
  let assign: ReturnType<typeof vi.fn>;
  let launcher: DemoLauncher;

  beforeEach(() => {
    assign = vi.fn();
    const fakeDocument = {
      defaultView: {location: {href: WALL_HREF, assign}},
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: DOCUMENT, useValue: fakeDocument},
        {
          provide: StartupConfigStateService,
          useValue: {
            resolvedUrl: signal<string | null>(RENDERER_URL),
            selectedRendererId: signal<string | null>(RENDERER_ID),
          },
        },
      ],
    });
    launcher = TestBed.inject(DemoLauncher);
  });

  /** Reads back the URL the launcher navigated the tab to. */
  function navigatedTo(): URL {
    expect(assign).toHaveBeenCalledTimes(1);
    return new URL(assign.mock.calls[0][0] as string);
  }

  it('carries the demo into the workspace in the share flow’s own encoding', async () => {
    await launcher.openInWorkspace(DEMO);

    const url = navigatedTo();
    const params = new URLSearchParams(url.hash.replace(/^#/, ''));

    // The workspace is the app root, and the payload travels in the fragment the
    // Share button writes and StartupResolution already knows how to read.
    expect(url.origin).toBe('http://localhost:4200');
    expect(url.pathname).toBe('/');
    expect(url.search).toBe('');
    expect(params.get('a2ui')).toMatch(/^d1\./);

    // Round-tripping through the parser is the assertion that matters: it proves the
    // fragment is not merely shaped like a shared link but is one.
    const parsed = await QueryParser.parseSharedA2ui(url.hash);
    expect(parsed.error).toBeNull();
    expect(JSON.parse(parsed.payload!)).toEqual(DEMO.a2ui);
  });

  it('names the renderer the demo was authored against', async () => {
    await launcher.openInWorkspace(DEMO);

    const params = new URLSearchParams(navigatedTo().hash.replace(/^#/, ''));

    // A design is only meaningful against the catalog that served it, so the link
    // pins the renderer exactly as a shared link does.
    expect(params.get('renderer')).toBe(RENDERER_URL);
    expect(params.get('rendererId')).toBe(RENDERER_ID);
  });

  it('navigates the current tab rather than opening a second composer', async () => {
    await launcher.openInWorkspace(DEMO);

    // A second tab would boot a second coordinator frame and renderer connection while
    // leaving the wall's live frames alive behind it.
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('stays put when the demo carries no payload to open', async () => {
    await launcher.openInWorkspace({...DEMO, a2ui: []});

    expect(assign).not.toHaveBeenCalled();
  });
});
