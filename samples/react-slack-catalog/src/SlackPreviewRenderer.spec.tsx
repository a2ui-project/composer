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
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ThemePreference} from 'a2ui-bridge';
import {type KnownBlock} from '@slack/types';
import {SlackPreviewRenderer} from './SlackPreviewRenderer';
import {type PreviewSnapshot} from './preview-session';

const rendererMock = vi.hoisted(() => vi.fn());

vi.mock('@tightknitai/storybook-addon-slack-block-kit', async () => {
  const {createElement} = await vi.importActual<typeof import('react')>('react');

  return {
    Renderer: rendererMock.mockImplementation(({blocks, onInteraction}) => {
      const actionId = blocks[0]?.elements?.[0]?.action_id;

      return createElement(
        'section',
        {'data-testid': 'tightknit-renderer'},
        createElement(
          'button',
          {
            className: 'slack_blocks_to_jsx__button_element',
            'data-testid': 'native-action',
            id: actionId,
            type: 'button',
          },
          'Native action',
        ),
        createElement(
          'button',
          {
            'data-testid': 'simulator-action',
            id: actionId,
            onClick: () => onInteraction?.({type: 'button', action_id: actionId}),
            type: 'button',
          },
          'Simulate',
        ),
        createElement(
          'button',
          {
            className: 'slack_blocks_to_jsx__button_element',
            'data-testid': 'unregistered-native-action',
            id: 'acknowledge',
            type: 'button',
          },
          'Unregistered native action',
        ),
        createElement(
          'button',
          {
            'data-testid': 'toolbar-action',
            id: actionId,
            type: 'button',
          },
          'Toolbar',
        ),
      );
    }),
  };
});

const readySnapshot = (blocks: KnownBlock[]): PreviewSnapshot => ({
  revision: 1,
  surfaceId: 'surface-1',
  status: 'ready',
  blocks,
  diagnostics: [],
});

const blocksWithAction = (actionId = 'a2ui-1-1'): KnownBlock[] =>
  [
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Acknowledge',
          },
          action_id: actionId,
        },
      ],
    },
  ] as KnownBlock[];

describe('SlackPreviewRenderer', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    rendererMock.mockClear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  const renderPreview = async (
    dispatch: (actionId: string) => void | Promise<void> = vi
      .fn<(actionId: string) => Promise<void>>()
      .mockResolvedValue(undefined),
    snapshot = readySnapshot(blocksWithAction()),
  ) => {
    await act(async () => {
      root.render(
        <>
          <button
            className="slack_blocks_to_jsx__button_element"
            data-testid="outside-native-action"
            id="a2ui-1-1"
            type="button"
          >
            Outside
          </button>
          <SlackPreviewRenderer
            updateInput={vi.fn()}
            dispatch={dispatch}
            snapshot={snapshot}
            theme={ThemePreference.DARK}
          />
        </>,
      );
    });

    return dispatch;
  };

  const clickPreviewButton = async (testId: string) => {
    await act(async () => {
      container.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)!.click();
      await Promise.resolve();
    });
  };

  it('passes the required Tightknit message renderer configuration', async () => {
    await renderPreview();

    expect(rendererMock).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: blocksWithAction(),
        name: 'A2UI Preview',
        surface: 'message',
        theme: 'dark',
        validate: true,
      }),
      undefined,
    );
  });

  it('routes a native preview button click exactly once by current opaque action ID', async () => {
    const dispatch = await renderPreview();

    await clickPreviewButton('native-action');

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith('a2ui-1-1');
  });

  it('routes a simulator interaction callback exactly once through the same dispatch callback', async () => {
    const dispatch = await renderPreview();

    await clickPreviewButton('simulator-action');

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith('a2ui-1-1');
  });

  it('renders rejected action dispatch diagnostics and recovers on the next interaction', async () => {
    const dispatch = vi
      .fn<(actionId: string) => Promise<void>>()
      .mockRejectedValueOnce(new Error('workspace action failed'))
      .mockResolvedValueOnce(undefined);

    await renderPreview(dispatch);

    await clickPreviewButton('native-action');

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith('a2ui-1-1');
    const diagnostics = container.querySelector('[aria-label="Preview diagnostics"]');
    expect(diagnostics).not.toBeNull();
    expect(diagnostics?.textContent).toContain(
      'error: SLACK_ACTION_DISPATCH_FAILED workspace action failed',
    );

    await clickPreviewButton('simulator-action');

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenLastCalledWith('a2ui-1-1');
    expect(container.querySelector('[aria-label="Preview diagnostics"]')).toBeNull();
  });

  it('renders diagnostics when action dispatch throws synchronously', async () => {
    const dispatch = vi
      .fn<(actionId: string) => Promise<void>>()
      .mockImplementationOnce(() => {
        throw new Error('workspace dispatch exploded');
      })
      .mockResolvedValueOnce(undefined);

    await renderPreview(dispatch);

    await clickPreviewButton('native-action');

    expect(dispatch).toHaveBeenCalledTimes(1);
    const diagnostics = container.querySelector('[aria-label="Preview diagnostics"]');
    expect(diagnostics).not.toBeNull();
    expect(diagnostics?.textContent).toContain(
      'error: SLACK_ACTION_DISPATCH_FAILED workspace dispatch exploded',
    );

    await clickPreviewButton('simulator-action');

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[aria-label="Preview diagnostics"]')).toBeNull();
  });

  it('ignores unrelated toolbar, simulator DOM, outside DOM, and unregistered native IDs', async () => {
    const dispatch = await renderPreview();

    await clickPreviewButton('toolbar-action');
    await clickPreviewButton('outside-native-action');
    await clickPreviewButton('unregistered-native-action');

    expect(dispatch).not.toHaveBeenCalled();
  });
});
