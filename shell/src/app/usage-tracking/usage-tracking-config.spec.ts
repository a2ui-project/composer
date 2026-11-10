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

import {describe, expect, it} from 'vitest';
import {
  AUTOMATED_UA_REGEX,
  NOTRACK_QUERY_PARAM,
  isAutomatedBrowserEnvironment,
  resolveUsageTrackingConfig,
} from './usage-tracking-config';
import type {UsageTrackingConfig} from './usage-tracking.service';

describe('isAutomatedBrowserEnvironment', () => {
  it('returns false without throwing for null, undefined, or partial Window mocks', () => {
    expect(isAutomatedBrowserEnvironment(null)).toBe(false);
    expect(isAutomatedBrowserEnvironment(undefined)).toBe(false);
    expect(isAutomatedBrowserEnvironment({} as Window)).toBe(false);
    expect(
      isAutomatedBrowserEnvironment({
        navigator: {} as Navigator,
        location: {} as Location,
      } as Window),
    ).toBe(false);
  });

  it('returns true when navigator.webdriver is strictly true', () => {
    const webdriverWin = {
      navigator: {
        webdriver: true,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0.0.0',
      },
      location: {search: ''},
    } as unknown as Window;

    expect(isAutomatedBrowserEnvironment(webdriverWin)).toBe(true);
  });

  it('returns true for headless and automated browser userAgent tokens', () => {
    expect(AUTOMATED_UA_REGEX.source).toBe(
      'HeadlessChrome|PhantomJS|Playwright|Puppeteer|Lighthouse',
    );
    const automatedAgents = [
      'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/538.1 PhantomJS/2.1.1',
      'Mozilla/5.0 Playwright/1.50.0',
      'Mozilla/5.0 Puppeteer/22.0.0',
      'Mozilla/5.0 Chrome-Lighthouse',
    ];

    for (const userAgent of automatedAgents) {
      const mockWin = {
        navigator: {webdriver: false, userAgent},
        location: {search: ''},
      } as unknown as Window;
      expect(isAutomatedBrowserEnvironment(mockWin)).toBe(true);
    }
  });

  it('returns true when ?notrack=1 query parameter is present and false otherwise', () => {
    expect(NOTRACK_QUERY_PARAM).toBe('notrack');

    const optedOutWin = {
      navigator: {webdriver: false, userAgent: 'Mozilla/5.0 Chrome/131.0.0.0'},
      location: {search: '?foo=bar&notrack=1'},
    } as unknown as Window;
    expect(isAutomatedBrowserEnvironment(optedOutWin)).toBe(true);

    for (const search of ['', '?notrack=0', '?notrack=true', '?other=1']) {
      const normalWin = {
        navigator: {webdriver: false, userAgent: 'Mozilla/5.0 Chrome/131.0.0.0'},
        location: {search},
      } as unknown as Window;
      expect(isAutomatedBrowserEnvironment(normalWin)).toBe(false);
    }
  });
});

describe('resolveUsageTrackingConfig', () => {
  const enabledBaseConfig: UsageTrackingConfig = {
    enabled: true,
    measurementId: 'G-PROD123456',
  };

  const humanWindow = {
    navigator: {
      webdriver: false,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/131.0.0.0 Safari/537.36',
    },
    location: {search: ''},
  } as unknown as Window;

  const automatedWindow = {
    navigator: {
      webdriver: true,
      userAgent: 'Mozilla/5.0 HeadlessChrome/131.0.0.0',
    },
    location: {search: ''},
  } as unknown as Window;

  it('returns disabled or empty-measurementId configs unchanged', () => {
    const disabledConfig: UsageTrackingConfig = {enabled: false, measurementId: 'G-PROD123456'};
    const emptyIdConfig: UsageTrackingConfig = {enabled: true, measurementId: ''};

    expect(resolveUsageTrackingConfig(disabledConfig, humanWindow)).toBe(disabledConfig);
    expect(resolveUsageTrackingConfig(emptyIdConfig, humanWindow)).toBe(emptyIdConfig);
  });

  it('preserves enabled: true for non-automated browser sessions', () => {
    expect(resolveUsageTrackingConfig(enabledBaseConfig, humanWindow)).toEqual({
      enabled: true,
      measurementId: 'G-PROD123456',
    });
  });

  it('disables tracking when automated browser signals or ?notrack=1 are detected', () => {
    expect(resolveUsageTrackingConfig(enabledBaseConfig, automatedWindow)).toEqual({
      enabled: false,
      measurementId: 'G-PROD123456',
    });

    const notrackWin = {
      navigator: {webdriver: false, userAgent: 'Mozilla/5.0 Chrome/131.0.0.0'},
      location: {search: '?notrack=1'},
    } as unknown as Window;
    expect(resolveUsageTrackingConfig(enabledBaseConfig, notrackWin)).toEqual({
      enabled: false,
      measurementId: 'G-PROD123456',
    });
  });

  it('ignores arbitrary window globals so page scripts cannot enable or redirect tracking', () => {
    const defaultDisabled: UsageTrackingConfig = {enabled: false, measurementId: ''};
    const pollutedWin = {
      navigator: {webdriver: false, userAgent: 'Mozilla/5.0 Chrome/131.0.0.0'},
      location: {search: ''},
      ['__A2UI_TEST_USAGE_TRACKING_CONFIG__']: {enabled: true, measurementId: 'G-INJECTED'},
    } as unknown as Window;

    expect(resolveUsageTrackingConfig(defaultDisabled, pollutedWin)).toBe(defaultDisabled);
  });
});
