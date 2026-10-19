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

import {renderToStaticMarkup} from 'react-dom/server';
import {
  DRAWN_IMAGE_FONT_FAMILY,
  DrawnImageColor,
  charactersThatFit,
  clipText,
  estimateTextWidth,
  round,
} from './drawn-image-style';

/** One side of a match: a team and its score. */
export interface ScorecardTeam {
  readonly name: string;
  /** The score as it is shown, such as "2" or "3 (4)". */
  readonly score: string;
}

/** Everything needed to draw one scorecard. */
export interface ScorecardImageProps {
  /** Drawn on the left. */
  readonly home: ScorecardTeam;
  /** Drawn on the right. */
  readonly away: ScorecardTeam;
  /** Where the match stands, such as "Full time" or "72'". */
  readonly status?: string;
  /** The competition or stage, such as "World Cup, Group C". */
  readonly competition?: string;
}

/** A team name laid out to fit its column: one or two lines at one font size. */
interface FittedName {
  readonly fontSize: number;
  readonly lines: readonly string[];
}

/** A way to lay out a team name, tried in order until one fits. */
interface NameLayout {
  readonly fontSize: number;
  readonly maxLines: number;
}

/** Which team of a match: the home team, drawn on the left, or the away team, on the right. */
export enum ScorecardSide {
  HOME = 'home',
  AWAY = 'away',
}

interface TeamColumnProps {
  readonly team: ScorecardTeam;
  readonly side: ScorecardSide;
}

const WIDTH = 560;
const HEIGHT = 200;
const PADDING = 24;
/** The width of each team name's column, between the card's edge and the scores. */
const NAME_WIDTH = 152;
/** The vertical center of the team names and scores. */
const MIDDLE_Y = 104;
/** The widest a score may be, between its team's name and the dash. */
const SCORE_WIDTH = 64;
const SCORE_MAX_FONT_SIZE = 44;
/** The horizontal distance from the card's center to each score. */
const SCORE_OFFSET = 24;
/** Ways to lay out a team name, from largest to smallest. */
const NAME_LAYOUTS: readonly NameLayout[] = [
  {fontSize: 24, maxLines: 1},
  {fontSize: 20, maxLines: 1},
  {fontSize: 20, maxLines: 2},
  {fontSize: 16, maxLines: 2},
];

/**
 * Describes the scorecard in words, e.g. "Scorecard: Argentina 2, Mexico 0. Full time.
 * World Cup, Group C."
 *
 * @param maxLength The most characters the description may have, such as Slack's alt
 *     text limit.
 */
export function scorecardAltText(scorecard: ScorecardImageProps, maxLength: number): string {
  const {home, away} = scorecard;
  const parts = [
    `Scorecard: ${home.name} ${home.score}, ${away.name} ${away.score}`,
    scorecard.status,
    scorecard.competition,
  ].filter((part): part is string => Boolean(part));
  return clipText(`${parts.join('. ')}.`, maxLength);
}

/** Draws the scorecard as standalone SVG markup that can be served as an image. */
export function renderScorecardSvg(scorecard: ScorecardImageProps): string {
  return renderToStaticMarkup(<ScorecardSvg scorecard={scorecard} />);
}

/** A match result drawn as a card: the competition, both teams and scores, and the status. */
function ScorecardSvg({scorecard}: {readonly scorecard: ScorecardImageProps}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      fontFamily={DRAWN_IMAGE_FONT_FAMILY}
    >
      <defs>
        {[ScorecardSide.HOME, ScorecardSide.AWAY].map(side => (
          <clipPath key={side} id={`${side}-name`}>
            <rect x={nameColumnX(side)} y={0} width={NAME_WIDTH} height={HEIGHT} />
          </clipPath>
        ))}
      </defs>
      <rect
        x={0.5}
        y={0.5}
        width={WIDTH - 1}
        height={HEIGHT - 1}
        rx={12}
        fill={DrawnImageColor.BACKGROUND}
        stroke={DrawnImageColor.RULE}
      />
      {scorecard.competition ? (
        <text
          className="competition"
          x={WIDTH / 2}
          y={40}
          textAnchor="middle"
          fontSize={14}
          fill={DrawnImageColor.MUTED}
        >
          {clipText(scorecard.competition, 60)}
        </text>
      ) : null}
      <TeamColumn team={scorecard.home} side={ScorecardSide.HOME} />
      <text
        x={WIDTH / 2}
        y={round(MIDDLE_Y + 32 * 0.35)}
        textAnchor="middle"
        fontSize={32}
        fill={DrawnImageColor.MUTED}
      >
        –
      </text>
      <TeamColumn team={scorecard.away} side={ScorecardSide.AWAY} />
      {scorecard.status ? <StatusPill status={scorecard.status} /> : null}
    </svg>
  );
}

/** A team's name in its column at the card's edge, and its score beside the dash. */
function TeamColumn({team, side}: TeamColumnProps) {
  const name = fitName(team.name);
  const lineHeight = name.fontSize * 1.2;
  const firstBaseline =
    MIDDLE_Y - ((name.lines.length - 1) * lineHeight) / 2 + name.fontSize * 0.35;
  const score = clipText(team.score, 8);
  const scoreFontSize = fitFontSize(score, SCORE_WIDTH, SCORE_MAX_FONT_SIZE);
  const isHome = side === ScorecardSide.HOME;

  return (
    <g>
      <text
        className="team-name"
        x={nameColumnX(side) + NAME_WIDTH / 2}
        textAnchor="middle"
        fontSize={name.fontSize}
        fontWeight={600}
        fill={DrawnImageColor.INK}
        clipPath={`url(#${side}-name)`}
      >
        {name.lines.map((line, index) => (
          <tspan
            key={index}
            x={nameColumnX(side) + NAME_WIDTH / 2}
            y={round(firstBaseline + index * lineHeight)}
          >
            {line}
          </tspan>
        ))}
      </text>
      <text
        className="score"
        x={isHome ? WIDTH / 2 - SCORE_OFFSET : WIDTH / 2 + SCORE_OFFSET}
        y={round(MIDDLE_Y + scoreFontSize * 0.35)}
        textAnchor={isHome ? 'end' : 'start'}
        fontSize={scoreFontSize}
        fontWeight={700}
        fill={DrawnImageColor.INK}
      >
        {score}
      </text>
    </g>
  );
}

/** The match status in a rounded label under the scores. */
function StatusPill({status}: {readonly status: string}) {
  const text = clipText(status, 40);
  const fontSize = 13;
  const width = Math.min(WIDTH - 2 * PADDING, estimateTextWidth(text, fontSize) + 28);
  const centerY = 162;
  return (
    <g>
      <rect
        x={round(WIDTH / 2 - width / 2)}
        y={centerY - 13}
        width={round(width)}
        height={26}
        rx={13}
        fill={DrawnImageColor.SURFACE}
        stroke={DrawnImageColor.RULE}
      />
      <text
        className="status"
        x={WIDTH / 2}
        y={round(centerY + fontSize * 0.35)}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight={600}
        fill={DrawnImageColor.INK}
      >
        {text}
      </text>
    </g>
  );
}

/** Where a team's name column starts: at the left edge for home, the right edge for away. */
function nameColumnX(side: ScorecardSide): number {
  return side === ScorecardSide.HOME ? PADDING : WIDTH - PADDING - NAME_WIDTH;
}

/**
 * Lays out a team name in the largest layout it fits. A name too long for every layout is
 * wrapped at the smallest size, and cut short with an ellipsis where it overflows.
 */
function fitName(name: string): FittedName {
  for (const {fontSize, maxLines} of NAME_LAYOUTS) {
    const perLine = charactersPerLine(fontSize);
    const lines = wrapWords(name, perLine);
    if (lines.length <= maxLines && lines.every(line => line.length <= perLine)) {
      return {fontSize, lines};
    }
  }
  const {fontSize, maxLines} = NAME_LAYOUTS[NAME_LAYOUTS.length - 1];
  const perLine = charactersPerLine(fontSize);
  const lines = wrapWords(name, perLine);
  const kept = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    kept[maxLines - 1] = `${kept[maxLines - 1]}…`;
  }
  return {fontSize, lines: kept.map(line => clipText(line, perLine))};
}

/**
 * Splits text at spaces into lines of at most `perLine` characters. A word longer than that
 * gets a line of its own.
 */
function wrapWords(text: string, perLine: number): string[] {
  const lines: string[] = [];
  for (const word of text.trim().split(/\s+/)) {
    const last = lines.at(-1);
    if (last !== undefined && last.length + 1 + word.length <= perLine) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  return lines;
}

/** How many characters of a team name fit on one line of its column at `fontSize`. */
function charactersPerLine(fontSize: number): number {
  return charactersThatFit(NAME_WIDTH, fontSize);
}

/**
 * The largest font size, up to `maxFontSize`, at which `text` fits in `width`. The
 * estimated width grows in step with the font size, so it is `width` divided by the
 * width at size 1.
 */
function fitFontSize(text: string, width: number, maxFontSize: number): number {
  return Math.min(maxFontSize, Math.floor(width / estimateTextWidth(text, 1)));
}
