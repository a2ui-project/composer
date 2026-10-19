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
import {collectActionIds} from './action-registry';
import {
  DiagnosticCode,
  DiagnosticLevel,
  type PreviewDiagnostic,
  type PreviewSnapshot,
} from './preview-snapshot';

/** The class slack-blocks-to-jsx gives each Block Kit button it draws. */
const SLACK_BUTTON_CLASS = 'slack_blocks_to_jsx__button_element';

/** Inputs to `SlackPreviewRenderer`. */
interface SlackPreviewRendererProps {
  /** A ready render. Its diagnostics are shown by `SlackPreviewState`, not here. */
  readonly snapshot: PreviewSnapshot;
  /** Composer's theme, which the Slack message follows. */
  readonly theme?: ThemePreference;
  /** Called with a Slack input's `action_id` and new value as the user types. */
  readonly updateInput: (actionId: string, value: string) => void;
  /** Called with a Slack button's `action_id` when the user clicks it. */
  readonly dispatch: (actionId: string) => void | Promise<void>;
}

type SlackRendererBlocks = RendererProps['blocks'];
type SlackRendererTheme = RendererProps['theme'];

/**
 * Draws a ready render as a Slack message with the Tightknit Block Kit renderer,
 * and sends its button clicks and input edits back to the session. Shows an
 * error if dispatching a click fails.
 */
export function SlackPreviewRenderer({
  snapshot,
  theme,
  dispatch,
  updateInput,
}: SlackPreviewRendererProps) {
  const inputResetKey = `${theme ?? 'system'}-${snapshot.inputResetKey ?? 0}`;
  const inputBridge = useSlackInputBridge(snapshot.blocks, updateInput, inputResetKey);
  const actionIds = useMemo(() => collectActionIds(snapshot.blocks), [snapshot.blocks]);
  const [dispatchError, setDispatchError] = useState<PreviewDiagnostic | undefined>();
  const rendererTheme = theme as SlackRendererTheme | undefined;

  useEffect(() => {
    setDispatchError(undefined);
  }, [snapshot.revision]);

  const dispatchCurrentAction = useCallback(
    (actionId: string | undefined) => {
      if (!actionId || !actionIds.has(actionId)) {
        return;
      }

      setDispatchError(undefined);
      const reportDispatchFailure = (error: unknown) => {
        setDispatchError({
          level: DiagnosticLevel.ERROR,
          code: DiagnosticCode.SLACK_ACTION_DISPATCH_FAILED,
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

  // The renderer has two ways to "click" a button, and each reaches only one of
  // these handlers, so one click dispatches once:
  // - The drawn Slack buttons. The renderer gives them no click callback, so this
  //   listens on the section and finds the button by its class; slack-blocks-to-jsx
  //   sets the button's `id` to its `action_id`.
  // - The renderer's own "Simulate" buttons, listed under the message. They call
  //   `onInteraction` and don't have the Slack button class, so `handleNativeClick`
  //   ignores them.
  const handleNativeClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const button = target.closest(`button.${SLACK_BUTTON_CLASS}`);
      if (!(button instanceof HTMLButtonElement)) {
        return;
      }
      if (!event.currentTarget.contains(button)) {
        return;
      }

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

  return (
    <section
      aria-label="Slack preview"
      ref={inputBridge.ref}
      onChange={inputBridge.onChange}
      onCompositionEnd={inputBridge.onCompositionEnd}
      onKeyDownCapture={inputBridge.onKeyDown}
      onClick={handleNativeClick}
    >
      <Renderer
        key={inputResetKey}
        blocks={snapshot.blocks as SlackRendererBlocks}
        name="A2UI Preview"
        onInteraction={handleInteraction}
        surface="message"
        theme={rendererTheme}
        validate
      />
      {dispatchError ? (
        <ul aria-label="Preview diagnostics">
          <li>
            {dispatchError.level}: {dispatchError.code} {dispatchError.message}
          </li>
        </ul>
      ) : null}
    </section>
  );
}
