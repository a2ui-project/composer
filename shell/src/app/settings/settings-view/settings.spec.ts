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
import {StartupResolution, RendererConfig} from '../../shell/startup-resolution/startup-resolution';
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
  let mockRenderers: WritableSignal<Record<string, RendererConfig>>;
  let mockSelectedRendererId: WritableSignal<string | null>;
  let mockApiKeys: WritableSignal<Record<string, string>>;
  let mockActiveRenderer: WritableSignal<RendererConfig | null>;
  let mockStartupResolution: {
    getResolvedRendererUrl: Mock<() => string | null>;
    isThirdPartyEnvironment: Mock<() => boolean>;
    renderers: Signal<Record<string, RendererConfig>>;
    selectedRendererId: Signal<string | null>;
    activeRenderer: Signal<RendererConfig | null>;
    apiKeys: Signal<Record<string, string>>;
    setSelectedRendererId: Mock<(id: string | null) => void>;
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
    mockRenderers = signal<Record<string, RendererConfig>>({});
    mockSelectedRendererId = signal<string | null>(null);
    mockApiKeys = signal<Record<string, string>>({});
    mockActiveRenderer = signal<RendererConfig | null>(null);

    mockStartupResolution = {
      getResolvedRendererUrl: vi.fn().mockReturnValue('http://resolved-url.com'),
      isThirdPartyEnvironment: vi.fn().mockReturnValue(false),
      renderers: mockRenderers.asReadonly(),
      selectedRendererId: mockSelectedRendererId.asReadonly(),
      activeRenderer: mockActiveRenderer.asReadonly(),
      apiKeys: mockApiKeys.asReadonly(),
      setSelectedRendererId: vi.fn((id: string | null) => {
        mockSelectedRendererId.set(id);
        mockActiveRenderer.set(id ? mockRenderers()[id] || null : null);
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
    const {component} = await setupComponent();

    expect(component.isThirdParty()).toBe(false);

    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    component.onRendererSelected('dev');
    await component.onSaveSettings();

    expect(mockConfigProvider.purgeGeminiApiKey).toHaveBeenCalled();
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://resolved-url.com');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('persists valid configurations securely in 3P environments', async () => {
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {component} = await setupComponent();

    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});
    const commitSpy = vi.spyOn(component.settingsService, 'commitSettings').mockResolvedValue();

    component.onRendererSelected('dev');
    component.onApiKeySelected('custom-1');

    expect(component.settingsForm.valid).toBe(true);

    await component.onSaveSettings();

    expect(commitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedRendererId: 'dev',
        selectedApiKeyId: 'custom-1',
      }),
    );
    expect(reloadSpy).toHaveBeenCalled();
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
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.THIRD_PARTY);
    expect(reloadSpy).toHaveBeenCalled();

    await harness.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(false);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenLastCalledWith(AuthType.FIRST_PARTY);
    expect(reloadSpy).toHaveBeenCalledTimes(2);
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
    mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
    const {fixture, component, harness} = await setupComponent();
    component.saveErrorMessage.set('Test error banner');
    fixture.detectChanges();

    const hiddenAttrs = await harness.getIconsAriaHidden();
    expect(hiddenAttrs.length).toBeGreaterThan(0);
    hiddenAttrs.forEach(attr => {
      expect(attr).toBe('true');
    });
  });

  it('hides authentication overrides section when IS_1P_AUTH_ENABLED is false', async () => {
    const {fixture} = await setupComponent(false);
    const section = fixture.nativeElement.querySelector('.first-party-auth-section');
    expect(section.hidden).toBe(true);
  });

  describe('Anti-Silent Failure UI Alert & Error Reporting (onSaveSettings)', () => {
    it('sets saveErrorMessage when storage persistence rejects during onSaveSettings()', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, component, harness} = await setupComponent();

      mockConfigProvider.setRuntimeApiKey.mockImplementationOnce(() => {
        throw new Error('Simulated Storage Rejection');
      });

      component.onRendererSelected('dev');
      component.onApiKeySelected('valid-key');
      await component.onSaveSettings();
      fixture.detectChanges();

      expect(component.saveErrorMessage()).toBe('Simulated Storage Rejection');
      expect(await harness.hasSaveErrorBanner()).toBe(true);
      expect(await harness.getSaveErrorBannerText()).toContain('Simulated Storage Rejection');
    });
  });

  describe('Transactional Settings View Integration & UI Cleanup', () => {
    it('renders <a2ui-composer-renderer-selector> and <a2ui-composer-api-key-selector> in place of <a2ui-composer-profile-selector>', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, harness} = await setupComponent();

      expect(await harness.getRendererSelectorHarness()).not.toBeNull();
      expect(await harness.getApiKeySelectorHarness()).not.toBeNull();
      expect(fixture.nativeElement.querySelector('a2ui-composer-profile-selector')).toBeNull();
    });

    it('sets selectedRendererId and marks form dirty when a renderer is selected in <a2ui-composer-renderer-selector>', async () => {
      const {fixture, component} = await setupComponent();

      component.onRendererSelected('dev');
      fixture.detectChanges();

      expect(component.selectedRendererId()).toBe('dev');
      expect(component.settingsForm.dirty).toBe(true);
    });

    it('never writes to LocalStorage/IndexedDB active runtime state immediately and never reloads the window prematurely when modifying selections', async () => {
      const {fixture, component} = await setupComponent();
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const commitSpy = vi.spyOn(component.settingsService, 'commitSettings');
      const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      component.onRendererSelected('dev');
      component.onApiKeySelected('custom-1');
      fixture.detectChanges();

      expect(setItemSpy).not.toHaveBeenCalled();
      expect(commitSpy).not.toHaveBeenCalled();
      expect(reloadSpy).not.toHaveBeenCalled();
    });

    it('invokes SettingsService.commitSettings(...), marks form pristine, and calls reloadWindow() only when user clicks "Save Settings"', async () => {
      const {fixture, component} = await setupComponent();
      const commitSpy = vi.spyOn(component.settingsService, 'commitSettings').mockResolvedValue();
      const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      component.onRendererSelected('dev');
      component.onApiKeySelected('custom-1');
      fixture.detectChanges();

      await component.onSaveSettings();

      expect(commitSpy).toHaveBeenCalledWith({
        selectedRendererId: 'dev',
        rendererUrl: 'http://resolved-url.com',
        selectedApiKeyId: 'custom-1',
      });
      expect(component.settingsForm.pristine).toBe(true);
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isSaveDisabled()', () => {
    it('disables Save Settings button initially when settings match loaded values', async () => {
      const {component, harness} = await setupComponent();

      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });

    it('enables Save Settings button when renderer selection changes', async () => {
      const {fixture, component, harness} = await setupComponent();
      vi.spyOn(component.settingsService, 'getRenderers').mockReturnValue([
        {
          id: 'dev',
          name: 'Development',
          rendererUrl: 'http://dev.com',
          readOnly: true,
        },
      ]);

      component.onRendererSelected('dev');
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

    it('enables Save Settings button when API key changes', async () => {
      mockStartupResolution.isThirdPartyEnvironment.mockReturnValue(true);
      const {fixture, component, harness} = await setupComponent();

      component.onApiKeySelected('custom-1');
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.isSaveDisabled()).toBe(false);
      expect(await harness.isSaveButtonDisabled()).toBe(false);
    });

    it('disables Save Settings button after settings are saved', async () => {
      const {fixture, component, harness} = await setupComponent();
      vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

      component.onRendererSelected('dev');
      fixture.detectChanges();
      expect(await harness.isSaveButtonDisabled()).toBe(false);

      await component.onSaveSettings();
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });

    it('disables Save Settings button when renderer selection is changed back to initial snapshot value', async () => {
      const {fixture, component, harness} = await setupComponent();

      component.onRendererSelected('dev');
      fixture.detectChanges();
      expect(await harness.isSaveButtonDisabled()).toBe(false);

      component.onRendererSelected('Custom');
      fixture.detectChanges();

      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isSaveDisabled()).toBe(true);
      expect(await harness.isSaveButtonDisabled()).toBe(true);
    });
  });

  describe('window:beforeunload navigation guard', () => {
    it('calls event.preventDefault() and sets event.returnValue when hasUnsavedChanges() signal is true', async () => {
      const {fixture, component} = await setupComponent();

      component.onRendererSelected('dev');
      fixture.detectChanges();
      expect(component.hasUnsavedChanges()).toBe(true);

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(['', true]).toContain(event.returnValue);
    });

    it('does not prevent unload when hasUnsavedChanges() signal is false', async () => {
      const {component} = await setupComponent();

      expect(component.hasUnsavedChanges()).toBe(false);

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('does not prevent unload when settingsForm.dirty is true but hasUnsavedChanges() is false', async () => {
      const {component} = await setupComponent();

      component.settingsForm.markAsDirty();
      expect(component.settingsForm.dirty).toBe(true);
      expect(component.hasUnsavedChanges()).toBe(false);

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
