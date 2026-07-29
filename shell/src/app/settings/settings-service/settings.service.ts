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

import {Injectable, Signal, computed, inject} from '@angular/core';
import {ProfileConfig, StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {AppConfigProvider} from '../app-config-provider/app-config-provider';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {LocalStorageInteractions} from '../../storage/local-storage-interactions/local-storage-interactions';
import {LocalStorageKey} from '../../storage/models/local-storage-keys';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';

/**
 * Facade service for settings configuration profile selection and persistence.
 * Coordinates profile state signals with startup resolution, local storage,
 * and secure credential storage layers.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly startupResolution = inject(StartupResolution);
  private readonly configProvider = inject(AppConfigProvider);
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage);
  private readonly localStorageInteractions = inject(LocalStorageInteractions);

  readonly profiles: Signal<Record<string, ProfileConfig>> = computed(() =>
    this.startupResolution.profiles(),
  );

  readonly selectedProfileId: Signal<string | null> = computed(() =>
    this.startupResolution.selectedProfileId(),
  );

  readonly activeProfile: Signal<ProfileConfig | null> = computed(() =>
    this.startupResolution.activeProfile(),
  );

  readonly allowOverrides: Signal<boolean> = computed(
    () => this.activeProfile()?.allowOverrides ?? true,
  );

  /**
   * Switches the active configuration profile selection.
   *
   * @param profileId The selected profile ID string, or null to revert to Custom/Default.
   */
  async selectProfile(profileId: string | null): Promise<void> {
    if (profileId) {
      this.localStorageInteractions.setItem(LocalStorageKey.SELECTED_PROFILE, profileId);
    } else {
      this.localStorageInteractions.removeItem(LocalStorageKey.SELECTED_PROFILE);
    }

    this.startupResolution.setSelectedProfileId(profileId);

    const active = this.activeProfile();

    if (active?.rendererUrl) {
      this.configProvider.setRendererUrl(active.rendererUrl);
    } else {
      this.configProvider.setRendererUrl('');
    }

    const apiKey = typeof active?.apiKey === 'string' ? active.apiKey.trim() : '';

    if (apiKey) {
      this.configProvider.setApiKeyFromConfig(apiKey);
    } else {
      this.configProvider.setApiKeyFromConfig('');
      try {
        const personalKey = await this.secureCredentialsStorage.getCredential(
          SecureCredentialsKey.GEMINI_API_KEY,
        );
        const trimmedPersonalKey = personalKey ? personalKey.trim() : '';
        await this.configProvider.setGeminiApiKey(trimmedPersonalKey);
      } catch (err) {
        console.warn('Failed to retrieve credential from SecureCredentialsStorage:', err);
      }
    }
  }
}
