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
import {RepairToolRender, RepairArgs} from './repair-tool-render';

describe('RepairToolRender', () => {
  let fixture: ComponentFixture<RepairToolRender>;

  function render(toolCall: AngularToolCall<RepairArgs>): HTMLElement {
    fixture = TestBed.createComponent(RepairToolRender);
    fixture.componentRef.setInput('toolCall', toolCall);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [RepairToolRender]}).compileComponents();
  });

  it('renders nothing when fixes is an empty array', () => {
    const el = render({status: 'complete', args: {fixes: []}, result: 'ok'});
    expect(el.textContent?.trim()).toBe('');
    expect(el.querySelector('.repair-card')).toBeNull();
  });

  it('renders nothing when fixes is absent', () => {
    const el = render({status: 'in-progress', args: {}, result: undefined});
    expect(el.textContent?.trim()).toBe('');
    expect(el.querySelector('.repair-card')).toBeNull();
  });

  it('shows "Fixed 1 issue(s)" and reveals the "from → to" row when expanded', () => {
    const el = render({
      status: 'complete',
      args: {fixes: [{from: 'textbox', to: 'TextField'}]},
      result: 'ok',
    });

    expect(el.textContent).toContain('Fixed 1 issue(s)');
    // Collapsed by default: the substitution row is not yet rendered.
    expect(el.textContent).not.toContain('textbox → TextField');

    const toggle = el.querySelector<HTMLButtonElement>('button');
    expect(toggle).not.toBeNull();
    toggle!.click();
    fixture.detectChanges();

    expect(el.textContent).toContain('textbox → TextField');
  });

  it('counts every provided fix in the header', () => {
    const el = render({
      status: 'complete',
      args: {
        fixes: [
          {from: 'textbox', to: 'TextField'},
          {from: 'btn', to: 'Button'},
        ],
      },
      result: 'ok',
    });
    expect(el.textContent).toContain('Fixed 2 issue(s)');
  });
});
