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

import '@angular/compiler';

// @vitest-environment jsdom
import {describe, it, expect, afterEach, vi} from 'vitest';
import {getTestBed, TestBed} from '@angular/core/testing';
import {Component, Type, inject} from '@angular/core';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {A2uiSandboxConnection, provideA2uiSandbox} from './angular-bridge';
import {A2UI_RENDERER_CONFIG, A2uiRendererService, MarkdownRenderer} from '@a2ui/angular/v0_9';
import {a2uiBridge} from '../preview-bridge';
import {Catalog, ComponentApi, A2uiClientAction, A2uiMessage} from '@a2ui/web_core/v0_9';

if (!getTestBed().platform) {
  getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
}

describe('Angular Sandbox Connection Spec', () => {
  afterEach(() => {
    a2uiBridge.destroy();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('aligns catalogs inside A2UI_RENDERER_CONFIG with the resolved catalogId when onCatalogResolved is triggered', () => {
    const myCatalog = {
      id: 'https://default-catalog-id.json',
      components: new Map<string, ComponentApi>(),
    } as unknown as Catalog<ComponentApi>;

    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {
          subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
        },
      },
      processMessages: vi.fn(),
    };

    const mockRendererConfig = {
      catalogs: [myCatalog],
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: A2uiRendererService, useValue: mockRendererService},
        {provide: A2UI_RENDERER_CONFIG, useValue: mockRendererConfig},
      ],
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');

    const connection = TestBed.runInInjectionContext(() => new A2uiSandboxConnection());

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];
    expect(configPassed.onCatalogResolved).toBeDefined();

    // Trigger the callback
    configPassed.onCatalogResolved!('urn:a2ui:catalog:angular_resolved_id');

    expect(myCatalog.id).toBe('urn:a2ui:catalog:angular_resolved_id');

    connection.ngOnDestroy();
  });

  it('delegates processMessages payload to the underlying A2uiRendererService', () => {
    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      },
      processMessages: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: A2uiRendererService, useValue: mockRendererService},
        {provide: A2UI_RENDERER_CONFIG, useValue: {}},
      ],
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const connection = TestBed.runInInjectionContext(() => new A2uiSandboxConnection());

    const processor = attachSpy.mock.lastCall![0];
    const payload = [{version: 'v0.9'}] as unknown as A2uiMessage[];

    processor.processMessages(payload);

    expect(mockRendererService.processMessages).toHaveBeenCalledWith(payload);

    connection.ngOnDestroy();
  });

  it('updates surfaceId reactive signal when onSurfaceReady and onSurfaceCleared are invoked', () => {
    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      },
      processMessages: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: A2uiRendererService, useValue: mockRendererService},
        {provide: A2UI_RENDERER_CONFIG, useValue: {}},
      ],
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const connection = TestBed.runInInjectionContext(() => new A2uiSandboxConnection());

    const config = attachSpy.mock.lastCall![1];

    expect(connection.surfaceId()).toBe('');

    config.onSurfaceReady('surf-123');
    expect(connection.surfaceId()).toBe('surf-123');

    if (config.onSurfaceCleared) {
      config.onSurfaceCleared();
    }
    expect(connection.surfaceId()).toBe('');

    connection.ngOnDestroy();
  });

  it('acknowledges content after Angular renders the active surface', async () => {
    @Component({template: '{{connection.surfaceId()}}'})
    class TestHost {
      readonly connection = inject(A2uiSandboxConnection);
    }
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        {
          provide: A2uiRendererService,
          useValue: {
            surfaceGroup: {onSurfaceCreated: {subscribe: () => ({unsubscribe() {}})}},
            processMessages() {},
          },
        },
        {provide: A2UI_RENDERER_CONFIG, useValue: {}},
        {provide: A2uiSandboxConnection, useFactory: () => new A2uiSandboxConnection()},
      ],
    });
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const config = attachSpy.mock.lastCall![1];
    expect(config.onInitialRender).toBeDefined();
    config.onSurfaceReady('ready');
    const committed = vi.fn();
    const pending = config.onInitialRender!().then(committed);
    expect(committed).not.toHaveBeenCalled();
    await fixture.whenStable();
    await pending;
    expect(committed).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toBe('ready');
    fixture.destroy();
  });

  /** Renders a host for the connection, with the given markdown renderer. */
  function renderWithMarkdown(render: (markdown: string) => Promise<string>) {
    @Component({template: '{{connection.surfaceId()}}'})
    class TestHost {
      readonly connection = inject(A2uiSandboxConnection);
    }
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [
        {
          provide: A2uiRendererService,
          useValue: {
            surfaceGroup: {onSurfaceCreated: {subscribe: () => ({unsubscribe() {}})}},
            processMessages() {},
          },
        },
        {provide: A2UI_RENDERER_CONFIG, useValue: {}},
        {provide: MarkdownRenderer, useValue: {render}},
        {provide: A2uiSandboxConnection, useFactory: () => new A2uiSandboxConnection()},
      ],
    });
    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const config = attachSpy.mock.lastCall![1];
    config.onSurfaceReady('ready');
    return {fixture, config};
  }

  it('acknowledges content only once the markdown renderer has loaded', async () => {
    // The default renderer loads markdown-it lazily, and body text renders empty
    // until it has: content measured before then is missing its text.
    let finishLoading!: () => void;
    const loaded = new Promise<void>(resolve => (finishLoading = resolve));
    const {fixture, config} = renderWithMarkdown(async markdown => {
      await loaded;
      return markdown;
    });
    const committed = vi.fn();
    const pending = config.onInitialRender!().then(committed);
    await fixture.whenStable();
    // Let every pending render and microtask run: only the load can resolve it.
    for (let flush = 0; flush < 5; flush++) {
      await Promise.resolve();
      await fixture.whenStable();
    }
    expect(committed).not.toHaveBeenCalled();

    finishLoading();
    await fixture.whenStable();
    await pending;
    expect(committed).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('acknowledges content when the markdown renderer fails to load', async () => {
    const {fixture, config} = renderWithMarkdown(() => Promise.reject(new Error('offline')));
    const committed = vi.fn();
    const pending = config.onInitialRender!().then(committed);
    await fixture.whenStable();
    await pending;
    expect(committed).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('does not schedule afterNextRender if destroyed while the markdown renderer is loading', async () => {
    let finishLoading!: () => void;
    const loaded = new Promise<void>(resolve => (finishLoading = resolve));
    const {fixture, config} = renderWithMarkdown(async markdown => {
      await loaded;
      return markdown;
    });
    const connection = fixture.componentInstance.connection;
    const pending = config.onInitialRender!();
    connection.ngOnDestroy();
    fixture.destroy();

    finishLoading();
    await expect(pending).resolves.toBeUndefined();
    expect(connection['pendingContentRender']).toBeUndefined();
  });

  it('resolves a superseded onInitialRender promise and exits without awaiting further renders when cancelled by a newer call or ngOnDestroy', async () => {
    let renderCalls = 0;
    const {fixture, config} = renderWithMarkdown(async markdown => {
      renderCalls++;
      return markdown;
    });
    const connection = fixture.componentInstance.connection;

    let firstResolved = false;
    const firstPending = config.onInitialRender!().then(() => {
      firstResolved = true;
    });
    // Flush markdownLoaded() microtasks so firstPending is waiting inside the first afterNextRender.
    await Promise.resolve();
    await Promise.resolve();
    expect(connection['pendingContentRender']).toBeDefined();
    expect(firstResolved).toBe(false);
    expect(renderCalls).toBe(1);

    // A second onInitialRender() call supersedes the first: firstPending resolves immediately
    // and must exit without calling markdownLoaded() a second time.
    let secondResolved = false;
    const secondPending = config.onInitialRender!().then(() => {
      secondResolved = true;
    });
    await firstPending;
    expect(firstResolved).toBe(true);
    expect(secondResolved).toBe(false);
    // Only the initial markdownLoaded() from call #1 and the initial markdownLoaded() from call #2 ran.
    expect(renderCalls).toBe(2);

    // Destroying the connection while secondPending is waiting inside afterNextRender
    // must also resolve secondPending instead of leaving it hanging.
    connection.ngOnDestroy();
    await secondPending;
    expect(secondResolved).toBe(true);
    expect(connection['pendingContentRender']).toBeUndefined();
    fixture.destroy();
  });

  it('waits for markdown rendering started during the first render pass and a second afterNextRender pass before resolving onInitialRender', async () => {
    let finishFirstPassMarkdown!: () => void;
    const firstPassMarkdownLoaded = new Promise<void>(resolve => {
      finishFirstPassMarkdown = resolve;
    });
    let firstPassStarted = false;
    const {fixture, config} = renderWithMarkdown(async markdown => {
      if (firstPassStarted) {
        await firstPassMarkdownLoaded;
      }
      return markdown;
    });
    const connection = fixture.componentInstance.connection;
    const waitSpy = vi.spyOn(
      connection as unknown as {waitForNextRender: () => Promise<void>},
      'waitForNextRender',
    );

    const committed = vi.fn();
    const pending = config.onInitialRender!().then(committed);

    // Flush the initial markdownLoaded() check before the first render pass completes;
    // during the first render pass a Text component starts an async markdown render.
    await Promise.resolve();
    await Promise.resolve();
    expect(waitSpy).toHaveBeenCalledTimes(1);
    firstPassStarted = true;

    await fixture.whenStable();
    for (let flush = 0; flush < 5; flush++) {
      await Promise.resolve();
    }
    expect(committed).not.toHaveBeenCalled();

    // Resolving the async markdown promise allows the second markdownLoaded() to finish,
    // which must then schedule a second waitForNextRender() pass so Angular flushes
    // [innerHTML]="resolvedText()" to the DOM before onInitialRender resolves.
    finishFirstPassMarkdown();
    for (let flush = 0; flush < 5; flush++) {
      await Promise.resolve();
    }
    expect(waitSpy).toHaveBeenCalledTimes(2);
    expect(committed).not.toHaveBeenCalled();
    await fixture.whenStable();
    await pending;
    expect(committed).toHaveBeenCalledOnce();
    fixture.destroy();
  });

  it('configures standalone DI providers via provideA2uiSandbox and routes actions to a2uiBridge.sendAction', () => {
    class MockCatalog {}
    const mockCatalogInstance = new MockCatalog();

    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      },
      processMessages: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideA2uiSandbox([MockCatalog as unknown as Type<Catalog<ComponentApi>>], {
          catalogJson: {key: 'val'},
        }),
        {provide: MockCatalog, useValue: mockCatalogInstance},
        {provide: A2uiRendererService, useValue: mockRendererService},
      ],
    });

    // 1. Verify A2uiSandboxConnection factory
    const connInstance = TestBed.inject(A2uiSandboxConnection);
    expect(connInstance).toBeInstanceOf(A2uiSandboxConnection);

    // 2. Verify A2UI_RENDERER_CONFIG factory and actionHandler
    const config = TestBed.inject(A2UI_RENDERER_CONFIG);

    expect(config.catalogs).toEqual([mockCatalogInstance]);

    const sendActionSpy = vi.spyOn(a2uiBridge, 'sendAction');
    const dummyAction: A2uiClientAction = {
      name: 'testAction',
      surfaceId: 'surf-1',
      sourceComponentId: 'comp-1',
      timestamp: '2026-06-09T00:00:00Z',
      context: {},
    };
    config.actionHandler!(dummyAction);
    expect(sendActionSpy).toHaveBeenCalledWith(dummyAction);

    connInstance.ngOnDestroy();
  });

  it('passes onThemeChange option through sandbox configuration to attachRenderer', () => {
    const onThemeChange = vi.fn();
    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      },
      processMessages: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideA2uiSandbox([], {onThemeChange}),
        {provide: A2uiRendererService, useValue: mockRendererService},
      ],
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const connInstance = TestBed.inject(A2uiSandboxConnection);

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];
    expect(configPassed.onThemeChange).toBe(onThemeChange);

    connInstance.ngOnDestroy();
  });

  it('passes getDemos option through sandbox configuration to attachRenderer', () => {
    const getDemos = async () => [
      {id: 'demo-a', name: 'Demo A', description: 'First demo.', a2ui: []},
    ];
    const mockRendererService = {
      surfaceGroup: {
        onSurfaceCreated: {subscribe: vi.fn().mockReturnValue({unsubscribe: vi.fn()})},
      },
      processMessages: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideA2uiSandbox([], {getDemos}),
        {provide: A2uiRendererService, useValue: mockRendererService},
      ],
    });

    const attachSpy = vi.spyOn(a2uiBridge, 'attachRenderer');
    const connInstance = TestBed.inject(A2uiSandboxConnection);

    expect(attachSpy).toHaveBeenCalled();
    const configPassed = attachSpy.mock.lastCall![1];
    expect(configPassed.getDemos).toBe(getDemos);

    connInstance.ngOnDestroy();
  });
});
