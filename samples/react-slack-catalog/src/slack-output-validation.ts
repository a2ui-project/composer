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

import {SLACK_LIMITS} from '@copilotkit/channels-slack/render';
import {
  type ActionsBlockElement,
  type ContextBlock,
  type ImageBlock,
  type KnownBlock,
  type RawTextElement,
  type RichTextBlock,
  type TableBlock,
} from '@slack/types';
import {LoweringError} from './lowering-error';
import {DiagnosticCode} from './preview-snapshot';
import {isRecord} from './record-fields';
import {
  SLACK_IMAGE_ALT_TEXT_MAX_LENGTH,
  SLACK_IMAGE_TITLE_MAX_LENGTH,
  SLACK_IMAGE_URL_MAX_LENGTH,
  SLACK_TABLE_TEXT_MAX_LENGTH,
  SLACK_TEXT_OBJECT_MAX_LENGTH,
} from './slack-limits';

/**
 * Checks rendered Block Kit against Slack's limits, and throws a
 * `LoweringError` for the first limit it exceeds.
 */
export function validateSlackOutput(blocks: readonly KnownBlock[]): void {
  if (blocks.length > SLACK_LIMITS.blocksPerMessage) {
    throw new LoweringError(
      DiagnosticCode.SLACK_BLOCK_LIMIT_EXCEEDED,
      `Slack output rendered ${blocks.length} blocks; the message limit is ${SLACK_LIMITS.blocksPerMessage}.`,
    );
  }

  let aggregateTableLength = 0;
  for (const block of blocks) {
    if (block.type === 'header') {
      assertTextLimit(
        block.text.text,
        SLACK_LIMITS.headerText,
        DiagnosticCode.SLACK_HEADER_TEXT_LIMIT_EXCEEDED,
      );
    }
    if (block.type === 'section') {
      assertTextLimit(
        block.text?.text,
        SLACK_LIMITS.sectionText,
        DiagnosticCode.SLACK_SECTION_TEXT_LIMIT_EXCEEDED,
      );
      const fields = block.fields ?? [];
      if (fields.length > SLACK_LIMITS.fieldsPerSection) {
        throw new LoweringError(
          DiagnosticCode.SLACK_SECTION_FIELDS_LIMIT_EXCEEDED,
          `Slack output rendered ${fields.length} section fields; the limit is ${SLACK_LIMITS.fieldsPerSection}.`,
        );
      }
      for (const field of fields) {
        assertTextLimit(
          field.text,
          SLACK_LIMITS.fieldText,
          DiagnosticCode.SLACK_SECTION_FIELD_TEXT_LIMIT_EXCEEDED,
        );
      }
    }
    if (block.type === 'actions') {
      const elements = block.elements;
      if (elements.length > SLACK_LIMITS.actionsElements) {
        throw new LoweringError(
          DiagnosticCode.SLACK_ACTIONS_ELEMENTS_LIMIT_EXCEEDED,
          `Slack output rendered ${elements.length} action elements; the limit is ${SLACK_LIMITS.actionsElements}.`,
        );
      }
      for (const element of elements) {
        validateActionElement(element);
      }
    }
    if (block.type === 'context') {
      validateContextBlock(block);
    }
    if (block.type === 'image') {
      validateImageBlock(block);
    }
    if (block.type === 'table') {
      const cellTexts = tableCellTexts(block);
      aggregateTableLength += cellTexts.reduce((sum, text) => sum + text.length, 0);
      if (aggregateTableLength > SLACK_TABLE_TEXT_MAX_LENGTH) {
        throw new LoweringError(
          DiagnosticCode.SLACK_TABLE_CELL_TEXT_AGGREGATE_LIMIT_EXCEEDED,
          `Slack output rendered ${aggregateTableLength} aggregate table cell characters; the table and message limit is ${SLACK_TABLE_TEXT_MAX_LENGTH}.`,
        );
      }
      for (const cellText of cellTexts) {
        assertTextLimit(
          cellText,
          SLACK_LIMITS.cellText,
          DiagnosticCode.SLACK_TABLE_CELL_TEXT_LIMIT_EXCEEDED,
        );
      }
    }
  }
}

function validateActionElement(element: ActionsBlockElement): void {
  if (element.type !== 'button') {
    return;
  }
  assertTextLimit(
    element.text.text,
    SLACK_LIMITS.buttonText,
    DiagnosticCode.SLACK_BUTTON_TEXT_LIMIT_EXCEEDED,
  );
}

function validateContextBlock(block: ContextBlock): void {
  const elements = block.elements;
  if (elements.length > SLACK_LIMITS.contextElements) {
    throw new LoweringError(
      DiagnosticCode.SLACK_CONTEXT_ELEMENTS_LIMIT_EXCEEDED,
      `Slack output rendered ${elements.length} context elements; the limit is ${SLACK_LIMITS.contextElements}.`,
    );
  }

  for (const element of elements) {
    if (element.type === 'mrkdwn' || element.type === 'plain_text') {
      assertTextLimit(
        element.text,
        SLACK_TEXT_OBJECT_MAX_LENGTH,
        DiagnosticCode.SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED,
      );
    }
    if (element.type === 'image') {
      assertTextLimit(
        imageUrl(element),
        SLACK_IMAGE_URL_MAX_LENGTH,
        DiagnosticCode.SLACK_CONTEXT_IMAGE_URL_LIMIT_EXCEEDED,
      );
    }
  }
}

function validateImageBlock(block: ImageBlock): void {
  assertTextLimit(
    imageUrl(block),
    SLACK_IMAGE_URL_MAX_LENGTH,
    DiagnosticCode.SLACK_IMAGE_URL_LIMIT_EXCEEDED,
  );
  assertTextLimit(
    block.alt_text,
    SLACK_IMAGE_ALT_TEXT_MAX_LENGTH,
    DiagnosticCode.SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED,
  );
  assertTextLimit(
    block.title?.text,
    SLACK_IMAGE_TITLE_MAX_LENGTH,
    DiagnosticCode.SLACK_IMAGE_TITLE_TEXT_LIMIT_EXCEEDED,
  );
}

/**
 * The `image_url` of an image block or element. Slack also accepts an image
 * as a `slack_file` instead, which has no URL to check.
 */
function imageUrl(image: ImageBlock | ContextBlock['elements'][number]): string | undefined {
  return 'image_url' in image ? image.image_url : undefined;
}

function assertTextLimit(text: string | undefined, limit: number, code: DiagnosticCode): void {
  if (text === undefined || text.length <= limit) {
    return;
  }
  throw new LoweringError(
    code,
    `Slack output rendered ${text.length} characters; the limit is ${limit}.`,
  );
}

function tableCellTexts(block: TableBlock): string[] {
  return block.rows.flatMap(row => row.flatMap(tableCellTextValues));
}

function tableCellTextValues(cell: RichTextBlock | RawTextElement): string[] {
  if (cell.type === 'raw_text') {
    return [cell.text];
  }
  return richTextValues(cell.elements);
}

function richTextValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(richTextValues);
  }
  if (!isRecord(value)) {
    return [];
  }

  const ownText = typeof value.text === 'string' ? [value.text] : [];
  return [...ownText, ...richTextValues(value.elements)];
}
