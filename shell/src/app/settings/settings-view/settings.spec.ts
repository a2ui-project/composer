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
import {StartupResolution, ProfileConfig} from '../../shell/startup-resolution/startup-resolution';
import {describe, it, expect, beforeEach, afterEach, vi, Mock} from 'vitest';
import {
  HostCommunication,
  MessageEnvelope,
} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {Catalog} from '../../storage/models/catalog-storage.model';
import {signal, WritableSignal, Signal, computed} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {
  AppConfigProvider,
  AuthType,
  EnvMode,
  ThemePreference,
} from '../app-config-provider/app-config-provider';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {SettingsHarness} from './test/settings.harness';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';
import {SettingsService} from '../settings-service/settings.service';

vi.mock('safevalues/dom', () => {
  return {
    locationAssign: vi.fn(),
  };
});

describe('Settings', () => {
  let mockPlatformLocation: {
    getBaseHrefFromDOM: Mock<() => string | null>;
  };
  let mockProfiles: WritableSignal<Record<string, ProfileConfig>>;
  let mockSelectedProfileId: WritableSignal<string | null>;
  let mockActiveProfile: WritableSignal<ProfileConfig | null>;
  let mockStartupResolution: {
    getResolvedRendererUrl: Mock<() => string | null>;
    isThirdPartyEnvironment: Mock<() => boolean>;
    isContextLocked: Mock<() => boolean>;
    profiles: Signal<Record<string, ProfileConfig>>;
    selectedProfileId: Signal<string | null>;
    activeProfile: Signal<ProfileConfig | null>;
    setSelectedProfileId: Mock<(id: string | null) => void>;
  };
  let mockLatestEnvelope: WritableSignal<MessageEnvelope | null>;
  let mockIsHandshakeInProgress: WritableSignal<boolean>;
  let mockActiveCatalogTitle: WritableSignal<string>;
  let mockActiveCatalog: WritableSignal<Catalog | null>;
  let mockCatalogError: WritableSignal<string | null>;

  let mockAuthOverride: WritableSignal<AuthType>;
  let mockRendererUrl: WritableSignal<string>;
  let mockGeminiApiKey: WritableSignal<string>;
  let mockIsApiKeyProvidedByConfig: WritableSignal<boolean>;
  let mockConfigProvider: {
    initialize: Mock<() => Promise<void>>;
    authType: Signal<AuthType>;
    rendererUrl: Signal<string>;
    geminiApiKey: Signal<string>;
    isApiKeyProvidedByConfig: Signal<boolean>;
    setRendererUrl: Mock<(url: string) => void>;
    setGeminiApiKey: Mock<(key: string) => void>;
    setApiKeyFromConfig: Mock<(key: string) => void>;
    setForcedAuthMode: Mock<(mode: AuthType) => void>;
    flushConfig: Mock<() => void>;
    purgeGeminiApiKey: Mock<() => void>;
  };

  let mockSecureStorage: {
    getCredential: Mock<() => Promise<string | null>>;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    mockSecureStorage = {
      getCredential: vi.fn().mockResolvedValue(null),
    };
    mockPlatformLocation = {
      getBaseHrefFromDOM: vi.fn().mockReturnValue('/composer/pr/44/'),
    };
    mockProfiles = signal<Record<string, ProfileConfig>>({});
    mockSelectedProfileId = signal<string | null>(null);
    mockActiveProfile = signal<ProfileConfig | null>(null);

    mockStartupResolution = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://resolved-url.com'),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      isContextLocked: vi.fn().mockReturnValue(false),
      profiles: mockProfiles.asReadonly(),
      selectedProfileId: mockSelectedProfileId.asReadonly(),
      activeProfile: mockActiveProfile.asReadonly(),
      setSelectedProfileId: vi.fn((id: string | null) => {
        mockSelectedProfileId.set(id);
        mockActiveProfile.set(id ? mockProfiles()[id] || null : null);
      }),
    };
    mockLatestEnvelope = signal<MessageEnvelope | null>(null);
    mockIsHandshakeInProgress = signal<boolean>(false);
    mockActiveCatalogTitle = signal<string>('');
    mockActiveCatalog = signal<Catalog | null>(null);
    mockCatalogError = signal<string | null>(null);

    mockAuthOverride = signal<AuthType>(AuthType.DEFAULT);
    mockRendererUrl = signal<string>('http://resolved-url.com');
    mockGeminiApiKey = signal<string>('');
    mockIsApiKeyProvidedByConfig = signal<boolean>(false);

    const mockAuthType = computed(() => {
      const override = mockAuthOverride();
      if (override !== AuthType.DEFAULT) {
        return override;
      }
      return mockStartupResolution.isThirdPartyEnvironment()
        ? AuthType.THIRD_PARTY
        : AuthType.FIRST_PARTY;
    });

    mockConfigProvider = {
      initialize: vi.fn().mockResolvedValue(undefined),
      authType: mockAuthType,
      rendererUrl: mockRendererUrl.asReadonly(),
      geminiApiKey: mockGeminiApiKey.asReadonly(),
      isApiKeyProvidedByConfig: mockIsApiKeyProvidedByConfig.asReadonly(),
      setRendererUrl: vi.fn().mockImplementation((url: string) => {
        mockRendererUrl.set(url);
      }),
      setGeminiApiKey: vi.fn().mockImplementation((key: string) => {
        mockGeminiApiKey.set(key);
      }),
      setApiKeyFromConfig: vi.fn().mockImplementation((key: string) => {
        mockIsApiKeyProvidedByConfig.set(!!key);
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

  async function setupComponent(enable1PAuth = true) {
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
        {provide: SecureCredentialsStorage, useValue: mockSecureStorage},
        {provide: IS_1P_AUTH_ENABLED, useValue: enable1PAuth},
        SettingsService,
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
    expect(await harness.getLockedNoticeText()).toContain('Active URL configuration is locked.');
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
    override authType = computed(() => {
      return localStorage.getItem('a2ui_composer_force_3p') === 'true'
        ? AuthType.THIRD_PARTY
        : AuthType.FIRST_PARTY;
    });
    override envMode = signal(EnvMode.STANDALONE);
    override geminiApiKey = signal('');
    override isApiKeyProvidedByConfig = signal(false);
    override includeScreenshot = signal(false);
    override rendererUrl = signal('');
    override themePreference = signal<ThemePreference>(ThemePreference.LIGHT);
    override flushConfig = vi.fn();
    override initialize = vi.fn().mockResolvedValue(undefined);
    override purgeGeminiApiKey = vi.fn();
    override setForcedAuthMode = vi.fn();
    override setGeminiApiKey = vi.fn();
    override setApiKeyFromConfig = vi.fn();
    override setIncludeScreenshot = vi.fn();
    override setRendererUrl = vi.fn();
    override setThemePreference = vi.fn();
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
          {provide: IS_1P_AUTH_ENABLED, useValue: true},
          {provide: CONFIG_URL, useValue: '/config.json'},
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(Settings);
      const component = fixture.componentInstance;
      fixture.detectChanges();
      const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, SettingsHarness);

      expect(component.isThirdParty()).toBe(true);
      expect(await harness.getFormSectionsCount()).toBe(4);

      const sections = await harness.getFormSectionsCount();
      expect(sections).toBe(4);
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
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.THIRD_PARTY);
    expect(reloadSpy).toHaveBeenCalled();

    await harness.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(false);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenLastCalledWith(AuthType.FIRST_PARTY);
    expect(reloadSpy).toHaveBeenCalledTimes(2);
  });

  it('disables the slide toggle and displays the auth-locked-notice warning badge when isContextLocked returns true', async () => {
    mockStartupResolution.isContextLocked.mockReturnValue(true);
    const {component, harness} = await setupComponent();

    expect(component.isLocked()).toBe(true);
    expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);

    expect(await harness.hasAuthLockedNotice()).toBe(true);
    expect(await harness.getAuthLockedNoticeText()).toContain(
      'Authentication mode overrides are locked',
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
    expect(component.settingsForm.valid).toBe(true);
    await component.saveSettings();

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith(
      '/samples/ng-basic-catalog/index.html',
    );
  });

  it('hides authentication overrides section when IS_1P_AUTH_ENABLED is false', async () => {
    const {fixture} = await setupComponent(false);
    const section = fixture.nativeElement.querySelector('.first-party-auth-section');
    expect(section.hidden).toBe(true);
  });

  describe('Reactive Form Enablement & Value Synchronization', () => {
    it('disables apiKeyControl and clears validators in 1P mode upon initialization', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(false);
      const {component} = await setupComponent();

      expect(component.isThirdParty()).toBe(false);
      expect(component.settingsForm.controls.apiKey.disabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.validator).toBeNull();
      expect(component.settingsForm.valid).toBe(true);
    });

    it('enables apiKeyControl and applies non-whitespace validator in 3P mode upon initialization', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {component} = await setupComponent();

      expect(component.isThirdParty()).toBe(true);
      expect(component.settingsForm.controls.apiKey.enabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.validator).toBeTruthy();

      component.settingsForm.controls.apiKey.setValue('   ');
      expect(component.settingsForm.controls.apiKey.invalid).toBe(true);
      expect(component.settingsForm.invalid).toBe(true);
    });

    it('synchronizes geminiApiKey signal from config provider into apiKey control without clobbering dirty user input', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, component} = await setupComponent();

      mockGeminiApiKey.set('loaded-idb-key');
      TestBed.tick();
      fixture.detectChanges();

      expect(component.settingsForm.controls.apiKey.value).toBe('loaded-idb-key');

      component.settingsForm.controls.apiKey.setValue('user-typed-key');
      component.settingsForm.controls.apiKey.markAsDirty();

      mockGeminiApiKey.set('background-sync-key');
      TestBed.tick();
      fixture.detectChanges();

      expect(component.settingsForm.controls.apiKey.value).toBe('user-typed-key');
    });

    it('synchronizes rendererUrl signal from config provider into rendererUrl form control without clobbering dirty user input', async () => {
      const {fixture, component} = await setupComponent();

      mockRendererUrl.set('https://profile-renderer-url.com');
      fixture.detectChanges();

      expect(component.settingsForm.controls.rendererUrl.value).toBe(
        'https://profile-renderer-url.com',
      );

      component.settingsForm.controls.rendererUrl.setValue('https://user-typed-url.com');
      component.settingsForm.controls.rendererUrl.markAsDirty();

      mockRendererUrl.set('https://background-sync-renderer.com');
      fixture.detectChanges();

      expect(component.settingsForm.controls.rendererUrl.value).toBe('https://user-typed-url.com');
    });
  });

  describe('Anti-Silent Failure UI Alert & Error Reporting (saveSettings)', () => {
    it('sets saveErrorMessage when form validation fails upon saveSettings()', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, component, harness} = await setupComponent();

      await harness.setRendererUrlValue('');
      await component.saveSettings();
      fixture.detectChanges();

      expect(component.saveErrorMessage()).toContain('Please resolve validation errors');
      expect(await harness.hasSaveErrorBanner()).toBe(true);
      expect(await harness.getSaveErrorBannerText()).toContain('Please resolve validation errors');
    });

    it('sets saveErrorMessage when storage persistence rejects during saveSettings()', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, component, harness} = await setupComponent();

      mockConfigProvider.setGeminiApiKey.mockRejectedValueOnce(
        new Error('Simulated Storage Rejection'),
      );

      await harness.setRendererUrlValue('http://valid-url.com');
      await harness.setGeminiApiKeyValue('valid-key');
      await component.saveSettings();
      fixture.detectChanges();

      expect(component.saveErrorMessage()).toBe('Simulated Storage Rejection');
      expect(await harness.hasSaveErrorBanner()).toBe(true);
      expect(await harness.getSaveErrorBannerText()).toContain('Simulated Storage Rejection');
    });
  });

  describe('API Key View Prohibition', () => {
    it('disables API key toggle button and prohibits unmasking when isApiKeyProvidedByConfig is true', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockIsApiKeyProvidedByConfig.set(true);

      const {component, harness} = await setupComponent();

      expect(component.isApiKeyUnmaskDisabled()).toBe(true);
      expect(await harness.isApiKeyToggleBtnDisabled()).toBe(true);

      component.toggleHideApiKey();
      expect(component.hideApiKey()).toBe(true);
      expect(await harness.getApiKeyInputType()).toBe('password');
    });

    it('disables apiKey form control when isApiKeyProvidedByConfig is true', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockIsApiKeyProvidedByConfig.set(true);

      const {component} = await setupComponent();

      expect(component.settingsForm.controls.apiKey.disabled).toBe(true);
    });

    it('does not invoke setGeminiApiKey when saving settings with config-provided API key', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockIsApiKeyProvidedByConfig.set(true);
      mockGeminiApiKey.set('server-key');

      const {fixture, component, harness} = await setupComponent();
      const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      await harness.setRendererUrlValue('http://new-url.com');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();

      await component.saveSettings();

      expect(mockConfigProvider.setGeminiApiKey).not.toHaveBeenCalled();
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('keeps API key control enabled and permits unmasking when context is locked but isApiKeyProvidedByConfig is false', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockStartupResolution.isContextLocked.mockReturnValue(true);
      mockIsApiKeyProvidedByConfig.set(false);

      const {component, harness} = await setupComponent();

      expect(component.isApiKeyUnmaskDisabled()).toBe(false);
      expect(component.settingsForm.controls.apiKey.enabled).toBe(true);
      expect(await harness.isApiKeyToggleBtnDisabled()).toBe(false);
    });

    it('enables API key toggle button and permits unmasking when key is user-provided and context is unlocked', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockIsApiKeyProvidedByConfig.set(false);
      mockStartupResolution.isContextLocked.mockReturnValue(false);

      const {component, harness} = await setupComponent();

      expect(component.isApiKeyUnmaskDisabled()).toBe(false);
      expect(await harness.isApiKeyToggleBtnDisabled()).toBe(false);

      await harness.clickApiKeyToggleBtn();
      expect(component.hideApiKey()).toBe(false);
      expect(await harness.getApiKeyInputType()).toBe('text');
    });

    it('locks rendererUrl and apiKey form controls when active profile disallows overrides', async () => {
      mockActiveProfile.set({
        displayName: 'Locked Profile',
        rendererUrl: 'http://locked-server.com',
        allowOverrides: false,
      });

      const {component} = await setupComponent();

      expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.disabled).toBe(true);
      expect(component.isLocked()).toBe(true);
    });

    it('invokes selectProfile on settings service when onProfileSelected is triggered', async () => {
      const {component} = await setupComponent();
      const selectSpy = vi.spyOn(component['settingsService'], 'selectProfile').mockResolvedValue();

      component.settingsForm.controls.apiKey.markAsDirty();
      await component.onProfileSelected('dev');

      expect(selectSpy).toHaveBeenCalledWith('dev');
      expect(component.settingsForm.controls.apiKey.pristine).toBe(true);
    });

    it('clears active profile selection when rendererUrl form control value is modified', async () => {
      mockSelectedProfileId.set('dev');
      mockActiveProfile.set({
        displayName: 'Development',
        rendererUrl: 'http://localhost:3000',
        allowOverrides: true,
      });

      const {component, harness} = await setupComponent();
      const selectSpy = vi.spyOn(component['settingsService'], 'selectProfile');

      await harness.setRendererUrlValue('http://custom-renderer-url.com');
      await new Promise(resolve => queueMicrotask(resolve));

      expect(selectSpy).toHaveBeenCalledWith(null);
    });

    it('preserves profile selection when rendererUrl form control value matches active profile URL', async () => {
      mockSelectedProfileId.set('dev');
      mockActiveProfile.set({
        displayName: 'Development',
        rendererUrl: 'http://localhost:3000',
        allowOverrides: true,
      });

      const {component} = await setupComponent();
      const selectSpy = vi.spyOn(component['settingsService'], 'selectProfile');

      component.settingsForm.controls.rendererUrl.setValue('http://localhost:3000');

      expect(selectSpy).not.toHaveBeenCalledWith(null);
    });

    it('resets allowOverrides lock state and enables rendererUrl and apiKey form controls when selecting Custom profile in 3P mode', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockActiveProfile.set({
        displayName: 'Locked Profile',
        rendererUrl: 'http://locked-server.com',
        allowOverrides: false,
      });
      const {fixture, component} = await setupComponent();

      expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.disabled).toBe(true);

      component.settingsForm.controls.apiKey.markAsDirty();
      await component.onProfileSelected(null);
      fixture.detectChanges();

      expect(component.isLocked()).toBe(false);
      expect(component.settingsForm.controls.rendererUrl.enabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.enabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.pristine).toBe(true);
    });

    it('keeps apiKey control disabled in 1P mode when selecting Custom profile', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(false);
      mockActiveProfile.set({
        displayName: 'Locked Profile',
        rendererUrl: 'http://locked-server.com',
        allowOverrides: false,
      });
      const {fixture, component} = await setupComponent();

      expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.disabled).toBe(true);

      component.settingsForm.controls.apiKey.markAsDirty();
      await component.onProfileSelected(null);
      fixture.detectChanges();

      expect(component.isLocked()).toBe(false);
      expect(component.settingsForm.controls.rendererUrl.enabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.disabled).toBe(true);
      expect(component.settingsForm.controls.apiKey.pristine).toBe(true);
    });

    it('clears rendererUrl form control to empty string when switching to Custom profile', async () => {
      mockRendererUrl.set('http://locked-server.com');
      const {fixture, component} = await setupComponent();

      expect(component.settingsForm.controls.rendererUrl.value).toBe('http://locked-server.com');

      await component.onProfileSelected(null);
      fixture.detectChanges();

      expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('');
      expect(component.settingsForm.controls.rendererUrl.value).toBe('');
    });

    it('populates saved personal API key into apiKey form control when switching to Custom profile in 3P mode', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockSecureStorage.getCredential.mockResolvedValue('saved-personal-api-key');
      const {fixture, component} = await setupComponent();

      await component.onProfileSelected(null);
      fixture.detectChanges();

      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
      expect(mockSecureStorage.getCredential).toHaveBeenCalledWith(
        SecureCredentialsKey.GEMINI_API_KEY,
      );
      expect(mockConfigProvider.setGeminiApiKey).toHaveBeenCalledWith('saved-personal-api-key');
      expect(component.settingsForm.controls.apiKey.value).toBe('saved-personal-api-key');
    });

    it('resets apiKey form control to empty string when no personal key was saved in 3P mode', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      mockSecureStorage.getCredential.mockResolvedValue(null);
      mockGeminiApiKey.set('old-config-key');
      const {fixture, component} = await setupComponent();

      await component.onProfileSelected(null);
      fixture.detectChanges();

      expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
      expect(mockConfigProvider.setGeminiApiKey).toHaveBeenCalledWith('');
      expect(component.settingsForm.controls.apiKey.value).toBe('');
    });
  });

  describe('isSaveDisabled()', () => {
    it('disables Save Settings button initially when settings match loaded values', async () => {
      const {component, harness} = await setupComponent();

      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });

    it('enables Save Settings button when profile selection changes', async () => {
      mockProfiles.set({
        'profile-1': {displayName: 'Profile 1', rendererUrl: 'http://p1.com'},
      });
      const {fixture, component, harness} = await setupComponent();

      await component.onProfileSelected('profile-1');
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.isSaveDisabled()).toBe(false);
      expect(await harness.isSaveButtonDisabled()).toBe(false);
    });

    it('enables Save Settings button when forceThirdPartyAuth changes', async () => {
      const {fixture, component, harness} = await setupComponent();
      vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      await harness.toggleForceThirdPartyAuth();
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.isSaveDisabled()).toBe(false);
      expect(await harness.isSaveButtonDisabled()).toBe(false);
    });

    it('enables Save Settings button when renderer URL changes', async () => {
      const {fixture, component, harness} = await setupComponent();

      await harness.setRendererUrlValue('http://updated-renderer-url.com');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.isSaveDisabled()).toBe(false);
      expect(await harness.isSaveButtonDisabled()).toBe(false);
    });

    it('enables Save Settings button when API key changes', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, component, harness} = await setupComponent();

      await harness.setGeminiApiKeyValue('new-api-key-value');
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.isSaveDisabled()).toBe(false);
      expect(await harness.isSaveButtonDisabled()).toBe(false);
    });

    it('disables Save Settings button when form is invalid', async () => {
      const {fixture, component, harness} = await setupComponent();

      await harness.setRendererUrlValue('invalid-url-without-protocol-or-slash');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();

      expect(component.settingsForm.invalid).toBe(true);
      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });

    it('disables Save Settings button after settings are saved', async () => {
      const {fixture, component, harness} = await setupComponent();
      vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      await harness.setRendererUrlValue('http://updated-renderer-url.com');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();
      expect(await harness.isSaveButtonDisabled()).toBe(false);

      await component.saveSettings();
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });

    it('disables Save Settings button when form control value is edited back to initial snapshot value', async () => {
      const {fixture, component, harness} = await setupComponent();

      await harness.setRendererUrlValue('http://updated-renderer-url.com');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();
      expect(await harness.isSaveButtonDisabled()).toBe(false);

      await harness.setRendererUrlValue('http://resolved-url.com');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });

    it('disables Save Settings button after saving values containing leading or trailing whitespace', async () => {
      const {fixture, component, harness} = await setupComponent();
      vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      await harness.setRendererUrlValue('http://updated-renderer-url.com  ');
      await new Promise(resolve => queueMicrotask(resolve));
      fixture.detectChanges();
      expect(await harness.isSaveButtonDisabled()).toBe(false);

      await component.saveSettings();
      fixture.detectChanges();

      expect(component.settingsForm.controls.rendererUrl.value).toBe(
        'http://updated-renderer-url.com',
      );
      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });
  });
});
