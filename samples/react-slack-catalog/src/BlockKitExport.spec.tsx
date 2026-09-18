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
import {type PreviewSnapshot} from './preview-session';
import {BlockKitExport} from './BlockKitExport';

const readySnapshot = (blocks: PreviewSnapshot['blocks']): PreviewSnapshot => ({
  revision: 7,
  surfaceId: 'surface-1',
  status: 'ready',
  blocks,
  diagnostics: [],
});

const blockKitJson = (container: HTMLElement): unknown =>
  JSON.parse(container.querySelector('[data-testid="block-kit-json"]')?.textContent ?? '');

describe('BlockKitExport', () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalClipboard: Clipboard | undefined;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container.remove();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    vi.restoreAllMocks();
  });

  const renderExport = (snapshot: PreviewSnapshot) => {
    container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      root = createRoot(container);
      root.render(<BlockKitExport snapshot={snapshot} />);
    });
  };

  it('renders collapsed readable JSON for only the current snapshot blocks', () => {
    const blocks: PreviewSnapshot['blocks'] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Current approval is ready',
        },
      },
      {
        type: 'divider',
      },
    ];

    renderExport(readySnapshot(blocks));

    expect(container.querySelector('details')?.open).toBe(false);
    expect(container.querySelector('summary')?.textContent).toContain('Generated Block Kit');
    expect(blockKitJson(container)).toEqual({blocks});
  });

  it.each(['empty', 'waiting', 'error'] as const)(
    'disables copy while the snapshot is %s',
    status => {
      renderExport({
        revision: 3,
        status,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Stale block',
            },
          },
        ],
        diagnostics: [],
      });

      const button = container.querySelector('button');

      expect(button?.textContent).toBe('Copy Block Kit');
      expect((button as HTMLButtonElement | null)?.disabled).toBe(true);
      expect(blockKitJson(container)).toEqual({blocks: []});
    },
  );

  it('copies current JSON and announces success through an accessible status', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });
    const blocks = [
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: 'Copy succeeds',
        },
      },
    ];

    renderExport(readySnapshot(blocks));

    await act(async () => {
      container.querySelector('button')?.click();
    });

    expect(writeText).toHaveBeenCalledWith(JSON.stringify({blocks}, null, 2));
    expect(container.querySelector('[role="status"]')?.textContent).toBe('Block Kit copied.');
  });

  it('copies a ready snapshot with no blocks as an empty Block Kit export', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });

    renderExport(readySnapshot([]));

    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button?.disabled).toBe(false);

    await act(async () => {
      button?.click();
    });

    expect(writeText).toHaveBeenCalledWith(JSON.stringify({blocks: []}, null, 2));
    expect(blockKitJson(container)).toEqual({blocks: []});
  });

  it('keeps selectable JSON visible and announces fallback when clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('clipboard denied'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });
    const blocks = [
      {
        type: 'section' as const,
        text: {
          type: 'mrkdwn' as const,
          text: 'Copy fallback stays visible',
        },
      },
    ];

    renderExport(readySnapshot(blocks));

    await act(async () => {
      container.querySelector('button')?.click();
    });

    const expectedJson = JSON.stringify({blocks}, null, 2);

    expect(writeText).toHaveBeenCalledWith(expectedJson);
    expect(container.querySelector('[role="status"]')?.textContent).toBe(
      'Clipboard unavailable. Select and copy the JSON below.',
    );
    expect(container.querySelector('[data-testid="block-kit-json"]')?.textContent).toBe(
      expectedJson,
    );
  });
});
