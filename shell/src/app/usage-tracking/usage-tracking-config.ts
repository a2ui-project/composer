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

import type {UsageTrackingConfig} from './usage-tracking.service';

/**
 * User-Agent pattern matching headless and automated browser runners (such as
 * HeadlessChrome, Playwright, Puppeteer, PhantomJS, and Lighthouse) so automated
 * screenshot or health-check scripts do not inflate GA4 user counts.
 *
 * Some drivers (for example, internal screenshot tooling) replace the User-Agent
 * with a standard desktop Chrome string, so this pattern cannot catch them. Those
 * are detected through `navigator.webdriver` instead, or can pass `?notrack=1`.
 */
export const AUTOMATED_UA_REGEX = /HeadlessChrome|PhantomJS|Playwright|Puppeteer|Lighthouse/i;

/**
 * URL query parameter (`?notrack=1`) allowing non-WebDriver scripts or embeds
 * to explicitly opt out of GA4 usage tracking.
 */
export const NOTRACK_QUERY_PARAM = 'notrack';

/**
 * Returns `true` when `win` exhibits browser-automation signals (`navigator.webdriver`,
 * headless/automation `navigator.userAgent` tokens, or `?notrack=1` in `location.search`).
 *
 * Uses defensive optional chaining throughout so partial `Window` mocks in unit tests
 * never throw runtime `TypeError`s.
 */
export function isAutomatedBrowserEnvironment(win?: Window | null): boolean {
  if (!win) {
    return false;
  }

  if (win.navigator?.webdriver === true) {
    return true;
  }

  const userAgent = win.navigator?.userAgent;
  if (typeof userAgent === 'string' && AUTOMATED_UA_REGEX.test(userAgent)) {
    return true;
  }

  const search = win.location?.search;
  if (typeof search === 'string' && search.length > 0) {
    try {
      if (new URLSearchParams(search).get(NOTRACK_QUERY_PARAM) === '1') {
        return true;
      }
    } catch {
      // Ignore malformed query strings.
    }
  }

  return false;
}

/**
 * Resolves the effective `UsageTrackingConfig` for the default `USAGE_TRACKING_CONFIG`
 * injection token factory, disabling telemetry when running inside an automated/headless
 * browser. Tests that need tracking enabled provide `USAGE_TRACKING_CONFIG` directly.
 */
export function resolveUsageTrackingConfig(
  baseConfig: UsageTrackingConfig,
  win?: Window | null,
): UsageTrackingConfig {
  if (!baseConfig.enabled || !baseConfig.measurementId) {
    return baseConfig;
  }

  const targetWin = win !== undefined ? win : typeof window !== 'undefined' ? window : null;
  if (isAutomatedBrowserEnvironment(targetWin)) {
    return {
      ...baseConfig,
      enabled: false,
    };
  }

  return baseConfig;
}
