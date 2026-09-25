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

export interface EventActionDispatchEntry {
  readonly actionId: string;
  readonly revision: number;
  readonly surface: SurfaceModel;
  readonly surfaceId: string;
  readonly sourceComponentId: string;
  readonly basePath: string;
  readonly action: Action;
}

export type EventActionRegistry = ReadonlyMap<string, EventActionDispatchEntry>;

export interface EventActionDispatchState {
  readonly surface?: SurfaceModel;
  readonly registry: EventActionRegistry;
}

export interface CreateEventActionDispatchEntryOptions {
  readonly actionId: string;
  readonly revision: number;
  readonly surface: SurfaceModel;
  readonly sourceComponentId: string;
  readonly basePath: string;
  readonly action: unknown;
}

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
