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

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'a2ui-system-instructions-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>System Instructions</h2>
    <mat-dialog-content>
      <div tabindex="0" class="dialog-content-scrollable" aria-label="System instructions text">
        <pre class="instructions-text">{{ data }}</pre>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      .dialog-content-scrollable {
        margin: 0 16px;
        max-height: 400px;
        overflow-y: auto;
        background-color: var(--mat-sys-surface-container-high);
        padding: 16px;
        border-radius: 4px;
      }
      .dialog-content-scrollable:focus {
        outline: 2px solid var(--mat-sys-primary);
        outline-offset: -2px;
      }
      .instructions-text {
        margin: 0;
        font-family: 'Roboto Mono', Consolas, monospace;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        color: var(--mat-sys-on-surface);
      }
    `,
  ],
})
export class SystemInstructionsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) protected readonly data: string) {}
}
