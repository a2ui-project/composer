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

import {DOCUMENT} from '@angular/common';
import {signal, WritableSignal} from '@angular/core';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {By} from '@angular/platform-browser';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideRouter, Router, RouterLinkActive} from '@angular/router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChatCoordinator} from '../../chat/chat-coordinator/chat-coordinator';
import {StateSync} from '../../chat/state-sync/state-sync';
import {
  AppConfigProvider,
  ThemePreference,
} from '../../settings/app-config-provider/app-config-provider';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {IndexedDbStorage} from '../../storage/indexed-db-storage/indexed-db-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SessionStorageInteractions} from '../../storage/session-storage-interactions/session-storage-interactions';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';
import {
  ShareTrackingStatus,
  UsageTrackingService,
} from '../../usage-tracking/usage-tracking.service';
import {StartupResolution} from '../startup-resolution/startup-resolution';
import {ComposerShell} from './composer-shell';
import {ComposerShellHarness} from './test/composer-shell.harness';

describe('ComposerShell Layout', () => {
  let fixture: ComponentFixture<ComposerShell>;
  let harness: ComposerShellHarness;
  let storageServiceMock: Partial<IndexedDbStorage>;
  let localStorageServiceMock: Partial<LocalStorageInteractions>;
  let sessionStorageServiceMock: Partial<SessionStorageInteractions>;
  let catalogManagementServiceMock: {
    activeCatalogTitle: WritableSignal<string>;
    activeCatalogDescription: WritableSignal<string>;
  };
  let configProviderMock: {
    themePreference: WritableSignal<ThemePreference>;
    setThemePreference: (theme: ThemePreference) => void;
  };
  let startupResolutionMock: {
    resolvedUrl: WritableSignal<string | null>;
    sharedA2uiError: WritableSignal<string | null>;
  };
  let stateSyncMock: {
    activeDraft: WritableSignal<string>;
  };
  let chatCoordinatorMock: {
    currentTurnIndex: WritableSignal<number>;
  };

  beforeEach(async () => {
    storageServiceMock = {
      flushAllRecords: vi.fn().mockResolvedValue(undefined),
    };

    localStorageServiceMock = {
      removeItem: vi.fn(),
    };

    sessionStorageServiceMock = {
      clear: vi.fn(),
    };

    catalogManagementServiceMock = {
      activeCatalogTitle: signal(''),
      activeCatalogDescription: signal(''),
    };

    configProviderMock = {
      themePreference: signal(ThemePreference.LIGHT),
      setThemePreference: vi.fn((theme: ThemePreference) => {
        configProviderMock.themePreference.set(theme);
      }),
    };

    startupResolutionMock = {
      resolvedUrl: signal<string | null>(null),
      sharedA2uiError: signal<string | null>(null),
    };

    stateSyncMock = {
      activeDraft: signal(''),
    };

    chatCoordinatorMock = {
      currentTurnIndex: signal(3),
    };

    await TestBed.configureTestingModule({
      imports: [ComposerShell],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: IndexedDbStorage,
          useValue: storageServiceMock,
        },
        {
          provide: LocalStorageInteractions,
          useValue: localStorageServiceMock,
        },
        {
          provide: SessionStorageInteractions,
          useValue: sessionStorageServiceMock,
        },
        {
          provide: CatalogManagement,
          useValue: catalogManagementServiceMock,
        },
        {
          provide: AppConfigProvider,
          useValue: configProviderMock,
        },
        {
          provide: StartupResolution,
          useValue: startupResolutionMock,
        },
        {
          provide: StateSync,
          useValue: stateSyncMock,
        },
        {
          provide: ChatCoordinator,
          useValue: chatCoordinatorMock,
        },
        {
          provide: UsageTrackingService,
          useClass: NoopUsageTrackingService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComposerShell);
    fixture.detectChanges();
    harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, ComposerShellHarness);

    const injectedDocument = TestBed.inject(DOCUMENT);
    const nav = injectedDocument.defaultView!.navigator;
    const navProto = Object.getPrototypeOf(nav);
    if (
      !Object.getOwnPropertyDescriptor(nav, 'clipboard') &&
      !Object.getOwnPropertyDescriptor(navProto, 'clipboard')
    ) {
      Object.defineProperty(navProto, 'clipboard', {
        get: () => undefined,
        configurable: true,
      });
    }
  });

  afterEach(() => {
    const injectedDocument = TestBed.inject(DOCUMENT);
    injectedDocument.body.classList.remove('dark-theme');
    vi.restoreAllMocks();
  });

  it('creates the shell layout component via test harness', async () => {
    expect(harness).toBeTruthy();
  });

  it('displays the static header title A2UI Composer via test harness inspection', async () => {
    expect(await harness.getHeaderTitleText()).toContain('A2UI Composer');
  });

  it('dynamically updates the header title when activeCatalogTitle mutates', async () => {
    catalogManagementServiceMock.activeCatalogTitle.set('Test Catalog');
    fixture.detectChanges();
    expect(await harness.getHeaderTitleText()).toBe('A2UI Composer - Test Catalog');
  });

  it('binds the activeCatalogDescription correctly as a tooltip', async () => {
    catalogManagementServiceMock.activeCatalogDescription.set('Sample description');
    fixture.detectChanges();
    expect(await harness.getHeaderTooltipText()).toBe('Sample description');
  });

  it('flushes session cache and tracks reset upon clicking New Session reset button', async () => {
    const usageTracking = TestBed.inject(UsageTrackingService);
    const resetSpy = vi.spyOn(usageTracking, 'trackSessionReset');
    const sessionResetSpy = vi.spyOn(usageTracking, 'resetSession');
    const consoleSpy = vi.spyOn(console, 'log');

    await harness.clickResetButton();

    expect(resetSpy).toHaveBeenCalledWith({totalPromptTurns: 3});
    expect(sessionResetSpy).toHaveBeenCalled();
    expect(storageServiceMock.flushAllRecords).toHaveBeenCalled();
    expect(localStorageServiceMock.removeItem).toHaveBeenCalledWith(LocalStorageKey.SESSION_STATE);
    expect(localStorageServiceMock.removeItem).toHaveBeenCalledWith(LocalStorageKey.EDITOR_CACHE);
    expect(localStorageServiceMock.removeItem).not.toHaveBeenCalledWith(
      LocalStorageKey.DOCKVIEW_LAYOUT,
    );
    expect(sessionStorageServiceMock.clear).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Session state cleared.');
  });

  it('toggles the dark theme SCSS class and tracks theme change on toggle', async () => {
    const usageTracking = TestBed.inject(UsageTrackingService);
    const themeSpy = vi.spyOn(usageTracking, 'trackThemeToggle');
    const injectedDocument = TestBed.inject(DOCUMENT);

    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(false);
    await harness.clickThemeToggleButton();
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(true);
    expect(themeSpy).toHaveBeenCalledWith({theme: ThemePreference.DARK});

    await harness.clickThemeToggleButton();
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(false);
    expect(themeSpy).toHaveBeenCalledWith({theme: ThemePreference.LIGHT});
  });

  it('toggles the left sidebar collapsed state upon clicking the hamburger button', async () => {
    expect(await harness.isSidenavCollapsed()).toBe(true);
    await harness.clickHamburgerButton();
    expect(await harness.isSidenavCollapsed()).toBe(false);
    await harness.clickHamburgerButton();
    expect(await harness.isSidenavCollapsed()).toBe(true);
  });

  it('ensures mat-sidenav-content margin-left is 0px to eliminate whitespace gap', async () => {
    const sidenavContent = fixture.nativeElement.querySelector('mat-sidenav-content');
    expect(sidenavContent).toBeTruthy();
    const computedStyle = window.getComputedStyle(sidenavContent);
    expect(['0', '0px']).toContain(computedStyle.marginLeft);
  });

  it('reads the persisted theme preference from storage on initialization', async () => {
    configProviderMock.themePreference.set(ThemePreference.DARK);
    const newFixture = TestBed.createComponent(ComposerShell);
    newFixture.detectChanges();

    const injectedDocument = TestBed.inject(DOCUMENT);
    expect(injectedDocument.body.classList.contains('dark-theme')).toBe(true);
  });

  it('persists theme preference to storage upon toggling theme', async () => {
    expect(configProviderMock.setThemePreference).not.toHaveBeenCalled();
    await harness.clickThemeToggleButton();
    expect(configProviderMock.setThemePreference).toHaveBeenCalledWith(ThemePreference.DARK);

    await harness.clickThemeToggleButton();
    expect(configProviderMock.setThemePreference).toHaveBeenCalledWith(ThemePreference.LIGHT);
  });

  it('renders the Components Gallery navigation link in the sidebar when expanded', async () => {
    await harness.clickHamburgerButton();
    const links = await harness.getNavigationLinksText();
    expect(links).toContain('Components Gallery');
  });

  it('applies aria-hidden attribute to purely decorative MatIcon elements across the composer shell', async () => {
    const hiddenAttrs = await harness.getIconsAriaHidden();
    expect(hiddenAttrs.length).toBe(6);
    hiddenAttrs.forEach(attr => {
      expect(attr).toBe('true');
    });
  });

  it('renders Material icons inside navigation list items', async () => {
    const icons = await harness.getNavListIconsText();
    expect(icons).toEqual(['construction', 'widgets', 'settings']);
  });

  it('enables tooltips on navigation items and hides labels when collapsed initially', async () => {
    expect(await harness.getNavListTooltipsDisabled()).toEqual([false, false, false]);
    expect(fixture.nativeElement.querySelectorAll('.nav-label').length).toBe(0);
    await harness.clickHamburgerButton();
    expect(await harness.isSidenavCollapsed()).toBe(false);
    expect(await harness.getNavListTooltipsDisabled()).toEqual([true, true, true]);
    expect(fixture.nativeElement.querySelectorAll('.nav-label').length).toBe(3);
  });

  it('sets explicit aria-label attributes on navigation links and connects hamburger button to sidenav', () => {
    const navLinks = Array.from(fixture.nativeElement.querySelectorAll('mat-nav-list a'));
    const ariaLabels = navLinks.map((link: unknown) =>
      (link as Element).getAttribute('aria-label'),
    );
    expect(ariaLabels).toEqual(['Composer Workspace', 'Components Gallery', 'Settings']);

    const sidenavEl = fixture.nativeElement.querySelector('mat-sidenav');
    expect(sidenavEl.getAttribute('id')).toBe('composer-sidenav');

    const hamburgerButton = fixture.nativeElement.querySelector('.hamburger-button');
    expect(hamburgerButton.getAttribute('aria-controls')).toBe('composer-sidenav');
  });

  it('applies routerLinkActive="active-nav-item" to navigation links with exact matching on root', async () => {
    const navLinks = Array.from(fixture.nativeElement.querySelectorAll('mat-nav-list a'));
    const rlaAttrs = navLinks.map((link: unknown) =>
      (link as Element).getAttribute('routerLinkActive'),
    );
    expect(rlaAttrs).toEqual(['active-nav-item', 'active-nav-item', 'active-nav-item']);

    const rlaDirectives = fixture.debugElement.queryAll(By.directive(RouterLinkActive));
    expect(rlaDirectives.length).toBe(3);
    const rlaInstances = rlaDirectives.map(de => de.injector.get(RouterLinkActive));
    expect(rlaInstances[0].routerLinkActiveOptions).toEqual({exact: true});

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((navLinks[0] as HTMLElement).classList.contains('active-nav-item')).toBe(true);
  });

  describe('shareDesign & resetSession', () => {
    it('copies renderer URL and compressed payload in URL hash to clipboard, tracks telemetry, and reports size in snackbar', async () => {
      const usageTracking = TestBed.inject(UsageTrackingService);
      const shareSpy = vi.spyOn(usageTracking, 'trackShareDesign');
      const snackBar = fixture.debugElement.injector.get(MatSnackBar);
      const snackBarSpy = vi.spyOn(snackBar, 'open');
      startupResolutionMock.resolvedUrl.set('http://my-renderer.com');
      stateSyncMock.activeDraft.set('[{"version":"v0.9"}]');
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      const document = TestBed.inject(DOCUMENT);
      const nav = document.defaultView!.navigator;
      const targetObj = Object.getOwnPropertyDescriptor(nav, 'clipboard')
        ? nav
        : Object.getPrototypeOf(nav);
      const spy = vi.spyOn(targetObj, 'clipboard', 'get').mockReturnValue({
        writeText: writeTextSpy,
      } as unknown as Clipboard);

      try {
        const component = fixture.componentInstance;
        await component.shareDesign();
        expect(writeTextSpy).toHaveBeenCalledWith(
          expect.stringContaining('#renderer=http%3A%2F%2Fmy-renderer.com'),
        );
        expect(writeTextSpy).toHaveBeenCalledWith(expect.stringContaining('a2ui=d1.'));
        expect(shareSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            status: ShareTrackingStatus.SUCCESS,
            compressedLengthChars: expect.any(Number),
          }),
        );
        expect(snackBarSpy).toHaveBeenCalledWith(
          expect.stringMatching(/Shareable link copied to clipboard \(\d+\.\d+ KB\)/),
          'Close',
          {duration: 5000},
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('displays an error snackbar and halts sharing when active draft contains invalid JSON syntax', async () => {
      const snackBar = fixture.debugElement.injector.get(MatSnackBar);
      const snackBarSpy = vi.spyOn(snackBar, 'open');
      stateSyncMock.activeDraft.set('invalid json {');
      const writeTextSpy = vi.fn().mockResolvedValue(undefined);
      const document = TestBed.inject(DOCUMENT);
      const nav = document.defaultView!.navigator;
      const targetObj = Object.getOwnPropertyDescriptor(nav, 'clipboard')
        ? nav
        : Object.getPrototypeOf(nav);
      const spy = vi.spyOn(targetObj, 'clipboard', 'get').mockReturnValue({
        writeText: writeTextSpy,
      } as unknown as Clipboard);

      try {
        const component = fixture.componentInstance;
        await component.shareDesign();
        expect(writeTextSpy).not.toHaveBeenCalled();
        expect(snackBarSpy).toHaveBeenCalledWith(
          'Cannot share design: invalid JSON syntax',
          'Close',
          {duration: 5000},
        );
      } finally {
        spy.mockRestore();
      }
    });

    it('displays a snackbar warning and tracks clipboard unavailable when clipboard API is missing', async () => {
      const usageTracking = TestBed.inject(UsageTrackingService);
      const shareSpy = vi.spyOn(usageTracking, 'trackShareDesign');
      const snackBar = fixture.debugElement.injector.get(MatSnackBar);
      const snackBarSpy = vi.spyOn(snackBar, 'open');
      const document = TestBed.inject(DOCUMENT);
      const navProto = Object.getPrototypeOf(document.defaultView!.navigator) as Navigator;
      const spy = vi
        .spyOn(navProto, 'clipboard', 'get')
        .mockReturnValue(undefined as unknown as Clipboard);

      try {
        const component = fixture.componentInstance;
        await component.shareDesign();
        expect(snackBarSpy).toHaveBeenCalledWith('Clipboard API unavailable', 'Close', {
          duration: 5000,
        });
        expect(shareSpy).toHaveBeenCalledWith({
          status: ShareTrackingStatus.CLIPBOARD_UNAVAILABLE,
          compressedLengthChars: 0,
        });
      } finally {
        spy.mockRestore();
      }
    });

    it('resetSession strips share parameters from location href before setting href', async () => {
      const doc = TestBed.inject(DOCUMENT);
      const mockLocation = {href: 'http://localhost:3000/?renderer=http://test.com&a2ui=d1.123'};
      vi.spyOn(doc, 'defaultView', 'get').mockReturnValue({
        location: mockLocation,
      } as unknown as Window & typeof globalThis);

      const component = fixture.componentInstance;
      await component.resetSession();
      expect(mockLocation.href).toBe('http://localhost:3000/');
    });

    it('displays a snackbar error message when sharedA2uiError signal emits an error message', () => {
      const snackBar = fixture.debugElement.injector.get(MatSnackBar);
      const snackBarSpy = vi.spyOn(snackBar, 'open');

      startupResolutionMock.sharedA2uiError.set(
        'The shared design link appears truncated or corrupted (it may have exceeded URL length limits).',
      );
      fixture.detectChanges();

      expect(snackBarSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Unable to load shared design: The shared design link appears truncated or corrupted',
        ),
        'Dismiss',
        {duration: 5000},
      );
    });
  });
});
