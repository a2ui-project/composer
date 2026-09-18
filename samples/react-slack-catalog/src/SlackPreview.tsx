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
import {SlackPreviewState, type ReadyPreviewSnapshot} from './SlackPreviewState';
import {type PreviewSnapshot} from './preview-session';

export interface SlackPreviewProps {
  readonly snapshot: PreviewSnapshot;
  readonly theme?: ThemePreference;
  readonly updateInput: (actionId: string, value: string) => void;
  readonly dispatch: (actionId: string) => void | Promise<void>;
}

export function SlackPreview({snapshot, theme, dispatch, updateInput}: SlackPreviewProps) {
  return (
    <SlackPreviewState
      theme={theme}
      renderExport={readySnapshot => <BlockKitExport snapshot={readySnapshot} />}
      renderReady={readySnapshot => (
        <SlackPreviewRenderer
          dispatch={dispatch}
          updateInput={updateInput}
          snapshot={withoutStateDiagnostics(readySnapshot)}
          theme={theme}
        />
      )}
      snapshot={snapshot}
    />
  );
}

function withoutStateDiagnostics(snapshot: ReadyPreviewSnapshot): ReadyPreviewSnapshot {
  if (snapshot.diagnostics.length === 0) return snapshot;

  return {
    ...snapshot,
    diagnostics: [],
  };
}
