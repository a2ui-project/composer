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

import {TestKey} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ComposerPanelId, OpenPanelEvent} from '../../shell/composer-workspace/composer-panel-id';
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
  let component: ComponentTree;
  let activeDraft: WritableSignal<string>;
  let activeCatalog: WritableSignal<Catalog | null>;
  let mergedActiveCatalog: WritableSignal<Catalog | null>;
  let updateDraftSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    activeDraft = signal(formatJson(SECONDARY_MODAL_MESSAGES));
    activeCatalog = signal<Catalog | null>(null);
    mergedActiveCatalog = signal<Catalog | null>(null);
    updateDraftSpy = vi.fn((next: string) => activeDraft.set(next));

    await TestBed.configureTestingModule({
      imports: [ComponentTree],
      providers: [
        {
          provide: StateSync,
          useValue: {
            activeDraft,
            updateDraft: updateDraftSpy,
          },
        },
        {
          provide: CatalogManagement,
          useValue: {
            activeCatalog,
            mergedActiveCatalog,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComponentTreeHarness);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(await harness.getTrees()).toEqual([]);
    expect(await harness.getRowIds()).toEqual([]);
  });

  it('renders an empty-state message when the draft has no surfaces', async () => {
    activeDraft.set('[]');
    fixture.detectChanges();

    expect(await harness.getMessages()).toEqual(['No surfaces.']);
    expect(await harness.getTrees()).toEqual([]);
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
    expect(await harness.getTrees()).toEqual([
      {
        label: 'Surface s, not reachable from root',
        rowIds: ['#orphan'],
        tabStops: ['#orphan'],
      },
    ]);
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

  describe('selection and keyboard navigation', () => {
    beforeEach(() => {
      activeCatalog.set(MERGED_CATALOG);
      fixture.detectChanges();
    });

    it('starts with no node selected', () => {
      expect(component.selected()).toBeNull();
      expect(component.selectedComponent()).toBeNull();
    });

    it('selects a node on click and dispatches OpenPanelEvent for PropertyEditor', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      await harness.selectRow('#open');

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: OpenPanelEvent.TYPE,
          detail: {panelId: ComposerPanelId.PropertyEditor},
        }),
      );
      const rows = await harness.getRows();
      expect(rows.map(row => row.selected)).toEqual([false, false, true, false]);
      expect(component.selectedComponent()).toEqual({
        id: 'open',
        component: 'Text',
        text: 'Open',
      });
    });

    it('does not select the row or open PropertyEditor when toggling expansion', async () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      await harness.toggleRow('#modal');

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(component.selected()).toBeNull();
      const rows = await harness.getRows();
      expect(
        rows.map(row => ({id: row.id, expanded: row.expanded, selected: row.selected})),
      ).toEqual([
        {id: '#root', expanded: true, selected: false},
        {id: '#modal', expanded: false, selected: false},
      ]);
    });

    it('updates the selected component in the active draft via updateSelectedComponent', async () => {
      await harness.selectRow('#open');

      component.updateSelectedComponent({
        id: 'open',
        component: 'Text',
        text: 'Updated Open',
      });
      fixture.detectChanges();

      expect(updateDraftSpy).toHaveBeenCalledTimes(1);
      const updatedPayload = JSON.parse(activeDraft());
      expect(updatedPayload[0].createSurface.components).toEqual([
        {id: 'root', component: 'Column', children: ['modal']},
        {id: 'modal', component: 'Modal', trigger: 'open', content: 'body'},
        {id: 'open', component: 'Text', text: 'Updated Open'},
        {id: 'body', component: 'Text', text: 'Details'},
      ]);
    });

    it('switches selection when a different node is clicked', async () => {
      await harness.selectRow('#open');

      await harness.selectRow('#root');

      const rows = await harness.getRows();
      expect(rows.map(row => row.selected)).toEqual([true, false, false, false]);
      expect(component.selected()?.id).toBe('root');
    });

    describe('keyboard navigation', () => {
      it('sets roving tabindex and aria-level on tree rows', async () => {
        const rows = await harness.getRows();

        expect(rows.map(row => row.tabIndex)).toEqual([0, -1, -1, -1]);
        expect(rows.map(row => row.level)).toEqual([1, 2, 3, 3]);
      });

      it('hides branch toggles from the accessibility tree without nesting interactive elements inside treeitems', async () => {
        const rows = await harness.getRows();

        expect(
          rows.map(row => ({
            id: row.id,
            hasNestedInteractive: row.hasNestedInteractive,
            toggleAriaHidden: row.toggleAriaHidden,
          })),
        ).toEqual([
          {id: '#root', hasNestedInteractive: false, toggleAriaHidden: 'true'},
          {id: '#modal', hasNestedInteractive: false, toggleAriaHidden: 'true'},
          {id: '#open', hasNestedInteractive: false, toggleAriaHidden: null},
          {id: '#body', hasNestedInteractive: false, toggleAriaHidden: null},
        ]);
      });

      it('resets tabindex to the first row when the focused node is collapsed', async () => {
        await harness.focusRow('#open');

        await harness.toggleRow('#modal');

        const rows = await harness.getRows();
        expect(rows.map(row => ({id: row.id, tabIndex: row.tabIndex}))).toEqual([
          {id: '#root', tabIndex: 0},
          {id: '#modal', tabIndex: -1},
        ]);
      });

      it('resets tabindex to the first row when the focused node is removed from the draft', async () => {
        await harness.focusRow('#open');

        activeDraft.set(
          formatJson([
            {
              version: '1.0',
              createSurface: {
                surfaceId: 's',
                catalogId: 'primary-catalog',
                components: [
                  {id: 'root', component: 'Column', children: ['body']},
                  {id: 'body', component: 'Text', text: 'Details'},
                ],
              },
            },
          ]),
        );
        fixture.detectChanges();

        const rows = await harness.getRows();
        expect(rows.map(row => ({id: row.id, tabIndex: row.tabIndex}))).toEqual([
          {id: '#root', tabIndex: 0},
          {id: '#body', tabIndex: -1},
        ]);
      });

      it('moves focus with ArrowDown and ArrowUp across visible rows without selecting', async () => {
        await harness.pressKeyOnRow('#root', TestKey.DOWN_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#modal');
        expect(component.selected()).toBeNull();

        await harness.pressKeyOnRow('#modal', TestKey.DOWN_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#open');

        await harness.pressKeyOnRow('#open', TestKey.DOWN_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#body');

        await harness.pressKeyOnRow('#body', TestKey.UP_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#open');

        await harness.pressKeyOnRow('#open', TestKey.UP_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#modal');
      });

      it('selects the focused node and opens PropertyEditor on Enter or Space', async () => {
        const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

        await harness.pressKeyOnRow('#open', TestKey.ENTER);
        expect(component.selected()?.id).toBe('open');
        expect((await harness.getRows()).map(row => row.selected)).toEqual([
          false,
          false,
          true,
          false,
        ]);
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: OpenPanelEvent.TYPE,
            detail: {panelId: ComposerPanelId.PropertyEditor},
          }),
        );

        dispatchSpy.mockClear();

        await harness.pressKeyOnRow('#modal', ' ');
        expect(component.selected()?.id).toBe('modal');
        expect((await harness.getRows()).map(row => row.selected)).toEqual([
          false,
          true,
          false,
          false,
        ]);
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: OpenPanelEvent.TYPE,
            detail: {panelId: ComposerPanelId.PropertyEditor},
          }),
        );
      });

      it('collapses an expanded node on ArrowLeft', async () => {
        await harness.pressKeyOnRow('#modal', TestKey.LEFT_ARROW);

        const rows = await harness.getRows();
        expect(rows.map(row => ({id: row.id, expanded: row.expanded}))).toEqual([
          {id: '#root', expanded: true},
          {id: '#modal', expanded: false},
        ]);
      });

      it('focuses the parent node on ArrowLeft from a leaf or collapsed node', async () => {
        await harness.pressKeyOnRow('#open', TestKey.LEFT_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#modal');

        await harness.toggleRow('#modal');
        await harness.pressKeyOnRow('#modal', TestKey.LEFT_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#root');
      });

      it('expands a collapsed node on ArrowRight', async () => {
        await harness.toggleRow('#modal');

        await harness.pressKeyOnRow('#modal', TestKey.RIGHT_ARROW);

        const rows = await harness.getRows();
        expect(rows.map(row => row.id)).toEqual(['#root', '#modal', '#open', '#body']);
        expect(rows[1].expanded).toBe(true);
      });

      it('focuses the first child on ArrowRight from an expanded node', async () => {
        await harness.pressKeyOnRow('#root', TestKey.RIGHT_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#modal');

        await harness.pressKeyOnRow('#modal', TestKey.RIGHT_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#open');
      });

      it('labels each surface and unreachable section as its own tree with independent tab stops', async () => {
        activeDraft.set(
          formatJson([
            {
              version: '1.0',
              createSurface: {
                surfaceId: 'first',
                catalogId: 'primary-catalog',
                components: [
                  {id: 'root', component: 'Column', children: ['childA']},
                  {id: 'childA', component: 'Text', text: 'A'},
                  {id: 'orphan', component: 'Text', text: 'Orphan'},
                ],
              },
            },
            {
              version: '1.0',
              createSurface: {
                surfaceId: 'second',
                catalogId: 'primary-catalog',
                components: [{id: 'root', component: 'Text', text: 'B'}],
              },
            },
          ]),
        );
        fixture.detectChanges();

        await harness.focusRow('#childA');

        expect(await harness.getTrees()).toEqual([
          {label: 'Surface first', rowIds: ['#root', '#childA'], tabStops: ['#childA']},
          {
            label: 'Surface first, not reachable from root',
            rowIds: ['#orphan'],
            tabStops: ['#orphan'],
          },
          {label: 'Surface second', rowIds: ['#root'], tabStops: ['#root']},
        ]);
      });

      it('scopes ArrowDown and ArrowUp navigation to the active tree', async () => {
        activeDraft.set(
          formatJson([
            {
              version: '1.0',
              createSurface: {
                surfaceId: 'first',
                catalogId: 'primary-catalog',
                components: [
                  {id: 'root', component: 'Text', text: 'A'},
                  {id: 'orphan', component: 'Text', text: 'Orphan'},
                ],
              },
            },
            {
              version: '1.0',
              createSurface: {
                surfaceId: 'second',
                catalogId: 'primary-catalog',
                components: [{id: 'root', component: 'Text', text: 'B'}],
              },
            },
          ]),
        );
        fixture.detectChanges();

        await harness.pressKeyOnRow('#root', TestKey.DOWN_ARROW, 0);
        expect((await harness.getRows()).map(row => row.focused)).toEqual([true, false, false]);

        await harness.pressKeyOnRow('#orphan', TestKey.UP_ARROW);
        expect(await harness.getFocusedRowId()).toBe('#orphan');

        await harness.pressKeyOnRow('#root', TestKey.UP_ARROW, 1);
        expect((await harness.getRows()).map(row => row.focused)).toEqual([false, false, true]);
      });
    });
  });
});
