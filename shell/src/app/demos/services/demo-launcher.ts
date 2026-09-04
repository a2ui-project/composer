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

import {DOCUMENT, Location} from '@angular/common';
import {Injectable, inject} from '@angular/core';
import {Demo} from 'a2ui-bridge';
import {QueryParser} from '../../shell/query-parser/query-parser';
import {StartupConfigStateService} from '../../shell/startup-resolution/state/startup-config-state.service';

/**
 * Route the workspace is served from, relative to the app's base href.
 *
 * The workspace is the router's empty child path, so the app root *is* the
 * workspace; `Location.prepareExternalUrl` turns this into whatever prefix the
 * deployment is actually hosted under.
 */
const WORKSPACE_PATH = '/';

/**
 * Carries a demo off the `/demos` wall and into the composer workspace.
 *
 * This deliberately opens nothing of its own. It builds the same URL the Share
 * button builds — a shared-design link, `#a2ui=<deflate-raw base64url>` with the
 * renderer it was authored against — and hands it to the browser, so the demo
 * arrives in the workspace through the one path that is already proven end to end
 * (`ShareService` writes it, {@link QueryParser.parseSharedA2ui} reads it,
 * `StartupResolution.processSharedA2uiUrl` applies it, `StateSync` injects it into
 * the editor). A demo's `a2ui` field is already the renderer's own message array,
 * so nothing new is authored here either: it is the draft, verbatim.
 *
 * The navigation is a document load in the *same* tab, and both halves of that are
 * deliberate.
 *
 * A document load, because the hash is only read at two moments: application
 * bootstrap, and the `hashchange` event. Router navigation reaches neither — it
 * moves the URL with `history.pushState`, which fires no `hashchange` — so an
 * in-app route change would put the payload in the address bar and nothing would
 * ever read it. Reaching past the URL to push the draft into `StateSync` directly
 * would read it, but that is a second, private way to load a design, and the point
 * of this service is that there is only one.
 *
 * The same tab, because the workspace and the wall are two routes of one
 * application that the shell's own navigation already moves between in place. A
 * second tab would boot a second composer — its own coordinator frame, its own
 * renderer connection — and leave the first holding up to `MAX_MOUNTED_CARDS` live
 * renderer iframes nobody is looking at, which is the memory profile the wall's
 * mount cap exists to prevent. `location.assign` is also never popup-blocked, and
 * the reader's way back is the one they already expect: the Back button, which
 * returns to the wall because `StartupResolution` strips the consumed payload from
 * the URL with `replaceState` rather than pushing a second entry.
 */
@Injectable({providedIn: 'root'})
export class DemoLauncher {
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);
  private readonly startupConfigState = inject(StartupConfigStateService);

  /**
   * Loads the workspace with this demo's A2UI as the active draft.
   *
   * @param demo The demo whose payload should become the workspace draft.
   */
  async openInWorkspace(demo: Demo): Promise<void> {
    const view = this.document.defaultView;
    if (!view) {
      return;
    }

    const url = await this.buildWorkspaceUrl(demo, view.location.href);
    if (!url) {
      return;
    }
    view.location.assign(url);
  }

  /**
   * Builds the shared-design link that reopens a demo in the workspace.
   *
   * @param demo The demo whose payload the link should carry.
   * @param currentHref The document location the link is resolved against.
   * @return An absolute URL, or null when the demo carries no payload to send.
   */
  private async buildWorkspaceUrl(demo: Demo, currentHref: string): Promise<string | null> {
    // A demo with no messages has no design to open, and a workspace loaded with an
    // empty draft is worse than staying on the wall: it would look like the demo had
    // been opened and found to be blank.
    const a2ui = demo.a2ui ?? [];
    if (a2ui.length === 0) {
      return null;
    }

    const compressed = await QueryParser.encodeSharedPayload(JSON.stringify(a2ui));
    if (!compressed) {
      return null;
    }

    const workspaceUrl = new URL(this.location.prepareExternalUrl(WORKSPACE_PATH), currentHref);
    // Any renderer or startup parameters already on the wall's URL have done their
    // job; the fragment below restates the renderer the demo was authored against.
    workspaceUrl.search = '';
    workspaceUrl.hash = QueryParser.buildSharedA2uiHash(
      compressed,
      this.startupConfigState.resolvedUrl(),
      this.startupConfigState.selectedRendererId(),
    );
    return workspaceUrl.toString();
  }
}
