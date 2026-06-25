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

import {TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest';
import {UsageGenerator} from './usage-generator';
import {type ComponentUsage} from 'a2ui-bridge';
import {DynamicUsageGenerator} from './dynamic-usage-generator';
import {CatalogSchemaResolver, ParsedProperty} from '../schema/catalog-schema-resolver';
import {DEFAULT_PRESETS} from './default-presets';

class MockDynamicUsageGenerator {
  generateFallbackPreset = vi.fn((key, prefix, resolver) => [
    {id: 'target', component: key, fallback: true},
  ]);
}

describe('UsageGenerator', () => {
  let generator: UsageGenerator;
  let dynamicGeneratorMock: MockDynamicUsageGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsageGenerator,
        {provide: DynamicUsageGenerator, useClass: MockDynamicUsageGenerator},
      ],
    });

    generator = TestBed.inject(UsageGenerator);
    dynamicGeneratorMock = TestBed.inject(
      DynamicUsageGenerator,
    ) as unknown as MockDynamicUsageGenerator;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses retrievedUsage if present (precedence 1)', () => {
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'text', required: false, type: 'string'}];
    const retrieved: ComponentUsage = {
      usage: [{id: 'target', component: 'Button', text: 'Retrieved'}],
    };

    const result = generator.getUsage('Button', '', 'Button', resolver, properties, retrieved);
    expect(result).toEqual(retrieved);
    expect(dynamicGeneratorMock.generateFallbackPreset).not.toHaveBeenCalled();
  });

  it('uses static preset if present in DEFAULT_PRESETS and retrievedUsage is missing (precedence 2)', () => {
    DEFAULT_PRESETS['TempTest'] = {
      usage: [{id: 'target', component: 'TempTest', text: 'Static'}],
    };
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'text', required: false, type: 'string'}];

    try {
      const result = generator.getUsage('TempTest', '', 'TempTest', resolver, properties);
      expect(result).toEqual({
        usage: [{id: 'target', component: 'TempTest', text: 'Static'}],
      });
      expect(dynamicGeneratorMock.generateFallbackPreset).not.toHaveBeenCalled();
    } finally {
      delete DEFAULT_PRESETS['TempTest'];
    }
  });

  it('delegates to DynamicUsageGenerator if no retrieved or static preset exists (precedence 3)', () => {
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'fallback', required: false, type: 'boolean'}];

    const result = generator.getUsage('UnknownComp', '', 'UnknownComp', resolver, properties);
    expect(result).toEqual({
      usage: [{id: 'target', component: 'UnknownComp', fallback: true}],
    });
    expect(dynamicGeneratorMock.generateFallbackPreset).toHaveBeenCalledWith(
      'UnknownComp',
      '',
      resolver,
    );
  });

  it('propagates parent library prefix to nested child components in static presets', () => {
    DEFAULT_PRESETS['TempRow'] = {
      usage: [
        {id: 'target', component: 'TempRow', children: ['child1']},
        {id: 'child1', component: 'Text'},
      ],
    };
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'children', required: false, type: 'array'}];

    try {
      const result = generator.getUsage(
        'MaterialTempRow',
        'Material',
        'TempRow',
        resolver,
        properties,
      );
      expect(result).toEqual({
        usage: [
          {id: 'target', component: 'MaterialTempRow', children: ['child1']},
          {id: 'child1', component: 'MaterialText'},
        ],
      });
    } finally {
      delete DEFAULT_PRESETS['TempRow'];
    }
  });

  it('adapts child to children if component expects children', () => {
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'children', required: false, type: 'array'}];
    const retrieved: ComponentUsage = {
      usage: [{id: 'target', component: 'Container', child: 'child1'}],
    };

    const result = generator.getUsage(
      'Container',
      '',
      'Container',
      resolver,
      properties,
      retrieved,
    );
    expect(result).toEqual({
      usage: [{id: 'target', component: 'Container', children: ['child1']}],
    });
  });

  it('adapts child to label if component expects label and child is a text component', () => {
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'label', required: false, type: 'string'}];
    const retrieved: ComponentUsage = {
      usage: [
        {id: 'target', component: 'Button', child: 'child1'},
        {id: 'child1', component: 'Text', text: 'Click me'},
      ],
    };

    const result = generator.getUsage('Button', '', 'Button', resolver, properties, retrieved);
    expect(result).toEqual({
      usage: [{id: 'target', component: 'Button', label: 'Click me'}],
    });
  });

  it('prunes properties not in schema', () => {
    const resolver = {} as CatalogSchemaResolver;
    const properties: ParsedProperty[] = [{name: 'text', required: false, type: 'string'}];
    const retrieved: ComponentUsage = {
      usage: [{id: 'target', component: 'Button', text: 'Hello', invalidProp: 'value'}],
    };

    const result = generator.getUsage('Button', '', 'Button', resolver, properties, retrieved);
    expect(result).toEqual({
      usage: [{id: 'target', component: 'Button', text: 'Hello'}],
    });
  });
});
