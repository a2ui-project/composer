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
import {a2uiBridge, ThemePreference, type RendererConfig} from 'a2ui-bridge';
import {type A2uiMessage, type UpdateComponentsMessage} from '@a2ui/web_core/v0_9';
import {slackCatalogJson} from './catalog';
import {App} from './App';
import {SlackPreview} from './SlackPreview';
import {type PreviewSnapshot} from './preview-session';

const rendererMock = vi.hoisted(() => vi.fn());

vi.mock('@tightknitai/storybook-addon-slack-block-kit', async () => {
  const {createElement} = await vi.importActual<typeof import('react')>('react');

  return {
    Renderer: rendererMock.mockImplementation(({blocks, theme}) =>
      createElement(
        'section',
        {'data-testid': 'tightknit-renderer', 'data-theme': theme},
        JSON.stringify(blocks),
      ),
    ),
  };
});

const createSurface = (surfaceId = 'test-surface'): A2uiMessage => ({
  version: 'v0.9',
  createSurface: {
    surfaceId,
    catalogId: slackCatalogJson.catalogId,
  },
});

const updateComponents = (
  surfaceId: string,
  components: UpdateComponentsMessage['updateComponents']['components'],
): A2uiMessage => ({
  version: 'v0.9',
  updateComponents: {
    surfaceId,
    components,
  },
});

describe('SlackPreview', () => {
  let container: HTMLDivElement;
  let root: Root;
  let attachedProcessor: {processMessages(messages: A2uiMessage[]): void} | undefined;
  let attachedConfig: RendererConfig | undefined;
  let unsubscribe: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    rendererMock.mockClear();
    attachedProcessor = undefined;
    attachedConfig = undefined;
    unsubscribe = vi.fn<() => void>();
    container = document.createElement('div');
    document.body.appendChild(container);

    vi.spyOn(a2uiBridge, 'attachRenderer').mockImplementation((processor, config) => {
      attachedProcessor = processor;
      attachedConfig = config;
      return {
        unsubscribe: () => {
          unsubscribe();
        },
      };
    });
    vi.spyOn(a2uiBridge, 'sendAction').mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('composes ready Slack rendering with a current Block Kit export', async () => {
    const snapshot: PreviewSnapshot = {
      revision: 1,
      surfaceId: 'test-surface',
      status: 'ready',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Ready for Slack review',
          },
        },
      ],
      diagnostics: [],
    };

    await act(async () => {
      root = createRoot(container);
      root.render(
        <SlackPreview
          updateInput={vi.fn()}
          dispatch={vi.fn()}
          snapshot={snapshot}
          theme={ThemePreference.DARK}
        />,
      );
    });

    expect(rendererMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        theme: ThemePreference.DARK,
      }),
      undefined,
    );
    expect(container.querySelector('[data-testid="tightknit-renderer"]')?.textContent).toContain(
      'Ready for Slack review',
    );
    expect(
      JSON.parse(container.querySelector('[data-testid="block-kit-json"]')?.textContent ?? ''),
    ).toEqual({blocks: snapshot.blocks});
  });

  it('preserves the Block Kit copy status across ready preview revisions with unchanged JSON', async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });
    const blocks: PreviewSnapshot['blocks'] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Ready for Slack review',
        },
      },
    ];

    try {
      await act(async () => {
        root = createRoot(container);
        root.render(
          <SlackPreview
            updateInput={vi.fn()}
            dispatch={vi.fn()}
            snapshot={{
              revision: 1,
              surfaceId: 'test-surface',
              status: 'ready',
              blocks,
              diagnostics: [],
            }}
          />,
        );
      });

      await act(async () => {
        container.querySelector('button')?.click();
      });

      expect(writeText).toHaveBeenCalledWith(JSON.stringify({blocks}, null, 2));
      expect(container.querySelector('[role="status"]')?.textContent).toBe('Block Kit copied.');

      await act(async () => {
        root.render(
          <SlackPreview
            updateInput={vi.fn()}
            dispatch={vi.fn()}
            snapshot={{
              revision: 2,
              surfaceId: 'test-surface',
              status: 'ready',
              blocks,
              diagnostics: [],
            }}
          />,
        );
      });

      expect(container.querySelector('[role="status"]')?.textContent).toBe('Block Kit copied.');
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: originalClipboard,
      });
    }
  });

  it('forwards the shell theme from the bridge to the composed Tightknit renderer', async () => {
    await renderApp();

    await act(async () => {
      attachedConfig?.onThemeChange?.(ThemePreference.DARK);
      attachedProcessor?.processMessages([
        createSurface(),
        updateComponents('test-surface', [
          {
            id: 'root',
            component: 'Column',
            children: ['summary'],
          },
          {
            id: 'summary',
            component: 'Text',
            text: 'Ready for Slack review',
          },
        ]),
      ]);
    });

    expect(rendererMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        theme: ThemePreference.DARK,
      }),
      undefined,
    );
    expect(container.querySelector('[data-testid="tightknit-renderer"]')?.textContent).toContain(
      'Ready for Slack review',
    );
    expect(
      JSON.parse(container.querySelector('[data-testid="block-kit-json"]')?.textContent ?? ''),
    ).toEqual({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Ready for Slack review',
          },
        },
      ],
    });
  });

  it('disposes the bridge subscription when unmounted', async () => {
    await renderApp();

    act(() => {
      root.unmount();
    });

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  async function renderApp(): Promise<void> {
    await act(async () => {
      root = createRoot(container);
      root.render(<App />);
    });

    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      'Your Slack preview starts here',
    );
    expect(attachedConfig).toMatchObject<Partial<RendererConfig>>({
      catalogJson: slackCatalogJson,
      onThemeChange: expect.any(Function),
      onSurfaceCleared: expect.any(Function),
      onSurfaceReady: expect.any(Function),
    });
  }
});
