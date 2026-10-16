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

import {z} from 'zod/v3';

/** One market in a MarketSnapshot table. */
const MarketRowSchema = z
  .object({
    name: z.string().describe('Short market or contract label.'),
    price: z.string().describe('Current grounded price including currency and unit.'),
    change: z.string().describe('Latest grounded percentage or absolute move.'),
    sourceName: z.string().describe('Publisher or exchange for this row.'),
    sourceUrl: z.string().url().describe('Canonical absolute source URL.'),
  })
  .strict();

/**
 * Props of MarketSnapshot, a custom component that shows a short market summary:
 * a headline, a table of three sourced prices, why they matter, and when they
 * were looked up.
 */
export const MarketSnapshotSchema = z
  .object({
    headline: z.string().describe('Short combined market snapshot headline.'),
    summary: z.string().describe('One concise grounded market summary.'),
    markets: z
      .array(MarketRowSchema)
      .length(3)
      .describe('Exactly three related grounded market rows.'),
    whyItMatters: z.string().describe('Why the combined market movement matters.'),
    searchedAt: z.string().datetime({offset: true}).describe('UTC ISO 8601 search time.'),
  })
  .strict()
  .describe(
    'Complete root-capable live market snapshot with a headline, sourced table, analysis, and timestamp.',
  );

/** A MarketSnapshot's validated props. */
export type MarketSnapshotProps = z.infer<typeof MarketSnapshotSchema>;
