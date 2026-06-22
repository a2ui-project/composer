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
import {PlatformLocation} from '@angular/common';
import {Settings} from './settings';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {locationAssign} from 'safevalues/dom';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {describe, it, expect, beforeEach, afterEach, vi, Mock} from 'vitest';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {signal, WritableSignal, Signal, computed} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {AppConfigProvider, AuthType, EnvMode} from '../app-config-provider/app-config-provider';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {SettingsHarness} from './test/settings.harness';

vi.mock('safevalues/dom', () => {
  return {
    locationAssign: vi.fn(),
  };
});

describe('Settings', () => {
  let mockPlatformLocation: {
    getBaseHrefFromDOM: Mock<() => string | null>;
  };
  let mockStartupResolution: {
    getResolvedRendererUrl: Mock<() => string | null>;
    isThirdPartyEnvironment: Mock<() => boolean>;
    isContextLocked: Mock<() => boolean>;
  };
  let mockLatestEnvelope: WritableSignal<MessageEnvelope | null>;
  let mockIsHandshakeInProgress: WritableSignal<boolean>;
  let mockActiveCatalogTitle: WritableSignal<string>;
  let mockActiveCatalog: WritableSignal<Catalog | null>;
  let mockCatalogError: WritableSignal<string | null>;

  let mockAuthOverride: WritableSignal<AuthType>;
  let mockRendererUrl: WritableSignal<string>;
  let mockGeminiApiKey: WritableSignal<string>;
  let mockConfigProvider: {
    initialize: Mock<() => Promise<void>>;
    authType: Signal<AuthType>;
    rendererUrl: Signal<string>;
    geminiApiKey: Signal<string>;
    setRendererUrl: Mock<(url: string) => void>;
    setGeminiApiKey: Mock<(key: string) => void>;
    setForcedAuthMode: Mock<(mode: AuthType) => void>;
    flushConfig: Mock<() => void>;
    purgeGeminiApiKey: Mock<() => void>;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    mockPlatformLocation = {
      getBaseHrefFromDOM: vi.fn().mockReturnValue('/composer/pr/44/'),
    };
    mockStartupResolution = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://resolved-url.com'),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      isContextLocked: vi.fn().mockReturnValue(false),
    };
    mockLatestEnvelope = signal<MessageEnvelope | null>(null);
    mockIsHandshakeInProgress = signal<boolean>(false);
    mockActiveCatalogTitle = signal<string>('');
    mockActiveCatalog = signal<Catalog | null>(null);
    mockCatalogError = signal<string | null>(null);

    mockAuthOverride = signal<AuthType>(AuthType.DEFAULT);
    mockRendererUrl = signal<string>('http://resolved-url.com');
    mockGeminiApiKey = signal<string>('');

    const mockAuthType = computed(() => {
      const override = mockAuthOverride();
      if (override !== AuthType.DEFAULT) {
        return override;
      }
      return mockStartupResolution.isThirdPartyEnvironment()
        ? AuthType.THREE_PARTY
        : AuthType.ONE_PARTY;
    });

    mockConfigProvider = {
      initialize: vi.fn().mockResolvedValue(undefined),
      authType: mockAuthType,
      rendererUrl: mockRendererUrl.asReadonly(),
      geminiApiKey: mockGeminiApiKey.asReadonly(),
      setRendererUrl: vi.fn().mockImplementation((url: string) => {
        mockRendererUrl.set(url);
      }),
      setGeminiApiKey: vi.fn().mockImplementation((key: string) => {
        mockGeminiApiKey.set(key);
      }),
      setForcedAuthMode: vi.fn().mockImplementation((mode: AuthType) => {
        mockAuthOverride.set(mode);
      }),
      flushConfig: vi.fn().mockImplementation(() => {
        mockAuthOverride.set(AuthType.DEFAULT);
        mockGeminiApiKey.set('');
        mockRendererUrl.set(mockStartupResolution.getResolvedRendererUrl() || '');
      }),
      purgeGeminiApiKey: vi.fn().mockImplementation(() => {
        mockGeminiApiKey.set('');
      }),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  async function setupComponent() {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideNoopAnimations(),
        {
          provide: StartupResolution,
          useValue: mockStartupResolution,
        },
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {
          provide: HostCommunication,
          useValue: {latestEnvelope: mockLatestEnvelope},
        },
        {
          provide: CatalogManagement,
          useValue: {
            isHandshakeInProgress: mockIsHandshakeInProgress,
            activeCatalogTitle: mockActiveCatalogTitle,
            activeCatalog: mockActiveCatalog,
            catalogError: mockCatalogError,
          },
        },
        {
          provide: PlatformLocation,
          useValue: mockPlatformLocation,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Settings);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SettingsHarness);
    return {fixture, component, harness};
  }

  it('initializes form controls cleanly in 1P mode without requiring apiKey', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(false);
    const {component, harness} = await setupComponent();

    expect(component.isThirdParty()).toBe(false);
    expect(await harness.getRendererUrlValue()).toBe('http://resolved-url.com');

    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    await harness.setRendererUrlValue('http://new-url.com');
    await component.saveSettings();

    expect(mockConfigProvider.purgeGeminiApiKey).toHaveBeenCalled();
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://new-url.com');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('rejects empty whitespace keys in 3P mode but permits missing keys', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {component, harness} = await setupComponent();

    expect(component.isThirdParty()).toBe(true);
    expect(component.settingsForm.controls.apiKey.errors?.['required']).toBeFalsy();
    expect(component.settingsForm.valid).toBe(true);

    await harness.setRendererUrlValue('http://new-url.com');
    await harness.setGeminiApiKeyValue('   ');

    expect(component.settingsForm.controls.apiKey.errors?.['pattern']).toBeTruthy();
    expect(component.settingsForm.invalid).toBe(true);
  });

  it('persists valid configurations securely in 3P environments', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {component, harness} = await setupComponent();

    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    await harness.setRendererUrlValue('http://new-url.com');
    await harness.setGeminiApiKeyValue('AIzaSyTestKey');

    expect(component.settingsForm.valid).toBe(true);

    await component.saveSettings();

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://new-url.com');
    expect(mockConfigProvider.setGeminiApiKey).toHaveBeenCalledWith('AIzaSyTestKey');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('disables rendererUrl form control and displays lock warning when context is locked', async () => {
    mockStartupResolution.isContextLocked.mockReturnValue(true);
    const {component, harness} = await setupComponent();

    expect(component.isLocked()).toBe(true);
    expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);

    expect(await harness.hasLockedNotice()).toBe(true);
    expect(await harness.getLockedNoticeText()).toContain('locked by enterprise policy');
  });

  it('displays default connection status badges and overlay logs console when disconnected', async () => {
    const {harness} = await setupComponent();
    expect(await harness.getBridgeBadgeText()).toContain('Bridge: Disconnected');
    expect(await harness.getCatalogBadgeText()).toContain('Catalog Handshake: Disconnected');
    expect(await harness.getLogsConsoleText()).toContain('Bridge disconnected');
  });

  it('dynamically updates connection status badges and logs console when HostCommunication and CatalogManagement signals mutate', async () => {
    const {fixture, harness} = await setupComponent();

    // Initial state: bridge disconnected, catalog disconnected
    expect(await harness.getBridgeBadgeText()).toContain('Bridge: Disconnected');
    expect(await harness.getCatalogBadgeText()).toContain('Catalog Handshake: Disconnected');

    // Mutate bridge to connected
    mockLatestEnvelope.set({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 0,
    });
    fixture.detectChanges();
    expect(await harness.getBridgeBadgeText()).toContain('Bridge: Connected');

    // Mutate catalog to indexing
    mockIsHandshakeInProgress.set(true);
    fixture.detectChanges();
    expect(await harness.getCatalogBadgeText()).toContain('Catalog Handshake: Indexing');
    expect(await harness.getLogsConsoleText()).toContain('Catalog handshake in progress');

    // Mutate catalog to connected
    mockIsHandshakeInProgress.set(false);
    mockActiveCatalogTitle.set('My Catalog');
    mockActiveCatalog.set({title: 'My Catalog'});
    fixture.detectChanges();
    expect(await harness.getCatalogBadgeText()).toContain('Catalog Handshake: Connected');
    expect(await harness.getLogsConsoleText()).toContain(
      'Catalog handshake completed successfully',
    );

    // Mutate catalog to error
    mockCatalogError.set('Malformed catalog JSON');
    fixture.detectChanges();
    expect(await harness.getCatalogBadgeText()).toContain('Catalog Handshake: Error');
    expect(await harness.getLogsConsoleText()).toContain('[Catalog Error] Malformed catalog JSON');
  });

  it('verifies static placeholder text on the renderer URL input', async () => {
    const {harness} = await setupComponent();
    // Harness handles input properties query securely,
    // avoiding direct DOM selections
    expect(await harness.getRendererUrlPlaceholder()).toBe('http://localhost:3000');
  });

  it('toggles API key input visibility between password and text via button clicks', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {fixture, harness} = await setupComponent();

    expect(await harness.getApiKeyInputType()).toBe('password');

    await harness.clickApiKeyToggleBtn();
    fixture.detectChanges();
    expect(await harness.getApiKeyInputType()).toBe('text');

    await harness.clickApiKeyToggleBtn();
    fixture.detectChanges();
    expect(await harness.getApiKeyInputType()).toBe('password');
  });

  it('renders client-side format validation errors for missing required fields and malformed URL strings upon form submission', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {fixture, component, harness} = await setupComponent();

    await harness.setRendererUrlValue('');
    await harness.setGeminiApiKeyValue('');
    await component.saveSettings();
    fixture.detectChanges();

    const errors = await harness.getErrorsText();
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain('Renderer URL is required');

    await harness.setRendererUrlValue('invalid-url');
    await harness.setGeminiApiKeyValue('valid-key');
    await component.saveSettings();
    fixture.detectChanges();

    const patternErrors = await harness.getErrorsText();
    expect(patternErrors.length).toBe(1);
    expect(patternErrors[0]).toContain(
      'Must be a valid HTTP/HTTPS URL or relative path starting with "/"',
    );
  });

  class FakeAppConfigProvider extends AppConfigProvider {
    initialize = vi.fn().mockResolvedValue(undefined);
    envMode = signal(EnvMode.STANDALONE);
    authType = computed(() => {
      return localStorage.getItem('a2ui_composer_force_3p') === 'true'
        ? AuthType.THREE_PARTY
        : AuthType.ONE_PARTY;
    });
    rendererUrl = signal('');
    geminiApiKey = signal('');
    themePreference = signal<ThemePreference>('light');
    setRendererUrl = vi.fn();
    setGeminiApiKey = vi.fn();
    setForcedAuthMode = vi.fn();
    setThemePreference = vi.fn();
    flushConfig = vi.fn();
    purgeGeminiApiKey = vi.fn();
  }

  it('renders third-party context layout when a2ui_composer_force_3p storage override key is present using a real StartupResolution', async () => {
    localStorage.setItem('a2ui_composer_force_3p', 'true');
    try {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [Settings],
        providers: [
          provideNoopAnimations(),
          StartupResolution,
          {
            provide: AppConfigProvider,
            useClass: FakeAppConfigProvider,
          },
          {
            provide: HostCommunication,
            useValue: {latestEnvelope: mockLatestEnvelope},
          },
          {
            provide: CatalogManagement,
            useValue: {
              isHandshakeInProgress: mockIsHandshakeInProgress,
              activeCatalogTitle: mockActiveCatalogTitle,
              activeCatalog: mockActiveCatalog,
              catalogError: mockCatalogError,
            },
          },
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(Settings);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SettingsHarness);

      expect(component.isThirdParty()).toBe(true);
      expect(await harness.getFormSectionsCount()).toBe(3);

      const sections = await harness.getFormSectionsCount();
      expect(sections).toBe(3);
    } finally {
      localStorage.removeItem('a2ui_composer_force_3p');
    }
  });

  it('updates dynamic forced auth overrides and reloads window when toggling forceThirdPartyAuth', async () => {
    const {fixture, component, harness} = await setupComponent();
    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    expect(component.forceThirdPartyAuth()).toBe(false);

    await harness.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(true);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.THREE_PARTY);
    expect(reloadSpy).toHaveBeenCalled();

    await harness.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(false);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenLastCalledWith(AuthType.ONE_PARTY);
    expect(reloadSpy).toHaveBeenCalledTimes(2);
  });

  it('disables the slide toggle and displays the auth-locked-notice warning badge when isContextLocked returns true', async () => {
    mockStartupResolution.isContextLocked.mockReturnValue(true);
    const {component, harness} = await setupComponent();

    expect(component.isLocked()).toBe(true);
    expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);

    expect(await harness.hasAuthLockedNotice()).toBe(true);
    expect(await harness.getAuthLockedNoticeText()).toContain(
      'Authentication mode overrides are locked by enterprise policy',
    );

    expect(await harness.isSlideToggleDisabled()).toBe(true);

    const initialForcedAuth = component.forceThirdPartyAuth();
    component.toggleForceThirdPartyAuth();
    expect(component.forceThirdPartyAuth()).toBe(initialForcedAuth);
    expect(mockConfigProvider.setForcedAuthMode).not.toHaveBeenCalled();
  });

  it('reloads the application at the dynamic base path when hosted under a dynamic base href', async () => {
    const {component} = await setupComponent();

    component.reloadWindow();

    expect(locationAssign).toHaveBeenCalledWith(expect.anything(), '/composer/pr/44/');
  });

  it('reloads the application at the root path "/" when base href is unavailable', async () => {
    mockPlatformLocation.getBaseHrefFromDOM.mockReturnValue(null);
    const {component} = await setupComponent();

    component.reloadWindow();

    expect(locationAssign).toHaveBeenCalledWith(expect.anything(), '/');
  });

  it('applies aria-hidden attribute to purely decorative MatIcon elements across settings', async () => {
    mockStartupResolution.isContextLocked.mockReturnValue(true);
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {fixture, harness} = await setupComponent();
    fixture.detectChanges();

    const hiddenAttrs = await harness.getIconsAriaHidden();
    expect(hiddenAttrs.length).toBe(3);
    hiddenAttrs.forEach(attr => {
      expect(attr).toBe('true');
    });
  });

  it.for(['/samples/ng-basic-catalog/index.html', '/renderer'])(
    'accepts relative paths starting with "/"',
    async relativeUrl => {
      const {fixture, component, harness} = await setupComponent();

      await harness.setRendererUrlValue(relativeUrl);
      fixture.detectChanges();
      expect(component.settingsForm.controls.rendererUrl.valid).toBe(true);
    },
  );

  it.for([
    'samples/ng-basic-catalog/index.html',
    'renderer',
    '//renderer',
    '//example.com/foo/bar',
  ])('rejects other relative paths', async relativeUrl => {
    const {fixture, component, harness} = await setupComponent();

    await harness.setRendererUrlValue(relativeUrl);
    fixture.detectChanges();
    expect(component.settingsForm.controls.rendererUrl.valid).toBe(false);
    expect(component.settingsForm.controls.rendererUrl.errors?.['pattern']).toBeTruthy();
  });

  it('saves settings with valid relative rendererUrl', async () => {
    const {component, harness} = await setupComponent();

    await harness.setRendererUrlValue('/samples/ng-basic-catalog/index.html');
    await component.saveSettings();

    expect(component.settingsForm.valid).toBe(true);
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith(
      '/samples/ng-basic-catalog/index.html',
    );
  });
});
