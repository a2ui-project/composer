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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {ComponentTree} from './component-tree';
import {StateSync} from '../../chat/state-sync/state-sync';
import {ComposerPanelId, OpenPanelEvent} from '../../shell/composer-workspace/composer-panel-id';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {formatJson} from '../../utils/json';

const COMMON = 'https://a2ui.org/specification/v0_9/common_types.json#/$defs';

const TEST_CATALOG: Catalog = {
  catalogId: 'test-catalog',
  components: {
    Column: {
      allOf: [
        {$ref: `${COMMON}/ComponentCommon`},
        {
          type: 'object',
          properties: {
            component: {const: 'Column'},
            children: {$ref: `${COMMON}/ChildList`},
          },
          required: ['component', 'children'],
        },
      ],
    },
    Text: {
      allOf: [
        {$ref: `${COMMON}/ComponentCommon`},
        {
          type: 'object',
          properties: {
            component: {const: 'Text'},
            text: {type: 'string'},
            variant: {type: 'string', enum: ['body', 'title']},
          },
          required: ['component', 'text'],
        },
      ],
    },
  },
};

// Pre-order rows: 0=#root, 1=#branch, 2=#greeting (child of #branch), 3=#ghost (missing sibling of #branch)
const INITIAL_MESSAGES = [
  {version: 'v0.9', createSurface: {surfaceId: 's', catalogId: 'test-catalog'}},
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 's',
      components: [
        {id: 'root', component: 'Column', children: ['branch', 'ghost']},
        {id: 'branch', component: 'Column', children: ['greeting']},
        {id: 'greeting', component: 'Text', text: 'Hello', variant: 'body'},
      ],
    },
  },
];

describe('ComponentTree', () => {
  let fixture: ComponentFixture<ComponentTree>;
  let component: ComponentTree;
  let activeDraft: ReturnType<typeof signal<string>>;
  let activeCatalog: ReturnType<typeof signal<Catalog | null>>;
  let updateDraftSpy: ReturnType<typeof vi.fn>;

  const getRows = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.tree-row')) as HTMLElement[];

  const pressKey = (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    activeDraft = signal(formatJson(INITIAL_MESSAGES));
    activeCatalog = signal<Catalog | null>(TEST_CATALOG);
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
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
