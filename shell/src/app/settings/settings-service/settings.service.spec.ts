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
import {signal, WritableSignal} from '@angular/core';
import {SettingsService} from './settings.service';
import {StartupResolution, ProfileConfig} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../app-config-provider/app-config-provider';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {describe, it, expect, beforeEach, vi} from 'vitest';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockStartupResolution: {
    profiles: WritableSignal<Record<string, ProfileConfig>>;
    selectedProfileId: WritableSignal<string | null>;
    activeProfile: WritableSignal<ProfileConfig | null>;
    setSelectedProfileId: ReturnType<typeof vi.fn>;
  };
  let mockConfigProvider: {
    setRendererUrl: ReturnType<typeof vi.fn>;
    setApiKeyFromConfig: ReturnType<typeof vi.fn>;
    setGeminiApiKey: ReturnType<typeof vi.fn>;
  };
  let mockSecureStorage: {
    getCredential: ReturnType<typeof vi.fn>;
  };
  let mockLocalStorage: LocalStorageInteractions;

  const sampleProfiles: Record<string, ProfileConfig> = {
    dev: {
      displayName: 'Development',
      rendererUrl: 'http://localhost:3000',
      apiKey: '  dev-api-key  ',
      allowOverrides: true,
    },
    locked: {
      displayName: 'Locked Profile',
      rendererUrl: 'http://locked-server.com',
      allowOverrides: false,
    },
  };

  beforeEach(() => {
    localStorage.clear();

    mockStartupResolution = {
      profiles: signal(sampleProfiles),
      selectedProfileId: signal(null),
      activeProfile: signal(null),
      setSelectedProfileId: vi.fn((id: string | null) => {
        mockStartupResolution.selectedProfileId.set(id);
        mockStartupResolution.activeProfile.set(id ? sampleProfiles[id] || null : null);
      }),
    };

    mockConfigProvider = {
      setRendererUrl: vi.fn(),
      setApiKeyFromConfig: vi.fn(),
      setGeminiApiKey: vi.fn().mockResolvedValue(undefined),
    };

    mockSecureStorage = {
      getCredential: vi.fn().mockResolvedValue('personal-indexeddb-key'),
    };

    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        LocalStorageInteractions,
        {provide: StartupResolution, useValue: mockStartupResolution},
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: SecureCredentialsStorage, useValue: mockSecureStorage},
      ],
    });

    service = TestBed.inject(SettingsService);
    mockLocalStorage = TestBed.inject(LocalStorageInteractions);
  });

  it('creates the settings service instance', () => {
    expect(service).toBeTruthy();
  });

  it('exposes signals delegating to startup resolution', () => {
    expect(service.profiles()).toEqual(sampleProfiles);
    expect(service.selectedProfileId()).toBeNull();
    expect(service.activeProfile()).toBeNull();
  });

  it('computes allowOverrides as true when active profile is null or allowOverrides is omitted', () => {
    expect(service.allowOverrides()).toBe(true);

    mockStartupResolution.activeProfile.set({
      rendererUrl: 'http://example.com',
    });
    expect(service.allowOverrides()).toBe(true);
  });

  it('computes allowOverrides as false when active profile disallows overrides', () => {
    mockStartupResolution.activeProfile.set({
      allowOverrides: false,
    });
    expect(service.allowOverrides()).toBe(false);
  });

  it('persists selected profile ID to local storage and updates startup resolution when selecting profile', async () => {
    await service.selectProfile('dev');

    expect(mockLocalStorage.getItem(LocalStorageKey.SELECTED_PROFILE)).toBe('dev');
    expect(mockStartupResolution.setSelectedProfileId).toHaveBeenCalledWith('dev');
  });

  it('removes selected profile ID from local storage when selected profile ID is null', async () => {
    mockLocalStorage.setItem(LocalStorageKey.SELECTED_PROFILE, 'dev');

    await service.selectProfile(null);

    expect(mockLocalStorage.getItem(LocalStorageKey.SELECTED_PROFILE)).toBeNull();
    expect(mockStartupResolution.setSelectedProfileId).toHaveBeenCalledWith(null);
  });

  it('applies rendererUrl and trimmed config apiKey when selected profile contains both', async () => {
    await service.selectProfile('dev');

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://localhost:3000');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('dev-api-key');
  });

  it('resets config key state and loads personal key from secure storage when selected profile lacks apiKey', async () => {
    await service.selectProfile('locked');

    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(mockSecureStorage.getCredential).toHaveBeenCalledWith(
      SecureCredentialsKey.GEMINI_API_KEY,
    );
    expect(mockConfigProvider.setGeminiApiKey).toHaveBeenCalledWith('personal-indexeddb-key');
  });

  it('clears rendererUrl and loads stored API key when profile is null', async () => {
    await service.selectProfile(null);

    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(mockSecureStorage.getCredential).toHaveBeenCalledWith(
      SecureCredentialsKey.GEMINI_API_KEY,
    );
    expect(mockConfigProvider.setGeminiApiKey).toHaveBeenCalledWith('personal-indexeddb-key');
  });

  it('clears rendererUrl to "" when selecting null profile', async () => {
    await service.selectProfile('dev');
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('http://localhost:3000');

    await service.selectProfile(null);
    expect(mockConfigProvider.setRendererUrl).toHaveBeenCalledWith('');
  });

  it('resets allowOverrides to true when selecting null after a locked profile', async () => {
    mockStartupResolution.activeProfile.set(sampleProfiles['locked']);
    expect(service.allowOverrides()).toBe(false);

    await service.selectProfile(null);

    expect(service.allowOverrides()).toBe(true);
  });

  it('trims apiKey and handles whitespace-only or non-string apiKey when selecting profile', async () => {
    const customProfiles: Record<string, ProfileConfig> = {
      whitespaceKey: {
        apiKey: '   padded-key   ',
      },
      blankKey: {
        apiKey: '   ',
      },
      nonStringKey: {
        apiKey: 12345 as unknown as string,
      },
    };
    mockStartupResolution.profiles.set(customProfiles);
    mockStartupResolution.setSelectedProfileId.mockImplementation((id: string | null) => {
      mockStartupResolution.selectedProfileId.set(id);
      mockStartupResolution.activeProfile.set(id ? customProfiles[id] || null : null);
    });

    await service.selectProfile('whitespaceKey');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('padded-key');

    await service.selectProfile('blankKey');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(mockSecureStorage.getCredential).toHaveBeenCalledWith(
      SecureCredentialsKey.GEMINI_API_KEY,
    );

    mockConfigProvider.setApiKeyFromConfig.mockClear();
    mockSecureStorage.getCredential.mockClear();

    await service.selectProfile('nonStringKey');
    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(mockSecureStorage.getCredential).toHaveBeenCalledWith(
      SecureCredentialsKey.GEMINI_API_KEY,
    );
  });

  it('handles error gracefully when secureCredentialsStorage throws in selectProfile', async () => {
    mockSecureStorage.getCredential.mockRejectedValue(new Error('Secure storage error'));
    const warnSpy = vi.spyOn(console, 'warn');

    await service.selectProfile('locked');

    expect(mockConfigProvider.setApiKeyFromConfig).toHaveBeenCalledWith('');
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to retrieve credential from SecureCredentialsStorage:',
      expect.any(Error),
    );
  });

  it('restores selectedProfileId signal from saved local storage profile key upon startup resolution', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        StartupResolution,
        LocalStorageInteractions,
        {provide: AppConfigProvider, useValue: mockConfigProvider},
        {provide: SecureCredentialsStorage, useValue: mockSecureStorage},
        {provide: IS_1P_AUTH_ENABLED, useValue: true},
      ],
    });

    const localService = TestBed.inject(SettingsService);
    const startupRes = TestBed.inject(StartupResolution);
    const localStorageInteractions = TestBed.inject(LocalStorageInteractions);

    localStorageInteractions.setItem(LocalStorageKey.SELECTED_PROFILE, 'dev');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          profiles: {
            dev: {
              rendererUrl: 'http://dev-server:3000',
            },
          },
        }),
      ),
    );

    await startupRes.resolveStartupConfiguration();

    expect(localService.selectedProfileId()).toBe('dev');
  });
});
