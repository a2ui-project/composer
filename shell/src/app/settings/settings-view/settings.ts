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
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {StartupResolution} from '../../shell/startup-resolution/startup-resolution';
import {HostCommunication} from '../../shell/host-communication/host-communication';
import {CatalogManagement} from '../../storage/catalog-management/catalog-management';
import {AppConfigProvider, AuthType} from '../app-config-provider/app-config-provider';
import {IS_1P_AUTH_ENABLED} from '../../shell/environment-tokens/environment-tokens';
import {SettingsService, RendererOption} from '../settings-service/settings.service';
import {RendererSelectorComponent} from '../renderer-selector/renderer-selector';
import {ApiKeySelectorComponent} from '../api-key-selector/api-key-selector';

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
    RendererSelectorComponent,
    ApiKeySelectorComponent,
  ],
  templateUrl: './settings.ng.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly startupResolution = inject(StartupResolution);
  private readonly hostCommunication = inject(HostCommunication);
  private readonly catalogManagement = inject(CatalogManagement);
  private readonly configProvider = inject(AppConfigProvider);
  protected readonly settingsService = inject(SettingsService);

  protected readonly is1PAuthEnabled = inject(IS_1P_AUTH_ENABLED);

  readonly selectedRendererId: WritableSignal<string | null> = signal<string | null>(null);
  readonly selectedApiKeyId: WritableSignal<string | null> = signal<string | null>(null);

  readonly selectedRendererOption: Signal<RendererOption | undefined> = computed(() => {
    const id = this.selectedRendererId();
    if (!id || id === 'Custom') return undefined;
    return this.settingsService.getRenderers().find(r => r.id === id);
  });

  readonly isThirdParty: WritableSignal<boolean> = signal(false);
  readonly isApiKeyProvidedByConfig: Signal<boolean> = computed(() =>
    this.configProvider.isApiKeyProvidedByConfig(),
  );
  readonly isApiKeyUnmaskDisabled: Signal<boolean> = computed(() =>
    this.isApiKeyProvidedByConfig(),
  );
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

  readonly activeRendererUrl: Signal<string | null> = computed(() =>
    this.startupResolution.resolvedUrl(),
  );

  readonly settingsForm = this.fb.group({});

  constructor() {}

  ngOnInit(): void {
    const currentRendererId = this.settingsService.selectedRendererId() || 'Custom';
    this.selectedRendererId.set(currentRendererId);

    const currentApiKeyId = this.settingsService.selectedApiKeyId() || null;
    this.selectedApiKeyId.set(currentApiKeyId);

    const is3P = this.startupResolution.isThirdPartyEnvironment();
    this.isThirdParty.set(is3P);

    this.forceThirdPartyAuth.set(this.configProvider.authType() === AuthType.THIRD_PARTY);
  }

  async onRendererSelected(rendererId: string): Promise<void> {
    const targetId = rendererId === 'Custom' ? null : rendererId;
    const previousId = this.selectedRendererId();
    this.selectedRendererId.set(rendererId);
    const success = await this.settingsService.selectRenderer(targetId);
    if (!success) {
      this.selectedRendererId.set(previousId);
    }
  }

  async onApiKeySelected(apiKeyId: string | null): Promise<void> {
    this.selectedApiKeyId.set(apiKeyId);
    await this.settingsService.selectApiKey(apiKeyId);
  }

  toggleHideApiKey(): void {
    if (this.isApiKeyUnmaskDisabled()) {
      return;
    }
    this.hideApiKey.set(!this.hideApiKey());
  }

  toggleForceThirdPartyAuth(): void {
    const newState = !this.forceThirdPartyAuth();
    this.forceThirdPartyAuth.set(newState);
    this.configProvider.setForcedAuthMode(newState ? AuthType.THIRD_PARTY : AuthType.FIRST_PARTY);
    this.isThirdParty.set(this.startupResolution.isThirdPartyEnvironment());
  }
}
