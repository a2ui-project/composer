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
import {Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {startupGuard} from './startup-guard';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('Startup Guard Task 2.6', () => {
  let mockStartupResolution: {
    isEnvironmentValid: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {createUrlTree: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    TestBed.resetTestingModule();
    mockStartupResolution = {
      isEnvironmentValid: vi.fn().mockReturnValue(true),
    };
    mockRouter = {createUrlTree: vi.fn().mockReturnValue('UrlTree')};

    TestBed.configureTestingModule({
      providers: [
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: Router, useValue: mockRouter},
      ],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      startupGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('allows activation when the environment evaluates as valid', async () => {
    expect(await runGuard()).toBe(true);
  });

  it('redirects to settings view when the environment evaluates as invalid', async () => {
    mockStartupResolution.isEnvironmentValid.mockReturnValue(false);
    expect(await runGuard()).toBe('UrlTree');
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/settings']);
  });
});
