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
import {SettingsService, RendererOption} from '../settings-service/settings.service';
import {AddRendererDialogComponent} from './add-renderer-dialog/add-renderer-dialog';
import {AbstractSelector} from '../abstract-selector/abstract-selector';

@Component({
  selector: 'a2ui-composer-renderer-selector',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './renderer-selector.ng.html',
  styleUrl: './renderer-selector.scss',
})
export class RendererSelectorComponent extends AbstractSelector<RendererOption> {
  readonly selectedRendererId = input<string | null>('default');
  readonly rendererSelected = output<string>();

  private readonly settingsService = inject(SettingsService);

  constructor() {
    super();
    this.refreshItems();
  }

  override getSelectedId(): string | null {
    return this.selectedRendererId();
  }

  override refreshItems(): void {
    const list = this.settingsService.getRenderers();
    this.items.set(list);
  }

  override emitSelection(id: string | null): void {
    if (id) {
      this.rendererSelected.emit(id);
    }
  }

  override deleteItem(id: string): void {
    this.settingsService.deleteCustomRenderer(id);
  }

  onAddRenderer(event?: Event): void {
    void this.handleAdd(AddRendererDialogComponent, event);
  }

  onEditRenderer(event: Event, renderer: RendererOption): void {
    void this.handleEdit(AddRendererDialogComponent, event, renderer, 'renderer');
  }

  onDeleteRenderer(event: Event, id: string): void {
    void this.handleDelete(event, id, 'default');
  }
}
