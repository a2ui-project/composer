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
  type A2uiClientAction,
  type A2uiMessage,
  type SurfaceModel,
  type UpdateComponentsMessage,
} from '@a2ui/web_core/v0_9';
import {type InputBlock} from '@slack/types';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {SLACK_CATALOG_ID} from './catalog';
import {createSlackPreviewSession, type PreviewSession} from './lower-surface';

type Components = UpdateComponentsMessage['updateComponents']['components'];

function formComponents(relative = false): Components {
  const path = (field: string) => ({path: relative ? field : `/${field}`});
  return [
    {
      id: 'root',
      component: 'Column',
      children: relative
        ? {componentId: 'form', path: '/bookings'}
        : ['location', 'date', 'copy', 'submit'],
    },
    ...(relative
      ? [{id: 'form', component: 'Column', children: ['location', 'date', 'copy', 'submit']}]
      : []),
    {id: 'location', component: 'TextField', label: 'Pickup location', value: path('location')},
    {
      id: 'date',
      component: 'DateTimeInput',
      label: 'Pickup date',
      value: path('date'),
      enableDate: true,
      enableTime: false,
    },
    {id: 'copy', component: 'Text', text: path('location')},
    {
      id: 'submit',
      component: 'Button',
      child: 'submit-label',
      action: {
        event: {name: 'book_car', context: {location: path('location'), date: path('date')}},
      },
    },
    {id: 'submit-label', component: 'Text', text: 'Book a car'},
  ];
}

function messages(
  components = formComponents(),
  value: unknown = {location: 'Airport', date: '2026-10-01'},
): A2uiMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'car', catalogId: SLACK_CATALOG_ID}},
    {version: 'v0.9', updateDataModel: {surfaceId: 'car', path: '/', value}},
    {version: 'v0.9', updateComponents: {surfaceId: 'car', components}},
  ];
}

function inputs(session: PreviewSession): InputBlock[] {
  return session
    .getSnapshot()
    .blocks.filter((block): block is InputBlock => block.type === 'input');
}

function inputId(session: PreviewSession, index = 0): string {
  const id = inputs(session)[index]?.element.action_id;
  if (!id) {
    throw new Error('Expected a registered input action');
  }
  return id;
}

function buttonIds(session: PreviewSession): string[] {
  return session
    .getSnapshot()
    .blocks.flatMap(block =>
      block.type === 'actions'
        ? block.elements.flatMap(element =>
            element.type === 'button' && element.action_id ? [element.action_id] : [],
          )
        : [],
    );
}

describe('Slack editable form inputs', () => {
  let session: PreviewSession;
  let actions: A2uiClientAction[];

  beforeEach(() => {
    actions = [];
    session = createSlackPreviewSession(action => {
      actions.push(action);
    });
  });
  afterEach(() => session.dispose());

  it('emits native Slack text and date inputs with initial bound values', () => {
    session.processMessages(messages());
    expect(session.getSnapshot().status).toBe('ready');
    expect(inputs(session)).toMatchObject([
      {
        type: 'input',
        label: {type: 'plain_text', text: 'Pickup location'},
        element: {
          type: 'plain_text_input',
          initial_value: 'Airport',
          multiline: false,
          max_length: 3000,
        },
      },
      {
        type: 'input',
        label: {type: 'plain_text', text: 'Pickup date'},
        element: {type: 'datepicker', initial_date: '2026-10-01'},
      },
    ]);
  });

  it('updates bindings and the current button context while rejecting old input IDs', async () => {
    session.processMessages(messages());
    const oldLocationId = inputId(session);
    session.updateInput(oldLocationId, 'Boston');
    session.updateInput(oldLocationId, 'Stale');
    session.updateInput(inputId(session, 1), '2026-10-04');
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'Boston'});
    expect(JSON.stringify(session.getSnapshot().blocks)).toContain('Boston');
    await session.dispatch(buttonIds(session)[0]);
    expect(actions).toEqual([
      expect.objectContaining({
        name: 'book_car',
        context: {location: 'Boston', date: '2026-10-04'},
      }),
    ]);
  });

  it('writes relative bindings within the repeated component data context', async () => {
    session.processMessages(
      messages(formComponents(true), {
        bookings: [
          {location: 'First', date: ''},
          {location: 'Second', date: ''},
        ],
      }),
    );
    expect(session.getSnapshot().status).toBe('ready');
    session.updateInput(inputId(session), 'Updated first');
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'Updated first'});
    expect(inputs(session)[2].element).toMatchObject({initial_value: 'Second'});
    await session.dispatch(buttonIds(session)[0]);
    await session.dispatch(buttonIds(session)[1]);
    expect(actions.map(action => action.context)).toEqual([
      {location: 'Updated first', date: ''},
      {location: 'Second', date: ''},
    ]);
  });

  it('invalidates input IDs after deletion, recreation, and clear', () => {
    session.processMessages(messages());
    const initialId = inputId(session);
    session.processMessages([{version: 'v0.9', deleteSurface: {surfaceId: 'car'}}, ...messages()]);
    session.updateInput(initialId, 'Stale');
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'Airport'});
    const recreatedId = inputId(session);
    session.clear();
    session.processMessages(messages());
    session.updateInput(recreatedId, 'Still stale');
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'Airport'});
  });

  it('preserves current inputs and buttons after invalid edits so users can recover', async () => {
    session.processMessages(messages());
    const dateId = inputId(session, 1);
    const buttonId = buttonIds(session)[0];
    const resetKey = session.getSnapshot().inputResetKey;
    session.updateInput(dateId, '2026-02-30');
    expect(session.getSnapshot().inputResetKey).toBe(resetKey! + 1);
    expect(session.getSnapshot().diagnostics).toContainEqual(
      expect.objectContaining({code: 'A2UI_INPUT_ERROR'}),
    );
    expect(inputs(session)[1].element).toMatchObject({initial_date: '2026-10-01'});
    await session.dispatch(buttonId);
    expect(actions[0]).toMatchObject({context: {date: '2026-10-01'}});
    session.updateInput(dateId, '2028-02-29');
    expect(inputs(session)[1].element).toMatchObject({initial_date: '2028-02-29'});
    expect(
      session.getSnapshot().diagnostics.some(diagnostic => diagnostic.code === 'A2UI_INPUT_ERROR'),
    ).toBe(false);
  });

  it('resets native control state only for external messages and clear, preserving focus on edits', () => {
    session.processMessages(messages());
    const initialKey = session.getSnapshot().inputResetKey;
    session.updateInput(inputId(session), 'Local edit');
    expect(session.getSnapshot().inputResetKey).toBe(initialKey);
    session.processMessages([
      {
        version: 'v0.9',
        updateDataModel: {surfaceId: 'car', path: '/location', value: 'External edit'},
      },
    ]);
    expect(session.getSnapshot().inputResetKey).toBe(initialKey! + 1);
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'External edit'});
    session.clear();
    expect(session.getSnapshot().inputResetKey).toBe(initialKey! + 2);
  });

  it('refreshes native sibling controls when multiple inputs share a writable binding', () => {
    session.processMessages(
      messages([
        {id: 'root', component: 'Column', children: ['first', 'second']},
        {id: 'first', component: 'TextField', label: 'Location', value: {path: '/location'}},
        {
          id: 'second',
          component: 'TextField',
          label: 'Confirm location',
          value: {path: '/location'},
        },
      ]),
    );
    const key = session.getSnapshot().inputResetKey;
    session.updateInput(inputId(session), 'Boston');
    expect(session.getSnapshot().inputResetKey).toBe(key! + 1);
    expect(inputs(session).map(input => input.element)).toEqual([
      expect.objectContaining({initial_value: 'Boston'}),
      expect.objectContaining({initial_value: 'Boston'}),
    ]);
  });

  it('keeps surface subscriptions connected to new processors after clear', () => {
    const surfaces: SurfaceModel[] = [];
    const observedValues: unknown[] = [];
    const unsubscribe = session.subscribeSurfaceCreated(surface => {
      surfaces.push(surface);
      surface.dataModel.subscribe('/location', value => {
        observedValues.push(value);
      });
    });
    session.processMessages(messages());
    session.updateInput(inputId(session), 'First session');
    expect(observedValues).toContain('First session');
    session.clear();
    session.processMessages(messages());
    session.updateInput(inputId(session), 'Second session');
    expect(surfaces).toHaveLength(2);
    expect(surfaces[0]).not.toBe(surfaces[1]);
    expect(observedValues).toContain('Second session');
    unsubscribe();
    session.clear();
    session.processMessages(messages());
    expect(surfaces).toHaveLength(2);
  });

  it.each(['2026-02-30', '2026-13-01', '2026-1-01', '0000-01-01', '2026-01-01T12:00:00Z'])(
    'rejects invalid initial dates: %s',
    date => {
      session.processMessages(messages(formComponents(), {location: '', date}));
      expect(session.getSnapshot()).toMatchObject({status: 'error', blocks: []});
    },
  );

  it.each([
    {component: 'TextField', label: 'Location', value: 'literal'},
    {
      component: 'TextField',
      label: 'Location',
      value: {call: 'formatString', args: {value: 'read-only'}},
    },
    {component: 'TextField', label: 'Location', value: {path: '/location'}, variant: 'number'},
    {component: 'TextField', label: 'Location', value: {path: '/location'}, variant: 'obscured'},
    {component: 'DateTimeInput', value: {path: '/date'}, enableTime: true},
    {component: 'DateTimeInput', value: {path: '/date'}, enableDate: false},
    {component: 'TextField', label: 'x'.repeat(2001), value: {path: '/location'}},
  ])('rejects unsupported form properties (%#)', props => {
    session.processMessages(messages([{id: 'root', ...props}]));
    expect(session.getSnapshot()).toMatchObject({status: 'error', blocks: []});
  });

  it('enforces input length, type, and multiline boundaries', () => {
    session.processMessages(messages());
    const id = inputId(session);
    session.updateInput(id, 'x'.repeat(3001));
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'Airport'});
    session.updateInput(id, 'x'.repeat(3000));
    expect(inputs(session)[0].element).toMatchObject({initial_value: 'x'.repeat(3000)});
    session.processMessages([
      {version: 'v0.9', updateDataModel: {surfaceId: 'car', path: '/location', value: 123}},
    ]);
    expect(session.getSnapshot().status).toBe('error');
    session.clear();
    session.processMessages(
      messages(
        [
          {
            id: 'root',
            component: 'TextField',
            label: 'Notes',
            value: {path: '/notes'},
            variant: 'longText',
          },
        ],
        {notes: 'Line one\nLine two'},
      ),
    );
    expect(inputs(session)[0].element).toMatchObject({
      multiline: true,
      initial_value: 'Line one\nLine two',
    });
  });
});
