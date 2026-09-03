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
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {signal} from '@angular/core';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {EMPTY, ReplaySubject} from 'rxjs';
import {type Demo} from 'a2ui-bridge';
import {Demos} from './demos';
import {DemosHarness} from './test/demos.harness';
import {DemosCatalog} from './services/demos-catalog';
import {HostCommunication} from '../shell/host-communication/host-communication';
import {StartupResolution} from '../shell/startup-resolution/startup-resolution';
import {
  AppConfigProvider,
  ThemePreference,
} from '../settings/app-config-provider/app-config-provider';
import {ChatState} from '../chat/chat-state/chat-state';

/** Largest number of live renderer frames the wall is allowed to keep mounted. */
const MAX_MOUNTED_CARDS = 6;

class MockDemosCatalog {
  readonly demos = signal<Demo[] | null>(null);
  readonly loadingDemos = signal(false);
  setDemosActive = vi.fn();
  setCoordinator = vi.fn();
}

class MockHostCommunication {
  sendRenderA2UI = vi.fn();
  sendToFrame = vi.fn();
  registerIframe = vi.fn();
  unregisterIframe = vi.fn();
  registerSecondaryIframe = vi.fn();
  unregisterSecondaryIframe = vi.fn();
  sendTheme = vi.fn();
  messageStreamFor = vi.fn(() => EMPTY);
  readonly messageStream$ = new ReplaySubject<unknown>(1);
  readonly messageStream = signal(null);
}

class MockStartupResolution {
  readonly resolvedUrl = signal<string | null>('http://localhost:3000/renderer');
  getResolvedRendererUrl = vi.fn(() => 'http://localhost:3000/renderer');
}

class MockChatState {
  readonly isProgrammaticStreamActive = signal<boolean>(false);
}

/**
 * Builds a deterministic list of demos.
 * @param count How many demos to synthesize.
 * @return A list of demos with stable ids.
 */
function makeDemos(count: number): Demo[] {
  return Array.from({length: count}, (_unused, index) => ({
    id: `demo-${index}`,
    name: `Demo ${index}`,
    description: `Description ${index}`,
    a2ui: [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId: `surface-${index}`,
          catalogId: 'https://a2ui.org/default_catalog.json',
        },
      },
    ],
  }));
}

describe('Demos Component', () => {
  let fixture: ComponentFixture<Demos>;
  let harness: DemosHarness;
  let demosCatalogMock: MockDemosCatalog;

  /**
   * Lets the IntersectionObserver stub installed by `test-setup.ts` deliver its
   * asynchronously queued entries, then flushes the resulting render.
   */
  async function flushIntersections(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demos],
      providers: [
        provideNoopAnimations(),
        {provide: DemosCatalog, useClass: MockDemosCatalog},
        {provide: HostCommunication, useClass: MockHostCommunication},
        {provide: StartupResolution, useClass: MockStartupResolution},
        {provide: AppConfigProvider, useValue: {themePreference: signal(ThemePreference.LIGHT)}},
        {provide: ChatState, useClass: MockChatState},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Demos);
    fixture.detectChanges();
    await fixture.whenStable();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, DemosHarness);

    demosCatalogMock = TestBed.inject(DemosCatalog) as unknown as MockDemosCatalog;
  });

  it('mounts a hidden coordinator frame unconditionally', async () => {
    expect(demosCatalogMock.demos()).toBeNull();

    expect(await harness.hasCoordinatorFrame()).toBe(true);
  });

  it('registers the coordinator frame iframe element with the demos service', async () => {
    const coordinatorIframe = (fixture.nativeElement as HTMLElement).querySelector(
      '.coordinator-frame iframe',
    );

    expect(coordinatorIframe).not.toBeNull();
    expect(demosCatalogMock.setCoordinator).toHaveBeenCalledWith(coordinatorIframe);
  });

  it('activates demos on init and deactivates them when the route is destroyed', () => {
    expect(demosCatalogMock.setDemosActive).toHaveBeenCalledWith(true);

    fixture.destroy();

    expect(demosCatalogMock.setDemosActive).toHaveBeenLastCalledWith(false);
  });

  it('renders one demo card per demo returned by the renderer', async () => {
    demosCatalogMock.demos.set(makeDemos(2));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getCardCount()).toBe(2);
  });

  it('shows the empty state when the renderer answers with no demos', async () => {
    demosCatalogMock.demos.set([]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(await harness.getCardCount()).toBe(0);
    expect(await harness.getEmptyStateSubtitleText()).toContain("doesn't provide demos yet");
  });

  it('mounts at most six demo cards at once', async () => {
    demosCatalogMock.demos.set(makeDemos(12));
    fixture.detectChanges();
    await fixture.whenStable();
    await flushIntersections();

    expect(await harness.getCardCount()).toBe(12);
    expect(fixture.componentInstance.mountedCount()).toBeGreaterThan(0);
    expect(fixture.componentInstance.mountedCount()).toBeLessThanOrEqual(MAX_MOUNTED_CARDS);
    const mountedFrames = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.demos-wall iframe',
    );
    expect(mountedFrames.length).toBeLessThanOrEqual(MAX_MOUNTED_CARDS);
  });
});
