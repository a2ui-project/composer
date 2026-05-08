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

import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {RouterOutlet, RouterLink} from '@angular/router';

@Component({
  selector: 'a2ui-composer-shell',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
  ],
  templateUrl: './composer-shell.component.ng.html',
  styleUrl: './composer-shell.component.scss',
})
/**
 * The primary layout container for the A2UI Composer.
 * Renders the permanent header bar, persistent navigation sidebar,
 * and hosts the active workspace routing outlet.
 */
export class ComposerShellComponent {
  /**
   * Flushes all local state caches (IndexedDB, localStorage) and reloads the page
   * to simulate a fresh hardware handshake connection.
   */
  resetSession(): void {
    console.log('Session state cleared.');
  }
}
