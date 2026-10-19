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
  FontWeight,
  baselineCenteredOn,
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

/** The size of the drawing, in SVG units. Slack scales the image to fit the message. */
const WIDTH = 560;
const HEIGHT = 200;
/** The space between the card's edges and what is drawn on it. */
const PADDING = 24;
/** The radius of the card's rounded corners. */
const CORNER_RADIUS = 12;
/**
 * How far the card's border sits inside the image's edge: half of its 1-unit stroke, so
 * the whole stroke is drawn instead of only its inner half.
 */
const BORDER_INSET = 0.5;
/** The width of each team name's column, between the card's edge and the scores. */
const NAME_WIDTH = 152;
/** The distance between the baselines of a wrapped name's lines, as a fraction of font size. */
const NAME_LINE_HEIGHT = 1.2;
/** The vertical center of the team names and scores. */
const MIDDLE_Y = 104;
/** The widest a score may be, between its team's name and the dash. */
const SCORE_WIDTH = 64;
/** The font size of a short score; a longer one is drawn smaller to fit `SCORE_WIDTH`. */
const SCORE_MAX_FONT_SIZE = 44;
/** The most characters of a score the card shows, enough for one such as "10 (11)". */
const SCORE_MAX_CHARACTERS = 8;
/** The horizontal distance from the card's center to each score. */
const SCORE_OFFSET = 24;
/** The font size of the dash between the scores. */
const DASH_FONT_SIZE = 32;
/** The competition's font size. */
const COMPETITION_FONT_SIZE = 14;
/** The competition's baseline, measured down from the top of the card. */
const COMPETITION_BASELINE = 40;
/** The most characters of the competition that fit across the card. */
const COMPETITION_MAX_CHARACTERS = charactersThatFit(WIDTH - 2 * PADDING, COMPETITION_FONT_SIZE);
/** The vertical center of the status label, under the scores. */
const STATUS_MIDDLE_Y = 162;
/** The status's font size. */
const STATUS_FONT_SIZE = 13;
/** The height of the status label; its ends are half circles of this diameter. */
const STATUS_HEIGHT = 26;
/** The space between the status text and each end of its label. */
const STATUS_PADDING = 14;
/** The most characters of the status the card shows. */
const STATUS_MAX_CHARACTERS = 40;
/** Ways to lay out a team name, from largest to smallest. */
const NAME_LAYOUTS: readonly NameLayout[] = [
  {fontSize: 24, maxLines: 1},
  {fontSize: 20, maxLines: 1},
  {fontSize: 20, maxLines: 2},
  {fontSize: 16, maxLines: 2},
];

/**
 * Describes the scorecard in words for its alt text, e.g. "Scorecard: Argentina 2, Mexico
 * 0. Full time. World Cup, Group C."
 */
export function describeScorecard(scorecard: ScorecardImageProps): string {
  const {home, away} = scorecard;
  const parts = [
    `Scorecard: ${home.name} ${home.score}, ${away.name} ${away.score}`,
    scorecard.status,
    scorecard.competition,
  ].filter((part): part is string => Boolean(part));
  return `${parts.join('. ')}.`;
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
        x={BORDER_INSET}
        y={BORDER_INSET}
        width={WIDTH - 2 * BORDER_INSET}
        height={HEIGHT - 2 * BORDER_INSET}
        rx={CORNER_RADIUS}
        fill={DrawnImageColor.BACKGROUND}
        stroke={DrawnImageColor.RULE}
      />
      {scorecard.competition ? (
        <text
          x={WIDTH / 2}
          y={COMPETITION_BASELINE}
          textAnchor="middle"
          fontSize={COMPETITION_FONT_SIZE}
          fill={DrawnImageColor.MUTED}
        >
          {clipText(scorecard.competition, COMPETITION_MAX_CHARACTERS)}
        </text>
      ) : null}
      <TeamColumn team={scorecard.home} side={ScorecardSide.HOME} />
      <text
        x={WIDTH / 2}
        y={round(baselineCenteredOn(MIDDLE_Y, DASH_FONT_SIZE))}
        textAnchor="middle"
        fontSize={DASH_FONT_SIZE}
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
  const lineHeight = name.fontSize * NAME_LINE_HEIGHT;
  // Center the block of lines on MIDDLE_Y: the middles of its first and last lines sit as
  // far above it as below it.
  const firstBaseline = baselineCenteredOn(
    MIDDLE_Y - ((name.lines.length - 1) * lineHeight) / 2,
    name.fontSize,
  );
  const score = clipText(team.score, SCORE_MAX_CHARACTERS);
  const scoreFontSize = fitFontSize(score, SCORE_WIDTH, SCORE_MAX_FONT_SIZE);
  const isHome = side === ScorecardSide.HOME;

  return (
    <g>
      <text
        x={nameColumnX(side) + NAME_WIDTH / 2}
        textAnchor="middle"
        fontSize={name.fontSize}
        fontWeight={FontWeight.SEMIBOLD}
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
        x={isHome ? WIDTH / 2 - SCORE_OFFSET : WIDTH / 2 + SCORE_OFFSET}
        y={round(baselineCenteredOn(MIDDLE_Y, scoreFontSize))}
        textAnchor={isHome ? 'end' : 'start'}
        fontSize={scoreFontSize}
        fontWeight={FontWeight.BOLD}
        fill={DrawnImageColor.INK}
      >
        {score}
      </text>
    </g>
  );
}

/** The match status in a rounded label under the scores. */
function StatusPill({status}: {readonly status: string}) {
  const text = clipText(status, STATUS_MAX_CHARACTERS);
  const width = Math.min(
    WIDTH - 2 * PADDING,
    estimateTextWidth(text, STATUS_FONT_SIZE) + 2 * STATUS_PADDING,
  );
  return (
    <g>
      <rect
        x={round(WIDTH / 2 - width / 2)}
        y={STATUS_MIDDLE_Y - STATUS_HEIGHT / 2}
        width={round(width)}
        height={STATUS_HEIGHT}
        rx={STATUS_HEIGHT / 2}
        fill={DrawnImageColor.SURFACE}
        stroke={DrawnImageColor.RULE}
      />
      <text
        x={WIDTH / 2}
        y={round(baselineCenteredOn(STATUS_MIDDLE_Y, STATUS_FONT_SIZE))}
        textAnchor="middle"
        fontSize={STATUS_FONT_SIZE}
        fontWeight={FontWeight.SEMIBOLD}
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
