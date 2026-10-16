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
import {BentoGrid, BentoTile, bentoLayout} from './bento-layout';

/**
 * A wall 1,240px wide with 20px gaps: its columns are 85px, so a third of a row is 400px
 * wide, the narrower half of a shared row 505px, the wider half 715px and a full row
 * 1,240px.
 */
const GRID: BentoGrid = {width: 1240, gap: 20};

/** Tiles whose demos fit any card, with the given heights; null for one not measured yet. */
function narrow(...heights: Array<number | null>): BentoTile[] {
  return heights.map(height => ({minimumWidth: 0, height}));
}

/** A demo that needs more than the wider half of a row. */
const WIDE: BentoTile = {minimumWidth: 900, height: 300};

/** A demo that needs the wider half of a row, but not a full row. */
function needsWiderHalf(height: number | null = null): BentoTile {
  return {minimumWidth: 600, height};
}

describe('bento layout', () => {
  it('alternates generous and compact tiles without reordering them', () => {
    expect(bentoLayout(narrow(null, null, null, null), GRID)).toEqual([
      {columns: 7, rows: 1},
      {columns: 5, rows: 1},
      {columns: 5, rows: 1},
      {columns: 7, rows: 1},
    ]);
  });

  it('gives overflowing demos a full row and fills the preceding orphan', () => {
    const [first, second, third] = narrow(null, null, null);
    expect(
      bentoLayout([first, WIDE, second, third, WIDE], GRID).map(placement => placement.columns),
    ).toEqual([12, 12, 7, 5, 12]);
  });

  it('handles an empty wall', () => {
    expect(bentoLayout([], GRID)).toEqual([]);
  });

  it('puts a tile without a partner in the row before it, three to a row', () => {
    // At the end of the wall.
    expect(bentoLayout(narrow(null, null, null), GRID).map(placement => placement.columns)).toEqual(
      [4, 4, 4],
    );
    // Before a demo that needs a full row.
    expect(
      bentoLayout([...narrow(null, null, null), WIDE], GRID).map(placement => placement.columns),
    ).toEqual([4, 4, 4, 12]);
  });

  it('gives a tile without a partner a full row when the row before it is not a plain pair', () => {
    // A tall tile with others stacked beside it.
    expect(
      bentoLayout(narrow(560, 116, 56, 287, 100), GRID).map(placement => placement.columns),
    ).toEqual([7, 5, 5, 5, 12]);
    // A demo that needs a full row.
    expect(bentoLayout([WIDE, ...narrow(null)], GRID).map(placement => placement.columns)).toEqual([
      12, 12,
    ]);
  });

  it('gives a tile without a partner a full row when a demo would not fit a third of the row', () => {
    // A third of the row is 400px wide; the last demo needs 600px.
    expect(
      bentoLayout([...narrow(null, null), needsWiderHalf()], GRID).map(
        placement => placement.columns,
      ),
    ).toEqual([7, 5, 12]);
  });

  it('gives a demo the wider half of a row when it needs more than the narrower one', () => {
    expect(
      bentoLayout([...narrow(null, null, null), needsWiderHalf()], GRID).map(
        placement => placement.columns,
      ),
    ).toEqual([7, 5, 5, 7]);
    // The second row would put its wider half second, but its first tile needs it, so
    // the row repeats 7 + 5.
    expect(
      bentoLayout([...narrow(null, null), needsWiderHalf(), ...narrow(null)], GRID).map(
        placement => placement.columns,
      ),
    ).toEqual([7, 5, 7, 5]);
  });

  it('gives a full row to a demo that has no neighbor it can share a row with', () => {
    // Two demos that both need the wider half can't share a row, and neither can a demo
    // beside one that needs a full row.
    expect(bentoLayout([needsWiderHalf(), needsWiderHalf()], GRID)).toEqual([
      {columns: 12, rows: 1},
      {columns: 12, rows: 1},
    ]);
    expect(
      bentoLayout([needsWiderHalf(), WIDE, ...narrow(null)], GRID).map(
        placement => placement.columns,
      ),
    ).toEqual([12, 12, 12]);
  });

  it('gives every demo with a minimum width a full row until the wall is measured', () => {
    expect(
      bentoLayout([...narrow(null), needsWiderHalf(), ...narrow(null, null)], {
        width: 0,
        gap: 0,
      }).map(placement => placement.columns),
    ).toEqual([12, 12, 7, 5]);
  });

  it('keeps a pair of similar heights side by side', () => {
    expect(bentoLayout(narrow(287, 312, 355, 463), GRID)).toEqual([
      {columns: 7, rows: 1},
      {columns: 5, rows: 1},
      {columns: 5, rows: 1},
      {columns: 7, rows: 1},
    ]);
  });

  it('stacks the short tiles that follow a tall one beside it', () => {
    // The Incremental, Interactive Button, Row Layout and Simple Login Form demos.
    expect(bentoLayout(narrow(560, 116, 56, 287), GRID)).toEqual([
      {columns: 7, rows: 3},
      {columns: 5, rows: 1},
      {columns: 5, rows: 1},
      {columns: 5, rows: 1},
    ]);
  });

  it('stacks under a short first tile when the tall one comes second', () => {
    // The Simple Text, Email Compose and Calendar Day demos, then a pair.
    expect(bentoLayout(narrow(112, 471, 365, 304, 440), GRID)).toEqual([
      {columns: 7, rows: 1},
      {columns: 5, rows: 2},
      {columns: 7, rows: 1},
      {columns: 5, rows: 1},
      {columns: 7, rows: 1},
    ]);
  });

  it('stops stacking once another tile would move the column further from the tall height', () => {
    // The 365px tile brings the column to within 119px of the 471px tile. A 304px tile
    // after it would overshoot by 536px, so it starts a new row instead.
    expect(bentoLayout(narrow(471, 112, 365, 304), GRID).map(placement => placement.rows)).toEqual([
      2, 1, 1, 1,
    ]);
  });

  it('puts at most three tiles in the column beside a tall tile', () => {
    expect(bentoLayout(narrow(900, 40, 40, 40, 40), GRID)).toEqual([
      {columns: 7, rows: 3},
      {columns: 5, rows: 1},
      {columns: 5, rows: 1},
      {columns: 5, rows: 1},
      {columns: 12, rows: 1},
    ]);
  });

  it('only stacks a tile that fits the column beside the tall one', () => {
    // The column is the narrower half, which the third demo doesn't fit.
    expect(
      bentoLayout([...narrow(560, 116), needsWiderHalf(56)], GRID).map(placement => placement.rows),
    ).toEqual([1, 1, 1]);
  });

  it('never stacks a tile whose height is not known yet', () => {
    expect(bentoLayout(narrow(560, 116, null, 56), GRID).map(placement => placement.rows)).toEqual([
      1, 1, 1, 1,
    ]);
  });

  it('pairs as before until both tiles of a pair are measured', () => {
    expect(bentoLayout(narrow(560, null, 56), GRID).map(placement => placement.rows)).toEqual([
      1, 1, 1,
    ]);
  });
});
