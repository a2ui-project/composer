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
import {beforeEach, describe, expect, it, vi} from 'vitest';
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

  const getRows = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.tree-row')) as HTMLElement[];

  const pressKey = (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
    fixture.detectChanges();
  };

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

  it('starts with no node selected', () => {
    expect(component.selected()).toBeNull();
    expect(component.selectedComponent()).toBeNull();
  });

  it('selects a node on click and dispatches OpenPanelEvent for PropertyEditor', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    const rows = getRows();

    rows[2].click();
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: OpenPanelEvent.TYPE,
        detail: {panelId: ComposerPanelId.PropertyEditor},
      }),
    );
    dispatchSpy.mockRestore();
    expect(rows[2].classList.contains('selected')).toBe(true);
    expect(rows[2].getAttribute('aria-selected')).toBe('true');
    expect(rows[0].getAttribute('aria-selected')).toBe('false');
    expect(component.selectedComponent()).toEqual({
      id: 'greeting',
      component: 'Text',
      text: 'Hello',
      variant: 'body',
    });
  });

  it('updates the selected component in the active draft via updateSelectedComponent', () => {
    const rows = getRows();
    rows[2].click();
    fixture.detectChanges();

    component.updateSelectedComponent({
      id: 'greeting',
      component: 'Text',
      text: 'Updated greeting',
      variant: 'body',
    });
    fixture.detectChanges();

    expect(updateDraftSpy).toHaveBeenCalledTimes(1);
    const updatedPayload = JSON.parse(activeDraft());
    expect(updatedPayload[1].updateComponents.components).toEqual([
      {id: 'root', component: 'Column', children: ['branch', 'ghost']},
      {id: 'branch', component: 'Column', children: ['greeting']},
      {id: 'greeting', component: 'Text', text: 'Updated greeting', variant: 'body'},
    ]);
  });

  it('switches selection when a different node is clicked', () => {
    const rows = getRows();

    rows[2].click();
    fixture.detectChanges();
    expect(component.selected()?.id).toBe('greeting');

    rows[0].click();
    fixture.detectChanges();
    expect(rows[0].classList.contains('selected')).toBe(true);
    expect(rows[2].classList.contains('selected')).toBe(false);
    expect(component.selected()?.id).toBe('root');
  });

  describe('keyboard navigation', () => {
    it('sets roving tabindex and aria-level on tree rows', () => {
      const rows = getRows();
      expect(rows.map(row => row.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
      expect(rows.map(row => row.getAttribute('aria-level'))).toEqual(['1', '2', '3', '2']);
    });

    it('falls back to the first node when the focused node is collapsed or removed', () => {
      let rows = getRows();
      rows[2].focus();
      fixture.detectChanges();
      expect(rows.map(row => row.getAttribute('tabindex'))).toEqual(['-1', '-1', '0', '-1']);

      const toggleButton = rows[1].querySelector('button.toggle') as HTMLButtonElement;
      toggleButton.click();
      fixture.detectChanges();
      rows = getRows();
      expect(rows.map(row => row.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    });

    it('moves focus with ArrowDown and ArrowUp into expanded children before siblings without selecting', () => {
      const rows = getRows();

      pressKey(rows[0], 'ArrowDown');
      expect(document.activeElement).toBe(rows[1]);
      expect(component.selected()).toBeNull();

      pressKey(rows[1], 'ArrowDown');
      expect(document.activeElement).toBe(rows[2]);
      expect(rows[2].textContent).toContain('#greeting');

      pressKey(rows[2], 'ArrowUp');
      expect(document.activeElement).toBe(rows[1]);
    });

    it('selects the focused node on Enter or Space', () => {
      const rows = getRows();

      pressKey(rows[2], 'Enter');
      expect(component.selected()?.id).toBe('greeting');

      pressKey(rows[1], ' ');
      expect(component.selected()?.id).toBe('branch');
    });

    it('collapses an expanded node on ArrowLeft and focuses its parent when already collapsed or a leaf', () => {
      let rows = getRows();

      pressKey(rows[2], 'ArrowLeft');
      expect(document.activeElement).toBe(rows[1]);

      pressKey(rows[1], 'ArrowLeft');
      rows = getRows();
      expect(rows.length).toBe(3);
      expect(rows[1].getAttribute('aria-expanded')).toBe('false');

      pressKey(rows[1], 'ArrowLeft');
      expect(document.activeElement).toBe(rows[0]);
    });

    it('focuses the first child on ArrowRight when expanded and expands when collapsed', () => {
      let rows = getRows();

      pressKey(rows[1], 'ArrowLeft');
      rows = getRows();

      pressKey(rows[0], 'ArrowRight');
      expect(document.activeElement).toBe(rows[1]);

      pressKey(rows[1], 'ArrowRight');
      rows = getRows();
      expect(rows.length).toBe(4);
      expect(rows[1].getAttribute('aria-expanded')).toBe('true');

      pressKey(rows[1], 'ArrowRight');
      expect(document.activeElement).toBe(rows[2]);
    });
  });
});
