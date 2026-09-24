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
import {QueryParser} from '../shell/query-parser/query-parser';

/** Opens an isolated Gallery draft with its renderer using the existing shared-design URL. */
@Injectable({providedIn: 'root'})
export class GalleryLauncher {
  private readonly document = inject(DOCUMENT);
  private readonly location = inject(Location);

  /** Snapshots the selected example and renderer before compressing the workspace handoff. */
  async open(payload: string, rendererUrl: string, rendererId: string | null): Promise<void> {
    const view = this.document.defaultView;
    if (!view) {
      throw new Error('The workspace cannot be opened in this environment.');
    }
    const workspaceUrl = new URL(this.location.prepareExternalUrl('/'), view.location.href);
    const compressed = await QueryParser.encodeSharedPayload(payload);
    const hash = new URLSearchParams();
    hash.set('renderer', rendererUrl);
    if (rendererId) {
      hash.set('rendererId', rendererId);
    }
    hash.set('a2ui', compressed);
    workspaceUrl.search = '';
    workspaceUrl.hash = hash.toString();
    view.location.assign(workspaceUrl.toString());
  }
}
