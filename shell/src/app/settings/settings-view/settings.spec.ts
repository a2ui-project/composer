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
import {
  StartupConfigStateService,
  RendererConfig,
  ApiKeyConfig,
} from '../../shell/startup-resolution/state/startup-config-state.service';
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
import {
  AppConfigProvider,
  AuthType,
  EnvMode,
  ThemePreference,
} from '../app-config-provider/app-config-provider';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {SettingsHarness} from './test/settings.harness';
import {CONFIG_URL, IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {UsageTrackingService} from '../../usage-tracking/usage-tracking.service';
import {NoopUsageTrackingService} from '../../usage-tracking/noop-usage-tracking.service';
import {
  SecureCredentialsStorage,
  CustomApiKey,
} from '../../storage/secure-credentials-storage/secure-credentials-storage';
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
  let mockResolvedUrl: WritableSignal<string | null>;
  let mockRenderers: WritableSignal<Record<string, RendererConfig>>;
  let mockSelectedRendererId: WritableSignal<string | null>;
  let mockApiKeys: WritableSignal<Record<string, ApiKeyConfig>>;
  let mockActiveRenderer: WritableSignal<RendererConfig | null>;
  let mockStartupResolution: {
    getResolvedRendererUrl: Mock<() => string | null>;
    isThirdPartyEnvironment: Mock<() => boolean>;
    setSelectedRendererId: Mock<(id: string | null) => void>;
  };
  let mockStartupConfigStateService: {
    resolvedUrl: Signal<string | null>;
    renderers: Signal<Record<string, RendererConfig>>;
    selectedRendererId: Signal<string | null>;
    activeRenderer: Signal<RendererConfig | null>;
    apiKeys: Signal<Record<string, ApiKeyConfig>>;
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
    getCustomApiKeys: Mock<() => Promise<CustomApiKey[]>>;
    getCustomApiKey: Mock<(id: string) => Promise<CustomApiKey | null>>;
    saveCustomApiKey: Mock<(id: string, name: string, key: string) => Promise<void>>;
    deleteCustomApiKey: Mock<(id: string) => Promise<void>>;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    mockSecureStorage = {
      getCredential: vi.fn().mockResolvedValue(null),
      getCustomApiKeys: vi.fn().mockResolvedValue([]),
      getCustomApiKey: vi.fn().mockResolvedValue(null),
      saveCustomApiKey: vi.fn().mockResolvedValue(undefined),
      deleteCustomApiKey: vi.fn().mockResolvedValue(undefined),
    };
    mockPlatformLocation = {
      getBaseHrefFromDOM: vi.fn().mockReturnValue('/composer/pr/44/'),
    };
    mockResolvedUrl = signal<string | null>('http://resolved-url.com');
    mockRenderers = signal<Record<string, RendererConfig>>({});
    mockSelectedRendererId = signal<string | null>(null);
    mockApiKeys = signal<Record<string, string>>({});
    mockActiveRenderer = signal<Record<string, RendererConfig>[string] | null>(null);

    mockStartupResolution = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://resolved-url.com'),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      setSelectedRendererId: vi.fn((id: string | null) => {
        mockSelectedRendererId.set(id);
        mockActiveRenderer.set(id ? mockRenderers()[id] || null : null);
      }),
    };
    mockStartupConfigStateService = {
      resolvedUrl: mockResolvedUrl.asReadonly(),
      renderers: mockRenderers.asReadonly(),
      selectedRendererId: mockSelectedRendererId.asReadonly(),
      activeRenderer: mockActiveRenderer.asReadonly(),
      apiKeys: mockApiKeys.asReadonly(),
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
      setRuntimeApiKey: vi.fn().mockImplementation((key: string) => {
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
        {provide: StartupConfigStateService, useValue: mockStartupConfigStateService},
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
        {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
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
    const {component} = await setupComponent();

    expect(component.isThirdParty()).toBe(false);

    const selectSpy = vi.spyOn(component.settingsService, 'selectRenderer').mockResolvedValue(true);
    await component.onRendererSelected('dev');

    expect(selectSpy).toHaveBeenCalledWith('dev');
  });

  it('persists valid configurations securely in 3P environments', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {component} = await setupComponent();

    const selectRendererSpy = vi
      .spyOn(component.settingsService, 'selectRenderer')
      .mockResolvedValue(true);
    const selectApiKeySpy = vi.spyOn(component.settingsService, 'selectApiKey').mockResolvedValue();

    await component.onRendererSelected('dev');
    await component.onApiKeySelected('custom-1');

    expect(selectRendererSpy).toHaveBeenCalledWith('dev');
    expect(selectApiKeySpy).toHaveBeenCalledWith('custom-1');
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
    mockIsHandshakeInProgress.set(false);
    mockCatalogError.set('Malformed catalog JSON');
    fixture.detectChanges();
    expect(await harness.getCatalogBadgeText()).toContain('Catalog Handshake: Error');
    expect(await harness.getLogsConsoleText()).toContain('[Catalog Error] Malformed catalog JSON');
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
    override setRuntimeApiKey = vi.fn();
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
          {provide: UsageTrackingService, useClass: NoopUsageTrackingService},
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

  it('updates dynamic forced auth overrides when toggling forceThirdPartyAuth', async () => {
    const {fixture, component, harness} = await setupComponent();

    expect(component.forceThirdPartyAuth()).toBe(false);

    await harness.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(true);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.THIRD_PARTY);

    await harness.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(false);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenLastCalledWith(AuthType.FIRST_PARTY);
  });

  it('applies aria-hidden attribute to purely decorative MatIcon elements across settings', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {harness} = await setupComponent();

    const hiddenAttrs = await harness.getIconsAriaHidden();
    expect(hiddenAttrs.length).toBeGreaterThan(0);
    hiddenAttrs.forEach(attr => {
      expect(attr).toBe('true');
    });
  });

  it('hides authentication overrides section when IS_1P_AUTH_ENABLED is false', async () => {
    const {harness} = await setupComponent(false);
    expect(await harness.isFirstPartyAuthSectionHidden()).toBe(true);
  });

  describe('Settings View Integration', () => {
    it('renders <a2ui-composer-renderer-selector> and <a2ui-composer-api-key-selector> in place of <a2ui-composer-profile-selector>', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {harness} = await setupComponent();

      expect(await harness.getRendererSelectorHarness()).not.toBeNull();
      expect(await harness.getApiKeySelectorHarness()).not.toBeNull();
      expect(await harness.hasProfileSelector()).toBe(false);
    });

    it('sets selectedRendererId when a renderer is selected in <a2ui-composer-renderer-selector>', async () => {
      const {fixture, component} = await setupComponent();
      const selectSpy = vi
        .spyOn(component.settingsService, 'selectRenderer')
        .mockResolvedValue(true);

      await component.onRendererSelected('dev');
      fixture.detectChanges();

      expect(component.selectedRendererId()).toBe('dev');
      expect(selectSpy).toHaveBeenCalledWith('dev');
    });
  });

  describe('toggleHideApiKey', () => {
    it('toggles hideApiKey signal state when isApiKeyUnmaskDisabled is false', async () => {
      mockIsApiKeyProvidedByConfig.set(false);
      const {component} = await setupComponent();

      expect(component.hideApiKey()).toBe(true);

      component.toggleHideApiKey();
      expect(component.hideApiKey()).toBe(false);

      component.toggleHideApiKey();
      expect(component.hideApiKey()).toBe(true);
    });

    it('does not toggle hideApiKey signal state when isApiKeyUnmaskDisabled is true', async () => {
      mockIsApiKeyProvidedByConfig.set(true);
      const {component} = await setupComponent();

      expect(component.isApiKeyUnmaskDisabled()).toBe(true);
      expect(component.hideApiKey()).toBe(true);

      component.toggleHideApiKey();
      expect(component.hideApiKey()).toBe(true);
    });
  });

  describe('toggleForceThirdPartyAuth', () => {
    it('toggles forceThirdPartyAuth from false to true and calls setForcedAuthMode(AuthType.THIRD_PARTY)', async () => {
      const {component} = await setupComponent();

      component.forceThirdPartyAuth.set(false);
      component.toggleForceThirdPartyAuth();

      expect(component.forceThirdPartyAuth()).toBe(true);
      expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.THIRD_PARTY);
    });

    it('toggles forceThirdPartyAuth from true to false and calls setForcedAuthMode(AuthType.FIRST_PARTY)', async () => {
      const {component} = await setupComponent();

      component.forceThirdPartyAuth.set(true);
      component.toggleForceThirdPartyAuth();

      expect(component.forceThirdPartyAuth()).toBe(false);
      expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.FIRST_PARTY);
    });
  });

  describe('onRendererSelected', () => {
    it('updates selectedRendererId signal and invokes SettingsService.selectRenderer', async () => {
      const {component} = await setupComponent();
      const selectSpy = vi
        .spyOn(component.settingsService, 'selectRenderer')
        .mockResolvedValue(true);

      await component.onRendererSelected('custom-renderer');

      expect(component.selectedRendererId()).toBe('custom-renderer');
      expect(selectSpy).toHaveBeenCalledWith('custom-renderer');
    });

    it('reverts selectedRendererId signal if SettingsService.selectRenderer returns false', async () => {
      const {component} = await setupComponent();
      component.selectedRendererId.set('initial-renderer');
      vi.spyOn(component.settingsService, 'selectRenderer').mockResolvedValue(false);

      await component.onRendererSelected('disallowed-renderer');

      expect(component.selectedRendererId()).toBe('initial-renderer');
    });
  });

  describe('onApiKeySelected', () => {
    it('updates selectedApiKeyId signal and invokes SettingsService.selectApiKey when API key ID is provided', async () => {
      const {component} = await setupComponent();
      const selectSpy = vi.spyOn(component.settingsService, 'selectApiKey');

      await component.onApiKeySelected('api-key-1');

      expect(component.selectedApiKeyId()).toBe('api-key-1');
      expect(selectSpy).toHaveBeenCalledWith('api-key-1');
    });

    it('updates selectedApiKeyId signal to null and invokes SettingsService.selectApiKey when null is provided', async () => {
      const {component} = await setupComponent();
      await component.onApiKeySelected('api-key-1');
      const selectSpy = vi.spyOn(component.settingsService, 'selectApiKey');

      await component.onApiKeySelected(null);

      expect(component.selectedApiKeyId()).toBeNull();
      expect(selectSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('ngOnInit and computed signals initialization', () => {
    it('initializes selectedRendererId from SettingsService when present', async () => {
      mockSelectedRendererId.set('preset-1');
      const {component} = await setupComponent();

      expect(component.selectedRendererId()).toBe('preset-1');
    });

    it('returns undefined for selectedRendererOption when selectedRendererId is null or Custom', async () => {
      const {component} = await setupComponent();

      component.selectedRendererId.set(null);
      expect(component.selectedRendererOption()).toBeUndefined();

      component.selectedRendererId.set('Custom');
      expect(component.selectedRendererOption()).toBeUndefined();
    });
  });

  describe('activeRendererUrl and diagnostic logs reactivity', () => {
    it('computes activeRendererUrl from StartupResolution resolvedUrl', async () => {
      const {component} = await setupComponent();
      expect(component.activeRendererUrl()).toBe('http://resolved-url.com');
    });

    it('renders system log message when activeRendererUrl is updated', async () => {
      const {harness} = await setupComponent();
      expect(await harness.getLogsConsoleText()).toContain(
        '[System] Active renderer updated to http://resolved-url.com',
      );
    });
  });
});
