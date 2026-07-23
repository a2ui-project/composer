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
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {DOCUMENT, PlatformLocation} from '@angular/common';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {AppConfigProvider, AuthType} from '../app-config-provider/app-config-provider';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
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

  protected readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);

  readonly isLocked: WritableSignal<boolean> = signal(false);
  readonly isThirdParty: WritableSignal<boolean> = signal(false);
  readonly hideApiKey: WritableSignal<boolean> = signal(true);
  readonly forceThirdPartyAuth: WritableSignal<boolean> = signal(false);
  readonly saveErrorMessage: WritableSignal<string | null> = signal(null);
  readonly isSaving: WritableSignal<boolean> = signal(false);

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

  constructor() {
    effect(() => {
      const is3P = this.isThirdParty();
      const apiKeyControl = this.settingsForm.controls.apiKey;

      if (is3P) {
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
    });

    effect(() => {
      const currentKey = this.configProvider.geminiApiKey();
      const apiKeyControl = this.settingsForm.controls.apiKey;
      if (!apiKeyControl.dirty && apiKeyControl.value !== currentKey) {
        apiKeyControl.setValue(currentKey, {emitEvent: false});
      }
    });
  }

  ngOnInit(): void {
    const locked = this.startupResolution.isContextLocked();
    this.isLocked.set(locked);

    const is3P = this.startupResolution.isThirdPartyEnvironment();
    this.isThirdParty.set(is3P);

    this.forceThirdPartyAuth.set(this.configProvider.authType() === AuthType.THIRD_PARTY);

    const initialUrl = this.configProvider.rendererUrl();

    this.settingsForm.patchValue({
      rendererUrl: initialUrl,
    });

    if (locked) {
      this.settingsForm.controls.rendererUrl.disable();
    }
  }

  async saveSettings(): Promise<void> {
    this.saveErrorMessage.set(null);

    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.saveErrorMessage.set('Please resolve validation errors before saving settings.');
      return;
    }

    this.isSaving.set(true);
    try {
      const values = this.settingsForm.getRawValue();

      if (this.isThirdParty()) {
        if (!this.isLocked()) {
          this.configProvider.setRendererUrl(values.rendererUrl.trim());
        }
        await this.configProvider.setGeminiApiKey(values.apiKey.trim());
      } else {
        await this.configProvider.purgeGeminiApiKey();
        if (!this.isLocked()) {
          this.configProvider.setRendererUrl(values.rendererUrl.trim());
        }
      }

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
