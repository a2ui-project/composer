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
 * @fileoverview Reads the bound props of the components the preview draws as images,
 * Chart and Scorecard.
 *
 * Props the schema accepts can still be impossible to draw: a bound value can resolve to
 * text that isn't a number, or to nothing. Such a component is left out of the message
 * with a warning, and the rest of the message still renders. Its image is an addition
 * that the app that sends the message uploads, and the message's other blocks are
 * complete without it. A component lowered to native Slack blocks throws a
 * `LoweringError` for props it can't lower instead, which fails the whole render: a Table
 * throws for a header or cell that doesn't resolve to text, or a row without one cell per
 * column. Those blocks carry the message's text, and the preview shows none of the
 * message rather than one with some of that text left out.
 */

import {clipText} from './drawn-image-style';
import {type LowerComponentContext} from './lowering-context';
import {DiagnosticCode, DiagnosticLevel} from './preview-snapshot';
import {recordField} from './record-fields';
import {SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} from './slack-limits';

/** Reports why a component was left out of the message, and returns nothing to draw. */
export function skipWithWarning(
  context: LowerComponentContext,
  code: DiagnosticCode,
  message: string,
): undefined {
  context.diagnostics.push({
    level: DiagnosticLevel.WARNING,
    code,
    message,
    componentId: context.componentId,
  });
  return undefined;
}

/**
 * The alt text of a drawn image: the component's accessibility label when it has one,
 * otherwise `description`, the drawing described in words. Either is cut to Slack's alt
 * text limit, ending with an ellipsis when cut. Cutting a label adds a warning, as the
 * author wrote it; a description only repeats what the image shows, so it is cut without
 * one.
 */
export function drawnImageAltText(
  props: Readonly<Record<string, unknown>>,
  description: string,
  context: Pick<LowerComponentContext, 'componentId' | 'diagnostics'>,
): string {
  const label = optionalText(recordField(props.accessibility, 'label'));
  if (label !== undefined && label.length > SLACK_IMAGE_ALT_TEXT_MAX_LENGTH) {
    context.diagnostics.push({
      level: DiagnosticLevel.WARNING,
      code: DiagnosticCode.SLACK_IMAGE_ALT_TEXT_TRUNCATED,
      message: `The accessibility label is longer than Slack's alt text limit, so the image's alt text was cut to ${SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} characters.`,
      componentId: context.componentId,
    });
  }
  return clipText(label ?? description, SLACK_IMAGE_ALT_TEXT_MAX_LENGTH);
}

/** The text of a bound value: a number as text, a string that isn't blank, or `undefined`. */
export function optionalText(value: unknown): string | undefined {
  if (typeof value === 'number') {
    return String(value);
  }
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}
