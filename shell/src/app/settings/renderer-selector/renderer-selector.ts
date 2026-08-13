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

import {Component, computed, DestroyRef, inject, input, output, signal} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {SettingsService, RendererOption} from '../settings-service/settings.service';
import {AddRendererDialogComponent} from './add-renderer-dialog/add-renderer-dialog';

/**
 * Component for selecting and managing rendering targets.
 * Displays combined static and custom renderers in a dropdown, and provides
 * controls to add new custom renderers or delete existing custom renderers.
 */
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
export class RendererSelectorComponent {
  readonly selectedRendererId = input<string | null>('default');
  readonly disabled = input<boolean>(false);
  readonly rendererSelected = output<string>();

  private readonly settingsService = inject(SettingsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly renderers = signal<RendererOption[]>([]);

  readonly selectedRenderer = computed(() => {
    const id = this.selectedRendererId();
    if (!id) return undefined;
    return this.renderers().find(r => r.id === id);
  });

  constructor() {
    this.refreshRenderers();
  }

  /**
   * Refreshes the list of available renderers from SettingsService.
   */
  refreshRenderers(): void {
    const list = this.settingsService.getRenderers();
    this.renderers.set(list);
  }

  /**
   * Emits the newly selected renderer ID when the dropdown selection changes.
   */
  onSelectionChange(value: string): void {
    if (value) {
      this.rendererSelected.emit(value);
    }
  }

  /**
   * Opens the dialog to add a new custom renderer and handles the newly saved renderer ID.
   */
  onAddRenderer(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const dialogRef = this.dialog.open(AddRendererDialogComponent, {
      width: '450px',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newId?: string) => {
        if (newId) {
          this.refreshRenderers();
          this.rendererSelected.emit(newId);
        }
      });
  }

  /**
   * Opens the dialog to edit an existing custom renderer.
   */
  onEditRenderer(event: Event, renderer: RendererOption): void {
    event.stopPropagation();
    event.preventDefault();
    if (renderer.readOnly) {
      return;
    }
    const dialogRef = this.dialog.open(AddRendererDialogComponent, {
      width: '450px',
      data: {renderer},
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedId?: string) => {
        if (updatedId) {
          this.refreshRenderers();
          if (this.selectedRendererId() === updatedId) {
            this.rendererSelected.emit(updatedId);
          }
        }
      });
  }

  /**
   * Deletes a custom renderer and resets selection to default if the deleted renderer was active.
   */
  onDeleteRenderer(event: Event, id: string): void {
    event.stopPropagation();
    event.preventDefault();
    const renderer = this.renderers().find(r => r.id === id);
    if (renderer?.readOnly) {
      return;
    }
    this.settingsService.deleteCustomRenderer(id);
    this.refreshRenderers();
    if (this.selectedRendererId() === id) {
      this.rendererSelected.emit('default');
    }
  }
}
