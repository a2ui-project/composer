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

type InputKind = 'shortText' | 'longText' | 'date';

export interface InputDispatchEntry {
  readonly actionId: string;
  readonly revision: number;
  readonly surface: SurfaceModel;
  readonly componentId: string;
  readonly basePath: string;
  readonly path: string;
  readonly kind: InputKind;
}

export function createInputDispatchEntry(
  actionId: string,
  revision: number,
  surface: SurfaceModel,
  componentId: string,
  basePath: string,
  type: 'TextField' | 'DateTimeInput',
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
    throw new Error('Slack inputs require a writable value binding.');
  }
  return {
    actionId,
    revision,
    surface,
    componentId,
    basePath,
    path: binding.path,
    kind:
      type === 'DateTimeInput' ? 'date' : props.variant === 'longText' ? 'longText' : 'shortText',
  };
}

export function lowerFormInput(
  entry: InputDispatchEntry,
  props: Readonly<Record<string, unknown>>,
): ChannelNode {
  const label = props.label ?? (entry.kind === 'date' ? 'Date' : undefined);
  if (typeof label !== 'string' || !label.trim() || label.length > 2_000) {
    throw new Error('Slack input labels must contain 1–2000 characters.');
  }
  const value = readFormInputValue(entry);
  validateInputValue(entry, value);
  const block: InputBlock = {
    type: 'input',
    label: {type: 'plain_text', text: label},
    optional: true,
    dispatch_action: true,
    element:
      entry.kind === 'date'
        ? {
            type: 'datepicker',
            action_id: entry.actionId,
            ...(value ? {initial_date: value} : {}),
          }
        : {
            type: 'plain_text_input',
            action_id: entry.actionId,
            multiline: entry.kind === 'longText',
            max_length: 3_000,
            ...(value ? {initial_value: value} : {}),
            dispatch_action_config: {trigger_actions_on: ['on_character_entered']},
          },
  };
  return createNativeNode('slack', 'raw', 'raw', {value: block});
}

export function updateFormInput(entry: InputDispatchEntry, value: unknown): void {
  validateInputValue(entry, value);
  const context = new ComponentContext(entry.surface, entry.componentId, entry.basePath);
  context.dataContext.set(entry.path, value);
}

export function readFormInputValue(entry: InputDispatchEntry): unknown {
  const context = new ComponentContext(entry.surface, entry.componentId, entry.basePath);
  const value = context.dataContext.resolveDynamicValue({path: entry.path});
  return value === undefined || value === null ? '' : value;
}

function validateInputValue(entry: InputDispatchEntry, value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new Error('Slack input values must be strings.');
  if (entry.kind === 'date') {
    if (value === '') return;
    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      value.startsWith('0000-') ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new Error('Slack dates must be valid calendar dates in YYYY-MM-DD format.');
    }
    return;
  }
  if (value.length > 3_000) throw new Error('Slack text inputs accept at most 3000 characters.');
  if (entry.kind === 'shortText' && /[\r\n]/.test(value)) {
    throw new Error(
      'Slack shortText inputs must contain a single line. Use longText for multiple lines.',
    );
  }
}
