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
import {signal, WritableSignal} from '@angular/core';
import {beforeEach, describe, expect, it} from 'vitest';
import {StateSync} from '../../chat/state-sync/state-sync';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {formatJson} from '../../utils/json';
import {ComponentTree} from './component-tree';

const COMMON = 'https://a2ui.org/specification/v1_0/common_types.json#/$defs';

const PRIMARY_CATALOG: Catalog = {
  catalogId: 'primary-catalog',
  components: {
    Column: {properties: {children: {$ref: `${COMMON}/ChildList`}}},
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
  let activeDraft: WritableSignal<string>;
  let activeCatalog: WritableSignal<Catalog | null>;
  let mergedActiveCatalog: WritableSignal<Catalog | null>;

  const getRowIds = (): Array<string | null> =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.tree-row .id')).map(
      element => element.textContent,
    );

  const getRowViaLabels = (): Array<string | null> =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.tree-row .via')).map(
      element => element.textContent,
    );

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
  });

  it('prefers mergedActiveCatalog over activeCatalog so secondary catalog reference slots are expanded', () => {
    activeCatalog.set(PRIMARY_CATALOG);
    mergedActiveCatalog.set(MERGED_CATALOG);

    fixture.detectChanges();

    expect(getRowIds()).toEqual(['#root', '#modal', '#open', '#body']);
    expect(getRowViaLabels()).toEqual(['children:', 'trigger:', 'content:']);
    expect(fixture.nativeElement.querySelector('.unreachable-header')).toBeNull();
  });

  it('falls back to activeCatalog when mergedActiveCatalog is null', () => {
    activeCatalog.set(MERGED_CATALOG);
    mergedActiveCatalog.set(null);

    fixture.detectChanges();

    expect(getRowIds()).toEqual(['#root', '#modal', '#open', '#body']);
    expect(getRowViaLabels()).toEqual(['children:', 'trigger:', 'content:']);
    expect(fixture.nativeElement.querySelector('.unreachable-header')).toBeNull();
  });
});
