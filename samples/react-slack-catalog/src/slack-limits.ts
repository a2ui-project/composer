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

/**
 * @fileoverview Slack Block Kit limits this sample checks that
 * `SLACK_LIMITS` from `@copilotkit/channels-slack` doesn't name, and values
 * derived from ones it does. Use `SLACK_LIMITS` directly for the limits it
 * has, so each value has one source.
 */

import {SLACK_LIMITS} from '@copilotkit/channels-slack/render';

/**
 * The most body rows a Slack table can have. Slack allows 100 rows, and the
 * header row the sample draws from the A2UI `columns` is one of them.
 * https://docs.slack.dev/reference/block-kit/blocks/table-block
 */
export const SLACK_TABLE_MAX_BODY_ROWS = SLACK_LIMITS.tableRows - 1;

/**
 * The most characters all table cells in one message can hold together.
 * https://docs.slack.dev/reference/block-kit/blocks/table-block
 */
export const SLACK_TABLE_TEXT_MAX_LENGTH = 10_000;

/**
 * The most characters a text object can hold, such as one in a context block.
 * `SLACK_LIMITS.sectionText` has the same value, but it is the limit for a
 * section block's text, which Slack documents separately.
 * https://docs.slack.dev/reference/block-kit/composition-objects/text-object
 */
export const SLACK_TEXT_OBJECT_MAX_LENGTH = 3_000;

/**
 * The longest `image_url` an image block or a context block's image element
 * accepts.
 * https://docs.slack.dev/reference/block-kit/blocks/image-block
 * https://docs.slack.dev/reference/block-kit/block-elements/image-element
 */
export const SLACK_IMAGE_URL_MAX_LENGTH = 3_000;

/**
 * The longest `alt_text` an image block accepts.
 * https://docs.slack.dev/reference/block-kit/blocks/image-block
 */
export const SLACK_IMAGE_ALT_TEXT_MAX_LENGTH = 2_000;

/**
 * The longest `title` text an image block accepts.
 * https://docs.slack.dev/reference/block-kit/blocks/image-block
 */
export const SLACK_IMAGE_TITLE_MAX_LENGTH = 2_000;

/**
 * The longest label an input block accepts.
 * https://docs.slack.dev/reference/block-kit/blocks/input-block
 */
export const SLACK_INPUT_LABEL_MAX_LENGTH = 2_000;

/**
 * The most a user can type into a plain-text input, which this sample also
 * applies to the value it pre-fills from the data model.
 * https://docs.slack.dev/reference/block-kit/block-elements/plain-text-input-element
 */
export const SLACK_TEXT_INPUT_MAX_LENGTH = 3_000;
