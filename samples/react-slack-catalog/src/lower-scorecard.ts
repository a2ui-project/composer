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

import {type Renderable} from '@copilotkit/channels-ui';
import {drawnImageAltText, optionalText, skipWithWarning} from './drawn-component-props';
import {type LowerComponentContext} from './lowering-context';
import {DiagnosticCode} from './preview-snapshot';
import {recordField} from './record-fields';
import {
  ScorecardSide,
  describeScorecard,
  renderScorecardSvg,
  type ScorecardImageProps,
  type ScorecardTeam,
} from './scorecard-image';

/**
 * Draws the sample's `Scorecard` component as an image while lowering. Slack has no block
 * for a scorecard, and Channels UI has no scorecard component.
 */
export function lowerScorecard(
  props: Readonly<Record<string, unknown>>,
  context: LowerComponentContext,
): Renderable {
  const home = scorecardTeam(props.home, ScorecardSide.HOME, context);
  if (!home) {
    return [];
  }
  const away = scorecardTeam(props.away, ScorecardSide.AWAY, context);
  if (!away) {
    return [];
  }
  const scorecard: ScorecardImageProps = {
    home,
    away,
    status: optionalText(props.status),
    competition: optionalText(props.competition),
  };
  return context.placeDrawnImage({
    componentType: 'Scorecard',
    componentId: context.componentId,
    svg: renderScorecardSvg(scorecard),
    alt: drawnImageAltText(props, describeScorecard(scorecard)),
  });
}

/**
 * Reads one team's name and score as text, or explains in a warning why the scorecard
 * can't be drawn.
 *
 * @param side Which team this is, which the warning names.
 */
function scorecardTeam(
  value: unknown,
  side: ScorecardSide,
  context: LowerComponentContext,
): ScorecardTeam | undefined {
  const name = optionalText(recordField(value, 'name'));
  const score = optionalText(recordField(value, 'score'));
  if (name === undefined || score === undefined) {
    return skipWithWarning(
      context,
      DiagnosticCode.SLACK_SCORECARD_INVALID,
      `Scorecard "${context.componentId}" has no ${name === undefined ? 'name' : 'score'} for the ${side} team. Give both teams a name and a score, such as "Argentina" and 2.`,
    );
  }
  return {name, score};
}
