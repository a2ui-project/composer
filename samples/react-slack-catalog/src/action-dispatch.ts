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

import {ActionSchema, ComponentContext, type Action, type SurfaceModel} from '@a2ui/web_core/v0_9';

/**
 * An A2UI event action lowered onto a Slack button or menu, kept so a click on
 * that Slack element can be sent back through the A2UI surface it came from.
 */
export interface EventActionDispatchEntry {
  /** The Slack `action_id` given to the element that triggers this action. */
  readonly actionId: string;
  /** The preview render this entry was created in; a later render replaces it. */
  readonly revision: number;
  /** The surface that drew the source component. */
  readonly surface: SurfaceModel;
  /** The surface's ID when the entry was created, to detect a replaced surface. */
  readonly surfaceId: string;
  /** The A2UI component that declared the action. */
  readonly sourceComponentId: string;
  /** The data model path the component was drawn under, such as a list item's. */
  readonly basePath: string;
  /** The parsed A2UI event action. Function-call actions are never stored here. */
  readonly action: Action;
}

/** Event action entries by Slack `action_id`. */
export type EventActionRegistry = ReadonlyMap<string, EventActionDispatchEntry>;

/** What `dispatchCurrentEventAction` checks an entry against. */
export interface EventActionDispatchState {
  /** The surface the preview shows now, if any. */
  readonly surface?: SurfaceModel;
  /** The event actions registered for that surface. */
  readonly registry: EventActionRegistry;
}

/**
 * Arguments for `createEventActionDispatchEntry`. The fields match
 * `EventActionDispatchEntry`, except that `action` is the component's raw,
 * unvalidated `action` property.
 */
export interface CreateEventActionDispatchEntryOptions {
  readonly actionId: string;
  readonly revision: number;
  readonly surface: SurfaceModel;
  readonly sourceComponentId: string;
  readonly basePath: string;
  readonly action: unknown;
}

/**
 * Validates a component's action and wraps it for dispatch from Slack.
 *
 * @return The entry, or `undefined` for a function-call action, which the
 *     caller runs locally instead of dispatching.
 * @throws If `action` isn't a valid A2UI action.
 */
export function createEventActionDispatchEntry({
  actionId,
  revision,
  surface,
  sourceComponentId,
  basePath,
  action,
}: CreateEventActionDispatchEntryOptions): EventActionDispatchEntry | undefined {
  const parsedAction = ActionSchema.parse(action) as Action;
  if ('functionCall' in parsedAction) {
    return undefined;
  }
  return {
    actionId,
    revision,
    surface,
    surfaceId: surface.id,
    sourceComponentId,
    basePath,
    action: parsedAction,
  };
}

/**
 * Dispatches a registered event action through its surface, only if that
 * surface is still the one the preview shows.
 *
 * @return Whether the action was dispatched.
 */
export async function dispatchCurrentEventAction(
  actionId: string,
  state: EventActionDispatchState,
): Promise<boolean> {
  const entry = state.registry.get(actionId);
  if (!entry || !state.surface) {
    return false;
  }
  if (entry.surface !== state.surface) {
    return false;
  }
  if (entry.surfaceId !== state.surface.id) {
    return false;
  }

  const context = new ComponentContext(state.surface, entry.sourceComponentId, entry.basePath);
  await context.dispatchAction(context.dataContext.resolveAction(entry.action));
  return true;
}
