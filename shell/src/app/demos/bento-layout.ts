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
 * Packs sequential tiles into rows of a twelve-column grid without changing reading
 * order, and returns each tile's column span.
 *
 * A wide tile takes a full row (12). Two narrow tiles in a row share one, split
 * unevenly so the wall reads as a bento layout rather than a uniform grid: 7 + 5,
 * then 5 + 7 on the next shared row, alternating so the wider tile switches sides.
 * A narrow tile with no narrow neighbor to pair with also takes a full row.
 *
 * @param wide Whether each tile, in reading order, needs a full row.
 */
export function bentoColumns(wide: readonly boolean[]): number[] {
  const columns: number[] = [];
  let pair = 0;
  for (let index = 0; index < wide.length; index++) {
    if (wide[index] || index + 1 === wide.length || wide[index + 1]) {
      columns.push(12);
    } else {
      // Alternate which side gets the wider half; see the function comment.
      columns.push(...(pair++ % 2 === 0 ? [7, 5] : [5, 7]));
      index++;
    }
  }
  return columns;
}
