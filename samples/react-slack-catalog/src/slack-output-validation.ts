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
import {type KnownBlock} from '@slack/types';
import {LoweringError} from './lowering-error';
import {DiagnosticCode} from './preview-snapshot';
import {arrayField, isRecord, recordField, stringField} from './record-fields';
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
    const blockType = stringField(block, 'type');
    if (blockType === 'header') {
      assertTextLimit(
        blockText(block),
        SLACK_LIMITS.headerText,
        DiagnosticCode.SLACK_HEADER_TEXT_LIMIT_EXCEEDED,
      );
    }
    if (blockType === 'section') {
      assertTextLimit(
        blockText(block),
        SLACK_LIMITS.sectionText,
        DiagnosticCode.SLACK_SECTION_TEXT_LIMIT_EXCEEDED,
      );
      const fields = arrayField(block, 'fields');
      if (fields.length > SLACK_LIMITS.fieldsPerSection) {
        throw new LoweringError(
          DiagnosticCode.SLACK_SECTION_FIELDS_LIMIT_EXCEEDED,
          `Slack output rendered ${fields.length} section fields; the limit is ${SLACK_LIMITS.fieldsPerSection}.`,
        );
      }
      for (const field of fields) {
        assertTextLimit(
          textObjectText(field),
          SLACK_LIMITS.fieldText,
          DiagnosticCode.SLACK_SECTION_FIELD_TEXT_LIMIT_EXCEEDED,
        );
      }
    }
    if (blockType === 'actions') {
      const elements = arrayField(block, 'elements');
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
    if (blockType === 'context') {
      validateContextBlock(block);
    }
    if (blockType === 'image') {
      validateImageBlock(block);
    }
    if (blockType === 'table') {
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

function validateActionElement(element: unknown): void {
  if (stringField(element, 'type') !== 'button') {
    return;
  }
  assertTextLimit(
    blockText(element),
    SLACK_LIMITS.buttonText,
    DiagnosticCode.SLACK_BUTTON_TEXT_LIMIT_EXCEEDED,
  );
}

function validateContextBlock(block: unknown): void {
  const elements = arrayField(block, 'elements');
  if (elements.length > SLACK_LIMITS.contextElements) {
    throw new LoweringError(
      DiagnosticCode.SLACK_CONTEXT_ELEMENTS_LIMIT_EXCEEDED,
      `Slack output rendered ${elements.length} context elements; the limit is ${SLACK_LIMITS.contextElements}.`,
    );
  }

  for (const element of elements) {
    const elementType = stringField(element, 'type');
    if (elementType === 'mrkdwn' || elementType === 'plain_text') {
      assertTextLimit(
        textObjectText(element),
        SLACK_TEXT_OBJECT_MAX_LENGTH,
        DiagnosticCode.SLACK_CONTEXT_TEXT_LIMIT_EXCEEDED,
      );
    }
    if (elementType === 'image') {
      assertTextLimit(
        stringField(element, 'image_url'),
        SLACK_IMAGE_URL_MAX_LENGTH,
        DiagnosticCode.SLACK_CONTEXT_IMAGE_URL_LIMIT_EXCEEDED,
      );
    }
  }
}

function validateImageBlock(block: unknown): void {
  assertTextLimit(
    stringField(block, 'image_url'),
    SLACK_IMAGE_URL_MAX_LENGTH,
    DiagnosticCode.SLACK_IMAGE_URL_LIMIT_EXCEEDED,
  );
  assertTextLimit(
    stringField(block, 'alt_text'),
    SLACK_IMAGE_ALT_TEXT_MAX_LENGTH,
    DiagnosticCode.SLACK_IMAGE_ALT_TEXT_LIMIT_EXCEEDED,
  );
  assertTextLimit(
    textObjectText(recordField(block, 'title')),
    SLACK_IMAGE_TITLE_MAX_LENGTH,
    DiagnosticCode.SLACK_IMAGE_TITLE_TEXT_LIMIT_EXCEEDED,
  );
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

function blockText(value: unknown): string | undefined {
  return textObjectText(recordField(value, 'text'));
}

function tableCellTexts(block: unknown): string[] {
  return arrayField(block, 'rows').flatMap(row =>
    Array.isArray(row) ? row.flatMap(tableCellTextValues) : [],
  );
}

function tableCellTextValues(cell: unknown): string[] {
  const cellType = stringField(cell, 'type');
  if (cellType === 'raw_text' || cellType === 'raw_number') {
    const text = stringField(cell, 'text');
    return text === undefined ? [] : [text];
  }
  if (cellType !== 'rich_text') {
    return [];
  }
  return richTextValues(arrayField(cell, 'elements'));
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

function textObjectText(value: unknown): string | undefined {
  return isRecord(value) && typeof value.text === 'string' ? value.text : undefined;
}
