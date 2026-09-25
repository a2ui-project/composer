/**
 * SPDX-License-Identifier: MIT
 * Copyright (c) Atai Barkai
 *
 * Adapted from CopilotKit commit 00904af842b2f8c015f1e405a0c590a86d7842f8:
 * - examples/channels-a2ui-playground/src/poc/market-snapshot.ts
 */

import {type ComponentApi} from '@a2ui/web_core/v0_9';
import {z} from 'zod/v3';

export const MarketRowSchema = z
  .object({
    name: z.string().describe('Short market or contract label.'),
    price: z.string().describe('Current grounded price including currency and unit.'),
    change: z.string().describe('Latest grounded percentage or absolute move.'),
    sourceName: z.string().describe('Publisher or exchange for this row.'),
    sourceUrl: z.string().url().describe('Canonical absolute source URL.'),
  })
  .strict();

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

export type MarketSnapshotProps = z.infer<typeof MarketSnapshotSchema>;

export const MarketSnapshotApi = {
  name: 'MarketSnapshot',
  schema: MarketSnapshotSchema,
} as unknown as ComponentApi;
