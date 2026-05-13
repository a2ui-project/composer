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
import {ComposerShellComponent} from './composer-shell.component';
import {provideRouter} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComposerShellHarness} from './test/composer-shell.harness';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {DOCUMENT} from '@angular/common';

describe('ComposerShellComponent Layout', () => {
  let fixture: ComponentFixture<ComposerShellComponent>;
  let harness: ComposerShellHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposerShellComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerShellComponent);
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComposerShellHarness);
  });

  afterEach(() => {
    const injectedDocument = TestBed.inject(DOCUMENT);
    injectedDocument.body.classList.remove('dark-theme');
  });

  it('creates the shell layout component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('displays the static header title A2UI Composer via test harness inspection', async () => {
    expect(await harness.getHeaderTitleText()).toContain('A2UI Composer');
  });

  it('flushes session cache upon clicking New Session reset button via test harness interaction', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    await harness.clickResetButton();
    expect(consoleSpy).toHaveBeenCalledWith('Session state cleared.');
  });

  it('toggles the dark theme SCSS class on the document body upon clicking the theme toggle button via test harness interaction', async () => {
    const injectedDocument = TestBed.inject(DOCUMENT);
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(false);
    await harness.clickThemeToggleButton();
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(true);
    await harness.clickThemeToggleButton();
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(false);
  });

  it('toggles the left sidebar opened and closed states upon clicking the hamburger button via test harness interaction', async () => {
    expect(await harness.isSidenavOpened()).toBe(true);
    await harness.clickHamburgerButton();
    expect(await harness.isSidenavOpened()).toBe(false);
    await harness.clickHamburgerButton();
    expect(await harness.isSidenavOpened()).toBe(true);
  });
});
