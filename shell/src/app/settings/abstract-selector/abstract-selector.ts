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

import {ComponentType} from '@angular/cdk/portal';
import {DestroyRef, Directive, computed, inject, input, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';

/**
 * Option selected in an AbstractSelector.
 */
export interface SelectorOption {
  id: string;
  readOnly?: boolean;
}

/**
 * Base class for selectors that manage a list of options.
 */

@Directive()
export abstract class AbstractSelector<T extends SelectorOption> {
  readonly disabled = input<boolean>(false);
  protected readonly dialog = inject(MatDialog);
  protected readonly destroyRef = inject(DestroyRef);
  readonly items = signal<T[]>([]);

  readonly selectedItem = computed(() => {
    const id = this.getSelectedId();
    if (!id) return undefined;
    return this.items().find(i => i.id === id);
  });

  abstract getSelectedId(): string | null;
  abstract refreshItems(): void | Promise<void>;
  protected abstract emitSelection(id: string | null): void;
  protected abstract deleteItem(id: string): void | Promise<void>;

  onSelectionChange(value: string | null): void {
    if (value !== undefined && value !== null) {
      this.emitSelection(value);
    }
  }

  protected async handleAdd(component: ComponentType<unknown>, event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();
    const dialogRef = this.dialog.open(component, {
      width: '450px',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (newId?: string) => {
        if (newId) {
          await this.refreshItems();
          this.emitSelection(newId);
        }
      });
  }

  protected async handleEdit(
    component: ComponentType<unknown>,
    event: Event,
    item: T,
    dataKey: string,
  ): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    if (item.readOnly) {
      return;
    }
    const dialogRef = this.dialog.open(component, {
      width: '450px',
      data: {[dataKey]: item},
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (updatedId?: string) => {
        if (updatedId) {
          await this.refreshItems();
          if (this.getSelectedId() === updatedId) {
            this.emitSelection(updatedId);
          }
        }
      });
  }

  protected async handleDelete(
    event: Event,
    id: string,
    fallbackId: string | null = null,
  ): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const item = this.items().find(i => i.id === id);
    if (item?.readOnly) {
      return;
    }
    await this.deleteItem(id);
    await this.refreshItems();
    if (this.getSelectedId() === id) {
      this.emitSelection(fallbackId);
    }
  }
}
