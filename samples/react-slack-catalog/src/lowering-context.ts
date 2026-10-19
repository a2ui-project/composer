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

import {type ChannelNode, type Renderable} from '@copilotkit/channels-ui';
import {type ActionDispatchEntry} from './action-dispatch';
import {type DrawnImage} from './drawn-image-blocks';
import {type DrawnImageStore} from './drawn-image-store';
import {type InputComponentType, type InputDispatchEntry} from './form-input';
import {type PreviewDiagnostic} from './preview-snapshot';

/**
 * What lowering one surface collects while it walks the components: the
 * diagnostics, the Slack buttons and inputs it drew, by `action_id`, and the
 * images it drew.
 */
export interface LoweringState {
  readonly revision: number;
  readonly diagnostics: PreviewDiagnostic[];
  readonly actions: Map<string, ActionDispatchEntry>;
  readonly inputs: Map<string, InputDispatchEntry>;
  /** Serves the images drawn in this render. */
  readonly drawnImages: DrawnImageStore;
  /**
   * The URLs of the images drawn in this render, which the Generated Block Kit export
   * swaps for uploaded files.
   */
  readonly drawnImageUrls: Set<string>;
  nextActionOrdinal: number;
}

/** What lowering one component can use besides its bound props. */
export interface LowerComponentContext {
  readonly componentId: string;
  readonly surfaceId: string;
  readonly rawProps: Readonly<Record<string, unknown>>;
  readonly children: (id: string, basePath?: string) => Renderable;
  readonly dispatch: (action: unknown) => string;
  readonly input: (type: InputComponentType) => InputDispatchEntry;
  readonly diagnostics: PreviewDiagnostic[];
  /** Serves an image drawn while lowering and returns the Channels UI `Image` that shows it. */
  readonly placeDrawnImage: (image: DrawnImage) => ChannelNode;
}
