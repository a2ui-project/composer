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
import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vitest';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {type A2uiMessage} from '@a2ui/web_core/v0_9';
import {App} from './App';
import {SLACK_CATALOG_ID} from './catalog';

const SURFACE_ID = 'host-messages';

/**
 * The Slack preview app, attached to the real bridge, handling RENDER_A2UI messages
 * one at a time. Composer always sends the whole canvas, so these are the messages
 * another host could send: a data model or components update on its own, a
 * deleteSurface, and a createSurface for a surface that was deleted.
 */
describe('Slack preview RENDER_A2UI messages from the host', () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(async () => {
    // The bridge renders a message that creates a surface on its next task.
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    consoleError = vi.spyOn(console, 'error');
    container = document.createElement('div');
    document.body.appendChild(container);
    await act(async () => {
      root = createRoot(container);
      root.render(<App />);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a surface the host creates with data and components', async () => {
    await postRenderA2ui([
      createSurface(),
      updateDataModel({status: 'Parent message ready'}),
      boundStatusComponents(),
    ]);

    expect(previewText()).toContain('Parent message ready');
    expect(blockKitStrings()).toContain('Parent message ready');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('applies a data model update the host sends on its own', async () => {
    await postRenderA2ui([
      createSurface(),
      updateDataModel({status: 'Parent message ready'}),
      boundStatusComponents(),
    ]);

    await postRenderA2ui([updateDataModel({status: 'Parent data updated'})]);

    expect(previewText()).toContain('Parent data updated');
    expect(previewText()).not.toContain('Parent message ready');
    expect(blockKitStrings()).toContain('Parent data updated');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('applies a components update the host sends on its own', async () => {
    await postRenderA2ui([
      createSurface(),
      updateDataModel({status: 'Parent data updated'}),
      boundStatusComponents(),
    ]);

    await postRenderA2ui([literalTextComponents('Parent component updated')]);

    expect(previewText()).toContain('Parent component updated');
    expect(previewText()).not.toContain('Parent data updated');
    expect(blockKitStrings()).toContain('Parent component updated');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('shows the empty preview when the host deletes the surface', async () => {
    await postRenderA2ui([createSurface(), literalTextComponents('Parent component updated')]);
    expect(previewText()).toContain('Parent component updated');

    await postRenderA2ui([deleteSurface()]);

    expect(container.querySelector('[role="status"] h2')?.textContent).toBe(
      'Your Slack preview starts here',
    );
    expect(container.textContent).not.toContain('Parent component updated');
    expect(container.querySelector('details')).toBeNull();
    expect(
      [...container.querySelectorAll('button')].filter(
        button => button.textContent === 'Copy Block Kit',
      ),
    ).toEqual([]);
    expect(container.querySelector('[data-testid="block-kit-json"]')).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('renders a surface the host recreates after deleting it', async () => {
    await postRenderA2ui([createSurface(), literalTextComponents('Parent component updated')]);
    await postRenderA2ui([deleteSurface()]);

    await postRenderA2ui([createSurface(), literalTextComponents('Parent recreated after delete')]);

    expect(previewText()).toContain('Parent recreated after delete');
    expect(blockKitStrings()).toContain('Parent recreated after delete');
    expect(consoleError).not.toHaveBeenCalled();
  });

  /** The text of the rendered Slack message. */
  function previewText(): string {
    const preview = container.querySelector('section[aria-label="Slack preview"]');
    if (!preview) {
      throw new Error('The Slack preview did not render a message.');
    }
    return preview.textContent ?? '';
  }

  /** Every string value in the generated Block Kit JSON. */
  function blockKitStrings(): string[] {
    const json = container.querySelector('[data-testid="block-kit-json"]')?.textContent;
    if (!json) {
      throw new Error('The Slack preview did not generate Block Kit JSON.');
    }
    return collectStrings(JSON.parse(json));
  }
});

/** Posts a RENDER_A2UI message from the host window and runs the render it causes. */
async function postRenderA2ui(messages: A2uiMessage[]): Promise<void> {
  await act(async () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window.parent,
        origin: window.location.origin,
        data: {type: PreviewBridgeMessageType.RENDER_A2UI, payload: messages},
      }),
    );
    vi.runOnlyPendingTimers();
  });
}

function createSurface(): A2uiMessage {
  return {version: 'v0.9', createSurface: {surfaceId: SURFACE_ID, catalogId: SLACK_CATALOG_ID}};
}

function updateDataModel(value: Record<string, string>): A2uiMessage {
  return {version: 'v0.9', updateDataModel: {surfaceId: SURFACE_ID, path: '/', value}};
}

/** A root Text bound to the data model's `/status`. */
function boundStatusComponents(): A2uiMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [{id: 'root', component: 'Text', text: {path: '/status'}}],
    },
  };
}

function literalTextComponents(text: string): A2uiMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: SURFACE_ID,
      components: [{id: 'root', component: 'Text', text}],
    },
  };
}

function deleteSurface(): A2uiMessage {
  return {version: 'v0.9', deleteSurface: {surfaceId: SURFACE_ID}};
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}
