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
  HostListener,
  inject,
  OnInit,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
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
import {SettingsService, RendererOption} from '../settings-service/settings.service';
import {RendererSelectorComponent} from '../renderer-selector/renderer-selector';
import {ApiKeySelectorComponent} from '../api-key-selector/api-key-selector';
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
    RendererSelectorComponent,
    ApiKeySelectorComponent,
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
  readonly saveErrorMessage: WritableSignal<string | null> = signal(null);
  readonly isSaving: WritableSignal<boolean> = signal(false);

  private readonly initialRendererId: WritableSignal<string | null> = signal<string | null>(null);
  private readonly initialApiKeyId: WritableSignal<string | null> = signal<string | null>(null);
  private readonly initialForceThirdPartyAuth: WritableSignal<boolean> = signal<boolean>(false);

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

  readonly settingsForm = this.fb.group({});

  private readonly formEvents = toSignal(this.settingsForm.events);

  readonly hasUnsavedChanges: Signal<boolean> = computed(() => {
    this.formEvents();
    const rendererChanged = this.selectedRendererId() !== this.initialRendererId();
    const apiKeyChanged = this.selectedApiKeyId() !== this.initialApiKeyId();
    const authChanged = this.forceThirdPartyAuth() !== this.initialForceThirdPartyAuth();
    return rendererChanged || apiKeyChanged || authChanged;
  });

  readonly isSaveDisabled: Signal<boolean> = computed(() => {
    this.formEvents();
    return this.isSaving() || !this.hasUnsavedChanges();
  });

  constructor() {}

  ngOnInit(): void {
    const currentRendererId = this.settingsService.selectedRendererId() || 'Custom';
    this.selectedRendererId.set(currentRendererId);
    this.initialRendererId.set(currentRendererId);

    const currentApiKeyId = this.settingsService.selectedApiKeyId() || null;
    this.selectedApiKeyId.set(currentApiKeyId);
    this.initialApiKeyId.set(currentApiKeyId);

    const is3P = this.startupResolution.isThirdPartyEnvironment();
    this.isThirdParty.set(is3P);

    this.forceThirdPartyAuth.set(this.configProvider.authType() === AuthType.THIRD_PARTY);
    this.initialForceThirdPartyAuth.set(this.forceThirdPartyAuth());
  }

  onRendererSelected(rendererId: string): void {
    this.selectedRendererId.set(rendererId);
    this.settingsForm.markAsDirty();
  }

  onApiKeySelected(apiKeyId: string | null): void {
    this.selectedApiKeyId.set(apiKeyId);
    this.settingsForm.markAsDirty();
  }

  async onSaveSettings(): Promise<void> {
    if (this.isSaving() || !this.hasUnsavedChanges()) {
      return;
    }

    this.saveErrorMessage.set(null);

    this.isSaving.set(true);
    try {
      const selectedRenderer = this.selectedRendererOption();
      const resolvedUrl =
        selectedRenderer && selectedRenderer.rendererUrl !== undefined
          ? selectedRenderer.rendererUrl
          : this.configProvider.rendererUrl();

      await this.settingsService.commitSettings({
        selectedRendererId:
          this.selectedRendererId() === 'Custom' ? null : this.selectedRendererId(),
        rendererUrl: resolvedUrl,
        selectedApiKeyId: this.selectedApiKeyId(),
      });

      this.initialRendererId.set(this.selectedRendererId());
      this.initialApiKeyId.set(this.selectedApiKeyId());
      this.initialForceThirdPartyAuth.set(this.forceThirdPartyAuth());
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
    const newState = !this.forceThirdPartyAuth();
    this.forceThirdPartyAuth.set(newState);
    this.settingsForm.markAsDirty();
    this.configProvider.setForcedAuthMode(newState ? AuthType.THIRD_PARTY : AuthType.FIRST_PARTY);
    this.reloadWindow();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = true;
    }
  }
}
