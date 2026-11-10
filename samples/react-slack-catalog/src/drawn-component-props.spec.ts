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

import {describe, expect, it} from 'vitest';
import {drawnImageAltText} from './drawn-component-props';
import {DiagnosticCode, DiagnosticLevel, type PreviewDiagnostic} from './preview-snapshot';
import {SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} from './slack-limits';

describe('drawnImageAltText', () => {
  const description = 'Pie chart, Possession: Argentina 70, Mexico 30';
  const tooLong = 'x'.repeat(SLACK_IMAGE_ALT_TEXT_MAX_LENGTH + 1);

  /** What lowering the chart `possession` gives `drawnImageAltText`, with no diagnostics yet. */
  const lowering = (): {componentId: string; diagnostics: PreviewDiagnostic[]} => ({
    componentId: 'possession',
    diagnostics: [],
  });

  it('uses the accessibility label instead of the description', () => {
    expect(
      drawnImageAltText(
        {accessibility: {label: 'Argentina had most of the ball'}},
        description,
        lowering(),
      ),
    ).toBe('Argentina had most of the ball');
  });

  it('uses the description when the accessibility label is blank', () => {
    expect(drawnImageAltText({accessibility: {label: ' '}}, description, lowering())).toBe(
      description,
    );
  });

  it("cuts a label longer than Slack's alt text limit, ending it with an ellipsis", () => {
    const alt = drawnImageAltText({accessibility: {label: tooLong}}, description, lowering());

    expect(alt).toBe(`${'x'.repeat(SLACK_IMAGE_ALT_TEXT_MAX_LENGTH - 1)}…`);
  });

  it("warns that it cut a label longer than Slack's alt text limit", () => {
    const context = lowering();

    drawnImageAltText({accessibility: {label: tooLong}}, description, context);

    expect(context.diagnostics).toEqual([
      {
        level: DiagnosticLevel.WARNING,
        code: DiagnosticCode.SLACK_IMAGE_ALT_TEXT_TRUNCATED,
        componentId: 'possession',
        message: `The accessibility label is longer than Slack's alt text limit, so the image's alt text was cut to ${SLACK_IMAGE_ALT_TEXT_MAX_LENGTH} characters.`,
      },
    ]);
  });

  it("cuts a description longer than Slack's alt text limit, ending it with an ellipsis", () => {
    const alt = drawnImageAltText({}, tooLong, lowering());

    expect(alt).toBe(`${'x'.repeat(SLACK_IMAGE_ALT_TEXT_MAX_LENGTH - 1)}…`);
  });

  it("cuts a description longer than Slack's alt text limit without a warning", () => {
    const context = lowering();

    drawnImageAltText({}, tooLong, context);

    expect(context.diagnostics).toEqual([]);
  });
});
