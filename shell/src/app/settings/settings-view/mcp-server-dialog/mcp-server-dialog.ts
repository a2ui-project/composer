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
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {McpServerConfig} from '../../../mcp/mcp-client-manager.service';
import {urlValidator} from '../../renderer-selector/add-renderer-dialog/add-renderer-dialog';

/**
 * Data passed to McpServerDialogComponent when editing an existing server.
 */
export interface McpServerDialogData {
  server?: McpServerConfig;
}

/**
 * Result returned when McpServerDialogComponent is confirmed.
 */
export interface McpServerDialogResult {
  url: string;
}

/**
 * Dialog component for adding or editing an HTTP MCP server configuration.
 */
@Component({
  selector: 'a2ui-composer-mcp-server-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './mcp-server-dialog.ng.html',
  styleUrl: './mcp-server-dialog.scss',
})
export class McpServerDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<McpServerDialogComponent, McpServerDialogResult>,
  );
  readonly data = inject<McpServerDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    url: [this.data?.server?.url ?? '', [Validators.required, urlValidator]],
  });

  /**
   * Closes the dialog with the trimmed URL.
   */
  onConfirm(): void {
    this.errorMessage.set(null);
    const url = this.form.controls.url.value.trim();

    this.dialogRef.close({url});
  }
}
