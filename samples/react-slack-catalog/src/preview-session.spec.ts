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

import {StrictMode, createElement} from 'react';
import {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ThemePreference, a2uiBridge, type RendererConfig} from 'a2ui-bridge';
import {
  MessageProcessor,
  type A2uiMessage,
  type ComponentApi,
  type SurfaceModel,
  type UpdateComponentsMessage,
} from '@a2ui/web_core/v0_9';
import {SLACK_CATALOG_ID, slackCatalogJson} from './catalog';
import {App} from './App';
import {
  createSlackPreviewBridgeConfig,
  createSlackPreviewSession,
  type PreviewSession,
} from './preview-session';

vi.mock('@tightknitai/storybook-addon-slack-block-kit', () => ({
  Renderer: ({blocks}: {blocks: unknown[]}) =>
    createElement('div', {'data-testid': 'slack-renderer'}, JSON.stringify(blocks)),
}));

const createSurface = (surfaceId = 'test-surface', catalogId = SLACK_CATALOG_ID): A2uiMessage => ({
  version: 'v0.9',
  createSurface: {
    surfaceId,
    catalogId,
  },
});

const updateData = (surfaceId: string, value: unknown, path = '/'): A2uiMessage => ({
  version: 'v0.9',
  updateDataModel: {
    surfaceId,
    path,
    value,
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

const readyTextSurfaceMessages = (surfaceId: string, text: string): A2uiMessage[] => [
  createSurface(surfaceId),
  updateComponents(surfaceId, [
    {
      id: 'root',
      component: 'Text',
      text,
    },
  ]),
];

const sectionText = (session: PreviewSession): string | undefined => {
  const [block] = session.getSnapshot().blocks;
  return typeof block === 'object' &&
    block !== null &&
    'text' in block &&
    typeof block.text === 'object' &&
    block.text !== null &&
    'text' in block.text &&
    typeof block.text.text === 'string'
    ? block.text.text
    : undefined;
};

const actionIds = (session: PreviewSession): string[] =>
  session
    .getSnapshot()
    .blocks.flatMap(block =>
      'elements' in block && Array.isArray(block.elements)
        ? block.elements.map(element =>
            typeof element === 'object' &&
            element !== null &&
            'action_id' in element &&
            typeof element.action_id === 'string'
              ? element.action_id
              : undefined,
          )
        : [],
    )
    .filter((id): id is string => typeof id === 'string');

const captureProcessorSurfaces = () => {
  const surfaces: SurfaceModel<ComponentApi>[] = [];
  const seen = new Set<SurfaceModel<ComponentApi>>();
  const originalProcessMessages = MessageProcessor.prototype.processMessages;
  const processMessagesSpy = vi
    .spyOn(MessageProcessor.prototype, 'processMessages')
    .mockImplementation(function (
      this: MessageProcessor<ComponentApi>,
      messages: Parameters<MessageProcessor<ComponentApi>['processMessages']>[0],
    ) {
      originalProcessMessages.call(this, messages);
      for (const surface of this.model.surfacesMap.values()) {
        if (seen.has(surface)) continue;
        seen.add(surface);
        surfaces.push(surface);
      }
    });

  return {
    surfaces,
    restore: () => {
      processMessagesSpy.mockRestore();
    },
  };
};

describe('createSlackPreviewSession', () => {
  it('keeps one persistent processor across incremental components and data batches', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Column',
          children: ['bound-copy', 'late-copy'],
        },
        {
          id: 'bound-copy',
          component: 'Text',
          text: {
            path: '/message',
          },
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      surfaceId: 'test-surface',
      status: 'waiting',
      blocks: [],
    });

    session.processMessages([
      updateData('test-surface', {
        message: 'First value',
      }),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 2,
      status: 'waiting',
    });

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'late-copy',
          component: 'Text',
          text: 'Late component arrived',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 3,
      status: 'ready',
    });
    expect(sectionText(session)).toBe('First value');

    session.processMessages([
      updateData('test-surface', {
        message: 'Updated value',
      }),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 4,
      status: 'ready',
    });
    expect(sectionText(session)).toBe('Updated value');
    expect(Object.isFrozen(session.getSnapshot())).toBe(true);
    expect(Object.isFrozen(session.getSnapshot().blocks)).toBe(true);
    expect(Object.isFrozen(session.getSnapshot().diagnostics)).toBe(true);
  });

  it('rejects an unexpected catalog ID, clears stale actions, and recovers with Slack catalog messages', async () => {
    const actions: string[] = [];
    const session = createSlackPreviewSession(action => {
      actions.push(action.name);
    });

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'label',
          action: {
            event: {
              name: 'acknowledge',
            },
          },
        },
        {
          id: 'label',
          component: 'Text',
          text: 'Acknowledge',
        },
      ]),
    ]);

    const staleActionId = actionIds(session)[0];
    expect(session.getSnapshot().status).toBe('ready');

    session.processMessages([
      createSurface('test-surface', 'https://example.com/catalogs/not-slack/v1'),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 2,
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'A2UI_PROCESS_MESSAGE_ERROR',
        }),
      ],
    });

    await session.dispatch(staleActionId);
    expect(actions).toEqual([]);

    session.processMessages([
      createSurface('test-surface'),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Recovered',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 3,
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session)).toBe('Recovered');
  });

  it('recovers when a full recreate follows a lowering error', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'UnsupportedThing',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      surfaceId: 'test-surface',
      status: 'error',
      blocks: [],
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'A2UI_UNSUPPORTED_COMPONENT',
          componentId: 'root',
        }),
      ],
    });

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Recovered from recreate',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      revision: 2,
      surfaceId: 'test-surface',
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session)).toBe('Recovered from recreate');
  });

  it('recreates an earlier non-visible surface from a previous multi-create batch', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      ...readyTextSurfaceMessages('first-surface', 'First initial'),
      ...readyTextSurfaceMessages('second-surface', 'Second visible'),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      surfaceId: 'second-surface',
      status: 'ready',
    });

    session.processMessages(readyTextSurfaceMessages('first-surface', 'First recreated'));

    expect(session.getSnapshot()).toMatchObject({
      surfaceId: 'first-surface',
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session)).toBe('First recreated');
  });

  it('treats repeated create messages in the same batch as recreates', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      ...readyTextSurfaceMessages('same-batch-surface', 'Initial same-batch text'),
      ...readyTextSurfaceMessages('same-batch-surface', 'Recreated same-batch text'),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      surfaceId: 'same-batch-surface',
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session)).toBe('Recreated same-batch text');
  });

  it('resyncs active surface tracking from partial processor failures before the next recreate', () => {
    const session = createSlackPreviewSession();

    session.processMessages([
      createSurface('partial-surface'),
      updateComponents('missing-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'This update fails after the first surface is live',
        },
      ]),
    ]);

    expect(session.getSnapshot()).toMatchObject({
      status: 'error',
      diagnostics: [
        expect.objectContaining({
          code: 'A2UI_PROCESS_MESSAGE_ERROR',
        }),
      ],
    });

    session.processMessages(readyTextSurfaceMessages('partial-surface', 'Recovered partial'));

    expect(session.getSnapshot()).toMatchObject({
      surfaceId: 'partial-surface',
      status: 'ready',
      diagnostics: [],
    });
    expect(sectionText(session)).toBe('Recovered partial');
  });

  it('notifies subscribers only after the published snapshot is frozen', () => {
    const session = createSlackPreviewSession();
    const frozenSnapshots: boolean[] = [];

    session.subscribe(() => {
      const snapshot = session.getSnapshot();
      frozenSnapshots.push(
        Object.isFrozen(snapshot) &&
          Object.isFrozen(snapshot.blocks) &&
          Object.isFrozen(snapshot.diagnostics),
      );
    });

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Ready',
        },
      ]),
    ]);

    expect(frozenSnapshots).toEqual([true]);
  });

  it('dispatches event actions through the public session API with current data only', async () => {
    const actions: Array<{name: string; context?: unknown}> = [];
    const session = createSlackPreviewSession(action => {
      actions.push({name: action.name, context: action.context});
    });

    session.processMessages([
      createSurface(),
      updateData('test-surface', {
        record: {
          id: 'example-42',
        },
      }),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            event: {
              name: 'select_record',
              context: {
                recordId: {
                  path: '/record/id',
                },
              },
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Select',
        },
      ]),
    ]);

    const staleActionId = actionIds(session)[0];
    expect(staleActionId).toBe('a2ui-1-1');

    session.processMessages([
      updateData('test-surface', {
        record: {
          id: 'example-99',
        },
      }),
    ]);

    expect(actionIds(session)).toEqual(['a2ui-2-1']);
    await session.dispatch(staleActionId);
    await session.dispatch('a2ui-2-1');

    expect(actions).toEqual([
      {
        name: 'select_record',
        context: {
          recordId: 'example-99',
        },
      },
    ]);
  });

  it('evaluates local function actions through the public session API without client dispatch', async () => {
    const actions: string[] = [];
    const session = createSlackPreviewSession(action => {
      actions.push(action.name);
    });

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            functionCall: {
              call: 'formatString',
              args: {
                value: 'Ready for ${name}',
                name: 'Slack',
              },
              returnType: 'string',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Compute',
        },
      ]),
    ]);

    await session.dispatch('a2ui-1-1');

    expect(actions).toEqual([]);
    expect(session.getSnapshot()).toMatchObject({
      status: 'ready',
      diagnostics: [],
    });
  });

  it('publishes local function dispatch failures as preview diagnostics', async () => {
    const actions: string[] = [];
    const listener = vi.fn();
    const session = createSlackPreviewSession(action => {
      actions.push(action.name);
    });
    session.subscribe(listener);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            functionCall: {
              call: 'missingFunction',
              args: {},
              returnType: 'string',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Compute',
        },
      ]),
    ]);

    listener.mockClear();
    await expect(session.dispatch('a2ui-1-1')).resolves.toBeUndefined();

    expect(actions).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(session.getSnapshot()).toMatchObject({
      revision: 1,
      status: 'ready',
      diagnostics: [
        expect.objectContaining({
          level: 'error',
          code: 'EXPRESSION_ERROR',
          componentId: 'root',
        }),
      ],
    });
    expect(session.getSnapshot().diagnostics[0].message).toContain('missingFunction');
    expect(actionIds(session)).toEqual(['a2ui-1-1']);
  });

  it('keeps stale session action IDs inert after update, delete, recreate, and failure', async () => {
    const actions: string[] = [];
    const session = createSlackPreviewSession(action => {
      actions.push(action.name);
    });

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            event: {
              name: 'initial',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Run',
        },
      ]),
    ]);
    const initialActionId = actionIds(session)[0];

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            event: {
              name: 'updated',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Run',
        },
      ]),
    ]);
    await session.dispatch(initialActionId);

    session.processMessages([{version: 'v0.9', deleteSurface: {surfaceId: 'test-surface'}}]);
    await session.dispatch(initialActionId);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Button',
          child: 'button-label',
          action: {
            event: {
              name: 'recreated',
            },
          },
        },
        {
          id: 'button-label',
          component: 'Text',
          text: 'Run',
        },
      ]),
    ]);
    await session.dispatch(initialActionId);

    session.processMessages([
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: {
            call: 'missingFunction',
            args: {},
          },
        },
      ]),
    ]);
    await session.dispatch(initialActionId);

    expect(actions).toEqual([]);
  });

  it('refreshes blocks, export data, and action registry when the live processor data model changes', async () => {
    const processorSurfaces = captureProcessorSurfaces();
    const actions: Array<{name: string; context?: unknown}> = [];
    const session = createSlackPreviewSession(action => {
      actions.push({name: action.name, context: action.context});
    });

    try {
      session.processMessages([
        createSurface('live-surface'),
        updateData('live-surface', {
          message: 'First value',
          record: {id: 'example-42'},
        }),
        updateComponents('live-surface', [
          {
            id: 'root',
            component: 'Column',
            children: ['copy', 'button'],
          },
          {
            id: 'copy',
            component: 'Text',
            text: {path: '/message'},
          },
          {
            id: 'button',
            component: 'Button',
            child: 'label',
            action: {
              event: {
                name: 'confirm',
                context: {
                  recordId: {path: '/record/id'},
                },
              },
            },
          },
          {
            id: 'label',
            component: 'Text',
            text: 'Confirm',
          },
        ]),
      ]);

      const initialSnapshot = session.getSnapshot();
      const staleActionId = actionIds(session)[0];
      expect(processorSurfaces.surfaces).toHaveLength(1);
      expect(initialSnapshot).toMatchObject({
        surfaceId: 'live-surface',
        status: 'ready',
      });
      expect(sectionText(session)).toBe('First value');

      processorSurfaces.surfaces[0].dataModel.set('/message', 'Updated through live model');
      processorSurfaces.surfaces[0].dataModel.set('/record/id', 'example-99');

      const refreshedSnapshot = session.getSnapshot();
      const currentActionId = actionIds(session)[0];
      expect(refreshedSnapshot).toMatchObject({
        surfaceId: 'live-surface',
        status: 'ready',
      });
      expect(sectionText(session)).toBe('Updated through live model');
      expect(refreshedSnapshot.revision).toBeGreaterThan(initialSnapshot.revision);
      expect(refreshedSnapshot.blocks).not.toEqual(initialSnapshot.blocks);
      expect(currentActionId).not.toBe(staleActionId);

      await session.dispatch(staleActionId);
      await session.dispatch(currentActionId);

      expect(actions).toEqual([
        {
          name: 'confirm',
          context: {recordId: 'example-99'},
        },
      ]);
    } finally {
      session.dispose();
      processorSurfaces.restore();
    }
  });

  it('stops live data-model refreshes after delete, clear, and dispose', () => {
    const processorSurfaces = captureProcessorSurfaces();
    const session = createSlackPreviewSession();

    try {
      session.processMessages([
        createSurface('live-surface'),
        updateData('live-surface', {message: 'Before delete'}),
        updateComponents('live-surface', [
          {
            id: 'root',
            component: 'Text',
            text: {path: '/message'},
          },
        ]),
      ]);

      const firstSurface = processorSurfaces.surfaces[0];
      expect(sectionText(session)).toBe('Before delete');

      session.processMessages([{version: 'v0.9', deleteSurface: {surfaceId: 'live-surface'}}]);
      const afterDelete = session.getSnapshot();
      firstSurface.dataModel.set('/message', 'Deleted surface update');
      expect(session.getSnapshot()).toBe(afterDelete);

      session.processMessages([
        createSurface('live-surface'),
        updateData('live-surface', {message: 'Before clear'}),
        updateComponents('live-surface', [
          {
            id: 'root',
            component: 'Text',
            text: {path: '/message'},
          },
        ]),
      ]);
      const secondSurface = processorSurfaces.surfaces[1];
      session.clear();
      const afterClear = session.getSnapshot();
      secondSurface.dataModel.set('/message', 'Cleared surface update');
      expect(session.getSnapshot()).toBe(afterClear);

      session.processMessages([
        createSurface('live-surface'),
        updateData('live-surface', {message: 'Before dispose'}),
        updateComponents('live-surface', [
          {
            id: 'root',
            component: 'Text',
            text: {path: '/message'},
          },
        ]),
      ]);
      const thirdSurface = processorSurfaces.surfaces[2];
      session.dispose();
      const afterDispose = session.getSnapshot();
      thirdSurface.dataModel.set('/message', 'Disposed surface update');
      expect(session.getSnapshot()).toBe(afterDispose);
    } finally {
      session.dispose();
      processorSurfaces.restore();
    }
  });

  it('moves live data-model refreshes to the surviving last surface when the active surface is deleted', () => {
    const processorSurfaces = captureProcessorSurfaces();
    const session = createSlackPreviewSession();

    try {
      session.processMessages([
        createSurface('first-surface'),
        updateData('first-surface', {message: 'First surface'}),
        updateComponents('first-surface', [
          {
            id: 'root',
            component: 'Text',
            text: {path: '/message'},
          },
        ]),
        createSurface('second-surface'),
        updateData('second-surface', {message: 'Second surface'}),
        updateComponents('second-surface', [
          {
            id: 'root',
            component: 'Text',
            text: {path: '/message'},
          },
        ]),
      ]);

      expect(sectionText(session)).toBe('Second surface');

      session.processMessages([{version: 'v0.9', deleteSurface: {surfaceId: 'second-surface'}}]);
      expect(session.getSnapshot()).toMatchObject({
        surfaceId: 'first-surface',
        status: 'ready',
      });
      expect(sectionText(session)).toBe('First surface');

      const afterDelete = session.getSnapshot();
      processorSurfaces.surfaces[0].dataModel.set('/message', 'First surface updated');

      expect(sectionText(session)).toBe('First surface updated');
      expect(session.getSnapshot().revision).toBeGreaterThan(afterDelete.revision);
    } finally {
      session.dispose();
      processorSurfaces.restore();
    }
  });
});

describe('createSlackPreviewBridgeConfig', () => {
  it('provides the inline Slack catalog and clears the session once per bridge reset', () => {
    const session = createSlackPreviewSession();
    const listener = vi.fn();
    session.subscribe(listener);
    const onThemeChange = vi.fn();
    const config = createSlackPreviewBridgeConfig(session, {onThemeChange});

    expect(config.catalogJson).toEqual(slackCatalogJson);
    expect(config.getComponentUsages).toEqual(expect.any(Function));
    expect(config.onThemeChange).toBe(onThemeChange);

    session.processMessages([
      createSurface(),
      updateComponents('test-surface', [
        {
          id: 'root',
          component: 'Text',
          text: 'Ready',
        },
      ]),
    ]);

    expect(listener).toHaveBeenCalledTimes(1);

    config.onSurfaceCleared?.();

    expect(session.getSnapshot()).toMatchObject({
      revision: 2,
      status: 'empty',
      blocks: [],
      diagnostics: [],
    });
    expect(listener).toHaveBeenCalledTimes(2);

    session.processMessages([
      createSurface(),
      {version: 'v0.9', deleteSurface: {surfaceId: 'test-surface'}},
    ]);

    expect(session.getSnapshot().status).toBe('empty');
    expect(listener).toHaveBeenCalledTimes(3);

    config.onSurfaceCleared?.();

    expect(listener).toHaveBeenCalledTimes(3);
  });
});

describe('App bridge lifecycle', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('attaches the persistent preview session to the bridge and disposes under StrictMode', async () => {
    const unsubscribes = [vi.fn(), vi.fn()];
    const attachSpy = vi
      .spyOn(a2uiBridge, 'attachRenderer')
      .mockImplementation((processor, config) => {
        expect(processor).toEqual(
          expect.objectContaining({
            processMessages: expect.any(Function),
            getSnapshot: expect.any(Function),
            subscribe: expect.any(Function),
            dispatch: expect.any(Function),
            clear: expect.any(Function),
            dispose: expect.any(Function),
          }),
        );
        expect(config).toMatchObject<Partial<RendererConfig>>({
          catalogJson: slackCatalogJson,
          onThemeChange: expect.any(Function),
          onSurfaceReady: expect.any(Function),
          onSurfaceCleared: expect.any(Function),
        });
        return {unsubscribe: unsubscribes[attachSpy.mock.calls.length - 1] ?? vi.fn()};
      });

    await act(async () => {
      root = createRoot(container);
      root.render(createElement(StrictMode, undefined, createElement(App)));
    });

    expect(attachSpy).toHaveBeenCalledTimes(2);
    expect(unsubscribes[0]).toHaveBeenCalledTimes(1);

    const config = attachSpy.mock.calls[1][1];

    await act(async () => {
      config.onThemeChange?.(ThemePreference.DARK);
    });

    expect(container.querySelector('.slack-preview-shell')?.getAttribute('data-theme')).toBe(
      ThemePreference.DARK,
    );

    act(() => {
      root.unmount();
    });

    expect(unsubscribes[1]).toHaveBeenCalledTimes(1);
  });
});
