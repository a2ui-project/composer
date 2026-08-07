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

import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {
  DEFAULT_USAGE_TRACKING_CONFIG,
  USAGE_TRACKING_CONFIG,
  UsageTrackingConfig,
} from './usage-tracking.service';

describe('USAGE_TRACKING_CONFIG', () => {
  it('provides default configuration with telemetry disabled', () => {
    const config = TestBed.inject(USAGE_TRACKING_CONFIG);
    expect(config).toEqual(DEFAULT_USAGE_TRACKING_CONFIG);
    expect(config.enabled).toBe(false);
    expect(config.measurementId).toBe('');
  });

  it('allows overriding configuration via dependency injection provider', () => {
    const customConfig: UsageTrackingConfig = {
      enabled: true,
      measurementId: 'G-TEST123456',
    };

    TestBed.configureTestingModule({
      providers: [{provide: USAGE_TRACKING_CONFIG, useValue: customConfig}],
    });

    const config = TestBed.inject(USAGE_TRACKING_CONFIG);
    expect(config).toEqual(customConfig);
    expect(config.enabled).toBe(true);
    expect(config.measurementId).toBe('G-TEST123456');
  });
});
