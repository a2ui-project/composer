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

import {type ThemePreference} from 'a2ui-bridge';
import {BlockKitExport} from './BlockKitExport';
import {SlackPreviewRenderer} from './SlackPreviewRenderer';
import {SlackPreviewState} from './SlackPreviewState';
import {type PreviewSnapshot} from './preview-snapshot';

/** Inputs to `SlackPreview`. */
interface SlackPreviewProps {
  /** The render to show. */
  readonly snapshot: PreviewSnapshot;
  /** Composer's theme, which the Slack message follows. */
  readonly theme?: ThemePreference;
  /** Called with a Slack input's `action_id` and new value as the user types. */
  readonly updateInput: (actionId: string, value: string) => void;
  /** Called with a Slack button's `action_id` when the user clicks it. */
  readonly dispatch: (actionId: string) => void | Promise<void>;
}

/**
 * The Slack preview page: the rendered message and its Block Kit export once a
 * render is ready, otherwise the empty, waiting or error state, with any
 * diagnostics below.
 */
export function SlackPreview({snapshot, theme, dispatch, updateInput}: SlackPreviewProps) {
  return (
    <SlackPreviewState
      theme={theme}
      renderExport={readySnapshot => <BlockKitExport snapshot={readySnapshot} />}
      renderReady={readySnapshot => (
        <SlackPreviewRenderer
          dispatch={dispatch}
          updateInput={updateInput}
          snapshot={readySnapshot}
          theme={theme}
        />
      )}
      snapshot={snapshot}
    />
  );
}
