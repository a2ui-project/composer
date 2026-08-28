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

import {Component, HostListener, inject, input, OnInit, output} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {A11yModule} from '@angular/cdk/a11y';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {A2A_BACKEND_OPTIONS, A2aBackendOption} from '../../chat/a2a/a2a-transport.token';
import {A2aBackendMode} from '../../settings/app-config-provider/app-config-provider';
import {A2A_PROTOCOL_ICON_URL} from '../converters/a2a-ui-converter';
import {isValidHttpUrl} from '../../utils/url';

export interface AgentConfigSaveEvent {
  endpoint: string;
  tenantId: string;
  backendMode: A2aBackendMode;
}

export function httpUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = (control.value || '').trim();
    if (!val) return null;
    return isValidHttpUrl(val) ? null : {invalidHttpUrl: true};
  };
}

/**
 * Configuration dialog/modal for connecting to A2A agent endpoints and selecting transport options.
 */
@Component({
  selector: 'a2ui-composer-agent-config-panel',
  imports: [
    ReactiveFormsModule,
    A11yModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './agent-config-panel.ng.html',
  styleUrl: './agent-config-panel.scss',
})
export class AgentConfigPanel implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly backendOptions: A2aBackendOption[] =
    inject(A2A_BACKEND_OPTIONS, {
      optional: true,
    }) || [];
  protected readonly a2aProtocolIconUrl = A2A_PROTOCOL_ICON_URL;

  /** Initial A2A agent endpoint URL to populate in the form. */
  readonly initialEndpoint = input<string | null>(null);
  /** Initial multi-tenant ID or namespace to populate in the form. */
  readonly initialTenantId = input<string | null>(null);
  /** Initial transport backend mode (e.g. HTTP JSON-RPC or REST). */
  readonly initialBackendMode = input<A2aBackendMode | null>(null);
  /** Whether a connection attempt is currently in progress. */
  readonly isConnecting = input<boolean>(false);
  /** Error message from a failed connection attempt, if any. */
  readonly connectionError = input<string | null>(null);
  /** Whether the user can cancel and close the panel without connecting. */
  readonly canCancel = input<boolean>(true);

  /** Emitted when the user submits valid configuration to connect. */
  readonly saveAndConnect = output<AgentConfigSaveEvent>();
  /** Emitted when the user dismisses the configuration panel without saving. */
  readonly dismissPanel = output<void>();
  /** Emitted when the user clears the configured agent endpoint and settings. */
  readonly clearConfig = output<void>();

  protected form!: FormGroup;

  @HostListener('keydown.escape')
  protected handleEscape(): void {
    if (this.canCancel() && !this.isConnecting()) {
      this.dismissPanel.emit();
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      endpoint: [this.initialEndpoint() || '', [Validators.required, httpUrlValidator()]],
      tenantId: [this.initialTenantId() || ''],
      backendMode: [
        this.initialBackendMode() ||
          (this.backendOptions.length > 0
            ? this.backendOptions[0].id
            : A2aBackendMode.HTTP_JSONRPC),
      ],
    });
  }

  protected saveAndConnectAgent(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    this.saveAndConnect.emit({
      endpoint: (val.endpoint || '').trim(),
      tenantId: (val.tenantId || '').trim(),
      backendMode: val.backendMode as A2aBackendMode,
    });
  }

  protected clearConfiguration(): void {
    this.form.reset({
      endpoint: '',
      tenantId: '',
      backendMode:
        this.backendOptions.length > 0 ? this.backendOptions[0].id : A2aBackendMode.HTTP_JSONRPC,
    });
    this.clearConfig.emit();
  }
}
