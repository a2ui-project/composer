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
import {AppComponent} from './app.component';
import {A2uiSandboxConnection, provideA2uiSandbox} from 'a2ui-bridge/angular';
import {BasicCatalog} from '@a2ui/angular/v0_9';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideZonelessChangeDetection, WritableSignal} from '@angular/core';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {AppComponentHarness} from './test/app.component.harness';

vi.mock('a2ui-bridge', () => ({
  a2uiBridge: {
    attachRenderer: vi.fn().mockReturnValue({unsubscribe: vi.fn()}),
    sendMessage: vi.fn(),
    sendAction: vi.fn(),
  },
  ERROR_OVERLAY_DEBOUNCE_MS: 350,
}));

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let sandbox: A2uiSandboxConnection;
  let harness: AppComponentHarness;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.restoreAllMocks();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideA2uiSandbox([BasicCatalog]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sandbox = fixture.debugElement.injector.get(A2uiSandboxConnection);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppComponentHarness);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    fixture.destroy();
  });

  it('creates the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('renders waiting placeholder initially when surfaceId is empty and no error exists', async () => {
    expect(await harness.hasWaitingPlaceholder()).toBe(true);
    expect(await harness.hasErrorOverlay()).toBe(false);
    expect(await harness.hasSurface()).toBe(false);
  });

  it('renders surface and hides waiting placeholder when surfaceId is present', async () => {
    (sandbox.surfaceId as WritableSignal<string>).set('surface-123');
    fixture.detectChanges();

    expect(await harness.hasSurface()).toBe(true);
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
    expect(await harness.hasErrorOverlay()).toBe(false);
  });

  it('renders error overlay and hides waiting placeholder when error is debounced', async () => {
    (sandbox.error as WritableSignal<Error | null>).set(new Error('Syntax validation failed'));
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(false);

    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(true);
    expect(await harness.getErrorText()).toContain('Syntax validation failed');
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
  });

  it('renders surface and error overlay simultaneously when surfaceId is present and error occurs', async () => {
    (sandbox.surfaceId as WritableSignal<string>).set('surface-456');
    (sandbox.error as WritableSignal<Error | null>).set(new Error('Runtime component failure'));
    fixture.detectChanges();

    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(await harness.hasSurface()).toBe(true);
    expect(await harness.hasErrorOverlay()).toBe(true);
    expect(await harness.getErrorText()).toContain('Runtime component failure');
    expect(await harness.hasWaitingPlaceholder()).toBe(false);
  });

  it('restores waiting placeholder when error is cleared and surfaceId is absent', async () => {
    (sandbox.error as WritableSignal<Error | null>).set(new Error('Temporary issue'));
    fixture.detectChanges();
    vi.advanceTimersByTime(350);
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(true);

    (sandbox.error as WritableSignal<Error | null>).set(null);
    fixture.detectChanges();

    expect(await harness.hasErrorOverlay()).toBe(false);
    expect(await harness.hasWaitingPlaceholder()).toBe(true);
  });
});
