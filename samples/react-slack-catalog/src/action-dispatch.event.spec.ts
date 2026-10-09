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

import {
  MessageProcessor,
  type A2uiClientAction,
  type A2uiMessage,
  type ComponentApi,
  type SurfaceModel,
  type UpdateComponentsMessage,
} from '@a2ui/web_core/v0_9';
import {describe, expect, it} from 'vitest';
import {
  createEventActionDispatchEntry,
  dispatchCurrentEventAction,
  type EventActionRegistry,
} from './action-dispatch';
import {SLACK_CATALOG_ID, slackCatalog} from './catalog';
import {DATA_BOUND_ACTION_MESSAGES} from './examples';

const createSurface = (surfaceId = 'test-surface'): A2uiMessage => ({
  version: 'v0.9',
  createSurface: {
    surfaceId,
    catalogId: SLACK_CATALOG_ID,
  },
});

const deleteSurface = (surfaceId = 'test-surface'): A2uiMessage => ({
  version: 'v0.9',
  deleteSurface: {
    surfaceId,
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

const buttonComponents = (
  eventName = 'acknowledge',
): UpdateComponentsMessage['updateComponents']['components'] => [
  {
    id: 'root',
    component: 'Button',
    child: 'button-label',
    action: {
      event: {
        name: eventName,
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
    text: 'Acknowledge',
  },
];

const repeatedTemplateComponents: UpdateComponentsMessage['updateComponents']['components'] = [
  {
    id: 'root',
    component: 'Column',
    children: [
      {id: 'row', basePath: '/records/0'},
      {id: 'row', basePath: '/records/1'},
    ],
  },
  {
    id: 'row',
    component: 'Button',
    child: 'label',
    action: {
      event: {
        name: 'select_record',
        context: {
          recordId: {
            path: 'id',
          },
        },
      },
    },
  },
  {
    id: 'label',
    component: 'Text',
    text: 'Select',
  },
];

function createProcessor(actions: A2uiClientAction[]): MessageProcessor<ComponentApi> {
  return new MessageProcessor([slackCatalog], action => {
    actions.push(action);
  });
}

function currentSurface(processor: MessageProcessor<ComponentApi>): SurfaceModel | undefined {
  return [...processor.model.surfacesMap.values()].at(-1);
}

function registryWith(
  entry: ReturnType<typeof createEventActionDispatchEntry>,
): EventActionRegistry {
  return entry ? new Map([[entry.actionId, entry]]) : new Map();
}

describe('event action dispatch', () => {
  it('dispatches the current Button event once with resolved context', async () => {
    const actions: A2uiClientAction[] = [];
    const processor = createProcessor(actions);
    processor.processMessages(DATA_BOUND_ACTION_MESSAGES);
    const surface = currentSurface(processor);
    expect(surface).toBeDefined();
    const entry = createEventActionDispatchEntry({
      actionId: 'a2ui-1-1',
      revision: 1,
      surface: surface!,
      sourceComponentId: 'acknowledge-button',
      basePath: '/',
      action: {
        event: {
          name: 'acknowledge',
          context: {
            recordId: {
              path: '/record/id',
            },
          },
        },
      },
    });

    await dispatchCurrentEventAction('a2ui-1-1', {
      surface,
      registry: registryWith(entry),
    });

    expect(actions).toEqual([
      expect.objectContaining({
        name: 'acknowledge',
        sourceComponentId: 'acknowledge-button',
        surfaceId: 'data-bound-action',
        context: {
          recordId: 'example-42',
        },
      }),
    ]);
  });

  it('uses a new action ID and current data after a data revision', async () => {
    const actions: A2uiClientAction[] = [];
    const processor = createProcessor(actions);
    processor.processMessages([
      createSurface(),
      updateData('test-surface', {
        record: {
          id: 'example-42',
        },
      }),
      updateComponents('test-surface', buttonComponents()),
    ]);
    const oldSurface = currentSurface(processor);
    const oldEntry = createEventActionDispatchEntry({
      actionId: 'a2ui-1-1',
      revision: 1,
      surface: oldSurface!,
      sourceComponentId: 'root',
      basePath: '/',
      action: buttonComponents()[0].action,
    });

    processor.processMessages([
      updateData('test-surface', {
        record: {
          id: 'example-99',
        },
      }),
    ]);
    const current = currentSurface(processor);
    const currentEntry = createEventActionDispatchEntry({
      actionId: 'a2ui-2-1',
      revision: 2,
      surface: current!,
      sourceComponentId: 'root',
      basePath: '/',
      action: buttonComponents()[0].action,
    });
    const registry = registryWith(currentEntry);

    await dispatchCurrentEventAction('a2ui-1-1', {
      surface: current,
      registry,
    });
    await dispatchCurrentEventAction('a2ui-2-1', {
      surface: current,
      registry,
    });

    expect(oldEntry?.actionId).toBe('a2ui-1-1');
    expect(actions).toEqual([
      expect.objectContaining({
        name: 'acknowledge',
        context: {
          recordId: 'example-99',
        },
      }),
    ]);
  });

  it('keeps repeated-template buttons distinct by base path', async () => {
    const actions: A2uiClientAction[] = [];
    const processor = createProcessor(actions);
    processor.processMessages([
      createSurface(),
      updateData('test-surface', {
        records: [{id: 'record-a'}, {id: 'record-b'}],
      }),
      updateComponents('test-surface', repeatedTemplateComponents),
    ]);
    const surface = currentSurface(processor);
    const firstEntry = createEventActionDispatchEntry({
      actionId: 'a2ui-1-1',
      revision: 1,
      surface: surface!,
      sourceComponentId: 'row',
      basePath: '/records/0',
      action: repeatedTemplateComponents[1].action,
    });
    const secondEntry = createEventActionDispatchEntry({
      actionId: 'a2ui-1-2',
      revision: 1,
      surface: surface!,
      sourceComponentId: 'row',
      basePath: '/records/1',
      action: repeatedTemplateComponents[1].action,
    });
    const registry = new Map([
      [firstEntry!.actionId, firstEntry!],
      [secondEntry!.actionId, secondEntry!],
    ]);

    await dispatchCurrentEventAction('a2ui-1-1', {surface, registry});
    await dispatchCurrentEventAction('a2ui-1-2', {surface, registry});

    expect(actions.map(action => action.context)).toEqual([
      {recordId: 'record-a'},
      {recordId: 'record-b'},
    ]);
  });

  it('returns false without dispatching when the action ID is absent from the current registry', async () => {
    const actions: A2uiClientAction[] = [];
    const processor = createProcessor(actions);
    processor.processMessages([
      createSurface(),
      updateData('test-surface', {
        record: {
          id: 'example-42',
        },
      }),
      updateComponents('test-surface', buttonComponents()),
    ]);

    const dispatched = await dispatchCurrentEventAction('a2ui-1-1', {
      surface: currentSurface(processor),
      registry: new Map(),
    });

    expect(dispatched).toBe(false);
    expect(actions).toEqual([]);
  });

  it('returns false for registry entries that no longer match the live surface', async () => {
    const actions: A2uiClientAction[] = [];
    const processor = createProcessor(actions);
    processor.processMessages([
      createSurface(),
      updateData('test-surface', {
        record: {
          id: 'example-42',
        },
      }),
      updateComponents('test-surface', buttonComponents()),
    ]);
    const initialSurface = currentSurface(processor);
    const staleEntry = createEventActionDispatchEntry({
      actionId: 'a2ui-1-1',
      revision: 1,
      surface: initialSurface!,
      sourceComponentId: 'root',
      basePath: '/',
      action: buttonComponents()[0].action,
    });

    processor.processMessages([updateComponents('test-surface', buttonComponents('updated'))]);
    const updatedSurface = currentSurface(processor);
    const updatedEntry = createEventActionDispatchEntry({
      actionId: 'a2ui-2-1',
      revision: 2,
      surface: updatedSurface!,
      sourceComponentId: 'root',
      basePath: '/',
      action: buttonComponents('updated')[0].action,
    });
    const updatedDispatch = await dispatchCurrentEventAction('a2ui-1-1', {
      surface: updatedSurface,
      registry: registryWith(updatedEntry),
    });

    processor.processMessages([deleteSurface()]);
    const deletedDispatch = await dispatchCurrentEventAction('a2ui-1-1', {
      surface: currentSurface(processor),
      registry: registryWith(staleEntry),
    });

    processor.processMessages([
      createSurface(),
      updateData('test-surface', {
        record: {
          id: 'example-recreated',
        },
      }),
      updateComponents('test-surface', buttonComponents('recreated')),
    ]);
    const recreatedDispatch = await dispatchCurrentEventAction('a2ui-1-1', {
      surface: currentSurface(processor),
      registry: registryWith(staleEntry),
    });

    expect([updatedDispatch, deletedDispatch, recreatedDispatch]).toEqual([false, false, false]);
    expect(actions).toEqual([]);
  });
});
