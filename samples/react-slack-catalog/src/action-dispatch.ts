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

import {ComponentContext, type Action, type SurfaceModel} from '@a2ui/web_core/v0_9';

/**
 * An A2UI action lowered onto a Slack button, kept so a click on that button
 * can be run against the A2UI surface it came from.
 */
export interface ActionDispatchEntry {
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
  /**
   * The validated A2UI action: an event, which is sent to Composer, or a
   * function call, which the preview runs locally.
   */
  readonly action: Action;
}

/** Action entries by Slack `action_id`. */
export type ActionRegistry = ReadonlyMap<string, ActionDispatchEntry>;

/** What `dispatchCurrentEventAction` checks an entry against. */
interface ActionDispatchState {
  /** The surface the preview shows now, if any. */
  readonly surface?: SurfaceModel;
  /** The actions registered for that surface. */
  readonly registry: ActionRegistry;
}

/**
 * Whether an entry still belongs to the surface the preview shows. A surface
 * deleted and recreated under the same ID is a new `SurfaceModel`, so a click
 * left over from the old one is ignored.
 */
export function isCurrentActionEntry(
  entry: ActionDispatchEntry,
  surface: SurfaceModel | undefined,
): surface is SurfaceModel {
  return Boolean(surface && entry.surface === surface && entry.surfaceId === surface.id);
}

/**
 * Dispatches a registered event action through its surface, only if that
 * surface is still the one the preview shows.
 *
 * @return Whether the action was dispatched.
 */
export async function dispatchCurrentEventAction(
  actionId: string,
  state: ActionDispatchState,
): Promise<boolean> {
  const entry = state.registry.get(actionId);
  if (!entry || !isCurrentActionEntry(entry, state.surface)) {
    return false;
  }

  const context = new ComponentContext(state.surface, entry.sourceComponentId, entry.basePath);
  await context.dispatchAction(context.dataContext.resolveAction(entry.action));
  return true;
}
