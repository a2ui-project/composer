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

import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from 'vitest';
import {StateSync} from '../../chat/state-sync/state-sync';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {formatJson} from '../../utils/json';
import {ComponentTree} from './component-tree';
import {ComponentTreeHarness} from './test/component-tree.harness';

const COMMON = 'https://a2ui.org/specification/v1_0/common_types.json#/$defs';

const PRIMARY_CATALOG: Catalog = {
  catalogId: 'primary-catalog',
  components: {
    Column: {properties: {children: {$ref: `${COMMON}/ChildList`}}},
    Card: {properties: {child: {$ref: `${COMMON}/Child`}}},
    Text: {properties: {text: {type: 'string'}}},
  },
};

const MERGED_CATALOG: Catalog = {
  catalogId: 'primary-catalog',
  components: {
    ...PRIMARY_CATALOG.components,
    Modal: {
      properties: {
        trigger: {$ref: `${COMMON}/Child`},
        content: {$ref: `${COMMON}/Child`},
      },
    },
  },
};

const SECONDARY_MODAL_MESSAGES = [
  {
    version: '1.0',
    createSurface: {
      surfaceId: 's',
      catalogId: 'primary-catalog',
      components: [
        {id: 'root', component: 'Column', children: ['modal']},
        {id: 'modal', component: 'Modal', trigger: 'open', content: 'body'},
        {id: 'open', component: 'Text', text: 'Open'},
        {id: 'body', component: 'Text', text: 'Details'},
      ],
    },
  },
];

describe('ComponentTree', () => {
  let fixture: ComponentFixture<ComponentTree>;
  let harness: ComponentTreeHarness;
  let activeDraft: WritableSignal<string>;
  let activeCatalog: WritableSignal<Catalog | null>;
  let mergedActiveCatalog: WritableSignal<Catalog | null>;

  beforeEach(async () => {
    activeDraft = signal(formatJson(SECONDARY_MODAL_MESSAGES));
    activeCatalog = signal<Catalog | null>(null);
    mergedActiveCatalog = signal<Catalog | null>(null);

    await TestBed.configureTestingModule({
      imports: [ComponentTree],
      providers: [
        {provide: StateSync, useValue: {activeDraft}},
        {provide: CatalogManagement, useValue: {activeCatalog, mergedActiveCatalog}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentTree);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComponentTreeHarness);
  });

  it('prefers mergedActiveCatalog over activeCatalog so secondary catalog reference slots are expanded', async () => {
    activeCatalog.set(PRIMARY_CATALOG);
    mergedActiveCatalog.set(MERGED_CATALOG);
    fixture.detectChanges();

    const rows = await harness.getRows();

    expect(rows.map(row => row.id)).toEqual(['#root', '#modal', '#open', '#body']);
    expect(rows.map(row => row.via)).toEqual([null, 'children:', 'trigger:', 'content:']);
    expect(await harness.hasUnreachableHeader()).toBe(false);
  });

  it('falls back to activeCatalog when mergedActiveCatalog is null', async () => {
    activeCatalog.set(MERGED_CATALOG);
    mergedActiveCatalog.set(null);
    fixture.detectChanges();

    const rows = await harness.getRows();

    expect(rows.map(row => row.id)).toEqual(['#root', '#modal', '#open', '#body']);
    expect(rows.map(row => row.via)).toEqual([null, 'children:', 'trigger:', 'content:']);
    expect(await harness.hasUnreachableHeader()).toBe(false);
  });

  it('renders a parse error message and no tree rows when the active draft is invalid JSON', async () => {
    activeDraft.set('{invalid');
    fixture.detectChanges();

    expect(await harness.getErrorMessage()).toContain('The A2UI JSON is invalid:');
    expect(await harness.getRowIds()).toEqual([]);
  });

  it('renders an empty-state message when the draft has no surfaces', async () => {
    activeDraft.set('[]');
    fixture.detectChanges();

    expect(await harness.getMessages()).toEqual(['No surfaces.']);
    expect(await harness.getRowIds()).toEqual([]);
  });

  it.each([
    {label: 'empty', draft: ''},
    {label: 'whitespace-only', draft: '   \n\t  '},
  ])(
    'renders an empty-state message without a parse error when the draft is $label',
    async ({draft}) => {
      activeDraft.set(draft);
      fixture.detectChanges();

      expect(await harness.getErrorMessage()).toBeNull();
      expect(await harness.getMessages()).toEqual(['No surfaces.']);
      expect(await harness.getRowIds()).toEqual([]);
    },
  );

  it('renders a missing-root message and unreachable section when root is absent', async () => {
    activeCatalog.set(PRIMARY_CATALOG);
    activeDraft.set(
      formatJson([
        {
          version: '1.0',
          createSurface: {
            surfaceId: 's',
            catalogId: 'primary-catalog',
            components: [{id: 'orphan', component: 'Text', text: 'Standalone'}],
          },
        },
      ]),
    );
    fixture.detectChanges();

    expect(await harness.getMessages()).toEqual(['No root component.']);
    expect(await harness.hasUnreachableHeader()).toBe(true);
    expect(await harness.getRowIds()).toEqual(['#orphan']);
  });

  it('collapses and re-expands child rows when toggling a branch node', async () => {
    activeCatalog.set(MERGED_CATALOG);
    fixture.detectChanges();

    await harness.toggleRow('#modal');

    const collapsedRows = await harness.getRows();
    expect(collapsedRows.map(row => row.id)).toEqual(['#root', '#modal']);
    expect(collapsedRows[1].expanded).toBe(false);

    await harness.toggleRow('#modal');

    const expandedRows = await harness.getRows();
    expect(expandedRows.map(row => row.id)).toEqual(['#root', '#modal', '#open', '#body']);
    expect(expandedRows[1].expanded).toBe(true);
  });

  it('renders badges and tooltips for missing, cyclic, template, and shared nodes', async () => {
    activeCatalog.set(PRIMARY_CATALOG);
    activeDraft.set(
      formatJson([
        {
          version: '1.0',
          createSurface: {
            surfaceId: 's',
            catalogId: 'primary-catalog',
            components: [
              {
                id: 'root',
                component: 'Column',
                children: ['ghost', 'loop', 'templatedPath', 'templatedNoPath', 'sharedLeaf'],
              },
              {id: 'loop', component: 'Card', child: 'loop'},
              {
                id: 'templatedPath',
                component: 'Column',
                children: {componentId: 'sharedLeaf', path: '/items'},
              },
              {
                id: 'templatedNoPath',
                component: 'Column',
                children: {componentId: 'itemRow'},
              },
              {id: 'sharedLeaf', component: 'Text', text: 'Shared'},
              {id: 'itemRow', component: 'Text', text: 'Row'},
            ],
          },
        },
      ]),
    );
    fixture.detectChanges();

    const rows = await harness.getRows();

    expect(rows.map(row => ({id: row.id, badges: row.badges}))).toEqual([
      {id: '#root', badges: []},
      {id: '#ghost', badges: ['missing']},
      {id: '#loop', badges: ['shared']},
      {id: '#loop', badges: ['shared', 'cycle']},
      {id: '#templatedPath', badges: []},
      {id: '#sharedLeaf', badges: ['each /items', 'shared']},
      {id: '#templatedNoPath', badges: []},
      {id: '#itemRow', badges: ['each item']},
      {id: '#sharedLeaf', badges: ['shared']},
    ]);
    expect(await harness.getTooltipText('#root')).toBe('');
    expect(await harness.getTooltipText('#ghost')).toBe(
      'Component "ghost" is not defined in this surface.',
    );
    expect(await harness.getTooltipText('#loop', 1)).toBe(
      'Reference cycle: "loop" is one of its own ancestors, so it is not expanded again.',
    );
    expect(await harness.getTooltipText('#sharedLeaf')).toBe(
      'Rendered once per item of /items.\n"sharedLeaf" is referenced from more than one place.',
    );
    expect(await harness.getTooltipText('#itemRow')).toBe(
      'Rendered once per item of the data list.',
    );
  });

  it('renders the truncated warning badge when a surface exceeds MAX_NODES', async () => {
    activeCatalog.set(MERGED_CATALOG);
    fixture.detectChanges();
    // Collapse root first so jsdom does not instantiate 5,000 MatTooltip DOM rows.
    await harness.toggleRow('#root');

    const levels = Array.from({length: 12}, (_, index) => ({
      id: `n${index}`,
      component: 'Column',
      children: [`n${index + 1}`, `n${index + 1}`],
    }));
    activeDraft.set(
      formatJson([
        {
          version: '1.0',
          createSurface: {
            surfaceId: 's',
            catalogId: 'primary-catalog',
            components: [
              {id: 'root', component: 'Column', children: ['n0', 'n0']},
              ...levels,
              {id: 'n12', component: 'Text', text: 'Leaf'},
            ],
          },
        },
      ]),
    );
    fixture.detectChanges();

    expect(await harness.hasTruncatedBadge()).toBe(true);
    expect(await harness.getRowIds()).toEqual(['#root']);
  });
});
