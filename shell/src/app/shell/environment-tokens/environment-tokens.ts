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

import {InjectionToken, Signal, signal} from '@angular/core';

/**
 * Injection token used to query whether the host container is executing
 * within the sandboxed boundaries of a Chrome Extension sidepanel.
 */
export const IS_EXTENSION_MODE = new InjectionToken<Signal<boolean>>('IS_EXTENSION_MODE', {
  providedIn: 'root',
  factory: () => signal(false),
});
