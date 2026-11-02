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

import {ComponentContext, type SurfaceModel} from '@a2ui/web_core/v0_9';
import {createNativeNode, type ChannelNode} from '@copilotkit/channels-ui';
import {type InputBlock} from '@slack/types';
import {LoweringError} from './lowering-error';
import {DiagnosticCode} from './preview-snapshot';
import {SLACK_INPUT_LABEL_MAX_LENGTH, SLACK_TEXT_INPUT_MAX_LENGTH} from './slack-limits';

/** The A2UI components the sample lowers onto Slack inputs. */
export enum InputComponentType {
  TEXT_FIELD = 'TextField',
  DATE_TIME_INPUT = 'DateTimeInput',
}

/**
 * Which Slack input element an A2UI input becomes. The two text kinds are also
 * the A2UI TextField `variant` values the Slack catalog accepts.
 */
export enum InputKind {
  /** A single-line `plain_text_input`, from a `shortText` TextField. */
  SHORT_TEXT = 'shortText',
  /** A multiline `plain_text_input`, from a `longText` TextField. */
  LONG_TEXT = 'longText',
  /** A `datepicker`, from a date-only DateTimeInput. */
  DATE = 'date',
}

/**
 * A Slack input in the preview and the A2UI data it edits: the TextField or
 * DateTimeInput it was drawn from, and the data model path where what the user
 * types into it is stored.
 *
 * Create one with `createInputDispatchEntry`, draw it with `lowerFormInput`,
 * and pass it to `updateFormInput` with each value the user types.
 */
export interface InputDispatchEntry {
  /** The Slack `action_id` given to the input element. */
  readonly actionId: string;
  /** The preview render this entry was created in; a later render replaces it. */
  readonly revision: number;
  /** The surface that drew the component. */
  readonly surface: SurfaceModel;
  /** The A2UI component's ID. */
  readonly componentId: string;
  /** The data model path the component was drawn under, such as a list item's. */
  readonly basePath: string;
  /** The data model path the input's value is bound to. Never empty. */
  readonly path: string;
  /** Which Slack element the input became. */
  readonly kind: InputKind;
}

/**
 * Wraps a TextField or DateTimeInput for use as a Slack input.
 *
 * @throws LoweringError If the component's `value` isn't bound to a data model
 *     path, since Slack input would have nowhere to go.
 */
export function createInputDispatchEntry(
  actionId: string,
  revision: number,
  surface: SurfaceModel,
  componentId: string,
  basePath: string,
  type: InputComponentType,
  props: Readonly<Record<string, unknown>>,
): InputDispatchEntry {
  const binding = props.value;
  if (
    !binding ||
    typeof binding !== 'object' ||
    !('path' in binding) ||
    typeof binding.path !== 'string' ||
    !binding.path
  ) {
    throw new LoweringError({
      code: DiagnosticCode.A2UI_INVALID_INPUT_BINDING,
      message: 'Slack inputs require a writable value binding.',
      componentId,
    });
  }
  return {
    actionId,
    revision,
    surface,
    componentId,
    basePath,
    path: binding.path,
    kind:
      type === InputComponentType.DATE_TIME_INPUT
        ? InputKind.DATE
        : props.variant === InputKind.LONG_TEXT
          ? InputKind.LONG_TEXT
          : InputKind.SHORT_TEXT,
  };
}

/**
 * Builds the Slack input block for an entry, pre-filled from the data model.
 *
 * @throws LoweringError If the label or the current value breaks one of Slack's
 *     limits.
 */
export function lowerFormInput(
  entry: InputDispatchEntry,
  props: Readonly<Record<string, unknown>>,
): ChannelNode {
  const label = props.label ?? (entry.kind === InputKind.DATE ? 'Date' : undefined);
  if (typeof label !== 'string' || !label.trim() || label.length > SLACK_INPUT_LABEL_MAX_LENGTH) {
    throw new LoweringError({
      code: DiagnosticCode.A2UI_INVALID_INPUT_LABEL,
      message: `Slack input labels must contain 1–${SLACK_INPUT_LABEL_MAX_LENGTH} characters.`,
      componentId: entry.componentId,
    });
  }
  const value = readFormInputValue(entry);
  validateInputValue(entry, value);
  const block: InputBlock = {
    type: 'input',
    label: {type: 'plain_text', text: label},
    optional: true,
    dispatch_action: true,
    element:
      entry.kind === InputKind.DATE
        ? {
            type: 'datepicker',
            action_id: entry.actionId,
            ...(value ? {initial_date: value} : {}),
          }
        : {
            type: 'plain_text_input',
            action_id: entry.actionId,
            multiline: entry.kind === InputKind.LONG_TEXT,
            max_length: SLACK_TEXT_INPUT_MAX_LENGTH,
            ...(value ? {initial_value: value} : {}),
            dispatch_action_config: {trigger_actions_on: ['on_character_entered']},
          },
  };
  return createNativeNode('slack', 'raw', 'raw', {value: block});
}

/**
 * Writes a value typed in Slack to the input's data model path.
 *
 * @throws LoweringError If the value isn't one Slack's input could have
 *     produced.
 */
export function updateFormInput(entry: InputDispatchEntry, value: unknown): void {
  validateInputValue(entry, value);
  const context = new ComponentContext(entry.surface, entry.componentId, entry.basePath);
  context.dataContext.set(entry.path, value);
}

/** Reads the input's current value from the data model, as `''` when unset. */
export function readFormInputValue(entry: InputDispatchEntry): unknown {
  const context = new ComponentContext(entry.surface, entry.componentId, entry.basePath);
  const value = context.dataContext.resolveDynamicValue({path: entry.path});
  return value === undefined || value === null ? '' : value;
}

function validateInputValue(entry: InputDispatchEntry, value: unknown): asserts value is string {
  const invalidValue = (message: string) =>
    new LoweringError({
      code: DiagnosticCode.A2UI_INVALID_INPUT_VALUE,
      message,
      componentId: entry.componentId,
    });
  if (typeof value !== 'string') {
    throw invalidValue('Slack input values must be strings.');
  }
  if (entry.kind === InputKind.DATE) {
    if (value === '') {
      return;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      value.startsWith('0000-') ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw invalidValue('Slack dates must be valid calendar dates in YYYY-MM-DD format.');
    }
    return;
  }
  if (value.length > SLACK_TEXT_INPUT_MAX_LENGTH) {
    throw invalidValue(
      `Slack text inputs accept at most ${SLACK_TEXT_INPUT_MAX_LENGTH} characters.`,
    );
  }
  if (entry.kind === InputKind.SHORT_TEXT && /[\r\n]/.test(value)) {
    throw invalidValue(
      'Slack shortText inputs must contain a single line. Use longText for multiple lines.',
    );
  }
}
