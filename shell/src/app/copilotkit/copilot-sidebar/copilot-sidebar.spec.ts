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
import {Component, input, signal} from '@angular/core';
import {provideRouter} from '@angular/router';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {CopilotChat, CopilotKit, provideCopilotKit} from '@copilotkit/angular';
import {CopilotSidebar} from './copilot-sidebar';
import {AppConfigProvider} from '../../settings/app-config-provider/app-config-provider';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';

/**
 * Lightweight stand-in for the heavy real `<copilot-chat>` view. It shares the
 * `copilot-chat` selector and `agentId` input so the sidebar template resolves
 * against it, keeping this a focused unit test of the sidebar shell rather than
 * a boot of the full CopilotKit chat runtime.
 */
@Component({
  // Must mirror the real component's selector so the sidebar template resolves.
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'copilot-chat',
  standalone: true,
  template: '',
})
class CopilotChatStub {
  readonly agentId = input<string>('');
}

/**
 * Minimal fake for {@link AppConfigProvider} exposing only the reactive
 * `geminiApiKey` the sidebar reads, as a writable signal tests can flip to
 * exercise the key gate.
 */
class FakeAppConfigProvider {
  readonly geminiApiKey = signal('test-key');
}

/**
 * Minimal fake for {@link CatalogManagement} exposing only the reactive
 * `activeCatalog` the sidebar reads when tailoring starter chips.
 */
class FakeCatalogManagement {
  readonly activeCatalog = signal<{title?: string} | null>(null);
}

describe('CopilotSidebar', () => {
  let fixture: ComponentFixture<CopilotSidebar>;
  let fakeConfig: FakeAppConfigProvider;
  let fakeCatalog: FakeCatalogManagement;

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    fakeConfig = new FakeAppConfigProvider();
    fakeCatalog = new FakeCatalogManagement();

    await TestBed.configureTestingModule({
      imports: [CopilotSidebar],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideCopilotKit({agents: {}}),
        {provide: AppConfigProvider, useValue: fakeConfig},
        {provide: CatalogManagement, useValue: fakeCatalog},
      ],
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

  it('hides the chat and shows the add-key CTA when there is no Gemini key', () => {
    fakeConfig.geminiApiKey.set('');
    fixture.detectChanges();

    expect(host().querySelector('copilot-chat')).toBeNull();

    const cta = host().querySelector<HTMLAnchorElement>('a[href="/settings"]');
    expect(cta).toBeTruthy();
    expect(cta!.textContent).toContain('Add Gemini API key');
    expect(host().textContent).toContain('Add your Gemini API key to start generating.');
  });

  it('shows the chat and hides the add-key CTA once a key is present', () => {
    // Whitespace-only keys do not count as a real key.
    fakeConfig.geminiApiKey.set('   ');
    fixture.detectChanges();
    expect(host().querySelector('copilot-chat')).toBeNull();

    fakeConfig.geminiApiKey.set('a-real-key');
    fixture.detectChanges();

    expect(host().querySelector('copilot-chat')).toBeTruthy();
    expect(host().querySelector('a[href="/settings"]')).toBeNull();
  });

  it('exposes four generic starter chips when no catalog is active', () => {
    const chips = fixture.componentInstance.starterSuggestions();

    expect(chips.map(chip => chip.title)).toEqual([
      'Book a Car',
      'A sign-up form',
      'A pricing card',
      'A product dashboard header',
    ]);
    for (const chip of chips) {
      expect(chip.title.trim().length).toBeGreaterThan(0);
      expect(chip.message.trim().length).toBeGreaterThan(0);
    }
  });

  it('tailors the starter chip prompts to the active catalog name', () => {
    fakeCatalog.activeCatalog.set({title: 'Acme Kit'});
    fixture.detectChanges();

    const chips = fixture.componentInstance.starterSuggestions();
    for (const chip of chips) {
      expect(chip.message).toContain('Acme Kit');
    }
  });

  it('publishes the starter chips to the shared default agent on an empty thread', () => {
    const copilotKit = TestBed.inject(CopilotKit);
    // The real <copilot-chat> reloads suggestions when a config is registered;
    // replicate that here since the chat view is stubbed in this unit test.
    copilotKit.core.reloadSuggestions('default');

    const published = copilotKit.core.getSuggestions('default').suggestions;
    const expected = fixture.componentInstance.starterSuggestions();

    expect(published.map(s => s.title)).toEqual(expected.map(c => c.title));
    // Each chip carries the exact prompt that selecting it submits to the store.
    expect(published.map(s => s.message)).toEqual(expected.map(c => c.message));
  });

  it('does not publish starter chips while there is no key', () => {
    const copilotKit = TestBed.inject(CopilotKit);

    fakeConfig.geminiApiKey.set('');
    fixture.detectChanges();
    copilotKit.core.reloadSuggestions('default');

    expect(copilotKit.core.getSuggestions('default').suggestions).toHaveLength(0);
  });

  it('scopes the published config to the default agent and to before the first message', () => {
    const copilotKit = TestBed.inject(CopilotKit);
    // Drop then restore the key so the registration effect re-runs while spied.
    fakeConfig.geminiApiKey.set('');
    fixture.detectChanges();
    const addSpy = vi.spyOn(copilotKit, 'addSuggestionsConfig');
    fakeConfig.geminiApiKey.set('key-again');
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        consumerAgentId: 'default',
        available: 'before-first-message',
      }),
    );
  });

  it('withdraws its starter chips when the sidebar is destroyed', () => {
    const copilotKit = TestBed.inject(CopilotKit);
    copilotKit.core.reloadSuggestions('default');
    expect(copilotKit.core.getSuggestions('default').suggestions.length).toBeGreaterThan(0);

    fixture.destroy();
    copilotKit.core.reloadSuggestions('default');

    expect(copilotKit.core.getSuggestions('default').suggestions).toHaveLength(0);
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
