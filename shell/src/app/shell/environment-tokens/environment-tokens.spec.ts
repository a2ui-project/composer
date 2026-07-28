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
import {describe, it, expect, beforeEach} from 'vitest';
import {CONFIG_URL, IS_1P_AUTH_ENABLED, IS_EXTENSION_MODE} from './environment-tokens';

describe('environment-tokens', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
  });

  it("provides default value 'config.json' for CONFIG_URL", () => {
    const configUrl = TestBed.inject(CONFIG_URL);
    expect(configUrl).toBe('config.json');
  });

  it('provides default signal(false) for IS_EXTENSION_MODE', () => {
    const isExtensionMode = TestBed.inject(IS_EXTENSION_MODE);
    expect(isExtensionMode()).toBe(false);
  });

  it('provides default false for IS_1P_AUTH_ENABLED', () => {
    const is1PAuthEnabled = TestBed.inject(IS_1P_AUTH_ENABLED);
    expect(is1PAuthEnabled).toBe(false);
  });
});
