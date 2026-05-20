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
import {AppComponent} from './app.component';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {a2uiBridge} from 'a2ui-bridge';
import {A2UI_RENDERER_CONFIG} from '@a2ui/angular/v0_9';

vi.mock('a2ui-bridge', () => ({
  a2uiBridge: {
    attachRenderer: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
    sendMessage: vi.fn(),
    sendAction: vi.fn(),
  },
}));

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates the sample application host component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('attaches renderer upon construction', () => {
    expect(a2uiBridge.attachRenderer).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        surfaceGroup: expect.anything(),
        onSurfaceReady: expect.any(Function),
        onSurfaceCleared: expect.any(Function),
      }),
    );
  });

  it('unsubscribes renderer upon ngOnDestroy', () => {
    const mockUnsubscribe = vi.mocked(a2uiBridge.attachRenderer).mock.results[0].value.unsubscribe;
    fixture.destroy();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('sets isInitialized to true and surfaceId when onSurfaceReady is called', () => {
    const attachCall = vi.mocked(a2uiBridge.attachRenderer).mock.calls[0];
    const {onSurfaceReady} = attachCall[1];

    // Check initial state
    expect(
      (
        component as unknown as {isInitialized: () => boolean; surfaceId: () => string}
      ).isInitialized(),
    ).toBe(false);

    onSurfaceReady('test-surface-id');

    expect(
      (
        component as unknown as {isInitialized: () => boolean; surfaceId: () => string}
      ).isInitialized(),
    ).toBe(true);
    expect(
      (component as unknown as {isInitialized: () => boolean; surfaceId: () => string}).surfaceId(),
    ).toBe('test-surface-id');
  });

  it('resets initialization state when onSurfaceCleared is called', () => {
    const attachCall = vi.mocked(a2uiBridge.attachRenderer).mock.calls[0];
    const {onSurfaceReady, onSurfaceCleared} = attachCall[1];

    onSurfaceReady('test-surface-id');
    expect(
      (
        component as unknown as {isInitialized: () => boolean; surfaceId: () => string}
      ).isInitialized(),
    ).toBe(true);

    onSurfaceCleared?.();

    expect(
      (
        component as unknown as {isInitialized: () => boolean; surfaceId: () => string}
      ).isInitialized(),
    ).toBe(false);
    expect(
      (component as unknown as {isInitialized: () => boolean; surfaceId: () => string}).surfaceId(),
    ).toBe('');
  });

  it('dispatches actions wrapped in version v0.9 envelope to SEND_TO_SERVER', () => {
    const config = fixture.debugElement.injector.get(A2UI_RENDERER_CONFIG);
    const dummyAction = {
      name: 'CLICK',
      surfaceId: 'surface-1',
      sourceComponentId: 'button-1',
      timestamp: '2026-05-15T00:00:00Z',
      context: {},
    };
    if (config.actionHandler) {
      config.actionHandler(dummyAction);
    }
    expect(a2uiBridge.sendAction).toHaveBeenCalledWith(dummyAction);
  });
});
