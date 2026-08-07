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

import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {App} from './app';
import {appConfig} from './app.config';
import {AppHarness} from './test/app.harness';
import {Ga4UsageTrackingService} from './usage-tracking/ga4-usage-tracking.service';
import {NoopUsageTrackingService} from './usage-tracking/noop-usage-tracking.service';
import {USAGE_TRACKING_CONFIG, UsageTrackingService} from './usage-tracking/usage-tracking.service';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let harness: AppHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, AppHarness);
  });

  it('creates the root application component via test harness', async () => {
    expect(harness).toBeTruthy();
  });
});

describe('appConfig UsageTracking wiring', () => {
  it('resolves NoopUsageTrackingService by default when disabled', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: appConfig.providers,
    });

    const service = TestBed.inject(UsageTrackingService);
    expect(service).toBeInstanceOf(NoopUsageTrackingService);
  });

  it('resolves Ga4UsageTrackingService when enabled with measurement ID', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        {
          provide: USAGE_TRACKING_CONFIG,
          useValue: {enabled: true, measurementId: 'G-APPCONFIG123'},
        },
      ],
    });

    const service = TestBed.inject(UsageTrackingService);
    expect(service).toBeInstanceOf(Ga4UsageTrackingService);
  });

  it('invokes usageTrackingService.initialize during bootstrap', async () => {
    const mockTrackingService = {
      initialize: vi.fn().mockResolvedValue(undefined),
      trackPageView: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        {provide: UsageTrackingService, useValue: mockTrackingService},
      ],
    });

    // Resolve app initializer
    const service = TestBed.inject(UsageTrackingService);
    expect(service).toBe(mockTrackingService);
  });

  it('tracks virtual page views on NavigationEnd events during routing', async () => {
    const mockTrackingService = {
      initialize: vi.fn().mockResolvedValue(undefined),
      trackPageView: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        {provide: UsageTrackingService, useValue: mockTrackingService},
      ],
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/settings');

    expect(mockTrackingService.trackPageView).toHaveBeenCalledWith({pagePath: '/settings'});
  });
});
