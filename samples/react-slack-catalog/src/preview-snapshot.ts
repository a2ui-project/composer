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

import {type KnownBlock} from '@slack/types';

/** Where the preview is in turning the current A2UI surface into Slack blocks. */
export enum PreviewStatus {
  /** There is no surface, or the surface has no components yet. */
  EMPTY = 'empty',
  /** The surface refers to a component that hasn't arrived yet. */
  WAITING = 'waiting',
  /** The surface was lowered to Slack blocks. */
  READY = 'ready',
  /** The surface could not be lowered; the diagnostics say why. */
  ERROR = 'error',
}

/** How serious a preview diagnostic is. */
export enum DiagnosticLevel {
  /** Nothing is wrong; the preview is reporting progress. */
  INFO = 'info',
  /** The preview rendered, but Slack can't show part of the surface as authored. */
  WARNING = 'warning',
  /** The preview could not render, or an interaction failed. */
  ERROR = 'error',
}

/**
 * The problems the Slack preview reports. `A2UI_` codes are problems with the
 * A2UI messages; `SLACK_` codes are places where Slack can't show the surface
 * as authored, or limits on what Slack accepts.
 */
export enum DiagnosticCode {
  A2UI_COMPONENT_CYCLE = 'A2UI_COMPONENT_CYCLE',
  A2UI_INPUT_ERROR = 'A2UI_INPUT_ERROR',
  A2UI_INVALID_ACTION = 'A2UI_INVALID_ACTION',
  A2UI_INVALID_IMAGE_ALT_TEXT = 'A2UI_INVALID_IMAGE_ALT_TEXT',
  A2UI_INVALID_IMAGE_URL = 'A2UI_INVALID_IMAGE_URL',
  A2UI_INVALID_PROPS = 'A2UI_INVALID_PROPS',
  A2UI_INVALID_TABLE_CELL = 'A2UI_INVALID_TABLE_CELL',
  A2UI_INVALID_TABLE_HEADER = 'A2UI_INVALID_TABLE_HEADER',
  A2UI_INVALID_TABLE_ROW = 'A2UI_INVALID_TABLE_ROW',
  A2UI_LOCAL_FUNCTION_ERROR = 'A2UI_LOCAL_FUNCTION_ERROR',
  /** An unexpected error while lowering, with no more specific code. */
  A2UI_LOWERING_ERROR = 'A2UI_LOWERING_ERROR',
  A2UI_PROCESS_MESSAGE_ERROR = 'A2UI_PROCESS_MESSAGE_ERROR',
  A2UI_UNSUPPORTED_COMPONENT = 'A2UI_UNSUPPORTED_COMPONENT',
  A2UI_WAITING_FOR_COMPONENT = 'A2UI_WAITING_FOR_COMPONENT',
  SLACK_ACTION_DISPATCH_FAILED = 'SLACK_ACTION_DISPATCH_FAILED',
  /** Some registered actions were dropped because their buttons were trimmed. */
  SLACK_ACTION_REGISTRY_FILTERED = 'SLACK_ACTION_REGISTRY_FILTERED',
  SLACK_ACTIONS_ELEMENTS_LIMIT_EXCEEDED = 'SLACK_ACTIONS_ELEMENTS_LIMIT_EXCEEDED',
  SLACK_ACTIONS_ELEMENTS_TRIMMED = 'SLACK_ACTIONS_ELEMENTS_TRIMMED',
  SLACK_BLOCK_LIMIT_EXCEEDED = 'SLACK_BLOCK_LIMIT_EXCEEDED',
  SLACK_BLOCKS_TRIMMED = 'SLACK_BLOCKS_TRIMMED',
  SLACK_BUTTON_TEXT_LIMIT_EXCEEDED = 'SLACK_BUTTON_TEXT_LIMIT_EXCEEDED',
  SLACK_BUTTON_TEXT_TRUNCATED = 'SLACK_BUTTON_TEXT_TRUNCATED',
  /** A Chart was left out because all of its values are zero. */
  SLACK_CHART_EMPTY = 'SLACK_CHART_EMPTY',
  /** A Chart was left out because a value isn't a number, or a pie or donut value is negative. */
  SLACK_CHART_INVALID_DATA = 'SLACK_CHART_INVALID_DATA',
  SLACK_CONTEXT_ELEMENTS_LIMIT_EXCEEDED = 'SLACK_CONTEXT_ELEMENTS_LIMIT_EXCEEDED',
  SLACK_CONTEXT_IMAGE_URL_LIMIT_EXCEEDED = 'SLACK_CONTEXT_IMAGE_URL_LIMIT_EXCEEDED',
  SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED = 'SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED',
  SLACK_HEADER_TEXT_LIMIT_EXCEEDED = 'SLACK_HEADER_TEXT_LIMIT_EXCEEDED',
  SLACK_HEADER_TEXT_TRUNCATED = 'SLACK_HEADER_TEXT_TRUNCATED',
  SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED = 'SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED',
  /**
   * A Chart is drawn as an image in the preview. In Slack, the Channels app
   * renders it and uploads the image when it sends the message.
   */
  SLACK_IMAGE_RENDERED_AT_SEND = 'SLACK_IMAGE_RENDERED_AT_SEND',
  /** Slack image blocks ignore the A2UI Image `fit` and `variant` hints. */
  SLACK_IMAGE_STYLE_APPROXIMATED = 'SLACK_IMAGE_STYLE_APPROXIMATED',
  SLACK_IMAGE_TITLE_TEXT_LIMIT_EXCEEDED = 'SLACK_IMAGE_TITLE_TEXT_LIMIT_EXCEEDED',
  SLACK_IMAGE_URL_LIMIT_EXCEEDED = 'SLACK_IMAGE_URL_LIMIT_EXCEEDED',
  /** A Row, Column or Card was drawn as a plain sequence of Slack blocks. */
  SLACK_LAYOUT_FLATTENED = 'SLACK_LAYOUT_FLATTENED',
  SLACK_SECTION_FIELD_TEXT_LIMIT_EXCEEDED = 'SLACK_SECTION_FIELD_TEXT_LIMIT_EXCEEDED',
  SLACK_SECTION_FIELDS_LIMIT_EXCEEDED = 'SLACK_SECTION_FIELDS_LIMIT_EXCEEDED',
  SLACK_SECTION_TEXT_LIMIT_EXCEEDED = 'SLACK_SECTION_TEXT_LIMIT_EXCEEDED',
  SLACK_SECTION_TEXT_TRUNCATED = 'SLACK_SECTION_TEXT_TRUNCATED',
  SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT_EXCEEDED = 'SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT_EXCEEDED',
  SLACK_TABLE_CELL_TEXT_LIMIT_EXCEEDED = 'SLACK_TABLE_CELL_TEXT_LIMIT_EXCEEDED',
  SLACK_TABLE_CELL_TEXT_TRUNCATED = 'SLACK_TABLE_CELL_TEXT_TRUNCATED',
  /** A Text heading other than h1 was drawn as a Slack header, which has one size. */
  SLACK_TEXT_VARIANT_APPROXIMATED = 'SLACK_TEXT_VARIANT_APPROXIMATED',
}

/** A problem or note about the current preview, shown below it. */
export interface PreviewDiagnostic {
  /** How serious the problem is. */
  level: DiagnosticLevel;
  /**
   * A `DiagnosticCode`, or the code of an error the A2UI surface reported while
   * binding data, such as `EXPRESSION_ERROR`.
   */
  code: string;
  /** What went wrong, for the person editing the surface. */
  message: string;
  /** The A2UI component the problem is in, when there is one. */
  componentId?: string;
}

/** What the preview shows for one render of the current A2UI surface. */
export interface PreviewSnapshot {
  /** Increases on every render, so a change of revision means new content. */
  revision: number;
  /**
   * Increases when the Slack input controls must be recreated: on an external
   * update or a rejected edit. A valid edit typed in the preview leaves it alone,
   * so the field being typed in keeps focus.
   */
  inputResetKey?: number;
  /** The ID of the surface shown, if there is one. */
  surfaceId?: string;
  /** Whether `blocks` holds a render. */
  status: PreviewStatus;
  /** The Slack Block Kit blocks; empty unless `status` is `READY`. */
  blocks: KnownBlock[];
  /**
   * Set on ready snapshots: the blocks "Generated Block Kit" exports. Each drawn chart is a
   * placeholder for a file the Channels app uploads, instead of a local image URL.
   */
  exportBlocks?: KnownBlock[];
  /** Problems found in this render. */
  diagnostics: PreviewDiagnostic[];
}

/** A snapshot with nothing to show, for the given revision. */
export function createEmptySnapshot(revision: number): PreviewSnapshot {
  return {
    revision,
    status: PreviewStatus.EMPTY,
    blocks: [],
    diagnostics: [],
  };
}

/** The blocks to export or copy: `exportBlocks` when present, otherwise the preview blocks. */
export function blocksForExport(snapshot: PreviewSnapshot): KnownBlock[] {
  return snapshot.exportBlocks ?? snapshot.blocks;
}
