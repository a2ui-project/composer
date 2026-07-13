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

import {Component, inject, signal, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'a2ui-composer-system-instructions-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './system-instructions-dialog.ng.html',
  styleUrl: './system-instructions-dialog.scss',
})
export class SystemInstructionsDialog implements OnDestroy {
  protected readonly data = inject<string | null>(MAT_DIALOG_DATA);
  protected readonly copied = signal(false);
  private readonly snackBar = inject(MatSnackBar);
  private copyTimeoutId?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    if (this.copyTimeoutId) {
      clearTimeout(this.copyTimeoutId);
    }
  }

  protected copyToClipboard(): void {
    if (!this.data) return;

    if (!navigator.clipboard) {
      console.error('Clipboard API is not available in this environment.');
      this.snackBar.open('Clipboard copy is not supported in this environment', undefined, {
        duration: 3000,
      });
      return;
    }

    navigator.clipboard
      .writeText(this.data)
      .then(() => {
        this.copied.set(true);
        this.snackBar.open('System instructions copied', undefined, {
          duration: 2000,
        });
        if (this.copyTimeoutId) {
          clearTimeout(this.copyTimeoutId);
        }
        this.copyTimeoutId = setTimeout(() => {
          this.copied.set(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy system instructions to clipboard: ', err);
      });
  }
}
