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
import {HTTP_URL_PATTERN} from './http-url';

/**
 * The JSON Schema `pattern` the published catalog gives a market's `sourceName`:
 * one line, without `<`, `>`, `[` or `]`. The source cell is a Slack link,
 * `<url|text>`, with the name as its text. `<`, `>` and a line break would end
 * that text early, and `[` and `]` could start a Markdown link inside it.
 */
export const SOURCE_NAME_PATTERN = '^[^<>[\\]\\r\\n]+$';

/**
 * The JSON Schema `pattern` the published catalog gives a market's `sourceUrl`:
 * an HTTP(S) URL without `*`. The source link is written in Markdown, which can
 * read `*` as emphasis and change the URL, and percent-encoding a `*` can name a
 * different resource (RFC 3986, section 2.2), so the link can't carry one.
 */
export const SOURCE_URL_PATTERN = `${HTTP_URL_PATTERN}[^*]*$`;

/**
 * A market's `sourceName`. At run time it takes any string, so that a name that
 * breaks `SOURCE_NAME_PATTERN` gets an `A2UI_INVALID_MARKET_SOURCE_NAME`
 * diagnostic when the preview draws the snapshot, rather than the generic schema
 * error (`A2UI_PROCESS_MESSAGE_ERROR`) a zod regex here would give. Only the
 * published catalog adds the pattern.
 */
export const SourceNameSchema = z
  .string()
  .describe(
    'Publisher or exchange for this row, shown as the source link text. One line, without <, >, [ or ].',
  );

/**
 * A market's `sourceUrl`. At run time it takes any string, for the reason
 * `SourceNameSchema` gives, with `A2UI_INVALID_MARKET_SOURCE_URL`. Only the
 * published catalog adds `SOURCE_URL_PATTERN`.
 */
export const SourceUrlSchema = z
  .string()
  .describe('Canonical absolute HTTP(S) source URL, without *.');

/** One market in a MarketSnapshot table. */
const MarketRowSchema = z
  .object({
    name: z.string().describe('Short market or contract label.'),
    price: z.string().describe('Current grounded price including currency and unit.'),
    change: z.string().describe('Latest grounded percentage or absolute move.'),
    sourceName: SourceNameSchema,
    sourceUrl: SourceUrlSchema,
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

/** One market row of a MarketSnapshot's validated props. */
export type MarketRow = MarketSnapshotProps['markets'][number];
