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

import {describe, it, expect, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {CatalogSummarizer} from './catalog-summarizer';
import {Catalog} from '../../../storage/models/catalog-storage.model';

describe('CatalogSummarizer', () => {
  let summarizer: CatalogSummarizer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    summarizer = TestBed.inject(CatalogSummarizer);
  });

  const sampleCatalog: Catalog = {
    catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
    components: {
      MaterialButton: {
        type: 'object',
        required: ['label'],
        properties: {
          label: {type: 'string'},
          action: {type: 'object'},
          disabled: {type: 'boolean'},
        },
      },
      MaterialColumn: {
        type: 'object',
        required: ['children'],
        properties: {
          children: {
            type: 'array',
            items: {type: 'string'},
          },
          alignment: {type: 'string'},
        },
      },
      MaterialText: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {type: 'string'},
          usageHint: {type: 'string'},
        },
      },
    },
  };

  it('generates the Markdown Property Contract Table + TypeScript Interface Skeletons in under ~1,500 tokens while preserving all required and optional properties', () => {
    const summary = summarizer.summarizeCatalog(sampleCatalog);

    // Verify presence of Markdown Property Contract Table with all columns
    expect(summary).toContain('### Property Contract Table');
    expect(summary).toContain(
      '| Component | Required Properties | Optional Properties | Hierarchy Rule |',
    );
    expect(summary).toContain('| MaterialButton | label | action, disabled | None |');
    expect(summary).toContain('| MaterialColumn | children | alignment | children (array) |');
    expect(summary).toContain('| MaterialText | text | usageHint | None |');

    // Verify presence of TypeScript Interface Skeletons
    expect(summary).toContain('### TypeScript Interface Skeletons');
    expect(summary).toContain('interface MaterialButton {');
    expect(summary).toContain('  label: string;');
    expect(summary).toContain('  action?: object;');
    expect(summary).toContain('  disabled?: boolean;');
    expect(summary).toContain('interface MaterialColumn {');
    expect(summary).toContain('  children: array;');
    expect(summary).toContain('interface MaterialText {');
    expect(summary).toContain('  text: string;');

    // Verify token estimation is well under 1,500 tokens (~650 + ~200 tokens)
    const estimatedTokens = Math.ceil(summary.length / 4);
    expect(estimatedTokens).toBeLessThan(1500);
  });

  it('handles empty or malformed catalogs gracefully', () => {
    const emptySummary = summarizer.summarizeCatalog({});
    expect(emptySummary).toContain('No components defined in catalog.');
  });

  it('accepts a stringified JSON catalog input', () => {
    const stringified = JSON.stringify(sampleCatalog);
    const summary = summarizer.summarizeCatalog(stringified);
    expect(summary).toContain('| MaterialButton | label | action, disabled | None |');
    expect(summary).toContain('interface MaterialButton {');
  });

  it('handles malformed stringified JSON catalog gracefully', () => {
    const summary = summarizer.summarizeCatalog('{ invalid json {');
    expect(summary).toBe('No components defined in catalog.');
  });

  it('handles optional components with no required properties correctly', () => {
    const catalogWithOptional: Catalog = {
      catalogId: 'test',
      components: {
        OptionalBanner: {
          type: 'object',
          properties: {
            title: {type: 'string'},
            dismissible: {type: 'boolean'},
          },
        },
      },
    };

    const summary = summarizer.summarizeCatalog(catalogWithOptional);
    expect(summary).toContain('| OptionalBanner | None | title, dismissible | None |');
    expect(summary).toContain('interface OptionalBanner {');
    expect(summary).toContain('  title?: string;');
    expect(summary).toContain('  dismissible?: boolean;');
  });
});
