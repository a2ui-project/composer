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
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {SettingsService, RendererOption} from '../../settings-service/settings.service';

/**
 * Interface for data injected into AddRendererDialogComponent.
 */
export interface AddRendererDialogData {
  renderer?: RendererOption;
}

/**
 * Validator function that ensures the control value is a valid HTTP or HTTPS URL with a host.
 */
export function urlValidator(control: AbstractControl<string>): ValidationErrors | null {
  const val = control.value;
  if (!val) {
    return null;
  }
  try {
    const parsed = new URL(val.trim());
    return ['http:', 'https:'].includes(parsed.protocol) && parsed.host ? null : {invalidUrl: true};
  } catch {
    return {invalidUrl: true};
  }
}

/**
 * Dialog component for configuring and saving a new or existing custom renderer endpoint.
 */
@Component({
  selector: 'a2ui-composer-add-renderer-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-renderer-dialog.ng.html',
  styleUrl: './add-renderer-dialog.scss',
})
export class AddRendererDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly dialogRef = inject(MatDialogRef<AddRendererDialogComponent>);
  readonly data = inject<AddRendererDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name: [this.data?.renderer?.name ?? '', [Validators.required, Validators.pattern(/\S/)]],
    rendererUrl: [this.data?.renderer?.rendererUrl ?? '', [Validators.required, urlValidator]],
  });

  /**
   * Validates and persists the custom renderer to LocalStorage via SettingsService.
   */
  onConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const name = this.form.controls.name.value.trim();
    const rendererUrl = this.form.controls.rendererUrl.value.trim();
    const id = this.data?.renderer?.id || `custom-${Date.now()}`;

    try {
      this.settingsService.saveCustomRenderer({
        id,
        name,
        rendererUrl,
      });
      this.dialogRef.close(id);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to save custom renderer.');
    }
  }
}
