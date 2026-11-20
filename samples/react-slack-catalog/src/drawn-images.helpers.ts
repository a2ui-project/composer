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
 * @fileoverview What the specs of drawn images, such as charts and scorecards, share: the
 * A2UI messages they send to one surface, and a stand-in for the blob URLs the preview
 * serves drawn images from, which records each drawing so a spec can read it back.
 */

import {type A2uiMessage, type UpdateComponentsMessage} from '@a2ui/web_core/v0_9';
import {afterEach, beforeEach, vi, type MockInstance} from 'vitest';
import {SLACK_CATALOG_ID} from './catalog';

/** Builds the A2UI messages a spec sends to one surface of the Slack catalog. */
export interface SurfaceMessages {
  /** Creates the surface. */
  readonly createSurface: A2uiMessage;
  /** Adds or replaces components of the surface. */
  updateComponents(
    components: UpdateComponentsMessage['updateComponents']['components'],
  ): A2uiMessage;
  /** Writes `value` to the surface's data model at `path`, which defaults to the root. */
  updateData(value: unknown, path?: string): A2uiMessage;
}

/** The messages for the surface `surfaceId`. */
export function surfaceMessages(surfaceId: string): SurfaceMessages {
  return {
    createSurface: {
      version: 'v0.9',
      createSurface: {surfaceId, catalogId: SLACK_CATALOG_ID},
    },
    updateComponents: components => ({
      version: 'v0.9',
      updateComponents: {surfaceId, components},
    }),
    updateData: (value, path = '/') => ({
      version: 'v0.9',
      updateDataModel: {surfaceId, path, value},
    }),
  };
}

/** The stand-in for the blob URLs that `stubBlobUrls` installs. */
export interface BlobUrlStub {
  /** The spy on `URL.createObjectURL`, which serves each drawing. */
  readonly createObjectURL: MockInstance<typeof URL.createObjectURL>;
  /** The spy on `URL.revokeObjectURL`, which frees a drawing's URL. */
  readonly revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;
  /** The SVG markup of each image drawn so far, in the order it was drawn. */
  drawnSvgs(): Promise<string[]>;
}

/**
 * Has each test in the calling `describe` serve drawn images at `blob:image-1`,
 * `blob:image-2` and so on, in the order they are drawn, and only record the URLs it is
 * asked to free. Fixed URLs let a spec name the image a block shows.
 */
export function stubBlobUrls(): BlobUrlStub {
  let createObjectURL: MockInstance<typeof URL.createObjectURL>;
  let revokeObjectURL: MockInstance<typeof URL.revokeObjectURL>;

  beforeEach(() => {
    let created = 0;
    createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:image-${++created}`);
    revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  return {
    get createObjectURL() {
      return createObjectURL;
    },
    get revokeObjectURL() {
      return revokeObjectURL;
    },
    drawnSvgs: () => Promise.all(createObjectURL.mock.calls.map(([blob]) => (blob as Blob).text())),
  };
}
