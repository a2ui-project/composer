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

import {Component, computed, inject, OnInit, signal, Signal, WritableSignal} from '@angular/core';
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

  readonly isLocked: WritableSignal<boolean> = signal(false);
  readonly isThirdParty: WritableSignal<boolean> = signal(false);
  readonly hideApiKey: WritableSignal<boolean> = signal(true);
  readonly forceThirdPartyAuth: WritableSignal<boolean> = signal(false);

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

  readonly settingsForm = this.fb.group({
    rendererUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    apiKey: [''],
  });

  ngOnInit(): void {
    const locked = this.startupResolution.isContextLocked();
    this.isLocked.set(locked);

    const is3P = this.startupResolution.isThirdPartyEnvironment();
    this.isThirdParty.set(is3P);

    this.forceThirdPartyAuth.set(this.configProvider.authType() === AuthType.THREE_PARTY);

    const initialUrl = this.configProvider.rendererUrl();
    const initialApiKey = this.configProvider.geminiApiKey();

    this.settingsForm.patchValue({
      rendererUrl: initialUrl,
      apiKey: initialApiKey,
    });

    if (locked) {
      this.settingsForm.controls.rendererUrl.disable();
    }

    if (is3P) {
      const apiKeyControl = this.settingsForm.controls.apiKey;
      apiKeyControl.setValidators([Validators.pattern(/\S/)]);
      apiKeyControl.updateValueAndValidity();
    }
  }

  async saveSettings(): Promise<void> {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

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
    this.configProvider.setForcedAuthMode(newState ? AuthType.THREE_PARTY : AuthType.ONE_PARTY);
    this.reloadWindow();
  }
}
