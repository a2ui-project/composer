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

import {Component, inject, input, output} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import {SettingsService, ApiKeyOption} from '../settings-service/settings.service';
import {AddApiKeyDialogComponent} from './add-api-key-dialog/add-api-key-dialog';
import {AbstractSelector} from '../abstract-selector/abstract-selector';

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
export class ApiKeySelectorComponent extends AbstractSelector<ApiKeyOption> {
  readonly selectedApiKeyId = input<string | null>(null);
  readonly apiKeySelected = output<string | null>();

  private readonly settingsService = inject(SettingsService);

  constructor() {
    super();
    void this.refreshItems();
  }

  override getSelectedId(): string | null {
    return this.selectedApiKeyId();
  }

  override async refreshItems(): Promise<void> {
    const list = await this.settingsService.getAvailableApiKeys();
    this.items.set(list);
  }

  override emitSelection(id: string | null): void {
    this.apiKeySelected.emit(id);
  }

  override async deleteItem(id: string): Promise<void> {
    await this.settingsService.deleteCustomApiKey(id);
  }

  onAddApiKey(event?: Event): void {
    void this.handleAdd(AddApiKeyDialogComponent, event);
  }

  onEditApiKey(event: Event, key: ApiKeyOption): void {
    void this.handleEdit(AddApiKeyDialogComponent, event, key, 'apiKey');
  }

  onDeleteApiKey(event: Event, id: string): void {
    void this.handleDelete(event, id, null);
  }
}
