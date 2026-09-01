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
}

describe('CustomCatalog (Assembled Components)', () => {
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
});
