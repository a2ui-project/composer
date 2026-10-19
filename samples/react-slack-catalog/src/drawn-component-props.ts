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
 * Chart and Scorecard. Unlike the other components, a drawn component whose props can't
 * be drawn is left out of the message with a warning, and the rest of the message still
 * renders.
 */

import {clipText} from './drawn-image-style';
import {type LowerComponentContext} from './lowering-context';
import {DiagnosticLevel, type DiagnosticCode} from './preview-snapshot';
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
 * text limit, ending with an ellipsis when cut.
 */
export function drawnImageAltText(
  props: Readonly<Record<string, unknown>>,
  description: string,
): string {
  const label = optionalText(recordField(props.accessibility, 'label'));
  return clipText(label ?? description, SLACK_IMAGE_ALT_TEXT_MAX_LENGTH);
}

/** The text of a bound value: a number as text, a string that isn't blank, or `undefined`. */
export function optionalText(value: unknown): string | undefined {
  if (typeof value === 'number') {
    return String(value);
  }
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}
