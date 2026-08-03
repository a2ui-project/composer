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

import {Component, computed, inject, input, output, signal} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {SettingsService, ApiKeyOption} from '../settings-service/settings.service';
import {AddApiKeyDialogComponent} from './add-api-key-dialog/add-api-key-dialog';

/**
 * Component for selecting and managing API key credentials.
 * Displays combined static and custom API keys in a dropdown with masked secrets,
 * and provides controls to add new custom keys or delete existing custom keys.
 */
@Component({
  selector: 'a2ui-composer-api-key-selector',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './api-key-selector.ng.html',
  styleUrl: './api-key-selector.scss',
})
export class ApiKeySelectorComponent {
  readonly selectedApiKeyId = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly apiKeySelected = output<string | null>();

  private readonly settingsService = inject(SettingsService);
  private readonly dialog = inject(MatDialog);

  readonly apiKeys = signal<ApiKeyOption[]>([]);

  readonly selectedApiKey = computed(() => {
    const id = this.selectedApiKeyId();
    if (!id) return undefined;
    return this.apiKeys().find(k => k.id === id);
  });

  constructor() {
    void this.refreshApiKeys();
  }

  /**
   * Refreshes the list of available API keys from SettingsService.
   */
  async refreshApiKeys(): Promise<void> {
    const list = await this.settingsService.getAvailableApiKeys();
    this.apiKeys.set(list);
  }

  /**
   * Emits the newly selected API key ID when the dropdown selection changes.
   */
  onSelectionChange(value: string | null): void {
    if (value !== undefined) {
      this.apiKeySelected.emit(value);
    }
  }

  /**
   * Opens the dialog to add a new custom API key and handles the newly saved key ID.
   */
  onAddApiKey(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const dialogRef = this.dialog.open(AddApiKeyDialogComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(async (newId?: string) => {
      if (newId) {
        await this.refreshApiKeys();
        this.apiKeySelected.emit(newId);
      }
    });
  }

  /**
   * Opens the dialog to edit an existing custom API key.
   */
  onEditApiKey(event: Event, key: ApiKeyOption): void {
    event.stopPropagation();
    event.preventDefault();
    if (key.readOnly) {
      return;
    }
    const dialogRef = this.dialog.open(AddApiKeyDialogComponent, {
      width: '450px',
      data: {apiKey: key},
    });

    dialogRef.afterClosed().subscribe(async (updatedId?: string) => {
      if (updatedId) {
        await this.refreshApiKeys();
        if (this.selectedApiKeyId() === updatedId) {
          this.apiKeySelected.emit(updatedId);
        }
      }
    });
  }

  /**
   * Deletes a custom API key and emits null fallback if the deleted key was active.
   */
  async onDeleteApiKey(event: Event, id: string): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const key = this.apiKeys().find(k => k.id === id);
    if (key?.readOnly) {
      return;
    }
    await this.settingsService.deleteCustomApiKey(id);
    await this.refreshApiKeys();
    if (this.selectedApiKeyId() === id) {
      this.apiKeySelected.emit(null);
    }
  }
}
