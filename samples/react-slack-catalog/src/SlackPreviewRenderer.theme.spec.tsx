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

import {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ThemePreference} from 'a2ui-bridge';
import {type KnownBlock} from '@slack/types';
import {SlackPreviewRenderer} from './SlackPreviewRenderer';
import {type PreviewSnapshot} from './preview-session';

const readySnapshot: PreviewSnapshot = {
  revision: 1,
  surfaceId: 'surface-1',
  status: 'ready',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Ready for review*',
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Acknowledge',
          },
          action_id: 'a2ui-1-1',
        },
      ],
    },
  ] as KnownBlock[],
  diagnostics: [],
};

function backgroundWarnings(calls: readonly (readonly unknown[])[]): string[] {
  return calls
    .map((args: readonly unknown[]) => args.map(String).join(' '))
    .filter(
      (message: string) =>
        message.includes('background') && message.includes('conflicting property'),
    );
}

describe('SlackPreviewRenderer theme transitions with the real Tightknit renderer', () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container?.remove();
    vi.restoreAllMocks();
  });

  it('does not emit React shorthand style warnings when the shell theme changes', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const dispatch = vi.fn();

    await act(async () => {
      root.render(
        <SlackPreviewRenderer
          updateInput={vi.fn()}
          dispatch={dispatch}
          snapshot={readySnapshot}
          theme={ThemePreference.LIGHT}
        />,
      );
    });

    await act(async () => {
      root.render(
        <SlackPreviewRenderer
          updateInput={vi.fn()}
          dispatch={dispatch}
          snapshot={readySnapshot}
          theme={ThemePreference.DARK}
        />,
      );
    });

    expect(backgroundWarnings(consoleError.mock.calls)).toEqual([]);
  });
});
