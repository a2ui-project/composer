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

import {InjectionToken} from '@angular/core';
import {A2aBackendMode} from '../../settings/app-config-provider/app-config-provider';
import {A2aTransport} from './a2a-types';

/**
 * Backend option representation for selecting A2A transports.
 */
export interface A2aBackendOption {
  id: string;
  label: string;
  description?: string;
}

/**
 * Primary InjectionToken for injecting the active A2aTransport service.
 */
export const A2A_TRANSPORT = new InjectionToken<A2aTransport>('A2A_TRANSPORT');

/**
 * InjectionToken for providing backend transport choices.
 */
export const A2A_BACKEND_OPTIONS = new InjectionToken<A2aBackendOption[]>('A2A_BACKEND_OPTIONS', {
  providedIn: 'root',
  factory: () => [
    {
      id: A2aBackendMode.HTTP_JSONRPC,
      label: 'Standard A2A (HTTP / JSON-RPC 2.0)',
      description:
        'Standard open-source A2A protocol over HTTP and Server-Sent Events (SSE) streaming',
    },
  ],
});
