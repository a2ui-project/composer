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

// @vitest-environment jsdom
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {AppComponent} from './app/app.component';
import {A2uiSandboxManager, provideA2uiSandbox} from 'a2ui-bridge/angular';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {A2uiRendererService, A2UI_RENDERER_CONFIG, BasicCatalog} from '@a2ui/angular/v0_9';
import {a2uiBridge} from 'a2ui-bridge';
import {A2uiClientAction} from '@a2ui/web_core/v0_9';
import {provideZonelessChangeDetection, Injector} from '@angular/core';

// Mocks core bridge singleton variables for clean telemetry spy verification
vi.mock('a2ui-bridge', () => ({
  a2uiBridge: {
    attachRenderer: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
    sendMessage: vi.fn(),
    sendAction: vi.fn(),
  },
}));

describe('A2uiSandbox', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let sandbox: A2uiSandboxManager;

  beforeEach(async () => {
    vi.restoreAllMocks();

    // Injects dynamic host element to JSDOM body to prevent bootloader selector crashes
    const host = document.createElement('app-root');
    document.body.appendChild(host);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideA2uiSandbox([BasicCatalog]), // Injects dynamically linked dynamic manager
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sandbox = fixture.debugElement.injector.get(A2uiSandboxManager);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.querySelector('app-root')?.remove();
  });

  it('creates the sandbox component successfully', () => {
    expect(component).toBeTruthy();
    expect(sandbox).toBeTruthy();
  });

  it('attaches renderer upon service/manager construction', () => {
    expect(a2uiBridge.attachRenderer).toHaveBeenCalledWith(
      expect.any(Object), // resolves to dynamic rendererService
      expect.objectContaining({
        surfaceGroup: expect.any(Object),
        onSurfaceReady: expect.any(Function),
        onSurfaceCleared: expect.any(Function),
      }),
    );
  });

  it('unsubscribes and detaches renderer upon ngOnDestroy', () => {
    const mockUnsubscribe = vi.mocked(a2uiBridge.attachRenderer).mock.results[0].value.unsubscribe;
    fixture.destroy();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('sets isInitialized to true and surfaceId signal when onSurfaceReady is called', () => {
    const attachCall = vi.mocked(a2uiBridge.attachRenderer).mock.calls[0];
    const {onSurfaceReady} = attachCall[1];

    // Check initial signal states
    expect(sandbox.isInitialized()).toBe(false);
    expect(sandbox.surfaceId()).toBe('');

    onSurfaceReady('test-surface-angular-id');

    expect(sandbox.isInitialized()).toBe(true);
    expect(sandbox.surfaceId()).toBe('test-surface-angular-id');
  });

  it('resets initialization state when onSurfaceCleared is called', () => {
    const attachCall = vi.mocked(a2uiBridge.attachRenderer).mock.calls[0];
    const {onSurfaceReady, onSurfaceCleared} = attachCall[1];

    onSurfaceReady('test-surface-angular-id');
    expect(sandbox.isInitialized()).toBe(true);

    onSurfaceCleared?.();

    expect(sandbox.isInitialized()).toBe(false);
    expect(sandbox.surfaceId()).toBe('');
  });

  it('dispatches actions wrapped in version v0.9 envelope to SEND_TO_SERVER', () => {
    const config = TestBed.inject(A2UI_RENDERER_CONFIG);
    const dummyAction: A2uiClientAction = {
      name: 'CLICK',
      surfaceId: 'surface-1',
      sourceComponentId: 'button-1',
      timestamp: '2026-05-15T00:00:00Z',
      context: {},
    };

    config.actionHandler?.(dummyAction);
    expect(a2uiBridge.sendAction).toHaveBeenCalledWith(dummyAction);
  });

  it('provides and registers correct DI providers list', () => {
    const injector = Injector.create({
      providers: [provideA2uiSandbox([BasicCatalog])],
    });

    expect(injector.get(A2uiRendererService)).toBeDefined();
    expect(injector.get(A2uiSandboxManager)).toBeDefined();
    expect(injector.get(BasicCatalog)).toBeDefined();
    expect(injector.get(A2UI_RENDERER_CONFIG)).toBeDefined();
  });
});
