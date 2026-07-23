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

import {TestBed, ComponentFixture} from '@angular/core/testing';
import {describe, it, expect, beforeEach} from 'vitest';
import {AngularToolCall} from '@copilotkit/angular';
import {RenderA2uiToolRender, RenderA2uiArgs} from './render-a2ui-tool-render';

describe('RenderA2uiToolRender', () => {
  let fixture: ComponentFixture<RenderA2uiToolRender>;

  function render(toolCall: AngularToolCall<RenderA2uiArgs>): HTMLElement {
    fixture = TestBed.createComponent(RenderA2uiToolRender);
    fixture.componentRef.setInput('toolCall', toolCall);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [RenderA2uiToolRender]}).compileComponents();
  });

  it('renders "Generated Foo" when surfaceTitle is "Foo"', () => {
    const el = render({
      status: 'complete',
      args: {surfaceTitle: 'Foo', blocks: [{}, {}]},
      result: 'ok',
    });
    expect(el.textContent).toContain('Generated Foo');
  });

  it('falls back to "Generated UI" when surfaceTitle is absent', () => {
    const el = render({status: 'executing', args: {blocks: []}, result: undefined});
    expect(el.textContent).toContain('Generated UI');
  });

  it('switches status text between the executing and complete states', () => {
    const executingEl = render({status: 'executing', args: {blocks: []}, result: undefined});
    expect(executingEl.textContent).toContain('Building your UI…');
    expect(executingEl.textContent).not.toContain('Rendered · shown in canvas');

    const completeEl = render({status: 'complete', args: {blocks: []}, result: 'ok'});
    expect(completeEl.textContent).toContain('Rendered · shown in canvas');
    expect(completeEl.textContent).not.toContain('Building your UI…');
  });

  it('shows the building status while in-progress', () => {
    const el = render({status: 'in-progress', args: {}, result: undefined});
    expect(el.textContent).toContain('Building your UI…');
  });

  it('shows "2 blocks" for blocks:[{}, {}]', () => {
    const el = render({
      status: 'complete',
      args: {surfaceTitle: 'X', blocks: [{}, {}]},
      result: 'ok',
    });
    expect(el.textContent).toContain('2 blocks');
  });

  it('pluralizes to the singular "1 block" for a single block', () => {
    const el = render({status: 'complete', args: {blocks: [{}]}, result: 'ok'});
    expect(el.textContent).toContain('1 block');
    expect(el.textContent).not.toContain('1 blocks');
  });

  it('reports "0 blocks" when blocks is absent (in-progress)', () => {
    const el = render({status: 'in-progress', args: {}, result: undefined});
    expect(el.textContent).toContain('0 blocks');
  });
});
