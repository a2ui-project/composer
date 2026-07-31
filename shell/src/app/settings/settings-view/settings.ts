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

import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {ProfileConfig, StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {DOCUMENT, PlatformLocation} from '@angular/common';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {AppConfigProvider, AuthType} from '../app-config-provider/app-config-provider';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {ProfileSelector} from '../profile-selector/profile-selector';
import {SettingsService} from '../settings-service/settings.service';
import {SecureCredentialsStorage} from '../../storage/secure-credentials-storage/secure-credentials-storage';
import {SecureCredentialsKey} from '../../storage/models/secure-credentials-keys';
import {locationAssign} from 'safevalues/dom';

/**
 * Renders the user settings view, allowing configuration of target URL endpoints,
 * connection handshakes, and developer toggle overrides.
 */
@Component({
  selector: 'a2ui-composer-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSlideToggleModule,
    ProfileSelector,
  ],
  templateUrl: './settings.ng.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly startupResolution = inject(StartupResolution);
  private readonly document = inject(DOCUMENT);
  private readonly platformLocation = inject(PlatformLocation);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  protected readonly settingsService = inject(SettingsService);
  private readonly secureCredentialsStorage = inject(SecureCredentialsStorage);

  protected readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);

  readonly isLocked: WritableSignal<boolean> = signal(false);
  readonly isThirdParty: WritableSignal<boolean> = signal(false);
  readonly isApiKeyProvidedByConfig: Signal<boolean> = computed(() =>
    this.configProvider.isApiKeyProvidedByConfig(),
  );
  readonly isApiKeyUnmaskDisabled: Signal<boolean> = computed(() =>
    this.isApiKeyProvidedByConfig(),
  );
  readonly hideApiKey: WritableSignal<boolean> = signal(true);
  readonly forceThirdPartyAuth: WritableSignal<boolean> = signal(false);
  readonly saveErrorMessage: WritableSignal<string | null> = signal(null);
  readonly isSaving: WritableSignal<boolean> = signal(false);

  /**
   * The currently selected profile ID in the draft form.
   * Profile selection remains local to the draft form until `saveSettings()` is invoked.
   */
  protected readonly draftSelectedProfileId: WritableSignal<string | null> = signal<string | null>(
    null,
  );
  /**
   * The resolved profile object corresponding to the draft selection.
   * Profile selection remains local to the draft form until `saveSettings()` is invoked.
   */
  private readonly draftProfile: Signal<ProfileConfig | null> = computed<ProfileConfig | null>(
    () => {
      const id = this.draftSelectedProfileId();
      return id ? (this.settingsService.profiles()[id] ?? null) : null;
    },
  );
  private readonly draftAllowOverrides: Signal<boolean> = computed<boolean>(() => {
    const profile = this.draftProfile();
    return profile ? (profile.allowOverrides ?? true) : true;
  });

  private readonly initialProfileId: WritableSignal<string | null> = signal<string | null>(null);
  private readonly initialForceThirdPartyAuth: WritableSignal<boolean> = signal<boolean>(false);
  private readonly initialRendererUrl: WritableSignal<string> = signal<string>('');
  private readonly initialApiKey: WritableSignal<string> = signal<string>('');

  readonly bridgeConnected: Signal<boolean> = computed(
    () => this.hostCommunication.latestEnvelope() !== null,
  );
  readonly catalogStatus: Signal<string> = computed(() => {
    if (this.catalogManagement.catalogError()) return 'Error';
    if (this.catalogManagement.isHandshakeInProgress()) return 'Indexing';
    if (this.catalogManagement.activeCatalog()) return 'Connected';
    return 'Disconnected';
  });

  readonly catalogErrorMessage: Signal<string | null> = computed(() =>
    this.catalogManagement.catalogError(),
  );

  // Matches either absolute HTTP/HTTPS URLs (starting with http:// or https://)
  // or relative paths starting with '/'.
  // Note that the `\/(?!/)` means Match a forward slash (\/), but only if it is
  // not immediately followed by another forward slash ((?!/))".
  readonly settingsForm = this.fb.group({
    rendererUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/|\/(?!\/)).+/i)]],
    apiKey: [''],
  });

  private readonly formEvents = toSignal(this.settingsForm.events);

  readonly hasUnsavedChanges: Signal<boolean> = computed(() => {
    this.formEvents();
    const profileChanged = this.draftSelectedProfileId() !== this.initialProfileId();
    const authChanged = this.forceThirdPartyAuth() !== this.initialForceThirdPartyAuth();
    const urlChanged = this.settingsForm.controls.rendererUrl.value !== this.initialRendererUrl();
    const apiKeyChanged = this.settingsForm.controls.apiKey.value !== this.initialApiKey();
    return profileChanged || authChanged || urlChanged || apiKeyChanged;
  });

  readonly isSaveDisabled: Signal<boolean> = computed(() => {
    this.formEvents();
    return this.isSaving() || this.settingsForm.invalid || !this.hasUnsavedChanges();
  });

  constructor() {
    effect(() => {
      const currentKey = this.configProvider.geminiApiKey();
      const apiKeyControl = this.settingsForm.controls.apiKey;
      if (!apiKeyControl.dirty && apiKeyControl.value !== currentKey) {
        apiKeyControl.setValue(currentKey, {emitEvent: false});
      }
    });

    effect(() => {
      const url = this.configProvider.rendererUrl();
      const rendererControl = this.settingsForm.controls.rendererUrl;
      if (!rendererControl.dirty && url !== rendererControl.value) {
        rendererControl.setValue(url, {emitEvent: false});
      }
    });

    this.settingsForm.controls.rendererUrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.settingsForm.controls.rendererUrl.dirty) {
        const selectedId = this.draftSelectedProfileId();
        if (selectedId !== null) {
          const currentVal = this.settingsForm.controls.rendererUrl.value;
          const activeUrl = this.draftProfile()?.rendererUrl;
          if (currentVal !== activeUrl) {
            this.draftSelectedProfileId.set(null);
          }
        }
      }
    });

    effect(() => {
      const allowOverrides = this.draftAllowOverrides();
      const startupLocked = this.startupResolution.isContextLocked();
      const isUrlLocked = !allowOverrides || startupLocked;
      this.isLocked.set(isUrlLocked);

      const rendererControl = this.settingsForm.controls.rendererUrl;
      if (isUrlLocked) {
        rendererControl.disable({emitEvent: false});
      } else {
        rendererControl.enable({emitEvent: false});
      }

      this.configureApiKeyControl(this.isThirdParty());
    });
  }

  ngOnInit(): void {
    this.draftSelectedProfileId.set(this.settingsService.selectedProfileId());
    const allowOverrides = this.draftAllowOverrides();
    const locked = !allowOverrides || this.startupResolution.isContextLocked();
    this.isLocked.set(locked);

    const is3P = this.startupResolution.isThirdPartyEnvironment();
    this.isThirdParty.set(is3P);

    this.forceThirdPartyAuth.set(this.configProvider.authType() === AuthType.THIRD_PARTY);

    if (locked) {
      this.settingsForm.controls.rendererUrl.disable();
    }
    this.configureApiKeyControl(is3P);

    const url = this.configProvider.rendererUrl();
    if (
      !this.settingsForm.controls.rendererUrl.dirty &&
      url !== this.settingsForm.controls.rendererUrl.value
    ) {
      this.settingsForm.controls.rendererUrl.setValue(url, {emitEvent: false});
    }

    const key = this.configProvider.geminiApiKey();
    if (
      !this.settingsForm.controls.apiKey.dirty &&
      key !== this.settingsForm.controls.apiKey.value
    ) {
      this.settingsForm.controls.apiKey.setValue(key, {emitEvent: false});
    }

    this.initialProfileId.set(this.settingsService.selectedProfileId());
    this.initialForceThirdPartyAuth.set(this.forceThirdPartyAuth());
    this.initialRendererUrl.set(this.configProvider.rendererUrl());
    this.initialApiKey.set(this.configProvider.geminiApiKey());
  }

  async onProfileSelected(profileId: string | null): Promise<void> {
    this.draftSelectedProfileId.set(profileId);
    if (profileId === null) {
      this.settingsForm.controls.rendererUrl.setValue('', {emitEvent: false});
      this.settingsForm.controls.rendererUrl.markAsPristine();
      if (this.isThirdParty()) {
        await this.populatePersonalApiKey();
      }
    } else {
      const active = this.settingsService.profiles()[profileId] ?? null;
      if (active?.rendererUrl !== undefined) {
        this.settingsForm.controls.rendererUrl.setValue(active.rendererUrl, {emitEvent: false});
        this.settingsForm.controls.rendererUrl.markAsPristine();
      }
      const apiKey = typeof active?.apiKey === 'string' ? active.apiKey.trim() : '';
      if (apiKey) {
        this.settingsForm.controls.apiKey.setValue(apiKey, {emitEvent: false});
      } else if (this.isThirdParty()) {
        await this.populatePersonalApiKey();
      }
    }
    this.settingsForm.controls.apiKey.markAsPristine();
  }

  private async populatePersonalApiKey(): Promise<void> {
    try {
      const personalKey = await this.secureCredentialsStorage.getCredential(
        SecureCredentialsKey.GEMINI_API_KEY,
      );
      const trimmedPersonalKey = personalKey ? personalKey.trim() : '';
      this.settingsForm.controls.apiKey.setValue(trimmedPersonalKey, {emitEvent: false});
    } catch (err) {
      console.warn('Failed to retrieve credential from SecureCredentialsStorage:', err);
      this.settingsForm.controls.apiKey.setValue('', {emitEvent: false});
    }
  }

  private configureApiKeyControl(is3P: boolean): void {
    const apiKeyControl = this.settingsForm.controls.apiKey;
    const allowOverrides = this.draftAllowOverrides();

    if (!allowOverrides) {
      apiKeyControl.clearValidators();
      if (apiKeyControl.enabled) {
        apiKeyControl.disable({emitEvent: false});
      }
      apiKeyControl.updateValueAndValidity({emitEvent: false});
      return;
    }

    if (is3P && !this.isApiKeyProvidedByConfig()) {
      apiKeyControl.setValidators([Validators.pattern(/\S/)]);
      if (apiKeyControl.disabled) {
        apiKeyControl.enable({emitEvent: false});
      }
    } else {
      apiKeyControl.clearValidators();
      if (apiKeyControl.enabled) {
        apiKeyControl.disable({emitEvent: false});
      }
    }
    apiKeyControl.updateValueAndValidity({emitEvent: false});
  }

  async saveSettings(): Promise<void> {
    if (this.isSaving() || !this.hasUnsavedChanges()) {
      return;
    }

    this.saveErrorMessage.set(null);

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.saveErrorMessage.set('Please resolve validation errors before saving settings.');
      return;
    }

    this.isSaving.set(true);
    try {
      if (this.draftSelectedProfileId() !== this.initialProfileId()) {
        await this.settingsService.selectProfile(this.draftSelectedProfileId());
      }
      const values = this.settingsForm.getRawValue();
      const trimmedUrl = values.rendererUrl.trim();
      const trimmedApiKey = values.apiKey.trim();

      if (this.isThirdParty()) {
        if (!this.isLocked()) {
          this.configProvider.setRendererUrl(trimmedUrl);
        }
        if (!this.isApiKeyProvidedByConfig()) {
          await this.configProvider.setGeminiApiKey(trimmedApiKey);
        }
      } else {
        await this.configProvider.purgeGeminiApiKey();
        if (!this.isLocked()) {
          this.configProvider.setRendererUrl(trimmedUrl);
        }
      }
      this.settingsForm.controls.rendererUrl.setValue(trimmedUrl, {emitEvent: false});
      this.settingsForm.controls.apiKey.setValue(trimmedApiKey, {emitEvent: false});
      this.initialProfileId.set(this.settingsService.selectedProfileId());
      this.draftSelectedProfileId.set(this.settingsService.selectedProfileId());
      this.initialForceThirdPartyAuth.set(this.forceThirdPartyAuth());
      this.initialRendererUrl.set(this.configProvider.rendererUrl());
      this.initialApiKey.set(this.configProvider.geminiApiKey());
      this.settingsForm.markAsPristine();

      this.reloadWindow();
    } catch (err) {
      console.error('Failed to save settings:', err);
      this.saveErrorMessage.set(
        err instanceof Error ? err.message : 'An unexpected error occurred while saving settings.',
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Reloads the target application window context by navigating to the dynamic
   * base href configured in the DOM, or falling back to the root path.
   */
  reloadWindow(): void {
    if (this.document.defaultView?.location) {
      const basePath = this.platformLocation.getBaseHrefFromDOM() || '/';
      locationAssign(this.document.defaultView.location, basePath);
    }
  }

  toggleHideApiKey(): void {
    if (this.isApiKeyUnmaskDisabled()) {
      return;
    }
    this.hideApiKey.set(!this.hideApiKey());
  }

  toggleForceThirdPartyAuth(): void {
    if (this.isLocked()) {
      return;
    }
    const newState = !this.forceThirdPartyAuth();
    this.forceThirdPartyAuth.set(newState);
    this.configProvider.setForcedAuthMode(newState ? AuthType.THIRD_PARTY : AuthType.FIRST_PARTY);
    this.reloadWindow();
  }
}
