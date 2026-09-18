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
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {SlackPreviewState} from './SlackPreviewState';
import {type PreviewSnapshot} from './preview-session';

describe('SlackPreviewState', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it.each<PreviewSnapshot>([
    {revision: 0, status: 'empty', blocks: [], diagnostics: []},
    {
      revision: 1,
      surfaceId: 'surface-1',
      status: 'empty',
      blocks: [],
      diagnostics: [],
    },
  ])('shows a quiet empty state for an untouched $status canvas', snapshot => {
    renderPreview(snapshot);

    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      'Your Slack preview starts here',
    );
    expect(container.textContent).toContain('Describe a message in the assistant');
    expect(container.querySelector('[aria-label="Preview diagnostics"]')).toBeNull();
    expect(container.textContent).not.toContain('A2UI_WAITING_FOR_COMPONENT');
    expect(buttonNamed('Export Block Kit')).toBeNull();

    renderPreview(readySnapshot(2, 'Created message'));
    expect(container.textContent).not.toContain('Your Slack preview starts here');
    expect(container.textContent).toContain('Created message');
  });

  it('keeps actionable diagnostics visible even when the root is missing', () => {
    renderPreview({
      revision: 1,
      status: 'waiting',
      blocks: [],
      diagnostics: [
        {
          level: 'warning',
          code: 'A2UI_WAITING_FOR_COMPONENT',
          componentId: 'root',
          message: 'Check the root component',
        },
      ],
    });

    expect(container.textContent).not.toContain('Your Slack preview starts here');
    expect(container.querySelector('[aria-label="Preview diagnostics"]')?.textContent).toContain(
      'Check the root component',
    );
  });

  it('clears ready preview content and export controls for waiting snapshots', () => {
    renderPreview(readySnapshot(1, 'Ready blocks'));

    expect(container.textContent).toContain('Ready blocks');
    expect(container.querySelector('#a2ui-1-1')).not.toBeNull();
    expect(buttonNamed('Export Block Kit')).not.toBeNull();

    renderPreview({
      revision: 2,
      surfaceId: 'surface-1',
      status: 'waiting',
      blocks: [],
      diagnostics: [
        {
          level: 'info',
          code: 'A2UI_WAITING_FOR_COMPONENT',
          message: 'A2UI surface is waiting for component "summary"',
          componentId: 'summary',
        },
      ],
    });

    expect(container.textContent).not.toContain('Ready blocks');
    expect(container.querySelector('#a2ui-1-1')).toBeNull();
    expect(buttonNamed('Export Block Kit')).toBeNull();
    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      'Waiting for Slack preview data',
    );
    expect(container.querySelector('[aria-label="Preview diagnostics"]')?.textContent).toContain(
      'info A2UI_WAITING_FOR_COMPONENT summary A2UI surface is waiting for component "summary"',
    );
  });

  it('clears ready preview content and export controls for error snapshots', () => {
    renderPreview(readySnapshot(1, 'Actionable blocks'));

    renderPreview({
      revision: 2,
      surfaceId: 'surface-1',
      status: 'error',
      blocks: [],
      diagnostics: [
        {
          level: 'error',
          code: 'SLACK_UNSUPPORTED_COMPONENT',
          message: 'Unsupported component "Chart"',
        },
      ],
    });

    expect(container.textContent).not.toContain('Actionable blocks');
    expect(container.querySelector('#a2ui-1-1')).toBeNull();
    expect(buttonNamed('Export Block Kit')).toBeNull();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Slack preview could not render',
    );
    expect(container.querySelector('[aria-label="Preview diagnostics"]')?.textContent).toContain(
      'error SLACK_UNSUPPORTED_COMPONENT Unsupported component "Chart"',
    );
  });

  it('recovers a renderer error boundary on the next ready revision', () => {
    renderPreview(readySnapshot(1, 'Broken blocks'), true);

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Slack renderer failed',
    );
    expect(container.textContent).not.toContain('Broken blocks');
    expect(buttonNamed('Export Block Kit')).toBeNull();

    renderPreview(readySnapshot(2, 'Recovered blocks'), false);

    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.textContent).toContain('Recovered blocks');
    expect(buttonNamed('Export Block Kit')).not.toBeNull();
  });

  function renderPreview(snapshot: PreviewSnapshot, shouldThrow = false): void {
    act(() => {
      root.render(
        <SlackPreviewState
          snapshot={snapshot}
          renderExport={() => <button type="button">Export Block Kit</button>}
          renderReady={({revision}) => {
            if (shouldThrow) throw new Error(`renderer exploded on revision ${revision}`);
            return (
              <section aria-label="Rendered Slack blocks">
                <button id={`a2ui-${revision}-1`} type="button">
                  {snapshot.blocks[0] ? blockText(snapshot) : 'Action'}
                </button>
              </section>
            );
          }}
        />,
      );
    });
  }
});

function readySnapshot(revision: number, text: string): PreviewSnapshot {
  return {
    revision,
    surfaceId: 'surface-1',
    status: 'ready',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
    ],
    diagnostics: [],
  };
}

function blockText(snapshot: PreviewSnapshot): string {
  const [block] = snapshot.blocks;
  return typeof block === 'object' &&
    block !== null &&
    'text' in block &&
    typeof block.text === 'object' &&
    block.text !== null &&
    'text' in block.text &&
    typeof block.text.text === 'string'
    ? block.text.text
    : '';
}

function buttonNamed(name: string): HTMLButtonElement | null {
  return (
    Array.from(document.querySelectorAll('button')).find(button => button.textContent === name) ??
    null
  );
}
