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

import {ActionSchema, type SurfaceModel} from '@a2ui/web_core/v0_9';
import {type KnownBlock} from '@slack/types';
import {type ActionDispatchEntry} from './action-dispatch';
import {type LoweringState} from './lowering-context';
import {LoweringError} from './lowering-error';
import {DiagnosticCode, DiagnosticLevel, type PreviewDiagnostic} from './preview-snapshot';
import {isRecord} from './record-fields';

/**
 * The registered actions whose `action_id` is still in `blocks`. Adds a
 * warning to `diagnostics` when rendering dropped any.
 */
export function filterActionsForBlocks(
  registeredActions: ReadonlyMap<string, ActionDispatchEntry>,
  blocks: readonly KnownBlock[],
  diagnostics: PreviewDiagnostic[],
): Map<string, ActionDispatchEntry> {
  const survivingActionIds = collectActionIds(blocks);
  const nextActions = new Map(
    [...registeredActions].filter(([actionId]) => survivingActionIds.has(actionId)),
  );
  const filteredCount = registeredActions.size - nextActions.size;
  if (filteredCount > 0) {
    diagnostics.push({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_ACTION_REGISTRY_FILTERED,
      message: `${filteredCount} action ${
        filteredCount === 1 ? 'ID was' : 'IDs were'
      } omitted because it is not present in the final Slack output.`,
    });
  }
  return nextActions;
}

/** Every Slack `action_id` in some Block Kit, such as a snapshot's blocks. */
export function collectActionIds(value: unknown, actionIds = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectActionIds(item, actionIds);
    }
    return actionIds;
  }
  if (!isRecord(value)) {
    return actionIds;
  }

  if (typeof value.action_id === 'string') {
    actionIds.add(value.action_id);
  }
  for (const child of Object.values(value)) {
    collectActionIds(child, actionIds);
  }
  return actionIds;
}

/**
 * Validates a button's A2UI action and registers it in `state.actions` under a
 * new `action_id` for this revision, which it returns.
 */
export function registerAction(
  state: LoweringState,
  surface: SurfaceModel,
  componentId: string,
  basePath: string,
  rawAction: unknown,
): string {
  const parsed = ActionSchema.safeParse(rawAction);
  if (!parsed.success) {
    throw new LoweringError(
      DiagnosticCode.A2UI_INVALID_ACTION,
      `Component requires a valid A2UI action definition: ${parsed.error.issues
        .map(issue => `${issue.path.join('.') || 'action'} ${issue.message}`)
        .join('; ')}`,
      componentId,
    );
  }
  const actionId = `a2ui-${state.revision}-${state.nextActionOrdinal}`;
  state.nextActionOrdinal += 1;
  state.actions.set(actionId, {
    actionId,
    revision: state.revision,
    surface,
    surfaceId: surface.id,
    sourceComponentId: componentId,
    basePath,
    action: parsed.data,
  });
  return actionId;
}
