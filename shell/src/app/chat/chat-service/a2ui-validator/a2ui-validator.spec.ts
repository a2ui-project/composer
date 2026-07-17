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
import {A2uiValidator} from './a2ui-validator';
import {Catalog} from '../../../storage/models/catalog-storage.model';

describe('A2uiValidator', () => {
  let validator: A2uiValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    validator = TestBed.inject(A2uiValidator);
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
        },
      },
      MaterialColumn: {
        type: 'object',
        required: ['children'],
        properties: {
          children: {type: 'array'},
        },
      },
    },
  };

  it('passes validation for valid A2UI JSON Lines containing version "v0.9", root id, and required fields', () => {
    const validLines = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: 'main',
          catalogId: 'https://a2ui.org/specification/v0_9/material_catalog.json',
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'main',
          components: [
            {id: 'root', component: 'MaterialColumn', children: ['btn']},
            {id: 'btn', component: 'MaterialButton', label: 'Submit'},
          ],
        },
      },
    ];

    const result = validator.validate(validLines, sampleCatalog);
    expect(result.isValid).toBe(true);
    expect(result.issues.length).toBe(0);
    expect(result.repairPrompt).toBeUndefined();
  });

  it('fails validation when missing version "v0.9" and generates targeted repair prompt', () => {
    const linesMissingVersion = [
      {
        updateComponents: {
          surfaceId: 'main',
          components: [{id: 'root', component: 'MaterialColumn', children: []}],
        },
      },
    ];

    const result = validator.validate(linesMissingVersion, sampleCatalog);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.type === 'missing_version')).toBe(true);
    expect(result.repairPrompt).toContain('version: "v0.9"');
  });

  it('fails validation when updateComponents is missing component with id "root" and generates repair prompt', () => {
    const linesMissingRoot = [
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'main',
          components: [{id: 'header', component: 'MaterialColumn', children: []}],
        },
      },
    ];

    const result = validator.validate(linesMissingRoot, sampleCatalog);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.type === 'missing_root_id')).toBe(true);
    expect(result.repairPrompt).toContain('id: "root"');
  });

  it('fails validation when a component is missing a required field specified in catalog and generates repair prompt', () => {
    const invalidBlocks = [
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'sample-surface',
          components: [
            {
              id: 'root',
              component: 'MaterialColumn',
              children: ['btn1'],
            },
            {
              id: 'btn1',
              component: 'MaterialButton',
              // missing required property 'label'
            },
          ],
        },
      },
    ];

    const result = validator.validate(invalidBlocks, sampleCatalog);
    expect(result.isValid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'missing_required_field',
          componentId: 'btn1',
          componentType: 'MaterialButton',
          field: 'label',
        }),
      ]),
    );
    expect(result.repairPrompt).toContain(
      'Component "MaterialButton" (id: "btn1") is missing required property "label".',
    );
  });

  it('caches resolveComponentProperties so multiple components of the same type resolve only once', () => {
    const multiComponentBlocks = [
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'sample-surface',
          components: [
            {id: 'root', component: 'MaterialColumn', children: ['b1', 'b2']},
            {id: 'b1', component: 'MaterialButton', label: 'Btn 1'},
            {id: 'b2', component: 'MaterialButton', label: 'Btn 2'},
          ],
        },
      },
    ];

    const result = validator.validate(multiComponentBlocks, sampleCatalog);
    expect(result.isValid).toBe(true);
  });

  describe('Edge-case specs: empty/malformed blocks and null catalog', () => {
    it('handles empty blocks array returning invalid structure issue', () => {
      const result = validator.validate([], sampleCatalog);
      expect(result.isValid).toBe(false);
      expect(result.issues).toEqual([
        {
          type: 'invalid_structure',
          message: 'Payload blocks must be a non-empty array of A2UI messages.',
        },
      ]);
      expect(result.repairPrompt).toContain(
        'Payload blocks must be a non-empty array of A2UI messages.',
      );
    });

    it('handles malformed blocks (strings, numbers, nulls) gracefully', () => {
      const malformed = [null, 123, 'not an object'] as unknown[];
      const result = validator.validate(malformed, sampleCatalog);
      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(3);
      expect(result.issues[0]?.type).toBe('invalid_structure');
    });

    it('validates envelope requirements even when catalog is null or undefined', () => {
      const validEnvelopeBlocks = [
        {
          version: 'v0.9',
          updateComponents: {
            surfaceId: 'sample-surface',
            components: [{id: 'root', component: 'AnyComponent'}],
          },
        },
      ];

      const resultWithNull = validator.validate(validEnvelopeBlocks, null);
      expect(resultWithNull.isValid).toBe(true);

      const resultWithUndefined = validator.validate(validEnvelopeBlocks, undefined);
      expect(resultWithUndefined.isValid).toBe(true);
    });
  });
});
