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

import {Component, inject} from '@angular/core';
import {SurfaceComponent} from '@a2ui/angular/v0_9';
import {A2uiSandboxConnection} from 'a2ui-bridge/angular';

/**
 * The component for the sandboxed renderer client application.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SurfaceComponent],
  templateUrl: './app.component.ng.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  /**
   * Leverage the library-provided provider factory to bind cross-frame window
   * telemetries reactively.
   */
  protected sandbox = inject(A2uiSandboxConnection);
}
