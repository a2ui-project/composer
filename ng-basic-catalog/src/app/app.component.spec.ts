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
    registerMessageProcessor: vi.fn(),
    unregisterMessageProcessor: vi.fn(),
    sendMessage: vi.fn(),
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

  it('registers RENDER_A2UI message processor upon construction', () => {
    expect(a2uiBridge.registerMessageProcessor).toHaveBeenCalledWith(
      'RENDER_A2UI',
      expect.any(Function),
    );
  });

  it('unregisters RENDER_A2UI message processor upon ngOnDestroy', () => {
    fixture.destroy();
    expect(a2uiBridge.unregisterMessageProcessor).toHaveBeenCalledWith(
      'RENDER_A2UI',
      expect.any(Function),
    );
  });

  it('processes RENDER_A2UI array payload and sets isInitialized to true', () => {
    const registerCall = (a2uiBridge.registerMessageProcessor as any).mock.calls[0];
    const handler = registerCall[1];
    handler([{type: 'SURFACE', id: 'sample-surface'}]);
    expect(component.isInitialized()).toBe(true);
  });

  it('logs warning on non-array RENDER_A2UI payload', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const registerCall = (a2uiBridge.registerMessageProcessor as any).mock.calls[0];
    const handler = registerCall[1];
    handler({type: 'UNEXPECTED'});
    expect(warnSpy).toHaveBeenCalledWith('Unexpected non-array RENDER_A2UI payload received:', {
      type: 'UNEXPECTED',
    });
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
    expect(a2uiBridge.sendMessage).toHaveBeenCalledWith({
      type: 'SEND_TO_SERVER',
      payload: {version: 'v0.9', action: dummyAction},
    });
  });
});
