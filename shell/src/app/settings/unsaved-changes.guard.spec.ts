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
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {unsavedChangesGuard} from './unsaved-changes.guard';
import {Settings} from './settings-view/settings';

describe('unsavedChangesGuard', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function runGuard(component: Settings) {
    return TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(
        component,
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
  }

  it('returns true when hasUnsavedChanges() returns false', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const mockComponent = {
      hasUnsavedChanges: () => false,
    } as unknown as Settings;

    const result = runGuard(mockComponent);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('opens confirmation dialog and returns true when hasUnsavedChanges() returns true and user confirms leaving', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const mockComponent = {
      hasUnsavedChanges: () => true,
    } as unknown as Settings;

    const result = runGuard(mockComponent);

    expect(confirmSpy).toHaveBeenCalledWith(
      'You have unsaved changes. Do you really want to leave?',
    );
    expect(result).toBe(true);
  });

  it('opens confirmation dialog and returns false when hasUnsavedChanges() returns true and user cancels leaving', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const mockComponent = {
      hasUnsavedChanges: () => true,
    } as unknown as Settings;

    const result = runGuard(mockComponent);

    expect(confirmSpy).toHaveBeenCalledWith(
      'You have unsaved changes. Do you really want to leave?',
    );
    expect(result).toBe(false);
  });

  it('returns true when hasUnsavedChanges() returns false even if settingsForm.dirty is true', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const mockComponent = {
      hasUnsavedChanges: () => false,
      settingsForm: {
        dirty: true,
      },
    } as unknown as Settings;

    const result = runGuard(mockComponent);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('returns true when component is undefined or null', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');

    expect(runGuard(undefined as unknown as Settings)).toBe(true);
    expect(runGuard(null as unknown as Settings)).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('returns true when component does not implement hasUnsavedChanges', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const mockComponent = {} as unknown as Settings;

    const result = runGuard(mockComponent);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
