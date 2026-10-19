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

/** One tile on the wall, in reading order. */
export interface BentoTile {
  /**
   * Narrowest card, in pixels, that shows the tile's demo without scaling it down, or 0
   * if the demo fits any card on the wall.
   */
  readonly minimumWidth: number;
  /**
   * Height of the tile's demo in pixels, or null until the demo has been measured. A
   * tile whose height isn't known yet is paired as usual and never stacked.
   */
  readonly height: number | null;
}

/** The wall's grid, in pixels. */
export interface BentoGrid {
  /** Width of the wall, or 0 while it hasn't been measured. */
  readonly width: number;
  /** Gap between the wall's columns. */
  readonly gap: number;
}

/** Where one tile sits in the wall's twelve-column grid. */
export interface BentoPlacement {
  /** Columns the tile spans. */
  readonly columns: number;
  /** Rows the tile spans. More than one only for a tall tile with tiles stacked beside it. */
  readonly rows: number;
}

/**
 * Height a tile adds to a stack besides its demo: its card's header and padding (93px
 * when the description fits on one line) plus the wall's 20px row gap (`demos.scss`).
 *
 * It only has to be roughly right. It decides whether one more tile brings a stack
 * closer to the tall tile's height, and the sample demos are grouped the same way for
 * any value from 80 to 150.
 */
const STACKED_TILE_EXTRA_PX = 113;

/**
 * Most tiles in the column beside a tall tile, counting the short tile it pairs with.
 * A fourth never improved the fit for the sample demos, and a long column of small
 * cards reads as a list rather than a wall.
 */
const MAX_TILES_BESIDE_TALL_TILE = 3;

const GRID_COLUMNS = 12;

/** Column span of a shared row's wider half. The narrower half has the rest. */
const WIDER_HALF = 7;
const NARROWER_HALF = GRID_COLUMNS - WIDER_HALF;

/** Column span of each tile in a row of three. */
const THIRD = GRID_COLUMNS / 3;

/**
 * Packs tiles into rows of a twelve-column grid without changing reading order, and
 * returns where each one goes.
 *
 * Two tiles share a row, split unevenly so the wall reads as a bento layout rather than
 * a uniform grid: 7 + 5, then 5 + 7 on the next shared row, alternating so the wider
 * half switches sides. A demo too wide for the narrower half takes the wider one, even
 * when that repeats the previous row's sides. A demo too wide for either half takes a
 * full row.
 *
 * A tile left without a neighbor to share a row with, because the next tile needs a
 * full row or there is none, joins the row before it, three to a row, when that row is
 * a plain pair and all three demos fit a third of the row. Otherwise it takes a full
 * row too, which leaves a narrow demo in a card far wider than it.
 *
 * A shared row is as tall as its taller tile, so a short tile beside a tall one would
 * leave most of its card empty. Instead, the tiles that follow stack under the short
 * one, in its column, for as long as each brings the column closer to the tall tile's
 * height, and the tall tile spans their rows. The grid places each stacked tile in the
 * next row beside the tall one, so reading order is unchanged.
 *
 * @param tiles The wall's tiles, in reading order.
 * @param grid The wall's width and column gap. Until the wall has been measured, any
 *     tile with a minimum width takes a full row.
 * @return Each tile's placement, in the same order.
 */
export function bentoLayout(tiles: readonly BentoTile[], grid: BentoGrid): BentoPlacement[] {
  const placements: BentoPlacement[] = [];
  let widerHalfFirst = true;
  // Index of the first tile of the row just placed, if that row is a plain pair.
  let plainPair: number | null = null;
  let index = 0;
  while (index < tiles.length) {
    const first = tiles[index];
    const second = tiles[index + 1];
    const halves: readonly [number, number] | null = second
      ? sharedRowHalves(first, second, widerHalfFirst, grid)
      : null;
    if (!halves) {
      const pair = plainPair === null ? [] : [tiles[plainPair], tiles[plainPair + 1]];
      if (plainPair !== null && [...pair, first].every(tile => fits(tile, THIRD, grid))) {
        placements[plainPair] = {columns: THIRD, rows: 1};
        placements[plainPair + 1] = {columns: THIRD, rows: 1};
        placements.push({columns: THIRD, rows: 1});
      } else {
        placements.push({columns: GRID_COLUMNS, rows: 1});
      }
      plainPair = null;
      index++;
      continue;
    }
    const [firstColumns, secondColumns]: readonly [number, number] = halves;
    // The next shared row puts its wider half on the other side; see the function comment.
    widerHalfFirst = firstColumns === NARROWER_HALF;
    const {stacked, firstIsTall} = stackBesidePair(tiles, index, halves, grid);
    plainPair = stacked === 0 ? index : null;
    // The tall tile spans the short tile's row plus one row per stacked tile.
    const tallRows = 1 + stacked;
    placements.push({columns: firstColumns, rows: firstIsTall ? tallRows : 1});
    placements.push({columns: secondColumns, rows: firstIsTall ? 1 : tallRows});
    const shortColumns = firstIsTall ? secondColumns : firstColumns;
    for (let tile = 0; tile < stacked; tile++) {
      placements.push({columns: shortColumns, rows: 1});
    }
    index += 2 + stacked;
  }
  return placements;
}

/** Whether a card spanning `columns` of the grid shows the tile's demo unscaled. */
function fits(tile: BentoTile, columns: number, {width, gap}: BentoGrid): boolean {
  const columnWidth = (width - (GRID_COLUMNS - 1) * gap) / GRID_COLUMNS;
  return (
    tile.minimumWidth === 0 || tile.minimumWidth <= columns * columnWidth + (columns - 1) * gap
  );
}

/**
 * Splits a shared row between two tiles, as `[first, second]` column spans, or returns
 * null if they can't share one.
 *
 * The wider half goes to the first tile when `widerHalfFirst` is set and to the second
 * otherwise, unless only the other way round fits both demos.
 */
function sharedRowHalves(
  first: BentoTile,
  second: BentoTile,
  widerHalfFirst: boolean,
  grid: BentoGrid,
): readonly [number, number] | null {
  const preferred = widerHalfFirst ? WIDER_HALF : NARROWER_HALF;
  for (const firstColumns of [preferred, GRID_COLUMNS - preferred]) {
    const secondColumns = GRID_COLUMNS - firstColumns;
    if (fits(first, firstColumns, grid) && fits(second, secondColumns, grid)) {
      return [firstColumns, secondColumns];
    }
  }
  return null;
}

/** The tiles stacked beside a pair's tall tile. See {@link stackBesidePair}. */
interface PairStack {
  /** How many tiles after the pair stack under its short tile. */
  readonly stacked: number;
  /** Whether the pair's first tile is the tall one. False when nothing is stacked. */
  readonly firstIsTall: boolean;
}

/**
 * Decides which tiles after the pair at `index` stack under the pair's shorter tile.
 *
 * Each candidate must be measured and fit the short tile's column, and is taken only if
 * it brings the column closer to the taller tile's height than the column already is.
 * A column may end up taller than the tall tile: then the tall tile's card has the
 * spare space, rather than the short ones.
 *
 * @param halves The pair's column spans, `[first, second]`.
 */
function stackBesidePair(
  tiles: readonly BentoTile[],
  index: number,
  halves: readonly [number, number],
  grid: BentoGrid,
): PairStack {
  const first = tiles[index].height;
  const second = tiles[index + 1].height;
  if (first === null || second === null) {
    return {stacked: 0, firstIsTall: false};
  }
  const firstIsTall = first >= second;
  const shortColumns = firstIsTall ? halves[1] : halves[0];
  const tallHeight = Math.max(first, second);
  let columnHeight = Math.min(first, second);
  let stacked = 0;
  for (
    let next = index + 2;
    next < tiles.length && 1 + stacked < MAX_TILES_BESIDE_TALL_TILE;
    next++
  ) {
    const tile = tiles[next];
    if (tile.height === null || !fits(tile, shortColumns, grid)) {
      break;
    }
    const withTile = columnHeight + STACKED_TILE_EXTRA_PX + tile.height;
    if (Math.abs(tallHeight - withTile) >= Math.abs(tallHeight - columnHeight)) {
      break;
    }
    columnHeight = withTile;
    stacked++;
  }
  return {stacked, firstIsTall: stacked > 0 && firstIsTall};
}
