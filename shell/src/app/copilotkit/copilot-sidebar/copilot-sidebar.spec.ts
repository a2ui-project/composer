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
import {Component, input} from '@angular/core';
import {describe, it, expect, beforeEach} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {CopilotChat, CopilotKit, provideCopilotKit} from '@copilotkit/angular';
import {CopilotSidebar} from './copilot-sidebar';

/**
 * Lightweight stand-in for the heavy real `<copilot-chat>` view. It shares the
 * `copilot-chat` selector and `agentId` input so the sidebar template resolves
 * against it, keeping this a focused unit test of the sidebar shell rather than
 * a boot of the full CopilotKit chat runtime.
 */
@Component({
  selector: 'copilot-chat',
  standalone: true,
  template: '',
})
class CopilotChatStub {
  readonly agentId = input<string>('');
}

describe('CopilotSidebar', () => {
  let fixture: ComponentFixture<CopilotSidebar>;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CopilotSidebar],
      providers: [provideNoopAnimations(), provideCopilotKit({agents: {}})],
    })
      .overrideComponent(CopilotSidebar, {
        remove: {imports: [CopilotChat]},
        add: {imports: [CopilotChatStub]},
      })
      .compileComponents();

    fixture = TestBed.createComponent(CopilotSidebar);
    fixture.detectChanges();
  });

  it('mounts and renders a <copilot-chat> bound to the default agent', () => {
    const chat = host().querySelector('copilot-chat');
    expect(chat).toBeTruthy();
  });

  it('is expanded by default at the docked panel width', () => {
    expect(fixture.componentInstance.collapsed()).toBe(false);
    expect(host().classList.contains('a2ui-composer-copilot-sidebar--collapsed')).toBe(false);
    expect(host().style.width).toBe('380px');
  });

  it('registers the A2UI tool-call renders in its constructor', () => {
    const copilotKit = TestBed.inject(CopilotKit);
    const names = copilotKit.toolCallRenderConfigs().map(config => config.name);
    expect(names).toContain('render_a2ui');
    expect(names).toContain('a2ui_repair');
  });

  it('collapsing hides the chat, shows the rail, and narrows the host', () => {
    fixture.componentInstance.toggleCollapsed();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(host().querySelector('copilot-chat')).toBeNull();
    expect(host().querySelector('.rail')).toBeTruthy();
    expect(host().classList.contains('a2ui-composer-copilot-sidebar--collapsed')).toBe(true);
    expect(host().style.width).toBe('48px');
  });

  it('expanding again re-reveals the chat and restores the docked width', () => {
    fixture.componentInstance.toggleCollapsed();
    fixture.detectChanges();
    fixture.componentInstance.toggleCollapsed();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(false);
    expect(host().querySelector('copilot-chat')).toBeTruthy();
    expect(host().style.width).toBe('380px');
  });

  it('collapses when the header toggle button is clicked', () => {
    const collapseButton = host().querySelector<HTMLButtonElement>(
      'button[aria-label="Collapse assistant panel"]',
    );
    expect(collapseButton).toBeTruthy();

    collapseButton!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(true);
  });

  it('expands when the collapsed rail toggle button is clicked', () => {
    fixture.componentInstance.toggleCollapsed();
    fixture.detectChanges();

    const expandButton = host().querySelector<HTMLButtonElement>(
      'button[aria-label="Expand assistant panel"]',
    );
    expect(expandButton).toBeTruthy();

    expandButton!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(false);
  });
});
