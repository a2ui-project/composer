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

import {Component, inject, signal} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {SettingsService, ApiKeyOption} from '../../settings-service/settings.service';

/**
 * Interface for data injected into AddApiKeyDialogComponent.
 */
export interface AddApiKeyDialogData {
  apiKey?: ApiKeyOption;
}

/**
 * Dialog component for configuring and saving a new or existing custom API key credential.
 */
@Component({
  selector: 'a2ui-composer-add-api-key-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-api-key-dialog.ng.html',
  styleUrl: './add-api-key-dialog.scss',
})
export class AddApiKeyDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly dialogRef = inject(MatDialogRef<AddApiKeyDialogComponent>);
  readonly data = inject<AddApiKeyDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  readonly errorMessage = signal<string | null>(null);
  readonly hideApiKey = signal<boolean>(true);

  readonly form = this.fb.group({
    name: [this.data?.apiKey?.name ?? '', [Validators.required, Validators.pattern(/\S/)]],
    apiKey: [this.data?.apiKey?.key ?? '', [Validators.required, Validators.pattern(/\S/)]],
  });

  /**
   * Toggles whether the API key input is masked as password or plain text.
   */
  toggleHideApiKey(): void {
    this.hideApiKey.update(val => !val);
  }

  /**
   * Validates and persists the custom API key to SecureCredentialsStorage via SettingsService.
   */
  async onConfirm(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const name = this.form.controls.name.value.trim();
    const apiKey = this.form.controls.apiKey.value.trim();
    const id = this.data?.apiKey?.id || `custom-${Date.now()}`;

    try {
      await this.settingsService.saveCustomApiKey(id, name, apiKey);
      this.dialogRef.close(id);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to save custom API key.');
    }
  }
}
