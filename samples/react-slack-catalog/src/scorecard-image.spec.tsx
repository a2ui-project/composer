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
import {DrawnImageColor} from './drawn-image-style';
import {describeScorecard, renderScorecardSvg, type ScorecardImageProps} from './scorecard-image';

const final: ScorecardImageProps = {
  home: {name: 'Argentina', score: '2'},
  away: {name: 'Mexico', score: '0'},
  status: 'Full time',
  competition: 'World Cup, Group C',
};

const parse = (svg: string): Document => new DOMParser().parseFromString(svg, 'image/svg+xml');

/** The text of each text element in the drawing, in the order they are drawn. */
const texts = (svg: string): string[] =>
  [...parse(svg).querySelectorAll('text')].map(text => text.textContent ?? '');

/** The font size and lines of each team name in the drawing, home first. */
function teamNames(svg: string): Array<{fontSize: string | null; lines: string[]}> {
  // Team names are the text clipped to a column.
  return [...parse(svg).querySelectorAll('text[clip-path]')].map(name => ({
    fontSize: name.getAttribute('font-size'),
    lines: [...name.querySelectorAll('tspan')].map(line => line.textContent ?? ''),
  }));
}

/** How the scorecard lays out `name` as the home team's name. */
const homeName = (name: string) =>
  teamNames(renderScorecardSvg({...final, home: {name, score: '1'}}))[0];

describe('renderScorecardSvg', () => {
  it('draws standalone SVG markup that can be served as an image', () => {
    const svg = renderScorecardSvg(final);

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 560 200"');
  });

  it('draws the competition, both teams and their scores, and the status', () => {
    expect(texts(renderScorecardSvg(final))).toEqual([
      'World Cup, Group C',
      'Argentina',
      '2',
      '–',
      'Mexico',
      '0',
      'Full time',
    ]);
  });

  it('leaves out the status and competition when the scorecard has none', () => {
    const svg = renderScorecardSvg({home: final.home, away: final.away});

    expect(texts(svg)).toEqual(['Argentina', '2', '–', 'Mexico', '0']);
    // The status is drawn on a filled label, which goes with it.
    expect(parse(svg).querySelectorAll(`rect[fill="${DrawnImageColor.SURFACE}"]`)).toHaveLength(0);
  });

  it('draws a short team name on one line at the largest size', () => {
    expect(homeName('Argentina')).toEqual({fontSize: '24', lines: ['Argentina']});
  });

  it('shrinks a team name that does not fit one line at the largest size', () => {
    expect(homeName('Netherlands')).toEqual({fontSize: '20', lines: ['Netherlands']});
  });

  it('wraps a team name that does not fit one line onto two', () => {
    expect(homeName('Bosnia and Herzegovina')).toEqual({
      fontSize: '20',
      lines: ['Bosnia and', 'Herzegovina'],
    });
  });

  it('shrinks a team name that does not fit two lines to the smallest size', () => {
    expect(homeName('Central African Republic')).toEqual({
      fontSize: '16',
      lines: ['Central African', 'Republic'],
    });
  });

  it('cuts a word too long for one line, ending it with an ellipsis', () => {
    expect(homeName('Llanfairpwllgwyngyllgogerychwyrndrobwll FC')).toEqual({
      fontSize: '16',
      lines: ['Llanfairpwllgw…', 'FC'],
    });
  });

  it('cuts a team name that does not fit two lines at the smallest size, with an ellipsis', () => {
    expect(homeName('One Two Three Four Five Six Seven')).toEqual({
      fontSize: '16',
      lines: ['One Two Three', 'Four Five Six…'],
    });
  });

  it('clips each team name to its own column', () => {
    const svg = renderScorecardSvg(final);

    expect(svg).toContain('clip-path="url(#home-name)"');
    expect(svg).toContain('clip-path="url(#away-name)"');
    expect(parse(svg).querySelectorAll('clipPath')).toHaveLength(2);
  });
});

describe('describeScorecard', () => {
  it('describes the result, the status, and the competition in words for its alt text', () => {
    expect(describeScorecard(final)).toBe(
      'Scorecard: Argentina 2, Mexico 0. Full time. World Cup, Group C.',
    );
  });

  it('leaves out a missing status', () => {
    expect(describeScorecard({...final, status: undefined})).toBe(
      'Scorecard: Argentina 2, Mexico 0. World Cup, Group C.',
    );
  });

  it('leaves out a missing competition', () => {
    expect(describeScorecard({...final, competition: undefined})).toBe(
      'Scorecard: Argentina 2, Mexico 0. Full time.',
    );
  });
});
