/**
 * @license
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
import {IndexedDbStorageService} from '../storage/indexed-db-storage.service';
import {CatalogManagementService} from '../storage/catalog-management.service';
import {AppConfigProvider} from '../settings/app-config-provider';
import {signal, WritableSignal} from '@angular/core';
import {LocalStorageService} from '../settings/local-storage.service';
import {LocalStorageKey} from '../settings/local-storage-keys';

describe('ComposerShellComponent Layout', () => {
  let fixture: ComponentFixture<ComposerShellComponent>;
  let harness: ComposerShellHarness;
  let storageServiceMock: Partial<IndexedDbStorageService>;
  let localStorageServiceMock: Partial<LocalStorageService>;
  let catalogManagementServiceMock: {
    activeCatalogTitle: WritableSignal<string>;
    activeCatalogDescription: WritableSignal<string>;
  };
  let configProviderMock: {
    themePreference: WritableSignal<'light' | 'dark'>;
    setThemePreference: any;
  };

  beforeEach(async () => {
    storageServiceMock = {
      flushAllRecords: vi.fn().mockResolvedValue(undefined),
    };

    localStorageServiceMock = {
      removeItem: vi.fn(),
    };

    catalogManagementServiceMock = {
      activeCatalogTitle: signal(''),
      activeCatalogDescription: signal(''),
    };

    configProviderMock = {
      themePreference: signal('light'),
      setThemePreference: vi.fn((theme: 'light' | 'dark') => {
        configProviderMock.themePreference.set(theme);
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ComposerShellComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: IndexedDbStorageService,
          useValue: storageServiceMock,
        },
        {
          provide: LocalStorageService,
          useValue: localStorageServiceMock,
        },
        {
          provide: CatalogManagementService,
          useValue: catalogManagementServiceMock,
        },
        {
          provide: AppConfigProvider,
          useValue: configProviderMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerShellComponent);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComposerShellHarness);
  });

  afterEach(() => {
    const injectedDocument = TestBed.inject(DOCUMENT);
    injectedDocument.body.classList.remove('dark-theme');
  });

  it('creates the shell layout component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it(
    'displays the static header title A2UI Composer via test ' + 'harness inspection',
    async () => {
      expect(await harness.getHeaderTitleText()).toContain('A2UI Composer');
    },
  );

  it('dynamically updates the header title when ' + 'activeCatalogTitle mutates', async () => {
    catalogManagementServiceMock.activeCatalogTitle.set('Test Catalog');
    fixture.detectChanges();
    expect(await harness.getHeaderTitleText()).toBe('A2UI Composer - Test Catalog');
  });

  it('binds the activeCatalogDescription correctly as a tooltip', async () => {
    catalogManagementServiceMock.activeCatalogDescription.set('Sample description');
    fixture.detectChanges();
    expect(await harness.getHeaderTooltipText()).toBe('Sample description');
  });

  it(
    'flushes session cache upon clicking New Session reset button ' +
      'via test harness interaction',
    async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await harness.clickResetButton();
      expect(storageServiceMock.flushAllRecords).toHaveBeenCalled();
      expect(localStorageServiceMock.removeItem).toHaveBeenCalledWith(
        LocalStorageKey.SESSION_STATE,
      );
      expect(localStorageServiceMock.removeItem).toHaveBeenCalledWith(LocalStorageKey.EDITOR_CACHE);
      expect(consoleSpy).toHaveBeenCalledWith('Session state cleared.');
    },
  );

  it(
    'toggles the dark theme SCSS class on the document body upon ' +
      'clicking the theme toggle button via test harness interaction',
    async () => {
      const injectedDocument = TestBed.inject(DOCUMENT);
      expect(injectedDocument.body.classList.contains('dark-theme')).toBe(false);
      await harness.clickThemeToggleButton();
      expect(injectedDocument.body.classList.contains('dark-theme')).toBe(true);
      await harness.clickThemeToggleButton();
      expect(injectedDocument.body.classList.contains('dark-theme')).toBe(false);
    },
  );

  it(
    'toggles the left sidebar opened and closed states upon clicking ' +
      'the hamburger button via test harness interaction',
    async () => {
      expect(await harness.isSidenavOpened()).toBe(true);
      await harness.clickHamburgerButton();
      expect(await harness.isSidenavOpened()).toBe(false);
      await harness.clickHamburgerButton();
      expect(await harness.isSidenavOpened()).toBe(true);
    },
  );

  it('reads the persisted theme preference from storage on initialization', async () => {
    configProviderMock.themePreference.set('dark');
    const newFixture = TestBed.createComponent(ComposerShellComponent);
    newFixture.detectChanges();

    const injectedDocument = TestBed.inject(DOCUMENT);
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(true);
  });

  it('persists theme preference to storage upon toggling theme', async () => {
    expect(configProviderMock.setThemePreference).not.toHaveBeenCalled();
    await harness.clickThemeToggleButton();
    expect(configProviderMock.setThemePreference).toHaveBeenCalledWith('dark');

    await harness.clickThemeToggleButton();
    expect(configProviderMock.setThemePreference).toHaveBeenCalledWith('light');
  });
});
