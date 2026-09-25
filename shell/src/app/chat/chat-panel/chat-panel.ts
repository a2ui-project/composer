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
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {AutoScroll, ChatPanelBase} from './chat-panel-base';

/**
 * Displays the interactive Gemini chat dialogue drawer within the Composer
 * shell. Visualizes conversational bubble histories list, loading Overlay
 * milestone Spinners, and handles prompt dispatches with lockout editing
 * controls. Has no third-party chat UI dependencies.
 */
@Component({
  selector: 'a2ui-composer-chat-panel',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    RouterLink,
    AutoScroll,
  ],
  templateUrl: './chat-panel.ng.html',
  styleUrl: './chat-panel.scss',
})
export class ChatPanel extends ChatPanelBase {}
