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

import {provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach} from 'vitest';
import {A2uiRendererService} from '@a2ui/angular/v0_9';
import {CatalogReference} from './catalog-reference';
import {COMPONENT_DOCS} from './catalog-reference.data';
import * as apis from '../catalog/apis';

// Access protected members without leaking `any` across the file.
interface RefInternals {
  viewMode: () => string;
  selectedName: () => string;
  selectedDoc: () => {name: string} | undefined;
  groups: () => Array<{category: string; docs: Array<{name: string}>}>;
  sourceFiles: () => Array<{label: string; path: string; code: string}>;
  selectedSource: () => {path: string} | undefined;
  usageJson: () => string;
  activeSurfaceId: () => string;
  setViewMode: (mode: string) => void;
  selectComponent: (name: string) => void;
  selectSource: (path: string) => void;
  copyUsage: () => void;
}

describe('CatalogReference', () => {
  let fixture: ComponentFixture<CatalogReference>;
  let component: RefInternals;
  let renderer: A2uiRendererService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogReference],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogReference);
    component = fixture.componentInstance as unknown as RefInternals;
    renderer = fixture.debugElement.injector.get(A2uiRendererService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('auto-selects the first component and opens on the Components view', () => {
    expect(component.viewMode()).toBe('components');
    expect(component.selectedName()).toBe(COMPONENT_DOCS[0].name);
    expect(component.selectedDoc()?.name).toBe(COMPONENT_DOCS[0].name);
  });

  it('groups every documented component under its category in a stable order', () => {
    const groups = component.groups();
    expect(groups.map(g => g.category)).toEqual(['Layout', 'Content', 'Data Display', 'Interactive']);
    const grouped = groups.flatMap(g => g.docs.map(d => d.name)).sort();
    const all = COMPONENT_DOCS.map(d => d.name).sort();
    expect(grouped).toEqual(all);
  });

  it('renders a native preview surface for the selected component', () => {
    expect(renderer.surfaceGroup.getSurface(component.activeSurfaceId())).toBeTruthy();
  });

  it('builds the surface for a newly selected component', async () => {
    component.selectComponent('FlightCard');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.selectedName()).toBe('FlightCard');
    expect(renderer.surfaceGroup.getSurface('ref-FlightCard')).toBeTruthy();
  });

  it('exposes a usage snippet with the createSurface message and catalog id', () => {
    const usage = component.usageJson();
    expect(usage).toContain('createSurface');
    expect(usage).toContain('copilotkit://app-dashboard-catalog');
    expect(usage).toContain('"Row"');
  });

  it('switches to the Definitions source view and auto-selects the first file', async () => {
    component.setViewMode('definitions');
    fixture.detectChanges();
    await fixture.whenStable();

    const files = component.sourceFiles();
    expect(files.map(f => f.label)).toEqual(['apis.ts', 'dashboard-catalog.ts']);
    expect(component.selectedSource()?.path).toBe(files[0].path);
  });

  it('switches to the Renderers source view (11 files) and can select one', async () => {
    component.setViewMode('renderers');
    fixture.detectChanges();
    await fixture.whenStable();

    const files = component.sourceFiles();
    expect(files).toHaveLength(11);

    const target = files.find(f => f.label === 'FlightCard');
    expect(target).toBeDefined();
    component.selectSource(target!.path);
    fixture.detectChanges();
    expect(component.selectedSource()?.path).toBe(target!.path);
  });

  it('does not throw when copying usage without a clipboard', () => {
    expect(() => component.copyUsage()).not.toThrow();
  });

  it('documents exactly the components the catalog defines (docs stay in sync)', () => {
    // apis.ts exports one ComponentApi per catalog component; dashboard-catalog
    // is assembled from these same objects, so their names are the catalog's.
    const catalogNames = Object.values(apis)
      .filter(
        (v): v is {name: string} =>
          !!v && typeof v === 'object' && 'name' in v && 'schema' in v,
      )
      .map(v => v.name)
      .sort();
    const docNames = COMPONENT_DOCS.map(d => d.name).sort();
    expect(docNames).toEqual(catalogNames);
  });
});
