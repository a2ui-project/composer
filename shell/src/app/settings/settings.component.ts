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

import {Component, OnInit, inject, signal, computed, WritableSignal, Signal} from '@angular/core';
import {ReactiveFormsModule, NonNullableFormBuilder, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {StartupResolutionService} from '../shell/startup-resolution.service';
import {DOCUMENT} from '@angular/common';
import {HostCommunicationService} from '../shell/host-communication.service';
import {CatalogManagementService} from '../storage/catalog-management.service';

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
  ],
  templateUrl: './settings.component.ng.html',
  styleUrl: './settings.component.scss',
})
/**
 * Renders the user settings view, allowing configuration of target URL endpoints,
 * connection handshakes, and developer toggle overrides.
 */
export class SettingsComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly startupResolutionService = inject(StartupResolutionService);
  private readonly document = inject(DOCUMENT);
  private readonly hostCommunicationService = inject(HostCommunicationService);
  private readonly catalogManagementService = inject(CatalogManagementService);

  public readonly isLocked: WritableSignal<boolean> = signal(false);
  public readonly isThirdParty: WritableSignal<boolean> = signal(false);
  public readonly hideApiKey: WritableSignal<boolean> = signal(true);

  public readonly bridgeConnected: Signal<boolean> = computed(
    () => this.hostCommunicationService.latestEnvelope() !== null,
  );
  public readonly catalogStatus: Signal<string> = computed(() => {
    if (this.catalogManagementService.catalogError()) return 'Error';
    if (this.catalogManagementService.isHandshakeInProgress()) return 'Indexing';
    if (this.catalogManagementService.activeCatalog()) return 'Connected';
    return 'Disconnected';
  });

  public readonly catalogErrorMessage: Signal<string | null> = computed(() =>
    this.catalogManagementService.catalogError(),
  );

  public readonly settingsForm = this.fb.group({
    rendererUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    apiKey: [''],
  });

  public ngOnInit(): void {
    const locked = this.startupResolutionService.isContextLocked();
    this.isLocked.set(locked);

    const is3P = this.startupResolutionService.isThirdPartyEnvironment();
    this.isThirdParty.set(is3P);

    const initialUrl =
      this.startupResolutionService.getResolvedRendererUrl() ||
      this.getStorageItem('a2ui_composer_renderer_url') ||
      '';
    const initialApiKey = this.getStorageItem('a2ui_composer_api_key') || '';

    this.settingsForm.patchValue({
      rendererUrl: initialUrl,
      apiKey: initialApiKey,
    });

    if (locked) {
      this.settingsForm.controls.rendererUrl.disable();
    }

    if (is3P) {
      const apiKeyControl = this.settingsForm.controls.apiKey;
      apiKeyControl.setValidators([Validators.required, Validators.pattern(/\S/)]);
      apiKeyControl.updateValueAndValidity();
    }
  }

  public saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const values = this.settingsForm.getRawValue();

    if (!this.isLocked()) {
      this.setStorageItem('a2ui_composer_renderer_url', values.rendererUrl.trim());
    }

    if (this.isThirdParty()) {
      this.setStorageItem('a2ui_composer_api_key', values.apiKey.trim());
    } else {
      this.removeStorageItem('a2ui_composer_api_key');
    }

    this.reloadWindow();
  }

  public reloadWindow(): void {
    if (this.document.defaultView?.location) {
      this.document.defaultView.location.assign('/');
    }
  }

  private getStorageItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  private setStorageItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private removeStorageItem(key: string): void {
    localStorage.removeItem(key);
  }
}
