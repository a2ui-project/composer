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
import {Validators} from '@angular/forms';
import {SettingsComponent} from './settings.component';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {StartupResolutionService} from '../shell/startup-resolution.service';
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {HostCommunicationService, MessageEnvelope} from '../shell/host-communication.service';
import {CatalogManagementService} from '../storage/catalog-management.service';
import {Catalog} from '../storage/catalog-storage.model';
import {signal, WritableSignal, Signal, computed} from '@angular/core';
import {PreviewBridgeMessageType} from 'a2ui-bridge';
import {AppConfigProvider, AuthType} from './app-config-provider';
import {LocalStorageAppConfigProvider} from './local-storage-config.provider';

describe('SettingsComponent', () => {
  let mockStartupResolutionService: {
    getResolvedRendererUrl: ReturnType<typeof vi.fn>;
    isThirdPartyEnvironment: ReturnType<typeof vi.fn>;
    isContextLocked: ReturnType<typeof vi.fn>;
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
    authType: Signal<AuthType>;
    rendererUrl: Signal<string>;
    geminiApiKey: Signal<string>;
    setRendererUrl: ReturnType<typeof vi.fn>;
    setGeminiApiKey: ReturnType<typeof vi.fn>;
    setForcedAuthMode: ReturnType<typeof vi.fn>;
    flushConfig: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    mockStartupResolutionService = {
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
      return mockStartupResolutionService.isThirdPartyEnvironment()
        ? AuthType.THREE_PARTY
        : AuthType.ONE_PARTY;
    });

    mockConfigProvider = {
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
        mockRendererUrl.set(mockStartupResolutionService.getResolvedRendererUrl() || '');
      }),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  async function setupComponent() {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        provideNoopAnimations(),
        {provide: StartupResolutionService, useValue: mockStartupResolutionService},
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {
          provide: HostCommunicationService,
          useValue: {latestEnvelope: mockLatestEnvelope},
        },
        {
          provide: CatalogManagementService,
          useValue: {
            isHandshakeInProgress: mockIsHandshakeInProgress,
            activeCatalogTitle: mockActiveCatalogTitle,
            activeCatalog: mockActiveCatalog,
            catalogError: mockCatalogError,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SettingsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    return {fixture, component};
  }

  it('initializes form controls cleanly in 1P mode without requiring apiKey', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(false);
    const {component} = await setupComponent();

    expect(component.isThirdParty()).toBe(false);
    expect(component.settingsForm.controls.rendererUrl.value).toBe('http://resolved-url.com');

    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    component.settingsForm.patchValue({rendererUrl: 'http://new-url.com'});
    component.saveSettings();

    expect(mockConfigProvider.flushConfig).toHaveBeenCalled();
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://new-url.com');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('enforces apiKey requirement in 3P mode and rejects empty whitespace keys', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(true);
    const {component} = await setupComponent();

    expect(component.isThirdParty()).toBe(true);
    expect(component.settingsForm.controls.apiKey.errors?.['required']).toBeTruthy();

    component.settingsForm.patchValue({
      rendererUrl: 'http://new-url.com',
      apiKey: '   ',
    });
    expect(component.settingsForm.controls.apiKey.errors?.['pattern']).toBeTruthy();
    expect(component.settingsForm.invalid).toBe(true);
  });

  it('persists valid configurations securely in 3P environments', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(true);
    const {component} = await setupComponent();

    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    component.settingsForm.patchValue({
      rendererUrl: 'http://new-url.com',
      apiKey: 'AIzaSyTestKey',
    });
    expect(component.settingsForm.valid).toBe(true);

    component.saveSettings();

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://new-url.com');
    expect(mockConfigProvider.setGeminiApiKey).toHaveBeenCalledWith('AIzaSyTestKey');
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('disables rendererUrl form control and displays lock warning when context is locked', async () => {
    mockStartupResolutionService.isContextLocked.mockReturnValue(true);
    const {fixture, component} = await setupComponent();

    expect(component.isLocked()).toBe(true);
    expect(component.settingsForm.controls.rendererUrl.disabled).toBe(true);

    const lockedNotice = fixture.nativeElement.querySelector('.locked-notice');
    expect(lockedNotice).toBeTruthy();
    expect(lockedNotice.textContent).toContain('locked by enterprise policy');
  });

  it('displays default connection status badges and overlay logs console when disconnected', async () => {
    const {fixture} = await setupComponent();
    const statusCard = fixture.nativeElement.querySelector('.status-card');
    expect(statusCard).toBeTruthy();

    const badges = statusCard.querySelectorAll('.status-badge');
    expect(badges.length).toBeGreaterThan(0);
    expect(statusCard.textContent).toContain('Bridge: Disconnected');
    expect(statusCard.textContent).toContain('Catalog Handshake: Disconnected');
    expect(statusCard.textContent).toContain('Bridge disconnected');
  });

  it('dynamically updates connection status badges and logs console when HostCommunicationService and CatalogManagementService signals mutate', async () => {
    const {fixture} = await setupComponent();
    const statusCard = fixture.nativeElement.querySelector('.status-card');

    // Initial state: bridge disconnected, catalog disconnected
    expect(statusCard.textContent).toContain('Bridge: Disconnected');
    expect(statusCard.textContent).toContain('Catalog Handshake: Disconnected');
    let bridgeChip = fixture.nativeElement.querySelector('.bridge-badge');
    expect(bridgeChip.classList.contains('mat-accent')).toBe(true);

    // Mutate bridge to connected
    mockLatestEnvelope.set({
      type: PreviewBridgeMessageType.RENDERER_READY,
      origin: 'http://localhost',
      timestamp: 0,
    });
    fixture.detectChanges();
    expect(statusCard.textContent).toContain('Bridge: Connected');
    bridgeChip = fixture.nativeElement.querySelector('.bridge-badge');
    expect(bridgeChip.classList.contains('mat-primary')).toBe(true);

    // Mutate catalog to indexing
    mockIsHandshakeInProgress.set(true);
    fixture.detectChanges();
    expect(statusCard.textContent).toContain('Catalog Handshake: Indexing');
    let catalogChip = fixture.nativeElement.querySelector('.catalog-badge');
    expect(catalogChip.classList.contains('mat-accent')).toBe(true);
    expect(statusCard.textContent).toContain('Catalog handshake in progress');

    // Mutate catalog to connected
    mockIsHandshakeInProgress.set(false);
    mockActiveCatalogTitle.set('My Catalog');
    mockActiveCatalog.set({title: 'My Catalog'});
    fixture.detectChanges();
    expect(statusCard.textContent).toContain('Catalog Handshake: Connected');
    catalogChip = fixture.nativeElement.querySelector('.catalog-badge');
    expect(catalogChip.classList.contains('mat-primary')).toBe(true);
    expect(statusCard.textContent).toContain('Catalog handshake completed successfully');

    // Mutate catalog to error
    mockCatalogError.set('Malformed catalog JSON');
    fixture.detectChanges();
    expect(statusCard.textContent).toContain('Catalog Handshake: Error');
    catalogChip = fixture.nativeElement.querySelector('.catalog-badge');
    expect(catalogChip.classList.contains('mat-warn')).toBe(true);
    expect(statusCard.textContent).toContain('[Catalog Error] Malformed catalog JSON');
  });

  it('verifies static placeholder text on the renderer URL input', async () => {
    const {fixture} = await setupComponent();
    const inputElement = fixture.nativeElement.querySelector(
      'input[formControlName="rendererUrl"]',
    );
    expect(inputElement.getAttribute('placeholder')).toBe('http://localhost:3000');
  });

  it('toggles API key input visibility between password and text via button clicks', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(true);
    const {fixture} = await setupComponent();

    const inputElement = fixture.nativeElement.querySelector('input[formControlName="apiKey"]');
    const toggleButton = fixture.nativeElement.querySelector('button[matSuffix]');

    expect(inputElement.type).toBe('password');

    toggleButton.click();
    fixture.detectChanges();
    expect(inputElement.type).toBe('text');

    toggleButton.click();
    fixture.detectChanges();
    expect(inputElement.type).toBe('password');
  });

  it('renders client-side format validation errors for missing required fields and malformed URL strings upon form submission', async () => {
    mockStartupResolutionService.isThirdPartyEnvironment.mockReturnValue(true);
    const {fixture, component} = await setupComponent();

    component.settingsForm.patchValue({rendererUrl: '', apiKey: ''});
    component.saveSettings();
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(errors.length).toBe(2);
    expect(errors[0].textContent).toContain('Renderer URL is required');
    expect(errors[1].textContent).toContain('Gemini API key is required');

    component.settingsForm.patchValue({rendererUrl: 'invalid-url', apiKey: 'valid-key'});
    component.saveSettings();
    fixture.detectChanges();

    const patternErrors = fixture.nativeElement.querySelectorAll('mat-error');
    expect(patternErrors.length).toBe(1);
    expect(patternErrors[0].textContent).toContain('Must be a valid HTTP or HTTPS URL');
  });

  it('renders third-party context layout when a2ui_composer_force_3p storage override key is present using a real StartupResolutionService', async () => {
    localStorage.setItem('a2ui_composer_force_3p', 'true');
    try {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [SettingsComponent],
        providers: [
          provideNoopAnimations(),
          StartupResolutionService,
          LocalStorageAppConfigProvider,
          {
            provide: AppConfigProvider,
            useExisting: LocalStorageAppConfigProvider,
          },
          {
            provide: HostCommunicationService,
            useValue: {latestEnvelope: mockLatestEnvelope},
          },
          {
            provide: CatalogManagementService,
            useValue: {
              isHandshakeInProgress: mockIsHandshakeInProgress,
              activeCatalogTitle: mockActiveCatalogTitle,
              activeCatalog: mockActiveCatalog,
              catalogError: mockCatalogError,
            },
          },
        ],
      }).compileComponents();

      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isThirdParty()).toBe(true);
      const formSections = fixture.nativeElement.querySelectorAll('.form-section');
      expect(formSections.length).toBe(3);
      expect(formSections[1].textContent).toContain('Gemini API Provisioning');
    } finally {
      localStorage.removeItem('a2ui_composer_force_3p');
    }
  });

  it('updates dynamic forced auth overrides and reloads window when toggling forceThirdPartyAuth', async () => {
    const {fixture, component} = await setupComponent();
    const reloadSpy = vi.spyOn(component, 'reloadWindow').mockImplementation(() => {});

    expect(component.forceThirdPartyAuth()).toBe(false);

    component.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(true);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenCalledWith(AuthType.THREE_PARTY);
    expect(reloadSpy).toHaveBeenCalled();

    component.toggleForceThirdPartyAuth();
    fixture.detectChanges();

    expect(component.forceThirdPartyAuth()).toBe(false);
    expect(mockConfigProvider.setForcedAuthMode).toHaveBeenLastCalledWith(AuthType.ONE_PARTY);
    expect(reloadSpy).toHaveBeenCalledTimes(2);
  });

  it('disables the slide toggle and displays the auth-locked-notice warning badge when isContextLocked returns true', async () => {
    mockStartupResolutionService.isContextLocked.mockReturnValue(true);
    const {fixture, component} = await setupComponent();

    expect(component.isLocked()).toBe(true);

    const lockedNotice = fixture.nativeElement.querySelector('.auth-locked-notice');
    expect(lockedNotice).toBeTruthy();
    expect(lockedNotice.textContent).toContain(
      'Authentication mode overrides are locked by enterprise policy',
    );

    const slideToggleInput = fixture.nativeElement.querySelector('mat-slide-toggle button');
    if (slideToggleInput) {
      expect(slideToggleInput.disabled).toBe(true);
    }
  });
});
