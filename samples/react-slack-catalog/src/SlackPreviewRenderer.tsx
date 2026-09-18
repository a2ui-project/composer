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

import {useCallback, useEffect, useMemo, useState, type MouseEvent} from 'react';
import {useSlackInputBridge} from './useSlackInputBridge';
import {
  Renderer,
  type RendererProps,
  type SlackInteractionPayload,
} from '@tightknitai/storybook-addon-slack-block-kit';
import {type ThemePreference} from 'a2ui-bridge';
import {type KnownBlock} from '@slack/types';
import {type PreviewDiagnostic, type PreviewSnapshot} from './preview-session';

const SLACK_BUTTON_CLASS = 'slack_blocks_to_jsx__button_element';

export interface SlackPreviewRendererProps {
  readonly snapshot: PreviewSnapshot;
  readonly theme?: ThemePreference;
  readonly updateInput: (actionId: string, value: string) => void;
  readonly dispatch: (actionId: string) => void | Promise<void>;
}

type SlackRendererBlocks = RendererProps['blocks'];
type SlackRendererTheme = RendererProps['theme'];

export function SlackPreviewRenderer({
  snapshot,
  theme,
  dispatch,
  updateInput,
}: SlackPreviewRendererProps) {
  const inputResetKey = `${theme ?? 'system'}-${snapshot.inputResetKey ?? 0}`;
  const inputBridge = useSlackInputBridge(snapshot.blocks, updateInput, inputResetKey);
  const actionIds = useMemo(() => collectCurrentActionIds(snapshot.blocks), [snapshot.blocks]);
  const [dispatchError, setDispatchError] = useState<PreviewDiagnostic | undefined>();
  const rendererTheme = theme as SlackRendererTheme | undefined;

  useEffect(() => {
    setDispatchError(undefined);
  }, [snapshot.revision]);

  const dispatchCurrentAction = useCallback(
    (actionId: string | undefined) => {
      if (!actionId || !actionIds.has(actionId)) return;

      setDispatchError(undefined);
      const reportDispatchFailure = (error: unknown) => {
        setDispatchError({
          level: 'error',
          code: 'SLACK_ACTION_DISPATCH_FAILED',
          message: error instanceof Error ? error.message : String(error),
        });
      };
      try {
        void Promise.resolve(dispatch(actionId)).catch(reportDispatchFailure);
      } catch (error) {
        reportDispatchFailure(error);
      }
    },
    [actionIds, dispatch],
  );

  const handleNativeClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest(`button.${SLACK_BUTTON_CLASS}`);
      if (!(button instanceof HTMLButtonElement)) return;
      if (!event.currentTarget.contains(button)) return;

      dispatchCurrentAction(button.id);
    },
    [dispatchCurrentAction],
  );

  const handleInteraction = useCallback(
    (payload: SlackInteractionPayload) => {
      dispatchCurrentAction(payload.action_id);
    },
    [dispatchCurrentAction],
  );

  const diagnostics = dispatchError
    ? [...snapshot.diagnostics, dispatchError]
    : snapshot.diagnostics;

  return (
    <section
      aria-label="Slack preview"
      ref={inputBridge.ref}
      onChange={inputBridge.onChange}
      onCompositionEnd={inputBridge.onCompositionEnd}
      onKeyDownCapture={inputBridge.onKeyDown}
      onClick={handleNativeClick}
    >
      {snapshot.status === 'ready' ? (
        <Renderer
          key={inputResetKey}
          blocks={snapshot.blocks as SlackRendererBlocks}
          name="A2UI Preview"
          onInteraction={handleInteraction}
          surface="message"
          theme={rendererTheme}
          validate
        />
      ) : (
        <p style={{padding: 24, color: '#666', fontFamily: 'sans-serif', textAlign: 'center'}}>
          A2UI Slack Sandbox active. Waiting for Slack RENDER_A2UI payloads...
        </p>
      )}
      {diagnostics.length > 0 ? (
        <ul aria-label="Preview diagnostics">
          {diagnostics.map(diagnostic => (
            <li key={`${snapshot.revision}-${diagnostic.code}-${diagnostic.componentId ?? ''}`}>
              {diagnostic.level}: {diagnostic.code} {diagnostic.message}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function collectCurrentActionIds(blocks: readonly KnownBlock[]): ReadonlySet<string> {
  const actionIds = new Set<string>();
  for (const block of blocks) collectActionIds(block, actionIds);
  return actionIds;
}

function collectActionIds(value: unknown, actionIds: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectActionIds(item, actionIds);
    return;
  }

  if (typeof value !== 'object' || value === null) return;

  for (const [key, child] of Object.entries(value)) {
    if (key === 'action_id' && typeof child === 'string') {
      actionIds.add(child);
    } else {
      collectActionIds(child, actionIds);
    }
  }
}
