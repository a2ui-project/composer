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

import {Component, input, output, provideZonelessChangeDetection} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {describe, it, expect, beforeEach} from 'vitest';
import {A2uiRendererService} from '@a2ui/angular/v0_9';
import {CustomCatalog} from './custom-catalog';
import {MonacoEditor} from '../../shared/monaco-editor/monaco-editor';
import * as apis from '../catalog/apis';

// Stub the Monaco editor: the real one loads the Monaco AMD bundle in
// afterNextRender, which never resolves under jsdom. The stub mirrors the
// selector + I/O the template binds to.
@Component({
  selector: 'a2ui-composer-monaco-editor',
  standalone: true,
  template: '',
})
class MonacoEditorStub {
  readonly value = input<string>('');
  readonly valueChange = output<string>();
}

// Access protected members without leaking `any` across the file.
interface CustomCatalogInternals {
  activeExampleId: () => string;
  activeStateIndex: () => number;
  editorValue: () => string;
  selectExample: (id: string) => void;
  selectState: (index: number) => void;
  onEdit: (text: string) => void;
  viewMode: () => string;
  sourceFiles: () => Array<{label: string; path: string; code: string}>;
  selectedSource: () => {path: string; code: string} | undefined;
  setViewMode: (mode: string) => void;
  selectSource: (path: string) => void;
}

describe('CustomCatalog', () => {
  let fixture: ComponentFixture<CustomCatalog>;
  let component: CustomCatalogInternals;
  let renderer: A2uiRendererService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomCatalog],
      providers: [provideZonelessChangeDetection()],
    })
      .overrideComponent(CustomCatalog, {
        remove: {imports: [MonacoEditor]},
        add: {imports: [MonacoEditorStub]},
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomCatalog);
    component = fixture.componentInstance as unknown as CustomCatalogInternals;
    renderer = fixture.debugElement.injector.get(A2uiRendererService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('opens on the Flight Card example with its first data state', () => {
    expect(component.activeExampleId()).toBe('flight');
    expect(component.editorValue()).toContain('United Airlines');
  });

  it('creates a native surface for the active example', () => {
    expect(renderer.surfaceGroup.getSurface('flight')).toBeTruthy();
  });

  it('switches example, builds its surface, and resets to the first data state', () => {
    component.selectExample('sales');
    fixture.detectChanges();

    expect(component.activeExampleId()).toBe('sales');
    expect(component.activeStateIndex()).toBe(0);
    expect(renderer.surfaceGroup.getSurface('sales')).toBeTruthy();
    expect(component.editorValue()).toContain('Sales Dashboard');
  });

  it('switching data state swaps the editor to that state (no surface rebuild)', () => {
    component.selectExample('sales');
    fixture.detectChanges();
    component.selectState(1);
    fixture.detectChanges();

    expect(component.activeStateIndex()).toBe(1);
    // Q2 is the second sales data state; the editor reflects it live.
    expect(component.editorValue()).toContain('Q2');
  });

  it('ignores invalid JSON edits without throwing, and applies valid ones', () => {
    expect(() => component.onEdit('not valid json {')).not.toThrow();
    expect(() => component.onEdit('{"flights": []}')).not.toThrow();
  });

  it('opens on the assembled view', () => {
    expect(component.viewMode()).toBe('assembled');
  });

  it('switches to the Definitions source view and auto-selects the first file', async () => {
    component.setViewMode('definitions');
    fixture.detectChanges();
    await fixture.whenStable();

    const files = component.sourceFiles();
    expect(files.map(f => f.label)).toEqual(['apis.ts', 'dashboard-catalog.ts']);
    expect(component.selectedSource()?.path).toBe(files[0].path);
  });

  it('switches to the Renderers source view and can select a file', async () => {
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

  it('shows the bundled source verbatim, not a transcription of it', async () => {
    component.setViewMode('definitions');
    fixture.detectChanges();
    await fixture.whenStable();

    const apisFile = component.sourceFiles().find(f => f.label === 'apis.ts');
    // The bundle is generated from the same apis.ts the catalog is built from,
    // so every ComponentApi name in the running catalog appears in the source.
    expect(apisFile?.code).toContain('export const FlightCardApi');
    expect(apisFile?.path).toBe('shell/src/app/custom-catalog/catalog/apis.ts');
  });

  it('renders the source view DOM: a file list and the selected file verbatim', async () => {
    component.setViewMode('renderers');
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const items = Array.from(el.querySelectorAll('.cc-source-item'));
    expect(items).toHaveLength(11);

    // Exactly one file is marked current, and it is the one on screen.
    const active = items.filter(i => i.getAttribute('aria-current') === 'true');
    expect(active).toHaveLength(1);

    const codeText = el.querySelector('.cc-source-code')?.textContent ?? '';
    expect(codeText).toBe(component.selectedSource()?.code);

    // The assembled panes are not in the DOM while a source view is showing.
    expect(el.querySelector('.cc-preview')).toBeNull();
    expect(el.querySelector('.cc-editor')).toBeNull();
  });

  it('bundles exactly one renderer file per component the catalog defines', () => {
    // apis.ts exports one ComponentApi per catalog component; dashboard-catalog
    // is assembled from these same objects, so their names are the catalog's.
    // If a component is added or removed without re-running the codegen, this
    // fails rather than letting the Renderers view drift out of sync.
    const catalogNames = Object.values(apis)
      .filter(
        (v): v is {name: string} => !!v && typeof v === 'object' && 'name' in v && 'schema' in v,
      )
      .map(v => v.name)
      .sort();

    component.setViewMode('renderers');
    fixture.detectChanges();
    const rendererLabels = component
      .sourceFiles()
      .map(f => f.label)
      .sort();

    expect(rendererLabels).toEqual(catalogNames);
  });
});
