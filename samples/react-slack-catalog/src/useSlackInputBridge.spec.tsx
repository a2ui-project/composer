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

import {act, useSyncExternalStore} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {type A2uiMessage, type UpdateComponentsMessage} from '@a2ui/web_core/v0_9';
import {type InputBlock} from '@slack/types';
import {SLACK_CATALOG_ID} from './catalog';
import {createSlackPreviewSession, type PreviewSession} from './preview-session';
import {SlackPreviewRenderer} from './SlackPreviewRenderer';

type Components = UpdateComponentsMessage['updateComponents']['components'];

/** The wrapper slack-blocks-to-jsx draws around each text input. */
const TEXT_INPUT_WRAPPER = '.slack_blocks_to_jsx__plain_text_input_element';

/** A form with a single-line text field, a multiline one and a date picker. */
const FORM: Components = [
  {id: 'root', component: 'Column', children: ['location', 'notes', 'date']},
  {id: 'location', component: 'TextField', label: 'Pickup location', value: {path: '/location'}},
  {
    id: 'notes',
    component: 'TextField',
    label: 'Notes',
    value: {path: '/notes'},
    variant: 'longText',
  },
  {id: 'date', component: 'DateTimeInput', label: 'Pickup date', value: {path: '/date'}},
];

/** Two single-line text fields bound to the same data model path. */
const SHARED_BINDING_FORM: Components = [
  {id: 'root', component: 'Column', children: ['location', 'confirm']},
  {id: 'location', component: 'TextField', label: 'Location', value: {path: '/location'}},
  {id: 'confirm', component: 'TextField', label: 'Confirm location', value: {path: '/location'}},
];

function messages(components: Components): A2uiMessage[] {
  return [
    {version: 'v0.9', createSurface: {surfaceId: 'form', catalogId: SLACK_CATALOG_ID}},
    {
      version: 'v0.9',
      updateDataModel: {
        surfaceId: 'form',
        path: '/',
        value: {location: 'Airport', notes: '', date: '2026-10-01'},
      },
    },
    {version: 'v0.9', updateComponents: {surfaceId: 'form', components}},
  ];
}

/** The session's preview, drawn by the real renderer and redrawn after each change. */
function SessionPreview({
  session,
  updateInput,
}: {
  readonly session: PreviewSession;
  readonly updateInput: (actionId: string, value: string) => void;
}) {
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  return (
    <SlackPreviewRenderer
      snapshot={snapshot}
      updateInput={updateInput}
      dispatch={session.dispatch}
    />
  );
}

/** Writes `value` into a control and sends the `input` event typing would. */
function enterValue(
  control: HTMLTextAreaElement,
  value: string,
  init: {readonly caret?: number; readonly isComposing?: boolean} = {},
): void {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(
    control,
    value,
  );
  const caret = init.caret ?? value.length;
  control.setSelectionRange(caret, caret);
  control.dispatchEvent(
    new InputEvent('input', {bubbles: true, isComposing: init.isComposing ?? false}),
  );
}

/** Sends a keydown for `key` and says whether the page let the browser handle it. */
function pressKey(
  control: HTMLElement,
  key: string,
  init: {readonly isComposing?: boolean} = {},
): boolean {
  return control.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      isComposing: init.isComposing ?? false,
      bubbles: true,
      cancelable: true,
    }),
  );
}

describe('useSlackInputBridge with the real Slack renderer', () => {
  let container: HTMLDivElement;
  let root: Root;
  let session: PreviewSession;
  let updateInput: ReturnType<typeof vi.fn<(actionId: string, value: string) => void>>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    session = createSlackPreviewSession();
    updateInput = vi.fn((actionId: string, value: string) => {
      session.updateInput(actionId, value);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    session.dispose();
    vi.restoreAllMocks();
  });

  const renderForm = async (components: Components) => {
    session.processMessages(messages(components));
    await act(async () => {
      root.render(<SessionPreview session={session} updateInput={updateInput} />);
    });
  };

  const textAreas = (): HTMLTextAreaElement[] =>
    Array.from(container.querySelectorAll<HTMLTextAreaElement>(`${TEXT_INPUT_WRAPPER} textarea`));

  const inputBlocks = (): InputBlock[] =>
    session.getSnapshot().blocks.filter((block): block is InputBlock => block.type === 'input');

  const initialValue = (index: number): unknown => {
    const element = inputBlocks()[index].element;
    return element.type === 'plain_text_input' ? element.initial_value : undefined;
  };

  it('names each control after its Slack input label', async () => {
    await renderForm(FORM);

    expect(textAreas().map(control => control.getAttribute('aria-label'))).toEqual([
      'Pickup location',
      'Notes',
    ]);
    expect(container.querySelector('input[type="date"]')?.getAttribute('aria-label')).toBe(
      'Pickup date',
    );
  });

  it('leaves one tab stop per text input and sizes it from its multiline setting', async () => {
    await renderForm(FORM);
    const [location, notes] = textAreas();

    for (const wrapper of container.querySelectorAll(TEXT_INPUT_WRAPPER)) {
      expect(wrapper.hasAttribute('tabindex')).toBe(false);
    }
    expect([location.rows, location.dataset.slackMultiline]).toEqual([1, 'false']);
    expect([notes.rows, notes.dataset.slackMultiline]).toEqual([3, 'true']);
    expect(
      Array.from(container.querySelectorAll<HTMLElement>('.slack_blocks_to_jsx__input p'))
        .filter(hint => hint.textContent?.includes("'enter' to submit"))
        .map(hint => hint.hidden),
    ).toEqual([true, true]);
  });

  it('commits a typed value, but not until IME composition ends', async () => {
    await renderForm(FORM);
    const [location] = textAreas();
    const [{element}] = inputBlocks();

    act(() => {
      enterValue(location, 'Airport と', {isComposing: true});
    });
    expect(updateInput).not.toHaveBeenCalled();

    act(() => {
      location.dispatchEvent(new CompositionEvent('compositionend', {bubbles: true, data: 'と'}));
    });
    expect(updateInput).toHaveBeenCalledTimes(1);
    expect(updateInput).toHaveBeenCalledWith(element.action_id, 'Airport と');
  });

  it('keeps Enter from adding a line to a single-line field only', async () => {
    await renderForm(FORM);
    const [location, notes] = textAreas();

    expect(pressKey(location, 'Enter')).toBe(false);
    expect(pressKey(location, 'Enter', {isComposing: true})).toBe(true);
    expect(pressKey(location, 'a')).toBe(true);
    expect(pressKey(notes, 'Enter')).toBe(true);
  });

  it('turns line breaks pasted into a single-line field into spaces', async () => {
    await renderForm(FORM);
    const [location] = textAreas();
    const [{element}] = inputBlocks();

    act(() => {
      enterValue(location, 'Terminal 1\nGate 4\nAirport', {caret: 17});
    });

    expect(updateInput).toHaveBeenCalledTimes(1);
    expect(updateInput).toHaveBeenCalledWith(element.action_id, 'Terminal 1 Gate 4 Airport');
    expect(textAreas()[0].value).toBe('Terminal 1 Gate 4 Airport');
    expect(textAreas()[0].selectionStart).toBe(17);
    expect(initialValue(0)).toBe('Terminal 1 Gate 4 Airport');
    expect(session.getSnapshot().diagnostics).toEqual([]);
  });

  it('keeps line breaks typed into a multiline field', async () => {
    await renderForm(FORM);
    const [, notes] = textAreas();
    const [, {element}] = inputBlocks();

    act(() => {
      enterValue(notes, 'Line one\nLine two');
    });

    expect(updateInput).toHaveBeenCalledTimes(1);
    expect(updateInput).toHaveBeenCalledWith(element.action_id, 'Line one\nLine two');
    expect(initialValue(1)).toBe('Line one\nLine two');
  });

  it('puts the cursor back in a field that a shared binding recreated', async () => {
    await renderForm(SHARED_BINDING_FORM);
    const [, confirm] = textAreas();
    confirm.focus();

    act(() => {
      enterValue(confirm, 'Airpxort', {caret: 5});
    });

    const [newLocation, newConfirm] = textAreas();
    expect(newConfirm).not.toBe(confirm);
    expect(confirm.isConnected).toBe(false);
    expect([newLocation.value, newConfirm.value]).toEqual(['Airpxort', 'Airpxort']);
    expect(document.activeElement).toBe(newConfirm);
    expect([newConfirm.selectionStart, newConfirm.selectionEnd]).toEqual([5, 5]);
  });
});
