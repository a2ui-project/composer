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

import {Component, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Errors} from '../../debug/errors/errors';

/**
 * Side-drawer diagnostic inspector displaying recorded ErrorLogger logs.
 */
@Component({
  selector: 'a2ui-composer-errors-inspector',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, Errors],
  templateUrl: './errors-inspector.ng.html',
  styleUrl: './errors-inspector.scss',
})
export class A2aErrorsInspector {
  /** Emitted when the user closes the error logs inspector drawer. */
  readonly closeDrawer = output<void>();
}
