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
import {Type} from '@angular/core';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {A2uiSandboxConnection, provideA2uiSandbox} from './angular-bridge';
import {A2UI_RENDERER_CONFIG, A2uiRendererService} from '@a2ui/angular/v0_9';
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
});
