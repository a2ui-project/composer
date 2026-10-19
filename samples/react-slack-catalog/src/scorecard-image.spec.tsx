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

describe('renderScorecardSvg', () => {
  it('draws a standalone SVG with both teams, their scores, the status, and the competition', () => {
    const svg = renderScorecardSvg(final);

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 560 200"');
    expect(teamNames(svg)).toEqual([
      {fontSize: '24', lines: ['Argentina']},
      {fontSize: '24', lines: ['Mexico']},
    ]);
    expect(texts(svg)).toEqual([
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

  it('escapes team names and scores instead of emitting markup', () => {
    const svg = renderScorecardSvg({
      ...final,
      home: {name: '<script>alert(1)</script>', score: '1'},
      away: {name: 'A&B "FC"', score: '<b>2</b>'},
    });

    expect(svg).not.toContain('<script>');
    expect(svg).not.toContain('<b>');
    expect(svg).toContain('&lt;script&gt;');
    expect(svg).toContain('A&amp;B &quot;FC&quot;');
    expect(svg).toContain('&lt;b&gt;2');
  });

  it('shrinks a long team name, then wraps it, and cuts what still does not fit', () => {
    const names = (home: string, away: string) =>
      teamNames(
        renderScorecardSvg({
          ...final,
          home: {name: home, score: '1'},
          away: {name: away, score: '1'},
        }),
      );

    expect(names('Netherlands', 'Bosnia and Herzegovina')).toEqual([
      {fontSize: '20', lines: ['Netherlands']},
      {fontSize: '20', lines: ['Bosnia and', 'Herzegovina']},
    ]);
    expect(names('Central African Republic', 'Llanfairpwllgwyngyllgogerychwyrndrobwll FC')).toEqual(
      [
        {fontSize: '16', lines: ['Central African', 'Republic']},
        {fontSize: '16', lines: ['Llanfairpwllgw…', 'FC']},
      ],
    );
    expect(names('One Two Three Four Five Six Seven', 'Mexico')[0]).toEqual({
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

  it('leaves out a missing status and competition', () => {
    expect(describeScorecard({home: final.home, away: final.away})).toBe(
      'Scorecard: Argentina 2, Mexico 0.',
    );
    expect(describeScorecard({...final, status: undefined})).toBe(
      'Scorecard: Argentina 2, Mexico 0. World Cup, Group C.',
    );
  });
});
